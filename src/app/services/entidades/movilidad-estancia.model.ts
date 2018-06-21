import {Convenio} from './convenio.model';
import {Institucion} from './institucion.model';

export class MovilidadEstancia {
    public id: number;
    public estancia: string;
    public fechaInicio: string;
    public fechaFin: string;
    public convenio: Convenio;
    public institucion: Institucion;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estancia = json.estancia;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.convenio = new Convenio(json.id_convenio);
            this.institucion = new Institucion(json.id_institucion);
        }
    }
}
