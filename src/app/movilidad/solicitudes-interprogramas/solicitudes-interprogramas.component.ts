import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {MovilidadInterprograma} from "../../services/entidades/movilidad-interprograma.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {ConfigService} from "../../services/core/config.service";

@Component({
  selector: 'app-solicitudes-interprogramas',
  templateUrl: './solicitudes-interprogramas.component.html',
  styleUrls: ['./solicitudes-interprogramas.component.css']
})
export class SolicitudesInterprogramasComponent implements OnInit {

  @ViewChild('modalDetalleInterprograma')
  modalDetalleInterprograma: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //variable para service
  catalogoServices;
  periodoEscolarService;
  archivoService;
  //variables para la tabla y paginación
  registroSeleccionado: MovilidadInterprograma;
  public registros: Array<MovilidadInterprograma> = [];
  public periodos: Array<ItemSelects> = [];
  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idEstudiante'},
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Materia base', nombre: 'idMateriaCambiar'},
    { titulo: 'Materia de cambio', nombre: 'idMateriaCursar'},
    { titulo: 'Estatus *', nombre: 'idEstatus', sort: 'asc'}
  ];
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idEstatus.valor' }
  };
  mostrarBotonDetalle: boolean = false;

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<Object> = [];

  //
  entidadMovilidadInterprograma: MovilidadInterprograma;

  //Se declara constructor de la clase
  constructor(//private modal: Modal,
              private injector: Injector,
              private _catalogoServices: CatalogosServices,
              private spinner: SpinnerService) {
    this.prepareServices();
    this.obtenerPeriodosEscolares();
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = this.criteriosCabezera ? this.criteriosCabezera : '';
    urlSearch.set('criterios', criterios);

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = this.criteriosCabezera ? criterios + ';ANDGROUPAND' : criterios;
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
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

    console.log('urlsearch', urlSearch);
    this.obtenerSolicitudesInterprograma(urlSearch);
  }

  // ************************** Obtener las solicitudes de interprograma **************//
  obtenerSolicitudesInterprograma(urlSearch): void {
    this.spinner.start("solicitudesinterprogramas1");
    this.catalogoServices.getListaMovilidadInterprograma(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registros = [];
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new MovilidadInterprograma(item));
        });
      },
      error => {
        this.spinner.stop("solicitudesinterprogramas1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop("solicitudesinterprogramas1");
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
      }
    );
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

  // ************************** Obtener los periodos escolares activos **************//
  obtenerPeriodosEscolares(): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    paramUrl.set('criterios', 'idEstatus~1007:IGUAL');

    this.periodoEscolarService.getListaPeriodoEscolar(
      this.erroresConsultas,
      paramUrl
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.periodos = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.periodos.push(new ItemSelects(item.id, item.anio + ' - ' + item.periodo));
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('periodos', this.periodos);
        }*/
      }
    );
  }

  buscarCriteriosCabezera(
    idPeriodoEscolar: number
  ): void {
    this.criteriosCabezera = '';
    if (idPeriodoEscolar) {
      this.criteriosCabezera = this.criteriosCabezera +
        'idMateriaCambiar.idMateriaImpartida.idPeriodoEscolar.id~'
        + idPeriodoEscolar + ':IGUAL';
    }
    this.onCambiosTabla();
  }

  // ************************** para ponrle como una clase atributo seleccionar **************//
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  // ************************** El usuario selecciona el registro **************//
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.mostrarBotonDetalle = true;
    } else {
      this.registroSeleccionado = null;
      this.mostrarBotonDetalle = false;
    }
  }

  // ************************** Muestra detalle de Interprograma **************//
/*  modalDetalle(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    if (this.registroSeleccionado) {
      let idMovilidadInterprograma = this.registroSeleccionado.id;
      let modalDetallesData = new ModalDetalleInterprogramaDocenciaData(
        this,
        idMovilidadInterprograma,
        this.registroSeleccionado.archivo.id
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleInterprograma,
        bindings,
        modalConfig
      );
    }
  }*/

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
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
  // ************************** Cuantos registros quieres que se muestren **************//
  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }
  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  //Instanciamiento
  private prepareServices(): void {
    this.catalogoServices = this._catalogoServices.getMovilidadInterprograma();
    this.periodoEscolarService = this._catalogoServices.getPeriodoEscolar();
    this.archivoService = this._catalogoServices.getArchivos();
  }

  // Modal detalle interprogramas

  modalDetalle(): void {
    this.modalDetalleInterprograma.open('lg');
  }

  cerrarModalDetalleInter() {
    this.modalDetalleInterprograma.close();
  }

  descargarArchivo(): void {
    let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionado.archivo.id + '}';
    this.spinner.start('descargarArchivo');
    this.archivoService.generarTicket(jsonArchivo, this.erroresConsultas)
      .subscribe(
        data => {
          let json = data.json();
          let url =
            ConfigService.getUrlBaseAPI() +
            '/api/v1/archivovisualizacion/' +
            this.registroSeleccionado.archivo.id +
            '?ticket=' +
            json.ticket;
          window.open(url);
        },
        error => {
          this.spinner.stop('descargarArchivo');
        },
        () => {
          this.spinner.stop('descargarArchivo');
        }
      );
  }

//constructor() { }

  ngOnInit() {
  }

}
