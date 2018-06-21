import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {InformacionComplementaria} from './informacion-complementaria.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class InformacionComplementariaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/informacionescomplementarias';
    private singularUrl: string = '/api/v1/informacioncomplementaria/';
    static instance: InformacionComplementariaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (InformacionComplementariaService.instance == null) {
            InformacionComplementariaService.instance = new InformacionComplementariaService(http);
        }
        return InformacionComplementariaService.instance;
    }

    putInformacionComplementaria(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
        // router: Router
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    return this.putElement(urlRequest, errores, jsonFormulario); // .subscribe(
        // () => {}, //console.log('Success'),
        // console.error,
        // () => {
        //    router.parent.navigate(['ListaInformacionComplementaria']);
        // }
    // );
}
    postInformacionComplementaria(
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
        // router: Router
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
    return this.postElement(urlRequest, errores, jsonFormulario); /* .subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
            router.parent.navigate(['TablaPaginador']);
        }
    );*/
}
    getEntidadInformacionComplementaria(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let informacionComplementaria: InformacionComplementaria;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getInformacionComplementaria(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let informacionComplementaria: InformacionComplementaria;
    // se arma la url del request
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    // se dispara el request de manera asyncrona para obtener un resultado
    return this.getElement(urlRequest, errores); // .subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad de tipo InformacionComplementaria
        // response => informacionComplementaria = new InformacionComplementaria(response.json()),
        // en caso de presentarse un error se agrega un nuevo error al array errores
        // error => {
        //     if (assertionsEnabled()) {
        //         console.error(error);
        //         console.error(errores);
        // },
        //     }
        // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
        // al finalizar correctamente la ejecucion se muestra en consola el resultado
        // () => {
        //     if (assertionsEnabled()) {
        //         //console.log(informacionComplementaria);
        //     }
        //     if (formulario) {
                /* devs Desarrollar los updates de los valores de los controles para su formulario
                 * especifico
                 let stringValor = 'valor';
                 let stringActivo = 'activo';
                 let stringCatalogo = 'idCatalogo';
                 (<Control>formulario.controls[stringValor]).updateValue(informacionComplementaria.valor);
                 (<Control>formulario.controls[stringActivo])
                 .updateValue(informacionComplementaria.activo ? 1 : 0);
                 (<Control>formulario.controls[stringCatalogo])
                 .updateValue(informacionComplementaria.catalogo.id);
                 //console.log(formulario);

                 let stringNombre = 'nombre';
                 let stringPrimerApellido = 'primerApellido';
                 let stringSegundoApellido = 'segundoApellido';
                 let stringActivo = 'activo';
                 let stringCatalogo = 'idCatalogo';
                 (<Control>formulario.controls[stringNombre])
                 .updateValue(informacionComplementaria.nombre);
                 (<Control>formulario.controls[stringPrimerApellido])
                 .updateValue(informacionComplementaria.primerApellido);
                 (<Control>formulario.controls[stringSegundoApellido])
                 .updateValue(informacionComplementaria.segundoApellido);
                 (<Control>formulario.controls[stringActivo])
                 .updateValue(informacionComplementaria.activo ? 1 : 0);
                 (<Control>formulario.controls[stringCatalogo])
                 .updateValue(informacionComplementaria.informacionComplementaria.id);
                 //console.log(formulario);
                 */
          //   }
        // }
    // );
    // return informacionComplementaria;
}
    getListaInformacionComplementaria(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<InformacionComplementaria>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<InformacionComplementaria> = [];
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
                    listaEstatus.push(new InformacionComplementaria(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectInformacionComplementaria(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
