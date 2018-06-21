import {Lgac} from './lgac.model';
import {Promocion} from './promocion.model';

export class PromocionLgac {
    public id: number;
    public promocion: Promocion;
    public lgac: Lgac;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.promocion = new Promocion(json.id_promocion);
            this.lgac = new Lgac(json.id_lgac);
        }
    }
}
