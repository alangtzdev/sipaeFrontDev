import {Profesor} from './profesor.model';
import {Lgac} from './lgac.model';
import {TipoTesis} from '../catalogos/tipo-tesis.model';
import {Estudiante} from './estudiante.model';
import {TipoAsignacionTutor} from '../catalogos/tipo-asignacion-tutor.model';
import * as moment from 'moment';

export class Tutor {
    public id: number;
    public nombreTrabajo: string;
    public calificacion: string;
    public fechaAsignacion: string;
    public lgac: Lgac;
    public tipoTesis: TipoTesis;
    public tipo: TipoAsignacionTutor;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombreTrabajo = json.nombre_trabajo;
            this.calificacion = json.calificacion;
            this.fechaAsignacion = json.fecha_asignacion;
            this.lgac = new Lgac (json.id_lgac);
            this.tipoTesis = new TipoTesis(json.id_tipo_tesis);
            this.tipo = new TipoAsignacionTutor(json.id_tipo);
            this.profesor = new Profesor(json.id_profesor);
        }
    }

    getFechaConFormato(): string {
        if (this.fechaAsignacion)
            return moment (Date.parse(this.fechaAsignacion)).format('DD/MM/YYYY');
        else
            return '--';
    }
}
