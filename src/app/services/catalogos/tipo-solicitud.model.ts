export class TipoSolicitud {
    public id: number;
    public valor: string;
    public descripcion: string;
    public activo: boolean;
    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.descripcion = json.descripcion;
            this.activo = json.activo;
        }
    }
}
