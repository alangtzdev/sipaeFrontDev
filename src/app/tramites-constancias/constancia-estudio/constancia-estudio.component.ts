import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {Router, Routes} from "@angular/router";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {SolicitudConstancia} from "../../services/entidades/solicitud-constancia.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import * as moment from "moment";
import {URLSearchParams} from "@angular/http";
import {ExpedirConstanciaComponent} from "../expedir-constancia/expedir-constancia.component";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {FormGroup, FormControl} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {PlantillaEditor} from "../../services/entidades/plantilla-editor.model";
import {ErrorCatalogo} from "../../services/core/error.model";
declare var tinyMCE: any;

@Component({
  selector: 'app-constancia-estudio',
  templateUrl: './constancia-estudio.component.html',
  styleUrls: ['./constancia-estudio.component.css']
})
export class ConstanciaEstudioComponent implements OnInit {


  criteriosCabezera: string = '';
  private erroresConsultas: Array<Object> = [];
  opcionesSelectProgramaDocente: Array<ItemSelects>;
  opcionesSelectPromocion: Array<ItemSelects>;
  estatusCatalogoService;
  solicitudService;
  router: Router;
  exportarExcelUrl = '';
  exportarPDFUrl = ''
  botonValido: boolean = false;
  botonValidoFecha: boolean = false;
  public dt: Date = new Date();
  dt2: Date = new Date();

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  registros: Array<SolicitudConstancia> = [];
  columnas: Array<any> = [
    { titulo: 'Matrícula del estudiante*', nombre: 'idEstudiante.idMatricula.matriculaCompleta'},
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido'},
    { titulo: 'Fecha de solicitud', nombre: 'fechaCreacion'},
    { titulo: 'Estatus*', nombre: 'idEstatus.valor'}
  ];
  registroSeleccionado: SolicitudConstancia;


  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido,idEstatus.valor,idEstudiante.idMatricula.matriculaCompleta'}
  };

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _router: Router,
              private _catalogosServices: CatalogosServices,
              private _catalogosService: CatalogosServices,
              private spinner: SpinnerService) {
    moment.locale('es');
    this.prepareServices();
    this.obtenerCatalogo();
    this.router = _router;
    this.formulario = new FormGroup({
      nombre: new FormControl(),
      isHtml: new FormControl(),
    });

     if (sessionStorage.getItem('constanciaEstudioIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('constanciaCriterios')) {
      this.onCambiosTabla();
    }
  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.solicitudService =
      this._catalogosService.getSolicitudConstancia();
  }

  private obtenerCatalogo(): void {;
    this.opcionesSelectProgramaDocente =
      this.estatusCatalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        //console.log(this.exportarExcelUrl);
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

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    //console.log('idProgramaDocente', idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion = this.estatusCatalogoService.getPromocion().
    getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  activarBotonBusqueda(numero: number): any {
    if(numero === 1){
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  activarBotonBusquedaFecha(numero: number): any {
    if(numero === 1){
      this.botonValido = true;
      this.botonValidoFecha = true;
    }else {
      this.botonValido = false;
      this.botonValidoFecha = false;
    }
  }

  getFechaInicio(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');

      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }

  getFechaFin(): string {
    if (this.dt2) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
  this.limpiarVariablesSession(); 
    let fechaInicio = moment(this.dt).format('DD/MM/YYYY hh:mma');
    let fechaFin = moment(this.dt2).format('DD/MM/YYYY hh:mma');
    if (idPromocion) {
      this.criteriosCabezera = 'idEstudiante.idPromocion~'
        + idPromocion + ':IGUAL';
      //if (this.botonValidoFecha) {
        this.criteriosCabezera =  this.criteriosCabezera + ',fechaCreacion~'
          + moment(this.dt).format('DD/MM/YYYY') + ':MAYOR'+'~'
          + moment(this.dt2).format('DD/MM/YYYY') + ':MENOR';
        this.botonValidoFecha=false;
      //}
    }
    else{
      this.criteriosCabezera = 'fechaCreacion~'
        + moment(this.dt).format('DD/MM/YYYY')+ ':MAYOR'+'~'
        + moment(this.dt2).format('DD/MM/YYYY') + ':MENOR';
    }

    sessionStorage.setItem('constanciaEstudioFechaInicio', moment(this.dt).format('DD/MM/YYYY'));
    sessionStorage.setItem('constanciaEstudioFechaFin', moment(this.dt2).format('DD/MM/YYYY'));
    //sessionStorage.setItem('constanciaEstudioIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('constanciaEstudioIdPromocion', idPromocion.toString());

    //console.log('FechaInicio', fechaInicio);
    //console.log('FechaFin', fechaFin);
    //console.log('idProgramaDocente', idProgramaDocente);
    //console.log('idPromocion', idPromocion);
    this.limpiarInput();
    this.onCambiosTabla();

  //  sessionStorage.setItem('constanciaIdPromocion', idPromocion.toString());
    sessionStorage.setItem('constanciaIdProgramaDocente', idProgramaDocente.toString());
  }

  ngOnInit(): void {
    if(sessionStorage.getItem('constanciaEstudioIdPromocion')){
      this.criteriosCabezera = 'idEstudiante.idPromocion~'+ sessionStorage.getItem('constanciaEstudioIdPromocion') + ':IGUAL';
      this.criteriosCabezera =  this.criteriosCabezera + ',fechaCreacion~'
        + sessionStorage.getItem('constanciaEstudioFechaInicio') + ':MAYOR'+'~'
        + sessionStorage.getItem('constanciaEstudioFechaFin') + ':MENOR';
      this.limpiarInput();
    }

    this.onCambiosTabla();
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  mostrarBotonExpedir(): boolean {
    if(this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.id == 1216) {
        return true;
      } else {
        return false;
      }
    }
    else{
      return false;
    }
  }

  mostrarBotonDetalle(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.id == 1215)
        return true;
    }
    return false;
  }
  onCambiosTabla(): void {
    this.registros = [];
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

    //console.log(this.criteriosCabezera);
    //criterios = this.criteriosCabezera;
    //criterios = '';
     if (!sessionStorage.getItem('constanciaCriterios')) {
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');

      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      if(this.criteriosCabezera != '') {
        criterios += 'GROUPAND,' + this.criteriosCabezera;
      }
    }else {
      criterios += this.criteriosCabezera;
    }


    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    sessionStorage.setItem('constanciaCriterios', criterios);
    sessionStorage.setItem('constanciaOrdenamiento', ordenamiento);
    sessionStorage.setItem('constanciaLimite', this.limite.toString());
    sessionStorage.setItem('constanciaPagina', this.paginaActual.toString());

    }
    this.limite = +sessionStorage.getItem('constanciaLimite') ? +sessionStorage.getItem('constanciaLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('constanciaPagina') ? +sessionStorage.getItem('constanciaPagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('constanciaCriterios')
    ? sessionStorage.getItem('constanciaCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('constanciaOrdenamiento') ? sessionStorage.getItem('constanciaOrdenamiento') : ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    //console.log(urlSearch);
    this.spinner.start("constanciaestudios1");
    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<SolicitudConstancia>
    } = this.solicitudService.getListaSolicitudConstancia(
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
          this.registros.push(new SolicitudConstancia(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error =>
      {
        this.spinner.stop("constanciaestudios1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop("constanciaestudios1");
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
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

  limpiarInput(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  filtroChanged(filtroTexto): void {
   this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
   this.limpiarVariablesSession();
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

/*  modalPlantillasDocumentos(): void {
    let dialog: Promise <ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, {useValue: new ModalPlantillasData(2, 3)}),
      provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
      provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
    ]);

    dialog = this.modal.open(
      <any>ModalPlantillas,
      bindings,
      modalConfig
    );
  }*/

  cambiarVista(vista: string): void {
    if (vista === 'expedir') {
      if ( this.rowSeleccionado ) {
        this.router.navigate(['tramite-constancia','expedir-constancia', {id: this.registroSeleccionado.id}]);
        //console.log('entre');
      }
    } else {
      if ( this.rowSeleccionado ) {
        this.router.navigate(['tramite-constancia','detalle-constancia', {id: this.registroSeleccionado.id}]);
      }
    }
  }
  ////////////////////////////////// MODALS ///////////////////////////////////////////
  @ViewChild('modalRepositorioFormatos')
  modalRepositorioFormatos: ModalComponent;
  @ViewChild('modalDetalleRepositorio')
  modalDetalleRepositorio: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';
  /////////////////////////////////// REPOSITORIO FORMATOS ///////////////////////////////

  registrosRF: Array<PlantillaEditor> = [];
  registroSeleccionadoRF: PlantillaEditor;
  paginaActualRF: number = 1;
  limiteRF: number = 10;
  parametroBusqueda: string = '';
  plantillaEditorService;

  columnasRF: Array<any> = [
    { titulo: 'Nombre', nombre: 'nivel', sort: false },
    { titulo: 'Estatus', nombre: 'isHtml'}
  ];

  public configuracionRF: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnasRF: 'idIdioma.descripcion,idNivel.valor,idProfesor.nombre'
    }
  };

  private constructorREPO(): void {
    this.prepareServicesRF();
    this.registroSeleccionadoRF = null;
    this.registrosRF = [];
    this.paginaActualRF = 1;
    this.limiteRF = 10;
    this.parametroBusqueda = '';
  }
  onCambiosTablaRF(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'isHtml~false:IGUAL';
    urlSearch.set('criterios', criterios);

    if (this.parametroBusqueda !== '') {
      criterios = this.parametroBusqueda;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracionRF.filtrado && this.configuracionRF.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracionRF.filtrado.columnasRF.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracionRF.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlSearch.set('criterios', criterios);
    }
    let ordenamiento = '';
    this.columnasRF.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limiteRF.toString());
    urlSearch.set('pagina', this.paginaActualRF.toString());
    console.log(urlSearch);

    //this._spinner.start();
    this.plantillaEditorService.getListaPlantillaEditor(
        this.erroresConsultas,
        urlSearch,
        this.configuracionRF.paginacion
    ).subscribe(
        response => {
          let plantillaEditorJson = response.json();

          this.registrosRF = [];
          this.paginacion = new PaginacionInfo(
              plantillaEditorJson.registrosTotales,
              plantillaEditorJson.paginas,
              plantillaEditorJson.paginaActualRF,
              plantillaEditorJson.registrosPagina
          );

          plantillaEditorJson.lista.forEach((item) => {
            this.registrosRF.push(new PlantillaEditor(item));
          });

          //this.exportarExcelUrl = plantillaEditorJson.exportarEXCEL;
          //this.exportarPdfUrl = plantillaEditorJson.exportarPDF;
        },
        error => {

          // this._spinner.stop();
        },
        () => {

          //this._spinner.stop();
        }
    );
    this.modalRepositorio();
  }

  rowSeleccionadoRF(registro): boolean {
    return (this.registroSeleccionadoRF === registro);
  }
  rowSeleccionRF(registro): void {
    if (this.registroSeleccionadoRF !== registro) {
      this.registroSeleccionadoRF = registro;
    } else {
      this.registroSeleccionadoRF = null;
    }
  }

  mostarBotonesEditar(): boolean {
    if (this.registroSeleccionadoRF && this.registroSeleccionadoRF.isHtml) {
      return true;
    }else {
      return false;
    }
  }
  mostarBotonesDetalle(): boolean {
    if (this.registroSeleccionadoRF) {
      return true;
    }else {
      return false;
    }
  }

  private prepareServicesRF() {
    this.plantillaEditorService = this._catalogosServices.getPlantillaEditorService();
    this.onCambiosTablaRF();
  }

  private modalRepositorio(): void {
    this.modalRepositorioFormatos.open('lg');
  }
  private cerrarModalRepositorio(): void {
    this.modalRepositorioFormatos.close();
  }
  //////////////////////////////////////////// DETALLE REPOSITORIO /////////////////////////////////////////////

  entidadPlantillaEditor: PlantillaEditor;
  plantillaEditorServiceDR;
  formulario: FormGroup;
  private erroresConsultasDR: Array<ErrorCatalogo> = [];
  idPlantillaEditor;


  private constructorDetalleRepo(): void {
    //console.log('constructor');
    this.erroresConsultasDR = [];
    this.idPlantillaEditor = this.registroSeleccionadoRF.id;

    this.prepareServicesDR();

    if (this.idPlantillaEditor) {
      //console.log('entreIf');
      this.plantillaEditorServiceDR.getEntidadPlantillaEditor(
          this.idPlantillaEditor,
          this.erroresConsultasDR
      ).subscribe(
          response => {
            this.entidadPlantillaEditor = new PlantillaEditor(response.json());
            tinyMCE.activeEditor.setContent(response.json().html_plantilla);
            tinyMCE.activeEditor.getBody().setAttribute('contenteditable', false);
          },
          error => {

          },
          () => {

          }
      );
    }

    this.formulario = new FormGroup({
      nombre: new FormControl(),
      isHtml: new FormControl(),
    });
    this.cerrarModalRepositorio();
    this.modalDetalleRepo();
  }
  repositorioFormatos(): void {
    this.cerrarModalDetalleRepo();
    this.constructorREPO();
  }
  catalogosServices;

  //INSTANCÍA SERVICE
  prepareServicesDR(): void {
    this.catalogosServices = this._catalogosServices;
    this.plantillaEditorServiceDR = this._catalogosServices.getPlantillaEditorService();
    //this.formatoHtmlService = this.catalogoServices.getFormatoHtmlService();
  }
  private modalDetalleRepo(): void {
    this.modalDetalleRepositorio.open('lg');
  }
  private cerrarModalDetalleRepo(): void {
    this.modalDetalleRepositorio.close();
  }
  limpiarVariablesSession() {
    sessionStorage.removeItem('constanciaCriterios');
    sessionStorage.removeItem('constanciaOrdenamiento');
    sessionStorage.removeItem('constanciaLimite');
    sessionStorage.removeItem('constanciaPagina');
  }
}
