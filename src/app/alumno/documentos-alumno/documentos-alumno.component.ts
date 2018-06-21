import {Component, OnInit, Injector, Renderer, ViewChild, NgZone} from '@angular/core';
import {Documento} from '../../services/entidades/documento.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Router, ActivatedRoute} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {AuthService} from '../../auth/auth.service';
import {URLSearchParams} from '@angular/http';
import {DocumentoMovilidadExterna} from '../../services/entidades/documento-movilidad-externa.model';
import {DocumentoMovilidadInterprograma} from '../../services/entidades/documento-movilidad-interprograma.model';
import {DocumentoProbatorioAcreditacion} from '../../services/entidades/documento-probatorio-acreditacion.model';
import {DocumentoServicioSocial} from '../../services/entidades/documento-servicio-social.model';
import {DocumentoMovilidadCurricular} from '../../services/entidades/documento-movilidad-curricular.model';
import {VotoAprobatorio} from '../../services/entidades/voto-aprobatorio.model';
import {Usuarios} from '../../services/usuario/usuario.model';
import {ConfigService} from '../../services/core/config.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {errorMessages} from '../../utils/error-mesaje';
import {ItemSelects} from '../../services/core/item-select.model';

@Component({
  selector: 'app-documentos-alumno',
  templateUrl: './documentos-alumno.component.html',
  styleUrls: ['./documentos-alumno.component.css']
})
export class DocumentosAlumnoComponent implements OnInit {

  idUsuarioObjetivo: number;
  idEstudiante: number;
  idEstudianteMovilidad: number;
  idDocumento: number;

  //variables para la consulta a BD
  documentosService;
  documentosMovilidadService;
  documentosInterprogramaService;
  documentosAcreditacionService;
  documentosServicioService;
  documentosMovCurricularService;
  usuarioService;
  estudianteService;
  archivoService;
  estudianteMovilidadService;
  catTipoDocumentosService;
  movilidadCurricularService;
  votoAprobatorioService;

  registroSeleccionado: Documento;
  deTitulacion: boolean = false;
  controlGroup: FormGroup;

  //variable para almacenar los registros de los documentos
  registroDocuemntos: Array<any> = [];
  entidadEstudiante: Estudiante;

  private habilitarBoton: boolean = false;
  private usuarioLogueado: UsuarioSesion;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private sub: any;

