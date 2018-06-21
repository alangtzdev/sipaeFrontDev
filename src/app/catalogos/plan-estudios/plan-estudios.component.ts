import { Component, OnInit } from '@angular/core';
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {PlanEstudioService} from "../../services/entidades/plan-estudio.service";
import {Router} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {PaginacionInfo} from "../../services/core/pagination-info";
import * as moment from "moment";
import {ErrorCatalogo} from "../../services/core/error.model";

@Component({
  selector: 'app-plan-estudios',
  templateUrl: './plan-estudios.component.html',
  styleUrls: ['./plan-estudios.component.css']
})
export class PlanEstudiosComponent implements OnInit {
  modificarEstatus;
  registroSeleccionado: PlanEstudio;
  public registros: Array<PlanEstudio> = [];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  columnas: Array<any> = [
    { titulo: 'Clave*', nombre: 'clave' },
    { titulo: 'Programa docente*', nombre: 'idProgramaDocente.descripcion'},
    { titulo: 'Fecha de aprobación', nombre: 'fechaAprobacion'},
    { titulo: 'Total de créditos del plan de estudios', nombre: 'totalCreditos'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus' }
  ];

  paginacion: PaginacionInfo;
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'clave,idProgramaDocente.descripcion' }
  };
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  constructor(private router: Router,
              private planestudioService : PlanEstudioService,
              private _catalogosService: CatalogosServices,
              public spinner: SpinnerService) {
    this.prepareServices();
    
    if(sessionStorage.getItem('plan-estudio')){
      let promocion='idPlanEstudios';
      }

      if (sessionStorage.getItem('PlanEstudiosCriterios')){
        this.getCatalogoPlanEstudios();
  }
  }

  ngOnInit(): void {
    this.getCatalogoPlanEstudios();
  }

  sortChanged(columna): void {
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
      this.getCatalogoPlanEstudios();
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.getCatalogoPlanEstudios();
  }

  mostrarTabla(): void {

  }

  cambiarVista(vista: string): void {
    if (this.registroSeleccionado && (vista === 'editar')) {
      this.router.navigate([
        '/plan-estudios/editar',
        {id: this.registroSeleccionado.id}
      ]);
    } else if (this.registroSeleccionado && (vista === 'detalle')) {
      this.router.navigate([
        '/plan-estudios/detalles',
        {id: this.registroSeleccionado.id}
      ]);
    } else {
      if (vista === 'crear') {
        this.router.navigate(['/plan-estudios/crear']);
      } else {
        // para ahorrar tiempo se utilizaron alertas de javascrit,
        // estas deben ser eliminadas y sustituidas por un modal
        //alert('Niguna accion valida');
      }
    }
  }

  getCatalogoPlanEstudios(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';
    console.log(this.configuracion.filtrado);
    console.log(this.configuracion.filtrado.textoFiltro);
    console.log('Pruebas de busqueda');

    if (!sessionStorage.getItem('planEstudiosCriterios')) {
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      ////console.log('Pruebas Unitarisa');
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      console.log(filtros);
      console.log(criterios);
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      ////console.log(criterios);
      urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

     sessionStorage.setItem('planEstudiosCriterios', criterios);
    sessionStorage.setItem('planEstudiosOrdenamiento', ordenamiento);
    sessionStorage.setItem('planEstudiosLimite', this.limite.toString());
    sessionStorage.setItem('planEstudiosPagina', this.paginaActual.toString());
}

this.limite = +sessionStorage.getItem('planEstudiosLimite') ? +sessionStorage.getItem('planEstudiosLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('planEstudiosPagina') ? +sessionStorage.getItem('planEstudiosPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('planEstudiosCriterios')
     ? sessionStorage.getItem('planEstudiosCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('planEstudiosOrdenamiento') 
    ? sessionStorage.getItem('planEstudiosOrdenamiento') : ordenamiento);
   urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());


      this.spinner.start("planestudios3");
    this.planestudioService.getListaPlanEstudio(
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
          this.registros.push(new PlanEstudio(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        console.error(error);
        this.spinner.stop("planestudios3");
      },
      () => {
        //console.log('paginacionInfo', this.paginacion);
        //console.log('registros', this.registros);
        this.spinner.stop("planestudios3");
      }
    );
  }

  activarPlanEstudios(): void {
    let idPlanEstudios: number;
    let estatus;
    estatus = {'idEstatus': '1007'};

    if (this.registroSeleccionado) {
      this.spinner.start("planestudios2");
      idPlanEstudios = this.registroSeleccionado.id;
      ////console.log(idPlanEstudios);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      ////console.log(jsonCambiarEstatus);

      this.planestudioService.putPlanEstudio(
        idPlanEstudios,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.spinner.stop("planestudios2");
          this.getCatalogoPlanEstudios();
        }
      );
    }
  }

  desactivarPlanEstudio(): void {
    let idPlanEstudios: number;
    let estatus;
    estatus = {'idEstatus': '1008'};

    if (this.registroSeleccionado) {
      this.spinner.start("planestudios1");
      idPlanEstudios = this.registroSeleccionado.id;
      ////console.log(idPlanEstudios);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      this.planestudioService.putPlanEstudio(
        idPlanEstudios,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.spinner.stop("planestudios1");
          this.getCatalogoPlanEstudios();
        }
      );
    }
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.getCatalogoPlanEstudios();
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

  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1007) {
      return true;
    } else {
      return false;
    }
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format("DD/MM/YYYY");
    }
    return retorno;
  }

  //Paginador
  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    //console.log('evento', evento);
    //console.log('Page changed to: ' + evento.page);
    //console.log('Number items per page: ' + evento.itemsPerPage);
    //console.log('paginaActual', this.paginaActual);
    this.getCatalogoPlanEstudios();
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

  private prepareServices(): void {
    this.planestudioService = this._catalogosService.getPlanEstudios();
  }

limpiarVariablesSession() {
    sessionStorage.removeItem('planEstudiosCriterios');
    sessionStorage.removeItem('planEstudiosOrdenamiento');
    sessionStorage.removeItem('planEstudiosLimite');
    sessionStorage.removeItem('planEstudiosPagina');
  }

}
