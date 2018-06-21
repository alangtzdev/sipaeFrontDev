import {Estudiante} from './estudiante.model';
import {Tutor} from "./tutor.model";
import * as  moment from 'moment';

export class EstudianteTutor {
    public id: number;
    public estudiante: Estudiante;
    public tutor: Tutor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.tutor = new Tutor(json.id_tutor);
        }
    }

/*    getFechaConFormato(): string {
        if (this.fechaAsignacion)
            return moment (Date.parse(this.fechaAsignacion)).format('DD/MM/YYYY');
        else
            return '--';
    }*/
}
