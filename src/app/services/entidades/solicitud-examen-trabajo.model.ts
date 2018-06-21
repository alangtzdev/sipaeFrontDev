import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {ProfesorMateria} from './profesor-materia.model';
import {Estudiante} from './estudiante.model';
import {Profesor} from './profesor.model';
import {MateriaImpartida} from './materia-impartida.model';

export class SolicitudExamenTrabajo {
    public id: number;
    public calificacionOriginal: number;
    public descripcion: string;
    public calificacionDefinitiva: number;
    public comentariosFinales: string;
    public estatus: EstatusCatalogo;
    public profesorMateria: ProfesorMateria;
    public profesor: Profesor;
    public estudiante: Estudiante;
  public materiaImpartida: MateriaImpartida;


  constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calificacionOriginal = json.calificacion_original;
            this.descripcion = json.descripcion;
            this.calificacionDefinitiva = json.calificacion_definitiva;
            this.comentariosFinales = json.comentarios_finales;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.profesorMateria = new ProfesorMateria(json.id_profesor_materia);
            this.profesor = new Profesor(json.id_profesor);
            this.estudiante = new Estudiante(json.id_estudiante);
          this.materiaImpartida = new MateriaImpartida(json.id_materia);

        }
    }
}
