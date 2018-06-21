import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {ProgramaDocente} from './programa-docente.model';
import {PeriodoEscolar} from './periodo-escolar.model';
import {PlanEstudio} from './plan-estudio.model';
import {Lgac} from './lgac.model';
import {PromocionPeriodoEscolar} from './promocion-periodo-escolar.model';

export class Promocion {
    public id: number;
    public abreviatura: string;
    public consecutivo: string;
    public planEstudiosInicio: string;
    public planEstudiosFin: string;
    public cohorte: string;
    public estatus: EstatusCatalogo;
    public programaDocente: ProgramaDocente;
    public idPeriodoEscolarInicio: PeriodoEscolar;
    public idPeriodoEscolarFin: PeriodoEscolar;
    public idPlanEstudios: PlanEstudio;
    public ultimaActualizacion: string;
    public periodos: Array<PeriodoEscolar> = [];
    public promocionPeriodo: Array<PromocionPeriodoEscolar> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.abreviatura = json.abreviatura;
            this.consecutivo = json.consecutivo;
            this.planEstudiosInicio = json.plan_estudios_inicio;
            this.planEstudiosFin = json.plan_estudios_fin;
            this.cohorte = json.cohorte;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.idPeriodoEscolarInicio = new PeriodoEscolar(json.id_periodo_escolar_inicio);
            this.idPeriodoEscolarFin = new PeriodoEscolar(json.id_periodo_escolar_fin);
            this.idPlanEstudios = new PlanEstudio(json.id_plan_estudios);
            this.ultimaActualizacion = json.ultima_actualizacion;

            if (json.periodos) {
                Object.keys(json.periodos).map(function (periodo){
                    return json.periodos[periodo];
                }).forEach((periodo) => {
                    this.periodos.push(new PeriodoEscolar(periodo.id_periodo_escolar));
                });
            }

            if (json.periodos) {
                var arr = Object.keys(json.periodos).map(function(k) {
                    return json.periodos[k];
                });
                arr.forEach((item) => {
                    this.promocionPeriodo.push(new PromocionPeriodoEscolar(item));
                });
            }
        }
    }

    // Clave de promocion con año de inicio y de fin
    getClavePromocion(): string {
        if (this.abreviatura){
            return this.abreviatura + '-' + this.consecutivo + '° (' +
                this.idPeriodoEscolarInicio.anio + '-' + this.idPeriodoEscolarFin.anio  + ')';
        } else {
            return '-----';
        }

    }

    getAbreviatura(): string{
        if (this.abreviatura) {
            return this.abreviatura + '-' + this.consecutivo;
        } else {
            return 'Sin Asignar';
        }
    }

/*    getNumeroPeriodo(): string {
        return this.periodos.map( function(periodo) {
            return numPeriodo = periodo.numSemestre ;
        });
    }*/
}
