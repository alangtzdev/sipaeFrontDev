import {Component, OnInit, Renderer, Injector, ElementRef, ViewChild} from '@angular/core';
import {Usuarios} from '../../services/usuario/usuario.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {RespuestasEvaluacionDocenteService} from '../../services/entidades/respuestas-evaluacion-docente.service';
import {EvaluacionDocenteService} from '../../services/entidades/evaluacion-docente.service';
import {ProfesorService} from '../../services/entidades/profesor.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {UsuarioServices} from '../../services/usuario/usuario.service';
import {ProfesorMateriaService} from '../../services/entidades/profesor-materia.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {PeriodoEscolar} from '../../services/entidades/periodo-escolar.model';
import * as moment from 'moment';
import {URLSearchParams} from '@angular/http';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {PeriodoEscolarServices} from '../../services/entidades/periodo-escolar.service';
import {AuthService} from '../../auth/auth.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {RespuestasEvaluacionDocente} from '../../services/entidades/respuestas-evaluacion-docente.model';
import any = jasmine.any;
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {MateriaImpartidaService} from '../../services/entidades/materia-impartida.service';

export class HistorialProfesorMateria {
    profesor: Profesor;
    materiaImpartida: MateriaImpartida;
    constructor(profesor: Profesor, materiaImpartida: MateriaImpartida) {
        this.profesor = profesor;
        this.materiaImpartida = materiaImpartida;
    }
}

@Component({
  selector: 'app-evaluacion-docente-list',
  templateUrl: './evaluacion-docente-list.component.html',
  styleUrls: ['./evaluacion-docente-list.component.css']
})
export class EvaluacionDocenteListComponent {

  @ViewChild('finalizarEvaluacion')
  finalizarEvaluacion: ModalComponent;
  @ViewChild('modalResultadoEvaluacionDocente')
  modalResultadoEvaluacionDocente: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  usuarioLogueado: UsuarioSesion;
  usuarioActual: Usuarios;
  profesorActual: Profesor;
  puedeTerminarPeridodoEvaluacion = false;
  finalizadoEn: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  criteriosCabezera: string = '';
  idEvaluacionDocente: number;


