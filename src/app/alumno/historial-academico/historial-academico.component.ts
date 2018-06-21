import { Component, OnInit } from '@angular/core';
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {EstudianteService} from "../../services/entidades/estudiante.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {AuthService} from "../../auth/auth.service";
import {Router, ActivatedRoute} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import {Estudiante} from "../../services/entidades/estudiante.model";

@Component({
  selector: 'app-historial-academico',
  templateUrl: './historial-academico.component.html',
  styleUrls: ['./historial-academico.component.css']
})
export class HistorialAcademicoComponent implements OnInit {
  idEstudiante: number;
  nomreEstudiante: string;
  matriculaEstudiante: string;

  idUsuarioObjetivo: number;

  //usariao logeado
  private usuarioLogueado: UsuarioSesion;

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<ErrorCatalogo> = [];
  

  constructor(private _spinner: SpinnerService,
              private _estudianteServiace: EstudianteService,
              private router: Router, 
              private _authservice: AuthService,
              params: ActivatedRoute) {
    params.params.subscribe(params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    let auxiliar: number;
    if (this.idUsuarioObjetivo) {
      auxiliar = this.idUsuarioObjetivo;
    } else {
      this.usuarioLogueado = this._authservice.getUsuarioLogueado();
      auxiliar = this.usuarioLogueado.id;
    }
    this.recuperarUsuarioActual(auxiliar);
  }

  ngOnInit() {
    
  }

  recuperarUsuarioActual(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + id + ':IGUAL');
    this._estudianteServiace.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let estudiante: Estudiante;
        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
          //console.log(estudiante);
        });
        this.idEstudiante = estudiante.id;
        this.nomreEstudiante = estudiante.datosPersonales.getNombreCompleto();
        this.matriculaEstudiante = estudiante.matricula.matriculaCompleta;
      }
    );

  }

}
