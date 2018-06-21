import {ProgramaDocente} from "./programa-docente.model";
import {Profesor} from "./profesor.model";

export class InvestigadorAnfitrion {
    public id: number;
    public fechaInicio: string;
    public fechaFin: string;
    public tipoVinculacion: string;
    public programaDocente: ProgramaDocente;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.tipoVinculacion = json.tipo_vinculacion;
            this.programaDocente = new ProgramaDocente (json.id_programa_docente);
            this.profesor = new Profesor (json.id_profesor);
        }
    }
}

