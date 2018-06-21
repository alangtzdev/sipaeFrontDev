import {Estudiante} from './estudiante.model';
import * as moment from 'moment';

export class Publicacion {
    public id: number;
    public titulo: string;
    public fecha: string;
    public resumen: string;
    public estudiante: Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.titulo = json.titulo;
            this.fecha = json.fecha;
            this.resumen = json.resumen;
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }

    getFechaPublicacionFormato(): string {
        return moment (Date.parse(this.fecha)).format('DD/MM/YYYY');
    }
}
