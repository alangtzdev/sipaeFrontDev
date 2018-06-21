import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Publicacion} from './publicacion.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class PublicacionService extends GlobalServices {
    private pluralUrl: string = '/api/v1/publicaciones';
    private singularUrl: string = '/api/v1/publicacion/';
    static instance: PublicacionService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (PublicacionService.instance == null) {
            PublicacionService.instance = new PublicacionService(http);
        }
        return PublicacionService.instance;
    }

    putPublicacion(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
        /*this.putElement(urlRequest, errores, jsonFormulario).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaPublicacion']);
            }
        );*/
    }
    postPublicacion(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadPublicacion(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let publicacion: Publicacion;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getPublicacion(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): Publicacion {
        let publicacion: Publicacion;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
        // se dispara el request de manera asyncrona para obtener un resultado
        /*this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo Publicacion
            response => publicacion = new Publicacion(response.json()),
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
                    //console.log(publicacion);
                }
                if (formulario) {
                    /!* devs Desarrollar los updates de los valores de los
                     controles para su formulario especifico
                     let stringValor = 'valor';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringValor]).updateValue(publicacion.valor);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(publicacion.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(publicacion.catalogo.id);
                     //console.log(formulario);

                     let stringNombre = 'nombre';
                     let stringPrimerApellido = 'primerApellido';
                     let stringSegundoApellido = 'segundoApellido';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringNombre])
                     .updateValue(publicacion.nombre);
                     (<Control>formulario.controls[stringPrimerApellido])
                     .updateValue(publicacion.primerApellido);
                     (<Control>formulario.controls[stringSegundoApellido])
                     .updateValue(publicacion.segundoApellido);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(publicacion.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(publicacion.publicacion.id);
                     //console.log(formulario);
                     *!/
                }
            }
        );
        return publicacion;*/
    }
    getListaPublicacion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<Publicacion>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Publicacion> = [];
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
                    listaEstatus.push(new Publicacion(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaPublicacionOpcional(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Publicacion> = [];

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

    getSelectPublicacion(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deletePublicacion(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
