import {MovilidadCurricular} from './movilidad-curricular.model';
import {TipoDocumento} from '../catalogos/tipo-documento.model';
import {Archivos} from './archivo.model';
import * as moment from 'moment';

export class DocumentoMovilidadCurricular {
    public id: number;
    public otroTipoDocumento: string;
    public valido: string;
    public fechaInicio: string;
    public fechaFin: string;
    public comentarios: string;
    public archivo: Archivos;
    public tipoDocumento: TipoDocumento;
    public movilidad: MovilidadCurricular;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.otroTipoDocumento = json.otro_tipo_documento;
            this.valido = json.valido;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.comentarios = json.comentarios;
            this.archivo = new Archivos(json.id_archivo);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.movilidad = new MovilidadCurricular(json.id_movilidad);
        }
    }
    getFechaInicioFormato(): string {
        if(this.fechaInicio){
            return moment (Date.parse(this.fechaInicio)).format('DD/MM/YYYY');
        }else {
            return '-';
        }
    }
    getFechaFinFormato(): string {
        if(this.fechaFin){
            return moment (Date.parse(this.fechaFin)).format('DD/MM/YYYY');
        }else {
            return '-';
        }

    }
}
