import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent, ModalInstance} from 'ng2-bs3-modal/ng2-bs3-modal';
import {ExperienciaComponent} from '../experiencia/experiencia.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ExperienciaProfesional} from '../../../services/entidades/experiencia-profesional.model';
import {errorMessages} from '../../../utils/error-mesaje';
import {ItemSelects} from '../../../services/core/item-select.model';
import {ErrorCatalogo} from '../../../services/core/error.model';
import {CatalogosServices} from '../../../services/catalogos/catalogos.service';
import {Router} from '@angular/router';
import {SpinnerService} from '../../../services/spinner/spinner/spinner.service';
import * as moment from 'moment';
import {Validacion} from '../../../utils/Validacion';

@Component({
  selector: 'app-modal-registro-experiencia',
  templateUrl: './modal-registro-experiencia.component.html',
  styleUrls: ['./modal-registro-experiencia.component.css']
})
export class ModalRegistroExperienciaComponent implements OnInit {

  @ViewChild('modalRegistroExp')
  dialog: ModalComponent;
  context: ExperienciaComponent;
  edicionFormulario: boolean = false;
  formularioExperienciaProfesional: FormGroup;
  entidadExperienciaProfesional: ExperienciaProfesional;
  catalogoEstatus;
  mensajeErrors: any = errorMessages;
  validacionActiva: boolean = false;
  opcionesSelectTipoExperiencia: Array<ItemSelects>;
  estatusCatalogoService;

  // variables para rango de fechas
  public dt: Date;
  public minDate: Date;
  dt2: Date;
  finCurso: Date;
  contador: number = 0;
  public fi: Date;
  ff: Date;
  fechaVisible: boolean = false;

  private fechaMaxima: Date;
  private fechaMinima: Date;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private idEstudiante: number;

  constructor(
              private _catalogosService: CatalogosServices, _router: Router,
              private _spinner: SpinnerService, private inj: Injector) {

    this.context = this.inj.get(ExperienciaComponent);
    this.prepareServices();
    this.obtenerCatalogo();
    moment.locale('es');
    this.minDate = new Date();
    this.finCurso = new Date();
    // this.fi = new Date();
    this.fechaMaxima = new Date();
    // this.ff = new Date();
    this.fechaMinima = new Date();

    // this.fechaMaxima = new Date(this.fechaMaxima.valueOf());

    this.formularioExperienciaProfesional = new FormGroup({
      titulo: new FormControl(''),
      institucion: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      responsabilidad: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl(''),
      idEstudiante: new FormControl(this.context.idEstudiante),
      idTipoExperiencia: new FormControl('', Validators.required),
      actualmente: new FormControl('')
    });

  }

  cerrarModal(): void {
    this.fechaVisible = false;
    this.dialog.close();
  }


  elegirFechaInicio(): any {
    this.contador = 0;
  }
  elegirFechaFin(): any {
    this.contador = 1;
  }

