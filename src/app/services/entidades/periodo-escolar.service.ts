import {Observable} from 'rxjs/Observable';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {PeriodoEscolar} from './periodo-escolar.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class PeriodoEscolarServices extends GlobalServices {
    private pluralUrl: string = '/api/v1/periodosescolar';
    private singularUrl: string = '/api/v1/periodoescolar/';
    static instance: PeriodoEscolarServices = null;

    constructor(private http: Http) {
        super(http);
        //moment.locale("es");
    }

    static getInstance(http: Http) {
        if (PeriodoEscolarServices.instance == null) {
            PeriodoEscolarServices.instance = new PeriodoEscolarServices(http);
        }
        return PeriodoEscolarServices.instance;
    }

    putPeriodoEscolar(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        //console.log(urlRequest);
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postPeriodoEscolar(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadPeriodoEscolar(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let periodoEscolar: PeriodoEscolar;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getPeriodoEscolar(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let periodoEscolar: PeriodoEscolar;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getPeriodoEscolarVigente(
        hoy,
        errores:Array<ErrorCatalogo>
        ):any{
        let params=new URLSearchParams();
        let criterios=
        'mesInicio~'+hoy.format("MM")+':MENORIGUAL,mesFin~'+hoy.format("MM")+':MAYORIGUAL,idEstatus.id~1007:IGUAL,anio~'+hoy.format("YYYY")+':IGUAL';
        params.set("criterios",criterios);
        params.set("limit",'1');
        return this.getListaPeriodoEscolar(errores,params);
    }
    getListaPeriodoEscolar(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<PeriodoEscolar> = [];

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

    getListaPeriodoEscolarModal(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<PeriodoEscolar>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<PeriodoEscolar> = [];
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
                    listaEstatus.push(new PeriodoEscolar(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectPeriodoEscolar(errores: Array<ErrorCatalogo>): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl;

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    for ( var i in items ) {
                        //console.log(items[i]);
                    }
                    items.forEach((item) => {
                        let periodo: PeriodoEscolar;
                        periodo = new PeriodoEscolar(item);
                        opcionesSelect.push(new ItemSelects(item.id, periodo.getPeriodo()));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    getSelectPeriodoEscolarPeriodo(errores: Array<ErrorCatalogo>): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl;

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    for ( var i in items ) {
                        //console.log(items[i]);
                    }
                    items.forEach((item) => {
                        let periodo: PeriodoEscolar;
                        periodo = new PeriodoEscolar(item);
                        opcionesSelect.push(new ItemSelects(item.id, periodo.getPeriodo()));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    getSelectPeriodoEscolarPeriodoCriterios(errores: Array<ErrorCatalogo>,
                                            urlParameter: URLSearchParams = new URLSearchParams()): ItemSelects[] {

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
                        //console.log(items[i]);
                    }
                    items.forEach((item) => {
                        let periodo: PeriodoEscolar;
                        periodo = new PeriodoEscolar(item);
                        opcionesSelect.push(new ItemSelects(item.id, periodo.getPeriodo()));
                    });
                }
            }
        );
        return opcionesSelect;
    }

// Metodo para obtener la fecha y nombre del periodo para vista en reportes 911
    getSelectPeriodoEscolarPeriodoFecha(
        errores: Array<ErrorCatalogo>,
        obtenerFechaInicioCurso: boolean,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {

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
                        //console.log(items[i]);
                    }/*
                    items.forEach((item) => {
                        let periodo: PeriodoEscolar;
                        periodo = new PeriodoEscolar(item);
                        // Condicion para cargar la fecha de inicio y fin de curso con formato valido DD/MM/YYYY
                        if(obtenerFechaInicioCurso){
                            opcionesSelect.push(new ItemSelects(periodo.getInicioCursoConFormato(), periodo.getPeriodo()));
                        }else {
                            opcionesSelect.push(new ItemSelects(periodo.getFinCursoConFormato() , periodo.getPeriodo()));
                        }
                    });*/
                }
            }
        );
        return opcionesSelect;
    }
}
