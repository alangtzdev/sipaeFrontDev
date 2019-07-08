import {Component, OnInit, ElementRef, Injector, Renderer, ApplicationRef, ViewChild} from '@angular/core';
import {ItemSelects} from "../../services/core/item-select.model";
import {Convocatoria} from "../../services/entidades/convocatoria.model";
import {Usuarios} from "../../services/usuario/usuario.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Router, ActivatedRoute} from "@angular/router";
import {UsuarioServices} from "../../services/usuario/usuario.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {UsuarioRolService} from "../../services/usuario/usuario-rol.service";
import {EnvioCorreoElectronicoService} from "../../services/entidades/envio-correo-electronico.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import * as moment from "moment";
import {Validacion} from "../../utils/Validacion";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {errorMessages} from "../../utils/error-mesaje";
import {ConvocatoriaService} from "../../services/entidades/convocatoria.service";

@Component({
  selector: 'app-registro-solicitante',
  templateUrl: './registro-solicitante.component.html',
  styleUrls: ['./registro-solicitante.component.css']
})
export class RegistroSolicitanteComponent implements OnInit {

  @ViewChild('modalPreregistroInteresado')
  modalPreregistroInteresado: ModalComponent;
  @ViewChild('modalConvocatoria')
  modalConvocatoria: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';
  // para validacion del formulario
  edicionFormulario: boolean = false;
  contraseniasIguales: boolean = false;
  formulario: FormGroup;
  idPreRegistroCatalogo: number;
  mensajeErrors = errorMessages;
  validacionActiva: boolean = false;
  validacionConvocatoria: boolean = true;
  // datos "simulados" para los combo
  opcionesSelectPais: Array<ItemSelects> = [];
  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesConvocatoria: Array<ItemSelects> = [];
  convocatoriaService;
  estatusCatalogoService;
  datoPersonalService;
  estudianteService;
  idUsuario: number;
  idDatoPersonal: number;
  idEstudiante: number;
  convocatoriaSeleccionada: Convocatoria;
  registros: Array<Usuarios> = [];
  captcha: string;
  reCaptchaValido: boolean = false;
  private alertas: Array<Object> = [];
  private registrosUsuarios: Array<Usuarios> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private entidadPreRegistroSolicitante: Usuarios;
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private sub: any;

  constructor(private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer, private router: Router,
              route: ActivatedRoute,
              private _usuarioService: UsuarioServices,
              private _catalogosService: CatalogosServices,
              private _convocatoriaService: ConvocatoriaService,
              private usuarioRolService: UsuarioRolService,
              private appRef: ApplicationRef,
              private _correoService: EnvioCorreoElectronicoService,
              private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idPreRegistroCatalogo = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.prepareServices();
    this.obtenerCatalogo();
    this.captcha = null;
//    this.idPreRegistroCatalogo = Number(params.get('id'));
    moment.locale('es');
    this.formulario = new FormGroup({
      nombre: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      primerApellido: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      segundoApellido: new FormControl('',
        Validators.compose([Validacion.parrafos])),
      idPaisOrigen: new FormControl('', Validators.required),
      activo: new FormControl(true),
      email: new FormControl('',
        Validators.compose([Validators.required, Validacion.emailValidator])),
      password: new FormControl('',
        Validators.compose([Validators.required, Validacion.passwordValidator])),
      confirmarpassword: new FormControl('', Validators.required),
      idConvocatoria: new FormControl('', Validators.required),
      // datos personales
      idProgramaDocente: new FormControl(''),
      auxiliar: new FormControl('', Validators.required),
      username: new FormControl(''),
      roles: new FormControl(['solicitante']),
      enabled: new FormControl(true),
      fechaNacimiento: new FormControl('1/1/1980 00:00am'),

    });

    window['checkReCaptch'] = (response: any) => {
      this.checkReCaptch(response);
    };
    window['caducidadReCatch'] = (response: any) => {
      ////console.log('entre aca');
      this.captcha = null;
      this.reCaptchaValido = false;
      this.appRef.tick();
    };
  }

