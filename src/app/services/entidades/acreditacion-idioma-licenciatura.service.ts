import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {AcreditacionIdiomaLicenciatura} from './acreditacion-idioma-licenciatura.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class AcreditacionIdiomaLicenciaturaService extends GlobalServices {
private pluralUrl: string = '/api/v1/acreditacionesidiomalicenciatura';
private singularUrl: string = '/api/v1/acreditacionidiomalicenciatura/';
    constructor(private http: Http) {
        super(http);
    }
    putAcreditacionIdiomaLicenciatura(
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
            router.navigate(['ListaAcreditacionIdiomaLicenciatura']);//.parent.navigate(['ListaAcreditacionIdiomaLicenciatura']);
        }
    );
}
    postAcreditacionIdiomaLicenciatura(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        this.postElement(urlRequest, errores, jsonFormulario).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
            router.navigate(['TablaPaginador']); //.parent.navigate(['TablaPaginador']);
        }
    );
}
    getEntidadAcreditacionIdiomaLicenciatura(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let acreditacionIdiomaLicenciatura: AcreditacionIdiomaLicenciatura;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getAcreditacionIdiomaLicenciatura(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): AcreditacionIdiomaLicenciatura {
        let acreditacionIdiomaLicenciatura: AcreditacionIdiomaLicenciatura;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad de tipo AcreditacionIdiomaLicenciatura
        response => acreditacionIdiomaLicenciatura
            = new AcreditacionIdiomaLicenciatura(response.json())
    );
    return acreditacionIdiomaLicenciatura;
}
    getListaAcreditacionIdiomaLicenciatura(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<AcreditacionIdiomaLicenciatura>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<AcreditacionIdiomaLicenciatura> = [];
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
                    listaEstatus.push(new AcreditacionIdiomaLicenciatura(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectAcreditacionIdiomaLicenciatura(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
