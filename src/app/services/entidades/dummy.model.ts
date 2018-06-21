import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Archivos} from './archivo.model';

export class Dummy {
    public id: number;
    public nombre: string;
    public primerApellido: string;
    public segundoApellido: string;
    public activo: boolean;
    public estatusCatalogo: EstatusCatalogo;
    public archivo: Archivos;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.primerApellido = json.primer_apellido;
            this.segundoApellido = json.segundo_apellido;
            this.activo = json.activo;
            this.estatusCatalogo = new EstatusCatalogo(json.id_estatus);
            this.archivo = new Archivos(json.id_archivo_fotografia);
        }
    }
}
