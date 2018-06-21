import {Usuarios} from './usuario.model';

export class UsuarioLdap {
    public id: number;
    public usernameLdap: string;
    public usuario: Usuarios;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.usernameLdap = json.username_ldap;
            this.usuario = new Usuarios(json.id_usuario);
        }
    }
}
