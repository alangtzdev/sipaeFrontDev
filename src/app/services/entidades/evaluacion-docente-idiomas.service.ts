import {Http, URLSearchParams} from "@angular/http";
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalService} from '../core/global.service';
import {Injectable} from "@angular/core";
import {PaginacionInfo} from "../core/pagination-info";
import {ConfigService} from "../core/config.service";
import {ErrorCatalogo} from '../core/error.model';
import {EvaluacionDocenteIdiomas} from './evaluacion-docente-idiomas.model';
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {GlobalServices} from "./global.service";

@Injectable()
export class EvaluacionDocenteIdiomasService extends GlobalServices {
    private pluralUrl: string = '/api/v1/evaluacionesdocenteidiomas';
    private singularUrl: string = '/api/v1/evaluaciondocenteidiomas/';
    private exportarGraficos: string = '/api/v1/evaluaciondocenteidiomagraficopdf';
    static instance: EvaluacionDocenteIdiomasService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EvaluacionDocenteIdiomasService.instance == null) {
            EvaluacionDocenteIdiomasService.instance = new EvaluacionDocenteIdiomasService(http);
        }
        return EvaluacionDocenteIdiomasService.instance;
    }
    putEvaluacionDocente(
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
                router.navigate(['alumno','lista-evaluaciones']);
            }
        );
    }
    postEvaluacionDocente(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ):any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let evaluacionDocenteIdiomas: EvaluacionDocenteIdiomas;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): EvaluacionDocenteIdiomas {
        let evaluacionDocenteIdiomas: EvaluacionDocenteIdiomas;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo EvaluacionDocente
            response => evaluacionDocenteIdiomas = new EvaluacionDocenteIdiomas(response.json()),
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
                      controles para su formulario
                     * especifico
                     let stringValor = 'valor';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringValor])
                     .updateValue(evaluacionDocente.valor);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(evaluacionDocente.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(evaluacionDocente.catalogo.id);
                     //console.log(formulario);

                     let stringNombre = 'nombre';
                     let stringPrimerApellido = 'primerApellido';
                     let stringSegundoApellido = 'segundoApellido';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringNombre])
                     .updateValue(evaluacionDocente.nombre);
                     (<Control>formulario.controls[stringPrimerApellido])
                     .updateValue(evaluacionDocente.primerApellido);
                     (<Control>formulario.controls[stringSegundoApellido])
                     .updateValue(evaluacionDocente.segundoApellido);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(evaluacionDocente.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(evaluacionDocente.evaluacionDocente.id);
                     //console.log(formulario);
                     */
                }
            }
        );
        return evaluacionDocenteIdiomas;
    }
    getListaEvaluacionDocente(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ):any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EvaluacionDocenteIdiomas> = [];
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
    getSelectEvaluacionDocente(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    deleteEvaluacionDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

    getGraficosPDF(
        idEvaluacionDocenteIdiomas: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest =
            ConfigService.getUrlBaseAPI() + this.exportarGraficos +
            '?idGrupoIdioma=' + idEvaluacionDocenteIdiomas;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
}
