import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ServicioSocial} from './servicio-social.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ServicioSocialService extends GlobalServices {
    private pluralUrl: string = '/api/v1/serviciossociales';
    private singularUrl: string = '/api/v1/serviciosocial/';
    private constancia: string = '/api/v1/constanciaserviciosocial/';
    static instance: ServicioSocialService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ServicioSocialService.instance == null) {
            ServicioSocialService.instance = new ServicioSocialService(http);
        }
        return ServicioSocialService.instance;
    }
    putServicioSocial(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postServicioSocial(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario)
    }
    getEntidadServicioSocial(
        id: number,
        errores: Array<ErrorCatalogo>
        //formulario?: ControlGroup
    ): any {
        let servicioSocial: ServicioSocial;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getServicioSocial(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): ServicioSocial {
        let servicioSocial: ServicioSocial;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo ServicioSocial
            response => servicioSocial = new ServicioSocial(response.json())
        );
        return servicioSocial;
    }
    getListaServicioSocial(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ):any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ServicioSocial> = [];
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
    getSelectServicioSocial(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getConstanciaServicioSocial(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.constancia + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
}
