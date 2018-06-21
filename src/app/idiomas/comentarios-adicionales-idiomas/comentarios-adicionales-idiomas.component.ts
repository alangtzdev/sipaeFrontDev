import { Component, OnInit, Input } from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';

@Component({
  selector: 'app-comentarios-adicionales-idiomas',
  templateUrl: './comentarios-adicionales-idiomas.component.html',
  styleUrls: ['./comentarios-adicionales-idiomas.component.css']
})
export class ComentariosAdicionalesIdiomasComponent implements OnInit {

  @Input()
  resultados: any;

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 2;
  registros: any;

  public observaciones: any = [];

  constructor() { }

  ngOnInit() {
    this.generarResultados();
  }

  private generarResultados(): void {
    let me = this;
    if (this.resultados) {
      if (this.resultados.observaciones) {
        this.resultados.observaciones.forEach(function (observacion) {
          me.agregarObservacion(observacion);
        });
      }
    }
    this.onCambiosTabla();
  }

  private agregarObservacion(observacion: string): void {
    let o = observacion.trim();
    if (o.length > 0) {
      this.observaciones.push(o);
    }
  }

  private onCambiosTabla() {
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

  private setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;
  }

  private getPaginacion() {
    return this.paginacion;
  }

  private isSetPaginacion(): boolean {
    let result = false;


    if (this.hasOwnProperty('paginacion') && this.paginacion.hasOwnProperty('registrosPagina')) {
      result = true;
    }
    return result;
  }

  private obtenerNumeroPaginas() {
    return Math.ceil(this.observaciones.length / this.limite);
  }

  private setLimite(limite: string): void {
        this.limite = Number(limite);
        this.onCambiosTabla();
  }

  private cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }


}
