import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ContactoEmergencia} from './contacto-emergencia.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class ContactoEmergenciaService extends GlobalServices {
    private pluralUrl: string = '/api/v1/contactosemergencia';
    private singularUrl: string = '/api/v1/contactoemergencia/';
    static instance: ContactoEmergenciaService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (ContactoEmergenciaService.instance == null) {
            ContactoEmergenciaService.instance = new ContactoEmergenciaService(http);
        }
        return ContactoEmergenciaService.instance;
    }

    putContactoEmergencia(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
        // router: Router
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    return this.putElement(urlRequest, errores, jsonFormulario); //.subscribe(
        // () => {}, //console.log('Success'),
        // console.error,
        // () => {
        //    router.parent.navigate(['ListaContactoEmergencia']);
        // }
    // );
}
    postContactoEmergencia(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
    return this.postElement(urlRequest, errores, jsonFormulario);
}
    getEntidadContactoEmergencia(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let contactoEmergencia: ContactoEmergencia;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getContactoEmergencia(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
): any {
        let contactoEmergencia: ContactoEmergencia;
    // se arma la url del request
    let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
    // se dispara el request de manera asyncrona para obtener un resultado
    return this.getElement(urlRequest, errores); // .subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad de tipo ContactoEmergencia
        // response => contactoEmergencia = new ContactoEmergencia(response.json()),
        // en caso de presentarse un error se agrega un nuevo error al array errores
        // error => {
        //    if (assertionsEnabled()) {
        //        console.error(error);
        //        console.error(errores);
        //    }
        // },
        // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
        // al finalizar correctamente la ejecucion se muestra en consola el resultado
        // () => {
        //    if (assertionsEnabled()) {
        //        //console.log(contactoEmergencia);
        //    }
        //    if (formulario) {
                /* devs Desarrollar los updates de los valores de los controles para su formulario
                 * especifico
                 let stringValor = 'valor';
                 let stringActivo = 'activo';
                 let stringCatalogo = 'idCatalogo';
                 (<Control>formulario.controls[stringValor]).updateValue(contactoEmergencia.valor);
                 (<Control>formulario.controls[stringActivo])
                 .updateValue(contactoEmergencia.activo ? 1 : 0);
                 (<Control>formulario.controls[stringCatalogo])
                 .updateValue(contactoEmergencia.catalogo.id);
                 //console.log(formulario);

                 let stringNombre = 'nombre';
                 let stringPrimerApellido = 'primerApellido';
                 let stringSegundoApellido = 'segundoApellido';
                 let stringActivo = 'activo';
                 let stringCatalogo = 'idCatalogo';
                 (<Control>formulario.controls[stringNombre])
                 .updateValue(contactoEmergencia.nombre);
                 (<Control>formulario.controls[stringPrimerApellido])
                 .updateValue(contactoEmergencia.primerApellido);
                 (<Control>formulario.controls[stringSegundoApellido])
                 .updateValue(contactoEmergencia.segundoApellido);
                 (<Control>formulario.controls[stringActivo])
                 .updateValue(contactoEmergencia.activo ? 1 : 0);
                 (<Control>formulario.controls[stringCatalogo])
                 .updateValue(contactoEmergencia.contactoEmergencia.id);
                 //console.log(formulario);
                 */
        //    }
      //  }
    //);
    //return contactoEmergencia;
}
    getListaContactoEmergencia(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
): {paginacionInfo: PaginacionInfo, lista: Array<ContactoEmergencia>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<ContactoEmergencia> = [];
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
                    listaEstatus.push(new ContactoEmergencia(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }
    getSelectContactoEmergencia(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }
}
