import {Injectable} from "@angular/core";
import {GlobalService} from "../../core/global.service";
import {SpinnerService} from "../../spinner/spinner/spinner.service";
import {ErrorCatalogo} from "../../core/error.model";
import {ItemSelects} from "../../core/item-select.model";
import {ConfigService} from "../../core/config.service";
/**
 * Created by Antonio Ruiz Duarte on 12/12/2016.
 */
@Injectable()
export class PaisService extends GlobalService {
  constructor(private spinnerService: SpinnerService) {
    super();
    this.singularUrl = '/api/v1/catalogo/pais';
  }

  getSelect(errores: Array<ErrorCatalogo>): Promise<ItemSelects[]> {
    let idSpinner = 'getSelectPais';
    this.spinnerService.start(idSpinner);
    return this.getElement(ConfigService.getUrlBaseAPI() + this.singularUrl +'/select',errores)
      .toPromise()
      .then(
        response =>{
          this.spinnerService.stop(idSpinner);
          return response.json() as ItemSelects[];
        },
        error => {
          console.error(error);
          console.error(errores);
          this.spinnerService.stop(idSpinner);
        }
      ).catch(this.handleError2);
  }
}
