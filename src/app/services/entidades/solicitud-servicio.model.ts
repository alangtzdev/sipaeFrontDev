import {Estudiante} from './estudiante.model';
import {Paises} from '../catalogos/pais.model';
import {EntidadFederativa} from '../catalogos/entidad-federativa.model';
import {Municipio} from '../catalogos/municipio.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Sector} from '../catalogos/sector.model';

export class SolicitudServicio {
    public id: number;
    public institucion: string;
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
    public ultimaActualizacion: string;
    public estudiante: Estudiante;
    public pais: Paises;
    public estatus: EstatusCatalogo;
    public entidadFederativa: EntidadFederativa;
    public municipio: Municipio;
    public sector: Sector;

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
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.pais = new Paises(json.id_pais);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.entidadFederativa = new EntidadFederativa(json.id_entidad_federativa);
            this.municipio = new Municipio (json.id_municipio);
            this.sector = new Sector(json.id_sector);
        }
    }
}
