import {InvestigadorAnfitrion} from './investigador-anfitrion.model';
import {DatoPersonal} from './dato-personal.model';
import {Usuarios} from '../usuario/usuario.model';
import {DatoAcademicoMovilidadExterna} from './dato-academico-movilidad-externa.model';
import {ContactoEmergencia} from './contacto-emergencia.model';
import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Promocion} from './promocion.model';
import * as moment from 'moment';
import {Matricula} from './matricula.model';
import {ProgramaDocente} from './programa-docente.model';
import {PeriodoEscolar} from './periodo-escolar.model';
export class EstudianteMovilidadExterna {
    public id: number;
    public estatus: EstatusCatalogo;
    public datosPersonales: DatoPersonal;
    public usuario: Usuarios;
    public datosAcademicos: DatoAcademicoMovilidadExterna;
    public investigadorAnfitrion: InvestigadorAnfitrion;
    public ultimaActualizacion: string;
    public matricula: Matricula;
    public idPromocion: Promocion;
    public contactoEmergencia: ContactoEmergencia;
    public idProgramaDocente : ProgramaDocente;
    public numPeriodoActual: number;
    public idPeriodoActual: PeriodoEscolar;

    constructor(json: any) {
      if (json) {
        this.id = json.id;
        this.estatus = new EstatusCatalogo(json.id_estatus);
        this.datosPersonales = new DatoPersonal(json.id_datos_personales);
        this.usuario = new Usuarios(json.id_usuario);
        this.datosAcademicos = new DatoAcademicoMovilidadExterna(json.id_datos_academicos);
        this.investigadorAnfitrion = new InvestigadorAnfitrion(json.id_investigador_anfitrion);
        this.ultimaActualizacion = json.ultima_actualizacion;
        this.matricula = new Matricula(json.id_matricula);
        this.idPromocion = new Promocion (json.id_promocion);
        this.contactoEmergencia = new ContactoEmergencia(json.id_contacto_emergencia);
        this.idProgramaDocente = new ProgramaDocente (json.id_programa_docente);
        this.idPeriodoActual = new PeriodoEscolar(json.id_periodo_actual);
        this.numPeriodoActual = json.num_periodo_actual;
      }
    }

    getUltimaActualizacionFormato(): string {
      let str = '---';
      if (this.ultimaActualizacion) {
        str = moment(this.ultimaActualizacion).format('DD/MM/YYYY');
      }
      return str;
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

    getMatricula(): string {
      var retorno = '_matricula';
      if (this.matricula) {
        if(this.matricula.matriculaCompleta){
          retorno = this.matricula.matriculaCompleta;
        }
      }
      return retorno;
    }
}
