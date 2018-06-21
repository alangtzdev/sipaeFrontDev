import {Component, OnInit, Input, ElementRef, Renderer, Injector, ViewChild} from '@angular/core';
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {DocumentoMovilidadExterna} from '../../services/entidades/documento-movilidad-externa.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {Http, URLSearchParams} from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ConfigService} from '../../services/core/config.service';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {EstudianteMovilidadExternaService} from "../../services/entidades/estudiante-movilidad-externa.service";

@Component({
  selector: 'app-detalle-documentos',
  templateUrl: './detalle-documentos.component.html',
  styleUrls: ['./detalle-documentos.component.css']
})
export class DetalleDocumentosComponent implements OnInit {

  @Input() entidadEstudianteMovilidad: EstudianteMovilidadExterna;
  documentoMovService;
  archivoService;
  private idEstudiante: number;
  registroSeleccionado;
  registros: Array<DocumentoMovilidadExterna> = [];
  erroresConsultas: Array<ErrorCatalogo> = [];
  erroresGuardado: Array<Object> = [];
  private alertas: Array<Object> = [];
  habilitarBoton: boolean = false;
  private sub: any;
  validacionActiva: boolean = false;
  private contadorValidos: number = 0;
  @ViewChild('modalComentariosDocumentos')
  modalComentariosDocumentos: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  // Modal de correo
  formularioCorreo: FormGroup;
  formularioCorreoValidacion: FormGroup;

  constructor(private _catalogosServices: CatalogosServices,
              private elementRef: ElementRef, route: ActivatedRoute,
              private injector: Injector, private _renderer: Renderer,
              private http: Http, private _router: Router,
              private _spinner: SpinnerService,
              private authService: AuthService,
              private _correoService: EnvioCorreoElectronicoService,
              private _estudianteMovilidadService: EstudianteMovilidadExternaService) {
    // this.idEstudiante =  Number(params.get('id'));
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.prepareServices();
    this.obtenerDocumentacionMovilidad();
    this.inicializarformularioCorreo();
    this.inicializarformularioCorreoValidacion();
  }

  inicializarformularioCorreoValidacion() {
    this.formularioCorreoValidacion = new FormGroup({
      destinatario: new FormControl(''),
      entidad: new FormControl({EstudiantesMovilidadExterna: this.idEstudiante}),
      idPlantillaCorreo: new FormControl('12')
    });
  }

