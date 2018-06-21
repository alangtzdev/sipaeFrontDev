import {Component, OnInit, Input, Directive} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ChartsModule} from 'ng2-charts';
import {BaseChartDirective} from 'ng2-charts/ng2-charts';

@Component({
  selector: 'app-detalle-cometarios-adicionales',
  templateUrl: './detalle-cometarios-adicionales.component.html',
  styleUrls: ['./detalle-cometarios-adicionales.component.css']
})
// @Directive({selector: 'canvas[baseChart]', exportAs: 'base-chart'})
export class DetalleCometariosAdicionalesComponent implements OnInit {

  @Input()
  resultados: any;

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 2;
  registros: any;

  public observaciones: any = [];

  constructor() { }


  ngOnInit(): void {
    let me = this;
    if (this.resultados) {
      if (this.resultados.observaciones !== undefined) {
        this.resultados.observaciones.forEach(function (observacion) {
          me.agregarObservacion(observacion);
        });
      }
    }
    this.onCambiosTabla();
  }

  agregarObservacion(observacion: string): void {
    console.log('observacion', observacion);
    let o = observacion.trim();
    if (o.length > 0) {
      this.observaciones.push(o);
    }
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;


  if (this.hasOwnProperty('paginacion') && this.paginacion.hasOwnProperty('registrosPagina')) {
      result = true;
    }
    return result;
  }

  obtenerNumeroPaginas() {
    return Math.ceil(this.observaciones.length / this.limite);
  }

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;
  }

  getPaginacion() {
    return this.paginacion;
  }

  setLimite(limite: string): void {
        this.limite = Number(limite);
        this.onCambiosTabla();
  }

  onCambiosTabla() {
    let begin = ((this.paginaActual - 1) * this.limite);
    let end = begin + this.limite;

    this.setPaginacion(new PaginacionInfo(
      this.observaciones.length,
      this.obtenerNumeroPaginas(),
      this.paginaActual,
      this.limite
    ));

    this.registros = this.observaciones.slice(begin, end);

  }

}
