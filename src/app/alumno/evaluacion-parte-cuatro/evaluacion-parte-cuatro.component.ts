import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-evaluacion-parte-cuatro',
  templateUrl: './evaluacion-parte-cuatro.component.html',
  styleUrls: ['./evaluacion-parte-cuatro.component.css']
})
export class EvaluacionParteCuatroComponent implements OnInit {
  id: string;
  pregunta13;
  pregunta14;
  pregunta15;
  pregunta16;
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
        case 13: case "13": this.cambioRadio13(r); break;
        case 14: case "14": this.cambioRadio14(r); break;
        case 15: case "15": this.cambioRadio15(r); break;
        default:
          break;
      }
    }
    return ret;
  }
  cambioRadio13(valor: any): void {
    ////console.log(valor);
    this.pregunta13 = valor;
  }
  cambioRadio14(valor: any): void {
    ////console.log(valor);
    this.pregunta14 = valor;
  }
  cambioRadio15(valor: any): void {
    ////console.log(valor);
    this.pregunta15 = valor;
  }
  values = '';

  // without strong typing
  onKey(event: any) {
    this.pregunta16 = event.target.value;
    //console.log(this.pregunta16);
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
    this.pregunta16 = this.getControl('comentarios').value;
    if (this.pregunta13 && this.pregunta14 && this.pregunta15) {
      sessionStorage.setItem("respuesta13", this.pregunta13);
      sessionStorage.setItem("respuesta14", this.pregunta14);
      sessionStorage.setItem("respuesta15", this.pregunta15);

      if (this.validarFormulario()) {
        //console.log('this.pregunta16', this.pregunta16);
        sessionStorage.setItem("respuesta16", this.pregunta16);
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
