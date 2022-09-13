import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {EvaluacionAspirante} from "../../services/entidades/evaluacion-aspirante.model";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {Tutor} from "../../services/entidades/tutor.model";
import {EvaluacionAspiranteService} from "../../services/entidades/evaluacion-aspirante.service";
import {TutorService} from "../../services/entidades/tutor.service";
import {UsuarioRolService} from "../../services/usuario/usuario-rol.service";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Validators, FormGroup, FormControl} from "@angular/forms";
import {URLSearchParams} from "@angular/http";
import {AuthService} from "../../auth/auth.service";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {errorMessages} from "../../utils/error-mesaje";
import {Validacion} from "../../utils/Validacion";
import * as moment from "moment";

@Component({
  selector: 'app-aspirantes-aceptados',
  templateUrl: './aspirantes-aceptados.component.html',
  styleUrls: ['./aspirantes-aceptados.component.css']
})
export class AspirantesAceptadosComponent implements OnInit{
  @ViewChild('modalDetalle')
  modal: ModalComponent;
  @ViewChild('asignarTutor')
  asignarTutorModalCom: ModalComponent;
  @ViewChild('editarPrioridadModal')
  editarPrioridadModal: ModalComponent;
  @ViewChild('generarResultadosModalCom')
  generarResultadosModalCom: ModalComponent;
  @ViewChild('errorGeneracionesultadosModal')
  errorGeneracionesultadosModal: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  idTutor :number;
  modalTutor: FormGroup;
  entidadEstudiante: EvaluacionAspirante;
  entidadTutorEstudiante: Tutor;

