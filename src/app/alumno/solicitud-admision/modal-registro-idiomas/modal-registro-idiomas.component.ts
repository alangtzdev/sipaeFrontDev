
import {Component, Injector, OnInit, ViewChild} from "@angular/core";
import {errorMessages} from "../../../utils/error-mesaje";
import {IdiomaEstudiante} from "../../../services/entidades/idioma-estudiante.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {ItemSelects} from "../../../services/core/item-select.model";
import {IdiomaEstudianteService} from "../../../services/entidades/idioma-estudiante.service";
import {Router} from "@angular/router";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {AntecedenteAcademicoComponent} from "../antecedente-academico/antecedente-academico.component";
@Component({
  selector: 'app-modal-registro-idiomas',
  templateUrl: './modal-registro-idiomas.component.html',
  styleUrls: ['./modal-registro-idiomas.component.css']
})
export class ModalRegistroIdiomasComponent implements OnInit {

  @ViewChild('modalRegIdioma')
  dialog: ModalComponent;
  context: AntecedenteAcademicoComponent;
  idiomaService;
  nivelIdiomaService;
  auxiliar: boolean = false;

  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;

  edicionFormulario: boolean = false;
  entidadIdioma: IdiomaEstudiante;

  formulario: FormGroup;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private opcionIdioma: Array<ItemSelects> = [];
  private opcionNivel: Array<ItemSelects> = [];
  private opcionIdiomaService: Array<ItemSelects> = [];
  private opcionNivelIdioma: Array<ItemSelects> = [];
  _idiomaEstudianteService: IdiomaEstudianteService;

  constructor(private inj:Injector,
              private router: Router, private _spinnerService: SpinnerService) {

    this.context = this.inj.get(AntecedenteAcademicoComponent);

    this.prepareServices();
    this.formulario = new FormGroup({
      idEstudiante: new FormControl(this.context.idEstudiante),
      idIdioma: new FormControl('', Validators.required),
      idNivelIdioma: new FormControl('', Validators.required),
      otro: new FormControl('', Validators.required)
    });
    if (this.context.idIdioma) {
      //console.log(this.context.idExperienciaProfesional);
      this.edicionFormulario = true;
      let idiomaEstudiante: IdiomaEstudiante;
      this.entidadIdioma = this._idiomaEstudianteService
        .getIdiomaEstudiante(
          this.context.idIdioma,
          this.erroresConsultas
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>
            idiomaEstudiante = new IdiomaEstudiante(
              response.json()),
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
              console.error(error);
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {

            if (this.formulario) {
              let stringIdIdioma = 'idIdioma';
              let stringIdNivel = 'idNivelIdioma';
              let stringOtro = 'otro';

              if (idiomaEstudiante.idIdioma.id !== undefined) {
                (<FormControl>this.formulario
                  .controls[stringIdIdioma])
                  .setValue(idiomaEstudiante.idIdioma.id);
              }
              if (idiomaEstudiante.idNivelIdioma.id !== undefined) {
                (<FormControl>this.formulario
                  .controls[stringIdNivel])
                  .setValue(idiomaEstudiante.idNivelIdioma.id);
              }
              (<FormControl>this.formulario.controls[stringOtro])
                .setValue(idiomaEstudiante.otro);
            }
          }
        );
    }
  }

  validarFormulario(): boolean {
    if (this.auxiliar) {
      (<FormControl>this.formulario.controls['idIdioma'])
        .setValue('666');
    }
    if (!this.auxiliar) {
      (<FormControl>this.formulario.controls['otro'])
        .setValue('otroIdioma');
    }

    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  liimpiarForumulario(): void {

    if (this.auxiliar) {
      (<FormControl>this.formulario.controls['idIdioma'])
        .setValue("");
    }

    if (!this.auxiliar) {
      (<FormControl>this.formulario.controls['otro'])
        .setValue("");
    }
  }

  cerrarModal(): void {
    this.dialog.close();
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this.liimpiarForumulario();
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log(jsonFormulario);
      this._spinnerService.start("enviarFormulario");
      this._idiomaEstudianteService.postIdiomaEstudiante(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.context.onCambiosTablaIdioma();
          this.cerrarModal();
          //console.log(this.formulario.value);
          this._spinnerService.stop("enviarFormulario");
        });
    }
  }

  validarOtroIdioma(): boolean {
    if (this.auxiliar) {
      return true;
    }else {
      return false;
    }
  }

  cambiarAuxiliar(valor): any {
    if (valor) {
      this.auxiliar = true;
    }else {
      this.auxiliar = false;
    }
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
    this._idiomaEstudianteService = this.context.catalogosServices.getIdiomaEstudiante();

    this.idiomaService =
      this.context.catalogosServices.getIdioma();
    this.opcionIdiomaService =
      this.idiomaService.getSelectIdioma(this.erroresConsultas);

    this.nivelIdiomaService =
      this.context.catalogosServices.getNivelIdioma();
    this.opcionNivelIdioma =
      this.nivelIdiomaService.getSelectNivelIdioma(this.erroresConsultas);
  }

  ngOnInit(): void {
  }


}
