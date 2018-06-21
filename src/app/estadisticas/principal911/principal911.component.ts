import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {ItemSelects} from "../../services/core/item-select.model";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {PeriodoEscolar} from "../../services/entidades/periodo-escolar.model";
import {Validacion} from "../../utils/Validacion";
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'principal911',
  templateUrl: './principal911.component.html',
  styleUrls: ['./principal911.component.css']
})
export class Principal911Component {

  opcionesPeriodo: Array<ItemSelects> = [];
  opcionesPeriodoFinal: Array<ItemSelects> = [];
  opcionesPrograma: Array<ItemSelects> = [];
  opcionesCiclosEscolares: Array<ItemSelects> = [];
  formulario911: FormGroup;
  validacionActiva: boolean = false;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  usuarioLogueado: UsuarioSesion;
  // service
  private _periodoEscolarService;
  private _reporteadorService;
  private _programaDocenteService;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private authService: AuthService,
              private _renderer: Renderer,
              private _catalogosService: CatalogosServices,
              private router: Router) {
    this.prepareServices();
    this.obtenerCiclosEscolares();
    this.usuarioLogueado = authService.getUsuarioLogueado();
    // console.log(this.usuarioLogueado);
    this.formulario911 = new FormGroup({
      id: new FormControl('', Validators.required),
      periodoInicio: new FormControl('', Validators.required),
      periodoFin: new FormControl('', Validators.required),
      ciclo: new FormControl(''),
      programa: new FormControl('', Validators.required)
    });
  }

  exportar(reporte: string, periodoInicio: string, periodoFin: string): void {

    if (reporte === 'reporte9119' || reporte === '911_10') {
      (<FormControl>this.formulario911.
        controls['programa']).setValue('0');
    }

    if (this.validarFormulario()) {
      /*(<FormControl>this.formulario911.
       controls['programa']).updateValue();*/
      // console.log('se va a imprimir reporte');

      let programaDocente = this.getControl('programa').value;
      let pathReport: string;
      let pathReportObtenerTicket: string;
      // console.log(pathReport);

      pathReportObtenerTicket = '/reports/' + reporte;
      pathReport = pathReportObtenerTicket;
      switch (reporte) {
        case '911_10':
          pathReport += '&idPeriodoUno=' + periodoInicio +
            '&idPeriodoDos=' + periodoFin;
          break;
        case 'reporte9119':
          pathReport += '&id_periodo_escolar_inicio_=' + periodoInicio +
            '&id_periodo_escolar_fin=' + periodoFin;
          break;
        case 'reporte911_9A':
          pathReport += '&idPeriodoUno=' + periodoInicio +
            '&idPeriodoDos=' + periodoFin +
            '&idPrograma_docente=' + programaDocente;
          break;
        case 'reporte911_9B':
          pathReport += '&id_periodo_1=' + periodoInicio +
            '&id_periodo_2=' + periodoFin +
            '&id_programa_docente=' + programaDocente;
          break;
        default:
          break;

      }
      let url;
      let pathReportJSON = '{"pathReporteador":"' + pathReportObtenerTicket + '"}';

      this._reporteadorService.postReporteTickets(
        pathReportJSON,
        this.erroresGuardado).subscribe(
        response => {
          //console.log("1");
          //console.log(response.json().ticket);
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

  validarFormulario(): boolean {
    // console.log(this.formulario911.value);
    if (this.formulario911.valid) {
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
    return (<FormControl>this.formulario911.controls[campo]);
  }

  obtenerCiclosEscolares(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    // console.log('url:  ' + urlParameter);
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
          let periodoRepetido: PeriodoEscolar;

          periodo = new PeriodoEscolar(item);

          this.opcionesCiclosEscolares.forEach((listaPeriodos) => {
            periodoRepetido = new PeriodoEscolar(listaPeriodos);
            if (!bandera) {
              if (periodo.anio == periodoRepetido.anio) {
                bandera = true;
              }
            }

          });

          if (!bandera) {
            this.opcionesCiclosEscolares.push(
              new ItemSelects(annio, periodo.anio));

          }

        });
      }
    );

  }

  cambioPeriodoFin(idPeriodoInicio: number): void {
    let periodoInicio: PeriodoEscolar;

    this._periodoEscolarService.getEntidadPeriodoEscolar(
      idPeriodoInicio,
      this.erroresConsultas
    ).subscribe(
      response => {
        periodoInicio = new PeriodoEscolar(response.json());
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set(
          'criterios',
          'inicioCurso~' + periodoInicio.getInicioCursoConFormato() + ':MAYOR');
        this.opcionesPeriodoFinal = this._periodoEscolarService
          .getSelectPeriodoEscolarPeriodoCriterios(this.erroresConsultas, urlParameter);

      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
      }
    );

  }

  obtenerProgramaDocente(reporte: string): void {
    let nivelEstudios: string = '';
    if (reporte == 'reporte911_9A') {
      nivelEstudios = 'Licenciatura:IGUAL';
    } else if (reporte == 'reporte911_9B') {
      nivelEstudios = 'Licenciatura:NOT';
    }

    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEstatus~1007:IGUAL,idNivelEstudios.descripcion~' + nivelEstudios;
    urlParameter.set('criterios', criterio);
    this.opcionesPrograma =
      this._programaDocenteService.
      getSelectProgramaDocente(this.erroresConsultas, urlParameter);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario911.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this._periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this._reporteadorService = this._catalogosService.getReporteador();
    this._programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEstatus~' + '1007' + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesPeriodo = this._periodoEscolarService.getSelectPeriodoEscolarPeriodo(
      this.erroresConsultas);
  }

}
