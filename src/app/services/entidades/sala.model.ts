import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class Sala {
    public id: number;
    public descripcion: string;
    public ubicacion: string;
    public estatus: EstatusCatalogo;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.descripcion = json.descripcion;
            this.ubicacion = json.ubicacion;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }
}
