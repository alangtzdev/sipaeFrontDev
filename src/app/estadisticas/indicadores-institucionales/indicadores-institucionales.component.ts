import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import {PeriodoEscolar} from "../../services/entidades/periodo-escolar.model";
import {AuthService} from "../../auth/auth.service";
import {Validacion} from "../../utils/Validacion";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'indicadoresInstitucionales',
  templateUrl: './indicadores-institucionales.component.html',
  styleUrls: ['./indicadores-institucionales.component.css']
})
export class IndicadoresInstitucionalesComponent implements OnInit {
  opcionesCiclosEscolares: Array<PeriodoEscolar> = [];
  formularioIndicadores: FormGroup;
  validacionActiva: boolean = false;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  usuarioLogueado: UsuarioSesion;
  ////// picker ///
  dt: Date = new Date();
  dt2: Date = new Date();
  fechaMinima = new Date();
  fechaMaxima: Date;
  contador: number = 0;

  // service
  private _periodoEscolarService;
  private _reporteadorService;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private authService : AuthService,
              private _renderer: Renderer,
              private _catalogosService: CatalogosServices,
              private router: Router) {
    this.prepareServices();
    this.obtenerCiclosEscolares();
    this.usuarioLogueado = authService.getUsuarioLogueado();
    this.formularioIndicadores = new FormGroup({
      ciclo: new FormControl('', Validators.required)
    });
  }

  obtenerCiclosEscolares(): void {
    let annio : number;
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

          let periodo: PeriodoEscolar;
          periodo = new PeriodoEscolar(item);
          this.opcionesCiclosEscolares.forEach((listaPeriodos) => {
            if (!bandera) {
              if (listaPeriodos.anio === periodo.anio) {
                bandera = true;
              }
            }

          });

          if (!bandera) {
            this.opcionesCiclosEscolares.push(
              new PeriodoEscolar(periodo));
          }

        });
      }
    );

  }

  exportar(cicloEscolar: number): void {
    if (this.validarFormulario()) {
      let pathReportJSON = '{"pathReporteador":"/reports/reporteIndicadores"}';
      //console.log(pathReport);
      let url;

      this._reporteadorService.postReporteTickets(
        pathReportJSON,
        this.erroresGuardado).subscribe(
        response => {
          //console.log("1");
          //console.log(response.json().ticket);
          let parametros = '/reports/reporteIndicadores';
          this._reporteadorService.getReportePorCiclo(
            this.erroresGuardado,
            this.usuarioLogueado.id,
            parametros,
            cicloEscolar,
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

  validarFormulario(): boolean {
    if (this.formularioIndicadores.valid) {
      this.validacionActiva = false;
      return true;
    }
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
    return (<FormControl>this.formularioIndicadores.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    /*if (!(<FormControl>this.formularioIndicadores.controls[campo]).valid &&
     this.validacionActiva) {
     return true;
     }
     return false;
     * Simplificar if, conforme las reglas de JavaScrip
     */
    return !(<FormControl>this.formularioIndicadores.controls[campo]).valid &&
      this.validacionActiva;
  }

  private prepareServices(): void {
    this._periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this._reporteadorService = this._catalogosService.getReporteador();
  }


  ngOnInit() {
  }

}
