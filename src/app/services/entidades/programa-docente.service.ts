import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ProgramaDocente} from './programa-docente.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ProgramaDocenteServices extends GlobalServices {
    private pluralUrl: string = '/api/v1/programasdocentes';
    private singularUrl: string = '/api/v1/programadocente/';
    static instance: ProgramaDocenteServices = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ProgramaDocenteServices.instance == null) {
            ProgramaDocenteServices.instance = new ProgramaDocenteServices(http);
        }
        return ProgramaDocenteServices.instance;
    }

    putProgramaDocente(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postProgramaDocente(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        //console.log(urlRequest);
        //console.log(jsonFormulario);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadProgramaDocente(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getProgramaDocente(
            id: number,
            errores: Array<ErrorCatalogo>
        ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getListaProgramaDocente(
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
    getListaProgramaDocenteModal(
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams(),
      paginacion = false
  ): {paginacionInfo: PaginacionInfo, lista: Array<ProgramaDocente>}  {
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
                  listaEstatus.push(new ProgramaDocente(item));
              });
          }
      );
      return {paginacionInfo: paginacionInfo, lista: listaEstatus};
  }
    getSelectProgramaDocente(errores: Array<ErrorCatalogo>, urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlParameter.set('limit', '0');
        urlParameter.set('pagina', '1');
        urlParameter.set('ordenamiento','descripcion:ASC');
        urlRequest = urlRequest + urlParameter.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    items.forEach((item) => {
                        opcionesSelect.push(new ItemSelects(item.id, item.descripcion));
                    });
                }
            }
        );
        return opcionesSelect;
    }
}
