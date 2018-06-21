import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {EvaluacionDocenteIdiomas} from '../../services/entidades/evaluacion-docente-idiomas.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Router} from '@angular/router';
import {EvaluacionDocenteIdiomasService} from '../../services/entidades/evaluacion-docente-idiomas.service';
import {RespuestasEvaluacionDocenteIdiomasService} from '../../services/entidades/respuestas-evaluacion-docente-idiomas.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {WizardComponent} from '../../wizard/wizard.component';
import {EvaluacionIdiomaParteUnoComponent} from './../evaluacion-idioma-parte-uno/evaluacion-idioma-parte-uno.component';
import {EvaluacionIdiomaParteDosComponent} from './../evaluacion-idioma-parte-dos/evaluacion-idioma-parte-dos.component';
import {EvaluacionIdiomaParteTresComponent} from './../evaluacion-idioma-parte-tres/evaluacion-idioma-parte-tres.component';

@Component({
  selector: 'app-evaluacion-idioma-steps',
  templateUrl: './evaluacion-idioma-steps.component.html',
  styleUrls: ['./evaluacion-idioma-steps.component.css']
})
export class EvaluacionIdiomaStepsComponent implements OnInit {

  element = EvaluacionDocenteIdiomas;
  styleSize: string;
  // currentStep: Step;
  private alertas: Array<Object> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  respuestas;
  public nombreMateria: String;
  public nombreProfesor: String;
  router: Router;
  evaluacionDocenteIdiomasService;
  respuestasEvaluacionDocenteIdiomasService;

  private isFirst: boolean = true;
  private isLast: boolean = false;

  @ViewChild('wizard')
  wc: WizardComponent;

  @ViewChild('evaluacionParteUno')
  evaluacionParteUno: EvaluacionIdiomaParteUnoComponent;

  @ViewChild('evaluacionParteDos')
  evaluacionParteDos: EvaluacionIdiomaParteDosComponent;

  @ViewChild('evaluacionParteTres')
  evaluacionParteTres: EvaluacionIdiomaParteTresComponent;

  @ViewChild('modalConfirmacion')
  modalConfirmacion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';


