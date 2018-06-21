import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {ClasificacionProfesor} from '../catalogos/clasificacion-profesor.model';
import {TipoProfesor} from '../catalogos/tipo-profesor.model';
import {Sexo} from '../catalogos/sexo.model';
import {Sni} from '../catalogos/sni.model';
import {GradoAcademico} from '../catalogos/grado-academico.model';
import {EstadoCivil} from '../catalogos/estado-civil.model';
import {TipoTiempo} from '../catalogos/tipo-tiempo.model';
import {ExperienciaProfesional} from './experiencia-profesional.model';
import {DatoAcademico} from './dato-academico.model';
import {Paises} from '../catalogos/pais.model';
import {ClasificacionEspecificaProfesor} from '../catalogos/clasificacion-especifica-profesor.model';
import {EntidadFederativa} from '../catalogos/entidad-federativa.model';
import {Usuarios} from '../usuario/usuario.model';
import {TipoClasificacionProfesor} from '../catalogos/tipo-clasificacion-profesor.model';
import * as moment from 'moment';

export class Profesor {
    public id: number;
    public nombre: string;
    public telefono: string;
    public email: string;
    public celular: string;
    public datosAcademicos: string;
    public experiencia: string;
    public fechaNacimiento: string;
    public curp: string;
    public fechaIngreso: string;
    public activo: boolean;
    public ciudad: string;
    public municipio: string;
    public colonia: string;
    public codigoPostal: string;
    public numExterior: string;
    public numInterior: string;
    public primerApellido: string;
    public segundoApellido: string;
    public discapacidad: boolean;
    public tipoTiempo: TipoTiempo;
    public estatus: EstatusCatalogo;
    public clasificacionProfesor: ClasificacionProfesor;
    public tipo: TipoClasificacionProfesor;
    public sexo: Sexo;
    public sni: Sni;
    public gradoAcademico: GradoAcademico;
    public estadoCivil: EstadoCivil;
    public clasificacionEspecifica: ClasificacionEspecificaProfesor;
    public experienciaProfesional: ExperienciaProfesional;
    public datosAcademico: DatoAcademico;
    public pais: Paises;
    public ultimaActualizacion: string;
    public entidadFedetativa: EntidadFederativa;
    public lugarNacimiento: string;
    public usuario: Usuarios;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.telefono = json.telefono;
            this.email = json.email;
            this.celular = json.celular;
            this.datosAcademicos = json.datosAcademicos;
            this.experiencia = json.experiencia;
            this.fechaNacimiento = json.fecha_nacimiento;
            this.curp = json.curp;
            this.fechaIngreso = json.fecha_ingreso;
            this.activo = json.activo;
            this.ciudad = json.ciudad;
            this.municipio = json.municipio;
            this.colonia = json.colonia;
            this.codigoPostal = json.codigo_postal;
            this.numExterior = json.num_exterior;
            this.numInterior = json.num_interior;
            this.primerApellido = json.primer_apellido;
            this.segundoApellido = json.segundo_apellido;
            this.discapacidad = json.discapacidad;
            this.tipoTiempo = new TipoTiempo(json.id_tipo_tiempo_trabajo);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.clasificacionProfesor = new ClasificacionProfesor(json.id_clasificacion);
            this.tipo = new TipoProfesor(json.id_tipo);
            this.sexo = new Sexo(json.id_sexo);
            this.sni = new Sni(json.id_sni);
            this.gradoAcademico = new GradoAcademico(json.id_grado_academico);
            this.estadoCivil = new EstadoCivil(json.id_estado_civil);
            this.experienciaProfesional = new ExperienciaProfesional(json.id_experiencia_profesional);
            this.datosAcademico = new DatoAcademico(json.id_dato_academico);
            this.pais = new Paises(json.id_pais);
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.clasificacionEspecifica = new ClasificacionEspecificaProfesor(json.id_clasificacion_especifica);
            this.entidadFedetativa = new EntidadFederativa (json.id_entidad_federativa);
            this.lugarNacimiento = json.lugar_nacimiento;
            this.usuario = new Usuarios(json.id_usuario);
        }
    }

    getNombreCompleto(): string {
        let retorno = ' ';
        if (this.nombre) {
            if (this.segundoApellido) {
                retorno = this.primerApellido + ' ' +
                    this.segundoApellido + ' ' + this.nombre;
            } else {
                retorno = this.primerApellido + ' ' + this.nombre;
            }
        }
        return retorno;
    }

    getFechaIngresoConFormato(): string {
        return moment (Date.parse(this.fechaIngreso)).format('DD/MM/YYYY');
    }

    getFechaNacimientoConFormato(): string {
        return moment (Date.parse(this.fechaNacimiento)).format('DD/MM/YYYY');
    }

  getNombreCompletoTitulo(): string {
    let retorno = ' ';

    switch (this.gradoAcademico.id) {
      case 1:
        // Doctorado
        if (this.sexo.id === 1) {
          retorno = 'Dr. ';
        } else {
          retorno = 'Dra. ';
        }
        break;
      case 2:
        // Maestría
        if (this.sexo.id === 2) {
          retorno = 'Mtro. ';
        } else {
          retorno = 'Mtra. ';
        }
        break;
      case 4:
        // Licenciatura
        retorno = 'Lic. ';
        break;
      default:
        break;
    }

    if (this.nombre) {
      if (this.segundoApellido) {
        retorno += this.primerApellido + ' ' +
          this.segundoApellido + ' ' + this.nombre;
      } else {
        retorno += this.primerApellido + ' ' + this.nombre;
      }
    }
    return retorno;
  }
}
