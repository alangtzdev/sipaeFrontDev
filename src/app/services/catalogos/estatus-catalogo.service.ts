import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstatusCatalogo} from './estatus-catalogo.model';
import {Catalogo} from './catalogo.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstatusCatalogoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/estatuscatalogos';
    private singularUrl: string = '/api/v1/catalogo/estatuscatalogo/';
    static instance: EstatusCatalogoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstatusCatalogoService.instance == null) {
            EstatusCatalogoService.instance = new EstatusCatalogoService(http);
        }
        return EstatusCatalogoService.instance;
    }

    putEstatusCatalogo(
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
                router.navigate(['ListaEstatusCatalogo']); //.parent.navigate(['ListaEstatusCatalogo']);
            }
        );
    }

    postEstatusCatalogo(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        this.postElement(urlRequest, errores, jsonFormulario).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.navigate(['ListaEstatusCatalogo']); //.parent.navigate(['ListaEstatusCatalogo']);
            }
        );
    }

    getEntidadEstatusCatalogo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?:  FormGroup
    ): any {
        let estatusCatalogo: EstatusCatalogo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getEstatusCatalogo(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): EstatusCatalogo {
        let estatusCatalogo: EstatusCatalogo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(

            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo EstatusCatalogo
            response => estatusCatalogo = new EstatusCatalogo(response.json())

            // en caso de presentarse un error se agrega un nuevo error al array errores

        );

        return estatusCatalogo;
    }

    getListaEstatusCatalogo(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<EstatusCatalogo>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstatusCatalogo> = [];

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
                    listaEstatus.push(new EstatusCatalogo(item));
                });
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectEstatusCatalogo(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlParameter.set('limit', '0');
        urlParameter.set('pagina', '1');
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
            }
        );
        return opcionesSelect;
    }

    getListaEstatusOpcional (
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams()
    ): any {
      let listaEstatus: Array<EstatusCatalogo> = [];
      let urlRequest =
          ConfigService.getUrlBaseAPI() +
          this.pluralUrl + '?';

      urlRequest = urlRequest + urlParameter.toString();
      return this.getElement(urlRequest, errores);
    }

}
