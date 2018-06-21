import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {ItemSelects} from '../core/item-select.model';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {DependienteEconomico} from './dependiente-economico.model';
import {Http, URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";
import {PaginacionInfo} from "../core/pagination-info";

@Injectable()
export class DependienteEconomicoService extends GlobalServices {
    private pluralUrl: string = '/api/v1/dependienteseconomicos';
    private singularUrl: string = '/api/v1/dependienteeconomico/';
    static instance: DependienteEconomicoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (DependienteEconomicoService.instance == null) {
            DependienteEconomicoService.instance = new DependienteEconomicoService(http);
        }
        return DependienteEconomicoService.instance;
    }

    putDependienteEconomico(
        id: number,
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): void {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.putElement(urlRequest, errores, jsonFormulario);
        /*this.putElement(urlRequest, errores, jsonFormulario).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
                router.parent.navigate(['ListaDependienteEconomico']);
            }
        );*/
    }
    postDependienteEconomico(
        jsonFormulario,
        errores: Array<ErrorCatalogo> // ,
        // router: Router
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario); // .subscribe(
            // () => {}, //console.log('Success'),
            // console.error,
            // () => {
            //    router.parent.navigate(['TablaPaginador']);
            // }
        // );
    }
    getEntidadDependienteEconomico(
        id: number,
        errores: Array<ErrorCatalogo>,
        formulario?: FormGroup
    ): any {
        let dependienteEconomico: DependienteEconomico;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        // se dispara el request de manera asyncrona para obtener un resultado
        return this.getElement(urlRequest, errores);
    }
    getDependienteEconomico(
            id: number,
            errores: Array<ErrorCatalogo>,
            formulario?: FormGroup
        ): DependienteEconomico {
        let dependienteEconomico: DependienteEconomico;
        // se arma la url del request
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;

        return this.getElement(urlRequest, errores);

       /* // se dispara el request de manera asyncrona para obtener un resultado
        this.getElement(urlRequest, errores).subscribe(
            // response es la respuesta correcta(200) del servidor
            // se convierte la respuesta a JSON,
            // se realiza la convercion del json a una entidad de tipo DependienteEconomico
            response => dependienteEconomico = new DependienteEconomico(response.json()),
            // en caso de presentarse un error se agrega un nuevo error al array errores
            error => {
                if (assertionsEnabled()) {
                    console.error(error);
                    console.error(errores);
                }
            },
            // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
            // al finalizar correctamente la ejecucion se muestra en consola el resultado
            () => {
                if (assertionsEnabled()) {
                    //console.log(dependienteEconomico);
                }
                if (formulario) {
                    /!* devs Desarrollar los updates de los valores de los
                    controles para su formulario especifico
                    let stringValor = 'valor';
                    let stringActivo = 'activo';
                    let stringCatalogo = 'idCatalogo';
                    (<Control>formulario.controls[stringValor])
                    .updateValue(dependienteEconomico.valor);
                    (<Control>formulario.controls[stringActivo])
                        .updateValue(dependienteEconomico.activo ? 1 : 0);
                    (<Control>formulario.controls[stringCatalogo])
                        .updateValue(dependienteEconomico.catalogo.id);
                    //console.log(formulario);

                    let stringNombre = 'nombre';
                    let stringPrimerApellido = 'primerApellido';
                    let stringSegundoApellido = 'segundoApellido';
                    let stringActivo = 'activo';
                    let stringCatalogo = 'idCatalogo';
                    (<Control>formulario.controls[stringNombre])
                        .updateValue(dependienteEconomico.nombre);
                    (<Control>formulario.controls[stringPrimerApellido])
                        .updateValue(dependienteEconomico.primerApellido);
                    (<Control>formulario.controls[stringSegundoApellido])
                        .updateValue(dependienteEconomico.segundoApellido);
                    (<Control>formulario.controls[stringActivo])
                        .updateValue(dependienteEconomico.activo ? 1 : 0);
                    (<Control>formulario.controls[stringCatalogo])
                        .updateValue(dependienteEconomico.dependienteEconomico.id);
                    //console.log(formulario);
                    *!/
                }
            }
        );
        return dependienteEconomico;*/
    }
    getListaDependienteEconomico(
        errores: Array<ErrorCatalogo>,
        urlParameter: URLSearchParams = new URLSearchParams(),
        paginacion = false
    ): {paginacionInfo: PaginacionInfo, lista: Array<DependienteEconomico>}  {
        let paginacionInfo: PaginacionInfo;
        let listaEstatus: Array<DependienteEconomico> = [];
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
                    listaEstatus.push(new DependienteEconomico(item));
                });
            }
        );
        return {paginacionInfo: paginacionInfo, lista: listaEstatus};
    }

    getSelectDependienteEconomico(errores: Array<ErrorCatalogo>): ItemSelects[] {
        return this.getSelect(errores, this.pluralUrl);
    }

    deleteDependienteEconomico(
        id: number,
        errores: Array<ErrorCatalogo>
      ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl + id;
        return this.deleteElement(urlRequest, errores);
      }
}
