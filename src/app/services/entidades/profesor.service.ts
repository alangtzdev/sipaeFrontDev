import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Profesor} from './profesor.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ProfesorService extends GlobalServices {
    private pluralUrl: string = '/api/v1/profesores';
    private singularUrl: string = '/api/v1/profesor/';
    static instance: ProfesorService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ProfesorService.instance == null) {
            ProfesorService.instance = new ProfesorService(http);
        }
        return ProfesorService.instance;
    }

    putProfesor(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postProfesor(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadProfesor(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getProfesor(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaProfesor(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Profesor> = [];

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

    getListaProfesorModal(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<Profesor>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Profesor> = [];
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
                    listaEstatus.push(new Profesor(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectProfesor(errores: Array<ErrorCatalogo>): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl;
        let urlParameterSearch = new URLSearchParams();
        urlParameterSearch.set('ordenamiento', 'primerApellido:ASC,segundoApellido:ASC,nombre:ASC');
        urlRequest = urlRequest + '?' + urlParameterSearch.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    for (let i in items ) {
                        // console.log(items[i]);
                    }
                    items.forEach((item) => {
                        opcionesSelect.push(new ItemSelects(item.id, item.primer_apellido + ' ' +
                            item.segundo_apellido + ' ' + item.nombre));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    getSelectProfesorCriterios(errores: Array<ErrorCatalogo>, urlParameter: URLSearchParams = new URLSearchParams()
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
                    for ( let i in items ) {
                        // console.log(items[i]);
                    }
                    items.forEach((item) => {
                      let entidadProfesor = new Profesor(item);
                        opcionesSelect.push(new ItemSelects(entidadProfesor.id, entidadProfesor.getNombreCompleto()));
                    });
                }
            }
        );
        return opcionesSelect;
    }
}
