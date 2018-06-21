import {Component, OnInit, Input} from '@angular/core';
import * as moment from "moment";
import {Router, ActivatedRoute} from "@angular/router";
import {Profesor} from "../../services/entidades/profesor.model";

@Component({
  selector: 'datosGralProfesor',
  templateUrl: './profesor-detalle-datos-generales.component.html',
  styleUrls: ['./profesor-detalle-datos-generales.component.css']
})
export class ProfesorDetalleDatosGeneralesComponent implements OnInit {

  @Input()
  entidadProfesor: Profesor;

  constructor (params: ActivatedRoute,
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
