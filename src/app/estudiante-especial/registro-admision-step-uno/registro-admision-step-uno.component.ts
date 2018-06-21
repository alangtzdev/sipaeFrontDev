import {Component, OnInit, Injector, Renderer, Inject, NgZone, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {Direccion} from '../../services/entidades/direccion.model';
import {AuthService} from "../../auth/auth.service";
import {Validacion} from "../../utils/Validacion";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import * as moment from "moment";
import {errorMessages} from '../../utils/error-mesaje';
import {URLSearchParams} from '@angular/http';
import {NacionalidadService} from '../../services/catalogos/nacionalidad.service'
import {ErrorCatalogo} from '../../services/core/error.model';
import { DatepickerModule } from 'ng2-bootstrap';
import {ConfigService} from '../../services/core/config.service';
import { NgUploaderOptions } from 'ngx-uploader';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-registro-admision-step-uno',
  templateUrl: './registro-admision-step-uno.component.html',
  styleUrls: ['./registro-admision-step-uno.component.css']
})
export class RegistroAdmisionStepUnoComponent implements OnInit {

  usuarioRolService;
  nombreFotografiaEstudiante;
  usuarioRol: UsuarioRoles;
  idUsuario: number;
  edadEstudiante: number = 0;
  router: Router;
  edicionFormulario: boolean = false;
  validacionActiva: boolean = false;
  validacionActivaContacto: boolean = false;
  errorNext: string = '';
  formulario: FormGroup;
  formularioContactoEmergencias: FormGroup;
  auxiliar: boolean = false;
  mensajeErrors: any = errorMessages;
  extranjero: boolean = false;
  // tabla direcciones
  registroSeleccionado: Direccion;
  columnas: Array<any> = [
    { titulo: 'Tipo de dirección', nombre: 'idDireccion' },
    { titulo: 'Calle y número', nombre: 'direccion'},
    { titulo: 'Colonia', nombre: 'colonia' },
  ];
  sexoService;
  estadoCivilService;
  direccionMovilidadExternaService;

