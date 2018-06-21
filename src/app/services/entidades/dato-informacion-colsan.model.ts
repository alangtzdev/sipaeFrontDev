import {Municipio} from "../catalogos/municipio.model";
import {EntidadFederativa} from "../catalogos/entidad-federativa.model";
import {EstatusCatalogo} from "../catalogos/estatus-catalogo.model";
import {Archivos} from './archivo.model';

export class DatoInformacionColsan {

    public id: number;
    public claveInstitucion : string;
    public claveEscuela : string;
    public nombreInstitucion : string;
    public vialidadPrincipal : string;
    public numeroExterior : string;
    public numeroInterior : string;
    public codigoPostal : number;
    public vialidadDerecha : string;
    public vialidadIzquierda : string;
    public vialidadPosterior : string;
    public asentamientoHumano : string;
    public localidad : string;
    public telefono : string;
    public extencion : string;
    public extencionFax : string;
    public fax : string;
    public dependenciaNormativa : string;
    public nombreInstitucionPertenece : string;
    public nombreDirectorEscuela : string;
    public paginaWeb : string;
    public email : string;
    public municipio : Municipio;
    public entidadFederativa : EntidadFederativa;
    public ultimaActualizacion : string;
    public archivoCredencialFrontalMov: Archivos;
    public archivoCredencialReversaMov: Archivos;
    public estatus : EstatusCatalogo;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.claveInstitucion = json.clave_institucion;
            this.claveEscuela = json.clave_escuela;
            this.nombreInstitucion = json.nombre_institucion;
            this.vialidadPrincipal = json.vialidad_principal;
            this.numeroExterior = json.numero_exterior;
            this.numeroInterior = json.numero_interior;
            this.codigoPostal = json.codigo_postal;
            this.vialidadDerecha = json.vialidad_derecha;
            this.vialidadIzquierda = json.vialidad_izquierda;
            this.vialidadPosterior = json.vialidad_posterior;
            this.asentamientoHumano = json.asentamiento_humano;
            this.localidad = json.localidad;
            this.telefono = json.telefono;
            this.extencion = json.extencion;
            this.fax = json.fax;
            this.extencionFax = json.extencion_fax;
            this.dependenciaNormativa = json.dependencia_normativa;
            this.nombreInstitucionPertenece = json. nombre_institucion_pertenece;
            this.nombreDirectorEscuela = json.nombre_director_escuela;
            this.paginaWeb = json.pagina_web;
            this.email = json.email;
            this.municipio = new Municipio (json.id_municipio);
            this.entidadFederativa = new EntidadFederativa (json.id_entidad_federativa);
            this.ultimaActualizacion = json.ultima_actualizacion;
            this.archivoCredencialFrontalMov = new Archivos (json.id_archivo_credencial_frontal_mov);
            this.archivoCredencialReversaMov = new Archivos (json.id_archivo_credencial_reversa_mov);
            this.estatus = new EstatusCatalogo (json.id_estatus);
        }
    }

    getDireccion(): string {
        if (this.vialidadPrincipal) {
            return this.vialidadPrincipal + ' ' + this.numeroExterior + ' ' + this.localidad;
        }
    }
}
