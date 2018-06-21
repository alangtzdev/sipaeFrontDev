import {Estudiante} from './estudiante.model';
import {Idioma} from './idioma.model';
import {NivelIdioma} from '../catalogos/nivel-idioma.model';

export class IdiomaEstudiante {
    public id: number;
    public idNivelIdioma: NivelIdioma;
    public idIdioma: Idioma;
    public estudiante: Estudiante;
    public otro: string

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.idNivelIdioma = new NivelIdioma (json.id_nivel_idioma);
            this.idIdioma = new Idioma(json.id_idioma);
            this.estudiante = new Estudiante(json.id_estudiante);
            this.otro = json.otro;
        }
    }
}
