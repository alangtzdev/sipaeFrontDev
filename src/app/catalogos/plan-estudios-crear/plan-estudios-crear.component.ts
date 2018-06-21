import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import * as moment from "moment";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ErrorCatalogo} from "../../services/core/error.model";

@Component({
  selector: 'app-plan-estudios-crear',
  templateUrl: './plan-estudios-crear.component.html',
  styleUrls: ['./plan-estudios-crear.component.css']
})
export class PlanEstudiosCrearComponent implements OnInit {

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
  private sub: any;
  validacionActiva: boolean = false;

  ////// picker ///
  public dt: Date = new Date();

  private opcionesEstatus: Array<ItemSelects> = [];
  private opcionesProgramaDocente: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(public _catalogosServices: CatalogosServices,
              route: ActivatedRoute,
              public _estatusService: EstatusCatalogoService,
              private _router: Router, private _spinner: SpinnerService) {
    // con esta linea se obtienen los parametros del padre
    // _router = Primero = esta clase Step
    // _router.parent = FormularioStep = donde se mandan llamar y configurar los steps
    // _router.parent.parent = ShowCase = clase que manda llamar el formulario step y
    //  donde se declaran los parametros (:id) para el step en caso de requerirse
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    ////console.log(params.id);
    this.prepareService();
    moment.locale('es');
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
      horasDocente: new FormControl(0),
      horasIndependiente: new FormControl(0),
      numeroAsignaturas: new FormControl(0),
      sumaCreditos: new FormControl(0),
      creditosTesis: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.numerosValidator])
      ),
      totalCreditos: new FormControl(0),
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
        },
        () => {
          ////console.log(planEstudios);
        }
      );
    }

  }

  getFechaFechaAprobacion(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaAprobacion'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  cancelar(): any {
    this._router.navigate(['/catalogo/plan-estudios']);
  }

  enviarFormulario(): void {
    let idPlanEstudiosGuardado;
    // //console.log('next');
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    ////console.log(jsonFormulario);
    if (this.validarFormulario()) {
      this._spinner.start("planestudioscrear1");
      this.planEstudiosService
        .postPlanEstudio(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        () => {}, //console.log('Success'),
          error => {
            console.error(error);
            this._spinner.stop('planestudioscrear1');
          },
        () => {
          this._spinner.stop("planestudioscrear1");
          this.cancelar();
        }
      );
      this._router.navigate(['/catalogo/plan-estudios']);

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
    ////console.log(urlParameter);
    this.opcionesEstatus =
      this._estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);

    this.catProgramaDocente = this._catalogosServices.getCatalogoProgramaDocente();
    urlParameter.set('criterios', 'idEstatus~1007' + ':IGUAL');
    // 1004 id del catalogo de estatus
    ////console.log(urlParameter);
    this.opcionesProgramaDocente =
      this.catProgramaDocente.getSelectProgramaDocente(this.erroresConsultas, urlParameter);
    this.planEstudiosService = this._catalogosServices.getPlanEstudios();
  }


  ngOnInit() {
  }

}
