import {Estudiante} from './estudiante.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import * as moment from 'moment';

export class RegistroTitulo {
    public id: number;
    public fechaExamen: string;
    public grado: string;
    public fechaExpedicion: string;
    public fechaEnvioImpresor: string;
    public fechaEntregaImpresor: string;
    public estudiante: Estudiante;
    public estatus: EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.fechaExamen = json.fecha_examen;
            this.grado = json.grado;
            this.fechaExpedicion = json.fecha_expedicion;
            this.fechaEnvioImpresor = json.fecha_envio_impresor;
            this.fechaEntregaImpresor = json.fecha_entrega_impresor;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.estatus = new EstatusCatalogo(json.id_estatus);
        }
    }

    getFechaExamen(): string {
      if (this.fechaExamen) {
        return moment (Date.parse(this.fechaExamen)).format('DD/MM/YYYY');
      } else {
        return 'No hay fecha';
      }
    }

    getFechaExpedicion(): string {
      if (this.fechaExpedicion) {
        return moment (Date.parse(this.fechaExpedicion)).format('DD/MM/YYYY');
      } else {
        return 'No hay fecha';
      }
    }

    getFechaEnvioImpresor(): string {
      if (this.fechaEnvioImpresor) {
        return moment (Date.parse(this.fechaEnvioImpresor)).format('DD/MM/YYYY');
      } else {
        return 'No hay fecha';
      }
    }

    getFechaEntregaImpresor(): string {
      if (this.fechaEntregaImpresor) {
        return moment (Date.parse(this.fechaEntregaImpresor)).format('DD/MM/YYYY');
      } else {
        return 'No hay fecha';
      }
    }
}
