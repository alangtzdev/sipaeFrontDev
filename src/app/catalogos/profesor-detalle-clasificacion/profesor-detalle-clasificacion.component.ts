import {Component, OnInit, Input} from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";
import {Profesor} from "../../services/entidades/profesor.model";

@Component({
  selector: 'clasificacionProfesor',
  templateUrl: './profesor-detalle-clasificacion.component.html',
  styleUrls: ['./profesor-detalle-clasificacion.component.css']
})
export class ProfesorDetalleClasificacionComponent implements OnInit {

  @Input()
  entidadProfesor: Profesor;

  constructor (params: ActivatedRoute, private _router: Router) {

  }


  ngOnInit() {
  }

}
