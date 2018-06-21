import { Component, OnInit, Injector, ViewChild } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {WizardComponent} from '../../wizard/wizard.component';
import {RegistroAdmisionStepUnoComponent} from '../registro-admision-step-uno/registro-admision-step-uno.component';
import {RegistroAdmisionStepDosComponent} from '../registro-admision-step-dos/registro-admision-step-dos.component';
import {RegistroAdmisionStepTresComponent} from '../registro-admision-step-tres/registro-admision-step-tres.component';
import {RegistroAdmisionStepCuatroComponent} from '../registro-admision-step-cuatro/registro-admision-step-cuatro.component';
import {Step} from '../../utils/steps/step';
import {EstadoStep} from '../../utils/steps/modelos/estado-step';
import {TipoStep} from '../../utils/steps/modelos/tipo-step';
import {FormGroup, FormControl} from '@angular/forms';
import {ErrorCatalogo} from '../../services/core/error.model';

@Component({
  selector: 'app-registro-admision',
  templateUrl: './registro-admision.component.html',
  styles: ['.card-footer {display:  none!important; }']
})
export class RegistroAdmisionComponent implements OnInit {
  steps: Array<Step>;
  /*@ViewChild(DatosPersonales) componentPrimero: DatosPersonales;
  @ViewChild(AntecedentesAcademicos) componentSegundo: AntecedentesAcademicos;
  @ViewChild(Experiencia) componentTercero: Experiencia;
  @ViewChild(Documentacion) componentUltimo: Documentacion;*/
  estudianteMovilidadService;
  correoService;
  styleSize: string;
  currentStep: Step;
  erroresGuardado: Array<Object> = [];
  public idEstudiante: number;
  private alertas: Array<Object> = [];
  private estudiante: EstudianteMovilidadExterna;
  // private idEstudiante: number;
  private idEstatusEstudiante: number = 0;
  private erroresConsultas: Array<Object> = [];
  private sub: any;
  isFirst: boolean = true;
  isLast: boolean = false;

  @ViewChild('wizard')
  wc: WizardComponent;

  @ViewChild('datosPersonales')
  datosPersonales: RegistroAdmisionStepUnoComponent;

  @ViewChild('antecedentesAcademicos')
  antecedentesAcademicos: RegistroAdmisionStepDosComponent;

  @ViewChild('investigadorAnfitrion')
  investigadorAnfitrion: RegistroAdmisionStepTresComponent;

  @ViewChild('documentacion')
  documentacion: RegistroAdmisionStepCuatroComponent;

