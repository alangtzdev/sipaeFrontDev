import {TipoClasificacionProfesor} from './tipo-clasificacion-profesor.model';
export class ClasificacionEspecificaProfesor {
    public id: number;
    public valor: string;
    public activo: boolean;
    public tipoClasificacionProfesor: TipoClasificacionProfesor;
    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.valor = json.valor;
            this.activo = json.activo;
            this.tipoClasificacionProfesor = new TipoClasificacionProfesor(
                json.id_tipo_clasificacion);
        }
    }
}
