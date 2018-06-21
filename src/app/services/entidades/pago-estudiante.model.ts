import {Estudiante} from './estudiante.model';
import {TipoPago} from '../catalogos/tipo-pago.model';
import {FormaPago} from '../catalogos/forma-pago.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import * as moment from 'moment';
import {PeriodoEscolar} from './periodo-escolar.model';

export class PagoEstudiante {
    public id: number;
    public monto: string;
    public comentarios: string;
    public fecha: string;
    public estudiante: Estudiante;
    public tipo: TipoPago;
    public forma: FormaPago;
    public estatus: EstatusCatalogo;
    public periodoActual: PeriodoEscolar;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.monto = json.monto;
            this.comentarios = json.comentarios;
            this.fecha = json.fecha;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.tipo = new TipoPago(json.id_tipo);
            this.forma = new FormaPago(json.id_forma);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.periodoActual = new PeriodoEscolar(json.id_periodo);
        }
    }

    getFechaConFormato(): string {
        return moment (Date.parse(this.fecha)).format('DD/MM/YYYY');
    }
}
