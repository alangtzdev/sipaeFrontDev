import {Component, OnInit,
  Renderer, Injector,
  ElementRef, ViewChild,
  NgZone, Inject} from '@angular/core';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ComiteTutorial} from '../../services/entidades/comite-tutorial.model';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {Profesor} from '../../services/entidades/profesor.model';
import {Validacion} from '../../utils/Validacion';
import {MiembroJurado} from '../../services/entidades/miembro-jurado.model';
import {MiembroJuradoService} from '../../services/entidades/miembro-jurado.service';
import {ExamenGradoService} from '../../services/entidades/examen-grado.service';
import {ComiteTutorialService} from '../../services/entidades/comite-tutorial.service';
import {TutorService} from '../../services/entidades/tutor.service';
import {ProfesorService} from '../../services/entidades/profesor.service';
import {SalaService} from '../../services/entidades/sala.service';
import {ConfigService} from '../../services/core/config.service';
import { NgUploaderOptions } from 'ngx-uploader';
import {EstudianteTutor} from '../../services/entidades/estudiante-tutor.model';
import {VotoAprobatorio} from '../../services/entidades/voto-aprobatorio.model';
import {VotoAprobatorioService} from '../../services/entidades/voto-aprobatorio.service';
import * as moment from 'moment';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';

@Component({
  selector: 'app-asignar-comite',
  templateUrl: './asignar-comite.component.html',
  styleUrls: ['./asignar-comite.component.css']
})
export class AsignarComiteComponent {

  @ViewChild('modalAgregarEditarComite')
  modalAgregarEditarComite: ModalComponent;
  @ViewChild('modalAdjuntarVotos')
  modalAdjuntarVotos: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  // se declaran variables para consultas de base de datos
  programaDocenteService;
  catalogoServices;
  erroresConsultas: Array<ErrorCatalogo> = [];
  limite: number = 10;
  maxSizePags: number = 5;
  paginaActual: number = 1;
  formulario: FormGroup;
  opcionesSelectPromocion: Array<ItemSelects>;
  // erroresConsultas: Array<ErrorCatalogo> = [];
  registros: Array<Estudiante> = [];
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  lgacService;
  comiteTutorialService;
  catalogoService;
  registroComiteTutorial: Array<ComiteTutorial>= [];
  idComiteTutorial: number;
  // tutorService;
  promocionesService;
  oculto: boolean = false;
  usuarioRol: UsuarioRoles;
  listaProgramas: Array<ItemSelects> = [];
  usuarioRolService;
  botonBuscar: boolean = false;
  estudianteService;
  estudianteTutorService;
  exportarFormato = '';

