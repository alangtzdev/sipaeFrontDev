import {Archivos} from './archivo.model';
import {SolicitudServicio} from './solicitud-servicio.model';
import * as moment from 'moment';
import {TipoDocumento} from '../catalogos/tipo-documento.model';

export class DocumentoServicioSocial {
    public id: number;
    public tipoDocumento: TipoDocumento;
    public otroTipoDocumento: string;
    public fechaInicio: string;
    public fechaFin: string;
    public valido: boolean;
    public fechaExpedicion: string;
    public archivo: Archivos;
    public servicio: SolicitudServicio;
    public ultimaActualizacion: string;

    constructor(json: any) {
        moment.locale("es");
        if (json) {
            this.id = json.id;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.otroTipoDocumento = json.otro_tipo_documento;
            this.valido = json.valido;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.fechaExpedicion = json.fecha_expedicion;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.archivo = new Archivos(json.id_archivo);
            this.servicio = new SolicitudServicio(json.id_servicio);
        }
    }
    getStrPeriodo(): string {
        let str = "_periodo";
        if (this.fechaFin && this.fechaInicio) {
            str = moment(this.fechaInicio).format("D MMMM YYYY") + " a " + moment(this.fechaFin).format("D  MMMM YYYY");
        }
        return str;
    }
    getStrFechaExpedcion(): string {
        let str = "_fecha- expedicion";
        if(this.fechaExpedicion){
            str = moment(this.fechaExpedicion).format("DD/MM/YYYY");
        }
        return str;
    }
    getStrUltimaActualizacion():string{
        let str="_ultimaActualizacion";
        if(this.ultimaActualizacion){
            str = moment(this.ultimaActualizacion).format("DD/MM/YYYY");
        }
        return str;
    }
    getStrTipoDocumento(): string {
        let str = "_tipoDocumento";
        /*if (this.idTipoDocumento) {
            switch (this.idTipoDocumento) {
                case 32:
                    str = "Reporte final";
                    break;
                case 33:
                    str = "Constancia terminación";
                    break;
                case 36:
                    str = "Carta liberación";
                    break;

                default:
                    break;
            }
        }*/
        return str;
    }

}
