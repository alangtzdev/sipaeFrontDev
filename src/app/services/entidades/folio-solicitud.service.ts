import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {FolioSolicitud} from './folio-solicitud.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class FolioSolicitudService extends GlobalServices {
    private pluralUrl: string = '/api/v1/foliossolicitudes';
    private singularUrl: string = '/api/v1/foliosolicitud/';
    static instance: FolioSolicitudService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (FolioSolicitudService.instance == null) {
            FolioSolicitudService.instance = new FolioSolicitudService(http);
        }
        return FolioSolicitudService.instance;
    }

    putFolioSolicitud(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
        // router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario); // .subscribe(
            // () => {}, //console.log('Success'),
            // console.error,
            // () => {
              //  router.parent.navigate(['ListaFoliosSolicitudes']);
          //  }
        // );
    }

    postFolioSolicitud(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
        /*.subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaFoliosSolicitudes']);
            }
        );
        */
    }

    getEntidadFolioSolicitud(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let folioSolicitud: FolioSolicitud;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getFolioSolicitud(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): FolioSolicitud {
        let folioSolicitud: FolioSolicitud;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(

            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo FolioSolicitud
            response => folioSolicitud = new FolioSolicitud(response.json())        );

        return folioSolicitud;
    }

    getListaFolioSolicitud(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<FolioSolicitud>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<FolioSolicitud> = [];

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
                    listaEstatus.push(new FolioSolicitud(item));
                });
            }
        );

        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    postFolioSolicitudEstudiante(
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getSelectFolioSolicitud(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
