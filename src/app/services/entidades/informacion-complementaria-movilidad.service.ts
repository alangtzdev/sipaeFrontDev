import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {InformacionComplementariaMovilidad} from './informacion-complementaria-movilidad.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class InformacionComplementariaMovilidadService extends GlobalServices {
    private pluralUrl: string = '/api/v1/informacioncomplementariamovilidades';
    private singularUrl: string = '/api/v1/informacioncomplementariamovilidad/';
    static instance: InformacionComplementariaMovilidadService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (InformacionComplementariaMovilidadService.instance == null) {
            InformacionComplementariaMovilidadService.instance = new InformacionComplementariaMovilidadService(http);
        }
        return InformacionComplementariaMovilidadService.instance;
    }

    putInformacionComplementariaMovilidad(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postInformacionComplementariaMovilidad(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadInformacionComplementariaMovilidad(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let informacionComplementariaMovilidad: InformacionComplementariaMovilidad;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getInformacionComplementariaMovilidad(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): InformacionComplementariaMovilidad {
        let informacionComplementariaMovilidad: InformacionComplementariaMovilidad;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad
            // de tipo InformacionComplementariaMovilidad
            response =>
                informacionComplementariaMovilidad = new InformacionComplementariaMovilidad(
                    response.json())
        );
        return informacionComplementariaMovilidad;
    }
    getListaInformacionComplementariaMovilidad(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<InformacionComplementariaMovilidad>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<InformacionComplementariaMovilidad> = [];
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
                    listaEstatus.push(new InformacionComplementariaMovilidad(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaInformacionComplementariaMovilidadOpcional(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
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
    getSelectInformacionComplementariaMovilidad(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
