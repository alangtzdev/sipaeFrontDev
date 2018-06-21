import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {PlantillaEditor} from './plantilla-editor.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class PlantillaEditorService extends GlobalServices {
    private pluralUrl: string = '/api/v1/plantillaseditores';
    private singularUrl: string = '/api/v1/plantillaeditor/';
    private constancia: string = '/api/v1/constanciaplantillaeditor/';
    private html: string = '/api/v1/htmlentidades/';
    static instance: PlantillaEditorService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (PlantillaEditorService.instance == null) {
            PlantillaEditorService.instance = new PlantillaEditorService(http);
        }
        return PlantillaEditorService.instance;
    }

    putPlantillaEditor(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postPlantillaEditor(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadPlantillaEditor(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let plantillaEditor: PlantillaEditor;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getPlantillaEditor(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaPlantillaEditor(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<PlantillaEditor> = [];

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
    getSelectPlantillaEditor(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    constanciaPlantillaEditor(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.constancia.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    plantillaEntidadesSustituidas(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.html.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
}
