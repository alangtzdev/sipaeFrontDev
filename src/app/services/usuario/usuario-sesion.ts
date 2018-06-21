export class UsuarioSesion {
  public id: number;
  public nombreCompleto: string;
  public email: string;
  public ipCliente: string;
  public imagenUrl: string;

  constructor(json: any) {
    if (json) {
      this.id = json.idUsuario;
      this.nombreCompleto = json.nombreCompleto;
      this.email = json.username;
      this.ipCliente = json.ip;
    }
  }

  setImagenUrl(urlImagen: string) {
    this.imagenUrl = urlImagen;
  }
}
