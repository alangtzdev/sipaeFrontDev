import {Component, OnInit, ViewChild} from '@angular/core';
import {ErrorCatalogo} from "../../services/core/error.model";
import {Router, ActivatedRoute} from "@angular/router";
import {TipoStep} from "../../utils/steps/modelos/tipo-step";
import {Step} from "../../utils/steps/step";
import {EstadoStep} from "../../utils/steps/modelos/estado-step";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {RutaStep} from "../../utils/steps/modelos/ruta-step";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {PlanEstudiosStepsDatosGeneralesComponent} from "../plan-estudios-steps-datos-generales/plan-estudios-steps-datos-generales.component";
import {PlanEstudiosStepsDocumentacionComponent} from "../plan-estudios-steps-documentacion/plan-estudios-steps-documentacion.component";
import {PlanEstudiosStepsMateriasComponent} from "../plan-estudios-steps-materias/plan-estudios-steps-materias.component";
import {PlanEstudiosStepsIdiomasComponent} from "../plan-estudios-steps-idiomas/plan-estudios-steps-idiomas.component";
import {WizardComponent} from '../../wizard/wizard.component';

@Component({
  selector: 'app-plan-estudios-editar',
  templateUrl: './plan-estudios-editar.component.html',
  styleUrls: ['./plan-estudios-editar.component.css'],
  styles: [

    '.card-footer {display:  none!important; }'

  ]
})
export class PlanEstudiosEditarComponent implements OnInit {
  steps: Array<Step>;
  @ViewChild('wizard')
  wc : WizardComponent;
  @ViewChild('componentPrimero') componentPrimero: PlanEstudiosStepsDatosGeneralesComponent;
  @ViewChild('componentTercero') componentTercero: PlanEstudiosStepsIdiomasComponent;
  @ViewChild('componentUltimo') componentUltimo: PlanEstudiosStepsMateriasComponent;
  @ViewChild('componentSegundo') componentSegundo: PlanEstudiosStepsDocumentacionComponent;
  styleSize: string;
  currentStep: Step;
  idFormularioGuardado;
  formularioPlanEstudios;
  planEstudiosDescripcion;
  planEstudiosService;
  idPlanEstudios;
  private alertas: Array<Object> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private sub: any;
  isFirst: boolean = true;
  isLast: boolean = false;


  constructor(private _router: Router, route: ActivatedRoute,
              public _catalogosService: CatalogosServices) {
    this.prepareServices();
    //console.log(params);
/*    let primero = new Step(
      1, 'Datos Generales', TipoStep.FIRST,
      EstadoStep.ACTIVO, new RutaStep('DatosGeneralesPlanEstudio', _router)
    );
    let segundo = new Step(
      2, 'Documentación', TipoStep.STEP,
      EstadoStep.INACTIVO, new RutaStep('Documentacion', _router)
    );
    let tercero = new Step(
      3, 'Idiomas', TipoStep.STEP,
      EstadoStep.INACTIVO, new RutaStep('IdiomasPlanEstudios', _router)
    );
    let ultimo = new Step(
      4, 'Materias', TipoStep.FINAL,
      EstadoStep.INACTIVO, new RutaStep('MateriasPlanEstudios', _router)
    );

    this.steps = [
      primero,
      segundo,
      tercero,
      ultimo
    ];
    this.calculateStyleSize();
    this.currentStep = this.firstStep();
    this.currentStep.ruta.navegar();*/
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });


