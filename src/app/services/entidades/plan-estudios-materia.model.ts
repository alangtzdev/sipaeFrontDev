import {PlanEstudio} from './plan-estudio.model';
import {Materia} from './materia.model';

export class PlanEstudiosMateria {
    public id: number;
    public numeroPeriodo: number;
    public materia: Materia;
    public planEstudios: PlanEstudio;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.numeroPeriodo = json.numero_periodo;
            this.materia = new Materia(json.id_materia);
            this.planEstudios = new PlanEstudio(json.id_plan_estudios);
        }
    }
}
