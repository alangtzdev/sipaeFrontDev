import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class Grupo {
    public id: number;
    public clave: string;
    public cicloEscolar: string;
    public cupo: number;
    public grado: string;
    public estatus: EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.clave = json.clave;
            this.cicloEscolar = json.ciclo_escolar;
            this.cupo = json.cupo;
            this.grado = json.grado;
            this.estatus = new EstatusCatalogo(json.id_estatus);
        }
    }
}
