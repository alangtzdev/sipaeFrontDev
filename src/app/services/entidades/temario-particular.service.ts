import 'rxjs/Rx';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {TemarioParticular} from './temario-particular.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class TemarioParticularService extends GlobalServices {
    private pluralUrl: string = '/api/v1/temariosparticulares';
    private singularUrl: string = '/api/v1/temarioparticular/';
    static instance: TemarioParticularService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (TemarioParticularService.instance == null) {
            TemarioParticularService.instance = new TemarioParticularService(http);
        }
        return TemarioParticularService.instance;
    }

    putTemarioParticular(
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
                router.navigate(['ListaTemarioParticular']); //.parent.navigate(['ListaTemarioParticular']);
            }
        );
    }
    postTemarioParticular(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
       // router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario); // .subscribe(
            // () => {}, //console.log('Success'),
            // console.error
            //,
            // () => {
            //     router.parent.navigate(['TablaPaginador']);
            // }
        // );
    // jsonFormulario,
    // errores: Array<ErrorCatalogo>
    // ): any {
    //     let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
    //     return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadTemarioParticular(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let temarioParticular: TemarioParticular;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getTemarioParticular(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }
    getListaTemarioParticular(
    errores: Array<ErrorCatalogo>,
    urlParameter: URLSearchParams = new URLSearchParams(),
    paginacion = false
    ): any {
        let paginacionInfo:PaginacionInfo;
        let listaEstatus:Array<TemarioParticular> = [];

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
}
