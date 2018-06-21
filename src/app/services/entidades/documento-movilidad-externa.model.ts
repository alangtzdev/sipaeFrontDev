import {TipoDocumento} from '../catalogos/tipo-documento.model';
import {Archivos} from './archivo.model';
import {Estudiante} from './estudiante.model';
import * as moment from 'moment';

export class DocumentoMovilidadExterna {
    public id: number;
    public otroTipoDocumento: string;
    public valido: boolean;
    public comentarios: string;
    public tipoDocumento: TipoDocumento;
    public archivo: Archivos;
    public estudiante: Estudiante;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.otroTipoDocumento = json.otro_tipo_documento;
            this.valido = json.valido;
            this.comentarios = json.comentarios;
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.archivo = new Archivos(json.id_archivo);
            this.estudiante = new Estudiante(json.id_estudiante);
            this.ultimaActualizacion = json.ultima_actualizacion;

        }
    }

    getFechaFormato(): string {
        if (this.ultimaActualizacion) {
            return moment (Date.parse(this.ultimaActualizacion)).format('DD/MM/YYYY');
        }else {
            return '-';
        }
    }
}
