import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ComiteTutorial} from './comite-tutorial.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ComiteTutorialService extends GlobalServices {
    private pluralUrl: string = '/api/v1/comitestutoriales';
    private singularUrl: string = '/api/v1/comitetutorial/';
    private formatoPdf: string = '/api/v1/formatotitulacionpdf/';
    static instance: ComiteTutorialService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ComiteTutorialService.instance == null) {
            ComiteTutorialService.instance = new ComiteTutorialService(http);
        }
        return ComiteTutorialService.instance;
    }

    putComiteTutorial(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postComiteTutorial(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadComiteTutorial(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let comiteTutorial: ComiteTutorial;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getComiteTutorial(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaComiteTutorial(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ComiteTutorial> = [];

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

    getSelectTutor(errores: Array<ErrorCatalogo>): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl;

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    for ( var i in items ) {
                        //console.log(items[i]);
                    }
                    items.forEach((item) => {
                        opcionesSelect.push(new ItemSelects(item.id, item.idProfesor));
                    });
                }
            }
        );
        return opcionesSelect;
    }
    getSelectComiteTutorial(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    deleteComiteTutorial(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

    getFormatoPdf(
        id: number,
        errores: Array<ErrorCatalogo>,
        formato: string,
        comentarios: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.formatoPdf + id +
            '?comentarios=' + comentarios + '&formato=' + formato;
        return this.getElement(urlRequest, errores);
    }
}
