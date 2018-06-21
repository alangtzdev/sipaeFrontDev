import {Estudiante} from './estudiante.model';
import {Paises} from '../catalogos/pais.model';
import {EntidadFederativa} from '../catalogos/entidad-federativa.model';
import {Municipio} from '../catalogos/municipio.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Sector} from '../catalogos/sector.model';
import * as moment from 'moment';

export class SolicitudServicioSocial {
    public id: number;
    public institucion: string;
    public sector: Sector;
    public calleNumero: string;
    public colonia: string;
    public codigoPostal: string;
    public telefono: string;
    public responsable: string;
    public cargo: string;
    public beca: boolean;
    public fechaInicio: string;
    public fechaFin: string;
    public fechaSolicitud: string;
    public horario: string;
    public dias: string;
    public numeroHoras: string;
    public estudiante: Estudiante;
    public pais: Paises;
    public estatus: EstatusCatalogo;
    public entidadFederativa: EntidadFederativa;
    public municipio: Municipio;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.institucion = json.institucion;
            this.calleNumero = json.calle_numero;
            this.colonia = json.colonia;
            this.codigoPostal = json.codigo_postal;
            this.telefono = json.telefono;
            this.responsable = json.responsable;
            this.cargo = json.cargo;
            this.beca = json.beca;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.fechaSolicitud = json.fecha_solicitud;
            this.horario = json.horario;
            this.dias = json.dias;
            this.numeroHoras = json.numero_horas;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.pais = new Paises(json.id_pais);
            this.sector = new Sector(json.id_sector);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.entidadFederativa = new EntidadFederativa(json.id_entidad_federativa);
            this.municipio = new Municipio(json.id_municipio);
        }
    }
    /* Getters */
    getStrEstatusSolicitud(): string {
        let str = "_status";
        if (this.estatus) {
            str = this.estatus.valor;
        }
        return str;
    }
    getStrMatriculaEstudiante(): string {
        let str = "_matriculaEstudiante";
        if (this.estudiante) {
            str = this.estudiante.getMatricula();
        }
        return str;
    }
    getStrPeriodo(): string {
        let str = "_periodo";
        if (this.estudiante) {
            str = this.estudiante.getPeriodo();
        }
        return str;
    }
    getStrNombreCompletoEstudiante(): string {
        let str = "_nombreCompletoEstudiante";
        if (this.estudiante) {
            str = this.estudiante.getNombreCompleto();
        }
        return str;
    }
    getStrPais():string{
        let str="_pais";
        if(this.pais){
            str=this.pais.valor;
        }
        return str;
    }
    getStrSector():string{
        let str="_sector";
        if(this.sector){
            str=this.sector.valor;
        }
        return str;
    }
    getStrEntidadFerderativa():string{
        let str="_entidadFederativa";
        if(this.entidadFederativa){
            str=this.entidadFederativa.valor;
        }
        return str;
    }
    getStrMunicipio():string{
        let str="_municipio";
        if(this.municipio){
            str=this.municipio.valor;
        }
        return str;
    }
    getStrBeca():string{
        let str="_beca";
        if(this.beca){
            str="Aplica";
        }else{
            str="No aplica";
        }
        return str;
    }
    getStrFechaSolicitud():string{
        let str="_fechaSolicitud";
        if(this.fechaSolicitud){
            str = moment(this.fechaSolicitud).format("DD/MM/YYYY");
        }
        return str;
    }
}
