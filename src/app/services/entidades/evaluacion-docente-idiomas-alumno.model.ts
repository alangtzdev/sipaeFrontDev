import {Estudiante} from "./estudiante.model";
import {PeriodoEscolar} from "./periodo-escolar.model";
import {EstudianteGrupoIdioma} from "./estudiante-grupo-idioma.model";

export class EvaluacionDocenteIdiomasAlumno {
    public id: number;
    public idEstudiante : Estudiante;
    public idPeriodoEscolar : PeriodoEscolar;
    public idEstudianteGrupoIdioma : EstudianteGrupoIdioma;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.idEstudiante = new Estudiante(json.id_estudiante);
            this.idPeriodoEscolar = new PeriodoEscolar(json.id_periodo_escolar);
            this.idEstudianteGrupoIdioma = new EstudianteGrupoIdioma(json.id_estudiante_grupo_idioma);
        }
    }
    getMatricula(): string {
        var retorno = '_matricula';
        if (this.idEstudiante) {
            if(this.idEstudiante.matricula){
                retorno = this.idEstudiante.matricula.matriculaCompleta;
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
        return retorno;
    }
    getPromocion(): string {
        var retorno = '_promocion';
        if (this.idEstudiante) {
            if (this.idEstudiante.promocion){
                retorno = this.idEstudiante.promocion.abreviatura;
            }
        }
        return retorno;
    }
}
