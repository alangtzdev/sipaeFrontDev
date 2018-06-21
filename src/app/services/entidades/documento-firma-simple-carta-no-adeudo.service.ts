import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DocumentoFirmaSimpleCartaNoAdeudo
} from './documento-firma-simple-carta-no-adeudo.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DocumentoFirmaSimpleCartaNoAdeudoService extends GlobalServices {
    static instance: DocumentoFirmaSimpleCartaNoAdeudoService = null;
    private pluralUrl: string = '/api/v1/documentosfirmasimplecartanoadeudo';
    private singularUrl: string = '/api/v1/documentofirmasimplecartanoadeudo/';
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DocumentoFirmaSimpleCartaNoAdeudoService.instance == null) {
            DocumentoFirmaSimpleCartaNoAdeudoService.instance =
                new DocumentoFirmaSimpleCartaNoAdeudoService(http);
        }
        return DocumentoFirmaSimpleCartaNoAdeudoService.instance;
    }
    putDocumentoFirmaSimpleCartaNoAdeudo(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        this.putElement(urlRequest, errores, jsonFormulario);
    }
    postDocumentoFirmaSimpleCartaNoAdeudo(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadDocumentoFirmaSimpleCartaNoAdeudo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let documentoFirmaSimpleCartaNoAdeudo: DocumentoFirmaSimpleCartaNoAdeudo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDocumentoFirmaSimpleCartaNoAdeudo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): DocumentoFirmaSimpleCartaNoAdeudo {
        let documentoFirmaSimpleCartaNoAdeudo: DocumentoFirmaSimpleCartaNoAdeudo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad de tipo DocumentoFirmaSimpleCartaNoAdeudo
        response => documentoFirmaSimpleCartaNoAdeudo
            = new DocumentoFirmaSimpleCartaNoAdeudo(response.json())
    );
    return documentoFirmaSimpleCartaNoAdeudo;
}
    getListaDocumentoFirmaSimpleCartaNoAdeudo(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<DocumentoFirmaSimpleCartaNoAdeudo>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DocumentoFirmaSimpleCartaNoAdeudo> = [];
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
                    listaEstatus.push(new DocumentoFirmaSimpleCartaNoAdeudo(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectDocumentoFirmaSimpleCartaNoAdeudo(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaDocumentoFirmaSimpleCartaNoAdeudoOpcional(
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
