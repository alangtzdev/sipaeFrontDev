import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-evaluacion-idioma-parte-dos',
  templateUrl: './evaluacion-idioma-parte-dos.component.html',
  styleUrls: ['./evaluacion-idioma-parte-dos.component.css']
})
export class EvaluacionIdiomaParteDosComponent implements OnInit {
  errorNext: string = '';
  id: string;
  pregunta5;
  pregunta6;
  pregunta7;
  pregunta8;
  jsonFormulario;

  constructor() { }

  ngOnInit() {
  }
  verificarPregunta(p:any,r:any):boolean{
    var ret=false;
    if(sessionStorage.getItem("respuesta"+p)==r){
      ret=true;
      switch (p) {
        case 5: case "5": this.cambioRadio5(r); break;
        case 6: case "6": this.cambioRadio6(r); break;
        case 7: case "7": this.cambioRadio7(r); break;
        case 8: case "8": this.cambioRadio8(r); break;
        default:
          break;
      }
    }
    return ret;
  }

  cambioRadio5(valor:any):void{
    ////console.log(valor);
    this.pregunta5=valor;
  }
  cambioRadio6(valor:any):void{
    ////console.log(valor);
    this.pregunta6=valor;
  }
  cambioRadio7(valor:any):void{
    ////console.log(valor);
    this.pregunta7=valor;
  }
  cambioRadio8(valor:any):void{
    ////console.log(valor);
    this.pregunta8=valor;
  }
  getForm(): any {
    return this.jsonFormulario;
  }
  nextMethod(): boolean {
    if (this.pregunta5&&this.pregunta6&&this.pregunta7&&this.pregunta8) {
      sessionStorage.setItem("respuesta5",this.pregunta5);
      sessionStorage.setItem("respuesta6",this.pregunta6);
      sessionStorage.setItem("respuesta7",this.pregunta7);
      sessionStorage.setItem("respuesta8",this.pregunta8);
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
