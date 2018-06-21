import {ActividadEvaluacionContinua} from './actividad-evaluacion-continua.model';
import {Profesor} from "./profesor.model";

export class ActividadContinuaProfesor {
    public id: number;
    public profesor : Profesor;
    public actividadEvaluacionContinua: ActividadEvaluacionContinua;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.profesor = new Profesor (json.id_profesor);
            this.actividadEvaluacionContinua = new ActividadEvaluacionContinua(
                json.id_actividad_evaluacion_continua
            );
        }
    }
}

