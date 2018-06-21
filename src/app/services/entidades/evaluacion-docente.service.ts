import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EvaluacionDocente} from './evaluacion-docente.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EvaluacionDocenteService extends GlobalServices {
    private pluralUrl: string = '/api/v1/evaluacionesdocentes';
    private singularUrl: string = '/api/v1/evaluaciondocente/';
    private exportarGraficos: string = '/api/v1/evaluaciondocentegraficopdf';
    static instance: EvaluacionDocenteService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EvaluacionDocenteService.instance == null) {
            EvaluacionDocenteService.instance = new EvaluacionDocenteService(http);
        }
        return EvaluacionDocenteService.instance;
    }
    putEvaluacionDocente(
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
                router.navigate(['ListaEvaluacionDocente']); //.parent.navigate(['ListaEvaluacionDocente']);
            }
        );
    }
    postEvaluacionDocente(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ):any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let evaluacionDocente: EvaluacionDocente;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): EvaluacionDocente {
        let evaluacionDocente: EvaluacionDocente;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo EvaluacionDocente
            response => evaluacionDocente = new EvaluacionDocente(response.json())
        );
        return evaluacionDocente;
    }
    getListaEvaluacionDocente(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ):any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EvaluacionDocente> = [];
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
    getSelectEvaluacionDocente(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    deleteEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

  getGraficosPDF(
    idMateriaImpartida: number,
    idProfesor: number,
    errores: Array<ErrorCatalogo>
  ): any {
    let urlRequest =
      ConfigService.getUrlBaseAPI() + this.exportarGraficos +
      '?idMateriaImpartida=' + idMateriaImpartida + '&idProfesor=' + idProfesor;
    // se dispara el request de manera asyncrona para obtener un resultado
    return this.getElement(urlRequest, errores);
  }
}
