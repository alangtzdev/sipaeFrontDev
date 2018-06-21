import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DatoAcademicoMovilidadExterna} from './dato-academico-movilidad-externa.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DatoAcademicoMovilidadExternaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/datosacademicomovilidadexterna';
    private singularUrl: string = '/api/v1/datoacademicomovilidadexterna/';
    static instance: DatoAcademicoMovilidadExternaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DatoAcademicoMovilidadExternaService.instance == null) {
            DatoAcademicoMovilidadExternaService.instance = new DatoAcademicoMovilidadExternaService(http);
        }
        return DatoAcademicoMovilidadExternaService.instance;
    }

    putDatoAcademicoMovilidadExterna(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postDatoAcademicoMovilidadExterna(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadDatoAcademicoMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let datoAcademicoMovilidadExterna: DatoAcademicoMovilidadExterna;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDatoAcademicoMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let datoPersonal: DatoAcademicoMovilidadExterna;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
}
    getListaDatoAcademicoMovilidadExterna(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<DatoAcademicoMovilidadExterna>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DatoAcademicoMovilidadExterna> = [];
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
                let paginasArray: Array<number> = [];
                for (var i = 0; i < paginacionInfoJson.paginas; i++) {
                    paginasArray.push(i);
                }
                paginacionInfo = new PaginacionInfo(
                    paginacionInfoJson.registrosTotales,
                    paginasArray.length,
                    paginacionInfoJson.paginaActual,
                    paginacionInfoJson.registrosPagina
                );
                paginacionInfoJson.lista.forEach((item) => {
                    listaEstatus.push(new DatoAcademicoMovilidadExterna(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectDatoAcademicoMovilidadExterna(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
