import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DatoAcademico} from './dato-academico.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DatoAcademicoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/datosacademicos';
    private singularUrl: string = '/api/v1/datoacademico/';
    static instance: DatoAcademicoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DatoAcademicoService.instance == null) {
            DatoAcademicoService.instance = new DatoAcademicoService(http);
        }
        return DatoAcademicoService.instance;
    }

    putDatoAcademico(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postDatoAcademico(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadDatoAcademico(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let datoAcademico: DatoAcademico;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDatoAcademico(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): DatoAcademico {
        let datoAcademico: DatoAcademico;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
        /*this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo DatoAcademico
            response => datoAcademico = new DatoAcademico(response.json()),
            // en caso de presentarse un error se agrega un nuevo error al array errores
            error => {
                if (assertionsEnabled()) {
                    console.error(error);
                    console.error(errores);
                }
            },
            // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
            // al finalizar correctamente la ejecucion se muestra en consola el resultado
            () => {
                if (assertionsEnabled()) {
                    //console.log(datoAcademico);
                }
                if (formulario) {
                    /!* devs Desarrollar los updates de los valores de los
                    controles para su formulario
                     * especifico
                     let stringValor = 'valor';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringValor]).updateValue(datoAcademico.valor);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(datoAcademico.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(datoAcademico.catalogo.id);
                     //console.log(formulario);

                     let stringNombre = 'nombre';
                     let stringPrimerApellido = 'primerApellido';
                     let stringSegundoApellido = 'segundoApellido';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringNombre])
                     .updateValue(datoAcademico.nombre);
                     (<Control>formulario.controls[stringPrimerApellido])
                     .updateValue(datoAcademico.primerApellido);
                     (<Control>formulario.controls[stringSegundoApellido])
                     .updateValue(datoAcademico.segundoApellido);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(datoAcademico.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(datoAcademico.datoAcademico.id);
                     //console.log(formulario);
                     *!/
                }
            }
        );
        return datoAcademico;*/
    }
    getListaDatoAcademico(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<DatoAcademico>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DatoAcademico> = [];
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
                    listaEstatus.push(new DatoAcademico(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectDatoAcademico(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteDatoAcademico(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
