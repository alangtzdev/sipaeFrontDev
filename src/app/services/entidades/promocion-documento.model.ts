import {TipoDocumento} from '../catalogos/tipo-documento.model';
import {Promocion} from './promocion.model';

export class PromocionDocumento {
    public id: number;
    public promocion: Promocion;
    public tipoDocumento: TipoDocumento;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.promocion = new Promocion(json.id_promocion);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
        }
    }
}
