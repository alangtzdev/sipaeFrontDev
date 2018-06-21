import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Profesor} from '../../services/entidades/profesor.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {IntegranteNucleoAcademico} from '../../services/entidades/integrante-nucleo-academico.model';
import {ProgramaDocente} from '../../services/entidades/programa-docente.model';
import {EvaluacionCurricular} from '../../services/entidades/evaluacion-curricular.model';
import {EvaluacionAspirante} from '../../services/entidades/evaluacion-aspirante.model';
import {EvaluacionCurricularService} from '../../services/entidades/evaluacion-curricular.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {ProfesorService} from '../../services/entidades/profesor.service';
import {EvaluadorService} from '../../services/entidades/evaluador.service';
import {EvaluacionAspiranteService} from '../../services/entidades/evaluacion-aspirante.service';
import {Router} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {Validators, FormControl, FormGroup} from '@angular/forms';
import {Evaluador} from '../../services/entidades/evaluador.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {Validacion} from '../../utils/Validacion';
import {PagoEstudiante} from '../../services/entidades/pago-estudiante.model';
import {AspiranteLgac} from '../../services/entidades/aspirante-lgac.model';

@Component({
  selector: 'app-evaluacion-aspirante',
  templateUrl: './evaluacion-aspirante.component.html',
  styleUrls: ['./evaluacion-aspirante.component.css']
})
export class EvaluacionAspiranteComponent implements OnInit {
  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesSelectPromocion: Array<ItemSelects>;
  // SERVICES
  registros: Array<Estudiante> = [];
  erroresConsultas: Array<ErrorCatalogo> = [];
  limite: number = 10;
  maxSizePags: number = 5;
  paginaActual: number = 1;
  formulario: FormGroup;
  paginacion: PaginacionInfo;
  criteriosCabezera: string = '';
  registroSeleccionado: Estudiante;
  profesorLogueado: Profesor;
  evaluacion: boolean = false;
  curricular: boolean = false;
  botonBuscar: boolean = false;
  estatusCatalogoService;
  aspiranteLgacService;
  estudianteAuxiliar;
  usuarioCoordinador: boolean = false;
  usuarioLogueado: UsuarioSesion;
  rolUsuarioActual: UsuarioSesion;
  idUsuarioActual;
  idProfesor;
  listaRoles: Array<String> = [];  // Lista de roles del usuario logueado en
  // caso de que el coordinador sea tambien profesor
  usuarioRol: UsuarioRoles;  // Para
  registrosProfesor: Array<Profesor>;
  registrosComiteEvaluador: Array<IntegranteNucleoAcademico> = [];
  programasComites: Array<ProgramaDocente> = [];
  programasComitesNombre: Array<ProgramaDocente> = [];
  listaEvaluacionCurricular: Array<EvaluacionCurricular> = [];
  listaEvaluacionAspirante: Array<EvaluacionAspirante> = [];
  registrosAspiranteLgac: Array<AspiranteLgac> = [];
  registrosEvaluacionesCurriculares = [];
  registrosEvaluacionesAspirantes = [];
  // programas docente a los que pertenecen los comites a los que pertenece el profesor
  estadoBotonEvaluacionCurricular: boolean = false;
  estadoBotonEvaluacionAspirante: boolean = false;
  desahabilitarSelectorCoordiancion: boolean = false;
  estatusAspirante;
  usuarioLicenciatura: boolean = false;
  promedioSugerido: number = 0;
  promedioSugeridoEntrevista: number = 0;
  recuperarEntidadEvaluacionAspirante: EvaluacionAspirante;
  mostrarEntrevista: boolean = false;
  estudianteService;
  variablePromocion;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:  'idDatosPersonales.nombre,' +
    'idDatosPersonales.primerApellido,' +
    'idDatosPersonales.segundoApellido'}
  };
  columnas: Array<any> = [
    { titulo: 'Folio COLSAN', nombre: 'idFolioSolicitud', sort: false},
    { titulo: 'Nombre aspirante *', nombre: 'idDatosPersonales', sort: false},
    { titulo: 'Estatus', nombre: 'idEstatus.valor'}
  ];
  puntuacionDetalleCeneval;
  calificacionFinalDetalle;
  public _evaluacionCurricularService: EvaluacionCurricularService;
  private usuarioRolService: UsuarioRolService;
  private profesorService: ProfesorService;
  private _evaluador: EvaluadorService;
  private _integranteNAB;
  private _evaluacionAspiranteService: EvaluacionAspiranteService;
  private errores;
  private alertas: Array<Object> = [];
  private registrosEvaluacionAspirante: Array<EvaluacionAspirante> = [];
  private registrosEvaluacionCurricular: Array<EvaluacionAspirante> = [];
  // Constructor
  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private authService: AuthService,
              private _route: Router,
              public _catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              private router: Router
  ) {
    this.usuarioLogueado = authService.getUsuarioLogueado();
    this.prepareServices();

    if (AuthService.isLoggedIn()) {

      this._spinner.start('evaluacion1');
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';
      urlSearch.set('criterios', criterio);
      this.idUsuarioActual = this.usuarioLogueado.id;
      this.usuarioRolService.getListaUsuarioRol(
        this.errores,
        urlSearch
      ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.listaRoles.push(item);

          });
        },
        error => {
          console.error(error);
          this._spinner.stop('evaluacion1');
        },
        () => {
          /* 08/08/2016 Se actualiza metodo para recuperar usuario logueado.
           * Se limita vista a coordinador con roles de profesor-coordinador
           * */
          let tipoUsuarioRolProfesor: UsuarioRoles;
          let tipoUsuarioRolCoordinador: UsuarioRoles;
          let tipoUsuarioOtro: UsuarioRoles;
          this.listaRoles.forEach((item) => {
            let usuarioRol = new UsuarioRoles(item);
            if (usuarioRol.rol.id === 3) {
              tipoUsuarioRolProfesor = new UsuarioRoles(item);
            } else if (usuarioRol.rol.id === 2) {
              tipoUsuarioRolCoordinador = new UsuarioRoles(item);
              this.usuarioCoordinador = true;
            } else {
              tipoUsuarioOtro = new UsuarioRoles(item);

            }

          });
          if (tipoUsuarioRolCoordinador || (tipoUsuarioRolCoordinador && tipoUsuarioRolProfesor)) {
            this.usuarioRol = tipoUsuarioRolCoordinador;
          } else if (!tipoUsuarioRolCoordinador && tipoUsuarioRolProfesor) {
            this.usuarioRol = tipoUsuarioRolProfesor;
          } else {
            this.usuarioRol = tipoUsuarioOtro;
          }

          if (this.usuarioRol.rol.id === 2) {
            this.getProgramaDocente();
          } else if (this.usuarioRol.rol.id === 3) {
            this.obtenerProfesor();
          } else {
            this.getProgramaDocente();
          }
          this._spinner.stop('evaluacion1');
        }
      );
      this._spinner.stop('evaluacion1');
    }

    this.formulario = new FormGroup({
      idPromocion: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
    });

    this.formularioEvaCurri = new FormGroup({
      idEstudiante: new FormControl(''),
      dictamen: new FormControl(''),
      consideraciones: new FormControl(''),
      coordinador: new FormControl(''),
      idProfesor: new FormControl(''),
      calificacionEnsayo: new FormControl(''),
    });

    this.formularioEval = new FormGroup({
      consideraciones: new FormControl(''),
      prioridad: new FormControl(''),
      dictamen: new FormControl(''),
      coordinador: new FormControl(''),
      idEstudiante: new FormControl(''),
      idProfesor: new FormControl(''),
      auxiliarPrioridad: new FormControl(''),
    });

    this.formulario4 = new FormGroup({
      consideraciones: new FormControl('', Validators.
      compose([Validacion.parrafos])),
      coordinador: new FormControl(''),
      idEstudiante: new FormControl(''),
      idProfesor: new FormControl(''),
      calificacionEntrevista: new FormControl('', Validators.
      compose([Validators.required, Validacion.calificacionEvaluacionModB])),
      calificacionCeneval: new FormControl('0', Validators.
      compose([Validators.required, Validacion.numerosValidator])),
      entrevista: new FormControl(''),
      prioridad: new FormControl('0'),
      dictamen: new FormControl(true)

    });

    /*if (sessionStorage.getItem('evaluacionIdProgramaDocente')) {
      this.cambioProgramaDocenteFiltro(parseInt(sessionStorage.getItem('evaluacionIdProgramaDocente')));
      let programaDocente = 'idProgramaDocente';
      (<FormControl>this.formulario.controls[programaDocente]).
      setValue(parseInt(sessionStorage.getItem('evaluacionIdProgramaDocente')));
      this.cambioProgramaDocenteFiltro(parseInt(sessionStorage.getItem('evaluacionIdProgramaDocente')));
    }*/

    if (sessionStorage.getItem('evaluacionCriterios')) {
      this.onCambiosTabla();
    }
  }

  obtenerProfesor(): any {
    // Para saber si es profesor o coordinador 2 o 3 respectivamnete

    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idUsuario~' + this.idUsuarioActual + ':IGUAL';

    urlParameter.set('criterios', criterio);
    this.profesorService
      .getListaProfesor(
        this.erroresConsultas,
        urlParameter,
        false
      ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.profesorLogueado = new Profesor(item);
          let urlSearch: URLSearchParams = new URLSearchParams();
          let criterio = 'idProfesor~' + this.profesorLogueado.id + ':IGUAL';
          urlSearch.set('criterios', criterio);
          this._evaluador
            .getLsitaEvaluadorPag(
              this.erroresConsultas,
              urlSearch,
              false
            ).subscribe(
            response => {
              response.json().lista.forEach((item) => {
                this.registrosComiteEvaluador.push(item);

                let evaluador = new Evaluador(item);
                console.log('item', item);

                if (this.programasComites.length > 0) {
                  this.programasComites.forEach((itemPrograma) => {
                    console.log('item', item);
                    console.log('itemPrograma', itemPrograma);
                    if (item.id_comite_evaluador.id_programa_docente.id
                      !== itemPrograma.id) {
                      this.programasComites.push(
                        new ProgramaDocente(
                          new Evaluador(item).comiteEvaluador.programaDocente));
                    }
                  });
                } else {
                  this.programasComites.push(
                    new ProgramaDocente(
                      new Evaluador(item).comiteEvaluador.programaDocente));
                }


              });
              this.getProgramaDocente();

            }
          );

        });
        this.obtenerEvaluacionesCurriculares();
        this.obtenerEvaluacionesAspirantes();
      }
    );
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');

    this.opcionesSelectPromocion = this.estatusCatalogoService.getPromocion().
    getSelectPromocion(this.erroresConsultas, urlParameter);
    if (sessionStorage.getItem('evaluacionIdPromocion')) {
      let promocion = 'idPromocion';
      (<FormControl>this.formulario.controls[promocion]).
      setValue(sessionStorage.getItem('evaluacionIdPromocion'));

    }

  }
  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
    this.limpiarVariablesSession();
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idPromocion.idProgramaDocente.id~' +
        idProgramaDocente + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera = 'idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    this.variablePromocion = idPromocion;
    sessionStorage.setItem('evaluacionIdPromocion', idPromocion.toString());
    sessionStorage.setItem('evaluacionIdProgramaDocente', idProgramaDocente.toString());
    this.onCambiosTabla();
  }

  ngOnInit(): void {
    // this.getProgramaDocente();
  }

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    this.evaluacion = false;
    this.curricular = false;

    let urlSearch: URLSearchParams = new URLSearchParams();
    // 1005- ASpirante, 1002 AspiranteAceptado, 1003 Aspirante rechazado
    // 1100 Aspirante rechazado primera fasr 1014   Exento
    let criterios = 'idEstatus.id~1005:IGUAL;OR,idEstatus.id~1002:IGUAL;OR,' +
      'idEstatus.id~1103:IGUAL;OR,idEstatus.id~1100:IGUAL;OR,idEstatus.id~1101:IGUAL;OR,' +
      'idEstatus.id~1014:IGUAL;ORGROUPAND';
    let ordenamiento = '';
    if (!sessionStorage.getItem('evaluacionCriterios')) {
      if (this.criteriosCabezera !== '') {
        criterios = criterios + ',' + this.criteriosCabezera;
        urlSearch.set('criterios', criterios);
      }
      if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
        let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
        criterios = criterios + ';ANDGROUPAND';
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        });
        urlSearch.set('criterios', criterios);
      }
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('evaluacionCriterios', criterios);
      sessionStorage.setItem('evaluacionOrdenamiento', ordenamiento);
      sessionStorage.setItem('evaluacionLimite', this.limite.toString());
      sessionStorage.setItem('evaluacionPagina', this.paginaActual.toString());

    }
    urlSearch.set('criterios', sessionStorage.getItem('evaluacionCriterios')
      ? sessionStorage.getItem('evaluacionCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('evaluacionOrdenamiento')
      ? sessionStorage.getItem('evaluacionOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('evaluacionLimite')
      ? sessionStorage.getItem('evaluacionLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('evaluacionPagina')
      ? sessionStorage.getItem('evaluacionPagina') : this.paginaActual.toString());

    this.estudianteService.getListaEstudiantesProgramaPromocion(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];

        for (let i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new Estudiante(item));
          this.estudianteAuxiliar = new Estudiante(item);
        });

      },
      error => {
        console.error(error);
      },
      () => {
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    if (this.registros.length > 0) {
      this.onCambiosTabla();
    }
  }

  rowSeleccion(registro): void {
    // console.log(registro);
    this.estadoBotonEvaluacionCurricular = false;
    this.estadoBotonEvaluacionAspirante = false;
    this.listaEvaluacionAspirante = [];
    this.listaEvaluacionCurricular = [];
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      let filtroParaVerBoton;
      if (this.registroSeleccionado.promocion.programaDocente.
          nivelEstudios.descripcion === 'Licenciatura') {
        this.usuarioLicenciatura = true;
      }

      if (this.registroSeleccionado && this.registroSeleccionado.estatus.id === 1014) {
        if (this.usuarioRol.rol.id === 2) {
          filtroParaVerBoton = 'coordinador~' + true + ':IGUAL,' +
            'idEstudiante~' + this.registroSeleccionado.id + ':IGUAL';
        }else if (this.usuarioRol.rol.id === 3) {
          filtroParaVerBoton = 'idProfesor~' + this.profesorLogueado.id + ':IGUAL,' +
            'idEstudiante~' + this.registroSeleccionado.id + ':IGUAL,' +
            'coordinador~false:IGUAL';
        }
        this.obtenerlistaEvaluacionCurricular(filtroParaVerBoton);

      } else if (this.registroSeleccionado.estatus.id === 1103) {
        if (this.usuarioRol.rol.id === 2) {
          if (this.usuarioLicenciatura) {
            filtroParaVerBoton = 'coordinador~' + true + ':IGUAL,' +
              'idEstudiante~' + this.registroSeleccionado.id +
              ':IGUAL,calificacionCeneval~0:NOT';
          }else {
            filtroParaVerBoton = 'coordinador~' + true + ':IGUAL,' +
              'idEstudiante~' + this.registroSeleccionado.id;
          }
        }else if (this.usuarioRol.rol.id === 3) {
          if (this.usuarioLicenciatura) {
            filtroParaVerBoton = 'idProfesor~' + this.profesorLogueado.id +
                ':IGUAL,' + 'idEstudiante~' + this.registroSeleccionado.id +
                ':IGUAL,' + 'coordinador~false:IGUAL,entrevista~true:IGUAL';
          }else {
            filtroParaVerBoton = 'idProfesor~' + this.profesorLogueado.id +
                ':IGUAL,' + 'idEstudiante~' + this.registroSeleccionado.id +
                ':IGUAL';
          }
        }
        this.obtenerlistaEvaluacionAspirante(filtroParaVerBoton);
      }

    } else {
      this.registroSeleccionado = null;
      this.estadoBotonEvaluacionCurricular = false;
      this.estadoBotonEvaluacionAspirante = false;
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
    this.limpiarVariablesSession();
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  obtenerListaAspiranteLgac(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.entidadEstudiante.id + ':IGUAL');

    this._spinner.start('listaAspiranteLgac');
    this.registrosAspiranteLgac = [];

    this.aspiranteLgacService.getListaAspiranteLgacPag(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.registrosAspiranteLgac.push(new AspiranteLgac(item));
        });
      },
      error => {
        console.error(error);
        this._spinner.stop('listaAspiranteLgac');
      },
      () => {
        this._spinner.stop('listaAspiranteLgac');
      }
    );
  }

  getEstado(registro): string {
    let result = '---';

    if (registro.estatus.id == 1103) { // aspirante-aceptado-primera-fase
      if (this.existeEvaluacionAspirante(registro.id)){
        result = 'Evaluado';
      } else {
        result = 'Por Evaluar';
      }

    }

    if (registro.estatus.id == 1014) { // validada
      if (this.existeEvaluacionCurricular(registro.id)) {
        result = 'Evaluado';
      } else {
        result = 'Por Evaluar';
      }

    }

    return result;
  }

  obtenerEvaluacionesCurriculares(){
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProfesor~'+this.profesorLogueado.id+':IGUAL,coordinador~false:IGUAL');

    this._spinner.start('evalCurriculares');
    this._evaluacionCurricularService.getListaEvaluacionCurricularOpcional(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        this.registrosEvaluacionesCurriculares = [];
        response.json().lista.forEach((item) => {
          this.registrosEvaluacionesCurriculares.push(new EvaluacionCurricular(item));
        });
      },
      error => {},
      () => {
        this._spinner.stop('evalCurriculares');
      }
    );
  }

  obtenerEvaluacionesAspirantes(){
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProfesor~'+this.profesorLogueado.id+':IGUAL,coordinador~false:IGUAL');

    this._spinner.start('evalAspirantes');
    this._evaluacionAspiranteService.getListaEvaluacionOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        this.registrosEvaluacionesAspirantes = [];
        response.json().lista.forEach((item) => {
          this.registrosEvaluacionesAspirantes.push(new EvaluacionAspirante(item));
        });
      },
      error => {},
      () => {
        this._spinner.stop('evalAspirantes');
      }
    );
  }

  existeEvaluacionCurricular(idEstudiante): boolean{
    let result = false;

    this.registrosEvaluacionesCurriculares.forEach( item => {
      if(item.estudiante.id == idEstudiante)
        result = true;
    });

    return result;
  }

  existeEvaluacionAspirante(idEstudiante): boolean{
    let result = false;

    this.registrosEvaluacionesAspirantes.forEach( item => {
      if(item.estudiante.id == idEstudiante)
        result = true;
    });

    return result;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
//                       Metodos para ocultar botones                                        //
///////////////////////////////////////////////////////////////////////////////////////////////

  obtenerlistaEvaluacionCurricular(criterio: string): void {
    console.log('--', criterio);
    this.listaEvaluacionCurricular = [];
    this._spinner.start('evaluacion2');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterio);
    this._evaluacionCurricularService.getListaEvaluacionCurricularOpcional(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        let totalCalificaciones: number = 0;
        let sumaCalificaciones: number = 0;
        response.json().lista.forEach((item) => {
          this.listaEvaluacionCurricular.push(new EvaluacionCurricular(item));
          sumaCalificaciones += new EvaluacionCurricular(item).calificacionEnsayo;
          totalCalificaciones += 1;
          this.promedioSugerido = sumaCalificaciones / totalCalificaciones;
        });
        console.log('lista', this.listaEvaluacionCurricular);
        if (this.listaEvaluacionCurricular.length === 0) {
          // this.estatusAspirante = 'Por evaluar';
          this._spinner.stop('evaluacion2');
          this.estadoBotonEvaluacionCurricular = true;
        }else {
          this._spinner.stop('evaluacion2');
          // this.estatusAspirante = 'Evaluado';
          this.estadoBotonEvaluacionCurricular = false;

        }
      }
      /*,
       error => {
       if (assertionsEnabled()) {
       console.error(error);
       }
       },
       () => {
       if (assertionsEnabled()) {

       }
       }*/
    );
  }

  obtenerlistaEvaluacionAspirante(criterio: string): any {
    this.listaEvaluacionAspirante = [];
    this._spinner.start('evaluacion3');

    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterio);
    this._evaluacionAspiranteService.getListaEvaluacionOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let totalCalificaciones: number = 0;
        let sumaCalificaciones: number = 0;
        response.json().lista.forEach((item) => {
          this.listaEvaluacionAspirante.push(new EvaluacionAspirante(item));
          sumaCalificaciones += new EvaluacionAspirante(item).calificacionEntrevista;
          totalCalificaciones += 1;
          this.promedioSugeridoEntrevista = sumaCalificaciones / totalCalificaciones;
          // Recuperar la entidad de aspirante evaluacion para mostrarlo en el modal
          this.recuperarEntidadEvaluacionAspirante = new EvaluacionAspirante(item);
        });
        if (this.listaEvaluacionAspirante.length === 0) {
          this._spinner.stop('evaluacion3');
          // this.estatusAspirante = 'Por evaluar';
          this.estadoBotonEvaluacionAspirante = true;
          this.mostrarEntrevista = false;
        }else {
          this._spinner.stop('evaluacion3');
          // this.estatusAspirante = 'Evaluado';
          this.mostrarEntrevista = true;
          this.estadoBotonEvaluacionAspirante = false;
        }
      }
      /*,
       error => {
       if (assertionsEnabled()) {
       console.error(error);
       }
       },
       () => {
       if (assertionsEnabled()) {

       }
       }*/
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
  }

