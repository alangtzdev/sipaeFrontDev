import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Catalogo} from './catalogo.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class CatalogoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/catalogos';
    private singularUrl: string = '/api/v1/catalogo/catalogo/';
    static instance: CatalogoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (CatalogoService.instance == null) {
            CatalogoService.instance = new CatalogoService(http);
        }
        return CatalogoService.instance;
    }

    getEstatusCatalogo(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario: FormGroup
        ): Catalogo {
        let estatusCatalogo: Catalogo;

        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return estatusCatalogo;
    }

    getListaEstatusCatalogo(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<Catalogo>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Catalogo> = [];

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
                    listaEstatus.push(new Catalogo(item));
                });
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectCatalogo(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
