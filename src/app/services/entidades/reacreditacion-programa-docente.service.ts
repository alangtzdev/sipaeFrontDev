import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ReacreditacionProgramaDocente} from './reacreditacion-programa-docente.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";
import {ProgramaDocente} from "./programa-docente.model";

@Injectable()
export class ReacreditacionProgramaDocenteService extends GlobalServices {
    private pluralUrl: string = '/api/v1/reacreditacionprogramasdocentes';
    private singularUrl: string = '/api/v1/reacreditacionprogramadocente/';
    static instance: ReacreditacionProgramaDocenteService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ReacreditacionProgramaDocenteService.instance == null) {
            ReacreditacionProgramaDocenteService.instance = new ReacreditacionProgramaDocenteService(http);
        }
        return ReacreditacionProgramaDocenteService.instance;
    }

    putReacreditacionProgramaDocente(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postReacreditacionProgramaDocente(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadReacreditacionProgramaDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getReacreditacionProgramaDocente(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): ReacreditacionProgramaDocente {
        let reacreditacionProgramaDocente: ReacreditacionProgramaDocente;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo ReacreditacionProgramaDocente
            response =>
                reacreditacionProgramaDocente = new ReacreditacionProgramaDocente(response.json())
        );
        return reacreditacionProgramaDocente;
    }
  getListaReacreditacion(
    errores: Array<ErrorCatalogo>,
    urlParameter: URLSearchParams = new URLSearchParams(),
    paginacion = false
  ): any {
    let paginacionInfo: PaginacionInfo;
    let listaEstatus: Array<ProgramaDocente> = [];

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

    getListaReacreditacionProgramaDocente(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<ReacreditacionProgramaDocente>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ReacreditacionProgramaDocente> = [];
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
                    listaEstatus.push(new ReacreditacionProgramaDocente(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectReacreditacionProgramaDocente(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
