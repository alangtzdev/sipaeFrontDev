import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Http, Headers, RequestOptions, Response} from '@angular/http';
import {tokenNotExpired, JwtHelper} from 'angular2-jwt';
import {UsuarioSesion} from '../services/usuario/usuario-sesion';
import {Router} from '@angular/router';
import {ConfigService} from '../services/core/config.service';
import {SpinnerService} from '../services/spinner/spinner/spinner.service';
import {ErrorCatalogo} from '../services/core/error.model';
import {Usuarios} from '../services/usuario/usuario.model';
import {UsuarioServices} from '../services/usuario/usuario.service';

@Injectable()
export class AuthService {
  private jwtHelper: JwtHelper = new JwtHelper();
  private apiUrl: string = '';
  private usuario: Usuarios;
  redirectUrl: string;

  roles = {
    aspirante: 'ASPIRANTE',
    docencia: 'DOCENCIA',
    coordinador: 'COORDINADOR',
    profesor: 'PROFESOR',
    finanzas: 'FINANZAS',
    estudiante: 'ESTUDIANTE',
    aspiranteMovilidad: 'ASPIRANTE_MOVILIDAD',
    biblioteca: 'BIBLIOTECA',
    utic: 'UTIC',
    rms: 'RMS',
    administrador: 'ADMINISTRADOR',
    showCase: 'SHOWCASE',
    desarrollador: 'DESARROLLADOR',
    estudianteMovilidad: 'MOVILIDAD',
    cambiar: 'SE_DEBE_CAMBIAR_POR_EL_ROL_CORRESPONDIENTE',
    secretariaAcademica: 'SECRETARIA_ACADEMICA'
  };

  constructor(private _http: Http,
              private router: Router,
              private usuarioService: UsuarioServices,
              private spinnerService: SpinnerService) {
    this.apiUrl = ConfigService.getUrlBaseAPI();
    let usuarioLogueado: UsuarioSesion = this.getUsuarioLogueado();
    if (usuarioLogueado) {
      let errores: Array<ErrorCatalogo> = [];
      let idSpinner = 'getUsuarioAuthService';
      this.spinnerService.start(idSpinner);
      this.usuarioService.getEntidadUsuario(usuarioLogueado.id, errores).subscribe(
        response => {
          this.usuario = new Usuarios(response.json());
        },
        error => {
          this.spinnerService.stop(idSpinner);
        },
        () => {
          this.spinnerService.stop(idSpinner);
        }
      );
    }
  }

  login(usuario: string, contrasenia: string, endPointLogin: string): Observable<Response> {
    let body = JSON.stringify(
      {
        'username': usuario,
        'password': contrasenia
      });
    let headers = new Headers({'Content-Type': 'application/json'});
    let options = new RequestOptions({headers: headers});
    this._http.post(this.apiUrl + '', body, options);

    return this._http.post(
      this.apiUrl + endPointLogin,
      body,
      options
    ).map(response => response);
  }

  logout(): void {
    this.usuario = undefined;
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  public static isLoggedIn(): boolean {
    let result: boolean = false;
    let token = localStorage.getItem('token');
    if (token || tokenNotExpired('token')) {
      result = true;
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      sessionStorage.clear();
    }
    return result;
  }

  public getUsuarioLogueado(): UsuarioSesion {
    let usuario: UsuarioSesion = null;
    let tokenObject = localStorage.getItem('token');
    if (tokenObject) {
      let token = this.jwtHelper.decodeToken(tokenObject);
      usuario = new UsuarioSesion(token);
      if (this.usuario) {
        usuario.setImagenUrl(this.apiUrl + '/api/v1/imagenperfil/' + this.usuario.foto.id);
      }
    }
    return usuario;
  }

  saveToken(jsonResponse: any) {
    let token = jsonResponse.token;
    let refreshToken = jsonResponse.refresh_token;
    localStorage.setItem('token', token);
    localStorage.setItem('refresh_token', refreshToken);
    console.log(
      this.jwtHelper.decodeToken(token),
      this.jwtHelper.getTokenExpirationDate(token),
      this.jwtHelper.isTokenExpired(token)
    );
    this.actualizarUsuario();
  }

  public hasRol(rol: string): boolean {
    let resultado: boolean = false;
    if (this.usuario) {
      if (this.usuario.rolesString.length > 0) {
        if (this.usuario.rolesString.indexOf(rol) > -1) {
          resultado = true;
        }
      }
    }
    return resultado;
  }

  public hasAnyRol(roles: Array<string>): boolean {
    let resultado: boolean = false;
    if (this.usuario) {
      if (this.usuario.rolesString.length > 0) {
        roles.forEach((rol) => {
          if (this.usuario.rolesString.indexOf(rol) > -1) {
            resultado = true;
          }
        });
      }
    }
    return resultado;
  }

  private actualizarUsuario(): void {
    let usuarioLogueado: UsuarioSesion = this.getUsuarioLogueado();
    if (usuarioLogueado) {
      let errores: Array<ErrorCatalogo> = [];
      let idSpinner = 'getUsuarioAuthService';
      this.spinnerService.start(idSpinner);
      this.usuarioService.getEntidadUsuario(usuarioLogueado.id, errores).subscribe(
        response => {
          this.usuario = new Usuarios(response.json());
        },
        error => {
          this.spinnerService.stop(idSpinner);
        },
        () => {
          this.spinnerService.stop(idSpinner);
        }
      );
    }
  }
}
