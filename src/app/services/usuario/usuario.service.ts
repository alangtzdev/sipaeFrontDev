import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {GlobalServices} from '../entidades/global.service';
import {Http, URLSearchParams} from '@angular/http';
import {ErrorCatalogo} from '../core/error.model';
import {ConfigService} from '../core/config.service';
import {Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {Usuarios} from './usuario.model';
import {ItemSelects} from '../core/item-select.model';
import {PaginacionInfo} from '../core/pagination-info';

@Injectable()
export class UsuarioServices extends GlobalServices {
    private pluralUrl: string = '/api/v1/usuarios';
    private singularUrl: string = '/api/v1/usuario/';
    private resetPassURL: string = '/api/v1/passworreset';
    static instance: UsuarioServices = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (UsuarioServices.instance == null) {
            UsuarioServices.instance = new UsuarioServices(http);
        }
        return UsuarioServices.instance;
    }

    putUsuario(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postUsuario(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario); /*.subscribe(
            () => alert('Se registro correctamente'),
            console.error,
            () => {
            }
        );*/
    }
    getEntidadUsuario(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let usuario: Usuarios;
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }
    getListaUsuario(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (!paginacion) {
            urlParameter.set('limit', '0');
            urlParameter.set('pagina', '1');
        }
        urlRequest = urlRequest + urlParameter.toString();
        return this.getElement(urlRequest, errores);
    }

    getSelectUsuario(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaUsuariosMovilidad(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Usuarios> = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (!paginacion) {
            urlParameter.set('limit', '0');
            urlParameter.set('pagina', '1');
        }
        urlRequest = urlRequest + urlParameter.toString();
        return this.getElement(urlRequest, errores);
    }
    getSelectInteresadoMovilidadExterna(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

  resetPassUsuario(
    jsonFormulario,
    errores: Array<ErrorCatalogo>
  ): any {
    let urlRequest = ConfigService.getUrlBaseAPI() + this.resetPassURL;
    return this.postElement(urlRequest, errores, jsonFormulario);
  }

}
