import {Component, OnInit, Injector, ViewChild, NgZone, Inject} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {RecursoRevision} from '../../services/entidades/recurso-revision.model';
import {Router} from '@angular/router';
import {ItemSelects} from '../../services/core/item-select.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ConfigService} from '../../services/core/config.service';
import {NgUploaderOptions} from 'ngx-uploader/ngx-uploader';
import {ProgramaDocenteServices} from '../../services/entidades/programa-docente.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {ProfesorRevisionTrabajo} from '../../services/entidades/profesor-revision-trabajo.model';
import {ProfesorRevisionTrabajoService} from '../../services/entidades/profesor-revision-trabajo.service';

@Component({
  selector: 'app-solicitud-recurso-revision',
  templateUrl: './solicitud-recurso-revision.component.html',
  styleUrls: ['./solicitud-recurso-revision.component.css']
})
export class SolicitudRecursoRevisionComponent {

  @ViewChild('modalAtenderRecusoRev')
  modalAtenderRecusoRev: ModalComponent;
  @ViewChild('confirmarAtenderRR')
  confirmarAtenderRR: ModalComponent;
  @ViewChild('detalleRecursoRevision')
  detalleRecursoRevision: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  oculto: boolean;
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  vistaARegresar = 'ListaRecursoRevision';
  registros: Array<RecursoRevision> = [];
  estatusCatalogoService;
  recursoRevisionService;
  router: Router;
  usuarioRolService;
  programaDocenteService;
  promocionesService;
  periodoEscolarService;
  estudianteService;
  profesorResolverTrabajoService;
  listaProgramas: Array<ItemSelects> = [];
  listaPromociones: Array<ItemSelects> = [];
  programasDocentesSelect: Array<ItemSelects> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  programaSeleccionado: number;
  periodoSeleccionado: number;
  promocionSeleccionada: number;
  promocionPeriodoService;
  errores: Array<Object> = [];
  botonValido: boolean = false;
  usuarioRol: UsuarioRoles;
  columnas: Array<any> = [
    { titulo: 'Matrícula del estudiante', nombre: 'idProfesorMateria'},
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Clave de materia', nombre: 'idProfesorMateria'},
    { titulo: 'Profesor titular', nombre: 'idProfesorMateria'},
    { titulo: 'Materia', nombre: 'idProfesorMateria'},
    { titulo: 'Estatus', nombre: 'idEstatus'},
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,'
    + 'idEstudiante.idDatosPersonales.primerApellido,'
    + 'idEstudiante.idDatosPersonales.segundoApellido'/*
    + 'idMateria.idMateria.descripcion,'
    + 'idEstatus.valor,'
    + 'idMateria.idMateria.clave'*/}
  };
  registroSeleccionado: RecursoRevision;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  /* Variables modal confirmar atender recurso de revision
  *
  * */
  formularioConfirmar: FormGroup;
  registrosConfirmarAtender: Array<EstudianteMateriaImpartida> = [];

  columnasAtencionTrabjo: Array<any> = [
    { titulo: 'Profesor', nombre: 'idProfesor'},
    { titulo: 'Calificación', nombre: 'calificacionDefinitiva'},
    { titulo: 'Comentarios', nombre: 'comentariosEvaluacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  listaProfesoresAtencionTrabajo: Array<ProfesorRevisionTrabajo> = [];
  calificaciones: number = 0;

  constructor(@Inject(NgZone) private zone: NgZone,
              private injector: Injector,
              private _router: Router,
              private _programaDocenteService: ProgramaDocenteServices,
              private _catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              private _authService: AuthService,
              private _enviarCorreo: EnvioCorreoElectronicoService,
              private profesorRevisionTrabajoService: ProfesorRevisionTrabajoService) {
    this.prepareServices();
    this.inicilizarFormularioAtenderRR();
    this.inicializarOpcionesNgZone();
    this.router = _router;
  }

  prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.recursoRevisionService =
      this._catalogosService.getRecursoRevisionService();
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.promocionesService = this._catalogosService.getPromocion();
    this.periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this.promocionPeriodoService = this._catalogosService.getPromocionPeriodoEscolarService();
    this.profesorResolverTrabajoService =
      this._catalogosService.getProfesorRevisionTrabajoService();
    this.estudianteService = this._catalogosService.getEstudianteMateriaImpartidaService();
    let usuarioLogueado: UsuarioSesion = this._authService.getUsuarioLogueado();
    // console.log(usuarioLogueado);
    // console.log('Whole lotta love');
    this.recuperarPermisosUsuario(usuarioLogueado.id);
  }

  recuperarPermisosUsuario(id: number): void {
    // console.log(id);
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        //  console.log(response.json());
        response.json().lista.forEach((elemento) => {
         this.usuarioRol = new UsuarioRoles(elemento);
          // console.log(this.usuarioRol);
          //  console.log('Morrison Hotel');
          if (this.usuarioRol.rol.id == 1) {
            this.oculto = false;
            //   console.log('Morrison Hotel ::: FALSE');
          }
          if (this.usuarioRol.rol.id == 2) {
            this.oculto = true;
            //   console.log('Morrison Hotel ::: TRUE');
          }
          this.getProgramaDocente();
        });
      }, error => {

      },
      () => {
          this.onCambiosTabla();

      }
    );
  }

  getProgramaDocente(): void {
    //  console.log(this.oculto);
    // console.log('Break on thro');
    if (this.oculto) {
      this.programasDocentesSelect =
        this._programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
      let programaDocente = 'idProgramaDocente';
      this.listaProgramas.push(
        new ItemSelects (
          this.usuarioRol.usuario.programaDocente.id,
          this.usuarioRol.usuario.programaDocente.descripcion
        )
      );
    } else {
      this.listaProgramas = this.programaDocenteService
        .getSelectProgramaDocente(this.erroresConsultas);
    }

    this.programasDocentesSelect =
      this.estatusCatalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
  }

  listarPeriodos(idPromocion): void {
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    let urlSearch = new URLSearchParams();
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      urlSearch.set('criterios',
        'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
        ':IGUAL;AND');
      // urlSearch.set('ordenamiento', 'anio:DESC,mesInicio:ASC');
      this.promocionPeriodoService.getListaPromocionPeriodoEscolarPaginacion(this.errores,
        urlSearch).subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPeriodos.push(new PromocionPeriodoEscolar(item));
        });
      });
    }
  }

  listarPromociones(idPrograma): void {
    this.listaPromociones = [];
    this.promocionSeleccionada = null;
    let urlSearch = new URLSearchParams();
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL');
      this.listaPromociones = this.promocionesService
        .getSelectPromocion(this.errores, urlSearch);
    }
  }
  getIdPeriodo(idPeriodo): any {
    this.periodoSeleccionado = idPeriodo ? idPeriodo : null;
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  mostrarAtenderRecurso(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.valor === 'No atendido'
        && this._authService.hasRol('COORDINADOR')) {
        return true;
      }
    }else {
      return false;
    }
  }

  mostrarResolverRecurso(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.valor === 'Evaluado'
        && this._authService.hasRol('COORDINADOR')) {
        return true;
      }
    }else {
      return false;
    }
  }

  mostrarDetalle(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idPeriodoEscolar: number
  ): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = '';
    if (idProgramaDocente) {
      this.criteriosCabezera =
        'idMateria.idPromocion.idProgramaDocente.id~'
        + idProgramaDocente + ':IGUAL';
      if (idPromocion) {
        this.criteriosCabezera =
          this.criteriosCabezera + ';AND,idMateria.idPromocion.id~'
          + idPromocion + ':IGUAL';
      }
      if (idPeriodoEscolar) {
        this.criteriosCabezera
          = this.criteriosCabezera
          + ';AND,idMateria.idPeriodoEscolar.id~'
          + idPeriodoEscolar + ':IGUAL';
      }
    }else {
      if (idPeriodoEscolar) {
        this.criteriosCabezera =
          this.criteriosCabezera + 'idMateria.idPeriodoEscolar.id~'
          + idPeriodoEscolar + ':IGUAL';
        if (idPromocion) {
          this.criteriosCabezera =
            this.criteriosCabezera + ';AND,idMateria.idPromocion.id~'
            + idPromocion + ':IGUAL';
        }
      }
    }

    // console.log('idProgramaDocente', idProgramaDocente);
    // console.log('idPromocion', idPromocion);
    // console.log('idPeriodoEscolar', idPeriodoEscolar);

    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    let ordenamiento = '';

    if (!sessionStorage.getItem('recursoCriterios')) {
      if (this.criteriosCabezera !== '') {
        criterios = this.criteriosCabezera;
        urlSearch.set('criterios', criterios);
      } else {
        criterios = this.crearCriterioCabezeraInicio();
        urlSearch.set('criterios', criterios);
      }

      if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
        let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
        criterios = this.criteriosCabezera ? (criterios + ';ANDGROUPAND') : '';
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        // console.log('cirterios en el forEach: ' + criterios);
      });
      urlSearch.set('criterios', criterios);
    }
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');

      }
      });

      sessionStorage.setItem('recursoCriterios', criterios);
      sessionStorage.setItem('recursoOrdenamiento', ordenamiento);
      sessionStorage.setItem('recursoLimite', this.limite.toString());
      sessionStorage.setItem('recursoPagina', this.paginaActual.toString());
    }

    urlSearch.set('ordenamiento', sessionStorage.getItem('recursoOrdenamiento')
      ? sessionStorage.getItem('recursoOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('recursoLimite')
      ? sessionStorage.getItem('recursoLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('recursoPagina')
      ? sessionStorage.getItem('recursoPagina') : this.paginaActual.toString());
    urlSearch.set('criterios', sessionStorage.getItem('recursoCriterios')
      ? sessionStorage.getItem('recursoCriterios') : criterios);

    this._spinner.start('solicitudrecursorevision1');

    // console.log('crietrios', urlSearch);
    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<RecursoRevision>
    } = this.recursoRevisionService.getListaRecursoRevisionOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        for (let i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new RecursoRevision(item));
        });
      },
      error => {
        this._spinner.stop('solicitudrecursorevision1');
      },
      () => {
        this._spinner.stop('solicitudrecursorevision1');
      }
    );
  }

  crearCriterioCabezeraInicio(): string {
    let criterios = '';
    if (this.usuarioRol.rol.id === 2) {
      criterios = 'idMateria.idPromocion.idProgramaDocente.id~' +
        this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
    }
    return criterios;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    if (this.registros.length > 0 ) {
      this.limite = Number(limite);
      this.onCambiosTabla();
    }
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltro(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  sortChanged(columna): void {
    this.limpiarVariablesSession();
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
    this.paginaActual = evento.page;
    /*if (assertionsEnabled()) {
      // console.log('evento', evento);
      // console.log('Page changed to: ' + evento.page);
      // console.log('Number items per page: ' + evento.itemsPerPage);
      // console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  resolucionRecursoRevision(): void {
    if (this.rowSeleccionado) {
      this.router.navigate(['formacion-academica', 'resolucion-recurso-revision', // .parent.navigate(['ResolucionRecursoRevision',
        {id: this.registroSeleccionado.id,
          vistaSolicitante: false, vistaAnterior: this.vistaARegresar}]);

    }else {

    }
  }

  // modal atender recurso de revision

  /*
  * Variables modal atender
  * */

  uploadFile: any;
  /*options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: true,
    authToken: localStorage.getItem('token')
  };
  zone: NgZone;*/
  options: NgUploaderOptions;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  entidadRecursoRevision: RecursoRevision;
  entidadEstudiante: EstudianteMateriaImpartida;
  formularioAtenderRR: FormGroup;
  botonValidoModalAtender: boolean = false;
  validacionActiva: boolean = false;
  archivoNombre: string = '';

  inicilizarFormularioAtenderRR() {
    this.formularioAtenderRR = new FormGroup ({
      idArchivoInformeProfesor: new FormControl ('', Validators.required),
      nombreArchivo: new FormControl('', Validators.required),
      idEstatus: new FormControl (1224),
    });
  }

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      //  url: 'http:// ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['pdf'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  modalAtentederRercursoRevision(): void {
    this.limpiarVariablesAtender();
    this.obtenerEntidadRecursoRevision();
    this.modalAtenderRecusoRev.open('lg');

  }

  limpiarVariablesAtender() {
    this.validacionActiva = false;
    this.inicilizarFormularioAtenderRR();
    this.archivoNombre  = '';
    this.botonValidoModalAtender = false;
  }

  closeModalAtenderRecursoRev() {
    this.limpiarVariablesAtender();
    this.modalAtenderRecusoRev.close();
  }

  obtenerEntidadRecursoRevision(): void {
    this._spinner.start('obtenerEntidadRecursoRevision');
    this.recursoRevisionService
      .getEntidadRecursoRevision(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadRecursoRevision = new RecursoRevision(response.json());
        // console.log(this.entidadRecursoRevision);
      },
      error => {
        this._spinner.stop('obtenerEntidadRecursoRevision');
      },
      () => {

        this._spinner.stop('obtenerEntidadRecursoRevision');
      }
    );
  }

  validarFormularioAtender(): boolean {
    if (this.formularioAtenderRR.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormularioAtender(): void {
    if (this.validarFormularioAtender()) {
      let jsonFormulario = JSON.stringify(this.formularioAtenderRR.value, null, 2);
      // console.log(jsonFormulario);
      this.recursoRevisionService
        .putRecursoRevision(
          this.registroSeleccionado.id,
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
        response => {},
        error => {
          console.error(error);
        },
        () => {
          this.closeModalAtenderRecursoRev();
        }
      );

    } else {
      // alert('error en el formulario');
    }
  }

  handleBasicUpload(data, numero: number): void {
    if (numero === 1) {
      this.botonValidoModalAtender = true;
    }else {
      this.botonValidoModalAtender = false;
    }
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.archivoNombre = responseJson.originalName;
        (<FormControl>this.formularioAtenderRR.controls['idArchivoInformeProfesor'])
          .patchValue(responseJson.id);
        (<FormControl>this.formularioAtenderRR.controls['nombreArchivo'])
          .patchValue(responseJson.originalName);
        // console.log(responseJson.id);
        // console.log(responseJson.originalName);
      }
    });
  }
  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }
  handleDropUpload(data, numero: number): void {
    if (numero === 1) {
      this.botonValidoModalAtender = true;
    }else {
      this.botonValidoModalAtender = false;
    }
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
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

  private getControlErrorsAtenderRR(campo: string): boolean {
    if (!(<FormControl>this.formularioAtenderRR.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  /*modalConfirmarAtenderRecursoRevision(): void {
    if (this.validarFormulario()) {
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('sm', true, 27);
      let modalConfirmacionData = new ModalConfirmarAtenderRecursoRevisionData(
        this,
        this.entidadRecursoRevision.profesor.id,
        this.entidadRecursoRevision.profesor.email,
        this.context.idRecursoRevision,
        this.context.idEstudiante,
        this.context.idPromocion,
        this.context.idPeriodoActual
      );

      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalConfirmacionData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalConfirmarAtenderRecursoRevision,
        bindings,
        modalConfig
      );
    }
  }*/

  inicializarFormularioConfirmarAtenderRR() {
    this.formularioConfirmar = new FormGroup({
      idEstatus: new FormControl('1224'),
      idProfesor: new FormControl(),
      // this.entidadRecursoRevision.profesor.email
      idRecursoRevision: new FormControl(),
      // this.registroSeleccionado.id
    });
  }

  modalConfirmarAtenderRecursoRevision() {
    if (this.validarFormularioAtender()) {
      // this.closeModalAtenderRecursoRev();
      this.confirmarAtenderRR.open('sm');
    }
  }

  closeConfirmarAtenderRR() {
    this.confirmarAtenderRR.close();
  }

  guardar(): void {
    this.enviarFormularioAtender();
    this.enviarFormularioConfirmarAtender();
    this.closeConfirmarAtenderRR();
  }

  enviarProfesores(id: number): void {
    this._spinner.start('enviarProfesores');
    // this.formularioConfirmar.exclude('idProfesor');
    // this.formularioConfirmar.addControl('idProfesor', new FormControl(id));
    // this.formularioConfirmar.include('idProfesor');
    (<FormControl>this.formularioConfirmar.controls['idProfesor'])
      .patchValue(id);
    (<FormControl>this.formularioConfirmar.controls['idRecursoRevision'])
      .patchValue(this.registroSeleccionado.id);
    let json = JSON.stringify(this.formularioConfirmar.value, null, 2);
    console.log('formulari opara profesorevisonTrabajo', json);
    this.profesorResolverTrabajoService.
    postProfesorRevisionTrabajo(
      json,
      this.erroresConsultas
    ).subscribe(
      response => {},
      error => {
        this._spinner.stop('enviarProfesores');
      },
      () => {
        this._spinner.stop('enviarProfesores');
        this.closeModalAtenderRecursoRev();
        this.closeConfirmarAtenderRR();
      }
    );
  }

  enviarFormularioConfirmarAtender(): void {
    this.limpiarVariablesSession();
    // this._spinner.start('enviarFormularioConfirmarAtender');
    /*Se inicializa nuevamente para limpiar formulario de formularioConfirmar*/
    this.inicializarFormularioConfirmarAtenderRR();
    /*TODO pendiente la funcionalidad de guardar*/
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idEstudiante~' + this.registroSeleccionado.estudiante.id + ':IGUAL;AND,' +
      'idMateriaImpartida.idPromocion.id~' +
      this.registroSeleccionado.estudiante.promocion.id + ':IGUAL;AND,' +
      'idMateriaImpartida.idPeriodoEscolar~' +
      this.registroSeleccionado.estudiante.periodoActual.id + ':IGUAL;AND';
    urlSearch.set('criterios', criterios);
    let listaProfesoresRevision: Array<number> = [];
    let idProfesorEnviarInvitacionRecurso;
    let emailProfesorEnviarInvitacionRecurso;
    this.estudianteService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        console.log(response.json());
        let paginacionInfoJson = response.json();
        this.registrosConfirmarAtender = [];
        let numeroRegistro = 0;

        /*TODO Se agrega validación para agregar un solo profesor, evitando que se repitan cuando imparten mas de una materia */
        paginacionInfoJson.lista.forEach((item) => {
          let flag = false;
          this.registrosConfirmarAtender.push(new EstudianteMateriaImpartida(item));
          console.log(this.registrosConfirmarAtender[numeroRegistro]);
          console.log('Contador de registrso', numeroRegistro);
          if (listaProfesoresRevision.length > 0) {
            listaProfesoresRevision.forEach((id) => {
              if (!flag) {
                if (this.registrosConfirmarAtender[numeroRegistro].
                    materiaImpartida.materia.tipoMateria.id === 3) {
                  flag = (id == this.registrosConfirmarAtender[numeroRegistro]
                    .estudiante.tutor.profesor.id);
                } else {
                  flag = (id == this.registrosConfirmarAtender[numeroRegistro].
                  materiaImpartida.getIdProfesorTitular());
                }
              }
            });

            if (!flag) {
              console.log('Profesor no repetido si entra');
              listaProfesoresRevision.push(idProfesorEnviarInvitacionRecurso);
              if (this.registrosConfirmarAtender[numeroRegistro].
                  materiaImpartida.materia.tipoMateria.id === 3) {
                listaProfesoresRevision.push(this.registrosConfirmarAtender[numeroRegistro]
                  .estudiante.tutor.profesor.id);
                this.enviarProfesores(this.registrosConfirmarAtender[numeroRegistro]
                  .estudiante.tutor.profesor.id);
                console.log('ID-------------', this.registrosConfirmarAtender[numeroRegistro]
                  .estudiante.tutor.profesor.id);
                console.log('EMAIL --- ', this.registrosConfirmarAtender[numeroRegistro]
                  .estudiante.tutor.profesor.usuario.email);

                this.enviarCorreoAceptado(this.registrosConfirmarAtender[numeroRegistro].
                  estudiante.tutor.profesor.usuario.email);
              } else {
                listaProfesoresRevision.push(this.registrosConfirmarAtender[numeroRegistro].
                materiaImpartida.getIdProfesorTitular());
                console.log ('id ------------', this.registrosConfirmarAtender[numeroRegistro].
                materiaImpartida.getIdProfesorTitular());
                console.log(this.registrosConfirmarAtender[numeroRegistro].
                materiaImpartida.getCorreoProfesorTitular());

                this.enviarProfesores(this.registrosConfirmarAtender[numeroRegistro].
                materiaImpartida.getIdProfesorTitular());
                this.enviarCorreoAceptado(this.registrosConfirmarAtender[numeroRegistro].
                materiaImpartida.getCorreoProfesorTitular());
              }
            }
          }else {

            if (this.registrosConfirmarAtender[numeroRegistro].
                materiaImpartida.materia.tipoMateria.id === 3) {
              listaProfesoresRevision.push(this.registrosConfirmarAtender[numeroRegistro]
                .estudiante.tutor.profesor.id);
              console.log('ID-------------', this.registrosConfirmarAtender[numeroRegistro]
                .estudiante.tutor.profesor.id);
              console.log('EMAIL --- ', this.registrosConfirmarAtender[numeroRegistro]
                .estudiante.tutor.profesor.usuario.email);
              this.enviarProfesores(this.registrosConfirmarAtender[numeroRegistro]
                .estudiante.tutor.profesor.id);

              this.enviarCorreoAceptado(this.registrosConfirmarAtender[numeroRegistro].
                estudiante.tutor.profesor.usuario.email);
            } else {
              listaProfesoresRevision.push(this.registrosConfirmarAtender[numeroRegistro].
              materiaImpartida.getIdProfesorTitular());

              console.log ('id ------------', this.registrosConfirmarAtender[numeroRegistro].
              materiaImpartida.getIdProfesorTitular());
              console.log(this.registrosConfirmarAtender[numeroRegistro].
              materiaImpartida.getCorreoProfesorTitular());

              this.enviarProfesores(this.registrosConfirmarAtender[numeroRegistro].
              materiaImpartida.getIdProfesorTitular());
              this.enviarCorreoAceptado(this.registrosConfirmarAtender[numeroRegistro].
              materiaImpartida.getCorreoProfesorTitular());
            }

          }
          numeroRegistro++;
        });
        // // console.log('43hubo Cali incompelto:: ' + this.registros[0].huboCalifIncompleta);
      },
      error => {
        console.error(error);
        // this._spinner.stop('enviarFormularioConfirmarAtender');
      },
      () => {
        this.onCambiosTabla();
        // this._spinner.stop('enviarFormularioConfirmarAtender');
      }
    );
  }

  enviarCorreoAceptado(correo): void {
    // this._spinner.start('enviarCorreoAceptado');
    let formularioCorreo: FormGroup;
    /*formularioCorreo = new ControlGroup({
     destinatario: new Control(correo),
     asunto: new Control('Solicitud de interprograma aceptada'),
     cuerpo: new Control('Lorem ipsum dolor sit amet, ')
     });*/
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(correo),
      asunto: new FormControl('Solicitud de recurso de revisión'),
      idPlantillaCorreo: new FormControl(43),
      entidad: new FormControl({estudiantes: this.registroSeleccionado.estudiante.id})
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._enviarCorreo.postCorreoElectronico(
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {

      },
      error => {
        console.error(error);
        // this._spinner.stop('enviarCorreoAceptado');
      },
      () => {
        // this._spinner.stop('enviarCorreoAceptado');

      }
    );
  }

  /*
  * Model detalle de recurso de revision
  *
  * */

  modalDetalleRecursoRevision() {
    this.getListEvaluadores();
    this.listaProfesoresAtencionTrabajo = [];
    this.obtenerEntidadRecursoRevision();
    this.detalleRecursoRevision.open('lg');
  }

  closeModalDetalle() {
    this.detalleRecursoRevision.close();
  }

 limpiarVariablesSession() {
   sessionStorage.removeItem('recursoCriterios');
   sessionStorage.removeItem('recursoOrdenamiento');
   sessionStorage.removeItem('recursoLimite');
   sessionStorage.removeItem('recursoPagina');
 }

  getListEvaluadores(): void {
    this.calificaciones = 0;
    let totalEvaluadores: number = 0;
    this._spinner.start('data');
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idRecursoRevision.id~' + this.registroSeleccionado.id + ':IGUAL');
    this.profesorRevisionTrabajoService.getListaProfesorRevisionTrabajo(
      this.erroresConsultas, urlSearch).
    subscribe(
      response => {
        response.json().lista.forEach((item) => {
          totalEvaluadores ++;
          if (item) {
            if (item.calificacion_definitiva) {
              this.calificaciones += item.calificacion_definitiva;
            }

            this.listaProfesoresAtencionTrabajo.push(new ProfesorRevisionTrabajo(item));
          }

        });

        this.calificaciones = Math.round(this.calificaciones / totalEvaluadores);
      }
    );
    this._spinner.stop('data');
  }

}
