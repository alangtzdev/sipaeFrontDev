import {Estudiante} from './estudiante.model';
import {TipoTrabajo} from '../catalogos/tipo-trabajo.model';
import {Paises} from '../catalogos/pais.model';
import {NivelEstudio} from './nivel-estudio.model';
import {Municipio} from '../catalogos/municipio.model';
import {EntidadFederativa} from '../catalogos/entidad-federativa.model';
import {Profesor} from './profesor.model';
import * as moment from 'moment';
import {GradoAcademico} from "../catalogos/grado-academico.model";

export class DatoAcademico {
    public id: number;
    public disciplina: string;
    public universidad: string;
    public grado: string;
    public otroTipoTrabajo: string;
    public numeroCedula: string;
    public facultad: string;
    public promedio: string;
    public fechaTitulacion: string;
    public tutor: string;
    public direccion: string;
    public anioInicio: number;
    public anioFin: number;
    public profesor: Profesor;
    public entidadFederativa: EntidadFederativa;
    public nivelEstudios: NivelEstudio;
    public pais: Paises;
    public tipoTrabajo: TipoTrabajo;
    public estudiante: Estudiante;
    public municipio: Municipio;
    public gradoAcademico: GradoAcademico;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.disciplina = json.disciplina;
            this.universidad = json.universidad;
            this.grado = json.grado;
            this.otroTipoTrabajo = json.otro_tipo_trabajo;
            this.numeroCedula = json.numero_cedula;
            this.facultad = json.facultad;
            this.promedio = json.promedio;
            this.fechaTitulacion = json.fecha_titulacion;
            this.tutor = json.tutor;
            this.direccion = json.direccion;
            this.anioInicio = json.anio_inicio;
            this.anioFin = json.anio_fin;
            this.profesor = new Profesor(json.id_profesor);
            this.entidadFederativa = new EntidadFederativa(json.id_entidad_federativa);
            this.nivelEstudios = new NivelEstudio(json.id_nivel_estudios);
            this.pais = new Paises(json.id_pais);
            this.tipoTrabajo = new TipoTrabajo(json.id_tipo_trabajo);
            this.estudiante = new Estudiante(json.id_estudiante);
            this.municipio = new Municipio(json.id_municipio);
            this.gradoAcademico = new GradoAcademico (json.id_grado_academico);

        }
    }

    getFechaTitulacion(): string {
      return moment (Date.parse(this.fechaTitulacion)).format('DD/MM/YYYY');
    }

/*    getFechaInicio(): string {
      return moment (Date.parse(this.fechaInicio)).format('DD/MM/YYYY');
    }

    getFechaFin(): string {
      return moment (Date.parse(this.fechaFin)).format('DD/MM/YYYY');
    }*/
}
