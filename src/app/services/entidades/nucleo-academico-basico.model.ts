import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {ProgramaDocente} from './programa-docente.model';
import {Profesor} from "./profesor.model";

export class NucleoAcademicoBasico {
    public id: number;
    public aprobacion: string;
    public estatus: EstatusCatalogo;
    public programaDocente: ProgramaDocente;
    public ultimaActualizacion: string;
    public integrantesNab: Array<Profesor> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.aprobacion = json.aprobacion;
            this.estatus = new EstatusCatalogo (json.id_estatus);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.ultimaActualizacion = json.ultima_actualizacion;

            if(json.integrantes) {
                Object.keys(json.integrantes).map(function (profesor){
                    return json.integrantes[profesor]
                }).forEach((profesor) => {
                    this.integrantesNab.push(new Profesor(profesor.id_profesor));
                });
            }
        }
    }

    getProfesores(): string {
        let profesores = "";
        if(this.integrantesNab) {
            this.integrantesNab.forEach((item) => {
                profesores = profesores + item.getNombreCompleto() +  ", ";
            });
        }
        return profesores;
    }
}
