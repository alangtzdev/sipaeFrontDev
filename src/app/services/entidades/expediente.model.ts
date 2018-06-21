import {Estudiante} from './estudiante.model';
import {SolicitudConstancia} from './solicitud-constancia.model';
import {Archivos} from './archivo.model';

export class Expediente {
    public id: number;
    public estudiante: Estudiante;
    public solicitudConstancia: SolicitudConstancia;
    public archivo: Archivos;
    public html: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.solicitudConstancia = new SolicitudConstancia(json.id_solicitud_constancia);
            this.archivo = new Archivos(json.id_archivo);
            this.html = json.html;
        }
    }
}
