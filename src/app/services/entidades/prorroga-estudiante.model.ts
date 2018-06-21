import {Estudiante} from './estudiante.model';
import {PagoEstudiante} from './pago-estudiante.model';
import * as moment from 'moment';

export class ProrrogaEstudiante {
    public id: number;
    public descripcion: string;
    public cantidadLiquidada: string;
    public cantidadPendiente: string;
    public fechaInicio: string;
    public fechaFin: string;
    public pagoEstudiante: PagoEstudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.descripcion = json.descripcion;
            this.cantidadLiquidada = json.cantidad_liquidada;
            this.cantidadPendiente = json.cantidad_pendiente;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.pagoEstudiante = new PagoEstudiante(json.id_pago_estudiante);
        }
    }

    getFechaInicioConFormato(): string {
        return moment (Date.parse(this.fechaInicio)).format('DD/MM/YYYY');
    }

    getFechaFinConFormato(): string {
        return moment (Date.parse(this.fechaFin)).format('DD/MM/YYYY');
    }
}
