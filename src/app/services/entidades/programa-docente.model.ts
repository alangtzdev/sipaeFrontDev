import {EstatusCatalogo} from '../catalogos/estatus-catalogo.model';
import {NivelEstudio} from './nivel-estudio.model';
import {Archivos} from './archivo.model';


export class ProgramaDocente {
     public id: number;
     public abreviatura: string;
     public nomenclatura: string;
     public descripcion: string;
     public consecutivo: string;
     public claveDgp: string;
     public mesAnioPrimerPeriodo: string;
     public campus: string;
     public modalidad: string;
     public numeroRegistroSege: string;
     public fechaRegistroPnpc: string;
     public numeroReferenciaPnpc: string;
     public requierePago: boolean;
     public colorRgb: string;
     public ultimaActualizacion: string;
     public nivelEstudios: NivelEstudio;
     public archivoCredencialFrontal: Archivos;
     public archivoCredencialReversa: Archivos;
     public estatus: EstatusCatalogo;

     constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.abreviatura = json.abreviatura;
            this.nomenclatura = json.nomenclatura;
            this.descripcion = json.descripcion;
            this.consecutivo = json.consecutivo;
            this.claveDgp = json.clave_dgp;
            this.mesAnioPrimerPeriodo = json.mes_anio_primer_periodo;
            this.campus = json.campus;
            this.modalidad = json.modalidad;
            this.numeroRegistroSege = json.numero_registro_sege;
            this.fechaRegistroPnpc = json.fecha_registro_pnpc;
            this.numeroReferenciaPnpc = json.numero_referencia_pnpc;
            this.requierePago = json.requiere_pago;
            this.colorRgb = json.color_rgb;
            this.nivelEstudios = new NivelEstudio(json.id_nivel_estudios);
            this.archivoCredencialFrontal = new Archivos(json.id_archivo_credencial_frontal);
            this.archivoCredencialReversa = new Archivos(json.id_archivo_credencial_reversa);
            this.estatus = new EstatusCatalogo(json.id_estatus);
            this.ultimaActualizacion = json.ultima_actualizacion;
        }
    }
}
