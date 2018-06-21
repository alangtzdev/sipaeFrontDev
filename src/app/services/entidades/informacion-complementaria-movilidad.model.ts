import {MovilidadCurricular} from './movilidad-curricular.model';
import {PeriodoEscolar} from './periodo-escolar.model';

export class InformacionComplementariaMovilidad {
    public id: number;
    public creditos: string;
    public calendario: string;
    public observaciones: string;
    public programaDocenteInstitucion: string;
    public calificacionColsanEquivalencia: number;
    public periodoInstitucion: string;
    public institucionReceptora: string;
    public calendarioInstitucion: string;
    public abreviadoInstitucion: string;
    public profesorUno: string;
    public profesorDos: string;
    public creditosInstitucion: string;
    public periodo: PeriodoEscolar;
    public movilidad: MovilidadCurricular;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.creditos = json.creditos;
            this.calendario = json.calendario;
            this.observaciones = json.observaciones;
            this.programaDocenteInstitucion = json.programa_docente_institucion;
            this.calificacionColsanEquivalencia = json.calificacion_colsan_equivalencia;
            this.periodoInstitucion = json.periodo_institucion;
            this.institucionReceptora = json.institucion_receptora;
            this.calendarioInstitucion = json.calendario_institucion;
            this.abreviadoInstitucion = json.abreviado_institucion;
            this.profesorUno = json.profesor_uno;
            this.profesorDos = json.profesor_dos;
            this.creditosInstitucion = json.creditos_institucion;
            this.periodo = new PeriodoEscolar(json.id_periodo);
            this.movilidad = new MovilidadCurricular(json.id_movilidad);
        }
    }
}
