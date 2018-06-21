import {Usuarios} from "../usuario/usuario.model";
import {Puesto} from "../catalogos/puesto.model";

export class Puestos {

    public id: number;
    public usuario: Usuarios;
    public puesto: Puesto;

    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.usuario = new Usuarios (json.id_usuario);
            this.puesto = new  Puesto (json.id_puesto);
        }
    }
}