  registros: Array<HistorialProfesorMateria> = [];
  registroSeleccionado: HistorialProfesorMateria;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idProfesor.nombre,idProfesor.primerApellido,' +
      'idProfesor.segundoApellido,idMateriaImpartida.idMateria.clave', textoFecha: '' }
  };
  columnas: Array<any> = [
    { titulo: 'Clave de la materia*', nombre: 'idMateriaImpartida.idMateria.clave'},
    { titulo: 'Materia', nombre: 'idMateriaImpartida.idMateria.descripcion'},
    { titulo: 'Profesor a cargo*', nombre: 'idProfesor.primerApellido'}
  ];

  public botonValido: boolean;

  public esDocencia: boolean;
  public esCoordinador: boolean;
  public esProfesor: boolean;
  private opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  private opcionesSelectPromocion: Array<ItemSelects> = [];
  private opcionesSelectMateria: Array<MateriaImpartida> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  cursoOptativo;
  detalleNombreProfesor;
  resultadosEvaluacionDocente: any = undefined;

  // variables para obtener materias tutoriales //
  private idMateriaSelect: number = undefined;
  private criteriosMateriasTutoriales: string = undefined;
  private idPromocion: number = undefined;
  private registrosAux: Array<HistorialProfesorMateria> = [];
  // fin de variables para obtener materis tutoriales //


  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              public _catalogosService: CatalogosServices,
              public _profesorMateriaService: ProfesorMateriaService,
              private _usuarioService: UsuarioServices,
              private _usuarioRolService: UsuarioRolService,
              private _profesorService: ProfesorService,
              private _evaluacionDocenteService: EvaluacionDocenteService,
              private _respuestaEvaluacionDocenteService: RespuestasEvaluacionDocenteService,
              private _periodoEscolarService: PeriodoEscolarServices,
              private _estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService,
              private _materiaImpartida: MateriaImpartidaService,
              private _authService: AuthService
  ) {
    this.esDocencia = false;
    this.esCoordinador = false;
    this.esProfesor = false;
    this.prepareServices();
    this.periodoEvaluacion();
  if (sessionStorage.getItem('evaluacionIdPromocion')) {
      let promocion = 'idPromocion';

    }

    if (sessionStorage.getItem('evaluacionListDocenteCriterios')) {
      this.onCambiosTabla();
    }
  


  }
  periodoEvaluacion(): void {
    let me = this;
    this._periodoEscolarService.getPeriodoEscolarVigente(
       moment(),
      this.erroresConsultas
    ).subscribe(
      response => {
        let periodo;
        //console.log(response.json().lista);
        if (response.json().lista.length > 0) {
          response.json().lista.forEach(function (item) {
            periodo = new PeriodoEscolar(item);
            // variable que almacena el periodo que se va a finalizar

            if (item.finalizacion_evaluacion_profesor) {

              me.finalizadoEn = 'Inicio curso ' +
                moment(periodo.inicioCurso).format('DD/MM/YYYY') +
                '\nPeriodo de evaluación finalizado por el área de docencia el día ' +
                moment(item.finalizacion_evaluacion_profesor).format('DD/MM/YYYY');
              me.puedeTerminarPeridodoEvaluacion = false;
            } else {
              me.finalizadoEn = '';
              me.puedeTerminarPeridodoEvaluacion = true;
            }
          });
        }

      },
      console.error,
      () => {

      }
    );
  }
  verificarRoles(): void {
    if (this._authService.hasRol('DOCENCIA') ) {// Seguridad.hasRol('DOCENCIA')) {
      //console.log('Es docencia quien accedio');
      this.esDocencia = true;
      //this.onCambiosTabla();
    } else {
      if (this._authService.hasRol('COORDINADOR') ||
        this._authService.hasRol('PROFESOR')) {// Seguridad.hasRol('COORDINADOR') || Seguridad.hasRol('PROFESOR')) {
        this.esCoordinador = true;
        if (this.usuarioActual.programaDocente && this.usuarioActual.programaDocente.id) {
          this.cambioProgramaDocenteFiltro(this.usuarioActual.programaDocente.id);
          //this.onCambiosTabla();
        }

      }
      if ( this._authService.hasRol('PROFESOR')) {  // Seguridad.hasRol('PROFESOR')) {
        this.esProfesor = true;
        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';
        urlSearch.set('criterios', criterio);
        this._profesorService.getListaProfesor(this.erroresConsultas,
          urlSearch).subscribe(
          response => {
            let respuesta = response.json();
            respuesta.lista.forEach((item) => {

              this.profesorActual = new Profesor(item);
              //this.onCambiosTabla();
            });

          });
      }
      // console.log('this.esProfesor', this.esProfesor);
    }
  }
  puedeVerPantalla(): boolean {
    return (this.esDocencia || this.esCoordinador || this.esProfesor);
  }


  onCambiosTabla() {
    this.registroSeleccionado = undefined;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'titular~true:IGUAL';
    //let criterios = '';
    let ordenamiento = '';  

    if (!sessionStorage.getItem('evaluacionListDocenteCriterios')) {
      if (this.criteriosCabezera !== '') {
        criterios = this.criteriosCabezera;
        urlSearch.set('criterios', criterios);
      }
      if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
        let filtros:Array<string> = this.configuracion.filtrado.columnas.split(',');
        //criterios = criterios + ';ANDGROUPAND';
        criterios !== '' ? criterios = criterios + ';ANGROUPAND' : criterios = criterios; 1
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
      sessionStorage.setItem('evaluacionListDocenteCriterios', criterios);
      sessionStorage.setItem('evaluacionListDocenteOrdenamiento', ordenamiento);
      sessionStorage.setItem('evaluacionListDocenteLimite', this.limite.toString());
      sessionStorage.setItem('evaluacionListDocentePagina', this.paginaActual.toString());

    }
    urlSearch.set('criterios', sessionStorage.getItem('evaluacionListDocenteCriterios')
      ? sessionStorage.getItem('evaluacionListDocenteCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('evaluacionListDocenteOrdenamiento')
      ? sessionStorage.getItem('evaluacionListDocenteOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('evaluacionListDocenteLimite')
      ? sessionStorage.getItem('evaluacionListDocenteLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('evaluacionListDocentePagina')
      ? sessionStorage.getItem('evaluacionListDocentePagina') : this.paginaActual.toString());

    this._profesorMateriaService.getListaProfesorMateria(
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

        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(
            new HistorialProfesorMateria(
                new Profesor(item.id_profesor),
                new MateriaImpartida(item.id_materia_impartida)
          ));
        });
      },
      error => {
        this._spinner.stop('evaluaciondocentelist1');
      },
      () => {
        this._spinner.stop('evaluaciondocentelist1');
        this.registrosAux = this.registros;
        console.log('registros[]', this.registros);
        if (this.criteriosCabezera !== '' && this.registrosAux.length < 0) {
          this.crearCriteriosMateriasTutoriales();
          this.agregarMateriasTutoriales();
        } else {
          // this.crearCriteriosInicialesMateriasTutoriales();
        }
      }
    );

  }

  crearCriteriosMateriasTutoriales(): void {
    if ((this.esCoordinador || this.esDocencia) && this.idPromocion) {
      if (this.idMateriaSelect) {
          this.criteriosMateriasTutoriales =
            'idMateriaImpartida.idPromocion~'
            + this.idPromocion + ':IGUAL;AND,' +
            'idMateriaImpartida~' + this.idMateriaSelect + ':IGUAL;AND' +
            'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
                'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND';

        // this.idMateriaSelect = undefined;
      } else {
          this.criteriosMateriasTutoriales =
            'idMateriaImpartida.idPromocion~'
            + this.idPromocion + ':IGUAL;AND,' +
            'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
                'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND';
      }
    }
  }

  crearCriteriosInicialesMateriasTutoriales(): void {
    if (this.esCoordinador || this.esDocencia) {
      this.criteriosMateriasTutoriales =
        'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
            'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND';
    }
  }

  agregarMateriasTutoriales(): void {

    let urlSearch: URLSearchParams = new URLSearchParams();

    urlSearch.set('criterios', this.criteriosMateriasTutoriales);
    urlSearch.set('ordenamiento', 'idMateriaImpartida.idMateria.clave:ASC,' +
            'idMateriaImpartida.idPeriodoEscolar.periodo:ASC');
    this._spinner.start('agregarMaterias');
    this._estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        // this.registros = [];
        let begin = ((this.paginaActual - 1) * this.limite);
        let end = begin + this.limite;
        if (response && response.json()) {
          let listaMateriasImpartidas = response.json();
          listaMateriasImpartidas.lista.forEach((estudianteMateria) => {
              if (!this.materiaImpartidaEstaAgregada(
                  new EstudianteMateriaImpartida(estudianteMateria).estudiante.tutor.profesor.id)) {
                  this.registros.push(
                      new HistorialProfesorMateria(
                          new Profesor(estudianteMateria.id_estudiante.id_tutor.id_profesor),
                          new MateriaImpartida(estudianteMateria.id_materia_impartida)
                      )
                  );
              }
          });

          this.setPaginacion(new PaginacionInfo(
            this.registros.length,
            this.obtenerNumeroPaginas(),
            this.paginaActual,
            this.limite
          ));

          this.registrosAux = this.registros.slice(begin, end);
        }

      },
      error => {
        this._spinner.stop('agregarMaterias');
      },
      () => {
        this._spinner.stop('agregarMaterias');
      }
    );

  }

  private materiaImpartidaEstaAgregada(idProfesor: number): boolean {
        let estaAgregada: boolean = false;
        this.registros.forEach((registro) => {
           if (registro.profesor.id == idProfesor) {
               estaAgregada = true;
           }
        });
        return estaAgregada;
  }

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;
  }

  getPaginacion() {
    return this.paginacion;
  }

  sortChanged(columna): void {
    this.limpiarVariablesSession();
    this.columnas.forEach((column) => {
      if (columna !== column) {
        if (column.sort !== false) {
          column.sort = '';
        } else {
          column.sort = false;
        }
      }
    });
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
    this.criteriosCabezera = '';
    this.prepareServices();
    this.opcionesSelectMateria = [];
    this.opcionesSelectPromocion = [];
    // this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }
  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.onCambiosTabla();
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

  obtenerNumeroPaginas() {
    return Math.ceil(this.registros.length / this.limite);
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectMateria = [];
    this.opcionesSelectPromocion =
      this._catalogosService.getPromocion().
      getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  cambioPromocionFiltro(idPromocion: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();

    this.idPromocion = idPromocion;

    let criterios = 'idMateriaImpartida.idPromocion~' + idPromocion + ':IGUAL';
    if (this.profesorActual) {
      criterios += ',idProfesor~' + this.profesorActual.id + ':IGUAL';
    }
    urlParameter.set('criterios', criterios);
    this._profesorMateriaService.
    getListaProfesorMateria(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        this.opcionesSelectMateria = [];

        response.json().lista.forEach((item) => {
          if (!this.materiaImpartidaSelectEstaAgregada(item.id_materia_impartida.id)) {
                this.opcionesSelectMateria.push(
                  new MateriaImpartida(item.id_materia_impartida));
          }
        });

        urlParameter.set('criterios', 'idPromocion~' + idPromocion +
            ':IGUAL;AND,' + 'idMateria.idTipo.id~3:IGUAL;AND');

        this._spinner.start('buscarMaterias');
        this._materiaImpartida.getListaMateriaImpartida(
          this.erroresConsultas,
          urlParameter
        ).subscribe(
          response => {
            response.json().lista.forEach((item) => {
              if (!this.materiaImpartidaSelectEstaAgregada(item.id)) {
                this.opcionesSelectMateria.push(
                  new MateriaImpartida(item));
              }
            });
          },
          error => {
            this._spinner.stop('buscarMaterias');
          },
          () => {
            this._spinner.stop('buscarMaterias');
          }
        );
      },
      error => {
        this._spinner.stop('buscarMaterias');
      },
      () => { }
    );
  }

  private materiaImpartidaSelectEstaAgregada(idMateriaImpartida: number): boolean {
    let estaAgregada: boolean = false;
    this.opcionesSelectMateria.forEach((idMateriaSelect) => {
      if (idMateriaSelect.id === idMateriaImpartida) {
        estaAgregada = true;
      }
    });
    return estaAgregada;
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idMateria: number
  ): void {
   this.limpiarVariablesSession();

    if (idProgramaDocente) {
      this.criteriosCabezera = 'idMateriaImpartida.idPromocion.idProgramaDocente.id~' +
        idProgramaDocente + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + ',idMateriaImpartida.idPromocion.id~'
        + idPromocion + ':IGUAL;AND';
    }
    if (idMateria) {
      this.idMateriaSelect = idMateria;
      this.criteriosCabezera = this.criteriosCabezera + ',idMateriaImpartida.id~'
        + idMateria + ':IGUAL;AND';
    }
    sessionStorage.setItem('evaluacionidProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('evaluacionidPromocion', this.idPromocion.toString());
    sessionStorage.setItem('evaluacionidMateria', idMateria.toString());

    this.onCambiosTabla();
  }
  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
  }
  activarBotonBusqueda(numero: number): any {
    if (numero == 1) {
      this.botonValido = true;
    } else {
      this.botonValido = false;
    }
  }
  // // // // // // // // // // // // // // // // // // // // // // //
  //                                 Paginador
  // // // // // // // // // // // // // // // // // // // // // // // // /

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;


    if (this.hasOwnProperty('paginacion') &&
      this.paginacion.hasOwnProperty('registrosPagina')) {
      result = true;
    }
    return result;
  }

  deshabilitarDetalles(): boolean {
    return !(this.registroSeleccionado && this.puedeTerminarPeridodoEvaluacion);
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

  private registroEstaAgregado(arregloEvaluaciones, itemABuscar): boolean {
    let estaAgregado: boolean = false;
    arregloEvaluaciones.forEach((item) => {
      if (item.id_estudiante_materia_impartida.id === itemABuscar ) {
        estaAgregado = true;
      }
    });

    return estaAgregado;
  }

  private prepareServices(): void {
   this.usuarioLogueado = this._authService.getUsuarioLogueado();
    if ( AuthService.isLoggedIn()) { // Seguridad.isLoggedIn()) {
      this._spinner.start('evaluaciondocentelist2');
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'id~' + this.usuarioLogueado.id + ':IGUAL';
      urlSearch.set('criterios', criterio);
      this._usuarioService.getListaUsuario(this.erroresConsultas,
        urlSearch).subscribe(
        response => {
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.usuarioActual = new Usuarios(item);
            urlSearch = new URLSearchParams();
            criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';
            urlSearch.set('criterios', criterio);
          });

        });

      this._usuarioRolService.getListaUsuarioRol(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          // Seguridad.resetRoles();
          paginacionInfoJson.lista.forEach((item) => {
            // Seguridad.setUsuarioRoles(new UsuarioRoles(item));
          });
        },
        error => {
          console.error(error);
          this._spinner.stop('evaluaciondocentelist2');
        },
        () => {
          this._spinner.stop('evaluaciondocentelist2');
          this.opcionesSelectProgramaDocente =
            this._catalogosService.getCatalogoProgramaDocente().
            getSelectProgramaDocente(this.erroresConsultas);
          this.verificarRoles();
        }
      );
    }
  }

  /* ---------------------------TODO INICIA modal finalizar evalacion*/

  modalFinalizarperiodo() {
    this.finalizarEvaluacion.open('lg');

  }



  cerrarModalFinalizarEvaluacion() {
    this.finalizarEvaluacion.close();
  }

  finalizarPeriodo(): void {
    let me = this;
    this._periodoEscolarService.getPeriodoEscolarVigente(
      moment(),
      this.erroresConsultas
    ).subscribe(
      response => {
        let periodo;
        response.json().lista.forEach(function(item){
          periodo = new PeriodoEscolar(item);
          let objFormulario = {
            'finalizacionEvaluacionProfesor': moment().format('DD/MM/YYYY hh:mm a')
          };
          let jsonFormulario = JSON.stringify(objFormulario, null, 2);
          me._periodoEscolarService.putPeriodoEscolar(
            periodo.id,
            jsonFormulario,
            me.erroresConsultas
          ).subscribe(
            response => {
            },
            error => {
              me.puedeTerminarPeridodoEvaluacion = true;
              console.error(error);
            },
            () => {
              me.puedeTerminarPeridodoEvaluacion = false;
              me.cerrarModalFinalizarEvaluacion();
            }
          );
        });
      },
      console.error,
      () => {

      }
    );
  }
  /* TODO TERMINA modal finalizar evalacion --------------------------*/


  /*VARIABLES MODAL RESULTADOS DE EVALUACION*/

  tabSeleccionada: number;

  /*-------------------------------- TODO INICIA modal detalle graficas */

  modalResultadosEvaluacion(): void {

    this.erroresConsultas = [];
    if (this.registroSeleccionado) {
      this.cursoOptativo = this.registroSeleccionado.materiaImpartida;
      this.detalleNombreProfesor = this.registroSeleccionado.profesor.getNombreCompleto();
      // this.resultadosEvaluacionDocente = { observaciones: [], si: 0, no: 0, respuestas: [] };
      this._spinner.start('modalResultadosEvaluacion');
      let criterios = '';
      let urlParameter = new URLSearchParams();
      criterios += 'idEstudianteMateriaImpartida.idMateriaImpartida~' +
        this.registroSeleccionado.materiaImpartida.id + ':IGUAL';
      urlParameter.set('criterios', criterios);
      let resultadosEvaluacionDocente: any = { observaciones: [], si: 0, no: 0, respuestas: [] };

      for (var x = 1; x <= 5; x++) {
        for (var y = 0; y < 14; y++) {
          if (!resultadosEvaluacionDocente.respuestas[x]) {
            resultadosEvaluacionDocente.respuestas[x] = [];
          }
          if (!resultadosEvaluacionDocente.respuestas[x][y]) {
            resultadosEvaluacionDocente.respuestas[x][y] = 0;
          }
        }

      }
      let evaluaciones: any = [];

      this._evaluacionDocenteService.getListaEvaluacionDocente(this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          let evaluaciones = response.json().lista;
          let criteriosEvaluaciones = '';
          let idEvaluacionDocente;
          let urlParameter = new URLSearchParams();
          if (evaluaciones.length >= 3) {
            evaluaciones.forEach(function (elemento) {
              idEvaluacionDocente = elemento.id;
              let existeObs = false;
              if (elemento.observaciones.length > 0) {
                for (var index = 0; index < resultadosEvaluacionDocente.observaciones.length;
                     index++) {
                  var obs = resultadosEvaluacionDocente.observaciones[index];
                  if (obs == elemento.observaciones) {
                    existeObs = true;
                    break;
                  }
                }
                if (!existeObs) {
                  resultadosEvaluacionDocente.observaciones.push(elemento.observaciones);
                }
              }

              criteriosEvaluaciones = criteriosEvaluaciones +
                ((criteriosEvaluaciones === '') ? '' : ';ORGROUPOR,') +
                'idEvaluacion~' + elemento.id + ':IGUAL';
            });
            //  TODO Se agrega variable para obtener una evaluacion docente para generar reporte en PDF 04/01/2017
            this.idEvaluacionDocente = idEvaluacionDocente;
            urlParameter.set('criterios', criteriosEvaluaciones);
            let contador = 0;
            this._respuestaEvaluacionDocenteService.getListaRespuestaEvaluacionDocente(
              this.erroresConsultas, urlParameter).subscribe(
              response => {
                let respuesta: RespuestasEvaluacionDocente;

                response.json().lista.forEach(function (element) {
                  respuesta = new RespuestasEvaluacionDocente(element);
                  // let anio = respuesta.evaluacion.estudianteMateriaImpartida.
                  //     materiaImpartida.periodoEscolar.anio;
                  let clavePregunta = parseInt(respuesta.preguntaEvaluacion.valor,
                    10);
                  let claveRespuesta = parseInt(
                    respuesta.respuestaEvaluacion.valor, 10);
                  switch (claveRespuesta) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                      resultadosEvaluacionDocente.respuestas[claveRespuesta][clavePregunta - 1]
                        += 1;
                      break;
                    case 6:
                      resultadosEvaluacionDocente.si++;
                      break;
                    case 7:
                      resultadosEvaluacionDocente.no++;
                      break;


                    default:
                      break;
                  }
                  contador++;

                });
              },
              console.error,
              () => {
                this.resultadosEvaluacionDocente = resultadosEvaluacionDocente;
                this._spinner.stop('modalResultadosEvaluacion');

                if (evaluaciones.length >= 3) {

                  this.modalResultadoEvaluacionDocente.open('lg');
                  /*let dialog: Promise<ModalDialogInstance>;
                  let modalConfig = new ModalConfig('lg', true, 27);

                  let bindings = Injector.resolve([
                    provide(ICustomModal, { useValue:
                      new ModalResultadosEvaluacionData(
                        resultadosEvaluacionDocente,
                        this.registroSeleccionado.
                        profesor.getNombreCompleto(),
                        this.registroSeleccionado.materiaImpartida.materia.
                        getStrDescripcion(),
                        this.registroSeleccionado.materiaImpartida,
                        this
                      )
                    }),
                    provide(IterableDiffers, { useValue: this.injector.
                    get(IterableDiffers) }),
                    provide(KeyValueDiffers, { useValue: this.injector.
                    get(KeyValueDiffers) })
                  ]);

                  dialog = this.modal.open(
                    <any>ModalResultadosEvaluacion,
                    bindings,
                    modalConfig
                  );*/

                } else {
                  this.addErrorsMesaje(
                    'No hay suficientes evaluaciones para graficar la materia',
                    'danger');
                }
              }
            );
          } else {
            this._spinner.stop('modalResultadosEvaluacion');
            this.addErrorsMesaje(
              'No hay suficientes evaluaciones para graficar la materia',
              'danger');
          }
        }, console.error
      );

    }
  }

  cerrarModalDetalleEvaluacion(): void {
    this.resultadosEvaluacionDocente = undefined;
    this.detalleNombreProfesor = undefined;
    this.cursoOptativo = undefined;
    this.modalResultadoEvaluacionDocente.close();
  }

  esSeleccionada(registro): boolean {
    return (this.tabSeleccionada === registro);
  }

  seleccionarTab(registro): void {
    if (this.tabSeleccionada !== registro) {
      this.tabSeleccionada = registro;
    }
  }

  descargarResultados(): void {
    let urlExportGraficos: string;
    this._spinner.start('descargarResultados');
    this._evaluacionDocenteService.getGraficosPDF(
      this.registroSeleccionado.materiaImpartida.id,
      this.registroSeleccionado.profesor.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        urlExportGraficos = response.json();
        //  console.log(urlExportGraficos);
      },
      error => {
        this._spinner.stop('descargarResultados');
      },
      () => {
        this._spinner.stop('descargarResultados');
        window.open(urlExportGraficos);

      }
    );
  }

  /* TODO TERMINA modal detalle graficas --------------------------*/







/*  constructor() { }

  ngOnInit() {
  }
  puedeVerPantalla(): boolean {
    return true;
  }*/

limpiarVariablesSession() {
    sessionStorage.removeItem('evaluacionListDocenteCriterios');
    sessionStorage.removeItem('evaluacionListDocenteOrdenamiento');
    sessionStorage.removeItem('evaluacionListDocenteLimite');
    sessionStorage.removeItem('evaluacionListDocentePagina');
 }
  }
