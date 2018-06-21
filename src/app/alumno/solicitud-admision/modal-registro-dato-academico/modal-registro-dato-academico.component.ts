import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {AntecedenteAcademicoComponent} from "../antecedente-academico/antecedente-academico.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {errorMessages} from "../../../utils/error-mesaje";
import {DatoAcademico} from "../../../services/entidades/dato-academico.model";
import {ItemSelects} from "../../../services/core/item-select.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import * as moment from "moment";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {DatoAcademicoService} from "../../../services/entidades/dato-academico.service";
import {Router} from "@angular/router";
import {Validacion} from "../../../utils/Validacion";
import {URLSearchParams} from "@angular/http";

@Component({
  selector: 'app-modal-registro-dato-academico',
  templateUrl: './modal-registro-dato-academico.component.html',
  styleUrls: ['./modal-registro-dato-academico.component.css']
})
export class ModalRegistroDatoAcademicoComponent implements OnInit {


  @ViewChild("modalRegistroDato")
  dialog: ModalComponent;
  parentComponent: AntecedenteAcademicoComponent;
  formulario: FormGroup;
  nivelEstudioService;
  entidadFederativaService;
  paisService;
  municipioService;
  tipoTrabajoService;
  gradoAcademicoService;

  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;

  camposParaBachillerato: boolean = false;
  ocultarDireccion: boolean;

  edicionFormulario: boolean = false;
  entidadDatoAcademico: DatoAcademico;

  ////// INICIO picker ///
  public fechaHoy: Date = new Date();
  public dt: Date = new Date();
  public dt2: Date = new Date(); // Para el 2da DatePicker
  public dt3: Date = new Date(); // Para el 3er DatePicker

  private alertas: Array<Object> = [];
  private opcionNivelEstudio: Array<ItemSelects> = [];
  private opcionesGradoAcademico: Array<ItemSelects> = [];
  private opcionEntidadFederativa: Array<ItemSelects> = [];
  private opcionPais: Array<ItemSelects> = [];
  private opcionMunicipio: Array<ItemSelects> = [];
  private opcionTipoTrabajo: Array<ItemSelects> = [];

  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  public getDatefechaTitulacion(): number {
    ////console.log(new moment(this.dt).format("DD/MM/YYYY"));
    let fecha =  moment(this.dt).format('DD/MM/YYYY');
    let fechaTitulacionString = 'fechaTitulacion';
    (<FormControl>this.formulario.controls[fechaTitulacionString])
      .setValue(fecha + ' 12:00am');
    ////console.log('getDateInicio', this.dt && this.dt.getTime() || new Date().getTime());
    return this.dt && this.dt.getTime() || new Date().getTime(); }

  getFechaEjemplo(): string {
    if (this.dt) {
      let fechaConFormato =  moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaTitulacion'])
        .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return  moment(new Date()).format('DD/MM/YYYY');
    }
  }

  public getDateFechaFin(): number { //Metodo para incorporar un 2da Datepicker
    ////console.log(new moment(this.dt2).format('DD/MM/YYYY'));
    let fecha =  moment(this.dt2).format('DD/MM/YYYY');
    let fechaFinString = 'fechaFin';
    //(<FormControl>this.formulario.controls[fechaFinString])
    //    .setValue('');
    ////console.log('getDateFin', this.dt2 && this.dt2.getTime() || new Date().getTime());
    return this.dt2 && this.dt2.getTime() || new Date().getTime(); }

  public getDateFechaInicio(): number { //Metodo para incorporar un 2da Datepicker
    ////console.log(new moment(this.dt3).format('DD/MM/YYYY'));
    let fecha =  moment(this.dt3).format('DD/MM/YYYY');
    let fechaInicioString = 'fechaInicio';
    //(<FormControl>this.formulario.controls[fechaInicioString])
    //    .setValue('');
    ////console.log('getDateFin', this.dt2 && this.dt2.getTime() || new Date().getTime());
    return this.dt3 && this.dt3.getTime() || new Date().getTime(); }

