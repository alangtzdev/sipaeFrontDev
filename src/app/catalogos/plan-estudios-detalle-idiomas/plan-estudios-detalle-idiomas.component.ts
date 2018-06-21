import { Component, OnInit } from '@angular/core';
import {PlanEstudioIdioma} from "../../services/entidades/plan-estudio-idioma.model";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import * as moment from "moment";
import {URLSearchParams} from "@angular/http";

@Component({
  selector: 'idiomasPlanEstudios',
  templateUrl: './plan-estudios-detalle-idiomas.component.html',
  styleUrls: ['./plan-estudios-detalle-idiomas.component.css']
})
export class PlanEstudiosDetalleIdiomasComponent implements OnInit {


  entidadPlanEstudios: PlanEstudio;
  idPlanEstudios;
  planEstudiosService;
  paginaActual: number = 1;
  limite: number = 10;
  planEstudiosIdiomaService;
  registros: Array<PlanEstudioIdioma> = [];
  registroSeleccionado: PlanEstudioIdioma;
  private sub: any;

  columnas: Array<any> = [
    { titulo: 'Idioma', nombre: 'idIdioma', sort: false }
  ];
  private erroresConsultas: Array<ErrorCatalogo> = [];



  constructor (route: ActivatedRoute,
               public _catalogosService: CatalogosServices,
               private _router: Router) {
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    ////console.log(this.idPlanEstudios);
    this.prepareServices();
    this.onCambiosTabla();
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
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

  onCambiosTabla(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    // console.warn(this.idPlanEstudios);
    let criterio = 'idPlanEstudios~' + this.idPlanEstudios + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.registros = this.planEstudiosIdiomaService.getListaPlanEstudioIdioma(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }

  private prepareServices(): void {
    this.planEstudiosIdiomaService = this._catalogosService.getPlanEstudioIdiomaService();
    // //console.log(this.planEstudiosIdiomaService);

  }


  ngOnInit() {
  }

}
