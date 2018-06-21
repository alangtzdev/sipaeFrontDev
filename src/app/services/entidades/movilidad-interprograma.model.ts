import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {ProgramaDocente} from './programa-docente.model';
import {Estudiante} from './estudiante.model';
import {Archivos} from './archivo.model';
import {PeriodoEscolar} from './periodo-escolar.model';
import {MateriaImpartida} from './materia-impartida.model';
import {TipoDocumento} from '../catalogos/tipo-documento.model';
import {EstudianteMateriaImpartida} from './estudiante-materia-impartida.model';

export class MovilidadInterprograma {
    public id: number;
    public comentarios: string;
    public programaDocenteCursar: ProgramaDocente;
    public estatus: EstatusCatalogo;
    public estatusDirector: EstatusCatalogo;
    public materiaCambiar: EstudianteMateriaImpartida;
    public materiaCursar: MateriaImpartida;
    public estudiante: Estudiante;
    public archivosCartaMotivo: Archivos;
    public periodoEscolar: PeriodoEscolar;
    public archivo: Archivos;
    public tipoDocumento: TipoDocumento;
    public estatusCoordinadorMovilidad: EstatusCatalogo;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.comentarios = json.comentarios;
            this.programaDocenteCursar = new ProgramaDocente(json.id_programa_docente_cursar);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.estatusDirector = new EstatusCatalogo(json.id_estatus_director);
            this.materiaCambiar = new EstudianteMateriaImpartida(json.id_materia_cambiar);
            this.materiaCursar = new MateriaImpartida(json.id_materia_cursar);
            this.estudiante = new Estudiante(json.id_estudiante);
            this.archivosCartaMotivo = new Archivos(json.id_archivo_carta_motivo);
            this.periodoEscolar = new PeriodoEscolar(json.id_periodo_escolar);
            this.archivo = new Archivos(json.id_archivo);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
            this.estatusCoordinadorMovilidad = new EstatusCatalogo(json.id_estatus_movilidad);
        }
    }
}
