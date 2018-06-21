import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudiantesActividad} from './estudiantes-actividad.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudiantesActividadService extends GlobalServices {
    private pluralUrl: string = '/api/v1/estudiantesactividades';
    private singularUrl: string = '/api/v1/estudiantesactividad/';
    constructor(private http: Http) {
        super(http);
    }
    putEstudiantesActividad(
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
                router.navigate(['ListaEstudiantesActividad']); //.parent.navigate(['ListaEstudiantesActividad']);
            }
        );
    }
    postEstudiantesActividad(
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
    getEntidadEstudiantesActividad(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let estudiantesActividad: EstudiantesActividad;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEstudiantesActividad(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): EstudiantesActividad {
        let estudiantesActividad: EstudiantesActividad;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo EstudiantesActividad
            response => estudiantesActividad = new EstudiantesActividad(response.json())
        );
        return estudiantesActividad;
    }
    getListaEstudiantesActividad(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<EstudiantesActividad>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudiantesActividad> = [];
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
                    listaEstatus.push(new EstudiantesActividad(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectEstudiantesActividad(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
