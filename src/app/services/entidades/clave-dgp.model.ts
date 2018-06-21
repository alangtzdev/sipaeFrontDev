import {ProgramaDocente} from "./programa-docente.model";

export class ClaveDgp {

    public id: number;
    public claveCarrera : string;
    public programaDocente : ProgramaDocente;
    public ultimaActualizacion : string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.claveCarrera = json.clave_carrera;
            this.programaDocente = new ProgramaDocente (json.id_programa_docente);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }

    }
}


