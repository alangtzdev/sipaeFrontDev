import {TipoListaAsistencia} from '../catalogos/tipo-lista-asistencia.model';
import {Sala} from './sala.model';
import * as moment from 'moment';

export class AsistenciaInduccion {
    public id: number;
    public horario: string;
    public tipo: TipoListaAsistencia;
    public sala: Sala;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.horario = json.horario;
            this.tipo = new TipoListaAsistencia(json.id_tipo);
            this.sala = new Sala(json.id_sala);
        }
    }
    getEstatus(): string {
        if (new Date() < new Date(this.horario)) {
            return 'Pendiente';
        }else {
            return 'Realizado';
        }
    }

    obtenerFecha(): string {
        if (this.horario) {
            return moment(this.horario).format('DD/MM/YYYY');
        }
    }

    obtenerHora(): string {
        if (this.horario) {
            return moment(this.horario).format('HH:mm');
        }
    }
}
