import {PlanEstudio} from './plan-estudio.model';
import {Idioma} from './idioma.model';

export class PlanEstudioIdioma {
    public id: number;
    public planEstudios: PlanEstudio;
    public idiomaPlan: Idioma;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.planEstudios = new PlanEstudio(json.id_plan_estudios);
            this.idiomaPlan = new Idioma(json.idioma_plan);
        }
    }
}