  constructor(private inj:Injector,private _datoAcademico: DatoAcademicoService,
              private router: Router, private _spinnerService: SpinnerService) {
    this.parentComponent = this.inj.get(AntecedenteAcademicoComponent);

    this.prepareServices();

    this.formulario = new FormGroup({
      idGradoAcademico: new FormControl('', Validators.required),
      disciplina: new FormControl('',
        Validators.compose([
          Validacion.parrafos,
        ])),
      universidad: new FormControl('',
        Validators.compose([
          Validators.required,
          Validacion.parrafos,
        ])),
      grado: new FormControl('',
        Validators.compose([
          Validators.required,
          Validacion.parrafos,
        ])),
      numeroCedula: new FormControl('',
        Validators.compose([
          Validacion.parrafos,
        ])), //!!!!!!!!!!!!!!!!!!!!
      facultad: new FormControl('',
        Validators.compose([
          Validators.required,
          Validacion.parrafos,
        ])),
      promedio: new FormControl('',
        Validators.compose([
          Validators.required,
          Validacion.parrafos,
        ])),
      fechaTitulacion: new FormControl(''),
      tutor: new FormControl('',
        Validators.compose([
          Validacion.parrafos,
        ])), //!!!!!!!!!!!!!!!!!!!!
      anioInicio: new FormControl('',
        Validators.compose([
          Validacion.anio,
        ])),
      anioFin: new FormControl('',
        Validators.compose([
          Validacion.anio,
        ])),
      otroTipoTrabajo: new FormControl(''),
      idEntidadFederativa: new FormControl(''),
      idMunicipio: new FormControl(''),
      idPais: new FormControl('', Validators.required),
      idTipoTrabajo: new FormControl(''),
      idEstudiante: new FormControl(this.parentComponent.idEstudiante),
      direccion: new FormControl(''),
    });

  }

  mostrarTiposService(): boolean {
    let valor = this.getControl('idTipoTrabajo');

    /*if (valor.value === '10') { // id:3 === valor:'otro' actualmente
     return true;
     }*/
    return (valor.value === '10');
  }

  cerrarModal(): void {
    this.dialog.close();
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  // validarCampoOtro(): boolean {
  //     let valor = this.getControl('otroTipoTrabajo');
  //     if (valor.value === 7) { // Este 7 es temporal, revisar que id sera "OTRO"
  //         return true;
  //     }else {
  //         return false;
  //     }
  // }

  enviarFormulario(): void {
    if (this.validarFormulario() && this.validarFechaInicioFin()) {
      this.limpiarFormulario();
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      if (this.edicionFormulario) {
        this._spinnerService.start("enviarFormulario");
        this._datoAcademico.putDatoAcademico(
          this.parentComponent.idDatoAcademico,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.parentComponent.registroAcademicoSeleccionado = null;
            this.parentComponent.onCambiosTablaDatoAcademico();
            this.cerrarModal();
            this._spinnerService.stop("enviarFormulario");
            ////console.log(this.formulario.value);
          });
      } else {
        this._spinnerService.start("enviarFormulario");
        this._datoAcademico.postDatoAcademico(
          jsonFormulario,
          this.erroresGuardado,
          this.router
        ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.parentComponent.onCambiosTablaDatoAcademico();
            this.cerrarModal();
            this._spinnerService.stop("enviarFormulario");
            ////console.log(this.formulario.value);
          });
      }

    }
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  cambiarTipoExperiencia(idGradoAcademico: number): void {
    let limpiarFormulario = '';
    console.log(idGradoAcademico);
    // Si el tipo de grado academico es 6
    // (Bachillerato va a mostrar los campos solo para bachillerato)
    if (idGradoAcademico == 6) {
      this.camposParaBachillerato = true;

    } else {
      this.camposParaBachillerato = false;
    }
    console.log(this.camposParaBachillerato);
  }

  //ocultar datos de direción
  getSelectPais(idPais): void {
    //console.log('idPais: ' + idPais);
    if (idPais === '82') {
      this.ocultarDireccion = false;
    }else {
      this.ocultarDireccion = true;
    }
    //console.log('Se oculta porque es mexico: ' + this.ocultarDireccion);
  }

  mostrarEstados(): boolean {
    let pais = this.getControl('idPais');
    let estadoValor = '';
    let municipioValor = '';
    if (!this.ocultarDireccion) {
      return true;
    }else {
      (<FormControl>this.formulario.controls['idEntidadFederativa'])
        .setValue(estadoValor);
      (<FormControl>this.formulario.controls['idMunicipio'])
        .setValue(municipioValor);
      return false;
    }
  }

