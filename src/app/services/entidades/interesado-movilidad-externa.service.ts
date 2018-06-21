import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {InteresadoMovilidadExterna} from './interesado-movilidad-externa.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class InteresadoMovilidadExternaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/interesadosmovilidadesexternas';
    private singularUrl: string = '/api/v1/interesadomovilidadexterna/';
    static instance: InteresadoMovilidadExternaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (InteresadoMovilidadExternaService.instance == null) {
            InteresadoMovilidadExternaService.instance = new InteresadoMovilidadExternaService(http);
        }
        return InteresadoMovilidadExternaService.instance;
    }

    putInteresadoMovilidadExterna(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        //console.log(id + jsonFormulario + errores);
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postInteresadoMovilidadExterna(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);

    }
    getEntidadInteresadoMovilidadExterna(
      id: number,
         errores: Array<ErrorCatalogo>,
         formulario?: FormGroup
     ): any {
         let interesadoMovilidadExterna: InteresadoMovilidadExterna;
         // se arma la url del request
         let urlRequest = ConfigService.getUrlBaseAPI()
             + '/api/v1/interesadomovilidadesexternas/' + id;
         // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getInteresadoMovilidadExterna(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): InteresadoMovilidadExterna {
        let interesadoMovilidadExterna: InteresadoMovilidadExterna;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo
            // InteresadoMovilidadExterna
            response => interesadoMovilidadExterna =
                new InteresadoMovilidadExterna(response.json())
        );
        return interesadoMovilidadExterna;
    }
    getListaInteresadoMovilidadExterna(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<InteresadoMovilidadExterna> = [];
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
    getSelectInteresadoMovilidadExterna(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
