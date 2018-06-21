import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {MovilidadCurricular} from "../../services/entidades/movilidad-curricular.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {MovilidadCurricularService} from "../../services/entidades/movilidad-curricular.service";
import {DocumentoMovilidadCurricularService} from "../../services/entidades/documento-movilidad-curricular.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {DocumentoMovilidadCurricular} from "../../services/entidades/documento-movilidad-curricular.model";
import {ConfigService} from "../../services/core/config.service";

@Component({
  selector: 'app-solicitudes-movilidad',
  templateUrl: './solicitudes-movilidad.component.html',
  styleUrls: ['./solicitudes-movilidad.component.css']
})
export class SolicitudesMovilidadComponent {

  @ViewChild('modalDetalle')
  modalDetalleMovilidad: ModalComponent;
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
  programaDocenteService;
  promocionesService;
  catalogoServices;
  archivoService;
  registroSeleccionado: MovilidadCurricular;
  botonBuscar: boolean = false;
  exportarFormato = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,'
      + 'idEstudiante.idDatosPersonales.primerApellido,'
      + 'idEstudiante.idDatosPersonales.segundoApellido,'
      + 'idEstudiante.idMatricula.matriculaCompleta,'
      + 'idEstatus.valor'}
  };
  columnas: Array<any> = [
    { titulo: 'Matrícula*', nombre: 'idMatricula', sort: false },
    { titulo: 'Nombre del estudiante *',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Programa docente', nombre: 'idPromocion', sort: false  },
    { titulo: 'Estatus*', nombre: 'idEstatus.valor', sort: false }
  ];
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  private opcionesPromociones: Array<ItemSelects> = [];
  private opcionesSelectProgramaDocente: Array<ItemSelects>;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  // variables del modal

  movilidad: MovilidadCurricular;
  documentos: Array<DocumentoMovilidadCurricular> = [];

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public movilidadCurricularService: MovilidadCurricularService,
              public documentoMovilidadService: DocumentoMovilidadCurricularService,
              private _spinner: SpinnerService) {
    this.onCambiosTabla();
    this.prepareServices();
  }

/*  modalDetalleRegistro(): void {

    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if ( this.registroSeleccionado) {
      let idMovilidadCurricular = this.registroSeleccionado.id;
      let modalDetalleData = new ModalDetalleRegistroData(
        this,
        idMovilidadCurricular
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetalleData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleRegistro,
        bindings,
        modalConfig
      );
    }
  }*/

/*  modalGuardarOficio(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalExportarOficioData(2, 3) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalExportarOficio,
      bindings,
      modalConfig
    );
  }*/

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

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
/*    if (assertionsEnabled()) {
      //console.log('idProgramaDocente', idProgramaDocente);
    }*/
    let urlParameter: URLSearchParams = new URLSearchParams();

    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesPromociones = this.promocionesService
      .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.idProgramaDocente.id~'
        + idProgramaDocente + ':IGUAL';
      if (idPromocion) {
        this.criteriosCabezera = this.criteriosCabezera + ',idEstudiante.idPromocion.id~'
          + idPromocion + ':IGUAL';
      }
    }
/*    if (assertionsEnabled()) {
      //console.log('idPromocion.id', idPromocion);
    }*/
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();


    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {

      let filtrosCriterio: Array<string> = this.configuracion.filtrado.textoFiltro.split(' ');
      let filtros: Array<string> = [];
/*      if (assertionsEnabled()) {
        //console.log('filstros 2:::' + filtrosCriterio);
      }*/
      if (filtrosCriterio.length >= 1 && criterios != '')
        criterios = criterios + ';ANDGROUPAND';
      if (filtrosCriterio.length >= 1 ) {
        filtros = this.configuracion.filtrado.columnas.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[0] + ':LIKE;OR';
        });
        if (filtrosCriterio.length >= 2) {
          filtros = this.configuracion.filtrado.columnas.split(',');
          filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
              filtrosCriterio[1] + ':LIKE;OR';
          });
        }
        if (filtrosCriterio.length > 2) {
          filtros = this.configuracion.filtrado.columnas.split(',');
          filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
              filtrosCriterio[2] + ':LIKE;OR';
          });
        }
      }

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
/*    if (assertionsEnabled()) {
      //console.log('urlSearch::' + urlSearch);
      //console.log('criteriosss::' + criterios);
    }*/
    this._spinner.start("solicitudesmovilidad1");
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
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("solicitudesmovilidad1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("solicitudesmovilidad1");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
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
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*
    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }
*/
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

  generarOficioPresentacion(): void {
    this._spinner.start("solicitudesmovilidad2");
    this.movilidadCurricularService.getActaCalificaciones(
      this.registroSeleccionado.id,
      this.erroresConsultas, 'OficioMovilidad'
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
        this._spinner.stop("solicitudesmovilidad2");
      }
    );
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.promocionesService = this._catalogosService.getPromocion();
    this.opcionesSelectProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.archivoService = this._catalogosService.getArchivos();
  }

  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonesActivas(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id == 1218 &&
      this.registroSeleccionado.tipoMovilidad.id == 1) {
      return true;
    }else {
      return false;
    }
  }
  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  modalDetalleRegistro(): void {
    this.movilidad = null;
    this.documentos = [];
    this.modalDetalleMovilidad.open();
    this.getData();
  }

  cerrarModalDetalle(): void{
    this.movilidad = null;
    this.documentos = [];
    this.modalDetalleMovilidad.close();
  }

  verArchivo(id: number): void {
    //console.log("Cambios ver archivodgfd");
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("verArchivo");
      this.archivoService.generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("verArchivo");
          },
          () => {
            console.info('OK');
            this._spinner.stop("verArchivo");
          }
        );
    }
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("descargarArchivo");
      this.archivoService.generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("descargarArchivo");
          },
          () => {
            //console.info('OK');
            this._spinner.stop("descargarArchivo");
          }
        );
    }
  }

  getData(): void {
    this._spinner.start("traerDetalle");
    this.movilidadCurricularService.getMovilidad(
      this.registroSeleccionado.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.movilidad = new MovilidadCurricular(response.json());
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idMovilidad.id~' + this.movilidad.id + ':IGUAL');
        //console.log(this.movilidad);
        this.documentoMovilidadService
          .getListaDocumentoMovilidadCurricularOpcional(
            this.erroresConsultas,
            urlParameter
          ).subscribe(
          response => {
            //console.log(response.json());
            response.json().lista.forEach((documento) => {
              //console.log(documento);
              this.documentos.push( new DocumentoMovilidadCurricular(documento));
            });
          }
        );
      },
      error => {
        this._spinner.stop("traerDetalle");
      },
      () => {
        this._spinner.stop("traerDetalle");
      }
    );
  }
/*
  constructor() { }

  ngOnInit() {
  }

  mostrarBotonesActivas(): boolean {
    return true;
  }
  mostrarBotones(): boolean {
    return true;
  }*/

}
