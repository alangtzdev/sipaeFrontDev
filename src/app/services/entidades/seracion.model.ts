import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Materia} from './materia.model';

export class Seracion {
    public id: number;
    public materiaPadre: Materia;
    public materiaHijo: Materia;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.materiaPadre = new Materia(json.id_materia_padre);
            this.materiaHijo = new Materia(json.id_materia_hijo);
        }
    }
}
