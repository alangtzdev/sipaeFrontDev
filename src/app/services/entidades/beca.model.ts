import {ClasificacionBeca} from '../catalogos/clasificacion-beca.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class Beca {
    public id: number;
    public descripcion: string;
    public ultimaActualizacion: string;
    public clasificacion: ClasificacionBeca;
    public estatus: EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.descripcion = json.descripcion;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.clasificacion = new ClasificacionBeca(json.id_clasificacion);
            this.estatus = new EstatusCatalogo(json.id_estatus);
        }
    }
}
