import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {SolicitudAdmisionComponent} from "../solicitud-admision.component";
import {Form, FormControl, FormGroup} from "@angular/forms";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {EnvioCorreoElectronicoService} from "../../../services/entidades/envio-correo-electronico.service";
import {Estudiante} from "../../../services/entidades/estudiante.model";

@Component({
  selector: 'app-modal-enviar-solicitud',
  templateUrl: './modal-enviar-solicitud.component.html',
  styleUrls: ['./modal-enviar-solicitud.component.css']
})
export class ModalEnviarSolicitudComponent implements OnInit {

  @ViewChild("modalEnviarSol")
  dialog: ModalComponent;
  context: SolicitudAdmisionComponent;
  folioSolicitudService;
  estudianteService;
  formulario: FormGroup;
  formularioEdicion: FormGroup;
  formularioCorreoDocencia: FormGroup;
  idEstudiante: number;
  auxiliar: boolean = false;
  formularioCorreo: FormGroup;
  public date: Date = new Date();
  private erroresGuardado: Array<ErrorCatalogo> = [];
  estudianteActual: Estudiante;
  constructor(
              private _catalogoService: CatalogosServices,
              private _correoService: EnvioCorreoElectronicoService,private inj:Injector) {
  this.context = this.inj.get(SolicitudAdmisionComponent);

    this.idEstudiante = this.context.idEstudiante;
    this.prepareServices();

  }

  cerrarModal(): void {
    this.dialog.close();
  }

  redireccionarListaSolicitud() {
    this.formulario.value.idEstatus = 1010;
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    this.estudianteService.putEstudiante(
      this.context.estudiante.id,
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {},
      console.error,
      () => {
        this.enviarCorreoRegistroSolicitud();
        this.enviarCorreoAreaDocencia();
        this.cerrarModal();
        this.context.redireccionarListaSolicitud();
        //quitar comentario cuando este la implentacion de correos funcionando
      }
    );
  }

  enviarCorreoRegistroSolicitud(): void {
    let jsonFormulario = JSON.stringify(this.formularioCorreo.value, null, 2);
    this._correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {
      },
      error => {

      },
      () => {
      }
    );

  }

  enviarCorreoAreaDocencia(): void {
    this.formularioCorreoDocencia = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      idPlantillaCorreo: new FormControl(41),
      entidad: new FormControl({Estudiantes: this.idEstudiante}),
      asunto: new FormControl('Nueva solicitud de aspirante'),
    });
    let jsonCorreo = JSON.stringify(this.formularioCorreoDocencia.value, null, 2);
    this._correoService.postCorreoElectronico(
      jsonCorreo,
      this.erroresGuardado
    ).subscribe(
      response => {},
      error => {
      },
      () => {
      }
    );
  }

  /*  private enviarSolicitud(): void {
   let jsonFormulario = JSON.stringify(this.formularioEdicion.value, null, 2);
   if (this.context.idFolioSolicitud) {
   this.folioSolicitudService.putFolioSolicitud(
   this.context.idFolioSolicitud,
   jsonFormulario,
   this.erroresGuardado
   ).subscribe(
   () => {}, //console.log('Success... Folio actualizado'),
   console.error,
   () => {
   this.cerrarModal();
   this.context.entidadRegistro.redireccionarListaSolicitud();
   }
   );
   }else {
   //this.generarInfoFolioSolicitud();
   jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
   //console.log('Folio Solicitud: ' + jsonFormulario );
   this.folioSolicitudService.postFolioSolicitud(
   jsonFormulario,
   this.erroresGuardado
   ).subscribe(
   response => {
   this.idEstudiante = response.json().id;
   let formularioFolio = new ControlGroup ({
   idFolioSolicitud: new Control(this.idEstudiante),
   });
   let jsonFormularioEstudiante =
   JSON.stringify(formularioFolio.value, null, 2);
   //console.log(formularioFolio);
   this.context.entidadRegistro.estudianteService.putEstudiante(
   this.context.estudiante.id,
   jsonFormularioEstudiante,
   this.erroresGuardado
   ).subscribe(
   () => {}, //console.log('Success, folio asigando a estidante'),
   console.error,
   () => {
   this.cerrarModal();
   this.context.entidadRegistro.redireccionarListaSolicitud();
   }
   );
   }
   );

   }
   }

   private generarInfoFolioSolicitud(): void {
   let fecha : String = '' + this.date.getFullYear();
   this.formulario.value.anio = fecha.substr(2, 4);
   this.formulario.value.consecutivo = 'C16';
   this.formulario.value.fecha = new moment(this.date).format('DD/MM/YY hh:mm A');
   this.formulario.value.fechaUltimaActualizacion
   = new moment(this.date).format('DD/MM/YY hh:mm A');
   this.formulario.value.idTipo = '1';
   this.formulario.value.idProgramaDocente =
   this.context.estudiante.promocion.programaDocente.id;
   this.formulario.value.idEstatus = '1010';
   this.formulario.value.idPromocion = this.context.estudiante.promocion.id;

   }*/

  private prepareServices(): void {
    this.folioSolicitudService = this._catalogoService.getFolioSolicitud();
    this.estudianteService = this._catalogoService.getEstudiante();


  this.estudianteService.getEntidadEstudiante(
      this.idEstudiante,
      this.context.erroresConsultas
    ).subscribe(
      response =>
        this.estudianteActual = new Estudiante(
          response.json()),
      error => {

      },
      () => {
        this.formularioEdicion = new FormGroup({
          idEstatus: new FormControl('1010')
        });

        this.formulario = new FormGroup({
          idEstatus: new FormControl('')
        });
        this.formularioCorreo = new FormGroup({
          destinatario: new FormControl(this.estudianteActual.usuario.email),
          entidad: new FormControl({Estudiantes: this.idEstudiante}),
          idPlantillaCorreo: new FormControl('39')
        });
      });

  }
  ngOnInit() {
  }

}
