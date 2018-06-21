import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class BitacoraService extends GlobalServices {
    private pluralUrl: string = '/api/v1/bitacora';
    static instance: BitacoraService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (BitacoraService.instance == null) {
            BitacoraService.instance = new BitacoraService(http);
        }
        return BitacoraService.instance;
    }
    getBitacora(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<any> = [];

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
}
