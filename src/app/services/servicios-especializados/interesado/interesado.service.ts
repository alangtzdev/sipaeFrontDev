import {Injectable} from "@angular/core";
import {GlobalService} from "../../core/global.service";
import {ErrorCatalogo} from "../../core/error.model";
import {ConfigService} from "../../core/config.service";

@Injectable()
export class InteresadoService extends GlobalService {

  constructor() {
    super();
    this.singularUrl = '/api/v1/interesado';
  }
  post(
    jsonFormulario,
    errores: Array<ErrorCatalogo>
  ): any {
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl;
    return this.postElement(urlRequest, errores, jsonFormulario);
  }
}
