import {Component, OnInit, Input} from '@angular/core';
import {PlanEstudiosMateria} from "../../services/entidades/plan-estudios-materia.model";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {Router, ActivatedRoute} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";

@Component({
  selector: 'materiasPlanEstudios',
  templateUrl: './plan-estudios-detalle-materias.component.html',
  styleUrls: ['./plan-estudios-detalle-materias.component.css']
})
export class PlanEstudiosDetalleMateriasComponent implements OnInit {

  @Input()
  entidadPlanEstudios: PlanEstudio;
  private sub: any;
  idPlanEstudios;
  planEstudiosService;
  paginaActual: number = 1;
  limite: number = 10;
  planEstudiosMateriasService;
  registros: Array<PlanEstudiosMateria> = [];
  registroSeleccionado: PlanEstudiosMateria;
  registrosCursosOptativos: Array<PlanEstudiosMateria>  = [];
  columnas: Array<any> = [

    { titulo: 'Período', nombre: 'numeroPeriodo' },
    { titulo: 'Lista de asignaturas o unidades de aprendizaje', nombre: 'idMateria' },
    { titulo: 'Clave', nombre: 'idMateria' },
    { titulo: 'Seriación', nombre: 'idMateria' },
    { titulo: 'Horas con docente', nombre: 'horasDocente' },
    { titulo: 'Horas independientes', nombre: 'horasIndependiente' },
    { titulo: 'Créditos', nombre: 'numeroCreditodos' }

  ];

  columnasMateriasOptativas: Array<any> = [

    { titulo: 'Período', nombre: 'numeroPeriodo' },
    { titulo: 'Lista de asignaturas o unidades de aprendizaje cursos optativos', nombre: 'idMateria' },
    { titulo: 'Clave', nombre: 'idMateria' },
    { titulo: 'Seriación', nombre: 'idMateria' },
    { titulo: 'Horas con docente', nombre: 'horasDocente' },
    { titulo: 'Horas independientes', nombre: 'horasIndependiente' },
    { titulo: 'Créditos', nombre: 'numeroCreditodos' }

  ];

  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor (route: ActivatedRoute,
               public _catalogosService: CatalogosServices,
               private _router: Router) {
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    // //console.log(this.idPlanEstudios);
    this.prepareServices();
    this.onCambiosTabla();
    this.cargarListaCursosOptativos();

    ////console.log(this.idPlanEstudios);
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    // console.warn(this.idPlanEstudios);
    let criterio = 'idMateria.idTipo~5:NOT,idPlanEstudios~' + this.idPlanEstudios + ':IGUAL';
    urlParameter.set('criterios', criterio);
    let ordenamiento = 'numeroPeriodo:ASC';
    urlParameter.set('ordenamiento', ordenamiento);
    this.registros = this.planEstudiosMateriasService.getListaPlanEstudiosMateria(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }

  cargarListaCursosOptativos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idMateria.idTipo~5:IGUAL,idPlanEstudios~' + this.idPlanEstudios + ':IGUAL;AND';
    urlParameter.set('criterios', criterio);
    let ordenamiento = 'numeroPeriodo:ASC';
    urlParameter.set('ordenamiento', ordenamiento);

    this.planEstudiosMateriasService.
    getListaMateriasPlanSize(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        this.registrosCursosOptativos = [];
        let respuesta = response.json();
        respuesta.lista.forEach((item) => {
          this.registrosCursosOptativos.push(new PlanEstudiosMateria(item));
        });
      },
      error => {
        console.error(error);
      },
      () => {

      }
    );
  }

  private prepareServices(): void {
    this.planEstudiosMateriasService = this._catalogosService.getPlanEstudiosMateria();
    this.planEstudiosService = this._catalogosService.getPlanEstudios();
    // //console.log(this.planEstudiosMateriasService);
  }


  ngOnInit() {
  }

}
