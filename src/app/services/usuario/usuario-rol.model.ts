import {Roles} from '../entidades/rol.model';
import {Usuarios} from './usuario.model';

export class UsuarioRoles {
    public id: number;
    public rol: Roles;
    public usuario: Usuarios;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.rol = new Roles(json.id_rol);
            this.usuario = new Usuarios(json.id_usuario);
        }
    }

}
