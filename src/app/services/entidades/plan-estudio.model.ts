import {ProgramaDocente} from './programa-docente.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Archivos} from './archivo.model';
import {Materia} from "./materia.model";

export class PlanEstudio {
    public id: number;
    public clave: string;
    public descripcion: string;
    public fechaAprobacion: string;
    public anioInicio: string;
    public anioFin: string;
    public modalidad: string;
    public duracionCiclo: string;
    public objectivos: string;
    public perfilEgresado: string;
    public horasDocente: number;
    public horasIndependiente: number;
    public numeroAsignaturas: number;
    public sumaCreditos: number;
    public creditosTesis: number;
    public totalCreditos: number;
    public minimaAprobatoria: number;
    public programaDocente: ProgramaDocente;
    public estatus: EstatusCatalogo;
    public archivoCertificado: Archivos;
    public archivoDictamen: Archivos;
    public archivoEstructura: Archivos;
    public archivoEvaluacion: Archivos;
    public archivoMapa: Archivos;
    public ultimaActualizacion: string;
    public materias: Array<Materia> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.clave = json.clave;
            this.descripcion = json.descripcion;
            this.fechaAprobacion = json.fecha_aprobacion;
            this.anioInicio = json.anio_inicio;
            this.anioFin = json.anio_fin;
            this.modalidad = json.modalidad;
            this.duracionCiclo = json.duracion_ciclo;
            this.objectivos = json.objectivos;
            this.perfilEgresado = json.perfil_egresado;
            this.horasDocente = json.horas_docente;
            this.horasIndependiente = json.horas_independiente;
            this.numeroAsignaturas = json.numero_asignaturas;
            this.sumaCreditos = json.suma_creditos;
            this.creditosTesis = json.creditos_tesis;
            this.totalCreditos = json.total_creditos;
            this.minimaAprobatoria = json.minima_aprobatoria;
            /*this.programaDocente = ProgramaDocente;
            this.estatus = EstatusCatalogo;
            this.archivoCertificado = Archivo;
            this.archivoDictamen = Archivo;
            this.archivoEstructura = Archivo;
            this.archivoEvaluacion = Archivo;
            this.archivoMapa = Archivo;*/
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.archivoCertificado = new Archivos(json.id_archivo_certificado);
            this.archivoDictamen = new Archivos(json.id_archivo_dictamen);
            this.archivoEstructura = new Archivos(json.id_archivo_estructura);
            this.archivoEvaluacion = new Archivos(json.id_archivo_evaluacion);
            this.archivoMapa = new Archivos(json.id_archivo_mapa);
            this.ultimaActualizacion = json.ultima_actualizacion;

            if (json.materias) {
                Object.keys(json.materias).map(function (materia){
                    return json.materias[materia]
                }).forEach((materia) => {
                    this.materias.push(new Materia(materia.id_materia));
                });
            }
        }
    }
}
