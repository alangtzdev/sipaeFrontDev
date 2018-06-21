import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {AuthService} from '../../auth/auth.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Http, URLSearchParams, Headers} from '@angular/http';
import * as moment from 'moment';
import {Idle, DEFAULT_INTERRUPTSOURCES} from '@ng-idle/core';
import {Keepalive} from '@ng-idle/keepalive';
import {JwtHelper} from 'angular2-jwt/angular2-jwt';
import {ConfigService} from '../../services/core/config.service';



@Component({
  selector: 'barra-navegacion',
  templateUrl: './barra-navegacion.component.html'
})
export class BarraNavegacionComponent implements OnInit {

  @Input('usuarioLogueado') usuarioLogueado: UsuarioSesion;
  @Input('isOn') isOn: boolean;
  @Output() isOnChange = new EventEmitter();

  private errores: Array<ErrorCatalogo> = [];
  private jwtHelper: JwtHelper = new JwtHelper();

  constructor(private authService: AuthService,
    private _spinnerPrincipal: SpinnerService,
    private usuarioRolService: UsuarioRolService,
    public http: Http,
    private idle: Idle,
    private keepalive: Keepalive) {
    console.log('barra de navegacion');
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
    if (AuthService.isLoggedIn()) {
      this.checkIdleTime();
      this._spinnerPrincipal.start('principal');
      // Seguridad.resetRoles();
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';
      urlSearch.set('criterios', criterio);
      this.usuarioRolService.getListaUsuarioRol(
        this.errores,
        urlSearch
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          paginacionInfoJson.lista.forEach((item) => {
            // Seguridad.setUsuarioRoles(new UsuarioRol(item));
          });
        },
        error => {
            console.error(error);
            console.error(this.errores);
          this._spinnerPrincipal.stop('principal');
        },
        () => {
          this._spinnerPrincipal.stop('principal');
        }
      );
    }
  }

  private checkIdleTime(): any {
    // let date;
    // let tokenExp;
    this.keepalive.onPing.subscribe(() => {
      let token = localStorage.getItem('token');
      if (token) {
        let tokenExp: Date = this.jwtHelper.getTokenExpirationDate(token);
        let date: Date = new Date();
        let tokenDiffExp = Math.abs(tokenExp.getTime() - date.getTime());
        console.log('tokenDiffExxp', tokenDiffExp);
        if (tokenDiffExp <= 120000) {
          console.log('es menor el tokenDiffExxp a 120000');
          let refreshToken = localStorage.getItem('refresh_token');
          this.refreshToken(refreshToken);
        }
      }
    });
    this.keepalive.interval(60);
    // sets an this.idle timeout of 5 seconds, for testing purposes.
    this.idle.setIdle(3600);
    // sets a timeout period of 5 seconds. after 10 seconds of inactivity, the user will be considered timed out.
    this.idle.setTimeout(10);
    // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onIdleStart.subscribe(() => {
    });
    this.idle.onTimeout.subscribe(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
      this.idle.stop();
      this.keepalive.stop();
      location.reload();
      // ConfigService.getRouter().navigateByUrl('/login');
    });
    this.idle.setKeepaliveEnabled(true);
    this.keepalive.start();
    this.idle.watch();
  }

  private refreshToken(refreshToken: string): any{
    console.log('se ejecuta refeshToken');
    let body = JSON.stringify(
      {
        'refresh_token': refreshToken
      });
    let myHeader = new Headers();
    myHeader.append('Content-Type', 'application/json');
    return new Promise((resolve, reject) => {
      this.http.post(
        ConfigService.getUrlBaseAPI() + '/api/token/refresh',
        body,
        { headers: myHeader }
      ).subscribe(
        res => {
          let token = res.json().token;
          let refreshToken = res.json().refresh_token;
          console.log(res.json());
          localStorage.setItem('token', token);
          localStorage.setItem('refresh_token', refreshToken);
        },
        error => {
          console.log('error en refreshToken', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refresh_token');
          sessionStorage.clear();
          this.idle.stop();
          this.keepalive.stop();
          location.reload();
          // ConfigService.getRouter().navigateByUrl('/login');
        }
      );
    });
  }

  ngOnInit() {
  }

  public toggle() {
    console.log('antes', this.isOn);
    this.isOn = !this.isOn;
    this.isOnChange.emit(this.isOn);
    console.log('despues', this.isOn);
  }

  public logout() {
    this.authService.logout();
  }

}
