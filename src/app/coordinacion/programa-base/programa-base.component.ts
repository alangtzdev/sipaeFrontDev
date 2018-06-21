import {Component, OnInit, ElementRef,
  Injector, Renderer, ViewChild} from '@angular/core';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ItemSelects} from '../../services/core/item-select.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {FormGroup, FormControl} from '@angular/forms';
import {URLSearchParams} from '@angular/http';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {MateriaService} from '../../services/entidades/materia.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {PlantillaEditorService} from '../../services/entidades/plantilla-editor.service';
declare var tinymce: any;
@Component({
  selector: 'app-programa-base',
  templateUrl: './programa-base.component.html',
  styleUrls: ['./programa-base.component.css']
})
export class ProgramaBaseComponent implements OnInit {

  @ViewChild('modalAgregarPrograma')
  modalAgregarPrograma: ModalComponent;
  @ViewChild('modalDetalleEditarPrograma')
  modalDetalleEditarPrograma: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  estatusCatalogoService;
  registros: Array<MateriaImpartida> = [];
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  selectProgramaDocenteDeshabilitado: boolean = false;
  programaDocenteService;
  promocionService;
  periodoEscolarService;
  usuarioService;
  usuarioRolService;
  idProgramaDocenteUsr: number;
  profesorMateriaService;
  promocionPeriodoService;
  materiaImpartidaService;
  listaProgramas: Array<ItemSelects> = [];
  listaPromociones: Array<Promocion> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  listaMateriaImpartida: Array<MateriaImpartida> = [];
  programaSeleccionado: number;
  periodoSeleccionado: number;
  promocionSeleccionada: number;
  registroSeleccionado: MateriaImpartida;
  profesor: {[key: number]: string; } = {};
  formulario: FormGroup;
  erroresConsultas: Array<Object> = [];
  columnas: Array<any> = [
    { titulo: 'Materias*', nombre: 'idMateria.descripcion', sort: 'asc'},
    { titulo: 'Profesor titular', nombre: '', sort: false}
  ];
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idMateria.descripcion' }
  };

  /// variables modal programa base ////
  formularioProgramaBase: FormGroup;
  erroresGuardado: Array<ErrorCatalogo> = [];
  /// termina variables modal programa base ////


  // Variables pare editar - detalle modal ////
  formularioEdiccionProgramaBase: FormGroup;
  programaBaseHtml: string = undefined;
  esEdicion: boolean = false;
  esNuevo: boolean = false;
  // Termina variables para editar - detalle modal ///

  // alertas
  private alertas: Array<Object> = [];


  constructor(// private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _catalogosService: CatalogosServices,
              private authService: AuthService,
              private plantillaEditorService: PlantillaEditorService,
              private materiaService: MateriaService,
              public spinner: SpinnerService
  ) {
    this.formulario = new FormGroup({
      idProgramaDocente: new FormControl('')
    });
    this.prepareServices();
    this.listarProgramas();
    this.crearFormularioProgramaBase();
    this.obtenerRolUsuarioLogeado(this.authService.getUsuarioLogueado().id);
  }

  ngOnInit(): void {
    this.paginacion = new PaginacionInfo(0, 1, 0, 0);
  }

  obtenerRolUsuarioLogeado(idUsuario: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let usuarioRol;
    urlSearch.set('criterios', 'idUsuario.id~' + idUsuario + ':IGUAL');
    this.spinner.start('programabase1');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          usuarioRol = new UsuarioRoles (elemento);
        });
      },
      error => {
        this.spinner.stop('programabase1');
      },
      () => {
        this.obtenerProgramaDocenteSiEsCoordinador(usuarioRol);
        this.spinner.stop('programabase1');
      }
    );
  }

  obtenerProgramaDocenteSiEsCoordinador(usuarioRol: UsuarioRoles) {
    if (usuarioRol.rol.id === 2) {
      this.obtenerProgramaDocenteUsuarioLogeado();
      this.selectProgramaDocenteDeshabilitado = true;
      (<FormControl>this.formulario.controls['idProgramaDocente']).disable();
    }
  }

  obtenerProgramaDocenteUsuarioLogeado(): void {
    this.usuarioService.getEntidadUsuario(
      this.authService.getUsuarioLogueado().id,
//      Seguridad.getUsuarioLogueado().id,
      this.erroresConsultas
    ).subscribe(
      response => {
        if (response.json().id_programa_docente) {
          this.idProgramaDocenteUsr = response.json().id_programa_docente.id;
          (<FormControl>this.formulario.controls['idProgramaDocente']).patchValue(this.idProgramaDocenteUsr);
//          updateValue(this.idProgramaDocenteUsr);
        }
      },
      error => {

      },
      () => {
        this.listarPromociones(this.idProgramaDocenteUsr);
      }
    );
  }

  listarProgramas(): void {
    let urlSearch = new URLSearchParams();
    this.listaProgramas = this.programaDocenteService.
    getSelectProgramaDocente(this.erroresConsultas, urlSearch);
  }

  listarPeriodos(idPromocion): void {
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    let urlSearch = new URLSearchParams();
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      urlSearch.set('criterios',
        'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
        ':IGUAL;AND');
      // urlSearch.set('ordenamiento', 'anio:DESC,mesInicio:ASC');
      this.promocionPeriodoService.getListaPromocionPeriodoEscolarPaginacion(
        this.erroresConsultas,
        urlSearch).subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPeriodos.push(new PromocionPeriodoEscolar(item));
        });
      });
    }
  }

  listarPromociones(idPrograma): void {
    this.listaPromociones = [];
    this.promocionSeleccionada = null;
    let urlSearch = new URLSearchParams();
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL;AND,idEstatus~1235:NOT');
      this.promocionService.getListaPromocionesPag(this.erroresConsultas, urlSearch).
      subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPromociones.push(new Promocion(item));
        });
      });
    }
  }

  getIdPeriodo(idPeriodo): void {
    this.periodoSeleccionado = idPeriodo ? idPeriodo : null;
  }

  onCambiosTabla(): void {
    this.spinner.start('programabase2');
    this.conformarCriteriosCabezera();
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    ////console.log('fitlro: ' + this.configuracion.filtrado.textoFiltro);
    let criterios = '';
    ////console.log('estos son de cabezera' + this.criteriosCabezera);
    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
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
    ////console.log('estos son los criterios' + criterios);
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
    ////console.log('search: ' + urlSearch);
    this.materiaImpartidaService.getListaMateriaImpartida(this.erroresConsultas,
      urlSearch, this.configuracion.paginacion).subscribe(
      response => {
        this.listaMateriaImpartida = [];
        let paginacionInfoJson = response.json();
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.listaMateriaImpartida.push(new MateriaImpartida(item));
        });
        this.spinner.stop('programabase2');
      }
    );
  }

  conformarCriteriosCabezera(): void {
    this.criteriosCabezera = 'idEstatus.id~1222:IGUAL;AND,';
    if (this.programaSeleccionado)
      this.criteriosCabezera += 'idMateria.idProgramaDocente.id~' +
        this.programaSeleccionado + ':IGUAL;AND';
    if (this.promocionSeleccionada) {
      if (this.criteriosCabezera.indexOf(';') > -1) {
        this.criteriosCabezera += ',idPromocion.id~' +
          this.promocionSeleccionada + ':IGUAL;AND';
      } else {
        this.criteriosCabezera += ';AND,idPromocion.id~' +
          this.promocionSeleccionada + ':IGUAL;AND';
      }
    }
    if (this.periodoSeleccionado) {
      if (this.criteriosCabezera.indexOf(';') > -1) {
        this.criteriosCabezera += ',idPeriodoEscolar.id~' +
          this.periodoSeleccionado + ':IGUAL';
      } else {
        this.criteriosCabezera += ';AND,idPeriodoEscolar.id~' +
          this.periodoSeleccionado + ':IGUAL;AND';
      }
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    if (this.registros.length > 0) {
      this.limite = Number(limite);
      this.onCambiosTabla();
    }
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

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

  mostrarBotonAgregarProgramaBase(): boolean {
    if (this.registroSeleccionado) {
      ////console.log(this.registroSeleccionado.materia);
      if (this.registroSeleccionado.materia.archivoProgramaBase.id == undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  mostrarBotonesEdicionDetallesProgBase() {
    return (this.registroSeleccionado && this.registroSeleccionado.materia &&
    this.registroSeleccionado.materia.archivoProgramaBase &&
    this.registroSeleccionado.materia.archivoProgramaBase.id);
  }

/*  modalAgregarProgramaBase(): void {
    let idProgramaBase: number;

    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalFormularioData = new ModalAgregarProgramaBaseData(
      this,
      this.registroSeleccionado
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalAgregarProgramaBase,
      bindings,
      modalConfig
    );
  }*/

/*  modalDetalleProgramaBase(): void {
    let idProgramaBase: number;
    if (this.registroSeleccionado) {
      idProgramaBase = this.registroSeleccionado.id;
    }

    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalFormularioData = new ModalEditarProgramaBase(
      this,
      this.registroSeleccionado.materia,
      false
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>EditarProgramaBase,
      bindings,
      modalConfig
    );
  }
  modalEditarProgramaBase(): void {
    let idProgramaBase: number;
    if (this.registroSeleccionado) {
      idProgramaBase = this.registroSeleccionado.id;
    }
    //console.log('programaBase: ' + this.registroSeleccionado.id);

    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalFormularioData = new ModalEditarProgramaBase(
      this,
      this.registroSeleccionado.materia,
      true
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>EditarProgramaBase,
      bindings,
      modalConfig
    );
  }*/

  private prepareServices(): void {
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosService.getPromocion();
    this.periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this.materiaImpartidaService = this._catalogosService.getMateriaImpartidaService();
    this.profesorMateriaService = this._catalogosService.getProfesorMateriaService();
    this.promocionPeriodoService = this._catalogosService.getPromocionPeriodoEscolarService();
    this.usuarioService = this._catalogosService.getUsuarioService();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
  }

/*  constructor() { }

  ngOnInit() {
  }

  mostrarBotonAgregarProgramaBase(): boolean {
    return true;
  }
  mostrarBotonesEdicionDetallesProgBase(): boolean {
    return true;
  }*/

  /*********************************
   *  INICIA AGREGAR PROGRAMA BASE *
  **********************************/

  actualizarFormulario(): void {
    this.getControl('nombre').
      patchValue(this.registroSeleccionado.materia.descripcion);
  }


  crearFormularioProgramaBase(): void {
    this.formularioProgramaBase = new FormGroup({
      nombre: new FormControl('')
    });
  }

  agregarFormControlProgramaBase(): void {
    this.formularioProgramaBase.addControl('isHtml', new FormControl(true));
      this.formularioProgramaBase.addControl('htmlPlantilla', new FormControl(
        tinymce.activeEditor.getContent()
        )
      );
  }

  guardar (): void {
    if (this.validarFormulario()) {
      this.agregarFormControlProgramaBase();
      this.guardarPlantilla();
    }
  }

  guardarPlantilla(): void {
    let idPlantilla: number;
    let jsonProgramaBase = JSON.stringify(this.formularioProgramaBase.value, null, 2);
    this.spinner.start('guardar');
    this.plantillaEditorService.postPlantillaEditor(
          jsonProgramaBase,
          this.erroresGuardado
      ).subscribe(
          response => {
            idPlantilla = response.json().id;
          },
          error => {
            this.spinner.stop('guardar');
            console.log(error);
          },
          () => {
            this.guardarProgramaBase(idPlantilla);
          }
      );
  }

  guardarProgramaBase(idPlantilla): void {

    let json = '{"idArchivoProgramaBase": "' + idPlantilla + '"}';
    this.materiaService.putMateria(
      this.registroSeleccionado.materia.id,
      json,
      this.erroresGuardado
    ).subscribe(
        response => {
            ////console.log('Actualizacion exitosa');
        },
        error => {
            console.error(error);
            this.spinner.stop('guardar');
        },
        () => {
            this.spinner.stop('guardar');
            this.onCambiosTabla();
            this.cerrarModalDetalleEdicion();
        }
    );
  }

  getControl(campo: string): FormControl {
        return (<FormControl>this.formularioProgramaBase.controls[campo]);
  }

  cerrarModalAgregarPrograma(): void {
    this.modalAgregarPrograma.close();
    this.crearFormularioProgramaBase();
  }

  /*********************************
   *  TERMINA AGREGAR PROGRAMA BASE *
  **********************************/

  /******************************************
   *  INICIA EDITAR - DETALLE PROGRAMA BASE *
  *******************************************/
  modalEditarDetalleProgramaBase(modo): void {
    tinymce.activeEditor.setContent('');
    if (modo === 'editar') {
      this.esEdicion = true;
      this.obtenerProramaBaseHtlm();
      this.establecerContenidoEditor();
      this.establecerModoEdiccionDetalle();
    } else if ( modo === 'nuevo') {
      this.esNuevo = true;
      this.actualizarFormulario();
    } else if ( modo === 'detalle') {
      this.obtenerProramaBaseHtlm();
      this.establecerContenidoEditor();
      this.establecerModoEdiccionDetalle();
    }
    this.modalDetalleEditarPrograma.open('lg');
  }

  obtenerProramaBaseHtlm(): void {
    this.programaBaseHtml =
      this.registroSeleccionado.materia.archivoProgramaBase.htmlPlantilla;
  }

  establecerContenidoEditor(): void {
    if (this.programaBaseHtml) {
      tinymce.activeEditor.setContent(this.programaBaseHtml);
    }
  }

  establecerModoEdiccionDetalle(): void {
    if (this.esEdicion) {
      tinymce.activeEditor.getBody().setAttribute('contenteditable', true);
    } else if (!this.esEdicion && !this.esNuevo) {
      tinymce.activeEditor.getBody().setAttribute('contenteditable', false);
    }
  }

  actualizarProgramaBase(): void {
    if (this.validarFormulario()) {
      this.crearFormularioEdicion();
      this.putFormularioEdicionProgramaBase();
    }
  }

  putFormularioEdicionProgramaBase(): void {
    let jsonProgramaBase =
      JSON.stringify(this.formularioEdiccionProgramaBase.value, null, 2);
    this.spinner.start('actualizar');
    this.plantillaEditorService.putPlantillaEditor(
        this.registroSeleccionado.materia.archivoProgramaBase.id,
        jsonProgramaBase,
        this.erroresGuardado
    ).subscribe(response => {},
        error => {
          this.spinner.stop('actualizar');
        },
        () => {
            this.spinner.stop('actualizar');
            this.onCambiosTabla();
            this.cerrarModalDetalleEdicion();
        }
    );
  }

  validarFormulario(): boolean {
    let valido: boolean;
    if (tinymce.activeEditor.getContent() !== '') {
      valido = true;
    } else {
      this.mostrarMensajeTipoAlert(
        'No has agregado un programa base',
        'danger'
      );
    }
    return valido;
  }

  crearFormularioEdicion(): void {
    this.formularioEdiccionProgramaBase = new FormGroup({
      htmlPlantilla: new FormControl(tinymce.activeEditor.getContent())
    });
  }

  cerrarModalDetalleEdicion(): void {
    this.esEdicion = false;
    this.esNuevo = false;
    this.programaBaseHtml = undefined;
    this.modalDetalleEditarPrograma.close('lg');
  }
  /******************************************
   *  TERMINA EDITAR - DETALLE PROGRAMA BASE *
  *******************************************/

  private mostrarMensajeTipoAlert(mensaje: string, tipo: string) {
    this.alertas.push({
      msg: mensaje,
      type: tipo,
      closable: true,
      tiempo: 3000
    });
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

}
