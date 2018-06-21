import {Archivos} from './archivo.model';
import {AcreditacionIdioma} from './acreditacion-idioma.model';
import {TipoDocumento} from '../catalogos/tipo-documento.model';

export class DocumentoProbatorioAcreditacion {
    public id:number;
    public archivo: Archivos;
    public acreditacion: AcreditacionIdioma;
    public tipoDocumento: TipoDocumento;

    constructor(json:any) {
        if (json) {
            this.id = json.id;
            this.archivo = new Archivos(json.id_archivo);
            this.acreditacion = new AcreditacionIdioma(json.id_acreditacion);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);

        }
    }
}
