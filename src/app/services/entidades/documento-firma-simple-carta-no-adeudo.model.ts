import {CartaNoAdeudo} from './carta-no-adeudo.model';
import {DocumentoFirmaSimple} from './documento-firma-simple.model';

export class DocumentoFirmaSimpleCartaNoAdeudo {
    public id: number;
    public idCartaNoAdeudo: CartaNoAdeudo;
    public idDocumentoFirmaSimple: DocumentoFirmaSimple;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.idCartaNoAdeudo = new CartaNoAdeudo(json.id_carta_no_adeudo);
            this.idDocumentoFirmaSimple = new DocumentoFirmaSimple(json.id_documento_firma_simple);
        }
    }
}
