import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Convenio} from './convenio.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ConvenioService extends GlobalServices {
    private pluralUrl: string = '/api/v1/convenios';
    private singularUrl: string = '/api/v1/convenio/';
    static instance: ConvenioService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ConvenioService.instance == null) {
            ConvenioService.instance = new ConvenioService(http);
        }
        return ConvenioService.instance;
    }

    putConvenio(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postConvenio(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadConvenio(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let convenio: Convenio;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getConvenio(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let convenio:Convenio;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaConvenio(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Convenio> = [];

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

    getSelectConvenio(
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {
      let convenios: Array<ItemSelects> = [];
      let urlRequest =
          ConfigService.getUrlBaseAPI() +
          this.pluralUrl + '?';
      urlRequest = urlRequest + urlParameter.toString();

      this.getElement(urlRequest, errores).subscribe(
          response => {
              let items = response.json().lista;
              if (items) {
                  items.forEach((item) => {
                      convenios.push(new ItemSelects(item.id, item.descripcion));
                  });
              }
          }
        );
        return convenios;
    }
}
