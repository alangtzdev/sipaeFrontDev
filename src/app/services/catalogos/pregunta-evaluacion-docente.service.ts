import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {PreguntaEvaluacionDocente} from './pregunta-evaluacion-docente.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class PreguntaEvaluacionDocenteService extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/preguntasevaluaciondocentes';
    private singularUrl: string = '/api/v1/catalogo/preguntaevaluaciondocente/';
    static instance: PreguntaEvaluacionDocenteService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (PreguntaEvaluacionDocenteService.instance == null) {
            PreguntaEvaluacionDocenteService.instance = new PreguntaEvaluacionDocenteService(http);
        }
        return PreguntaEvaluacionDocenteService.instance;
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
    ): PreguntaEvaluacionDocente {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getListaPreguntaEvaluacionDocente(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<PreguntaEvaluacionDocente>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<PreguntaEvaluacionDocente> = [];

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
                    listaEstatus.push(new PreguntaEvaluacionDocente(item));
                });
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectPreguntaEvaluacionDocente(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
