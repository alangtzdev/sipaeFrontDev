import {Observable} from 'rxjs/Observable';
import 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';
import {GlobalServices} from './global.service';
import {ErrorCatalogo} from '../core/error.model';
import {ConfigService} from '../core/config.service';

import {Router} from '@angular/router';
import {FormGroup} from '@angular/forms';


@Injectable()
export class PassWordResetService extends GlobalServices {

    static instance: PassWordResetService = null;
    private singularUrl: string = '/api/v1/resetpassword/';

    static getInstance(http: Http) {
        if (PassWordResetService.instance == null) {
            PassWordResetService.instance = new PassWordResetService(http);
        }
        return PassWordResetService.instance;
    }

    constructor(private http: Http) {
        super(http);
    }

    postResetPassword(
        jsonFormulario,
        errores: Array<ErrorCatalogo>
    ): any {
        let urlRequest = ConfigService.getUrlBaseAPI() + this.singularUrl.slice(0, -1);
        return this.postElement(urlRequest, errores, jsonFormulario);
    }

}