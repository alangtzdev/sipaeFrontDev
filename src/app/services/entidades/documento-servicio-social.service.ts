import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DocumentoServicioSocial} from './documento-servicio-social.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DocumentoServicioSocialService extends GlobalServices {
    private pluralUrl: string = '/api/v1/documentosserviciosocial';
    private singularUrl: string = '/api/v1/documentoserviciosocial/';
    static instance: DocumentoServicioSocialService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DocumentoServicioSocialService.instance == null) {
            DocumentoServicioSocialService.instance = new DocumentoServicioSocialService(http);
        }
        return DocumentoServicioSocialService.instance;
    }
    putDocumentoServicioSocial(
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
                router.navigate(['ListaDocumentoServicioSocial']); //.parent.navigate(['ListaDocumentoServicioSocial']);
            }
        );
    }
    postDocumentoServicioSocial(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadDocumentoServicioSocial(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let documentoServicioSocial: DocumentoServicioSocial;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDocumentoServicioSocial(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): DocumentoServicioSocial {
        let documentoServicioSocial: DocumentoServicioSocial;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo DocumentoServicioSocial
            response => documentoServicioSocial = new DocumentoServicioSocial(response.json())
        );
        return documentoServicioSocial;
    }
    getListaDocumentoServicioSocial(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ):any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DocumentoServicioSocial> = [];
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
    deleteDocumentoServicioSocial(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

    getSelectDocumentoServicioSocial(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
