import { Component, OnInit, Input } from '@angular/core';
import {ErrorCatalogo} from '../../services/core/error.model';

import {ServicioSocial} from '../../services/entidades/servicio-social.model';


@Component({
  selector: 'app-detalle-datos-generales-component',
  templateUrl: './detalle-datos-generales-component.component.html',
  styleUrls: ['./detalle-datos-generales-component.component.css']
})


export class DetalleDatosGeneralesComponentComponent implements OnInit {

  @Input() servicioSocial: ServicioSocial;

  constructor() {
  }

  ngOnInit() {}

  }
