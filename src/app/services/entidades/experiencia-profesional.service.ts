import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ExperienciaProfesional} from './experiencia-profesional.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ExperienciaProfesionalService extends GlobalServices {
    static instance: ExperienciaProfesionalService = null;
    private pluralUrl: string = '/api/v1/experienciasprofesionales';
    private singularUrl: string = '/api/v1/experienciaprofesional/';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ExperienciaProfesionalService.instance == null) {
            ExperienciaProfesionalService.instance = new ExperienciaProfesionalService(http);
        }
        return ExperienciaProfesionalService.instance;
    }
    putExperienciaProfesional(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario); /* .subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaExperienciaProfesional']);
            }
        ); */
    }
    postExperienciaProfesional(
        jsonFormulario,
        errores: Array<ErrorCatalogo>// ,
        // router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario); // .subscribe(
        // () => {}, //console.log('Success'),
        // console.error,
        // () => {
        //  router.parent.navigate(['TablaPaginador']);
        // }
        // );
    }
    getEntidadExperienciaProfesional(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let experienciaProfesional: ExperienciaProfesional;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getExperienciaProfesional(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): ExperienciaProfesional {
        let experienciaProfesional: ExperienciaProfesional;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);

    }
    getListaExperienciaProfesional(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<ExperienciaProfesional>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ExperienciaProfesional> = [];
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
                    listaEstatus.push(new ExperienciaProfesional(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getListaExperienciaProfesionalOpcional(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ExperienciaProfesional> = [];

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

    getSelectExperienciaProfesional(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    deleteExperienciaProfesional(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }
}
