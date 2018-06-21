import {Profesor} from './profesor.model';
import {Archivos} from './archivo.model';

export class TemarioParticular {
    public id: number;
    public horasCampo: number;
    public comentarios : string;
    public archivoTemario: Archivos;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.horasCampo = json.horas_campo;
            this.comentarios = json.comentarios;
            this.archivoTemario = new Archivos(json.id_archivo_temario);
            this.profesor = new Profesor(json.id_profesor);
        }
    }
}
