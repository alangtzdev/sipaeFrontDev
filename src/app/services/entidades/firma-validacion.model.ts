import {DocumentoFirmaSimple} from './documento-firma-simple.model';
import {EstudianteMateriaImpartida} from './estudiante-materia-impartida.model';
export class FirmaValidacion {
    public id: number;
    public documentoFirmaSimple : DocumentoFirmaSimple;
    public estudianteMateriaImpartida : EstudianteMateriaImpartida;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.documentoFirmaSimple = new DocumentoFirmaSimple (json.id_documento_firma_simple);
            this.estudianteMateriaImpartida =
                new EstudianteMateriaImpartida (json.id_estudiante_materia_impartida);
        }
    }
}
