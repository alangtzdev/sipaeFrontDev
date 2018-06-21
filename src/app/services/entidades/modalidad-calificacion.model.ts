import {Promocion} from './promocion.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class ModalidadCalificacion {
    public id: number;
    public descripcion: string;
    public calificacionMaxima: number;
    public calificacionMinima: number;
    public calificacionMinimaAprobatoria: number;
    public promocion: Promocion;
    public estatus: EstatusCatalogo;
    public ultimaActualizacion: string;
    public promedioMinimo: number;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.descripcion = json.descripcion;
            this.calificacionMaxima = json.calificacion_maxima;
            this.calificacionMinima = json.calificacion_minima;
            this.calificacionMinimaAprobatoria = json.calificacion_minima_aprobatoria;
            this.promocion = new Promocion(json.id_promocion);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.promedioMinimo = json.promedio_minimo;
        }
    }
}
