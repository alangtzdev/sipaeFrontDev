import {ProgramaDocente} from './programa-docente.model';
import {Promocion} from './promocion.model';
import * as moment from 'moment';

export class GestionInstitucional {
    public id: number;
    public tramite: string;
    public descripcion: string;
    public fechaRegistro: string;
    public fechaResolucionDictamen: string;
    public vigencia: string;
    public idProgramaDocente: ProgramaDocente;
    public idPromocion: Promocion;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.tramite = json.tramite;
            this.descripcion = json.descripcion;
            this.fechaRegistro = json.fecha_registro;
            this.fechaResolucionDictamen = json.fecha_resolucion_dictamen;
            this.vigencia = json.vigencia;
            this.idProgramaDocente = new ProgramaDocente(json.id_programa_docente);
            this.idPromocion = new Promocion(json.id_promocion);
        }
    }

    getFechaRegistroConFormato(): string {
        return moment (Date.parse(this.fechaRegistro)).format('DD/MM/YYYY');
    }

    getFechaResolucionConFormato(): string {
        return moment (Date.parse(this.fechaResolucionDictamen)).format('DD/MM/YYYY');
    }
}
