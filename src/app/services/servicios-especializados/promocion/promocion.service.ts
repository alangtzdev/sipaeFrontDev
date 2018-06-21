import {Injectable} from "@angular/core";
import {GlobalService} from "../../core/global.service";
import {SpinnerService} from "../../spinner/spinner/spinner.service";
import {ErrorCatalogo} from "../../core/error.model";
import {ItemSelects} from "../../core/item-select.model";
import {ConfigService} from "../../core/config.service";
import {Promocion} from "../../entidades/promocion.model";
import {URLSearchParams} from "@angular/http";
/**
 * Created by Antonio Ruiz Duarte on 12/12/2016.
 */
@Injectable()
export class PromocionService extends GlobalService {
  constructor(private spinnerService: SpinnerService) {
    super();
    this.singularUrl = '/api/v1/promocion';
  }

  getSelectByProgramaDocente(idProgramaDocente: number, errores: Array<ErrorCatalogo>): Promise<ItemSelects[]> {
    let idSpinner = 'getSelectByProgramaDocentePromocion';
    this.spinnerService.start(idSpinner);
    return this.getElement(ConfigService.getUrlBaseAPI() + this.singularUrl +'/select/programa-docente/'+idProgramaDocente,errores)
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
    getEntidadPromocion(id: number,
                        errores: Array<ErrorCatalogo>): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }
    getSelectPromocion(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams()
    ): ItemSelects[] {
        let opcionesSelect: ItemSelects[] = [];
        let urlRequest =
            ConfigService.getUrlBaseAPI() +
            this.pluralUrl + '?';
        urlRequest = urlRequest + urlParameter.toString();

        this.getElement(urlRequest, errores).subscribe(
            response => {
                let items = response.json().lista;
                if (items) {
                    for ( var i in items ) {
                    }
                    items.forEach((item) => {
                        var promocion = new Promocion(item);
                        var clavePromocion = promocion.getClavePromocion();
                        opcionesSelect.push(new ItemSelects(item.id, clavePromocion));
                    });
                }
            },
            error => {

            },
            () => {

            }
        );

        return opcionesSelect;
    }
}
