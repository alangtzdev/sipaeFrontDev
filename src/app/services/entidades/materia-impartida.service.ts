import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {MateriaImpartida} from './materia-impartida.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class MateriaImpartidaService extends GlobalServices {
    static instance: MateriaImpartidaService = null;
    private pluralUrl: string = '/api/v1/materiasimpartidas';
    private singularUrl: string = '/api/v1/materiaimpartida/';
    private actaCalificaciones: string = '/api/v1/actapdf/';
    private estudiantesPorMateria: string = '/api/v1/estudiantespormateria/';
    private listaAsistenciaPDF: string = '/api/v1/listaasistenciapdf/';
    private listaAsistenciaExcel: string = '/api/v1/listaasistenciaexcel/';
    private firmarPost: string = '/api/v1/materiaimpartidafirmar/';
    private actaPdfTutorial: string = '/api/v1/actapdftutorial/';
    private actasFirmadas: string = '/api/v1/materiaImpartida/firmada/';
    private actaPdfTutorialGeneral: string = '/api/v1/actapdftutorialgeneral/';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (MateriaImpartidaService.instance == null) {
            MateriaImpartidaService.instance = new MateriaImpartidaService(http);
        }
        return MateriaImpartidaService.instance;
    }
    putMateriaImpartida(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postMateriaImpartida(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router?: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    postFirma(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router?: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.firmarPost.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadMateriaImpartida(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getMateriaImpartida(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getListaMateriaImpartida(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<MateriaImpartida> = [];

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

    getSelectMateriaImpartida(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getSelectMateriaImpartidaerror(
        errores: Array<ErrorCatalogo>,
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
                    }
                    items.forEach((item) => {
                        if (item.id_materia) {
                            opcionesSelect.push(new ItemSelects(
                                item.id,
                                item.id_materia.descripcion
                            ));
                        }
                    });
                }
            }
        );
        return opcionesSelect;
    }

    deleteMateriaImpartida(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

    getActaCalificaciones(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.actaCalificaciones + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getActaTutoriales(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.actaPdfTutorial + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getEstudiantesPorMateriaImpartida(
        id: number,
        errores: Array<ErrorCatalogo>,
        formato: string
    ): any {
        let urlRequest =
            ConfigService.getUrlBaseAPI() + this.estudiantesPorMateria + id + '?formato=' + formato;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getExportarListaAsistencia(
        idMateriaImpartida: number,
        idProfesor: number,
        tipo: string,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlListaAsistencia: string;
        switch (tipo) {
            case 'Excel':
                urlListaAsistencia = this.listaAsistenciaExcel;
                break;
            case 'PDF':
                urlListaAsistencia = this.listaAsistenciaPDF;
                break;
            default:
                break;
        }

        let urlRequest =
            ConfigService.getUrlBaseAPI() + urlListaAsistencia + idMateriaImpartida + '?idProfesor=' + idProfesor;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

    getFirmasActa(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.actasFirmadas + id;
        return this.getElement(urlRequest, errores);
    }

    getActaTutorialesGeneral(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.actaPdfTutorialGeneral + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }

}
