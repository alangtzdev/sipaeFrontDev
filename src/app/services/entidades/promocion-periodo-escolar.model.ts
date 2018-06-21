import {PeriodoEscolar} from './periodo-escolar.model';
import {Promocion} from './promocion.model';

export class PromocionPeriodoEscolar {
    public id: number;
    public idPeriodoEscolar: PeriodoEscolar;
    public idPromocion: Promocion;
    public numSemestre: number;
    public inicio: boolean;
    public fin: boolean;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.idPeriodoEscolar = new PeriodoEscolar(json.id_periodo_escolar);
            this.idPromocion = new Promocion(json.id_promocion);
            this.numSemestre = json.num_semestre;
            this.inicio = json.inicio;
            this.fin = json.fin;
        }
    }
}

