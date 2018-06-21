import {Component, OnInit, Renderer, Injector, ElementRef, KeyValueDiffers, IterableDiffers, ViewChild} from '@angular/core';
import {Usuarios} from '../../services/usuario/usuario.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {RespuestasEvaluacionDocenteService} from '../../services/entidades/respuestas-evaluacion-docente.service';
import {EvaluacionDocenteService} from '../../services/entidades/evaluacion-docente.service';
import {ProfesorService} from '../../services/entidades/profesor.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {ProfesorMateriaService} from '../../services/entidades/profesor-materia.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {RespuestasEvaluacionDocente} from '../../services/entidades/respuestas-evaluacion-docente.model';
import {AuthService} from '../../auth/auth.service';
import {UsuarioServices} from '../../services/usuario/usuario.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';


export class HistorialProfesorMateria {
    profesor: Profesor;
    materiaImpartida: MateriaImpartida;
    constructor(profesor: Profesor, materiaImpartida: MateriaImpartida) {
        this.profesor = profesor;
        this.materiaImpartida = materiaImpartida;
    }
}


@Component({
  selector: 'app-evaluacion-docente',
  templateUrl: './evaluacion-docente.component.html',
  styleUrls: ['./evaluacion-docente.component.css']
})
export class EvaluacionDocenteComponent {

  @ViewChild('modalResultadoEvaluacionDocente')
  modalResultadoEvaluacionDocente: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  usuarioLogueado: UsuarioSesion;
  usuarioActual: Usuarios;
  profesorActual: Profesor;

  criterios: string = '';
  ordenamiento: string = '';

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  maxSizePags: number = 5;
  limite: number = 10;

  criteriosCabezera: string = '';

  registros: Array<HistorialProfesorMateria> = [];

