import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {EvaluacionParteUnoComponent} from '../evaluacion-parte-uno/evaluacion-parte-uno.component';
import {EvaluacionParteDosComponent} from '../evaluacion-parte-dos/evaluacion-parte-dos.component';
import {EvaluacionParteTresComponent} from '../evaluacion-parte-tres/evaluacion-parte-tres.component';
import {EvaluacionParteCuatroComponent} from '../evaluacion-parte-cuatro/evaluacion-parte-cuatro.component';
import {EvaluacionDocente} from '../../services/entidades/evaluacion-docente.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Step} from '../../utils/steps/step';
import {Router} from '@angular/router';
import {EvaluacionDocenteService} from '../../services/entidades/evaluacion-docente.service';
import {RespuestasEvaluacionDocenteService} from '../../services/entidades/respuestas-evaluacion-docente.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {WizardComponent} from '../../wizard/wizard.component';

@Component({
  selector: 'app-evaluacion-steps',
  templateUrl: './evaluacion-steps.component.html',
  styleUrls: ['./evaluacion-steps.component.css']
})
export class EvaluacionStepsComponent implements OnInit {
  public myData: any = {};
  public step: number = 1;
  element = EvaluacionDocente;
  styleSize: string;
  currentStep: Step;
  private alertas: Array<Object> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  respuestas;
  public nombreMateria: String;
  public nombreProfesor: String;

  private isFirst: boolean = true;
  private isLast: boolean = false;

  router: Router;

  @ViewChild('wizard')
  wc: WizardComponent;

  @ViewChild('evaluacionParteUno')
  evaluacionParteUno: EvaluacionParteUnoComponent;

  @ViewChild('evaluacionParteDos')
  evaluacionParteDos: EvaluacionParteDosComponent;

  @ViewChild('evaluacionParteTres')
  evaluacionParteTres: EvaluacionParteTresComponent;

  @ViewChild('evaluacionParteCuatro')
  evaluacionParteCuatro: EvaluacionParteCuatroComponent;

  @ViewChild('modalConfirmacion')
  modalConfirmacion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';


  constructor(
      private _router: Router,
      // private _location: Location,
      // private elementRef: ElementRef,
      // private injector: Injector,
      // private _renderer: Renderer,
      private evaluacionDocenteService: EvaluacionDocenteService,
      private respuestasEvaluacionDocenteService: RespuestasEvaluacionDocenteService
  ) {
    console.log('entre en cons');
    this.router = _router;
    /*this.calculateStyleSize();
    this.currentStep = this.firstStep();
    this.currentStep.ruta.navegar();*/
    this.nombreMateria = sessionStorage.getItem('nombreMateria');
    this.nombreProfesor = sessionStorage.getItem('nombreProfesor');
  }

  ngOnInit() {

  }

  previous(): void {
    console.log('atras');
    this.wc.previous();
    switch (this.wc.activeStepIndex) {
      case 0:
        this.isFirst = true;
      default:
        this.isLast = false;
        break;
    }
    this.cerrarAlerta(0);
  }

  next(): void {
    console.log('siguiente');
    this.wc.toNext();
  }

  onStep1Next(): any {
    if (this.evaluacionParteUno.nextMethod()) {
      this.wc.next();
      this.isFirst = false;
      this.cerrarAlerta(0);
    } else {
      let mensajeError = this.evaluacionParteUno.errorNext;
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true,
        tiempo: 3000
      });
    }
  }

  onStep2Next(): any {
    if (this.evaluacionParteDos.nextMethod()) {
      this.wc.next();
      this.alertas = [];
    } else {
      let mensajeError = this.evaluacionParteDos.errorNext;
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true,
        tiempo: 3000
      });
    }
  }

  onStep3Next(): any {
    if (this.evaluacionParteTres.nextMethod()) {
      this.wc.next();
      this.isLast = true;
      this.alertas = [];
    } else {
      let mensajeError = this.evaluacionParteTres.errorNext;
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true,
        tiempo: 3000
      });
    }
  }

  onStep4Next(): any {
    console.log('ultima parte');
    if (this.evaluacionParteCuatro.finishMethod()) {
      this.wc.next();
      this.alertas = [];
      this.modalConfirmarEvaluacionProfesores();
    } else {
      let mensajeError = this.evaluacionParteCuatro.errorNext;
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true,
        tiempo: 3000
      });
    }
  }

  cancelar(): void {
    sessionStorage.removeItem('idEstudianteMateriaImpartida');
    sessionStorage.removeItem('idProfesor');
    sessionStorage.removeItem('nombreMateria');
    sessionStorage.removeItem('nombreProfesor');
    sessionStorage.clear();
    // let link = ['./EvaluacionProfesores'];
    // this._router.parent.navigate(link);
    this.router.navigate(['alumno', 'evaluacion-docente']);
  }

  private borrarVariablesSession(): void {
    sessionStorage.removeItem('idEstudianteMateriaImpartida');
    sessionStorage.removeItem('idProfesor');
    sessionStorage.removeItem('nombreMateria');
    sessionStorage.removeItem('nombreProfesor');
    sessionStorage.clear();
  }

  confirmar(): void {
    // let link = ['./EvaluacionProfesores'];
    let jsonFormulario;
    let obs = sessionStorage.getItem('respuesta16');

    if (obs === undefined || obs === 'undefined') {
      obs = '';
    }

    let objFormulario = {
      'idEstudianteMateriaImpartida' : parseInt(sessionStorage.getItem('idEstudianteMateriaImpartida')),
      'idProfesor' : parseInt(sessionStorage.getItem('idProfesor')),
      'observaciones' : obs
    };

    sessionStorage.removeItem('respuesta16');
    jsonFormulario = JSON.stringify(objFormulario, null, 2);

    this.evaluacionDocenteService.postEvaluacionDocente(
        jsonFormulario,
        this.erroresConsultas
    ).subscribe(
        response => {
          let json = response.json();
          if (json.id) {
            let objFormularioEvaluacion;
            let jsonFormularioEvaluacion;
            for (let index = 1; index <= 15; index++) {
              let element =  parseInt(sessionStorage.getItem('respuesta'+index));
              objFormularioEvaluacion={
                'idEvaluacion' : json.id,
                'idPreguntaEvaluacion' : index,
                'idRespuestaEvaluacion' : element
              };
              jsonFormularioEvaluacion = JSON.stringify(objFormularioEvaluacion, null, 2);

              this.respuestasEvaluacionDocenteService.postRespuestaEvaluacionDocente(
                  jsonFormularioEvaluacion,
                  this.erroresConsultas
              ).subscribe(
                  response => {
                    // //console.log('Success Add');
                    let resjson = response.json();
                    if (resjson.id) {
                      sessionStorage.removeItem('respuesta'+index);
                    }
                  },
                  console.error,
                  () => {
                  }
              );
            }
          }
        },
        console.error,
        () => {
          this.router.navigate(['alumno', 'evaluacion-docente']);
        }
    );
    this.router.navigate(['alumno', 'evaluacion-docente']);
  }
  modalConfirmarEvaluacionProfesores(): void {
    this.modalConfirma();
  }

  /*private enableGoStep(step: Step): void {
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
  }*/

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  // --------------------------------------MODAL CONFIRMACION---------------------------------------------------//


  private modalConfirma(): void {
    this.modalConfirmacion.open();
  }

  confirmarEvaluacion(): void {
    this.confirmar();
    this.modalConfirmacion.close();
  }

  private cerrarModalConfirma(): void {
    // this.cancelar();
    this.modalConfirmacion.close();
  }

}
