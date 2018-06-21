import {PlanEstudio} from './plan-estudio.model';

export class ActaCalificacion {
    public id: number;
    public consecutivo : string;
    public planEstudio : PlanEstudio;
    public docencia : boolean;
    public fechaDocencia : string;
    public profesor : boolean;
    public fechaProfesor : string;
    public coordinador : boolean;
    public fechaCoordinador : string;
    public secAcademica : boolean;
    public fechaSecAcademica : string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.consecutivo = json.consecutivo;
            this.planEstudio = new PlanEstudio (json.id_plan_estudio);
            this.docencia = json.docencia;
            this.fechaDocencia = json.fecha_docencia;
            this.profesor = json.profesor;
            this.fechaProfesor = json.fecha_profesor;
            this.coordinador = json.coordinador;
            this.fechaCoordinador = json.fecha_coordinador;
            this.secAcademica = json.sec_academica;
            this.fechaSecAcademica = json.fecha_sec_academica;
        }
    }
}
