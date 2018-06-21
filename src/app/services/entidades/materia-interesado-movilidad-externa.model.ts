import {Materia} from "./materia.model";
import {InteresadoMovilidadExterna} from "./interesado-movilidad-externa.model";

export class MateriaInteresadoMovilidadExterna {
    public id: number;
    public materiaCovalida: string;
    public materia: Materia;
    public interesadoMovilidadExterna: InteresadoMovilidadExterna;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.materiaCovalida = json.materia_covalida;
            this.materia = new Materia(json.id_materia);
            this.interesadoMovilidadExterna = new InteresadoMovilidadExterna(json.id_interesado_movilidad_externa);

        }
    }
}

