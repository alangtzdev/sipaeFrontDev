import {Component, OnInit, Input} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ActividadContinuaEstudiante} from "../../services/entidades/actividad-continua-estudiante.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ActividadContinuaEstudianteService} from "../../services/entidades/actividad-continua-estudiante.service";
import {EstudianteService} from "../../services/entidades/estudiante.service";
import {ActividadContinuaProfesorService} from "../../services/entidades/actividad-continua-profesor.service";
import {Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";

@Component({
  selector: 'app-historial-academico-aprendizaje-continuo',
  templateUrl: './historial-academico-aprendizaje-continuo.component.html',
  styleUrls: ['./historial-academico-aprendizaje-continuo.component.css']
})
export class HistorialAcademicoAprendizajeContinuoComponent implements OnInit {
  paginacion: PaginacionInfo;
  paginasArray: Array<number> = [];
  paginaActual: number = 1;
  paginaActualPaginacion: number = 1;
  limite: number = 10;
  id: number;
  maxSizePags: number = 5;

  @Input()
  idEstudiante: number;

  registros: Array<ActividadContinuaEstudiante> = [];
  columnas: Array<any> = [
    { titulo: 'Actividad', nombre: 'idActividad' },
    { titulo: 'Fecha', nombre: 'fecha' },
    { titulo: 'Profesor Evaluador', nombre: 'idProfesor'},
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idActividadEvaluacionContinua.actividad,' +
    'idActividadEvaluacionContinua.idProfesor' }
  };

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private _spinner: SpinnerService,
              private _activiadContinuaService: ActividadContinuaEstudianteService,
              private _estudianteServiace: EstudianteService,
              private _actividadcontinutapro: ActividadContinuaProfesorService,
              private router: Router) { }

  ngOnInit() {
    this.id = this.idEstudiante;
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idEstudiante~' + this.idEstudiante + ':IGUAL';

    urlSearch.set('criterios', criterio);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    this._spinner.start('llenarTablaActivides');
    this._activiadContinuaService.getListaActividadEstudiantes(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new ActividadContinuaEstudiante(item));
        });
      },
      error => {
          console.error(error);

        this._spinner.stop('llenarTablaActivides');
      },
      () => {
        this._spinner.stop('llenarTablaActivides');
      }
    );
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

}
