import {EstudianteMovilidadExterna} from './estudiante-movilidad-externa.model';
import {Estudiante} from './estudiante.model';
import {PeriodoEscolar} from './periodo-escolar.model';

export class Boleta {
    public id: number;
    public expedida: boolean;
    public fechaExpedicion: string;
    public periodoEscolar: PeriodoEscolar;
    public estudiante: Estudiante;
    public estudianteMovilidad: EstudianteMovilidadExterna;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.expedida = json.expedida;
            this.fechaExpedicion = json.fecha_expedicion;
            this.periodoEscolar = new PeriodoEscolar(json.id_periodo_escolar);
            this.estudiante = new Estudiante(json.id_estudiante);
            this.estudianteMovilidad = new EstudianteMovilidadExterna(
                json.id_estudiante_movilidad_externa
            );
        }
    }
}
