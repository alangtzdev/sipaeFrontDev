import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";
import {RespuestasEvaluacionDocenteIdiomas} from './respuestas-evaluacion-docente-idiomas.model';

@Injectable()
export class RespuestasEvaluacionDocenteIdiomasService extends GlobalServices {
    private pluralUrl: string =   '/api/v1/respuestasevaluaciondocenteidiomas';
    private singularUrl: string = '/api/v1/respuestaevaluaciondocenteidiomas/';
    static instance: RespuestasEvaluacionDocenteIdiomasService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (RespuestasEvaluacionDocenteIdiomasService.instance == null) {
            RespuestasEvaluacionDocenteIdiomasService.instance = new RespuestasEvaluacionDocenteIdiomasService(http);
        }
        return RespuestasEvaluacionDocenteIdiomasService.instance;
    }

    putRespuestaEvaluacionDocente(
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
                router.navigate(['ListaRespuestaEvaluacionDocente']);
            }
        );
    }
    postRespuestaEvaluacionDocente(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadRespuestaEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let respuestasEvaluacionDocenteIdiomas: RespuestasEvaluacionDocenteIdiomas;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getRespuestaEvaluacionDocente(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): RespuestasEvaluacionDocenteIdiomas {
        let respuestasEvaluacionDocenteIdiomas: RespuestasEvaluacionDocenteIdiomas;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo
            // RespuestaEvaluacionDocente
            response => respuestasEvaluacionDocenteIdiomas =
                new RespuestasEvaluacionDocenteIdiomas(response.json()),
            // en caso de presentarse un error se agrega un nuevo error al array errores
            error => {
                    console.error(error);
                    console.error(errores);

            },
            // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
            // al finalizar correctamente la ejecucion se muestra en consola el resultado
            () => {
                if (formulario) {
                    /* devs Desarrollar los updates de los valores de los
                    controles para su formulario especifico
                    let stringValor = 'valor';
                    let stringActivo = 'activo';
                    let stringCatalogo = 'idCatalogo';
                    (<Control>formulario.controls[stringValor])
                    .updateValue(respuestaEvaluacionDocente.valor);
                    (<Control>formulario.controls[stringActivo])
                        .updateValue(respuestaEvaluacionDocente.activo ? 1 : 0);
                    (<Control>formulario.controls[stringCatalogo])
                        .updateValue(respuestaEvaluacionDocente.catalogo.id);
                    //console.log(formulario);

                    let stringNombre = 'nombre';
                    let stringPrimerApellido = 'primerApellido';
                    let stringSegundoApellido = 'segundoApellido';
                    let stringActivo = 'activo';
                    let stringCatalogo = 'idCatalogo';
                    (<Control>formulario.controls[stringNombre])
                        .updateValue(respuestaEvaluacionDocente.nombre);
                    (<Control>formulario.controls[stringPrimerApellido])
                        .updateValue(respuestaEvaluacionDocente.primerApellido);
                    (<Control>formulario.controls[stringSegundoApellido])
                        .updateValue(respuestaEvaluacionDocente.segundoApellido);
                    (<Control>formulario.controls[stringActivo])
                        .updateValue(respuestaEvaluacionDocente.activo ? 1 : 0);
                    (<Control>formulario.controls[stringCatalogo])
                        .updateValue(respuestaEvaluacionDocente.respuestaEvaluacionDocente.id);
                    //console.log(formulario);
                    */
                }
            }
        );
        return respuestasEvaluacionDocenteIdiomas;
    }
    getListaRespuestasEvaluacionDocenteIdiomas(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<RespuestasEvaluacionDocenteIdiomas> = [];
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
    getSelectRespuestaEvaluacionDocente(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    deleteRespuestaEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
