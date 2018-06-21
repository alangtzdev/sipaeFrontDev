import {Convocatoria} from './convocatoria.model';
import {TipoDocumento} from '../catalogos/tipo-documento.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class ConvocatoriaTiposDocumento {
    public id: number;
    public convocatoria: Convocatoria;
    public tipoDocumento: TipoDocumento;
    public clasificacion: EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.convocatoria = new Convocatoria(json.id_convocatoria);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.clasificacion = new EstatusCatalogo(json.id_clasificacion);
        }
    }
}
