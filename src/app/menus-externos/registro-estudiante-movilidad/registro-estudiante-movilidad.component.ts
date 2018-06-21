import {Component, OnInit, ApplicationRef, Renderer, Injector, ElementRef, ViewChild} from '@angular/core';
import {InteresadoMovilidadExterna} from "../../services/entidades/interesado-movilidad-externa.model";
import {errorMessages} from "../../utils/error-mesaje";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Usuarios} from "../../services/usuario/usuario.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Router} from "@angular/router";
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {URLSearchParams} from "@angular/http";
import {ItemSelects} from "../../services/core/item-select.model";
import {ModalComponent} from "ng2-bs3-modal/components/modal";

@Component({
  selector: 'app-registro-estudiante-movilidad',
  templateUrl: './registro-estudiante-movilidad.component.html',
  styleUrls: ['./registro-estudiante-movilidad.component.css']
})
export class RegistroEstudianteMovilidadComponent implements OnInit {
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

  formulario: FormGroup;
  idProgramaDocente: number;
  validacionActiva: boolean = false;
  idUsuario: number;
  idDatoPersonal: number;
  interesado: InteresadoMovilidadExterna;
  emailValido: boolean = false;
  captcha: string;
  reCaptchaValido: boolean = false;
  usuarioExistente: Usuarios;
  tipoMensaje: number = null;
  valido: boolean = false;
  mensajeErrors: any = errorMessages;

  // Services
  catalogosServices: CatalogosServices;
  interesadoMovilidadExternaService;
  datoPersonalService;
  estudianteMovilidadExternaService;
  usuarioRolService;
  correoService;
  usuarioService;
  programaDocenteService;

  // Variables para manejar errores
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private opcionesProgramasDocente: Array<ItemSelects> = [];

