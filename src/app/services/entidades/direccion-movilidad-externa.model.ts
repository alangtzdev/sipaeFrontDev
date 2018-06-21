import {EntidadFederativa} from '../catalogos/entidad-federativa.model';
import {Paises} from '../catalogos/pais.model';
import {TipoDireccion} from '../catalogos/tipo-direccion.model';
import {Municipio} from '../catalogos/municipio.model';
import {Estudiante} from './estudiante.model';

export class DireccionMovilidadExterna {
    public id: number;
    public calle: string;
    public colonia: string;
    public codigoPostal: string;
    public telefono: number;
    public estudiante: Estudiante;
    public municipio: Municipio;
    public tipo: TipoDireccion;
    public pais: Paises;
    public entidadFederativa: EntidadFederativa;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calle = json.calle;
            this.colonia = json.colonia;
            this.codigoPostal = json.codigoPostal;
            this.telefono = json.telefono;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.municipio = new Municipio(json.id_municipio);
            this.tipo = new TipoDireccion(json.id_tipo);
            this.pais = new Paises(json.id_pais);
            this.entidadFederativa = new EntidadFederativa(json.id_entidad_federativa);
        }
    }
}
