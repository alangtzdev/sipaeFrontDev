 export class Roles {
    public id: number;
    public nombre: string;
    public descripcion: string;
    public activo: boolean;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.descripcion = json.descripcion;
            this.activo = json.activo;
        }
    }

}
