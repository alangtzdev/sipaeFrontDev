import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Sector} from './sector.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class SectorService extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/sectores';
    private singularUrl: string = '/api/v1/catalogo/sector/';
    static instance: SectorService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (SectorService.instance == null) {
            SectorService.instance = new SectorService(http);
        }
        return SectorService.instance;
    }

    putSector(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postSector(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadSector(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getSector(
        id: number,
        errores: Array<ErrorCatalogo>
    ): Sector {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getListaSector(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<Sector>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Sector> = [];

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
                    listaEstatus.push(new Sector(item));
                });
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectSector(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
