import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import * as moment from "moment";
import {errorMessages} from '../../utils/error-mesaje';
import {URLSearchParams} from '@angular/http';
import { DatepickerModule } from 'ng2-bootstrap';
import {Profesor} from '../../services/entidades/profesor.model';
import {NucleoAcademicoBasico} from '../../services/entidades/nucleo-academico-basico.model';

@Component({
  selector: 'app-registro-admision-step-tres',
  templateUrl: './registro-admision-step-tres.component.html',
  styleUrls: ['./registro-admision-step-tres.component.css']
})
export class RegistroAdmisionStepTresComponent implements OnInit {

  router: Router;
  formulario: FormGroup;
  idEstudiante: number;
  idInvestigadorAnfitrion: number;
  validacionActiva: boolean = false;
  edicionFormulario: boolean = false;
  mensajeErrors: any = errorMessages;
  profesorService;
  programaDocenteService;
  anfitrionService;
  estudianteMovilidadService;
  profesores: Array<Profesor> = [];
  programasDocente: Array<ItemSelects> = [];
  dt: Date = new Date();
  dt2: Date = new Date();
  dtMax: Date = new Date();
  fechaMinima = new Date();
  fechaMaxima: Date;
  contador: number = 0;
  nabService;
  nab: NucleoAcademicoBasico;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(_router: Router, route: ActivatedRoute, private _catalogosServices: CatalogosServices) {
    this.router = _router;
    //let params = _router.parent.parent.currentInstruction.component.params;
    //this.idEstudiante = params.id;
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
    });
    this.prepareServices();
    this.formulario = new FormGroup({
      idProfesor: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
      tipoVinculacion: new FormControl(''),
      fechaFin: new FormControl(''),
      fechaInicio: new FormControl(''),
    });
    if (this.idEstudiante) {
      this.obtenerEstudianteMovilidadExterna();
    }
  }

  getFechaEjemplo(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaInicio'])
          .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }

  getFechaFin(): string {
    if (this.dt2) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaFin'])
          .setValue(fechaConFormato  + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
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

  obtenerEstudianteMovilidadExterna(): void {
    let estudianteActual: EstudianteMovilidadExterna;
    this.estudianteMovilidadService.getEntidadEstudianteMovilidadExterna(
        this.idEstudiante,
        this.erroresConsultas
    ).subscribe(
        response =>
            estudianteActual = new EstudianteMovilidadExterna(
                response.json()),
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
        },
        () => {
          this.obtenerIntegrantesNab(estudianteActual.idProgramaDocente.id);
          //console.log(estudianteActual.investigadorAnfitrion.id);
          if (estudianteActual.investigadorAnfitrion.id !== undefined) {
            this.edicionFormulario = true;
            this.idInvestigadorAnfitrion = estudianteActual.investigadorAnfitrion.id;
            if (this.formulario) {
              let fechaInicio =
                  moment(estudianteActual.investigadorAnfitrion.fechaInicio);
              let fechaFin =
                  moment(estudianteActual.investigadorAnfitrion.fechaFin);
              (<FormControl>this.formulario.controls['idProgramaDocente'])
                  .setValue(
                      estudianteActual.investigadorAnfitrion.programaDocente.id
                  );
              (<FormControl>this.formulario.controls['idProfesor'])
                  .setValue(estudianteActual.investigadorAnfitrion.profesor.id);
              (<FormControl>this.formulario.controls['tipoVinculacion'])
                  .setValue(estudianteActual.investigadorAnfitrion.tipoVinculacion);
              this.dt = new Date(fechaInicio.toJSON());
              this.dt2 = new Date(fechaFin.toJSON());
              //console.log(this.formulario);
            }
          }
        }
    );
  }

  nextMethod(): any {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      if (this.edicionFormulario) {
        return this.anfitrionService.putInvestigadorAnfitrion(
            this.idInvestigadorAnfitrion,
            jsonFormulario,
            this.erroresGuardado
        ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
            }
        );
        //this._spinner.stop();
        //return true;
      }else {
        return this.anfitrionService.postInvestigadorAnfitrion(
            jsonFormulario,
            this.erroresGuardado
        ).subscribe(
            response => {
              try {
                let json = '{"idInvestigadorAnfitrion": "' + response.json().id + '"}';
                //console.log(json);
                this.estudianteMovilidadService.putEstudianteMovilidadExterna(
                    this.idEstudiante,
                    json,
                    this.erroresGuardado
                ).subscribe(
                    () => {
                    }
                );
              } catch (Exception) {
                //this.changeNextStep();
              }
            });
        //return true;
      }
    }
  }

  previusMethod(): boolean {
    return true;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }
  obtenerIntegrantesNab(idProgramaDocente): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL'
        + ',idEstatus~' + '1007' + ':IGUAL');
    //console.log('url:  ' + urlParameter);
    this.nabService.getListaNucleoAcademicoBasico(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          response.json().lista.forEach((nab) => {
            this.nab = new NucleoAcademicoBasico(nab);
            this.profesores = this.nab.integrantesNab;
          });
        }
    );
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

  private prepareServices(): void {
    this.nabService = this._catalogosServices.getNucleoAcadBasico();
    this.profesorService = this._catalogosServices.getProfesor();
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.anfitrionService = this._catalogosServices.getInvestigadorAnfitrionService();
    this.estudianteMovilidadService = this._catalogosServices.getEstudianteMovilidadExterna();
    this.programasDocente = this.programaDocenteService.getSelectProgramaDocente();
  }

  ngOnInit() {
  }

}
