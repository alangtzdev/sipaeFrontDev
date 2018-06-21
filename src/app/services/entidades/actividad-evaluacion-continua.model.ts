import {ActividadContinuaProfesor} from './actividad-continua-profesor.model';
import {Profesor} from './profesor.model';
import {ActividadContinuaEstudiante} from './actividad-continua-estudiante.model';
import {Estudiante} from './estudiante.model';
import * as moment from 'moment';
export class ActividadEvaluacionContinua {
    public id: number;
    public actividad: string;
    public fecha: string;
    public otro: string;
    public profesores: Array<Profesor> = [];
    public profesoresString: Array<string> = [];
    public estudiantes: Array<Estudiante> = [];
    public estudiantesString: Array<string> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.actividad = json.actividad;
            this.fecha = json.fecha;
            this.otro = json.otro;
            if (json.profesores) {
                var arr = Object.keys(json.profesores).map(function(k) {
                    return json.profesores[k];
                });

                arr.forEach((item) => {
                    let actividadContinuaProfesor : ActividadContinuaProfesor =
                        new ActividadContinuaProfesor(item);
                    this.profesores.push(actividadContinuaProfesor.profesor);
                    this
                        .profesoresString
                        .push(actividadContinuaProfesor.profesor.getNombreCompleto());
                });
            }

            if (json.estudiantes) {
                var arr = Object.keys(json.estudiantes).map(function(k) {
                    return json.estudiantes[k];
                });

                arr.forEach((item) => {
                    let actividadContinuaEstudiante: ActividadContinuaEstudiante =
                        new ActividadContinuaEstudiante(item);
                    this.estudiantes.push(actividadContinuaEstudiante.estudiante);
                    this
                        .estudiantesString
                        .push(actividadContinuaEstudiante.estudiante.getNombreCompleto());
                });
            }
        }
    }

    getProfesoresString(): string {
        return  this.profesores.join(', ');
    }

    getEstudiantesString(): string {
        return  this.estudiantes.join(', ');
    }

    getFechaConFormato(): string {
        return moment (Date.parse(this.fecha)).format('DD/MM/YYYY');
    }
}
