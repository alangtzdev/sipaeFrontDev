import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Estudiante} from './estudiante.model';
import {Paises} from '../catalogos/pais.model';
import {Convenio} from './convenio.model';
import {TipoMovilidad} from '../catalogos/tipo-movilidad.model';
import {EstudianteMateriaImpartida} from './estudiante-materia-impartida.model';
import {DocumentoMovilidadCurricular} from './documento-movilidad-curricular.model';
import * as moment from 'moment';
import {Materia} from './materia.model';

export class MovilidadCurricular {
    public id: number;
    public materiaCursar: string;
    public nombreContacto: string;
    public puestoContacto: string;
    public institucionInteres: string;
    public estancia: string;
    public trabajoCampo: string;
    public lugar: string;
    public fechaInicio: string;
    public fechaFin: string;
    public comentario: string;
    public comentarioTutor: string;
    public estatus: EstatusCatalogo;
    public estudiante: Estudiante;
    public pais: Paises;
    public convenio: Convenio;
    public tipoMovilidad: TipoMovilidad;
    public estudianteMateriaImpartida: EstudianteMateriaImpartida;
    public documentoMovilidadCurricular: DocumentoMovilidadCurricular;
    public materia: Materia;
    public estatusTutor: EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.materiaCursar = json.materia_cursar;
            this.nombreContacto = json.nombre_contacto;
            this.puestoContacto = json.puesto_contacto;
            this.institucionInteres = json.institucion_interes;
            this.estancia = json.estancia;
            this.trabajoCampo = json.trabajo_campo;
            this.lugar = json.lugar;
            this.fechaInicio = json.fecha_inicio;
            this.fechaFin = json.fecha_fin;
            this.comentario = json.comentario;
            this.comentarioTutor = json.comentario_tutor;
            this.estatus = new EstatusCatalogo (json.id_estatus);
            this.estudiante = new Estudiante (json.id_estudiante);
            this.pais = new Paises(json.id_pais);
            this.convenio = new Convenio (json.id_convenio);
            this.tipoMovilidad = new TipoMovilidad(json.id_tipo_movilidad);
            this.estudianteMateriaImpartida = new EstudianteMateriaImpartida(
                json.id_estudiante_materia_impartida
            );
            this.documentoMovilidadCurricular = new DocumentoMovilidadCurricular(
                json.id_documento_movilidad_curricular
            );
            this.materia = new Materia(json.id_materia);
            this.estatusTutor = new EstatusCatalogo (json.id_estatus_tutor);
        }
    }

    getFechaInicioFormato(): string {
        if(this.fechaInicio){
            return moment (Date.parse(this.fechaInicio)).format('DD/MM/YYYY');
        }else {
            return "No aplica";
        }
    }

    getFechaFinFormato(): string {
        if(this.fechaFin){
            return moment (Date.parse(this.fechaFin)).format('DD/MM/YYYY');
        }else {
            return "No aplica";
        }
    }
}
