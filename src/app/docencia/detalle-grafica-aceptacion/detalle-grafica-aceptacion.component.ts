import {Component, OnInit, Input} from '@angular/core';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {URLSearchParams} from '@angular/http';
import {ErrorCatalogo} from '../../services/core/error.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';

@Component({
  selector: 'app-detalle-grafica-aceptacion',
  templateUrl: './detalle-grafica-aceptacion.component.html',
  styleUrls: ['./detalle-grafica-aceptacion.component.css']
})
export class DetalleGraficaAceptacionComponent implements OnInit {
  @Input() resultados: any;
  @Input() materiaImpartida: MateriaImpartida;

  constructor(private _estudianteMateriaImpartida: EstudianteMateriaImpartidaService,
              private spinner: SpinnerService) { }

  private pieChartLabels: string[] =  ['Sí', 'No', 'No contesto'];
  private pieChartData = [/*50, 50*/];
  private pieChartType: string = 'pie';
  private porcentajeSi: number = 0;
  private porcentajeNo: number = 0;
  private totalRespuestas: number;
  private porcentajeNumeroAlumnos: number = 0;
  private porcentajeSiFormato: number;
  private numeroTotalDeAlumnos: number = 0;
  public barPietOptions: any = {
    responsive: true,
  };
  public pieChartColors: any[] = [{ backgroundColor: ["#106E1B", "#D60C16", "#808080"] }];
  private errorConsulta: Array<ErrorCatalogo> = [];
  // eventos grafica
  chartClicked(e: any): any {
    // console.log(e);
  }
  chartHovered(e: any): any {
    // console.log(e);
  }

  ngOnInit() {
    this.obtenerNumeroAlumnosMateria();
  }

  private obtenerNumeroAlumnosMateria(): void {
    let urlSearch: URLSearchParams  = new URLSearchParams();

    urlSearch.set('criterios',
      'idMateriaImpartida~' + this.materiaImpartida.id + ':IGUAL;OR,'
        + 'idMateriaInterprograma~' + this.materiaImpartida.id  + ':IGUAL;OR');
    //console.log('criterios', urlSearch);
    this.spinner.start('buscarNumeroAlumnos');
    this._estudianteMateriaImpartida.getListaEstudianteMateriaImpartida(
      this.errorConsulta,
      urlSearch
    ).subscribe(
      response => {
        let listaEstudianteMateriaImpartida = response.json();

        listaEstudianteMateriaImpartida.lista.forEach(estudianteMateria => {
          if (estudianteMateria.id_materia_impartida.id === this.materiaImpartida.id &&
            !estudianteMateria.id_materia_interprograma && estudianteMateria.id_estudiante && (estudianteMateria.id_estudiante.id_estatus.id === 1006 ||
             estudianteMateria.id_estudiante.id_estatus.id === 1107 || estudianteMateria.id_estudiante.id_estatus.id === 1106)) {
              this.numeroTotalDeAlumnos++;
          } else if ( estudianteMateria.id_materia_interprograma &&
          (estudianteMateria.id_materia_interprograma.id === this.materiaImpartida.id) && estudianteMateria.id_estudiante &&
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
        this.spinner.stop('buscarNumeroAlumnos');
      },
      () => {
        this.spinner.stop('buscarNumeroAlumnos');
        this.generarResultados();
      }
    );
  }

  private generarResultados(): void {
    let resultadosSi = 0;
    if (this.resultados) {
      let t = this.resultados.si + this.resultados.no;
      let alumnoSinContestar = this.numeroTotalDeAlumnos - t;
      this.totalRespuestas = t;
      this.pieChartData = [
        ((this.resultados.si * 100) / this.numeroTotalDeAlumnos).toFixed(3),
        ((this.resultados.no * 100) / this.numeroTotalDeAlumnos).toFixed(3),
        ((alumnoSinContestar * 100) / this.numeroTotalDeAlumnos).toFixed(3)
      ];
      this.porcentajeSi = (this.resultados.si * 100) / this.numeroTotalDeAlumnos;
      this.porcentajeNo = (this.resultados.no * 100) / this.numeroTotalDeAlumnos;
      this.porcentajeNumeroAlumnos = (alumnoSinContestar * 100) / this.numeroTotalDeAlumnos;
    }
  }

  private darFormatoPorcentajeSi(porcentajeSi) {
    return this.porcentajeSi.toFixed(3);
  }

  private darFormatoPorcentajeNo(porcentajeSi) {
    return this.porcentajeNo.toFixed(3);
  }

  private darFormatoProcentaTotalAlumnos(procentajeAlumnos) {
    return this.porcentajeNumeroAlumnos.toFixed(3);
  }
}
