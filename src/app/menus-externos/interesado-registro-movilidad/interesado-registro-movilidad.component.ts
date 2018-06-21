import { Component, OnInit, ViewChild } from '@angular/core';
import {WizardComponent} from '../../wizard/wizard.component';
import {
  InteresadoRegistromovilidadDatosGeneralesComponent
} from '../interesado-registromovilidad-datos-generales/interesado-registromovilidad-datos-generales.component';
import {
  InteresadoRegistromovilidadDatosEscolaresComponent
} from '../interesado-registromovilidad-datos-escolares/interesado-registromovilidad-datos-escolares.component';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {EstadoStep} from "../../utils/steps/modelos/estado-step";
import {Step} from "../../utils/steps/step";
import {TipoStep} from "../../utils/steps/modelos/tipo-step";


@Component({
  selector: 'app-interesado-registro-movilidad',
  templateUrl: './interesado-registro-movilidad.component.html',
  styles: ['.card-footer {display:  none!important; }']
})
export class InteresadoRegistroMovilidadComponent implements OnInit {

  private steps: Array<Step>;
  private styleSize: string;
  private currentStep: Step;
  private alertas: Array<Object> = [];

  private ultimaVista: boolean = false;
  private siguienteVista: boolean = false;
  private primeraVista: boolean = true;

  private formularioDatosgenerales;

  @ViewChild('wizard')
  private wc: WizardComponent ;
  @ViewChild('datosGenerales')
  private datosGenerales: InteresadoRegistromovilidadDatosGeneralesComponent;
  @ViewChild('datosEscolares')
  private datosEscolares: InteresadoRegistromovilidadDatosEscolaresComponent;

  constructor(
    private _catalogosService: CatalogosServices
  ) {}

  previous() {
    console.log('presiono el boton atras');
    console.log('currenSetpAtras', this.currentStep);
    this.wc.toPrev();
  }

  next() {
    console.log(this.wc);
    console.log('currenSetpNext', this.currentStep);
    this.wc.toNext();
  }

  finishStep(): void {

    let funcionFinish = this.datosEscolares.finishMethod(this.formularioDatosgenerales);
    let mensajeError = this.datosEscolares.errorNext;

    if (funcionFinish) {
      this.formularioDatosgenerales = this.datosEscolares.formulario;
      this.alertas.push({
        type: 'success',
        msg: 'Se finalizo satisfactoriamente el formulario step',
        closable: true
      });
    } else {
      if (mensajeError) {
        this.alertas.push({
          type: 'danger',
          msg: mensajeError,
          closable: true,
          tiempo: 3000
        });
      }
    }
  }

  onStepDatosGenerales(): any {
    if (this.datosGenerales.nextMethod()) {
      this.primeraVista = false;
      this.ultimaVista = true;
      this.formularioDatosgenerales = this.datosGenerales.formulario;
       this.wc.next();
    }
  }

  onStepDatosEscolares(): any {
    console.log('datosEscolares');
  }

  onStepAnterioDatosGenerales() {
    console.log('tengo que ir atras');
    if (this.datosEscolares.previusMethod()) {
      this.primeraVista = true;
      this.ultimaVista = false;
      this.wc.previous();
    }
  }

  ngOnInit() {
  }

  private mostrarBotonAnterior(): boolean {
    return !this.primeraVista;
  }

  private mostrarBotonSiguiente(): boolean {
    return !this.ultimaVista;
  }

  private mostrarBotonGuardar(): boolean {
    return this.ultimaVista;
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

}
