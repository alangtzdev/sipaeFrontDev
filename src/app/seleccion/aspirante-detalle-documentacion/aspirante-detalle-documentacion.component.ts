import {Component, OnInit, ViewChild, Input, ElementRef, Injector, Renderer} from '@angular/core';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Documento} from '../../services/entidades/documento.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {URLSearchParams} from '@angular/http';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {ConfigService} from '../../services/core/config.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {Validacion} from '../../utils/Validacion';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {EstudianteService} from '../../services/entidades/estudiante.service';
@Component({
  selector: 'documentacion',
  templateUrl: './aspirante-detalle-documentacion.component.html',
  styleUrls: ['./aspirante-detalle-documentacion.component.css']
})
export class AspiranteDetalleDocumentacionComponent implements OnInit {
  
  @Input()
  idEstudiante: number;
  @Input()
  esVistaSolicitante: boolean;
  @Input()
  entidadAspirante: Estudiante;

  @ViewChild('modalEnviarComentarios')
  modalEnviarComentarios: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  id: number;

  documentoService;
  registroSeleccionado: Documento;
  formulario: FormGroup;
  mostarBoton: boolean;
  tamanoRegistroDocumentosValidos;
  numeroDocUsuario;
  valorElegido;

  private descripcionError: string = '';

  private registroDocuemntos: Array<Documento> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private noDocTrue: Array<Documento> = [];
  private alertas: Array<Object> = [];

  // variables para modal enviar comentario //
  private formularioCorreo: FormGroup;
  private correoEstudiante: string = undefined;
  private validacionActiva: boolean = false;
  // fin de variables para modal enviar comentarios //

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private authService: AuthService,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              private _archivoService: ArchivoService,
              private _correoService: EnvioCorreoElectronicoService,
              private _estudianteService: EstudianteService) {
    this.prepareServices();
    this.formulario = new FormGroup({
      valido: new FormControl('')});
    this.mostarBoton = true;
  }

  ngOnInit(): void {
    this.id = this.idEstudiante;
    this.incializarFormularioCorreo();
    this.obtenerDocumentos();
    this.obtenerNumeroDocumentosValidados();
  }

  obtenerDocumentos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    /*TODO El solicitante no puede ver el certificado de calif, en el detalle
    * TODO por lo tanto se aplica mostrar todos los documnetos. HD-687
    * TODO Falta columna de clasificación en la tabla de documentos. Clasificación solicitud de admisión.
    * */

    /*'idTipoDocumento.idAreaDocumento~2:IGUAL:OR,' +
    'idTipoDocumento.idAreaDocumento~10:OR;' +
    'ORGROUPAND,' + 'idEstudiante~' + this.id + ':IGUAL;';*/
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registroDocuemntos = this.documentoService
      .getListaDocumento(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  obtenerNumeroDocumentosValidados(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.id + ':IGUAL' +
      ',valido~true:IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.noDocTrue = this.documentoService
      .getListaDocumento(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      // console.log('Doc seleccioando: ' + this.registroSeleccionado.archivo.nombre);
    } else {
      this.registroSeleccionado = null;
    }
  }

  validarCampo(documento, valor, tamanoLista, noDocTrue): void {
    this.valorElegido = valor;
    this.numeroDocUsuario = tamanoLista;
    this.tamanoRegistroDocumentosValidos = noDocTrue;
    this.registroSeleccionado = documento;
    this.formulario.value.valido = valor;
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    // console.log('jason formulario ' + jsonFormulario );
    this.documentoService.putDocumento(
      this.registroSeleccionado.id,
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      () => {}, // console.log('Success, estatus documento actualizado'),
      console.error,
      () => {
        this.mostarBoton = false;
        this.obtenerDocumentos();
        this.obtenerNumeroDocumentosValidados();
      }
    );
  }

  enviarCorreo(): void {

  }

  guardarComentario(): void {

  }

  documentosValidados(): boolean {
    if ( this.valorElegido ) {
      if ((this.tamanoRegistroDocumentosValidos + 1) === this.numeroDocUsuario) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('detallesdocumentacion1');
      this._archivoService
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
            // console.log('Error downloading the file.');
            this._spinner.stop('detallesdocumentacion1');
          },
          () => {
            // console.info('OK');
            this._spinner.stop('detallesdocumentacion1');
          }
        );
    }
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('detallesdocumentacion2');
      this._archivoService
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
            // console.log('Error downloading the file.');
            this._spinner.stop('detallesdocumentacion2');
          },
          () => {
            // console.info('OK');
            this._spinner.stop('detallesdocumentacion2');
          }
        );
    }
  }

  columnaAsistencia(valor: boolean): string {
    let cls = (valor) ? 'check' : 'times';
    return cls;
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  prepareServices(): void {
    this.documentoService = this._catalogosService.getDocumentos();
  }

  hasRol(rol: string): boolean {
    return  this.authService.hasRol(rol);
  }

  /*********************************************************
   * INICIA MODAL ENVIAR COMENTARIOS************************
   * *******************************************************
  */

  private modalDocumentacion(descripcion: string, email: string): void {
    this.getControl('destinatario').patchValue(email);
    this.modalEnviarComentarios.open('lg');
  }

  private incializarFormularioCorreo(): void {
    this.formularioCorreo = new FormGroup({
      destinatario: new FormControl(),
      entidad: new FormControl({Estudiantes: this.idEstudiante}),
      idPlantillaCorreo: new FormControl('5'),
      comentarios: new FormControl('', Validators.compose([
      Validacion.parrafos]))
    });

    // console.log('formularioCorreo', this.formularioCorreo);
  }

  enviarComentarios(): void {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formularioCorreo.value, null, 2);
      // console.log('Formualrio correo: ', jsonFormulario);
      this._spinner.start('enviarCorreo');
      this._correoService
        .postCorreoElectronico(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        response => {},
        error => {
          console.error(error);
          this._spinner.stop('enviarCorreo');
          this.cerrarModalDocumentacion();
          this.addErrorsMesaje
          ('No se ha enviado el correo', 'danger');
        },
        () => {
          // console.log('Correo Enviado');
          this._spinner.stop('enviarCorreo');
          this.actualizarAspirante();
          this.cerrarModalDocumentacion();
          this.addErrorsMesaje
          ('Se ha enviado el correo correctamente', 'success');
        }
      );
    }
  }

  actualizarAspirante(): void {
    let formularioEstudinate = new FormGroup({
      idEstatus : new FormControl('1009')
    });
    let jsonFormulario = JSON.stringify(formularioEstudinate.value, null, 2);
    // console.log('Formualrio correo: ' + jsonFormulario);
    this._estudianteService.putEstudiante(
      this.idEstudiante,
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {},
      error => {
          this._spinner.stop('enviarCorreo');
      },
      () => {
          this._spinner.stop('enviarCorreo');
      }
    );
  }

  private validarFormulario(): boolean {
    if (this.formularioCorreo.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  private getControl(campo: string): FormControl {
    return (<FormControl>this.formularioCorreo.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioCorreo.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  private cerrarModalDocumentacion(): void {
    this.getControl('comentarios').patchValue('');
    this.modalEnviarComentarios.close();
  }
}
