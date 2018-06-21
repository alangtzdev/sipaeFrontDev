import {Reinscripcion} from './reinscripcion.model';
import {Estudiante} from './estudiante.model';

export class ReinscripcionEstudiante {
    public id: number;
    public reinscripcion : Reinscripcion;
    public estudiante : Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.reinscripcion = new Reinscripcion (json.id_reinscripcion);
            this.estudiante = new Estudiante (json.id_estudiante);
        }
    }
}
