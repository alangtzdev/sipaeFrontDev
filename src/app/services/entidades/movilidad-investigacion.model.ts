import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {Paises} from '../catalogos/pais.model';
import {Convenio} from './convenio.model';
import {Estudiante} from './estudiante.model';
import {Institucion} from './institucion.model';

export class MovilidadInvestigacion {
    public id: number;
    public estatus: EstatusCatalogo;
    public pais: Paises;
    public convenio: Convenio;
    public estudiante: Estudiante;
    public institucion: Institucion;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.pais = new Paises(json.id_pais);
            this.convenio = new Convenio(json.id_convenio);
            this.estudiante = new Estudiante(json.id_estudiante);
            this.institucion = new Institucion(json.id_institucion);
        }
    }
}
