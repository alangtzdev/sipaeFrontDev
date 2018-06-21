import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from '../entidades/global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ClasificacionEspecificaProfesor} from './clasificacion-especifica-profesor.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ClasificacionEspecificaProfesorService extends GlobalServices {
    private pluralUrl: string = '/api/v1/catalogo/clasificacionespecificaprofesores';
    private singularUrl: string = '/api/v1/catalogo/clasificacionespecificaprofesor/';
    static instance: ClasificacionEspecificaProfesorService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ClasificacionEspecificaProfesorService.instance == null) {
            ClasificacionEspecificaProfesorService.instance = new ClasificacionEspecificaProfesorService(http);
        }
        return ClasificacionEspecificaProfesorService.instance;
    }

    putClasificacionEspecificaProfesor(
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
                router.navigate(['ListaClasificacionEspecificaProfesor']);   //.parent.navigate(['ListaClasificacionEspecificaProfesor']);
            }
        );
    }
    postClasificacionEspecificaProfesor(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        this.postElement(urlRequest, errores, jsonFormulario).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.navigate(['TablaPaginador']); //.parent.navigate(['TablaPaginador']);
            }
        );
    }
    getEntidadClasificacionEspecificaProfesor(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let clasificacionEspecificaProfesor: ClasificacionEspecificaProfesor;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getClasificacionEspecificaProfesor(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): ClasificacionEspecificaProfesor {
        let clasificacionEspecificaProfesor: ClasificacionEspecificaProfesor;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una
            // entidad de tipo ClasificacionEspecificaProfesor
            response => clasificacionEspecificaProfesor =
                new ClasificacionEspecificaProfesor(response.json()),
            // en caso de presentarse un error se agrega un nuevo error al array errores
            error => {
                if (formulario) {
                    /* devs Desarrollar los updates de los
                     // valores de los controles para su formulario especifico
                     let stringValor = 'valor';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringValor])
                     .updateValue(clasificacionEspecificaProfesor.valor);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(clasificacionEspecificaProfesor.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(clasificacionEspecificaProfesor.catalogo.id);
                     //console.log(formulario);

                     let stringNombre = 'nombre';
                     let stringPrimerApellido = 'primerApellido';
                     let stringSegundoApellido = 'segundoApellido';
                     let stringActivo = 'activo';
                     let stringCatalogo = 'idCatalogo';
                     (<Control>formulario.controls[stringNombre])
                     .updateValue(clasificacionEspecificaProfesor.nombre);
                     (<Control>formulario.controls[stringPrimerApellido])
                     .updateValue(clasificacionEspecificaProfesor.primerApellido);
                     (<Control>formulario.controls[stringSegundoApellido])
                     .updateValue(clasificacionEspecificaProfesor.segundoApellido);
                     (<Control>formulario.controls[stringActivo])
                     .updateValue(clasificacionEspecificaProfesor.activo ? 1 : 0);
                     (<Control>formulario.controls[stringCatalogo])
                     .updateValue(clasificacionEspecificaProfesor
                     .clasificacionEspecificaProfesor.id);
                     //console.log(formulario);
                     */
                }
            }
        );
        return clasificacionEspecificaProfesor;
    }
    getListaClasificacionEspecificaProfesor(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<ClasificacionEspecificaProfesor>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ClasificacionEspecificaProfesor> = [];
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
                    listaEstatus.push(new ClasificacionEspecificaProfesor(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectClasificacionEspecificaProfesor(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {
        //console.log('en el get');
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlParameter.set('limit', '0');
        urlParameter.set('pagina', '1');
        urlRequest = urlRequest + urlParameter.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    for ( var i in items ) {
                        // //console.log(items[i]);
                    }
                    items.forEach((item) => {
                        opcionesSelect.push(new ItemSelects(item.id, item.valor));
                    });
                }
            }
        );
        return opcionesSelect;
    }
}
