export class Nacionalidad {
    public id: number;
    public valor: string;
    public activo: boolean;
    public tipo: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
            this.tipo = json.tipo;
        }
    }
}
