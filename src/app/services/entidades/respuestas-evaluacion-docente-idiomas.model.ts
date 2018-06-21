import {EvaluacionDocenteIdiomas} from './evaluacion-docente-idiomas.model';
import {PreguntaEvaluacionDocenteIdiomas} from '../catalogos/pregunta-evaluacion-docente-idiomas.model';
import {RespuestaEvaluacionDocenteIdiomas} from '../catalogos/respuesta-evaluacion-docente-idiomas.model';

export class RespuestasEvaluacionDocenteIdiomas {
    public id: number;
    public evaluacionDocenteIdiomas: EvaluacionDocenteIdiomas;
    public preguntaEvaluacionDocenteIdiomas: PreguntaEvaluacionDocenteIdiomas;
    public respuestaEvaluacionDocenteIdiomas: RespuestaEvaluacionDocenteIdiomas;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.evaluacionDocenteIdiomas = new EvaluacionDocenteIdiomas(json.id_evaluacion_docente_idiomas);
            this.preguntaEvaluacionDocenteIdiomas = new PreguntaEvaluacionDocenteIdiomas(json.id_pregunta_evaluacion_docente_idiomas);
            this.respuestaEvaluacionDocenteIdiomas = new RespuestaEvaluacionDocenteIdiomas(json.id_respuesta_evaluacion_docente_idiomas);
        }
    }
}
