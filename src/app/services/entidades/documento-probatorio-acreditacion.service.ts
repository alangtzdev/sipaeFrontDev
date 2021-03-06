import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DocumentoProbatorioAcreditacion} from './documento-probatorio-acreditacion.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DocumentoProbatorioAcreditacionService extends GlobalServices {
    private pluralUrl: string = '/api/v1/documentosprobatoriosacreditacion';
    private singularUrl: string = '/api/v1/documentoprobatorioacreditacion/';
    static instance: DocumentoProbatorioAcreditacionService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DocumentoProbatorioAcreditacionService.instance == null) {
            DocumentoProbatorioAcreditacionService.instance = new DocumentoProbatorioAcreditacionService(http);
        }
        return DocumentoProbatorioAcreditacionService.instance;
    }

    putDocumentoProbatorioAcreditacion(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postDocumentoProbatorioAcreditacion(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadDocumentoProbatorioAcreditacion(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let documentoProbatorioAcreditacion: DocumentoProbatorioAcreditacion;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDocumentoProbatorioAcreditacion(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): DocumentoProbatorioAcreditacion {
        let documentoProbatorioAcreditacion: DocumentoProbatorioAcreditacion;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad
            // de tipo DocumentoProbatorioAcreditacion
            response =>
                documentoProbatorioAcreditacion = new DocumentoProbatorioAcreditacion(
                    response.json())
        );
        return documentoProbatorioAcreditacion;
    }
    getListaDocumentoProbatorioAcreditacion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<DocumentoProbatorioAcreditacion>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DocumentoProbatorioAcreditacion> = [];
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
                    listaEstatus.push(new DocumentoProbatorioAcreditacion(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectDocumentoProbatorioAcreditacion(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaDocumentoProbatorioControlable(
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

    deleteDocumentoProbatorioAcreditacion(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

}
