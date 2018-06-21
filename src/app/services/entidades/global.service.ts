import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import { AuthHttp, JwtHelper, tokenNotExpired} from 'angular2-jwt/angular2-jwt';
import {ErrorCatalogo} from '../core/error.model';
import {Http, URLSearchParams, Response, Headers} from "@angular/http";
import {Injectable} from "@angular/core";
import {ItemSelects} from "../core/item-select.model";
import {ConfigService} from "../core/config.service";

@Injectable()
export class GlobalServices {
    private authHttp: AuthHttp;

    constructor(
        private https: Http
    ) {
        this.authHttp = ConfigService.getAuthHttp();
    }

    protected getSelect(errores: Array<ErrorCatalogo>, pluralUrl: string): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            pluralUrl + '?';

        let urlParameter: URLSearchParams = new URLSearchParams();
        let ordenamiento = 'valor:ASC';
        urlParameter.set('ordenamiento', ordenamiento);
        urlRequest = urlRequest + urlParameter.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    items.forEach((item) => {
                        opcionesSelect.push(new ItemSelects(item.id, item.valor));
                    });
                }
            }
        );
        return opcionesSelect;
    }

    protected getElement(urlRequest: string, errores: Array<ErrorCatalogo>): any {
        this.getForceAuthApp();
        return this.authHttp.get(urlRequest)
            .catch(error => this.handleError(error, errores));
    }

    protected postElement(
        urlRequest: string,
        errores: Array<ErrorCatalogo>,
        jsonRequest: string
    ): any {
        this.getForceAuthApp();
        let myHeader = new Headers();
        myHeader.append('Content-Type', 'application/json');
        return this.authHttp.post(
            urlRequest,
            jsonRequest,
            { headers: myHeader }
        )
        .catch(error => this.handleError(error, errores));
    }

    protected deleteElement (urlRequest: string, errores: Array<ErrorCatalogo>) {
      this.getForceAuthApp();
      return this.authHttp.delete(urlRequest)
        .catch(error => this.handleError(error, errores));
    }

    protected putElement(
        urlRequest: string,
        errores: Array<ErrorCatalogo>,
        jsonRequest: string
    ): any {
        this.getForceAuthApp();
        let myHeader = new Headers();
        myHeader.append('Content-Type', 'application/json');
        return this.authHttp.put(
            urlRequest,
            jsonRequest,
            { headers: myHeader }
        )
        .catch(error => this.handleError(error, errores));
    }

    private handleError(error: Response, errores: Array<ErrorCatalogo>): any {
        let jsonError = error.json();
        errores.push(new ErrorCatalogo(
            'danger',
            true,
            jsonError.code,
            jsonError.message,
            error.url
        ));
        return Observable.throw(error);
    }

    handleError2(error: any): Promise<any> {
      console.error('An error occurred', error);
      return Promise.reject(error.message || error);
    }

    private  getForceAuthApp() {
        if (!(this.authHttp)) {
            this.authHttp = ConfigService.getAuthHttp();
        }
    }

}