  inicializarformularioCorreo() {
    this.formularioCorreo = new FormGroup({
      destinatario: new FormControl(''),
      entidad: new FormControl({EstudiantesMovilidadExterna: this.idEstudiante}),
      idPlantillaCorreo: new FormControl('11'),
      comentarios: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required]))
    });
  }

  ngOnInit() {
  }

  obtenerDocumentacionMovilidad(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudianteMovilidad~' + this.idEstudiante + ':IGUAL');

    this.documentoMovService.getListaDocumentoMovilidadExterna(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        this.registros = [];
        this.contadorValidos = 0;
        response.json().lista.forEach((elemento) => {
          this.registros.push(new DocumentoMovilidadExterna(elemento));
        });
        this.registros.forEach((documento) => {
          console.log('conteoValidos', this.contadorValidos);
          if (!documento.valido) {
            this.habilitarBoton = true;
          } else {
                this.contadorValidos++;
                // console.log("conteoValidos",this.contadorValidos);
          }

        });
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      }
    );
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
              // console.log('Error downloading the file.');
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
            /*if (assertionsEnabled()) {
              // console.log('Error descargando el archivo');
            }*/
            this._spinner.stop('descargarArchivo');
          },
          () => {
            /*if (assertionsEnabled()) {
            console.info('OK');
          }*/
            this._spinner.stop('descargarArchivo');
          }
        );
    }

  }

  validarCampo(documentoMovExt, valor): void {
    this.registroSeleccionado = documentoMovExt;
    let jsonValidarDov = {'valido': valor};
    let jsonFormulario = JSON.stringify(jsonValidarDov, null, 2);
    this.documentoMovService.putDocumentoMovilidadExterna(
      this.registroSeleccionado.id,
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {},
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      } ,
      () => {
        /*if (assertionsEnabled()) {
          // console.log('Estatus documento actualizado');
        }*/
        this.obtenerDocumentacionMovilidad();
      }
    );
  }

  /*modalEnviarComentarios(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalAgregarComiteData = new ModalEnvioComentariosDocRechazadosData(
      this
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalAgregarComiteData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
      <any>ModalEnvioComentariosDocRechazados,
      bindings,
      modalConfig
    );
  }*/

  modalEnviarComentarios() {
    this.modalComentariosDocumentos.open('lg');
  }

  hasRol(rol: string): boolean {
    return this.authService.hasRol(rol);
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
    this.archivoService = this._catalogosServices.getArchivos();
    this.documentoMovService =
      this._catalogosServices.getDocumentoMovilidadExterna();
  }

  validarSolicitud(): void {
    // TODO actualizar estatus de rechazado
    let json = '{"idEstatus": "1002"}';
    this._estudianteMovilidadService
      .putEstudianteMovilidadExterna(
        this.idEstudiante,
        json,
        this.erroresConsultas
      ).subscribe(
      () => {
      }

    );

     let destinatario;
    if (this.entidadEstudianteMovilidad) {
      (<FormControl>this.formularioCorreoValidacion.controls['destinatario']).setValue(
        this.entidadEstudianteMovilidad.datosPersonales.email);
    }

    if (this.validarFormularioValidacion()) {
      let jsonFormulario = JSON.stringify(this.formularioCorreoValidacion.value, null, 2);
      // console.log('Formualrio correo: ' + jsonFormulario);
      this._spinner.start('enviarValidacion');
      this._correoService
        .postCorreoElectronico(
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
        response => {},
        error => {
          console.error(error);
          this._spinner.stop('enviarValidacion');
          this.cerrarModal();
          this.addErrorsMesaje
          ('No se ha enviado el correo', 'danger');
        },
        () => {
          /*if (assertionsEnabled()) {
            // console.log('Correo Enviado');
          }*/
          this._spinner.stop('enviarValidacion');
          this.cerrarModal();
          this.addErrorsMesaje
          ('Se ha enviado el correo correctamente', 'success');
        }
      );
    }


  }

  enviarComentarios(): void {
    // TODO actualizar estatus de rechazado
    let json = '{"idEstatus": "1009"}';
    this._estudianteMovilidadService
      .putEstudianteMovilidadExterna(
        this.idEstudiante,
        json,
        this.erroresConsultas
      ).subscribe(
      () => {
      }

    );
    let destinatario;
    if (this.entidadEstudianteMovilidad) {
      (<FormControl>this.formularioCorreo.controls['destinatario']).setValue(this.entidadEstudianteMovilidad.datosPersonales.email);
    }

    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formularioCorreo.value, null, 2);
      // console.log('Formualrio correo: ' + jsonFormulario);
      this._spinner.start('enviarComentarios');
      this._correoService
        .postCorreoElectronico(
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
        response => {},
        error => {
          console.error(error);
          this._spinner.stop('enviarComentarios');
          this.cerrarModal();
          this.addErrorsMesaje
          ('No se ha enviado el correo', 'danger');
        },
        () => {
          /*if (assertionsEnabled()) {
            // console.log('Correo Enviado');
          }*/
          this._spinner.stop('enviarComentarios');
          this.cerrarModal();
          this.addErrorsMesaje
          ('Se ha enviado el correo correctamente', 'success');
        }
      );
    }
  }

  cerrarModal(): void {
    this.modalComentariosDocumentos.close();
  }

  private validarFormulario(): boolean {
    if (this.formularioCorreo.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  private validarFormularioValidacion(): boolean {
    if (this.formularioCorreoValidacion.valid) {
      return true;
    }
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
          // resultado += this.mensajeErrors[errorType];
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return resultado;
  }

}
