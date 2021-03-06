import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DireccionMovilidadExterna} from './direccion-movilidad-externa.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DireccionMovilidadExternaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/direccionesmovilidadexterna';
    private singularUrl: string = '/api/v1/direccionmovilidadexterna/';
    static instance: DireccionMovilidadExternaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DireccionMovilidadExternaService.instance == null) {
            DireccionMovilidadExternaService.instance = new DireccionMovilidadExternaService(http);
        }
        return DireccionMovilidadExternaService.instance;
    }

    putDireccionMovilidadExterna(
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
            router.navigate(['ListaDireccionMovilidadExterna']); //.parent.navigate(['ListaDireccionMovilidadExterna']);
        }
    );
}
    postDireccionMovilidadExterna(
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
        // router: Router
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario); /* .subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
            router.parent.navigate(['TablaPaginador']);
        }
    );*/
}
    getEntidadDireccionMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let direccionMovilidadExterna: DireccionMovilidadExterna;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDireccionMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): DireccionMovilidadExterna {
        let direccionMovilidadExterna: DireccionMovilidadExterna;
    // se arma la url del request
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    // se dispara el request de manera asyncrona para obtener un resultado
    this.getElement(urlRequest, errores).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad de tipo DireccionMovilidadExterna
        response => direccionMovilidadExterna = new DireccionMovilidadExterna(response.json())
    );
    return direccionMovilidadExterna;
}
    getListaDireccionMovilidadExterna(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<DireccionMovilidadExterna>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DireccionMovilidadExterna> = [];
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
                    listaEstatus.push(new DireccionMovilidadExterna(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectDireccionMovilidadExterna(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteDireccionMovilidadExterna(
        id: number,
        errores: Array<ErrorCatalogo>
      ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
      }
}
