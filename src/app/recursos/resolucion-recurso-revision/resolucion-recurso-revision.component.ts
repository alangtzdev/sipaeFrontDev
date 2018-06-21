import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {AuthService} from '../../auth/auth.service';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ConfigService} from '../../services/core/config.service';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {ProfesorRevisionTrabajo} from '../../services/entidades/profesor-revision-trabajo.model';
import {RecursoRevision} from '../../services/entidades/recurso-revision.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ProfesorRevisionTrabajoService} from '../../services/entidades/profesor-revision-trabajo.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-resolucion-recurso-revision',
  templateUrl: './resolucion-recurso-revision.component.html',
  styleUrls: ['./resolucion-recurso-revision.component.css']
})
export class ResolucionRecursoRevisionComponent implements OnInit {

  @ViewChild('modalConfirmacionResolucion')
  modalConfirmacionResolucion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  usuarioRol: UsuarioRoles;
  idCoordinador: number = 0;
  obtenerEstudianteMateria: Array<EstudianteMateriaImpartida> = [];
  guardarEstudianteMateria: EstudianteMateriaImpartida;
  validacionActiva: boolean = false;
  promedioFinal: number = 0;
  calificacion: ProfesorRevisionTrabajo;
  registroSeleccionado: ProfesorRevisionTrabajo;
  criteriosCabezera: string = '';
  idRecursoRevision: number;
  esVistaSolicitante: boolean;
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  registros: Array<ProfesorRevisionTrabajo> = [];
  // se declaran variables para consultas de base de datos
  entidadRecursoRevision: RecursoRevision;
  recursoRevision: RecursoRevision;
  recursoRevisionService;
  vistaAnteriorRegresar;
  _enviarCorreo;
  formulario: FormGroup;
  columnas: Array<any> = [
    { titulo: 'Profesor', nombre: ''},
    { titulo: 'Calificación', nombre: ''},
    { titulo: 'Comentario', nombre: ''},
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: ''}
  };
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private sub: any;

  constructor(route: ActivatedRoute,
              private _catalogosService: CatalogosServices,
              private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer,
              private http: Http, private _router: Router,
              private _profesorRevisionTrabajoService: ProfesorRevisionTrabajoService,
              private _spinner: SpinnerService,
              private _archivoService: ArchivoService,
              private _estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService,
              private _usuarioRolService: UsuarioRolService,
               private _authService: AuthService) {
    let usuarioLogueado: UsuarioSesion = this._authService.getUsuarioLogueado();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.sub = route.params.subscribe(params => {
      this.vistaAnteriorRegresar = params['vistaAnterior'];
      this.idRecursoRevision = +params['id']; // (+) converts string 'id' to a number
      this.esVistaSolicitante = Boolean(params['vistaSolicitante']);

      // In a real app: dispatch action to load the details here.
    });
    // console.log(this.vistaAnteriorRegresar);
    this.formulario = new FormGroup({
      calificacionDefinitiva: new FormControl(''),
      comentariosFinales: new FormControl('', Validators.compose([
        Validators.required, Validacion.parrafos])),
      idEstatus: new FormControl('')
    });
    this.prepareServices();
    this.obtenerEntidadRecursoRevision();
  }

  ngOnInit() {
    this.mostrarTabla();
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this._usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        // console.log(response.json());
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles(elemento);

        });
      }
    );
  }
  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  /*modalConfirmarResolucion(): void {
    if (this.validarFormulario()) {
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('sm', true, 27);
      //let idRecurso = this.registroSeleccionado.id;
      let modalDetallesData = new ModalConfirmarResolucionRecursoRevisionData(
        this,
        1
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData}),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalConfirmarResolucionRecursoRevision,
        bindings,
        modalConfig
      );
    }
  }*/
  mostrarTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = 'idRecursoRevision~'
      + this.idRecursoRevision + ':IGUAL';
    urlSearch.set('criterios', criterios);
    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<ProfesorRevisionTrabajo>
    } = this._profesorRevisionTrabajoService.getListaProfesorRevisionTrabajo(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new ProfesorRevisionTrabajo(item));
        });
      },
      error => {

      },
      () => {
        console.log('registros Profesores', this.registros);
        this.obtenerPromedioFinal();
      }
    );
  }
  obtenerPromedioFinal(): any {
    let contarCalificaciones = 0;
    this.registros.forEach((calificacion) => {

      this.promedioFinal += calificacion.calificacionDefinitiva;
      contarCalificaciones++;
    });
    this.promedioFinal = Math.round(this.promedioFinal / contarCalificaciones);

  }
  guardarCalificacionFinal(): void {
    // (this._spinner.start();
    (<FormControl>this.formulario.controls['calificacionDefinitiva'])
      .patchValue(this.promedioFinal);
    (<FormControl>this.formulario.controls['idEstatus'])
      .patchValue(1226);
    let json = JSON.stringify(this.formulario.value, null, 2);
    this.recursoRevisionService.putRecursoRevision(
      this.idRecursoRevision, json, this.erroresGuardado
    ).subscribe(() => {
      this.actualizarCalificacionEstudianteMateria();
    });
  }
  regresarListaSolicitantes(): any {
    this._router.navigate([this.vistaAnteriorRegresar]);
  }
  obtenerEntidadRecursoRevision(): void {
    this._spinner.start('obtenerEntidadRecursoRevision');
    this.recursoRevisionService
      .getEntidadRecursoRevision(
        this.idRecursoRevision,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadRecursoRevision = new RecursoRevision(response.json());
      },
      error => {
        this._spinner.stop('obtenerEntidadRecursoRevision');
      },
      () => {

        this._spinner.stop('obtenerEntidadRecursoRevision');
      }
    );
  }
  actualizarCalificacionEstudianteMateria(): void {
    let idEstudianteMateria: number = 0;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~'
      + this.entidadRecursoRevision.estudiante.id + ':IGUAL;AND,'
      + 'idMateriaImpartida.idMateria~'
      + this.entidadRecursoRevision.materiaImpartida.materia.id
      + ':IGUAL');
    this._estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlParameter
    ).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.obtenerEstudianteMateria.push(new EstudianteMateriaImpartida(item));
      });
      this.obtenerEstudianteMateria.forEach((guardarEstudianteMateria) => {
        idEstudianteMateria = guardarEstudianteMateria.id;

      });
      let json = '{"calificacionRevision": ' + this.promedioFinal + '}';
      this._estudianteMateriaImpartidaService.putEstudianteMateriaImpartida(
        idEstudianteMateria,
        json,
        this.erroresGuardado).subscribe(() => {
        this.enviarResolucionCalificacion();
        /*let formularioCorreo: ControlGroup;
         formularioCorreo = new ControlGroup({
         destinatario: new Control('jreyes@sintelti.mx'),
         asunto: new Control('Resolución de nueva calificación de recurso de revisión'),
         idPlantillaCorreo: new Control('25'),
         entidad: new Control({
         UsuariosRoles: this.usuarioRol.id,
         RecursosRevision: this.entidadRecursoRevision.id})
         });
         let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
         this._enviarCorreo
         .postCorreoElectronico(
         jsonFormulario,
         this.erroresGuardado
         );*/
        this._router.navigate(['formacion-academica', 'solicitud-recurso-revision']);
        // this._spinner.stop();
      });
    });
  }

  // se envian los correos correspondientes Docencia,Profesores y alumno
  enviarResolucionCalificacion(): void {
    // correo Profesor
    this.registros.forEach((correoProfesor) => {

      let formularioCorreoProfesor: FormGroup;
      formularioCorreoProfesor = new FormGroup({
        destinatario: new FormControl(correoProfesor.profesor.usuario.email),
        asunto: new FormControl('Resolución de nueva calificación de recurso de revisión'),
        idPlantillaCorreo: new FormControl('25'),
        entidad: new FormControl({
          UsuariosRoles: this.usuarioRol.id,
          RecursosRevision: this.entidadRecursoRevision.id})
      });
      let jsonFormulario = JSON.stringify(formularioCorreoProfesor.value, null, 2);
      this._enviarCorreo
        .postCorreoElectronico(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(response => {

      });
    });
    // correo Docencia
    let formularioCorreoDocencia: FormGroup;
    formularioCorreoDocencia = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      asunto: new FormControl('Resolución de nueva calificación de recurso de revisión'),
      idPlantillaCorreo: new FormControl('25'),
      entidad: new FormControl({
        UsuariosRoles: this.usuarioRol.id,
        RecursosRevision: this.entidadRecursoRevision.id})
    });
    let jsonFormularioDocencia = JSON.stringify(formularioCorreoDocencia.value, null, 2);
    this._enviarCorreo
      .postCorreoElectronico(
        jsonFormularioDocencia,
        this.erroresGuardado
      ).subscribe(response => {

    });
    // correo Estudiante
    let formularioCorreoEstudiante: FormGroup;
    formularioCorreoEstudiante = new FormGroup({
      destinatario: new FormControl(this.entidadRecursoRevision.estudiante.usuario.email),
      asunto: new FormControl('Resolución de nueva calificación de recurso de revisión'),
      idPlantillaCorreo: new FormControl('25'),
      entidad: new FormControl({
        UsuariosRoles: this.usuarioRol.id,
        RecursosRevision: this.entidadRecursoRevision.id})
    });
    let jsonFormularioEstudiante = JSON.stringify(formularioCorreoEstudiante.value, null, 2);
    this._enviarCorreo
      .postCorreoElectronico(
        jsonFormularioEstudiante,
        this.erroresGuardado
      ).subscribe(response => {

    });
  }

  rowSeleccionado(registro): boolean {
    // //console.log(registro.id);
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.mostrarTabla();
  }

  rowSeleccion(registro): void {
    // console.log(registro.id);
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }
  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            // console.log('Error downloading the file.');
            this._spinner.stop('descargarArchivo');
          },
          () => {
            // console.info('OK');
            this._spinner.stop('descargarArchivo');
          }
        );
    }

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
  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }
  private prepareServices(): void {
    this.recursoRevisionService = this._catalogosService.getRecursoRevisionService();
    this._enviarCorreo = this._catalogosService.getEnvioCorreoElectronicoService();
  }

  /*******************************
   * INICIA MODAL DE CONFIRMACION*
   * *****************************
  */
  modalConfirmarResolucion(): void {
    if (this.validarFormulario()) {
      this.modalConfirmacionResolucion.open('lg');
    }
    // this._router.navigate(['ListaRecursoRevision']);
  }

  cerrarModalConfirmacion(): void {
    this.validacionActiva = false;
    this.modalConfirmacionResolucion.close();
  }
  /**********************************
   * TERMINA MODAL DE CONFIRMACION***
   * *******************************/

}
