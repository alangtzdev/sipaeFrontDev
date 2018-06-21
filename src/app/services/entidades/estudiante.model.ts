import {Matricula} from './matricula.model';
import {Archivos} from './archivo.model';
import {FolioSolicitud} from './folio-solicitud.model';
import {Usuarios} from '../usuario/usuario.model';
import {DatoPersonal} from './dato-personal.model';
import {Convocatoria} from './convocatoria.model';
import {Promocion} from './promocion.model';
import {ContactoEmergencia} from './contacto-emergencia.model';
import {InformacionComplementaria} from './informacion-complementaria.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Grupo} from './grupo.model';
import {Lgac} from './lgac.model';
import {PeriodoEscolar} from './periodo-escolar.model';
import * as moment from 'moment';
import {Tutor} from './tutor.model';
import {MateriaImpartida} from './materia-impartida.model';

export class Estudiante {
    public id: number;
    public actividadActual: string;
    public numPeriodoActual: number;
    public exposicionMotivos: string;
    public valido: boolean;
    public terminos: boolean;
    public terminosPlan: boolean;
    public terminosPrograma: boolean;
    public foliosSolicitud: FolioSolicitud;
    public idArchivoFotografia: Archivos;
    public idArchivoFirma: Archivos;
    public idArchivoAutoriza: Archivos;
    public usuario: Usuarios;
    public datosPersonales: DatoPersonal;
    public contactoEmergencia: ContactoEmergencia;
    public complementaria: InformacionComplementaria;
    public estatus: EstatusCatalogo;
    public grupo: Grupo;
    public convocatoria: Convocatoria;
    public promocion: Promocion;
    public matricula: Matricula;
    public periodoActual: PeriodoEscolar;
    public lgac: Lgac;
    public ultimaActualizacion: string;
    public tutor: Tutor;
    public materiasImpartidas: Array<MateriaImpartida> = [];

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.actividadActual = json.actividad_actual;
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.valido = json.valido;
            this.terminos = json.terminos;
            this.terminosPlan = json.terminos_plan;
            this.terminosPrograma = json.terminos_programa;
            this.promocion = new Promocion(json.id_promocion);
            this.foliosSolicitud = new FolioSolicitud(json.id_folio_solicitud);
            this.idArchivoFotografia = new Archivos(json.id_archivo_fotografia);
            this.idArchivoFirma = new Archivos(json.id_archivo_firma);
            this.idArchivoAutoriza = new Archivos(json.id_archivo_autoriza);
            this.convocatoria = new Convocatoria(json.id_convocatoria);
            this.matricula = new Matricula(json.id_matricula);
            this.usuario = new Usuarios(json.id_usuario);
            this.datosPersonales = new DatoPersonal(json.id_datos_personales);
            this.contactoEmergencia = new ContactoEmergencia(json.id_contacto_emergencia);
            this.complementaria = new InformacionComplementaria(json.id_complementaria);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.grupo = new Grupo(json.id_grupo);
            this.lgac = new Lgac(json.id_lgac);
            this.periodoActual = new PeriodoEscolar(json.id_periodo_actual);
            this.numPeriodoActual = json.num_periodo_actual;
            this.exposicionMotivos = json.exposicion_motivos;
            this.tutor = new Tutor(json.id_tutor);

            if (json.materias_impartidas) {
                Object.keys(json.materias_impartidas).map(function (materia){
                    return json.materias_impartidas[materia];
                }).forEach((materia) => {
                    this.materiasImpartidas.push(
                        new MateriaImpartida(materia.id_materia_impartida)
                    );
                });
            }
        }
    }

    getMatricula(): string {
        var retorno = '_matricula';
        if (this.foliosSolicitud && this.promocion) {
            retorno = this.promocion.abreviatura?this.promocion.abreviatura: '' +
            this.foliosSolicitud.anio?this.foliosSolicitud.anio:'' +
            this.foliosSolicitud.consecutivo?this.foliosSolicitud.consecutivo:'';
        }
        return retorno;
    }

    getProgramaDocente(): string {
        var retorno = this.promocion.programaDocente.descripcion;
        return retorno;
    }

    getNombreCompleto(): string {
        var retorno = '_nombreCompleto';
        if (this.datosPersonales && this.datosPersonales.segundoApellido) {
            retorno =  this.datosPersonales.primerApellido + ' ' +
                this.datosPersonales.segundoApellido + ' ' + this.datosPersonales.nombre;
        } else {
            retorno = this.datosPersonales.primerApellido  + ' ' + this.datosPersonales.nombre;
        }
        return retorno;
    }

    getNombreCompletoOpcional(): string {
        var retorno = '---';
        if (this.datosPersonales && this.datosPersonales.segundoApellido) {
            retorno =  this.datosPersonales.primerApellido + ' ' +
                this.datosPersonales.segundoApellido + ' ' + this.datosPersonales.nombre;
        } else if (this.datosPersonales && this.datosPersonales.primerApellido) {
            retorno = this.datosPersonales.primerApellido  + ' ' + this.datosPersonales.nombre;
        }
        return retorno;
    }

    getPeriodo(): string {
        var retorno = '_periodo';
        if (this.periodoActual) {
            retorno =  this.periodoActual.getPeriodo();
        }
        return retorno;
    }

    getFechaUltimaActualizacionConFormato(): string {
        return moment (Date.parse(this.ultimaActualizacion)).format('DD/MM/YYYY');
    }

    getNombreApellidos(): string {
        var retorno = '_nombreApellidos';
        if (this.datosPersonales && this.datosPersonales.segundoApellido) {
            retorno =  this.datosPersonales.nombre
            + ' '
            + this.datosPersonales.primerApellido
            + ' '
            + this.datosPersonales.segundoApellido;
        } else {
            retorno =  this.datosPersonales.nombre + ' ' + this.datosPersonales.primerApellido;
        }
        return retorno;
    }
}
