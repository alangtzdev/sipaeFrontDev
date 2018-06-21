import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {MateriaImpartidaTemarioParticular} from './materia-impartida-temario-particular.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class MateriaImpartidaTemarioParticularService extends GlobalServices {
    static instance: MateriaImpartidaTemarioParticularService = null;
    private pluralUrl: string = '/api/v1/listamateriaimpartidatemarioparticular';
    private singularUrl: string = '/api/v1/materiaimpartidatemarioparticular/';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (MateriaImpartidaTemarioParticularService.instance == null) {
            MateriaImpartidaTemarioParticularService.instance =
                new MateriaImpartidaTemarioParticularService(http);
        }
        return MateriaImpartidaTemarioParticularService.instance;
    }

    putTemarioParticularMateriaImpartida(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postTemarioParticularMateriaImpartida(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router?: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getTemarioParticularMateriaImpartidaformulario(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }


    getListaTemarioParticularMateriaImpartida(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<MateriaImpartidaTemarioParticular> = [];

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

    getTemarioParticularMateriaImpartida(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getTemarioParticularMateriaImpartidaurl(
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
                        if (item.id_materia) {
                            opcionesSelect.push(
                                new ItemSelects(item.id, item.id_materia.descripcion));
                        }
                    });
                }
            }
        );
        return opcionesSelect;
    }

    deleteTemarioParticularMateriaImpartida(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
