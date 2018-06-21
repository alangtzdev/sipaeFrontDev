import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudianteGrupoIdioma} from './estudiante-grupo-idioma.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteGrupoIdiomaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/listaestudiantesgrupoidioma';
    private singularUrl: string = '/api/v1/estudiantesgrupoidioma/';
    static instance: EstudianteGrupoIdiomaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteGrupoIdiomaService.instance == null) {
            EstudianteGrupoIdiomaService.instance = new EstudianteGrupoIdiomaService(http);
        }
        return EstudianteGrupoIdiomaService.instance;
    }

    putEstudianteGrupoIdioma(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postEstudianteGrupoIdioma(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadEstudianteGrupoIdioma(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let estudianteGrupoIdioma: EstudianteGrupoIdioma;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEstudianteGrupoIdioma(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaEstudiantesGrupoIdioma(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudianteGrupoIdioma> = [];

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
    getSelectEstudianteGrupoIdioma(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteEstudianteGrupoIdioma(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