  constructor(private _router: Router, private catalogoService: CatalogosServices) {
    this.prepareServices();
    this.router = _router;
    this.nombreMateria = sessionStorage.getItem("nombreMateria");
    this.nombreProfesor = sessionStorage.getItem("nombreProfesor");
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
    console.log('ultima parte');
    if (this.evaluacionParteTres.finishMethod()) {
      this.wc.next();
      this.alertas = [];
      this.modalConfirmarEvaluacionProfesoresIdiomas();
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

  prepareServices(): void {
    this.evaluacionDocenteIdiomasService = this.catalogoService.getEvaluacionDocenteIdiomasService();
    this.respuestasEvaluacionDocenteIdiomasService = this.catalogoService.getRespuestasEvaluacionDocenteIdiomasService();
  }

  cancelar():void{
    sessionStorage.removeItem("idEstudianteGrupoIdioma");
    sessionStorage.removeItem("idEvaluacionDocenteIdiomasAlumno");
    sessionStorage.removeItem("profesor");
    sessionStorage.removeItem("nombreMateria");
    sessionStorage.removeItem("nombreProfesor");
    sessionStorage.clear();
    // let link = ['./EvaluacionProfesores'];
    // this._router.parent.navigate(link);
    this.router.navigate(['alumno', 'evaluacion-docente']);
  }
  confirmar():void{
    // let link = ['./EvaluacionProfesores'];
    let jsonFormulario;
    let obs=sessionStorage.getItem("respuesta11");
    if(obs===undefined||obs==="undefined"){
      obs="";
    }
    let objFormulario = {
      "idEvaluacionDocenteIdiomasAlumno" : sessionStorage.getItem("idEvaluacionDocenteIdiomasAlumno"),
      "idEstudianteGrupoIdioma" : sessionStorage.getItem("idEstudianteGrupoIdioma"),
      "profesor" : sessionStorage.getItem("profesor"),
      "observaciones" : obs
    };

    sessionStorage.removeItem("respuesta11");
    jsonFormulario = JSON.stringify(objFormulario, null, 2);

    this.evaluacionDocenteIdiomasService.postEvaluacionDocente(
        jsonFormulario,
        this.erroresConsultas
    ).subscribe(
        response => {
          var json = response.json();
          if (json.id) {
            let objFormularioEvaluacion;
            let jsonFormularioEvaluacion;
            for (var index = 1; index <= 10; index++) {
              var element =  parseInt(sessionStorage.getItem("respuesta"+index));
              objFormularioEvaluacion = {
                "idEvaluacionDocenteIdiomas" : json.id,
                "idPreguntaEvaluacionDocenteIdiomas" : index,
                "idRespuestaEvaluacionDocenteIdiomas" : element
              };
              jsonFormularioEvaluacion = JSON.stringify(objFormularioEvaluacion, null, 2);

              this.respuestasEvaluacionDocenteIdiomasService.postRespuestaEvaluacionDocente(
                  jsonFormularioEvaluacion,
                  this.erroresConsultas
              ).subscribe(
                  response => {
                    // //console.log("Success Add");
                    var resjson = response.json();
                    if (resjson.id) {
                      sessionStorage.removeItem("respuesta"+index);
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
          this.router.navigate(['alumno','evaluacion-docente']);
        }
    );
    this.router.navigate(['alumno','evaluacion-docente']);
  }
  modalConfirmarEvaluacionProfesoresIdiomas(): void {
    this.modalConfirma();
  }

  /*
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
  */

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  /*
  private previusStep(): void {
    this.alertas=[];
    let funcionPrevius: boolean = this.currentStep.previusMethod();
    let mensajeError: string = this.currentStep.errorPrevius;
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'Segundo':
        funcionPrevius = this.componentSegundo.previusMethod();
        mensajeError = '';
        break;
      case 'Ultimo':
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
  }

  private nextStep(): void {
    let funcionNext: boolean = this.currentStep.nextMethod();
    let mensajeError: string = this.currentStep.errorNext;
    let form: any = this.currentStep.getForm();
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'Primero':
        funcionNext = this.componentPrimero.nextMethod();
        mensajeError = this.componentPrimero.errorNext;
        //form = this.componentPrimero.getForm();
        ////console.log("form",form);
        break;
      case 'Segundo':
        funcionNext = this.componentSegundo.nextMethod();
        mensajeError = this.componentSegundo.errorNext;
        //form = this.componentSegundo.getForm();
        ////console.log("form",form);
        break;
      default:
        break;
    }

    this.alertas = [];
    if (funcionNext) {
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
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true
      });
    }
  }

  private finishStep(): void {

    let funcionFinish: boolean = this.currentStep.finishMethod();
    let mensajeError: string = this.currentStep.errorFinish;
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'Ultimo':
        funcionFinish = this.componentUltimo.finishMethod();
        mensajeError = '';
        break;
      default:
        break;
    }
    this.alertas = [];

    if (funcionFinish) {
      /*
       let firstStep: Step;
       this.steps.forEach((step: Step) => {
       if (step.tipo === TipoStep.FIRST) {
       firstStep = step;
       }
       if (step.tipo === TipoStep.STEP || step.tipo === TipoStep.FINAL) {
       step.estado = EstadoStep.INACTIVO;
       }
       });*/
      // this.modalConfirmarEvaluacionProfesoresIdiomas(); descomentar
      // el método de arriba debe de pausar el flujo de abajo, solo si el usuario da clic SÍ
      // se ejecuta lo de abajo, si da NO entonces solo se cierra el modal confirmación
      /*
       this.currentStep = firstStep;
       this.currentStep.estado = EstadoStep.ACTIVO;
       this.currentStep.ruta.navegar().then(() => {
       this.alertas.push({
       type: 'success',
       msg: 'Se finalizo satisfactoriamente la evaluación docente',
       closable: true
       });
       });
       */
      /*
    } else {
      this.alertas.push({
        type: 'danger',
        msg: mensajeError,
        closable: true,
        tiempo: 3000
      });
    }
  }

  private enablePreviusButton(step: Step): boolean {
    switch (step.tipo) {

      case TipoStep.FINAL:
      case TipoStep.STEP:
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

  private firstStep(): Step {
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

  ngOnInit() {
  }

  // --------------------------------------MODAL CONFIRMACION--------------------------------------------------- //

  private modalConfirma(): void {
    this.modalConfirmacion.open();
  }
  confirmarEvaluacion():void{
    this.confirmar();
    this.modalConfirmacion.close();
  }
  private cerrarModalConfirma(): void {
    // this.cancelar();
    this.modalConfirmacion.close();
  }

}
