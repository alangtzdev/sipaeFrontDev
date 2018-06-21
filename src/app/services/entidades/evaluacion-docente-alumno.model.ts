import {Estudiante} from "./estudiante.model";
import {PeriodoEscolar} from "./periodo-escolar.model";
import {EstudianteMovilidadExterna} from "./estudiante-movilidad-externa.model";

export class EvaluacionDocenteAlumno {
  public id: number;
  public idEstudiante : Estudiante;
  public idPeriodoEscolar : PeriodoEscolar;
  public evaluacionesFinalizadas : boolean;
  public estudianteAbsuelto : boolean;
  public observaciones : string;
  public idEstudianteMovilidad : EstudianteMovilidadExterna;

  constructor(json: any) {
    if (json) {
      this.id = json.id;
      this.idEstudiante = new Estudiante(json.id_estudiante);
      this.idPeriodoEscolar = new PeriodoEscolar(json.id_periodo_escolar);
      this.evaluacionesFinalizadas = json.evaluaciones_finalizadas;
      this.estudianteAbsuelto = json.estudiante_absuelto;
      this.observaciones = json.observaciones;
      this.idEstudianteMovilidad = new EstudianteMovilidadExterna(json.id_estudiante_movilidad_externa);

    }
  }

  getMatricula(): string {
    var retorno = '_matricula';
    if (this.idEstudiante) {
      if(this.idEstudiante.matricula){
        retorno = this.idEstudiante.matricula.matriculaCompleta;
      }
    }
    if (this.idEstudianteMovilidad) {
      if(this.idEstudianteMovilidad.matricula){
        retorno = this.idEstudianteMovilidad.matricula.matriculaCompleta;
      }
    }

    return retorno;
  }
  getNombre(): string {
    var retorno = '_nombre';
    if (this.idEstudiante) {
      if (this.idEstudiante.datosPersonales){
        retorno = this.idEstudiante.getNombreCompletoOpcional();
      }
    }
    if (this.idEstudianteMovilidad) {
      if (this.idEstudianteMovilidad.datosPersonales){
        retorno = this.idEstudianteMovilidad.getNombreCompletoOpcional();
      }
    }

    return retorno;
  }
  getPromocion(): string {
    var retorno = '_promocion';
    if (this.idEstudiante) {
      if (this.idEstudiante.promocion){
        retorno = this.idEstudiante.promocion.abreviatura;
      }
    }
    if (this.idEstudianteMovilidad) {
      if (this.idEstudianteMovilidad.idPromocion){
        retorno = this.idEstudianteMovilidad.idPromocion.abreviatura;
      }
    }
    return retorno;
  }
}
