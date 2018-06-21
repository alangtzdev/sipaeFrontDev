export class Archivos {
    public id: number;
    public nombre: string;
    public extencion: string;
    public mimeType: string;
    public path: string;
    public md5: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.extencion = json.extencion;
            this.mimeType = json.mime_type;
            this.path = json.path;
            this.md5 = json.md5;
        }
    }
}
