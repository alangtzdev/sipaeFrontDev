import {ProgramaDocente} from './programa-docente.model';
import {TipoSolicitud} from '../catalogos/tipo-solicitud.model';
import {Promocion} from './promocion.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import * as moment from 'moment';

export class FolioSolicitud {
    public id: number;
    public anio: string;
    public consecutivo: string;
    public fecha: string;
    public extranjero: boolean;
    public folioCompleto: string;
    public ultimaActualizacion: string;
    public tipo: TipoSolicitud;
    public programaDocente: ProgramaDocente;
    public estatusCatalogos: EstatusCatalogo;
    public promocion: Promocion;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.anio = json.anio;
            this.consecutivo = json.consecutivo;
            this.fecha = json.fecha;
            this.extranjero = json.extranjero;
            this.folioCompleto = json.folio_completo;
            this.ultimaActualizacion = json.fecha_ultima_actualizacion;
            this.tipo = new TipoSolicitud(json.id_tipo);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.estatusCatalogos = new EstatusCatalogo(json.id_estatus);
            this.promocion = new Promocion(json.id_promocion);
        }
    }

    getFechaConFormato(): string {
      return moment (Date.parse(this.fecha)).format('DD/MM/YYYY');
    }

    getFechaUltimaActualizacionConFormato(): string {
      return moment (Date.parse(this.ultimaActualizacion)).format('DD/MM/YYYY');
    }

    getFolioCOLSAN(): string {
        //anio solo los dos ultimos dos digitos pendiente
        if(this.anio){
            return 'C' + this.anio + '/' + this.programaDocente.abreviatura + '-' + this.consecutivo;
        } else {
            return 'Sin asignar';
        }
    }
}
