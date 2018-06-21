import {Estudiante} from './estudiante.model';
import {Lgac} from './lgac.model';
import {TipoDocumento} from '../catalogos/tipo-documento.model';
import {Archivos} from './archivo.model';
import * as moment from 'moment';

export class Documento {
    public id: number;
    public otroTipoDocumento: string;
    public valido: boolean;
    public comentarios: string;
    public descripcion: string;
    public ultimaActualizacion: string;
    public lgac: Lgac;
    public archivo: Archivos;
    public tipoDocumento: TipoDocumento;
    public estudiante: Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.otroTipoDocumento = json.otro_tipo_documento;
            this.valido = json.valido;
            this.comentarios = json.comentarios;
            this.descripcion = json.descripcion;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.lgac = new Lgac(json.id_LGAC);
            this.archivo = new Archivos(json.id_archivo);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }

    getFechaUltimaActualizacionFormato(): string {
        return moment (Date.parse(this.ultimaActualizacion)).format('DD/MM/YYYY');
    }
}
