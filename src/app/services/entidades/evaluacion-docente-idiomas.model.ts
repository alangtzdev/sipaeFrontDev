import {EvaluacionDocenteIdiomasAlumno} from "./evaluacion-docente-idiomas-alumno.model";
export class EvaluacionDocenteIdiomas {
    public id: number;
    public evaluacionDocenteIdiomasAlumno: EvaluacionDocenteIdiomasAlumno;
    public profesor: string;
    public observaciones: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.evaluacionDocenteIdiomasAlumno = new EvaluacionDocenteIdiomasAlumno(
                json.id_evaluacion_docente_idiomas_alumno);
            this.profesor = json.profesor;
            this.observaciones = json.observaciones;
        }
    }    
}