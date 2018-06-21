import {Component, OnInit, ViewChild, Injector, ElementRef, Renderer} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {Validacion} from '../../utils/Validacion';
import {URLSearchParams} from '@angular/http';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Direccion} from '../../services/entidades/direccion.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {DependienteEconomico} from '../../services/entidades/dependiente-economico.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {NacionalidadService} from '../../services/catalogos/nacionalidad.service';
import {ItemSelects} from '../../services/core/item-select.model';
import {WizardComponent} from '../../wizard/wizard.component';
import {DatosPersonalesComponent} from './datos-personales/datos-personales.component';
import {DependientesContactoComponent} from './dependientes-contacto/dependientes-contacto.component';
import {AntecedenteAcademicoComponent} from './antecedente-academico/antecedente-academico.component';
import {ExperienciaComponent} from './experiencia/experiencia.component';
import {InfoComplementariaComponent} from './info-complementaria/info-complementaria.component';
import {DocumentacionComponent} from './documentacion/documentacion.component';
import {ModalEnviarSolicitudComponent} from './modal-enviar-solicitud/modal-enviar-solicitud.component';

@Component({
  selector: 'app-solicitud-admision',
  templateUrl: './solicitud-admision.component.html',
  styleUrls: ['./solicitud-admision.component.css']
})
export class SolicitudAdmisionComponent implements OnInit {

  @ViewChild('wizard')
  wc: WizardComponent ;


  @ViewChild('datosPersonales') componentPrimero: DatosPersonalesComponent;
  @ViewChild('depContactos') componentSegundo: DependientesContactoComponent;
  @ViewChild('antAcademic') componentTercero: AntecedenteAcademicoComponent;
  @ViewChild('experiencia') componentCuarto: ExperienciaComponent;
  @ViewChild('infoComplementaria') componentQuinto: InfoComplementariaComponent;
  @ViewChild('documentacion') componentUltimo: DocumentacionComponent;
  @ViewChild('modalEnviarSol') modalEnviarSol: ModalEnviarSolicitudComponent;
  styleSize: string;
  estudianteService;
  router: Router;
  promocionEstudianteActual;
  edicionDocencia: boolean = false;
  completa: boolean = false;
  private alertas: Array<Object> = [];
   idEstudiante: number;
   estudiante: Estudiante;
   erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private isFirst: boolean = true;
  private isLast: boolean = false;

  constructor(route: ActivatedRoute, private _router: Router,
               private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer,
              private _catalogosService: CatalogosServices) {
    this.router = _router;
    let params;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });
    this.idEstudiante = params.id;
    this.edicionDocencia = params.edicionDocencia;
    this.prepareServices();
    this.recuperarEstudiante();
    this.router = _router;

  }

  recuperarEstudiante(): void {
    let estudianteActual: Estudiante;
    this.estudianteService.getEstudiante(
      this.idEstudiante,
      this.erroresConsultas).subscribe(
      response =>
        estudianteActual = new Estudiante(
          response.json()),
      error => {

      },
      () => {

        this.estudiante = estudianteActual;
        this.componentUltimo.estudiante = estudianteActual;
        this.promocionEstudianteActual = estudianteActual.promocion.id;
      }
    );
  }

  validarBotonEnviarSolicitud(): boolean {
    let habilitar: boolean;
    if ( this.idEstudiante ) {
      if (this.estudiante.estatus.id === 1004 || this.estudiante.estatus.id === 1009) {
        if (this.componentUltimo) {
          habilitar = this.componentUltimo.habilitarBoton();
        } else {
          habilitar = true;
        }
      } else {
        habilitar = true;
      }
    } else {
      habilitar = true;
    }
    return habilitar;
  }

  modalEnviarSolicitud(): void {
    if(this.componentUltimo.getIdTipoDocumentos().length<this.componentUltimo.cantidadDocCon.length)
    {
      this.componentUltimo.addErrorsMesaje('Para enviar solicitud debe agregar los documentos que menciona la convocatoria del programa docente.','danger');
      return;
    }

    if (this.estudiante.usuario.email) {
      let correo = this.estudiante.usuario.email;
      this.modalEnviarSol.dialog.open('lg');
    }

  }

  redireccionarListaSolicitud(): void {
    this.router.navigate(['lista/solicitudes']);
  }

  redireccionarExpediente(): void {
    this.router.navigate(['alumno', 'expediente',
      {usuarioObjetivo: this.estudiante.usuario.id}]);
  }


  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  private addErrorsMesaje(mensajeError): void {
    this.alertas.push({
      type: 'danger',
      msg: mensajeError,
      closable: true
    });
  }


  private prepareServices(): void {
    this.estudianteService = this._catalogosService.getEstudiante();
  }

  ngOnInit(): void { }

  previous() {
    this.wc.previous();
    switch (this.wc.activeStepIndex) {
      case 0:
        this.isFirst = true;
      default:
        this.isLast = false;
        this.completa = false;
        break;
    }
  }

  next() {
    console.log(this.wc);
    this.wc.toNext();
  }


  onNextStep1(): any {
    if (this.componentPrimero.nextMethod()) {
      this.isFirst = false;
      this.wc.next();
    }
  }

  onNextStep2(): any {
    if (this.componentSegundo.nextMethod()) {
      this.wc.next();
    }
  }

  onNextStep3(): any {
    this.wc.next();
  }

  onNextStep4(): any {
    if (this.componentCuarto.nextMethod()) {
      this.wc.next();
    }
  }

  onNextStep5(): any {
    if (this.componentQuinto.nextMethod()) {
      this.completa = true;
      this.wc.next();
      this.isLast = true;

    }
  }




}
