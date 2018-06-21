import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ActividadEvaluacionContinua} from './actividad-evaluacion-continua.model';
import {Http, URLSearchParams} from '@angular/http';
import {FormGroup} from '@angular/forms';
import {Injectable} from '@angular/core';
import {ConfigService} from '../core/config.service';
import {PaginacionInfo} from '../core/pagination-info';

@Injectable()
export class ActividadEvaluacionContinuaService extends GlobalServices {
    static instance: ActividadEvaluacionContinuaService = null;
    private pluralUrl: string = '/api/v1/actividadesevaluacioncontinua';
    private singularUrl: string = '/api/v1/actividadevaluacioncontinua/';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ActividadEvaluacionContinuaService.instance == null) {
            ActividadEvaluacionContinuaService.instance = new ActividadEvaluacionContinuaService(http);
        }
        return ActividadEvaluacionContinuaService.instance;
    }

    putActividadEvaluacionContinua(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postActividadEvaluacionContinua(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadActividadEvaluacionContinua(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let actividadEvaluacionContinua: ActividadEvaluacionContinua;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getActividadEvaluacionContinua(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let asistenciaInduccion: ActividadEvaluacionContinua;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaActividadEvaluacionContinua(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ActividadEvaluacionContinua> = [];

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

    getSelectActividadEvaluacionContinua(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

}
