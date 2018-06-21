import { Component, OnInit } from '@angular/core';
import * as moment from "moment";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-plan-estudios-detalles',
  templateUrl: './plan-estudios-detalles.component.html',
  styleUrls: ['./plan-estudios-detalles.component.css']
})
export class PlanEstudiosDetallesComponent implements OnInit {


  entidadPlanEstudiosDetalle: PlanEstudio;
  idPlanEstudios;
  private sub: any;
  planEstudiosService;
  detallePlanEstudios;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor (route: ActivatedRoute,
               public _catalogosService: CatalogosServices,
               private _router: Router) {

    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
//    this.idPlanEstudios = Number(params.get('id'));
    ////console.log(this.idPlanEstudios);
    this.prepareServices();

    this.planEstudiosService.getEntidadPlanEstudio(
      this.idPlanEstudios,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadPlanEstudiosDetalle
          = new PlanEstudio(response.json());
        ////console.log(this.entidadPlanEstudiosDetalle);
        this.detallePlanEstudios = this.entidadPlanEstudiosDetalle.clave + ' - ' +
          this.entidadPlanEstudiosDetalle.programaDocente.descripcion;
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
        ////console.log(this.entidadPlanEstudiosDetalle);
      }
    );


  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  regresarCatalogoPlanEstudios(): any {
    this._router.navigate(['/catalogo/plan-estudios']);
  }

  private prepareServices(): void {
    this.planEstudiosService = this._catalogosService.getPlanEstudios();
    ////console.log(this.planEstudiosService);

  }


  ngOnInit() {
  }

}
