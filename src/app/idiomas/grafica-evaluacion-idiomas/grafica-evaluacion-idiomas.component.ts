import { element } from 'protractor';
import { SpinnerService } from './../../services/spinner/spinner/spinner.service';
import { EstudianteGrupoIdioma } from './../../services/entidades/estudiante-grupo-idioma.model';
import { CatalogosServices } from './../../services/catalogos/catalogos.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, Input } from '@angular/core';
import { EvaluacionDocenteIdiomasService } from '../../services/entidades/evaluacion-docente-idiomas.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {URLSearchParams} from '@angular/http';

@Component({
  selector: 'app-grafica-evaluacion-idiomas',
  templateUrl: './grafica-evaluacion-idiomas.component.html',
  styleUrls: ['./grafica-evaluacion-idiomas.component.css']
})
export class GraficaEvaluacionIdiomasComponent implements OnInit {

  @Input()
  resultados: any;

  @Input()
  nombreProfesor: any;

  @Input()
  nombreMateria: any;

  @Input()
  idGrupoIdioma: any;

  // datos grafica
  private barChartOptions = {
    scaleShowVerticalLines: false,
    responsive: true,
    legend: {
      display: false
    }
  };

  public barChartLabels = [
    'Pregunta 1', 'Pregunta 2', 'Pregunta 3', 'Pregunta 4', 'Pregunta 5', 'Pregunta 6',
    'Pregunta 7', 'Pregunta 8', 'Pregunta 9'];

  public barChartSeries = ['Excelente', 'Muy Bien', 'Bien', 'Regular', 'Mal', 'No contestaron'];

  public barChartType: string = 'pie';
  public barChartLegend: boolean = true;

  public barChartColors: any[] = [{ backgroundColor: ['#5EBD5E', '#3DAACF', '#B0B0B0', '#FFCE56', '#EC5140', '#085B75'] }];

  private barChartData = [];

  private errorConsulta: Array<ErrorCatalogo> = [];
  private _estudianteIdiomaService;
  private numeroAlumnosEnGrupoIdioma: number = undefined;

  constructor(
    private _catologService: CatalogosServices,
    private _spiner: SpinnerService
  ) {
    this.prepareService();
  }

  private prepareService(): void {
    this._estudianteIdiomaService =
      this._catologService.getEstudianteGrupoIdiomaService();
  }

  ngOnInit(): void {
    this.obtenerNumeroDeAlumnos();
  }

  private obtenerNumeroDeAlumnos(): void {
    let urlSearch: URLSearchParams  = new URLSearchParams();

    urlSearch.set('criterios',
      'idGrupoIdioma~' + this.idGrupoIdioma  + ':IGUAL');

    this._spiner.start('obtenerListaAlumnos');
    this._estudianteIdiomaService.getListaEstudiantesGrupoIdioma(
      this.errorConsulta,
      urlSearch
    ).subscribe(
      response => {
        let listaAlumnos = response.json().lista;
        this.numeroAlumnosEnGrupoIdioma = listaAlumnos.length;
      },
      error => {
        this._spiner.stop('obtenerListaAlumnos');
      },
      () => {
        this._spiner.stop('obtenerListaAlumnos');
        this.procesarResultados();
      }
    );
  }

  private procesarResultados(): void {
    if (this.resultados) {
      this.barChartData = [];
      let R = 0;
      let me = this;
      this.resultados.respuestas.forEach(function (elemento, indice, arreglo) {
          let P = 0;
          elemento.forEach(function (ele, i, arr) {
              if (!me.barChartData[P]) {
                  me.barChartData[P] = [];
              }
              if (!me.barChartData[P][R]) {
                  me.barChartData[P][R] = ele;
              }
              P++;
          });
          R++;
      });

      this.agregarAlumnosNoContestaron();
    }
  }

  private agregarAlumnosNoContestaron(): void {
    let totalAlumnosContesetaron = 0;
    let totalDeAlumnosSinContestar = 0;
    this.barChartData[0].forEach(element => {
      totalAlumnosContesetaron += element;
    });
    totalDeAlumnosSinContestar =  this.numeroAlumnosEnGrupoIdioma - totalAlumnosContesetaron;
    this.barChartData[0][5] = totalDeAlumnosSinContestar;
    this.barChartData[1][5] = totalDeAlumnosSinContestar;
    this.barChartData[2][5] = totalDeAlumnosSinContestar;
    this.barChartData[3][5] = totalDeAlumnosSinContestar;
    this.barChartData[4][5] = totalDeAlumnosSinContestar;
    this.barChartData[5][5] = totalDeAlumnosSinContestar;
    this.barChartData[6][5] = totalDeAlumnosSinContestar;
    this.barChartData[7][5] = totalDeAlumnosSinContestar;
    this.barChartData[8][5] = totalDeAlumnosSinContestar;
  }

}
