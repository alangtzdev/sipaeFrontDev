import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {IdiomaEstudiante} from './idioma-estudiante.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

export class IdiomaEstudianteService extends GlobalServices {
  private pluralUrl: string = '/api/v1/idiomasestudiantes';
  private singularUrl: string = '/api/v1/idiomaestudiante/';
  static instance: IdiomaEstudianteService = null;

  constructor(private http: Http) {
    super(http);
  }

  static getInstance(http: Http) {
    if (IdiomaEstudianteService.instance == null) {
      IdiomaEstudianteService.instance = new IdiomaEstudianteService(http);
    }
    return IdiomaEstudianteService.instance;
  }

  putIdiomaEstudiante(
    id: number,
    jsonFormulario,
    errores: Array<ErrorCatalogo>
  ): any {
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    return this.putElement(urlRequest, errores, jsonFormulario);
  }

  postIdiomaEstudiante(
    jsonFormulario,
    errores: Array<ErrorCatalogo>
  ): any {
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
    return this.postElement(urlRequest, errores, jsonFormulario);
  }

  getEntidadIdiomaEstudiante(
    id: number,
    errores: Array<ErrorCatalogo>,
    formulario?: FormGroup
  ): any {
    let idiomaEstudiante: IdiomaEstudiante;
    // se arma la url del request
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    // se dispara el request de manera asyncrona para obtener un resultado
    return this.getElement(urlRequest, errores);
  }

  getIdiomaEstudiante(
    id: number,
    errores: Array<ErrorCatalogo>,
    formulario?: FormGroup
  ): any {
    let idiomaEstudiante:IdiomaEstudiante;
    // se arma la url del request
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    // se dispara el request de manera asyncrona para obtener un resultado
    return this.getElement(urlRequest, errores);
  }

  getListaIdiomaEstudiante(
    errores: Array<ErrorCatalogo>,
    urlParameter: URLSearchParams = new URLSearchParams(),
    paginacion = false
  ): {paginacionInfo: PaginacionInfo, lista: Array<IdiomaEstudiante>}  {
    let paginacionInfo: PaginacionInfo;
    let listaEstatus: Array<IdiomaEstudiante> = [];
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
          listaEstatus.push(new IdiomaEstudiante(item));
        });
      }
    );
    return {paginacionInfo: paginacionInfo, lista: listaEstatus};
  }

  getListaIdiomaEstudiantePaginacion(
    errores: Array<ErrorCatalogo>,
    urlParameter: URLSearchParams = new URLSearchParams(),
    paginacion = false
  ): any  {
    let paginacionInfo: PaginacionInfo;
    let listaEstatus: Array<IdiomaEstudiante> = [];

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

  getSelectIdiomaEstudiante(errores: Array<ErrorCatalogo>): ItemSelects[] {
    return this.getSelect(errores, this.pluralUrl);
  }

  deleteIdioma(
    id: number,
    errores: Array<ErrorCatalogo>
  ): any {
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    return this.deleteElement(urlRequest, errores);
  }
}
