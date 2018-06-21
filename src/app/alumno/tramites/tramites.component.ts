import {Component, OnInit, ElementRef, Injector, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {ErrorCatalogo} from '../../services/core/error.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {AuthService} from '../../auth/auth.service';
import {URLSearchParams} from '@angular/http';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Validacion} from "../../utils/Validacion";
import * as moment from 'moment';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-tramites',
  templateUrl: './tramites.component.html',
  styleUrls: ['./tramites.component.css']
})
export class TramitesComponent implements OnInit {
  router: Router;
  solicitudService;
  estatusCatalogoService;
  estudianteServive;
  correoService;
  private idEstudiante: number;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private usuarioLogueado: UsuarioSesion;
  constructor(_router: Router, //private modal: Modal,
              private elementRef: ElementRef, //params: RouteParams,
              private injector: Injector, //private _renderer: Renderer,
              private _catalogosService: CatalogosServices,
              //private http: Http,
              private spinner: SpinnerService,
              auth: AuthService) {
    this.spinner.start('tramites');
    this.router = _router;
    this.usuarioLogueado = auth.getUsuarioLogueado();
    this.prepareServices();
    this.recuperarUsuarioActual();

    //constructor modal solicitud constancia
    this.formularioSolicitud = new FormGroup({
      dirigida: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      proposito: new FormControl('', Validators.required),
      consideraciones: new FormControl(''),
      fechaCreacion: new FormControl(moment(new Date()).format('DD/MM/YYYY hh:mma')),
      idEstatus: new FormControl(1216),
      idEstudiante: new FormControl(this.idEstudiante),
    });
    moment.locale('es');
  }

