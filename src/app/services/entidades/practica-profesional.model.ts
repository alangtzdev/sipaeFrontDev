import {PeriodoEscolar} from './periodo-escolar.model';
import {SolicitudServicio} from './solicitud-servicio.model';

export class PracticaProfesional {
    public id: number;
    public embajada: string;
    public fechaEnvioResolucion: string;
    public respuestas: string;
    public calendario: string;
    public observaciones: string;
    public representacion: string;
    public periodo: PeriodoEscolar;
    public solicitud: SolicitudServicio;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.embajada = json.embajada;
            this.fechaEnvioResolucion = json.fecha_envio_resolucion;
            this.respuestas = json.respuestas;
            this.calendario = json.calendario;
            this.observaciones = json.observaciones;
            this.representacion = json.representacion;
            this.periodo = new PeriodoEscolar(json.id_periodo);
            this.solicitud = new SolicitudServicio(json.id_solicitud);
        }
    }
}
