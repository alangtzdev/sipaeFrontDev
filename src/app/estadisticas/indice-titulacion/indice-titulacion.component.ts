import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'indiceTitulacion',
  templateUrl: './indice-titulacion.component.html',
  styleUrls: ['./indice-titulacion.component.css']
})
export class IndiceTitulacionComponent implements OnInit {

  opcionesPeriodo: Array<ItemSelects> = [];
  opcionesPromocion: Array<ItemSelects> = [];
  opcionesPrograma: Array<ItemSelects> = [];
  formularioIndicesTitulacion: FormGroup;
  validacionActiva: boolean = false;
  usuarioLogueado: UsuarioSesion;

  // service
  private _periodoEscolarService;
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
  }

  exportar(): void {
    let pathReport = '{"pathReporteador":"/reports/reporteIndiceTitulacion"}';
    //console.log(pathReport);
    let url;
    this._reporteadorService.postReporteTickets(
      pathReport,
      this.erroresGuardado).subscribe(
      response => {
        //console.log("1");
        //console.log(response.json().ticket);
        let parametros = '/reports/reporteIndiceTitulacion';
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

  private prepareServices(): void {
    this._periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this._programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this._promocionService = this._catalogosService.getPromocion();
    this._reporteadorService = this._catalogosService.getReporteador();
    this.opcionesPeriodo =
      this._periodoEscolarService.
      getSelectPeriodoEscolarPeriodo(this.erroresConsultas);
    this.opcionesPrograma =
      this._programaDocenteService.
      getSelectProgramaDocente(this.erroresConsultas);
    this.opcionesPromocion =
      this._promocionService.
      getSelectPromocion(this.erroresConsultas);

  }


  ngOnInit() {
  }

}
