import {Component, OnInit, ViewChild} from '@angular/core';
import {TipoStep} from "../../utils/steps/modelos/tipo-step";
import {Step} from "../../utils/steps/step";
import {EstadoStep} from "../../utils/steps/modelos/estado-step";
import {RutaStep} from "../../utils/steps/modelos/ruta-step";
import {Profesor} from "../../services/entidades/profesor.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Router, ActivatedRoute} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ProfesorStepsClasificacionComponent} from "../profesor-steps-clasificacion/profesor-steps-clasificacion.component";
import {ProfesorStepsDatosGeneralesComponent} from "../profesor-steps-datos-generales/profesor-steps-datos-generales.component";
import {ProfesorStepsDatosAcademicosComponent} from "../profesor-steps-datos-academicos/profesor-steps-datos-academicos.component";
import {ProfesorStepsDatosComplementariosComponent} from "../profesor-steps-datos-complementarios/profesor-steps-datos-complementarios.component";
import {WizardComponent} from "../../wizard/wizard.component";

@Component({
  selector: 'app-profesor-editar',
  templateUrl: './profesor-editar.component.html',
  styleUrls: ['./profesor-editar.component.css'],
  styles: [

    '.card-footer {display:  none!important; }'

  ]
})
export class ProfesorEditarComponent implements OnInit {
  steps: Array<Step>;
  styleSize: string;
  currentStep: Step;
  formularioProfesor;
  idFormularioGuardado;
  private alertas: Array<Object> = [];
  entidadProfesor;
  idProfesor;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  profesorService;
  private sub: any;
  isFirst: boolean = true;
  isLast: boolean = false;

  @ViewChild('wizard')
  wc : WizardComponent ;



  @ViewChild('clasificacion')
  clasificacion : ProfesorStepsClasificacionComponent;

  @ViewChild('datosGenerales')
  datosGenerales : ProfesorStepsDatosGeneralesComponent;

  @ViewChild('datosAcademicos')
  datosAcademicos : ProfesorStepsDatosAcademicosComponent;

  @ViewChild('datosComplementarios')
  datosComplementarios : ProfesorStepsDatosComplementariosComponent;

  constructor(private _router: Router,
              route: ActivatedRoute, public _catalogosService: CatalogosServices) {
    this.prepareServices();

    this.sub = route.params.subscribe(params => {
      this.idProfesor = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });


    this.profesorService.getEntidadProfesor(
      this.idProfesor,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadProfesor
          = new Profesor(response.json());
        this.entidadProfesor = this.entidadProfesor.nombre +
          ' ' + this.entidadProfesor.primerApellido + ' '
          + this.entidadProfesor.segundoApellido;
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
    console.log(this.wc);
    this.wc.toNext();
  }

  onStep1Next(): any {
    if(this.clasificacion.nextMethod()) {
      this.wc.next();
      this.isFirst = false;
    }
  }
  onStep2Next(): any {
    if(this.datosGenerales.nextMethod())
      this.wc.next();
  }
  onStep3Next(): any {
    if(this.datosAcademicos.nextMethod()) {
      this.wc.next();
      this.isLast = true;
    }
  }

  onStep4Next(): any {
    if(this.datosComplementarios.finishMethod())
      this.wc.next();
  }
  cancelar(): void {
    this._router.navigate(['catalogo','profesores']);
  }
  ngOnInit() {
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

  private prepareServices(): void {
    this.profesorService = this._catalogosService.getProfesor();
  }

}
