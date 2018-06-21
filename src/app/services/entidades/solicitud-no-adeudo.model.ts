import {Estudiante} from './estudiante.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import * as moment from 'moment';

export class SolicitudNoAdeudo {
    public id: number;
    public fecha: string;
    public estudiante: Estudiante;
    public estatus: EstatusCatalogo;
    public motivo: string;
    public docencia: boolean;
    public utic: boolean;
    public finanzas: boolean;
    public rms: boolean;
    public biblioteca: boolean;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.fecha = json.fecha;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.motivo = json.motivo;
            this.docencia = json.docencia;
            this.utic = json.utic;
            this.finanzas = json.finanzas;
            this.rms = json.rms;
            this.biblioteca = json.biblioteca;
        }
    }

    getFechaConFormato(): string {
      return moment (Date.parse(this.fecha)).format('DD/MM/YYYY');
    }
}
