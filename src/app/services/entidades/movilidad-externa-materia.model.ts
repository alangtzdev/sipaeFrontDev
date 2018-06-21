import {Materia} from './materia.model';
import {InteresadoMovilidadExterna} from './interesado-movilidad-externa.model';
import {EstudianteMovilidadExterna} from './estudiante-movilidad-externa.model';
import {Profesor} from './profesor.model';

export class MovilidadExternaMateria {
    public id: number;
    public materiaOrigen: string;
    public movilidadInteresado: InteresadoMovilidadExterna;
    public materia: Materia;
    public movilidadEstudiante: EstudianteMovilidadExterna;
    public profesor : Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.materiaOrigen = json.materia_origen;
            this.movilidadInteresado = new InteresadoMovilidadExterna(json.id_moviliad_interesado);
            this.materia = new Materia(json.id_materia);
            this.movilidadEstudiante = new EstudianteMovilidadExterna (json.id_movilidad_estudiante);
            this.profesor = new Profesor (json.id_profesor);
        }
    }
}
