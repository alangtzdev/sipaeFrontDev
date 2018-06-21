import {GlobalServices} from "./global.service";
import {ErrorCatalogo} from "../core/error.model";
import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {ConfigService} from "../core/config.service";

@Injectable()
export class EnvioCorreoElectronicoService extends GlobalServices {
    private singularUrl: string = '/api/v1/correo/';
    static instance: EnvioCorreoElectronicoService = null;

    constructor(private http: Http) {
        super(http);
    }

    static getInstance(http: Http) {
        if (EnvioCorreoElectronicoService.instance == null) {
            EnvioCorreoElectronicoService.instance = new EnvioCorreoElectronicoService(http);
        }
        return EnvioCorreoElectronicoService.instance;
    }

    postCorreoElectronico(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

}
