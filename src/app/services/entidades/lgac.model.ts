import {ProgramaDocente} from './programa-docente.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';

export class Lgac {
    public id: number;
    public denominacion: string;
    public fechaInicio: string;
    public fechaFin: string;
    public tematica: string;
    public estatus: EstatusCatalogo;
    public programaDocente: ProgramaDocente;
    public ultimaActualizacion: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.denominacion = json.denominacion;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.tematica = json.tematica;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }
}