  constructor( //private modal: Modal, private elementRef: ElementRef,
      private injector: Injector, private _renderer: Renderer,
      public _catalogoService: CatalogosServices, private router: Router,
      private _spinner: SpinnerService, route: ActivatedRoute,
      private auth: AuthService) {
    this.prepareService();
    this.controlGroup = new FormGroup({
      tipoDocumento: new FormControl('0')
    });

    this.sub = route.params.subscribe(params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    //this.idUsuarioObjetivo = router.parent.currentInstruction.component.params.usuarioObjetivo;
    let auxiliar: number;
    if (this.idUsuarioObjetivo) {
      auxiliar = this.idUsuarioObjetivo;
    } else {
      this.usuarioLogueado = auth.getUsuarioLogueado();
      auxiliar = this.usuarioLogueado.id;
    }
    this.recuperarUsuarioActual(auxiliar);

    // para modal agregar documento
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.prepareServicesModal();

    this.formularioDocumentacion = new FormGroup({
      otroTipoDocumento: new FormControl(''),
      idArchivo: new FormControl(''),
      idTipoDocumento: new FormControl('', Validators.required),
      idEstudiante: new FormControl(this.idEstudiante ? this.idEstudiante : this.idEstudianteMovilidad),
      auxiliar: new FormControl ('aux', Validators.required),
      valido: new FormControl (true)
    });
  }

  cambioTipoDocumento(idTipoDocumento: number): void {
    if (idTipoDocumento !== 0 ) {
      this.habilitarBoton = true;
    }
  }

  buscarDocumentos(idDocumentos): void {
    switch (idDocumentos) {
      case '1':
        this.recuperarDocumentosGenerales();
        break;

      case '2':
        this.recuperarDocumentosMovilidad();
        break;

      case '3':
        this.recuperarDocumentosInterprogramas();
        break;

      case '4':
        this.recuperarDocumentosAcreditacion();
        break;

      case '5':
        this.recuperarDocumentosServicio();
        break;

      case '6':
        this.recuperarDocsMovilidadCurricular();
        break;

      case '7':
        this.recuperarDocumentosTitulacion();
        break;

      case '8':
        this.recuperarDocumentosBaja();
        break;
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  modalAgregarDocumento(): void {
    this.inicializarFormularioModal();
    this.modalAgregar.open('lg');
    /*let dialog: Promise<ModalDialogInstance>;
     let modalConfig = new ModalConfig('lg', true, 27);

     let bindings = Injector.resolve([
     provide(ICustomModal, { useValue: new AgregarDocumentoExpedienteData(
     this,
     this.idEstudiante
     )
     }),
     provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
     provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
     provide(Renderer, { useValue: this._renderer })
     ]);

     dialog = this.modal.open(
     <any>AgregarDocumentoExpediente,
     bindings,
     modalConfig
     );*/
  }

  recuperarDocumentosGenerales(): void {
    if ((<FormControl>this.controlGroup.controls['tipoDocumento']).value !== '1')
      (<FormControl>this.controlGroup.controls['tipoDocumento']).setValue('1');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.idEstudiante + ':IGUAL');

    this._spinner.start('recuperarDocumentos');
    this.documentosService.getListaDocumentosOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          this.registroDocuemntos = [];
          this.deTitulacion = false;
          response.json().lista.forEach((documentos) => {
            this.registroDocuemntos.push(new Documento(documentos));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocumentos');
        },
        () => {
          this._spinner.stop('recuperarDocumentos');
          this.mandarMensajeNoHayDocumentos();
        }
    );
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
    this.alertas.length = 0;
  }

  private recuperarDocumentosMovilidad(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudianteMovilidad~' + this.idEstudianteMovilidad +
        ':IGUAL');
    this._spinner.start('recuperarDocumentosMovilidad');
    this.documentosMovilidadService.getListaDocumentoMovilidadExterna(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          this.registroDocuemntos = [];
          this.deTitulacion = false;
          response.json().lista.forEach((documentos) => {
            this.registroDocuemntos.push(new DocumentoMovilidadExterna(documentos));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocumentosMovilidad');
        },
        () => {
          this._spinner.stop('recuperarDocumentosMovilidad');
          this.mandarMensajeNoHayDocumentos();
        }
    );
  }

  private recuperarDocumentosInterprogramas(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMovilidad.idEstudiante.id~' + this.idEstudiante +
        ':IGUAL');
    this._spinner.start('recuperarDocumentosInterprograms');
    this.documentosInterprogramaService.getListaDocMovilidadInterprogramaOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          this.registroDocuemntos = [];
          this.deTitulacion = false;
          response.json().lista.forEach((documentos) => {
            this.registroDocuemntos.push(new DocumentoMovilidadInterprograma(documentos));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocumentosInterprograms');
        },
        () => {
          this._spinner.stop('recuperarDocumentosInterprograms');
          this.mandarMensajeNoHayDocumentos();
        }
    );
  }

  private recuperarDocumentosAcreditacion(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAcreditacion.idEstudiante.id~' + this.idEstudiante +
        ':IGUAL');
    this._spinner.start('recuperarDocumentosAcreditacion');
    this.documentosAcreditacionService.getListaDocumentoProbatorioControlable(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          this.registroDocuemntos = [];
          this.deTitulacion = false;
          response.json().lista.forEach((documentos) => {
            this.registroDocuemntos.push(new DocumentoProbatorioAcreditacion(documentos));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocumentosAcreditacion');
        },
        () => {
          this._spinner.stop('recuperarDocumentosAcreditacion');
          this.mandarMensajeNoHayDocumentos();
        }
    );
  }

  private recuperarDocumentosServicio(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idServicio.idEstudiante.id~' + this.idEstudiante + ':IGUAL');
    this._spinner.start('recuperarDocumentosServicio');
    this.documentosServicioService.getListaDocumentoServicioSocial(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          this.registroDocuemntos = [];
          this.deTitulacion = false;
          response.json().lista.forEach((documento) => {
            this.registroDocuemntos.push(new DocumentoServicioSocial(documento));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocumentosServicio');
        },
        () => {
          //this._spinner.stop();
          this._spinner.stop('recuperarDocumentosServicio');
          this.mandarMensajeNoHayDocumentos();
        }
    );
  }

  private recuperarDocsMovilidadCurricular(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMovilidad.idEstudiante.id~' + this.idEstudiante +
        ':IGUAL');
    this._spinner.start('recuperarDocsMovilidadCurricular');
    this.documentosMovCurricularService.
    getListaDocumentoMovilidadCurricularOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          this.registroDocuemntos = [];
          this.deTitulacion = false;
          response.json().lista.forEach((documento) => {
            this.registroDocuemntos.push(new DocumentoMovilidadCurricular(documento));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocsMovilidadCurricular');
        },
        () => {
          //this._spinner.stop();
          this._spinner.stop('recuperarDocsMovilidadCurricular');
          this.mandarMensajeNoHayDocumentos();
        }
    );
  }

  private recuperarDocumentosTitulacion(): void {
    this._spinner.start('recuperarDocumentosTitulacion');
    this.registroDocuemntos = [];
    this.deTitulacion = true;
    let urlParams = new URLSearchParams();
    urlParams.set('criterios', 'idEstudiante.id~' + this.idEstudiante + ':IGUAL');
    this.votoAprobatorioService.getVotosAprobatorios(this.erroresConsultas, urlParams).
    subscribe(response => {
          response.json().lista.forEach((voto) => {
            this.registroDocuemntos.push(new VotoAprobatorio(voto));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocumentosTitulacion');
        },
        () => {
          this._spinner.stop('recuperarDocumentosTitulacion');
          this.mandarMensajeNoHayDocumentos();
        }
    );
  }

  private recuperarUsuarioActual(idUusuairo: number): void  {
    let usuarioActual: Usuarios;
    this.usuarioService.getEntidadUsuario(
        idUusuairo,
        this.erroresConsultas
    ).subscribe(
        response => {
          usuarioActual = new Usuarios(response.json());
          usuarioActual.roles.forEach((rol) => {
            if (rol.id === 5) {
              this.recuperarEstudiante(usuarioActual.id);
            } else if (rol.id === 14) {
              this.recuperarEstudianteMovilidad(usuarioActual.id);
            }
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
        },
        () => {
          //his.recuperarEstudiante(usuarioActual.id);
        }
    );
  }

  private recuperarEstudiante(idUsuario): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + idUsuario + ':IGUAL');
    this._spinner.start('recuperarEstudiante');
    this.estudianteService.getListaEstudianteOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          let estudiante: Estudiante;
          response.json().lista.forEach((elemento) => {
            this.entidadEstudiante = new Estudiante(elemento);
            this.idEstudiante = elemento.id;
          });
        }, error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarEstudiante');
        },
        () => {
          this._spinner.stop('recuperarEstudiante');
        }
    );
  }

