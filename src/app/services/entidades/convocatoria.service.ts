import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {Convocatoria} from './convocatoria.model';
import {ProgramaDocente} from './programa-docente.model';
import {Http, URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ConvocatoriaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/convocatorias';
    private singularUrl: string = '/api/v1/convocatoria/';
    static instance: ConvocatoriaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ConvocatoriaService.instance == null) {
            ConvocatoriaService.instance = new ConvocatoriaService(http);
        }
        return ConvocatoriaService.instance;
    }

    putConvocatoria(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>,
        router: Router
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
        /*
          this.putElement(urlRequest, errores, jsonFormulario).subscribe(
              () => {}, //console.log('Success'),
              console.error,
              () => {
                  router.parent.navigate(['ListaConvocatoria']);
              }
          );
        */
}
    postConvocatoria(
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
    postConvocatoriaModal(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }
    getEntidadConvocatoria(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let convocatoria: Convocatoria;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getConvocatoria(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): Convocatoria {
        let convocatoria: Convocatoria;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad de tipo Convocatoria
        response => convocatoria = new Convocatoria(response.json())
    );
    return convocatoria;
}

    getListaConvocatoriaExpirada(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Convocatoria> = [];
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

    getListaConvocatoria(
      errores: Array<ErrorCatalogo>,
      urlParameter: URLSearchParams = new URLSearchParams(),
      paginacion = false
  ): any  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<Convocatoria> = [];

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

    getSelectConvocatoria(errores: Array<ErrorCatalogo>, urlParameter: URLSearchParams = new URLSearchParams()
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
                        //console.log('Programa docente convocatoria '+item.id_programa_docente);
                        opcionesSelect.push(new ItemSelects(item.id, item.id_programa_docente.descripcion));
                    });
                }
            }
        );
        return opcionesSelect;
    }
}
