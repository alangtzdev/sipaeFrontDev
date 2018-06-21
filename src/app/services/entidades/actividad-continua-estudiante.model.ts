import {Estudiante} from './estudiante.model';
import {ActividadEvaluacionContinua} from './actividad-evaluacion-continua.model';

export class ActividadContinuaEstudiante {
    public id: number;
    public estudiante: Estudiante;
    public actividadEvaluacionContinua: ActividadEvaluacionContinua;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.actividadEvaluacionContinua = new ActividadEvaluacionContinua(
                json.id_actividad_evaluacion_continua
            );
        }
    }
}
