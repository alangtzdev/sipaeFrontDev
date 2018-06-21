import {Component, OnInit, Input} from '@angular/core';
import {EstudianteMovilidadExterna} from "../../services/entidades/estudiante-movilidad-externa.model";

@Component({
  selector: 'app-detalle-antecedentes-academicos',
  templateUrl: './detalle-antecedentes-academicos.component.html',
  styleUrls: ['./detalle-antecedentes-academicos.component.css']
})
export class DetalleAntecedentesAcademicosComponent implements OnInit {
  @Input() entidadEstudianteMovilidad : EstudianteMovilidadExterna;
  constructor() {

  }

  ngOnInit() {
  }

}