  recuperarUsuarioActual(): void {
    //this.estudianteServive = this.catalogosServices.getEstudianteService();
    ////console.log('usuario actual: ' + this.usuarioLogueado.id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL');
    //console.log('el id del usuario logueado es' + this.usuarioLogueado.id);
    this.estudianteServive.getListaEstudianteOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          let estudiante;
          response.json().lista.forEach((elemento) => {
            estudiante = new Estudiante(elemento);
            //console.log('Estudiante' + estudiante);
          });
          this.idEstudiante = estudiante.id;
          (<FormControl>this.formularioSolicitud.controls['idEstudiante']).setValue(this.idEstudiante);
          //console.log(this.idEstudiante);
        },
        error => {
          /*if (assertionsEnabled()) {
            console.log(error);
          }*/
          this.spinner.stop('tramites');
        },
        () => {
          this.spinner.stop('tramites');
        }
    );

  }

  modalAgregarSolicitudConstancia(): void {
    (<FormControl>this.formularioSolicitud.controls['dirigida']).setValue('');
    (<FormControl>this.formularioSolicitud.controls['proposito']).setValue('');
    (<FormControl>this.formularioSolicitud.controls['consideraciones']).setValue('');
    (<FormControl>this.formularioSolicitud.controls['fechaCreacion']).
      setValue(moment(new Date()).format('DD/MM/YYYY hh:mma'));
    this.modalSolicitudConstancia.open('lg');
    //console.log(this.idEstudiante);
    /*let dialog: Promise <ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalSolicitudConstanciaEstudioData = new ModalSolicitudConstanciaEstudioData(
        this,
        this.idEstudiante
    );
    let bindings = Injector.resolve([
      provide(ICustomModal, {useValue: modalSolicitudConstanciaEstudioData}),
      provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
      provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
    ]);

    dialog = this.modal.open(
        <any>ModalSolicitudConstanciaEstudio,
        bindings,
        modalConfig
    );*/
  }

  detalleNoAdeudos(): void {
    this.router.navigate(['alumno', 'solicitud-carta-no-adeudo',
      {usuarioObjetivo: this.usuarioLogueado.id}]);
//    this.router.navigate(['alumno', 'solicitud-carta-no-adeudo']);
  }

  detalleCedular(): void {
    this.router.navigate(['alumno', 'cedula']);
  }

  private prepareServices(): void {
    this.estudianteServive = this._catalogosService.getEstudiante(); //new EstudianteService(this.http);
    this.estatusCatalogoService = this._catalogosService;
    this.solicitudService =
        this._catalogosService.getSolicitudConstancia();
    this.correoService = this._catalogosService.getEnvioCorreoElectronicoService();
  }

  ngOnInit() {
  }

  ////////////////////////// MODALS ///////////////////////////////////
  @ViewChild('modalSolicitudConstancia') modalSolicitudConstancia: ModalComponent;
  formularioSolicitud: FormGroup;
  validacionActiva: boolean = false;
  idSolicitud: number;
  private erroresGuardado: Array<ErrorCatalogo> = [];

  /*constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal,
              private injector: Injector, private modal: Modal,
              private _spinner: SpinnerService) {
    this.dialog = dialog;
    this.context = <ModalSolicitudConstanciaEstudioData>modelContentData;
    moment.locale('es');
    this.formularioSolicitud = new ControlGroup({
      dirigida: new Control('', Validators.
      compose([Validators.required, ValidacionService.parrafos])),
      proposito: new Control('', Validators.required),
      consideraciones: new Control(''),
      fechaCreacion: new Control(new moment(new Date()).format('DD/MM/YYYY hh:mma')),
      idEstatus: new Control(1216),
      idEstudiante: new Control(this.context.idSolicitud),
    });
  }*/

  ModalConfirmacionConstanciaEstudio(): void {
    this.confirmacionConstancia.open('sm');
    /*let dialog: Promise <ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);
    let modalConfirmacionConstanciaData = new ModalConfirmacionConstanciaData(
        this,
        idSolicitudConstancia
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, {useValue: modalConfirmacionConstanciaData}),
      provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
      provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
    ]);

    dialog = this.modal.open(
        <any>ModalConfirmacionConstancia,
        bindings,
        modalConfig
    );*/
  }


  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this.spinner.start('enviarSolicitudConstancia');
      let jsonFormulario = JSON.stringify(this.formularioSolicitud.value, null, 2);
      //console.log(jsonFormulario);
      this.solicitudService
          .postSolicitudConstancia(
              jsonFormulario,
              this.erroresGuardado
          ).subscribe(
          response => {
            this.idSolicitud = response.json().id;
          },
          error => {
            this.spinner.stop('enviarSolicitudConstancia');
          },
          () => {
            this.spinner.stop('enviarSolicitudConstancia');
            this.enviarCorreoDocencia();
            this.ModalConfirmacionConstanciaEstudio();
            this.cerrarModal();
          }
      );

    } else {
      //alert('error en el formulario');
    }
  }


  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioSolicitud.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioSolicitud.controls[campo]).valid &&
        this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormulario(): boolean {
    if (this.formularioSolicitud.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
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
    return null;
  }

  cerrarModal(): void {
    this.modalSolicitudConstancia.close();
  }

  enviarCorreoDocencia(): void {
    let correoFormulario = new FormGroup ({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      entidad: new FormControl({SolicitudConstancia: this.idSolicitud}),
      idPlantillaCorreo: new FormControl(26)
    });
    let jsonFormulario = JSON.stringify(correoFormulario.value, null, 2);
    this.correoService.postCorreoElectronico(
        jsonFormulario,
        this.erroresGuardado
    ).subscribe(
        () => {
          /*if (assertionsEnabled()) {
            //console.log('correo Eviado');
          }*/
        }
    );
  }

  descargarOrdenPago(): void {
    let exportarFormato;
    this.solicitudService
        .getOrdenPagoPdf(
            this.idSolicitud,
            this.erroresGuardado
        ).subscribe(
        response => {
          exportarFormato = response.json();
        },
        error => {
          console.error(error);
        },
        () => {
          window.open(exportarFormato);
        }
    );
  }

  /////////////////////////////////// MODAL CONFIRMACION////////////////////////

  @ViewChild('confirmacionConstancia') confirmacionConstancia: ModalComponent;

  cerrarModalConfirmacionConstancia(): void {
    this.confirmacionConstancia.close();
  }

  /*descargarOrdenPago(): void {
    this.context.componenteLista.descargarOrdenPago(this.context.idSolicitud);
  }*/

}
