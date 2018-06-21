import {EntidadFederativa} from '../catalogos/entidad-federativa.model';
import {Paises} from '../catalogos/pais.model';
import {TipoDireccion} from '../catalogos/tipo-direccion.model';
import {Municipio} from '../catalogos/municipio.model';
import {Estudiante} from './estudiante.model';

export class Direccion {
    public id: number;
    public calle: string;
    public colonia: string;
    public codigoPostal: string;
    public telefono: number;
    public estudiante: Estudiante;
    public tipo: TipoDireccion;
    public pais: Paises;
    public entidadFederativa: EntidadFederativa;
    public municipio: Municipio;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calle = json.calle;
            this.colonia = json.colonia;
            this.codigoPostal = json.codigo_postal;
            this.telefono = json.telefono;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.tipo = new TipoDireccion(json.id_tipo);
            this.pais = new Paises(json.id_pais);
            this.entidadFederativa = new EntidadFederativa(json.id_entidad_federativa);
            this.municipio = new Municipio(json.id_municipio);
        }
    }
}