  validacionActiva: boolean = false;
  deshabilitarActualizarGuardarTutor: boolean = true;
  mensajeErrors: any = errorMessages;
  idProgramaDocente;
  profesorService;
  lgacService;
  estudianteTutor;
  editarFormulario: boolean = false;
  idTutorDesignador;
  private lgacSelect: Array<ItemSelects> = [];
  private profesorSelect: Array<ItemSelects> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];


  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  auxiliar: Array<EvaluacionAspirante> = [];
  registros: Array<EvaluacionAspirante> = [];
  estudiantesAceptados: Array<Estudiante> = [];
  catalogoServices;
  opcionesProgramaDocente: Array<ItemSelects> = [];
  opcionesPromociones: Array<ItemSelects>;
  formulario: FormGroup;
  promocionesService;
  programaDocenteService;
  estudianteService;
  botonBuscarActivo: boolean = false;
  criteriosCabezera: string = '';
  criteriosCabezera2: string = '';
  columnas: Array<any> = [
    { titulo: 'Folio', nombre: 'idEstudiante.idFolioSolicitud.id', sort: false},
    { titulo: 'Nombre aspirante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido',
      sort: false},
    { titulo: 'Prioridad', nombre: 'prioridad' },
    { titulo: 'Dictamen', nombre: 'dictamen' }
  ];

  columnasLicenciatura: Array<any> = [
    { titulo: 'Folio', nombre: 'idEstudiante.idFolioSolicitud.id', sort: false},
    { titulo: 'Nombre aspirante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido',
      sort: false},
    { titulo: 'Calificación', nombre: 'calificacionFinal' },
    { titulo: 'Prioridad', nombre: 'prioridad' },
    { titulo: 'Estatus', nombre: 'idEstatus', sort: false }
  ];

  registroSeleccionado: EvaluacionAspirante;
  listaTutorEstudiante: Array<Tutor> = [];
  estadoBotonAgregarTutor: boolean = false;
  estadoBotonEditarTutor: boolean = false;
  estadoBotonEditarPrioridad: boolean = false;
  botonEditarTutor: boolean = false;
  esCoordinador: boolean = true;
  idTutorEstudiante; // Obtener el id del tutor del estudiante
  idEstudianteParaAsignarTutor;
  editarAgregarTutor;
  idEstudiante;
  usuarioRol: UsuarioRoles;
  exportarFormato = '';
  mostratGenerarActa: boolean = false;
  desahabilitarSelectorCoordiancion: boolean = false;
  entidadTutor: Tutor;
  listaLicenciatura: boolean = false;
  estadoBotonGenerarResultados: boolean = false;
  public evaluacionAspiranteService: EvaluacionAspiranteService;
  public tutorService: TutorService;
  public usuarioRolService: UsuarioRolService;
  variablePromocion;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:  'idEstudiante.idDatosPersonales.nombre,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido'}
    /*
     * Aun no puede armar el criterio con multiples columnas,
     * solo sobre una entidad en el mismos nivel
     * como nombre completo
     * 28/06/2016
     */
    // corregir filtrado doble o tercer nivel
  };
  erroresConfirmacion: Array<ErrorCatalogo> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private alertasModalTutor: Array<Object> = [];

  constructor(
    private elementRef: ElementRef,
    private injector: Injector,
    private _renderer: Renderer,
    public _catalogosService: CatalogosServices,
    public spinner: SpinnerService,
    private authService : AuthService
  ) {
    this.prepareService();
    this.prepareServices();
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    //console.log(usuarioLogueado);
    this.recuperarRolUsuarioLogueadoYProgramasDocentes(usuarioLogueado.id);

    this.formulario = new FormGroup({
      idPromocion: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
    });
    this.inicializarFormularioEditarTutor();
    this.inicializarFormularioRditarPrioridad();

     if (sessionStorage.getItem('aspirantesAceptadosIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('aspirantesAceptadosCriterios')) {
      this.onCambiosTabla();
    }
  }

  activarBotonBuscar(numero: number): void {
    numero === 1 ? this.botonBuscarActivo = true : this.botonBuscarActivo = false;
  }

  recuperarRolUsuarioLogueadoYProgramasDocentes(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.spinner.start("aspirantescoordinacion1");
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          if (this.usuarioRol.rol.id !== 2) {
            this.esCoordinador = false;
          } else {
            (<FormControl>this.formulario.controls['idProgramaDocente']).disable();
          }
        });
      },
      error => {
        this.spinner.stop("aspirantescoordinacion1");
      },
      () => {
        this.obtenerCatalogoDeProgramasDocentes();
        this.getProgramaDocenteYPromocionsCoordinador();
        this.spinner.stop("aspirantescoordinacion1");
      }
    );
  }

  sortChanged(columna): void {
    if (this.registros.length > 0) {
      this.columnas.forEach((column) => {
        if (columna !== column) {
          if (column.sort !== false) {
            column.sort = '';
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
  }
  // corregir filtrado doble o tercer nivel
  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  obtenerCatalogoDeProgramasDocentes(): void {
    let urlSearch = new URLSearchParams();
    if (this.usuarioRol.rol.id === 2) {
      urlSearch.set('criterios', 'id~' + this.usuarioRol.usuario.programaDocente.id + ':IGUAL');
    }
    this.opcionesProgramaDocente = this.programaDocenteService.
    getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    //console.log('cat', this.opcionesProgramaDocente);
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    //console.log('para',urlParameter);
    this.opcionesPromociones = this.promocionesService
      .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  buscarCriteriosCabezera(
    idPromocion: number
  ): void {
    this.limpiarVariablesSession();
    this.criteriosCabezera = '';
    this.criteriosCabezera2 = '';
    this.mostratGenerarActa = true;
    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + ',idEstudiante.idPromocion~'
        + idPromocion + ':IGUAL';
      this.criteriosCabezera2 = this.criteriosCabezera2 + 'idPromocion~'
        + idPromocion + ':IGUAL';
    }
    this.variablePromocion = idPromocion;
    sessionStorage.setItem('aspirantesAceptadosIdPromocion', idPromocion.toString());
    this.onCambiosTabla();
  }
  onCambiosTabla(): void {

    this.estadoBotonGenerarResultados = false;
    this.registroSeleccionado = null;
    this.estadoBotonAgregarTutor = false;
    this.estadoBotonEditarTutor = false;
    this.botonEditarTutor = false;
    this.estadoBotonEditarPrioridad = false;

    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';
    let criterios = 'coordinador~true:IGUAL' + this.criteriosCabezera;
    if (!sessionStorage.getItem('aspirantesAceptadosCriterios')) {
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = criterios + ';ANDGROUPAND';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
    }

    ordenamiento = '';
    if (this.listaLicenciatura) {
      this.columnasLicenciatura.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
    }else {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
    }

    sessionStorage.setItem('aspirantesAceptadosCriterios', criterios);
    sessionStorage.setItem('aspirantesAceptadosOrdenamiento', ordenamiento);
    sessionStorage.setItem('aspirantesAceptadosLimite', this.limite.toString());
    sessionStorage.setItem('aspirantesAceptadosPagina', this.paginaActual.toString());

    }
    
    this.limite = +sessionStorage.getItem('aspirantesAceptadosLimite') ? +sessionStorage.getItem('aspirantesAceptadosLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('aspirantesAceptadosPagina') ? +sessionStorage.getItem('aspirantesAceptadosPagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('aspirantesAceptadosCriterios') ? sessionStorage.getItem('aspirantesAceptadosCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('aspirantesAceptadosOrdenamiento') ? sessionStorage.getItem('aspirantesAceptadosOrdenamiento') : ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    // Se aplica spinner sin condicion. El "Buscar" responde a un 'keyup.enter'
    this.spinner.start('tabla');
    if (this.listaLicenciatura) {
      this.estadoBotonGenerarResultados = true;
    }

    this.evaluacionAspiranteService.getListaEvaluacionAspirante(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        let estudianteEvaluacion = new EvaluacionAspirante(response);
        let auxiliarMostrarBoton: boolean = false;
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          console.log(item);     
          if (item.id_estudiante.id_estatus.valor ===  'Aspirante-Aceptado'
             || item.id_estudiante.id_estatus.valor === 'Estudiante'
             || item.id_estudiante.id_estatus.valor === 'Titulado'
             || item.id_estudiante.id_estatus.valor === 'Egresado') {
            this.auxiliar.push(new EvaluacionAspirante(item));
            estudianteEvaluacion = new EvaluacionAspirante(item);

            if (this.listaLicenciatura && !auxiliarMostrarBoton) {
              ////console.log(auxiliarMostrarBoton);
              if (estudianteEvaluacion.calificacionFinal !== 0 &&
                estudianteEvaluacion.calificacionFinal !== undefined) {
                auxiliarMostrarBoton = true;
                this.estadoBotonGenerarResultados = false;
              }
  
            }
          }
        });

        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterios = 'idEstatus~1002:IGUAL';
        if (this.criteriosCabezera2 !== '') {
          criterios = criterios + ',' + this.criteriosCabezera2;
          urlSearch.set('criterios', criterios);
          console.log("test");
          
        }
        urlSearch.set('criterios', criterios);
        this.estudianteService.getListaEstudianteOpcional(
          this.erroresConsultas,
          urlSearch
        ).subscribe(
          response => {
            response.json().lista.forEach((item) => {
              if (item.id_estatus.valor ===  'Aspirante-Aceptado' || item.id_estatus.valor === 'Estudiante' || 'Titulado' || 'Egresado') {
                this.estudiantesAceptados.push(new Estudiante(item));
              }
            });
            // //console.log(this.estudiantesAceptados);
            //this.registros = [];

            for (let i = 0; i < this.auxiliar.length; i++) {
              for (let j = 0; j < this.estudiantesAceptados.length; j++) {
                // //console.log('EVALUACION - EST: ' + this.auxiliar[i].estudiante.id
                // + ' EST: ' + this.estudiantesAceptados[j].id);
                if (this.auxiliar[i].estudiante.id === this.estudiantesAceptados[j].id) {
                  this.registros.push(this.auxiliar[i]);
                  break;
                }
              }
            }
            this.registros = this.auxiliar;
            this.auxiliar = [];
            this.estudiantesAceptados = [];
          }
        );
      },
      error => {
        console.error(error);
        this.spinner.stop('tabla');
      },
      () => {
        //console.log('paginacionInfo', this.paginacion);
        // //console.log('auxiliar', this.auxiliar);
        this.spinner.stop('tabla');
      }
    );
  }

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
    this.paginaActual = evento.page;
    //console.log('evento', evento);
    //console.log('Page changed to: ' + evento.page);
    //console.log('Number items per page: ' + evento.itemsPerPage);
    //console.log('paginaActual', this.paginaActual);
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }



  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    if (this.registros.length > 0) {
      this.limite = Number(limite);
      this.onCambiosTabla();
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    this.estadoBotonAgregarTutor = false;
    this.estadoBotonEditarTutor = false;
    this.botonEditarTutor = false;
    this.estadoBotonEditarPrioridad = false;
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.idTutorEstudiante = '';
      if (this.registroSeleccionado.estudiante.promocion.
          programaDocente.nivelEstudios.descripcion !== 'Licenciatura' &&
        this.registroSeleccionado.estudiante.estatus.id !== 1101) {
        ////console.log(this.registroSeleccionado.estudiante.estatus.id);
        this.estadoBotonEditarPrioridad = true;
        this.listaTutorEstudiante = [];
        this.verificarDesignacionTutor();
      }
    } else {
      this.registroSeleccionado = null;
      this.estadoBotonAgregarTutor = false;
      this.estadoBotonEditarTutor = false;
      this.botonEditarTutor = false;
    }
  }

  verificarDesignacionTutor(): void {
    if (this.registroSeleccionado.estudiante.tutor.id) {
      let criteriosBuscarTutor = 'id~' +
        this.registroSeleccionado.estudiante.tutor.id + ':IGUAL  ';
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', criteriosBuscarTutor);
      this.spinner.start("aspirantescoordinacion3");
      this.tutorService.getEntidadTutor(
        this.registroSeleccionado.estudiante.tutor.id,
        this.erroresConsultas
      ).subscribe(
        response => {
          this.entidadTutor = new Tutor(response.json());
          this.idTutorEstudiante = this.entidadTutor.id;
          if (!this.entidadTutor) {
            this.spinner.stop("aspirantescoordinacion3");
            this.estadoBotonAgregarTutor = true;
            this.estadoBotonEditarTutor = false;
            this.botonEditarTutor = false;
          }else {
            this.spinner.stop("aspirantescoordinacion3");
            this.estadoBotonAgregarTutor = false;
            this.botonEditarTutor = (this.entidadTutor.tipo.id == 1);
            this.estadoBotonEditarTutor = true;
          }
        },
        error => {
          console.error(error);
          this.spinner.stop("aspirantescoordinacion3");
        },
        () => {
        });
    }else {
      this.estadoBotonAgregarTutor = true;
      this.estadoBotonEditarTutor = false;
    }
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true,
      tiempo: 3000
    });
  }

  addErrorsMesajeModalAsignattutor(mensajeError, tipo): void {
    this.alertasModalTutor.push({
      type: tipo,
      msg: mensajeError,
      closable: true,
      tiempo: 3000
    });
  }
  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  modalRegistro(idPromocion: number): void {
    if (idPromocion) {
      this.spinner.start("aspirantescoordinacion4");
      this.promocionesService.getFormatoPdf(
        idPromocion,
        this.erroresConsultas,
        'ActaComiteAdmision'
      ).subscribe(
        response => {
          this.exportarFormato = response.json();
        },
        error => {
          console.error(error);
          this.spinner.stop("aspirantescoordinacion4");
        },
        () => {
          window.open(this.exportarFormato);
          this.spinner.stop("aspirantescoordinacion4");
        }
      );
    }else {
      alert('no se ha seleccionado una promoción');
    }
  }



  descargarFormatoActa(idPromocion: number): void {
    if (idPromocion) {
      this.spinner.start("aspirantescoordinacion5");
      this.promocionesService.getFormatoPdf(
        idPromocion,
        this.erroresConsultas,
        'ActaComiteAdmision'
      ).subscribe(
        response => {
          this.exportarFormato = response.json();
          //console.log(this.exportarFormato);
        },
        error => {
          console.error(error);
          this.spinner.stop("aspirantescoordinacion5");
        },
        () => {
          window.open(this.exportarFormato);
          this.spinner.stop("aspirantescoordinacion5");
        }
      );
    }else {
      alert('no se ha seleccionado una promoción');
    }
  }

  private getProgramaDocenteYPromocionsCoordinador(): void {
    //console.log(this.usuarioRol);
    if (this.usuarioRol.rol.id === 2) {
      this.desahabilitarSelectorCoordiancion = true;

      if (this.usuarioRol.usuario.programaDocente.
          nivelEstudios.descripcion === 'Licenciatura') {
        this.listaLicenciatura = true;
      }
      this.setearSelectProgramaDocenteCoordinador();
      this.cambioProgramaDocenteFiltro(this.usuarioRol.usuario.programaDocente.id);
    }
  }

  private setearSelectProgramaDocenteCoordinador(): void {
    let programaDocente = 'idProgramaDocente';

    (<FormControl>this.formulario.controls[programaDocente]).
    setValue(this.usuarioRol.usuario.programaDocente.id);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  private prepareService(): void {
    this.catalogoServices = this._catalogosService;
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.promocionesService = this._catalogosService.getPromocion();
    /*this.opcionesProgramaDocente =
     this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
     this.opcionesPromociones =
     this.promocionesService.getSelectPromocion(this.erroresConsultas);*/
    this.estudianteService = this._catalogosService.getEstudiante();
    this.evaluacionAspiranteService = this._catalogosService.getEvaluacionAspirante();
    this.tutorService = this._catalogosService.getTutor();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
  }


  ngOnInit() {
  }

  modalDetalleTutor(): void {
    this.modal.open('lg');
  }
  cerrarModal(): void {
    this.modal.close();
  }
  modalAsignarTutor(modo): void {
    this.deshabilitarActualizarGuardarTutor = true;
    this.idTutor = this.registroSeleccionado.estudiante.tutor.id;
    this.idEstudiante = this.registroSeleccionado.estudiante.id;
    this.inicializarFormularioEditarTutor();
    this.obtenerLGACPrograma();
    if (modo === 'editar') {
      (<FormControl>this.modalTutor.controls['verificarTutorados']).setValue('true');
      this.editartutor();
    } else {
      this.editarFormulario = false;
    }

    this.asignarTutorModalCom.open('lg');
  }

  cerrarModalEditarTutor(): void {
    this.asignarTutorModalCom.close();
  }

  inicializarFormularioEditarTutor(){
    this.modalTutor = new FormGroup({
      idProfesor: new FormControl('', Validators.required),
      idLgac: new FormControl('', Validators.required),
      nombreTrabajo: new FormControl('', Validators.
      compose([Validators.required])),
      idTipo: new FormControl('1'),
      idTipoTesis: new FormControl(4),
      fechaAsignacion: new FormControl(moment(new Date()).format('DD/MM/YYYY hh:mma')),
      verificarTutorados: new FormControl('', Validators.required)

    });
  }

  editartutor() {
    //console.log('---------Alguna vez entre aqui...');
    //console.log(this.idTutor);

    if (this.idTutor !== undefined) {
      this.spinner.start("modaleditaraspirantes2");
      //console.log('edicion');
      this.editarFormulario = true;
      let tutor:Tutor;
      this.tutorService
        .getEntidadTutor(
          this.idTutor,
          this.erroresConsultas
        ).subscribe(
        response => {
          tutor = new Tutor(response.json());
        },
        error => {
          console.error(error);
          console.error(this.erroresConsultas);
        },
        () => {
          //console.log(tutor);
          if (this.modalTutor) {
            let stringidProfesor = 'idProfesor';
            let stringidLgac = 'idLgac';
            let stringnombreTrabajo = 'nombreTrabajo';

            (<FormControl>this.modalTutor.controls[stringidLgac])
              .setValue(tutor.lgac.id);
            (<FormControl>this.modalTutor.controls[stringnombreTrabajo])
              .setValue(tutor.nombreTrabajo);
            this.obtenerProfesorLGAC(tutor.lgac.id);
            (<FormControl>this.modalTutor.controls[stringidProfesor])
              .setValue(tutor.profesor.id);
            this.spinner.stop("modaleditaraspirantes2");
          }
        }
      );
    }
  }

  agregarTutor(): void {
    if (this.validarFormulario()) {
      this.deshabilitarActualizarGuardarTutor = false;
      this.spinner.start("modaleditaraspirante1");
      let jsonFormulario = JSON.stringify(this.modalTutor.value, null, 2);
      let jsonEstudianteTutor = '';
      //console.log(jsonFormulario);
      if (this.editarFormulario) {
        this.tutorService.putTutor(
          this.idTutor,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          response => {
            ////console.log(response.json());
            /*this.idTutorDesignador
             = response.json().id;*/
            ////console.log(this.idTutorDesignador);
            this.estadoBotonAgregarTutor = false;
            this.estadoBotonEditarTutor = false;
            this.spinner.stop("modaleditaraspirante1");
            this.onCambiosTabla();
            this.asignatLGACEstudiante();
            this.addErrorsMesaje(
              'Se actualizó la designación de tutor correctamente!',
              'success');
            this.cerrarModalEditarTutor();
            this.spinner.stop("modaleditaraspirante1");
          },
          error => {
            this.deshabilitarActualizarGuardarTutor = true;
            console.error(error);
            this.spinner.stop("modaleditaraspirante1");
          }
        );
      } else {
        this.tutorService
          .postTutor(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {
            //console.log(response.json());
            let id = response.json().id;
            this.idTutorDesignador = id;
            jsonEstudianteTutor = '{"idTutor": ' + this.idTutorDesignador +
              ', "idEstudiante": ' + this.registroSeleccionado.id + '}';
            // se crea entidad estudianteTutor
            this.estudianteTutor.postEstudianteTutor(
              jsonEstudianteTutor,
              this.erroresGuardado
            ).subscribe(
              response => {
                //console.log('post success' + response.json());
                this.estadoBotonAgregarTutor = false;
                this.estadoBotonEditarTutor = false;
                this.spinner.stop("modaleditaraspirante1");
                this.asignatLGACEstudiante();
                this.addErrorsMesaje(
                  'La designación ha sido realizada correctamente!',
                  'success');

              },
              error => {
                console.error(error);
                this.deshabilitarActualizarGuardarTutor = true;
                this.spinner.stop("modaleditaraspirante1");
              },
              () => {

              }
            );
          },
          error => {
            console.error(error);
            this.spinner.stop("modaleditaraspirante1");
          },
          () => {
            this.onCambiosTabla();
            this.cerrarModalEditarTutor();
          }
        );
      }
    }
  }

  validarFormulario(): boolean {
    if (this.modalTutor.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  obtenerLGACPrograma(): any {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' +
      this.registroSeleccionado.
        estudiante.promocion.programaDocente.id +
      ':IGUAL');
    //console.log(urlParameter);

    this.lgacSelect =
      this.lgacService.getSelectLgaCriterios(this.erroresConsultas, urlParameter);
  }

  obtenerProfesorLGAC(idLGAC: number): void {
    (<FormControl>this.modalTutor.controls['idProfesor']).setValue('');
    //console.log('idLGAC', idLGAC);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idLgac~' + idLGAC + ':IGUAL');
    this.profesorSelect =
      this.profesorService.getSelectIntegranteLgacCriterios(
        this.erroresConsultas, urlParameter);
  }

  asignatLGACEstudiante(): void {
    let lgac = this.getControlAsignatTutor('idLgac');
    let formularioActualizarEstudiante;
    if (this.editarFormulario) {
      formularioActualizarEstudiante =
        '{"idLgac":"' + lgac.value + '"}';
    }else {
      formularioActualizarEstudiante =
        '{"idLgac":"' + lgac.value + '",' +
        '"idTutor":"' + this.idTutorDesignador + '"}';
    }
    this.estudianteService.putEstudiante(
      this.idEstudiante,
      formularioActualizarEstudiante,
      this.erroresGuardado
    ).subscribe(
      response => {
        //console.log('Success' );
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      }
    );
  }

  getControlErrorsAsignatTutor(campo: string): boolean {
    if (!(<FormControl>this.modalTutor.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  getControlAsignatTutor(campo: string): FormControl {
    return (<FormControl>this.modalTutor.controls[campo]);
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

  private prepareServices(): void {
    this.lgacService = this._catalogosService.getlgac();
    this.profesorService = this._catalogosService.getIntegrantesLgacService();
    this.evaluacionAspiranteService =
      this._catalogosService.getEvaluacionAspirante();
    this.estudianteTutor = this._catalogosService.getEstudianteTutorService();
  }

  /*TODO INICIA modal editar prioridad*/
  // varoables

  formularioEditarPrioridad: FormGroup;

  inicializarFormularioRditarPrioridad(){
    this.formularioEditarPrioridad = new FormGroup({
      prioridad: new FormControl('', Validators.required)

    });
  }

  modalEditarPrioridad() {
    if(this.registroSeleccionado) {
      this.editarPrioridadModal.open('lg');
    }
  }

  editarForm(): void {
    //console.log(this.formularioEditarPrioridad.value);
    //console.log(this.context.idAspiranteEvaluado);
    let jsonFormulario = JSON.stringify(this.formularioEditarPrioridad.value, null, 2);
    this.evaluacionAspiranteService.putEvaluacionAspirante(
      this.registroSeleccionado.id,
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {

      }, error => {

      },
      () => {
        this.addErrorsMesaje
        ('Se actualizó la prioridad correctamente!', 'success');
        this.onCambiosTabla();

      }
    );
    this.cerrarModalEditarPrioridad();
  }
  findPrioridad(prioridad): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    //let arrPrioridad = [];
    let bandera: boolean = true;
    let criterio: string = 'idEstudiante.idPromocion~' +
      this.variablePromocion + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.spinner.start('findPrioridad');
    this.evaluacionAspiranteService.getListaEvaluacionAspirante(
      this.erroresConsultas,
      urlParameter, false
    ).subscribe(
      response => {
        let auxiliar;
        response.json().lista.forEach(function (elemento) {
          auxiliar = new EvaluacionAspirante(elemento);
          //arrPrioridad.push(new ItemSelect(auxiliar.id, auxiliar.prioridad));
          if (auxiliar.prioridad == prioridad) {
            bandera = false;
          }
        });
      },
      error => {
        this.spinner.stop('findPrioridad');
        console.error(error);

      },
      () => {
        this.spinner.stop('findPrioridad');
        if (bandera === false) {
          this.addErrorsMesaje('La prioridad ya existe en la promoción', 'danger');
        } else {
          this.editarForm();
        }
      });
  }

  enviarFormularioEditarPrioridad(event): void {
    let prioridadRepetida = this.getControlEditarPrioridad('prioridad').value;
    //this.validarFormulario();
    if (this.validarFormularioEditarPrioridad()) {
      this.findPrioridad(prioridadRepetida);
    } else {
      //alert('error en el formulario');
    }
  }
  validarFormularioEditarPrioridad(): boolean {
    if (this.formularioEditarPrioridad.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlEditarPrioridad(campo: string): FormControl {
    return (<FormControl>this.formularioEditarPrioridad.controls[campo]);
  }

  private getControlErrorsEditarPrioridad(campo: string): boolean {
    if (!(<FormControl>this.formularioEditarPrioridad.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  cerrarModalEditarPrioridad() {
    this.editarPrioridadModal.close();
  }


  /*TODO TERMINA modal editar prioridad*/


  /*TODO INICIA modal generar resultados*/

  promociongenerarResultados;

  generarResultados(idPromocion) {
    this.promociongenerarResultados = idPromocion;
    this.generarResultadosModalCom.open('sm');

  }

  closeModalGenerarResultados() {
    this.generarResultadosModalCom.close();
  }

  generarResultadosPromocionSeleccionada(): void {
    this.estadoBotonGenerarResultados = false;

    this.evaluacionAspiranteService.getGenerarResultados(
      this.promociongenerarResultados,
      this.erroresGuardado
    ).subscribe(
      response => {
        //console.log(response.json());
      },
      error => {
        this.cerrarModal();
        console.error(error);
        console.error(error.status);


        if (error.status === 404) {
          //Ocurrio un error se mostrara en modal,
          // indicando que no se pudo generar resultados
          this.errorGenerarResultados();

        }
      },
      () => {
        this.onCambiosTabla();
        this.closeModalGenerarResultados();
      }
    );
  }

  /*errorGenerarResultados():void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, {useValue: new GenerarResultadosErrorData(2, 3)}),
      provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
      provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)}),
      provide(Renderer, {useValue: this._renderer})
    ]);

    dialog = this.modal.open(
      <any>GenerarResultadosError,
      bindings,
      modalConfig
    );
  }*/


  /*TODO TERMINA modal generar resultados*/


  /*TODO INICIA modal error*/

  errorGenerarResultados(){
    this.errorGeneracionesultadosModal.open('sm');
  }

  closeModalError(){
    this.errorGeneracionesultadosModal.close();
  }

  /*TODO TERMINA modal error*/

  verificarTutorado(idProfesorSeleccionado: number) {
    (<FormControl>this.modalTutor.controls['verificarTutorados']).setValue('');
    this.spinner.start('verificarTutorados');
    //Selecionar los alumnos de la promocion por id tutor 6 para Maestria y 4 para Doctorado
    let urlSearch: URLSearchParams = new URLSearchParams();

    //  1002 AspiranteAceptado, 1006 Estudiante
    // Solo es
    let aspiranteAcep = 'Aspirante-Aceptado';
    let estudiante_ = 'Estudiante';
    let titulado_ = 'Titulado';
    let egresado_ = 'Egresado';
    let criterios = 'idEstatus.valor~' + aspiranteAcep + ':IGUAL;OR,idEstatus.valor~' + estudiante_ + ':IGUAL;' +
    'OR,idEstatus.valor~' + titulado_ + ':IGUAL' +
    'OR,idEstatus.valor~' + egresado_ + ':IGUAL;ORGROUPAND,' +
      'idPromocion.idProgramaDocente.idNivelEstudios.id~' +
      this.registroSeleccionado.estudiante.promocion.programaDocente.nivelEstudios.id +
      ':IGUAL;AND,idTutor.idProfesor~'+ idProfesorSeleccionado +
      ':IGUAL;AND,id~' + this.registroSeleccionado.estudiante.id + ':NOT';
    urlSearch.set('criterios', criterios);
    //console.log(criterios);
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {

        if (this.registroSeleccionado.estudiante.promocion.
            programaDocente.nivelEstudios.descripcion === 'Maestría' && response.json().lista.length < 100) {
          (<FormControl>this.modalTutor.controls['verificarTutorados']).setValue('true');
          //console.log('Cumple condiciones de Maestria');
        }
        // } else if (this.registroSeleccionado.estudiante.promocion.
        //     programaDocente.nivelEstudios.descripcion === 'Maestría' && response.json().lista.length >= 6){
        //   this.addErrorsMesajeModalAsignattutor(
        //     'El profesor ya cuenta con seis tutorados!','danger');
        // }

        if (this.registroSeleccionado.estudiante.promocion.
            programaDocente.nivelEstudios.descripcion === 'Doctorado' && response.json().lista.length < 4) {
          (<FormControl>this.modalTutor.controls['verificarTutorados']).setValue('true');
        } else if (this.registroSeleccionado.estudiante.promocion.
            programaDocente.nivelEstudios.descripcion === 'Doctorado' && response.json().lista.length >= 4) {
          //console.log('DOCTORADO NO CUMPLE');
          this.addErrorsMesajeModalAsignattutor(
            'El profesor ya cuenta con cuatro tutorados!','danger');
        }
        this.spinner.stop('verificarTutorados');
      },
      error => {
        console.error(error);
        this.spinner.stop('verificarTutorados');
      },
      () => {

      }
    );
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('aspirantesAceptadosCriterios');
    sessionStorage.removeItem('aspirantesAceptadosOrdenamiento');
    sessionStorage.removeItem('aspirantesAceptadosLimite');
    sessionStorage.removeItem('aspirantesAceptadosPagina');
  }

}
