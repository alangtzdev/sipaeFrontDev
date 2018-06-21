import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {FormGroup} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'eficienciaTerminal',
  templateUrl: './eficiencia-terminal.component.html',
  styleUrls: ['./eficiencia-terminal.component.css']
})
export class EficienciaTerminalComponent implements OnInit {
  opcionesPeriodo: Array<ItemSelects> = [];
  opcionesPeriodoFinal: Array<ItemSelects> = [];
  formularioEficienciaTerminal: FormGroup;
  validacionActiva: boolean = false;
  usuarioLogueado: UsuarioSesion;

  // service
  private _periodoEscolarService;
  private _reporteadorService;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private authService :AuthService,
              private _renderer: Renderer,
              private _catalogosService: CatalogosServices,
              private router: Router) {
    this.prepareServices();
    this.usuarioLogueado = authService.getUsuarioLogueado();
  }

  exportar(): void {
    //console.log('se va a imprimir reporte');
    let pathReport = '{"pathReporteador":"/reports/reporteEficienciaTerminal"}';
    //console.log(pathReport);
    let url;

    this._reporteadorService.postReporteTickets(
      pathReport,
      this.erroresGuardado).subscribe(
      response => {
        //console.log("1");
        //console.log(response.json().ticket);
        let parametros = '/reports/reporteEficienciaTerminal';
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

  cambioPeriodoFin(fechaInicio: string): void {
    let stringFechaPeriodo = 'periodoFin';
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'inicioCurso~' + fechaInicio + ':MAYOR');
    this.opcionesPeriodoFinal = this._periodoEscolarService
      .getSelectPeriodoEscolarPeriodoFecha(this.erroresConsultas, false, urlParameter);
  }

  private prepareServices(): void {
    this._periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this._reporteadorService = this._catalogosService.getReporteador();
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idCatalogo~' + '1004' + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesPeriodo = this._periodoEscolarService.
    getSelectPeriodoEscolarPeriodoFecha(this.erroresConsultas, true);

  }

  ngOnInit() {
  }

}
