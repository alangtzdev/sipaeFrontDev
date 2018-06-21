import {Catalogo} from './catalogo.model';

export class EstatusCatalogo {
    public id: number;
    public valor: string;
    public activo: boolean;
    public catalogo: Catalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
            this.catalogo = new Catalogo(json.id_catalogo);
        }
    }
}
