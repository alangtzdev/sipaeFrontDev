import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {DependientesContactoComponent} from "../dependientes-contacto/dependientes-contacto.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {errorMessages} from "../../../utils/error-mesaje";
import {DependienteEconomico} from "../../../services/entidades/dependiente-economico.model";
import {ItemSelects} from "../../../services/core/item-select.model";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import * as moment from "moment";
import {Validacion} from "../../../utils/Validacion";

@Component({
  selector: 'app-modal-registro-dependientes',
  templateUrl: './modal-registro-dependientes.component.html',
  styleUrls: ['./modal-registro-dependientes.component.css']
})
export class ModalRegistroDependientesComponent implements OnInit {

  @ViewChild("modalRegDependiente")
  dialog: ModalComponent;
  parentComponent: DependientesContactoComponent;


  formularioDependientes: FormGroup;
  validacionOtro: boolean = false;
  //
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;

  sexoService;
  parentescoService;

  edicionFormulario: boolean = false;
  entidadDependiente: DependienteEconomico;

  public dt: Date = new Date();
  public fechaMaxima: Date = new Date();
  private opcionesCatalogoSexo: Array<ItemSelects> = [];
  private opcionesCatalogoParentesco: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private inj:Injector,private _spinner: SpinnerService) {
  this.parentComponent = this.inj.get(DependientesContactoComponent);

    moment.locale('es');
    this.prepareServices();
    this.formularioDependientes = new FormGroup({
      nombreCompleto: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      fechaNacimiento: new FormControl(''),
      idParentesco: new FormControl('', Validators.required),
      idSexo: new FormControl('', Validators.required),
      otroParentesco: new FormControl('',
        Validators.compose([Validacion.textoValidator])),
      idEstudiante: new FormControl(this.parentComponent.idEstudiante)
    });

  }

  validarFormulario(): boolean {
    if (this.formularioDependientes.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  ////// picker ///
  getFechaEjemplo(): string {
    if (this.dt) {
      let fechaConFormato =  moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioDependientes.controls['fechaNacimiento'])
        .setValue(fechaConFormato + ' 10:30am');
      //console.log('La fecha con formato::' + fechaConFormato);
      //console.log('Fecha dt' + this.dt);
      return fechaConFormato;
    } else {
      return  moment(new Date()).format('DD/MM/YYYY');
    }
  }

  validarCampoOtro(): boolean {
    let valor = this.getControl('idParentesco');
    if (valor.value === 5) { // Este 5 es temporal, revisar que id sera "OTRO"
      return true;
    }else {
      return false;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioDependientes.controls[campo]);
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this._spinner.start("enviarFormulario");
      let jsonFormulario = JSON.stringify(this.formularioDependientes.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.parentComponent.dependienteEconomicoService
          .putDependienteEconomico(
            this.parentComponent.idDependiente,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.parentComponent.registroSeleccionado = null;
            this._spinner.stop("enviarFormulario");
            this.parentComponent.onCambiosTabla();
            this.cerrarModal();
          }
        );
      } else {
        this.parentComponent.dependienteEconomicoService
          .postDependienteEconomico(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this._spinner.stop("enviarFormulario");
            this.parentComponent.onCambiosTabla();
            this.cerrarModal();
          }
        );
      }
    }
  }

  cerrarModal(): void {
    this.dialog.close();
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioDependientes.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  private prepareServices(): void {
    this.sexoService = this.parentComponent.catalogosServices.getSexo();
    this.opcionesCatalogoSexo = this.sexoService.getSelectSexo(this.erroresConsultas);

    this.parentescoService =
      this.parentComponent.catalogosServices.getParentesco();
    this.opcionesCatalogoParentesco =
      this.parentescoService.getSelectParentesco(this.erroresConsultas);
  }

  ngOnInit() { }

  onInit() {

    let stringNombreCompleto = 'nombreCompleto';
    let intIdParentesco = 'idParentesco';
    let intIdSexo = 'idSexo';
    let stringOtroParentesco = 'otroParentesco';

    if (this.parentComponent.idDependiente) {
      ////console.log(this.context.idconvenio);
      this.edicionFormulario = true;
      let dependienteEconomico: DependienteEconomico;
      this.entidadDependiente = this.parentComponent
        .dependienteEconomicoService.getDependienteEconomico(
          this.parentComponent.idDependiente,
          this.erroresConsultas
        ).subscribe(
          response =>
            dependienteEconomico = new DependienteEconomico(response.json()),
          error => {

          },
          () => {

            if (this.formularioDependientes) {
              let stringFechaNacimiento = moment(dependienteEconomico.fechaNacimiento);

              if (dependienteEconomico.parentesco.id !== undefined) {
                (<FormControl>this.formularioDependientes.controls[intIdParentesco])
                  .setValue(dependienteEconomico.parentesco.id);
              }
              (<FormControl>this.formularioDependientes.controls[stringNombreCompleto])
                .setValue(dependienteEconomico.nombreCompleto);
              (<FormControl>this.formularioDependientes.controls[stringOtroParentesco])
                .setValue(dependienteEconomico.otroParentesco);
              if (dependienteEconomico.sexo.id !== undefined) {
                (<FormControl>this.formularioDependientes.controls[intIdSexo])
                  .setValue(dependienteEconomico.sexo.id);
              }

              this.dt = new Date(stringFechaNacimiento.toJSON());
            }
          }
        );
    }else {
      this.edicionFormulario = false;
        (<FormControl>this.formularioDependientes.controls[intIdParentesco])
          .setValue("");
      (<FormControl>this.formularioDependientes.controls[stringNombreCompleto])
        .setValue("");
      (<FormControl>this.formularioDependientes.controls[stringOtroParentesco])
        .setValue("");
        (<FormControl>this.formularioDependientes.controls[intIdSexo])
          .setValue("");


    }


  }

}
