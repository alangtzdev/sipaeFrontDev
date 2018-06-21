import {Sala} from './sala.model';
import {Dictamen} from '../catalogos/dictamen.model';
import {Estudiante} from './estudiante.model';
import {join} from 'path';
import * as moment from 'moment';

export class ExamenGrado {
    public id: number;
    public dictamenTexto: string;
    public fechaExamen: string;
    public totalAsginatura: boolean;
    public idioma1: boolean;
    public idioma2: boolean;
    public noAdeudos: boolean;
    public votosAprobatorios: boolean;
    public aprobarExamen: boolean;
    public fotos: boolean;
    public totalAsginaturaC: string;
    public idioma1C: string;
    public idioma2C: string;
    public noAdeudosC: string;
    public votosAprobatoriosC: string;
    public fotosC: string;
    public aprobarExamenC: string;
    public estudiante: Estudiante;
    public idDictamen: Dictamen;
    public idSala: Sala;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.dictamenTexto= json.dictamen_texto;
            this.fechaExamen = json.fecha_examen;
            this.totalAsginatura = json.total_asginatura;
            this.idioma1 = json.idioma1;
            this.idioma2 = json.idioma2;
            this.noAdeudos = json.no_adeudos;
            this.votosAprobatorios = json.votos_aprobatorios;
            this.aprobarExamen = json.aprobar_examen;
            this.fotos = json.fotos;
            this.totalAsginaturaC = json.total_asginatura_c;
            this.idioma1C = json.idioma1_c;
            this.idioma2C = json.idioma2_c;
            this.noAdeudosC = json.no_adeudos_c;
            this.votosAprobatoriosC = json.votos_aprobatorios_c;
            this.aprobarExamenC = json.aprobar_examen_c;
            this.fotosC = json.fotos_c;
            this.estudiante = new Estudiante (json.id_estudiante);
            this.idDictamen = new Dictamen(json.id_dictamen);
            this.idSala = new Sala(json.id_sala);
        }
    }

    getFechaConFormato(): string {
        if (this.fechaExamen)
            return moment (Date.parse(this.fechaExamen)).format('DD/MM/YYYY hh:mma');
        else
            return ' -- ';
    }

    getFechaSinHora(): string {
        if (this.fechaExamen)
            return moment (Date.parse(this.fechaExamen)).format('DD/MM/YYYY');
        else
            return ' -- ';
    }

    getHoraFecha(): string {
        return moment (Date.parse(this.fechaExamen)).format('hh:mm a');
    }
}
