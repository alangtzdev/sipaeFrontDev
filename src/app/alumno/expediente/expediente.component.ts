import {Component, OnInit, Injector, Renderer, NgZone, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {Usuarios} from '../../services/usuario/usuario.model';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {SolicitudServicioSocial} from '../../services/entidades/solicitud-servicio-social.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {EstudianteService} from '../../services/entidades/estudiante.service';
import {ServicioSocialService} from '../../services/entidades/servicio-social.service';
import {SolicitudServicioSocialService} from '../../services/entidades/solicitud-servicio-social.service';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {EvaluacionDocenteService} from '../../services/entidades/evaluacion-docente.service';
import * as moment from 'moment/moment';
import {AuthService} from '../../auth/auth.service';
import {URLSearchParams} from '@angular/http';
import {ConfigService} from '../../services/core/config.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {UsuarioServices} from '../../services/usuario/usuario.service';
import {FormControl, FormGroup} from '@angular/forms';
import {ItemSelects} from '../../services/core/item-select.model';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {EstudianteBaja} from '../../services/entidades/estudiante-baja.model';

@Component({
  selector: 'app-expediente',
  templateUrl: './expediente.component.html',
  styleUrls: ['./expediente.component.css']
})
export class ExpedienteComponent implements OnInit {

  router: Router;
  usuarioLogueado: UsuarioSesion;
  usuarioActual: Usuarios;
  estudianteActula: Estudiante; /* renombrar estas referencias
 por favor estudianteActula -> estudianteActual*/
  solicitudesServicioSocial: Array<SolicitudServicioSocial> = [];
  estatusSolicitudesServicio: any;
  solicitudesVerificadas: boolean = false;

  accesoEvaluacionDocente: boolean;
  idUsuarioObjetivo: number = 0;
  imagenPerfil: string;
  vistaARegresar = 'Expediente';

  private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(route: ActivatedRoute, _router: Router, private _usuarioService: UsuarioServices,
              private _estudianteService: EstudianteService,
              public _servicioSocialService: ServicioSocialService,
              public _solicitudServicioSocialService: SolicitudServicioSocialService,
              private _estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService,
              private _evaluacionDocenteService: EvaluacionDocenteService,
              private injector: Injector, private _renderer: Renderer,
              private authservice: AuthService, private _catalogoService: CatalogosServices) {

    this.usuarioLogueado = authservice.getUsuarioLogueado();
    route.params.subscribe(params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    moment.locale('es');
    this.router = _router;
    this.estatusSolicitudesServicio = {
      pendientes: 0,
      denegadas: 0,
      activas: 0,
      finalizadas: 0,
      validadas: 0,
      rechazadas: 0
    };
    this.accesoEvaluacionDocente = false;


    // para modal registrar baja
    this.prepareServicesModalBaja();
    this.formulario = new FormGroup({
      idEstudiante: new FormControl(this.idUsuarioObjetivo), // context.estudiante.id
      idArchivo: new FormControl(''),
      idTipoDocumento: new FormControl(''),
      observaciones: new FormControl(''),
      seteador: new FormControl('')
    });
    this.zone = new NgZone({ enableLongStackTrace: false});
  }

  ngOnInit() {
    if (!this.idUsuarioObjetivo) {
      this._usuarioService.getEntidadUsuario(this.usuarioLogueado.id,
        this.erroresGuardado).subscribe(
        response => {
          this.usuarioActual = new Usuarios(response.json());
          let urlParameter: URLSearchParams = new URLSearchParams();
          urlParameter.set('criterios', 'idUsuario~' + this.usuarioActual.id + ':IGUAL');
          this._estudianteService.getListaEstudianteOpcional(
            this.erroresConsultas,
            urlParameter
          ).subscribe(
            response => {
              let respuesta = response.json();
              respuesta.lista.forEach((item) => {
                this.estudianteActula = new Estudiante(item);
                this.puedeEvaluar();
              });
              this.consultarSolicitudesServicioSocial();
              if (this.estudianteActula && this.estudianteActula.usuario.foto.id) {
                this.imagenPerfil = ConfigService.getUrlBaseAPI() +
                  '/api/v1/imagenperfil/' +
                  this.estudianteActula.usuario.foto.id;
              }

            });
        }
      );
    } else {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idUsuario~' + this.idUsuarioObjetivo + ':IGUAL');
      this._estudianteService.getListaEstudianteOpcional(this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.estudianteActula = new Estudiante(item);
            this.puedeEvaluar();
          });
          this.consultarSolicitudesServicioSocial();
          if (this.estudianteActula && this.estudianteActula.usuario.foto.id) {
            this.imagenPerfil = ConfigService.getUrlBaseAPI() +
              '/api/v1/imagenperfil/' +
              this.estudianteActula.usuario.foto.id;
          }


        });
    }
  }

  bajaInstitucional(): void {
    if (this.estudianteActula.estatus.id === 1006) {
      this.modalBajaInstitucional();
    } else if (this.estudianteActula.estatus.id === 1105) {
      // Estatus baja
      this.modalDetalleBajaEstudiante();
    }
  }

   modalBajaInstitucional(): void {
     (<FormControl>this.formulario.controls['idArchivo']).setValue('');
     (<FormControl>this.formulario.controls['idTipoDocumento']).setValue('');
     (<FormControl>this.formulario.controls['observaciones']).setValue('');
     (<FormControl>this.formulario.controls['seteador']).setValue('');
     this.modalBaja.open('lg');
   }

   modalDetalleBajaEstudiante(): void {
     this.obtenerBaja();
     this.modalDetalleBaja.open('lg');
   }

  consultarPeriodoActual(): void {
    // if (this.estudianteActula) {
    // }
  }

  consultarSolicitudesServicioSocial(): void {
    if (this.estudianteActula) {
      this.solicitudesVerificadas = false;
      this.consultarPeriodoActual(); // para evaluación docente
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idEstudiante~' + this.estudianteActula.id + ':IGUAL';
      urlParameter.set('criterios', criterios);
      urlParameter.set('ordenamiento', 'id:DESC');

      this._solicitudServicioSocialService.getListaSolicitudServicioSocial(
        this.erroresConsultas, urlParameter, false)
        .subscribe(
          response => {
            let resultados = response.json();
            this.solicitudesServicioSocial = [];
            resultados.lista.forEach((item) => {
              let solicitud = new SolicitudServicioSocial(item);
              switch (solicitud.estatus.id) {
                case 1205:
                  this.estatusSolicitudesServicio.pendientes++;
                  break;
                case 1206:
                  this.estatusSolicitudesServicio.denegadas++;
                  break;
                case 1207:
                  this.estatusSolicitudesServicio.activas++;
                  break;
                case 1208:
                  this.estatusSolicitudesServicio.finalizadas++;
                  break;
                case 1209:
                  this.estatusSolicitudesServicio.validadas++;
                  break;
                case 1210:
                  this.estatusSolicitudesServicio.rechazadas++;
                  break;
                default:
                  break;
              }
              this.solicitudesServicioSocial.push(solicitud);
            });
            this.solicitudesVerificadas = true;
          },
          error => {
          },
          () => {
            this.solicitudesVerificadas = true;
          }
        );
    }
  }

  detalleServicioSocial(): void {
    if (this.estudianteActula && this.solicitudesVerificadas) {
      if (this.estatusSolicitudesServicio.pendientes > 0
        || this.estatusSolicitudesServicio.denegadas > 0
      ) {
        this.router.navigate(['Alumno', 'SolicitudRechazada']);

      }
      if (this.estatusSolicitudesServicio.validadas > 0
        || this.estatusSolicitudesServicio.activas > 0
        || this.estatusSolicitudesServicio.rechazadas > 0
        || this.estatusSolicitudesServicio.finalizadas > 0) {
        this.router.navigate(['Alumno', 'SolicitudInformacion']);

      }
      if (this.estatusSolicitudesServicio.pendientes == 0 &&
        this.estatusSolicitudesServicio.denegadas == 0 &&
        this.estatusSolicitudesServicio.activas == 0 &&
        this.estatusSolicitudesServicio.validadas == 0 &&
        this.estatusSolicitudesServicio.rechazadas == 0 &&
        this.estatusSolicitudesServicio.finalizadas == 0
      ) {
        this.router.navigate(['Alumno', 'SolicitudRechazada']);
      }
    } else {
      this.reportarErrorEstudiante();
    }
  }
  reportarErrorEstudiante(): void {
    this.erroresConsultas = [];
    this.erroresConsultas.push(
      new ErrorCatalogo(
        'danger', true, 500,
        'Ocurrió un error al intentar consultar información del estudiante', ''));
  }

  estudianteTienePorcentajeCreditos(): boolean {
    /**agregar lógica para verificar el 70% de créditos */
    return true;
  }

  desabilitadoServicioSocial(): boolean {
    let bloqueado = !this.estudianteTienePorcentajeCreditos();
    if (this.estudianteActula && !bloqueado) {
      bloqueado = false;
    }
    if (this.estudianteActula) {
      if (this.estudianteActula.promocion.programaDocente.
          nivelEstudios.descripcion != 'Licenciatura') {
        bloqueado = true;
      }
    }

    return bloqueado;
  }

  detallePagos(): void {
    this.router.navigate(['alumno', 'pagos',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleInducion(): void {
    this.router.navigate(['Induccion', 'Academica']);
  }

  detalleHistorialAcademico(): void {
    this.router.navigate(['alumno', 'historial-academico',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleTramites(): void {
    this.router.navigate(['Alumno', 'ExpedienteTramites']);
  }

  detalleCargaAcademica(): void {
    this.router.navigate(['alumno', 'materias',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleIdiomas(): void {
    this.router.navigate(['alumno', 'idioma-acreditado',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleInterprogramas(): void {
    this.router.navigate(['movilidad', 'movilidad-interprogramas',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleEvaluacionDocente(): void {
    this.router.navigate(['Alumno', 'EvaluacionProfesores',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleMovilidad(): void {
    this.router.navigate(['movilidad', 'agregar-solicitud',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleNoAdeudos(): void {
    this.router.navigate(['alumno', 'solicitud-carta-no-adeudo',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleDocumentos(): void {
    this.router.navigate(['alumno', 'documentos-estudiante',
      {usuarioObjetivo: this.idUsuarioObjetivo}]);
  }

  detalleSolicitud(): void {
    this.router.navigate(['aspirante', 'detalles',
      {id: this.estudianteActula.id, vistaSolicitante: false,
        vistaAnterior: this.vistaARegresar}]);
  }

  editarSolicitud(): void {
    this.router.navigate(['Registro',
      {id: this.estudianteActula.id,
        edicionDocencia: true}]);
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }
  puedeEvaluar(): void {

    let fechaInicioCurso =
      moment(this.estudianteActula.periodoActual.inicioCurso).day('Monday'); // Number

    let fechaInicioEvaluacion = fechaInicioCurso.add(14, 'weeks');

    let valido = true;
    let fechaActual = moment();
    if (fechaActual.format('DD/MM/YYYY') >= fechaInicioEvaluacion.format('DD/MM/YYYY')) {
      if (this.estudianteActula.periodoActual.finalizacionEvaluacionProfesor) {
        let fechaFinEvaluacion =
          moment(this.estudianteActula.periodoActual.finalizacionEvaluacionProfesor);
        if (fechaActual.format('DD/MM/YYYY') <= fechaFinEvaluacion.format('DD/MM/YYYY')) {
          valido = false;
        }
      }
      if (valido) {
        let urlParameter: URLSearchParams = new URLSearchParams();
        let criterioIdEstudiante = 'idEstudiante~' + this.estudianteActula.id + ':IGUAL';
        urlParameter.set('criterios', criterioIdEstudiante);
        urlParameter.set('ordenamiento', 'id:DESC');
        this._estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
          this.erroresConsultas,
          urlParameter
        ).subscribe(
          response => {
            let paginacionInfoJson = response.json();
            let paginasArray: Array<number> = [];

            paginacionInfoJson.lista.forEach((item) => {
              urlParameter = new URLSearchParams();
              let criterioEvaluacion =
                'idEstudianteMateriaImpartida~' + item.id + ':IGUAL';
              urlParameter.set('criterios', criterioEvaluacion);
              urlParameter.set('ordenamiento', 'id:DESC');
              this._evaluacionDocenteService.getListaEvaluacionDocente(
                this.erroresConsultas,
                urlParameter
              ).subscribe(
                response => {
                  let responseEvaluacion = response.json();
                  if (responseEvaluacion.registrosTotales === 0) {
                    this.accesoEvaluacionDocente = true;
                  }
                }, error => {
                  console.error(error);
                },
                () => {
                }
              );
            });
          },
          error => {
            console.error(error);
          },
          () => {
          }

        );
      }
    }
  }

  // ////////////////////////////// MODAL BAJA //////////////////////////////////////
  @ViewChild('modalBaja') modalBaja: ModalComponent;
  formulario: FormGroup;
  mensajeErrors: any = { 'required': 'Este campo es requerido' };
  validacionActiva: boolean = false;
  validacionUsuario: boolean = false;
  private registros: Array<DatosBaja> = [];
  private registroSeleccionado: DatosBaja;
  // tipoDocumentoService;
  // estudianteService;
  usuarioService;
  archivoService;
  bajaService;
  listaDocumentos: Array<ItemSelects> = [];
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
  documentoSeleccionado: number = 0;


  // private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresConsulta: Array<ErrorCatalogo> = [];

  eliminarDocumento(): void {
    if (this.registroSeleccionado) {
      this.archivoService.deleteArchivo(
          this.registroSeleccionado.idArchivo,
          this.erroresGuardado
      ).subscribe(
          response => {
            let auxiliar: Array<DatosBaja> = [];
            for (let i = 0; i < this.registros.length; i++) {
              if (this.registroSeleccionado.idArchivo !== this.registros[i].idArchivo) {
                auxiliar.push(this.registros[i]);
              }
            }
            this.registros = auxiliar;
            this.registroSeleccionado = null;
          });
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

  seleccionarTipoDocumento(valor: number): void {
    valor ? this.documentoSeleccionado = valor : this.documentoSeleccionado = 0;
  }

  resetearValores(): void {
    // console.log('registros ', this.registros);
    this.documentoSeleccionado = 0;
    (<FormControl>this.formulario.controls['seteador']).setValue('');
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.registros.push(
            new DatosBaja(
                responseJson.id,
                responseJson.originalName,
                this.documentoSeleccionado
            )
        );
        this.resetearValores();
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
    this.modalBaja.close();
    // this.dialog.close();
  }

  cancelarModal(): void {
    // TODO
    this.registros.forEach((item) => {
      this.archivoService.deleteArchivo(
          item.idArchivo,
          this.erroresGuardado
      ).subscribe(
          response => {
            // console.log('Eliminando...');
          }
      );

    });
    this.modalBaja.close();
    // this.dialog.close();
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario(): void {
    event.preventDefault();
    if (this.validarFormulario()) {
      // codigo para enviar el formulario
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
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

  // debug del formulario no usar para produccion
  get cgValue(): string {
    return JSON.stringify(this.formulario.value, null, 2);
  }

  modalConfirmarBaja(): void {
    this.modalConfirmaBaja.open('sm');
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalConfirmarBajaData(this, 3) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
        <any>ModalConfirmarBaja,
        bindings,
        modalConfig
    );*/
  }

  registrarBaja(): void {
    let json = '{"idEstatus": "1105"}';
    let jsonUsuario = '{"enabled": false}';
    this._estudianteService.putEstudiante(
        this.estudianteActula.id,
        json,
        this.erroresGuardado
    ).subscribe(
        response => {
          // console.log('Actualizacion a Estudiante');
          this.usuarioService.putUsuario(
              this.estudianteActula.usuario.id,
              jsonUsuario,
              this.erroresGuardado
          ).subscribe(
              response => {
                // console.log('Actualizacion a Usuario');
              },
              error => {
                console.error(error);
              },
              () => {
              }
          );
          // console.log(jsonUsuario);
        },
        error => {
          console.error(error);
        },
        () => {
          this.registrarEstudianteBaja();
        }
    );
  }

  registrarEstudianteBaja(): void {
    // TODO
    let jsonBase = '{ "idEstudiante":"' + this.estudianteActula.id /*context.estudiante.id*/ + '",'
        + ' "observaciones":"' + this.getControl('observaciones').value + '"';
    if (this.registros.length > 0) {
      this.registros.forEach((registro) => {
        let jsonIterable = jsonBase + ',"idArchivo":"' + registro.idArchivo + '",'
            + ' "idTipoDocumento":"' + registro.tipoDocumento + '" }';
         // console.log(jsonIterable);
        this.bajaService.postEstudianteBaja(
            jsonIterable,
            this.erroresGuardado
        ).subscribe(
            response => {
              // console.log('Dado de baja!', response.json());
            },
            error => {
              console.error(error);
            }
        );
      });
    } else {
      let jsonUnico = jsonBase + '}';
      // console.log(jsonUnico);
      this.bajaService.postEstudianteBaja(
          jsonUnico,
          this.erroresGuardado
      ).subscribe(
          response => {
            // console.log('Dado de baja!', response.json());
          },
          error => {
            console.error(error);
          }
      );
    }
    this.ngOnInit();
    this.cerrarModal();
  }

  private prepareServicesModalBaja(): void {
    this.tipoDocumentoService = this._catalogoService.getTipoDocumento();
    this.archivoService = this._catalogoService.getArchivos();
    this.bajaService = this._catalogoService.getEstudianteBajaService();
    this.usuarioService = this._catalogoService.getUsuarioService();
    this.listaDocumentos = this.tipoDocumentoService.getSelectTipoDocumentoCriterio(
        this.erroresConsulta
    );
  }

  /////////////////////////////// MODAL CONFIRMA BAJA /////////////////////////////////////
  @ViewChild('modalConfirmaBaja') modalConfirmaBaja: ModalComponent;
  cerrarModalConfirmaBaja(): void {
    this.modalConfirmaBaja.close();
  }

  aceptarBaja(): void {
    this.cerrarModalConfirmaBaja();
    this.registrarBaja();
    this.ngOnInit();
  }

  ///////////////////////////// MODAL DETALLES BAJA //////////////////////////////////////
  @ViewChild('modalDetalleBaja') modalDetalleBaja: ModalComponent;
  entidadBajaEstudiante: EstudianteBaja;
  tipoDocumentoService;
  // usuarioService;
  // archivoService;
  // bajaService;
  registrosDetalleBaja: Array<EstudianteBaja> = [];
  // estudiante: Estudiante;
  registroSeleccionadoDetalleBaja: EstudianteBaja;
  // private erroresConsultas: Array<ErrorCatalogo> = [];

  /*constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal,
              private injector: Injector, private _renderer: Renderer,
              private modal: Modal, private _catalogoService: CatalogosServices) {
    this.dialog = dialog;
    this.context = <DetalleBajaEstudianteData>modelContentData;
    this.estudiante = this.context.estudiante;
    this.prepareServices();
    this.obtenerBaja();

  }*/

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.archivoService.generarTicket(
          jsonArchivo,
          this.erroresConsultas
      ).subscribe(
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
          },
          () => {
            console.info('OK');
          }
      );
    }
  }

  descargarArchivo(id: number): void {

    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.archivoService.generarTicket(
          jsonArchivo,
          this.erroresConsultas
      ).subscribe(
          data => {
            let json = data.json();
            let url =
                ConfigService.getUrlBaseAPI() +
                '/api/v1/archivodescargar/' +
                id +
                '?ticket=' +
                json.ticket;
            window.open(url);
          },
          error => {
            // console.log('Error downloading the file.');
          },
          () => {
            console.info('OK');
          }
      );
    }

  }

  cerrarModalDetalleBaja(): void {
    this.modalDetalleBaja.close();
  }


  rowSeleccionadoModalDetalleBaja(registro): boolean {
    return (this.registroSeleccionadoDetalleBaja === registro);
  }

  rowSeleccionModalDetalleBaja(registro): void {
    if (this.registroSeleccionadoDetalleBaja !== registro) {
      this.registroSeleccionadoDetalleBaja = registro;
    } else {
      this.registroSeleccionadoDetalleBaja = null;
    }
  }

  private obtenerBaja(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.estudianteActula.id + ':IGUAL');
    // console.log(this.bajaService);
    this.bajaService.getListaEstudianteBajaOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          response.json().lista.forEach((elemento) => {
            this.entidadBajaEstudiante
                = new EstudianteBaja(elemento);
            this.registrosDetalleBaja.push(new EstudianteBaja(elemento));
          });
        },
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
            console.error(this.erroresConsultas);
          }*/
        },
        () => {
          /*if (assertionsEnabled()) {
          }*/
        }
    );
  }

  /*private prepareServicesModalDetalleBaja(): void {
    //this.bajaService = this._catalogoService.getEstudianteBajaService();
    //this.usuarioService = this._catalogoService.getUsuarioService();
    //this.archivoService = this._catalogoService.getArchivos();
  }*/

}

class DatosBaja {
  idArchivo: number;
  nombreArchivo: string;
  tipoDocumento: number;
  constructor(file: number, name: string, tipo: number) {
    this.idArchivo = file;
    this.nombreArchivo = name;
    this.tipoDocumento = tipo;
  }
}
