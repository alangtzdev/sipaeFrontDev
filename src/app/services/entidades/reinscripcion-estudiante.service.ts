import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ReinscripcionEstudiante} from './reinscripcion-estudiante.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";

@Injectable()
export class ReinscripcionEstudianteService extends GlobalServices {
    private pluralUrl: string = '/api/v1/reinscripcionestudiante';
    private singularUrl: string = '/api/v1/reinscripcionestudiante/';
    static instance: ReinscripcionEstudianteService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ReinscripcionEstudianteService.instance == null) {
            ReinscripcionEstudianteService.instance = new ReinscripcionEstudianteService(http);
        }
        return ReinscripcionEstudianteService.instance;
    }

    putReinscripcionEstudiante(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postReinscripcionEstudiante(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadReinscripcionEstudiante(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let ReinscripcionEstudiante: ReinscripcionEstudiante;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getReinscripcionEstudiante(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let datoPersonal: ReinscripcionEstudiante;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaReinscripcionEstudiante(
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
    getSelectReinscripcionEstudiante(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    getListaGrupoModal (
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams()
    ): any {
      let listaEstatus: Array<ReinscripcionEstudiante> = [];
      let urlRequest =
          ConfigService.getUrlBaseAPI() +
          this.pluralUrl + '?';

      urlRequest = urlRequest + urlParameter.toString();
      return this.getElement(urlRequest, errores);
    }
}
