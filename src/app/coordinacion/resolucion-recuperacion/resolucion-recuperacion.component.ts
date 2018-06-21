import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild, IterableDiffers, KeyValueDiffers} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Router, ActivatedRoute} from '@angular/router';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {NgUploaderModule } from 'ngx-uploader';
import {Validacion} from '../../utils/Validacion';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SolicitudExamenTrabajo} from '../../services/entidades/solicitud-examen-trabajo.model';
import {SolicitudExamenTrabajoService} from '../../services/entidades/solicitud-examen-trabajo.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ProfesorRevisionTrabajo} from '../../services/entidades/profesor-revision-trabajo.model';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';

@Component({
  selector: 'app-resolucion-recuperacion',
  templateUrl: './resolucion-recuperacion.component.html',
  styleUrls: ['./resolucion-recuperacion.component.css'],
    providers: [ModalComponent, CatalogosServices, SpinnerService]
})
export class ResolucionRecuperacionComponent {
  estudianteMateria: EstudianteMateriaImpartida;
  entidadSolicitudExamen: SolicitudExamenTrabajo;
  idSolicitudResolucion: number;
  solicitudExamenTrabajoService;
  catalogosService;
  profesorRevisionTrabajoService;
  profesorService;
  estudianteMateriaService;
  profesoresResolucion: Array<ProfesorRevisionTrabajo> = [];
  entidadSolicitudExamenTrabajo: SolicitudExamenTrabajo;
  registros: Array<SolicitudExamenTrabajo> = [];
  formulario: FormGroup;
  errores: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  paginacion: PaginacionInfo;
  mensajeErrors: any = {'required': 'Este campo es requerido'};
  validacionActiva: boolean = false;
  calificaciones: number = 0;
  private sub: any;
  // Add Variables

  // End Variables

  columnas: Array<any> = [
    { titulo: 'Profesor', nombre: 'idProfesor'},
    { titulo: 'Calificación', nombre: 'calificacionDefinitiva'},
    { titulo: 'Comentarios', nombre: 'comentariosEvaluacion'}
  ];

  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private modal: ModalComponent,
              private elementRef: ElementRef,
              private _router: Router, public _catalogosService: CatalogosServices,
              private injector: Injector, private _renderer: Renderer,
              private _spinner: SpinnerService, private route: ActivatedRoute) {
/*
    this.idSolicitudResolucion = _router.parent.currentInstruction.component.params.id;
*/

// Add Code
  this.sub = route.params.subscribe(params => {
    this.idSolicitudResolucion = +params['id']; // (+) converts string 'id' to a number
  });
// End code

// Add Form
    this.formulario  = new FormGroup({
      comentariosFinales: new FormControl('', Validators.compose([Validacion.parrafos, Validators.required])),
      idEstatus: new FormControl('1226'),  // estatus resuelto de la resolucion
    });

/*    this.formularioConfirmar  = new FormGroup({
      idEstatus: new FormControl('1226'), // verificar si sigue siendo mismo estatus resuelto
      comentariosFinales: new FormControl('', Validators.required),
    });*/
// End Form

    this.prepareServices();
    this.obtenerSolicitud();

    this.solicitudExamenTrabajoService.
    getEntidadSolicitudExamenTrabajo(
      this.idSolicitudResolucion,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadSolicitudExamenTrabajo
          = new SolicitudExamenTrabajo(response.json());
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {

      }
    );
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }else {
      return false;
    }
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

  regresarListaHistorialMovilidad(): any {
    this._router.navigate(['formacion-academica', 'lista-trabajos-recuperacion-coordinacion']);
  }

  private getData(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios',
      'idSolicitudExamenTrabajo.id~' + this.idSolicitudResolucion + ':IGUAL');
    this.profesorRevisionTrabajoService.getListaProfesorRevisionTrabajo(
      this.errores, urlSearch).
    subscribe(
      response => {
        this.profesoresResolucion = [];
        let paginacionInfoJson = response.json();
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {

          if (item.calificacion_definitiva) {
             this.calificaciones += item.calificacion_definitiva;
           }
          this.profesoresResolucion.push(new ProfesorRevisionTrabajo(item));
        });
          this.calificaciones = Math.round(this.calificaciones / 2);
      }
    );
  }

  private prepareServices(): void {
    // console.log('Solicitud id: ' + this.idSolicitudResolucion);
    this.catalogosService = this._catalogosService;
    this.profesorService = this.catalogosService.getProfesor();
    this.solicitudExamenTrabajoService =
      this.catalogosService.getSolicitudExamenTrabajoService();
    this.profesorRevisionTrabajoService =
      this.catalogosService.getProfesorRevisionTrabajoService();
    this.estudianteMateriaService = this.catalogosService.
    getEstudianteMateriaImpartidaService();
    this.getData();
  }
  // Add Class

  validarFormulario(): boolean {
   // console.log(this.formulario);
    if (this.formulario.valid) {
        this.validacionActiva = false;
        return true;
    }
    this.validacionActiva = true;
    return false;

 }
    //  guarda comentarios y cambia estatus a evaluado
    //  y asigna la calificación revisión a estudiante materia impartida
  enviarFormulario(): void {
    // console.log('enviarFormulario');

    if (this.validarFormulario()) {
      this._spinner.start('_viarFormulario');
      let json = JSON.stringify(this.formulario.value, null, 2);
      console.log(json);
      this._catalogosService.getSolicitudExamenTrabajoService().putSolicitudExamenTrabajo(
        this.idSolicitudResolucion,
        json,
        this.erroresGuardado
      ).subscribe(
        response => {
          let jsonCalificacion = '{"calificacionRevision": ' +
            this.calificaciones
            + ',"idMateriaImpartida.id": '
            + this.estudianteMateria.materiaImpartida.id + '}';
          // console.log('normal:::' + jsonCalificacion);
          // jsonCalificacion = Math.round(jsonCalificacion);
          // console.log('redondeada::' + jsonCalificacion);
          this.estudianteMateriaService.putEstudianteMateriaImpartida(
            this.estudianteMateria.id,
            jsonCalificacion,
            this.erroresGuardado)
            .subscribe(
              response => {
                console.log('success');
                this._spinner.stop('_viarFormulario');
                this.enviarCorreoAceptado();
              }
            );
        }
      );
    }
  }

  enviarCorreoAceptado(): void {
    console.log('enviarCorreoAceptado');

    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      asunto: new FormControl('Resolución de nueva calificación de trabajo de recuperación'),
      entidad: new FormControl({ EstudianteMateriaImpartida: this.estudianteMateria.id }),
      idPlantilla: new FormControl('31')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.catalogosService.getEnvioCorreoElectronicoService()
      .postCorreoElectronico(
          jsonFormulario,
          this.erroresGuardado
      ).subscribe(
      response => {
      this.closemodalconfirmarResolucionRecuperacion();
      console.log('Modal closemodalconfirmarResolucionRecuperacion');
      },
      error => { },
      () => { }
    );

     console.log('enviarCorreoAceptado end');
    this.regresarListaHistorialMovilidad();

  }

