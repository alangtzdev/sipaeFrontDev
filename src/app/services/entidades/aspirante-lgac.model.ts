import {Estudiante} from './estudiante.model';
import {Lgac} from './lgac.model';

export class AspiranteLgac {
    public id: number;
    public lgac: Lgac;
    public estudiante: Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.lgac = new Lgac(json.id_lgac);
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }
}
