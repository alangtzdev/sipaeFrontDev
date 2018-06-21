import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Nacionalidad} from './nacionalidad.model';
import {Http, URLSearchParams, Response} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {SpinnerService} from "../spinner/spinner/spinner.service";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class NacionalidadService extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/nacionalidades';
    private singularUrl: string = '/api/v1/catalogo/nacionalidad/';
    static instance: NacionalidadService = null;

    constructor(private http: Http, private spinnerService: SpinnerService) {
        super(http);
    }

    putNacionalidad(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postNacionalidad(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadNacionalidad(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let Nacionalidad: Nacionalidad;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getNacionalidad(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaNacionalidad(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<Nacionalidad>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Nacionalidad> = [];
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
                    listaEstatus.push(new Nacionalidad(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectNacionalidad(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaSelectNacionalidad(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): Promise<Nacionalidad[]> {
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (!paginacion) {
            urlParameter.set('limit', '0');
            urlParameter.set('pagina', '1');
        }
        urlRequest = urlRequest + urlParameter.toString();
        let idSpinner = 'getListaSelectNacionalidad';
        this.spinnerService.start(idSpinner);
        return this.getElement(urlRequest, errores)
          .toPromise()
          .then(
            response =>{
              this.spinnerService.stop(idSpinner);
              return response.json().lista as ItemSelects[];
            },
            error => {
              console.error(error);
              console.error(errores);
              this.spinnerService.stop(idSpinner);
            }
          ).catch(this.handleError2);
    }

  getSelectNacionalidadParametros(
    errores: Array<ErrorCatalogo>,
    urlParameter: URLSearchParams = new URLSearchParams(),
    paginacion = false
  ): ItemSelects[]  {
    let opcionesSelect: ItemSelects[] = [];
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
        let items = response.json().lista;
        if (items) {
          for ( var i in items ) {
            //console.log(items[i]);
          }
          items.forEach((item) => {
            opcionesSelect.push(new ItemSelects(item.id, item.valor));
          });
        }
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
          console.error(errores);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log(opcionesSelect);
        }*/
      }
    );
    return opcionesSelect;
  }
}
