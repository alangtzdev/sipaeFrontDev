import {Component, OnInit, Input} from "@angular/core";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {URLSearchParams} from "@angular/http";
import {UsuarioRolService} from "../../services/usuario/usuario-rol.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {AuthService} from "../../auth/auth.service";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";

@Component({
  selector: 'perfil',
  templateUrl: './perfil.component.html'
})
export class PerfilComponent implements OnInit {

  @Input('usuarioLogueado') usuarioLogueado: UsuarioSesion;
  //roles: string = 'Rol Administrador';
  roles: string;
  errores: Array<ErrorCatalogo> = [];
  usuarioRol: UsuarioRoles;

  constructor(private usuarioRolService: UsuarioRolService,
              private authService: AuthService) {
    let urlSearch: URLSearchParams = new URLSearchParams();
    //console.log(this.usuarioLogueado);
    let usuarioLogueado: UsuarioSesion = this.authService.getUsuarioLogueado();
    let criterio = 'idUsuario~' + usuarioLogueado.id + ':IGUAL';
    urlSearch.set('criterios', criterio);
    this.usuarioRolService.getListaUsuarioRol(
      this.errores,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        paginacionInfoJson.lista.forEach((item) => {
          this.usuarioRol = new UsuarioRoles(item);
          if(this.roles){
            this.roles = this.roles +', '+this.usuarioRol.rol.descripcion;
          }else {
            this.roles=this.usuarioRol.rol.descripcion;
          }
        });
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
          console.error(this.errores);
        }*/
      }
    );
  }

  ngOnInit() {
  }

}
