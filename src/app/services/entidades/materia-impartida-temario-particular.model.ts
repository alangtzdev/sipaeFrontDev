import {TemarioParticular} from  './temario-particular.model';
import {MateriaImpartida} from './materia-impartida.model';
import {Profesor} from './profesor.model';


export class MateriaImpartidaTemarioParticular {
    public temarioParticular: TemarioParticular;
    public materiaImpartida: MateriaImpartida;
    public profesor: Profesor;

    constructor(json: any) {
        if (json) {
            this.temarioParticular =  new TemarioParticular(json.id_temario_particular);
            this.materiaImpartida = new MateriaImpartida(json.id_materia_impartida);
            this.profesor =  new Profesor(json.id_profesor);
        }
    }
}


