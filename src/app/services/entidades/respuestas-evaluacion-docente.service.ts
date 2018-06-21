import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {RespuestasEvaluacionDocente} from './respuestas-evaluacion-docente.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class RespuestasEvaluacionDocenteService extends GlobalServices {
    private pluralUrl: string = '/api/v1/respuestasevaluacionesdocentes';
    private singularUrl: string = '/api/v1/respuestaevaluaciondocente/';
    constructor(private http: Http) {
        super(http);
    }
    putRespuestaEvaluacionDocente(
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
                router.navigate(['ListaRespuestaEvaluacionDocente']); //.parent.navigate(['ListaRespuestaEvaluacionDocente']);
            }
        );
    }
    postRespuestaEvaluacionDocente(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadRespuestaEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let respuestaEvaluacionDocente: RespuestasEvaluacionDocente;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getRespuestaEvaluacionDocente(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): RespuestasEvaluacionDocente {
        let respuestaEvaluacionDocente: RespuestasEvaluacionDocente;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo
            // RespuestaEvaluacionDocente
            response => respuestaEvaluacionDocente =
                new RespuestasEvaluacionDocente(response.json())
        );
        return respuestaEvaluacionDocente;
    }
    getListaRespuestaEvaluacionDocente(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<RespuestasEvaluacionDocente> = [];
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
    getSelectRespuestaEvaluacionDocente(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    deleteRespuestaEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
