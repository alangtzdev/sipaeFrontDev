import { Component, OnInit, Injector, Renderer, Inject, NgZone, ViewChild } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {DocumentoMovilidadExterna} from '../../services/entidades/documento-movilidad-externa.model';
import {ConfigService} from "../../services/core/config.service";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import { NgUploaderOptions } from 'ngx-uploader';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {errorMessages} from '../../utils/error-mesaje';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-registro-admision-step-cuatro',
  templateUrl: './registro-admision-step-cuatro.component.html',
  styleUrls: ['./registro-admision-step-cuatro.component.css']
})
export class RegistroAdmisionStepCuatroComponent implements OnInit {

  router: Router;
  idEstudiante: number;
  erroresConsultas: Array<Object> = [];
  validacionBoton: boolean = false;
  checkBoxDocumento: boolean = false;
  documentoMovilidad: DocumentoMovilidadExterna;
  estudianteMovilidadExternaService;
  documentoMovilidadService;
  archivoService;
  registroSeleccionado: DocumentoMovilidadExterna;
  btnEliminar = false;
  ocultarBoton: boolean= false;
  estatusDoc: boolean = false;
  private alertas: Array<Object> = [];
  private sub: any;

  constructor(//private modal: Modal, private elementRef: ElementRef,
              //private injector: Injector, private _renderer: Renderer,
              _router: Router, route: ActivatedRoute,
              public _catalogosService: CatalogosServices,
              private _spinner: SpinnerService, @Inject(NgZone) private zone: NgZone) {
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
    });
    this.prepareServices();
    this.router = _router;
    this.obtenerCatalogo();
    this.formulario = new FormGroup({
      idTipoDocumento: new FormControl('', Validators.required),
      auxiliar: new FormControl('', Validators.required)
    });
    //this.idEstudiante = _router.parent.parent.currentInstruction.component.params.id;
  }

  paginaActual: number = 1;
  limite: number = 10;
  registros: Array<DocumentoMovilidadExterna> = [];
  columnas: Array<any> = [
    { titulo: 'Documento', nombre: 'idtipoDocumento'},
    { titulo: 'Nombre del archivo', nombre: 'id_archivo.nombre'},
    { titulo: 'Fecha de actualización', nombre: 'valor', sort: false },
    { titulo: 'Estatus', nombre: 'valido'},
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'id_archivo.nombre' }
  };

  validarEnvioSolicitud(valido: boolean, total: number): void {
    if (valido) {
      if (total > 5) {
        this.validacionBoton = true;
      } else {
        this.validacionBoton = false;
      }
    } else {
      this.validacionBoton = false;
    }
  }

  eliminarDocumento () {
    this._spinner.start('stepCuatro');
    if (this.registroSeleccionado) {
      this.registros.splice(this.registros.indexOf(this.registroSeleccionado), 1);
      this.documentoMovilidadService.deleteDocumentoMovilidadExterna(
          this.registroSeleccionado.id,
          this.erroresConsultas
      ).subscribe(
          () => {
            /*if (assertionsEnabled()) {
              //console.log('Success');
            }*/
            this.onCambiosTabla();
            this.registroSeleccionado = null;
          }
      );
    } else {
      // //console.log('Selecciona un registro');
    }
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.habilitarBtnEliminar();
    } else {
      this.registroSeleccionado = null;
    }
  }

  habilitarBtnEliminar(): void {
    if (this.registroSeleccionado.valido) {
      this.btnEliminar = false;
    } else {
      this.btnEliminar = true;
    }
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudianteMovilidad~' + this.idEstudiante + ':IGUAL';
    urlSearch.set('criterios', criterioIdEstudiante);

    this.documentoMovilidadService.getListaDocumentoMovilidadExterna(
        this.erroresConsultas,
        urlSearch
    ).subscribe(
        response => {
          this.registros = [];
          response.json().lista.forEach((elemento) => {
            this.registros.push(new DocumentoMovilidadExterna(elemento));
          });

          if (this.registros.length > 5) {
            this.checkBoxDocumento = true;
          } else {
            this.checkBoxDocumento = false;
          }
          this._spinner.stop('stepCuatro');
        },
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
        }

    );
  }

  prepareServices(): void {
    this.estudianteMovilidadExternaService =
        this._catalogosService.getEstudianteMovilidadExterna();
    this.documentoMovilidadService =
        this._catalogosService.getDocumentoMovilidadExterna();
    this.archivoService =
        this._catalogosService.getArchivos();

    //para modal agregar documento
    this.estatusCatalogoService = this._catalogosService.getTipoDocumento();
    this.documentoMovilidadExternaService =
        this._catalogosService.getDocumentoMovilidadExterna();
  }

  modalAgregarDocumento(): void {
    this.ocultarBoton = false;
    (<FormControl>this.formulario.controls['idTipoDocumento']).setValue('');
    (<FormControl>this.formulario.controls['auxiliar']).setValue('');
    this.nombreArchivo = '';
    this.inicializarOpcionesNgZone();
    this.modalAgregaDocumento.open('lg');
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalAgregarDocumentoData(
          this,
          this.idEstudiante
      )
      }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
        <any>ModalAgregarDocumento,
        bindings,
        modalConfig
    );*/
  }

  finishMethod(): boolean {
    return true;
  }

  previusMethod(): boolean {
    return true;
  }

  generarFormatoInscripcion(): any {
    this.estudianteMovilidadExternaService.getFormatoPdfEstExteMov(
        this.idEstudiante,
        this.erroresConsultas,
        'Inscripcion'
    ).subscribe(
        response => {
          window.open(response.json());
        },
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
        }
    );
  }

  estadoEvaluacionDocumentacion(valor: boolean): string {
    var estatusDoc;
    if (valor === true) {
      estatusDoc = 'Validado';
    } else if (valor === false) {
      estatusDoc = 'Rechazado';
    } else {
      estatusDoc = 'Por validar';
    }

    return estatusDoc;
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
      this.archivoService
          .generarTicket(jsonArchivo, this.erroresConsultas)
          .subscribe(
              data => {
                let json = data.json();
                let url =
                    ConfigService.getUrlBaseAPI() +
                    '/api/v1/archivovisualizacion/' +
                    id +
                    '?ticket=' +
                    json.ticket;
                window.open(url);
              },
              error => {
                //console.log('Error downloading the file.');
                this._spinner.stop('descargarArchivo');
              },
              () => {
                console.info('OK');
                this._spinner.stop('descargarArchivo');
              }
          );
    }
  }

  /////////////////////////// MODALS /////////////////////////////////////
  @ViewChild('modalAgregaDocumento')
  modalAgregaDocumento: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private nombreArchivo: String = '';
  /*dialog: ModalDialogInstance;
  context: ModalAgregarDocumentoData;*/
  formulario: FormGroup;
  validacionActiva: boolean = false;
  idTipoDocumento: number = 0;
  idArchivo: number;
  archivoNombre: string = '';
  mensajeErrors: any = errorMessages;
  opcionesSelectTipoDocumento: Array<ItemSelects>;
  estatusCatalogoService;
  documentoMovilidadExternaService;
  //archivoService;
  //
  uploadFile: any;
  /*options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: true,
    authToken: localStorage.getItem('token')
  };*/
  options: NgUploaderOptions;
  //zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  //
  //private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  //private alertas: Array<Object> = [];

  /*constructor(
      private _spinner: SpinnerService,
      private _archivoService: ArchivoService,
      //dialog: ModalDialogInstance, modelContentData: ICustomModal,
      private _catalogosService: CatalogosServices, _router: Router
  ) {
    this.prepareServices();
    this.dialog = dialog;
    this.context = <ModalAgregarDocumentoData>modelContentData;
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.obtenerCatalogo();
    this.formulario = new FormGroup({
      idTipoDocumento: new FormControl('', Validators.required),
      auxiliar: new FormControl('', Validators.required)
    });
  }*/

  inicializarOpcionesNgZone(): void {
  this.options = new NgUploaderOptions({
    // url: 'http://ng2-uploader.com:10050/upload'
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    filterExtensions: true,
    allowedExtensions: ['pdf'],
    withCredentials: false,
    authToken: localStorage.getItem('token')
  });
}

  // VALIDAR FORMULARIO

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
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
  // FIN

  enviarFormulario(): void {
    this.ocultarBoton = true;
    let tipDoc: number = Number(this.formulario.value.idTipoDocumento);
    if (this.validarFormulario()) {
      if (!this.estaAgregadoTipoDocumento(tipDoc)) {
        let jsonDocumento = '{"idEstudianteMovilidad": "' + this.idEstudiante + '", '
            + '"idArchivo": "' + this.idArchivo + '", '
            + '"idTipoDocumento": "' + this.idTipoDocumento + '"}';
        //console.log(jsonDocumento);
        this.documentoMovilidadExternaService
            .postDocumentoMovilidadExterna(
                jsonDocumento,
                this.erroresGuardado
            ).subscribe(
            () => {
              //console.log('Success');
              this.onCambiosTabla();
              this.cerrarModal();
            }
        );
      } else {
        this.addErrorsMesaje('El tipo de documento ya fue agregado', 'danger');
    this.ocultarBoton = false;

      }
    }
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  private estaAgregadoTipoDocumento(id: number): boolean {
    let estaAgregado: boolean = false;
    this.registros.forEach((item) => {
      if (id === item.tipoDocumento.id) {
        estaAgregado = true;
      }
    });

    return estaAgregado;
  }

  cerrarAlertaModal(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  cargarTipoDocumento(param: number): void {
    this.idTipoDocumento = param;
  }

  validarDrop(): boolean {
    if (this.idTipoDocumento !== 0) {
      return true;
    }
    return false;
  }

  handleBasicUpload(data): void {
    //console.log('Que es data?: ');
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        //console.log(responseJson.originalName);
        if (this.esPdf(responseJson.originalName)) {
          this.idArchivo = responseJson.id;
          this.nombreArchivo = responseJson.originalName;
          //console.log(this.nombreArchivo);
          (<FormControl>this.formulario.controls['auxiliar'])
              .setValue(this.idArchivo);
        } else {
          this.addErrorsMesaje('El archivo debe extensión tipo .pdf', 'danger');
          this.eliminarArchivo(responseJson.id);
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
        // //console.log(this.dropResp);
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

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
      this.archivoService
          .generarTicket(jsonArchivo, this.erroresConsultas)
          .subscribe(
              data => {
                let json = data.json();
                let url =
                    ConfigService.getUrlBaseAPI() +
                    '/api/v1/archivovisualizacion/' +
                    id +
                    '?ticket=' +
                    json.ticket;
                window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
              },
              error => {
                /*if (assertionsEnabled()) {
                  //console.log('Error downloading the file.');
                }*/
                this._spinner.stop('verArchivo');
              },
              () => {
                /*if (assertionsEnabled()) {
                  console.info('OK');
                }*/
                this._spinner.stop('verArchivo');
              }
          );
    }
  }

  descargarArchivoModal(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivoModal');
      this.archivoService
          .generarTicket(jsonArchivo, this.erroresConsultas)
          .subscribe(
              data => {
                let json = data.json();
                let url =
                    ConfigService.getUrlBaseAPI() +
                    '/api/v1/archivovisualizacion/' +
                    id +
                    '?ticket=' +
                    json.ticket;
                window.open(url);
              },
              error => {
                /*if (assertionsEnabled()) {
                  //console.log('Error downloading the file.');
                }*/
                this._spinner.stop('descargarArchivoModal');
              },
              () => {
                /*if (assertionsEnabled()) {
                  console.info('OK');
                }*/
                this._spinner.stop('descargarArchivoModal');
              }
          );
    }

  }

  private eliminarArchivo(id: number): void {
    if (id) {
      this.archivoService.deleteArchivo(
          id,
          this.erroresGuardado
      ).subscribe(
          () => {
            /*if (assertionsEnabled()) {
              //console.log('Se borro el archiov');
            }*/
          }
      );
    }
  }

  cerrarModal(): void {
    this.modalAgregaDocumento.close();
    //this.dialog.close();
  }

  /*private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.documentoMovilidadExternaService =
        this._catalogosService.getDocumentoMovilidadExterna();
    this.archivoService = this._catalogosService.getArchivos();
  }*/

  private obtenerCatalogo(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAreaDocumento~' + '3' + ':IGUAL');
    this.opcionesSelectTipoDocumento =
        this.estatusCatalogoService.
        getSelectTipoDocumentoCriterio(this.erroresConsultas, urlParameter);
  }

  private esPdf(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    let tamanoArreglo: number;
    nombreArchivoArray = nombreArchiov.split('.');
    tamanoArreglo = nombreArchivoArray.length - 1;
    if (nombreArchivoArray[tamanoArreglo] && (nombreArchivoArray[tamanoArreglo].toLowerCase() === 'pdf')) {
      return true;
    } else {
      return false;
    }
  }

}
