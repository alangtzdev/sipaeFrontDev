import {Profesor} from './profesor.model';
import {EstudianteMateriaImpartida} from "./estudiante-materia-impartida.model";

export class EvaluacionDocente {
    public id: number;
    public estudianteMateriaImpartida: EstudianteMateriaImpartida;
    public profesor: Profesor;
    public observaciones: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estudianteMateriaImpartida = new EstudianteMateriaImpartida(
                json.id_estudiante_materia_impartida);
            this.profesor = new Profesor(json.id_profesor);
            this.observaciones = json.observaciones;
        }
    }
    getStrClave(): string {
        let str = "_clave";
        if (this.estudianteMateriaImpartida) {
            str = this.estudianteMateriaImpartida.getStrClave();
        }
        return str;
    }
    getStrDescripcion(): string {
        let str = "_descripcion";
        if (this.estudianteMateriaImpartida) {
            str = this.estudianteMateriaImpartida.getStrDescripcion();
        }
        return str;
    }
}
