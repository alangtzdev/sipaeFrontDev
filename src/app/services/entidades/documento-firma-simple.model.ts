export class DocumentoFirmaSimple {
    public id: number;
    public fecha: string;
    public hora: string;
    public ip: string;
    public hostname: string;
    public firmas_simple: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.fecha = json.fecha;
            this.hora = json.hora;
            this.ip = json.ip;
            this.hostname = json.hostname;
            this.firmas_simple = json.firmas_simple;
        }
    }
}
