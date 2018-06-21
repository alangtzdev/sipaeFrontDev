import {Promocion} from './promocion.model';
import {ProgramaDocente} from './programa-docente.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {PeriodoEscolar} from './periodo-escolar.model';
export class Convocatoria {
    public id: number;
    public anioPublicacion: string;
    public cierre: string;
    public maximaInscipcion: string;
    public cupoMaximo: number;
    public url: string;
    public fechaResultadosPrimera: string;
    public fechaResultadosSegunda: string;
    public fechaPublicacionResultados: string;
    public ultimaActualizacion: string;
    public programaDocente: ProgramaDocente;
    public estatus: EstatusCatalogo;
    public promocion: Promocion;

    //public idPeriodoEscolar: PeriodoEscolar;
    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.anioPublicacion = json.anio_publicacion;
            this.url = json.url;
            this.cierre = json.cierre;
            this.maximaInscipcion = json.maxima_inscipcion;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.promocion = new Promocion(json.id_promocion);
            this.cupoMaximo = json.cupo_maximo;
            this.fechaResultadosPrimera = json.fecha_resultados_primera;
            this.fechaResultadosSegunda = json.fecha_resultados_segunda;
            this.fechaPublicacionResultados = json.fecha_publicacion_resultados;
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }
}
