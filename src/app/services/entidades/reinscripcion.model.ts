import {PeriodoEscolar} from './periodo-escolar.model';
import {Promocion} from './promocion.model';

export class Reinscripcion {
    public id: number;
    public estudiantesProcesados : number;
    public totalEstudiantes : number;
    public fechaReincripcion : string;
    public periodoActual: PeriodoEscolar;
    public periodoNuevo : PeriodoEscolar;
    public promocion : Promocion;
    public ultima: string;
    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estudiantesProcesados = json.estudiantes_procesados;
            this.totalEstudiantes = json.total_estudiantes;
            this.fechaReincripcion = json.fecha_reinscripcion;
            this.periodoActual = new PeriodoEscolar (json.id_periodo_actual);
            this.periodoNuevo = new PeriodoEscolar (json.id_periodo_nuevo);
            this.promocion = new Promocion (json.id_promocion);
            this.ultima = json.ultima_actualizacion;
        }
    }
}
