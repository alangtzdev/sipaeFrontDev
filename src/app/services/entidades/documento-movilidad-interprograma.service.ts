import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DocumentoMovilidadInterprograma} from './documento-movilidad-interprograma.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DocumentoMovilidadInterprogramaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/documentosmovilidadinterprograma';
    private singularUrl: string = '/api/v1/documentomovilidadinterprograma/';
    static instance: DocumentoMovilidadInterprogramaService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DocumentoMovilidadInterprogramaService.instance == null) {
            DocumentoMovilidadInterprogramaService.instance =
                new DocumentoMovilidadInterprogramaService(http);
        }
        return DocumentoMovilidadInterprogramaService.instance;
    }
    putDocumentoMovilidadInterprograma(
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
                router.navigate(['ListaDocumentoMovilidadInterprograma']); //.parent.navigate(['ListaDocumentoMovilidadInterprograma']);
            }
        );
    }
    postDocumentoMovilidadInterprograma(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        this.postElement(urlRequest, errores, jsonFormulario).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.navigate(['TablaPaginador']); //.parent.navigate(['TablaPaginador']);
            }
        );
    }
    getEntidadDocumentoMovilidadInterprograma(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let documentoMovilidadInterprograma: DocumentoMovilidadInterprograma;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDocumentoMovilidadInterprograma(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): DocumentoMovilidadInterprograma {
        let documentoMovilidadInterprograma: DocumentoMovilidadInterprograma;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo
            // DocumentoMovilidadInterprograma
            response => documentoMovilidadInterprograma =
                new DocumentoMovilidadInterprograma(response.json())
        );
        return documentoMovilidadInterprograma;
    }
    getListaDocumentoMovilidadInterprograma(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<DocumentoMovilidadInterprograma>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DocumentoMovilidadInterprograma> = [];
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
                    listaEstatus.push(new DocumentoMovilidadInterprograma(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaDocMovilidadInterprogramaOpcional (
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): any {
        let listaEstatus: Array<DocumentoMovilidadInterprograma> = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlRequest = urlRequest + urlParameter.toString();
        return this.getElement(urlRequest, errores);
    }

    getSelectDocumentoMovilidadInterprograma(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
