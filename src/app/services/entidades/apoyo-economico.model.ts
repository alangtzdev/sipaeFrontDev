import {Estudiante} from './estudiante.model';
import {Beca} from './beca.model';
import {FuenteApoyo} from '../catalogos/fuente-apoyo.model';

export class ApoyoEconomico {
    public id: number;
    public conceptoApoyo: string = '';
    public cantidad: string = '';
    public fecha: string;
    public numeroBeca: string;
    public numeroApoyo: string;
    public cvuConacyt: string;
    public observaciones: string = '';
    public estudiante: Estudiante;
    public beca: Beca;
    public fuenteApoyo: FuenteApoyo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.fuenteApoyo = json.fuente_apoyo;
            this.conceptoApoyo = json.concepto_apoyo;
            this.cantidad = json.cantidad;
            this.fecha = json.fecha;
            this.numeroBeca = json.numero_beca;
            this.numeroApoyo = json.numero_apoyo;
            this.cvuConacyt = json.cvu_conacyt;
            this.observaciones = json.observaciones;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.beca = new Beca(json.id_beca);
            this.fuenteApoyo = new FuenteApoyo(json.id_fuente_apoyo);
        }
    }
}
