import {Archivos} from './archivo.model';
import {GestionInstitucional} from "./gestion-institucional.model";

export class GestionDocumentosInstitucional {
    public id: number;
    public gestionInstitucional: GestionInstitucional;
    public archivoSoporte: Archivos;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.gestionInstitucional = new GestionInstitucional(json.id_gestion_institucional);
            this.archivoSoporte = new Archivos(json.id_archivo_soporte);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }
}
