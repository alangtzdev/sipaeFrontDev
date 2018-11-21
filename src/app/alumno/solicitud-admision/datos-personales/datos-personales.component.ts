import {Component, ElementRef, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import * as moment from "moment";
import {URLSearchParams} from "@angular/http";

import {Direccion} from "../../../services/entidades/direccion.model";
import {errorMessages} from "../../../utils/error-mesaje";
import {UsuarioSesion} from "../../../services/usuario/usuario-sesion";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {ItemSelects} from "../../../services/core/item-select.model";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {AuthService} from "../../../auth/auth.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Validacion} from "../../../utils/Validacion";
import {Estudiante} from "../../../services/entidades/estudiante.model";
import {NacionalidadService} from "../../../services/catalogos/nacionalidad.service";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {ModalFotografiaComponent} from "../modal-fotografia/modal-fotografia.component";
import {ModalRegistroDireccionComponent} from "../modal-registro-direccion/modal-registro-direccion.component";
import {ModalDetalleDireccionComponent} from "../modal-detalle-direccion/modal-detalle-direccion.component";

@Component({
  selector: 'app-datos-personales',
  templateUrl: './datos-personales.component.html',
  styleUrls: ['./datos-personales.component.css']
})
export class DatosPersonalesComponent implements OnInit {

  router: Router;
  // formulario
  edadEstudiante: number = 0;
  solicitudEnvida: boolean = false;
  auxiliar: boolean = false;
  edicionFormulario: boolean = false;
  validacionActiva: boolean = false;
  errorNext: string = '';
  formularioDP: FormGroup;
  // tabla direcciones
  registroSeleccionado: Direccion;
  mensajeErrors: any = errorMessages;
  columnas: Array<any> = [
    {titulo: 'Tipo de dirección', nombre: 'idDireccion'},
    {titulo: 'Dirección', nombre: 'direccion'},
    {titulo: 'País', nombre: 'idPais'},
  ];
  // variables para service
  sexoService;
  estadoCivilService;
  direccionService;
  datoPersonalService;
  estudianteService;
  paisService;
  nombreFotografiaEstudiante;
  /*
   21/09/2016
   Se agrega variable para saber si la solicitud no se esta editando por el solicitante
   Se cambia la variable idEstudiante de private a publica.
   De esta manera se guardara la imagen al solicitante y no al usuario logueado
   */
  edicionDocencia: boolean = false;
  idEstudiante: number;
  idUsuarioActual: number;
  public dt: Date = new Date();
  private esNuvoRegistro: boolean = true;
  private idNacionalidad: number;

  private idDatoPersonal: number;
  private esNacional: boolean;
  usuarioLogueado: UsuarioSesion;
  private opcionesCatalogoSexo: Array<ItemSelects> = [];
  private opcionesCatalogoEstadoCivil: Array<ItemSelects> = [];
  private opcionesCatalogoNacionalidad: Array<ItemSelects> = [];
  private opcionesCatalogoNacionalidadPadres: Array<ItemSelects> = [];
  private opcionesCatalogoPais: Array<ItemSelects> = [];
  private registros: Array<Direccion> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];
   idDireccion: number;

  @ViewChild("modalFotografia")
  modalFotografia: ModalFotografiaComponent;
  @ViewChild("modalRegDir")
  modalRegDir: ModalRegistroDireccionComponent;
  @ViewChild("modalDetDir")
  modalDetDir: ModalDetalleDireccionComponent;

  constructor(route: ActivatedRoute, public _catalogosServices: CatalogosServices, private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer, _router: Router,
              private _spinner: SpinnerService,authservice :AuthService,  private nacionalidadService: NacionalidadService  ) {
    this.usuarioLogueado = authservice.getUsuarioLogueado();

    let params;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });
    this.idEstudiante = params.id;
    this.idUsuarioActual = this.usuarioLogueado.id;
    this.prepareServices();
    moment.locale('es');
    this.router = _router;
    this.formularioDP = new FormGroup({
      nombre: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      primerApellido: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      segundoApellido: new FormControl('',
        Validators.compose([Validacion.parrafos])),
      idSexo: new FormControl('', Validators.required),
      fechaNacimiento: new FormControl('', Validators.required),
      lugarNacimiento: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      edad: new FormControl('', Validators.compose([Validacion.numerosValidator])),
      idNacionalidad: new FormControl('', Validators.required),
      idPaisOrigen: new FormControl('', Validators.required),
      idEstadoCivil: new FormControl(''),
      curp: new FormControl('',
        Validators.compose([Validacion.letrasNumerosSinEspacioValidator])),
      numeroHijos: new FormControl('',
        Validators.compose([Validacion.numerosValidator])),
      numId: new FormControl('',
        Validators.compose([Validacion.letrasNumerosValidator])),
      celular: new FormControl('',
        Validators.compose([Validacion.celularValidator])),
      oficina: new FormControl('',
        Validators.compose([Validacion.telefonoValidator])),
      email: new FormControl('',
        Validators.compose([Validacion.emailValidatorOptional])),
      idNacionalidadPadreMadre: new FormControl(''),
      discapacidad: new FormControl(''),
      rfc: new FormControl('', Validators.
      compose([Validacion.letrasNumerosSinEspacioValidator])),
    });
    if (this.idEstudiante) {
      this.edicionFormulario = true;
      this.obtenerEstudiante();
    }
    this.edicionDocencia = params.edicionDocencia;
  }

  validarFormulario(): boolean {
    if (!this.esNacional) { // si no es nacional, se
      (<FormControl>this.formularioDP.controls['curp']).setValue('BADD110313HCMLNS09');
    }
    if (this.formularioDP.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  limpiarFormulario(): void {
    if (!this.esNacional) { // si no es nacional, se
      (<FormControl>this.formularioDP.controls['curp'])
        .setValue('');
    }
    if ( !this.auxiliar ) {
      //this.formularioDP.value.discapacidad = '';
      (<FormControl>this.formularioDP.controls['discapacidad'])
        .setValue('');
    }
  }
//TODO validarFormularioCURP funciona?
  /*validarFormularioCURP(): boolean {
    if (this.formularioDPc.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  */

  obtenerEstudiante(): void {
    let estudianteActual: Estudiante;
    this.estudianteService.getEntidadEstudiante(
      this.idEstudiante,
      this.erroresConsultas
    ).subscribe(
      response =>
        estudianteActual = new Estudiante(
          response.json()),
      error => {

      },
      () => {
        this.idDatoPersonal = estudianteActual.datosPersonales.id;
        this.idNacionalidad = estudianteActual.datosPersonales.nacionalidad.id;
        this.nombreFotografiaEstudiante = estudianteActual.idArchivoFotografia.nombre;
        this.idUsuarioActual = estudianteActual.usuario.id;

        if (this.formularioDP) {

          let stringNombre = 'nombre';
          let stringPrimerApellido = 'primerApellido';
          let stringSegundoApellido = 'segundoApellido';
          let stringIdSexo = 'idSexo';
          let stringFechaNacimiento = 'fechaNacimiento';
          let stringLugarNacimiento = 'lugarNacimiento';
          let stringEdad = 'edad';
          let stringIdNacionalidad = 'idNacionalidad';
          let stringiIdPaisOrigen = 'idPaisOrigen';
          let stringEstadoCivil = 'idEstadoCivil';
          let stringCurp = 'curp';
          let stringNumeroHijos = 'numeroHijos';
          let stringNumId = 'numId';
          let stringCelular = 'celular';
          let stringOficina = 'oficina';
          let stringEmail = 'email';
          let stringIdNacionalidadPadreMadre = 'idNacionalidadPadreMadre';
          let stringDiscapacidad = 'discapacidad';
          let stringRFC = 'rfc';

          (<FormControl>this.formularioDP.controls[stringNombre]).setValue(estudianteActual.datosPersonales.nombre);
          (<FormControl>this.formularioDP.controls[stringPrimerApellido]).setValue(estudianteActual.datosPersonales.primerApellido);
          (<FormControl>this.formularioDP.controls[stringSegundoApellido])
            .setValue(estudianteActual.datosPersonales.segundoApellido);
          if (estudianteActual.datosPersonales.sexo.id !== undefined) {
            (<FormControl>this.formularioDP.controls[stringIdSexo])
              .setValue(estudianteActual.datosPersonales.sexo.id);
          }
          (<FormControl>this.formularioDP.controls[stringFechaNacimiento])
            .setValue(estudianteActual.datosPersonales.fechaNacimiento);
          this.dt = new Date(Date.parse(estudianteActual.datosPersonales.fechaNacimiento));
          (<FormControl>this.formularioDP.controls[stringLugarNacimiento])
            .setValue(estudianteActual.datosPersonales.lugarNacimiento);
          (<FormControl>this.formularioDP.controls[stringEdad])
            .setValue(estudianteActual.datosPersonales.edad);
          if (estudianteActual.datosPersonales.nacionalidad.id !== undefined) {
            (<FormControl>this.formularioDP.controls[stringIdNacionalidad])
              .setValue(estudianteActual.datosPersonales.nacionalidad.id);
            if (estudianteActual.datosPersonales.nacionalidad.id === 5) {
              this.esNacional = true;
            } else if (estudianteActual.datosPersonales.nacionalidad.id === 6) {
              this.esNacional = false;
            }
            this.esNuvoRegistro = true;
          }
          console.log(estudianteActual.datosPersonales.estadoCivil);
          if (estudianteActual.datosPersonales.nacionalidad.id !== undefined) {
            (<FormControl>this.formularioDP.controls[stringEstadoCivil])
              .setValue(estudianteActual.datosPersonales.estadoCivil.id);
          }
          (<FormControl>this.formularioDP.controls[stringCurp])
            .setValue(estudianteActual.datosPersonales.curp);
          (<FormControl>this.formularioDP.controls[stringNumeroHijos])
            .setValue(estudianteActual.datosPersonales.numeroHijos);
          (<FormControl>this.formularioDP.controls[stringNumId])
            .setValue(estudianteActual.datosPersonales.numId);
          (<FormControl>this.formularioDP.controls[stringCelular])
            .setValue(estudianteActual.datosPersonales.celular);
          (<FormControl>this.formularioDP.controls[stringOficina])
            .setValue(estudianteActual.datosPersonales.oficina);
          (<FormControl>this.formularioDP.controls[stringEmail])
            .setValue(estudianteActual.datosPersonales.email);
          console.log(estudianteActual.datosPersonales.nacionalidadPadreMadre);
          if (estudianteActual.datosPersonales.nacionalidadPadreMadre.id !== undefined) {
            (<FormControl>this.formularioDP.controls[stringIdNacionalidadPadreMadre])
              .setValue(estudianteActual.datosPersonales.nacionalidadPadreMadre.id);
          }
          (<FormControl>this.formularioDP.controls[stringRFC])
            .setValue(estudianteActual.datosPersonales.rfc);
          (<FormControl>this.formularioDP.controls[stringiIdPaisOrigen])
            .setValue(estudianteActual.datosPersonales.paisOrigen.id);
          if (estudianteActual.datosPersonales.discapacidad) {
            this.auxiliar = true;
            (<FormControl>this.formularioDP.controls[stringDiscapacidad])
              .setValue(estudianteActual.datosPersonales.discapacidad);
          }
        }
        if (estudianteActual.foliosSolicitud.estatusCatalogos) {
          this.solicitudEnvida = true;
        }
      }
    );
  }

  ////// picker ///
  getFechaEjemplo(): string {
    if (this.dt) {
      let fechaConFormato =  moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioDP.controls['fechaNacimiento'])
        .setValue(fechaConFormato + ' 10:30am');
      this.calcularEdadEstudiante();
      return fechaConFormato;
    } else {
      return  moment(new Date()).format('DD/MM/YYYY');
    }
  }

  cambiarAuxiliar(valor): any {
    if (valor) {
      this.auxiliar = true;
    }else {
      this.auxiliar = false;
    }
  }

  validarDiscapacidad(): boolean {
    if (this.auxiliar) {
      return true;
    }else {
      return false;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioDP.controls[campo]);
  }

  eliminarDireccion () {
    if (this.registroSeleccionado) {
      this.direccionService.deleteDireccion(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        () => {},
        console.error,
        () => {
          this.onCambiosTabla();
        }
      );
    }
    this.registroSeleccionado = null;
  }



  nextMethod(): any {
    if (this.validarFormulario()) {
      this.limpiarFormulario();
      this._spinner.start("nextMethod");
      let jsonFormulario = JSON.stringify(this.formularioDP.value, null, 2);
      if (this.edicionFormulario) {
        return this.datoPersonalService
          .putDatoPersonal(
            this.idDatoPersonal,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
            () => {
              this._spinner.stop("nextMethod");
            },
            error => {
              //this.addErrorsMesaje('aqui el mensaje');
            });
      } else {
        return this.datoPersonalService
          .postDatoPersonal(
            jsonFormulario,
            this.erroresGuardado
          );
      }
    } else {
      /*this.errorNext = 'Error en los campos, favor de verificar';*/
      return false;
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  onCambiosTabla(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registros = this.direccionService
      .getListaDireccion(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  deshabilitarEdicio(): boolean {
    return this.solicitudEnvida;
  }

  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  campoParaNacionalesExtranjeros(idProcedencia: number): void {
    if (idProcedencia == 5) {
      this.esNacional = true;
      console.log("esNacional ", this.esNacional);
    } else if (idProcedencia == 6) {
      this.esNacional = false;
      console.log("esNacional",this.esNacional);
    }
    this.esNuvoRegistro = false;
  }

  private calcularEdadEstudiante(): void {
    let fechaEdad = moment(this.dt);
    let hoy = moment();
    this.edadEstudiante = hoy.diff(fechaEdad, 'years');
    (<FormControl>this.formularioDP.controls['edad'])
      .setValue(this.edadEstudiante);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioDP.controls[campo]).valid && this.validacionActiva) {
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
    this.sexoService = this._catalogosServices.getSexo();
    this.estadoCivilService = this._catalogosServices.getEstadoCivil();
    this.opcionesCatalogoSexo = this.sexoService.getSelectSexo(this.erroresConsultas);
    this.opcionesCatalogoEstadoCivil =
      this.estadoCivilService.getSelectEstadoCivil(this.erroresConsultas);
    this.direccionService = this._catalogosServices.getDireccion();
    this.paisService = this._catalogosServices.getPais();

    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'tipo~Persona:IGUAL';
    urlParameter.set('criterios', criterio);
    this.getCatNacionalidad();

    let urlParameterTwo: URLSearchParams = new URLSearchParams();
    let criterioDos = 'tipo~Padres:IGUAL';
    urlParameterTwo.set('criterios', criterioDos);
    this.opcionesCatalogoNacionalidadPadres =
      this.nacionalidadService.getSelectNacionalidadParametros(this.erroresConsultas, urlParameterTwo);

    this.opcionesCatalogoPais = this.paisService.getSelectPais(this.erroresConsultas);

    this.datoPersonalService = this._catalogosServices.getDatoPersonal();
    this.estudianteService = this._catalogosServices.getEstudianteService();
    this.onCambiosTabla();
  }

  getCatNacionalidad(): void {
//    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1007 id del catalogo de estatus solo activos
    urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
    this.nacionalidadService.getListaSelectNacionalidad (
      this.erroresConsultas, urlParameter,false
    ).then(
      nacionalidades => {
        //let items = response.json().lista;
        if (nacionalidades) {
          nacionalidades.forEach(
            (item) => {
              this.opcionesCatalogoNacionalidad.push(new ItemSelects(item.id, item.valor));
            }
          )
        }
      }
    );
  }

  ngOnInit() {
  }



  modalCargarImagen(): void {
    this.modalFotografia.modalFoto.open('md');
  }

  modalRegistroDireccion(modo): void {
    if (modo === 'editar' && this.registroSeleccionado) {
      this.idDireccion = this.registroSeleccionado.id;
      this.modalRegDir.onInitDir();
    }else if(modo === 'agregar') {
      this.idDireccion = null;
      this.modalRegDir.onInitDir();
    }
    this.modalRegDir.dialog.open("lg");
  }

  modalDetallesDireccion(): void {

    if (this.registroSeleccionado)
      this.idDireccion = this.registroSeleccionado.id;
    this.modalDetDir.onInitDir();

    this.modalDetDir.dialog.open("lg")

  }


  }

