import {Estudiante} from "./estudiante.model";
import {Archivos} from "./archivo.model";

export class VotoAprobatorio {
    public id: number;
    public estudiante: Estudiante;
    public archivoVoto: Archivos;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estudiante = new Estudiante (json.id_estudiante);
            this.archivoVoto = new Archivos (json.id_archivo_voto);
        }
    }
}
