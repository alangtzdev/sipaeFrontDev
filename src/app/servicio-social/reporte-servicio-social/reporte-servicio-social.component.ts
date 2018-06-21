import {Component, OnInit, ElementRef,
  Renderer, Injector, ViewChild} from '@angular/core';
import {URLSearchParams} from'@angular/http';
import {PaginacionInfo} from'../../services/core/pagination-info';
import {ReporteBimestral} from'../../services/entidades/reporte-bimestral.model';
import {ItemSelects} from'../../services/core/item-select.model';
import {ErrorCatalogo} from'../../services/core/error.model';
import {SpinnerService} from'../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from'../../services/catalogos/catalogos.service';
import {ModalComponent} from'ng2-bs3-modal/components/modal';
import {ServicioSocial} from '../../services/entidades/servicio-social.model';

@Component({
  selector: 'app-reporte-servicio-social',
  templateUrl: './reporte-servicio-social.component.html',
  styleUrls: ['./reporte-servicio-social.component.css']
})
export class ReporteServicioSocialComponent implements OnInit {

  @ViewChild('modalDetalleReporteSS')
  modalDetalleReporteSS: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = false;
  css: boolean = true;
  size: string = 'lg';
  output: string;
  private descripcionError: string = '';
  paginacion: PaginacionInfo;
  botonValido: boolean = false;
  criteriosCabezera: string = '';
  paginaActual: number = 1;
  limite: number = 10;

  registros: Array<ReporteBimestral> = [];

  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'matricula', sort: false },
        { titulo: 'Nombre del estudiante*',
            nombre: 'idServicioSocial.idSolicitudServicio.idEstudiante.idDatosPersonales.primerApellido',
            sort: 'asc' },
        { titulo: 'Tipo de servicio', nombre: 'idServicioSocial.idSolicitudServicio.institucion', sort: 'asc' },
        { titulo: 'Fecha de solicitud', nombre: 'idServicioSocial.idSolicitudServicio.fechaSolicitud', sort: 'asc' },
        { titulo: 'Estatus', nombre: 'idEstatus.valor', sort: 'asc' }
  ];

  registroSeleccionado: ReporteBimestral;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  public configuracion: any = {
    paginacion: true,
    filtrado: {
      textoFiltro: '',
      columnas:
      'idServicioSocial.idSolicitudServicio.idEstudiante.idDatosPersonales.primerApellido,' +
      'idServicioSocial.idSolicitudServicio.idEstudiante.idDatosPersonales.segundoApellido,' +
      'idServicioSocial.idSolicitudServicio.idEstudiante.idDatosPersonales.nombre,' +
      'idEstatus.valor'
      , textoFecha: ''
    }
  };
  servicioSocialService;
  catalogoEstatusService;
  reporteBimestralService;
  promocionSeleccionada = null;

  // variables para modal de detalle //
  private servicioSocialElegido: ServicioSocial;
  private reporte: ReporteBimestral;
  private historialReportes: boolean = false;
  private opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  private opcionesSelectPromocion: Array<ItemSelects> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  /// fin variables para modal de detalle ///
  private detalle: boolean = true;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private spinner: SpinnerService) {

    this.prepareServices();


    if(sessionStorage.getItem('reporteServicio')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('reporteServicioCriterios')){
        this.onCambiosTabla();
  }
    }
  ngOnInit(): void {
    this.onCambiosTabla();
  }

  activarBotonBusqueda(numero: number): any {
    this.botonValido = (numero === 1 && this.promocionSeleccionada);
  }

