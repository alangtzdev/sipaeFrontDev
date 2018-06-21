import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {CartaNoAdeudo} from './carta-no-adeudo.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class CartaNoAdeudoService extends GlobalServices {
    static instance: CartaNoAdeudoService = null;
    private pluralUrl: string = '/api/v1/cartasnoadeudo';
    private singularUrl: string = '/api/v1/cartanoadeudo/';
    private cartaNoAdeudo: string = '/api/v1/pdfcartanoadeudo/';

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (CartaNoAdeudoService.instance == null) {
            CartaNoAdeudoService.instance = new CartaNoAdeudoService(http);
        }
        return CartaNoAdeudoService.instance;
    }

    putCartaNoAdeudo(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
        /*this.putElement(urlRequest, errores, jsonFormulario).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaCartaNoAdeudo']);
            }
        );*/
    }
    postCartaNoAdeudo(
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
            /*.subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['TablaPaginador']);
            }
        );
        */
    }
    getEntidadCartaNoAdeudo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let cartaNoAdeudo: CartaNoAdeudo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getCartaNoAdeudo(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): CartaNoAdeudo {
        let cartaNoAdeudo: CartaNoAdeudo;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo CartaNoAdeudo
            response => cartaNoAdeudo = new CartaNoAdeudo(response.json())
        );
        return cartaNoAdeudo;
    }
    getListaCartaNoAdeudo(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<CartaNoAdeudo>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<CartaNoAdeudo> = [];
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
                    listaEstatus.push(new CartaNoAdeudo(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectCartaNoAdeudo(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    getListaCartaNoAdeudoPaginacion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<CartaNoAdeudo> = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        if (!paginacion) {
            urlParameter.set('limit', '0');
            urlParameter.set('pagina', '1');
        }
        urlRequest = urlRequest + urlParameter.toString();
        return this.getElement(urlRequest, errores); /*.subscribe(
            response => {
                let paginacionInfoJson = response.json();
                let paginasArray: Array<number> = [];
                for (var i = 0; i < paginacionInfoJson.paginas; i++) {
                    paginasArray.push(i);
                }
                paginacionInfo = new PaginacionInfo(
                    paginacionInfoJson.registrosTotales,
                    paginasArray,
                    paginacionInfoJson.paginaActual,
                    paginacionInfoJson.registrosPagina
                );
                paginacionInfoJson.lista.forEach((item) => {
                    listaEstatus.push(new CartaNoAdeudo(item));
                });
            },
            error => {
                if (assertionsEnabled()) {
                    console.error(error);
                    console.error(errores);
                }
            },
            () => {
                if (assertionsEnabled()) {
                    //console.log({paginacionInfo: paginacionInfo, lista: listaEstatus});
                }
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};*/
    }

    putCartaNoAdeudoFirma(
      id: number,
      jsonFormulario,
      errores: Array<ErrorCatalogo>
    ): any {
      let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id + '/firmar';
      return this.putElement(urlRequest, errores, jsonFormulario);
    }

    getCartaNoAdeudoPdf(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.cartaNoAdeudo + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
}
