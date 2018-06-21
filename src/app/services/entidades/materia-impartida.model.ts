import {Materia} from './materia.model';
import {Archivos} from './archivo.model';
import {PeriodoEscolar} from './periodo-escolar.model';
import {Promocion} from './promocion.model';
import {Sala} from './sala.model';
import {HorariosMateria} from './horarios-materia.model';
import {Lgac} from './lgac.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {ActaCalificacion} from './acta-calificacion.model';
import {Estudiante} from './estudiante.model';
import {Profesor} from './profesor.model';
import {ProfesorMateria} from './profesor-materia.model';
import {TemarioParticular} from './temario-particular.model';

export class MateriaImpartida {
    public id: number;
    public materia: Materia;
    public temarioParticular: TemarioParticular;
    public periodoEscolar: PeriodoEscolar;
    public promocion: Promocion;
    public numeroPeriodo: number;
    public sala: Sala;
    public horario: HorariosMateria;
    public lgac: Lgac;
    public cursoOptativo: Materia;
    public estatus: EstatusCatalogo;
    public actaCalificacion: ActaCalificacion;
    public ultimaActualizacion: string;
    public profesores: Array<ProfesorMateria> = [];
    public estudiantes: Array<Estudiante> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.materia = new Materia(json.id_materia);
            this.temarioParticular = new TemarioParticular(json.id_temario_particular);
            this.periodoEscolar = new PeriodoEscolar(json.id_periodo_escolar);
            this.promocion = new Promocion(json.id_promocion);
            this.numeroPeriodo = json.numero_periodo;
            this.sala = new Sala(json.id_sala);
            this.horario = new HorariosMateria(json.id_horario);
            this.lgac = new Lgac(json.id_lgac);
            this.cursoOptativo = new Materia(json.id_curso_optativo);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.actaCalificacion = new ActaCalificacion(json.id_acta_calificacion);
            this.ultimaActualizacion = json.ultima_actualizacion;

            if (json.profesores) {
                Object.keys(json.profesores).map(function (profesor){
                    return json.profesores[profesor]
                }).forEach((profesor) => {
                    this.profesores.push(new ProfesorMateria(profesor));
                });
            }

            if (json.estudiantes) {
                Object.keys(json.estudiantes).map(function (estudiante){
                    return json.estudiantes[estudiante]
                }).forEach((estudiante) => {
                    this.estudiantes.push(new Estudiante(estudiante.id_estudiante));
                });
            }
        }
    }
    getStrClave(): string {
        let str = '_clave';
        if (this.materia) {
            str = this.materia.getStrClave();
        }
        return str;
    }
    getStrDescripcion(): string {
        let str = '_descripcion';
        if (this.materia) {
            str = this.materia.getStrDescripcion();
        }
        return str;
    }

    getProfesorTitular(): string {
      let profesor = '';
      if (this.profesores) {
        this.profesores.forEach((item) => {
          if (item.titular) {
              profesor = item.profesor.getNombreCompleto();
          }
        });
      }
      return profesor;
    }
    getIdProfesorTitular(): any {
        let idProfesor;
        if (this.profesores) {
            this.profesores.forEach((item) => {
                if (item.titular) {
                    idProfesor = item.profesor.id;
                }
            });
        }
        return idProfesor;
    }

    getCorreoProfesorTitular(): string {
        let correo;
        if (this.profesores) {
            this.profesores.forEach((item) => {
                if (item.titular) {
                    correo = item.profesor.usuario.email;
                }
            });
        }
        return correo;
    }
}
