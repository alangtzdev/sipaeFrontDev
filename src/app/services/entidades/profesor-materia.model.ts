import {Profesor} from "./profesor.model";
import {MateriaImpartida} from "./materia-impartida.model";
import {EstatusCatalogo} from "../catalogos/estatus-catalogo.model";

export class ProfesorMateria {
    public id: number;
    public horasAsignadas : string;
    public profesor : Profesor;
    public materiaImpartida : MateriaImpartida;
    public titular : boolean;
    public estatus : EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.horasAsignadas = json.horas_asignadas;
            this.profesor = new Profesor (json.id_profesor);
            this.materiaImpartida = new MateriaImpartida (json.id_materia_impartida);
            this.titular = json.titular;
            this.estatus = new EstatusCatalogo (json.id_estatus);

        }
    }
}

