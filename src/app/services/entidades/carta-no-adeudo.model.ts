import {SolicitudNoAdeudo} from './solicitud-no-adeudo.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {TipoNoAdeudo} from '../catalogos/tipo-no-adeudo.model';

export class CartaNoAdeudo {
    public id: number;
    public solicitud: SolicitudNoAdeudo;
    public estatus: EstatusCatalogo;
    public tipo: TipoNoAdeudo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.solicitud = new SolicitudNoAdeudo(json.id_solicitud);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.tipo = new TipoNoAdeudo(json.id_tipo);
        }
    }
}
