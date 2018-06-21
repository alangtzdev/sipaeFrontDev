import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ItemSelects} from "../../services/core/item-select.model";
import * as moment from "moment";
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ErrorCatalogo} from "../../services/core/error.model";

@Component({
  selector: 'app-plan-estudios-steps-datos-generales',
  templateUrl: './plan-estudios-steps-datos-generales.component.html',
  styleUrls: ['./plan-estudios-steps-datos-generales.component.css']
})
export class PlanEstudiosStepsDatosGeneralesComponent implements OnInit {

  formulario: FormGroup;
  edicionFormulario: boolean = false;
  mensajeErrors: any = { 'required': 'Este campo es requerido' };
  enableValidation: boolean = false;
  errorNext: string = '';
  catProgramaDocente;
  catEstatus;
  planEstudiosService;
  idPlanEstudios;
  entidadPlanEstudios = PlanEstudio;
  idFormularioGuardado;
  validacionActiva: boolean = false;
  planEstudiosDescripcion;

  ////// picker ///
  public dt: Date = new Date();

  private opcionesEstatus: Array<ItemSelects> = [];
  private opcionesProgramaDocente: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(public _catalogosServices: CatalogosServices,
              route: ActivatedRoute,
              public _estatusService: EstatusCatalogoService,
              private _router: Router, private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    // con esta linea se obtienen los parametros del padre
    // _router = Primero = esta clase Step
    // _router.parent = FormularioStep = donde se mandan llamar y configurar los steps
    // _router.parent.parent = ShowCase = clase que manda llamar el formulario step y
    //  donde se declaran los parametros (:id) para el step en caso de requerirse

    this.prepareService();
    this.formulario = new FormGroup({
      clave: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      descripcion: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      idProgramaDocente: new FormControl('', Validators.required),
      fechaAprobacion: new FormControl(''),
      anioInicio: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.anio])
      ),
      anioFin: new FormControl('', Validators.compose([
        Validacion.anio])
      ),
      modalidad: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      duracionCiclo: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      objectivos: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      perfilEgresado: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      /* horasDocente: new FormControl(''),
       horasIndependiente: new FormControl(''),
       numeroAsignaturas: new FormControl(''),
       sumaCreditos: new FormControl(''),*/
      creditosTesis: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.numerosValidator])
      ),
      /*totalCreditos: new FormControl(''),*/
      idEstatus: new FormControl('', Validators.required),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });

    if (this.idPlanEstudios) {
      let planEstudios: PlanEstudio;
      this.edicionFormulario = true;
      this.entidadPlanEstudios = this.planEstudiosService.getEntidadPlanEstudio(
        this.idPlanEstudios,
        this.erroresConsultas
      ).subscribe(
        response => planEstudios = new PlanEstudio(response.json()),
        error => {
          console.error(error);
//            console.error(errores);
        },
        () => {
          //console.log(planEstudios);
          if (this.formulario) {
            let stringClave = 'clave';
            let stringDescripcion = 'descripcion';
            let stringIdProgramaDocente = 'idProgramaDocente';
            let stringFechaAprobacion = 'fechaAprobacion';
            let stringAnioInicio = 'anioInicio';
            let stringanioFin = 'anioFin';
            let stringmodalidad = 'modalidad';
            let stringduracionCiclo = 'duracionCiclo';
            let stringobjectivoso = 'objectivos';
            let stringperfilEgresado = 'perfilEgresado';
            /*let stringhorasDocente = 'horasDocente';
             let stringhorasIndependiente = 'horasIndependiente';
             let stringnumeroAsignaturas = 'numeroAsignaturas';
             let stringsumaCreditos = 'sumaCreditos';*/
            let stringcreditosTesis = 'creditosTesis';
            //let stringtotalCreditos = 'totalCreditos';
            let stringidEstatus = 'idEstatus';

            let fechaAprobacionRecuperar = moment(planEstudios.fechaAprobacion);

            (<FormControl>this.formulario.controls[stringClave])
              .setValue(planEstudios.clave);
            (<FormControl>this.formulario.controls[stringDescripcion])
              .setValue(planEstudios.descripcion);
            (<FormControl>this.formulario.controls[stringIdProgramaDocente])
              .setValue(planEstudios.programaDocente.id);
            (<FormControl>this.formulario.controls[stringAnioInicio])
              .setValue(planEstudios.anioInicio);
            (<FormControl>this.formulario.controls[stringanioFin])
              .setValue(planEstudios.anioFin);
            (<FormControl>this.formulario.controls[stringmodalidad])
              .setValue(planEstudios.modalidad);
            (<FormControl>this.formulario.controls[stringduracionCiclo])
              .setValue(planEstudios.duracionCiclo);
            (<FormControl>this.formulario.controls[stringobjectivoso])
              .setValue(planEstudios.objectivos);
            (<FormControl>this.formulario.controls[stringperfilEgresado])
              .setValue(planEstudios.perfilEgresado);
            /*(<FormControl>this.formulario.controls[stringhorasDocente])
             .setValue(planEstudios.horasDocente);
             (<FormControl>this.formulario.controls[stringhorasIndependiente])
             .setValue(planEstudios.horasIndependiente);
             (<FormControl>this.formulario.controls[stringnumeroAsignaturas])
             .setValue(planEstudios.numeroAsignaturas);
             (<FormControl>this.formulario.controls[stringsumaCreditos])
             .setValue(planEstudios.sumaCreditos);*/
            (<FormControl>this.formulario.controls[stringcreditosTesis])
              .setValue(planEstudios.creditosTesis);
            /* (<FormControl>this.formulario.controls[stringtotalCreditos])
             .setValue(planEstudios.totalCreditos);*/
            (<FormControl>this.formulario.controls[stringidEstatus])
              .setValue(planEstudios.estatus.id);
            //console.log(this.formulario);
            this.planEstudiosDescripcion =
              planEstudios.clave + ' ' + planEstudios.descripcion;
            //console.log(this.planEstudiosDescripcion);

            this.dt = new Date(fechaAprobacionRecuperar.toJSON());

          }
        }
      );
    }

  }

  getFechaAprobacion(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaAprobacion'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  nextMethod(): boolean {
    let idPlanEstudiosGuardado;
    //console.log('next');
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    //console.log(jsonFormulario);
    if (this.validarFormulario()) {
      this._spinner.start("datosgenerales1");
      if (this.idPlanEstudios) {
        this.planEstudiosService
          .putPlanEstudio(
            this.idPlanEstudios,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this._spinner.stop("datosgenerales1");
          }
        );

        return true;
      } else {
        this.planEstudiosService
          .postPlanEstudio(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          console.error,
          () => {
            //console.log('Registro finalizado :)');
//            console.warn('idFormularioGuardado', idFormularioGuardado);
            this._spinner.stop("datosgenerales1");
          }
        );

        return true;
      }
    } else {
      //alert('error en el formulario');

    }
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
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
    return (<FormControl>this.formulario.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareService(): void {
    this.catEstatus = this._catalogosServices.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    //console.log(urlParameter);
    this.opcionesEstatus =
      this._estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);

    this.catProgramaDocente = this._catalogosServices.getCatalogoProgramaDocente();
    this.opcionesProgramaDocente = this.catProgramaDocente.getSelectProgramaDocente();
    this.planEstudiosService = this._catalogosServices.getPlanEstudios();
  }

  ngOnInit() {
  }

}
