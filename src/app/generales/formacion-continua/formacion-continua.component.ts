import { Component, OnInit } from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ActividadEvaluacionContinua} from "../../services/entidades/actividad-evaluacion-continua.model";
import {Router} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment"
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';


@Component({
  selector: 'app-formacion-continua',
  templateUrl: './formacion-continua.component.html',
  styleUrls: ['./formacion-continua.component.css']
})
export class FormacionContinuaComponent implements OnInit {
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<ActividadEvaluacionContinua> = [];
  registroSeleccionado: ActividadEvaluacionContinua;
  actividadEvaluacionContinuaService;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'actividad'}
  };
  private erroresConsultas: Array<Object> = [];

  columnas: Array<any> = [
    { titulo: 'Actividad*', nombre: 'actividad'},
    { titulo: 'Fecha', nombre: 'fecha' }
  ];

  constructor(
    params: Router,
    private router: Router,
    public _catalogosService: CatalogosServices,
    private _spinner: SpinnerService) {
    this.prepareServices();

     if(sessionStorage.getItem('formacion')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('formacionContinuaCriterios')){
        this.onCambiosTabla();
  }
  }

  cambiarVista(vista: string): void {
    if (this.registroSeleccionado && (vista === 'detalles' || vista === 'editar')) {
      if (vista === 'editar') {
        //console.log('entra a editar, seguira el roteo')
        this.router.navigate([ //.parent.navigate([
          'formacion-continua','editaractividad',
          { id: this.registroSeleccionado.id }
        ]);
        //console.log('paso el roteo')
      } else {
        this.router.navigate([ //.parent.navigate([
          'formacion-continua','detalleactividad',
          { id: this.registroSeleccionado.id }
        ]);
      }
    } else {
      if (vista === 'crear') {
        this.router.navigate(['formacion-continua','crearactividad']); //.parent.navigate(['CrearActividad']);
      } else {
        // para ahorrar tiempo se utilizaron alertas de javascrit,
        // estas deben ser eliminadas y sustituidas por un modal
        alert('Niguna accion valida');
      }
    }
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  private prepareServices(): void {
    this.actividadEvaluacionContinuaService =
      this._catalogosService.getActividadEvaluacionContinuaService();
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {

    this.registroSeleccionado = null;

    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    let ordenamiento = '';
    if (!sessionStorage.getItem('formacionContinuaCriterios')) {
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
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

    sessionStorage.setItem('formacionContinuaCriterios', criterios);
    sessionStorage.setItem('formacionContinuaOrdenamiento', ordenamiento);
    sessionStorage.setItem('formacionContinuaLimite', this.limite.toString());
    sessionStorage.setItem('formacionContinuaPagina', this.paginaActual.toString());
}

this.limite = +sessionStorage.getItem('formacionContinuaLimite') ? +sessionStorage.getItem('formacionContinuaLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('formacionContinuaPagina') ? +sessionStorage.getItem('formacionContinuaPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('formacionContinuaCriterios')
     ? sessionStorage.getItem('formacionContinuaCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('formacionContinuaOrdenamiento') 
    ? sessionStorage.getItem('formacionContinuaOrdenamiento') : ordenamiento);
   urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());

    this._spinner.start('listaActiviades');
    this.actividadEvaluacionContinuaService.getListaActividadEvaluacionContinua(
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
          this.registros.push(new ActividadEvaluacionContinua(item));
        });
      },
      error => {
        this._spinner.stop('listaActiviades');
      },
      () => {
        this._spinner.stop('listaActiviades');
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

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }



  eliminarActividadEvaluacionContinua() {
    //console.log('Eliminando...');
    this.actividadEvaluacionContinuaService.deleteActividadEvaluacionContinua(
      this.registroSeleccionado.id,
      this.erroresConsultas
    ).subscribe(
      () => {}, //console.log('Success'),
      console.error,
      () => {
        this.onCambiosTabla();
      }
    );
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('formacionContinuaCriterios');
    sessionStorage.removeItem('formacionContinuaOrdenamiento');
    sessionStorage.removeItem('formacionContinuaLimite');
    sessionStorage.removeItem('formacionContinuaPagina');
  }



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
/*  constructor() { }

  ngOnInit() {
  }
  mostarBotones(): boolean {
    return true;

  }*/
}
