import {AreaDocumento} from './area-documento.model';
import * as moment from 'moment';

export class TipoDocumento {
    public id: number;
    public valor: string;
    public activo: boolean;
    public idAreaDocumento: AreaDocumento;
    public descripcion: string;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
            this.idAreaDocumento = new AreaDocumento(json.id_area_documento);
            this.descripcion = json.descripcion;
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }

    getFechaUltimaActualizacionConFormato(): string {
        return moment (Date.parse(this.ultimaActualizacion)).format('DD/MM/YYYY');
    }
}
