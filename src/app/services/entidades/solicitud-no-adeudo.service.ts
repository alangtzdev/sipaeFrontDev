import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {SolicitudNoAdeudo} from './solicitud-no-adeudo.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class SolicitudNoAdeudoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/solicitudesnoadeudo';
    private singularUrl: string = '/api/v1/solicitudnoadeudo/';
    static instance: SolicitudNoAdeudoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (SolicitudNoAdeudoService.instance == null) {
            SolicitudNoAdeudoService.instance = new SolicitudNoAdeudoService(http);
        }
        return SolicitudNoAdeudoService.instance;
    }

    putSolicitudNoAdeudo(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
        // router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario); /* .subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaSolicitudNoAdeudo']);
            }
        );*/
    }
    postSolicitudNoAdeudo(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
     /*  .subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['TablaPaginador']);
            }
        ); */
    }
    getEntidadSolicitudNoAdeudo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let solicitudNoAdeudo: SolicitudNoAdeudo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getSolicitudNoAdeudo(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): SolicitudNoAdeudo {
        let solicitudNoAdeudo: SolicitudNoAdeudo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo SolicitudNoAdeudo
            response => solicitudNoAdeudo = new SolicitudNoAdeudo(response.json())
        );
        return solicitudNoAdeudo;
    }
    getListaSolicitudNoAdeudo(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<SolicitudNoAdeudo> = [];

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
    getSelectSolicitudNoAdeudo(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
