import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ClaveDgp} from './clave-dgp.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ClaveDgpService extends GlobalServices {
    private pluralUrl: string = '/api/v1/clavesdgp';
    private singularUrl: string = '/api/v1/clavedgp/';
    static instance: ClaveDgpService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ClaveDgpService.instance == null) {
            ClaveDgpService.instance = new ClaveDgpService(http);
        }
        return ClaveDgpService.instance;
    }

    putClaveDgp(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postClaveDgp(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadClaveDgp(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let ClaveDgp: ClaveDgp;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getClaveDgp(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let datoPersonal: ClaveDgp;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaClaveDgp(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<ClaveDgp>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ClaveDgp> = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (!paginacion) {
            urlParameter.set('limit', '0');
            urlParameter.set('pagina', '1');
        }
        urlRequest = urlRequest + urlParameter.toString();
        this.getElement(urlRequest, errores).subscribe(
            response => {
                let paginacionInfoJson = response.json();
                let paginasArray: Array<number> = [];
                for (var i = 0; i < paginacionInfoJson.paginas; i++) {
                    paginasArray.push(i);
                }
                paginacionInfo = new PaginacionInfo(
                    paginacionInfoJson.registrosTotales,
                    paginasArray.length,
                    paginacionInfoJson.paginaActual,
                    paginacionInfoJson.registrosPagina
                );
                paginacionInfoJson.lista.forEach((item) => {
                    listaEstatus.push(new ClaveDgp(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectClaveDgp(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}

