import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DocumentoMovilidadExterna} from './documento-movilidad-externa.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DocumentoMovilidadExternaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/documentosmovilidadexterna';
    private singularUrl: string = '/api/v1/documentomovilidadexterna/';
    static instance: DocumentoMovilidadExternaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DocumentoMovilidadExternaService.instance == null) {
            DocumentoMovilidadExternaService.instance = new DocumentoMovilidadExternaService(http);
        }
        return DocumentoMovilidadExternaService.instance;
    }

    putDocumentoMovilidadExterna(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postDocumentoMovilidadExterna(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        //console.log(urlRequest);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadDocumentoMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let documentoMovilidadExterna: DocumentoMovilidadExterna;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDocumentoMovilidadExterna(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): DocumentoMovilidadExterna {
        let documentoMovilidadExterna: DocumentoMovilidadExterna;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo DocumentoMovilidadExterna
            response => documentoMovilidadExterna = new DocumentoMovilidadExterna(response.json())
        );
        return documentoMovilidadExterna;
    }

    getListaDocumentoMovilidadExterna(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DocumentoMovilidadExterna> = [];

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



    getSelectDocumentoMovilidadExterna(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteDocumentoMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>
      ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
}
}
