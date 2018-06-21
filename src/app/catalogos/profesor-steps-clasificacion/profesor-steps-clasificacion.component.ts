import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {FormControl, Validators, FormGroup} from "@angular/forms";
import * as moment from "moment";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Router, ActivatedRoute} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Profesor} from "../../services/entidades/profesor.model";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-profesor-steps-clasificacion',
  templateUrl: './profesor-steps-clasificacion.component.html',
  styleUrls: ['./profesor-steps-clasificacion.component.css']
})
export class ProfesorStepsClasificacionComponent implements OnInit {
  router: Router;
  formulario: FormGroup;
  errorNext: string = '';
  enableValidation: boolean = false;
  edicionFormulario: boolean = false;
  profesorService;
  catTipoTiempoService;
  catTipoProfesorService;
  catEstatus;
  clasificacionProfesorService;
  clasificacionEspecificaProfesorService;
  entidadProfesor = Profesor;
  idProfesor;
  idTipoClasificacion;
  validacionActiva: boolean = false;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};

  private opcionesClasificacionProfesor: Array<ItemSelects> = [];
  private opcionesTipotiempo: Array<ItemSelects> = [];
  private opcionesTipoProfesor: Array<ItemSelects> = [];
  private opcionesEstatus: Array<ItemSelects> = [];
  private opcionesClasificacionEspecifica: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(public _catalogosServices: CatalogosServices, _router: Router, route: ActivatedRoute,
              private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idProfesor = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    //console.log(params.id);
    this.prepareServices();
    this.router = _router;
    this.formulario = new FormGroup({
      idClasificacion: new FormControl('', Validators.required), //interno - externo
      idTipo: new FormControl('', Validators.required),       // docente - docente investigacion
      idClasificacionEspecifica: new FormControl(''), // clasificacion especifica
                                                  // segun la clasificacion
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
          //console.error(errores);
        },
        () => {
          //console.log(profesor);
          if (this.formulario) {
            let intClasificacion = 'idClasificacion';
            let intTipo = 'idTipo';
            let intClasificacionEspecifica = 'idClasificacionEspecifica';

            if (profesor.clasificacionProfesor.id !== undefined) {
              //console.log(profesor.clasificacionProfesor.id);
              (<FormControl>this.formulario.controls[intClasificacion])
                .setValue(profesor.clasificacionProfesor.id);
              this.cambioClasificacionEspecificaFiltro(
                profesor.clasificacionProfesor.id);
            }

            if (profesor.tipo.id !== undefined) {
              (<FormControl>this.formulario.controls[intTipo])
                .setValue(profesor.tipo.id);
            }

            if (profesor.clasificacionEspecifica.id !== undefined) {
              //console.log(profesor.clasificacionEspecifica.id);
              (<FormControl>this.formulario.controls[intClasificacionEspecifica])
                .setValue(profesor.clasificacionEspecifica.id);
              /*this.cambioClasificacionEspecificaFiltro(
               profesor.clasificacionProfesor.id);*/
            }

          }
        }
      );
    }
  }

  nextMethod(): boolean {
    let profesor: Profesor;
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
      } else {
/*        this.profesorService
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
        return true;*/
      }
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
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  cambioClasificacionEspecificaFiltro(idClasificacionProfesor: number): void {
    //console.log('idClasificacion', idClasificacionProfesor);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idTipoClasificacion~' + idClasificacionProfesor + ':IGUAL');
    //console.log(urlParameter);
    this.opcionesClasificacionEspecifica =
      this.clasificacionEspecificaProfesorService.
      getSelectClasificacionEspecificaProfesor(this.erroresConsultas, urlParameter);
  }


  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this.clasificacionProfesorService = this._catalogosServices.getTipoClasificacionProfesor();
    this.opcionesClasificacionProfesor =
      this.clasificacionProfesorService.
      getSelectTipoClasificacionProfesor(this.erroresConsultas);
    this.profesorService = this._catalogosServices.getProfesor();
    this.catTipoProfesorService = this._catalogosServices.getTipoProfesor();
    this.opcionesTipoProfesor = this.catTipoProfesorService.getSelectTipoProfesor();
    this.profesorService = this._catalogosServices.getProfesor();

    this.catEstatus = this._catalogosServices.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    //console.log(urlParameter);
    this.opcionesEstatus =
      this.catEstatus.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
    this.clasificacionEspecificaProfesorService =
      this._catalogosServices.getClasificacionEspecificaProfesor();




  }

  ngOnInit() {
  }

}
