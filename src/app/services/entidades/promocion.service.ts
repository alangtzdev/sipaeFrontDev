import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Promocion} from './promocion.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class PromocionServices extends GlobalServices {
    private pluralUrl: string = '/api/v1/promociones';
    private singularUrl: string = '/api/v1/promocion/';
    private formatoPdf: string = '/api/v1/formatopdf/';
    static instance: PromocionServices = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (PromocionServices.instance == null) {
            PromocionServices.instance = new PromocionServices(http);
        }
        return PromocionServices.instance;
    }

    putPromocion(id: number,
                 jsonFormulario,
                 errores: Array<ErrorCatalogo>): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postPromocion(jsonFormulario,
                  errores: Array<ErrorCatalogo>): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
       return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadPromocion(id: number,
                        errores: Array<ErrorCatalogo>): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getPromocion(id: number,
                 errores: Array<ErrorCatalogo>): Promocion {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaPromocion(errores: Array<ErrorCatalogo>,
                      urlParameter: URLSearchParams = new URLSearchParams(),
                      paginacion = false): {paginacionInfo: PaginacionInfo,
                                            lista: Array<Promocion>} {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Promocion> = [];

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
                paginacionInfo = new PaginacionInfo(
                    paginacionInfoJson.registrosTotales,
                    paginacionInfoJson.paginas,
                    paginacionInfoJson.paginaActual,
                    paginacionInfoJson.registrosPagina
                );
                paginacionInfoJson.lista.forEach((item) => {
                    listaEstatus.push(new Promocion(item));
                });
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaPromocionesPag(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Promocion> = [];

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

    getSelectPromocion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
        ): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (urlParameter.has('criterios').valueOf()) {
            urlRequest = urlRequest +'criterios='+ urlParameter.get('criterios').toString()
                + ';AND,idEstatus~1235:NOT';
        }else {
            urlRequest = urlRequest +'criterios=' +'idEstatus~1235:NOT';
        }
        if (urlParameter.has('ordenamiento').valueOf()) {
            urlRequest = urlRequest + '&ordenamiento='+urlParameter.get('ordenamiento').toString();
        }
        if (urlParameter.has('limit').valueOf()) {
            urlRequest = urlRequest + '&limit='+ urlParameter.get('limit').toString();
        }
        if (urlParameter.has('pagina').valueOf()) {
            urlRequest = urlRequest + '&pagina='+ urlParameter.get('pagina').toString();
        }
        //console.log('*.*',urlRequest);
        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    items.forEach((item) => {
                        var promocion = new Promocion(item);
                    var clavePromocion = promocion.getClavePromocion();
                        opcionesSelect.push(new ItemSelects(item.id, clavePromocion));
                    });
                }
            }
        );

        return opcionesSelect;
    }

    getSelectPromocionProxima(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlRequest = urlRequest + 'criterios=' + urlParameter.get('criterios').toString();
        // console.log('*.*',urlRequest);
        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    items.forEach((item) => {
                        var promocion = new Promocion(item);
                        var clavePromocion = promocion.getClavePromocion();
                        opcionesSelect.push(new ItemSelects(item.id, clavePromocion));
                    });
                }
            }
        );

        return opcionesSelect;
    }
    //obtenemos la promocion activa
    getSelectPromocionID(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
      ): any {
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';

        urlRequest = urlRequest + urlParameter.toString();

        return this.getElement(urlRequest, errores);
    }

    getFormatoPdf(
        id: number,
        errores: Array<ErrorCatalogo>,
        formato: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.formatoPdf + id +
            '?formato=' + formato;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
}
