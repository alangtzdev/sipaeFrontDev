import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class Institucion {
    public id: number;
    public nombre: string;
    public ultimaActualizacion: string;
    public estatus: EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.estatus = new EstatusCatalogo(json.id_estatus);
        }
    }
}
