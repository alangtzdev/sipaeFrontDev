import {Estudiante} from './estudiante.model';
import {ActividadEvaluacionContinua} from './actividad-evaluacion-continua.model';

export class EstudiantesActividad {
    public id: number;
    public actividad: ActividadEvaluacionContinua;
    public estudiante: Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.actividad = new ActividadEvaluacionContinua(json.id_actividad);
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }
}