  private recuperarEstudianteMovilidad(idUsuario: number) {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + idUsuario + ':IGUAL');
    this._spinner.start('recuperarEstudianteMovilidad');
    this.estudianteMovilidadService.getListaEstudianteMovilidadExterna(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          response.json().lista.forEach((elemento) => {
            this.idEstudianteMovilidad = elemento.id;
          });
        }, error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarEstudianteMovilidad');
        },
        () => {
          this._spinner.stop('recuperarEstudianteMovilidad');
        }
    );
  }

  private recuperarDocumentosBaja() {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.idEstudiante + ':IGUAL:AND,' +
        'idTipoDocumento.idAreaDocumento~9:IGUA;AND');

    this._spinner.start('recuperarDocumentosBaja');
    this.documentosService.getListaDocumentosOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          this.registroDocuemntos = [];
          this.deTitulacion = false;
          response.json().lista.forEach((documentos) => {
            this.registroDocuemntos.push(new Documento(documentos));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           }*/
          this._spinner.stop('recuperarDocumentosBaja');
        },
        () => {
          this._spinner.stop('recuperarDocumentosBaja');
          this.mandarMensajeNoHayDocumentos();
        }
    );
  }

  private mandarMensajeNoHayDocumentos(): void {
    if (this.registroDocuemntos.length === 0) {
      this.addErrorsMesaje('No se encontraron documentos', 'danger');
    }
  }

  private verArchivo(id: number): void {
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

  private descargarArchivo(id: number): void {

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

  private prepareService(): void {
    this.documentosService = this._catalogoService.getDocumentos();
    this.usuarioService = this._catalogoService.getUsuarioService();
    this.estudianteService = this._catalogoService.getEstudiante();
    this.archivoService = this._catalogoService.getArchivos();
    this.estudianteMovilidadService =
        this._catalogoService.getEstudianteMovilidadExterna();
    this.documentosInterprogramaService =
        this._catalogoService.getDocumentoMovilidadInterprogramaService();
    this.documentosMovilidadService =
        this._catalogoService.getDocumentoMovilidadExterna();
    this.documentosAcreditacionService =
        this._catalogoService.getDocumentoProbatorioAcreditacionService();
    this.documentosServicioService =
        this._catalogoService.getDocumentoServicioSocialService();
    this.documentosMovCurricularService =
        this._catalogoService.getDocumentoMovilidadCurricularService();
    this.catTipoDocumentosService = this._catalogoService.getTipoDocumento();
    this.votoAprobatorioService = this._catalogoService.getVotoAprobatorioService();
  }

  ngOnInit() {
  }

  /////////////////////////////// MODAL AGREGAR DOCUMENTO ///////////////////////////////////
  @ViewChild('modalAgregar') modalAgregar: ModalComponent;
  uploadFile: any;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;
  tipoDocumentoService;
  formularioDocumentacion: FormGroup;
  idArchivoDoc: number;
  otro: boolean = true;
  private habilitarBotonAgregar: boolean = true;
  private nombreArchivo: String = '';
  private opcionesCatTipoDocumento: Array<ItemSelects> = [];
  //private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  //private alertas: Array<Object> = [];

  /*constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal,
              private _spinnerService: SpinnerService) {
    this.dialog = dialog;
    this.context = <AgregarDocumentoExpedienteData>modelContentData;
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.prepareServices();

    this.formularioDocumentacion = new ControlGroup({
      otroTipoDocumento: new Control(''),
      idArchivo: new Control(''),
      idTipoDocumento: new Control('', Validators.required),
      idEstudiante: new Control(this.context.idEstudiante),
      auxiliar: new Control ('aux', Validators.required),
      valido: new Control (true)
    });
  }*/

  inicializarFormularioModal() {
    (<FormControl>this.formularioDocumentacion.controls['otroTipoDocumento']).setValue('');
    (<FormControl>this.formularioDocumentacion.controls['idArchivo']).setValue('');
    (<FormControl>this.formularioDocumentacion.controls['idTipoDocumento']).setValue('');
    (<FormControl>this.formularioDocumentacion.controls['auxiliar']).setValue('aux');
    (<FormControl>this.formularioDocumentacion.controls['idEstudiante']).
      setValue(this.idEstudiante ? this.idEstudiante : this.idEstudianteMovilidad);
  }
  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        if (this.esPdf(responseJson.originalName)) {
          let idArchivo = responseJson.id;
          let jsonArchivo = '{"Documento a subir": ' + responseJson.id + '}';
          this.idArchivoDoc = responseJson.id;
          if (this.idArchivoDoc) {
            this.habilitarBotonAgregar = false;
          }
          this.nombreArchivo = responseJson.originalName;
          this.formularioDocumentacion.value.idArchivo = idArchivo;
          (<FormControl>this.formularioDocumentacion.controls['idArchivo'])
              .setValue(idArchivo);
        } else {
          this.addErrorsMesaje('El archivo debe de ser en pdf', 'danger');
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
    this.modalAgregar.close();
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
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formularioDocumentacion.value, null, 2);
      this._spinner.start('enviarFormulario');
      this.documentosService.postDocumento(
          jsonFormulario,
          this.erroresGuardado
      ).subscribe(
          response => {},
          error => {
            this._spinner.stop('enviarFormulario');
            this.addErrorsMesaje('No se pudo agregar el documento', 'danger');
          }, () => {
            this._spinner.stop('enviarFormulario');
            this.cerrarModal();
            this.recuperarDocumentosGenerales();
            this.addErrorsMesaje(
                'Se agregó exitosamente el documento ',
                'success');
          }
      );
    }
  }

  /*cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }*/

  /*addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }*/
  habilitarOtro(id: number): void {
    if (id == 35) {
      (<FormControl>this.formularioDocumentacion.controls['auxiliar']).setValue('');
      this.otro = false;
    } else {
      (<FormControl>this.formularioDocumentacion.controls['auxiliar']).setValue('aux');
      this.otro = true;
    }
  }

  cambiarAuxiliar(): void {
    (<FormControl>this.formularioDocumentacion.controls['auxiliar']).setValue(
        this.getControl('otroTipoDocumento').value
    );
  }

  private esPdf(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    nombreArchivoArray = nombreArchiov.split('.');
    if (nombreArchivoArray[nombreArchivoArray.length - 1] &&
        (nombreArchivoArray[nombreArchivoArray.length - 1].toLowerCase() === 'pdf')) {
      return true;
    } else {
      return false;
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioDocumentacion.controls[campo]).valid
        && this.validacionActiva) {
      return true;
    }
    return false;
  }
  private obtenerDocumentosConvocatoria(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = '';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.opcionesCatTipoDocumento =
        this.catTipoDocumentosService.
        getSelectTipoDocumentoCriterio(
            this.erroresConsultas,
            urlParameter
        );
  }

  private eliminarArchivo(id: number): void {
    if (id) {
      this._catalogoService.getArchivos().deleteArchivo(
          id,
          this.erroresGuardado
      );
    }
  }

  private prepareServicesModal(): void {
    this.obtenerDocumentosConvocatoria();
  }

}
