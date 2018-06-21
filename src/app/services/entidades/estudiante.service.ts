import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Estudiante} from './estudiante.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteService extends GlobalServices {
    static instance: EstudianteService = null;
    private pluralUrl: string = '/api/v1/estudiantes';
    private singularUrl: string = '/api/v1/estudiante/';
    private credencialEstudiante: string = '/api/v1/estudiantecredencialpdf/';
    private promedioCreditosEstudiante: string = '/api/v1/estudiantepromediocreditos/';
    private formatoPdf: string = '/api/v1/estudianteformatopdf/';
    private correoLdapEstudiante: string = '/api/v1/crearusuariosldap/';
    private generarCargaAcademica: string = '/api/v1/generarcargaacademica';
    private ticketCredenciales: string = '/api/v1/estudiantecredencialpdfticket/';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteService.instance == null) {
            EstudianteService.instance = new EstudianteService(http);
        }
        return EstudianteService.instance;
    }

    putEstudiante(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        ////console.log(urlRequest);
        return this.putElement(urlRequest, errores, jsonFormulario);
    }
    postEstudiante(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router?: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);

    }
    getEntidadEstudiante(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getEstudiante(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);

    }
    getListaEstudiante(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<Estudiante>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Estudiante> = [];
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
                    listaEstatus.push(new Estudiante(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectEstudiante(errores: Array<ErrorCatalogo>): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl;

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    console.trace('estudiantes', items);
                    items.forEach((item) => {
                        let it = new Estudiante(item);
                        opcionesSelect.push(new ItemSelects(item.id, it.getMatricula() + ' ' +
                            it.getNombreCompleto()));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    getListaEstudianteOpcional (
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams()
    ): any {
      let listaEstatus: Array<Estudiante> = [];
      let urlRequest =
          ConfigService.getUrlBaseAPI() +
          this.pluralUrl + '?';

      urlRequest = urlRequest + urlParameter.toString();
      return this.getElement(urlRequest, errores);
    }

    getListaEstudiantesProgramaPromocion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Estudiante> = [];
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

    getSelectEstudianteNombre(errores: Array<ErrorCatalogo>,
                              urlParameter: URLSearchParams = new URLSearchParams(),
                              paginacion = false): any {
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlRequest = urlRequest + urlParameter.toString();
        return this.getElement(urlRequest, errores);
    }

    getEstudiantePromedioCreditos(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.promedioCreditosEstudiante + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);

    }

    deleteEstudiante(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

    getGenerarCredencial(
        id: number,
        fechaInicio: string,
        fechaFin: string,
        errores: Array<ErrorCatalogo>,
        ticket: string
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.credencialEstudiante + id +
            '?fechaInicio=' + fechaInicio + '&fechaFin=' + fechaFin + '&ticket=' + ticket;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getFormatoPdf(
      id: number,
      errores: Array<ErrorCatalogo>,
      formato: string,
      comentarios: string
    ): any {
      let urlRequest = ConfigService.getUrlBaseAPI() + this.formatoPdf + id +
           '?comentarios=' + comentarios + '&formato=' + formato;
      // se dispara el request de manera asyncrona para obtener un resultado
      return this.getElement(urlRequest, errores);
    }

    generarCorreoUsuarioLdap(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.correoLdapEstudiante + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    postGenerarCargaAcademica(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.generarCargaAcademica;
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

  postTicketCredencial(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.ticketCredenciales + id;
        return this.postElement(urlRequest, errores, '');
    }
}
