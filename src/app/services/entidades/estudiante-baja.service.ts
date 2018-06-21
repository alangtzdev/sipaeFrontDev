import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudianteBaja} from './estudiante-baja.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteBajaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/estudiantesbaja';
    private singularUrl: string = '/api/v1/estudiantebaja/';
    static instance: EstudianteBajaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteBajaService.instance == null) {
            EstudianteBajaService.instance = new EstudianteBajaService(http);
        }
        return EstudianteBajaService.instance;
    }

    putEstudianteBaja(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
}
    postEstudianteBaja(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
}
    getEntidadEstudianteBaja(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let estudianteBaja: EstudianteBaja;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEstudianteBaja(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let estudianteBaja: EstudianteBaja;
    // se arma la url del request
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    // se dispara el request de manera asyncrona para obtener un resultado
    return this.getElement(urlRequest, errores);
}
    getListaEstudianteBaja(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<EstudianteBaja>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudianteBaja> = [];
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
                    listaEstatus.push(new EstudianteBaja(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectEstudianteBaja(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaEstudianteBajaOpcional (
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): any {
        let listaEstatus: Array<EstudianteBaja> = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';

        urlRequest = urlRequest + urlParameter.toString();
        return this.getElement(urlRequest, errores);
    }

    deleteEstudianteBaja(
        id: number,
        errores: Array<ErrorCatalogo>
      ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
}
}
