import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {MedioDifusion} from './medios-difusion.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class MedioDifusionServices extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/mediosdifusion';
    private singularUrl: string = '/api/v1/catalogo/mediodifusion/';
    static instance: MedioDifusionServices = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (MedioDifusionServices.instance == null) {
            MedioDifusionServices.instance = new MedioDifusionServices(http);
        }
        return MedioDifusionServices.instance;
    }

    putMedioDifusion(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postMedioDifusion(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadMedioDifusion(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getMedioDifusion(
        id: number,
        errores: Array<ErrorCatalogo>
    ): MedioDifusion {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getListaMedioDifusion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<MedioDifusion>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<MedioDifusion> = [];

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
                    listaEstatus.push(new MedioDifusion(item));
                });
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectMedioDifusion(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
