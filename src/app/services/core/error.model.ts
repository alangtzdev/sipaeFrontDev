export class ErrorCatalogo {

    private mensajesTraducibles = [
        {mensaje: 'Not Found', traduccion: 'No se encontro el registro'}
    ];
    constructor(
        public tipo: string,
        public closable: boolean,
        public codigo: number,
        public mensaje: string,
        public urlRequest: string) {
        this.mensaje = 'Error Request: ' + urlRequest + ' (' + codigo + '): ' +
            this.traducirMensaje(mensaje);
    }

    private traducirMensaje(mensaje: string): string {
        let mensajeTraducido = mensaje;
        this.mensajesTraducibles.forEach(
            mensajeTraducible => {
                if (mensajeTraducible.mensaje === mensaje) {
                    mensajeTraducido = mensajeTraducible.traduccion;
                }
            }
        );
        return mensajeTraducido;
    };
}
