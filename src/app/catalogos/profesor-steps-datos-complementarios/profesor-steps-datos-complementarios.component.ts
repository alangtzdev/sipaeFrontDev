import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {FormControl, Validators, FormGroup} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import * as moment from "moment";
import {Router, ActivatedRoute} from "@angular/router";
import {Profesor} from "../../services/entidades/profesor.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";

@Component({
  selector: 'app-profesor-steps-datos-complementarios',
  templateUrl: './profesor-steps-datos-complementarios.component.html',
  styleUrls: ['./profesor-steps-datos-complementarios.component.css']
})
export class ProfesorStepsDatosComplementariosComponent implements OnInit {
  router: Router;
  formulario: FormGroup;
  //errorNext: string = '';
  enableValidation: boolean = false;
  errorNext: string = '';
  edicionFormulario: boolean = false;
  profesorService;
  catTipoTiempoService;
  catEstatus;
  entidadProfesor = Profesor;
  idProfesor;
  estadoCivilService;
  maxDate: Date = new Date();
  dtNacimiento: Date = new Date();
  dtIngreso: Date = new Date();
  validacionActiva: boolean = false;

  private opcionesEstadoCivil: Array<ItemSelects> = [];
  private opcionesTipotiempo: Array<ItemSelects> = [];
  private opcionesEstatus: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(public _catalogosServices: CatalogosServices,route: ActivatedRoute, _router: Router) {
    this.sub = route.params.subscribe(params => {
      this.idProfesor = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    //console.log(params.id);
    this.prepareServices();
    this.router = _router;
    moment.locale('es');
    this.formulario = new FormGroup({
      idTipoTiempoTrabajo: new FormControl(''),
      idEstatus: new FormControl('', Validators.required),
      lugarNacimiento: new FormControl('', Validators.compose([
        Validacion.parrafos])
      ),
      fechaNacimiento: new FormControl(),
      fechaIngreso: new FormControl(),
      curp: new FormControl('', Validators.compose([
        Validacion.curpValidatorOptional])
      ),
      idEstadoCivil: new FormControl(''),
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
          console.error(error);
        },
        () => {
          //console.log(profesor);
          if (this.formulario) {
            let stringfechaNacimiento = 'fechaNacimiento';
            let stringlugarNacimiento = 'lugarNacimiento';
            let stringCURP = 'curp';
            let stringEstadoCivil = 'idEstadoCivil';
            let stringEstatus = 'idEstatus';
            let stringTiempo = 'idTipoTiempoTrabajo';
            let stringfechaIngreso = 'fechaIngreso';

            let fechaNacimientoRecuperada = moment(
              profesor.fechaNacimiento);
            let fechaIngresoRecuperada = moment(
              profesor.fechaIngreso);

            (<FormControl>this.formulario.controls[stringlugarNacimiento])
              .setValue(profesor.lugarNacimiento);
            (<FormControl>this.formulario.controls[stringCURP])
              .setValue(profesor.curp);
            this.dtNacimiento = new Date(fechaNacimientoRecuperada.toJSON());
            this.dtIngreso = new Date(fechaIngresoRecuperada.toJSON());
            //console.log(this.formulario);
            if (profesor.estadoCivil.id !== undefined) {
              (<FormControl>this.formulario.controls[stringEstadoCivil])
                .setValue(profesor.estadoCivil.id);
            }
            if (profesor.estatus.id !== undefined) {
              (<FormControl>this.formulario.controls[stringEstatus])
                .setValue(profesor.estatus.id);
            }
            if (profesor.tipoTiempo.id !== undefined) {
              (<FormControl>this.formulario.controls[stringTiempo])
                .setValue(profesor.tipoTiempo.id);
            }
          }
        }
      );
    }
  }

  previusMethod(): boolean {
    return true;
  }

  finishMethod(): boolean {
    if (this.validarFormulario()) {
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

          }
        );
        this.router.navigate(['/catalogo/profesores']);
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

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  ////// picker ///

  getFechaNacimiento(): string {
    if (this.dtNacimiento) {
      let fechaConFormato = moment(this.dtNacimiento).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaNacimiento'])
        .setValue(fechaConFormato);
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }
  getFechaIngreso(): string {
    if (this.dtIngreso) {
      let fechaConFormato = moment(this.dtIngreso).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaIngreso'])
        .setValue(fechaConFormato);
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  private errorMessage(FormControl: FormControl): string {
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

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this.profesorService = this._catalogosServices.getProfesor();
    this.catTipoTiempoService = this._catalogosServices.getTipoTiempo();
    this.opcionesTipotiempo = this.catTipoTiempoService.getSelectTipoTiempo();
    this.catEstatus = this._catalogosServices.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    //console.log(urlParameter);
    this.opcionesEstatus =
      this.catEstatus.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
    this.estadoCivilService = this._catalogosServices.getEstadoCivil();
    this.opcionesEstadoCivil =
      this.estadoCivilService.getSelectEstadoCivil(this.erroresConsultas);

  }

  ngOnInit() {
  }

}
