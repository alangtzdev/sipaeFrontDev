import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {RegistroTitulo} from './registro-titulo.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";

@Injectable()
export class RegistroTituloService extends GlobalServices {
    private pluralUrl: string = '/api/v1/registrostitulos';
    private singularUrl: string = '/api/v1/registrotitulo/';
    static instance: RegistroTituloService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (RegistroTituloService.instance == null) {
            RegistroTituloService.instance = new RegistroTituloService(http);
        }
        return RegistroTituloService.instance;
    }

    putRegistroTitulo(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postRegistroTitulo(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    /*.subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['TablaPaginador']);
            }
        );*/
    }
    getEntidadRegistroTitulo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let registroTitulo: RegistroTitulo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getRegistroTitulo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): RegistroTitulo {
        let registroTitulo: RegistroTitulo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo RegistroTitulo
            response => registroTitulo = new RegistroTitulo(response.json())
        );
        return registroTitulo;
    }

    getListaRegistroTitulo(
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

    getSelectRegistroTitulo(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
