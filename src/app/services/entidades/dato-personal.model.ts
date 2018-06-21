import {Nacionalidad} from '../catalogos/nacionalidad.model';
import {Sexo} from '../catalogos/sexo.model';
import {EstadoCivil} from '../catalogos/estado-civil.model';
import {Paises} from '../catalogos/pais.model';
import * as moment from 'moment';

export class DatoPersonal {
    public id: number;
    public nombre: string;
    public edad: number;
    public curp: string;
    public primerApellido: string;
    public segundoApellido: string;
    public fechaNacimiento: string;
    public numId: string;
    public lugarNacimiento: string;
    public numeroHijos: number;
    public celular: string;
    public oficina: string;
    public email: string;
    public discapacidad: string;
    public rfc: string;
    public sexo: Sexo;
    public paisOrigen: Paises;
    public estadoCivil: EstadoCivil;
    public nacionalidad: Nacionalidad;
    public nacionalidadPadreMadre: Nacionalidad;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.edad = json.edad;
            this.curp = json.curp;
            this.primerApellido = json.primer_apellido;
            this.segundoApellido = json.segundo_apellido;
            this.fechaNacimiento = json.fecha_nacimiento;
            this.numId = json.num_id;
            this.lugarNacimiento = json.lugar_nacimiento;
            this.numeroHijos = json.numero_hijos;
            this.celular = json.celular;
            this.oficina = json.oficina;
            this.email = json.email;
            this.discapacidad = json.discapacidad;
            this.rfc = json.rfc;
            this.sexo = new Sexo(json.id_sexo);
            this.paisOrigen = new Paises(json.id_pais_origen);
            this.estadoCivil = new EstadoCivil(json.id_estado_civil);
            this.nacionalidad = new Nacionalidad(json.id_nacionalidad);
            this.nacionalidadPadreMadre = new Nacionalidad(json.id_nacionalidad_padre_madre);
        }
    }

    getNombreCompleto(): string {
        var retorno = '_nombreCompleto';
        if (this.segundoApellido) {
            retorno =  this.primerApellido + ' ' +
                this.segundoApellido + ' ' + this.nombre;
        } else {
            retorno = this.primerApellido  + ' ' + this.nombre;
        }
        return retorno;
    }

    getFechaNacimientoFormato(): string {
        return moment (Date.parse(this.fechaNacimiento)).format('DD/MM/YYYY');
    }

}
