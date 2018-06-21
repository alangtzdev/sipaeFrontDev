import {Profesor} from './profesor.model';
import {PeriodoEscolar} from './periodo-escolar.model';
import {Archivos} from './archivo.model';
import {Idioma} from './idioma.model';
import {CursoNivelIdioma} from '../catalogos/nivel-idioma-curso.model';
import * as moment from 'moment';

export class GrupoIdioma {
    public id: number;
    public horario: string;
    public fechaInicio: string;
    public fechaFin: string;
    public diasSemana: string;
    public institucion: string;
    public profesor: string;
    public idioma: Idioma;
    public periodo: PeriodoEscolar;
    public archivoPrograma: Archivos;
    public nivel: CursoNivelIdioma;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.horario = json.horario;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.diasSemana = json.dias_semana;
            this.institucion = json.institucion;
            this.profesor = json.profesor;
            this.periodo = new PeriodoEscolar(json.id_periodo);
            this.idioma = new Idioma(json.id_idioma);
            this.archivoPrograma = new Archivos(json.id_archivo_programa);
            this.nivel = new CursoNivelIdioma(json.id_nivel);
        }
    }

    getFechaInicioCurso() {
        return moment(this.fechaInicio).format('DD/MM/YYYY');
    }

    getFechaFinCurso() {
        return moment(this.fechaFin).format('DD/MM/YYYY');
    }
}
