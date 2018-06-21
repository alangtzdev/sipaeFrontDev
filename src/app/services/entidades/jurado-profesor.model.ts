import {MiembroJurado} from "./miembro-jurado.model";
import {Profesor} from "./profesor.model";

export class JuradoProfesor {
    public id: number;
    public miembroJurado: MiembroJurado;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.miembroJurado = new MiembroJurado (json.id_miembros_jurado);
            this.profesor = new Profesor (json.id_profesor);
        }
    }
}
