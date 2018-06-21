import {ProgramaDocente} from './programa-docente.model';
import {Reacreditacion} from '../catalogos/reacreditacion.model';
import * as moment from 'moment';

export class ReacreditacionProgramaDocente {
    public id: number;
    public fecha: string;
    public anios: string;
    public comentario: string;
    public programaDocente: ProgramaDocente;
    public nivelReacreditacion: Reacreditacion;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.fecha = json.fecha;
            this.anios = json.anios;
            this.comentario = json.comentario;
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.nivelReacreditacion = new Reacreditacion (json.id_nivel_reacreditacion);
        }
    }

    getFechaConFormato(): string {
        return moment (Date.parse(this.fecha)).format('DD/MM/YYYY');
    }
}
