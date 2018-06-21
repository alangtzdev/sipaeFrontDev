import {Component, OnInit, Input} from "@angular/core";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {EstudianteMovilidadExterna} from "../../services/entidades/estudiante-movilidad-externa.model";
import {SolicitudServicioSocial} from "../../services/entidades/solicitud-servicio-social.model";
import {EstudianteService} from "../../services/entidades/estudiante.service";
import {EstudianteMovilidadExternaService} from "../../services/entidades/estudiante-movilidad-externa.service";
import {ServicioSocialService} from "../../services/entidades/servicio-social.service";
import {SolicitudServicioSocialService} from "../../services/entidades/solicitud-servicio-social.service";
import {EstudianteMateriaImpartidaService} from "../../services/entidades/estudiante-materia-impartida.service";
import {EvaluacionDocenteService} from "../../services/entidades/evaluacion-docente.service";
import {Router} from "@angular/router";
import * as moment from "moment";
import {AuthService} from "../../auth/auth.service";
import {URLSearchParams} from "@angular/http";
import {ConfigService} from "../../services/core/config.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Usuarios} from "../../services/usuario/usuario.model";
import {UsuarioServices} from "../../services/usuario/usuario.service";
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';

@Component({
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {

  @Input('usuarioLogueado') usuarioLogueado: UsuarioSesion;
  router: Router;
  estudianteActula: Estudiante;
  estudianteMovilidadActual: EstudianteMovilidadExterna;
  usuarioActual: Usuarios;

  solicitudesServicioSocial: Array<SolicitudServicioSocial> = [];
  estatusSolicitudesServicio: any;
  solicitudesVerificadas: boolean = false;

  accesoEvaluacionDocente: boolean;
  imagenPerfil: string;

  private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresGuardadoTipoModel: Array<ErrorCatalogo> = [];
  private erroresConsultas;

  constructor(_router: Router, private _usuarioService: UsuarioServices,
              private _estudianteService: EstudianteService,
              private _estudianteMovilidad: EstudianteMovilidadExternaService,
              public _servicioSocialService: ServicioSocialService,
              public _solicitudServicioSocialService: SolicitudServicioSocialService,
              private _estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService,
              private _evaluacionDocenteService: EvaluacionDocenteService,
              private authService : AuthService, private spinner: SpinnerService) {
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
    //console.log('constructor');
    this.accesoEvaluacionDocente = false;
    this.usuarioLogueado = this.authService.getUsuarioLogueado(); //Seguridad.getUsuarioLogueado();
    //console.log('this.hasRol(ESTUDIANTE)', this.hasRol('ESTUDIANTE'));
    //console.log('this.hasRol(MOVILIDAD) ', this.hasRol('MOVILIDAD'));
    this._usuarioService.getEntidadUsuario(this.usuarioLogueado.id,
      this.erroresGuardadoTipoModel).subscribe(
      response => {
        this.usuarioActual = new Usuarios(response.json());
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idUsuario~' + this.usuarioActual.id + ':IGUAL');

        this.usuarioActual.roles.forEach((rol) => {
          if (rol.id === 5) {
            //console.log('entro a Estudiante normal');
            this.consultarEstudiante(urlParameter);
          } else if (rol.id === 14) {
            //console.log('entro a Estudiante Movilida');
            this.consultarEstudianteMovilidad(urlParameter);
          }
        });

      }
    );
  }

  ngOnInit() {
  }

  consultarEstudiante(urlParameter: URLSearchParams): void {
    this.spinner.start('obtenerEstudiante');
    this._estudianteService.getListaEstudianteOpcional(this.erroresGuardado,
      urlParameter)
      .subscribe(
        response => {
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.estudianteActula = new Estudiante(item);
            this.puedeEvaluar();
          });
          this.consultarSolicitudesServicioSocial();
          this.spinner.stop('obtenerEstudiante');
        }
        ,
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
        },
        () => {
          /*if (assertionsEnabled()) {
            //console.log(Seguridad.getUsuarioRoles());
          }*/
          if (this.estudianteActula && this.estudianteActula.usuario.foto.id) {
            this.imagenPerfil = ConfigService.getUrlBaseAPI() +
              '/api/v1/imagenperfil/' +
              this.estudianteActula.usuario.foto.id;
          }
        }
      );
  }

  consultarEstudianteMovilidad(urlParameter: URLSearchParams): void {
    this.spinner.start('obtenerEstudiante');
    this._estudianteMovilidad.getListaEstudianteMovilidadExterna(
      this.erroresGuardado,
      urlParameter
    ).subscribe(
      response => {
        let respuesta = response.json();
        respuesta.lista.forEach((item) => {
          this.estudianteMovilidadActual = new EstudianteMovilidadExterna(item);
          this.puedeEvaluarMovilidad();
        });
        this.spinner.stop('obtenerEstudiante');
        //this.consultarSolicitudesServicioSocial();
      }
      ,
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log(Seguridad.getUsuarioRoles());
          //console.log('movilidad', this.estudianteMovilidadActual);
        }*/
        if (this.estudianteMovilidadActual.usuario.foto.id) {
          this.imagenPerfil = ConfigService.getUrlBaseAPI() +
            '/api/v1/imagenperfil/' +
            this.estudianteMovilidadActual.usuario.foto.id;
        }
      }
    );
  }

  hasRol(rol: string): boolean {
    return this.authService.hasRol(rol);
  }

  //Opciones para el dashboard del Profesor
  detalleCalifiaciones(): void {
    this.router.navigate(['formacion-academica', 'calificaciones']);
  }

  detalleMateriasProfesor(): void {
    this.router.navigate(['materias', 'programa-materia']);
  }

  detalleEvaluacionProfesor(): void {
    this.router.navigate(['evaluacion-profesores', 'evaluacion-docente']);
  }


  //Opciones para el dashboar de Estudaiante

  detallePagos(): void {
    this.router.navigate(['alumno', 'pagos']);
  }

  detalleInducion(): void {
    this.router.navigate(['alumno', 'induccion-academica']);
  }

  detalleHistorialAcademico(): void {
    this.router.navigate(['alumno', 'historial-academico']);
  }

  detalleTramites(): void {
    this.router.navigate(['alumno', 'tramites']);
  }

  detalleCargaAcademica(): void {
    this.router.navigate(['alumno', 'materias']);
  }

  detalleIdiomas(): void {
    this.router.navigate(['alumno', 'idioma-acreditado']);
  }

  detalleInterprogramas(): void {
    this.router.navigate(['movilidad', 'movilidad-interprogramas']);
  }

  detalleEvaluacionDocente(): void {
    this.router.navigate(['alumno', 'evaluacion-docente']);
  }

  detalleMovilidad(): void {
    this.router.navigate(['movilidad', 'agregar-solicitud']);
  }

  detalleServicio(): void {
    this.router.navigate(['Alumno', 'SolicitudRechazada']);
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  consultarPeriodoActual(): void {
    if (this.estudianteActula) {
      //console.log('this.estudianteActula', this.estudianteActula);
    }
  }

  consultarSolicitudesServicioSocial(): void {
    if (this.estudianteActula) {
      this.spinner.start('serviciosSociales');
      this.solicitudesVerificadas = false;
      this.consultarPeriodoActual(); // para evaluación docente
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idEstudiante~' + this.estudianteActula.id + ':IGUAL';
      urlParameter.set('criterios', criterios);
      urlParameter.set('ordenamiento', 'id:DESC');

      this._solicitudServicioSocialService.getListaSolicitudServicioSocial(
        this.erroresConsultas,
        urlParameter,
        false
      ).subscribe(
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
          this.spinner.stop('serviciosSociales');
        },
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
        },
        () => {
          /*if (assertionsEnabled()) {
            //console.log('registros', this.solicitudesServicioSocial);
          }*/
          this.solicitudesVerificadas = true;
        }
      );
    }
  }

  detalleServicioSocial(): void {
    console.log('this.estudianteActula ', this.estudianteActula);
    console.log('this.estatusSolicitudesServicio ', this.estatusSolicitudesServicio);
    console.log('this.solicitudesVerificadas ', this.solicitudesVerificadas);
    if (this.estudianteActula && this.solicitudesVerificadas) {
      if (this.estatusSolicitudesServicio.pendientes > 0
        || this.estatusSolicitudesServicio.denegadas > 0
      ) {
        this.router.navigate(['alumno', 'solicitud-servicio-social']);

      }
      if (this.estatusSolicitudesServicio.validadas > 0
        || this.estatusSolicitudesServicio.activas > 0
        || this.estatusSolicitudesServicio.rechazadas > 0
        || this.estatusSolicitudesServicio.finalizadas > 0) {
        this.router.navigate(['alumno', 'informacion-servicio-social']);

      }
      if (this.estatusSolicitudesServicio.pendientes == 0 &&
        this.estatusSolicitudesServicio.denegadas == 0 &&
        this.estatusSolicitudesServicio.activas == 0 &&
        this.estatusSolicitudesServicio.validadas == 0 &&
        this.estatusSolicitudesServicio.rechazadas == 0 &&
        this.estatusSolicitudesServicio.finalizadas == 0
      ) {
        this.router.navigate(['alumno', 'solicitud-servicio-social']);
      }
    } else {
      this.reportarErrorEstudiante();
    }
  }

  reportarErrorEstudiante(): void {
    this.erroresConsultas = [];
    this.erroresConsultas.push(new ErrorCatalogo(
      'danger',
      true,
      500,
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
        /*//console.log(this.estudianteActula.promocion.
         programaDocente.nivelEstudios.descripcion);*/
        bloqueado = true;
      }
    }

    return bloqueado;
  }

  puedeEvaluar(): void {
    // //console.log("obtenerListaDatosEstudiante",
    // this.estudianteActula.periodoActual.finalizacionEvaluacionProfesor);

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
                  /*if (assertionsEnabled()) {
                    console.error(error);
                  }*/
                },
                () => {
                  /*if (assertionsEnabled()) {
                    // //console.log({ paginacionInfo: this.registros,
                    // lista: this.registros });
                  }*/
                }
              );
            });
          },
          error => {
            /*if (assertionsEnabled()) {
              console.error(error);
            }*/
          },
          () => {
            /*if (assertionsEnabled()) {
              // //console.log({ paginacionInfo: this.registros,
              // lista: this.registros });
            }*/
          }

        );
      }
    }
  }

  puedeEvaluarMovilidad(): void {
    // //console.log("obtenerListaDatosEstudiante",
    // this.estudianteActula.periodoActual.finalizacionEvaluacionProfesor);

    let fechaInicioCurso =
      moment(this.estudianteMovilidadActual.idPeriodoActual.inicioCurso).day('Monday'); // Number

    let fechaInicioEvaluacion = fechaInicioCurso.add(14, 'weeks');

    let valido = true;
    let fechaActual = moment();
    if (fechaActual.format('DD/MM/YYYY') >= fechaInicioEvaluacion.format('DD/MM/YYYY')) {
      if (this.estudianteMovilidadActual.idPeriodoActual.finalizacionEvaluacionProfesor) {
        let fechaFinEvaluacion =
          moment(this.estudianteMovilidadActual.idPeriodoActual.finalizacionEvaluacionProfesor);
        if (fechaActual.format('DD/MM/YYYY') <= fechaFinEvaluacion.format('DD/MM/YYYY')) {
          valido = false;
        }
      }
      if (valido) {
        let urlParameter: URLSearchParams = new URLSearchParams();
        let criterioIdEstudiante = 'idEstudianteMovilidadExterna~' +
          this.estudianteMovilidadActual.id + ':IGUAL';
        urlParameter.set('criterios', criterioIdEstudiante);
        urlParameter.set('ordenamiento', 'id:DESC');
        //console.log('criterioas', urlParameter);
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
                  /*if (assertionsEnabled()) {
                    console.error(error);
                  }*/
                },
                () => {
                  /*if (assertionsEnabled()) {
                    // //console.log({ paginacionInfo: this.registros,
                    // lista: this.registros });
                  }*/
                }
              );
            });
          },
          error => {
            /*if (assertionsEnabled()) {
              console.error(error);
            }*/
          },
          () => {
            /*if (assertionsEnabled()) {
              // //console.log({ paginacionInfo: this.registros,
              // lista: this.registros });
            }*/
          }

        );
      }
    }
  }

  //Dashboard Docencia

  buscarAlumnos(): void {
    this.router.navigate(['/expediente-alumno']);
  }

  estadisticas(): void {
    this.router.navigate(['/estadisticas']);
  }

  apoyos(): void {
    this.router.navigate(['/apoyo-economico']);
  }

  credencial(): void {
    this.router.navigate(['/inscripciones/credencial']);
  }

  servicioSocial(): void {
    this.router.navigate(['/servicio-social/solicitud']);
  }

  idomas(): void {
    this.router.navigate(['/idiomas/grupos-idiomas']);
  }

  docenciaConstancias(): void {
    this.router.navigate(['tramite-constancia/solicitud-constancia-estudio']);
  }

  emisionTitulos(): void {
    this.router.navigate(['titulacion', 'emision-titulos']);
  }

  boletas(): void {
    this.router.navigate(['/formacion-academica/boletas-calificacion']);
  }

  actas(): void {
    this.router.navigate(['/formacion-academica/actas-calificacion']);
  }

  gestionMaterias(): void {
    this.router.navigate(['reinscripcion', 'materia']);
  }

  movilidadDocencia(): void {
    this.router.navigate(['/movilidad-academica/movilidades-vigentes']);
  }

}
