import { Component, OnInit } from '@angular/core';
import {PreguntaFrecuenteService} from "../../services/entidades/pregunta-frecuente.service";
import {URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";

@Component({
  selector: 'app-faq-movilidad',
  templateUrl: './faq-movilidad.component.html',
  styleUrls: ['./faq-movilidad.component.css']
})
export class FaqMovilidadComponent implements OnInit {
  catalogoServices;
  public registros: Array<PreguntaFrecuenteService> = [];
  private consultarPreguntasFrecuentas: Array<PreguntaFrecuenteService> = [];
  private erroresConsultas: Array<Object> = [];
  constructor(
//    params: RouteParams,
    private _catalogosService: CatalogosServices,
    private router: Router
  ) {
    this.prepareServices();
    this.getPreguntasFrecuentes();

  }
  getPreguntasFrecuentes(): void {
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idClasificacion~' + '3' + ':IGUAL' + ',idEstatus~' + '1007' + ':IGUAL';
    urlParameter.set('criterios', criterio);
    let resultados: {
      lista: Array<PreguntaFrecuenteService>
    } =
      this.catalogoServices.getListaPreguntaFrecuentes(
        this.erroresConsultas,  urlParameter);
    this.registros = resultados.lista;
    //console.log('pruebas');
    //console.log(resultados.lista);
  }
  abrir(): void {
    this.router.navigate([ 'registroInteresadoMovilidad']);
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService.getPreguntasFrecuentes();
  }

  ngOnInit() {
  }

}
