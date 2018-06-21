import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {AspiranteLgac} from './aspirante-lgac.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class AspiranteLgacService extends GlobalServices {
    private pluralUrl: string = '/api/v1/aspiranteslgac';
    private singularUrl: string = '/api/v1/aspirantelgac/';
    static instance: AspiranteLgacService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (AspiranteLgacService.instance == null) {
            AspiranteLgacService.instance = new AspiranteLgacService(http);
        }
        return AspiranteLgacService.instance;
    }

    putAspiranteLgac(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
       return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postAspiranteLgac(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getAspiranteLgac(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): AspiranteLgac {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaAspiranteLgacPag(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<AspiranteLgac> = [];

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

    deleteAspiranteLgac(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

}
