import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";
import {PreguntaEvaluacionDocenteIdiomas} from './pregunta-evaluacion-docente-idiomas.model';

export class PreguntaEvaluacionDocenteIdiomasService extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/preguntaevaluaciondocenteidiomas';
    private singularUrl: string = '/api/v1/catalogo/preguntaevaluaciondocenteidiomas/';
    static instance: PreguntaEvaluacionDocenteIdiomasService = null;
    
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (PreguntaEvaluacionDocenteIdiomasService.instance == null) {
            PreguntaEvaluacionDocenteIdiomasService.instance = new PreguntaEvaluacionDocenteIdiomasService(http);
        }
        return PreguntaEvaluacionDocenteIdiomasService.instance;
    }
    
    putPreguntaEvaluacionDocente(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postPreguntaEvaluacionDocente(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadPreguntaEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getPreguntaEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): PreguntaEvaluacionDocenteIdiomas {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getListaPreguntaEvaluacionDocente(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<PreguntaEvaluacionDocenteIdiomas>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<PreguntaEvaluacionDocenteIdiomas> = [];

        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (!paginacion) {
            urlParameter.set('limit', '0');
            urlParameter.set('pagina', '1');
        }

        urlRequest = urlRequest + urlParameter.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let paginacionInfoJson = response.json();
                paginacionInfo = new PaginacionInfo(
                    paginacionInfoJson.registrosTotales,
                    paginacionInfoJson.paginas,
                    paginacionInfoJson.paginaActual,
                    paginacionInfoJson.registrosPagina
                );
                paginacionInfoJson.lista.forEach((item) => {
                    listaEstatus.push(new PreguntaEvaluacionDocenteIdiomas(item));
                });
            },
            error => {
                    console.error(error);
                    console.error(errores);
                
            },
            () => {
                
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectPreguntaEvaluacionDocente(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
