export class Codes {
  public static get BAD_CREDENTIALS(): string {
    return 'Usuario y/o contrase\u00F1a incorrectos.';
  }

  public static get CONNECTION_ERROR(): string {
    return 'No se pudo establecer comunicaci\u00F3n con el servidor.';
  }

  public static get BAD_REQUEST(): string {
    return 'Parametros Incorrectos';
  }
}
