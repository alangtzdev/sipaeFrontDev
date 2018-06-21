import {TipoJurado} from '../catalogos/tipo-jurado.model';
import {Profesor} from './profesor.model';
import {ComiteTutorial} from './comite-tutorial.model';

export class MiembroJurado {
    public id: number;
    public presencial: boolean;
    public tipoJurado: TipoJurado;
    public profesor: Profesor;
    public comiteTutorial: ComiteTutorial;
    public otro : string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.presencial = json.presencial;
            this.tipoJurado = new TipoJurado (json.id_tipo_jurado);
            this.profesor = new Profesor (json.id_profesor);
            this.comiteTutorial = new ComiteTutorial(json.id_comite_tutorial);
            this.otro = json.otro;
        }
    }
}