/*  ModalDetalleReporteServicioSocialTabs(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {

      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ModalDetalleReporteServicioSocialData(
            this.registroSeleccionado,
            this, true
          )
        }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleReporteServicioSocial,
        bindings,
        modalConfig
      );
    }
  }
  ModalSolicitudServicioSocialTabs(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {

      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ModalDetalleReporteServicioSocialData(
            this.registroSeleccionado,
            this, false
          )
        }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleReporteServicioSocial,
        bindings,
        modalConfig
      );
    }
  }*/
  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;
  }
  getPaginacion() {
    return this.paginacion;
  }
  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    let ordenamiento = '';

    if (!sessionStorage.getItem('reporteServicioCriterios')) {
      criterios = this.criteriosCabezera;
    

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios += (this.criteriosCabezera !== '') ? 'GROUPAND' : '';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });

    }
    ////console.log("criterios",criterios);
    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    sessionStorage.setItem('reporteServicioCriterios', criterios);
    sessionStorage.setItem('reporteServicioOrdenamiento', ordenamiento);
    sessionStorage.setItem('reporteServicioLimite', this.limite.toString());
    sessionStorage.setItem('reporteServicioPagina', this.paginaActual.toString());

}
this.limite = +sessionStorage.getItem('reporteServicioLimite') ? +sessionStorage.getItem('reporteServicioLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('reporteServicioPagina') ? +sessionStorage.getItem('reporteServicioPagina') : this.paginaActual;
  
    urlSearch.set('criterios', sessionStorage.getItem('reporteServicioCriterios')
     ? sessionStorage.getItem('reporteServicioCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('reporteServicioOrdenamiento') 
    ? sessionStorage.getItem('reporteServicioOrdenamiento') : ordenamiento);
  
 urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());

  
    ////console.log("urlSearch",urlSearch);
    this.spinner.start("reporteserviciosocial1");
    this.reporteBimestralService.getListaReporteBimestral(
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
        this.setPaginacion(new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          this.limite
        ));
        ////console.log("paginasinfo",paginacionInfoJson);
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new ReporteBimestral(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this.spinner.stop("reporteserviciosocial1");
   /*     if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop("reporteserviciosocial1");
/*        if (assertionsEnabled()) {
          ////console.log({ paginacionInfo: this.registros, lista: this.registros });
        }*/
      }
    );

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
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      // //console.log('evento', evento);
      // //console.log('Page changed to: ' + evento.page);
      // //console.log('Number items per page: ' + evento.itemsPerPage);
      // //console.log('paginaActual', this.paginaActual);
    }*/
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
  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion =
      this._catalogosService.getPromocion().
      getSelectPromocion(this.erroresConsultas, urlParameter);
    this.promocionSeleccionada = null;
  }
  promoSeleccionada(idPromocion: number): void {
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
    }else {
      this.promocionSeleccionada = null;
    }
    this.activarBotonBusqueda(1);
  }
  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idEstatus: number
  ): void {
    this.limpiarVariablesSession(); 
    this.criteriosCabezera = '';
    if (idPromocion) {
      this.criteriosCabezera += 'idServicioSocial.idSolicitudServicio.idEstudiante.' +
        'idPromocion.id~'
        + idPromocion + ':IGUAL;AND';
    }
    if (idEstatus) {
      this.criteriosCabezera += ',idEstatus.id~' + idEstatus + ':IGUAL;AND';
    }
   // console.log(this.criteriosCabezera);
  sessionStorage.setItem('reporteIdPromocion', idPromocion.toString());
  sessionStorage.setItem('reporteIdProgramaDocente', idEstatus.toString());
  this.onCambiosTabla(); 
            }
  mostrarBotones(): boolean {
    return (this.registroSeleccionado &&
    this.registroSeleccionado.estatus.id == 1211);
  }
  mostrarBotonDetalles(): boolean {
    return this.registroSeleccionado ? true : false;
  }
  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        ////console.log(this.exportarExcelUrl);
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

  // seccion de modal detalle ///
  ModalDetalleReporteServicioSocialTabs(): void {
    if (this.registroSeleccionado) {
      this.servicioSocialElegido = this.registroSeleccionado.servicioSocial;
      this.reporte = this.registroSeleccionado;
      this.historialReportes = true;
      this.modalDetalleReporteSS.open('lg');
    }
  }

  getContexto(): any {
    return this;
  }

  esDetalle(): boolean {
    return this.detalle;
  }

  cerrarModaDetalleReporteSS(): void {
    this.modalDetalleReporteSS.close();
    this.servicioSocialElegido = undefined;
    this.reporte = undefined;
    this.detalle = true;
    this.onCambiosTabla();
  }
  // fin de la seccion del modal detalle //
  /// modal detalle revision de reporte ///
  ModalSolicitudServicioSocialTabs(): void {
    if (this.registroSeleccionado) {
      this.servicioSocialElegido = this.registroSeleccionado.servicioSocial;
      this.reporte = this.registroSeleccionado;
      this.historialReportes = true;
      this.detalle = false;
      console.log('esDetallet', this.esDetalle());
      this.modalDetalleReporteSS.open('lg');
    }
  }
  /// fin modal detalle revision de reporte //
  private prepareServices(): void {
    this.servicioSocialService = this._catalogosService.getServicioSocialService();
    this.catalogoEstatusService = this._catalogosService.getEstatusCatalogo();
    let urlSearch = new URLSearchParams();
    let urlSearchEstatus = new URLSearchParams();
    urlSearchEstatus.set('ordenamiento','valor:ASC');
    urlSearchEstatus.set('criterios', 'idCatalogo.id~1009:IGUAL');
    urlSearch.set('criterios', 'idNivelEstudios.id~1:IGUAL');
    this.opcionesSelectProgramaDocente =
      this._catalogosService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    console.log('urlSearch', urlSearch);
    this.opcionesCatalogoEstatus = this.catalogoEstatusService.getSelectEstatusCatalogo(
      this.erroresConsultas, urlSearchEstatus);
    this.reporteBimestralService = this._catalogosService.getReporteBimestralService();
  }


limpiarVariablesSession() {
    sessionStorage.removeItem('reporteServicioCriterios');
    sessionStorage.removeItem('reporteServicioOrdenamiento');
    sessionStorage.removeItem('reporteServicioLimite');
    sessionStorage.removeItem('reporteServicioPagina');
  }

}
