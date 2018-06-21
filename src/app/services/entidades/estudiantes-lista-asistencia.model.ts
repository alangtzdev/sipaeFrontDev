import {Estudiante} from './estudiante.model';
import {AsistenciaInduccion} from './lista-asistencia-induccion.model';

export class EstudianteListaAsistencia {
    public id: number;
    public asitio: boolean;
    public estudiante: Estudiante;
    public listaAsistencia: AsistenciaInduccion;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.asitio = json.asitio;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.listaAsistencia = new AsistenciaInduccion(json.id_lista_asistencia);
        }
    }

    getMatricula(): string{
        var retorno = "_matricula";
        if(this.estudiante){
            retorno = this.estudiante.getMatricula();
        }
        return retorno;
    }

    getProgramaDocente(): string{
        var retorno = "_matricula";
        if(this.estudiante){
            retorno = this.estudiante.getProgramaDocente();
        }
        return retorno;
    }

    getNombreCompleto(): string{
        var retorno = "_matricula";
        if(this.estudiante){
            retorno = this.estudiante.getNombreCompleto();
        }
        return retorno;
    }
}