  columnas: Array<any> = [
    { titulo: 'Nombre del estudiante *', nombre: 'idDatosPersonales'},
    { titulo: 'Título del proyecto de investigación', nombre: 'idTutor'},
    { titulo: 'Fecha de asignación', nombre: 'idTutor'},
    { titulo: 'Estatus', nombre: 'idTutor'},
    { titulo: 'Tutor / Director', nombre: 'idTutor'}
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idDatosPersonales.nombre,idDatosPersonales.primerApellido,idDatosPersonales.segundoApellido',
      columnasUnCriterio: 'idDatosPersonales.primerApellido,idDatosPersonales.segundoApellido',
      columnasDosCriterios: 'idDatosPersonales.segundoApellido,idDatosPersonales.nombre',
      columnaTercer: 'idDatosPersonales.nombre'}
  };

  registroSeleccionado: Estudiante;
  private opcionesLGAC: Array<ItemSelects> = [];
  private opcionesProgramaDocente: Array<ItemSelects> = [];

  //// Inicia variables agregar - editar comite /////
  private idEstudianteAgregarEditar: number;
  private tutorEditar: number;
  private tutor: Profesor;
  private formularioAsignarComite: FormGroup;
  private formularioExamen: FormGroup;
  private formularioRegistroPagina: FormGroup;
  private validacionActiva: boolean = false;
  private juradoPresente: boolean;
  private edicionFormulario: boolean = false;
  private tutorDirector: Profesor;
  private entidadComiteTutoria: ComiteTutorial;
  private edicionAgregar: boolean = false;
  private registrosMiebrosJurados: Array<MiembroJurado> = [];

  ////// picker ///
  public hstep: number = 1;
  public mstep: number = 1;
  dt: Date = new Date();
  lunesI: Date;

  // raidobuttons
  auxiliarVocal: boolean = false;
  auxiliarPresidente: boolean = false;
  auxiliarSuplenteUno: boolean = false;
  auxiliarSuplenteDos: boolean = false;

  private opcionesProfesores: Array<ItemSelects> = [];
  private opiconesSalas: Array<ItemSelects> = [];
  private errorGuardado: Array<ErrorCatalogo> = [];

  // ids Jurados
  private idJuradoPresidente: number;
  private idJuradoVocal: number;
  private idJuradoSecretaro: number;
  private idJuradoSuplenteUno: number;
  private idJuradoSuplenteDos: number;
  private idExamenGrado: number;
  /// Termina variables agregar - editar comite /////

  // Inica variables de adjuntar votos //////
  nombreEstudiante: string = '';
  proyectoInvestigacion: string = '';
  tutorAdjuntarVoto: string = '';
  tipoTesis: string = '';
  tituloTesis: string = '';
  directorTesis: string = '';
  coDirectorTesis: string = '';

  entidadEstudiante: Estudiante;
  uploadFile: any;

  options: NgUploaderOptions;

  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  registroSeleccionadoAdjuntarVoto: Estudiante;
  estudianteTutor: EstudianteTutor = undefined;
  idArchivo: number;
  private votoAprobatorio: Array<VotoAprobatorio> = [];
  registroSeleccionadoDocumento: VotoAprobatorio;

  columnasAdjuntarVoto: Array<any> = [
      { titulo: 'Voto', nombre: 'idArchivoVoto', sort: false }
  ];
  // Fin de variables de adjuntar votos /////

  // Inicia variables de detalle comite ///
  registrosMiembroJuradosDetalle: Array<MiembroJurado> = [];
  entidadDirector: Profesor = undefined;
  // Fin de variables de detralle comite ///

  constructor(@Inject(NgZone) private zone: NgZone,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private authService: AuthService,
              private juradoService: MiembroJuradoService,
              private examenGradoService: ExamenGradoService,
              private comiteService: ComiteTutorialService,
              private tutorService: TutorService,
              private profesorService: ProfesorService,
              private salaService: SalaService,
              private votoAprobatorioService: VotoAprobatorioService,
              private _spinner: SpinnerService) {
    let usuarioLogueado: UsuarioSesion = this.authService.getUsuarioLogueado();
    this.crearFormularioAsignarComite();
    this.crearFormularioExamen();
    this.inicializarOpcionesNgZone();
    this.formulario = new FormGroup({
      idProgramaDocente: new FormControl(),
      idLgac: new FormControl(),
    });
    // this._spinner.start();
    this.prepareServices();
    this.obtenerRegistrosComiteTutorial();
    this.recuperarPermisosUsuario(usuarioLogueado.id);

    if (sessionStorage.getItem('asignarComiteCriterios')) {
      this.onCambiosTabla();
    }

    this.formularioRegistroPagina = new FormGroup({
      registrosPorPagina: new FormControl('')
    });

    if (sessionStorage.getItem('asignarComiteLimite')) {
      this.limite = +sessionStorage.getItem('asignarComiteLimite');
    }
    (<FormControl>this.formularioRegistroPagina.controls['registrosPorPagina'])
      .setValue(this.limite);
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion = this.promocionesService
      .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
    this.limpiarVariablesSession();
    this.criteriosCabezera = 'idPromocion.idProgramaDocente~' + idProgramaDocente + ':IGUAL';
    if (idPromocion) {
      this.criteriosCabezera += ',idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    sessionStorage.setItem('asignarComiteIdPromocion', idPromocion.toString());
    this.onCambiosTabla();
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this._spinner.start('asignarcomite1');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          if (this.usuarioRol.rol.id == 2) {
            this.oculto = true;
          }
        });
      }, error => {

      },
      () => {
        this.getProgramaDocente();
        this._spinner.stop('asignarcomite1');
      }
    );
  }

  onCambiosTabla(): void {

    this._spinner.start('asignarcomite2');
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
      // criterios = '';
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {

      let filtrosCriterio: Array<string> = this.configuracion.filtrado.textoFiltro.split(' ');
      let filtros: Array<string> = [];
      if (filtrosCriterio.length >= 1 && criterios != '')
        criterios = criterios + ';ANDGROUPAND';
      if (filtrosCriterio.length == 1) {
        filtros = this.configuracion.filtrado.columnas.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        });
      }if (filtrosCriterio.length == 2) {
        filtros = this.configuracion.filtrado.columnasUnCriterio.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[0] + ':LIKE;OR';
        });
        filtros = this.configuracion.filtrado.columnasDosCriterios.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[1] + ':LIKE;OR';
        });
      }
      if (filtrosCriterio.length >= 3) {
        filtros = this.configuracion.filtrado.columnasUnCriterio.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[0] + ':LIKE;OR';
        });
        filtros = this.configuracion.filtrado.columnasDosCriterios.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[1] + ':LIKE;OR';
        });
        filtros = this.configuracion.filtrado.columnaTercer.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[2] + ':LIKE;OR';
        });
      }

      urlSearch.set('criterios', criterios);
    }

    ordenamiento = '';
    if (!sessionStorage.getItem('asignarComiteOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('asignarComiteOrdenamiento', ordenamiento);
    }

    if (!sessionStorage.getItem('asignarComiteCriterios')) {
      sessionStorage.setItem('asignarComiteCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('asignarComiteLimite') ? +sessionStorage.getItem('asignarComiteLimite') :
      this.limite;
    this.paginaActual = +sessionStorage.getItem('asignarComitePagina') ? +sessionStorage.getItem('asignarComitePagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('asignarComiteCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('asignarComiteOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    this.estudianteService.getListaEstudianteOpcional(
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
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('asignarcomite2');
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop('asignarcomite2');
      }
    );
    // this._spinner.stop();
  }

  obtenerRegistrosComiteTutorial(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    this.comiteTutorialService.getListaComiteTutorial(
      this.erroresConsultas,
      urlSearch,
      true
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        // let paginasArray: Array<number> = [];
        this.registroComiteTutorial = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.registroComiteTutorial.push(new ComiteTutorial(item));
        });
      },
      error => {

      },
      () => {
      }
    );
  }

  obtenerRegistroEntidadComite(idEstudianteTutor): void {
    this.entidadComiteTutoria = undefined;
    this.registroComiteTutorial.forEach((registoComite) => {
      if ( idEstudianteTutor === registoComite.estudiante.id ) {
        this.entidadComiteTutoria = registoComite;
      }

    });

  }

  hayRegistro(idEstudianteTutor): boolean {
    this.idComiteTutorial = 0;
    this.entidadComiteTutoria = undefined;
    let registroEncontrado: boolean = false;
    this.registroComiteTutorial.forEach((registoComite) => {
      if ( idEstudianteTutor === registoComite.estudiante.id ) {
        this.idComiteTutorial = registoComite.id;
        this.entidadComiteTutoria = registoComite;
        registroEncontrado = true;
      }

    });
    return registroEncontrado;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    sessionStorage.removeItem('asignarComiteLimite');
    this.limite = Number(limite);
    sessionStorage.setItem('asignarComiteLimite', this.limite.toString());
    sessionStorage.setItem('asignarComitePagina', '1');
    this.onCambiosTabla();

  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
    sessionStorage.removeItem('asignarComiteOrdenamiento');
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

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    sessionStorage.setItem('asignarComitePagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  activarBotonBusqueda(numero: number): any {
    if  ( numero === 1) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  mostarBotonAsignarComite(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.tutor.tipo) {
        // console.log(this.registroSeleccionado.tutor.id);
        if (!this.hayRegistro(this.registroSeleccionado.id) &&
          this.registroSeleccionado.tutor.tipo.id === 2) {
          return true;
        }else {
          return false;
        }
      } else {
        return false;
      }
    }
  }

  descargarOficioExamenGrado(): void {
    // console.log('REg. Seleccionado::: ', this.registroSeleccionado.getNombreCompleto());
    this._spinner.start('asignarcomite3');
    this.estudianteService.getFormatoPdf(
      this.registroSeleccionado.id,
      this.erroresConsultas, 'ComiteTutorial'
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
        this._spinner.stop('asignarcomite3');
      }
    );
  }

  mostrarBotonesEditarDetalle(): boolean {
    if (this.registroSeleccionado &&
      this.hayRegistro(this.registroSeleccionado.id)) {
      return true;
    }else {
      return false;
    }
  }

  private getProgramaDocente(): void {
    if (this.oculto) {
      this.listaProgramas.push(
        new ItemSelects (
          this.usuarioRol.usuario.programaDocente.id,
          this.usuarioRol.usuario.programaDocente.descripcion
        )
      );
      (<FormControl>this.formulario.controls['idProgramaDocente']).patchValue(    // .updateValue(
        this.listaProgramas[0].id);
      this.cambioProgramaDocenteFiltro(this.listaProgramas[0].id);
      this._spinner.stop('asignarcomite3');
      this.buscarCriteriosCabezera(this.listaProgramas[0].id, null);
    } else {
      (<FormControl>this.formulario.controls['idProgramaDocente']).patchValue(0);   // .updateValue(0);
      this.listaProgramas = this._catalogosService.
      getCatalogoProgramaDocente()
        .getSelectProgramaDocente(this.erroresConsultas);
    }
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.estudianteService =
      this._catalogosService.getEstudiante();
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.opcionesProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.promocionesService = this._catalogosService.getPromocion();
    this.comiteTutorialService = this._catalogosService.getComiteTutorialService();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.estudianteTutorService = this._catalogosService.getEstudianteTutorService();

  }

  /**********************************************
   * ********************************************
   * INICIA SECCION DE AGREGAR - EDITAR COMITE **
  ***********************************************/

  modalAsignarEditarComite(): void {
    this.idEstudianteAgregarEditar = this.registroSeleccionado.id;
    this.tutorEditar = this.registroSeleccionado.id;
    this.tutorDirector = this.registroSeleccionado.tutor.profesor;
    this.lunesI = new Date();
    this.dt = new Date();

    this.obtenerCatalogoProfesor();
    this.obtenerCatalogoSalas();

     this.modalAgregarEditarComite.open('lg');

    if (this.idComiteTutorial) {
      this.edicionAgregar = true;
      this.edicionFormulario = true;
      this.idExamenGrado = this.entidadComiteTutoria.examenGrado.id;
      this.cargarInfomracionComite();
      this.obtenerJuradosEdicion();

    }

  }

  private obtenerCatalogoProfesor(): void {
    this.opcionesProfesores =
      this.profesorService.getSelectProfesor(this.erroresConsultas);

  }

  private obtenerCatalogoSalas(): void {
    this.opiconesSalas =
      this.salaService.getSelectSala(this.erroresConsultas);
  }

  private cargarInfomracionComite(): void {
    this.getControl('tituloTesis').patchValue(this.entidadComiteTutoria.tituloTesis);
    this.getControl('idProfesorLectorUno').patchValue(this.entidadComiteTutoria.profesorLectorUno.id);
    this.getControl('idProfersorLectorDos').patchValue(this.entidadComiteTutoria.profersorLectorDos.id);
    this.getControl('idSala').patchValue(this.entidadComiteTutoria.examenGrado.idSala.id);
    this.getControl('fechaExamen').patchValue(this.entidadComiteTutoria.examenGrado.getHoraFecha());

    let fechaInicioRecuperar = moment(this.entidadComiteTutoria.examenGrado.fechaExamen);
    this.dt = new Date(fechaInicioRecuperar.toJSON());
    this.lunesI = new Date(this.entidadComiteTutoria.examenGrado.fechaExamen);
      // detalles de los jueces

  }

  private obtenerJuradosEdicion(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idComiteTutorial~'
        + this.idComiteTutorial + ':IGUAL');
    this._spinner.start('obtenerMiembros');
    this.juradoService.getListaMiembrosJurado(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registrosMiebrosJurados = [];


        paginacionInfoJson.lista.forEach((item) => {
          this.registrosMiebrosJurados.push(new MiembroJurado(item));
        });
      },
      error => {
        console.log(error);
      },
      () => {
        this.cargarInformacionJuradosEdicion();
        this._spinner.stop('obtenerMiembros');
      }
    );
  }

  private cargarInformacionJuradosEdicion(): void {
    this.registrosMiebrosJurados.forEach((item) => {

      if (item.tipoJurado.id === 1) { // jurado vocal
        this.idJuradoVocal = item.id;
        this.getControl('idJuradoVocal').patchValue(item.profesor.id);

        if (item.presencial) {
          this.auxiliarVocal = true;
          this.getControl('presencialJuradoVocal').patchValue(item.presencial);

        }
      } else if (item.tipoJurado.id === 2) { // jurado secretario
        this.idJuradoSecretaro = item.id;
        this.getControl('idJuradoSecretario').patchValue(item.profesor.id);

      } else if (item.tipoJurado.id === 3) {// suplente uno
        this.idJuradoSuplenteUno = item.id;
        this.getControl('idSuplenteUno').patchValue(item.profesor.id);

        if (item.presencial) {
          this.auxiliarSuplenteUno = true;
          this.getControl('presencialSuplenteUno').patchValue(item.presencial);

        }
      }else if (item.tipoJurado.id === 4) { // jurado presidente
        this.idJuradoPresidente = item.id;
        if (item.presencial) {
          this.auxiliarPresidente = true;
          this.getControl('presencialJuradoPresidente').patchValue(item.presencial)

        }
      } else if (item.tipoJurado.id === 5) {// jurado suplente dos
        this.idJuradoSuplenteDos = item.id;
        this.getControl('idSuplenteDos').patchValue(item.profesor.id);

        if (item.presencial) {
          this.auxiliarSuplenteDos = true;
          this.getControl('presencialSuplenteDos').patchValue(item.presencial)

        }
      }
    });

  }

  public getDate(): number {
    let fecha = moment(this.dt).format('DD/MM/YYYY hh:mm a');
    let fechaString = 'fechaInicio';
    return this.dt && this.dt.getTime() || new Date().getTime();
  }

  validarFormulario(): boolean {
    if (this.formularioAsignarComite.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this._spinner.start('guardar');

      if (this.edicionFormulario) {
        this.editarRegistroComite();
        this.editarTituloTesisDefinitivo();

      } else { // creacion del comite

        let formularioExamenGrado = new FormGroup({
          idEstudiante: new FormControl(this.idEstudianteAgregarEditar),
          idSala : new FormControl(this.formularioAsignarComite.value.idSala),
          fechaExamen: new FormControl(
            this.formularioAsignarComite.value.fechaExamen + ' '
              + this.formularioAsignarComite.value.hora)
        });

        let jsonFormularioExamen = JSON.stringify(formularioExamenGrado.value, null, 2);

        this.examenGradoService.postExamenGrado(
            jsonFormularioExamen,
            this.errorGuardado
        ).subscribe(
          response => {
            // this.editarTituloTesisDefinitivo();
            this.idExamenGrado = response.json().id;
            // this.editarTituloTesisDefinitivo();
            // this.agregarRegistroComite();
            // this.onCambiosTabla();
          },
          erro => {

          },
          () => {
            this.editarTituloTesisDefinitivo();
            // this.editarTituloTesisDefinitivo();
            this.agregarRegistroComite();
          }
        );
      }
    } else {
           // //console.log('incorrecto');
    }
  }

  private editarRegistroComite(): void {
    let formularioComite = new FormGroup ({
      tituloTesis: new FormControl(this.formularioAsignarComite.value.tituloTesis),
      idProfersorLectorDos: new FormControl(
          this.formularioAsignarComite.value.idProfersorLectorDos),
      idProfesorLectorUno: new FormControl(
          this.formularioAsignarComite.value.idProfesorLectorUno),
      idEstudiante: new FormControl(this.idEstudianteAgregarEditar),
      idExamenGrado: new FormControl(this.idExamenGrado)
    });

    let jsonFormulario = JSON.stringify(formularioComite.value, null, 2);

    this.comiteService.putComiteTutorial(
        this.idComiteTutorial,
        jsonFormulario,
        this.errorGuardado
    ).subscribe(
      response => {
        // this.idComiteTutorial = this.context.idComiteTutorial;
      },
      error => {
        console.log(error);
      },
      () => {
        let formularioJuradoPresidente = '{"idProfesor": "' + this.tutorDirector.id +
        '", "idTipoJurado": "4'  +
        '", "presencial": "true' +
        '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

        this.editarMiembroJurado(formularioJuradoPresidente, this.idJuradoPresidente);

        let formularioJuradoVocals =
            '{"idProfesor": "' + this.formularioAsignarComite.value.idJuradoVocal +
            '", "idTipoJurado": "1'  +
            '", "presencial": "' +
            this.formularioAsignarComite.value.presencialJuradoVocal +
            '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

        this.editarMiembroJurado(formularioJuradoVocals, this.idJuradoVocal);

        let formularioJuradoSecretario =
            '{"idProfesor": "' + this.formularioAsignarComite.value.idJuradoSecretario +
            '", "idTipoJurado": "2'  +
            '", "presencial": "true' +
            '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

        this.editarMiembroJurado(formularioJuradoSecretario, this.idJuradoSecretaro);

        let jsonFormularioSuplenteUno =
            '{"idProfesor": "' + this.formularioAsignarComite.value.idSuplenteUno +
            '", "idTipoJurado": "3'  +
            '", "presencial": "true' +
            '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

        this.editarMiembroJurado(jsonFormularioSuplenteUno, this.idJuradoSuplenteUno);

        let formularioSuplenteDos =
            '{"idProfesor": "' + this.formularioAsignarComite.value.idSuplenteDos +
            '", "idTipoJurado": "5'  +
            '", "presencial": "true' +
            '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

        this.editarMiembroJurado(formularioSuplenteDos, this.idJuradoSuplenteDos);

        let formularioExamenGrado = new FormGroup({
          idEstudiante: new FormControl(this.idEstudianteAgregarEditar),
          idSala : new FormControl(this.formularioAsignarComite.value.idSala),
          fechaExamen: new FormControl(
              this.formularioAsignarComite.value.fechaExamen + ' '
              + this.formularioAsignarComite.value.hora)
        });

        let jsonFormularioExamen = JSON.stringify(formularioExamenGrado.value, null, 2);

        this.editarExamenGrado(jsonFormularioExamen);

      }
    );
  }

  private editarMiembroJurado(jsonJurado, idTipoJurado): void {

    this.juradoService.putMiembroJurado(
      idTipoJurado,
      jsonJurado,
      this.errorGuardado
    ).subscribe(
      reponse => {},
      error => {
        this._spinner.stop('guardar');
      },
      () => {} // console.log('Exito al miembro jurado presidente')
    );
  }

  private editarExamenGrado(jsonFormularioExamen): void {
    this.examenGradoService.putExamenGrado(
      this.idExamenGrado,
      jsonFormularioExamen,
      this.errorGuardado
    ).subscribe(
      () => {
        this._spinner.stop('guardar');
        this.onCambiosTabla();
        this.cerrarModalAsignarEditarcomite();
        this.obtenerRegistrosComiteTutorial();
      }
    );
  }

  editarTituloTesisDefinitivo(): void {
    let formularioTutor = new FormGroup({
        nombreTrabajo: new FormControl(this.formularioAsignarComite.value.tituloTesis)
    });
    let jsonFormulario = JSON.stringify(formularioTutor.value, null, 2);

    this.tutorService.putTutor(
      this.tutorEditar,
      jsonFormulario,
      this.errorGuardado
    ).subscribe(
    () => {}, // console.log('Success :' + this.context.idTutorEditar),
    () => {
    }
    );
  }

  agregarRegistroComite(): void {
    let formularioComite = new FormGroup ({
      tituloTesis: new FormControl(this.formularioAsignarComite.value.tituloTesis),
      idProfersorLectorDos: new FormControl(
          this.formularioAsignarComite.value.idProfersorLectorDos),
      idProfesorLectorUno: new FormControl(
          this.formularioAsignarComite.value.idProfesorLectorUno),
      idEstudiante: new FormControl(this.idEstudianteAgregarEditar),
      idExamenGrado: new FormControl(this.idExamenGrado)
    });

    let jsonFormulario = JSON.stringify(formularioComite.value, null, 2);
    this.comiteService.postComiteTutorial(
      jsonFormulario,
      this.errorGuardado
    ).subscribe(
      response => {
        this.idComiteTutorial = response.json().id;
        this.guardarJurado();
      },
      error => {
        this._spinner.stop('guardar');
      },
      () => {
        this._spinner.stop('guardar');
        this.cerrarModalAsignarEditarcomite();
        this.onCambiosTabla();
        this.obtenerRegistrosComiteTutorial();
      }
    );
  }

  guardarJurado(): void {
    let formularioJuradoPresidente = '{"idProfesor": "' + this.tutorDirector.id +
    '", "idTipoJurado": "4'  +
    '", "presencial": "true' +
    '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

    this.agregarMiembroJurado(formularioJuradoPresidente);

    let formularioJuradoVocals =
        '{"idProfesor": "' + this.formularioAsignarComite.value.idJuradoVocal +
        '", "idTipoJurado": "1'  +
        '", "presencial": "' +
        this.formularioAsignarComite.value.presencialJuradoVocal +
        '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

    this.agregarMiembroJurado(formularioJuradoVocals);

    let formularioJuradoSecretario =
        '{"idProfesor": "' + this.formularioAsignarComite.value.idJuradoSecretario +
        '", "idTipoJurado": "2'  +
        '", "presencial": "true' +
        '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

    this.agregarMiembroJurado(formularioJuradoSecretario);

    let jsonFormularioSuplenteUno =
        '{"idProfesor": "' + this.formularioAsignarComite.value.idSuplenteUno +
        '", "idTipoJurado": "3'  +
        '", "presencial": "true' +
        '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

    this.agregarMiembroJurado(jsonFormularioSuplenteUno);

    let formularioSuplenteDos =
        '{"idProfesor": "' + this.formularioAsignarComite.value.idSuplenteDos +
        '", "idTipoJurado": "5'  +
        '", "presencial": "true' +
        '", "idComiteTutorial": "' + this.idComiteTutorial + '"}';

    this.agregarMiembroJurado(formularioSuplenteDos);
  }

  agregarMiembroJurado(JsonJurado): void {
    this.juradoService.postMiembroJurado(
      JsonJurado,
      this.errorGuardado
    ).subscribe(
      response => {},
      error => {
        this._spinner.stop('guardar');
      },
      () => {} // console.log('Exito al miembro jurado presidente')
    );
  }

  cambioRadioPresidente(): boolean {
    if (this.auxiliarVocal) {
      (<FormControl>this.formularioAsignarComite.
        controls['presencialJuradoPresidente']).patchValue(true);
      return true;
    }else {
      (<FormControl>this.formularioAsignarComite.
        controls['presencialJuradoPresidente']).patchValue(false);
      return false;
    }
  }

  cambioRadio(presente: boolean): void {
    this.juradoPresente = presente;
    (<FormControl>this.formularioAsignarComite.controls
      ['presencialJuradoPresidente']).patchValue(presente);
  }

  cambioRadioEdPresidente(): boolean {
    if (this.auxiliarPresidente) {
      (<FormControl>this.formularioAsignarComite.
        controls['presencialJuradoPresidente']).patchValue(true);
      return true;
    }else {
      (<FormControl>this.formularioAsignarComite.
        controls['presencialJuradoPresidente']).patchValue(false);
      return false;
    }
  }

  cambioRadioVocal(presente: boolean): void {
    this.juradoPresente = presente;
    (<FormControl>this.formularioAsignarComite.controls
      ['presencialJuradoVocal']).patchValue(presente);
  }

  cambioRadioEdVocal(): boolean {
    if (this.auxiliarVocal) {
      (<FormControl>this.formularioAsignarComite.
        controls['presencialJuradoVocal']).patchValue(true);
      return true;
    }else {
      (<FormControl>this.formularioAsignarComite.
        controls['presencialJuradoVocal']).patchValue(false);
      return false;
    }
  }

  cambioRadioSuplenteUno(presente: boolean): void {
    this.juradoPresente = presente;
    (<FormControl>this.formularioAsignarComite.controls
      ['presencialSuplenteUno']).patchValue(presente);
  }

  cambioRadioEdSuplenteUno(): boolean {
    if (this.auxiliarSuplenteUno) {
      (<FormControl>this.formularioAsignarComite
        .controls['presencialSuplenteUno']).patchValue(true);
      return true;
    }else {
      (<FormControl>this.formularioAsignarComite
        .controls['presencialSuplenteUno']).patchValue(false);
      return false;
    }
  }

  cambioRadioSuplenteDos(presente: boolean): void {
    this.juradoPresente = presente;
    (<FormControl>this.formularioAsignarComite.controls
      ['presencialSuplenteDos']).patchValue(presente);
  }

  cambioRadioEdSuplenteDos(): boolean {
    if (this.auxiliarSuplenteDos) {
      (<FormControl>this.formularioAsignarComite
          .controls['presencialSuplenteDos']).patchValue(true);
      return true;
    }else {
      (<FormControl>this.formularioAsignarComite
          .controls['presencialSuplenteDos']).patchValue(false);
      return false;
    }
  }

  private getControl(campo: string): FormControl {
        return (<FormControl>this.formularioAsignarComite.controls[campo]);
  }

  getFechaRegistro(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioAsignarComite.controls['fechaExamen'])
          .patchValue(fechaConFormato);
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getLunesInicio(): string {
    if (this.lunesI) {
      let fechaConFormato = moment(this.lunesI).format('hh:mm a');
      (<FormControl>this.formularioAsignarComite.controls['hora'])
          .patchValue(fechaConFormato);
      return fechaConFormato;
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioAsignarComite.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  private getControlErrorsComite(campo: string): boolean {
    if (!(<FormControl>this.formularioAsignarComite.controls[campo]).valid &&
      this.validacionActiva) {
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

  private crearFormularioAsignarComite(): void {
    this.formularioAsignarComite = new FormGroup({
      tituloTesis: new FormControl('', Validators.required),
      idProfesorLectorUno: new FormControl('', Validators.required),
       idProfersorLectorDos: new FormControl('', Validators.required),
      // idEstudiante: new Control('', Validators.required),
      // idExamenGrado: new Control('', Validators.required),
      // idJuradoPresidente: new Control('', Validators.required),
      presencialJuradoPresidente: new FormControl(''),
      idJuradoVocal: new FormControl('', Validators.required),
      presencialJuradoVocal: new FormControl('', Validators.required),
      idJuradoSecretario: new FormControl('', Validators.required),
      // presencialJuradoSecretario: new Control('', Validators.required),
      idSuplenteUno: new FormControl('', Validators.required),
      presencialSuplenteUno: new FormControl(''),
      idSuplenteDos: new FormControl('', Validators.required),
      presencialSuplenteDos: new FormControl(''),
      fechaExamen: new FormControl(''),
      hora: new FormControl('', Validators.
      compose([Validators.required])),
      idSala: new FormControl('', Validators.required),
    });
  }

  private crearFormularioExamen(): void {
    this.formularioExamen = new FormGroup({
          fechaExamen: new FormControl('', Validators.required),
          idSala: new FormControl('', Validators.required)
    });
  }

  cerrarModalAsignarEditarcomite(): void {
    this.modalAgregarEditarComite.close();
    this.validacionActiva = false;
    this.edicionFormulario = false;
    this.reiniciarCatalogos();
    this.crearFormularioAsignarComite();
    this.crearFormularioExamen();
  }

  private reiniciarCatalogos() {
    this.opcionesProfesores = [];
    this.opiconesSalas = [];
  }

  /**********************************************
   * ********************************************
   * TERMINA SECCION DE AGREGAR - EDITAR COMITE *
  **********************************************/

  /**********************************************
   * ********************************************
   * INICIA SECCION DE ADJUNTAR VOTO *
  **********************************************/

  modalAsignarVoto(): void {

    if (this.registroSeleccionado) {
      this.obtenerRegistroEntidadComite(this.registroSeleccionado.id);
      this.obtenerEntidadEstudiante();
      this.getInformacionTutor();
      this.onCambiosTablaAdjuntarvoto();
      this.modalAdjuntarVotos.open('lg');
    }
  }

  obtenerEntidadEstudiante(): void {
    this.entidadEstudiante = this.registroSeleccionado;
  }

  getInformacionTutor(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idTutor.idTipo.id~1:IGUAL,idEstudiante.id~'
      + this.registroSeleccionado.id + ':IGUAL;AND');

    this._spinner.start('obtenerInformacion');
    this.estudianteTutorService.getListaEstudianteTutor(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let respuesta = response.json().lista;
          this.estudianteTutor = new EstudianteTutor(respuesta[response.json().lista.length-1]);
      },
        error => {
           console.error(error);
          this._spinner.stop('obtenerInformacion');
      },
      () => {
        this._spinner.stop('obtenerInformacion');
      }
    );
  }

  onCambiosTablaAdjuntarvoto(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdVoto = 'idEstudiante~' + this.registroSeleccionado.id + ':IGUAL';
    urlParameter.set('criterios', criterioIdVoto);

    this.votoAprobatorio =
    this.votoAprobatorioService.getListaVotoAprobatorio(
        this.erroresConsultas,
        urlParameter
    ).lista;
  }

  rowSeleccionadoAdjuntarvoto(registro): boolean {
    return (this.registroSeleccionadoDocumento === registro);
  }

  rowSeleccionAdjuntarvoto(registro): void {
    if (this.registroSeleccionadoDocumento !== registro) {
        this.registroSeleccionadoDocumento = registro;
    } else {
        this.registroSeleccionadoDocumento = null;
    }
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        let jsonArchivo = '{"idArchivoVoto": '
          + responseJson.id + ', "idEstudiante": '
          + this.registroSeleccionado.id + '}';
        this.votoAprobatorioService.postVotoAprobatorio(
          jsonArchivo,
          this.erroresConsultas
        ).subscribe(
          () => {}, // console.log('Success'),
          console.error,
          () => {
              this.onCambiosTablaAdjuntarvoto();
          }
        );
      }
    });
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

  eliminarVotoAprobatorio () {
    if (this.registroSeleccionadoDocumento) {
      this.votoAprobatorioService.
      deleteVotoAprobatirio(
        this.registroSeleccionadoDocumento.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, // console.log('Success'),
        console.error,
        () => {
          this.registroSeleccionadoAdjuntarVoto = null;
          this.onCambiosTablaAdjuntarvoto();
        }
      );
    }else {
        alert('Selecciona un registro');
    }
  }

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }


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

  cerrarModalAsignarVoto(): void {
    this.votoAprobatorio = [];
    this.registroSeleccionadoAdjuntarVoto = undefined;
    this.registroSeleccionadoDocumento = undefined;
    this.entidadEstudiante = undefined;
    this.estudianteTutor = undefined;
    this.modalAdjuntarVotos.close();
  }

  /**********************************************
   * ********************************************
   * FIN DE SECCION DE ADJUNTAR VOTO *
  **********************************************/

  /**********************************************
   * ********************************************
   * INICIO DE SECCION DE DETALLE *
  **********************************************/

  modalDetalleComite(): void {
    this.modalDetalle.open('lg');
    this.entidadDirector = this.registroSeleccionado.tutor.profesor;
    this.obtenerMiembrosJurados();
  }

  obtenerMiembrosJurados(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idComiteTutorial~' + this.idComiteTutorial + ':IGUAL');
    this._spinner.start('obtenerJurado');
    this.juradoService.getListaMiembrosJurado(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
          let paginacionInfoJson = response.json();
          this.registrosMiembroJuradosDetalle = [];
          paginacionInfoJson.lista.forEach((item) => {
              this.registrosMiembroJuradosDetalle.push(new MiembroJurado(item));
          });
      },
      error => {
          this._spinner.stop('obtenerJurado');
      },
      () => {
          this._spinner.stop('obtenerJurado');
      }
    );
  }

  cerrarModalDetalleComite(): void {
    this.modalDetalle.close();
    this.registrosMiembroJuradosDetalle = [];
  }
  /**********************************************
   * ********************************************
   * FIN DE SECCION DE DETALLE *
  **********************************************/

  limpiarVariablesSession() {
    sessionStorage.removeItem('asignarComiteCriterios');
    sessionStorage.removeItem('asignarComiteOrdenamiento');
    sessionStorage.removeItem('asignarComiteLimite');
    sessionStorage.removeItem('asignarComitePagina');
  }

}
