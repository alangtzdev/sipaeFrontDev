import {Paises} from '../catalogos/pais.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {MedioDifusion} from '../catalogos/medios-difusion.model';
import {ProgramaDocente} from './programa-docente.model';
import {Archivos} from './archivo.model';
import * as moment from 'moment';


export class InteresadoMovilidadExterna {
    public id: number;
    public nombre: string;
    public primerApellido: string;
    public segundoApellido: string;
    public email: string;
    public casa: string;
    public celular: string;
    public otroMedioDifucion: string;
    public comentario: string;
    public institucionProcedencia: string;
    public periodoCursa: string;
    public programaCursa: string;
    public contactoInstitucion: string;
    public comentariosCoordinador: string;
    public fechaRegistro: string;
    public programaDocente: ProgramaDocente;
    public pais: Paises;
    public estatus: EstatusCatalogo;
    public medioDifusion: MedioDifusion;
    public archivoCarta: Archivos;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.primerApellido = json.primer_apellido;
            this.segundoApellido = json.segundo_apellido;
            this.email = json.email;
            this.casa = json.casa;
            this.celular = json.celular;
            this.otroMedioDifucion = json.otro_medio_difucion;
            this.comentario = json.comentario;
            this.institucionProcedencia = json.institucion_procedencia;
            this.periodoCursa = json.periodo_cursa;
            this.programaCursa = json.programa_cursa;
            this.contactoInstitucion = json.contacto_institucion;
            this.comentariosCoordinador = json.comentarios_coordinador;
            this.fechaRegistro = json.fecha_registro;
            this.pais = new Paises(json.id_pais);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.medioDifusion = new MedioDifusion(json.id_medio_difusion);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.archivoCarta = new Archivos(json.id_archivo_carta);
        }
    }

    getNombreCompleto(): string {
        var retorno = '_nombreCompleto';
        if (this.segundoApellido) {
            retorno =  this.primerApellido + ' ' +
                this.segundoApellido + ' ' + this.nombre;
        } else {
            retorno = this.primerApellido  + ' ' + this.nombre;
        }
        return retorno;
    }

    getFechaRegistroConFormato(): string {
        return moment (Date.parse(this.fechaRegistro)).format('DD/MM/YYYY');
    }
}
