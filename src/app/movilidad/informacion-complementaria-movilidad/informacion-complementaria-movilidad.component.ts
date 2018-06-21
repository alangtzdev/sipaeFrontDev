import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {MovilidadCurricular} from "../../services/entidades/movilidad-curricular.model";
import {InformacionComplementariaMovilidad} from "../../services/entidades/informacion-complementaria-movilidad.model";
import {ConfigService} from "../../services/core/config.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {MovilidadCurricularService} from "../../services/entidades/movilidad-curricular.service";
import {InformacionComplementariaMovilidadService} from "../../services/entidades/informacion-complementaria-movilidad.service";
import {Router, ActivatedRoute} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-informacion-complementaria-movilidad',
  templateUrl: './informacion-complementaria-movilidad.component.html',
  styleUrls: ['./informacion-complementaria-movilidad.component.css']
})
export class InformacionComplementariaMovilidadComponent implements OnInit {

  entidadMovilidadCurricular: MovilidadCurricular;
  formularioInformacion: FormGroup;
  activarGuardarCancelar: boolean = false;
  validacionActiva: boolean = false;
  vistaAnteriorRegresar;
  catalogoServices;
  periodoEscolarService;
  infoComplementaria: InformacionComplementariaMovilidad;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: true,
    authToken: localStorage.getItem('token')
  };
  private opcionesCatalogoPeriodoEscolar: Array<ItemSelects>;
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private idMovilidadCurricular: number;
  private sub: any;

  constructor(private _spinner: SpinnerService, route: ActivatedRoute,
              private _archivoService: ArchivoService,
              private _movilidadCurricularService: MovilidadCurricularService,
              private _informacionComplementaria: InformacionComplementariaMovilidadService,
              private _router: Router,
              private _catalogosService: CatalogosServices) {
    this.sub = route.params.subscribe(params => {
      this.idMovilidadCurricular = +params['id']; // (+) converts string 'id' to a number
      this.vistaAnteriorRegresar = params['vistaAnterior'];

      // In a real app: dispatch action to load the details here.
    });
    console.log(this.vistaAnteriorRegresar);
    this.inicializarFormulario();
    this.getMovilidad();
    this.prepareServices();
  }

  inicializarFormulario() {
    this.formularioInformacion = new FormGroup({
      //creditos: new FormControl(),
      //calendario: new FormControl(),
      //observaciones: new FormControl(),
      idMovilidad: new FormControl(this.idMovilidadCurricular),
      periodoInstitucion: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      institucionReceptora: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      calendarioInstitucion: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      abreviadoInstitucion: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      //idPeriodo: new FormControl(),
      profesorUno: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      profesorDos: new FormControl(''),
      creditosInstitucion: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      programaDocenteInstitucion: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      calificacionColsanEquivalencia: new FormControl('', Validators.compose([
        Validacion.calificacionValidator])),
    });
  }

  getMovilidad() {
    this._movilidadCurricularService
      .getEntidadMovilidadCurricular(
        this.idMovilidadCurricular,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadMovilidadCurricular
          = new MovilidadCurricular(response.json());
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
          console.error(this.erroresConsultas);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log(this.entidadMovilidadCurricular);
        }*/
        this.obtenerInformacionComplementaria();
      }
    );
  }

  regresarListaHistorialSolicitudes(): any {
    this._router.navigate(['movilidad-academica', this.vistaAnteriorRegresar]);
  }

  obtenerInformacionComplementaria(): void {
    this._spinner.start('obtenerInfocomplementaria');
    let urlParams = new URLSearchParams();
    urlParams.set('criterios', 'idMovilidad.id~' + this.idMovilidadCurricular + ':IGUAL');
    this._informacionComplementaria.getListaInformacionComplementariaMovilidadOpcional(
      this.erroresConsultas,
      urlParams,
      false
    ).subscribe(
      response => {
        if (response.json().lista.length > 0) {
          this.infoComplementaria = new InformacionComplementariaMovilidad(
            response.json().lista[0]);
          this.llenarCampos();
        }

      },
      error => {
        /*if (assertionsEnabled()) {
          console.log(error);
        }*/
        this._spinner.stop('obtenerInfocomplementaria');
      },
      () => {
        this._spinner.stop('obtenerInfocomplementaria');
      });
  }

  llenarCampos(): void {
    if (this.infoComplementaria) {
      (<FormControl>this.formularioInformacion.controls['periodoInstitucion']).patchValue(
        this.infoComplementaria.periodoInstitucion);
      (<FormControl>this.formularioInformacion.controls['institucionReceptora']).patchValue(
        this.infoComplementaria.institucionReceptora);
      (<FormControl>this.formularioInformacion.controls['calendarioInstitucion']).patchValue(
        this.infoComplementaria.calendarioInstitucion);
      (<FormControl>this.formularioInformacion.controls['abreviadoInstitucion']).patchValue(
        this.infoComplementaria.abreviadoInstitucion);
      (<FormControl>this.formularioInformacion.controls['profesorUno']).patchValue(
        this.infoComplementaria.profesorUno);
      (<FormControl>this.formularioInformacion.controls['profesorDos']).patchValue(
        this.infoComplementaria.profesorDos);
      (<FormControl>this.formularioInformacion.controls['creditosInstitucion']).patchValue(
        this.infoComplementaria.creditosInstitucion);
      (<FormControl>this.formularioInformacion.controls['calificacionColsanEquivalencia']).
      patchValue(this.infoComplementaria.calificacionColsanEquivalencia);
      (<FormControl>this.formularioInformacion.controls['programaDocenteInstitucion']).
      patchValue(this.infoComplementaria.programaDocenteInstitucion);
    }
  }

  validarFormulario(): boolean {
    if (this.formularioInformacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  guardarInformacionComplementaria() {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formularioInformacion.value, null, 2);
      //console.log('JSOOOOOOOOON' + jsonFormulario);

      if (this.infoComplementaria) {
        this._informacionComplementaria.putInformacionComplementariaMovilidad(
          this.infoComplementaria.id, jsonFormulario, this.erroresGuardado
        ).subscribe(
          response => {},
          error => {
            console.error(error);
          },
          () => {
            this.regresarListaHistorialSolicitudes();
          }
        );
      }else {
        this._informacionComplementaria
          .postInformacionComplementariaMovilidad(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {},
          error => {
            console.error(error);
          },
          () => {
            this.regresarListaHistorialSolicitudes();
          }
        );
      }
    }
  }

  activarBotonBusqueda(): boolean {
    if (this.activarGuardarCancelar) {
      return true;
    }else {
      return false;
    }
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop('verArchivo');
          },
          () => {
            console.info('OK');
            this._spinner.stop('verArchivo');
          }
        );
    }
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop('descargarArchivo');
          },
          () => {
            //console.info('OK');
            this._spinner.stop('descargarArchivo');
          }
        );
    }

  }
  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioInformacion.controls[campo]);
  }
  private errorMessage(control: FormControl): string {
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
  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioInformacion.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }
  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.periodoEscolarService = this.catalogoServices.getPeriodoEscolar();
    this.opcionesCatalogoPeriodoEscolar =
      this.periodoEscolarService.getSelectPeriodoEscolarPeriodo(this.erroresConsultas);
  }

  ngOnInit() {
  }

}
