import {AuthHttp, AuthConfig, tokenNotExpired} from "angular2-jwt";
import {Router} from "@angular/router";
import {Http} from "@angular/http";

export class ConfigService {

  private static localEnv: string = 'http://localhost:8000';
  private static devEnv: string = 'https://sipae1.colsan.edu.mx:8002';
  private static testEnv: string = 'https://sipae1.colsan.edu.mx:8001';
  private static prodEnv = 'https://sipae1.colsan.edu.mx:8006';
   private static prodEnvOpt: string = 'http://192.168.192.71:8000';
  private static authHttp: AuthHttp;
  private static http: Http;
  private static router: Router;
  public static getUrlBaseAPI(): string {
    // #TODO funcion para determinar el tipo de ambiente de trabajo, dev esta por defailt
    return this.prodEnvOpt;
  }

  public static setAuthHttp(http: Http): void {
    this.http = http;
  }

  public static getAuthHttp(): any {
    let token = localStorage.getItem('token');
    if (token && tokenNotExpired('token')) {
      return new AuthHttp(new AuthConfig({
        headerPrefix: 'Bearer',
        noJwtError: true,
        tokenName: 'token',
        globalHeaders: [{'Accept': 'application/json'}],
        tokenGetter: (() => localStorage.getItem('token')),
      }), this.http);
    }
    return this.http;
  }

  public static setRouter(routerParam: Router): void {
    this.router = routerParam;
  }

  public static getRouter(): Router {
    return this.router;
  }
}
