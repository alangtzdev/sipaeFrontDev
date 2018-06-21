import {Usuarios} from '../usuario/usuario.model';

export class FirmaSimple {
    public id: number;
    public usuario: Usuarios;
    public firma: string;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.usuario = new Usuarios(json.id_usuario);
            this.firma = json.firma;
        }
    }
}
