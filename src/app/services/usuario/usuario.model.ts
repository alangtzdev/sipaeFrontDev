import {Paises} from '../catalogos/pais.model';
import {ProgramaDocente} from '../entidades/programa-docente.model';
import {Archivos} from '../entidades/archivo.model';
import {Roles} from '../entidades/rol.model';
import {UsuarioRoles} from './usuario-rol.model';

 export class Usuarios {
    public id: number;
    public nombre: string;
    public primerApellido: string;
    public segundoApellido: string;
    public email: string;
    public ldap: boolean;
    public password: string;
    public activo: boolean;
    public username: string;
    public pais: Paises;
    public programaDocente: ProgramaDocente;
    public firma: Archivos;
    public foto: Archivos;
    public roles: Array<Roles> = [];
    public rolesString: Array<String> = [];


    constructor(json: any) {
        if (json) {
            this.id = json.id;
            this.nombre = json.nombre;
            this.primerApellido = json.primer_apellido;
            this.segundoApellido = json.segundo_apellido;
            this.email = json.email;
            this.password = json.password;
            this.activo = json.enabled;
            this.username = json.username;
            this.ldap = json.ldap;
            this.pais = new Paises(json.id_pais);
            this.programaDocente = new ProgramaDocente(json.id_programa_docente);
            this.firma = new Archivos(json.id_firma);
            this.foto = new Archivos(json.id_foto);
            if (json.rolesdb) {
                var arr = Object.keys(json.rolesdb).map(function(k) { return json.rolesdb[k]; });
                arr.forEach((item) => {
                    let usuariosRol: UsuarioRoles = new UsuarioRoles(item);
                    this.roles.push(usuariosRol.rol);
                    this.rolesString.push(usuariosRol.rol.nombre);
                });
            }
        }
    }

    getNombreCompleto(): string {
        return this.nombre + ' ' + this.primerApellido + ' ' + this.segundoApellido;
    }

    getRolesString(): string {
        let stringRoles = this.rolesString.join(', ');
        return stringRoles;
    }


}
