import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-evaluacion-parte-tres',
  templateUrl: './evaluacion-parte-tres.component.html',
  styleUrls: ['./evaluacion-parte-tres.component.css']
})
export class EvaluacionParteTresComponent implements OnInit {
  errorNext: string = '';
  id: string;
  pregunta9;
  pregunta10;
  pregunta11;
  pregunta12;
  jsonFormulario;

  constructor() { }

  ngOnInit() {
  }

  verificarPregunta(p:any,r:any):boolean{
    var ret=false;
    if(sessionStorage.getItem("respuesta"+p)==r){
      ret=true;
      switch (p) {
        case 9: case "9": this.cambioRadio9(r); break;
        case 10: case "10": this.cambioRadio10(r); break;
        case 11: case "11": this.cambioRadio11(r); break;
        case 12: case "12": this.cambioRadio12(r); break;
        default:
          break;
      }
    }
    return ret;
  }

  cambioRadio9(valor:any):void{
    ////console.log(valor);
    this.pregunta9=valor;
  }
  cambioRadio10(valor:any):void{
    ////console.log(valor);
    this.pregunta10=valor;
  }
  cambioRadio11(valor:any):void{
    ////console.log(valor);
    this.pregunta11=valor;
  }
  cambioRadio12(valor:any):void{
    ////console.log(valor);
    this.pregunta12=valor;
  }
  getForm(): any {
    return this.jsonFormulario;
  }
  nextMethod(): boolean {
    if (this.pregunta9&&this.pregunta10&&this.pregunta11&&this.pregunta12) {
      sessionStorage.setItem("respuesta9",this.pregunta9);
      sessionStorage.setItem("respuesta10",this.pregunta10);
      sessionStorage.setItem("respuesta11",this.pregunta11);
      sessionStorage.setItem("respuesta12",this.pregunta12);
      return true;
    }
    else{
      return false;
    }
  }

  previusMethod(): boolean {
    return true;
  }

}
