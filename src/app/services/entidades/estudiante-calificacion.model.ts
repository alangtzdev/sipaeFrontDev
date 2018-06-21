import {Estudiante} from './estudiante.model';
import {Usuarios} from '../usuario/usuario.model';
import {TipoCalificacion} from '../catalogos/tipo-calificacion.model';
import {Materia} from './materia.model';

export class EstudianteCalificacion {
    public id: number;
    public cumplioAsistencia: boolean;
    public calificacion: number;
    public comentarios: string;
    public usuario: Usuarios;
    public fechaCaptura: string;
    public ultimaActualizacion: string;
    public estudiante: Estudiante;
    public tipoCalificacion: TipoCalificacion;
    public materia: Materia;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.cumplioAsistencia = json.cumplio_asistencia;
            this.calificacion = json.calificacion;
            this.comentarios = json.comentarios;
            this.fechaCaptura = json.fecha_captura;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.usuario = new Usuarios(json.id_usuario);
            this.tipoCalificacion = new TipoCalificacion(json.id_tipo_calificacion);
            this.materia = new Materia(json.id_materia);
        }
    }
}
