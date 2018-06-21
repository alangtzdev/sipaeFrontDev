
export class TipoFolio {
    public id: number;
    public descripcion: string;
    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.descripcion = json.descripcion;
        }
    }
}
