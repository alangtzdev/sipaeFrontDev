import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Promocion} from './promocion.model';
import * as moment from 'moment';

export class PeriodoEscolar {
    public id: number;
    public anio: string;
    public periodo: string;
    public inicioCurso: string;
    public finCurso: string;
    public mesInicio: number;
    public mesFin: number;
    public limitePago: string;
    public finalizacionEvaluacionProfesor: string;
    public ultimaActualizacion: string;
    public estatus: EstatusCatalogo;
    public promociones: Array<Promocion> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.anio = json.anio;
            this.periodo = json.periodo;
            this.inicioCurso = json.inicio_curso;
            this.finCurso = json.fin_curso;
            this.mesInicio = json.mes_inicio;
            this.mesFin = json.mes_fin;
            this.limitePago = json.limite_pago;
            this.finalizacionEvaluacionProfesor = json.finalizacion_evaluacion_profesor;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.estatus = new EstatusCatalogo(json.id_estatus);

            if(json.promociones) {
                Object.keys(json.promociones).map(function (promocion){
                    return json.promociones[promocion]
                }).forEach((promocion) => {
                   this.promociones.push(new Promocion(promocion.id_promocion));
                });
            }
        }
    }

    getPeriodo(): string {
        let periodo: string;
        periodo = this.anio + '-' + this.periodo;
        switch (this.mesInicio) {
            case 1:
                periodo = periodo + ' (Enero-';
                break;
            case 2:
                periodo = periodo + ' (Febrero-';
                break;
            case 3:
                periodo = periodo + ' (Marzo-';
                break;
            case 4:
                periodo = periodo + ' (Abril-';
                break;
            case 5:
                periodo = periodo + ' (Mayo-';
                break;
            case 6:
                periodo = periodo + ' (Junio-';
                break;
            case 7:
                periodo = periodo + ' (Julio-';
                break;
            case 8:
                periodo = periodo + ' (Agosto-';
                break;
            case 9:
                periodo = periodo + ' (Septiembre-';
                break;
            case 10:
                periodo = periodo + ' (Octubre-';
                break;
            case 11:
                periodo = periodo + ' (Noviembre-';
                break;
            case 12:
                periodo = periodo + ' (Diciembre-';
                break;
        }
        switch (this.mesFin){
            case 1:
                periodo = periodo + 'Enero)';
                break;
            case 2:
                periodo = periodo + 'Febrero)';
                break;
            case 3:
                periodo = periodo + 'Marzo)';
                break;
            case 4:
                periodo = periodo + 'Abril)';
                break;
            case 5:
                periodo = periodo + 'Mayo)';
                break;
            case 6:
                periodo = periodo + 'Junio)';
                break;
            case 7:
                periodo = periodo + 'Julio)';
                break;
            case 8:
                periodo = periodo + 'Agosto)';
                break;
            case 9:
                periodo = periodo + 'Septiembre)';
                break;
            case 10:
                periodo = periodo + 'Octubre)';
                break;
            case 11:
                periodo = periodo + 'Noviembre)';
                break;
            case 12:
                periodo = periodo + 'Diciembre)';
                break;
        }
        return periodo;
    }

    getPeriodoAnioConsecutivo() {
        let periodo: string;
        return periodo = this.anio + '-' + this.periodo;
    }

    getInicioCursoConFormato(): string {
        if (this.inicioCurso) {
            return moment (Date.parse(this.inicioCurso)).format('DD/MM/YYYY');
        }else {
            return '--';
        }
    }
    getFinCursoConFormato(): string {
        if (this.finCurso) {
            return moment (Date.parse(this.finCurso)).format('DD/MM/YYYY');
        }else {
            return '--';
        }
    }
}
