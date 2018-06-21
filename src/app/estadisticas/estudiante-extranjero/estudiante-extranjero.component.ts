import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {Validacion} from "../../utils/Validacion";
import {FormControl, FormGroup} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import * as moment from "moment";
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'estudianteExtranjeros',
  templateUrl: './estudiante-extranjero.component.html',
  styleUrls: ['./estudiante-extranjero.component.css']
})
export class EstudianteExtranjeroComponent implements OnInit {
  opcionesPromocion: Array<ItemSelects> = [];
  opcionesPrograma: Array<ItemSelects> = [];
  opcionesNivel: Array<ItemSelects> = [];
  formularioEstudianteEstranjeros: FormGroup;
  validacionActiva: boolean = false;
  usuarioLogueado: UsuarioSesion;

  // service
  private _promocionService;
  private _programaDocenteService;
  private _nivelService;
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
    this.formularioEstudianteEstranjeros = new FormGroup({
      promocion: new FormControl(''),
    });
  }

  filtroCambiado(filtro): void {
    //console.log(filtro);
  }

  exportar(promocion): void {
    if (this.validarFormulario()) {
      let pathReport = '{"pathReporteador":"/reports/reporteEstudiantesExtranjeros"}';
      //console.log(pathReport);
      let url;
      this._reporteadorService.postReporteTickets(
        pathReport,
        this.erroresGuardado).subscribe(
        response => {
          //console.log("1");
          //console.log(response.json().ticket);
          let parametros = '/reports/reporteEstudiantesExtranjeros';
          this._reporteadorService.getReportePorPromocion(
            this.erroresGuardado,
            this.usuarioLogueado.id,
            parametros,
            promocion,
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
    if (this.formularioEstudianteEstranjeros.valid) {
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
    return (<FormControl>this.formularioEstudianteEstranjeros.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioEstudianteEstranjeros.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this._programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this._promocionService = this._catalogosService.getPromocion();
    this._nivelService = this._catalogosService.getCatalogoNivelEstudios();
    this._reporteadorService = this._catalogosService.getReporteador();
    this.opcionesPrograma =
      this._programaDocenteService.
      getSelectProgramaDocente(this.erroresConsultas);
    this.opcionesPromocion =
      this._promocionService.
      getSelectPromocion(this.erroresConsultas);
    this.opcionesNivel =
      this._nivelService.
      getSelectNivelEstudio(this.erroresConsultas);

  }

  ngOnInit() {
  }

}
