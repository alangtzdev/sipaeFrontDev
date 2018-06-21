import {NucleoAcademicoBasico} from './nucleo-academico-basico.model';
import {Profesor} from './profesor.model';

export class IntegranteNucleoAcademico {
    public id: number;
    public nucleoAcademicoBasico: NucleoAcademicoBasico;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nucleoAcademicoBasico = new NucleoAcademicoBasico(json.id_nucleo_academico);
            this.profesor = new Profesor(json.id_profesor);
        }
    }
}