import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {SolicitudServicio} from './solicitud-servicio.model';
import {SolicitudServicioSocial} from './solicitud-servicio-social.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class SolicitudServicioSocialService extends GlobalServices {
    private pluralUrl: string = '/api/v1/solicitudesservicios';
    private singularUrl: string = '/api/v1/solicitudservicio/';
    static instance: SolicitudServicioSocialService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (SolicitudServicioSocialService.instance == null) {
            SolicitudServicioSocialService.instance = new SolicitudServicioSocialService(http);
        }
        return SolicitudServicioSocialService.instance;
    }
    putSolicitudServicioSocial(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postSolicitudServicioSocial(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario)
    }
    getEntidadSolicitudServicioSocial(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let solicitudServicio: SolicitudServicio;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getSolicitudServicioSocial(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): SolicitudServicio {
        let solicitudServicio: SolicitudServicio;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo SolicitudServicio
            response => solicitudServicio = new SolicitudServicio(response.json())
        );
        return solicitudServicio;
    }
    getListaSolicitudServicioSocial(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<SolicitudServicioSocial> = [];
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
    getSelectSolicitudServicioSocial(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
