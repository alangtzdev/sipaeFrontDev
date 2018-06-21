import {MovilidadCurricular} from './movilidad-curricular.model';
import {CartaNoAdeudo} from './carta-no-adeudo.model'

export class CalificacionMovilidadCurricular {
    public id: number;
    public calificacion: number;
    public fechaCulminacion: string;
    public movilidad: MovilidadCurricular;
    public docFirmaSimple: CartaNoAdeudo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calificacion = json.calificacion;
            this.fechaCulminacion = json.fecha_culminacion;
            this.movilidad = new MovilidadCurricular(json.id_movilidad);
            this.docFirmaSimple = new CartaNoAdeudo(json.id_doc_firma_simple);
        }
    }
}
