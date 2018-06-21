import {Paises} from './pais.model';

export class EntidadFederativa {
    public id: number;
    public valor: string;
    public activo: boolean;
    public pais: Paises;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
            this.pais = new Paises(json.id_pais);
        }
    }
}
