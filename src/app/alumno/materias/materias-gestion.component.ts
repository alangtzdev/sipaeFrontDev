import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {AuthService} from '../../auth/auth.service';
import {URLSearchParams} from '@angular/http';
import {ConfigService} from '../../services/core/config.service';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {EstudianteGrupoIdioma} from '../../services/entidades/estudiante-grupo-idioma.model';
import {SolicitudExamenTrabajo} from '../../services/entidades/solicitud-examen-trabajo.model';
import {RecursoRevision} from '../../services/entidades/recurso-revision.model';
import {TemarioParticular} from '../../services/entidades/temario-particular.model';
import {PagoEstudiante} from '../../services/entidades/pago-estudiante.model';
import {PlanEstudio} from '../../services/entidades/plan-estudio.model';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {Usuarios} from '../../services/usuario/usuario.model';
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {Validacion} from '../../utils/Validacion';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';

@Component({
  selector: 'app-materias-gestion',
  templateUrl: './materias-gestion.component.html',
  styleUrls: ['./materias-gestion.component.css']
})
export class MateriasGestionComponent implements OnInit {

  @ViewChild('solicitudExamenRecuperacion')
  solicitudExamenRecuperacion: ModalComponent;
  @ViewChild('confirmarsolicitudExamenTrabajo')
  confirmarsolicitudExamenTrabajo: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  paginaActual: number = 1;
  limite: number = 10;
  idEstudiante: number = 2; // ESTUDIANTE DE PRUEBA
  semestreActual: number;
  periodoActual: string;
  sinAdeudos: boolean = false;
  unicaMateria: boolean = false;
  evaluacionesTermandas: boolean = false;
  registros: Array<EstudianteMateriaImpartida> = [];
  registrosIdiomas: Array<EstudianteGrupoIdioma> = [];
  registroSolicitudesExamenTrabajo: Array<SolicitudExamenTrabajo> = [];
  registroSolicitudesRecursoRevision: Array<RecursoRevision> = [];
  registrosTemariosParticularesMateria: Array<TemarioParticular> = [];
  registroPagoEstudiante: PagoEstudiante;

  // columnas para las tablas
  columnas: Array<any> = [
    { titulo: 'Clave', nombre: 'id' },
    { titulo: 'Materia', nombre: 'valor'},
    { titulo: 'Tipo de materia', nombre: 'valor'},
    { titulo: 'Profesor', nombre: 'idCatalogo'},
    { titulo: 'Calificación', nombre: 'activo'},
    { titulo: 'Créditos', nombre: 'activo'}
  ];
  columnasIdioma: Array<any> = [
    { titulo: 'Idioma', nombre: 'idIdioma' },
    { titulo: 'Periodo', nombre: 'periodo'},
    { titulo: 'Nivel', nombre: 'nivel'},
    { titulo: 'Calificación', nombre: 'calificacion'},
  ];

  registroSeleccionado: EstudianteMateriaImpartida;
  entidadEtudiante: Estudiante;
  entidadPlanEstudio: PlanEstudio;
  estudianteMateriaService;
  boletaService;

