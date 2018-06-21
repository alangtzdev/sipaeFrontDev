import { Component, OnInit } from '@angular/core';
import {Validacion} from "../../utils/Validacion";
import {FormControl, Validators, FormGroup} from "@angular/forms";
import {Usuarios} from "../../services/usuario/usuario.model";
import {URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {errorMessages} from "../../utils/error-mesaje";

@Component({
  selector: 'registromovilidad-datos-generales',
  templateUrl: './interesado-registromovilidad-datos-generales.component.html',
  styleUrls: ['./interesado-registromovilidad-datos-generales.component.css']
})
export class InteresadoRegistromovilidadDatosGeneralesComponent implements OnInit {
  router: Router;
  formulario: FormGroup;
  errorNext: string = '';
  enableValidation: boolean = false;
  // errorNext: string = '';
  edicionFormulario: boolean = false;
  interesadoMovilidadService;
  paisService;
  programaDocenteService;
  usuarioService;
  medioInteresService;
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;
  otro: boolean = false;
  existeCorreo: boolean = false;
  numeroRegistros: number;
  regitros: Array<Usuarios> = [];
  private alertas: Array<Object> = [];

  // Autocomplete
  private isComplete: boolean = false;
  private estudianteSelAutocomplete: Usuarios;
  // private typeAheadEventEmitter = new Rx.Subject<string>();

  public configuracion: any = {
    paginacion: false,
    filtrado: { textoFiltro: ''}
  };

  private opcionesCatPais: Array<ItemSelects> = [];
  private opcionesCatProgramasDocente: Array<ItemSelects> = [];
  private opcionesCatMediosInteres: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(public _catalogosServices: CatalogosServices, _router: Router) {
    this.prepareServices();
    this.router = _router;
    this.formulario = new FormGroup({
      nombre: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      primerApellido: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      segundoApellido: new FormControl('',
        Validators.compose([Validacion.parrafos])),
      email: new FormControl('',
        Validators.compose([Validators.required, Validacion.emailValidator])),
      casa: new FormControl('',
        Validators.compose([Validacion.telefonoValidator])),
      celular: new FormControl('',
        Validators.compose([Validacion.telefonoValidator])),
      idPais: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
      idMedioDifusion: new FormControl('', Validators.required),
      otroMedioDifucion: new FormControl(''),
      comentario: new FormControl(''),
      auxiliar: new FormControl ('aux',
        Validators.compose([Validacion.parrafos, Validators.required]))
    });

    for (let key in this.formulario.controls) {
      //console.log(key + ' ::::::: ' + sessionStorage.getItem(key));
      this.formulario.controls[key].setValue(
        sessionStorage.getItem(key) ? sessionStorage.getItem(key) : ''
      );
    }

    /*    this.typeAheadEventEmitter
     .debounceTime(2000)
     .switchMap(val => {
     let urlSearch: URLSearchParams = new URLSearchParams();
     let criterios = '';
     let filtros: Array<string> = val.split(' ');

     if (this.configuracion.filtrado && val !== ''
     && this.regitros.length == 0) {
     urlSearch.set('criterios', 'email~' + this.formulario.value.email + ':IGUAL');
     this.filter(urlSearch);
     } else if (this.configuracion.filtrado.textoFiltro === ''){
     this.regitros = [];
     }
     return this.regitros;
     }).subscribe(results => {},
     error => {//console.log(error);
     });*/

  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
//    this.typeAheadEventEmitter.next(filtroTexto);
  }

  filter(urlParameter: URLSearchParams) : void {
    this.usuarioService.getListaUsuario(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let respuesta = response.json();
        this.regitros = [];
        respuesta.lista.forEach((item)=>{
          this.regitros.push(new Usuarios(item));
        });
        this.numeroRegistros = this.regitros.length;
        if(this.numeroRegistros !== 0) {
          this.existeCorreo = true
          this.addErrorsMesaje('El correo ya está asignado a otro registro', 'danger');
        }
        //console.log('tamaño LISTA: ' + this.regitros.length);
        //console.log('HAY CORREO: ' + this.existeCorreo);
      },
      error => {
        console.error(error);
        this.isComplete = false;
      },
      () => {
        //console.log(this.regitros);
        this.isComplete = false;
      }
    );
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  actualizarAuxiliar(texto: string): void {
    //console.log(texto);
    this.formulario.controls['auxiliar'].setValue(texto);
  }

  nextMethod(): boolean {
    if (this.validarFormulario() && !this.existeCorreo) {
      let jsonFormularioDatosGenerales = JSON.stringify(this.formulario.value, null, 2);
      //console.log('Next');
      //console.log(jsonFormularioDatosGenerales);
      for (let key in this.formulario.controls) {
        sessionStorage.setItem(
          key,
          this.formulario.controls[key].value ? this.formulario.controls[key].value : ''
        );
      }
      return true;
    } else {
      //console.log('NO PASOO');
      this.errorNext = 'Error en los campos, favor de verificar';
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

  mostrarCampoOtro(): boolean {
    let valor = this.getControl('idMedioDifusion');
    ////console.log(valor);

    if (valor.value == 7) { // id:7 === valor:'otro' actualmente
      this.formulario.controls['auxiliar'].setValue('');
      this.otro = true;
      return true;
    }else {
      this.formulario.controls['auxiliar'].setValue('aux');
      this.otro = false;
      return false;
    }
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
    return resultado;
  }

  private prepareServices(): void {
    this.usuarioService = this._catalogosServices.getUsuarioService();
    this.paisService = this._catalogosServices.getPais();
    //console.log(this.paisService);
    this.opcionesCatPais = this.paisService.getSelectPais(this.erroresConsultas);
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.opcionesCatProgramasDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.medioInteresService = this._catalogosServices.getMedioDifusion();
    this.opcionesCatMediosInteres =
      this.medioInteresService.getSelectMedioDifusion(this.erroresConsultas);
    this.medioInteresService = this._catalogosServices.getMedioDifusion();
    this.opcionesCatMediosInteres =
      this.medioInteresService.getSelectMedioDifusion(this.erroresConsultas);
    // agregado
    this.interesadoMovilidadService = this._catalogosServices.getInteresadoMovilidadExterna();
  }


  ngOnInit() {
  }

}
