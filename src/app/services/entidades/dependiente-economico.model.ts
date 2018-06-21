import {Sexo} from '../catalogos/sexo.model';
import {Parentesco} from '../catalogos/parentesco.model';
import {Estudiante} from './estudiante.model';
import * as moment from 'moment';

export class DependienteEconomico {
    public id: number;
    public nombreCompleto: string;
    public fechaNacimiento: string;
    public otroParentesco: string;
    public sexo: Sexo;
    public parentesco: Parentesco;
    public estudiante: Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombreCompleto = json.nombre_completo;
            this.fechaNacimiento = json.fecha_nacimiento;
            this.otroParentesco = json.otro_parentesco;
            this.sexo = new Sexo(json.id_sexo);
            this.parentesco = new Parentesco(json.id_parentesco);
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }

    getFechaNacimientoConFormato(): string {
      return moment (Date.parse(this.fechaNacimiento)).format('DD/MM/YYYY');
    }
}
