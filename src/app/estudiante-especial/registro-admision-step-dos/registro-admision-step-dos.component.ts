import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {AuthService} from "../../auth/auth.service";
import {Validacion} from "../../utils/Validacion";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {errorMessages} from '../../utils/error-mesaje';
import {URLSearchParams} from '@angular/http';
import {DatoAcademicoMovilidadExterna} from '../../services/entidades/dato-academico-movilidad-externa.model';
import {InteresadoMovilidadExterna} from '../../services/entidades/interesado-movilidad-externa.model';

@Component({
  selector: 'app-registro-admision-step-dos',
  templateUrl: './registro-admision-step-dos.component.html',
  styleUrls: ['./registro-admision-step-dos.component.css']
})
export class RegistroAdmisionStepDosComponent implements OnInit {

  validacionActiva: boolean = false;
  edicionFormulario: boolean = false;
  mensajeErrors: any = errorMessages;
  formulario: FormGroup;
  entidadDatoAcademicoMovilidadExterna: DatoAcademicoMovilidadExterna;
  entidadInteresadoMovilidadExterna: InteresadoMovilidadExterna;
  datoAcademicoMovilidadExternaService;
  estudianteMovilidadService;
  interesadoMovilidadExternaService;
  correo: string;
  errorNext: string = '';
  idDatosAcademicosRecuperado;
  usuarioLogueado: UsuarioSesion;
  private idDatoAcademico: number;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private idEstudiante: number;
  private sub: any;

  constructor(_router: Router, route: ActivatedRoute, public _catalogosServices: CatalogosServices,
              private _spinner: SpinnerService, private authService: AuthService) {
    //let params = _router.parent.parent.currentInstruction.component.params;
    //this.idEstudianteMovilidadExterna = params.id;
    //this.idEstudiante = params.id;
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
    });
    this.prepareServices();
    //this.router = _router;


    this.formulario = new FormGroup({
      programaAcademico: new FormControl({value: '', disabled: true},
          Validators.compose([Validators.required, Validacion.parrafos])),
      institucion: new FormControl({value: '', disabled: true},
          Validators.compose([Validators.required, Validacion.parrafos])),
      facultad: new FormControl('',
          Validators.compose([Validacion.parrafos])),
      totalSemestre: new FormControl('',
          Validators.compose([Validacion.numerosValidator])),
      semestre: new FormControl({value: '', disabled: true}),
      promedioGeneral: new FormControl('',
          Validators.compose([Validacion.parrafos])),
      // Variables de contacto de emergencia
    });

    if (this.idEstudiante) {
      this.obtenerEstudianteMovilidadExterna();
      this.usuarioLogueado = authService.getUsuarioLogueado();
      this.obtenerInteresadoMovilidad(this.usuarioLogueado.email);
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
    this.estudianteMovilidadService
        .getEntidadEstudianteMovilidadExterna(
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
          /*if (assertionsEnabled()){
            //console.log(estudianteActual.getNombreCompleto());
            //console.log(estudianteActual.datosAcademicos.id);
          }*/
          let stringProgramaAcademico = 'programaAcademico';
          let stringInstitucion = 'institucion';
          let stringFacultad = 'facultad';
          let strindTotalSemestre = 'totalSemestre';
          let stringSemestre = 'semestre';
          let stringPromedioGeneral = 'promedioGeneral';

          if (estudianteActual.datosAcademicos.id !== undefined) {
            this.edicionFormulario = true;
            this.idDatoAcademico = estudianteActual.datosAcademicos.id;
            if (this.formulario) {
              (<FormControl>this.formulario.controls[stringProgramaAcademico])
                  .setValue(estudianteActual.datosAcademicos.programaAcademico);
              (<FormControl>this.formulario.controls[stringInstitucion])
                  .setValue(estudianteActual.datosAcademicos.institucion);
              (<FormControl>this.formulario.controls[stringFacultad])
                  .setValue(estudianteActual.datosAcademicos.facultad);
              (<FormControl>this.formulario.controls[strindTotalSemestre])
                  .setValue(estudianteActual.datosAcademicos.totalSemestre);
              (<FormControl>this.formulario.controls[stringSemestre])
                  .setValue(estudianteActual.datosAcademicos.semestre);
              (<FormControl>this.formulario.controls[stringPromedioGeneral])
                  .setValue(estudianteActual.datosAcademicos.promedioGeneral);
              //console.log(this.formulario);
            }
          }
        }
    );
  }

  obtenerInteresadoMovilidad(email:string): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'email~' + email + ':IGUAL');
    this.interesadoMovilidadExternaService
        .getListaInteresadoMovilidadExterna(
            this.erroresConsultas,
            urlSearch
        ).subscribe(
        response => {
          //console.log(response.json());
          response.json().lista.forEach((elemento) => {
            this.entidadInteresadoMovilidadExterna
                = new InteresadoMovilidadExterna (elemento);
            if (!this.idDatoAcademico) {
              let stringProgramaAcademico = 'programaAcademico';
              let stringInstitucion = 'institucion';
              let stringSemestre = 'semestre';

              if(this.formulario) {
                (<FormControl>this.formulario.controls[stringProgramaAcademico])
                    .setValue(this.entidadInteresadoMovilidadExterna.programaCursa);
                (<FormControl>this.formulario.controls[stringInstitucion])
                    .setValue(this.entidadInteresadoMovilidadExterna.institucionProcedencia);
                (<FormControl>this.formulario.controls[stringSemestre])
                    .setValue(this.entidadInteresadoMovilidadExterna.periodoCursa);
              }
            }
          });
        }
    );
  }

  nextMethod(): any {
    let idDatoAcademico;
    if (this.validarFormulario()) {

      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        //this._spinner.start();
        //console.log(this.idDatoAcademico);
        this.datoAcademicoMovilidadExternaService
            .putDatoAcademicoMovilidadExterna(
                this.idDatoAcademico,
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            response => {

            },
            error => {
              /*if(assertionsEnabled()){
                console.error(error);
              }*/
            },

            () => {
              /*if(assertionsEnabled()){
                //console.log('Success');
              }*/
            }
        );
        //this._spinner.stop();
        return true;
      } else {
        this.datoAcademicoMovilidadExternaService
            .postDatoAcademicoMovilidadExterna(
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            response => {
              let json = '{"idDatosAcademicos": "' + response.json().id + '"}';
              ////console.log(json);
              this.estudianteMovilidadService.putEstudianteMovilidadExterna(
                  this.idEstudiante,
                  json,
                  this.erroresGuardado
              ).subscribe(
                  () => {
                  }
              );
              ////console.log(this.idDatosAcademicosRecuperado);
            }
        );
        //this._spinner.stop();
        return true;
      }
    }
  }

  previusMethod(): boolean {
    return true;

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

  private errorMessage(control: FormControl): string {
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

  private prepareServices(): void {
    this.interesadoMovilidadExternaService
        = this._catalogosServices.getInteresadoMovilidadExterna();
    this.datoAcademicoMovilidadExternaService =
        this._catalogosServices.
        getDatoAcademicoMovilidadExterna();
    this.estudianteMovilidadService =
        this._catalogosServices.getEstudianteMovilidadExterna();
  }

  ngOnInit() {
  }

}
