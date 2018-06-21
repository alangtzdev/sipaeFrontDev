import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {errorMessages} from "../../../utils/error-mesaje";
import {Direccion} from "../../../services/entidades/direccion.model";
import {ItemSelects} from "../../../services/core/item-select.model";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {Validacion} from "../../../utils/Validacion";
import {DatosPersonalesComponent} from "../datos-personales/datos-personales.component";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
  selector: 'app-modal-registro-direccion',
  templateUrl: './modal-registro-direccion.component.html',
  styleUrls: ['./modal-registro-direccion.component.css']
})
export class ModalRegistroDireccionComponent implements OnInit {

  @ViewChild("modalRegDir")
    dialog:ModalComponent;
  formulario: FormGroup;
  paisService;
  estadoService;
  municipioService;
  tipoDireccionService;

  mensajeErrors: any = errorMessages;
  validacionActiva: boolean = false;
  ocultarDireccion: boolean;

  edicionFormulario: boolean = false;
  entidadDireccion: Direccion;
  parentComponent: DatosPersonalesComponent;

  private opcionesCatalogoDireccion: Array<ItemSelects>;
  private opcionesCatalogoPais: Array<ItemSelects>;
  private opcionesCatalogoEstado: Array<ItemSelects>;
  private opcionesCatalogoMunicipio: Array<ItemSelects>;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private inj:Injector,
              private _spinner: SpinnerService) {
    this.parentComponent = this.inj.get(DatosPersonalesComponent);
    this.formulario = new FormGroup({
      idTipo: new FormControl('', Validators.required),
      calle: new FormControl('',
        Validators.compose([
          Validators.required,
          Validacion.parrafos,
        ])),
      colonia: new FormControl('',
        Validators.compose([
          Validacion.parrafos,
        ])),
      idPais: new FormControl('', Validators.required),
      codigoPostal: new FormControl('',
        Validators.compose([Validators.required,
          Validacion.numerosValidator])),
      idEntidadFederativa: new FormControl(''),
      idMunicipio: new FormControl(''),
      telefono: new FormControl('',
        Validators.compose([Validacion.telefonoValidator])),
      telefonoOficina: new FormControl('',
        Validators.compose([Validacion.telefonoValidator])),
      celular: new FormControl('',
        Validators.compose([Validacion.celularValidator])),
      idEstudiante: new FormControl(this.parentComponent.idEstudiante),
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

  enviarFormulario(): void {
    console.log(this.validarFormulario());
    console.log(this.validarFormulario2());
    if (this.validarFormulario()) {
      this.limpiarFormulario();
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      if (this.edicionFormulario) {
        this._spinner.start("enviarFormulario");
        this.parentComponent.direccionService
          .putDireccion(
            this.parentComponent.idDireccion,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          error => {
            //this.addErrorsMesaje('aqui el mensaje');
            //console.log(error);
            this._spinner.stop("enviarFormulario");
          },
          () => {
            this.parentComponent.registroSeleccionado = null;
            this._spinner.stop("enviarFormulario");
            this.parentComponent.onCambiosTabla();
            this.cerrarModal();
          }
        );
      }else {
        this._spinner.start("enviarFormulario");
        this.parentComponent.direccionService
          .postDireccion(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          error => {
            //this.addErrorsMesaje('aqui el mensaje');
            //console.log(error);
            this._spinner.stop("enviarFormulario");
          },
          () => {
            this._spinner.stop("enviarFormulario");
            this.parentComponent.onCambiosTabla();
            this.cerrarModal();
          }
        );
      }
    }
  }

  //ocultar datos de direción
  getSelectPais(idPais): void {
    if (idPais == 82 ) {
      this.ocultarDireccion = false;
    }else {
      this.ocultarDireccion = true;
    }
  }

  ocultarDireccionMexico(): boolean {
    if (this.ocultarDireccion) {
      return false;
    }else {
      return true;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  private validarFormulario2(): boolean {
    if (this.ocultarDireccion) {
      //console.log('es difernete MX');
      (<FormControl>this.formulario.
        controls['codigoPostal']).setValue('12345');
    }
    //console.log(this.formulario.value);
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  private limpiarFormulario (): any {
    if (this.ocultarDireccion) {
      (<FormControl>this.formulario.
        controls['codigoPostal']).setValue('');
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

  private cargarMunicipios(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEntidadFederativa~' + id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.municipioService = this.parentComponent._catalogosServices.getMunicipio();
    this.opcionesCatalogoMunicipio =
      this.municipioService.getListaMunicipio(this.erroresConsultas, urlParameter).lista;
  }

  private prepareServices(): void {
    this.paisService = this.parentComponent._catalogosServices.getPais();
    this.opcionesCatalogoPais = this.paisService.getSelectPais(this.erroresConsultas);

    this.estadoService = this.parentComponent._catalogosServices.getEntidadFederativa();
    this.opcionesCatalogoEstado =
      this.estadoService.getSelectEntidadFederativa(this.erroresConsultas);

    this.tipoDireccionService = this.parentComponent._catalogosServices.getTipoDireccion();
    this.opcionesCatalogoDireccion =
      this.tipoDireccionService.getSelectTipoDireccion(this.erroresConsultas);
  }

  ngOnInit() {
  }


  onInitDir(){
    this.prepareServices();
    //console.log(this.context.idDirección);
    let intIdTipo = 'idTipo';
    let stringCalle = 'calle';
    let stringColonia = 'colonia';
    let intIdPais = 'idPais';
    let strinigCodigoPostal = 'codigoPostal';
    let intIdEntidadFederativa = 'idEntidadFederativa';
    let intIdMunicipio = 'idMunicipio';
    let stringTelefono = 'telefono';
    let stringTelefonoOficina = 'telefonoOficina';
    let stringCelular = 'celular';

    if (this.parentComponent.idDireccion) {
      ////console.log(this.context.idconvenio);
      this.edicionFormulario = true;
      let direccion: Direccion;
      this.entidadDireccion = this.parentComponent
        .direccionService.getDireccion(
          this.parentComponent.idDireccion,
          this.erroresConsultas
        ).subscribe(
          response =>
            direccion = new Direccion(response.json()),
          error => {

          },
          () => {

            if (this.formulario) {


              if (direccion.tipo.id !== undefined) {
                (<FormControl>this.formulario.controls[intIdTipo])
                  .setValue(direccion.tipo.id);
              }
              (<FormControl>this.formulario.controls[stringCalle])
                .setValue(direccion.calle);
              (<FormControl>this.formulario.controls[stringColonia])
                .setValue(direccion.colonia);
              if (direccion.pais.id !== undefined) {
                (<FormControl>this.formulario.controls[intIdPais])
                  .setValue(direccion.pais.id);
              }
              (<FormControl>this.formulario.controls[strinigCodigoPostal])
                .setValue(direccion.codigoPostal);
              if (direccion.entidadFederativa.id !== undefined) {
                (<FormControl>this.formulario.controls[intIdEntidadFederativa])
                  .setValue(direccion.entidadFederativa.id);
              }
              if (direccion.municipio.id !== undefined) {
                (<FormControl>this.formulario.controls[intIdMunicipio])
                  .setValue(direccion.municipio.id);
              }
              (<FormControl>this.formulario.controls[stringTelefono])
                .setValue(direccion.telefono);
              this.getSelectPais(direccion.pais.id);

            }
          }
        );
    }else {
      this.edicionFormulario = false;
      (<FormControl>this.formulario.controls[intIdTipo])
          .setValue("");
      (<FormControl>this.formulario.controls[stringCalle])
        .setValue("");
      (<FormControl>this.formulario.controls[stringColonia])
        .setValue("");
        (<FormControl>this.formulario.controls[intIdPais])
          .setValue("");
      (<FormControl>this.formulario.controls[strinigCodigoPostal])
        .setValue("");
      (<FormControl>this.formulario.controls[intIdEntidadFederativa])
        .setValue("");

        (<FormControl>this.formulario.controls[intIdMunicipio])
          .setValue("");

      (<FormControl>this.formulario.controls[stringTelefono])
        .setValue("");

    }
  }
}
