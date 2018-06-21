import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Idioma} from './idioma.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class IdiomaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/idiomas';
    private singularUrl: string = '/api/v1/idioma/';
    static instance: IdiomaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (IdiomaService.instance == null) {
            IdiomaService.instance = new IdiomaService(http);
        }
        return IdiomaService.instance;
    }

    putIdioma(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postIdioma(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadIdioma(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let idioma: Idioma;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getIdioma(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): Idioma {
        let idioma: Idioma;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(

            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo Idioma
            response => idioma = new Idioma(response.json())
        );

        return idioma;
    }

    getListaIdioma(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Idioma> = [];

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

    getSelectIdioma(errores: Array<ErrorCatalogo>): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';

        let urlParameter: URLSearchParams = new URLSearchParams();
        let ordenamiento = 'descripcion:ASC';
        urlParameter.set('ordenamiento', ordenamiento);
        urlRequest = urlRequest + urlParameter.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    for ( var i in items ) {
                        //console.log(items[i]);
                    }
                    items.forEach((item) => {
                        opcionesSelect.push(new ItemSelects(item.id, item.descripcion));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    getSelectIdiomasFiltrado(errores: Array<ErrorCatalogo>, urlParameter: URLSearchParams = new URLSearchParams()
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
                    for ( var i in items ) {
                        //console.log(items[i]);
                    }
                    items.forEach((item) => {
                        opcionesSelect.push(new ItemSelects(item.id, item.descripcion));
                    });
                }
            }
        );
        return opcionesSelect;
    }
}