/*  getProgramaUsuario(): void {
    this._spinner.start();
    this.usuarioService.getEntidadUsuario(this.authService.getUsuarioLogueado().id,
      this.erroresConsultas).subscribe(response => {
      if (response.json().id_programa_docente) {
        this.idProgramaDocenteUsr = response.json().id_programa_docente.id;

        this.criteriosCabezera = 'idProgramaDocente~' + this.idProgramaDocenteUsr +
          ':IGUAL';
        (<FormControl>this.formulario.controls['idProgramaDocente']).
        setValue(this.idProgramaDocenteUsr);
        this.cambioProgramaDocenteFiltro(this.idProgramaDocenteUsr);
        // this.onCambiosTabla();
      }
    });
  }*/

  agregarEstatusProfesor(idEstudiante, idEstatus) {
    if (this.usuarioRol.rol.id === 3) {
      // rol profesor
      let criterioBusqueda;
      if (idEstatus === 1014) {
        criterioBusqueda = 'idProfesor~' + this.profesorLogueado.id + ':IGUAL,' +
          'idEstudiante~' + idEstudiante + ':IGUAL,' + 'coordinador~false:IGUAL';
        this.obtenerlistaEvaluacionCurricular(criterioBusqueda);

      } else {
        criterioBusqueda = 'idProfesor~' + this.profesorLogueado.id + ':IGUAL,' +
          'idEstudiante~' + idEstudiante + ':IGUAL,' + 'coordinador~false:IGUAL';
        // (this.obtenerlistaEvaluacionAspirante(criterioBusqueda);
      }
      return this.estatusAspirante;
      // 1103
    } else {
      return this.estatusAspirante = 'Por evaluar coordinacion';
    }
  }

  goExpediente(): void {
    if (this.registroSeleccionado) {
      this._route.navigate(['evaluacion-aspirante', 'expediente',
        {id: this.registroSeleccionado.id,  vistaAnterior: 'Evaluacion'}]);
    }
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  hasRol(rol: string): boolean {
    return this.authService.hasRol(rol);
  }

  hasAnyRol(roles: Array<string>): boolean {
    return this.authService.hasAnyRol(roles);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  private getProgramaDocente(): void {
    if (this.usuarioRol.rol.id === 2) {
      (<FormControl>this.formulario.controls['idProgramaDocente']).disable();
      this.desahabilitarSelectorCoordiancion = true;
      // coordinador
      this.opcionesSelectProgramaDocente =
        this.estatusCatalogoService.getCatalogoProgramaDocente().
        getSelectProgramaDocente(this.erroresConsultas);
      let programaDocente = 'idProgramaDocente';

      (<FormControl>this.formulario.controls[programaDocente]).
      setValue(this.usuarioRol.usuario.programaDocente.id);

      let criteriosCabezera = 'idProgramaDocente~' +
        this.usuarioRol.usuario.programaDocente.id + ':IGUAL';

      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', criteriosCabezera);

      this.opcionesSelectPromocion = this.estatusCatalogoService.getPromocion().
      getSelectPromocion(this.erroresConsultas, urlParameter);
    } else  if (this.usuarioRol.rol.id === 3) {
      (<FormControl>this.formulario.controls['idProgramaDocente']).enable();
      this.desahabilitarSelectorCoordiancion = false;
      // profesor
      /*this.opcionesSelectProgramaDocente =
       this.estatusCatalogoService.getCatalogoProgramaDocente().
       getSelectProgramaDocente(this.erroresConsultas);*/
      this.programasComites.forEach((elemento) => {
        this.opcionesSelectProgramaDocente.push(
          new ItemSelects(
            elemento.id,
            elemento.descripcion
          )
        );
      });
    } else {
      (<FormControl>this.formulario.controls['idProgramaDocente']).enable();
      this.desahabilitarSelectorCoordiancion = false;
      this.opcionesSelectProgramaDocente =
        this.estatusCatalogoService.getCatalogoProgramaDocente().
        getSelectProgramaDocente(this.erroresConsultas);
    }
  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.estudianteService = this._catalogosService.getEstudiante();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.profesorService = this._catalogosService.getProfesor();
    this._evaluador = this._catalogosService.getEvaluador();
    this._integranteNAB = this._catalogosService.getIntegrantesNAB();
    this._evaluacionCurricularService = this._catalogosService.getEvaluacionCurricular();
    this._evaluacionAspiranteService = this._catalogosService.getEvaluacionAspirante();
    this._pagoEstudianteService = this._catalogosService.getPagoEstudiante();
    this._evaluacionAspiranteService4 = this._catalogosService.getEvaluacionAspirante();
    this.aspiranteLgacService = this._catalogosService.getAspiranteLgacService();
  }

private nombreProfesor(registroEvaluacion): string {
// console.log(registroEvaluacion);
  if(registroEvaluacion.profesor.id !== undefined && registroEvaluacion.profesor && registroEvaluacion.profesor.getNombreCompleto()){
//  console.log('sí hay profesor');
  return registroEvaluacion.profesor.getNombreCompleto();
  }
  else if(registroEvaluacion.coordinador !== undefined){
//  console.log('no hay profesor');
  return 'COORDINADOR';
  }

}

  ///////////////////////////////// MODALS//////////////////////////////////////////////////////////////
  @ViewChild('modalEvaluacionCurriculares')
  modalEvaluacionCurriculares: ModalComponent;
  @ViewChild('modalEvaluaciones')
  modalEvaluaciones: ModalComponent;
  @ViewChild('modalEntrevistas')
  modalEntrevistas: ModalComponent;
  @ViewChild('modalDetalleEvaluacion')
  modalDetalleEvaluacion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';
//////////////////////////////////////MODAL DE DETALLE DE EVALUACION///////////////////////////////////


  abrirModalDetalleEvaluacion(): void {
  //  console.log(this.registroSeleccionado);
    this.puntuacionDetalleCeneval = null;
    this.calificacionFinalDetalle = null;
    this.evaluacionLicenciatura = false;
    if (this.registroSeleccionado.promocion.programaDocente.
        nivelEstudios.descripcion === 'Licenciatura') {
      this.evaluacionLicenciatura = true;
    }

    this.registrosEvaluacionAspirante = [];
    this.registrosEvaluacionCurricular = [];
    let urlSearchParam: URLSearchParams = new URLSearchParams();
    urlSearchParam.set('criterios', 'idEstudiante~' + this.registroSeleccionado.id + ':IGUAL');
    this._catalogosService.getEvaluacionAspirante().getListaEvaluacionOpcional(this.erroresConsultasEvaCurri, urlSearchParam).subscribe(
    response => {
     // console.log(response);
      let respuestas = response.json();
      respuestas.lista.forEach((evaluacion) => {
        let evaluaionAspirante = new EvaluacionAspirante(evaluacion);
        if (evaluacion.coordinador === true) {
          this.puntuacionDetalleCeneval = evaluaionAspirante.calificacionCENEVAL;
          this.calificacionFinalDetalle = evaluaionAspirante.calificacionFinal;
        }
      this.registrosEvaluacionAspirante.push(new EvaluacionAspirante(evaluacion));
      });
    //  console.log(this.registrosEvaluacionAspirante);

    });

    this._catalogosService.getEvaluacionCurricular().getListaEvaluacionCurricularOpcional(this.erroresConsultasEvaCurri, urlSearchParam).subscribe(
    response => {
    //  console.log(response);
      let respuestas = response.json();
      respuestas.lista.forEach((evaluacion)=> {
      this.registrosEvaluacionCurricular.push(new EvaluacionAspirante(evaluacion));
      });
    //  console.log(this.registrosEvaluacionCurricular);

    });
  this.obtenerListaAspiranteLgacDetalle();
    this.modalDetalleEvaluacion.open('lg');
  }

  obtenerListaAspiranteLgacDetalle(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.registroSeleccionado.id + ':IGUAL');

    this._spinner.start('listaAspiranteLgac');
    this.registrosAspiranteLgac = [];

    this.aspiranteLgacService.getListaAspiranteLgacPag(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.registrosAspiranteLgac.push(new AspiranteLgac(item));
        })
      },
      error => {
        console.error(error);
        this._spinner.stop('listaAspiranteLgac');
      },
      () => {
        this._spinner.stop('listaAspiranteLgac');
      }
    );
  }

  cerrarModal3(): void {
    this.puntuacionDetalleCeneval = null;
    this.calificacionFinalDetalle = null;

    this.evaluacionLicenciatura = false;
    this.modalDetalleEvaluacion.close();
  }

  //////////////////////////////////////////////////////////////////////////////////////
  /////////////////////////////MODAL CURRICULAR//////////////////////////////////////////////////////////////
  formularioEvaCurri: FormGroup;
  entidadEstudiante: Estudiante;
  entidadEvaluacionCurricular: EvaluacionCurricular;
  opcionDictamen: boolean = false;
  validacionActiva: boolean = false;
  registroSeleccionadoEvaCurri: EvaluacionCurricular;
  evaluacionLicenciatura: boolean = false;
  idEstudiante;

  private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresConsultasEvaCurri: Array<ErrorCatalogo> = [];

  private constructorEvalCurricular(): void {
    if (!this.hasRol('DOCENCIA') || !this.hasRol('ADMINISTRADOR')) {
      this.opcionDictamen = false;
      this.validacionActiva = false;
      this.evaluacionLicenciatura = false;

      if (this.registroSeleccionado) {
        this.idEstudiante = this.registroSeleccionado.id;
        this.registroSeleccionado = null;
        this.estadoBotonEvaluacionCurricular = false;
      }
      this._spinner.start('cons');
      this.estudianteService.getEntidadEstudiante(
          this.idEstudiante,
          this.erroresConsultasEvaCurri
      ).subscribe(
          response => {
            this.entidadEstudiante
                = new Estudiante(response.json());
          },
          error => {
            console.error(error);
            console.error(this.erroresConsultasEvaCurri);
          },
          () => {
            // console.log(this.entidadEstudiante);
            if (this.entidadEstudiante.promocion.programaDocente.
                    nivelEstudios.descripcion === 'Licenciatura') {
              this.evaluacionLicenciatura = true;
            }
            this._spinner.stop('cons');
            if (this.usuarioRol.rol.id === 2) {
              // console.log('coordinador evasdsdsa');
              let filtroParaVerBoton = 'coordinador~' + false + ':IGUAL,' +
                  'idEstudiante~' + this.idEstudiante + ':IGUAL';
              this.obtenerlistaEvaluacionCurricular(filtroParaVerBoton);
              this.estadoBotonEvaluacionCurricular = false;
            }
            this.obtenerListaAspiranteLgac();

          }
      );
      this.formularioEvaCurri = new FormGroup({
        idEstudiante: new FormControl('', Validators.required),
        dictamen: new FormControl('', Validators.required),
        consideraciones: new FormControl('', Validators.
        compose([ Validacion.parrafos])),
        coordinador: new FormControl(''),
        idProfesor: new FormControl(''),
        calificacionEnsayo: new FormControl('', Validators.
        compose([Validators.required, Validacion.calificacionEvaluacionModB])),
      });
      (<FormControl>this.formularioEvaCurri.controls['idEstudiante']).setValue(this.idEstudiante);
      (<FormControl>this.formularioEvaCurri.controls['coordinador']).setValue(true);

      this.modalEvaluacionCurricular();
    }
  }
  cambioRadio(opcionDictamen: boolean): void {
    this.opcionDictamen = opcionDictamen;
    // console.log(this.opcionDictamen + '  opcion dictamen');
    //(<FormControl>this.formularioEvaCurri.controls['dictamen']).setValue(opcionDictamen);
  }
  enviarFormulario(event): void {
    if (!this.evaluacionLicenciatura) {
      (<FormControl>this.formularioEvaCurri.controls['calificacionEnsayo']).setValue(null);
    }
    if (this.validarFormulario()) {
      this._spinner.start('valid');
      let jsonFormulario = JSON.stringify(this.formularioEvaCurri.value, null, 2);
      //console.log(jsonFormulario);
      this._catalogosService.getEvaluacionCurricular().postEvaluacionCurricular(
          jsonFormulario,
          this.erroresGuardado
      ).subscribe(
          response => {
            this.entidadEvaluacionCurricular = new EvaluacionCurricular(response.json());
            if (this.entidadEvaluacionCurricular)
              if (this.usuarioRol.rol.id === 2) {
                this.cambiarEstatusEstudiante();
              }

            if(this.profesorLogueado){
              this.onCambiosTabla();
              this.obtenerEvaluacionesCurriculares();
              this.obtenerEvaluacionesAspirantes();
            }
          },
          error => {
            this._spinner.stop('valid');
            console.error(error);
            console.error(this.erroresConsultasEvaCurri);
          },
          () => {
            this._spinner.stop('valid');
          }
      );
      this.cerrarModalEvaluacionCurricular();
      //console.log('this form value:: ' + this.formulario.value);
    } else {
      // alert('error en el formulario');
    }
  }
  cambiarEstatusEstudiante(): void {
    this.limpiarVariablesSession();
    this._spinner.start('camb');
    let idEstudiante: number = this.entidadEstudiante.id;
    let estatus;
    if ((this.opcionDictamen === true || this.evaluacionLicenciatura) &&
        (this.usuarioRol.rol.id === 2) ) {
      estatus = {'id': idEstudiante, 'idEstatus': '1103'};
      // aceptadp primera fase
    } else {
      estatus = {'id': idEstudiante, 'idEstatus': '1100'};
    }
    if (this.entidadEstudiante) {
      // console.log(idEstudiante);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      // console.log(jsonCambiarEstatus);

      this.estudianteService.putEstudiante(
          idEstudiante,
          jsonCambiarEstatus,
          this.erroresGuardado
      ).subscribe(
          () => {}, // console.log('Success'),
          console.error,
          () => {
            this._spinner.stop('camb');
            if (this.evaluacionLicenciatura) {
              this.addErrorsMesaje
              ('La evaluación del ensayo se realizó correctamente!',
                  'success');

            }else {
              this.addErrorsMesaje(
                  'La evaluación curricular se realizó correctamente!',
                  'success');
            }
            this.onCambiosTabla();
          }
      );
    }
  }
  validarFormulario(): boolean {
    if (this.usuarioRol.rol.id === 3) {
      (<FormControl>this.formularioEvaCurri.controls['coordinador']).setValue(false);
      (<FormControl>this.formularioEvaCurri.controls['idProfesor']).setValue
      (this.profesorLogueado.id);
    } else {
      (<FormControl>this.formularioEvaCurri.controls['coordinador']).setValue(true);
    }
    if (this.evaluacionLicenciatura) {
      (<FormControl>this.formularioEvaCurri.controls['dictamen']).setValue(true);
    }else {
      (<FormControl>this.formularioEvaCurri.controls['calificacionEnsayo']).setValue('0');
    }
    console.log('formVal', this.formularioEvaCurri);
    if (this.formularioEvaCurri.valid) {
      console.log('si valido');
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioEvaCurri.controls[campo]);
  }
  rowSeleccionadoEvaCurri(registro): boolean {
    return (this.registroSeleccionadoEvaCurri === registro);
  }

  rowSeleccionEvaCurri(registro): void {
    if (this.registroSeleccionadoEvaCurri !== registro) {
      this.registroSeleccionadoEvaCurri = registro;
    } else {
      this.registroSeleccionadoEvaCurri = null;
    }
  }

  private getControlErrorsEvaCurri(campo: string): boolean {
    if (!(<FormControl>this.formularioEvaCurri.controls[campo]).valid && this.validacionActiva) {
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

  private modalEvaluacionCurricular(): void {
    this.modalEvaluacionCurriculares.open('lg');
  }
  private cerrarModalEvaluacionCurricular(): void {
    this.modalEvaluacionCurriculares.close();
    this.estadoBotonEvaluacionCurricular = false;
  }
  /////////////////////////////MODAL EVALUACION//////////////////////////////////////////////////////////////
  formularioEval: FormGroup;
  // entidadEstudiante: Estudiante;
  entidadEvaluacionAspirante: EvaluacionAspirante;
  // opcionDictamen: boolean = false;
  // validacionActiva: boolean = false;
  requierePago;
  registroSeleccionadoEval: EvaluacionCurricular;
  public date: Date = new Date();
  ocultarEvaluaciones: boolean = false;
  listaEvaluacionAspiranteEval: Array<EvaluacionAspirante> = [];
  // evaluacionLicenciatura: boolean = false;
  // entidadEvaluacionCurricular: EvaluacionCurricular;
  evaluacionFinal: boolean = false;
  evaluarPrioridad: boolean = false;
  private _evaluacionAspiranteServiceEval: EvaluacionAspiranteService;

  private erroresGuardadoEval: Array<ErrorCatalogo> = [];
  private erroresConsultasEval: Array<ErrorCatalogo> = [];
  private alertasEval: Array<Object> = [];

  private constructorEvaluacion(): void {
    if (!this.hasRol('DOCENCIA') || !this.hasRol('ADMINISTRADOR')) {
      this._spinner.start('consEval');

      (<FormControl>this.formularioEval.controls['prioridad']).disable();
      this.entidadEstudiante = null;
      this.idEstudiante = null;
      this.entidadEvaluacionAspirante = null;
      this.opcionDictamen = false;
      this.validacionActiva = false;
      this.requierePago = null;
      this.registroSeleccionadoEval = null;
      this.date = new Date();
      this.ocultarEvaluaciones = false;
      // this.listaEvaluacionAspiranteEval = [];
      this.evaluacionLicenciatura = false;
      this.entidadEvaluacionCurricular = null;
      this.evaluacionFinal = false;
      this.evaluarPrioridad = false;
      this._evaluacionAspiranteServiceEval = null;
      this.erroresGuardadoEval = [];
      this.erroresConsultasEval = [];
      this.alertasEval = [];
      this._evaluacionAspiranteServiceEval = this._catalogosService.getEvaluacionAspirante();
      if (this.registroSeleccionado) {
        this.idEstudiante = this.registroSeleccionado.id;
        this.estadoBotonEvaluacionAspirante = false;
      }

      this.estudianteService.getEntidadEstudiante(
          this.idEstudiante,
          this.erroresConsultasEval
      ).subscribe(
          response => {
            this.entidadEstudiante
                = new Estudiante(response.json());
            this.requierePago = this.entidadEstudiante.promocion.programaDocente.requierePago;
            if (this.entidadEstudiante.promocion.
                    programaDocente.nivelEstudios.descripcion === 'Licenciatura') {
              this.evaluacionLicenciatura = true;
            }

            if (this.usuarioRol.rol.id === 2) {
              // Coordiandor
              this.ocultarEvaluaciones = true;
              let listaEvaluadores = 'coordinador~' + false + ':IGUAL,' +
                  'idEstudiante~' + this.idEstudiante + ':IGUAL';
              // console.log(listaEvaluadores);
              this.obtenerlistaEvaluacionAspirante(listaEvaluadores);
              this.estadoBotonEvaluacionAspirante = false;
            }
            this.obtenerListaAspiranteLgac();
          },
          error => {
            console.error(error);
            console.error(this.erroresConsultasEval);
          },
          () => {
            this._spinner.stop('consEval');
          }
      );
      this.formularioEval = new FormGroup({
        consideraciones: new FormControl('', Validators.
        compose([Validacion.parrafos])),
        prioridad: new FormControl('', Validators.required),
        dictamen: new FormControl('', Validators.required),
        coordinador: new FormControl(''),
        idEstudiante: new FormControl(''),
        idProfesor: new FormControl(''),
        auxiliarPrioridad: new FormControl('', Validators.required),
      });
      (<FormControl>this.formularioEval.controls['prioridad']).disable();
      (<FormControl>this.formularioEval.controls['idEstudiante']).setValue(this.idEstudiante);
      (<FormControl>this.formularioEval.controls['coordinador']).setValue(false);
      // console.log(this.evaluacionLicenciatura);

      ////console.log(criterioBusquedaAspirante);
      if (this.hasRol('COORDINADOR')) {
        let criterioBusquedaAspirante =  'idEstudiante~' + this.idEstudiante
            + ':IGUAL,coordinador~false:IGUAL';
        this.validarNoRepetirPrioridad(criterioBusquedaAspirante, 'evaluacionFinal');
      } else {
        let criterioBusquedaAspirante =  'idEstudiante~' + this.idEstudiante
            + ':IGUAL,coordinador~true:IGUAL';
        this.validarNoRepetirPrioridad(criterioBusquedaAspirante, 'evaluacion');
      }
    }
  }
  cerrarAlertaEval(i: number): void {
    this.alertasEval.splice(i, 1);
    this.alertasEval = [];
  }

  cambioRadioEval(opcionDictamen: boolean): void {
    this.opcionDictamen = opcionDictamen;
    ////console.log(this.opcionDictamen + '  opcion dictamen');
    // (<FormControl>this.formularioEval.controls['dictamen']).setValue(opcionDictamen);
    if (opcionDictamen) {
      (<FormControl>this.formularioEval.controls['prioridad']).enable();
    }else {
      (<FormControl>this.formularioEval.controls['prioridad']).disable();
    }
  }
  findPrioridad(prioridad): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    // let arrPrioridad = [];
    let bandera: boolean = true;
    let criterio: string = 'idEstudiante.idPromocion~' +
      (this.variablePromocion ? this.variablePromocion : this.registroSeleccionado.promocion.id) + ':IGUAL';

    // console.log('idPromoVar',this.variablePromocion);
    // console.log('idPromo',this.registroSeleccionado);
    urlParameter.set('criterios', criterio);
    this._spinner.start('find');
    this._evaluacionAspiranteServiceEval.getListaEvaluacionAspirante(
        this.erroresConsultasEval,
        urlParameter, false
    ).subscribe(
        response => {
          let auxiliar;
          response.json().lista.forEach(function (elemento) {
            auxiliar = new EvaluacionAspirante(elemento);
            // arrPrioridad.push(new ItemSelect(auxiliar.id, auxiliar.prioridad));
            if (prioridad != "" && prioridad != 0 && auxiliar.prioridad == prioridad) {
              bandera = false;
            }
          });
        },
        error => {
          this._spinner.stop('find');
          console.error(error);
        },
        () => {
          this._spinner.stop('find');
          if (bandera === false) {
            this.addErrorsMesajeEval('La prioridad ya existe en la promoción', 'danger');
          } else {
            this.guardarEvaluacion();
          }
        });
  }

  guardarEvaluacion(): void {
    let dictame = this.getControlEval('dictamen');
    this._spinner.start('guardar');

    let jsonFormulario = JSON.stringify(this.formularioEval.getRawValue(), null, 2);
    // console.log('enviar', jsonFormulario);

    this._evaluacionAspiranteServiceEval.postEvaluacionAspirante(
        jsonFormulario,
        this.erroresGuardadoEval
    ).subscribe(
        response => {
          let evaluacionAspiranteGuardada: EvaluacionAspirante;
          evaluacionAspiranteGuardada = new EvaluacionAspirante(response.json());
          if (evaluacionAspiranteGuardada &&
              this.usuarioRol.rol.id === 2) {
            if (!this.evaluacionLicenciatura ||
                (this.evaluacionLicenciatura && this.evaluacionFinal)) {
              this.cambiarEstatusEstudianteEval();
            }
            this.addErrorsMesaje('La evaluación se realizó correctamente!', 'success');
          }
          if (this.profesorLogueado) {
              this.onCambiosTabla();
              this.obtenerEvaluacionesCurriculares();
              this.obtenerEvaluacionesAspirantes();
          }
        }, error => {
          this._spinner.stop('guardar');
          console.error(error);
          console.error(this.erroresConsultasEval);
        },
        () => {
          this._spinner.stop('guardar');
        }
    );
    this.cerrarModalEvaluacion();
  }

  enviarFormularioEval(): void {
    if (this.hasRol('COORDINADOR')) {
      let prioridadRepetida = this.getControlEval('prioridad').value;
      if (this.validarFormularioEval()) {
        this.findPrioridad(prioridadRepetida);
      } else {
        // alert('error en el formulario');
      }
    } else {
      if (this.validarFormularioEval()) {
        this.guardarEvaluacion();
      }
    }
  }

  cambiarEstatusEstudianteEval(): void {
    let idEstudiante: number = this.entidadEstudiante.id;
    let estatus;

    if (this.opcionDictamen === true) {
      estatus = {'idEstatus': '1002'};
    } else {
      estatus = {'idEstatus': '1101'};
    }

    if (this.entidadEstudiante) {
      ////console.log(idEstudiante);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);

      this.estudianteService.putEstudiante(
          idEstudiante,
          jsonCambiarEstatus,
          this.erroresGuardadoEval
      ).subscribe(
          () => {}, // console.log('Success'),
          console.error,
          () => {
            // this.limpiarVariablesSession();
            this.onCambiosTabla();
          }
      );
    }
  }
  validarNoRepetirPrioridad(criterio: string, tipoConsulta: string): boolean {
    this._spinner.start('evaluaciones');
    // console.log(criterio);
    this.alertasEval = [];
    this.listaEvaluacionAspiranteEval = [];
    // console.log(criterio);

    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterio);
    this._evaluacionAspiranteServiceEval.getListaEvaluacionOpcional(
        this.erroresConsultasEval,
        urlParameter
    ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.listaEvaluacionAspiranteEval.push(new EvaluacionAspirante(item));
            this.entidadEvaluacionAspirante = new EvaluacionAspirante(item);
          });
        },
        error => {
          this._spinner.stop('evaluaciones');
          console.error(error);
        },
        () => {
          // console.log('lis',this.listaEvaluacionAspiranteEval);
          if ( this.listaEvaluacionAspiranteEval.length === 0) {
            // console.log('lista vacia, no existe esta prioridad para la promocion');
            if (tipoConsulta === 'evaluacionFinal') {
              this.evaluacionFinal = true;
            } else {
              this.evaluacionFinal = false;
              this.evaluarPrioridad = true;
              // console.log(this.evaluarPrioridad);
            }
            this._spinner.stop('evaluaciones');
            this.modalEvaluacion();
            return true;
          }else {
            // console.log('esta prioridad ya existe');
            if (tipoConsulta === 'evaluacionFinal') {
              this.evaluacionFinal = true;
            }else {
              this.evaluacionFinal = false;
              this.evaluarPrioridad = false;
              // console.log(this.evaluarPrioridad);
            }
            this._spinner.stop('evaluaciones');
            this.modalEvaluacion();
            return false;
          }
        }
    );
    this._spinner.stop('evaluaciones');
    return;
  }
  validarFormularioEval(): boolean {
    (<FormControl>this.formularioEval.controls['auxiliarPrioridad']).setValue('prioridadNovalidada');
    if (this.usuarioRol.rol.id === 3) {
      (<FormControl>this.formularioEval.controls['coordinador']).setValue(false);
      (<FormControl>this.formularioEval.controls['idProfesor']).setValue(
          this.profesorLogueado.id);
      (<FormControl>this.formularioEval.controls['prioridad']).setValue('0');
    } else {
      (<FormControl>this.formularioEval.controls['coordinador']).setValue(true);
      let dictame = this.getControlEval('dictamen');
      if (!dictame.value) {
        (<FormControl>this.formularioEval.controls['prioridad']).setValue('0');
      } else {

        /* FIXME Método para validar no repetir prioridad, PENDIENTE

         let promocionRecuperada: number = this.entidadEstudiante.promocion.id;
         let criterioBusqueda;
         criterioBusqueda = 'idEstudiante.idPromocion.id~' +
         promocionRecuperada +
         ':IGUAL,coordinador~true:IGUAL,prioridad~' +
         this.getControl('prioridad').value + ':IGUAL';
         this.validarNoRepetirPrioridad(criterioBusqueda, 'consutaValidarPrioridad');
         //console.log(this.validarNoRepetirPrioridad
         (criterioBusqueda, 'consutaValidarPrioridad'));
         if (!this.evaluarPrioridad) {
         //console.log('Repetidos');
         (<Control>this.formulario.controls['auxiliarPrioridad']).updateValue();
         this.addErrorsMesaje(
         'La prioridad ya fue asignada para esta promoción',
         'danger');
         }*/
      }
    }
    // console.log(this.formulario.value);
    if (this.formularioEval.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  getControlEval(campo: string): FormControl {
    return (<FormControl>this.formularioEval.controls[campo]);
  }
  addErrorsMesajeEval(mensajeError, tipo): void {
    this.alertasEval.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }
  obtenerCalificacionEnsayo(criterio: string): any {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterio);
    this._evaluacionCurricularService.getListaEvaluacionCurricularOpcional(
        this.erroresConsultasEval,
        urlParameter,
        false
    ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.entidadEvaluacionCurricular = new EvaluacionCurricular(item);

          });
        }, error => {
          console.error(error);
        }, () => {}
    );
  }
  private getControlErrorsEval(campo: string): boolean {
    if (!(<FormControl>this.formularioEval.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }
  private modalEvaluacion(): void {
    this.modalEvaluaciones.open('lg');
  }
  private cerrarModalEvaluacion(): void {
    this.estadoBotonEvaluacionAspirante = false;
    this.modalEvaluaciones.close();
  }
  //////////////////////////////////////MODAL DE ENTREVISTA///////////////////////////////////

  formulario4: FormGroup;
  entidadEstudiante4: Estudiante;
  entidadEvaluacionAspirante4: EvaluacionAspirante;
  entidadPagoEstudiante: PagoEstudiante;
  validacionActiva4: boolean = false;
  requierePago4;
  registroSeleccionado4: EvaluacionCurricular;
  public date4: Date = new Date();
  ocultarEvaluaciones4: boolean = false;
  listaEvaluacionAspirante4: Array<EvaluacionAspirante> = [];
  evaluacionLicenciatura4: boolean = false;
  usuarioCoordinador4: boolean;
  entidadEvaluacionCurricular4: EvaluacionCurricular;
  evaluacionFinal4: boolean = false;
  private _evaluacionAspiranteService4: EvaluacionAspiranteService;
  private _pagoEstudianteService;

  private erroresGuardado4: Array<ErrorCatalogo> = [];
  private erroresConsultas4: Array<ErrorCatalogo> = [];
  private alertas4: Array<Object> = [];


  abrirModal2(): void {
    this.modalEntrevistas.open('lg');
  }

  cerrarModal2() {
    this.modalEntrevistas.close();
  }

  modalEntrevista(): void {
    if (!this.hasRol('DOCENCIA') || !this.hasRol('ADMINISTRADOR')) {
      let idEstudiante = this.registroSeleccionado.id;
      this.usuarioCoordinador4 = this.usuarioCoordinador;
      this.prepareServices();
      this._spinner.start('modalentrevista1');
      this.estudianteService.getEntidadEstudiante(
        idEstudiante,
        this.erroresConsultas4
      ).subscribe(
        response => {
          this.entidadEstudiante4
            = new Estudiante(response.json());
          this.requierePago4 = this.entidadEstudiante4.promocion.programaDocente.requierePago;
          if (this.entidadEstudiante4.promocion.
              programaDocente.nivelEstudios.descripcion === 'Licenciatura') {
            this.evaluacionLicenciatura4 = true;
          }
          this._spinner.stop('modalentrevista1');
          if (this.usuarioRol.rol.id === 2) {
            // Coordiandor
            this.ocultarEvaluaciones4 = true;
            let listaEvaluadores = 'coordinador~' + false + ':IGUAL,' +
              'idEstudiante~' + idEstudiante + ':IGUAL';
            // console.log(listaEvaluadores);
            this.obtenerlistaEvaluacionAspirante(listaEvaluadores);
            this.estadoBotonEvaluacionAspirante = false;
          }
        },
        error => {
          console.error(error);
          console.error(this.erroresConsultas4);
        },
        () => {
        }
      );
      (<FormControl>this.formulario4.controls['idEstudiante']).setValue(idEstudiante);
      (<FormControl>this.formulario4.controls['coordinador']).setValue(false);
      // console.log(this.evaluacionLicenciatura4);

      let criterioBusquedaAspirante =  'idEstudiante~' + idEstudiante
        + ':IGUAL,coordinador~true:IGUAL';
      // console.log(criterioBusquedaAspirante);
      this.validarNoRepetirPrioridad4(criterioBusquedaAspirante);
      this.abrirModal2();
    }
  }

  cerrarAlerta4(i: number): void {
    this.alertas4.splice(i, 1);
    this.alertas4 = [];
  }

  enviarFormulario4(event): void {
    if (this.validarFormulario4()) {

      if (!this.evaluacionLicenciatura4) {
        (<FormControl>this.formulario4.controls['calificacionEntrevista']).setValue('');
        (<FormControl>this.formulario4.controls['calificacionCeneval']).setValue('');
      }
      if (this.evaluacionFinal4) {
        (<FormControl>this.formulario4.controls['calificacionEntrevista']).setValue('');
      }
      this._spinner.start('modalentrevista2');
      let jsonFormulario = JSON.stringify(this.formulario4.value, null, 2);
      if ( this.evaluacionFinal4) {
        // console.log(this.entidadEvaluacionAspirante4.id);
        this._evaluacionAspiranteService4.putEvaluacionAspirante(
          this.entidadEvaluacionAspirante4.id,
          jsonFormulario,
          this.erroresGuardado4
        ).subscribe(
          response => {
            ////console.log(response.json());
            this.addErrorsMesaje('Se capturo la calificación del examen CENEVAL correctamente!', 'success');
          },
          error => {
            this._spinner.stop('modalentrevista2');
            console.error(error);
            console.error(this.erroresConsultas4);
          },
          () => {
            this._spinner.stop('modalentrevista2');
          }
        );
      }else {
        this._evaluacionAspiranteService4.postEvaluacionAspirante(
          jsonFormulario,
          this.erroresGuardado4
        ).subscribe(
          response => {
            let evaluacionAspiranteGuardada: EvaluacionAspirante;
            evaluacionAspiranteGuardada = new EvaluacionAspirante(response.json());
            if (evaluacionAspiranteGuardada &&
              this.usuarioRol.rol.id === 2) {
              this.addErrorsMesaje('La entrevista se realizó correctamente!', 'success');

            }
          }, error => {
            this._spinner.stop('modalentrevista2');
            console.error(error);
            console.error(this.erroresConsultas4);
          },
          () => {
            this._spinner.stop('modalentrevista2');
          }
        );
      }

      this.cerrarModal2();
    } else {
      // alert('error en el formulario4');
    }
  }

  validarNoRepetirPrioridad4(criterio: string) {
    // console.log(criterio);
    this.alertas4 = [];
    this.listaEvaluacionAspirante4 = [];
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterio);
    this._evaluacionAspiranteService4.getListaEvaluacionOpcional(
      this.erroresConsultas4,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.listaEvaluacionAspirante4.push(new EvaluacionAspirante(item));
          this.entidadEvaluacionAspirante4 = new EvaluacionAspirante(item);
        });
        if ( this.listaEvaluacionAspirante4.length === 0) {
          this.evaluacionFinal4 = false;
          return true;
        }else {
          this.evaluacionFinal4 = true;
          return false;
        }
      }
      /*,
       error => {
       if (assertionsEnabled()) {
       console.error(error);
       }
       },
       () => {
       if (assertionsEnabled()) {

       }
       }*/
    );
  }

  validarFormulario4(): boolean {

    if (this.usuarioRol.rol.id === 3) {
      (<FormControl>this.formulario4.controls['coordinador']).setValue(false);
      (<FormControl>this.formulario4.controls['idProfesor']).setValue(
        this.profesorLogueado.id);
    } else {
      (<FormControl>this.formulario4.controls['coordinador']).setValue(true);
    }
    if (!this.evaluacionLicenciatura4) {
      (<FormControl>this.formulario4.controls['calificacionEntrevista']).setValue('0');
      (<FormControl>this.formulario4.controls['calificacionCeneval']).setValue('0');
    } else {
      (<FormControl>this.formulario4.controls['entrevista']).setValue(true);
    }

    if (this.evaluacionFinal4) {
      (<FormControl>this.formulario4.controls['calificacionEntrevista']).setValue('0');
    }
    // console.log(this.formulario4.value);
    if (this.formulario4.valid) {
      this.validacionActiva4 = false;
      return true;
    }
    this.validacionActiva4 = true;
    return false;
  }

  getControl4(campo: string): FormControl {
    return (<FormControl>this.formulario4.controls[campo]);
  }

  addErrorsMesaje4(mensajeError, tipo): void {
    this.alertas4.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  obtenerCalificacionEnsayo4(criterio: string): any {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterio);
    this._evaluacionCurricularService.getListaEvaluacionCurricularOpcional(
      this.erroresConsultas4,
      urlParameter,
      false
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.entidadEvaluacionCurricular4 = new EvaluacionCurricular(item);

        });
      }, error => {
        console.error(error);
      }, () => {
      }
    );
  }

  private getControlErrors4(campo: string): boolean {
    if (!(<FormControl>this.formulario4.controls[campo]).valid && this.validacionActiva4) {
      return true;
    }
    return false;
  }


  private errorMessage4(control: FormControl): string {
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

  limpiarVariablesSession() {
    sessionStorage.removeItem('evaluacionCriterios');
    sessionStorage.removeItem('evaluacionOrdenamiento');
    sessionStorage.removeItem('evaluacionLimite');
    sessionStorage.removeItem('evaluacionPagina');
  }

}
