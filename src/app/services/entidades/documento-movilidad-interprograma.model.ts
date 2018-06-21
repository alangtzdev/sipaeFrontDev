import {Archivos} from './archivo.model';
import {MovilidadInterprograma} from './movilidad-interprograma.model';
import {TipoDocumento} from '../catalogos/tipo-documento.model';

export class DocumentoMovilidadInterprograma {
    public id: number;
    public tipoDocumento: TipoDocumento;
    public otroTipoDocumento: string;
    public valido: boolean;
    public movilidad: MovilidadInterprograma;
    public archivo: Archivos;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.otroTipoDocumento = json.otro_tipo_documento;
            this.valido = json.valido;
            this.archivo = new Archivos(json.id_archivo);
            this.movilidad = new MovilidadInterprograma(json.id_movilidad);
        }
    }
}