  // Métodos para validar el formulario
  validarFormulario(): boolean {
    if (this.formulario.valid && this.validarContrasenias()) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario(): void {
    event.preventDefault();
    console.log(this.formulario);
    if (this.validacionConvocatoria) {
      if (this.validarFormulario()) {
        this._spinner.start("registrosolicitante1");
        this.convocatoriaService.getEntidadConvocatoria(
          this.getControl('idConvocatoria').value,
          this.erroresGuardado
        ).subscribe(
          response => {
            this.convocatoriaSeleccionada = new Convocatoria (response.json());
            ////console.log(this.convocatoriaSeleccionada);
            (<FormControl>this.formulario.controls['username'])
              .setValue(this.getControl('email').value);
            (<FormControl>this.formulario.controls['password'])
              .setValue(this.getControl('password').value);
            let idProgramaDocente =
              this.convocatoriaSeleccionada.programaDocente.id;
            ////console.log(this.convocatoriaSeleccionada.programaDocente.id);
            (<FormControl>this.formulario.controls['idProgramaDocente'])
              .setValue(idProgramaDocente);

            /*let jsonPut = '{ "idProgramaDocente": "' +
             this.convocatoriaSeleccionada.programaDocente.id + '"}';
             //console.log(jsonPut);

             let jsonFinal = Object.assign(this.formulario.value, jsonPut);

             //console.log(jsonFinal); */
            this.buscarCorreoDuplicado('email');
          }
        );
      }
    } else {
      this.modalConvocatoriaExpirada();
    }
  }



  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType] + ' ';
        }
      }
    }
    return resultado;
  }

  redireccionarRegistroSolicitante(): void {
    this.router.navigate([
      'login'
    ]);
  }

  // debug del formulario no usar para produccion
  get cgValue(): string {
    return JSON.stringify(this.formulario.value, null, 2);
  }

  displayReCaptcha() {
    var doc = <HTMLDivElement>document.body;
    var script = document.createElement('script');
    script.innerHTML = '';
    script.src = 'https://www.google.com/recaptcha/api.js?hl=es';
    script.async = true;
    script.defer = true;
    doc.appendChild(script);
  }

  checkReCaptch(response) {
    //zone.run(() => {
    ////console.log('checking captcha');

    this.captcha = response;
    ////console.log('captcha', this.captcha);
    this.reCaptchaValido = true;
    //this.captchaControl.setValue(true);
    //this.captchaControl.updateValueAndValidity({onlySelf: false, emitEvent: true});
    //this.userForm.updateValueAndValidity({onlySelf: false, emitEvent: true});
    //console.debug(this.captchaControl)

    //this.cdRef.markForCheck());
    this.appRef.tick();
    //});
  }

  ngOnInit() {
    this.displayReCaptcha();
  }

  cambiarProgramaDocente(valor: string): void {
    //console.log(valor);
  }

  validarContrasenias(): boolean {
    if (this.getControl('confirmarpassword').value === this.getControl('password').value) {
      (<FormControl>this.formulario.controls['auxiliar'])
        .setValue(this.getControl('password').value);
      return true;
    } else {
      return false;
    }
  }

  enviarcorreoSolicitante(): void {
    let correo = this.getControl('email');
    let formularioCorreo = new FormGroup({
      destinatario: new FormControl(correo.value),
      idPlantillaCorreo: new FormControl(3),
      entidad: new FormControl({Estudiantes : this.idEstudiante}),
      asunto: new FormControl('Registro completado')
    });

    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {},
      error => {},
      () => {}
    );
  }

  private buscarCorreoDuplicado(correo: string): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    urlSearch.set('criterios', 'email~' + this.formulario.value.email + ':IGUAL');
    this._usuarioService.getListaUsuario(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        this.registrosUsuarios = [];
        response.json().lista.forEach((usuario) => {
          this.registrosUsuarios.push(usuario);
        });
      },
      error => {
      },
      () => {
        if (this.registrosUsuarios.length !== 0) {
          this.addErrorsMesaje('El correo ya está asignado a otro registro', 'danger');
          this._spinner.stop("registrosolicitante1");
        } else {
          //console.log('no hay usuario registradp');
          this.registarUsuarioDatos();
        }
      }
    );
  }

  private registarUsuarioDatos(): void {
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    ////console.log(jsonFormulario);
    this._usuarioService.postUsuario(
      jsonFormulario,
      this.erroresGuardado,
      this.router
    ).subscribe(
      response => {
        this.idUsuario = response.json().id;
        this.datoPersonalService
          .postDatoPersonal(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {
            ////console.log(response.json().id);
            this.idDatoPersonal = response.json().id;
            let jsonFormularioEstudiante =
              '{"idUsuario": "' + this.idUsuario +
              '", "idDatosPersonales": "' + this.idDatoPersonal +
              '", "ultimaActualizacion": "' +
              moment(new Date()).format('DD/MM/YYYY hh:mma') +
              '", "valido": "' + true +
              '", "idPromocion": "' +
              this.convocatoriaSeleccionada.promocion.id +
              '", "idConvocatoria": "' +
              this.convocatoriaSeleccionada.id +
              '", "idEstatus": "1004", "idPeriodoActual": "' +
              this.convocatoriaSeleccionada.promocion.
                idPeriodoEscolarInicio.id +
              '", "numPeriodoActual": "1"}';
            ////console.log(jsonFormularioEstudiante);
            this.estudianteService
              .postEstudiante(
                jsonFormularioEstudiante,
                this.erroresGuardado
              ).subscribe(
              response => {
                ////console.log(response.json().id);
                this.idEstudiante = response.json().id;
                if (response.json().id) {
                  let jsonUsuarioRol = '{ "idUsuario": "' +
                    this.idUsuario +
                    '", "idRol": "13"}';
                  ////console.log(jsonUsuarioRol);
                  this.usuarioRolService.postUsuarioRolSR(
                    jsonUsuarioRol,
                    this.erroresGuardado
                  ).subscribe(
                    response => {
                      this.enviarcorreoSolicitante();
                      this.modalPreRegistroInteresadoExitoso();
                      this._spinner.stop("registrosolicitante1");
                    }
                  );
                }
              }
            );
          }
        );
      }
    );
  }

  private addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }
  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.datoPersonalService = this._catalogosService.getDatoPersonal();
    this.estudianteService = this._catalogosService.getEstudiante();
    this.convocatoriaService = this._catalogosService.getConvocatoria();
  }
  private obtenerCatalogo(): void {
    this.opcionesSelectPais =
      this.estatusCatalogoService.getPais().
      getSelectPais(this.erroresConsultas);
    this.opcionesSelectProgramaDocente =
      this.estatusCatalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus.id~' + '1007' + ':IGUAL'
      + ',cierre~' + moment(new Date()).format('DD/MM/Y') + ':MAYOR');

    this.opcionesConvocatoria =
      this.convocatoriaService.
      getSelectConvocatoria(this.erroresConsultas, urlParameter);
  }

/*  private modalConvocatoriaExpirada(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalConvocatoriaExpiradaData(2, 3) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
      <any>ModalConvocatoriaExpirada,
      bindings,
      modalConfig
    );
  }*/

  /*  modalPreRegistroInteresadoExitoso(): void {
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('sm', true, 27);

   let modalData = new ModalPreRegistroExitosoData(
   this
   );
   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: modalData }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>ModalPreRegistroExitoso,
   bindings,
   modalConfig
   );
   }*/

  modalPreRegistroInteresadoExitoso(): void {
    this.modalPreregistroInteresado.open();
  }

  private modalConvocatoriaExpirada(): void {
    this.modalConvocatoria.open()
  }
  private cerrarModal(){
    this.redireccionarRegistroSolicitante();
    this.modalPreregistroInteresado.close();
  }
  private cerrarModal1(){
    this.redireccionarRegistroSolicitante();
    this.modalConvocatoria.close();
  }
}
