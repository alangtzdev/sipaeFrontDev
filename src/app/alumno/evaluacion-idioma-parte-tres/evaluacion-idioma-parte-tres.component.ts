import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-evaluacion-idioma-parte-tres',
  templateUrl: './evaluacion-idioma-parte-tres.component.html',
  styleUrls: ['./evaluacion-idioma-parte-tres.component.css']
})
export class EvaluacionIdiomaParteTresComponent implements OnInit {
  id: string;
  pregunta9;
  pregunta10;
  pregunta11;

  jsonFormulario;

  formulario: FormGroup;
  validacionActiva: boolean = false;
  mensajeErrors: any = {
    'required': 'Este campo es requerido',
    'invalidEmailAddress': 'Correo electrónico inválido',
    'invalidPassword': 'Contraseña inválida, debe contener al menos 6 caracteres' +
    ' un número y una letra en mayúscula',
    'invalidNumero': 'Sólo admite números',
    'invalidLetras': 'Sólo admite letras',
    'invalidLetrasNumeros': 'Sólo admite letras y números',
    'invalidLetrasWithoutSpace': 'Sólo admite letras sin espacio',
    'invalidLetrasNumerosWithoutSpace': 'Sólo admite letras y números sin espacio',
    'invalidCurp': 'CURP Inválida',
    'invalidNumeroTelefonico': 'Formato incorrecto(000-000-0000) ó (000-000-0)',
    'invalidCaracter': 'Caracteres no validos',
    'invalidLetrasNumerosAcentoPuntoComa':
        'Sólo admite letras, números, ".", ",", ":", "-" y espacio',
    'invalidNumerosFloat': 'El formato es: 100.00',
    'invalidAnio': 'El formato es: YYYY',
    'invalidHora': 'El formato de 24 hr HH:MM am|pm',
    "pattern": "Formato incorrecto",
    "pattern_horario": "El formato es: 'HH:MM' (24Hrs)"
  };

  errorNext: string = undefined;

  constructor() {
    this.formulario = new FormGroup({
      comentarios: new FormControl('', Validacion.letrasNumerosAcentoPuntoComaValidator)
    });
  }

  errorMessage(control: FormControl, campo?: string): string {
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
  verificarPregunta(p: any, r: any): boolean {
    var ret = false;
    if (sessionStorage.getItem("respuesta" + p) == r) {
      ret = true;
      switch (p) {
        case 9: case "9": this.cambioRadio9(r); break;
        case 10: case "10": this.cambioRadio10(r); break;
        default:
          break;
      }
    }
    return ret;
  }
  cambioRadio9(valor: any): void {
    ////console.log(valor);
    this.pregunta9 = valor;
  }
  cambioRadio10(valor: any): void {
    ////console.log(valor);
    this.pregunta10 = valor;
  }
  values = '';

  // without strong typing
  onKey(event: any) {
    this.pregunta11 = event.target.value;
    //console.log(this.pregunta11);
  }
  validarFormulario(): boolean {

    if (this.formulario.valid) {
      return true;
    }
    this.validacionActiva = true;

    return false;
  }
  getControl(campo: string): FormControl {
    //console.log('campo', campo);
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }
  finishMethod(): boolean {
    this.pregunta11 = this.getControl('comentarios').value;
    if (this.pregunta9 && this.pregunta10) {
      sessionStorage.setItem("respuesta9", this.pregunta9);
      sessionStorage.setItem("respuesta10", this.pregunta10);

      if (this.validarFormulario()) {
        //console.log('this.pregunta11', this.pregunta11);
        sessionStorage.setItem("respuesta11", this.pregunta11);
        return true;

      } else {
        this.errorNext = 'Error: ¡Existen preguntas sin responder o con errores!';
        return false;
      }
    } else {
      this.errorNext = 'Error: ¡Existen preguntas sin responder o con errores!';
      return false;
    }
  }

  previusMethod(): boolean {
    return true;
  }
  getForm(): any {
    return this.jsonFormulario;
  }

  ngOnInit() {
  }

}
