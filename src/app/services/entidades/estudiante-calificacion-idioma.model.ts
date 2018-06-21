import {Estudiante} from './estudiante.model';
import {GrupoIdioma} from './grupo-idioma.model';

export class EstudianteCalificacionIdioma {
    public id: number;
    public calificacion: number;
    public estudiante: Estudiante;
    public grupoIdioma: GrupoIdioma;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calificacion = json.calificacion;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.grupoIdioma = new GrupoIdioma(json.id_grupo_idiomas);
        }
    }
}
