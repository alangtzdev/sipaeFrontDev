import {MedioDifusion} from '../catalogos/medios-difusion.model';

export class InformacionComplementaria {
    public id: number;
    public actividades: string;
    public medioDifusion: MedioDifusion;
    public otro: string;
    public nombreAnteproyecto: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.actividades = json.actividades;
            this.medioDifusion = new MedioDifusion(json.id_medio_difusion);
            this.otro = json.otro;
            this.nombreAnteproyecto = json.nombre_anteproyecto;
        }
    }
}
