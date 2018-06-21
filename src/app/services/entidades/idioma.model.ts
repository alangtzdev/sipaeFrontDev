import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class Idioma {
    public id: number;
    public descripcion: string;
    public indigena: boolean;
    public estatus: EstatusCatalogo;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.descripcion = json.descripcion;
            this.indigena = json.indigena;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.estatus = new EstatusCatalogo(json.id_estatus);
        }
    }
}
