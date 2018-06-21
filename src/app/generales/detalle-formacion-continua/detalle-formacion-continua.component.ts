import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {Router, ActivatedRoute} from "@angular/router";
import {ActividadContinuaEstudiante} from "../../services/entidades/actividad-continua-estudiante.model";
import {ActividadContinuaProfesor} from "../../services/entidades/actividad-continua-profesor.model";
import {ActividadEvaluacionContinua} from "../../services/entidades/actividad-evaluacion-continua.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import * as moment from "moment";

@Component({
  selector: 'app-detalle-formacion-continua',
  templateUrl: './detalle-formacion-continua.component.html',
  styleUrls: ['./detalle-formacion-continua.component.css']
})
export class DetalleFormacionContinuaComponent implements OnInit {

  public idActividadContinua: number;
  router: Router

  actividadEvaluacionContinuaService
  actividadContinuaEstudiante
  actividadContinuaProfesor

  registrosEstudiante: Array<ActividadContinuaEstudiante> = [];
  registroSeleccionadoEstudiante: ActividadContinuaEstudiante;
  registrosProfesor: Array<ActividadContinuaProfesor> = [];
  registroSeleccionadoProfesor: ActividadContinuaProfesor;

  actividadContinuaUpddate: ActividadEvaluacionContinua;

  private erroresConsultas: Array<ErrorCatalogo> = [];

  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'matricula', sort: false},
    { titulo: 'Nombre del estudiante', nombre: 'nombre', sort: false},
    { titulo: 'Programa Docente', nombre: 'programaDocente', sort: false}
  ];

  columnasProfesores: Array<any> = [
    { titulo: 'Lista de profesores', nombre: 'idProfesor'}
  ];

  private sub: any;

  constructor(private _router: Router,
              private route: ActivatedRoute,
              public catalogosService: CatalogosServices) {
   // let params = _router.currentInstruction.component.params;
    //console.log(params)
    //this.idActividadContinua = params.id;
    this.prepareService();
    this.obtenerIdActivadContinua();
    this.onCambiosTablaEstudiantes();
    this.onCambiosTablaProfesores();
    this.obtenerEntidadActividadContinua();
  }

  obtenerIdActivadContinua(): void {
    this.sub = this.route.params.subscribe(params => {
      this.idActividadContinua = params['id'];
      // In a real app: dispatch action to load the details here.
    });
  }

  obtenerEntidadActividadContinua(): void {
    if (this.idActividadContinua) {
      this.actividadContinuaEstudiante =
        this.actividadEvaluacionContinuaService.getActividadEvaluacionContinua(
          this.idActividadContinua,
          this.erroresConsultas
        ).subscribe(
          response =>
            this.actividadContinuaUpddate = new ActividadEvaluacionContinua(
              response.json()),
          error => {
            console.error(error);
/*            if (assertionsEnabled()) {
              console.error(error);
            }*/
          },
          () => {
/*            if (assertionsEnabled()) {
              //console.log(this.actividadContinuaUpddate);
            }*/
          }
        );
    }
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  rowSeleccionadoEstudiante(registro): boolean {
    return (this.registroSeleccionadoEstudiante === registro);
  }

  rowSeleccionEstudiante(registro): void {
    if (this.registroSeleccionadoEstudiante !== registro) {
      this.registroSeleccionadoEstudiante = registro;
    } else {
      this.registroSeleccionadoEstudiante = null;
    }
  }

  rowSeleccionadoProfesor(registro): boolean {
    return (this.registroSeleccionadoProfesor === registro);
  }

  rowSeleccionProfesor(registro): void {
    if (this.registroSeleccionadoProfesor !== registro) {
      this.registroSeleccionadoProfesor = registro;
    } else {
      this.registroSeleccionadoProfesor = null;
    }
  }

  // Tabla Lista Estudiantes UPDATE
  onCambiosTablaEstudiantes(): void {
    //console.log('entra metodo oncambiostabla estudiante')
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = '';

    if (this.idActividadContinua){
      criterio = 'idActividadEvaluacionContinua~' + this.idActividadContinua + ':IGUAL';
    }else {
      //console.log('este es el el idActiContinua'+ this.idActividadContinua)
    }
    urlSearch.set('criterios', criterio);
    //console.log('este es el resultado'+ criterio)

    this.registrosEstudiante =
      this.actividadContinuaEstudiante.getListaActividadContinuaEstudiante(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  // Tabla Lista Profesores UPDATE
  onCambiosTablaProfesores(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = '';

    if(this.idActividadContinua){
      criterio = 'idActividadEvaluacionContinua~' + this.idActividadContinua + ':IGUAL';
    }
    urlSearch.set('criterios', criterio);

    this.registrosProfesor =
      this.actividadContinuaProfesor.getListaActividadContinuaProfesor(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  private regresarListaActividades(): void {
    this._router.navigate(['formacion-continua']);
  }

  private prepareService(): void {
    this.actividadEvaluacionContinuaService =
      this.catalogosService.getActividadEvaluacionContinuaService();

    this.actividadContinuaEstudiante =
      this.catalogosService.getActividadContinuaEstudianteService();

    this.actividadContinuaProfesor =
      this.catalogosService.getActividadContinuaProfesorService();
  }


  ngOnInit() {
  }

}
