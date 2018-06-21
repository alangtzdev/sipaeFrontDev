import {TemaInduccion} from './tema-induccion.model';
export class SubtemaInduccion {
    public id: number;
    public valor: string;
    public activo: boolean;
    public idTemaInduccion: TemaInduccion;
    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
            this.idTemaInduccion = new TemaInduccion(json.id_tema_induccion);
        }
    }
}
