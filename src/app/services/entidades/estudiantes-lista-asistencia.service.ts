import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudianteListaAsistencia} from './estudiantes-lista-asistencia.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteListaAsistenciaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/estudianteslistaasistencia';
    private singularUrl: string = '/api/v1/estudiantelistaasistencia/';
    static instance: EstudianteListaAsistenciaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteListaAsistenciaService.instance == null) {
            EstudianteListaAsistenciaService.instance = new EstudianteListaAsistenciaService(http);
        }
        return EstudianteListaAsistenciaService.instance;
    }

    putEstudianteListaAsistencia(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario); /*.subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaEstudianteListaAsistencia']);
            }
        );*/
    }
    postEstudianteListaAsistencia(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadEstudianteListaAsistencia(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let estudianteListaAsistencia: EstudianteListaAsistencia;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEstudianteListaAsistencia(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): EstudianteListaAsistencia {
        let estudianteListaAsistencia: EstudianteListaAsistencia;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo EstudianteListaAsistencia
            response => estudianteListaAsistencia = new EstudianteListaAsistencia(response.json())
        );
        return estudianteListaAsistencia;
    }
    getListaEstudianteListaAsistencia(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudianteListaAsistencia> = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (!paginacion) {
            urlParameter.set('limit', '0');
            urlParameter.set('pagina', '1');
        }
        urlRequest = urlRequest + urlParameter.toString();
        return this.getElement(urlRequest, errores)

    }
    getSelectEstudianteListaAsistencia(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
