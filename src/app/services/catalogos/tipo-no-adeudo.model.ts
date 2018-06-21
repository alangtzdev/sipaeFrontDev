export class TipoNoAdeudo {
    public id: number;
    public valor: string;
    public activo: boolean;
    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
        }
    }
}
