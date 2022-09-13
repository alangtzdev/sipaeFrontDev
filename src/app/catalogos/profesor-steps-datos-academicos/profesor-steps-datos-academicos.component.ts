import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";
import {Profesor} from "../../services/entidades/profesor.model";
import {DatoAcademico} from "../../services/entidades/dato-academico.model";
import {ExperienciaProfesional} from "../../services/entidades/experiencia-profesional.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {ErrorCatalogo} from "../../services/core/error.model";
import * as moment from "moment";
import {errorMessages} from "../../utils/error-mesaje";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-profesor-steps-datos-academicos',
  templateUrl: './profesor-steps-datos-academicos.component.html',
  styleUrls: ['./profesor-steps-datos-academicos.component.css']
})
export class ProfesorStepsDatosAcademicosComponent implements OnInit {
  @ViewChild('modalCRUDCV')
  modalCRUDCV: ModalComponent;
  @ViewChild('modalCRUDEXP')
  modalCRUDEXP: ModalComponent;
  @ViewChild('modalEXP')
  modalEXP: ModalComponent;
  @ViewChild('modalDetalleCV')
  modalDetalleCV: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  router: Router;
  formulario: FormGroup;
  errorNext: string = '';
  enableValidation: boolean = false;
  //errorNext: string = '';
  edicionFormulario: boolean = false;
  catSNIService;
  catGradoAcademicoService;
  datosAcademicosService;
  experienciaProfesionalService;
  idProfesor;
  idExperienciaAgregada;
  profesorService;
  entidadProfesor: Profesor;
  registroSeleccionadoAcademico: DatoAcademico;
  registroSeleccionadoExperiencia: ExperienciaProfesional;
  registrosAcademicos: Array<DatoAcademico>;
  registrosExperiencia: Array<ExperienciaProfesional>;

