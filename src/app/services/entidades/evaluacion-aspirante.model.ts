import {Estudiante} from './estudiante.model';
import {Profesor} from './profesor.model';

export class EvaluacionAspirante {
    public id: number;
    public consideraciones: string;
    public prioridad: number;
    public dictamen: boolean;
    public calificacionEntrevista: number;
    public calificacionCENEVAL: number;
    public calificacionFinal: number;
    public entrevista: boolean;
    public coordinador: boolean;
    public estudiante: Estudiante;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.consideraciones = json.consideraciones;
            this.prioridad = json.prioridad;
            this.dictamen = json.dictamen;
            this.calificacionEntrevista = json.calificacion_entrevista;
            this.calificacionCENEVAL = json.calificacion_ceneval;
            this.calificacionFinal = json.calificacion_final;
            this.entrevista = json.entrevista;
            this.coordinador = json.coordinador;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.profesor = new Profesor(json.id_profesor);
        }
    }
}