  //variable para correo
  private idEstuidanteMovilidad: number;

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _catalogosServices: CatalogosServices,
              private router: Router,
              private appRef: ApplicationRef,
              private spinner: SpinnerService) {
    this.prepareServices();
    this.captcha = null;

    this.formulario = new FormGroup ({
      nombre: new FormControl('', Validators.required),
      primerApellido: new FormControl('', Validators.required),
      segundoApellido: new FormControl(),
      email: new FormControl('', Validators.compose([Validators.required,
        Validacion.emailValidator])),
      password: new FormControl('', Validators.compose([Validators.required,
        Validacion.passwordValidator])),
      confirmarPassword: new FormControl('', Validators.required),
      activo: new FormControl(true),
      idProgramaDocente: new FormControl('', Validators.required),
      idPaisOrigen: new FormControl('', Validators.required),
      username: new FormControl(''),
      enabled: new FormControl('true'),
      roles: new FormControl(['']),
      //datosPersonales
      // datos personales
      fechaNacimiento: new FormControl('1/1/1980 00:00am'),
      // lugarNacimiento: new FormControl ('Lugar de nacimiento'),
    });

    window['checkReCaptch'] = (response: any) => {
      this.checkReCaptch(response);
    };
    window['caducidadReCatch'] = (response: any) => {
      this.captcha = null;
      this.reCaptchaValido = false;
      this.appRef.tick();
    };
  }

  ngOnInit() {
    this.displayReCaptcha();
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  validarEmail(): boolean {
    if (this.validarEmailNuevo()) {
      this.validacionActiva = false;
      let email = this.getControl('email');
      //console.log('email value::' + email.value);
      if (!this.emailValidator(email)) {
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'email~' + email.value + ':IGUAL');
        this.usuarioExistente;

        this.usuarioService.getListaUsuariosMovilidad(
          this.erroresConsultas,
          urlParameter,
          false
        ).subscribe(
          response => {
            this.spinner.start("registroestudiante1");
            ////console.log('ENTRA A EMAIL VALIDATOR');
            let listaEntidad = response.json();
            if (listaEntidad.lista.length  > 0) {
              this.usuarioExistente =
                new Usuarios(listaEntidad.lista[0]);
            }

            /*       if (this.usuarioExistente !== undefined && this.usuarioExistente.activo === false) {
             alert('Ese email ya tiene registrada una cuenta de usuario');

             //Agregar codigo si ya existe una cuenta pero no esta activada
             }  */
            if (!this.usuarioExistente) {
              let urlParameter: URLSearchParams = new URLSearchParams();
              urlParameter.set('criterios', 'email~' + email.value + ':IGUAL');
              //TODO Se agrega ordenamiento descendente para obtener el ultimo correo registrado por el interesado
              urlParameter.set('ordenamiento', 'id:DESC');
              this.interesado;
              this.interesadoMovilidadExternaService.
              getListaInteresadoMovilidadExterna(
                this.erroresConsultas,
                urlParameter,
                false)
                .subscribe(
                  response => {
                    let listaEntidad = response.json();
                    if (listaEntidad.lista.length > 0) {
                      this.interesado =
                        new InteresadoMovilidadExterna(listaEntidad.lista[0]);
                    }

                    if (this.interesado !== undefined && this.interesado.estatus.id === 102) {
                      (<FormControl>this.formulario.controls['nombre'])
                        .setValue (this.interesado.nombre);
                      (<FormControl>this.formulario.controls['primerApellido'])
                        .setValue (this.interesado.primerApellido);
                      (<FormControl>this.formulario.controls['segundoApellido'])
                        .setValue (this.interesado.segundoApellido);
                      (<FormControl>this.formulario.controls['idProgramaDocente'])
                        .setValue (this.interesado.programaDocente.id);
                      (<FormControl>this.formulario.controls['idPaisOrigen'])
                        .setValue (this.interesado.pais.id);
                      (<FormControl>this.formulario.controls['username'])
                        .setValue(this.getControl('email').value);
                      this.emailValido = true;
                      this.valido = true;
                      this.idProgramaDocente = this.interesado.programaDocente.id;
                    }else {
                      this.spinner.stop("registroestudiante1");
                      console.log("no ha sido validado");
                      this.tipoMensaje = 1;
                      this.modalConvocatoriaExpirada();
                    }
                  },
                  error => {
                    this.spinner.stop("registroestudiante1");
                    console.error(error);
                  },
                  () => {
                    this.spinner.stop("registroestudiante1");
                  }
                );
            }else{
              this.spinner.stop("registroestudiante1");
              console.log("el correo ya existe");
              this.tipoMensaje = 2;
              this.modalConvocatoriaExpirada();
            }
          },
          error => {
            this.spinner.stop("registroestudiante1");
            console.error(error);
          });
      } else {
        return false;
      }
    }
  }

  modificarEmail(): void {
    this.interesado = undefined;
    (<FormControl>this.formulario.controls['email'])
      .setValue('');
    this.valido = false;
    this.emailValido = false;
  }

  emailValidator(email) {
    if (!email.value) {
      return null;
    }
    let patron: string = '[-!#$%&\'*+/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&\'*+/0-9=?A-Z^_a-z{|}~])*' +
      '@[a-zA-Z](-?[a-zA-Z0-9])*(\.[a-zA-Z](-?[a-zA-Z0-9])*)+';
    let regex = new RegExp(`^${patron}$`);

    if (regex.test(email.value)) {
      return null;
    } else {
      return { 'invalidEmailAddress': true };
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

  validarEmailNuevo(): boolean {
    if (this.getControl('email').valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario(event): void {
    event.preventDefault();
    if (this.validarFormulario()) {
      if (this.validarContrasenia()) {
        if (this.formulario.valid) {
          let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
          //console.log(jsonFormulario); // imprimo JSON
          this.usuarioService.postUsuario(
            jsonFormulario,
            this.erroresGuardado,
            this.router
          ).subscribe(
            response => {
              //console.log(response.json().id);
              this.idUsuario = response.json().id;
              if (this.idUsuario) {
                this.datoPersonalService
                  .postDatoPersonal(
                    jsonFormulario,
                    this.erroresGuardado,
                    null
                  ).subscribe(
                  response => {
                    //console.log(response.json().id);
                    this.idDatoPersonal = response.json().id;
                    let jsonFormularioEstudianteMovilidadExterna =
                      '{"idUsuario": "' + this.idUsuario +
                      '", "idDatosPersonales": "' + this.idDatoPersonal +
                      '", "idEstatus": "' + 1005 +
                      '", "idProgramaDocente": "' + this.idProgramaDocente +
                      '"}';
                    this.estudianteMovilidadExternaService.
                    postEstudianteMovilidadExterna(
                      jsonFormularioEstudianteMovilidadExterna,
                      this.erroresGuardado
                    ).subscribe(
                      response => {
                        //console.log(response.json().id);
                        this.idEstuidanteMovilidad = response.json().id;
                        // ----------------------- !!!!!!!!!!!!!!!
                        let jsonUsuarioRol = '{ "idUsuario": "' +
                          this.idUsuario +
                          '", "idRol": "6"}';
                        this.usuarioRolService.postUsuarioRol(
                          jsonUsuarioRol,
                          this.erroresGuardado
                        ).subscribe(
                          response => {
                            this.enviarCorreo();
                          }
                        );
                        //----------------------------!!!!!!!!!!!
                      }
                    );
                  }
                );
              }
            },
            error => {
              try {
                console.error(error);
                this.tipoMensaje = 2;
                //console.log(this.tipoMensaje);
                this.modalConvocatoriaExpirada();

              }catch (e) {
                //console.log(e.status);
              }
            }
          );
        } else {
          //  alert('Error en el formulario');
          this.tipoMensaje = 3;
          this.modalConvocatoriaExpirada();
        }
      }else {
        // alert('contraseña diferente');
        this.tipoMensaje = 4;
        this.modalConvocatoriaExpirada();
      }
    }
  }

  redireccionarRegistroMovilidadExterna(): void {
    this.router.navigate(['login']);
  }

  redireccionarPaginaCOLSAN(): void {
    window.location.href = 'http://www.colsan.edu.mx/';
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  // método para validar que ambas contrasenias sean iguales
  private validarContrasenia(): any {
    if (this.getControl('password').value ===
      this.getControl('confirmarPassword').value) {
      return true;
    } else {
      return false;
    }
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
    this.captcha = response;
    this.reCaptchaValido = true;
    //this.captchaControl.setValue(true);
    //this.captchaControl.updateValueAndValidity({onlySelf: false, emitEvent: true});
    //this.userForm.updateValueAndValidity({onlySelf: false, emitEvent: true});
    //console.debug(this.captchaControl)

    //this.cdRef.markForCheck());
    this.appRef.tick();
    //});
  }

  private enviarCorreo(): void {

    let correoFormulario = new FormGroup ({
      destinatario: new FormControl(this.getControl('email').value),
      entidad: new FormControl({EstudiantesMovilidadExterna: this.idEstuidanteMovilidad}),
      idPlantillaCorreo: new FormControl(10)
    });
    let jsonFormulario = JSON.stringify(correoFormulario.value, null, 2);
    this.correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {
        //console.log(response.json());
        //this.redireccionarRegistroMovilidadExterna();
        this.modalRegistroExitoso();
      },
      error => {
        console.error(error);
      },
      () => {
        //console.log('Correo Enviado');
      }
    );
  }

  private validarInteresadoMovilidad($event): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'email~' + this.formulario.value.email + ':IGUAL');

    let email = this.formulario.value.email;
    this.interesadoMovilidadExternaService.
    getListaInteresadoMovilidadExterna(this.erroresConsultas, urlParameter, false)
      .subscribe(
        response => {
          let listaEntidad = response.json();
          if (listaEntidad.lista.length  > 0) {
            this.interesado =
              new InteresadoMovilidadExterna(listaEntidad.lista[0]);
          }

          if (this.interesado !== undefined && this.interesado.estatus.id === 102) {
            this.validarInteresadoMovilidad($event);
          }else {
            this.modalConvocatoriaExpirada();
          }
        },
        error => {
          console.error(error);
        });
  }



  private prepareServices(): void {
    this.interesadoMovilidadExternaService =
      this._catalogosServices.getInteresadoMovilidadExterna();
    this.datoPersonalService = this._catalogosServices.getDatoPersonal();
    this.estudianteMovilidadExternaService =
      this._catalogosServices.getEstudianteMovilidadExterna();
    this.usuarioRolService = this._catalogosServices.getUsuarioRolService();
    this.correoService = this._catalogosServices.getEnvioCorreoElectronicoService();
    this.usuarioService = this._catalogosServices.getUsuarioService();
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.opcionesProgramasDocente =
      this.programaDocenteService.getSelectProgramaDocente();
  }
  private modalConvocatoriaExpirada(): void {
    this.modalConvocatoria.open();
  }
  private modalRegistroExitoso(): void {
    this.modalPreregistroInteresado.open();
  }

  cerrarModal1(){
    this.redireccionarRegistroMovilidadExterna();
    this.modalConvocatoria.close();
  }
  cerrarModal(){
    this.redireccionarRegistroMovilidadExterna();
    this.modalPreregistroInteresado.close();
  }
  /*
  private modalConvocatoriaExpirada(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);
    let modalFormularioData = new ModalConvocatoriaExpiradaData(
      this,
      this.tipoMensaje);
    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    this.modal.open(
      <any>ModalConvocatoriaExpirada,
      bindings,
      modalConfig
    );
  }

  private modalRegistroExitoso(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);
    let modalFormularioData = new ModalPreRegistroEstuidanteMovilidadExitosoData(
      this
    );
    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    this.modal.open(
      <any>ModalPreRegistroEstuidanteMovilidadExitoso,
      bindings,
      modalConfig
    );
  }*/

}
