import {Archivos} from './archivo.model';
import {TemaInduccion} from '../catalogos/tema-induccion.model';
import {SubtemaInduccion} from '../catalogos/subtema-induccion.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class Induccion {
    public id: number;
    public nombre: string;
    public ultimaActualizacion: string;
    public tema: TemaInduccion;
    public subtema: SubtemaInduccion;
    public estatus: EstatusCatalogo;
    public idArchivo: Archivos;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.tema = new TemaInduccion(json.id_tema);
            this.subtema = new SubtemaInduccion(json.id_subtema);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.idArchivo = new Archivos(json.id_archivo);
        }
    }
}
