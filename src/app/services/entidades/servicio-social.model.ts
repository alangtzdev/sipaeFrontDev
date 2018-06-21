import {SolicitudServicioSocial} from './solicitud-servicio-social.model';
import * as moment from 'moment';

export class ServicioSocial {
    public id: number;
    public proyecto: string;
    public actividades: string;
    public fechaInicio: string;
    public fechaFin: string;
    public fechaSolicitud: string;
    public resoluciones: string;
    public area: string;
    public observaciones: string;
    public solicitudServicioSocial: SolicitudServicioSocial;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.proyecto = json.proyecto;
            this.actividades = json.actividades;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.fechaSolicitud = json.fechaSolicitud;
            this.resoluciones = json.resoluciones;
            this.area = json.area;
            this.observaciones = json.observaciones;
            this.solicitudServicioSocial = new SolicitudServicioSocial(json.id_solicitud_servicio);
        }
    }

    /* Getters */
    getStrEstatusSolicitud(): string {
        let str = "_status";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrEstatusSolicitud();
        }
        return str;
    }
    getStrFechaSolicitud(): string {
        let str = "_fechaSolicitud";
        if (this.solicitudServicioSocial) {
            str=this.solicitudServicioSocial.getStrFechaSolicitud();
        }
        return str;
    }
    getStrMatriculaEstudiante(): string {
        let str = "_matriculaEstudiante";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrMatriculaEstudiante();
        }
        return str;
    }
    getStrNombreCompletoEstudiante(): string {
        let str = "_nombreCompletoEstudiante";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrNombreCompletoEstudiante();
        }
        return str;
    }
    getStrSector(): string {
        let str = "_sector";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrSector();
        }
        return str;
    }
    getStrPeriodo(): string {
        let str = "_periodo";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrPeriodo();
        }
        return str;
    }
    getStrInstitucion(): string {
        let str = "_institucion";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.institucion;
        }
        return str;
    }
    getStrColonia(): string {
        let str = "_colonia";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.colonia;
        }
        return str;
    }
    getStrCalleNumero(): string {
        let str = "_calle_numero";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.calleNumero;
        }
        return str;
    }
    getStrPais(): string {
        let str = "_pais";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrPais();
        }
        return str;
    }
    getStrEntidadFerderativa(): string {
        let str = "_entidadFederativa";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrEntidadFerderativa();
        }
        return str;
    }
    getStrMunicipio(): string {
        let str = "_municipio";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrMunicipio();
        }
        return str;
    }
    getStrCodigoPostal(): string {
        let str = "_codigoPostal";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.codigoPostal;
        }
        return str;
    }
    getStrCargo(): string {
        let str = "_cargo";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.cargo;
        }
        return str;
    }
    getStrTelefono(): string {
        let str = "_telefono";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.telefono;
        }
        return str;
    }
    getStrBeca(): string {
        let str = "_beca";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.getStrBeca();
        }
        return str;
    }
    getStrHorario(): string {
        let str = "_horario";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.horario;
        }
        return str;
    }
    getStrDias(): string {
        let str = "_dias";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.dias;
        }
        return str;
    }
    getStrNumeroHoras(): string {
        let str = "_numeroHoras";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.numeroHoras;
        }
        return str;
    }
    getNumeroHorasServicio(): string {
        let retorno = "_numeroHorasServicio";
        return retorno;
    }
    getStrFechaInicio(): string {
        let str = "_fechaInicio";
        str = moment(this.fechaInicio).format("DD/MM/YYYY");
        return str;
    }
    getStrFechaFin(): string {
        let str = "_fechaFin";
        str = moment(this.fechaFin).format("DD/MM/YYYY");
        return str;
    }
    getStrResponsable(): string {
        let str = "_responsable";
        if (this.solicitudServicioSocial) {
            str = this.solicitudServicioSocial.responsable;
        }
        return str;
    }
}
