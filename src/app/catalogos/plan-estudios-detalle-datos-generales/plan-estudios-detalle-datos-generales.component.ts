import {Component, OnInit, Input} from '@angular/core';
import * as moment from "moment";
import {Router, ActivatedRoute} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";

@Component({
  selector: 'datosGenerales',
  templateUrl: './plan-estudios-detalle-datos-generales.component.html',
  styleUrls: ['./plan-estudios-detalle-datos-generales.component.css']
})
export class PlanEstudiosDetalleDatosGeneralesComponent implements OnInit {

  @Input()
  entidadPlanEstudios: PlanEstudio;

  private erroresConsultas: Array<ErrorCatalogo> = [];
  idPlanEstudios;
  planEstudiosService;

  constructor (route: ActivatedRoute, public _catalogosService: CatalogosServices,
               private _router: Router) {

  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }


  ngOnInit() {
  }

}
