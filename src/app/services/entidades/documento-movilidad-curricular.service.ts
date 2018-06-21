import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DocumentoMovilidadCurricular} from './documento-movilidad-curricular.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DocumentoMovilidadCurricularService extends GlobalServices {
    private pluralUrl: string = '/api/v1/documentosmovilidadcurricular';
    private singularUrl: string = '/api/v1/documentomovilidadcurricular/';
    static instance: DocumentoMovilidadCurricularService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DocumentoMovilidadCurricularService.instance == null) {
            DocumentoMovilidadCurricularService.instance = new DocumentoMovilidadCurricularService(http);
        }
        return DocumentoMovilidadCurricularService.instance;
    }

    putDocumentoMovilidadCurricular(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        this.putElement(urlRequest, errores, jsonFormulario).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
            router.navigate(['ListaDocumentoMovilidadCurricular']); //.parent.navigate(['ListaDocumentoMovilidadCurricular']);
        }
    );
}
    postDocumentoMovilidadCurricular(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
}

    getEntidadDocumentoMovilidadCurricular(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let documentoMovilidadCurricular: DocumentoMovilidadCurricular;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDocumentoMovilidadCurricular(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): DocumentoMovilidadCurricular {
        let documentoMovilidadCurricular: DocumentoMovilidadCurricular;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad de tipo DocumentoMovilidadCurricular
        response => documentoMovilidadCurricular
            = new DocumentoMovilidadCurricular(response.json())
    );
    return documentoMovilidadCurricular;
}
    getListaDocumentoMovilidadCurricular(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<DocumentoMovilidadCurricular>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DocumentoMovilidadCurricular> = [];
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
                    listaEstatus.push(new DocumentoMovilidadCurricular(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectDocumentoMovilidadCurricular(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaDocumentoMovilidadCurricularOpcional(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): any  {
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