  registroSeleccionado: ProfesorMateria;
  desahabilitarSelectCoordiancion: boolean = false;
  idEvaluacionDocente: number;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idMateriaImpartida.idMateria.descripcion,' +
    'idProfesor.nombre,idProfesor.primerApellido,idProfesor.segundoApellido'}
  };
  columnas: Array<any> = [
    { titulo: 'Clave de materia', nombre: 'idMateriaImpartida.idMateria.clave' },
    { titulo: 'Materia*', nombre: 'idMateriaImpartida.idMateria.descripcion' },
    { titulo: 'Profesor a cargo*', nombre: 'idProfesor.primerApellido' }
  ];

  public botonValido: boolean;

  public esDocencia: boolean;
  public esCoordinador: boolean;
  public esProfesor: boolean;
  public idProgramaDocente: number;
  public idPromocion: number;

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  private opcionesSelectPromocion: Array<ItemSelects> = [];
  private opcionesSelectMateria: Array<MateriaImpartida> = [];

  // variables para detalle de evaluacion docente
  private resultadosEvaluacion: any = undefined;
  private nombreProfesorEvaluacion: string = undefined;
  private materiaOptativaEvaluacion: MateriaImpartida = undefined;
  // fin de variables para detalles de evaluacion docente

  // varialbe para obtener materias tutoriales 
  private criteriosMateriasTutoriales: string = undefined;
  private idMateriaSelect: number = undefined;
  private registrosAux: Array<HistorialProfesorMateria> = [];
  // fin de varialbes para obtener materias tutoriales

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
              private _estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService,
              private _authService: AuthService
  ) {
    this.esDocencia = false;
    this.esCoordinador = false;
    this.esProfesor = false;
    this.prepareServices();

          if (sessionStorage.getItem('evaluacionIdPromocion')) {
      let promocion = 'idPromocion';

    }

    if (sessionStorage.getItem('evaluacionDocenteCriterios')) {
      this.onCambiosTabla();
    }
  


  }

  verificarRoles(): void {

    if (this._authService.hasRol('DOCENCIA') ) {// Seguridad.hasRol('DOCENCIA')) {
      this.esDocencia = true;
      this.opcionesSelectProgramaDocente =
        this._catalogosService.getCatalogoProgramaDocente().
        getSelectProgramaDocente(this.erroresConsultas);
      //this.onCambiosTabla();
    } else {

      if (this._authService.hasRol('COORDINADOR')) { // Seguridad.hasRol('COORDINADOR')) {
        this.esCoordinador = true;
        if (this.usuarioActual.programaDocente && this.usuarioActual.programaDocente.id) {
          this.opcionesSelectProgramaDocente = [];
          this.opcionesSelectProgramaDocente.push(new ItemSelects(
            this.usuarioActual.programaDocente.id,
            this.usuarioActual.programaDocente.descripcion
          ));
          this.desahabilitarSelectCoordiancion = true;
          this.cambioProgramaDocenteFiltro(this.usuarioActual.programaDocente.id);
          //this.onCambiosTabla();
        }
      } else
      if (this._authService.hasRol('PROFESOR')) {

        this.esProfesor = true;

        this.opcionesSelectProgramaDocente =
          this._catalogosService.getCatalogoProgramaDocente().
          getSelectProgramaDocente(this.erroresConsultas);

        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';

        urlSearch.set('criterios', criterio);

        this._spinner.start('buscarProfesor');
        this._profesorService.getListaProfesor(
          this.erroresConsultas,
          urlSearch
        ).subscribe(
          response => {
            let respuesta = response.json();

            respuesta.lista.forEach((item) => {
              this.profesorActual = new Profesor(item);
            });
          },
          error => { this._spinner.stop('buscarProfesor'); },
          () => {
            this._spinner.stop('buscarProfesor');
            //this.onCambiosTabla();
          }
        );
      }
    }
  }


  puedeVerPantalla(): boolean {
    return (this.esDocencia || this.esCoordinador || this.esProfesor);
  }

  onCambiosTabla(): void {

    this.criterios = 'titular~true:IGUAL';


    if (this.profesorActual) {
      this.criterios = this.criterios + ((this.criterios === '') ? '' : ',') +
        'idProfesor.id~' + this.profesorActual.id + ':IGUAL';
      this.obtenerResultados();
    } else {
      if (this.esCoordinador
        && this.usuarioActual.hasOwnProperty('programaDocente')
        && this.usuarioActual.programaDocente.id > 0) {

        this.criterios = this.criterios + ((this.criterios === '') ? '' : ',') +
          'idMateriaImpartida.idMateria.idProgramaDocente.id~' +
          this.usuarioActual.programaDocente.id + ':IGUAL';
        this.obtenerResultados();
      } else {

        this.obtenerResultados();
      }
    }

  }

  obtenerResultados(): void {
    this.registroSeleccionado = undefined;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

     if (!sessionStorage.getItem('evaluacionDocenteCriterios')) {
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
      sessionStorage.setItem('evaluacionDocenteCriterios', criterios);
      sessionStorage.setItem('evaluacionDocenteOrdenamiento', ordenamiento);
      sessionStorage.setItem('evaluacionDocenteLimite', this.limite.toString());
      sessionStorage.setItem('evaluacionDocentePagina', this.paginaActual.toString());

    }
    urlSearch.set('criterios', sessionStorage.getItem('evaluacionDocenteCriterios')
      ? sessionStorage.getItem('evaluacionDocenteCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('evaluacionDocenteOrdenamiento')
      ? sessionStorage.getItem('evaluacionDocenteOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('evaluacionDocenteLimite')
      ? sessionStorage.getItem('evaluacionDocenteLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('evaluacionDocentePagina')
      ? sessionStorage.getItem('evaluacionDocentePagina') : this.paginaActual.toString());

    this._profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];

        let begin = ((this.paginaActual - 1) * this.limite);
        let end = begin + this.limite;

        for (let i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }

        paginacionInfoJson.lista.forEach((item) => {
          // this.registros.push(new ProfesorMateria(item));
          this.registros.push(new HistorialProfesorMateria(
            new Profesor(item.id_profesor),
            new MateriaImpartida(item.id_materia_impartida)
          ));
        });

        this.setPaginacion(new PaginacionInfo(
          this.registros.length,
          this.obtenerNumeroPaginas(),
          this.paginaActual,
          this.limite
        ));

        this.registrosAux = this.registros.slice(begin, end);
      },
      error => {
        this._spinner.stop('evaluaciondocente1');

      },
      () => {
        this._spinner.stop('evaluaciondocente1');
        if (this.criteriosCabezera !== '' && this.registros.length < 0) {
          this.crearCriteriosMateriasTutoriales();
          this.agregarMateriasTutoriales();
        }
      }
    );
  }

  crearCriteriosMateriasTutoriales(): void {

    if (this.profesorActual && this.idPromocion) {
      if (this.idMateriaSelect) {
        this.criteriosMateriasTutoriales =
        'idMateriaImpartida.idPromocion~' + this.idPromocion + ':IGUAL;AND,' +
        'idMateriaImpartida~' + this.idMateriaSelect + ':IGUAL;AND,' +
        'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
        'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND,' +
        'idEstudiante.idTutor.idProfesor.idUsuario~' +
        this.usuarioActual.id + ':IGUAL;AND';

        //this.idMateriaSelect = undefined;
      } else {
        this.criteriosMateriasTutoriales =
        'idMateriaImpartida.idPromocion~' + this.idPromocion + ':IGUAL;AND,' +
        'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
        'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND,' +
        'idEstudiante.idTutor.idProfesor.idUsuario~' +
        this.usuarioActual.id + ':IGUAL;AND';
      }

    } else if (this.esCoordinador && this.idPromocion) {
      if (this.idMateriaSelect) {
        this.criteriosMateriasTutoriales =
          'idMateriaImpartida.idPromocion~'
          + this.idPromocion + ':IGUAL;AND,' +
          'idMateriaImpartida~' + this.idMateriaSelect + 'IGUAL;AND' +
          'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
              'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND';
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
    if (this.profesorActual) {
      this.criteriosMateriasTutoriales =
        'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
        'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND,' +
        'idEstudiante.idTutor.idProfesor~' +
        this.profesorActual.id + ':IGUAL;AND';

    } else if (this.esCoordinador) {
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
        let begin = ((this.paginaActual - 1) * this.limite);
        let end = begin + this.limite;

        response.json().lista.forEach((estudianteMateria) => {
            if (!this.materiaImpartidaEstaAgregada(
                new EstudianteMateriaImpartida(estudianteMateria).materiaImpartida.id)) {
                this.registros.push(
                     new HistorialProfesorMateria(
                        new Profesor(estudianteMateria.id_estudiante.id_tutor.id_profesor),
                        new MateriaImpartida(estudianteMateria.id_materia_impartida),
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
      },
      error => {
        this._spinner.stop('agregarMaterias');
      },
      () => {
        this._spinner.stop('agregarMaterias');
      }
    );

  }

  private materiaImpartidaEstaAgregada(idMateriaImpartida: number): boolean {
        let estaAgregada: boolean = false;
        this.registros.forEach((registro) => {
           if (registro.materiaImpartida.id == idMateriaImpartida) {
               estaAgregada = true;
           }
        });
        return estaAgregada;
  }

  private materiaImpartidaSelectEstaAgregada(idMateriaImpartida: number): boolean {
    let estaAgregada: boolean = false;
    this.opcionesSelectMateria.forEach((idMateriaSelect) => {
      if (idMateriaSelect.id == idMateriaImpartida) {
        estaAgregada = true;
      }
    });
    return estaAgregada;
  }

  obtenerNumeroPaginas() {
    return Math.ceil(this.registros.length / this.limite);
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
    this.onCambiosTabla();
  }

  limpiarFiltro(): void {
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

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.idProgramaDocente = idProgramaDocente;
    this.opcionesSelectMateria = [];
    this.opcionesSelectPromocion =
      this._catalogosService.getPromocion().
      getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  cambioPromocionFiltro(idPromocion: number): void {
    this.opcionesSelectMateria = [];
    let urlParameter: URLSearchParams = new URLSearchParams();

    let criterios = 'idMateriaImpartida.idPromocion.id~' + idPromocion + ':IGUAL';
    this.idPromocion = idPromocion;
    if (this.profesorActual) {
      criterios += ',idProfesor.id~' + this.profesorActual.id + ':IGUAL';
    }

    urlParameter.set('criterios', criterios);

    this._profesorMateriaService.
    getListaProfesorMateria(this.erroresConsultas, urlParameter).subscribe(
      response => {

        response.json().lista.forEach((item) => {
          this.opcionesSelectMateria.push(
              new MateriaImpartida(item.id_materia_impartida));
        });

        urlParameter.set('criterios', 'idMateriaImpartida.idPromocion~' + idPromocion +
            ':IGUAL;AND,idEstudiante.idTutor.idProfesor.id~' + this.profesorActual.id +
            ':IGUAL;AND,idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND');
        let materiasTutorialesIds: Array<number> = [];

        this._spinner.start('buscarMateriasTutoriales');
        this._estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
          this.erroresConsultas,
          urlParameter
        ).subscribe(
          response => {
            response.json().lista.forEach((item) => {
              if (!this.materiaImpartidaSelectEstaAgregada(item.id_materia_impartida.id)) {
                this.opcionesSelectMateria.push(
                  new MateriaImpartida(item.id_materia_impartida));
              }
            });
          },
          error => {
            this._spinner.stop('buscarMateriasTutoriales');
          },
          () => {
            this._spinner.stop('buscarMateriasTutoriales');
          }
        );
      },
      console.error,
      () => { }
    );
  }
  buscarCriteriosCabezera(idMateria): void {
   this.limpiarVariablesSession();
    this.criteriosCabezera = '';
    if (this.idProgramaDocente) {
      this.criteriosCabezera = 'idMateriaImpartida.idPromocion.idProgramaDocente.id~'
        + this.idProgramaDocente + ':IGUAL';
    }
    if (this.idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + ',idMateriaImpartida.idPromocion.id~'
        + this.idPromocion + ':IGUAL';       
  }
    if (idMateria) {
      this.idMateriaSelect = idMateria;
      this.criteriosCabezera = this.criteriosCabezera + ',idMateriaImpartida.id~'
        + idMateria + ':IGUAL';
         }
    sessionStorage.setItem('evaluacionidProgramaDocente', this.idProgramaDocente.toString());
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
    if (numero === 2) {
      this.botonValido = true;
    } else {
      this.botonValido = false;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////

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

  private prepareServices(): void {

    this.usuarioLogueado = this._authService.getUsuarioLogueado(); // Seguridad.getUsuarioLogueado();

    if (AuthService.isLoggedIn() ) { // Seguridad.isLoggedIn()) {

      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'id~' + this.usuarioLogueado.id  + ':IGUAL';
      urlSearch.set('criterios', criterio);

      this._spinner.start('evaluaciondocente2');
      this._usuarioService.getListaUsuario(this.erroresConsultas,
        urlSearch).subscribe(
        response => {

          let respuesta = response.json();
          respuesta.lista.forEach((item) => {

            this.usuarioActual = new Usuarios(item);
            urlSearch = new URLSearchParams();
            criterio = 'idUsuario~' + ':IGUAL';
            urlSearch.set('criterios', criterio);

            this._usuarioRolService.getListaUsuarioRol(
              this.erroresConsultas,
              urlSearch
            ).subscribe(
              response => {

                let paginacionInfoJson = response.json();
                // authService.resetRoles();
                paginacionInfoJson.lista.forEach((item) => {
                  // authService.setUsuarioRoles(new UsuarioRol(item));
                });
              },
              error => {
                this._spinner.stop('evaluaciondocente2');
              },
              () => {
                this._spinner.stop('evaluaciondocente2');
                this.verificarRoles();
              }
            );
          });

        });

    }

  }
  /*----------TODO INICIA modal detalle resultados de evaluacion-------*/
  modalResultadosEvaluacion(): void {
    this.erroresConsultas = [];
    
    let profesorNombre: string;
    let materiaNombre: string;
    let cursoOptativo: MateriaImpartida;

    if (this.registroSeleccionado) {
      this._spinner.start('modalResultadosEvaluacion');

      profesorNombre = this.registroSeleccionado.profesor.getNombreCompleto();
      materiaNombre = this.registroSeleccionado.materiaImpartida.materia.getStrDescripcion();
      cursoOptativo = this.registroSeleccionado.materiaImpartida;
      let criterios = '';
      let urlParameter = new URLSearchParams();
      criterios += 'idEstudianteMateriaImpartida.idMateriaImpartida~' +
        this.registroSeleccionado.materiaImpartida.id + ':IGUAL';
      urlParameter.set('criterios', criterios);

      let resultados: any = { observaciones: [], si: 0, no: 0, respuestas: [] };
      for (var x = 1; x <= 5; x++) {
        for (var y = 0; y < 14; y++) {
          if (!resultados.respuestas[x]) {
            resultados.respuestas[x] = [];
          }
          if (!resultados.respuestas[x][y]) {
            resultados.respuestas[x][y] = 0;
          }
        }
      }

      let evaluaciones: any = [];

      this._evaluacionDocenteService.getListaEvaluacionDocente(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          let auxEvaluaciones = [];

          if (response.json().lista.length > 0) {
            auxEvaluaciones.push(response.json().lista[0]);
          }
          // let evaluaciones = response.json().lista;

          response.json().lista.forEach((item) => {
            if (!this.registroEstaAgregado(auxEvaluaciones, item.id_estudiante_materia_impartida.id)) {
              auxEvaluaciones.push(item);
            }
          });
          

          evaluaciones = auxEvaluaciones;

          let criteriosEvaluaciones = '';
          let idEvaluaciondocnete ;
          let urlParameter = new URLSearchParams();
          if (evaluaciones.length >= 3) {
            evaluaciones.forEach(function (elemento) {
              idEvaluaciondocnete = elemento.id;
              var existeObs = false;
              if (elemento.observaciones.length > 0) {
                for (var index = 0; index < resultados.observaciones.length; index++) {
                  var obs = resultados.observaciones[index];
                  if (obs == elemento.observaciones) {
                    existeObs = true;
                    break;
                  }
                }
                if (!existeObs) {
                  resultados.observaciones.push(elemento.observaciones);
                }
              }
              criteriosEvaluaciones = criteriosEvaluaciones + ((criteriosEvaluaciones === '') ? '' : ';ORGROUPOR,') +
                'idEvaluacion~' + elemento.id + ':IGUAL';
            });
            
            // TODO Se agrega variable para obtener una evaluacion docente para generar reporte en PDF 04/01/2017
            this.idEvaluacionDocente = idEvaluaciondocnete;

            urlParameter.set('criterios', criteriosEvaluaciones);
            let contador = 0;
            var me = this;
            this._respuestaEvaluacionDocenteService.getListaRespuestaEvaluacionDocente(
              this.erroresConsultas,
              urlParameter,
              true
            ).subscribe(
              response => {
                let respuesta;

                response.json().lista.forEach(function (element) {
                  respuesta = new RespuestasEvaluacionDocente(element);
                  // let anio = respuesta.evaluacion.estudianteMateriaImpartida.materiaImpartida.periodoEscolar.anio;
                  let clavePregunta = parseInt(respuesta.preguntaEvaluacion.valor, 10);
                  let claveRespuesta = parseInt(respuesta.respuestaEvaluacion.valor, 10);
                  switch (claveRespuesta) {
                    case 1:
                    case 2:
                    case 3:
                    case 4:
                    case 5:
                      resultados.respuestas[claveRespuesta][clavePregunta - 1] += 1;
                      break;
                    case 6:
                      resultados.si++;
                      break;
                    case 7:
                      resultados.no++;
                      break;
                    default:
                      break;
                  }
                  contador++;

                });
              },
              console.error,
              () => {
                this._spinner.stop('modalResultadosEvaluacion');

                if (evaluaciones.length >= 3) {
                  this.resultadosEvaluacion = resultados;
                  this.nombreProfesorEvaluacion = profesorNombre;
                  this.materiaOptativaEvaluacion = cursoOptativo;
                  this.modalResultadoEvaluacionDocente.open('lg');
                  
                } else {
                  this.addErrorsMesaje('No hay suficientes evaluaciones para graficar la materia', 'danger');
                }
              }
            );
          } else {
            this._spinner.stop('modalResultadosEvaluacion');
            this.addErrorsMesaje('No hay suficientes evaluaciones para graficar la materia', 'danger');
          }
        }, console.error
      );
    }
  }

  private cerrarModalDetalleEvaluacion(): void {
    this.resultadosEvaluacion = undefined;
    this.nombreProfesorEvaluacion = undefined;
    this.materiaOptativaEvaluacion = undefined;
    this.modalResultadoEvaluacionDocente.close();
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

  private descargarResultados(): void {
        let urlExportGraficos: string;
        this._spinner.start('descargarGrafica');
        this._evaluacionDocenteService.getGraficosPDF(
            this.registroSeleccionado.materiaImpartida.id,
            this.registroSeleccionado.profesor.id,
            this.erroresConsultas
        ).subscribe(
            response => {
                urlExportGraficos = response.json();
            },
            error => {
                this._spinner.stop('descargarGrafica');
            },
            () => {
                this._spinner.stop('descargarGrafica');
                window.open(urlExportGraficos);

            }
        );
  }

  /*----------TODO TERMINA modal detalle resultados de evaluacion-------*/
/*  constructor() { }

  ngOnInit() {
  }*/

 limpiarVariablesSession() {
    sessionStorage.removeItem('evaluacionDocenteCriterios');
    sessionStorage.removeItem('evaluacionDocenteOrdenamiento');
    sessionStorage.removeItem('evaluacionDocenteLimite');
    sessionStorage.removeItem('evaluacionDocentePagina');
 }
 }
