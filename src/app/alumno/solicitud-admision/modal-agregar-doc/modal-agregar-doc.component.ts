import {Component, Inject, Injector, NgZone, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {DocumentacionComponent} from '../documentacion/documentacion.component';
import {ConfigService} from '../../../services/core/config.service';
import {errorMessages} from '../../../utils/error-mesaje';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Documento} from '../../../services/entidades/documento.model';
import {ItemSelects} from '../../../services/core/item-select.model';
import {ErrorCatalogo} from '../../../services/core/error.model';
import {ConvocatoriaTiposDocumentoService} from '../../../services/entidades/convocatoria-tipos-documentot.service';
import {SpinnerService} from '../../../services/spinner/spinner/spinner.service';
import {ArchivoService} from '../../../services/entidades/archivo.service';
import {URLSearchParams} from '@angular/http';

@Component({
  selector: 'app-modal-agregar-doc',
  templateUrl: './modal-agregar-doc.component.html',
  styleUrls: ['./modal-agregar-doc.component.css']
})
export class ModalAgregarDocComponent implements OnInit {

  @ViewChild('modalAgregaDoc')
  dialog: ModalComponent;
  context: DocumentacionComponent;
  uploadFile: any;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;
  tipoDocumentoService;
  LGACService;
  formularioDocumentacion: FormGroup;
  idArchivoDoc: number;
  idDocumento: Documento;
  private habilitarBotonAgregar: boolean = true;
  private nombreArchivo: String = '';
  private opcionesCatTipoDocumento: Array<ItemSelects> = [];
  private opcionesCatLGAC: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];

  constructor(private inj: Injector,
              @Inject(NgZone) private zone: NgZone,
              private _convocatoriaDocumentos: ConvocatoriaTiposDocumentoService,
              private _spinnerService: SpinnerService,
              private _archivoService: ArchivoService) {

    this.context =   this.inj.get(DocumentacionComponent);
    ;
    this.zone = new NgZone({ enableLongStackTrace: false });
    console.log('constructor ModalAgregarDocComponent');
    this.inicializarFormularioDocumentacion();
  }

  inicializarFormularioDocumentacion(): void {
    this.formularioDocumentacion = new FormGroup({
      otroTipoDocumento: new FormControl(''),
      idLgac: new FormControl(''),
      idArchivo: new FormControl(''),
      idTipoDocumento: new FormControl('', Validators.required),
      idEstudiante: new FormControl(this.context.idEstudiante)
    });
  }

  handleBasicUpload(data): void {
    // console.log('Que es data?: ');
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {

        let responseJson = JSON.parse(this.basicResp['response']);
        // console.log(responseJson);
        if (this.esPdf(responseJson.originalName) && this.revisarTamanioArchivo(data)) {
          let idArchivo = responseJson.id;
          let jsonArchivo = '{"Documento a subir": ' + responseJson.id + '}';
          this.idArchivoDoc = responseJson.id;
          if (this.idArchivoDoc) {
            this.habilitarBotonAgregar = false;
          }
          this.nombreArchivo = responseJson.originalName;
          this.formularioDocumentacion.value.idArchivo = idArchivo;
          (<FormControl>this.formularioDocumentacion.controls['idArchivo']).
          setValue(idArchivo);
        } else {
          this.tipoErrorArchivo(this.esPdf(responseJson.originalName), this.revisarTamanioArchivo(data), responseJson);
        }
      }
    });

  }

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  handleDropUpload(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
        // console.log(this.dropResp);
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgress = Math.floor(uploaded / (total / 100));
  }

  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }

  cerrarModal(): void {
    this.inicializarFormularioDocumentacion();
    this.nombreArchivo = undefined;
    this.habilitarBotonAgregar = true;
    this.dialog.close();
  }

  validarFormulario(): boolean {
    if (this.formularioDocumentacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioDocumentacion.controls[campo]);
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }


  enviarFormulario(): void {
    let tipDoc: number = Number(this.formularioDocumentacion.value.idTipoDocumento);
    //console.log('Ya eta agregado la wea esa: ' + this.estaAgregadoTipoDocumento(tipDoc));
    if (this.validarFormulario()) {
      if (!this.estaAgregadoTipoDocumento(tipDoc)) {
        // console.log('Es valido el formulario');
        let jsonFormulario = JSON.stringify(this.formularioDocumentacion.value, null, 2);
        // console.log(jsonFormulario);
        this._spinnerService.start('enviarFormulario');
        this.context.documentacionService
          .postDocumento(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, // console.log('Success.. el documento esta arriba'),
          console.error,
          () => {
            this._spinnerService.stop('enviarFormulario');
            this.cerrarModal();
            this.context.onCambiosTabla();
            this.context.addErrorsMesaje
            ('Se agregó exitosamente el documento ', 'success');
          }
        );
      } else {
        this.addErrorsMesaje('El tipo de documento ya fue agregado', 'danger');
      }
    }
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  private esPdf(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    nombreArchivoArray = nombreArchiov.split('.');
    let tamanoArreglo: number;
    tamanoArreglo = nombreArchivoArray.length - 1;
    if(nombreArchivoArray[tamanoArreglo] &&
      (nombreArchivoArray[tamanoArreglo].toLowerCase() === 'pdf')) {
      return true;
    } else {
      return false;
    }
  }
  private revisarTamanioArchivo(data): boolean {
    if( JSON.parse(data['size']) < 52533657) {
      console.log('tamanio ' + JSON.parse(data['size']));
      return true;
    }
    return false;

  }
  private tipoErrorArchivo(extension, tamanio, responseJson): void {
    if (extension === false && tamanio === true) {
      this.addErrorsMesaje('El archivo debe de ser en pdf', 'danger');
      this.eliminarArchivo(responseJson.id);
    } else if (tamanio === false && extension === true) {
      this.addErrorsMesaje('El archivo excede el limite permitido de 50 MB', 'danger');
      this.eliminarArchivo(responseJson.id);
    } else if (tamanio === false && extension === false) {
      this.addErrorsMesaje('El archivo debe tener extension pdf y pesar menos de 50 MB', 'danger');
      this.eliminarArchivo(responseJson.id);
    }
  }
  private estaAgregadoTipoDocumento(id: number): boolean {
    let estaAgregado: boolean = false;
    this.context.getIdTipoDocumentos().forEach((item) => {
      if (id === item.tipoDocumento.id) {
        estaAgregado = true;
      }
    });

    return estaAgregado;
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioDocumentacion.controls[campo]).valid
      && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private obtenerDocumentosConvocatoria(): void {
    let idConvocatoria = this.context.idConvocatoria;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante;

    if(this.context.estudiante.datosPersonales.paisOrigen.valor == 'MÉXICO')//Nacional
    {
      //Clasificacion igual a Nacional y Ambos
      criterioIdEstudiante = 'idClasificacion~1236:IGUAL;OR,idClasificacion~1238:IGUAL;ORGROUPAND';
    }
    else//Extranjero
    {
      //Clasificacion igual a Extranjero y Ambos
      criterioIdEstudiante = 'idClasificacion~1237:IGUAL;OR,idClasificacion~1238:IGUAL;ORGROUPAND';
    }

    criterioIdEstudiante += ',idConvocatoria~' + idConvocatoria + ':IGUAL';
    
    urlParameter.set('criterios', criterioIdEstudiante);
    this.opcionesCatTipoDocumento =
      this._convocatoriaDocumentos.getSelectConvocatoriaCriterios(
        this.erroresConsultas,
        urlParameter
      );
  }

  private eliminarArchivo(id: number): void {
    if (id) {
      this._archivoService.deleteArchivo(
        id,
        this.erroresGuardado
      ).subscribe(
        () => {
          // console.log('Se borro el archiov');
        }
      );
    }
  }

   prepareServices(): void {

    this.tipoDocumentoService =
      this.context._catalogosServices.getTipoDocumento();
    // this.opcionesCatTipoDocumento =
    //   this.tipoDocumentoService.getSelect(this.erroresConsultas);
    this.obtenerDocumentosConvocatoria();

    /* Codigo para filtrar documentos por la convocatoria
     a la que esta aplicando el solicitante

     Se obtiene la promocion del estudiante, con ell se tendra que
     consultar en la tabla  de convocatorias, la convocatoria que tenga
     la misma promocion que el estudiante

     let urlParameter: URLSearchParams = new URLSearchParams();
     urlParameter.set('criterios', 'idConvocatoria~' + 'idConvocatoria' + ':IGUAL');
     //console.log(urlParameter);

     this.opcionesCatTipoDocumento =
     this._documentosConvocatoria.
     getSelectConvocatoriaTiposDocumento(this.erroresConsultas);*/

    this.LGACService =
      this.context._catalogosServices.getlgac();
    this.opcionesCatLGAC =
      this.LGACService.getSelectLgac(this.erroresConsultas);
  }

  ngOnInit() {
  }

}
