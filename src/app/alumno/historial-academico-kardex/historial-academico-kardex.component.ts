import {Component, OnInit, Input} from '@angular/core';
import {AuthService} from '../../auth/auth.service';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {EstudianteService} from '../../services/entidades/estudiante.service';
import {EvaluacionDocenteService} from '../../services/entidades/evaluacion-docente.service';
import {EvaluacionDocenteAlumnoService} from '../../services/entidades/evaluacion-docente-alumno.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {Router} from '@angular/router';
import {ErrorCatalogo} from '../../services/core/error.model';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {URLSearchParams} from '@angular/http';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {EvaluacionDocenteAlumno} from '../../services/entidades/evaluacion-docente-alumno.model';

@Component({
  selector: 'app-historial-academico-kardex',
  templateUrl: './historial-academico-kardex.component.html',
  styleUrls: ['./historial-academico-kardex.component.css']
})
export class HistorialAcademicoKardexComponent implements OnInit {
  @Input()
  idEstudiante: number;

  id: number;
  idPlanEstudios: number;
  idPeriodoEscolar: number;
  esRolDocencia: boolean = false;
  columnas: Array<any> = [];
  exportarFormato = '';
  deshabilitarKardex: boolean = false;
  public registros: Array<EstudianteMateriaImpartida> = [];

  // se declaran variables para consultas de base de datos
  evaluacionDocenteAlumno;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private registrosEvaluacionDocente: Array<any> = [];

  // variables para obtener el promedio, semestre total, numero de creditos, porcentaje
  private promedioGeneral: number = 0;
  private creditosTotoalesEstudiante: number = 0;
  private porcentajeCreditos: number = 0;
  private creditosTotalesPlanEstudio: number = 0;
  private semesetreActual: number = 0;
  private semestresCursados: number = 0;

  constructor(private _catalogoService: CatalogosServices,
              private router: Router,
              private _spinnerService: SpinnerService,
              private _authService: AuthService,
              private estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService,
              private estudianteService: EstudianteService,
              private evaluacionDocenteService: EvaluacionDocenteService,
              private evaluacionDocenteAlumnoService: EvaluacionDocenteAlumnoService) {
    this.esRolDocencia = this._authService.hasRol('DOCENCIA');
    this.definirColumnasTabla();
  }

  ngOnInit(): void {
    this.id = this.idEstudiante;
    this.recuperarEstudiante();
    // this.onCambiosTabla();
  }

  recuperarEstudiante(): void {
    let estudiante: Estudiante;
    this.estudianteService.getEstudiante(
      this.id, this.erroresConsultas
    ).subscribe(
      response => {
        estudiante = new Estudiante(response.json());
        this.idPlanEstudios = estudiante.promocion.idPlanEstudios.id;
        this.creditosTotalesPlanEstudio = estudiante.promocion.idPlanEstudios.sumaCreditos;
        this.semesetreActual = estudiante.numPeriodoActual;
        this.semestresCursados = +this.semesetreActual - 1;
        this.obtenerInfoAcademica(estudiante.id);
        this.idPeriodoEscolar = estudiante.periodoActual.id;
        // console.log(this.idEstudiante);
        let urlSearchParams: URLSearchParams = new URLSearchParams();
        urlSearchParams.set('criterios', 'idEstudiante~' + this.idEstudiante + ':IGUAL;AND,' +
          'idPeriodoEscolar~' + this.idPeriodoEscolar + ':IGUAL');
        this.evaluacionDocenteAlumnoService.getListaEvaluacionDocenteAlumno(
          this.erroresConsultas,
          urlSearchParams
        ).subscribe(
          response => {
            let paginacionInfoJson = response.json();
            paginacionInfoJson.lista.forEach((item) => {
              this.evaluacionDocenteAlumno = new EvaluacionDocenteAlumno(item);
            });
            this.onCambiosTabla();
          },
          error => {
            console.log(error);
          },
          () => {

          }
        );

      }
    );
  }

