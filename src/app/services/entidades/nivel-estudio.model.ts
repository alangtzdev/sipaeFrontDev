import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class NivelEstudio {
    public id: number;
    public clave: string;
    public descripcion: string;
    public estatus: EstatusCatalogo;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.clave = json.clave;
            this.descripcion = json.descripcion;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.estatus = new EstatusCatalogo(json.id_estatus);
        }
    }
}
