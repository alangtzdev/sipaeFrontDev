import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
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
  selector: 'optativas',
  templateUrl: './estadisticas-optativas.component.html',
  styleUrls: ['./estadisticas-optativas.component.css']
})
export class EstadisticasOptativasComponent implements OnInit {
  opcionesPromocion: Array<ItemSelects> = [];
  opcionesPrograma: Array<ItemSelects> = [];
  formularioRegistroOptativas: FormGroup;
  validacionActiva: boolean = false;
  usuarioLogueado: UsuarioSesion;
  entidadPromocion: Promocion;

  // service
  private _promocionService;
  private _programaDocenteService;
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
    this.usuarioLogueado = authService.getUsuarioLogueado();
    //console.log(this.usuarioLogueado);
    moment.locale('es');
    this.formularioRegistroOptativas = new FormGroup({
      promocion: new FormControl('', Validators.required),
      programaDocente: new FormControl('', Validators.required)
    });
  }

  exportar(idPromocion: number): void {
    if (this.validarFormulario()) {
      //console.log('se va a imprimir reporte');
      let pathReportLGAC = '/reports/reporteLgacProfesores';
      let pathReportOPTATIVAS = '/reports/reporteOptativasLgac';
      //console.log(pathReport);
      this.obtenerReportes(pathReportLGAC, idPromocion);
      this.obtenerReportes(pathReportOPTATIVAS, idPromocion);
    }
  }

  obtenerReportes(pathReport: string, idPromocion: number): void {
    let url;
    let pathReportTicketJSON = '{"pathReporteador":"' + pathReport + '"}';
    this._reporteadorService.postReporteTickets(
      pathReportTicketJSON,
      this.erroresGuardado).subscribe(
      response => {
        this._reporteadorService.getReportePorPromocion(
          this.erroresGuardado,
          this.usuarioLogueado.id,
          pathReport,
          idPromocion,
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
    if (this.formularioRegistroOptativas.valid) {
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
    return (<FormControl>this.formularioRegistroOptativas.controls[campo]);
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let intPromocion = 'promocion';
    (<FormControl>this.formularioRegistroOptativas.controls[intPromocion])
      .setValue('');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesPromocion = this._promocionService
      .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  private getControlErrors(campo: string): boolean {
    /*if (!(<FormControl>this.formularioRegistroOptativas.controls[campo]).valid &&
     this.validacionActiva) {
     return true;
     }
     return false;*/
    return !(<FormControl>this.formularioRegistroOptativas.controls[campo]).valid &&
      this.validacionActiva;
  }

  private prepareServices(): void {
    this._programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this._promocionService = this._catalogosService.getPromocion();
    this._reporteadorService = this._catalogosService.getReporteador();
    this.opcionesPrograma =
      this._programaDocenteService.
      getSelectProgramaDocente(this.erroresConsultas);

  }

  ngOnInit() {
  }

}
