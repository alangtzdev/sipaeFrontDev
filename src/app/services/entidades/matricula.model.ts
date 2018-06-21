import {ProgramaDocente} from './programa-docente.model';

export class Matricula {
    public id: number;
    public anio: string;
    public consecutivo: string;
    public extranjero: boolean;
    public matriculaCompleta: string;
    public programaDocente: ProgramaDocente;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.anio = json.anio;
            this.consecutivo = json.consecutivo;
            this.extranjero = json.extranjero;
            this.matriculaCompleta = json.matricula_completa;
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
        }
    }

    getMatriculaCompleta(): string {
        if(this.anio){
            return this.programaDocente.abreviatura + this.anio + this.consecutivo;
        } else {
            return '---';
        }

    }

    getMatricula(): string {
        if (this.anio) {
            return this.consecutivo + '-' + this.anio;
        } else {
            return '---';
        }


    }
}
