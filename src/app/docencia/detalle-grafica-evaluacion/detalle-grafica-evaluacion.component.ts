import {Component, OnInit, Input, Directive} from '@angular/core';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {URLSearchParams} from '@angular/http';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';

@Component({
  selector: 'app-detalle-grafica-evaluacion',
  templateUrl: './detalle-grafica-evaluacion.component.html',
  styleUrls: ['./detalle-grafica-evaluacion.component.css']
})
export class DetalleGraficaEvaluacionComponent implements OnInit {
  @Input()
  resultadosEvaluacionDocente: any;
  @Input()
  nombreProfesor: any;
  @Input()
  cursoOptativo: MateriaImpartida;
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{
        ticks: {
          stepSize: 1
        }
      }]
    }
  };

  public barChartLabels = [
    'Pregunta 1', 'Pregunta 2', 'Pregunta 3', 'Pregunta 4', 'Pregunta 5', 'Pregunta 6',
    'Pregunta 7', 'Pregunta 8', 'Pregunta 9', 'Pregunta 10', 'Pregunta 11', 'Pregunta 12',
    'Pregunta 13', 'Pregunta 14', '' ];
  public barChartSeries = ['Excelente', 'Muy Bien', 'Bien', 'Regular', 'Mal'];
  public barChartType = 'bar';
  public barChartLegend: boolean = false;

  public barChartData = [
    /*    [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40, 1, 2],
     [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86, 27, 90, 1, 2],
     [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86, 27, 90, 1, 2],
     [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86, 27, 90, 1, 2],
     [28, 48, 40, 19, 86, 27, 90, 28, 48, 40, 19, 86, 27, 90, 1, 2]
     */
  ];

  public barChartColors: Array<any> = [
    {
      fillColor: 'rgba(94,189,94,1)',
      strokeColor: 'rgba(94,189,94,1)',
      pointColor: 'rgba(94,189,94,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(94,189,94,1)',
      backgroundColor: 'rgba(94,189,94,1)',
      highlight: 'rgba(94,189,94,1)'
    }, {
      fillColor: 'rgba(61,170,207,1)',
      strokeColor: 'rgba(61,170,207,1)',
      pointColor: 'rgba(61,170,207,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(61,170,207,1)',
      backgroundColor: 'rgba(61,170,207,1)',
      highlight: 'rgba(61,170,207,1)'
    }, {
      fillColor: 'rgba(176,176,176,1)',
      strokeColor: 'rgba(176,176,176,1)',
      pointColor: 'rgba(176,176,176,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(176,176,176,1)',
      backgroundColor: 'rgba(176,176,176,1)',
      highlight: 'rgba(176,176,176,1)'
    }, {
      fillColor: 'rgba(244,176,79,1)',
      strokeColor: 'rgba(244,176,79,1)',
      pointColor: 'rgba(244,176,79,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(244,176,79,1)',
      backgroundColor: 'rgba(244,176,79,1)',
      highlight: 'rgba(244,176,79,1)'
    }, {
      fillColor: 'rgba(230,100,84,1)',
      strokeColor: 'rgba(230,100,84,1)',
      pointColor: 'rgba(230,100,84,1)',
      pointStrokeColor: '#fff',
      pointHighlightFill: '#fff',
      pointHighlightStroke: 'rgba(230,100,84,1)',
      backgroundColor: 'rgba(230,100,84,1)',
      highlight: 'rgba(230,100,84,1)'
    },
    {
      backgroundColor: 'rgba(255,255,255,1)',
    }
    ];
    // public barChartColors: any[] = [{ backgroundColor: ["#106E1B", "#D60C16"] }];
  public dataset: any = undefined;

  private errorConsulta: Array<ErrorCatalogo> = [];
  private numeroTotalDeAlumnos: number = 0;

  constructor(private _estudianteMateriaImpartida: EstudianteMateriaImpartidaService,
              private _spiner: SpinnerService) {
    
  }

  ngOnInit(): void {
    this.obtenerNumeroDeAlumnosEnMateria();
  }

  // events
  public chartClicked(e: any): void {
    // c onsole.log(e);
  }

  public chartHovered(e: any): void {
    // console.log(e);
  }

  private obtenerNumeroDeAlumnosEnMateria(): void {
    let urlSearch: URLSearchParams  = new URLSearchParams();

    urlSearch.set('criterios',
      'idMateriaImpartida~' + this.cursoOptativo.id + ':IGUAL;OR,'
        + 'idMateriaInterprograma~' + this.cursoOptativo.id  + ':IGUAL;OR');

    this._spiner.start('numeroDeAlumnos');
    this._estudianteMateriaImpartida.getListaEstudianteMateriaImpartida(
      this.errorConsulta,
      urlSearch
    ).subscribe(
      response => {
        let listaEstudianteMateriaImpartida = response.json();
        
        listaEstudianteMateriaImpartida.lista.forEach(estudianteMateria => {
          if (estudianteMateria.id_materia_impartida.id === this.cursoOptativo.id &&
            !estudianteMateria.id_materia_interprograma && estudianteMateria.id_estudiante && (estudianteMateria.id_estudiante.id_estatus.id === 1006 ||
             estudianteMateria.id_estudiante.id_estatus.id === 1107 || estudianteMateria.id_estudiante.id_estatus.id === 1106)) {
              this.numeroTotalDeAlumnos++;
          } else if (estudianteMateria.id_materia_interprograma &&
          (estudianteMateria.id_materia_interprograma.id === this.cursoOptativo.id) && estudianteMateria.id_estudiante &&
          (estudianteMateria.id_estudiante.id_estatus.id === 1006 ||
             estudianteMateria.id_estudiante.id_estatus.id === 1107 || estudianteMateria.id_estudiante.id_estatus.id === 1106)) {
            this.numeroTotalDeAlumnos++;
          } else if (estudianteMateria.id_estudiante_movilidad_externa &&
            estudianteMateria.id_estudiante_movilidad_externa.id) {
              this.numeroTotalDeAlumnos++;
          }
        });
      },
      error => {
        this._spiner.stop('numeroDeAlumnos');
        
      },
      () => {
        this._spiner.stop('numeroDeAlumnos');
        this.generarResultados();
      }
    );
  }

  private generarResultados(): void {
    if (this.resultadosEvaluacionDocente) {
      this.barChartData = [];
      let R = 0;
      let me = this;
      this.resultadosEvaluacionDocente.respuestas.forEach(
        function (elemento, indice, arreglo) {
          let P = 0;
          elemento.forEach(function (ele, i, arr) {
            if (!me.barChartData[R]) {
              me.barChartData[R] = [];
            }
            if (!me.barChartData[R][P]) {
              me.barChartData[R][P] = ele;
            }
            P++;
          });
          // console.log('R', R);
          R++;
      });
    }
    this.llenarDataSet();
  }

  private llenarDataSet(): void {
    this.dataset = [
      {data: this.barChartData[0], label: 'Excelente'},
      {data: this.barChartData[1], label: 'Muy Bien'},
      {data: this.barChartData[2], label: 'Bien'},
      {data: this.barChartData[3], label: 'Regular'},
      {data: this.barChartData[4], label: 'Mal'},
      {data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, this.numeroTotalDeAlumnos], label: 'Total de alumnos'}
    ];
  }

}
