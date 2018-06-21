import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {MovilidadCurricular} from './movilidad-curricular.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class MovilidadCurricularService extends GlobalServices {
    private pluralUrl: string = '/api/v1/movilidadescurriculares';
    private singularUrl: string = '/api/v1/movilidadcurricular/';
    private actaCalificaciones: string = '/api/v1/movilidadcurricularformatopdf/';
    static instance: MovilidadCurricularService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (MovilidadCurricularService.instance == null) {
            MovilidadCurricularService.instance = new MovilidadCurricularService(http);
        }
        return MovilidadCurricularService.instance;
    }

    putMovilidadCurricular(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postMovilidadCurricular(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadMovilidadCurricular(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let movilidadCurricular: MovilidadCurricular;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getMovilidadCurricular(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): MovilidadCurricular {
        let movilidadCurricular: MovilidadCurricular;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo MovilidadCurricular
            response => movilidadCurricular = new MovilidadCurricular(response.json())
        );
        return movilidadCurricular;
    }
    getListaMovilidadCurricular(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<MovilidadCurricular>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<MovilidadCurricular> = [];
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
                    listaEstatus.push(new MovilidadCurricular(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectMovilidadCurricular(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaMovilidadCurricularSimple(
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams(),
      paginacion = false
    ): any {
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

    getMovilidad(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
      }

    getActaCalificaciones(
        id: number,
        errores: Array<ErrorCatalogo>,
        formato: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.actaCalificaciones + id + '?formato=' + formato;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
}
