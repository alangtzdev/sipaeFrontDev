import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {GestionInstitucional} from './gestion-institucional.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Beca} from "./beca.model";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class GestionInstitucionalService extends GlobalServices {
    private pluralUrl: string = '/api/v1/gestionesinstitucionales';
    private singularUrl: string = '/api/v1/gestioninstitucional/';
    constructor(private http: Http) {
        super(http);
    }
    putGestionInstitucional(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
        //router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
            /*.subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaGestionInstitucional']);
            }
        );*/
    }
    postGestionInstitucional(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
        // router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
           /* .subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['TablaPaginador']);
            }
        );*/
    }
    getEntidadGestionInstitucional(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let gestionInstitucional: GestionInstitucional;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getGestionInstitucional(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): GestionInstitucional {
        let gestionInstitucional: GestionInstitucional;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo GestionInstitucional
            response => gestionInstitucional = new GestionInstitucional(response.json())
        );
        return gestionInstitucional;
    }
    getListaGestionInstitucional(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<GestionInstitucional>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<GestionInstitucional> = [];
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
                    listaEstatus.push(new GestionInstitucional(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaGestionInstitucionalPaginacion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Beca> = [];

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

    getSelectGestionInstitucional(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
