import {Profesor} from './profesor.model';
import {ComiteEvaluador} from './comite-evaluador.model';

export class Evaluador {
    public id: number;
    public comiteEvaluador: ComiteEvaluador;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.comiteEvaluador = new ComiteEvaluador(json.id_comite_evaluador);
            this.profesor = new Profesor(json.id_profesor);
        }
    }
}