  getFechaInicio(): string {
    if (this.fi) {
      let fechaInicioFormato =  moment(this.fi).format('DD/MM/YYYY');
      (<FormControl>this.formularioExperienciaProfesional.controls['fechaInicio'])
        .patchValue(fechaInicioFormato + ' 10:30am');
      return fechaInicioFormato;
    } else {
      return  moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaFin(): string {
    if (this.ff) {
      // if ( this.contador === 0 ) {
      //   this.fechaMinima = this.fi;
      //   this.ff = this.fi;
        // this.ff = new Date(this.fechaMinima.valueOf());
        let fechaConFormato =  moment(this.ff).format('DD/MM/YYYY');
        (<FormControl>this.formularioExperienciaProfesional.controls['fechaFin'])
          .setValue(fechaConFormato + ' 10:30am');
        return fechaConFormato;
      // } else {
      //   let fechaConFormato =  moment(this.ff).format('DD/MM/YYYY');
      //   (<FormControl>this.formularioExperienciaProfesional.controls['fechaFin'])
      //     .setValue(fechaConFormato + ' 10:30am');
      //   return fechaConFormato;
      // }
    } else {
      return  moment(new Date()).format('DD/MM/YYYY');
    }
  }

  enviarFormulario(): void {
    ////console.log('entra enviar el form');
    let actualmete = this.getControl('actualmente');
    // console.log(actualmete.value);
    if (actualmete.value !== true) {
      // console.log('esta investigaod: ' + actualmete.value);
      let stringActualmente = 'actualmente';
      (<FormControl>this.formularioExperienciaProfesional.controls[stringActualmente])
        .setValue(false);
    }
    if (this.validarFormulario()) {
      this.limpiarFormulario();
      let jsonFormulario =
        JSON.stringify(this.formularioExperienciaProfesional.value, null, 2);
      // console.log(jsonFormulario);
      // console.log('primer registro');
      if (this.edicionFormulario) {
        this._spinner.start('enviarFormulario');
        this.context.registroExperienciaProfesionalService
          .putExperienciaProfesional(
            this.context.idExperiencia,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {
            // console.log('ll' + response.json());
          },
          error => {
            // console.log(error);
            this._spinner.stop('enviarFormulario');
          },
          () => {
            this._spinner.stop('enviarFormulario');
            this.context.registroSeleccionado = null;
            this.context.onCambiosTabla();

            this.cerrarModal();
          }
        );
      } else {
        this._spinner.start('enviarFormulario');
        this.context.registroExperienciaProfesionalService
          .postExperienciaProfesional(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {
            // console.log('ll' + response.json());
          },
          error => {
            // console.log(error);
            this._spinner.stop('enviarFormulario');
          },
          () => {
            this.context.registroSeleccionado = null;
            this.context.onCambiosTabla();
            this._spinner.stop('enviarFormulario');
            this.cerrarModal();
          }
        );
      }
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioExperienciaProfesional.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioExperienciaProfesional.
        controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl): string {
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

  filtrarCamposAMostrar(): boolean {
    let tipoExperiencia = this.getControl('idTipoExperiencia');
    let limpiarFormulario = '';
    if (tipoExperiencia.value == '1') {
      return true;
    }else {
      return false;
    }
  }

  validarFormulario(): boolean {
     let fechaInicio = moment(this.fi).format('YYYY/MM/DD'); //'DD/MM/YYYY'
    let fechaFin = moment(this.ff).format('YYYY/MM/DD');
    if (this.fechaVisible) {
      (<FormControl>this.formularioExperienciaProfesional.
        controls['fechaFin']).setValue('12/12/2012 12:12 am');

    }
    // console.log(this.formularioExperienciaProfesional.value);
    if (this.formularioExperienciaProfesional.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  limpiarFormulario (): any {
    if (this.fechaVisible) {
      (<FormControl>this.formularioExperienciaProfesional.
        controls['fechaFin']).setValue(null);
    }

  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.catalogoEstatus = this.context._catalogosService;
  }

  private obtenerCatalogo(): void {
    this.opcionesSelectTipoExperiencia =
      this.estatusCatalogoService.getTipoExperiencia().
      getSelectTipoExperiencia(this.erroresConsultas);
  }

  private ocultarFechaFin(): boolean {
    if (this.fechaVisible) {
      return false;
    }else {
      return true;
    }
  }

  private cambiaActividad(valor): void {
    console.log('ocultar fecha  ' + valor);
    this.fechaVisible = valor;
  }
  ngOnInit() { }
  onInit() {

    let stringTitulo = 'titulo';
    let stringInstitucion = 'institucion';
    let stringResponsabilidad = 'responsabilidad';
    let stringtipoExperiencia = 'idTipoExperiencia';
    let stringActualmente = 'actualmente';
    if (this.context.idExperiencia) {
      // console.log(this.context.idExperienciaProfesional);
      this.edicionFormulario = true;
      let experienciaProfesional: ExperienciaProfesional;
      this.entidadExperienciaProfesional = this.context
        .registroExperienciaProfesionalService
        .getExperienciaProfesional(
          this.context.idExperiencia,
          this.erroresConsultas
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>
            experienciaProfesional = new ExperienciaProfesional(
              response.json()),
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
            console.error(error);
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {

            if (this.formularioExperienciaProfesional) {
              let stringFechaInicio = moment(experienciaProfesional.fechaInicio);
              let stringFechaFin = moment(experienciaProfesional.fechaFin);

              (<FormControl>this.formularioExperienciaProfesional
                .controls[stringTitulo])
                .setValue(experienciaProfesional.titulo);
              (<FormControl>this.formularioExperienciaProfesional
                .controls[stringInstitucion])
                .setValue(experienciaProfesional.institucion);
              (<FormControl>this.formularioExperienciaProfesional
                .controls[stringResponsabilidad])
                .setValue(experienciaProfesional.responsabilidad);
              if (experienciaProfesional.tipoExperiencia.id !== undefined) {
                (<FormControl>this.formularioExperienciaProfesional
                  .controls[stringtipoExperiencia])
                  .setValue(experienciaProfesional.tipoExperiencia.id);
                this.filtrarCamposAMostrar();
              }
              (<FormControl>this.formularioExperienciaProfesional
                .controls[stringActualmente])
                .setValue(experienciaProfesional.actualmente);
              this.cambiaActividad(experienciaProfesional.actualmente);
              this.fi = new Date(stringFechaInicio.toJSON());
              this.ff = new Date(stringFechaFin.toJSON());
            }
          }
        );
    }else {
      this.edicionFormulario = false;
      (<FormControl>this.formularioExperienciaProfesional
        .controls[stringTitulo])
        .setValue('');
      (<FormControl>this.formularioExperienciaProfesional
        .controls[stringInstitucion])
        .setValue('');
      (<FormControl>this.formularioExperienciaProfesional
        .controls[stringResponsabilidad])
        .setValue('');
        (<FormControl>this.formularioExperienciaProfesional
          .controls[stringtipoExperiencia])
          .setValue('');

      (<FormControl>this.formularioExperienciaProfesional
        .controls[stringActualmente])
        .setValue('');
      this.fi = new Date();
      this.ff = new Date();
    }

  }

}
