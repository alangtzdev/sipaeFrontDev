import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {ItemSelects} from "../../services/core/item-select.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {MateriaImpartida} from "../../services/entidades/materia-impartida.model";
import {FormGroup, FormControl} from "@angular/forms";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Router} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {MateriaImpartidaService} from "../../services/entidades/materia-impartida.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {Promocion} from "../../services/entidades/promocion.model";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {EstudianteMateriaImpartida} from "../../services/entidades/estudiante-materia-impartida.model";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {EstudianteService} from "../../services/entidades/estudiante.service";

@Component({
  selector: 'app-optativas',
  templateUrl: './optativas.component.html',
  styleUrls: ['./optativas.component.css']
})
export class OptativasComponent implements OnInit {

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                VARIABLES                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** SELECTS**************************************//
  programaDocenteSelectEstatus: Array <ItemSelects> = [];
  promocionSelectEstatus: Array <ItemSelects> = [];
  optativaSelectEstatus: Array <ItemSelects> = [];
  paginacion: PaginacionInfo;
  criteriosCabezera: string = '';
  oculto: boolean;
  band: boolean = true;
  botonBuscar: boolean = false;
  // ************************** SERVICES**************************************//
  catalogoMaterias;
  promocionService;
  planEstudiosService;
  planEstudiosMateriaService;
  usuarioRolService;
  // ************************** FORMULARIOS**************************************//
  edicionFormulario: boolean = false;
  formulario: FormGroup;
  idEstatusCatalogo: number;
  validacionActiva: boolean = false;
  dataFormulario: any;
  promocionSeleccionada;
  // ************************** TABLAS**************************************//
  usuarioRol: UsuarioRoles;
  registroSeleccionado: MateriaImpartida;
  registros: Array<MateriaImpartida> = [];
  columnas: Array<any> = [
    { titulo: 'Clave', nombre: 'idCursoOptativo.clave', sort: 'asc'},
    { titulo: 'Curso específico', nombre: 'idCursoOptativo.descripcion'},
    { titulo: 'Profesor titular', nombre: 'idMateria', sort: false },
    { titulo: 'Período escolar', nombre: 'idPeriodoEscolar.periodo' },
    { titulo: 'Total de horas', nombre: 'idCursoOptativo.totalHoras' }
  ];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
      'idCursoOptativo.descripcion' }
  };

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CONSTRUCTOR                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  constructor(params: Router ,
//              private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private authService: AuthService,
              private router: Router,
              public catalogosService: CatalogosServices,
              public _estudianteService: EstudianteService,
              public materiaCursoOptativoService: MateriaImpartidaService,
              private _spinner: SpinnerService) {
    let usuarioLogueado: UsuarioSesion = this.authService.getUsuarioLogueado(); //Seguridad.getUsuarioLogueado();
    this.prepareServices();
    this.obtenerCatalogos();
    //this.obtenerSelectCatalogo();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    //this.idEstatusCatalogo = Number(params.get('id'));
    this.formulario = new FormGroup({
      programaDocente: new FormControl(''),
      promocion: new FormControl(''),
      optativa: new FormControl('')
    });
    if (this.idEstatusCatalogo) {
      this.edicionFormulario = true;
    }
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          if (this.usuarioRol.rol.id == 1) {
            this.oculto = false;
          }
          if (this.usuarioRol.rol.id == 2) {
            this.oculto = true;
          }
          this.getProgramaDocente();
        });
      }
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                OBTENER LISTA TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  onCambiosTabla(): void {
    this._spinner.start("optativas1");
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera + ',idEstatus~1222:IGUAL';
      urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    //console.log(urlSearch);
    this.materiaCursoOptativoService.getListaMateriaImpartida(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
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
          this.registros.push(new MateriaImpartida(item));
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("optativas1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("optativas1");
      }
    );
  }

  ngOnInit(): void {
    // this.onCambiosTabla();
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.promocionSelectEstatus = this.catalogosService.getPromocion()
      .getSelectPromocion(this.erroresConsultas, urlParameter);

  }

  buscarCriteriosCabezera(
    idPromocion: number,
    idMateria: number
  ): void {
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      this.criteriosCabezera = 'idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    if (idMateria) {
      this.criteriosCabezera = this.criteriosCabezera + ',idMateria.id~'
        + idMateria + ':IGUAL';
    }
    this.onCambiosTabla();
  }

  // COMPORTAMIENTO PAGINADOR
  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                COMPORTAMIENTO TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** ordenamiento de registros**************************************//
  sortChanged(columna): void {
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
  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }
  // ************************** para ponrle como una clase atributo seleccionar **************//
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  // ************************** Cuantos registros quieres que se muestren **************//
  setLimite(limite: string): void {
    if (this.registros.length > 0) {
      this.limite = Number(limite);
      this.onCambiosTabla();
    }
  }
  // ************************** El usuario selecciona el registro **************//
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                MODALS                                                     //
  ///////////////////////////////////////////////////////////////////////////////////////////////
