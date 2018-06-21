import {GrupoIdioma} from './grupo-idioma.model';
import {Estudiante} from './estudiante.model';

export class EstudianteGrupoIdioma {
    public id: number;
    public calificacion: number;
    public grupoIdioma: GrupoIdioma;
    public estudiante : Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calificacion= json.calificacion;
            this.grupoIdioma = new GrupoIdioma (json.id_grupo_idioma);
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }
}
