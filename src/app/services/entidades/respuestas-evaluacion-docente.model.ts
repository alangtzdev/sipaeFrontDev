import {EvaluacionDocente} from './evaluacion-docente.model';
import {PreguntaEvaluacionDocente} from '../catalogos/pregunta-evaluacion-docente.model';
import {RespuestaEvaluacionDocente} from '../catalogos/respuesta-evaluacion-docente.model';

export class RespuestasEvaluacionDocente {
    public id: number;
    public evaluacion: EvaluacionDocente;
    public preguntaEvaluacion: PreguntaEvaluacionDocente;
    public respuestaEvaluacion: RespuestaEvaluacionDocente;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.evaluacion = new EvaluacionDocente(json.id_evaluacion);
            this.preguntaEvaluacion = new PreguntaEvaluacionDocente(json.id_pregunta_evaluacion);
            this.respuestaEvaluacion = new RespuestaEvaluacionDocente(json.id_respuesta_evaluacion);
        }
    }
}