// End class

 private obtenerSolicitud(): void {
        this._spinner.start('_obtenerSolicitud');
        this.solicitudExamenTrabajoService.getSolicitudExamenTrabajo(
            this.idSolicitudResolucion,
            this.errores
        ).subscribe(
            response => {
                this.entidadSolicitudExamen = new SolicitudExamenTrabajo(response.json());
                let urlParameter: URLSearchParams = new URLSearchParams();
                urlParameter.set('criterios', 'idEstudiante.id~' +
                    this.entidadSolicitudExamen.estudiante.id + ':IGUAL,' +
                    'idMateriaImpartida.id~' +
                    this.entidadSolicitudExamen.materiaImpartida.id + ':IGUAL');
                // console.log(this.entidadSolicitudExamen);
               console.log(urlParameter);
                this.estudianteMateriaService
                    .getListaEstudianteMateriaImpartida(
                        this.errores,
                        urlParameter
                    ).subscribe(
                    response => {
                      console.log(response.json());
                        response.json().lista.forEach((estudiantes) => {
                            // console.log(estudiantes);
                            this.estudianteMateria = new EstudianteMateriaImpartida(estudiantes);
                            // console.log(this.estudianteMateria);
                            this._spinner.stop('_obtenerSolicitud');
                        });
                    }
                );
            },error => {
              console.error(error);
            }
        );
    }

// Add Modals
  @ViewChild('modalConfirmarResolucionRecuperacion')
  modalconfirmarResolucionRecuperacion: ModalComponent;
  openmodalconfirmarResolucionRecuperacion(): void {
    this.modalconfirmarResolucionRecuperacion.open('sm'); }
  closemodalconfirmarResolucionRecuperacion(): void {
    this.modalconfirmarResolucionRecuperacion.close(); }
// End modals

}
