import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {PlanEstudioIdioma} from "../../services/entidades/plan-estudio-idioma.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-plan-estudios-steps-idiomas',
  templateUrl: './plan-estudios-steps-idiomas.component.html',
  styleUrls: ['./plan-estudios-steps-idiomas.component.css']
})
export class PlanEstudiosStepsIdiomasComponent implements OnInit {
  estadoBoton: boolean;
  formulario: FormGroup;
  edicionFormulario: boolean = false;
  mensajeErrors: any = { 'required': 'Este campo es requerido' };
  enableValidation: boolean = false;
  errorNext: string = '';
  catIdiomas;
  idPlanEstudios;
  planEstudiosIdiomaService;
  registroSeleccionadoIdioma: PlanEstudioIdioma;
  registrosIdiomas: Array<PlanEstudioIdioma>  = [];
  registrosAuxiliares: Array<PlanEstudioIdioma> = [];
  validacionActiva: boolean = false;
  numeroIdioma: number;
  numeroIdIdioma: number;

  columnas: Array<any> = [
    { titulo: 'Idioma', nombre: 'idiomaPlan' }
  ];

  private opcionesCatIdiomas: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(public _catalogosServices: CatalogosServices,
              route: ActivatedRoute,
              private _router: Router, private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    //console.log(params.id);

    if (this.sub.id) {
      this.idPlanEstudios = this.sub.id;
    }
    console.warn(this.idPlanEstudios);

    this.prepareService();
    this.onCambiosIdiomas();
    this.formulario = new FormGroup({
      idiomaPlan: new FormControl('', Validators.required),
      idPlanEstudios: new FormControl(this.idPlanEstudios)
      //idPlanEstudios: new FormControl(this.idPlanEstudios)
    });
  }

  previusMethod(): boolean {
    return true;
  }

  nextMethod(): boolean {
    return true;
  }

  agregarIdiomaPlanEstudios(): any {
    if (this.numeroIdioma < 1) {
      if (this.validarFormulario()) {
        this._spinner.start("idiomas1");
        let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
        //console.log(jsonFormulario);
        //console.log('Para guardar');
        this.planEstudiosIdiomaService
          .postPlanEstudioIdioma(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success Save'),
          console.error,
          () => {
            (<FormControl>this.formulario.controls['idiomaPlan']).setValue('');
            this.onCambiosIdiomas();
            this._spinner.stop("idiomas1");
          }
        );
      }
    }

    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus~1007' + ':IGUAL');
    //console.log(urlParameter);

    this.opcionesCatIdiomas =
      this.catIdiomas.getSelectIdiomasFiltrado(
        this.erroresConsultas, urlParameter);
    this.estadoBoton = false;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionadoIdioma === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionadoIdioma !== registro) {
      this.registroSeleccionadoIdioma = registro;
    } else {
      this.registroSeleccionadoIdioma = null;
    }
  }

  onCambiosIdiomas(): void {
    this.registroSeleccionadoIdioma = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idPlanEstudios~' + this.idPlanEstudios + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.registrosIdiomas = this.planEstudiosIdiomaService.getListaPlanEstudioIdioma(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }

  mostrarBotonAgregar(): boolean {
    return this.estadoBoton;
  }

  getIdIdioma(idIdioma): void {
    this.estadoBoton = false;
    if (idIdioma) {
      this.numeroIdIdioma = idIdioma;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idiomaPlan~' + this.numeroIdIdioma + ':IGUAL' +
        ',idPlanEstudios~' + this.idPlanEstudios + ':IGUAL');

      this.planEstudiosIdiomaService.getListaPlanEstudioIdiomaPaginacion(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          this.registrosAuxiliares = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosAuxiliares.push(new PlanEstudioIdioma(item));
          });
          this.numeroIdioma = this.registrosAuxiliares.length;
          //console.log('TAMAÑO' + this.registrosAuxiliares.length);
        },
        error => {
          console.error(error);
        },
        () => {
          if (this.numeroIdioma < 1) {
            this.estadoBoton = true;
          }else {
            this.estadoBoton = false;
          }
        }


      );
    }else {
      this.estadoBoton = false;
    }

  }

  eliminarIdioma(): void {
    if (this.registroSeleccionadoIdioma) {
      //console.log('Eliminando...');
      this.planEstudiosIdiomaService.deletePlanEstudioIdioma(
        this.registroSeleccionadoIdioma.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosIdiomas();
        }
      );
    }else {
      alert('Selecciona un registro');
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

  mostarBotonEliminar() {
    if (this.registroSeleccionadoIdioma) {
      return true;
    }else {
      return false;
    }
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }


  private prepareService(): void {
    this.catIdiomas = this._catalogosServices.getIdioma();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus~1007' + ':IGUAL');
    //console.log(urlParameter);
    this.opcionesCatIdiomas =
      this.catIdiomas.getSelectIdiomasFiltrado(this.erroresConsultas, urlParameter);

    this.planEstudiosIdiomaService = this._catalogosServices.getPlanEstudioIdiomaService();
  }


  ngOnInit() {
  }

}
