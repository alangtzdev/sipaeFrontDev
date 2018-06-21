import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {Promocion} from "../../services/entidades/promocion.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import * as moment from "moment";
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'registroAspirantes',
  templateUrl: './registro-aspirantes.component.html',
  styleUrls: ['./registro-aspirantes.component.css']
})
export class RegistroAspirantesComponent implements OnInit {
  opcionesPromocion: Array<ItemSelects> = [];
  opcionesPrograma: Array<ItemSelects> = [];
  formularioAspirantes: FormGroup;
  validacionActiva: boolean = false;
  usuarioLogueado: UsuarioSesion;
  entidadPromocion: Promocion;

  // service
  private _promocionService;
  private _programaDocenteService;
  private _reporteadorService;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private _catalogosService: CatalogosServices,
              private authService : AuthService,
              private router: Router) {
    this.prepareServices();
    this.usuarioLogueado = authService.getUsuarioLogueado();
    //console.log(this.usuarioLogueado);
    moment.locale('es');
    this.formularioAspirantes = new FormGroup({
      promocion: new FormControl('', Validators.required),
      programaDocente: new FormControl('', Validators.required)
    });
  }

  exportar(idPromocion: number): void {
    let pathReport = '{"pathReporteador":"/reports/aspiranteDatosPersonalesRep"}';
    let url;
    this._reporteadorService.postReporteTickets(
      pathReport,
      this.erroresGuardado).subscribe(
      response => {
        //console.log("1");
        //console.log(response.json().ticket);
        let parametros = '/reports/aspiranteDatosPersonalesRep&promociones=' + idPromocion;
        this._reporteadorService.getReporte(
          this.erroresGuardado,
          this.usuarioLogueado.id,
          parametros,
          response.json().ticket
        ).subscribe(
          response => {
            //console.log(response);
            //console.log(response.url);
            url = response.url;
          },
          error => {
            error = new Error;
            console.error(error);
          },
          () => {
            //console.log('Reporte Creado');
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          });
        //console.log(response.url);
      },
      error => {
        //console.log("2");
        error = new Error;
        console.error(error);
      },
      () => {
        //console.log("3");
        //console.log('Reporte Creado');
      });

  }

  validarFormulario(): boolean {
    if (this.formularioAspirantes.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioAspirantes.controls[campo]);
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let intPromocion = 'promocion';
    (<FormControl>this.formularioAspirantes.controls[intPromocion])
      .setValue('');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesPromocion = this._promocionService
      .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  private getControlErrors(campo: string): boolean {
    /*if (!(<FormControl>this.formularioAspirantes.controls[campo]).valid &&
     this.validacionActiva) {
     return true;
     }
     return false;*/
    return !(<FormControl>this.formularioAspirantes.controls[campo]).valid &&
      this.validacionActiva;
  }

  private prepareServices(): void {
    this._programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this._promocionService = this._catalogosService.getPromocion();
    this._reporteadorService = this._catalogosService.getReporteador();
    this.opcionesPrograma = this._programaDocenteService.getSelectProgramaDocente(
      this.erroresConsultas);

  }

  ngOnInit() {
  }

}