  validacionActiva: boolean = false;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};

  columnas: Array<any> = [
    { titulo: 'Nivel Académico', nombre: 'nivelAcademico' },
    { titulo: 'Universidad', nombre: 'institucion'},
    { titulo: 'Pais', nombre: 'idPais'},
  ];

  columnasExperienciaProfesional: Array<any> = [
    { titulo: 'Experiencia', nombre: 'idExperiencia' },
    { titulo: 'Institución', nombre: 'institucion'},
  ];

  private opcionesCatSNIService: Array<ItemSelects> = [];
  private opcionesCatGradoAcademico: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(public _catalogosServices: CatalogosServices, _router: Router,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              route: ActivatedRoute,
              private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idProfesor = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    //console.log(params.id);
    //console.log(this.idProfesor);
    this.prepareServices();
    this.router = _router;
    this.formulario = new FormGroup({
      idSni: new FormControl('', Validators.required),
      idGradoAcademico: new FormControl('', Validators.required),
    });


    if (this.idProfesor) {
      let profesor: Profesor;
      this.edicionFormulario = true;
      //console.log(this.idProfesor);
      this.entidadProfesor = this.profesorService.getEntidadProfesor(
        this.idProfesor,
        this.erroresConsultas
      ).subscribe(
        response => profesor = new Profesor(response.json()),
        error => {
          console.error(error);
          console.error(error);
        },
        () => {
          //console.log(profesor);
          if (this.formulario) {
            let stringidSni = 'idSni';
            let stringidGradoAcademico = 'idGradoAcademico';

            if (profesor.sni.id !== undefined) {
              (<FormControl>this.formulario.controls[stringidSni])
                .setValue(profesor.sni.id);
            }

            if (profesor.gradoAcademico.id !== undefined) {
              (<FormControl>this.formulario.controls[stringidGradoAcademico])
                .setValue(profesor.gradoAcademico.id);
            }

            //console.log(this.formulario);
          }
        }
      );
    }

    this.formularioExperienciaProfesional = new FormGroup({
      idTipoExperiencia: new FormControl('', Validators.required),
      titulo: new FormControl('',
        Validators.compose([Validators.required])),
      institucion: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      responsabilidad: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      fechaInicio: new FormControl(),
      fechaFin: new FormControl(),
      actualmente: new FormControl(''),
      fechaInvalida: new FormControl('', Validators.required),
      idProfesor: new FormControl(this.idProfesor)
    });

    this.formularioAcademico = new FormGroup({
      nivelEstudiosSeleccionado: new FormControl('', Validators.required),
      disciplina: new FormControl('', Validators.compose([Validators.required, Validacion.textoValidator,])),
      universidad: new FormControl('', Validators.compose([Validators.required, Validacion.textoValidator,])),
      grado: new FormControl('', Validators.compose([Validators.required, Validacion.textoValidator,])),
      otroTipoTrabajo: new FormControl(''),
      numeroCedula: new FormControl('',Validacion.numerosValidator),
      facultad: new FormControl('',Validacion.textoValidator),
      promedio: new FormControl('', Validacion.parrafos),
      fechaTitulacion: new FormControl(''),
      tutor: new FormControl('', Validacion.textoValidator),
      anioInicio: new FormControl('', Validacion.anio),
      anioFin: new FormControl('', Validacion.anio),
      idEntidadFederativa: new FormControl(''),
      idMunicipio: new FormControl(''),
      idPais: new FormControl(''),
      idTipoTrabajo: new FormControl(''),
      idProfesor: new FormControl(this.idProfesor)
    });
  }

  nextMethod(): boolean {
    if (this.validarFormulario()) {
      //this._spinner.start();
      let  jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log(jsonFormulario);
      if (this.idProfesor) {
        this.profesorService
          .putProfesor(
            this.idProfesor,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            //this._spinner.stop();
          }
        );
        return true;

      } /*else {

        this.profesorService
          .postProfesor(
            jsonProfesor,
            this.erroresGuardado
          ).subscribe(
          response => {
            //idFormularioGuardado = response.json();
          },
          console.error,
          () => {
            //console.log('Registro finalizado :)');
            //this._spinner.stop();
            // console.warn('idFormularioGuardado', idFormularioGuardado);
          }
        );

        return true;
      }*/
    } else {
      //this.errorNext = 'Error en los campos, favor de verificar';
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

  errorMessage(FormControl: FormControl): string {
    let resultado = '';
    if (FormControl.errors !== undefined && FormControl.errors !== null) {
      for (let errorType of Object.keys(FormControl.errors)) {
        if (FormControl.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  previusMethod(): boolean {
    return true;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionadoAcademico === registro);
  }

  rowSeleccionadoExperiencia(registro): boolean {
    return (this.registroSeleccionadoExperiencia === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionadoAcademico !== registro) {
      this.registroSeleccionadoAcademico = registro;
    } else {
      this.registroSeleccionadoAcademico = null;
    }
  }

  rowSeleccionExperiencia(registro): void {
    if (this.registroSeleccionadoExperiencia !== registro) {
      this.registroSeleccionadoExperiencia = registro;
    } else {
      this.registroSeleccionadoExperiencia = null;
    }
  }

  onCambiosTablaDatoAcademico(): void {
//    this.registroSeleccionadoAcademico = null;
    //let urlParameter: URLSearchParams = new URLSearchParams();
    console.warn(this.idProfesor);
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idProfesor~' + this.idProfesor + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.registrosAcademicos = this.datosAcademicosService.getListaDatoAcademico(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }

  onCambiosTablaExperienciaProfesional(): void {
    this.registroSeleccionadoExperiencia = null;
    console.warn(this.idProfesor);
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idProfesor~' + this.idProfesor + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.registrosExperiencia =
      this.experienciaProfesionalService.getListaExperienciaProfesional(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  eliminarDatoAcademico () {
    if (this.registroSeleccionadoAcademico) {
      //console.log('Eliminando...');
      this.datosAcademicosService.deleteDatoAcademico(
        this.registroSeleccionadoAcademico.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTablaDatoAcademico();
        }
      );
    }else {
      //alert('Selecciona un registro');
    }
  }

  eliminarExperienciaProfesional () {
    if (this.registroSeleccionadoExperiencia) {
      //console.log('Eliminando...');
      this.experienciaProfesionalService.deleteExperienciaProfesional(
        this.registroSeleccionadoExperiencia.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTablaExperienciaProfesional();
        }
      );
    }else {
      alert('Selecciona un registro');
    }
  }

  mostrarBotonesExperiencia(): boolean {
    if (this.registroSeleccionadoExperiencia) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonesDatoAcademico(): boolean {
    if (this.registroSeleccionadoAcademico) {
      return true;
    }else {
      return false;
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this.catTipoExperiencia =
      this._catalogosServices.getTipoExperiencia();
    this.opcionesTipoExperiencia =
      this.catTipoExperiencia.getSelectTipoExperiencia(this.erroresConsultas4);
    this.catSNIService = this._catalogosServices.getSni();
    this.opcionesCatSNIService =
      this.catSNIService.getSelectSni(this.erroresConsultas);
    this.catGradoAcademicoService = this._catalogosServices.getGradoAcademico();
    this.opcionesCatGradoAcademico =
      this.catGradoAcademicoService.getSelectGradoAcademico(this.erroresConsultas);
    this.datosAcademicosService = this._catalogosServices.getDatoAcademico();
    this.experienciaProfesionalService = this._catalogosServices.getExperienciaPrforesional();
    this.profesorService = this._catalogosServices.getProfesor();
    this.onCambiosTablaDatoAcademico();
    this.onCambiosTablaExperienciaProfesional();

  }

  ngOnInit() {
  }

  /////////////////////////////////CODIGO DE MODALS DE DATOS CURRICULUM/////////////////////////////
  entidadDatoAcademico: DatoAcademico;
  camposParaBachillerato: boolean = false;
  ocultarEstado: boolean = true;
  registroSeleccionado : DatoAcademico;
  private erroresConsultas2: Array<ErrorCatalogo> = [];

  abrirModal(){
    this.modalDetalleCV.open('lg');
  }
  cerrarModal(){
    this.modalDetalleCV.close();
  }

  modalDetalleDatoAcademico(): void {
    this.datosAcademicosService
      .getEntidadDatoAcademico(
        this.registroSeleccionadoAcademico.id,
        this.erroresConsultas2
      ).subscribe(
      response => {
        this.entidadDatoAcademico
          = new DatoAcademico(response.json());

        if (this.entidadDatoAcademico.pais.id == 82){
          this.ocultarEstado = true;
        } else {
          this.ocultarEstado = false;
        }

        if (this.entidadDatoAcademico.gradoAcademico.id == 6) {
          this.camposParaBachillerato = true;
        } else {
          this.camposParaBachillerato = false;
        }
        //console.log(this.camposParaBachillerato);
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas2);
      },
      () => {
        //console.log(this.entidadDatoAcademico);
      }
    );
  this.abrirModal();
  }
  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  mostrarOtroTipoTrabajo (trabajo): boolean {
    let retorno = true;
    if (trabajo === 4) { // id=4 --valor otro
      retorno = false;
    }

    return retorno;
  }

  ///////////////////////////////CODIGO MODALS CREARACTUALIZAR DATOS ACADEMICOS//////////////////////////////
  formularioAcademico: FormGroup;
  entidadDatosAcademicos: DatoAcademico;
  catalogoNivelEstudios;
  catalogoMunicipio;
  catalogoEntidadFederativa;
  catalogoTutor;
  catalogoTipoTrabajo;
  catalogoPais;
  maxDateDatosAcademicos: string;

  mensajeErrors2: any = errorMessages;

  ////// picker ///
  dt: Date = new Date();
  dt2: Date = new Date();
  dt3: Date = new Date();
  edicionFormulario2: boolean = false;

  private opcionesNivelEstudios: Array<ItemSelects> = [];
  private opcionesPaises: Array<ItemSelects> = [];
  private opcionesEntidadFederativa: Array<ItemSelects> = [];
  private opcionesMunicipio: Array<ItemSelects> = [];
  private opcionesTutor: Array<ItemSelects> = [];
  private opcionesTipoTrabajo: Array<ItemSelects> = [];

  abrirModal3(){
    this.modalCRUDCV.open('lg');
  }
  cerrarModal3(){
    this.modalCRUDCV.close();
  }
  modalRegistroDatosAcademicos(modo): void {
    let idDatoAcademico: number;
    if (modo === 'editar' && this.registroSeleccionadoAcademico) {
      idDatoAcademico = this.registroSeleccionadoAcademico.id;
      //console.log(idDatoAcademico);
    }
    this.maxDateDatosAcademicos = moment(new Date()).format('DD/MM/Y h:mma');
    this.prepareServices2();

    if (this.registroSeleccionadoAcademico) {
      //console.log('edicion de formulario');
      this.edicionFormulario2 = true;
      let datoAcademico: DatoAcademico;
      this.entidadDatosAcademicos = this.datosAcademicosService
        .getEntidadDatoAcademico(
          this.registroSeleccionadoAcademico.id,
          this.erroresConsultas
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>
            datoAcademico = new DatoAcademico(
              response.json()),
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
            console.error(error);
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            if (this.formularioAcademico) {

              let stringDisciplina = 'disciplina';
              let stringUniversidad = 'universidad';
              let stringgrado = 'grado';
              let stringidTipoTrabajo = 'idTipoTrabajo';
              let stringnumeroCedula = 'numeroCedula';
              let stringfacultad = 'facultad';
              let stringpromedio = 'promedio';
              let stringfechaTitulacion = 'fechaTitulacion';
              let stringTutor = 'tutor';
              let stringanioInicio = 'anioInicio';
              let stringanioFin = 'anioFin';
              let stringidEntidadFederativa = 'idEntidadFederativa';
              let stringidMunicipio = 'idMunicipio';
              let stringMunicipio = 'municipio';
              let stringidGradoAcademico = 'nivelEstudiosSeleccionado';
              let stringidPais = 'idPais';
              let stringotroTipoTrabajo = 'otroTipoTrabajo';

              /*let fechaInicioRecuperar = moment(datoAcademico.fechaInicio);
               let fechaFinRecuperar = moment(datoAcademico.fechaFin);*/
              let fechaTitulacionRecuperar = moment(datoAcademico.fechaTitulacion);
              //console.log(datoAcademico.disciplina);
              (<FormControl>this.formularioAcademico.controls[stringDisciplina])
                .setValue(datoAcademico.disciplina);
              (<FormControl>this.formularioAcademico.controls[stringUniversidad])
                .setValue(datoAcademico.universidad);
              (<FormControl>this.formularioAcademico.controls[stringgrado])
                .setValue(datoAcademico.grado);
              (<FormControl>this.formularioAcademico.controls[stringidTipoTrabajo])
                .setValue(datoAcademico.tipoTrabajo.id);
              (<FormControl>this.formularioAcademico.controls[stringnumeroCedula])
                .setValue(datoAcademico.numeroCedula);
              (<FormControl>this.formularioAcademico.controls[stringfacultad])
                .setValue(datoAcademico.facultad);
              (<FormControl>this.formularioAcademico.controls[stringpromedio])
                .setValue(datoAcademico.promedio);
              (<FormControl>this.formularioAcademico.controls[stringTutor])
                .setValue(datoAcademico.tutor);
              (<FormControl>this.formularioAcademico.controls[stringidEntidadFederativa])
                .setValue(datoAcademico.entidadFederativa.id);
              (<FormControl>this.formularioAcademico.controls[stringidMunicipio])
                .setValue(datoAcademico.municipio.id);
              (<FormControl>this.formularioAcademico.controls[stringidGradoAcademico])
                .setValue(datoAcademico.gradoAcademico.id);
              (<FormControl>this.formularioAcademico.controls[stringidPais])
                .setValue(datoAcademico.pais.id);
              (<FormControl>this.formularioAcademico.controls[stringotroTipoTrabajo])
                .setValue(datoAcademico.otroTipoTrabajo);

              (<FormControl>this.formularioAcademico.controls[stringanioInicio])
                .setValue(datoAcademico.anioInicio);
              (<FormControl>this.formularioAcademico.controls[stringanioFin])
                .setValue(datoAcademico.anioFin);

              //console.log(this.formularioAcademico);

              /*this.dt = new Date(fechaInicioRecuperar.toJSON());
               this.dt2 = new Date(fechaFinRecuperar.toJSON());*/
              this.dt3 = new Date(fechaTitulacionRecuperar.toJSON());
              if (datoAcademico.pais.id == 82){
                this.ocultarEstado = true;
                this.cargarMunicipios(datoAcademico.entidadFederativa.id);
              } else {
                this.ocultarEstado = false;
              }

              if (datoAcademico.gradoAcademico.id == 6) {
                this.camposParaBachillerato = true;

              } else {
                this.camposParaBachillerato = false;
              }
              //console.log(this.camposParaBachillerato);

            }
          }
        );
    }
    this.abrirModal3();
  }


  getFechaTitulacion(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioAcademico.controls['fechaTitulacion'])
        .setValue(fechaConFormato + ' 00:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }
  // Se cambia fecha por campo integer solo para almacenar el año
  /*getFechaInicio(): string {
   if (this.dt) {
   let fechaConFormato = new moment(this.dt2).format('L');
   (<FormControl>this.formularioAcademico.controls['fechaInicio'])
   .setValue(fechaConFormato + ' 00:00am');
   return fechaConFormato;
   } else {
   return new moment(new Date()).format('L');
   }
   }

   getFechaFin(): string {
   if (this.dt) {
   let fechaConFormato = new moment(this.dt3).format('L');
   (<FormControl>this.formularioAcademico.controls['fechaFin'])
   .setValue(fechaConFormato + ' 00:00am');
   return fechaConFormato;
   } else {
   return new moment(new Date()).format('L');
   }
   }*/


  enviarFormulario(): void {
    if (this.validarFormulario2()) {
      this.limpiarFormulario();
      let jsonFormulario = JSON.stringify(this.formularioAcademico.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario2) {
        //console.log(this.context.idDatoAcademico);
        this.datosAcademicosService
          .putDatoAcademico(
            this.registroSeleccionadoAcademico.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success Edition'),
          console.error,
          () => {
            this.onCambiosTablaDatoAcademico();
            this.cerrarModal3();
          }
        );
      } else {
        this.datosAcademicosService
          .postDatoAcademico(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {
            let json = response.json();
            //this.idDatoAcademicos = json.id;
          },
          console.error,
          () => {
            //console.log('Registro finalizado :)');
            //console.warn('idFormularioGuardado');
            this.onCambiosTablaDatoAcademico();
            this.cerrarModal3();
          }
        );
      }
    } else {
      //alert('error en el formulario');
    }
  }

  limpiarFormulario (): any {
    if (this.camposParaBachillerato) {
      (<FormControl>this.formularioAcademico.controls['disciplina']).setValue('');
      (<FormControl>this.formularioAcademico.controls['grado']).setValue('');
      (<FormControl>this.formularioAcademico.controls['facultad']).setValue('');
      (<FormControl>this.formularioAcademico.controls['idTipoTrabajo']).setValue('');
      (<FormControl>this.formularioAcademico.controls['otroTipoTrabajo']).setValue('');
      (<FormControl>this.formularioAcademico.controls['tutor']).setValue('');
      (<FormControl>this.formularioAcademico.controls['numeroCedula']).setValue('');
    }

    if (!this.ocultarEstado){
      (<FormControl>this.formularioAcademico.controls['idEntidadFederativa']).setValue('');
      (<FormControl>this.formularioAcademico.controls['idMunicipio']).setValue('');
    }


  }

  validarFormulario2(): boolean {
    if (this.camposParaBachillerato) {
      //console.log('es bachilletaro');
      (<FormControl>this.formularioAcademico.controls['disciplina']).setValue('auxiliardisiplina');
      (<FormControl>this.formularioAcademico.controls['grado']).setValue('auxiliargrado');
      (<FormControl>this.formularioAcademico.controls['facultad']).setValue('auxiliarfacultad');
      (<FormControl>this.formularioAcademico.controls['idTipoTrabajo']).setValue('auxiliaridTipoTrabajo');
      (<FormControl>this.formularioAcademico.controls['otroTipoTrabajo']).setValue('auxiliarOtroTipoTrabajo');
      (<FormControl>this.formularioAcademico.controls['tutor']).setValue('auxiliarTutor');
      (<FormControl>this.formularioAcademico.controls['numeroCedula']).setValue('12345');

    }
    //console.log(this.ocultarEstado);

    if (!this.ocultarEstado) {
      (<FormControl>this.formularioAcademico.controls['idEntidadFederativa']).setValue('auxiliarEstado');
      (<FormControl>this.formularioAcademico.controls['idMunicipio']).setValue('auxiliarMunicipio');
    }
    //console.log(this.formularioAcademico.value);
    if (this.formularioAcademico.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl2(campo: string): FormControl {
    return (<FormControl>this.formularioAcademico.controls[campo]);
  }

  mostrarCampoOtro(): boolean {
    let valor = this.getControl2('idTipoTrabajo');

    if (valor.value == 10) { // id:10 === valor:'otro' actualmente
      return true;
    }else {
      return false;
    }
  }

  // Metodo para mostrar campos por nivel de estudios seleccionado

  cambiarTipoExperiencia(nivelEstudiosSeleccionado: number): void {
    let limpiarFormulario = '';
    //console.log(nivelEstudiosSeleccionado);
    // Si el tipo de grado academico es 6
    // (Bachillerato va a mostrar los campos solo para bachillerato)
    if (nivelEstudiosSeleccionado == 6) {
      this.camposParaBachillerato = true;

    } else {
      this.camposParaBachillerato = false;
    }
    //console.log(this.camposParaBachillerato);
  }

  ocultarEstadoMunicipio(idPais): any {
    //console.log(idPais);
    // Si el tipo de grado academico es 6
    // (Bachillerato va a mostrar los campos solo para bachillerato)
    if (idPais == 82) {
      this.ocultarEstado = true;

    } else {
      this.ocultarEstado = false;
    }
    //console.log(this.ocultarEstado);
  }

  private getControlErrors2(campo: string): boolean {
    if (!(<FormControl>this.formularioAcademico.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }



  private errorMessage2(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors2[errorType];
        }
      }
    }
    return resultado;
  }

  private cargarMunicipios(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEntidadFederativa~' + id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesMunicipio =
      this.catalogoMunicipio.getListaMunicipio(this.erroresConsultas, urlParameter).lista;
  }

  private prepareServices2(): void {
    //console.log('Prepare servie');
    this.catalogoNivelEstudios = this._catalogosServices.getGradoAcademico();
    //console.log(this.catalogoNivelEstudios);
    this.opcionesNivelEstudios = this.catalogoNivelEstudios.getSelectGradoAcademico(this.erroresConsultas);
    this.catalogoPais = this._catalogosServices.getPais();
    this.opcionesPaises = this.catalogoPais.getSelectPais(this.erroresConsultas);
    this.catalogoTipoTrabajo = this._catalogosServices.getTipoTrabajo();
    this.opcionesTipoTrabajo =
      this.catalogoTipoTrabajo.getSelectTipoTrabajo(this.erroresConsultas);
    this.catalogoEntidadFederativa =
      this._catalogosServices.getEntidadFederativa();
    this.opcionesEntidadFederativa = this.catalogoEntidadFederativa.getSelectEntidadFederativa(this.erroresConsultas);
    this.catalogoMunicipio = this._catalogosServices.getMunicipio();
    //console.log(this.catalogoMunicipio);
    //this.opcionesMunicipio = this.catalogoMunicipio.getSelectMunicipio(this.erroresConsultas);
    //console.log(this.opcionesMunicipio);


  }



  ////////////////////////CODIGO MODALS DE EXPERIENCIA PROFESIONA///////////////////////
  entidadDetalleExperiencia: ExperienciaProfesional;
  idTipoExperiencia;
  mostrarCampo: boolean;
  private erroresConsultas3: Array<ErrorCatalogo> = [];
  abrirModal2(){
    this.modalEXP.open('lg');
  }
  cerrarModal2(){
    this.modalEXP.close();
  }

  modalDetalleExperiencia(){
    this.experienciaProfesionalService
      .getEntidadExperienciaProfesional(
        this.registroSeleccionadoExperiencia.id,
        this.erroresConsultas3
      ).subscribe(
      response => {
        this.entidadDetalleExperiencia
          = new ExperienciaProfesional(response.json());
        this.idTipoExperiencia = this.entidadDetalleExperiencia.id;
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas3);
      },
      () => {
        //console.log(this.entidadDetalleExperiencia);
      }
    );

    this.abrirModal2();
  }

  mostrarCamposTipoExperiencia(): boolean {

    if (this.idTipoExperiencia == 1){
      this.mostrarCampo = true;
      return true;
    } else {
      this.mostrarCampo = false;
      return false;
    }

  }
//////////////////////////////MODALCRUD EXPERIENCIA PROFESIONAL////////////////////////////

  edicionFormulario4: boolean = false;
  formularioExperienciaProfesional: FormGroup;
  entidadExperienciaProfesional: ExperienciaProfesional;
  catalogoNivelEstudios4;
  catTipoExperiencia;
  idExperienciaAgregada4;
  validacionActiva4: boolean = false;
  mensajeErrors4: Array<Object> =
    [{mensaje: 'La fecha fin debe ser mayor a la fecha de inicio',
      traduccion: 'La fecha debe ser mayor a la fecha de inicio'}];
  fechaInvalida: boolean = false;

  ////// picker ///
  public dt7: Date = new Date();
  public dt8: Date = new Date(); // Para el 2da DatePicker

  /*private opcionesNivelEstudios4: Array<ItemSelect> = [];
   private opcionesTipoExperiencia: Array<ItemSelect> = [];
   private erroresConsultas4: Array<Object> = [];
   private erroresGuardado4: Array<Object> = [];*/

  private opcionesNivelEstudios4: Array<ItemSelects> = [];
  private opcionesTipoExperiencia: Array<ItemSelects> = [];
  private erroresConsultas4: Array<Object> = [];
  private erroresGuardado4: Array<Object> = [];

  abrirModal4(){
    this.modalCRUDEXP.open('lg');
  }
  cerrarModal4(){
    this.modalCRUDEXP.close();
  }

  modalRegistroExperienciaProfesional(modo): void {
    /*let idExperienciaProfesional: number;
    if (modo === 'editar' && this.registroSeleccionadoExperiencia) {
      idExperienciaProfesional = this.registroSeleccionadoExperiencia.id;
      //console.log(idExperienciaProfesional);
    }*/
    moment.locale('es');

    //console.log(this.context.idExperiencia);

    if (modo === 'editar' && this.registroSeleccionadoExperiencia) {
       this._spinner.start("modalcrudexp1");
      this.edicionFormulario4 = true;
      let experienciaProfesional: ExperienciaProfesional;
      this.entidadExperienciaProfesional = this.experienciaProfesionalService
        .getEntidadExperienciaProfesional(
          this.registroSeleccionadoExperiencia.id,
          this.erroresConsultas4
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>
            experienciaProfesional = new ExperienciaProfesional(
              response.json()),
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
            console.error(error);
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            if (this.formularioExperienciaProfesional) {
              this._spinner.stop("modalcrudexp1");

              let stringTipoExperiencia = 'idTipoExperiencia';
              let stringTitulo = 'titulo';
              let stringInstitucion = 'institucion';
              let stringResponsabilidad = 'responsabilidad';
              let stringFechaInicio = 'fechaInicio';
              let stringFechaFin = 'fechaFin';
              let stringActualmente = 'actualmente';

              let fechaInicioRecuperar = moment(experienciaProfesional.fechaInicio);
              let fechaFinRecuperar = moment(experienciaProfesional.fechaFin);

              (<FormControl>this.formularioExperienciaProfesional.controls
                [stringTipoExperiencia])
                .setValue(experienciaProfesional.tipoExperiencia.id);
              (<FormControl>this.formularioExperienciaProfesional.controls[stringTitulo])
                .setValue(experienciaProfesional.titulo);
              (<FormControl>
                this.formularioExperienciaProfesional.controls[stringInstitucion])
                .setValue(experienciaProfesional.institucion);
              (<FormControl>this.formularioExperienciaProfesional.controls
                [stringResponsabilidad])
                .setValue(experienciaProfesional.responsabilidad);
              (<FormControl>this.formularioExperienciaProfesional.controls
                [stringActualmente])
                .setValue(experienciaProfesional.actualmente);
              //console.log(this.formularioExperienciaProfesional);

              this.dt7 = new Date(fechaInicioRecuperar.toJSON());
              this.dt8 = new Date(fechaFinRecuperar.toJSON());
              this._spinner.stop("modalcrudexp1");
            }
          }
        );
    } else {
      this.edicionFormulario4 = false;
      this.dt7 = new Date();
      this.dt8 = new Date();
      (<FormControl>this.formularioExperienciaProfesional.controls
        ['idTipoExperiencia'])
        .setValue('');
      (<FormControl>this.formularioExperienciaProfesional.controls['titulo'])
          .setValue('');
      (<FormControl>
          this.formularioExperienciaProfesional.controls['institucion'])
          .setValue('');
      (<FormControl>this.formularioExperienciaProfesional.controls
          ['responsabilidad'])
          .setValue('');
      (<FormControl>this.formularioExperienciaProfesional.controls
          ['actualmente'])
          .setValue('');
    }
    this.abrirModal4();
  }

  getFechaInicio(): string {
    if (this.dt7) {
      let fechaInicioFormato = moment(this.dt7).format('DD/MM/YYYY');
      (<FormControl>this.formularioExperienciaProfesional.controls['fechaInicio'])
        .setValue(fechaInicioFormato + ' 00:00am');
      return fechaInicioFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaFin(): string {
    if (this.dt8) {
      let fechaFinFormato = moment(this.dt8).format('DD/MM/YYYY');
      (<FormControl>this.formularioExperienciaProfesional.controls['fechaFin'])
        .setValue(fechaFinFormato + ' 00:00am');
      return fechaFinFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  enviarFormulario4(): void {
    if (this.validarFormulario4()) {
      this._spinner.start("modalcrud2");
      if (this.filtrarCamposAMostrar()) {
        (<FormControl>this.formularioExperienciaProfesional.controls['titulo']).setValue('');

      }
      let jsonFormulario =
        JSON.stringify(this.formularioExperienciaProfesional.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario4) {
        //console.log(this.context.idExperiencia);
        this.experienciaProfesionalService
          .putExperienciaProfesional(
            this.registroSeleccionadoExperiencia.id,
            jsonFormulario,
            this.erroresGuardado4
          ).subscribe(
          () => {}, //console.log('Success Edition'),
          console.error,
          () => {

            this.onCambiosTablaExperienciaProfesional();
            this.cerrarModal4();
            this._spinner.stop("modalcrud2");
          }
        );
      } else {
        this.experienciaProfesionalService
          .postExperienciaProfesional(
            jsonFormulario,
            this.erroresGuardado4
          ).subscribe(
          response => {
            let json = response.json();
            this.idExperienciaAgregada4 = json.id;
            this._spinner.stop("modalcrud2");
          },
          console.error,
          () => {
            //console.log('Registro finalizado :)');
            console.warn('idFormularioGuardado', this.idExperienciaAgregada4);
            this._spinner.stop("modalcrud2");
            this.onCambiosTablaExperienciaProfesional();
            this.cerrarModal4();
          }
        );
      }
    }
  }

  validarFormulario4(): boolean {
    this.validarFecha();
    if (this.filtrarCamposAMostrar()) {
      //
      (<FormControl>this.formularioExperienciaProfesional.
        controls['titulo']).setValue('auxiliarTitulo');

    }
    if (this.formularioExperienciaProfesional.valid) {
      this.validacionActiva4 = false;
      return true;
    }
    this.validacionActiva4 = true;
    return false;
  }

  getControl4(campo: string): FormControl {
    return (<FormControl>this.formularioExperienciaProfesional.controls[campo]);
  }

  filtrarCamposAMostrar(): boolean {
    let tipoExperiencia = this.getControl4('idTipoExperiencia');
    let limpiarFormulario = '';
    if (tipoExperiencia.value == 1) {
      return true;
    }else {
      return false;
    }
  }

/*  cambiaActividad(valor): void {
    ////console.log('estretet  '+valor);
    this.fechaVisible = valor;
  }*/

  validarFecha(): any {
    let fechaInicio = moment(this.dt7).format('DD/MM/YYYY');
    let fechaFin = moment(this.dt8).format('DD/MM/YYYY');
    //console.log(fechaInicio);
    //console.log(fechaFin);

    let splitFechaDe = fechaInicio.split;
    let dateFechaDe = new Date(splitFechaDe[2], splitFechaDe[1] - 1, splitFechaDe[0]);
    ////console.log(dateFechaDe);
    let splitFechaHasta = fechaFin.split;
    let dateFechaHasta =
      new Date(splitFechaHasta[2], splitFechaHasta[1] - 1, splitFechaHasta[0]);
    ////console.log(dateFechaHasta);

    if (dateFechaDe > dateFechaHasta) {
      ////console.log('fecha menor');
      this.fechaInvalida = true;
      //console.log(this.fechaInvalida);
      (<FormControl>this.formularioExperienciaProfesional.
        controls['fechaInvalida']).setValue('');

    } else {
      ////console.log('fecha bien');
      this.fechaInvalida = false;
      //console.log(this.fechaInvalida);
      (<FormControl>this.formularioExperienciaProfesional.
        controls['fechaInvalida']).setValue('1');

    }
  }

  private errorMessage4(control: FormControl): string {
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

  private getControlErrors4(campo: string): boolean {
    if (!(<FormControl>this.formularioExperienciaProfesional.controls[campo]).valid && this.validacionActiva4) {
      return true;
    }
    return false;
  }


  /*
   modalRegistroDatosAcademicos(modo): void {
   let idDatoAcademico: number;
   if (modo === 'editar' && this.registroSeleccionadoAcademico) {
   idDatoAcademico = this.registroSeleccionadoAcademico.id;
   //console.log(idDatoAcademico);
   }


   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);

   let modalDatosAcademicosProfesorData =
   new ModalDatosAcademicosProfesorData(
   this,
   idDatoAcademico
   );

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: modalDatosAcademicosProfesorData }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
   provide(Renderer, { useValue: this._renderer })
   ]);

   dialog = this.modal.open(
   <any>ModalDatosAcademicosProfesor,
   bindings,
   modalConfig
   );
   }
   */

}
