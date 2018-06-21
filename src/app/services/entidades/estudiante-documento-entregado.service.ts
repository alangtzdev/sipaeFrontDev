import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudianteDocumentoEntregado} from './estudiante-documento-entregado.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteDocumentoEntregadoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/estudiantedocumentosentregados';
    private singularUrl: string = '/api/v1/estudiantedocumentoentregado/';
    static instance: EstudianteDocumentoEntregadoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteDocumentoEntregadoService.instance == null) {
            EstudianteDocumentoEntregadoService.instance = new EstudianteDocumentoEntregadoService(http);
        }
        return EstudianteDocumentoEntregadoService.instance;
    }

    putEstudianteDocumentoEntregado(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postEstudianteDocumentoEntregado(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadEstudianteDocumentoEntregado(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let estudianteDocumentoEntregado: EstudianteDocumentoEntregado;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEstudianteDocumentoEntregado(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): EstudianteDocumentoEntregado {
        let estudianteDocumentoEntregado: EstudianteDocumentoEntregado;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo EstudianteDocumentoEntregado
            response =>
                estudianteDocumentoEntregado = new EstudianteDocumentoEntregado(response.json())
        );
        return estudianteDocumentoEntregado;
    }
    getListaEstudianteDocumentoEntregado(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudianteDocumentoEntregado> = [];
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

    getSelectEstudianteDocumentoEntregado(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