  validarFormulario(): boolean {
    if (this.camposParaBachillerato) {
      //console.log('es bachilletaro');
      (<FormControl>this.formulario.
        controls['grado']).setValue('auxiliargrado');
      (<FormControl>this.formulario.
        controls['facultad']).setValue('auxiliarfacultad');
      (<FormControl>this.formulario.
        controls['idTipoTrabajo']).setValue('auxiliaridTipoTrabajo');
      (<FormControl>this.formulario.
        controls['otroTipoTrabajo']).setValue('auxiliarOtroTipoTrabajo');
      (<FormControl>this.formulario.
        controls['tutor']).setValue('auxiliarTutor');
      (<FormControl>this.formulario.
        controls['numeroCedula']).setValue('12345');

    }
    //console.log(this.formulario.value);
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  limpiarFormulario (): any {
    if (this.camposParaBachillerato) {
      (<FormControl>this.formulario.
        controls['grado']).setValue('');
      (<FormControl>this.formulario.
        controls['facultad']).setValue('');
      (<FormControl>this.formulario.
        controls['idTipoTrabajo']).setValue('');
      (<FormControl>this.formulario.
        controls['otroTipoTrabajo']).setValue('');
      (<FormControl>this.formulario.
        controls['tutor']).setValue('');
      (<FormControl>this.formulario.
        controls['numeroCedula']).setValue('');
    }

  }

  private validarFechaInicioFin(): boolean {
    let fechaConFormato =  moment(this.fechaHoy).format('YYYY');
    let fechaInicio = this.getControl('anioInicio');
    let fechaFinal = this.getControl('anioFin');
    if (fechaFinal.value <= fechaConFormato && fechaInicio.value <= fechaConFormato ) {
      if (fechaFinal.value < fechaInicio.value) {
        this.addErrorsMesaje('Fechas incorrectas', 'danger');
        return false;
      } else {
        return true;
      }
    } else {
      this.addErrorsMesaje('Fechas incorrectas', 'danger');
      return false;
    }
  }

  private addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
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

  private cargarMunicipios(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEntidadFederativa~' + id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionMunicipio =
      this.municipioService.getListaMunicipio(this.erroresConsultas, urlParameter).lista;
  }

  private prepareServices(): void {
    this.nivelEstudioService =
      this.parentComponent.catalogosServices.getCatalogoNivelEstudios();
    this.opcionNivelEstudio =
      this.nivelEstudioService.getSelectNivelEstudio(this.erroresConsultas);

    this.entidadFederativaService =
      this.parentComponent.catalogosServices.getEntidadFederativa();
    this.opcionEntidadFederativa =
      this.entidadFederativaService.getSelectEntidadFederativa(this.erroresConsultas);

    this.municipioService =
      this.parentComponent.catalogosServices.getMunicipio();

    this.paisService =
      this.parentComponent.catalogosServices.getPais();
    this.opcionPais =
      this.paisService.getSelectPais(this.erroresConsultas);

    this.tipoTrabajoService =
      this.parentComponent.catalogosServices.getTipoTrabajo();
    this.opcionTipoTrabajo =
      this.tipoTrabajoService.getSelectTipoTrabajo(this.erroresConsultas);

    this.gradoAcademicoService =
      this.parentComponent.catalogosServices.getGradoAcademico();
    this.opcionesGradoAcademico =
      this.gradoAcademicoService.getSelectGradoAcademico(this.erroresConsultas);
  }

  ngOnInit() {}
  onInit() {
    let stringIdGradoAcademico = 'idGradoAcademico';
    let stringDisciplina = 'disciplina';
    let stringUniversidad = 'universidad';
    let stringGrado = 'grado';
    let stringNumeroCedula = 'numeroCedula';
    let stringFacultad = 'facultad';
    let stringPromedio = 'promedio';
    let stringAnioInicio = 'anioInicio';
    let stringAnioFin = 'anioFin';
    let stringOtroTipoTrabajo = 'otroTipoTrabajo';
    let stringIdEntidadFederativa = 'idEntidadFederativa';
    let stringIdMunicipio = 'idMunicipio';
    let stringIdPais = 'idPais';
    let stringIdTipoTrabajo = 'idTipoTrabajo';
    let stringDireccion = 'direccion';
    if (this.parentComponent.idDatoAcademico) {
      this.edicionFormulario = true;
      let datoAcademico: DatoAcademico;
      this.entidadDatoAcademico = this.parentComponent
        .datoAcademicoService.getDatoAcademico(
          this.parentComponent.idDatoAcademico,
          this.erroresConsultas
        ).subscribe(
          response =>
            datoAcademico = new DatoAcademico(response.json()),
          error => {
            console.error(error);

          },
          () => {

            let stringFechaTitulacion = moment(datoAcademico.fechaTitulacion);
            if (this.formulario) {


              if (datoAcademico.gradoAcademico.id !== undefined) {
                (<FormControl>this.formulario.controls[stringIdGradoAcademico])
                  .setValue(datoAcademico.gradoAcademico.id);
                this.cambiarTipoExperiencia(datoAcademico.gradoAcademico.id);
              }
              (<FormControl>this.formulario.controls[stringDisciplina])
                .setValue(datoAcademico.disciplina);
              (<FormControl>this.formulario.controls[stringUniversidad])
                .setValue(datoAcademico.universidad);
              (<FormControl>this.formulario.controls[stringGrado])
                .setValue(datoAcademico.grado);
              (<FormControl>this.formulario.controls[stringNumeroCedula])
                .setValue(datoAcademico.numeroCedula);
              (<FormControl>this.formulario.controls[stringFacultad])
                .setValue(datoAcademico.facultad);
              (<FormControl>this.formulario.controls[stringPromedio])
                .setValue(datoAcademico.promedio);
              (<FormControl>this.formulario.controls[stringAnioInicio])
                .setValue(datoAcademico.anioInicio);
              (<FormControl>this.formulario.controls[stringAnioFin])
                .setValue(datoAcademico.anioFin);
              (<FormControl>this.formulario.controls[stringOtroTipoTrabajo])
                .setValue(datoAcademico.otroTipoTrabajo);
              if (datoAcademico.entidadFederativa.id !== undefined) {
                (<FormControl>this.formulario.controls[stringIdEntidadFederativa])
                  .setValue(datoAcademico.entidadFederativa.id);
                this.cargarMunicipios(datoAcademico.entidadFederativa.id);
              }
              if (datoAcademico.municipio.id !== undefined) {
                (<FormControl>this.formulario.controls[stringIdMunicipio])
                  .setValue(datoAcademico.municipio.id);
              }
              if (datoAcademico.pais.id !== undefined) {
                (<FormControl>this.formulario.controls[stringIdPais])
                  .setValue(datoAcademico.pais.id);
                this.getSelectPais(datoAcademico.pais.id);
              }
              if (datoAcademico.tipoTrabajo.id !== undefined) {
                (<FormControl>this.formulario.controls[stringIdTipoTrabajo])
                  .setValue(datoAcademico.tipoTrabajo.id);
                this.mostrarTiposService();
              }
              (<FormControl>this.formulario.controls[stringDireccion])
                .setValue(datoAcademico.direccion);

              this.dt = new Date(stringFechaTitulacion.toJSON());
            }
          }
        );
    }else {
      this.edicionFormulario = false;
        (<FormControl>this.formulario.controls[stringIdGradoAcademico])
          .setValue("");

      (<FormControl>this.formulario.controls[stringDisciplina])
        .setValue("");
      (<FormControl>this.formulario.controls[stringUniversidad])
        .setValue("");
      (<FormControl>this.formulario.controls[stringGrado])
        .setValue("");
      (<FormControl>this.formulario.controls[stringNumeroCedula])
        .setValue("");
      (<FormControl>this.formulario.controls[stringFacultad])
        .setValue("");
      (<FormControl>this.formulario.controls[stringPromedio])
        .setValue("");
      (<FormControl>this.formulario.controls[stringAnioInicio])
        .setValue("");
      (<FormControl>this.formulario.controls[stringAnioFin])
        .setValue("");
      (<FormControl>this.formulario.controls[stringOtroTipoTrabajo])
        .setValue("");
        (<FormControl>this.formulario.controls[stringIdEntidadFederativa])
          .setValue("");

        (<FormControl>this.formulario.controls[stringIdMunicipio])
          .setValue("");

        (<FormControl>this.formulario.controls[stringIdPais])
          .setValue("");

        (<FormControl>this.formulario.controls[stringIdTipoTrabajo])
          .setValue("");

      (<FormControl>this.formulario.controls[stringDireccion])
        .setValue("");
    }

  }

}
