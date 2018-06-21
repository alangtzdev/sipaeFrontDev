import {ProgramaDocente} from './programa-docente.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {ClasificacionPreguntasFrecuentes} from '../catalogos/clasificacion-preguntas-frecuentes.model';

export class PreguntaFrecuente {
    public id: number;
    public pregunta: string;
    public respuesta: string;
    public programaDocente: ProgramaDocente;
    public estatus: EstatusCatalogo;
    public clasificacion: ClasificacionPreguntasFrecuentes;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.pregunta = json.pregunta;
            this.respuesta = json.respuesta;
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.clasificacion = new ClasificacionPreguntasFrecuentes(json.id_clasificacion);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }
}
