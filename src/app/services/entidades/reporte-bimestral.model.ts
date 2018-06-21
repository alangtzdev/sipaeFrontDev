import {SolicitudServicio} from './solicitud-servicio.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import * as moment from 'moment';
import {DocumentoServicioSocial} from './documento-servicio-social.model';
import {ServicioSocial} from './servicio-social.model';

export class ReporteBimestral {
    public id: number;
    public horas: number;
    public actividadesRealizadas: string;
    public fechaInicio: string;
    public fechaFin: string;
    public observaciones: string;
    public servicioSocial: ServicioSocial;
    public estatus : EstatusCatalogo;
    public documento: DocumentoServicioSocial;

    constructor(json: any) {
        moment.locale('es');
        if (json) {
            this.id = json.id;
            this.horas = json.horas;
            this.actividadesRealizadas = json.actividades_realizadas;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.observaciones = json.observaciones;
            this.servicioSocial = new ServicioSocial(json.id_servicio_social);
            this.estatus = new EstatusCatalogo (json.id_estatus);
            this.documento = new DocumentoServicioSocial(json.id_documento_servicio_social);
        }
    }
    getStrPeriodo(): string {
        let str = '_periodo';
        if (this.fechaFin && this.fechaInicio) {
            str = moment(this.fechaInicio).format('DD MMMM YYYY') +
                ' al ' + moment(this.fechaFin).format('DD MMMM YYYY');
        }
        return str;
    }
    getStrNombreCompletoEstudiante(): string {
        let str = "_nombreCompletoEstudiante";
        if (this.servicioSocial) {
            str = this.servicioSocial.getStrNombreCompletoEstudiante();
        }
        return str;
    }
}
