import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {TipoConstancia} from '../catalogos/tipo-constancia.model';
import {Estudiante} from "./estudiante.model";

export class SolicitudConstancia {
    public id: number;
    public dirigida: string;
    public proposito: string;
    public consideraciones: string;
    public fechaCreacion: string;
    public constancia: string;
    public estatus: EstatusCatalogo;
    public tipoConstancia: TipoConstancia;
    public estudiante : Estudiante;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.dirigida = json.dirigida;
            this.proposito = json.proposito;
            this.consideraciones = json.consideraciones;
            this.fechaCreacion = json.fecha_creacion;
            this.constancia = json.constancia;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.tipoConstancia = new TipoConstancia(json.id_tipo_constancia);
            this.estudiante = new Estudiante(json.id_estudiante);
        }
    }
}
