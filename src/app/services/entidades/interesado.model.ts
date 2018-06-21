
import {Paises} from "../catalogos/pais.model";
import {ProgramaDocente} from "./programa-docente.model";
import {Promocion} from "./promocion.model";
import {EstatusCatalogo} from "../catalogos/estatus-catalogo.model";
import {MedioDifusion} from "../catalogos/medios-difusion.model";

export class Interesado {
  public id: number;
  public nombre: string;
  public primerApellido: string;
  public segundoApellido: string;
  public email: string;
  public telefono: string;
  public celular: string;
  public institucion: string;
  public comentarios: string;
  public otroMedio: string;
  public fechaSolicitud: string;
  public pais: Paises;
  public idProgramaDocente: ProgramaDocente;
  public idPromocion: Promocion;
  public estatus: EstatusCatalogo;
  public medioDifucion: MedioDifusion;

  constructor(json: any) {
    if (json) {
      this.id = json.id;
      this.nombre = json.nombre;
      this.primerApellido = json.primer_apellido;
      this.segundoApellido = json.segundo_apellido;
      this.email = json.email;
      this.telefono = json.telefono;
      this.celular = json.celular;
      this.institucion = json.institucion;
      this.comentarios = json.comentarios;
      this.otroMedio = json.otro_medio;
      this.fechaSolicitud = json.fecha_solicitud;
      this.pais = new Paises(json.id_pais);
      this.idProgramaDocente = new ProgramaDocente(json.id_programa_docente);
      this.idPromocion = new Promocion(json.id_promocion);
      this.estatus = new EstatusCatalogo(json.id_estatus);
      this.medioDifucion = new MedioDifusion(json.id_medio_difucion);
    }
  }
}
