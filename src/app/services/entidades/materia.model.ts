import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {TipoMateria} from '../catalogos/tipo-materia.model';
import {ProgramaDocente} from './programa-docente.model';
import {Archivos} from './archivo.model';
import {PlanEstudio} from './plan-estudio.model';
import {PlantillaEditor} from './plantilla-editor.model';

export class Materia {
    public id: number;
    public clave: string;
    public descripcion: string;
    public creditos2: number;
    public creditos: string;
    public seriacion: Materia;
    public horasDocente: number;
    public horasIndependiente: number;
    public totalHoras: number;
    public modalidad: string;
    public objectivo: string;
    public sesiones: number;
    public archivoTemasDesarrollar: Archivos;
    public archivoProgramaBase: PlantillaEditor;
    public programaDocente: ProgramaDocente;
    public tipoMateria: TipoMateria;
    public estatus: EstatusCatalogo;
    public ultimaActualizacion: string;
    public planesEstudio: Array<PlanEstudio> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.clave = json.clave;
            this.descripcion = json.descripcion;
            this.creditos = json.creditos;
            this.seriacion = new Materia(json.id_seriacion);
            this.horasDocente = json.horas_docente;
            this.horasIndependiente = json.horas_independiente;
            this.totalHoras = json.total_horas;
            this.modalidad = json.modalidad;
            this.objectivo = json.objectivo;
            this.sesiones = json.sesiones;
            this.archivoProgramaBase = new PlantillaEditor(json.id_archivo_programa_base);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.tipoMateria = new TipoMateria(json.id_tipo);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.archivoTemasDesarrollar = new Archivos(json.id_archivo_temas_desarrollar);
            this.ultimaActualizacion = json.ultima_actualizacion;

            if (json.planes_estudio) {
                Object.keys(json.planes_estudio).map(function (planEstudio){
                    return json.planes_estudio[planEstudio]
                }).forEach((planEstudio) => {
                    this.planesEstudio.push(new PlanEstudio(planEstudio.id));
                });
            }
        }
    }
    getStrClave(): string {
        let str = "_clave";
        if (this.clave) {
            str = this.clave;
        }
        return str;
    }
    getStrDescripcion(): string {
        let str = "_descripcion";
        if (this.descripcion) {
            str = this.descripcion;
        }
        return str;
    }
}
