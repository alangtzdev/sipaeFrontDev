import { Component, OnInit } from '@angular/core';
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import * as moment from "moment";
import {AuthService} from "../../auth/auth.service";
import {URLSearchParams} from "@angular/http";
import {PeriodoEscolar} from "../../services/entidades/periodo-escolar.model";
import {Validacion} from "../../utils/Validacion";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
@Component({
  selector: 'concentradoSemestre',
  templateUrl: './consentrado-semestre.component.html',
  styleUrls: ['./consentrado-semestre.component.css']
})
export class ConsentradoSemestreComponent implements OnInit {
  opcionesCiclosEscolares: Array<ItemSelects> = [];
  validacionActiva: boolean = false;
  usuarioLogueado: UsuarioSesion;
  formularioConcentradoSemestre: FormGroup;

  // service
  private _periodoEscolarService;
  private _reporteadorService;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private _catalogosService: CatalogosServices,
              private authService : AuthService,
              private router: Router) {
    this.prepareServices();
    this.obtenerCiclosEscolares();
    this.usuarioLogueado = authService.getUsuarioLogueado();
    //console.log(this.usuarioLogueado);
    moment.locale('es');
    this.formularioConcentradoSemestre = new FormGroup({
      ciclo: new FormControl('', Validators.required)
    });
  }

  exportar(cicloEscolar: number): void {
    if (this.validarFormulario()) {
      let pathReport = '/reports/reporteConcentradoSemestre&ciclo_escolar=' + cicloEscolar;
      //console.log('se va a imprimir reporte');
      let pathReportJSON = '{"pathReporteador":"/reports/reporteConcentradoSemestre"}';
      //console.log(pathReport);
      let url;
      this._reporteadorService.postReporteTickets(
        pathReportJSON,
        this.erroresGuardado).subscribe(
        response => {
          this._reporteadorService.getReporte(
            this.erroresGuardado,
            this.usuarioLogueado.id,
            pathReport,
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
  }

  obtenerCiclosEscolares(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    //console.log('url:  ' + urlParameter);
    this._periodoEscolarService.getListaPeriodoEscolar(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          let bandera: boolean = false;
          let annio : number;

          let periodo: PeriodoEscolar;
          periodo = new PeriodoEscolar(item);
          this.opcionesCiclosEscolares.forEach((listaPeriodos) => {
            if (!bandera) {
              if (listaPeriodos.text === periodo.anio) {
                bandera = true;
              }
            }

          });

          if (!bandera) {
            this.opcionesCiclosEscolares.push(
              new ItemSelects(+periodo.anio, periodo.anio));
          }

        });
      }
    );

  }

  validarFormulario(): boolean {
    if (this.formularioConcentradoSemestre.valid) {
      this.validacionActiva = false;
      return true;
    }
    console.log("no esta mandando informacion", this.formularioConcentradoSemestre);
    this.validacionActiva = true;
    return false;
  }

  errorMessage(control: FormControl): string {
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
    return (<FormControl>this.formularioConcentradoSemestre.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    return !(<FormControl>this.formularioConcentradoSemestre.controls[campo]).valid &&
      this.validacionActiva;
    // Se simplifico if
    /*if (!(<FormControl>this.formularioConcentradoSemestre.controls[campo]).valid &&
     this.validacionActiva) {
     return true;
     }
     return false;*/
  }

  private prepareServices(): void {
    this._reporteadorService = this._catalogosService.getReporteador();
    this._periodoEscolarService = this._catalogosService.getPeriodoEscolar();
  }

  ngOnInit() {
  }

}
