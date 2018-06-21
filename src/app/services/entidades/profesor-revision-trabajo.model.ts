import {SolicitudExamenTrabajo} from './solicitud-examen-trabajo.model';
import {Profesor} from './profesor.model';
import {RecursoRevision} from './recurso-revision.model';
import {EstatusCatalogo} from "../catalogos/estatus-catalogo.model";

export class ProfesorRevisionTrabajo {
    public id: number;
    public solicitudExamenTrabajo: SolicitudExamenTrabajo;
    public profesor: Profesor;
    public calificacionDefinitiva: number;
    public recursoRevision: RecursoRevision;
    public comentariosEvaluacion: string;
    public estatus : EstatusCatalogo;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.solicitudExamenTrabajo = new SolicitudExamenTrabajo(
                json.id_solicitud_examen_trabajo);
            this.profesor = new Profesor(json.id_profesor);
            this.calificacionDefinitiva = json.calificacion_definitiva;
            this.recursoRevision = new RecursoRevision(json.id_recurso_revision);
            this.comentariosEvaluacion = json.comentarios_evaluacion;
            this.estatus = new EstatusCatalogo (json.id_estatus);
        }
    }
}
