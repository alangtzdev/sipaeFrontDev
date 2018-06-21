import {Injectable} from "@angular/core";
import {AuthHttp} from "angular2-jwt";
import {URLSearchParams, Headers, Response} from "@angular/http";
import {ConfigService} from "./config.service";
import {Observable} from "rxjs";
import {ErrorCatalogo} from "./error.model";
/**
 * Created by Antonio Ruiz Duarte on 11/12/2016.
 */
@Injectable()
export class GlobalService {
  public singularUrl: string = '';
  public pluralUrl: string = '';
  private authHttp: AuthHttp;

  constructor() {
    this.authHttp = ConfigService.getAuthHttp();
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

  handleError2(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }

  private handleError(error: Response, errores: Array<ErrorCatalogo>): any {
      console.log(error);
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

  private  getForceAuthApp() {
    if (!(this.authHttp)) {
      this.authHttp = ConfigService.getAuthHttp();
    }
  }

}
