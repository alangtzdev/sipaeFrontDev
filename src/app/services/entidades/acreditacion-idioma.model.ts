import {Estudiante} from './estudiante.model';
import {Archivos} from './archivo.model';
import {Idioma} from './idioma.model';
import {NivelIdioma} from '../catalogos/nivel-idioma.model';
import * as moment from 'moment';

export class AcreditacionIdioma {
    public id: number;
    public calificacionEvaluacionDiagnostica: string;
    public puntosCertificado: number;
    public fechaVencimiento: string;
    public fechaEvaluacionDiagnostica: string;
    public documentoAcreditacion: string;
    public aplicaVencimiento: boolean;
    public acreditado: boolean;
    public observaciones: string;
    public estudiante: Estudiante;
    public idioma: Idioma;
    public nivelIdioma: NivelIdioma;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calificacionEvaluacionDiagnostica = json.calificacion_evaluacion_diagnostica;
            this.puntosCertificado = json.puntos_certificado;
            this.fechaVencimiento = json.fecha_vencimiento;
            this.fechaEvaluacionDiagnostica = json.fecha_evaluacion_diagnostica;
            this.documentoAcreditacion = json.documento_acreditacion;
            this.aplicaVencimiento = json.aplica_vencimiento;
            this.acreditado = json.acreditado;
            this.observaciones = json.observaciones;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.idioma = new Idioma(json.id_idioma);
            this.nivelIdioma = new NivelIdioma(json.id_nivel_idioma);
        }
    }

    getFechaFormato(): string {
      if (this.fechaVencimiento) {
        return moment (Date.parse(this.fechaVencimiento)).format('DD/MM/YYYY');
      } else {
        return 'N/A';
      }
    }
}
