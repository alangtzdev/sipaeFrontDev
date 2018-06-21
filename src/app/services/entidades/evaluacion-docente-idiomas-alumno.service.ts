import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EvaluacionDocenteAlumno} from './evaluacion-docente-alumno.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";
import {EvaluacionDocenteIdiomasAlumno} from './evaluacion-docente-idiomas-alumno.model';

export class EvaluacionDocenteIdiomasAlumnoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/evaluacionesdocenteidiomasalumno';
    private singularUrl: string = '/api/v1/evaluaciondocenteidiomasalumno/';
    static instance: EvaluacionDocenteIdiomasAlumnoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EvaluacionDocenteIdiomasAlumnoService.instance == null) {
            EvaluacionDocenteIdiomasAlumnoService.instance = new EvaluacionDocenteIdiomasAlumnoService(http);
        }
        return EvaluacionDocenteIdiomasAlumnoService.instance;
    }
    
    putEvaluacionDocenteIdiomasAlumno(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postEvaluacionDocenteIdiomasAlumno(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadEvaluacionDocenteIdiomasAlumno(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let EvaluacionDocenteIdiomasAlumno: EvaluacionDocenteIdiomasAlumno;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEvaluacionDocenteIdiomasAlumno(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaEvaluacionDocenteIdiomasAlumno(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EvaluacionDocenteIdiomasAlumno> = [];

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
    getSelectEvaluacionDocenteIdiomasAlumno(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteEvaluacionDocenteIdiomasAlumno(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
