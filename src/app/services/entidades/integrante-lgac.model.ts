import {Profesor} from './profesor.model';
import {PeriodoEscolar} from './periodo-escolar.model';

export class IntegranteLgac {
    public id: number;
    public creditos: string;
    public calendario: string;
    public observaciones: string;
    public periodo: PeriodoEscolar;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.creditos = json.creditos;
            this.calendario = json.calendario;
            this.observaciones = json.observaciones;
            this.periodo = new PeriodoEscolar(json.id_periodo);
            this.profesor = new Profesor(json.id_profesor);
        }
    }

    getNombreCompleto(): string {
            return this.profesor.getNombreCompleto();
    }
}
