import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudianteMateriaImpartida} from './estudiante-materia-impartida.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteMateriaImpartidaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/listaestudiantemateriaimpartida';
    private endPointListaOrdenadaUlr = '/api/v1/listaestudiantemateriaimpartidacalificacion/';
    private singularUrl: string = '/api/v1/estudiantemateriaimpartida/';
    static instance: EstudianteMateriaImpartidaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteMateriaImpartidaService.instance == null) {
            EstudianteMateriaImpartidaService.instance = new EstudianteMateriaImpartidaService(http);
        }
        return EstudianteMateriaImpartidaService.instance;
    }

    putEstudianteMateriaImpartida(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postEstudianteMateriaImpartida(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadEstudianteMateriaImpartida(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let EstudianteMateriaImpartida: EstudianteMateriaImpartida;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getEstudianteMateriaImpartida(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaEstudianteMateriaImpartida(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudianteMateriaImpartida> = [];

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

    getListaEstudianteMateriaImpartidaOrdenada(
        errores: Array<ErrorCatalogo>,
        idMateriaImpartida: number,
        idProfesor: number
    ): any {
        let urlRequest;
         if (idProfesor) {
             // se arma la url del request
            urlRequest = ConfigService.getUrlBaseAPI() +
                this.endPointListaOrdenadaUlr + idMateriaImpartida +
                '?idProfesor=' + idProfesor;
         } else {
            urlRequest = ConfigService.getUrlBaseAPI() +
                this.endPointListaOrdenadaUlr + idMateriaImpartida;
         }

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getSelectEstudianteMateriaImpartida(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteEstudianteMateriaImpartida(
        id: number,
        errores: Array<ErrorCatalogo>
      ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
      }
}
