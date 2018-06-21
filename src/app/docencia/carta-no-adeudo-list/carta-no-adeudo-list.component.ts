import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {CartaNoAdeudo} from "../../services/entidades/carta-no-adeudo.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";

@Component({
  selector: 'app-carta-no-adeudo-list',
  templateUrl: './carta-no-adeudo-list.component.html',
  styleUrls: ['./carta-no-adeudo-list.component.css']
})
export class CartaNoAdeudoListComponent implements OnInit {

  paginacion: PaginacionInfo;
  paginasArray: Array<number> = [];
  paginaActual: number = 1;
  paginaActualPaginacion: number = 1;

  limite: number = 10;
  registros: Array<CartaNoAdeudo> = [];
  registroSeleccionado: CartaNoAdeudo;
  columnas: Array<any> = [
    { titulo: 'Nombre del estudiante',
      nombre: 'idSolicitud.idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Programa docente', nombre: 'idProgramaDocente', sort: false},
    { titulo: 'Fecha de solicitud', nombre: 'fechaSolicitud', sort: false},
    { titulo: 'Biblioteca', nombre: 'estatusBiblioteca', sort: false},
    { titulo: 'UTIC', nombre: 'estatusUTIC', sort: false},
    { titulo: 'Finanzas', nombre: 'estatusFinanzas', sort: false},
    { titulo: 'RMyS', nombre: 'estatusRMyS', sort: false},
    { titulo: 'Docencia', nombre: 'estatusDocencia', sort: false},
  ];
  cartaNoAdeudoService;
  programaDocenteService;
  promocionService;
  criteriosBusqueda = '';
  exportarFormato = '';
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
    'idSolicitud.idEstudiante.idDatosPersonales.nombre,' +
    'idSolicitud.idEstudiante.idDatosPersonales.primerApellido,' +
    'idSolicitud.idEstudiante.idDatosPersonales.segundoApellido,' +
    'idSolicitud.idEstudiante.idPromocion.idProgramaDocente.descripcion' }
  };
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private opcionesCatalogoPromocion: Array<ItemSelects>;
  private opcionesCatalogoProgramaDocente: Array<ItemSelects>;

  constructor(private _catalogosServices: CatalogosServices, public spinner: SpinnerService) {
    this.prepareServices();

    if (sessionStorage.getItem('cartaNoAdeudoId')) {
      let promocion = 'id';
    }

    if (sessionStorage.getItem('cartaNoAdeudoCriterios')) {
      this.onCambiosTabla();
    }
  }

  validarBotonFormato(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.solicitud.docencia &&
        this.registroSeleccionado.solicitud.utic &&
        this.registroSeleccionado.solicitud.finanzas &&
        this.registroSeleccionado.solicitud.rms &&
        this.registroSeleccionado.solicitud.biblioteca) {
        return false;
      }
    }
    return true;
  }

  // Paginacion
  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
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
  // Paginacion

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

  agregarCriteriosBusqueda(id: number): void {
    this.limpiarVariablesSession(); 
    this.criteriosBusqueda = 'idSolicitud.idEstudiante.idPromocion~' + id + ':IGUAL';
    sessionStorage.setItem('cartaNoAdeudoId', id.toString());
    console.log(this.criteriosBusqueda);
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';
    if (!sessionStorage.getItem('cartaNoAdeudoCriterios')) {
    if (this.criteriosBusqueda !== '') {
      criterios = this.criteriosBusqueda;
      urlSearch.set('criterios', criterios);
      //criterios = '';
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      //criterios = criterios + ';ANDGROUPAND';
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlSearch.set('criterios', criterios);
    }
    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    sessionStorage.setItem('cartaNoAdeudoCriterios', criterios);
    sessionStorage.setItem('cartaNoAdeudoOrdenamiento', ordenamiento);
    sessionStorage.setItem('cartaNoAdeudoLimite', this.limite.toString());
    sessionStorage.setItem('cartaNoAdeudoPagina', this.paginaActual.toString());

    }
    this.spinner.start("cartanoadeudolist1");
    urlSearch.set('ordenamiento', sessionStorage.getItem('cartaNoAdeudoOrdenamiento') ? sessionStorage.getItem('cartaNoAdeudoOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('cartaNoAdeudoLimite') ? sessionStorage.getItem('cartaNoAdeudoLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('cartaNoAdeudoPagina') ? sessionStorage.getItem('cartaNoAdeudoPagina') : this.paginaActual.toString());
    urlSearch.set('criterios', sessionStorage.getItem('cartaNoAdeudoCriterios') ? sessionStorage.getItem('cartaNoAdeudoCriterios') : criterios);
   // console.log(urlSearch);
    this.cartaNoAdeudoService.getListaCartaNoAdeudoPaginacion(
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
          this.registros.push(new CartaNoAdeudo(item));
        });
      },
      error => {
        this.spinner.stop("cartanoadeudolist1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop("cartanoadeudolist1");
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
      }
    );
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

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  cargarPromocion(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idProgramaDocente~' + id + ':IGUAL');
    this.opcionesCatalogoPromocion =
      this.promocionService.getSelectPromocion(this.erroresConsultas, urlSearch);
  }

  formatoCarta(): void {
    this.spinner.start("cartanoadeudolist2");
    this.cartaNoAdeudoService.getCartaNoAdeudoPdf(
      this.registroSeleccionado.id,
      this.erroresConsultas
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
        this.spinner.stop("cartanoadeudolist2");
      }
    );
  }

  private prepareServices(): void {
    this.cartaNoAdeudoService = this._catalogosServices.getCartaNoAdeudo();
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosServices.getPromocion();
    this.opcionesCatalogoProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.onCambiosTabla();
  }

//  constructor() { }

  ngOnInit() {
  }

limpiarVariablesSession() {
    sessionStorage.removeItem('cartaNoAdeudoCriterios');
    sessionStorage.removeItem('cartaNoAdeudoOrdenamiento');
    sessionStorage.removeItem('cartaNoAdeudoLimite');
    sessionStorage.removeItem('cartaNoAdeudoPagina');
  }

}