  exportarExcelUrl = '';
  exportarPDFUrl = '';
  exportarFormato = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'valor' }
  };

  // se declaran variables para consultas de base de datos
  estatusCatalogoService;
  estudianteCalificacionService;
  estudianteService;
  estudianteMovilidadService;
  planEstudioService;
  planEstudioMateriaService;
  solicitudTrabajoExamenService;
  recursoRevicionService;
  usuarioService;
  estudianteGrupoIdiomaService;
  pagoEstudianteService;
  evaluacionDocenteAlumnoService;
  estudianteTutorService;
  evaluacionDocenteService;
  materiaImpartidaTemarioParticularService;
  archivoSerivice;

  boletaExportable: boolean = true;
  idUsuarioObjetivo: number;
  permisoDocencia: boolean = false;
  tutor: string;
  tutorProfesor: Profesor;
  correoUsuario: string = '';

  private registrosEvaluacionDocente: Array<any> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private usuarioLogueado: UsuarioSesion;

  deshabilitarBotonRecurso: boolean = false;


  constructor(private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer,
              params: ActivatedRoute, private router: Router,
              public catalogosService: CatalogosServices,
              private _spinnerService: SpinnerService, private _archivoService: ArchivoService,
              private authservice: AuthService,
              private _correoService: EnvioCorreoElectronicoService,
              private _usuarioRolService: UsuarioRolService) {

    params.params.subscribe( params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    let auxiliar: number;
    if (this.idUsuarioObjetivo) {
      // console.log(this.idUsuarioObjetivo + ' ::::::::::::::::::::');
      this.permisoDocencia = true;
      auxiliar = this.idUsuarioObjetivo;
    } else {
      this.usuarioLogueado = authservice.getUsuarioLogueado();
      auxiliar = this.usuarioLogueado.id;
    }
    this.prepareServices();
    this.recuperarUsuarioActual(auxiliar);
    this.inicializarFormularioSolicitudExamenRecuparacion();

  }

  ngOnInit() {
  }

  // obtener el usuario actual
  recuperarUsuarioActual(id: number): void {
    this.usuarioService.getEntidadUsuario(
      id,
      this.erroresGuardado
    ).subscribe(
      response => {
        let usuarioActual: Usuarios = new Usuarios(response.json());
        this.correoUsuario = usuarioActual.email;
        usuarioActual.roles.forEach((rol) => {
          if (rol.id === 5) {
            this.obtenerEstudiante(usuarioActual.id);
          } else if (rol.id === 14) {
            this.obtenerEstudianteMovilida(usuarioActual.id);
          }
        });

      }
    );

  }

  obtenerEstudiante(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + id + ':IGUAL');
    this._spinnerService.start('obtenerEstudiante');
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let estudiante: Estudiante;
        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
          // console.log('entidadEstudiante', estudiante);
        });
        this.entidadEtudiante = estudiante;
        this.idEstudiante = estudiante.id;
        this.semestreActual = this.entidadEtudiante.numPeriodoActual;
        // console.log(this.idEstudiante);
        // console.log('condicion: ' + (!this.entidadEtudiante && !this.evaluacionesTermandas));
      }, 
      error => {
      }, 
      () => {
        if (this.entidadEtudiante) {
          if (this.entidadEtudiante.promocion.programaDocente.requierePago) {
            this.obtenerPagoEtudiante(this.idEstudiante,
              this.entidadEtudiante.periodoActual.id);
          } else {
            this.sinAdeudos = true;
            
            this.obtenerRegistroEvaluaciones(
              this.idEstudiante,
              this.entidadEtudiante.periodoActual.id
            );
          }
        }
        this._spinnerService.stop('obtenerEstudiante');
      }
    );
  }

  obtenerEstudianteMovilida(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + id + ':IGUAL');
    this._spinnerService.start('obtenerEstudianteMovilida');

    this.estudianteMovilidadService.getListaEstudianteMovilidadExterna(
      this.erroresGuardado,
      urlParameter
    ).subscribe(
      response => {
        let respuesta = response.json();
        let estudianteMovilidadActual: EstudianteMovilidadExterna;
        respuesta.lista.forEach((item) => {
          estudianteMovilidadActual = new EstudianteMovilidadExterna(item);
          this.idEstudiante = estudianteMovilidadActual.id;
          if (estudianteMovilidadActual.idPeriodoActual.id) {
            this.periodoActual = estudianteMovilidadActual.idPeriodoActual.getPeriodo();
          }
          // console.log('movilidad', estudianteMovilidadActual);
          // console.log('peridooActual', this.periodoActual);
        });
        if (this.idEstudiante && this.periodoActual) {
          // console.log('entro?: ' + this.idEstudiante && this.periodoActual);
          // this.obtenerPagoEtudiante(this.idEstudiante);
          this.obtenerRegistroEvaluaciones(
            this.idEstudiante,
            estudianteMovilidadActual.idPeriodoActual.id
          );
        } else if (this.entidadEtudiante) {
          this.obtenerRegistroEvaluaciones(
            this.idEstudiante,
            estudianteMovilidadActual.idPeriodoActual.id
          );
        }
      },
      error => {
      },
      () => {
        this._spinnerService.stop('obtenerEstudianteMovilida');
      }
    );
  }

  obtenerPagoEtudiante(idEstudiante: number, idPeriodoActual: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + idEstudiante + ':IGUAL,' +
      'idPeriodo~' + idPeriodoActual + ':IGUAL;AND');

    this._spinnerService.start('obtenerPagoEstudiante');

    this.pagoEstudianteService.getListaPagoEstudiantePaginador(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((pago) => {
          this.registroPagoEstudiante = new PagoEstudiante(pago);
        });
        if (this.registroPagoEstudiante) {
          //  2/05/2017 12:25 pm
          // se agrega un OR para el estatus 3 (Prorroga)
          // solicitud de COLSAN para caso especial
          if (this.registroPagoEstudiante.estatus.id === 1 ||
            this.registroPagoEstudiante.estatus.id === 1104 ||
            this.registroPagoEstudiante.estatus.id === 3) {
            this.sinAdeudos = true;
          }
        }
        // console.log('Pago: ' + this.sinAdeudos);
      },
      error => {
        
      },
      () => {
        // console.log('registroPagosEstudiante', this.registroPagoEstudiante);
        this.obtenerRegistroEvaluaciones(
          this.idEstudiante,
          this.entidadEtudiante.periodoActual.id
        );
        this._spinnerService.stop('obtenerPagoEstudiante');
      }
    );
  }

  obtenerRegistroEvaluaciones(idEstudiante: number, idPeriodo: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    if (this.entidadEtudiante) {
      urlParameter.set('criterios', 'idEstudiante~' +
        idEstudiante + ':IGUAL,' + 'idPeriodoEscolar~'
        + idPeriodo + ':IGUAL;AND');
    } else if (this.entidadEtudiante && this.periodoActual) {
      urlParameter.set('criterios', 'idEstudianteMovilidadExterna~' +
        idEstudiante + ':IGUAL,' + 'idPeriodoEscolar~'
        + idPeriodo + ':IGUAL;AND');
    }

    this._spinnerService.start('obtenerRegistroEvaluaciones');

    this.evaluacionDocenteAlumnoService.getListaEvaluacionDocenteAlumno(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let evaluacionFinalizada: boolean = false;
        let estudianteAbsuelto: boolean = false;
        response.json().lista.forEach(evaluacion => {
          evaluacionFinalizada = evaluacion.evaluaciones_finalizadas;
          estudianteAbsuelto = evaluacion.estudiante_absuelto;
        });
        // console.log('evaDoice' + evaluacionFinalizada);
        if (evaluacionFinalizada || estudianteAbsuelto) {
          this.evaluacionesTermandas = true;
        }
        this.definirColumnasSiCalificacionTabla();
      },
      error => {
        
      },
      () => {
        this.onCambiosTabla();
        if (this.entidadEtudiante) {
          this.onCambiosTablaIdioma();
          if (this.esPosgrado(this.entidadEtudiante)) {
            this.obtenerSolicitudRecursoRevision();
          } else {
            this.obtenerSolicitudesExamenTrabajoEstudiante();
          }
        }
        this._spinnerService.stop('obtenerRegistroEvaluaciones');
      }
    );

  }

  definirColumnasSiCalificacionTabla(): void {
    if ((!this.sinAdeudos || !this.evaluacionesTermandas) && this.entidadEtudiante) {
      this.columnasIdioma = [
        { titulo: 'Idioma', nombre: 'idIdioma' },
        { titulo: 'Periodo', nombre: 'periodo'},
        { titulo: 'Nivel', nombre: 'nivel'},
      ];
    }
  }

  onCambiosTablaIdioma(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.idEstudiante + ':IGUAL');
    this.estudianteGrupoIdiomaService.getListaEstudiantesGrupoIdioma(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((idioma) => {
          this.registrosIdiomas.push(new EstudianteGrupoIdioma(idioma));
        });
      },
      error => {
        // console.log(error);
      },
      () => {
        ////console.log('registrosIdioma', this.registrosIdiomas);
      }
    );
  }

  obtenerSolicitudesExamenTrabajoEstudiante(): void {
    this._spinnerService.start('obtenerSolicitudesExamenTrabajo');
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    // console.log('criterios: ' + criterios);
    urlSearch.set('criterios', criterios);

    this.solicitudTrabajoExamenService.getListaSolicitudExamenTrabajoOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        // console.log('Respuesta obtenerSolcitudes: ' + paginacionInfoJson.length);
        this.registroSolicitudesExamenTrabajo = [];

        paginacionInfoJson.lista.forEach((item) => {
          this.registroSolicitudesExamenTrabajo.push(new SolicitudExamenTrabajo(item));
          // console.log(item);
          ////console.log('consultar registro solicitudes examente: '
          //    + new SolicitudExamenTrabajo(item).calificacionOrdinaria);
        });
      },
      error => {
        console.error(error);
      },
      () => {
        this._spinnerService.stop('obtenerSolicitudesExamenTrabajo');
      }
    );
  }

  obtenerSolicitudRecursoRevision(): void {
    this._spinnerService.start('obtenerSolicitudRecursoRevision');
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    // console.log('criterios: ' + criterios);
    urlSearch.set('criterios', criterios);

    this.recursoRevicionService.getListaRecursoRevisionOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registroSolicitudesRecursoRevision = [];

        paginacionInfoJson.lista.forEach((item) => {
          this.registroSolicitudesRecursoRevision.push(new RecursoRevision(item));
          // console.log(item);
        });
      },
      error => {
        console.error(error);
      },
      () => {
        this._spinnerService.stop('obtenerSolicitudRecursoRevision');
      });

  }

  esLicenciatura(estudianteM): boolean {
    if (estudianteM.promocion.programaDocente.nivelEstudios.id === 1) {
      return true;
    } else {
      return false;
    }
  }

  esPosgrado(estudianteM): boolean {
    if (estudianteM.promocion.programaDocente.nivelEstudios.id === 2 ||
      estudianteM.promocion.programaDocente.nivelEstudios.id === 3) {
      return true;
    } else {
      return false;
    }
  }

  haySolicitudes(registroSolicitud): boolean {
    let hayRegistro: boolean = false;
    this.registroSolicitudesExamenTrabajo.forEach((solicitudExamen) => {
      if (solicitudExamen.profesorMateria.materiaImpartida && registroSolicitud.materiaImpartida.id ===
        solicitudExamen.profesorMateria.materiaImpartida.id) {
        hayRegistro = true;
      }
    });
    return hayRegistro;
  }

  haySolicitudesRecursoRevision(registroSolicitud): boolean {
    let hayRegistro: boolean = false;
    this.registroSolicitudesRecursoRevision.forEach((solicitudExamen) => {
      if (registroSolicitud.materiaImpartida.id ===
        solicitudExamen.materiaImpartida.id) {
        hayRegistro = true;
      }
    });
    return hayRegistro;
  }

  habilitarBotonRecursoExamen(): boolean {
    let habilitar: boolean = false;
    if (this.registroSeleccionado && this.entidadEtudiante) {
      if (this.esLicenciatura(this.entidadEtudiante) &&
        !this.haySolicitudes(this.registroSeleccionado) &&
        !this.registroSeleccionado.huboCalifIncompleta &&
        this.registroSeleccionado.calificacionOrdinaria ) {
        habilitar = true;
      }
    }
    return habilitar;
  }

  habilitarBotonRecursoRevision(): boolean {
    let habilitar: boolean = false;
    if (this.registroSeleccionado && this.entidadEtudiante) {
      if (this.esPosgrado(this.entidadEtudiante) &&
        !this.haySolicitudesRecursoRevision(this.registroSeleccionado) &&
        !this.registroSeleccionado.huboCalifIncompleta &&
        this.registroSeleccionado.calificacionOrdinaria) {
        habilitar = true;
      }
    }
    return habilitar;
  }

  habilitarBotonDescargarPrograma(): boolean {
    if (this.registroSeleccionado && this.entidadEtudiante) {
      if (this.registroSeleccionado.materiaImpartida.temarioParticular.id) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
/*
  modalSolicitudRecursoRevision(): void {
    if ( this.registroSeleccionado ) {
      let idEstudiante = this.entidadEtudiante.id;
      let idMateria = this.registroSeleccionado.materiaImpartida.materia.id;
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('lg', true, 27);

      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue:
          new ModalAlumnoSolicitarRecursoRevisionData(
            this, this.registroSeleccionado) }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalAlumnoSolicitarRecursoRevision,
        bindings,
        modalConfig
      );
    }
  }*/
  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios;
    let ordenamiento = 'idMateriaImpartida.idMateria.clave:ASC';
    if (this.entidadEtudiante) {
      criterios = 'idEstudiante~' + this.idEstudiante + ':IGUAL;AND,' +
        'idMateriaImpartida.idPeriodoEscolar.id~' +
        this.entidadEtudiante.periodoActual.id + ':IGUAL;AND';
    } else {
      criterios = 'idEstudianteMovilidadExterna~' + this.idEstudiante + ':IGUAL;AND';
    }
    urlSearch.set('criterios', criterios);
    urlSearch.set('ordenamiento', ordenamiento);

    this._spinnerService.start('obtenerEstudianteMateriaImpartida');

    this.estudianteMateriaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registros = [];
        this.registrosEvaluacionDocente = [];
        let estudianteMateriaImpartida: EstudianteMateriaImpartida;

        if (response.json().lista.length === 0) {
          /*26/09/2016
           * Se agrega validacion para no mostrar el boton de expedirBoleta
           * en caso de que no se muestre ninguna materia en la carga académica
           * */
          this.boletaExportable = false;
        } else if (response.json().lista.length === 1) {
          this.unicaMateria = true;
        }

        paginacionInfoJson.lista.forEach((item) => {
          if (!item.calificacion_revision) {
            if (!item.calificacion_ordinaria) {
              this.boletaExportable = false;
            }
          }
          estudianteMateriaImpartida = new EstudianteMateriaImpartida(item);
          this.registros.push(estudianteMateriaImpartida);
          if (item.id_materia_interprograma) {
            this.encontrarEvaluacionDocente(estudianteMateriaImpartida);
          } else {
            this.encontrarEvaluacionDocente(estudianteMateriaImpartida);
          }
        });
        urlSearch.set('criterios', 'idEstudiante.id~' + this.idEstudiante + ':IGUAL,' +
          'idTutor.idTipo.id~3:NOT;AND');
        urlSearch.set('ordenamiento', 'id:DESC');

        this._spinnerService.start('obtenerEstudianteTutor');

        this.estudianteTutorService.getListaEstudianteTutor(this.erroresConsultas, urlSearch).
        subscribe( response => {
            if (response.json().lista.length > 0) {
              this.tutorProfesor = new Profesor(response.json().lista[0].id_tutor.id_profesor);
              this.tutor = this.tutorProfesor.getNombreCompleto();
            }
          },
          error => {
          },
          () => {
            this._spinnerService.stop('obtenerEstudianteTutor');
            // console.log('tutor', this.tutor);
          }
        );

      },
      error => {
      },
      () => {
        this._spinnerService.stop('obtenerEstudianteMateriaImpartida');
        // console.log('registrosEvaluacionDocente', this.registrosEvaluacionDocente);
        // console.log('this.registros Materias', this.registros);
      }
    );
  }

  encontrarEvaluacionDocente(estudianteMateria: EstudianteMateriaImpartida): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idEstudianteMateriaImpartida~'
      + estudianteMateria.id + ':IGUAL');
    let materiaTutorial = estudianteMateria.materiaImpartida.materia.tipoMateria.id;
    this.evaluacionDocenteService.getListaEvaluacionDocente(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();

        if (response.json().lista.length === 0) {
          this.registrosEvaluacionDocente[estudianteMateria.id] = false;
        }
        paginacionInfoJson.lista.forEach((item) => {
          this.registrosEvaluacionDocente[estudianteMateria.id] = true;
        });
      },
      error  => {
        console.log(error);
      },
      () => {
        // console.log('registrosEvalacionDocente', this.registrosEvaluacionDocente);

        if (materiaTutorial === 3) {
          this.registrosEvaluacionDocente[estudianteMateria.id] = true;
        }
        this.verificarEvaluacionDocenteRequerida(estudianteMateria);
      }
    );
  }

  mostrarCamposEvaluados(idEstudianteMateriaImpartida: number): boolean {
    // console.log('idEstudaintemateria', idEstudianteMateriaImpartida);
    let estaEvaluada: boolean = false;
    if (this.evaluacionesTermandas) {
      estaEvaluada = true;
    } else {
      if (this.registrosEvaluacionDocente) {
        if (this.registrosEvaluacionDocente[idEstudianteMateriaImpartida]) {
          estaEvaluada = true;
        }
      }
    }

    return estaEvaluada;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      console.log('registroSeleccionado',this.registroSeleccionado);
      this.buscarTemariosParticularesMateria(this.registroSeleccionado.materiaImpartida);
    } else {
      this.registroSeleccionado = null;
    }
  }

  exportar(tipo): void {
    // console.log('entra::: ' + tipo);
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  descargarProgramaParticular(): void {
    if (this.registroSeleccionado.materiaImpartida.temarioParticular.archivoTemario) {
      let id = this.registroSeleccionado.materiaImpartida.temarioParticular.archivoTemario.id;
      if (this.registroSeleccionado.interprograma)
        id = this.registroSeleccionado.materiaInterprograma.temarioParticular.archivoTemario.id;
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      
      this._spinnerService.start('descargarProgramaParticular');

      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
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
            // console.info('OK');
            this._spinnerService.stop('descargarProgramaParticular');
          }
        );
    }
  }

  obtenerEmailUsuario(): string {
    return this.correoUsuario;
  }

  expedirBoleta(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio;
    if (this.entidadEtudiante) { // si es un estudinate
      criterio = 'idEstudiante.id~' + this.entidadEtudiante.id + ':IGUAL;AND,' +
        'idPeriodoEscolar.id~' +  this.entidadEtudiante.periodoActual.id + ':IGUAL';
      // console.log(criterio);
    } else { // si es un estudiante de movilidad
      criterio = 'idEstudianteMovilidad~' + this.idEstudiante + ':IGUAL';
      // console.log(criterio);
    }

    urlSearch.set('criterios', criterio);
    this.boletaService.getListaBoleta(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((boleta) => {
          this.boletaService.getBoleta(
            boleta.id,
            this.erroresConsultas
          ).subscribe(
            response => {
              let exportarBoleta = response.json().exportarPDF;
              window.open(exportarBoleta);
            }/*,
             error => {
             console.error(error);
             },
             () => {
             let json = '{"expedida": "true"}';
             this.boletaService.putBoleta(
             boleta.id,
             json,
             this.erroresGuardado
             ).subscribe(
             response => {
             //console.log('Expedida!!!');
             }
             );
             }*/
          );
        });

        /*//console.log(response.json());
         response.json().lista.forEach((boleta) => {
         let exportarBoleta = response.json().exportarPDF;
         let json = '{"expedida": "true"}';
         this.boletaService.putBoleta(
         boleta.id,
         json,
         this.erroresGuardado
         ).subscribe(
         response => {
         //console.log('Expedida!!!');
         },
         error => {
         console.error(error);
         },
         () => {
         window.open(exportarBoleta);
         }
         );
         });*/
      }
    );
  }

  exportarHorario(): void {
    this._spinnerService.start('exportarHorario');
    this.estudianteService.getFormatoPdf(
      this.idEstudiante,
      this.erroresConsultas, 'Horario'
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
        this._spinnerService.stop('exportarHorario');
      }
    );
  }

  verificarUnicaMateriaInter(): boolean {
    let esUnicaInterprograma: boolean = false;
    if (this.unicaMateria) {
      if (this.registros[0].materiaImpartida.materia.tipoMateria.id === 3) {
        esUnicaInterprograma = true;
      }
    }
    return esUnicaInterprograma;
  }

  buscarTemariosParticularesMateria(idMateriaImpartida: MateriaImpartida): void {
    if (!this.permisoDocencia) {
      this.registrosTemariosParticularesMateria = [];
      if (this.registroSeleccionado.materiaImpartida &&
        this.registroSeleccionado.materiaImpartida.materia.tipoMateria.id === 3) {
        this.consultaTemarioMateriaTutorial();
      } else {
        this.consultarTemarioMateriaBase();
      }
    }
  }

  consultaTemarioMateriaTutorial(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let idMateriaImpartida: number = this.registroSeleccionado.materiaImpartida.id;
    let idTutorEstudiante: number = this.registroSeleccionado.estudiante.tutor.profesor.id;
    urlSearch.set('criterios', 'idMateriaImpartida~' + idMateriaImpartida + ':IGUAL,' +
      'idProfesor~' + idTutorEstudiante + ':IGUAL');
    this.registrosTemariosParticularesMateria = [];
    this._spinnerService.start('consultaTemarioMateriaTutorial');
    this.materiaImpartidaTemarioParticularService.
    getListaTemarioParticularMateriaImpartida(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.registrosTemariosParticularesMateria.push(
            new TemarioParticular(item.id_temario_particular));
        });
      },
      error => {
        
      },
      () => {
        this._spinnerService.stop('consultaTemarioMateriaTutorial');
        // console.log('registoTemarios', this.registrosTemariosParticularesMateria);
      }
    );
  }

  consultarTemarioMateriaBase(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let idMateriaImpartida: number = this.registroSeleccionado.materiaImpartida.id;
    urlSearch.set('criterios', 'idMateriaImpartida~' + idMateriaImpartida + ':IGUAL');
    this.registrosTemariosParticularesMateria = [];
    this._spinnerService.start('consultarTemarioMateriaBase');
    this.materiaImpartidaTemarioParticularService.
    getListaTemarioParticularMateriaImpartida(
      this.erroresConsultas,
      urlSearch
    ).
    subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.registrosTemariosParticularesMateria.push(
            new TemarioParticular(item.id_temario_particular));
        });
      },
      error => {

      },
      () => {
        this._spinnerService.stop('consultarTemarioMateriaBase');
        // console.log('registoTemarios', this.registrosTemariosParticularesMateria);
      }
    );
  }

  verificarEvaluacionDocenteRequerida(estudianteMateria: EstudianteMateriaImpartida): void {
    if (this.materiaImpartidaEsOptativa(estudianteMateria.materiaImpartida) ||
      this.materiaImpartidaESLGAC(estudianteMateria.materiaImpartida)) {
      this.obtenerNumeorDeAlunosEnMateria(estudianteMateria);
    }
  }

  obtenerNumeorDeAlunosEnMateria(estudianteMateria: EstudianteMateriaImpartida) {
    let informacionResponse: any;
    let urlSearch: URLSearchParams = new URLSearchParams();

    urlSearch.set('criterios', 'idMateriaImpartida~' +
      estudianteMateria.materiaImpartida.id + ':IGUAL');

    if (estudianteMateria.materiaInterprograma && estudianteMateria.materiaInterprograma.id) {
      // console.log('criterio para interprograma');
      urlSearch.set('criterios', 'idMateriaInterprograma~' +
        estudianteMateria.materiaInterprograma.id + ':IGUAL');
    }
    // console.log('criteiropar ala busqueda de alumnos', urlSearch);
    this.estudianteMateriaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        informacionResponse = response.json();
      },
      error => {},
      () => {
        if (informacionResponse.registrosTotales < 3) {
          // console.log('No es necesario hacer la evaluacion', estudianteMateria.id);
          this.registrosEvaluacionDocente[estudianteMateria.id] = true;
          // console.log('registorEvaluacionDocente', this.registrosEvaluacionDocente);
        } else {
          // console.log('hacer evaluacion', estudianteMateria);
        }
      }
    );
  }

  descargarTemarioParticular(idArchivoTemario: number): void {
    let jsonArchivo = '{"idArchivo": ' +
      idArchivoTemario + '}';
    // console.log('jsonArchiov', jsonArchivo);
    this._spinnerService.start('descargarTemarioParticular');
    this.archivoSerivice.generarTicket(jsonArchivo, this.erroresConsultas)
      .subscribe(
        data => {
          let json = data.json();
          let url =
            ConfigService.getUrlBaseAPI() +
            '/api/v1/archivovisualizacion/' +
            idArchivoTemario +
            '?ticket=' +
            json.ticket;
          window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
        },
        error => {
          // console.log('Error downloading the file.');
        },
        () => {
          // console.info('OK');
          this._spinnerService.stop('descargarTemarioParticular');
        }
      );
  }

  evaluacionTermanadaMateriaSeleccionada(): boolean {
    if (this.materiaImpartidaEsOptativa(this.registroSeleccionado.materiaImpartida) ||
      this.materiaImpartidaESLGAC(this.registroSeleccionado.materiaImpartida) ||
      this.registroSeleccionado.materiaImpartida.materia.tipoMateria.id === 3) {
      return this.registrosEvaluacionDocente[this.registroSeleccionado.id];
    } else {
      return this.evaluacionesTermandas;
    }
  }

  mostrarCalificacionIdioma(calificacion: number): string {
    let calificacionRegreso: string;
    // console.log('calificacion: ', calificacion);

    switch (calificacion) {
      case 201:
        calificacionRegreso = 'Acreditado';
        break;
      case 202:
        calificacionRegreso = 'No acreditado';
        break;
      case 203:
        calificacionRegreso = 'N/A';
        break;
      default:
        calificacionRegreso = '' + calificacion;
        break;
    }

    return calificacionRegreso;
  }

  private materiaImpartidaEsOptativa(materiaImpartida: MateriaImpartida): boolean {
    let esOptativa: boolean = false;
    if (materiaImpartida && materiaImpartida.materia.tipoMateria.id === 2) {
      esOptativa = true;
    }
    return esOptativa;
  }

  private materiaImpartidaESLGAC(materiaImpartida: MateriaImpartida): boolean {
    let estLGAC: boolean = false;
    if (materiaImpartida && materiaImpartida.materia.tipoMateria.id === 1) {
      estLGAC = true;
    }
    return estLGAC;
  }

  private prepareServices(): void {
    this.estatusCatalogoService = this.catalogosService.getEstatusCatalogo();
    this.estudianteCalificacionService = this.catalogosService
      .getEstudianteCalificacionService();
    this.estudianteService = this.catalogosService.getEstudiante();
    this.planEstudioService = this.catalogosService.getPlanEstudios();
    this.planEstudioMateriaService = this.catalogosService.getPlanEstudiosMateria();
    this.estudianteMateriaService =
      this.catalogosService.getEstudianteMateriaImpartidaService();
    this.solicitudTrabajoExamenService =
      this.catalogosService.getSolicitudExamenTrabajoService();
    this.recursoRevicionService =
      this.catalogosService.getRecursoRevisionService();
    this.boletaService = this.catalogosService.getBoletaService();
    this.usuarioService = this.catalogosService.getUsuarioService();
    this.estudianteMovilidadService = this.catalogosService.getEstudianteMovilidadExterna();
    this.estudianteGrupoIdiomaService = this.catalogosService.getEstudianteGrupoIdiomaService();
    this.pagoEstudianteService = this.catalogosService.getPagoEstudiante();
    this.evaluacionDocenteAlumnoService =
      this.catalogosService.getEvaluacionDocenteAlumnoService();
    this.estudianteTutorService = this.catalogosService.getEstudianteTutorService();
    this.evaluacionDocenteService = this.catalogosService.getEvaluacionDocenteService();
    this.materiaImpartidaTemarioParticularService =
      this.catalogosService.getMateriaImpartidaTemarioParticularService();
    this.archivoSerivice = this.catalogosService.getArchivos();
  }

  /* -------------------------TODO INICIA modal de solicitud examen Recuparacion*/
  formularioSoliciudExamenRecuperacion: FormGroup;
  validacionActiva: boolean = false;
  listaProfesoresImpartiendoClase: Array<ProfesorMateria> = [];
  esRecusroRevision;

  idProfesor: number;
  estudianteMateriaImpartida: EstudianteMateriaImpartida;
  idMateriaImpartida: number;
  idMateria: number;
  correoProfesor: string;

  inicializarFormularioSolicitudExamenRecuparacion() {
    this.formularioSoliciudExamenRecuperacion = new FormGroup({
      descripcion: new FormControl('', Validators.compose([Validators.required,
        Validacion.parrafos])),
    });
  }

  modalSoliciudExamenRecuperacion(tipo) {
    this.deshabilitarBotonRecurso = false;

    if (tipo == 'licTrabajoRecuperacion') {
      // Es falso porque es el modal de trabajo de recuperación.
      this.esRecusroRevision = false;
      console.log(tipo);
    } else {
      console.log(tipo);
      this.esRecusroRevision = true;
    }
    this.inicializarFormularioSolicitudExamenRecuparacion();
    this.obtenerInformacionMateria();
    this.obtenerEstudianteMateria();
    /*TODO esRecusroRevision es falso debido q que es el modal de trabjo de recuperacion*/

    this.solicitudExamenRecuperacion.open('lg');
  }

  validarFormularioSoliciudExamenRecuperacion(): boolean {
    if (this.formularioSoliciudExamenRecuperacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  obtenerProfesor(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios =
      'idMateriaImpartida.id~' + this.idMateriaImpartida + ':IGUAL;AND,' +
      'titular~' + true + ':IGUAL;AND';
    urlSearch.set('criterios', criterios);

    this._spinnerService.start('obtenerPrrofesor');
    this.catalogosService.getProfesorMateriaService().
    getListaProfesorMateria(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        // console.log(response.json());
        this.listaProfesoresImpartiendoClase = [];

        paginacionInfoJson.lista.forEach((item) => {
          this.listaProfesoresImpartiendoClase.push(new ProfesorMateria(item));
        });
      },
      error => {

      },
      () => {
        if (this.listaProfesoresImpartiendoClase) {
          this.idProfesor = this.listaProfesoresImpartiendoClase[0].profesor.id;
          this.correoProfesor = this.listaProfesoresImpartiendoClase[0].profesor.usuario.email;
        }
        this._spinnerService.stop('obtenerPrrofesor');
      }
    );
  }

  obtenerEstudianteMateria(): void {
    this.estudianteMateriaImpartida = this.registroSeleccionado;
  }

  activarObtenerSolicitudes(): void {

    if (this.esPosgrado(this.entidadEtudiante)) {
      this.obtenerSolicitudRecursoRevision();
    } else {
      this.obtenerSolicitudesExamenTrabajoEstudiante();
    }
  }

  obtenerCorreoUsuario(): string {
    return this.obtenerEmailUsuario();
  }

  cerrarModalSolicitudExamenRecuparacion() {
    this.registroSeleccionado = null;
    this.solicitudExamenRecuperacion.close();
  }

  materiaElegidaEsTutorial(): boolean {
    let esTutorial: boolean = false;
    if (this.registroSeleccionado.materiaImpartida.materia.tipoMateria.id === 3) {
      esTutorial = true;
    }
    return esTutorial;
  }

  private obtenerInformacionMateria(): void {
    this.obtenerIdMateriaImpartida();
    this.obtenerIdMateria();
    this.obtenerIdProfesorDeLaMateria();
  }

  private obtenerIdMateria(): void {
    this.idMateria = this.registroSeleccionado.materiaImpartida.materia.id;
  }

  private obtenerIdMateriaImpartida(): void {
    this.idMateriaImpartida = this.registroSeleccionado.materiaImpartida.id;
  }

  private obtenerIdProfesorDeLaMateria(): void {
    /*TODO Para obtener el correo del coordinador se
    * actualizo EstudianteMateriaImpartida.php del back-end
    * anteriormente tenia un maxDepth(3) idEstudiante, se actualizo a maxDepth(4)
    * para poder obtener el correo del usuario profesor - tutor del estudiante
     */

    if (this.materiaElegidaEsTutorial()) {
      this.idProfesor = this.registroSeleccionado.estudiante.tutor.profesor.id;
      this.correoProfesor =
        this.registroSeleccionado.estudiante.tutor.profesor.usuario.email;
    } else {
      this.obtenerProfesor();
    }
  }

  private getControlSolicitudExamenRecuparacion(campo: string): FormControl {
    return (<FormControl>this.formularioSoliciudExamenRecuperacion.controls[campo]);
  }

  private getControlErrorsSolicitudExamenRecuparacion(campo: string): boolean {
    if (!(<FormControl>this.formularioSoliciudExamenRecuperacion.controls[campo]).valid && this.validacionActiva) {
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
    return resultado;
  }

  confirmarSolicitud() {
    this.inicializarFormularioRecursoRevision();
    this.confirmarsolicitudExamenTrabajo.open('sm');
  }

  /* TODO TERMINA modal de solicitud examen Recuparacion ------------------------*/


  /* ------------------------TODO INICIA modal de confirmar examen Recuparacion */

  formularioRecursoTrabajo: FormGroup;

  closeModalConfirmarRecusroTrabajo() {
    this.confirmarsolicitudExamenTrabajo.close();
  }
  inicializarFormularioRecursoRevision() {
    this.formularioRecursoTrabajo = new FormGroup({
      calificacionOriginal: new FormControl(''),
      descripcion: new FormControl(''),
      idEstatus: new FormControl(1223),
      idEstudiante: new FormControl(''),
      idProfesor: new FormControl(''),
      idMateria: new FormControl('')
    });
  }

  enviarFormularioRecursoTrabajo(): void {
    this.formularioRecursoTrabajo.value.calificacionOriginal =
      this.estudianteMateriaImpartida.calificacionOrdinaria;
    this.formularioRecursoTrabajo.value.idEstudiante = this.idEstudiante;
    this.formularioRecursoTrabajo.value.idProfesor = this.idProfesor;
    this.formularioRecursoTrabajo.value.idMateria = this.idMateriaImpartida;
    this.formularioRecursoTrabajo.value.descripcion = this.formularioSoliciudExamenRecuperacion.value.descripcion;

    let jsonFormulario = JSON.stringify(this.formularioRecursoTrabajo.value, null, 2);
    this.deshabilitarBotonRecurso = true;
    this._spinnerService.start('enviarFormularioRecursoRevision');
    if (this.esRecusroRevision) { // si es recuros revision

      this.recursoRevicionService.postRecursoRevision(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {
        },
        error => {
          console.error(error);
        },
        () => {
          this._spinnerService.stop('enviarFormularioRecursoRevision');
          this.enviarCorreos();
        }
      );


    } else { // si es examen o trabajo
      this.solicitudTrabajoExamenService.postSolicitudExamenTrabajo(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {
        },
        error => {
          console.error(error);
        },
        () => {
          this._spinnerService.stop('enviarFormularioRecursoRevision');
          this.enviarCorreos();
        }
      );
    }
  }

  enviarCorreoEstudiante(): void {
    // console.log('correo a estudiante');
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(this.correoUsuario),
      idPlantillaCorreo: new FormControl(24)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.sendEmailGeneral(jsonFormulario);
  }

  enviarCorreoCoordinador(correo: string): void {
    let idProfesorMateria;
    let materiaImpartida;
    let idEstudiante = this.idEstudiante;
    let comentarios = this.formularioSoliciudExamenRecuperacion.value.descripcion;
    let formularioCorreo: FormGroup;
    
    if(this.registroSeleccionado.interprograma) {
      materiaImpartida = this.registroSeleccionado.materiaInterprograma.id;
      idProfesorMateria = this.registroSeleccionado.materiaInterprograma.getIdProfesorTitular();
    } else {
      materiaImpartida = this.registroSeleccionado.materiaImpartida.id;
      idProfesorMateria = this.registroSeleccionado.materiaImpartida.getIdProfesorTitular();
    }

    if(!idProfesorMateria) { // la materia es de tipo tutorial
      idProfesorMateria = this.tutorProfesor.id;
    }

    formularioCorreo = new FormGroup({
      destinatario: new FormControl(correo),
      asunto: new FormControl('Solicitud de Trabajo recuperacion - Coordinador'),
      entidad: new FormControl({
        Estudiantes: idEstudiante, 
        Profesores: idProfesorMateria, 
        MateriaImpartida: materiaImpartida
      }),
      idPlantillaCorreo: new FormControl(35),
      comentarios: new FormControl(comentarios)
    });

    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.sendEmailGeneral(jsonFormulario);
  }

  enviarCorreoProfesor(): void {
    // console.log('correo a profesor');

    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(this.correoProfesor),
      asunto: new FormControl('Solicitud de Trabajo recuperacion'),
      idPlantillaCorreo : new FormControl(43),
      entidad: new FormControl({Estudiantes: this.idEstudiante})
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.sendEmailGeneral(jsonFormulario);

  }

  sendEmailGeneral(jsonFormulario) {
    this._spinnerService.start('sendEmailGeneral');
    this._correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {
        ////console.log(response.json());
        // this._spinner.stop();
      },
      error => {
        console.error(error);
      },
      () => {
        this._spinnerService.stop('sendEmailGeneral');
      }
    );
  }

  enviarCorreos(): void {
    this._spinnerService.start('enviarCorreos');
    let urlSearch: URLSearchParams = new URLSearchParams();
    if (this.estudianteMateriaImpartida.estudiante.id) {
      urlSearch.set('criterios', 'idRol~2:IGUAL,' + 'idUsuario.idProgramaDocente.id~'
        + this.estudianteMateriaImpartida.
          estudiante.promocion.programaDocente.id + ':IGUAL;AND');
    }
    this._usuarioRolService.getListaUsuarioRol(
      this.erroresGuardado,
      urlSearch
    ).subscribe(
      response => {
        let correoCoordinador;
        response.json().lista.forEach((usurioRol) => {
          correoCoordinador = usurioRol.id_usuario.email;
        });

        this.enviarCorreoCoordinador(correoCoordinador);
        this.enviarCorreoEstudiante();
        this.enviarCorreoProfesor();
      },
      error => {
        console.log(error);
      },
      () => {
        this._spinnerService.stop('enviarCorreos');
          this.cerrarModalSolicitudExamenRecuparacion();
          this.closeModalConfirmarRecusroTrabajo();
          this.activarObtenerSolicitudes();
      }
    );
  }

  /* TODO INICIA modal de confirmar examen Recuparacion ------------------------*/

}
