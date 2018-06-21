import 'rxjs/Rx';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";

@Injectable()
export class ReporteadorService extends GlobalServices {
    private parametrosReporteUrl: string = '/api/v1/parametrosreporte/';
    private reporteUrl: string = '/api/v1/reporte/';
    private reportesUrl: string = '/api/v1/reportes/';
    private reporteTickets: string = '/api/v1/reporteticket';
    static instance: ReporteadorService = null;
    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ReporteadorService.instance == null) {
            ReporteadorService.instance = new ReporteadorService(http);
        }
        return ReporteadorService.instance;
    }
    getReporteParametros(
        errores: Array<ErrorCatalogo>,
        id: number,
        pathReporteador: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.parametrosReporteUrl + id +
            '?pathReporteador=' + pathReporteador;
        return this.getElement(urlRequest, errores);
    }

    getReporte(
        errores: Array<ErrorCatalogo>,
        id: number,
        pathReporteador: string,
        ticket: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.reporteUrl + id +
            '?pathReporteador=' + pathReporteador + '&ticket=' + ticket;
        return this.getElement(urlRequest, errores);
    }

    getReportePorCiclo(
        errores: Array<ErrorCatalogo>,
        id: number,
        pathReporteador: string,
        ciclo: number,
        ticket: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.reporteUrl + id +
            '?pathReporteador=' + pathReporteador + '&ciclo_escolar=' + ciclo +
            '&ticket=' + ticket;
        return this.getElement(urlRequest, errores);
    }

    getReportePorPeriodos(
        errores: Array<ErrorCatalogo>,
        id: number,
        pathReporteador: string,
        periodoInicio: number,
        periodoTermino: number
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.reporteUrl + id +
            '?pathReporteador=' + pathReporteador + '&periodoInicio=' + periodoInicio +
            '&periodoTermino=' + periodoTermino;
        return this.getElement(urlRequest, errores);
    }

    getReportePorPromocion(
        errores: Array<ErrorCatalogo>,
        id: number,
        pathReporteador: string,
        idPromocion: number,
        ticket: string
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.reporteUrl + id +
            '?pathReporteador=' + pathReporteador + '&id_promocion=' + idPromocion +
            '&ticket=' + ticket;
        return this.getElement(urlRequest, errores);
    }

    getReportes(
        errores: Array<ErrorCatalogo>,
        id: number
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.reporteUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    postReporteTickets(
        pathReporteador,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.reporteTickets;
        return this.postElement(urlRequest, errores, pathReporteador);
    }
}
