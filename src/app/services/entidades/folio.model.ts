
import {Promocion} from './promocion.model';
import {Estudiante} from './estudiante.model';
import {TipoFolio} from '../catalogos/tipo-folio.model';

export class Folio {
    public id: number;
    public consecutivo1 : string;
    public consecutivo2 : string;
    public promocion : Promocion;
    public estudiante : Estudiante;
    public tipoFolio : TipoFolio;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.consecutivo1 = json.consecutivo1;
            this.consecutivo2 = json.consecutivo2;
            this.promocion = new Promocion (json.id_promocion);
            this.estudiante = new Estudiante (json.id_estudiante);
            this.tipoFolio = new TipoFolio (json.id_tipo_folio);
        }
    }
}
