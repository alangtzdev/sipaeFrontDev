import { Component, OnInit, Input } from '@angular/core';
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'menu',
  templateUrl: './menu.component.html'
})
export class MenuComponent implements OnInit {

  @Input('usuarioLogueado') usuarioLogueado: UsuarioSesion;

  constructor(private authService: AuthService) {
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
  }

  ngOnInit() {
  }

  subirPantalla(): void {
    document.body.scrollTop = 0 ;
  }

}