//    this.idPlanEstudios = Number(params.get('id'));

    this.planEstudiosService.getEntidadPlanEstudio(
      this.idPlanEstudios,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.planEstudiosDescripcion
          = new PlanEstudio(response.json());
        this.planEstudiosDescripcion =
          this.planEstudiosDescripcion.clave + ' - ' +
          this.planEstudiosDescripcion.programaDocente.descripcion;
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
      }
    );
  }
  previous(){
    this.wc.previous();
    switch (this.wc.activeStepIndex) {
      case 0:
        this.isFirst = true;
      default:
        this.isLast = false;
        break;
    }
  }

  next(){
    //console.log(this.wc);
    this.wc.toNext();
  }

  onStep1Next(): any {
    if(this.componentPrimero.nextMethod()) {
      this.wc.next();
      this.isFirst = false;
      this.componentUltimo.formulario.controls['creditosTesis'].setValue(
          this.componentPrimero.formulario.controls['creditosTesis'].value
      );
      this.componentUltimo.creditosTesis =
          +this.componentPrimero.formulario.controls['creditosTesis'].value;
      this.componentUltimo.onCambiosMateriasPlanEstudios();
    }
  }
  onStep2Next(): any {
    if(this.componentSegundo.nextMethod())
      this.wc.next();
  }
  onStep3Next(): any {
    if(this.componentTercero.nextMethod()) {
      this.wc.next();
      this.isLast = true;
    }
  }

  onStep4Next(): any {
    if(this.componentUltimo.finishMethod())
      this.wc.next();
  }

  cancelar(): void {
    this._router.navigate(['catalogo','plan-estudios']);
  }

  private enableGoStep(step: Step): void {
    switch (step.estado) {
      case EstadoStep.COMPLETO:
        return this.goStep(step);
      case EstadoStep.ACTIVO:
      case EstadoStep.INACTIVO:
      default:
        break;
    }
  }

  private goStep(step: Step): void {
    this.currentStep = step;
    if (this.currentStep.estado !== EstadoStep.COMPLETO) {
      this.currentStep.estado = EstadoStep.ACTIVO;
    }
    this.currentStep.ruta.navegar();
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

/*  private previusStep(): void {
    let funcionPrevius: boolean = this.currentStep.previusMethod();
    let mensajeError: string = this.currentStep.errorPrevius;
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'Documentacion':
        funcionPrevius = this.componentSegundo.previusMethod();
        mensajeError = '';
        break;
      case 'IdiomasPlanEstudios':
        funcionPrevius = this.componentTercero.previusMethod();
        mensajeError = '';
        break;
      case 'MateriasPlanEstudios':
        funcionPrevius = this.componentUltimo.previusMethod();
        mensajeError = '';
        break;
      default:
        break;
    }

    if (funcionPrevius) {
      let current = this.currentStep.orden - 1;
      this.steps.forEach((step: Step) => {
        if (step.orden === current) {
          this.currentStep = step;
          if (this.currentStep.estado !== EstadoStep.COMPLETO) {
            this.currentStep.estado = EstadoStep.ACTIVO;
          }
          this.currentStep.ruta.navegar();
        }
      });
    } else {
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true,
        tiempo: 3000
      });
    }
  }*/

/*  private nextStep(): void {
    let funcionNext: boolean = this.currentStep.nextMethod();
    let mensajeError: string = this.currentStep.errorNext;
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'DatosGeneralesPlanEstudio':
        funcionNext = this.componentPrimero.nextMethod();
        mensajeError = this.componentPrimero.errorNext;
        if (funcionNext) {
          this.idFormularioGuardado = this.componentPrimero.idFormularioGuardado;
          //console.log(this.idFormularioGuardado);
        }
        break;
      case 'Documentacion':
        funcionNext = this.componentSegundo.nextMethod(this.idFormularioGuardado);
        mensajeError = '';
        break;
      case 'IdiomasPlanEstudios':
        funcionNext = this.componentTercero.nextMethod(this.idFormularioGuardado);
        mensajeError = '';
        break;
      default:
        break;
    }

    if (funcionNext) {

      this.alertas = [];
      let current = this.currentStep.orden + 1;
      this.currentStep.estado = EstadoStep.COMPLETO;
      this.steps.forEach((step: Step) => {
        if (step.orden === current) {
          this.currentStep = step;
          if (this.currentStep.estado !== EstadoStep.COMPLETO) {
            this.currentStep.estado = EstadoStep.ACTIVO;
          }
          this.currentStep.ruta.navegar();
        }
      });
    } else {
      /!*this.alertas.push({
       type: 'danger',
       msg: mensajeError,
       closable: true
       });*!/
    }
  }*/

/*  private finishStep(): void {
    let funcionFinish: boolean = this.currentStep.finishMethod();
    let mensajeError: string = this.currentStep.errorFinish;
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'MateriasPlanEstudios':
        funcionFinish = this.componentUltimo.finishMethod();
        mensajeError = '';
        break;
      default:
        break;
    }

    if (funcionFinish) {
      let firstStep: Step;
      this.steps.forEach((step: Step) => {
        if (step.tipo === TipoStep.FIRST) {
          firstStep = step;
        }
        if (step.tipo === TipoStep.STEP || step.tipo === TipoStep.FINAL) {
          step.estado = EstadoStep.INACTIVO;
        }
      });
      this.currentStep = firstStep;
      this.currentStep.estado = EstadoStep.ACTIVO;
      this.currentStep.ruta.navegar().then(() => {
        this.alertas.push({
          type: 'success',
          msg: 'Se finalizo satisfactoriamente el formulario step',
          closable: true
        });
      });
    } else {
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true,
        tiempo: 3000
      });
    }
  }*/

  private enablePreviusButton(step: Step): boolean {
    switch (step.tipo) {
      case TipoStep.STEP:
      case TipoStep.FINAL:
        return true;
      case TipoStep.FIRST:
      default:
        return false;
    }
  }

  private enableNextButton(step: Step): boolean {
    switch (step.tipo) {
      case TipoStep.STEP:
      case TipoStep.FIRST:
        return true;
      case TipoStep.FINAL:
      default:
        return false;
    }
  }

  private calculateStyleSize(): void {
    this.styleSize = (100 / this.steps.length).toFixed(2);
  }

  /*private firstStep(): Step {
    let firsStep, lastStep: Step;
    let foundFirstStep = false;
    let foundLastStep = false;
    this.steps.forEach((step: Step) => {
      if (step.tipo === TipoStep.FIRST) {
        if (!foundFirstStep) {
          firsStep = step;
        } else {
          throw 'Se debe declarar solamente un Step de tipo FIRST';
        }
      }
      if (step.tipo === TipoStep.FINAL) {
        if (!foundLastStep) {
          lastStep = step;
        } else {
          throw 'Se debe declarar solamente un Step de tipo FINAL';
        }
      }
    });
    if (!firsStep) {
      throw 'Se debe declarar un Step de tipo FIRST';
    }
    if (!lastStep) {
      throw 'Se debe declarar un Step de tipo FINAL';
    }
    return firsStep;
  }*/

  private prepareServices(): void {
    this.planEstudiosService = this._catalogosService.getPlanEstudios();
  }  ngOnInit() {
  }

}
