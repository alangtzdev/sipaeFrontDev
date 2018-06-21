import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Institucion} from './institucion.model';
import {TipoConvenio} from '../catalogos/tipo-convenio.model';
import {AlcanceConvenio} from '../catalogos/alcance-convenio.model';
import {Sector} from '../catalogos/sector.model';
import * as moment from 'moment';

export class Convenio {
    public id: number;
    public descripcion: string;
    public fechaInicio: string;
    public fechaFin: string;
    public aplicaFechaFin: boolean;
    public detalles: string;
    public ultimaActualizacion: string;
    public institucion: Institucion;
    public tipo: TipoConvenio;
    public alcance: AlcanceConvenio;
    public sector: Sector;
    public estatus: EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.descripcion = json.descripcion;
            this.sector = new Sector(json.id_sector);
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.aplicaFechaFin = json.aplica_fecha_fin;
            this.detalles = json.detalles;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.institucion = new Institucion(json.id_institucion);
            this.tipo = new TipoConvenio(json.id_tipo_convenio);
            this.alcance = new AlcanceConvenio(json.id_alcance);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }

    getFechaInicio(): string {
        return moment (Date.parse(this.fechaInicio)).format('DD/MM/YYYY');
    }
    getFechaFin(): string {
        return moment (Date.parse(this.fechaFin)).format('DD/MM/YYYY');
    }
}
