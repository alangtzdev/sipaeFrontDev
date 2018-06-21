import { error } from 'util';
import {Component, ViewContainerRef} from '@angular/core';
import {UsuarioSesion} from './services/usuario/usuario-sesion';
import {AuthService} from './auth/auth.service';
import {Observable} from 'rxjs';
import {ErrorCatalogo} from './services/core/error.model';
import {JwtHelper} from 'angular2-jwt/angular2-jwt';
import {SpinnerService} from './services/spinner/spinner/spinner.service';
import {Router} from '@angular/router';
import {Http, URLSearchParams, Headers} from '@angular/http';
import {UsuarioRolService} from './services/usuario/usuario-rol.service';
import {ConfigService} from './services/core/config.service';
import * as moment from 'moment';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  // TODO
  usuarioLogueado: UsuarioSesion = null;
  public isOn: boolean = false;
  private viewContainerRef: ViewContainerRef;
  private bandera: boolean = true;

  errores: Array<ErrorCatalogo> = [];
  jwtHelper: JwtHelper = new JwtHelper();

  constructor(
    viewContainerRef: ViewContainerRef,
    private authService: AuthService,
    // agregado
    private _spinnerPrincipal: SpinnerService,
    public router: Router,
    public http: Http,
    private usuarioRolService: UsuarioRolService,
    private idle: Idle,
    private keepalive: Keepalive ) {

    this.usuarioLogueado = this.authService.getUsuarioLogueado();
  }

  public changeState(event): void {
    this.isOn = !this.isOn;
  }

}
