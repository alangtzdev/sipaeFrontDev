import {ProgramaDocente} from './programa-docente.model';
import {Promocion} from './promocion.model';

export class ComiteEvaluador {
    public id: number;
    public programaDocente: ProgramaDocente;
    public promocion: Promocion;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.promocion = new Promocion(json.id_promocion);
        }
    }
}
