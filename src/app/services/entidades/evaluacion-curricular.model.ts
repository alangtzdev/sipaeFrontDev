import {Estudiante} from './estudiante.model';
import {Profesor} from './profesor.model';

export class EvaluacionCurricular {
    public id: number;
    public consideraciones: string;
    public dictamen: boolean;
    public coordinador: boolean;
    public calificacionEnsayo: number;
    public estudiante: Estudiante;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.consideraciones = json.consideraciones;
            this.dictamen = json.dictamen;
            this.coordinador = json.coordinador;
            this.calificacionEnsayo = json.calificacion_ensayo;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.profesor = new Profesor(json.id_profesor);
        }
    }
}
