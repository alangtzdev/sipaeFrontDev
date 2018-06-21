import { Component, OnInit, Input } from '@angular/core';
import { EvaluacionDocenteIdiomasService } from '../../services/entidades/evaluacion-docente-idiomas.service';
import { CatalogosServices } from './../../services/catalogos/catalogos.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {URLSearchParams} from '@angular/http';
import { SpinnerService } from './../../services/spinner/spinner/spinner.service';

@Component({
  selector: 'app-grafica-aceptacion-idiomas',
  templateUrl: './grafica-aceptacion-idiomas.component.html',
  styleUrls: ['./grafica-aceptacion-idiomas.component.css']
})
export class GraficaAceptacionIdiomasComponent implements OnInit {

  @Input()
  resultados: any;

  @Input()
  idGrupoIdioma: any;

  private pieChartLabels = ['Sí', 'No', 'No constetaron'];
  private pieChartData = [/*50, 50*/];
  private pieChartType = 'pie';
  private porcentajeSi: number;
  private porcentajeNo: number;
  private totalRespuestas: number;
  private porcentajeSiFormato: number;
  private porcentajeNumeroAlumnos: number = 0;
  public pieChartColors: Array<any> = [{ backgroundColor: ['#5EBD5E', '#E66454', '#085B75'] }];
  private errorConsulta: Array<ErrorCatalogo> = [];
  private _estudianteIdiomaService;
  private numeroAlumnosEnGrupoIdioma: number = undefined;

  constructor(private _catologService: CatalogosServices,
    private _spiner: SpinnerService) {
    this.prepareService();
  }

  ngOnInit() {
    this.obtenerNumeroDeAlumnos();
  }

  private prepareService(): void {
    this._estudianteIdiomaService =
      this._catologService.getEstudianteGrupoIdiomaService();
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
        console.log('numeroAlumnosEnGrp', this.numeroAlumnosEnGrupoIdioma);
      },
      error => {
        this._spiner.stop('obtenerListaAlumnos');
      },
      () => {
        this._spiner.stop('obtenerListaAlumnos');
        this.generarResultados();
      }
    );
  }

  private generarResultados(): void {
    let resultadosSi = 0;
      if (this.resultados) {
            let t = this.resultados.si + this.resultados.no;
            let alumnoSinContestar = this.numeroAlumnosEnGrupoIdioma - t;
            this.totalRespuestas = t;
            this.pieChartData = [
                ((this.resultados.si * 100) / this.numeroAlumnosEnGrupoIdioma).toFixed(3),
                ((this.resultados.no * 100) / this.numeroAlumnosEnGrupoIdioma).toFixed(3),
                ((alumnoSinContestar * 100) / this.numeroAlumnosEnGrupoIdioma).toFixed(3)
            ];
            this.porcentajeSi = (this.resultados.si * 100) / this.numeroAlumnosEnGrupoIdioma;
            this.porcentajeNo = (this.resultados.no * 100) / this.numeroAlumnosEnGrupoIdioma;
            this.porcentajeNumeroAlumnos = (alumnoSinContestar * 100) / this.numeroAlumnosEnGrupoIdioma;
      }
  }

  private darFormatoPorcentajeSi(porcentajeSi): string {
    if (porcentajeSi) {
      return this.porcentajeSi.toFixed(3);
    }
  }

  private darFormatoPorcentajeNo(porcentajeSi): string {
    if (porcentajeSi) {
      return this.porcentajeNo.toFixed(3);
    }
  }

  private darFormatoProcentaTotalAlumnos(procentajeAlumnos) {
    if (procentajeAlumnos) {
      return this.porcentajeNumeroAlumnos.toFixed(3);
    }
  }

}
