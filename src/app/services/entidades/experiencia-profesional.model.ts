import {TipoExperiencia} from '../catalogos/tipo-experiencia.model';
import {Estudiante} from './estudiante.model';
import * as  moment from 'moment';
import {Profesor} from './profesor.model';


export class ExperienciaProfesional {
    public id: number;
    public titulo: string;
    public institucion: string;
    public responsabilidad: string;
    public fechaInicio: string;
    public fechaFin: string;
    public actualmente: boolean;
    public estudiante: Estudiante;
    public tipoExperiencia: TipoExperiencia;
    public profesor: Profesor;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.titulo = json.titulo;
            this.institucion = json.institucion;
            this.responsabilidad = json.responsabilidad;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.actualmente = json.actualmente;
            this.tipoExperiencia = new TipoExperiencia(json.id_tipo_experiencia);
            this.estudiante = new Estudiante(json.id_estudiante);
            this.profesor = new Profesor(json.id_profesor);
        }
    }

    getFechaFinConFormato(): string {
      return moment (Date.parse(this.fechaFin)).format('DD/MM/YYYY');
    }

    getFechaInicioConFormato(): string {
      return moment (Date.parse(this.fechaInicio)).format('DD/MM/YYYY');
    }
}
