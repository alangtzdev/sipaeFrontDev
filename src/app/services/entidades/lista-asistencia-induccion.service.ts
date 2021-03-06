import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {AsistenciaInduccion} from './lista-asistencia-induccion.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class AsistenciaInduccionService extends GlobalServices {
    private pluralUrl: string = '/api/v1/listasasistenciainduccion';
    private singularUrl: string = '/api/v1/asistenciainduccion/';
    constructor(private http: Http) {
        super(http);
    }
    putAsistenciaInduccion(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postAsistenciaInduccion(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario)
    }
    getEntidadAsistenciaInduccion(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let asistenciaInduccion: AsistenciaInduccion;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getAsistenciaInduccion(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): AsistenciaInduccion {
        let asistenciaInduccion: AsistenciaInduccion;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo AsistenciaInduccion
            response => asistenciaInduccion = new AsistenciaInduccion(response.json())
        );
        return asistenciaInduccion;
    }
    getListaAsistenciaInduccion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<AsistenciaInduccion> = [];
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
    getSelectAsistenciaInduccion(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
