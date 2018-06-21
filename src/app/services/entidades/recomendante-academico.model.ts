import {Estudiante} from './estudiante.model';

export class RecomendanteAcademico {
    public id: number;
    public nombre: string;
    public institucion: string;
    public telefono: string;
    public estudiante: Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.institucion = json.institucion;
            this.telefono = json.telefono;
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }
}
