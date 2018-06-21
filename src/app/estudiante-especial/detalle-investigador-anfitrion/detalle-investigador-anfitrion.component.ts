import {Component, OnInit, Input} from '@angular/core';
import {EstudianteMovilidadExterna} from "../../services/entidades/estudiante-movilidad-externa.model";
import * as moment from "moment";

@Component({
  selector: 'app-detalle-investigador-anfitrion',
  templateUrl: './detalle-investigador-anfitrion.component.html',
  styleUrls: ['./detalle-investigador-anfitrion.component.css']
})
export class DetalleInvestigadorAnfitrionComponent implements OnInit {

  @Input() entidadEstudianteMovilidad : EstudianteMovilidadExterna;

  constructor() { }

  ngOnInit() {
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

}
