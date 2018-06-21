import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ExperienciaComponent} from "../experiencia/experiencia.component";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {errorMessages} from "../../../utils/error-mesaje";
import {Publicacion} from "../../../services/entidades/publicacion.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {Router} from "@angular/router";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {PublicacionService} from "../../../services/entidades/publicacion.service";
import * as moment from "moment";
import {Validacion} from "../../../utils/Validacion";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
  selector: 'app-modal-registro-publicaciones',
  templateUrl: './modal-registro-publicaciones.component.html',
  styleUrls: ['./modal-registro-publicaciones.component.css']
})
export class ModalRegistroPublicacionesComponent implements OnInit {


  // Variables componente
  publicacionService;
  @ViewChild("modalRegistroPub")
  dialog: ModalComponent;
  context: ExperienciaComponent;
  formulario: FormGroup;

  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;

  edicionFormulario: boolean = false;
  entidadPublicacion: Publicacion;

  // Variables picker
  public dt: Date = new Date();
  public fechaMaxima: Date = new Date();
  // Variable error de Guardado
  private erroresGuardado: Array<ErrorCatalogo> = [];

  // Constructor
  constructor( private inj:Injector,
              private router: Router,
              private _publicacionService: PublicacionService,
              private _spinner: SpinnerService
  ) {
    moment.locale('es');

    this.context = this.inj.get(ExperienciaComponent);

    this.formulario = new FormGroup({
      titulo: new FormControl('',
        Validators.compose([Validators.required,
          Validacion.parrafos])),
      fecha: new FormControl(''),
      resumen: new FormControl(''),
      idEstudiante: new FormControl(this.context.idEstudiante)
    });
  }


  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  cerrarModal(): void {
    this.dialog.close();
  }

  enviarFormulario(event): void {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      if (this.edicionFormulario) {
        this._spinner.start("enviarFormulario");
        this._publicacionService.putPublicacion(
          this.context.registroSeleccionadoPublicacion.id,
          jsonFormulario,
          this.erroresGuardado,
          this.router
        ).subscribe(
          response => {},
          error => {
            //console.log(error);
            this._spinner.stop("enviarFormulario");
          },
          () => {
            this.context.registroSeleccionadoPublicacion = null;
            this._spinner.stop("enviarFormulario");
            this.context.onCambiosTablaPublicacionAlterna();
            this.cerrarModal();
            //console.log(this.formulario.value);
          }
        );
      } else {
        this._spinner.start("enviarFormulario");
        this._publicacionService.postPublicacion(
          jsonFormulario,
          this.erroresGuardado,
          this.router
        ).subscribe(
          response => {},
          error => {
            //console.log(error);
            this._spinner.stop("enviarFormulario");
          },
          () => {
            this._spinner.stop("enviarFormulario");
            this.context.onCambiosTablaPublicacionAlterna();
            this.cerrarModal();
            //console.log(this.formulario.value);
          }
        );
      }

    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getFechaInicio(): string {
    if (this.dt) {
      let fecha =  moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fecha'])
        .setValue(fecha + ' 10:30am');
      return fecha;
    } else {
      return  moment(new Date()).format('DD/MM/YYYY');
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
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
  ngOnInit() { }
  onInit() {
    console.log(this.context.idPublicacion);
    let stringTitulo = 'titulo';
    let stringResumen = 'resumen';
    if (this.context.idPublicacion) {
      this.edicionFormulario = true;
      let publicacion: Publicacion;
      this.entidadPublicacion = this.context
        .registroPublicacionService
        .getPublicacion(
          this.context.idPublicacion,
          this.erroresGuardado
        ).subscribe(
          response =>
            publicacion = new Publicacion(
              response.json()),
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
            console.error(error);

          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            if (this.formulario) {

              let stringFecha = moment(publicacion.fecha);

              (<FormControl>this.formulario
                .controls[stringTitulo])
                .setValue(publicacion.titulo);
              (<FormControl>this.formulario
                .controls[stringResumen])
                .setValue(publicacion.resumen);

              this.dt = new Date(stringFecha.toJSON());
            }
          }
        );
    }else {
      (<FormControl>this.formulario
        .controls[stringTitulo])
        .setValue("");
      (<FormControl>this.formulario
        .controls[stringResumen])
        .setValue("");

      this.dt = new Date();
    }

  }

}
