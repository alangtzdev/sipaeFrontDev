import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {DatoInformacionColsan} from "../../services/entidades/dato-informacion-colsan.model";
import {Usuarios} from "../../services/usuario/usuario.model";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {DatoInformacionColsanService} from "../../services/entidades/dato-informacion-colsan.service";
import {UsuarioServices} from "../../services/usuario/usuario.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {EstudianteService} from "../../services/entidades/estudiante.service";
import {URLSearchParams} from "@angular/http";
import {AuthService} from "../../auth/auth.service";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {ProgramaDocenteServices} from "../../services/entidades/programa-docente.service";
import {EntidadFederativa} from "../../services/catalogos/entidad-federativa.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";

@Component({
  selector: 'app-cedula',
  templateUrl: './cedula.component.html',
  styleUrls: ['./cedula.component.css']
})
export class CedulaComponent implements OnInit {

  usuarioLogueado: UsuarioSesion;
  entidadDireccionGP: DatoInformacionColsan;
  entidadDireccionSEP: DatoInformacionColsan;
  entidadColsan: DatoInformacionColsan;
  usuarioActual: Usuarios;
  estudianteActula: Estudiante;
  idProgramaDocente;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  constructor(public _catalogosService: CatalogosServices,
              public datosDireccionCedula: DatoInformacionColsanService,
//              private modal: Modal,
              private elementRef: ElementRef,
              private authService: AuthService,
              private injector: Injector,
              public programaDocenteService: ProgramaDocenteServices,
              private _renderer: Renderer,
              public spinner:SpinnerService,
              private _usuarioService: UsuarioServices,
              private _estudianteService: EstudianteService) {
    this.cargarInformacion();
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
    //this.usuarioLogueado.id;
    console.log('usuariop ',this.usuarioLogueado);

    this._usuarioService.getEntidadUsuario(
        this.usuarioLogueado.id,
        this.erroresGuardado).subscribe(
        response => {
          this.usuarioActual = new Usuarios(response.json());
          let urlParameter: URLSearchParams = new URLSearchParams();
          urlParameter.set('criterios', 'idUsuario~' + this.usuarioActual.id + ':IGUAL');
          this._estudianteService.getListaEstudianteOpcional(this.erroresGuardado,
              urlParameter).subscribe(
              response => {
                let respuesta = response.json();
                respuesta.lista.forEach((item) => {
                  this.estudianteActula = new Estudiante(item);
                  //console.log(this.estudianteActula);
                  this.idProgramaDocente = this.estudianteActula.promocion.programaDocente.claveDgp;
                });
              });
        }
    );
    this.formulario = new FormGroup({
      nombreInstitucion: new FormControl(''),
      vialidadPrincipal: new FormControl(''),
      idEntidadFederativa: new FormControl(''),
      telefono: new FormControl(''),
      email: new FormControl(''),
      paginaWeb: new FormControl(''),
      numeroExterior: new FormControl(''),
      localidad: new FormControl(''),
    });
  }

  ngOnInit() {
    //this.usuarioLogueado = this.authService.getUsuarioLogueado();
    //this.usuarioLogueado.id;
    console.log('usuariop2 ',this.usuarioLogueado);
  }