/*  abrirModal(tipoModal): void {
    if (this.registroSeleccionado && (tipoModal === 'Detalle' || tipoModal === 'Editar')
      || tipoModal === 'Agregar') {

      let idMateriaOptativa: number;
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('lg', true, 27);
      let modalAgregarEstudiante = new ModalEstudiantesCRUDData(
        this.registroSeleccionado,
        this,
        tipoModal
      );

      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalAgregarEstudiante }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalEstudiantesCRUD,
        bindings,
        modalConfig
      );
    }
  }
*/
  activarBotonBusqueda(numero: number): any {
    if (numero == 3) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                FORMULARIOS                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                OBTENER CATALOGOS                                          //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  private obtenerCatalogos(): void {
    this.catalogoMaterias =
      this.catalogosService.getMateria();

  }

  private recuperarOptativas(id: number): void {
    let promocion: Promocion;
    this.optativaSelectEstatus = [];
    this.promocionService.getEntidadPromocion(id, this.erroresConsultas).subscribe(
      response => {
        promocion = new Promocion (response.json());
        this.planEstudiosService.getEntidadPlanEstudio(
          promocion.idPlanEstudios.id,
          this.erroresConsultas
        ).subscribe(
          response => {
            let planEstudio: PlanEstudio;
            planEstudio = new PlanEstudio(response.json());
            let urlParameter: URLSearchParams = new URLSearchParams();
            urlParameter.set('criterios', 'idPlanEstudios~' +
              planEstudio.id + ':IGUAL');
            this.planEstudiosMateriaService.getListaMateriasPlanSize(
              this.erroresConsultas,
              urlParameter
            ).subscribe(
              response => {
                response.json().lista.forEach((materia) => {
                  if (materia.id_materia.id_tipo.id === 2 ||
                    materia.id_materia.id_tipo.id === 1) {
                    let claveMateria = materia.id_materia.clave +
                      ' - ' + materia.id_materia.descripcion;
                    this.optativaSelectEstatus.push(
                      new ItemSelects(materia.id_materia.id, claveMateria));
                  }
                });
              }
            );
          }
        );
      }
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                INSTANCIAMIENTOS                                           //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  private prepareServices(): void {
    this.catalogosService = this.catalogosService;
    this.planEstudiosService = this.catalogosService.getPlanEstudios();
    this.planEstudiosMateriaService = this.catalogosService.getPlanEstudiosMateria();
    this.promocionService = this.catalogosService.getPromocion();
    this.usuarioRolService = this.catalogosService.getUsuarioRolService();
  }
  private getProgramaDocente(): void {
    if (this.oculto) {
      this._spinner.start('coor');
      this.programaDocenteSelectEstatus.push(
        new ItemSelects (
          this.usuarioRol.usuario.programaDocente.id,
          this.usuarioRol.usuario.programaDocente.descripcion
        )
      );
      this._spinner.stop('coor');
    } else if (this.band) {
      this._spinner.start('otro');
      this.programaDocenteSelectEstatus = this.catalogosService.
      getCatalogoProgramaDocente()
        .getSelectProgramaDocente(this.erroresConsultas);
      this.band = false;
      this._spinner.stop('otro');
    }
  }

/*  constructor() { }

  ngOnInit() {
  }

  getControlErrors(): boolean {
    return true;
  }
  mostarBotones(): boolean {
    return true;
  }*/
/////////////////////////////// MODALS ///////////////////////////////////////////

  @ViewChild('modalAgregarEstu')
  modalAgregarEstu: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

/////////////////////////////// AGREGAR ESTUDIANTES ////////////////////////////////
  registroActual: MateriaImpartida;
  private tipoModal: string

  // ************************** SERVICES**************************************//
  estudianteService;
  estudianteMateriaImpartidaService;
  // ************************** TABLAS**************************************//
  registroSeleccionadoAG: EstudianteMateriaImpartida;
  registrosAG: Array<EstudianteMateriaImpartida> = [];
  estudiantes: Array<Object> = [];
  registrosCurso: Array<number> = [];
  columnasAG: Array<any> = [
    { titulo: 'Matrícula', nombre: '', sort: false },
    { titulo: 'Alumno', nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: false},
  ];
  paginaActualAG: number = 1;
  limiteAG: number = 5;
  paginacionAG: PaginacionInfo;
  idEstudiante: number;

  public configuracionAG: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idCursoOptativo.valor' }
  };

  public configuracionAutocomplete: any = {
    paginacion: false,
    filtrado: { textoFiltro: ''}
  };

  // se declaran variables para consultas de base de datos
  private erroresConsultasAG: Array<ErrorCatalogo> = [];
  private erroresGuardadoAG: Array<Object> = [];

  //Autocomplete
  private isComplete: boolean = false;
  private matriculaSelAutocomplete: Estudiante;
  //private estudianteSelAutocomplete: Estudiante;

  protected searchStr2: string;
  protected opcions = [];
  estadoBoton: boolean = false;
  idEstudianteAgregar: number;

  private constructorAgregar(tipoModal): void {
    this.registroActual = this.registroSeleccionado;
    this.tipoModal = tipoModal;
    this.searchStr2 = '';

    this.registrosAG = [];
    this.estudiantes = [];
    this.registrosCurso = [];
    this.paginaActualAG = 1;
    this.limiteAG = 5;
    this.estadoBoton = false;
    // se declaran variables para consultas de base de datos
    this.erroresConsultasAG = [];
    this.erroresGuardadoAG = [];
    //Autocomplete
    this.isComplete = false;

    this.prepareServicesAG();
    this.onCambiosTablaAG();
    this.modalAgregar();
  }

  listaAlumnos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    if (this.promocionSeleccionada){
      let criterios = 'idPromocion~' + this.promocionSeleccionada + ':IGUAL';
      urlParameter.set('criterios', criterios);
    }
    this.estudianteService.getListaEstudianteOpcional(
        this.erroresConsultasAG,
        urlParameter
    ).subscribe(
        response => {
          let items = response.json().lista;
          if (items) {
            this.estudiantes = [];
            items.forEach((item) => {
              let it = new Estudiante(item);
              this.estudiantes.push({"id": item.id, "name": (it.matricula.matriculaCompleta ?
                      it.matricula.matriculaCompleta : '') + ' ' +
                  it.getNombreCompleto()});
            });
          }
        },
        error => {
          console.error(error);
          this.isComplete = false;
        },
        () => {
          this.isComplete = false;
        }
    );
  }

  sortChangedAG(columna): void {
    this.columnasAG.forEach((column) => {
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
      this.onCambiosTablaAG();
      // columna.sort = '';
    }
  }

  filtroChangedAG(filtroTexto): void {
    this.configuracionAG.filtrado.textoFiltro = filtroTexto;
  }


  // COMPORTAMIENTO PAGINADOR
  cambiarPaginaAG(evento: any): void {
    this.paginaActualAG = evento.page;
    this.onCambiosTablaAG();
  }

  isSetPaginacionAG(): boolean {
    let result: boolean = false;
    if (this.paginacionAG) {
      result = true;
    }
    return result;
  }

  rowSeleccionadoAG(registro): boolean {
    return (this.registroSeleccionadoAG === registro);
  }

  rowSeleccionAG(registro): void {
    if (this.registroSeleccionadoAG !== registro) {
      this.registroSeleccionadoAG = registro;
    } else {
      this.registroSeleccionadoAG = null;
    }
  }

  agregarEstudiante(): void {
    if (this.idEstudiante) {
        let json = '{"idEstudiante":"' + this.idEstudiante +
            '", "idMateriaImpartida": "' + this.registroActual.id + '"}';
        this.estudianteMateriaImpartidaService.postEstudianteMateriaImpartida(
            json,
            this.erroresGuardadoAG
        ).subscribe(
            response => {
              //console.log('Agregado');
              this.estadoBoton = false;
              this.onCambiosTablaAG();
            }
        );
    }
  }

  private autocompleteOnSelect(e) {
    this._spinner.start('auto');
    this.estudianteService.getEntidadEstudiante(
        e.id,
        this.erroresConsultasAG
    ).subscribe(
        response => {
          this.matriculaSelAutocomplete = new Estudiante(response.json());
          this.idEstudiante = this.matriculaSelAutocomplete.id;
          this._spinner.stop('auto');
        },
        error => {
          //if (assertionsEnabled())
          //console.error(error);
          this._spinner.stop('auto');
        },
        () => {
          //if (assertionsEnabled())
          //console.log('::::::::::' + this.matriculaSelAutocomplete.id);
          if (this.validarRegistroEstudiante(this.idEstudiante)){
            this.estadoBoton = true;
          }else{
            this.estadoBoton = false;
          }
          this._spinner.stop('auto');
        }
    );
    ///
  }

  filtroAutocompleteChanged(): void {
    this.estadoBoton = false;
  }

  private recuperarEstudiantes(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus~' + 1006 + ':IGUAL');
    this.estudianteService.getListaEstudianteOpcional(this.erroresConsultasAG, urlParameter)
        .subscribe(
            response => {
              response.json().lista.forEach((estudiante) => {
                this.estudiantes.push(new Estudiante(estudiante));
              });
              //console.log(this.estudiantes);
            }
        );
  }

  private prepareServicesAG(): void {
    this.estudianteService = this.catalogosService.getEstudiante();
    this.estudianteMateriaImpartidaService =
        this.catalogosService.getEstudianteMateriaImpartidaService();
    ///this.recuperarEstudiantes();
    this.listaAlumnos();
  }

  private onCambiosTablaAG(): void {
    this._spinner.start('tabla');
    this.registroSeleccionadoAG = null;
    this.matriculaSelAutocomplete = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let ordenamiento = 'idEstudiante.idDatosPersonales.primerApellido:ASC,' +
        'idEstudiante.idMatricula.matriculaCompleta:ASC';
    urlParameter.set(
        'criterios', 'idMateriaImpartida~' + this.registroActual.id + ':IGUAL');
    urlParameter.set('ordenamiento', ordenamiento);
    //urlParameter.set('limit', this.limite.toString());
    urlParameter.set('pagina', this.paginaActualAG.toString());
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.erroresConsultasAG,
        urlParameter,
        this.configuracionAG.paginacion
    ).subscribe(
        response => {
          this.registrosAG = [];
          response.json().lista.forEach((elemento) => {
            this.registrosAG.push(new EstudianteMateriaImpartida(elemento));
          });

          // datos paginacion
          let paginacionInfoJson = response.json();
          let paginasArray: Array<number> = [];
          for (var i = 0; i < paginacionInfoJson.paginas; i++) {
            paginasArray.push(i);
          }
          this.paginacion = new PaginacionInfo(
              paginacionInfoJson.registrosTotales,
              paginacionInfoJson.paginas,
              paginacionInfoJson.paginaActualAG,
              paginacionInfoJson.registrosPagina
          );
          this.recuperarRegistrosEstudiantes();
        },
        error => {
          this._spinner.stop('tabla');
        },
        () => {
        }
    );
  }

  private recuperarRegistrosEstudiantes(): void {
    this._spinner.start('recuRegis');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios',
        'idMateriaImpartida~' + this.registroActual.id + ':IGUAL');
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.erroresConsultasAG,
        urlParameter,
        this.configuracionAG.paginacion
    ).subscribe(
        response => {
          this.registrosCurso = [];
          response.json().lista.forEach((elemento) => {
            if(elemento.id_estudiante) {
              this.registrosCurso.push(elemento.id_estudiante.id);
            }else {
              this.registrosCurso.push(elemento.id_estudiante_movilidad_externa.id);
            }
          });
          this._spinner.stop('recuRegis');
        },
        error => {
          this._spinner.stop('recuRegis');
        },
        () => {
          this._spinner.stop('recuRegis');
        }
    );
  }

  private validarRegistroEstudiante (id: number): boolean {
    let acceso: boolean = true;
    for (var i = 0; i < this.registrosCurso.length; i++) {
      if (id == this.registrosCurso[i]) { // el === no funciona, por eso deje solo dos
        acceso = false;
        break;
      }
    }
    return acceso;
  }

  private eliminarEstudiante(): void {
    this._spinner.start('elim')
    if (this.registroSeleccionadoAG) {
      this.estudianteMateriaImpartidaService.deleteEstudianteMateriaImpartida(
          this.registroSeleccionadoAG.id,
          this.erroresGuardadoAG
      ).subscribe(
          response => {
            //console.log('Borrado');
            this.onCambiosTablaAG();
          },
          error => {
            this._spinner.stop('elim');
          },
          () => {
            this._spinner.stop('elim');
          }
      );
    }
  }

  private modalAgregar(): void {
    this.modalAgregarEstu.open('lg');
  }

  private cerrarModalAgregar(): void {
    this.modalAgregarEstu.close();
  }
}
