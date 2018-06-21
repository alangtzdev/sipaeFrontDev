import {Component, OnInit, Renderer, Injector, ElementRef, ViewChild, NgZone, Inject} from '@angular/core';
import {MovilidadCurricular} from "../../services/entidades/movilidad-curricular.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {Router} from "@angular/router";
import {ItemSelects} from "../../services/core/item-select.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {EstudianteMateriaImpartida} from "../../services/entidades/estudiante-materia-impartida.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as moment from "moment";
import {Validacion} from "../../utils/Validacion";
import {PlanEstudiosMateria} from "../../services/entidades/plan-estudios-materia.model";
import {NgUploaderOptions} from "ngx-uploader/ngx-uploader";
import {ConfigService} from "../../services/core/config.service";
import {TipoDocumento} from "../../services/catalogos/tipo-documento.model";

@Component({
  selector: 'app-movilidades-vigentes',
  templateUrl: './movilidades-vigentes.component.html',
  styleUrls: ['./movilidades-vigentes.component.css']
})
export class MovilidadesVigentesComponent {

  @ViewChild('modalTerminarMovilidad')
  modalTerminarMovilidad: ModalComponent;
  @ViewChild('modalDocumentos')
  modalAgregarDocumentos: ModalComponent;
  @ViewChild('modalEditarSolMov')
  modalEditarSolMov: ModalComponent;
  @ViewChild('modalEditarSolMovEstancias')
  modalEditarSolMovEstancias: ModalComponent;
  @ViewChild('modalEditarSolMovTrabajo1')
  modalEditarSolMovTrabajo: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<MovilidadCurricular> = [];
  criteriosCabezera: string = '';
  modalidadService;
  movilidadCurricularService;
  promocionesService;
  catalogoServices;
  registroSeleccionado: MovilidadCurricular;
  router: Router;
  vistaARegresar = 'movilidades-vigentes';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido',
      columnasUnCriterio: 'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido',
      columnasDosCriterios: 'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idDatosPersonales.nombre',
      columnaTercer: 'idEstudiante.idDatosPersonales.nombre'}
  };
  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idMatricula', sort: false },
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc' },
    { titulo: 'Modalidad', nombre: 'idPromocion', sort: false },
    { titulo: 'Nombre de modalidad', nombre: 'idTipoMovilidad.valor', sort: false },
    { titulo: 'Estatus', nombre: 'idEstatus' }
  ];

  exportarFormato = '';
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  estudianteMateriaImpartida;
  documentoMovilidadCurricularService;

  private ID_RECHAZAR_MOVILIDAD = 1232;
  private opcionesPromociones: Array<ItemSelects> = [];
  private opcionesSelectModalidad: Array<ItemSelects>;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardadado: Array<ErrorCatalogo> = [];

  // variables de modal culminacion
  validacionActiva: boolean = false;
  entidadMovilidadCurricular: MovilidadCurricular;
  activarCali: boolean = false;
  estudianteMateria: EstudianteMateriaImpartida;
  private mostarBotonGuardar: boolean = true;
  generarConstancia: boolean = true;
  private alertas: Array<Object> = [];
  formularioTeminacionMov: FormGroup;
  private formularioActa: FormGroup;
  dt: Date;
  dt2: Date;
  fechaMaxima: Date;
  fechaMinima: Date;
  contador: number = 0;
  fechaConFormato: string = moment(this.dt).format('DD/MM/YYYY');
  private opcionesCatalogoMateria: Array<ItemSelects> = [];

  // variables de modal documentos
  formularioDocumentos: FormGroup;
  otro: boolean = true;
  nombreArchivo: String = '';
  tipoDocumentoService;
  listaDocumentos: Array<TipoDocumento> = [];
  idAreaDocumento: number;
  //variables subir archivos
  uploadFile: any;
  /*options: Object = {
   url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
   withCredentials: false,
   authToken: localStorage.getItem('token')
   };*/
  options: NgUploaderOptions;
  //zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];

  //variables modal editar trabajo de campo
  formularioEditarMovTrabajo: FormGroup;

  // variabñes modal estancias de investigacion
  formularioEditarMovEstancias: FormGroup;
  convenioService;
  listaConvenios: Array<ItemSelects> = [];
  institucion: boolean = false;

  //variables modal movilidad curricular
  formularioEditarMovCurricular: FormGroup;
  paisService;
  listaPaises: Array<ItemSelects> = [];
  planEstudiosMateria;
  listaMaterias: Array<PlanEstudiosMateria> = [];

  constructor(@Inject(NgZone) private zone: NgZone,
    private elementRef: ElementRef,
    private injector: Injector,
    private _renderer: Renderer,
    public _catalogosService: CatalogosServices,
    private _router: Router,
    private _spinner: SpinnerService) {
    this.router = _router;
    this.prepareServices();
    this.onCambiosTabla();

    this.inicializarFormularioMovTrabajo();
    this.inicializarFormularioMovEstancias();
    this.inicializarFormularioMovCurricular();
    this.inicializarFormularioTerminacion();
    this.inicializarFormularioDocumentos();
    this.inicializarOpcionesNgZone();


    if (sessionStorage.getItem('movilidadIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('movilidadCriterios')) {
      this.onCambiosTabla();
    } 
  }

  inicializarFormularioMovTrabajo() {
    this.formularioEditarMovTrabajo = new FormGroup({
      trabajoCampo: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      lugar: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl(''),
    });
    this.dt = new Date();
    this.dt2 = new Date();
  }
  inicializarFormularioMovEstancias() {
    this.formularioEditarMovEstancias = new FormGroup({
      estancia: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      idConvenio: new FormControl(''),
      institucionInteres: new FormControl('',
        Validators.compose([Validators.required])),
      nombreContacto: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
       fechaInicio: new FormControl(''),
       fechaFin: new FormControl('')

    });
    this.dt = new Date();
    this.dt2 = new Date();
  }

  inicializarFormularioMovCurricular() {
    this.formularioEditarMovCurricular = new FormGroup({
      idConvenio: new FormControl(''),
      institucionInteres: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      materiaCursar: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      idPais: new FormControl('', Validators.required),
      nombreContacto: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      puestoContacto: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      idMateria: new FormControl('', Validators.required),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl('')
    });
    this.dt = new Date();
    this.dt2 = new Date();
  }

  inicializarFormularioTerminacion() {
    this.formularioTeminacionMov = new FormGroup({
      idEstatus: new FormControl(1219),
      calificacionOrdinaria: new FormControl('', Validators.
      compose([Validacion.calificacionValidator, Validators.required])),
      fechaCulminacion: new FormControl('', Validators.required)
      //idMateriaImpartida: new Control('', Validators.required)
    });
    this.dt = new Date();
  }

  inicializarFormularioDocumentos() {
    this.formularioDocumentos = new FormGroup ({
      idArchivo: new FormControl ('', Validators.required),
      idMovilidad: new FormControl ('', Validators.required),
      auxiliar: new FormControl ('aux', Validators.required),
      otroTipoDocumento: new FormControl (''),
      idTipoDocumento: new FormControl ('', Validators.required),
    });
    this.dt = new Date();
    this.dt2 = new Date();
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

  /*  modalCulminacion(): void {
   let idMovilidadCurricular: number;

   if (this.registroSeleccionado) {
   idMovilidadCurricular = this.registroSeleccionado.id;
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);

   let modalDictamenData = new ModalCulminacionData(
   this,
   idMovilidadCurricular,
   this.registroSeleccionado.estudiante.id,
   this.registroSeleccionado.estudiante.periodoActual.id
   );
   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: modalDictamenData}),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
   provide(Renderer, { useValue: this._renderer })
   ]);

   dialog = this.modal.open(
   <any>ModalCulminacion,
   bindings,
   modalConfig
   );
   }
   }*/

  /*  modalDocumentoMovilidad(): void {
   let idMovilidadCurricular: number;

   if (this.registroSeleccionado) {
   idMovilidadCurricular = this.registroSeleccionado.id;
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);

   let modalDictamenData = new ModalAgregarDocumentoMovilidadData(
   this,
   idMovilidadCurricular,
   this.registroSeleccionado.tipoMovilidad.id
   );
   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: modalDictamenData}),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
   provide(Renderer, { useValue: this._renderer })
   ]);

   dialog = this.modal.open(
   <any>ModalAgregarDocumentoMovilidad,
   bindings,
   modalConfig
   );
   }
   }*/

  /*  modalEdicionSolicitudMovilidad(): void {
   let esEdicion = true;
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: new ModalSolicitarMovilidadData(
   this.registroSeleccionado.estudiante.id,
   null,
   esEdicion,
   this
   )
   }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>ModalSolicitarMovilidad,
   bindings,
   modalConfig
   );
   }*/

  /*  modalEdicionSolicitudEstanciaInvestigcion(): void {
   let esEdicion: boolean = true;
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: new ModalEstanciasInvestigacionData(
   this.registroSeleccionado.estudiante.id,
   null,
   esEdicion,
   this
   ) }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>ModalEstanciasInvestigacion,
   bindings,
   modalConfig
   );
   }*/

  /*  modalEdicionSolicitudTrabajoCampo(): void {
   let esEdicion: boolean = true;
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: new ModalTrabajoCampoData(
   this.registroSeleccionado.estudiante.id,
   null,
   esEdicion,
   this
   ) }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>ModalTrabajoCampo,
   bindings,
   modalConfig
   );
   }*/

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

  buscarCriteriosCabezera(
    idTipoMovilidad: number,
    idPromocion: number
  ): void {
  this.limpiarVariablesSession(); 
    this.criteriosCabezera = '';
    if (idTipoMovilidad) {
      this.criteriosCabezera = this.criteriosCabezera + 'idTipoMovilidad~'
        + idTipoMovilidad + ':IGUAL;AND,';
    }
    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + 'idEstudiante.idPromocion~'
        + idPromocion + ':IGUAL;AND';
    } else {
      this.criteriosCabezera = 'idTipoMovilidad~'
        + idTipoMovilidad + ':IGUAL;AND';
    }

    if (!idTipoMovilidad && !idPromocion) {
      this.criteriosCabezera = '';
    }

    sessionStorage.setItem('movilidadIdTipoMovilidad', idTipoMovilidad.toString());
    sessionStorage.setItem('movilidadIdPromocion', idPromocion.toString());

    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idEstatus.id~1218:IGUAL,idEstatus.id~1219:IGUAL;OR,' +
      'idEstatus.id~' + this.ID_RECHAZAR_MOVILIDAD + ':IGUAL;OR';
    let ordenamiento = '';
    urlSearch.set('criterios', criterios);
    if (!sessionStorage.getItem('movilidadCriterios')) {
    if (this.criteriosCabezera !== '') {
      criterios = criterios + 'GROUPAND,' + this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
      //console.log('criterios cabezera: ' + criterios);
    }
    //console.log('criterios', criterios);
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      //console.log(filtros);
      let criteriosAux = criterios;
      criterios = '';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        //console.log('cirterios en el forEach: ' + criterios);
      });
      criteriosAux ? criterios = criterios + 'GROUPAND,' +
          criteriosAux : criterios = criterios;
      //console.log(criterios);
      urlSearch.set('criterios', criterios);
    }
    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    sessionStorage.setItem('movilidadCriterios', criterios);
    sessionStorage.setItem('movilidadOrdenamiento', ordenamiento);
    sessionStorage.setItem('movilidadLimite', this.limite.toString());
    sessionStorage.setItem('movilidadPagina', this.paginaActual.toString());

    }

    urlSearch.set('criterios', sessionStorage.getItem('movilidadCriterios')
     ? sessionStorage.getItem('movilidadCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('movilidadOrdenamiento') ? sessionStorage.getItem('movilidadOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('movilidadLimite') ? sessionStorage.getItem('movilidadLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('movilidadPagina') ? sessionStorage.getItem('movilidadPagina') : this.paginaActual.toString());
    this._spinner.start("solicitudesinterporgramasprofesor1");
    this.movilidadCurricularService.getListaMovilidadCurricularSimple(
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
          this.registros.push(new MovilidadCurricular(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        console.error(error);
        /*   if (assertionsEnabled()) {
         console.error(error);
         }*/
        this._spinner.stop("solicitudesinterporgramasprofesor1");
      },
      () => {
        /*        if (assertionsEnabled()) {
         //console.log('paginacionInfo', this.paginacion);
         //console.log('registros', this.registros);
         }*/
        this._spinner.stop("solicitudesinterporgramasprofesor1");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
  this.limpiarVariablesSession();
    this.limite = Number(limite);
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

  descargarActaCalificaciones(): void {
    this._spinner.start("solicitudesinterporgramasprofesor2");
    this.movilidadCurricularService.getActaCalificaciones(
      this.registroSeleccionado.id,
      this.erroresConsultas,
      'ActaCalificacionesFinales'
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        //console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop("solicitudesinterporgramasprofesor2");
      }
    );
  }

  cambiarPagina(evento: any): void {
  this.limpiarVariablesSession();
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

  exportar(tipo): void {
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

  informacionComplementaria(): void {
    if ( this.rowSeleccionado ) {
      this.router.navigate(['movilidad-academica' , 'informacion-complementaria',  //.parent.navigate(['InformacionComplementariaMovilidad',
        {id: this.registroSeleccionado.id, vistaAnterior: this.vistaARegresar}]);
    }
  }

  detallesEstudianteMovilidad(): void {
    if ( this.rowSeleccionado ) {
      this.router.navigate(['movilidad-academica','detale-movilidad' , //.parent.navigate(['DetalleEstudianteMovilidad',
        {id: this.registroSeleccionado.id, vistaAnterior: this.vistaARegresar}]);
    }
  }

  rechazarMovilidad(): void {
    let jsonFormulario = '{"idEstatus": "' +
      this.ID_RECHAZAR_MOVILIDAD + '"}';
    this._spinner.start("solicitudesinterporgramasprofesor3");
    this.movilidadCurricularService.putMovilidadCurricular(
      this.registroSeleccionado.id,
      jsonFormulario,
      this.erroresGuardadado
    ).subscribe(
      response => {

      },
      error => {
        this._spinner.stop("solicitudesinterporgramasprofesor3");
      },
      () => {
        this._spinner.stop("solicitudesinterporgramasprofesor3");
        this.onCambiosTabla();
      }
    );
  }

  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
  }

  mostrarBotonesFinalizada(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id == 1219 &&
      this.registroSeleccionado.tipoMovilidad.id == 1) {
      return true;
    }else {
      return false;
    }
  }

  mostarBotonEdicionSolicitudCargaCurricular(): boolean {
    if (this.registroSeleccionado && (this.registroSeleccionado.estatus.id === 1218 ||
      this.registroSeleccionado.estatus.id === 1220) &&
      this.registroSeleccionado.tipoMovilidad.id === 1 ) {
      return true;
    } else {
      return false;
    }
  }

  mostarBotonEdicionSolicitudEstanciaInvestiacion(): boolean {
    if (this.registroSeleccionado && (this.registroSeleccionado.estatus.id === 1218 ||
      this.registroSeleccionado.estatus.id === 1220) &&
      this.registroSeleccionado.tipoMovilidad.id === 2 ) {
      return true;
    } else {
      return false;
    }
  }

  mostarBotonEdicionSolicitudTrabajoCampo(): boolean {
    if (this.registroSeleccionado && (this.registroSeleccionado.estatus.id === 1218 ||
      this.registroSeleccionado.estatus.id === 1220) &&
      this.registroSeleccionado.tipoMovilidad.id === 3 ) {
      return true;
    } else {
      return false;
    }
  }

  mostrarBotonesActivas(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id == 1218) {
      return true;
    }else {
      return false;
    }
  }

  mostrarInformacionComplementaria(): boolean {
    if (this.registroSeleccionado
      && this.registroSeleccionado.tipoMovilidad.id === 1) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonActaCalificacion(): boolean {
    let consecutivoGenerado = false;
    if (this.registroSeleccionado &&
      this.registroSeleccionado.tipoMovilidad.id === 1
      && this.registroSeleccionadoTieneIDMateriaImpartida()
      && this.registroSeleccionadoTieneActaCalificacion()
      && this.registroSeleccionado.estudianteMateriaImpartida.
        materiaImpartida.actaCalificacion.consecutivo) {
      consecutivoGenerado = true;
    }

    return consecutivoGenerado;
  }

  private registroSeleccionadoTieneIDMateriaImpartida(): boolean {
    let hayIDMateriaImpartidaRegistroSeleccionado = false;
    if (this.registroSeleccionado.estudianteMateriaImpartida &&
      this.registroSeleccionado.estudianteMateriaImpartida.materiaImpartida &&
      this.registroSeleccionado.estudianteMateriaImpartida.materiaImpartida.id) {
      hayIDMateriaImpartidaRegistroSeleccionado = true;
    }

    return hayIDMateriaImpartidaRegistroSeleccionado;
  }

  private registroSeleccionadoTieneActaCalificacion(): boolean {
    let hayActaCalificacionRegistroSeleccionado = false;
    if (this.registroSeleccionado && this.registroSeleccionadoTieneIDMateriaImpartida()
      && this.registroSeleccionado.estudianteMateriaImpartida.
        materiaImpartida.actaCalificacion
      && this.registroSeleccionado.estudianteMateriaImpartida.
        materiaImpartida.actaCalificacion.id) {
      hayActaCalificacionRegistroSeleccionado = true;
    }

    return hayActaCalificacionRegistroSeleccionado;
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.modalidadService = this._catalogosService.getTipoMovilidadService();
    this.promocionesService = this._catalogosService.getPromocion();
    this.opcionesPromociones =
      this.promocionesService.getSelectPromocion(this.erroresConsultas);
    this.opcionesSelectModalidad =
      this.modalidadService.getSelectTipoMovilidad(this.erroresConsultas);
    this.documentoMovilidadCurricularService =
      this._catalogosService.getDocumentoMovilidadCurricularService();
    this.estudianteMateriaImpartida =
      this._catalogosService.getEstudianteMateriaImpartidaService();
    this.movilidadCurricularService =
      this._catalogosService.getMovilidadCurricularService();
    this.convenioService =
      this._catalogosService.getConvenio();
    this.planEstudiosMateria = this._catalogosService.getPlanEstudiosMateria();
    this.paisService = this._catalogosService.getPais();
    this.tipoDocumentoService =
      this._catalogosService.getTipoDocumento();
  }

  /*TODO inicia modal agregar documento*/

  // modal documentos

  modalDocumentoMovilidad() {
    this.inicializarFormularioDocumentos();
    switch (this.registroSeleccionado.tipoMovilidad.id) {
      case 1:
        this.idAreaDocumento = 4;
        break;
      case 2:
        this.idAreaDocumento = 5;
        break;
      case 3:
        this.idAreaDocumento = 6;
        break;
    }

    this.getSelectDocumentos();
    (<FormControl>this.formularioDocumentos.controls['idMovilidad'])
      .patchValue(this.registroSeleccionado.id);
    this.modalAgregarDocumentos.open('lg');
  }

  getSelectDocumentos() {
    let urlParams = new URLSearchParams();
    urlParams.set('criterios', 'idAreaDocumento~' + this.idAreaDocumento +
      ':IGUAL,id~35:IGUAL;OR');
    this.listaDocumentos = this.tipoDocumentoService.getSelectTipoDocumentoCriterio(
      this.erroresConsultas, urlParams
    );
  }

  validarFormularioAgregarDoc(): boolean {
    if (this.formularioDocumentos.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlAgregarDoc(campo: string): FormControl {
    return (<FormControl>this.formularioDocumentos.controls[campo]);
  }

  habilitarOtro(id: number): void {
    if (id == 35) {
      (<FormControl>this.formularioDocumentos.controls['auxiliar']).patchValue('');
      this.otro = false;
    } else {
      (<FormControl>this.formularioDocumentos.controls['auxiliar']).patchValue('aux');
      this.otro = true;
    }
  }

  cerrarModalDocumentos(): void {
    this.formularioDocumentos.reset();
    this.modalAgregarDocumentos.close();
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        (<FormControl>this.formularioDocumentos.controls['idArchivo'])
          .patchValue(responseJson.id);
        //console.log(responseJson.id);
        this.nombreArchivo = responseJson.originalName;
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

  cambiarAuxiliar(): void {
    (<FormControl>this.formularioDocumentos.controls['auxiliar']).patchValue(
      this.getControlAgregarDoc('otroTipoDocumento').value
    );
  }

  private getControlErrorsAgregarDoc(campo: string): boolean {
    if (!(<FormControl>this.formularioDocumentos.controls[campo]).valid && this.validacionActiva) {
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

  private enviarFormularioAgregarDoc(): void {
    let jsonFormulario = JSON.stringify(this.formularioDocumentos.value, null, 2);
    if (this.validarFormularioAgregarDoc()) {
      this.documentoMovilidadCurricularService.
      postDocumentoMovilidadCurricular(
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
        response => {
          //console.log(response.json());
          this.onCambiosTabla();
          this.cerrarModalDocumentos();
        }
      );
    }else { }
  }

  /*TODO termina modal agregar documento --------------------------------*/



  /*------------------TODO inicia modal editar movilidad curricular*/

  // Editar movilidar modal

  modalEdicionSolicitudMovilidad() {
    this.inicializarFormularioMovCurricular();
    console.log('movilidad curricular');
    this.llenarSelectorMovilidadCurricular();
    this.obtenerMAterias(this.registroSeleccionado.estudiante.promocion.programaDocente.id);
    this.obtenerDatosMovilidadCurricular();
    this.modalEditarSolMov.open('lg');
  }

  llenarSelectorMovilidadCurricular() {
    this.listaConvenios = this.convenioService.getSelectConvenio();
    let urlParams = new URLSearchParams();
    urlParams.set('criterios', 'idAreaDocumento~5:IGUAL,id~35:IGUAL;OR');
    this.listaPaises = this.paisService.getSelectPais();
  }

  private obtenerDatosMovilidadCurricular(): void {
    console.log('obtener datos de movilidad');
    this._spinner.start('obtenerDatosMovilidad');
    let movilidadCurricularEstudiante: MovilidadCurricular;
    this.movilidadCurricularService.getEntidadMovilidadCurricular(
      this.registroSeleccionado.id,
      this.erroresGuardadado
    ).subscribe(
      response => {
        movilidadCurricularEstudiante =
          new MovilidadCurricular(response.json());
      },
      error => {
        this._spinner.stop('obtenerDatosMovilidad');
      },
      () => {
        this._spinner.stop('obtenerDatosMovilidad');
        this.mostrarDatosSiHayMovilidad(movilidadCurricularEstudiante);
      }
    );
  }

  private mostrarDatosSiHayMovilidad(movilidadCurricularEstudiante: MovilidadCurricular) {
    if (movilidadCurricularEstudiante) {
      //console.log('movilidadCurricular', movilidadCurricularEstudiante);
      this.mostrarDatosMovilidadCurricularEstudiante(movilidadCurricularEstudiante);
    } else {
      //this._spinner.stop();
    }
  }

  private mostrarDatosMovilidadCurricularEstudiante(movilidad: MovilidadCurricular): void {
    this._spinner.start('datosMvilidad');
    if (movilidad) {
      let fechaInicio = 'fechaInicio';
      let fechaFin = 'fechaFin';

      // movilidad trabajo de campo
      let trabajoCampo = 'trabajoCampo';
      let lugar = 'lugar';

      //movilidad estancias de investigacion
      let convenio = 'idConvenio';
      let institucion = 'institucionInteres';
      let estancia = 'estancia';
      let nombreContacto = 'nombreContacto';

      //movilidad curricular
      let materia = 'materiaCursar';
      let pais = 'idPais';
      let puestoDelContacto = 'puestoContacto';
      let idMateria = 'idMateria';

      let fechaInicioMovilidad = moment(movilidad.fechaInicio);
      let fechaFinMovilidad = moment(movilidad.fechaFin);

      (<FormControl>this.formularioEditarMovTrabajo.controls[trabajoCampo]).setValue(movilidad.trabajoCampo);
      (<FormControl>this.formularioEditarMovTrabajo.controls[lugar]).setValue(movilidad.lugar);

      if (movilidad.convenio.id) {
        (<FormControl>this.formularioEditarMovEstancias.controls[convenio]).setValue(movilidad.convenio.id);
      }
      (<FormControl>this.formularioEditarMovEstancias.controls[institucion]).setValue(movilidad.institucionInteres);
      (<FormControl>this.formularioEditarMovEstancias.controls[estancia]).setValue(movilidad.estancia);
      (<FormControl>this.formularioEditarMovEstancias.controls[nombreContacto]).setValue(movilidad.nombreContacto);

      if (movilidad.convenio.id) {
        (<FormControl>this.formularioEditarMovCurricular.controls[convenio]).setValue(movilidad.convenio.id);
      }
      if (movilidad.pais.id) {
        (<FormControl>this.formularioEditarMovCurricular.controls[pais]).setValue(movilidad.pais.id);
      }
      if (movilidad.materia.id) {
        (<FormControl>this.formularioEditarMovCurricular.controls[idMateria]).setValue(movilidad.materia.id);
      }
      (<FormControl>this.formularioEditarMovCurricular.controls[institucion]).setValue(movilidad.institucionInteres);
      (<FormControl>this.formularioEditarMovCurricular.controls[nombreContacto]).setValue(movilidad.nombreContacto);
      (<FormControl>this.formularioEditarMovCurricular.controls[materia]).setValue(movilidad.materiaCursar);
      (<FormControl>this.formularioEditarMovCurricular.controls[puestoDelContacto]).setValue(movilidad.puestoContacto);

       this.dt = new Date(fechaInicioMovilidad.toJSON());
       this.dt2 = new Date(fechaFinMovilidad.toJSON());
    }

    this._spinner.stop('datosMvilidad');
  }

  cerrarModalSolicitudMovilidad() {
    this.modalEditarSolMov.close();
  }

  validarFormularioEditarMovcurricular(): boolean {
    if (this.formularioEditarMovCurricular.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlCurricular(campo: string): FormControl {
    return (<FormControl>this.formularioEditarMovCurricular.controls[campo]);
  }

  getControlErrorsCurricular(campo: string): boolean {
    if (!(<FormControl>this.formularioEditarMovCurricular.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  obtenerMAterias(idProgramaDocenteDelEstudiante): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idPlanEstudios.idProgramaDocente.id~'
      + idProgramaDocenteDelEstudiante + ':IGUAL');
    this.planEstudiosMateria.getListaPlanMateria(
      this.erroresConsultas,
      urlSearch
    ).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.listaMaterias.push(new PlanEstudiosMateria(item));
      });
      //console.log(response);
    });
  }

  elegirFechaInicio(): any {
    this.contador = 0;
  }
  elegirFechaFin(): any {
    this.contador = 1;
  }
  getFechaInicioMovCurricular(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioEditarMovCurricular.controls['fechaInicio'])
        .patchValue(fechaConFormato + ' 10:30 am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }
  getFechaHastaMovCurricular(): string {
    if (this.dt2) {
      if ( this.contador === 0 ) {
        this.fechaMaxima = this.dt;
        //this.dt2 = Date(this.fechaMaxima.valueOf());
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioEditarMovCurricular.controls['fechaFin'])
          .patchValue(fechaConFormato + ' 10:30 am');
        return fechaConFormato;
      } else {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioEditarMovCurricular.controls['fechaFin'])
          .patchValue(fechaConFormato + ' 00:00am');
        return fechaConFormato;
      }
    } else {
      return moment(new Date()).format('L');
    }
  }

  editarFormularioSolicitudMovilidad(tipoMovilidad): void {
    console.log(tipoMovilidad);
    let formularioEdicion;
    switch (tipoMovilidad) {
      case 'trabajoCampo':
        console.log('case trabajo de campo');
        formularioEdicion = JSON.stringify(this.formularioEditarMovTrabajo.value, null, 2);
        console.log('this.formulario', this.formularioEditarMovTrabajo);
        if (this.validarFormularioTrabajoCampo()) {
          this.saveUpdateMovilidadCurricular(formularioEdicion);
        }
        this.cerrarModalSolicitudMovilidadTrabajoCampo();
        break;
      case 'estancias':
        console.log('case Estancias');
        formularioEdicion = JSON.stringify(this.formularioEditarMovEstancias.value, null, 2);
        if (this.validarFormularioEstancias()) {
          this.saveUpdateMovilidadCurricular(formularioEdicion);
        }
        this.cerrarModalSolicitudMovilidadEstancias();
        break;
      case 'curricular':
        console.log('case Curricular');
        formularioEdicion = JSON.stringify(this.formularioEditarMovCurricular.value, null, 2);
        if (this.validarFormularioEditarMovcurricular()) {
          this.saveUpdateMovilidadCurricular(formularioEdicion);
        }
        this.cerrarModalSolicitudMovilidad();
        break;
      default:
        break;
    }
  }

  saveUpdateMovilidadCurricular(formularioEdicion) {
    console.log('formualrioEdicion', formularioEdicion);
    this._spinner.start('editarMovTrabajoCampo');
    this.movilidadCurricularService.putMovilidadCurricular(
      this.registroSeleccionado.id,
      formularioEdicion,
      this.erroresGuardadado
    ).subscribe(
      response => {

      },
      error => {
        this._spinner.stop('editarMovTrabajoCampo');
      },
      () => {
        this._spinner.stop('editarMovTrabajoCampo');
        this.onCambiosTabla();
      }
    );
  }
  /*TODO termina modal editar movilidad curricular-------------*/


  /*-------------TODO inicia modal editar movilidad estancias de investigacion*/

  // modal editar movilidad estancias de inv.

  modalEdicionSolicitudEstanciaInvestigcion() {
    this.inicializarFormularioMovEstancias();
    this.listaConvenios = this.convenioService.getSelectConvenio();
    let urlParams = new URLSearchParams();
    urlParams.set('criterios', 'idAreaDocumento~5:IGUAL,id~35:IGUAL;OR');
    this.obtenerDatosMovilidadCurricular();
    this.modalEditarSolMovEstancias.open('lg');
  }

  cerrarModalSolicitudMovilidadEstancias() {
    this.modalEditarSolMovEstancias.close();
  }

  validarFormularioEstancias(): boolean {
    if (this.formularioEditarMovEstancias.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlEstancias(campo: string): FormControl {
    return (<FormControl>this.formularioEditarMovEstancias.controls[campo]);
  }

  getControlErrorsEstancias(campo: string): boolean {
    if (!(<FormControl>this.formularioEditarMovEstancias.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  habilitarInstitucion(id: number): void {
    //console.log('convenio' + id);
    if (id == 1) { // 1 id otro
      this.institucion = true;
    } else {
      this.institucion = false;
    }
  }

  getFechaInicioEstancias(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioEditarMovEstancias.controls['fechaInicio'])
        .patchValue(fechaConFormato + ' 10:30 am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }
  getFechaHastaMovEstancias(): string {
    if (this.dt2) {
      if ( this.contador === 0 ) {
        this.fechaMaxima = this.dt;
        //this.dt2 = Date(this.fechaMaxima.valueOf());
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioEditarMovEstancias.controls['fechaFin'])
          .patchValue(fechaConFormato + ' 10:30 am');
        return fechaConFormato;
      } else {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioEditarMovEstancias.controls['fechaFin'])
          .patchValue(fechaConFormato + ' 00:00am');
        return fechaConFormato;
      }
    } else {
      return moment(new Date()).format('L');
    }
  }

  /*TODO termina modal editar movilidad estancias de investigacion-------------*/

  /*-------------------------TODO inicia modal editar movilidad trabajo de campo*/

  modalEdicionSolicitudTrabajoCampo() {
    this.inicializarFormularioMovTrabajo();
    console.log('trabajo de campo');
    this.obtenerDatosMovilidadCurricular();
    this.modalEditarSolMovTrabajo.open('lg');
  }

  cerrarModalSolicitudMovilidadTrabajoCampo() {
    this.modalEditarSolMovTrabajo.close();
  }

  validarFormularioTrabajoCampo(): boolean {
    console.log('ValidandoFormulario Trabajo');
    if (this.formularioEditarMovTrabajo.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    /*if (this.fechaInvalida) {
     this.addErrorsMesaje(
     'La fecha de fin no es valida',
     'danger'
     );
     }*/
    return false;
  }

  getFechaInicioMovTrabajo(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioEditarMovTrabajo.controls['fechaInicio'])
        .patchValue(fechaConFormato + ' 10:30 am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }
  getFechaHastaMovTrabajo(): string {
    if (this.dt2) {
      if ( this.contador === 0 ) {
        this.fechaMaxima = this.dt;
        //this.dt2 = Date(this.fechaMaxima.valueOf());
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioEditarMovTrabajo.controls['fechaFin'])
          .patchValue(fechaConFormato + ' 10:30 am');
        return fechaConFormato;
      } else {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioEditarMovTrabajo.controls['fechaFin'])
          .patchValue(fechaConFormato + ' 00:00am');
        return fechaConFormato;
      }
    } else {
      return moment(new Date()).format('L');
    }
  }

  getControlTrabajoCampo(campo: string): FormControl {
    return (<FormControl>this.formularioEditarMovTrabajo.controls[campo]);
  }

  getControlErrorsTrabajoCampo(campo: string): boolean {
    if (!(<FormControl>this.formularioEditarMovTrabajo[campo]) &&
      this.validacionActiva) {
      return true;
    }else {
      return false;
    }
  }
  /*TODO termina modal editar movilidad trabajo de campo------------*/


  /*------------TODO inicia modal culminacion movilidad*/

  modalCulminacion(): void {
    this.activarCali = false;
    this.modalTerminarMovilidad.open('lg');
    this.obtenerMovilidadSeleccionada();
  }
  cerrarModalTerminarMovilidad(): void {
    this.activarCali = false;
    this.modalTerminarMovilidad.close();
  }

  obtenerMovilidadSeleccionada() {
    this._spinner.start("obtenerMovilidad");
    this.movilidadCurricularService.getEntidadMovilidadCurricular(
      this.registroSeleccionado.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadMovilidadCurricular
          = new MovilidadCurricular(response.json());
      },
      error => {
        /*if (assertionsEnabled()) {
         console.error(error);
         console.error(this.erroresConsultas);
         }*/
        //if (!this.activarCali)
        this._spinner.stop("obtenerMovilidad");
      },
      () => {
        /*if (assertionsEnabled()) {
         //console.log(this.entidadMovilidadCurricular);
         }*/
        //if (!this.activarCali)
        this._spinner.stop("obtenerMovilidad");

        if (this.entidadMovilidadCurricular.tipoMovilidad.id == 1) {
          this.activarCali = true;
          this.obtenerEstudianteMateria();
        }
      }
    );
  }

  validarFormularioTerminacion(): boolean {
    if (this.formularioTeminacionMov.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormularioTerminacion(): void {
    let jsonFormulario;
    if (this.entidadMovilidadCurricular.tipoMovilidad.id == 1) {
      console.log('movilidad curricular');
      if (this.validarFormularioTerminacion()) {
        jsonFormulario = '{"calificacionOrdinaria": "' +
          this.formularioTeminacionMov.value.calificacionOrdinaria + '", "fechaCulminacion": "' +
          this.formularioTeminacionMov.value.fechaCulminacion + '"}';
        //JSON.stringify(this.formulario.value, null, 2);
        this._spinner.start('enviarFormulario');
        this.estudianteMateriaImpartida.putEstudianteMateriaImpartida(
          this.estudianteMateria.id,
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
          response => {
            let jsonMovilidad = '{"idEstudianteMateriaImpartida": "' +
              this.estudianteMateria.id + '" , ' +
              '"idEstatus":"' + this.formularioTeminacionMov.value.idEstatus + '"}';
            this.movilidadCurricularService.putMovilidadCurricular
            (this.registroSeleccionado.id, jsonMovilidad,
              this.erroresConsultas)
              .subscribe(
                response => {
                  this._spinner.stop('enviarFormulario');
                  this.cerrarModalTerminarMovilidad();
                  if (this.generarConstancia) {
                    this.formularioActa = new FormGroup({
                      idMateriaImpartida:
                        new FormControl(this.estudianteMateria.materiaImpartida.id),
                      tipo: new FormControl('PROFESOR_FORANEO')
                    });
                    let actaJson = JSON.stringify(this.formularioActa.value, null, 2);
                    console.log('actaJson', actaJson);

                    // descomentar cuando esta la implementacion
                    this.postAcataCalificacion(actaJson);
                  } else {
                    this.onCambiosTabla();
                  }
                }
              );
          }
        );
      }
    }else {
      jsonFormulario = '{"fechaCulminacion": "' + this.formularioTeminacionMov.value.fechaCulminacion +
        '"}';
      this._spinner.start('postEstudianteMateriaImpartida');
      this.estudianteMateriaImpartida.postEstudianteMateriaImpartida(
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
        response => {
          let jsonMovilidad = '{"idEstudianteMateriaImpartida": "' +
            response.json().id + '" , ' +
            '"idEstatus":"' + this.formularioTeminacionMov.value.idEstatus + '"}';
          this.movilidadCurricularService.putMovilidadCurricular
          (this.registroSeleccionado.id, jsonMovilidad,
            this.erroresConsultas)
            .subscribe(
              response => {
                this._spinner.stop('postEstudianteMateriaImpartida');
                this.cerrarModalTerminarMovilidad();
                this.onCambiosTabla();
              },
              error => {
                this._spinner.stop('postEstudianteMateriaImpartida');
              }
            );
        }
      );
    }
  }

  getFechaEjemplo() {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioTeminacionMov.controls['fechaCulminacion'])
        .patchValue(fechaConFormato + ' 00:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getControlTerminacion(campo: string): FormControl {
    return (<FormControl>this.formularioTeminacionMov.controls[campo]);
  }

  getControlErrorsTerminacion(campo: string): boolean {
    if (!(<FormControl>this.formularioTeminacionMov.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  obtenerMateriasImpartidas(): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    paramUrl.set('criterios', 'idEstudiante.id~' + this.registroSeleccionado.estudiante.id + ':IGUAL,' +
      'idMateriaImpartida.idPeriodoEscolar.id~' + this.registroSeleccionado.estudiante.periodoActual.id + ':IGUAL;AND');

    this.catalogoServices.getEstudianteMateriaImpartidaService().
    getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      paramUrl
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        /*paginacionInfoJson.lista.forEach((item) => {
         this.opcionesCatalogoMateria.push(
         new ItemSelects(item.id_materia_impartida.id,
         item.id_materia_impartida.id_materia.descripcion)
         );
         });*/
      },
      error => {
        /*if (assertionsEnabled()) {
         console.error(error);
         }*/
      },
      () => {
        /*if (assertionsEnabled()) {
         //console.log('Materias x materia impartida', this.opcionesCatalogoMateria);
         }*/
      }
    );
  }

  obtenerEstudianteMateria(): void {
    this._spinner.stop("obtenerMateriasEstudiante");
    let paramUrl: URLSearchParams = new URLSearchParams;
    paramUrl.set('criterios', 'idEstudiante.id~' + this.registroSeleccionado.estudiante.id + ':IGUAL,' +
      //'idMateriaImpartida.idPeriodoEscolar.id~' + this.context.idPeriodo + ':IGUAL,' +
      'idMateriaImpartida.idMateria.id~' + this.entidadMovilidadCurricular.materia.id +
      ':IGUAL;AND');
    console.log(paramUrl);
    this.catalogoServices.getEstudianteMateriaImpartidaService().
    getListaEstudianteMateriaImpartida(this.erroresConsultas, paramUrl).subscribe(
      response => {
        if (response.json().lista.length > 0) {
          this.estudianteMateria = new EstudianteMateriaImpartida(
            response.json().lista[0]);
        }
      },
      error => {
        /*if (assertionsEnabled()) {
         console.log(error);
         }*/
        this._spinner.stop("obtenerMateriasEstudiante");
      },
      () => {
        this._spinner.stop("obtenerMateriasEstudiante");
        if (this.estudianteMateria) {
          this.verificarCalificaciones(this.estudianteMateria.materiaImpartida.id);
        } else {
          this.addErrorsMesaje('El alumno no está inscrito a la materia '
            + this.entidadMovilidadCurricular.materia.descripcion, 'danger');
          this.mostarBotonGuardar = false;
        }
      }
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

  private verificarCalificaciones(idMateriaImparitda: number) {
    this._spinner.stop('verificarMateriaCalificacion');
    let sinCalificacion: number = 0;
    let paramUrl: URLSearchParams = new URLSearchParams;
    let tamano;
    paramUrl.set('criterios', 'idMateriaImpartida~'
      + idMateriaImparitda + ':IGUAL;AND,' +
      'idMateriaImpartida.idPeriodoEscolar.id~' + this.registroSeleccionado.estudiante.periodoActual.id + ':IGUAL;AND,' +
      'idEstudiante~' + this.estudianteMateria.estudiante.id + ':NOT;AND');
    //console.log('paramVeri', paramUrl);
    this.catalogoServices.getEstudianteMateriaImpartidaService().
    getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      paramUrl
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          console.log(item);
          if (!item.calificacion_ordinaria) {
            sinCalificacion++;
          }
        });

      },
      error => {
        /*if (assertionsEnabled()) {
         console.log(error);
         }*/
        this._spinner.stop('verificarMateriaCalificacion');
      },
      () => {
        this._spinner.stop('verificarMateriaCalificacion');
        if (sinCalificacion > 0 ) {
          this.generarConstancia = false;
        }
        //console.log('generarConstancia: ', this.generarConstancia);
      }
    );
  }

  private postAcataCalificacion( actaJson ): void {
    this._spinner.start('actaCalificaciones');

    //console.log('json para firma', actaJson);
    this.catalogoServices.getMateriaImpartidaService().postFirma(
      actaJson,
      this.erroresConsultas
    ).subscribe(
      response => {
        console.log(response.json());
      },
      error => {
        console.log(error);
      },
      () => {
        this.cerrarModalTerminarMovilidad();
        this._spinner.stop('actaCalificaciones');
        this.onCambiosTabla();
      }
    );
  }
  /*TODO termina modal culminacion movilidad------------*/

limpiarVariablesSession() {
    sessionStorage.removeItem('movilidadCriterios');
    sessionStorage.removeItem('movilidadOrdenamiento');
    sessionStorage.removeItem('movilidadLimite');
    sessionStorage.removeItem('movilidadPagina');
  }

}