  onCambiosTabla(): void {
    console.log('lista');
    this.deshabilitarKardex = false;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    let ordenamiento = 'idMateriaImpartida.idMateria.clave:ASC';
    urlParameter.set('criterios', criterio);
    urlParameter.set('ordenamiento', ordenamiento);
    console.log(urlParameter);
    this._spinnerService.start('listaEstudianteMateriaCalificacion');
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlParameter,
      true
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registros = [];
        paginacionInfoJson.lista.forEach((item) => {
          var emI = new EstudianteMateriaImpartida(item);
          var periodoMateria = emI.materiaImpartida.periodoEscolar.id;
          var periodiEstudiante = emI.estudiante.periodoActual.id;

          if (emI.estudiante.periodoActual.id != emI.materiaImpartida.periodoEscolar.id) {
            this.registros.push(emI);
          }else {
            let urlSearch: URLSearchParams = new URLSearchParams();
            urlSearch.set('criterios', 'idEstudianteMateriaImpartida~'
              + item.id + ':IGUAL');
            this.evaluacionDocenteService.getListaEvaluacionDocente(
              this.erroresConsultas,
              urlSearch
            ).subscribe(
              response => {
                let paginacionInfoJsonEvaluacion = response.json();
                if(!this.evaluacionDocenteAlumno.estudianteAbsuelto){
                  if (emI.materiaImpartida.materia.tipoMateria.id !== 3) {
                    if (response.json().lista.length === 0 ) {
                      this.registrosEvaluacionDocente[item.id] = true;
                      emI.calificacionOrdinaria = null;
                      this.deshabilitarKardex = true;
                    }else {
                      paginacionInfoJsonEvaluacion.lista.forEach((itemEvaluacion) => {
                        this.registrosEvaluacionDocente[item.id] = true;
                      });
                    }
                  }else {
                    this.registrosEvaluacionDocente[item.id] = true;
                  }
                }else{
                  this.registrosEvaluacionDocente[item.id] = true;
                }

                if (this.registrosEvaluacionDocente[item.id]) {
                  this.registros.push(emI);
                }
              },
              error  => {
                console.log(error);
                this._spinnerService.stop('listaEstudianteMateriaCalificacion');
              },
              () => {
                // console.log('registrosEvalacionDocente', this.registrosEvaluacionDocente);
                this._spinnerService.stop('listaEstudianteMateriaCalificacion');
              }
            );
          }
        });
      },
      error => {
        this._spinnerService.stop('listaEstudianteMateriaCalificacion');
      },
      () => {
        this._spinnerService.stop('listaEstudianteMateriaCalificacion');
      }
    );
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

  obtenerInfoAcademica(idEstudiante: number): void {
    this.estudianteService.getEstudiantePromedioCreditos(
      idEstudiante,
      this.erroresConsultas
    ).subscribe(
      response => {
        // console.log('respuesta' + response.json().promedioGeneral);
        this.promedioGeneral = response.json().promedioGeneral;
        this.porcentajeCreditos = Math.round(response.json().porcentajeCreditos);
        this.creditosTotoalesEstudiante = response.json().creditosCursados;
      }
    );
  }

  generarFormato(formato): void {
    this._spinnerService.start('descargarFormatos');
    this.estudianteService.getFormatoPdf(
      this.id,
      this.erroresConsultas,
      formato,
      null
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
        this._spinnerService.stop('descargarFormatos');
      },
      () => {
        window.open(this.exportarFormato);
        this._spinnerService.stop('descargarFormatos');
      }
    );
  }

  mostrarGenerarCertificado(): boolean {
    return (this.esRolDocencia && this.porcentajeCreditos >= 100);
  }
  mostrarGenerarKardex(): boolean {
    return this.deshabilitarKardex;
  }

  private definirColumnasTabla(): void {
     this.columnas = [
        { titulo: 'Semestre', nombre: 'numeroPeriodo'},
        { titulo: 'Período', nombre: 'periodo'},
        { titulo: 'Clave', nombre: 'clave'},
        { titulo: 'Asignatura', nombre: 'asignatura'},
        { titulo: 'Calificacion del período ordinario', nombre: 'califPeriodoOridinario'},
        { titulo: 'Calificación revisión/recuperación', nombre: 'calitRevision'},
        { titulo: 'Créditos', nombre: 'creditos'}
      ];
  }

}
