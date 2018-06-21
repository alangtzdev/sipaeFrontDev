import {AcreditacionIdioma} from './acreditacion-idioma.model';

export class AcreditacionIdiomaLicenciatura {
    public id: number;
    public institucionProcedencia: string;
    public acreditacionIdioma: AcreditacionIdioma;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.institucionProcedencia = json.institucion_procedencia;
            this.acreditacionIdioma = new AcreditacionIdioma(json.id_acreditacion);
        }
    }
}
