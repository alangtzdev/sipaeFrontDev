import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ConvocatoriaTiposDocumento} from './convocatoria-tipos-documento.model';
import {Http, URLSearchParams} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ConvocatoriaTiposDocumentoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/convocatoriatiposdocumentos';
    private singularUrl: string = '/api/v1/convocatoriatiposdocumento/';
    static instance: ConvocatoriaTiposDocumentoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ConvocatoriaTiposDocumentoService.instance == null) {
            ConvocatoriaTiposDocumentoService.instance = new ConvocatoriaTiposDocumentoService(http);
        }
        return ConvocatoriaTiposDocumentoService.instance;
    }

    putConvocatoriaTiposDocumento(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
    }

    postConvocatoriaTiposDocumento(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

    getEntidadConvocatoriaTiposDocumento(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getConvocatoriaTiposDocumento(
        id: number,
        errores: Array<ErrorCatalogo>
    ): ConvocatoriaTiposDocumento {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.getElement(urlRequest, errores);
    }

    getListaConvocatoriaTiposDocumento(
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams(),
      paginacion = false
  ): {paginacionInfo: PaginacionInfo, lista: Array<ConvocatoriaTiposDocumento>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ConvocatoriaTiposDocumento> = [];
        let urlRequest = ConfigService.getUrlBaseAPI() + this.pluralUrl + '?';
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
                  listaEstatus.push(new ConvocatoriaTiposDocumento(item));
              });
          }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
      }

    getListaConvocatoriaTiposDocumentoPag(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ConvocatoriaTiposDocumento> = [];

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


    getSelectConvocatoriaTiposDocumento(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
    deleteConvocatoriaDocumento(
        id: number,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
    }

    getSelectConvocatoriaCriterios(errores: Array<ErrorCatalogo>, urlParameter: URLSearchParams = new URLSearchParams()
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
                        let documentoConvocatoria = new ConvocatoriaTiposDocumento(item);
                        let documento = documentoConvocatoria.tipoDocumento.valor;
                        let idTipoDocumento = documentoConvocatoria.tipoDocumento.id;
                        opcionesSelect.push(new ItemSelects(idTipoDocumento, documento));
                    });
                }
            }
        );
        return opcionesSelect;
    }


}
