import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {GestionDocumentosInstitucional} from './gestion-documentos-institucional.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Beca} from "./beca.model";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class GestionDocumentosInstitucionalService extends GlobalServices {
    private pluralUrl: string = '/api/v1/gestionesdocumentosinstitucional';
    private singularUrl: string = '/api/v1/gestiondocumentosinstitucional/';
    constructor(private http: Http) {
        super(http);
    }
    putGestionDocumentosInstitucional(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
        //router: Router
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
        /*.subscribe(
         () => {}, //console.log('Success'),
         console.error,
         () => {
         router.parent.navigate(['ListaGestionDocumentosInstitucional']);
         }
         );*/
    }
    postGestionDocumentosInstitucional(
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
    getEntidadGestionDocumentosInstitucional(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let gestionDocumentosInstitucional: GestionDocumentosInstitucional;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getGestionDocumentosInstitucional(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): GestionDocumentosInstitucional {
        let gestionDocumentosInstitucional: GestionDocumentosInstitucional;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad
            // de tipo GestionDocumentosInstitucional
            response => gestionDocumentosInstitucional =
                new GestionDocumentosInstitucional(response.json())
        );
        return gestionDocumentosInstitucional;
    }
    getListaGestionDocumentosInstitucional(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<GestionDocumentosInstitucional>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<GestionDocumentosInstitucional> = [];
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
                    listaEstatus.push(new GestionDocumentosInstitucional(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaGestionDocumentosInstitucionalPaginacion(
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

    getSelectGestionDocumentosInstitucional(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteDocumentosInstitucion(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
