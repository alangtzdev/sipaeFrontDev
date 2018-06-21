import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Interesado} from './interesado.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class InteresadoServices extends GlobalServices {
    private pluralUrl: string = '/api/v1/interesados';
    private singularUrl: string = '/api/v1/interesado/';
    static instance: InteresadoServices = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (InteresadoServices.instance == null) {
            InteresadoServices.instance = new InteresadoServices(http);
        }
        return InteresadoServices.instance;
    }

    putInteresado(
      id: number,
      jsonFormulario,
      errores: Array<ErrorCatalogo>
    ): any {
      let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
      return this.putElement(urlRequest, errores, jsonFormulario);
      /*
          this.putElement(urlRequest, errores, jsonFormulario).subscribe(
          () => {}, //console.log('Success'),
                console.error,
                () => {
                  router.parent.navigate(['ListaInteresado']);
                }
        );
      */
    }
    postInteresado(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    postInteresadoModal(
        jsonFormulario,
        errores: Array<ErrorCatalogo>): any {
      let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
      return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadInteresado(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup): any {
        let interesado: Interesado;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
      }
    getInteresado(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup): Interesado {
        let interesado: Interesado;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo Interesado
            response => interesado = new Interesado(response.json())
        );
        return interesado;
    }
    getListaInteresado(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Interesado> = [];

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

    getSelectInteresado(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
