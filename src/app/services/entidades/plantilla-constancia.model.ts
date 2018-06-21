import {TipoConstancia} from '../catalogos/tipo-constancia.model';

export class PlantillaConstancia {
    public id: number;
    public titulo: string;
    public contenido: string;
    public tipoConstancia: TipoConstancia;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.titulo = json.titulo;
            this.contenido = json.contenido;
            this.tipoConstancia = new TipoConstancia(json.id_tipo_constancia);
        }
    }
}
