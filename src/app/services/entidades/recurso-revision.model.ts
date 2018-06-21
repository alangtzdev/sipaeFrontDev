import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Archivos} from './archivo.model';
import {Estudiante} from "./estudiante.model";
import {ProfesorMateria} from "./profesor-materia.model";
import {Materia} from "./materia.model";
import {Profesor} from "./profesor.model";
import {MateriaImpartida} from "./materia-impartida.model";

export class RecursoRevision {
  public id: number;
  public calificacionOriginal: number;
  public descripcion: string;
  public calificacionDefinitiva: number;
  public comentariosFinales: string;
  public estudiante : Estudiante;
  public estatus: EstatusCatalogo;
  public profesor: Profesor;
  public materiaImpartida: MateriaImpartida;
  public archivoInformeProfesor: Archivos;

  constructor(json: any) {
    if (json) {
      this.id = json.id;
      this.calificacionOriginal = json.calificacion_original;
      this.descripcion = json.descripcion;
      this.calificacionDefinitiva = json.calificacion_definitiva;
      this.comentariosFinales = json.comentarios_finales;
      this.estudiante = new Estudiante(json.id_estudiante);
      this.estatus = new EstatusCatalogo(json.id_estatus);
      this.profesor = new Profesor (json.id_profesor);
      this.materiaImpartida = new MateriaImpartida (json.id_materia);
      this.archivoInformeProfesor = new Archivos(json.id_archivo_informe_profesor);
    }
  }
}
