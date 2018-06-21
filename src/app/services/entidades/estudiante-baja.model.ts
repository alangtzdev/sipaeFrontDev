import {TipoDocumento} from '../catalogos/tipo-documento.model';
import {Archivos} from './archivo.model';
import {Estudiante} from './estudiante.model';

export class EstudianteBaja {
    public id: number;
    public observaciones: string;
    public estudiante: Estudiante;
    public tipoDocumento: TipoDocumento;
    public archivo: Archivos;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.observaciones = json.observaciones;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.archivo = new Archivos(json.id_archivo);
        }
    }
}
