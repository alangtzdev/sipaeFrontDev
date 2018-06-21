import { Component, OnInit } from '@angular/core';
import {Profesor} from "../../services/entidades/profesor.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-profesor-detalles',
  templateUrl: './profesor-detalles.component.html',
  styleUrls: ['./profesor-detalles.component.css']
})
export class ProfesorDetallesComponent implements OnInit {

  entidadProfesor: Profesor;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  idProfesor;
  profesorService;
  private sub: any;

  constructor (route: ActivatedRoute,
               public _catalogosService: CatalogosServices,
               private _router: Router) {
    this.sub = route.params.subscribe(params => {
      this.idProfesor = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
//    this.idProfesor = Number(params.get('id'));
    this.prepareServices();

    this.profesorService.getEntidadProfesor(
      this.idProfesor,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadProfesor
          = new Profesor(response.json());
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
      }
    );
  }

  regresarCatalogoProfesores(): any {
    this._router.navigate(['/catalogo/profesores']);
  }


  private prepareServices(): void {
    this.profesorService = this._catalogosService.getProfesor();

  }


  ngOnInit() {
  }

}
