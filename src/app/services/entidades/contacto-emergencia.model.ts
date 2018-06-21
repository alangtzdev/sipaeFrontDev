import {Parentesco} from '../catalogos/parentesco.model';
import {Paises} from '../catalogos/pais.model';
import {Municipio} from '../catalogos/municipio.model';
import {EntidadFederativa} from '../catalogos/entidad-federativa.model';

export class ContactoEmergencia {
    public id: number;
    public padecimiento: string;
    public nombreCompleto: string;
    public calleNumero: string;
    public colonia: string;
    public codigoPostal: string;
    public telefono: string;
    public celular: string;
    public correoElectronico: string;
    public entidadFederativa: EntidadFederativa;
    public municipio: Municipio;
    public pais: Paises;
    public parentesco: Parentesco;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.padecimiento = json.padecimiento;
            this.nombreCompleto = json.nombre_completo;
            this.calleNumero = json.calle_numero;
            this.colonia = json.colonia;
            this.codigoPostal = json.codigo_postal;
            this.telefono = json.telefono;
            this.celular = json.celular;
            this.correoElectronico = json.correo_electronico;
            this.entidadFederativa = new EntidadFederativa(json.id_entidad_federativa);
            this.municipio = new Municipio(json.id_municipio);
            this.pais = new Paises(json.id_pais);
            this.parentesco = new Parentesco(json.id_parentesco);
        }
    }
}
