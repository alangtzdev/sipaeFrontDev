import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';

import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {EstudianteTutor} from './estudiante-tutor.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class EstudianteTutorService extends GlobalServices {
    static instance: EstudianteTutorService = null;
    private pluralUrl: string = '/api/v1/estudiantetutor';
    private singularUrl: string = '/api/v1/estudiantetutor/';
    private exportListaTutoresPDF: string = '/api/v1/estudiantetutorformatolistatrabajos';
    private exportListaTutoresEXCEL: string = '/api/v1/estudiantetutorformatolistatrabajosexcel';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EstudianteTutorService.instance == null) {
            EstudianteTutorService.instance = new EstudianteTutorService(http);
        }
        return EstudianteTutorService.instance;
    }

    putEstudianteTutor(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postEstudianteTutor(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadEstudianteTutor(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let tutor: EstudianteTutor;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getEstudianteTutor(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getListaEstudianteTutor(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<EstudianteTutor> = [];

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

    getSelectEstudianteTutor(errores: Array<ErrorCatalogo>): ItemSelects[] {
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
                        opcionesSelect.push(new ItemSelects(item.id, item.idProfesor));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    getListaTutoresPDFExcel(
        idPromocion: number,
        tipo: string,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlListaAsistencia: string;
        switch (tipo) {
            case 'Excel':
                urlListaAsistencia = this.exportListaTutoresEXCEL;
                break;
            case 'PDF':
                urlListaAsistencia = this.exportListaTutoresPDF;
                break;
            default:
                break;
        }
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + urlListaAsistencia +
            '?idPromocion=' + idPromocion;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
}
