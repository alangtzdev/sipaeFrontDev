import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudianteMovilidadExterna} from './estudiante-movilidad-externa.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteMovilidadExternaService extends GlobalServices {
    static instance: EstudianteMovilidadExternaService = null;
    private pluralUrl: string = '/api/v1/estudiantesmovilidadexterna';
    private singularUrl: string = '/api/v1/estudiantemovilidadexterna/';
    private credencialEstudianteMovilidad: string =
        '/api/v1/estudiantemovilidadexternacredencialpdf/';
    private formato: string = '/api/v1/estudiantemovilidadexternaformatopdf/';
    private correoUsuarioLdap: string = '/api/v1/estudiantemovilidadexternacrearusuariosldap/';
    private ticketCredenciales: string = '/api/v1/estudiantemovilidadexternacredencialpdfticket/';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteMovilidadExternaService.instance == null) {
            EstudianteMovilidadExternaService.instance =
                new EstudianteMovilidadExternaService(http);
        }
        return EstudianteMovilidadExternaService.instance;
    }

    putEstudianteMovilidadExterna(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postEstudianteMovilidadExterna(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadEstudianteMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let EstudianteMovilidadExterna: EstudianteMovilidadExterna;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getEstudianteMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaEstudianteMovilidadExterna(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudianteMovilidadExterna> = [];

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

    getSelectEstudianteMovilidadExterna(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getGenerarCredencial(
        id: number,
        fechaInicio: string,
        fechaFin: string,
        errores: Array<ErrorCatalogo>,
        ticket: string
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.credencialEstudianteMovilidad + id +
            '?fechaInicio=' + fechaInicio + '&fechaFin=' + fechaFin + '&ticket=' + ticket;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getFormatoPdfEstExteMov(
        id: number,
        errores: Array<ErrorCatalogo>,
        formato: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.formato + id +
             '?formato=' + formato;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    postCorreoUsuarioLdapEstMovExt(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.correoUsuarioLdap + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    postTicketCredencial(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.ticketCredenciales + id;
        return this.postElement(urlRequest, errores, null);
    }
}