  cargarInformacion(): any {
    this.spinner.start("cedula1");
    this.datosDireccionCedula.getEntidadDatoInformacionColsan(
      1,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadDireccionGP
          = new DatoInformacionColsan(response.json());
        ////console.log(this.entidadDireccionGP);
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
          console.error(this.erroresConsultas);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          ////console.log(this.entidadDireccionGP);
        }*/
      }
    );

    this.datosDireccionCedula.getEntidadDatoInformacionColsan(
      2,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadDireccionSEP
          = new DatoInformacionColsan(response.json());
        ////console.log(this.entidadDireccionSEP);
      },
      error => {
        this.spinner.stop("cedula1");
/*        if (assertionsEnabled()) {
          console.error(error);
          console.error(this.erroresConsultas);
        }*/
      },
      () => {
        this.spinner.stop("cedula1");
/*        if (assertionsEnabled()) {
          ////console.log(this.entidadDireccionSEP);
        }*/
      }
    );

    this.datosDireccionCedula.getEntidadDatoInformacionColsan(
      3,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadColsan
          = new DatoInformacionColsan(response.json());
        ////console.log(this.entidadDireccionSEP);
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
          console.error(this.erroresConsultas);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          ////console.log(this.entidadDireccionSEP);
        }*/
      }
    );
  }

  hasRol(rol: string): boolean {
    return this.authService.hasRol(rol);
  }

  /////////////////////////////////// MODALS//////////////////////////////

  @ViewChild('modalEditar')
  modalEditar: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  ////////////////////// --MODAL EDITAR-- /////////////////////////////////////////
  idDireccionDGP:number;
  formulario: FormGroup;
  entidadDireccion: DatoInformacionColsan;
  catalogoEstado;
  validacionActiva: boolean = false;
  edicionFormulario: boolean = false;
  entidadDireccionInstitucion: DatoInformacionColsan;

  private opcionesEstados: Array<ItemSelects> = [];
  private erroresConsultasED: Array<ErrorCatalogo> = [];
  private erroresGuardadoED: Array<ErrorCatalogo> = [];
  private _entidadFederativa: EntidadFederativa;

  private constructorEditar(direccion): void {
    this.idDireccionDGP = direccion;
    this.opcionesEstados = [];
    this.prepareServicesED();
    this.validacionActiva = false;
    this.edicionFormulario = false;
    this.erroresConsultasED = [];
    this. erroresGuardadoED = [];

    this.formulario = new FormGroup({
      nombreInstitucion: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      vialidadPrincipal: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      idEntidadFederativa: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.
      compose([Validators.required, Validacion.telefonoValidator])),
      email: new FormControl('', Validators.
      compose([Validators.required, Validacion.emailValidatorOptional])),
      paginaWeb: new FormControl('', Validators.
      compose([Validacion.parrafos])),
      numeroExterior: new FormControl('', Validators.
      compose([Validators.required, Validacion.letrasNumerosValidator])),
      localidad: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
    });

    if (this.idDireccionDGP) {
      this.spinner.start('cons');
      this.edicionFormulario = true;
      let datosDireccionCedula: DatoInformacionColsan;
      this.entidadDireccion = this.datosDireccionCedula.getDatoInformacionColsan(
          this.idDireccionDGP,
          this.erroresConsultasED
      ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>
              datosDireccionCedula = new DatoInformacionColsan(
                  response.json()),
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {

          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            if (this.formulario) {
              let stringInstitucion = 'nombreInstitucion';
              let stringvialidadPrincipal = 'vialidadPrincipal';
              let stringnumeroExterior = 'numeroExterior';
              let stringnumeroEstado = 'idEntidadFederativa';
              let stringTelefono = 'telefono';
              let stringEmail = 'email';
              let stringPaginaWeb = 'paginaWeb';
              let stringLocalidad = 'localidad';
              (<FormControl>this.formulario.controls[stringInstitucion])
                  .setValue(datosDireccionCedula.nombreInstitucion);
              (<FormControl>this.formulario.controls[stringvialidadPrincipal])
                  .setValue(datosDireccionCedula.vialidadPrincipal);
              (<FormControl>this.formulario.controls[stringnumeroExterior])
                  .setValue(datosDireccionCedula.numeroExterior);
              (<FormControl>this.formulario.controls[stringnumeroEstado])
                  .setValue(datosDireccionCedula.entidadFederativa.id);
              (<FormControl>this.formulario.controls[stringTelefono])
                  .setValue(datosDireccionCedula.telefono);
              (<FormControl>this.formulario.controls[stringEmail])
                  .setValue(datosDireccionCedula.email);
              (<FormControl>this.formulario.controls[stringPaginaWeb])
                  .setValue(datosDireccionCedula.paginaWeb);
              (<FormControl>this.formulario.controls[stringLocalidad])
                  .setValue(datosDireccionCedula.localidad);
            }
            this.spinner.stop('cons');
          }
      );
    }
    this.modalEditarDatos();
  }
  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this.spinner.start('enviar');
      event.preventDefault();
      let json =  JSON.stringify(this.formulario.value, null, 2);
      if (this.edicionFormulario) {
        this.datosDireccionCedula.putDatoInformacionColsan(
            this.idDireccionDGP,
            json,
            this.erroresGuardadoED
        ).subscribe(
            response => {
              this.spinner.stop('enviar');
              this.cerrarModalEditarDatos();
              this.cargarInformacion();

            }
        );
      } else {
        this.datosDireccionCedula.postDatoInformacionColsan(
            json,
            this.erroresGuardadoED
        ).subscribe(
            response => {
              //console.log('Success');
              var json = response.json();
              ////console.log('json', json.id);
              this.spinner.stop('enviar');
              this.cerrarModalEditarDatos();
              this.cargarInformacion();
            }
        );
      }
    }else {
      //alert('Error');
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  validarFormulario(): boolean {
    ////console.log(this.formulario.value);
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).
            valid && this.validacionActiva) {
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

  private prepareServicesED(): void {
    this.catalogoEstado =
        this._catalogosService.getEntidadFederativa();
    this.opcionesEstados =
        this.catalogoEstado.getSelectEntidadFederativa(this.erroresConsultasED);
  }

  private modalEditarDatos(): void {
    this.modalEditar.open('lg');
  }
  private cerrarModalEditarDatos(): void {
    this.modalEditar.close();
  }

  ////////////////////// --MODAL DETALLE-- /////////////////////////////////////////

  entidadCOLSAN: DatoInformacionColsan;
  //entidadProgramaDocente: Programa;
  registros: Array<ProgramaDocente> = [];

  private erroresConsultasDE: Array<ErrorCatalogo> = [];
  private erroresGuardadoDE: Array<Object> = [];

  private constructorDetalle(): void {
    this.registros = [];
    this.erroresConsultasDE = [];
    this.erroresGuardadoDE = [];

    this.datosDireccionCedula.getEntidadDatoInformacionColsan(
        3,
        this.erroresConsultasDE
    ).subscribe(
        response => {
          this.entidadCOLSAN
              = new DatoInformacionColsan(response.json());
          //console.log(this.entidadCOLSAN);
        },
        error => {

        },
        () => {

        }
    );
    this.obtenerClaves();
    this.modalDetalleDatos();
  }

  obtenerClaves(): any {
    let urlSearch: URLSearchParams = new URLSearchParams();

    this.registros = this.programaDocenteService.getListaProgramaDocenteModal(
        this.erroresConsultas,
        urlSearch
    ).lista;
    //console.log(this.registros);
  }

  private modalDetalleDatos(): void {
    this.modalDetalle.open('lg');
  }
  private cerrarModalDetalleDatos(): void {
    this.modalDetalle.close();
  }
}