  datoPersonalService;
  estudianteMovilidadService;
  edicionFormularioContatoEmergencia: boolean = false;
  ocultarDireccion: boolean;
  paisService;
  estadoService;
  municipioService;
  parentescoService;
  contactoEmergenciaService;
  idContactoEmergencia: number;
  public dt: Date = new Date();
  public dtMax: Date = new Date();
  private idEstudiante: number;
  private idDatoPersonal: number;
  private opcionesCatalogoSexo: Array<ItemSelects> = [];
  private opcionesCatalogoEstadoCivil: Array<ItemSelects>;
  private opcionesCatalogoNacionalidad: Array<ItemSelects> = [];
  private opcionesCatalogoNacionalidadPadres: Array<ItemSelects> = [];
  private registros: Array<Direccion> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];

  private opcionesCatalogoPais: Array<ItemSelects>;
  private opcionesCatalogoEstado: Array<ItemSelects>;
  private opcionesCatalogoMunicipio: Array<ItemSelects>;
  private opcionesCatalogoParentesco: Array<ItemSelects>;
  private sub: any;

  constructor(//private modal: Modal, private elementRef: ElementRef,
              //private injector: Injector, private _renderer: Renderer,
              private _router: Router, route: ActivatedRoute,
              public _catalogosServices: CatalogosServices, private _spinner: SpinnerService,
              private authService: AuthService, private nacionalidadService: NacionalidadService,
              @Inject(NgZone) private zone: NgZone) {
    //let params = _router.parent.parent.currentInstruction.component.params;
    this.router = _router;
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id'];
    });
    //this.idEstudiante = params.id; // valor provicional
    this.prepareServices();
    let criterio = 'tipo~Persona:IGUAL';
    let criterioDos = 'tipo~Padres:IGUAL';
    this.getNacionalidad(criterio, this.opcionesCatalogoNacionalidad);
    this.getNacionalidad(criterioDos, this.opcionesCatalogoNacionalidadPadres);
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.idUsuario = usuarioLogueado.id;
    moment.locale('es');
    this.formulario = new FormGroup({
      nombre: new FormControl('',
          Validators.compose([Validators.required, Validacion.parrafos])),
      primerApellido: new FormControl('',
          Validators.compose([Validators.required, Validacion.parrafos])),
      segundoApellido: new FormControl('',
          Validators.compose([Validacion.parrafos])),
      idSexo: new FormControl('', Validators.required),
      fechaNacimiento: new FormControl('', Validators.required),
      lugarNacimiento: new FormControl('',
          Validators.compose([Validacion.parrafos])),
      edad: new FormControl({value: '', disabled: true}),
      idNacionalidad: new FormControl('',
          Validators.required), // Se coloca como requerido para poder generar
      // la matrícula de Estudiante de Intercambio
      idEstadoCivil: new FormControl(''),
      curp: new FormControl('',
          Validators.compose([Validacion.letrasNumerosSinEspacioValidator])),
      numId: new FormControl('',
          Validators.compose([Validacion.parrafos])),
      idNacionalidadPadreMadre: new FormControl(''),
      discapacidad: new FormControl('',
          Validators.compose([Validacion.parrafos])), // necesita
      rfc: new FormControl('', Validators.compose(
          [Validacion.letrasNumerosSinEspacioValidator])), // necesita val
      celular: new FormControl('',
          Validators.compose([Validacion.parrafos])),
    });
    this.formularioContactoEmergencias = new FormGroup({
      padecimiento: new FormControl('',
          Validators.compose([Validators.required,
            Validacion.parrafos])), // necesita val
      nombreCompleto: new FormControl('',
          Validators.compose([Validators.required,
            Validacion.parrafos])),
      idParentesco: new FormControl(''),
      calleNumero: new FormControl('',
          Validators.compose([Validacion.parrafos])), // val
      colonia: new FormControl('',
          Validators.compose([Validacion.parrafos])), // val
      codigoPostal: new FormControl('',
          Validators.compose([Validacion.numerosValidator])), // val
      idPais: new FormControl(''),
      idEntidadFederativa: new FormControl(''),
      idMunicipio: new FormControl(''),
      telefono: new FormControl('',
          Validators.compose([Validacion.parrafos])), // val
      celular: new FormControl('',
          Validators.compose([Validators.required,
            Validacion.parrafos])), // val
      correoElectronico: new FormControl('',
          Validators.compose([Validacion.emailValidatorOptional])),
    });
    if (this.idEstudiante) {
      this.obtenerEstudianteMovilidadExterna();
    }
    //para modal fotografia
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.prepareServicesModal();
    this.inicializarOpcionesNgZone();
    this.formularioDocumentacion = new FormGroup({
      idFoto: new FormControl('')
    });
    // para modal registrar direccion
    this.formularioModalRegistroDireccion = new FormGroup({
      idTipo: new FormControl('', Validators.required),
      calle: new FormControl('',
          Validators.compose([
            Validators.required,
            Validacion.parrafos,
          ])),
      colonia: new FormControl('',
          Validators.compose([
            Validacion.letrasNumerosAcentoPuntoComaValidator,
          ])),
      idPais: new FormControl('', Validators.required),
      codigoPostal: new FormControl('',
          Validators.compose([
            Validacion.numerosValidator
          ])),
      idEntidadFederativa: new FormControl(''),
      idMunicipio: new FormControl(''),
      telefono: new FormControl('',
          Validators.compose([Validacion.telefonoValidator])),
      idEstudiante: new FormControl(this.idEstudiante),
    });
  }

  obtenerEstudianteMovilidadExterna(): void {
    this.edicionFormulario = true;
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
          //console.log(estudianteActual);
          this.idDatoPersonal = estudianteActual.datosPersonales.id;
          if (this.formulario) {
            let stringNombre = 'nombre';
            let stringPrimerApellido = 'primerApellido';
            let stringSegundoApellido = 'segundoApellido';
            let stringIdSexo = 'idSexo';
            let stringFechaNacimiento = 'fechaNacimiento';
            let stringLugarNacimiento = 'lugarNacimiento';
            let stringEdad = 'edad';
            let stringIdNacionalidad = 'idNacionalidad';
            let stringEstadoCivil = 'idEstadoCivil';
            let stringCurp = 'curp';
            let stringNumId = 'numId';
            let stringIdNacionalidadPadreMadre = 'idNacionalidadPadreMadre';
            let stringDiscapacidad = 'discapacidad';
            let stringRFC = 'rfc';
            let stringCelular = 'celular';
            let fechaNacimientoEstudiante =
                moment(estudianteActual.datosPersonales.fechaNacimiento);
            (<FormControl>this.formulario.controls[stringNombre])
                .setValue(estudianteActual.datosPersonales.nombre);
            (<FormControl>this.formulario.controls[stringPrimerApellido])
                .setValue(estudianteActual.datosPersonales.primerApellido);
            (<FormControl>this.formulario.controls[stringSegundoApellido])
                .setValue(estudianteActual.datosPersonales.segundoApellido);
            (<FormControl>this.formulario.controls[stringIdSexo])
                .setValue(
                    estudianteActual.datosPersonales.sexo.id ?
                        estudianteActual.datosPersonales.sexo.id : '');
            /*(<Control>this.formulario.controls[stringFechaNacimiento])
             .updateValue(estudianteActual.datosPersonales.fechaNacimiento);
             this.dt = Date.parse(estudianteActual.datosPersonales.fechaNacimiento);*/
            this.dt = new Date(fechaNacimientoEstudiante.toJSON());
            (<FormControl>this.formulario.controls[stringLugarNacimiento])
                .setValue(estudianteActual.datosPersonales.lugarNacimiento);
            (<FormControl>this.formulario.controls[stringEdad])
                .setValue(estudianteActual.datosPersonales.edad);
            (<FormControl>this.formulario.controls[stringIdNacionalidad])
                .setValue(
                    estudianteActual.datosPersonales.nacionalidad.id ?
                        estudianteActual.datosPersonales.nacionalidad.id : '');
            if (estudianteActual.datosPersonales.nacionalidad) {
              if (estudianteActual.datosPersonales.nacionalidad.id === 6) {
                this.extranjero = true;
              }
            }
            (<FormControl>this.formulario.controls[stringEstadoCivil])
                .setValue(
                    estudianteActual.datosPersonales.estadoCivil.id ?
                        estudianteActual.datosPersonales.estadoCivil.id : '');
            (<FormControl>this.formulario.controls[stringCurp])
                .setValue(estudianteActual.datosPersonales.curp);
            (<FormControl>this.formulario.controls[stringNumId])
                .setValue(estudianteActual.datosPersonales.numId);
            (<FormControl>this.formulario.controls[stringIdNacionalidadPadreMadre])
                .setValue(
                    estudianteActual.datosPersonales.nacionalidadPadreMadre.id ?
                        estudianteActual.datosPersonales.nacionalidadPadreMadre.id : '');
            if (estudianteActual.datosPersonales.discapacidad) {
              this.auxiliar = true;
              (<FormControl>this.formulario.controls[stringDiscapacidad])
                  .setValue(estudianteActual.datosPersonales.discapacidad);
            }
            (<FormControl>this.formulario.controls[stringRFC])
                .setValue(estudianteActual.datosPersonales.rfc);
            (<FormControl>this.formulario.controls[stringCelular])
                .setValue(estudianteActual.datosPersonales.celular);
            //console.log(this.formulario);
          }
          if (this.formularioContactoEmergencias) {
            if (estudianteActual.contactoEmergencia.id) {
              //console.log(estudianteActual.contactoEmergencia.id);
              this.idContactoEmergencia = estudianteActual.contactoEmergencia.id;
              this.edicionFormularioContatoEmergencia = true;
              let stringPadecimiento = 'padecimiento';
              let stringNombreCompleto = 'nombreCompleto';
              let stringParentesco = 'idParentesco';
              let stringCalleNumero = 'calleNumero';
              let stringColonia = 'colonia';
              let stringCodigoPostal = 'codigoPostal';
              let stringPais = 'idPais';
              let stringEstado = 'idEntidadFederativa';
              let stringMunicipio = 'idMunicipio';
              let stringTelefono = 'telefono';
              let stringCelular = 'celular';
              let stringCorreoElectronico = 'correoElectronico';

              (<FormControl>this.formularioContactoEmergencias.controls[stringPadecimiento])
                  .setValue(estudianteActual.contactoEmergencia.padecimiento);
              (<FormControl>this.formularioContactoEmergencias.controls[stringNombreCompleto])
                  .setValue(estudianteActual.contactoEmergencia.nombreCompleto);
              if (estudianteActual.contactoEmergencia.parentesco.id !== undefined) {
                (<FormControl>this.formularioContactoEmergencias.controls[stringParentesco])
                    .setValue(estudianteActual.contactoEmergencia.parentesco.id);
              }
              (<FormControl>this.formularioContactoEmergencias.controls[stringCalleNumero])
                  .setValue(estudianteActual.contactoEmergencia.calleNumero);
              (<FormControl>this.formularioContactoEmergencias.controls[stringColonia])
                  .setValue(estudianteActual.contactoEmergencia.colonia);
              (<FormControl>this.formularioContactoEmergencias.controls[stringCodigoPostal])
                  .setValue(estudianteActual.contactoEmergencia.codigoPostal);
              if (estudianteActual.contactoEmergencia.pais.id !== undefined) {
                (<FormControl>this.formularioContactoEmergencias.controls[stringPais])
                    .setValue(estudianteActual.contactoEmergencia.pais.id);
                this.getSelectPais(estudianteActual.contactoEmergencia.pais.id);
              }
              if (estudianteActual.contactoEmergencia.entidadFederativa.id !== undefined) {
                (<FormControl>this.formularioContactoEmergencias.controls[stringEstado])
                    .setValue(
                        estudianteActual.contactoEmergencia.entidadFederativa.id);
                this.cargarMunicipios(
                    estudianteActual.contactoEmergencia.entidadFederativa.id);
              }
              if (estudianteActual.contactoEmergencia.municipio.id !== undefined) {
                (<FormControl>this.formularioContactoEmergencias.controls[stringMunicipio])
                    .setValue(estudianteActual.contactoEmergencia.municipio.id);
              }
              (<FormControl>this.formularioContactoEmergencias.controls[stringTelefono])
                  .setValue(estudianteActual.contactoEmergencia.telefono);
              (<FormControl>this.formularioContactoEmergencias.controls[stringCelular])
                  .setValue(estudianteActual.contactoEmergencia.celular);
              (<FormControl>this.formularioContactoEmergencias.controls[stringCorreoElectronico])
                  .setValue(estudianteActual.contactoEmergencia.correoElectronico);
            }
          }

        }
    );
  }

  modalDetallesDireccion(): void {
    this.constructorDetalleDireccion();
    this.modalDetalleDireccion.open('lg');
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    if (this.registroSeleccionado) {
      let idDireccion = this.registroSeleccionado.id;
      ////console.log(idDireccion);
      let modalDetallesData = new ModalDetalleDireccionData(
          this,
          idDireccion
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
          <any>ModalDetalleDireccion,
          bindings,
          modalConfig
      );
    }*/
  }
  ////// picker ///
  getFechaEjemplo(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaNacimiento'])
          .setValue(fechaConFormato + ' 12:00am');
      this.calcularEdadEstudiante();
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }

  limpiarCampoDiscapacidad(): void {
    //console.log('limpiar');
    (<FormControl>this.formulario.controls['discapacidad'])
        .setValue('');
  }

  modalRegistroDireccion(): void {
    this.modalRegistrarDireccion.open('lg');
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalRegistroDireccionData(
          this,
          this.idEstudiante
      ) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
        <any>ModalRegistroDireccion,
        bindings,
        modalConfig
    );*/
  }

  cambiarAuxiliar(valor): any {
    if (valor) {
      this.auxiliar = true;
    } else {
      this.auxiliar = false;
      this.limpiarCampoDiscapacidad();
    }
  }

  validarDiscapacidad(): boolean {
    if (this.auxiliar) {
      return true;
    }else {
      return false;
    }
  }

  validarNumId(id: number): void {
    //console.log(id);
    if (id == 6) {
      this.extranjero = true;
    } else {
      this.extranjero = false;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlContacto(campo: string): FormControl {
    return (<FormControl>this.formularioContactoEmergencias.controls[campo]);
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarFormularioContacto(): boolean {
    if (this.formularioContactoEmergencias.valid) {
      this.validacionActivaContacto = false;
      return true;
    }
    this.validacionActivaContacto = true;
    return false;
  }

  nextMethod(): any {
    if (this.validarFormulario() && this.validarFormularioContacto()) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      if (this.edicionFormulario) {
        this._spinner.start('nextMethod');
        this.datoPersonalService
            .putDatoPersonal(
                this.idDatoPersonal,
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.insertarContactoEmergencia();
              this._spinner.stop('nextMethod');
            }
        );
        return true;
      }
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

  eliminarDireccionMovilidadExterna () {
    this._spinner.start('stepUno');
    if (this.registroSeleccionado) {
      //console.log('Eliminando...');
      this.direccionMovilidadExternaService.deleteDireccionMovilidadExterna(
          this.registroSeleccionado.id,
          this.erroresConsultas
      ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.registroSeleccionado = null;
            this.onCambiosTabla();
          }
      );
    } else {
      //alert('Selecciona un registro');
    }
  }

  onCambiosTabla(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registros = this.direccionMovilidadExternaService
        .getListaDireccionMovilidadExterna(
            this.erroresConsultas,
            urlParameter
        ).lista;
    this._spinner.stop('stepUno');
  }

  insertarContactoEmergencia(): void {
    if (this.validarFormularioContacto()) {
      let jsonFormulario = JSON.stringify(this.formularioContactoEmergencias.value, null, 2);
      ////console.log('insertar contacto' + jsonFormulario);
      if (this.edicionFormularioContatoEmergencia) {
        ////console.log('editar');
        this.contactoEmergenciaService
            .putContactoEmergencia(
                this.idContactoEmergencia,
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            () => {
            }
        );
      } else {
        ////console.log(jsonFormulario);
        return this.contactoEmergenciaService
            .postContactoEmergencia(
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
                response => {
                  ////console.log(response.json());
                  let jsonForm = '{"idContactoEmergencia": "' + response.json().id + '"}';
                  ////console.log(jsonForm);
                  this.estudianteMovilidadService.putEstudianteMovilidadExterna(
                      this.idEstudiante,
                      jsonForm,
                      this.erroresGuardado
                  ).subscribe(
                      () => {
                        /*if (assertionsEnabled()) {
                          //console.log('Actualizar estudiante');
                        }*/
                      }
                  );

                }
            );
      }
    }
  }

  ocultarDireccionMexico(): boolean {
    if (this.ocultarDireccion) {
      return false;
    }else {
      return true;
    }
  }

  //ocultar datos de direción
  getSelectPais(idPais): void {
    if (idPais === '82') {
      this.ocultarDireccion = false;
    }else {
      this.ocultarDireccion = true;
    }
  }

  modalCargarImagen(): void {
    this.modalAgregarFotografia.open('lg');
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('md', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new AgregarFotografiaEstudianteMovilidadData(
          this,
          this.idUsuario
      )
      }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
        <any>AgregarFotografiaEstudianteMovilidad,
        bindings,
        modalConfig
    );*/
  }

  private cargarMunicipios(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEntidadFederativa~' + id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.municipioService = this._catalogosServices.getMunicipio();
    this.opcionesCatalogoMunicipio =
        this.municipioService.getListaMunicipio(this.erroresConsultas, urlParameter).lista;
  }

  private calcularEdadEstudiante(): void {
    let fechaEdad = moment(this.dt);
    let hoy = moment();
    this.edadEstudiante = hoy.diff(fechaEdad, 'years');
    (<FormControl>this.formulario.controls['edad'])
        .setValue(this.edadEstudiante);
    ////console.log('este es el año ' + hoy.diff(fechaEdad, 'years'));
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private getControlErrorsContacto(campo: string): boolean {
    if (!(<FormControl>this.formularioContactoEmergencias.controls[campo]).valid
        && this.validacionActivaContacto) {
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

  private getNacionalidad(criterios, contenedor): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterios);
    this.nacionalidadService.getListaSelectNacionalidad(this.erroresConsultas, urlParameter, false).
        then(nacionalidades => {
          if (nacionalidades) {
            nacionalidades.forEach((item) =>{
              contenedor.push(new ItemSelects(item.id, item.valor));
            })
          }
    });
  }

  private prepareServices(): void {
    this.sexoService = this._catalogosServices.getSexo();
    this.estadoCivilService = this._catalogosServices.getEstadoCivil();
    this.estudianteMovilidadService = this._catalogosServices.getEstudianteMovilidadExterna();
    this.opcionesCatalogoSexo = this.sexoService.getSelectSexo(this.erroresConsultas);
    this.opcionesCatalogoEstadoCivil =
        this.estadoCivilService.getSelectEstadoCivil(this.erroresConsultas);
    this.direccionMovilidadExternaService =
        this._catalogosServices.getDireccionMovilidadExterna();

    this.datoPersonalService = this._catalogosServices.getDatoPersonal();

    this.paisService = this._catalogosServices.getPais();
    this.opcionesCatalogoPais = this.paisService.getSelectPais(this.erroresConsultas);

    this.estadoService = this._catalogosServices.getEntidadFederativa();
    this.opcionesCatalogoEstado =
        this.estadoService.getSelectEntidadFederativa(this.erroresConsultas);

    this.parentescoService = this._catalogosServices.getParentesco();
    this.opcionesCatalogoParentesco =
        this.parentescoService.getSelectParentesco(this.erroresConsultas);
    this.contactoEmergenciaService = this._catalogosServices.getContactoEmergencia();

    // para modal registro direccion
    this.tipoDireccionService = this._catalogosServices.getTipoDireccion();
    this.opcionesCatalogoDireccion =
        this.tipoDireccionService.getSelectTipoDireccion(this.erroresConsultas);

    this.onCambiosTabla();
  }

  ngOnInit() {
  }

  ///////////////////////////////MODALS//////////////////////////////////
  @ViewChild('modalAgregarFotografia')
  modalAgregarFotografia: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  //dialog: ModalDialogInstance;
  //context: AgregarFotografiaEstudianteMovilidadData;
  uploadFile: any;
  /*options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: true,
    authToken: localStorage.getItem('token')
  };*/
  options: NgUploaderOptions;
  //zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  //validacionActiva: boolean = false;
  //mensajeErrors: any = errorMessages;
  habilitarBotonAgregar: boolean = true;
  tipoDocumentoService;
  formularioDocumentacion: FormGroup;
  idArchivoDoc: number;
  usuarioService;
  archivoService;
  private nombreArchivo: String = '';
  //private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];

  /*constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal,
              private _spinner: SpinnerService) {
    this.dialog = dialog;
    this.context = <AgregarFotografiaEstudianteMovilidadData>modelContentData;
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.prepareServices();
    this.formularioDocumentacion = new ControlGroup({
      idFoto: new Control('')
    });


  }*/

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['jpg', 'png'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        let idArchivo = responseJson.id;
        console.warn(responseJson);
        if (this.esImagen(responseJson.originalName)) {
          this.idArchivoDoc = responseJson.id;
          this.habilitarBoton(this.idArchivoDoc);
          this.nombreArchivo = responseJson.originalName;
          this.formularioDocumentacion.value.idFoto = idArchivo;
          (<FormControl>this.formularioDocumentacion.controls['idFoto']).
          setValue(idArchivo);
        } else {
          this.addErrorsMesaje('El archivo debe de ser en .jpg o .png', 'danger');
          this.archivoService.deleteArchivo(
              responseJson.id,
              this.erroresGuardado
          ).subscribe(
              () => {
                /*if (assertionsEnabled()) {
                  //console.log('Se borro el archivo');
                }*/
              }
          );
        }
      }
    });
  }

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  handleDropUpload(data): void {
    let index = this.dropResp.findIndex (x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
        //console.log(this.dropResp);
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgress = Math.floor(uploaded / (total / 100));
  }

  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }

  cerrarModal(): void {
    this.modalAgregarFotografia.close();
    //this.dialog.close();
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  validarFormularioModal(): boolean {
    if (this.formularioDocumentacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlModal(campo: string): FormControl {
    return (<FormControl>this.formularioDocumentacion.controls[campo]);
  }

  /*errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }*/

  habilitarBoton(idArchivo: number): void {
    if (idArchivo) {
      this.habilitarBotonAgregar = false;
    }
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }
  enviarFormulario(): void {
    if (this.validarFormularioModal()) {
      let jsonFormulario = JSON.stringify(
          this.formularioDocumentacion.value,
          null, 2);
      this._spinner.start('enviarFormularioModal');
      this.usuarioService.putUsuario(
          this.idUsuario,
          jsonFormulario,
          this.erroresGuardado
      ).subscribe(
          response => {

          },
          error => {
            /*if (assertionsEnabled()) {
              console.error(error);
            }*/
            this.cerrarModal();
            this._spinner.stop('enviarFormularioModal');
          },
          () => {
            this._spinner.stop('enviarFormularioModal');
            this.cerrarModal();
          }
      );
    }
  }

  private esImagen(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    let tamanoArreglo: number;
    nombreArchivoArray = nombreArchiov.split('.');
    tamanoArreglo = nombreArchivoArray.length - 1;
    if (nombreArchivoArray[tamanoArreglo] && (
        nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpg' ||
        nombreArchivoArray[tamanoArreglo].toLowerCase() === 'png') ) {
      return true;
    } else {
      return false;
    }
  }

  private getControlErrorsModal(campo: string): boolean {
    if (!(<FormControl>this.formularioDocumentacion.controls[campo]).valid
        && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServicesModal(): void {
    this.usuarioService
        = this._catalogosServices.getUsuarioService(); //this.context.componente._catalogosServices.getUsuarioService();
    this.archivoService
        = this._catalogosServices.getArchivos(); //this.context.componente._catalogosServices.getArchivos();
  }

  //////////////MODAL DETALLE DIRECCION////////////
  @ViewChild('modalDetalleDireccion')
  modalDetalleDireccion: ModalComponent;
  entidadDireccion: Direccion;
  idPais;
  validarPaisMexico: boolean = true;
  //private erroresConsultas: Array<ErrorCatalogo> = [];

  private constructorDetalleDireccion() {
    this.direccionMovilidadExternaService
        .getEntidadDireccionMovilidadExterna(
            this.registroSeleccionado.id,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadDireccion
              = new Direccion(response.json());
          //console.log(this.entidadDireccion);
          this.idPais = this.entidadDireccion.pais.id;
        },
        error => {
          /*if (assertionsEnabled()) {
           console.error(error);
           console.error(this.erroresConsultas);
           }*/
        },
        () => {
          /*if (assertionsEnabled()) {
           //console.log(this.entidadDireccion);
           }*/
        }
    );
  }

  /*constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal,
              private _spinner: SpinnerService) {
    this.dialog = dialog;
    this.context = <ModalDetalleDireccionData>modelContentData;
    this.context.componenteDatosPersonales.direccionMovilidadExternaService
        .getEntidadDireccionMovilidadExterna(
            this.context.idDireccion,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadDireccion
              = new Direccion(response.json());
          //console.log(this.entidadDireccion);
          this.idPais = this.entidadDireccion.pais.id;
        },
        error => {
          if (assertionsEnabled()) {
            console.error(error);
            console.error(this.erroresConsultas);
          }
        },
        () => {
          if (assertionsEnabled()) {
            //console.log(this.entidadDireccion);
          }
        }
    );
  }*/

  cerrarModalDireccion(): void {
    this.modalDetalleDireccion.close();
    //this.dialog.close();
  }

  mostrarDireccionPais(): boolean {
    if (this.idPais === 82) {
      this.validarPaisMexico = true;
      return true;
    }else {
      this.validarPaisMexico = false;
      return false;
    }
  }

  /////////////// MODAL REGISTRO DIRECCION //////////////
  @ViewChild('modalRegistrarDireccion')
  modalRegistrarDireccion: ModalComponent;
  formularioModalRegistroDireccion: FormGroup;
  //paisService;
  //estadoService;
  //municipioService;
  tipoDireccionService;

  //validacionActiva: boolean = false;
  //mensajeErrors: any = errorMessages;
  //ocultarDireccion: boolean;

  private opcionesCatalogoDireccion: Array<ItemSelects>;
  //private opcionesCatalogoPais: Array<ItemSelects>;
  //private opcionesCatalogoEstado: Array<ItemSelects>;
  private opcionesCatalogoMunicipioModal: Array<ItemSelects>;
  //private erroresConsultas: Array<Object> = [];
  //private erroresGuardado: Array<Object> = [];

  /*constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal,
              private spinner: SpinnerService) {
    this.dialog = dialog;
    this.context = <ModalRegistroDireccionData>modelContentData;
    this.prepareServices();
    this.formulario = new ControlGroup({
      idTipo: new Control('', Validators.required),
      calle: new Control('',
          Validators.compose([
            Validators.required,
            ValidacionService.parrafos,
          ])),
      colonia: new Control('',
          Validators.compose([
            ValidacionService.letrasNumerosAcentoPuntoComaValidator,
          ])),
      idPais: new Control('', Validators.required),
      codigoPostal: new Control('',
          Validators.compose([
            ValidacionService.numerosValidator
          ])),
      idEntidadFederativa: new Control(''),
      idMunicipio: new Control(''),
      telefono: new Control('',
          Validators.compose([ValidacionService.telefonoValidator])),
      idEstudiante: new Control(this.context.idEstudiante),
    });
  }*/

  /*getSelectPais(idPais): void {
    if (idPais == 82 ){
      this.ocultarDireccion = false;
    }else {
      this.ocultarDireccion = true;
    }
  }*/

  /*ocultarDireccionMexico(): boolean {
    if (this.ocultarDireccion) {
      return false;
    }else {
      return true;
    }
  }*/

  getControlModalRegistrarDireccion(campo: string): FormControl {
    return (<FormControl>this.formularioModalRegistroDireccion.controls[campo]);
  }

  cerrarModalRegistrarDireccion(): void {
    this.modalRegistrarDireccion.close();
    //this.dialog.close();
  }

  validarFormularioRegistrarDireccion(): boolean {
    if (this.formularioModalRegistroDireccion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }


  enviarFormularioRegistrarDireccion(): void {
    if (this.validarFormularioRegistrarDireccion()) {
      let jsonFormulario = JSON.stringify(this.formularioModalRegistroDireccion.value, null, 2);
      //console.log(jsonFormulario);
      this._spinner.start('modalRegistrarDireccion');
      this.direccionMovilidadExternaService
          .postDireccionMovilidadExterna(
              jsonFormulario,
              this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          error => {
            this.cerrarModalRegistrarDireccion();
            this._spinner.stop('modalRegistrarDireccion');
          },
          () => {
            this.onCambiosTabla();
            this.cerrarModalRegistrarDireccion();
            this._spinner.stop('modalRegistrarDireccion');
          }
      );
    }
  }

  private cargarMunicipiosModalRegistrarDireccion(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEntidadFederativa~' + id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.municipioService = this._catalogosServices.getMunicipio();
    this.opcionesCatalogoMunicipioModal =
        this.municipioService.getListaMunicipio(this.erroresConsultas, urlParameter).lista;
  }

  private getControlErrorsModalRegistrarDireccion(campo: string): boolean {
    if (!(<FormControl>this.formularioModalRegistroDireccion.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  /*private errorMessage(control: Control): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }*/

  /*private prepareServicesModalRegistrarDireccion(): void {
    this.paisService = this.context
        .componenteDatosPersonales._catalogosServices.getPais();
    this.opcionesCatalogoPais = this.paisService.getSelectPais(this.erroresConsultas);

    this.estadoService = this.context
        .componenteDatosPersonales._catalogosServices.getEntidadFederativa();
    this.opcionesCatalogoEstado =
        this.estadoService.getSelectEntidadFederativa(this.erroresConsultas);

    this.tipoDireccionService = this.context
        .componenteDatosPersonales._catalogosServices.getTipoDireccion();
    this.opcionesCatalogoDireccion =
        this.tipoDireccionService.getSelectTipoDireccion(this.erroresConsultas);
  }*/

}
