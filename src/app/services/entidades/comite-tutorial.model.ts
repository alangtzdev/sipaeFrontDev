import {Profesor} from "./profesor.model";
import {MiembroJurado} from "./miembro-jurado.model";
import {Estudiante} from "./estudiante.model";
import {ExamenGrado} from "./examen-grado.model";

export class ComiteTutorial {
    public id: number;
    public tituloTesis: string;
    public profersorLectorDos: Profesor;
    public profesorLectorUno: Profesor;
    public estudiante: Estudiante;
    public examenGrado: ExamenGrado;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.tituloTesis = json.titulo_tesis;
            this.profersorLectorDos = new Profesor(json.id_profersor_lector_dos);
            this.profesorLectorUno = new Profesor(json.id_profesor_lector_uno);
            this.estudiante = new Estudiante (json.id_estudiante);
            this.examenGrado = new ExamenGrado (json.id_examen_grado);
        }
    }
}
