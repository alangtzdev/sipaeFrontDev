import {Estudiante} from './estudiante.model';
import {TipoDocumento} from '../catalogos/tipo-documento.model';

export class EstudianteDocumentoEntregado {
    public id: number;
    public tipoDocumento: TipoDocumento;
    public entregado: boolean;
    public comentarios: string;
    public estudiante: Estudiante;


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.entregado = json.entregado;
            this.comentarios = json.comentarios;
            this.estudiante = new Estudiante(json.id_estudiante);
            this.tipoDocumento = new TipoDocumento(json.id_tipo_documento);
        }
    }
}