  constructor(private _router: Router, route: ActivatedRoute,
              private _catalogosService: CatalogosServices) {
    this.prepareServices();
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
    }); // _router.parent.currentInstruction.component.params;
    // this.idEstudiante = params.id;
    this.recuperarEstudiante();
    /*let primero = new Step(
        1, 'Datos personales', TipoStep.FIRST, // poner texto entre '' para titulo del step
        EstadoStep.ACTIVO, new RutaStep('Primero', _router),
        '' // poner texto entre '' para descripcion del step
    );
    let segundo = new Step(
        2, 'Antecedentes académicos', TipoStep.STEP,
        EstadoStep.INACTIVO, new RutaStep('Segundo', _router),
        ''
    );
    let tercero = new Step(
        3, 'Investigador anfitrión', TipoStep.STEP,
        EstadoStep.INACTIVO, new RutaStep('Tercero', _router),
        ''
    );
    let ultimo = new Step(
        4, 'Documentación', TipoStep.FINAL,
        EstadoStep.INACTIVO, new RutaStep('Ultimo', _router),
        ''
    );
    this.steps = [
      primero,
      segundo,
      tercero,
      ultimo
    ];*/
    this.calculateStyleSize();
    /*this.currentStep = this.firstStep();
    this.currentStep.ruta.navegar();*/
  }

  previous() {
    this.wc.previous();
    switch (this.wc.activeStepIndex) {
      case 0:
        this.isFirst = true;
        break;
      default:
        this.isLast = false;
        break;
    }
  }

  next() {
    // console.log(this.wc);
    this.wc.toNext();
  }

  onStep1Next(): any {
    if (this.datosPersonales.nextMethod()) {
      this.wc.next();
      this.isFirst = false;
    }
  }

  onStep2Next(): any {
    if (this.antecedentesAcademicos.nextMethod()) {
      this.wc.next();
    }
  }

  onStep3Next(): any {
    if (this.investigadorAnfitrion.nextMethod()) {
      this.wc.next();
      this.isLast = true;
    }
  }

  onStep4Next(): any {
    if (this.documentacion.finishMethod()) {
      this.wc.next();
    }
  }

  cancelar(): void {
    this._router.navigate(['lista-solicitudes']);
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

  redireccionarListaSolicitudes(): void {
    this._router.navigate(['ListaSolicitudes']);
  }

  recuperarEstudiante(): void {
    let estudianteMovilidad: EstudianteMovilidadExterna;
    this.estudianteMovilidadService.getEstudianteMovilidadExterna(
        this.idEstudiante,
        this.erroresConsultas
    ).subscribe(
        response =>
            estudianteMovilidad = new EstudianteMovilidadExterna(
                response.json()),
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
        },
        () => {
          /*if (assertionsEnabled()) {
            //console.log('Se obtiene estudiante');
            //console.log('Se estattus' + estudianteMovilidad.estatus.id);
          }*/
          this.estudiante = estudianteMovilidad;
          this.idEstatusEstudiante = estudianteMovilidad.estatus.id;
        }
    );
  }

  modalEnviarSolicitud(): void {
    this.enviarSolicitud.open('sm');
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalEnviarSolicitudData(
          this.estudiante.id,
          this)
      }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
        <any>ModalEnviarSolicitud,
        bindings,
        modalConfig
    );*/
  }

  validarBotonEnviar(): boolean {
    return !this.documentacion.validacionBoton;
    /*if (this.componentUltimo) {
      if (this.componentUltimo.validacionBoton && this.idEstatusEstudiante === 1005) {
        return false;
      } else {
        return true;
      }
    } else {*/
      // return true;
    // }
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
  }*/

  /*private goStep(step: Step): void {
    this.currentStep = step;
    if (this.currentStep.estado !== EstadoStep.COMPLETO) {
      this.currentStep.estado = EstadoStep.ACTIVO;
    }
    this.currentStep.ruta.navegar();
  }*/

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  /*private previusStep(): void {
    let funcionPrevius: boolean = this.currentStep.previusMethod();
    let mensajeError: string = this.currentStep.errorPrevius;
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'Segundo':
        funcionPrevius = this.componentSegundo.previusMethod();
        mensajeError = '';
        break;
      case 'Tercero':
        funcionPrevius = this.componentTercero.previusMethod();
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
      /*this.alertas.push({
       type: 'danger',
       msg: mensajeError,
       closable: true,
       tiempo: 3000
       });*/
    /*}
  }*/

  /*private changeNextStep(): void {
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
  }*/

  private addErrorsMesaje(mensajeError): void {
    this.alertas.push({
      type: 'danger',
      msg: mensajeError,
      closable: true
    });
  }

  /*private nextStep(): void {
    let funcionNext: boolean = this.currentStep.nextMethod();
    let mensajeError: string = this.currentStep.errorNext;
    switch (this.currentStep.ruta.obtenerNombre()) {
      case 'Primero':
        funcionNext = this.componentPrimero.nextMethod();
        break;
      case 'Segundo':
        funcionNext = this.componentSegundo.nextMethod();
        break;
      case 'Tercero':
        funcionNext = this.componentTercero.nextMethod();
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
    } else { }
  }*/

  /*private finishStep(): void {
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
          msg: 'Se finalizo satisfactoriamente la evaluación docente',
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
    // this.styleSize = (100 / this.steps.length).toFixed(2);
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
    this.estudianteMovilidadService =
        this._catalogosService.getEstudianteMovilidadExterna();
    this.correoService =
        this._catalogosService.getEnvioCorreoElectronicoService();
  }

  ngOnInit() {
  }

  /////////////////////////////////// MODALS ////////////////////////////////////
  @ViewChild('enviarSolicitud')
  enviarSolicitud: ModalComponent;

  validacion: boolean = true;
  erroresGuardadoModal: Array<ErrorCatalogo> = [];

  cerrarModal(): void {
    this.enviarSolicitud.close();
  }

  enviarFormulario(): void {
    let json = '{"idEstatus": "1010"}';
    this.estudianteMovilidadService
      .putEstudianteMovilidadExterna(
        this.idEstudiante,
        json,
        this.erroresGuardadoModal
      ).subscribe(
      () => {
        this.enviarCorreo();
        this.cerrarModal();
        this.cancelar();
      }

    );
  }

  private enviarCorreo(): void {
    let correoFormulario = new FormGroup ({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      entidad: new FormControl({
        EstudiantesMovilidadExterna: this.idEstudiante
      }),
      idPlantillaCorreo: new FormControl(13)
    });
    let jsonFormulario = JSON.stringify(correoFormulario.value, null, 2);
    this.correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardadoModal
    ).subscribe(
      response => {
      }
    );
  }

}
