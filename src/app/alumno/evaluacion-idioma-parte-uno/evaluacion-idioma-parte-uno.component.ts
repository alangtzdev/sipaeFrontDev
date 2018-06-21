import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-evaluacion-idioma-parte-uno',
  templateUrl: './evaluacion-idioma-parte-uno.component.html',
  styleUrls: ['./evaluacion-idioma-parte-uno.component.css']
})
export class EvaluacionIdiomaParteUnoComponent implements OnInit {
  errorNext: string = '';
  id: string;
  pregunta1;
  pregunta2;
  pregunta3;
  pregunta4;
  nombreMateria;
  jsonFormulario;

  constructor() {
    this.nombreMateria = sessionStorage.getItem("nombreMateria");
  }

  ngOnInit() {
  }
  verificarPregunta(p: any, r: any): boolean {
    var ret = false;
    if (sessionStorage.getItem("respuesta" + p) == r) {
      ret = true;
      switch (p) {
        case 1: case "1": this.cambioRadio1(r); break;
        case 2: case "2": this.cambioRadio2(r); break;
        case 3: case "3": this.cambioRadio3(r); break;
        case 4: case "4": this.cambioRadio4(r); break;
        default:
          break;
      }
    }
    return ret;
  }

  cambioRadio1(valor: any): void {
    ////console.log(valor);
    this.pregunta1 = valor;
  }
  cambioRadio2(valor: any): void {
    ////console.log(valor);
    this.pregunta2 = valor;
  }
  cambioRadio3(valor: any): void {
    ////console.log(valor);
    this.pregunta3 = valor;
  }
  cambioRadio4(valor: any): void {
    ////console.log(valor);
    this.pregunta4 = valor;
  }
  getForm(): any {
    return this.jsonFormulario;
  }
  nextMethod(): boolean {
    if (this.pregunta1 && this.pregunta2 && this.pregunta3 && this.pregunta4) {
      sessionStorage.setItem("respuesta1", this.pregunta1);
      sessionStorage.setItem("respuesta2", this.pregunta2);
      sessionStorage.setItem("respuesta3", this.pregunta3);
      sessionStorage.setItem("respuesta4", this.pregunta4);
      return true;
    }
    else {
      this.errorNext = "Error: ¡Existen preguntas sin responder!";
      return false;
    }
  }

}
