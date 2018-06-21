import {EntidadFederativa} from './entidad-federativa.model';

export class Municipio {
    public id: number;
    public valor: string;
    public activo: boolean;
    public entidadFederativa: EntidadFederativa;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
            this.entidadFederativa = new EntidadFederativa(json.id_entidad_federativa);
        }
    }
}
