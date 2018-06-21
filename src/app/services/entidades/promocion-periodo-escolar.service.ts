import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {PromocionPeriodoEscolar} from './promocion-periodo-escolar.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class PromocionPeriodoEscolarService extends GlobalServices {
    private pluralUrl: string = '/api/v1/promocionesperiodoescolar';
    private singularUrl: string = '/api/v1/promocionperiodoescolar/';
    static instance: PromocionPeriodoEscolarService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (PromocionPeriodoEscolarService.instance == null) {
            PromocionPeriodoEscolarService.instance = new PromocionPeriodoEscolarService(http);
        }
        return PromocionPeriodoEscolarService.instance;
    }

    putPromocionPeriodoEscolar(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postPromocionPeriodoEscolar(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadPromocionPeriodoEscolar(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let PromocionPeriodoEscolar: PromocionPeriodoEscolar;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getPromocionPeriodoEscolar(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let PromocionPeriodoEscolar:PromocionPeriodoEscolar;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaPromocionPeriodoEscolar(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<PromocionPeriodoEscolar>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<PromocionPeriodoEscolar> = [];
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
                    listaEstatus.push(new PromocionPeriodoEscolar(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaPromocionPeriodoEscolarPaginacion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<PromocionPeriodoEscolar> = [];

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

    getSelectPromocionPeriodoEscolar(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getSelectPromocionPeriodoEscolarParametros(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlParameter.set('limit', '0');
        urlParameter.set('pagina', '1');
        urlRequest = urlRequest + urlParameter.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    items.forEach((item) => {
                        var promocionPeriodo = new PromocionPeriodoEscolar(item);
                        var clavePeriodo = promocionPeriodo.idPeriodoEscolar.getPeriodo();
                        opcionesSelect.push(new ItemSelects(
                            promocionPeriodo.idPeriodoEscolar.id,
                            clavePeriodo));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    deletePeriodoEscolar(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}

