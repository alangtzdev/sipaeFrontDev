import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {IntegranteLgac} from './integrante-lgac.model';
import {Profesor} from './profesor.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class IntegranteLgacService extends GlobalServices {
    private pluralUrl: string = '/api/v1/integranteslgac';
    private singularUrl: string = '/api/v1/integrantelgac/';
    static instance: IntegranteLgacService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (IntegranteLgacService.instance == null) {
            IntegranteLgacService.instance = new IntegranteLgacService(http);
        }
        return IntegranteLgacService.instance;
    }

    putIntegranteLgac(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
       return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postIntegranteLgac(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadIntegranteLgac(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let integranteLgac: IntegranteLgac;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getIntegranteLgac(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): IntegranteLgac {
        let integranteLgac: IntegranteLgac;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaIntegranteLgac(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<IntegranteLgac>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<IntegranteLgac> = [];
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
                    for(let i in item){
                        //console.log('ITEM:::' + i);
                        //console.log('ITEM222:::' + item[i].nombre);

                    }
                    listaEstatus.push(new IntegranteLgac(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectIntegranteLgac(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getSelectIntegranteLgacCriterios(
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
                        ////console.log(i);
                        ////console.log(items[i]);
                    }
                    items.forEach((item) => {
                        let profesor: IntegranteLgac = new IntegranteLgac(item);
                        opcionesSelect.push(new ItemSelects(profesor.profesor.id, profesor.getNombreCompleto()));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    getListaIntegranteLgacPag(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<IntegranteLgac> = [];

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

    deleteProfesor(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

}
