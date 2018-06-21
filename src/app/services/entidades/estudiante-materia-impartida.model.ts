import {Estudiante} from './estudiante.model';
import {EstudianteMovilidadExterna} from './estudiante-movilidad-externa.model';
import {MateriaImpartida} from './materia-impartida.model';
import {TipoMovilidad} from '../catalogos/tipo-movilidad.model';
import {Boleta} from './boleta.model';
import * as  moment from 'moment';

export class EstudianteMateriaImpartida {
    public id: number;
    public calificacionOrdinaria : number;
    public calificacionIncompleta : number;
    public huboCalifIncompleta : boolean;
    public calificacionRevision : number;
    public asistencia : boolean;
    public comentarioAsistencia : string;
    public fechaCaptura : string;
    public fechaCulminacion : string;
    public tipoMovilidad: TipoMovilidad;
    public estudiante : Estudiante;
    public estudianteMovilidadExterna : EstudianteMovilidadExterna;
    public materiaImpartida : MateriaImpartida;
    public materiaInterprograma : MateriaImpartida;
    public interprograma : boolean;
    public boleta : Boleta;
    public ultimaActualizacion : string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.calificacionOrdinaria = json.calificacion_ordinaria;
            this.calificacionIncompleta = json.calificacion_incompleta;
            this.huboCalifIncompleta = json.hubo_calif_incompleta;
            this.calificacionRevision = json.calificacion_revision;
            this.asistencia = json.asistencia;
            this.comentarioAsistencia = json.comentario_asistencia;
            this.fechaCaptura = json.fecha_captura;
            this.fechaCulminacion = json.fecha_culminacion;
            this.tipoMovilidad = new TipoMovilidad (json.id_tipo_movilidad);
            this.estudiante = new Estudiante (json.id_estudiante);
            this.estudianteMovilidadExterna = new EstudianteMovilidadExterna (
                json.id_estudiante_movilidad_externa
            );
            this.materiaImpartida = new MateriaImpartida (json.id_materia_impartida);
            this.materiaInterprograma = new MateriaImpartida (json.id_materia_interprograma);
            this.interprograma = json.interprograma;
            this.boleta = new Boleta (json.id_boleta);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }

  getFechaConFormato(): string {
      if (this.fechaCulminacion) {
          return moment (Date.parse(this.fechaCulminacion)).format('DD/MM/YYYY');
      }else {
          return '--';
      }

  }
  getStrClave(): string {
      let str = "_clave";
      if (this.materiaImpartida) {
          str = this.materiaImpartida.getStrClave();
      }
      return str;
  }
  getStrDescripcion(): string {
      let str = "_descripcion";
      if (this.materiaImpartida) {
          str = this.materiaImpartida.getStrDescripcion();
      }
      return str;
  }

  getCalificacionConLetra(): string {
      let str = '';
      if (this.calificacionRevision) {
          switch (this.calificacionRevision) {
              case 0:
                  str = 'Cero';
                  break;
              case 100:
                  str = 'Cien';
                  break;
              default:
                  str = this.decenas(this.calificacionRevision);
                  break;
          }
      }else {
          switch (this.calificacionOrdinaria) {
              case 0:
                  str = 'Cero';
                  break;
              case 100:
                  str = 'Cien';
                  break;
              default:
                  str = this.decenas(this.calificacionOrdinaria);
                  break;
          }
      }
      return str;
  }

  mostrarCalificacionCero(): void {
    let calificacion;
    if (this.calificacionOrdinaria != undefined) {
      calificacion = this.calificacionOrdinaria;
    } else {
      calificacion = '---';
    }
    return calificacion;
  }

    private unidades(num, decenas: boolean): string {
        if (decenas) {
            switch (num) {
                case 1: return 'uno';
                case 2: return 'dos';
                case 3: return 'tres';
                case 4: return 'cuatro';
                case 5: return 'cinco';
                case 6: return 'seis';
                case 7: return 'siete';
                case 8: return 'ocho';
                case 9: return 'nueve';
            }
        }else {
            switch (num) {
                case 1: return 'Uno';
                case 2: return 'Dos';
                case 3: return 'Tres';
                case 4: return 'Cuatro';
                case 5: return 'Cinco';
                case 6: return 'Seis';
                case 7: return 'Siete';
                case 8: return 'Ocho';
                case 9: return 'Nueve';
            }
        }
    }

    private decenas(num): string {
        let decena = Math.floor(num / 10);
        let dec = decena * 10;
        let unidad = Math.floor(num - dec);

        switch (decena) {
            case 1:
                switch (unidad) {
                    case 0: return 'Diez';
                    case 1: return 'Once';
                    case 2: return 'Doce';
                    case 3: return 'Trece';
                    case 4: return 'Catorce';
                    case 5: return 'Quince';
                    default: return 'Dieci' + this.unidades(unidad, true);
                }
            case 2:
                switch (unidad) {
                    case 0: return 'Veinte';
                    default: return 'Veinti' + this.unidades(unidad, true);
                }
            case 3: return this.decenasY('Treinta', unidad);
            case 4: return this.decenasY('Cuarenta', unidad);
            case 5: return this.decenasY('Cincuenta', unidad);
            case 6: return this.decenasY('Sesenta', unidad);
            case 7: return this.decenasY('Setenta', unidad);
            case 8: return this.decenasY('Ochenta', unidad);
            case 9: return this.decenasY('Noventa', unidad);
            case 0: return this.unidades(unidad, false);
        }
    }

    private decenasY(decenas, num): string {
        if (num > 0)
            return decenas + ' y ' + this.unidades(num, true);
        return decenas;
    }
}
