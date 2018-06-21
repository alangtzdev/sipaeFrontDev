import { Component, OnInit } from '@angular/core';
import {FormControl, Validators, FormGroup} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Profesor} from "../../services/entidades/profesor.model";
import * as moment from "moment";

@Component({
  selector: 'app-profesor-steps-datos-generales',
  templateUrl: './profesor-steps-datos-generales.component.html',
  styleUrls: ['./profesor-steps-datos-generales.component.css']
})
export class ProfesorStepsDatosGeneralesComponent implements OnInit {
  router: Router;
  formulario: FormGroup;
  entidadProfesor : Profesor;
  errorNext: string = '';
  enableValidation: boolean = false;
  edicionFormulario: boolean = false;
  sexoService;

  paisService;
  entidadFederativaService;
  profesorService;
  idProfesor;

  validacionActiva: boolean = false;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};

  private opcionesCatSexo: Array<ItemSelects> = [];
  private opcionesCatEntidadesFederativas: Array<ItemSelects> = [];
  private opcionesCatPaises: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(public _catalogosServices: CatalogosServices, _router: Router,route: ActivatedRoute,
              private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idProfesor = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    //console.log(params.id);
    this.prepareServices();
    this.router = _router;
    this.formulario = new FormGroup({
      nombre: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      primerApellido: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])
      ),
      segundoApellido: new FormControl('', Validators.compose([
        Validacion.parrafos])
      ),
      idSexo: new FormControl('', Validators.required),
      ciudad: new FormControl('', Validators.compose([
        Validacion.letrasNumerosAcentoPuntoComaValidator])
      ),
      numExterior: new FormControl('', Validators.compose([
        Validacion.letrasNumerosValidator])
      ),
      numInterior: new FormControl('', Validators.compose([
        Validacion.letrasNumerosValidator])
      ),
      colonia: new FormControl('', Validators.compose([
        Validacion.letrasNumerosAcentoPuntoComaValidator])
      ),
      idPais: new FormControl(''),
      idEntidadFederativa: new FormControl(''),
      municipio: new FormControl('', Validators.compose([
        Validacion.letrasNumerosAcentoPuntoComaValidator])
      ),
      codigoPostal: new FormControl('', Validators.compose([
        Validacion.numerosValidator])
      ),
      email: new FormControl('',
        Validators.compose([Validacion.emailValidatorOptional])),
      telefono: new FormControl('', Validators.compose([
        Validacion.numerosValidator])
      ),
      celular: new FormControl('', Validators.compose([
        Validacion.numerosValidator])
      ),
      //gradoAcademico: new FormControl(),
      discapacidad: new FormControl(),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))

    });
    if (this.idProfesor) {
      let profesor: Profesor;
      this.edicionFormulario = true;
      //console.log(this.idProfesor);
      this.entidadProfesor = this.profesorService.getEntidadProfesor(
        this.idProfesor,
        this.erroresConsultas
      ).subscribe(
        response => profesor = new Profesor(response.json()),
        error => {
          console.error(error);
//            console.error(errores);
        },
        () => {
          //console.log(profesor);
          if (this.formulario) {
            let stringNombre = 'nombre';
            let stringPrimerApellido = 'primerApellido';
            let stringSegundoApellido = 'segundoApellido';
            let stringSexo = 'idSexo';
            let stringCiudad = 'ciudad';
            let stringNumExt = 'numExterior';
            let stringNumInt = 'numInterior';
            let stringColonia = 'colonia';
            let stringPais = 'idPais';
            let stringEstado = 'idEntidadFederativa';
            let stringMunicipio = 'municipio';
            let stringCP = 'codigoPostal';
            let stringEmail = 'email';
            let stringTelefono = 'telefono';
            let stringCelular = 'celular';
            //let stringGradoAcademicp = 'gradoAcademico';
            let stringDiscapacidad = 'discapacidad';

            (<FormControl>this.formulario.controls[stringNombre])
              .setValue(profesor.nombre);
            (<FormControl>this.formulario.controls[stringPrimerApellido])
              .setValue(profesor.primerApellido);
            (<FormControl>this.formulario.controls[stringSegundoApellido])
              .setValue(profesor.segundoApellido);
            (<FormControl>this.formulario.controls[stringCiudad])
              .setValue(profesor.ciudad);
            (<FormControl>this.formulario.controls[stringNumExt])
              .setValue(profesor.numExterior);
            (<FormControl>this.formulario.controls[stringNumInt])
              .setValue(profesor.numInterior);
            (<FormControl>this.formulario.controls[stringColonia])
              .setValue(profesor.colonia);


            (<FormControl>this.formulario.controls[stringMunicipio])
              .setValue(profesor.municipio);
            (<FormControl>this.formulario.controls[stringCP])
              .setValue(profesor.codigoPostal);
            (<FormControl>this.formulario.controls[stringEmail])
              .setValue(profesor.email);
            (<FormControl>this.formulario.controls[stringTelefono])
              .setValue(profesor.telefono);
            (<FormControl>this.formulario.controls[stringCelular])
              .setValue(profesor.celular);
            (<FormControl>this.formulario.controls[stringDiscapacidad])
              .setValue(profesor.discapacidad);
            //console.log(this.formulario);

            if (profesor.sexo.id !== undefined){
              (<FormControl>this.formulario.controls[stringSexo])
                .setValue(profesor.sexo.id);
            }
            if (profesor.pais.id !== undefined){
              (<FormControl>this.formulario.controls[stringPais])
                .setValue(profesor.pais.id);
            }
            if (profesor.entidadFedetativa.id !== undefined){
              (<FormControl>this.formulario.controls[stringEstado])
                .setValue(profesor.entidadFedetativa.id);
            }
          }
        }
      );
    }

  }

  nextMethod(): boolean {
    if (this.validarFormulario()) {
      //this._spinner.start();
      let  jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log(jsonFormulario);
      if (this.idProfesor) {
        this.profesorService
          .putProfesor(
            this.idProfesor,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            //this._spinner.stop();

          }
        );
        return true;
      } /*else {
        this.profesorService
          .postProfesor(
            jsonProfesor,
            this.erroresGuardado
          ).subscribe(
          response => {
            idFormularioGuardado = response.json();
          },
          console.error,
          () => {
            //console.log('Registro finalizado :)');
            console.warn('idFormularioGuardado', idFormularioGuardado);
            //this._spinner.stop();
          }
        );
        return true;
      }*/
    } else {
      //this.errorNext = 'Error en los campos, favor de verificar';
      return false;
    }
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  errorMessage(FormControl: FormControl): string {
    let resultado = '';
    if (FormControl.errors !== undefined && FormControl.errors !== null) {
      for (let errorType of Object.keys(FormControl.errors)) {
        if (FormControl.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  previusMethod(): boolean {
    return true;
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this.paisService = this._catalogosServices.getPais();
    this.opcionesCatPaises = this.paisService.getSelectPais(this.erroresConsultas);
    this.sexoService = this._catalogosServices.getSexo();
    this.opcionesCatSexo = this.sexoService.getSelectSexo(this.erroresConsultas);
    this.entidadFederativaService = this._catalogosServices.getEntidadFederativa();
    this.opcionesCatEntidadesFederativas =
      this.entidadFederativaService.getSelectEntidadFederativa(this.erroresConsultas);

    this.profesorService = this._catalogosServices.getProfesor();
  }

  ngOnInit() {
  }

}
