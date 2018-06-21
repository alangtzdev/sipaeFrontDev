import {Component, OnInit, Renderer, Injector, ElementRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Validacion} from "../../utils/Validacion";
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';
import {EstudianteService} from '../../services/entidades/estudiante.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {TutorService} from '../../services/entidades/tutor.service';
import {EstudianteTutorService} from '../../services/entidades/estudiante-tutor.service';
import {IntegranteLgacService} from '../../services/entidades/integrante-lgac.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {EstudianteTutor} from '../../services/entidades/estudiante-tutor.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {Lgac} from '../../services/entidades/lgac.model';
@Component({
  selector: 'app-asignar-tutor-director',
  templateUrl: './asignar-tutor-director.component.html',
  styleUrls: ['./asignar-tutor-director.component.css']
})
export class AsignarTutorDirectorComponent {

  @ViewChild('modalDetalleAsignarTutorDirector')
  modalDetalleAsignarTutorDirector: ModalComponent;
  @ViewChild('modalAsignarDirectorLic')
  modalAsignarDirectorLic: ModalComponent;
  @ViewChild('modalEditarDirector')
  modalEditarDirector: ModalComponent;
  @ViewChild('modalEditarTutor')
  modalEditarTutor: ModalComponent;
  @ViewChild('modalAgregarTutor')
  modalAgregarTutor: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  exportarExcelUrl = '';
  exportarPDFUrl = '';
  criteriosCabezera: string = '';
  auxiliar: boolean = false;
  router: Router;
  botonValido: boolean = false;
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Estudiante> = [];
  oculto: boolean;
  usuarioRol: UsuarioRoles;
  listaProgramas: Array<ItemSelects> = [];


  columnas: Array<any> = [
      { titulo: 'Nombre del estudiante*',
          nombre: 'idDatosPersonales.primerApellido,idDatosPersonales.segundoApellido,' +
          'idDatosPersonales.nombre', sort: 'asc'},
      { titulo: 'Título de proyecto de investigación/Tesis',
          nombre: 'idTutor.nombreTrabajo', sort: false},
      { titulo: 'Fecha de asignación', nombre: 'idTutor.fechaAsignacion' },
      { titulo: 'Tutor/Director*', nombre: 'idTutor.idProfesor.primerApellido', sort: false},
  ];
  registroSeleccionado: Estudiante;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idDatosPersonales.nombre,idDatosPersonales.primerApellido,' +
            'idDatosPersonales.segundoApellido,idTutor.idProfesor.primerApellido,' +
            'idTutor.idProfesor.segundoApellido,idTutor.idProfesor.nombre'
    }
  };

  //  para validacion del formulario
  mensajeErrors: any = { 'required': 'Este campo es requerido'};
  validacionActiva: boolean = false;
  //  datos 'simulados' para los combo
  opcionesSelectProgramaDocente: Array<ItemSelects>;
  opcionesSelectPromocion: Array<ItemSelects>;
  estatusCatalogoService;
  formularioAsignacionDirector: FormGroup;
  idPromocionSeleccionada;
  private exportarFormato = '';
  private erroresConsultas: Array<ErrorCatalogo> = [];

  //  variables para modal detalle // /
  private idregistroEstudianteDetalle: number;
  private entidadDetalleEstudiante: Estudiante;
  private nombreEstudianteDetalle: string = ''
  private matriculaDetalle: string = '';
  private registroDetalle: EstudianteTutor;
  private proyectoInvestigacion: string = '';
  private tutor: string = '';
  private tipoTesis: string = '';
  private tituloTesis: string = '';
  private directorTesis: string = '';
  private coDirectorTesis: string = '';
  private matricula: string = '';
  private registro: EstudianteTutor;
  //  private entidadDetalleEstudiante: Estudiante;
  private entidadEstudianteTutor: EstudianteTutor;
  private entidadEstudiantedirector: EstudianteTutor;
  private entidadEstudianteCodirector: EstudianteTutor;
  //  fin de variables para modal detalle // /

  // variables para modal agregar - editar  //
  private formularioDirector: FormGroup;
  private formularioCodirector: FormGroup;
  private idEstudianteAgregar: number;
  private fa: Date = new Date();
  private obtenerCodirector: number = 0;
  private obtenerNombreTrabajo: string = '';
  private opcionesSelectProfesores: Array<Profesor>;
  private opcionesSelectProfsCodir: Array<Profesor>;
  //private registroSeleccionadoAgregarDirector: Tutor;
  private auxiliarAgregarDirector: boolean = false;
  private botonValidoAgregarDirector: boolean = false;
  private validacionActivaAgregarDirector: boolean = false;
  // fin de variables para modal agregar - editar  //
  /// Inicia variables para modal de edidtar ///
  idProgramaDocenteEstudiante: number;
  idLgacActual: number = 0;
  idEstudianteEditar: number;
  idCodirector: number;
  formularioTutor: FormGroup;
  validacionActivaEditarDirector: boolean = false;
  private opcionesSelelectLgac: Array<Lgac>;
  /// Fin de variables para modal de editar ///
  /// Inicia variables para modal editar tutor ///
  formularioEditarTutor: FormGroup;
  botonValidoEditarTutor: boolean = false;
  // fin de variables para modal editar tutor ///
  //// variables para modal agregar tutor ///
  formularioAgregarTutor: FormGroup;
  botonValidoAgregarTutor: boolean = false;
    dt: Date = new Date();

  //// fin de variables para modal agregar tutor ////

  private erroresGuardado: Array<ErrorCatalogo> = [];
  constructor(// private modal: Modal,
              private estudianteService: EstudianteService,
              private usuarioRolService: UsuarioRolService,
              private tutorService: TutorService,
              private estudianteTutorService: EstudianteTutorService,
              private tutorLGAC: IntegranteLgacService,
              private authService: AuthService,
              private elementRef: ElementRef, params: Router,
              private injector: Injector,
              private _router: Router,
              private _catalogosService: CatalogosServices,
              private _spinner: SpinnerService) {
    // let usuarioLogueado: UsuarioSesion = new AuthService();
    moment.locale('es');
    let usuarioLogueado: UsuarioSesion = this.authService.getUsuarioLogueado();
     //('UsuarioLogeado', usuarioLogueado);
    this.inicializarFormularioAgregarEditar();
    this.inicializarFormularioCoodierector();
    this.inicializarFormularioEditarDirector();
    this.inicializaFormularioTutorEdiccion();
    this.inicializarFormularioAgregarTutor();
    this.prepareServices();
    this.obtenerCatalogo();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.router = _router;

    if (sessionStorage.getItem('asignarIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('asignarCriterios')) {
      this.onCambiosTabla();
    }
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          if (this.usuarioRol.rol.id == 1) {
            this.oculto = false;
          }
          if (this.usuarioRol.rol.id == 2) {
            this.oculto = true;
          }
          this.getProgramaDocente();
        });
      }
    );
  }
  mostrarBotonDirector(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.tutor.profesor) {
        if (this.registroSeleccionado.tutor.profesor.id &&
          this.registroSeleccionado.tutor.tipo.id === 1) {
          return true;
        } else {
          return false;
        }
      }else {
        return false;
      }
    }else {
      return false;
    }
  }

  mostrarBotonTutor(): boolean {
    if (this.registroSeleccionado) {
      if (!this.registroSeleccionado.tutor.profesor) {
        return true;
      } else {
        return false;
      }
    }else {
      return false;
    }
  }
  mostrarBotoneditar(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.tutor.profesor) {
        if (this.registroSeleccionado.tutor.profesor.id) {
          return true;
        }else {
          return false;
        }
      }else {
        return false;
      }
    }else {
      return false;
    }
  }
  mostrarFormato(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.tutor.tipo) {
        if (this.registroSeleccionado.tutor.tipo.id === 2) {
          return true;
        }
      }else {
        return false;
      }
    }else {
      return false;
    }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
     ('idProgramaDocente', idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion = this.estatusCatalogoService.getPromocion().
    getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
  this.limpiarVariablesSession(); 
    this.idPromocionSeleccionada = idPromocion;
    if (idPromocion) {
      this.criteriosCabezera = 'idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    //this._spinner.start('asignartutordirector1');
    sessionStorage.setItem('asignarIdPromocion', idPromocion.toString());
    this.onCambiosTabla();
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  cambiarAuxiliar(valor): any {
    if (valor) {
      this.auxiliar = true;
    }else {
      this.auxiliar = false;
    }
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    let ordenamiento = '';

    if (!sessionStorage.getItem('asignarCriterios')) {

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera + ';ANDGROUPAND,idEstatus~1006:IGUAL;OR,'
      + 'idEstatus~1107:IGUAL;OR';
      urlSearch.set('criterios', criterios);
      // criterios = '';
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtrosCriterio: Array<string> = this.configuracion.filtrado.textoFiltro.split(' ');
      let filtros: Array<string> = [];
      if (filtrosCriterio.length >= 1 && criterios != '')
        criterios = criterios + ';ANDGROUPAND';
      if (filtrosCriterio.length >= 1) {
        filtros = this.configuracion.filtrado.columnas.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[0] + ':LIKE;OR';
        });
        if (filtrosCriterio.length >= 2) {
          filtros = this.configuracion.filtrado.columnas.split(',');
          filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
              filtrosCriterio[1] + ':LIKE;OR';
          });
        }
        if (filtrosCriterio.length >= 3) {
          filtros = this.configuracion.filtrado.columnas.split(',');
          filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
              filtrosCriterio[2] + ':LIKE;OR';
          });
        }
      }
/*      if (assertionsEnabled()) {
        // console.log('criterios de columnas' + criterios);
      }*/
      urlSearch.set('criterios', criterios);
    }
    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    sessionStorage.setItem('asignarCriterios', criterios);
    sessionStorage.setItem('asignarOrdenamiento', ordenamiento);
    sessionStorage.setItem('asignarLimite', this.limite.toString());
    sessionStorage.setItem('asignarPagina', this.paginaActual.toString());
    }
    
    this.limite = +sessionStorage.getItem('asignarLimite') ? +sessionStorage.getItem('asignarLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('asignarPagina') ? +sessionStorage.getItem('asignarPagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('asignarCriterios')
    ? sessionStorage.getItem('asignarCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('asignarOrdenamiento') ? sessionStorage.getItem('asignarOrdenamiento') : ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    //console.log('urlSearach', urlSearch);
    this._spinner.start('asignartutordirector1');
    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<Estudiante>
    } = this.estudianteService.getListaEstudianteOpcional(
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
          this.registros.push(new Estudiante(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('asignartutordirector1');
      },
      () => {
        //console.log('registros', this.registros);
/*        if (assertionsEnabled()) {
          // console.log('paginacionInfo', this.paginacion);
          // console.log('registros', this.registros);
        }*/
        this.registroSeleccionado = null;
        this._spinner.stop('asignartutordirector1');
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this._spinner.start('asignartutordirector2');
    this.limite = Number(limite);
    this.onCambiosTabla();
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
    this._spinner.start('asignartutordirector3');
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  sortChanged(columna): void {
//  this.limpiarVariablesSession();
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      //this._spinner.start('asignartutordirector4');
      this.onCambiosTabla();
    }
  }

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
    this.paginaActual = evento.page;
  /*  if (assertionsEnabled()) {
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

/*  modalDetalles(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let modalDetallesData = new ModalDetalleTutorData(
        this,
        this.registroSeleccionado.id
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleTutor,
        bindings,
        modalConfig
      );
    }else {
      // alert('Seleccione un solicitante');
    }
  }

  modalAsignarDirector(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idListaTutor = this.registroSeleccionado.id;
      let modalAsignarData = new ModalAsignarDirectorLicenciaturaData(
        this,
        this.registroSeleccionado.id
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, {useValue: modalAsignarData}),
        provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
        provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
      ]);

      dialog = this.modal.open(
        <any>ModalAsignarDirectorLicenciatura,
        bindings,
        modalConfig
      );
    }else {
      // alert('Seleccione un solicitante');
    }
  }

  modalAsignarTutor(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idListaEstudiante = this.registroSeleccionado.id;
      let modalAsignarData = new ModalAsignarTutorData(
        this,
        idListaEstudiante
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalAsignarData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalAsignarTutor,
        bindings,
        modalConfig
      );
    }else {
      // alert('Seleccione un solicitante');
    }
  }

  modalEditar(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.tutor.tipo.valor === 'Director') {
        let idListaTutor = this.registroSeleccionado.id;
        let modalEditarData = new ModalEditarDirectorData(
          this,
          idListaTutor
        );
        let bindings = Injector.resolve([
          provide(ICustomModal, {useValue: modalEditarData}),
          provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
          provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
        ]);

        dialog = this.modal.open(
          <any>ModalEditarDirector,
          bindings,
          modalConfig
        );
      }

      if (this.registroSeleccionado.tutor.tipo.valor === 'Tutor') {
        let idListaTutor = this.registroSeleccionado.id;
        let modalEditarData = new ModalEditarTutorData(
          this,
          idListaTutor
        );
        let bindings = Injector.resolve([
          provide(ICustomModal, {useValue: modalEditarData}),
          provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
          provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
        ]);

        dialog = this.modal.open(
          <any>ModalEditarTutor,
          bindings,
          modalConfig
        );
      }
    }else {
      // alert('Seleccione un solicitante');
    }
  }*/

  exportar(tipo): void {
    let urlExportListaPDF;
    this.estudianteTutorService.getListaTutoresPDFExcel(
      this.idPromocionSeleccionada,
      tipo,
      this.erroresConsultas
    ).subscribe(
      response => {
        urlExportListaPDF = response.json();
        // console.log(urlExportListaAsistenciaPDF);
      },
      error => {
      },
      () => {
        window.open(urlExportListaPDF);

      }
    );
  }
  descargarSolicitud(): void {
    this._spinner.start('asignartutordirector5');
    this.estudianteService.getFormatoPdf(
      this.registroSeleccionado.id,
      this.erroresConsultas,
      'AsignacionTutor',
      ''
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
        this._spinner.stop('asignartutordirector5');
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop('asignartutordirector5');
      }
    );
  }

  // Ocultar botones
  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }
  desabilitarCampos(): boolean {
    if (this.registros.length > 0) {
      return false;
    }else if (this.registros.length === 0 && this.configuracion.filtrado.textoFiltro === '') {
      return true;
    }
  }

  private getProgramaDocente(): void {
    if (this.oculto) {
      this.listaProgramas.push(
        new ItemSelects (
          this.usuarioRol.usuario.programaDocente.id,
          this.usuarioRol.usuario.programaDocente.descripcion
        )
      );
    } else {
      this.listaProgramas = this._catalogosService.
      getCatalogoProgramaDocente()
        .getSelectProgramaDocente(this.erroresConsultas);
    }
  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
  }

  private obtenerCatalogo(): void {
    // let urlParameter: URLSearchParams = new URLSearchParams();
    // urlParameter.set('criterios', 'idNivelEstudios~' + 1  + ':IGUAL');
    this.opcionesSelectProgramaDocente =
      this.estatusCatalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
  }

  // / Seccion de funcionalidad para modal Detalle // /
  modalDetalles() {
    if (this.registroSeleccionado) {
      this.idregistroEstudianteDetalle = this.registroSeleccionado.id;
      this.modalDetalleAsignarTutorDirector.open('lg');
      this.obtenerEntidadEstudianteDetalle();
      this.getInformacionTutor();
    }
  }

  cerrarModalDetalleTutorDirector(): void {
    this.modalDetalleAsignarTutorDirector.close();
    this.limpiarVariablesModalDetalle();
  }

  private obtenerEntidadEstudianteDetalle(): void {
      this.estudianteService
          .getEntidadEstudiante(
              this.idregistroEstudianteDetalle,
              this.erroresConsultas
          ).subscribe(
          response => {
              this.entidadDetalleEstudiante
                  = new Estudiante(response.json());
          },
          error => {},
          () => {
              this.nombreEstudianteDetalle = this.entidadDetalleEstudiante.getNombreCompleto();
              this.matriculaDetalle = this.entidadDetalleEstudiante.matricula.matriculaCompleta;
          }
      );
  }

  private getInformacionTutor(): void {
      this._spinner.start('buscarInformacion');
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idEstudiante.id~' + this.idregistroEstudianteDetalle + ':IGUAL');
        this.estudianteTutorService.getListaEstudianteTutor(
            this.erroresConsultas,
            urlParameter
        ).subscribe(
            response => {
                let respuesta = response.json();
                // console.log(response.json().lista);
                respuesta.lista.forEach((item) => {
                  this.registroDetalle = new EstudianteTutor(item);
                  // console.log(this.registro);
                   if (this.registroDetalle.tutor.tipo.id == 1) {
                        this.entidadEstudianteTutor = new EstudianteTutor(item);
                        // console.log(this.entidadEstudianteTutor);
                        this.proyectoInvestigacion =
                        this.entidadEstudianteTutor.tutor.nombreTrabajo;
                        this.tutor = this.entidadEstudianteTutor.tutor.profesor.getNombreCompleto();
                        //  this.tipoTesis = registro.tipoTesis.valor;
                    }
                    if (this.registroDetalle.tutor.tipo.id == 2) {
                      this.entidadEstudiantedirector = new EstudianteTutor(item);
                        this.tipoTesis = this.entidadEstudiantedirector.tutor.tipoTesis.valor;
                        this.tituloTesis = this.entidadEstudiantedirector.tutor.nombreTrabajo;
                        this.directorTesis =
                        this.entidadEstudiantedirector.tutor.profesor.getNombreCompleto();
                    }
                    if (this.registroDetalle.tutor.tipo.id == 3) {
                      this.entidadEstudianteCodirector = new EstudianteTutor(item);
                        this.coDirectorTesis =
                        this.entidadEstudianteCodirector.tutor.profesor.getNombreCompleto();
                    }
                });
                this._spinner.stop('buscarInformacion');
        });

  }

  private limpiarVariablesModalDetalle(): void {
    this.idregistroEstudianteDetalle = undefined;
    this.entidadDetalleEstudiante = undefined;
    this.nombreEstudianteDetalle = undefined;
    this.matriculaDetalle = undefined;
    this.registroDetalle = undefined;
    this.proyectoInvestigacion = undefined;
    this.tutor = undefined;
    this.tipoTesis = undefined;
    this.tituloTesis = undefined;
    this.directorTesis = undefined;
    this.coDirectorTesis = undefined;
    this.matricula = undefined;
    this.registro = undefined;
    this.entidadEstudianteTutor = undefined;
    this.entidadEstudiantedirector = undefined;
    this.entidadEstudianteCodirector = undefined;
  }
  // / fin de seccion de funcionalidad para modal Detalle ///

  // Inicio de modal de agregar director ///
  modalAsignarDirector(): void {
    if (this.registroSeleccionado) {
      this.dt = new Date();
      //this.inicializarFormularioCoodierector();
      this.limpiarFormularioCodirector();
      this.getControlCoodirectorAgregar('idProfesor').disable();
      //console.log('formularioDirector', this.formularioDirector);
      //console.log('formularioCodirector', this.formularioCodirector);
      this.idEstudianteAgregar = this.registroSeleccionado.id;
      this.obtenerCatalogoAgregar();
      this.obtenerRegistroAgregar();
      this.reiniciarSelectDirectorAgregar();
      this.getControlCoodirectorAgregar('fechaAsignacion')
      this.auxiliarAgregarDirector = false;
      this.getControlCoodirectorAgregar('fechaAsignacion').patchValue(this.registroSeleccionado.tutor.fechaAsignacion);
    if (this.registroSeleccionado.tutor.fechaAsignacion){
  let fechaRecuperar = moment(this.registroSeleccionado.tutor.fechaAsignacion);
      this.dt = new Date(fechaRecuperar.toJSON());
      this.modalAsignarDirectorLic.open('lg');}
   else{this.dt= new Date();}


    }
  }

  cerrarModalAsignarDirector(): void {
    this.modalAsignarDirectorLic.close();
    //this.inicializarFormularioCoodierector();
    this.reiniciarFormuarioDirector();
    this.opcionesSelectProfsCodir = [];
    this.opcionesSelectProfesores = [];
    this.obtenerCodirector = undefined;
  }

  private inicializarFormularioAgregarEditar(): void {
    this.formularioDirector = new FormGroup({
      idProfesor: new FormControl(53),
      nombreTrabajo: new FormControl('', Validators.required),
      calificacion: new FormControl(''),
      idLgac: new FormControl(''),
      idTipoTesis: new FormControl(2),
      idTipo: new FormControl(2),
      fechaAsignacion: new FormControl('')
    });
  }

  private inicializarFormularioCoodierector(): void {
    //this.obtenerNombreTrabajo = this.getControl('nombreTrabajo').value;
      this.formularioCodirector = new FormGroup({
        idProfesor: new FormControl(''),
        nombreTrabajo: new FormControl(''),
        calificacion: new FormControl(''),
        idLgac: new FormControl(''),
        idTipoTesis: new FormControl(2),
        idTipo: new FormControl(3),
        fechaAsignacion: new FormControl(this.getFechaAsignacion() + ' 10:00am')
        //idEstudiante: new Control('')
    });
  }

  private reiniciarSelectDirectorAgregar(): void {
    this.getControl('idProfesor').disable();
    this.getControl('idProfesor').patchValue('');
    this.getControlCoodirectorAgregar('idProfesor').disable();
    this.getControlCoodirectorAgregar('idProfesor').patchValue('');
  }

  private limpiarFormularioCodirector(): void {
    this.getControlCoodirectorAgregar('idProfesor').patchValue('');
    this.getControlCoodirectorAgregar('nombreTrabajo').patchValue('');
  }

  

  private obtenerRegistroAgregar(): void {
    this.entidadDetalleEstudiante = this.registroSeleccionado;
    /*
    this.estudianteService
    .getEntidadEstudiante(
        this.idEstudianteAgregar,
        this.erroresConsultas
    ).subscribe(
      response => {
          this.entidadDetalleEstudiante
                = new Estudiante(response.json());
      },
      error => {
          console.error(error);
          console.error(this.erroresConsultas);
      },
      () => {

      }
    );*/
  }

  getFechaAsignacion(): string {
      if (this.dt) {
          let fechaFormato = moment(this.dt).format('DD/MM/YYYY');
          (<FormControl>this.formularioDirector.controls['fechaAsignacion'])
              .patchValue(fechaFormato + ' 10:30am');
          return fechaFormato;
      } else {
          return moment(new Date()).format('DD/MM/YYYY');
      }
  }

  getFechaAsignacionTutor(): string {
      if (this.dt) {
          let fechaFormato = moment(this.dt).format('DD/MM/YYYY');
          (<FormControl>this.formularioTutor.controls['fechaAsignacion'])
              .patchValue(fechaFormato + ' 10:30am');
          return fechaFormato;
      } else {
          return moment(new Date()).format('DD/MM/YYYY');
      }
  }

  private activarBotonAsignar(numero: number): any {
    if (numero === 1) {
        this.botonValidoAgregarDirector = false;
    }else {
        this.botonValidoAgregarDirector = true;
    }
  }

  private cambiarAuxiliarAgregar(valor): any {
    if (valor) {
        this.auxiliarAgregarDirector = true;
        this.botonValidoAgregarDirector = true;
        this.getControl('idProfesor').enable();
        this.getControlCoodirectorAgregar('idProfesor').enable();
    }else {
        this.auxiliarAgregarDirector = false;
        this.botonValidoAgregarDirector = false;
        this.getControl('idProfesor').disable();
        this.getControlCoodirectorAgregar('idProfesor').disable();
        (<FormControl>this.formularioDirector.controls['idProfesor'])
        .patchValue('');
    }
  }

  private validarCheck(): boolean {
        return this.auxiliarAgregarDirector;
  }


  private validarFormulario(): boolean {
        if (this.formularioDirector.valid) {
            this.validacionActivaAgregarDirector = false;
            return true;
        }
        this.validacionActivaAgregarDirector = true;
        return false;
  }

  private asignacionTutoDirector(): void {
    if (this.auxiliarAgregarDirector === true) {
      this.enviarFormularioNuevoTutor();
    }else {
      this.getControl('idProfesor').enable();
      this.enviarFormulario();
    }
  }

  obtenrCodirector(valor: number): void {
      this.obtenerCodirector = valor;
  }

  enviarFormulario(): void {
        if (this.validarFormulario()) {
            this._spinner.start('enviarFormulario');
            this.getControl('idProfesor').patchValue(
              this.registroSeleccionado.tutor.profesor.id);
            (<FormControl>this.formularioDirector.controls['nombreTrabajo'])
            .patchValue(this.registroSeleccionado.tutor.nombreTrabajo);
            let jsonFormulario = JSON.stringify(this.formularioDirector.value, null, 2);
           this.tutorService
                .postTutor(
                    jsonFormulario,
                    this.erroresGuardado
                ).subscribe(
                response => {
                  let id = response.json().id;
                  console.log('response', response.json());
                  if (id) {
                    let formularioJson = '{"idTutor": ' + id + '}';
                    this.estudianteService.putEstudiante(
                      this.idEstudianteAgregar,
                      formularioJson,
                      this.erroresGuardado).subscribe(() => {
                        if (this.idEstudianteAgregar) {
                          let estudianteTutorJson = '{"idTutor": ' + id +
                          ', "idEstudiante": ' + this.idEstudianteAgregar + '}';
                          this.estudianteTutorService.postEstudianteTutor(
                            estudianteTutorJson,
                            this.erroresGuardado
                          ).subscribe(
                            response => {
                            this.onCambiosTabla();
                            this._spinner.stop('enviarFormulario');
                            this.cerrarModalAsignarDirector();
                          });
                        }
                      });
                  }
                }
            );
        } else {
            //alert('error en el formulario');
        }
  }

  enviarFormularioNuevoTutor(): void {
    //this.guardarCodirector();
      if (this.validarFormulario()) {
          this._spinner.start('enviarFormularioNuevo');
          let jsonFormulario = JSON.stringify(this.formularioDirector.value, null, 2);
         //console.log('jsonFormularioDirector', jsonFormulario);
          this.tutorService
              .postTutor(
                  jsonFormulario,
                  this.erroresGuardado
              ).subscribe(
              response => {
                let id = response.json().id;
                if (id) {
                  let formularioJson = '{"idTutor": ' + id + '}';
                  this.estudianteService.putEstudiante(
                    this.idEstudianteAgregar,
                    formularioJson,
                    this.erroresGuardado).subscribe(() => {
                      if (this.idEstudianteAgregar) {
                        let estudianteDirectorJson = '{"idTutor": ' + id +
                        ', "idEstudiante": ' + this.idEstudianteAgregar + '}';
                        this.estudianteTutorService.postEstudianteTutor(
                          estudianteDirectorJson,
                          this.erroresGuardado
                        ).subscribe(response => {
                          if (this.obtenerCodirector !== 0) {
                              this.guardarCodirector();
                          }else {
                            this.onCambiosTabla();
                            this._spinner.stop('enviarFormularioNuevo');
                            this.cerrarModalAsignarDirector();
                          }
                        });
                      }
                    });
                }
              },
              error => {
                console.log(error);
              },
              () => {

              }
          );
      } else {
          //alert('error en el formulario');
      }
  }
  guardarCodirector(): void {
      this.obtenerNombreTrabajo = this.getControl('nombreTrabajo').value;
      this.getControlCoodirectorAgregar('nombreTrabajo')
        .patchValue(this.obtenerNombreTrabajo);
      this.getControlCoodirectorAgregar('fechaAsignacion').
        patchValue(this.getFechaAsignacion() + ' 10:00am');
      /*this.formularioCodirector = new FormGroup({
        idProfesor: new FormControl(this.obtenerCodirector),
        nombreTrabajo: new FormControl(this.obtenerNombreTrabajo),
        calificacion: new FormControl(''),
        idLgac: new FormControl(''),
        idTipoTesis: new FormControl(2),
        idTipo: new FormControl(3),
        fechaAsignacion: new FormControl(this.getFechaAsignacion() + ' 10:00am')
        //idEstudiante: new Control('')
    });*/
    let jsonFormularioCodirector =
    JSON.stringify(this.formularioCodirector.value, null, 2);
    this.tutorService.postTutor(
            jsonFormularioCodirector,
            this.erroresGuardado
        ).subscribe(response => {
          let idCodirector = response.json().id;
          let estudianteCodirectorJson = '{"idTutor": ' + idCodirector +
          ', "idEstudiante": ' + this.idEstudianteAgregar + '}';
          this.estudianteTutorService.postEstudianteTutor(
            estudianteCodirectorJson,
            this.erroresGuardado
          ).subscribe(() => {
            this.onCambiosTabla();
            this._spinner.stop('enviarFormularioNuevo');
            this.cerrarModalAsignarDirector();
          });
        });
  }

  private getControl(campo: string): FormControl {
        return (<FormControl>this.formularioDirector.controls[campo]);
  }

  private getControlCoodirectorAgregar(campo: string): FormControl {
    return (<FormControl>this.formularioCodirector.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
        return (
        !(<FormControl>this.formularioDirector.controls[campo]).valid &&
        this.validacionActivaAgregarDirector);
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

  private obtenerCatalogoAgregar(): void {
      let idNivelEstudio: number = 0;
      let urlSearch: URLSearchParams = new URLSearchParams();
      this.opcionesSelectProfesores = [];
        this.opcionesSelectProfsCodir = [];
      idNivelEstudio =
      this.registroSeleccionado.promocion.programaDocente.nivelEstudios.id;
      urlSearch.set('ordenamiento', 'primerApellido:ASC,' +
                    'segundoApellido:ASC, nombre:ASC');
        this.estatusCatalogoService.getProfesor().getListaProfesor(this.erroresConsultas, urlSearch).
        subscribe(response => {
            response.json().lista.forEach((item) => {
                this.opcionesSelectProfsCodir.push(new Profesor(item));
            });
            if (idNivelEstudio === 2 || idNivelEstudio === 3) {
                if (this.registroSeleccionado.lgac.id) {
                    this._spinner.start('busqueda');
                    let criterios = 'idLgac~'
                        + this.registroSeleccionado.lgac.id
                        + ':IGUAL';
                    urlSearch.set('criterios', criterios);
                    urlSearch.set('ordenamiento', 'idProfesor.primerApellido:ASC,' +
                    'idProfesor.segundoApellido:ASC, idProfesor.nombre:ASC');
                    //console.log(criterios);
                    this.tutorLGAC.getListaIntegranteLgacPag(
                        this.erroresConsultas,
                        urlSearch
                    ).subscribe(response => {
                        response.json().lista.forEach((item) => {
                            this.opcionesSelectProfesores.push(new Profesor(item.id_profesor));
                            //console.log(response.json());
                        });
                        this._spinner.stop('busqueda');
                    });
                }
            } else {
                this._spinner.start('busquedaelse');
                urlSearch.set('ordenamiento', 'primerApellido:ASC,' +
                    'segundoApellido:ASC, nombre:ASC');
                this.estatusCatalogoService.getProfesor().getListaProfesor(this.erroresConsultas, urlSearch).
                subscribe(
                  response => {
                    response.json().lista.forEach((item) => {
                        this.opcionesSelectProfesores.push(new Profesor(item));
                        //console.log(this.opcionesSelectProfesores);
                    });
                    this._spinner.stop('busquedaelse');
                });
            }
        });
  }

  private reiniciarFormuarioDirector(): void {
    this.inicializarFormularioAgregarEditar();
  }

  private reiniciarformuarioCoDirector(): void {
    if (this.formularioCodirector) {
      this.inicializarFormularioCoodierector();
    }
  }
  // Fin del modal de agregar director///

  modalEditar(): void {
    if (this.registroSeleccionado) {
      console.log(this.registroSeleccionado);
      if (this.registroSeleccionado.tutor.tipo.valor === 'Director') {
        this.abrirModalEditarDirector();

      }

      if (this.registroSeleccionado.tutor.tipo.valor === 'Tutor') {
        this.abrirModalEditarTutor();
      }
    }else {
      // alert('Seleccione un solicitante');
    }
  }

  /// Inicia modal de editar director ///
  abrirModalEditarDirector(): void {
    this.idEstudianteEditar = this.registroSeleccionado.id;
    this.idProgramaDocenteEstudiante =
        this.registroSeleccionado.promocion.programaDocente.id;
    this.idLgacActual =
        this.registroSeleccionado.lgac.id;
    this.cargarInformacionEditarDirector();
    this.obtenerCatalogoEditarDirector();
    this.obtenerLgacActual(
            this.registroSeleccionado.tutor.profesor.id,
            this.idProgramaDocenteEstudiante);
    this.modalEditarDirector.open('lg');
        //this.dt = new Date();
        console.log(this.formularioTutor);

  }

  cerrarModalEditarDirector(): void {
    this.limpiarArreglosEditarDirector();
    this.limpiarFormularioCodirectorEditar();
    this.limpiarFormularioEditarDirector();
    this.validacionActivaEditarDirector = false;
    this.modalEditarDirector.close();
  }

  private inicializarFormularioEditarDirector(): void {
    this.formularioTutor = new FormGroup({
        idProfesor: new FormControl(''),
        idProfCodirector: new FormControl(''),
        nombreTrabajo: new FormControl('', Validators.required),
        //calificacion: new Control(''),
        idLgac: new FormControl(''),
        //idTipoTesis: new Control(''),
        //idTipo: new Control(''),
        fechaAsignacion: new FormControl('')
        //idEstudiante: new Control('')
    });
  }

  private cargarInformacionEditarDirector(): void {
    (<FormControl>this.formularioTutor.controls['idProfesor'])
        .patchValue(
            this.registroSeleccionado.tutor.profesor.id);
    (<FormControl>this.formularioTutor.controls['idLgac'])
        .patchValue(this.idLgacActual);
    (<FormControl>this.formularioTutor.controls['nombreTrabajo'])
        .patchValue(this.registroSeleccionado.tutor.nombreTrabajo);
      (<FormControl>this.formularioTutor.controls['fechaAsignacion'])
        .patchValue(this.registroSeleccionado.tutor.getFechaConFormato() + ' 10:00am'); 
        this.dt = new Date(this.registroSeleccionado.tutor.fechaAsignacion); 
  }

  enviarFormularioEditarDirector(): void {
    if (this.validarFormularioEditarDirector()) {
            this._spinner.start('guardar');
            this.formularioTutor.value.idLgac = '';
            let jsonFormulario = JSON.stringify(this.formularioTutor.value, null, 2);
            this.tutorService
                .putTutor(
                    this.registroSeleccionado.tutor.id,
                    jsonFormulario,
                    this.erroresGuardado
                ).subscribe(
                () => {
                    this.putLgacEstudiante();
                    if (this.idCodirector) {
                        let jsonFormularioCodirector = '{"idProfesor": ' +
                            (<FormControl>this.formularioTutor.controls['idProfCodirector']).value +
                            '}';
                        this.tutorService.putTutor(this.idCodirector,
                            jsonFormularioCodirector, this.erroresGuardado).subscribe(
                            () => {
                                this.putCodirector();
                            },
                            error => {

                            },
                            () => {
                            }
                        );
                    }else {
                        this.formularioCodirector = new FormGroup({
                            idProfesor: new FormControl((<FormControl>this.formularioTutor.
                                controls['idProfCodirector']).value),
                            nombreTrabajo: new FormControl(
                                this.registroSeleccionado.tutor.
                                    nombreTrabajo),
                            calificacion: new FormControl(''),
                            idLgac: new FormControl(''),
                            idTipoTesis: new FormControl(2),
                            idTipo: new FormControl(3),
                            fechaAsignacion: new FormControl(
                                this.registroSeleccionado.tutor.
                                    getFechaConFormato() + ' 10:00am')
                        });
                        let jsonFormularioCodirector =
                            JSON.stringify(this.formularioCodirector.value, null, 2);
                        this.tutorService.postTutor(
                            jsonFormularioCodirector, this.erroresGuardado).subscribe(
                            response => {
                                this.idCodirector = response.json().id;
                                this.putCodirector();
                            },
                            error => {

                            },
                            () => {
                            }
                        );
                    }
                }, //console.log('Success'),
                console.error,
                () => {
                    /*this.context.componenteLista.onCambiosTabla();
                    this._spinner.stop();
                    this.cerrarModal();*/
                }
            );
        } else {
            //alert('error en el formulario');
        }
  }

  putLgacEstudiante(): void {
        if (this.idLgacActual) {
            let idEstudiante =
                this.registroSeleccionado.id;
            let lgacEtudiante = '{"idLgac": ' + this.idLgacActual + '}';
            this.estudianteService.putEstudiante(
                idEstudiante,
                lgacEtudiante,
                this.erroresGuardado
            ).subscribe(
                response => {},
                () => {},
                error => {
                    this._spinner.stop('guardar');
                }
            );
        }

  }

  putCodirector(): void {
        let estudianteCodirectorJson = '{"idTutor": ' + this.idCodirector +
            ', "idEstudiante": ' + this.idEstudianteEditar + '}';
        this.estudianteTutorService.postEstudianteTutor(estudianteCodirectorJson,
            this.erroresGuardado).subscribe(
            () => {},
            error => {

            },
            () => {
                this.onCambiosTabla();
                this._spinner.stop('guardar');
                this.cerrarModalEditarDirector();
            }
        );
  }

  private getControlEditarDirector(campo: string): FormControl {
        return (<FormControl>this.formularioTutor.controls[campo]);
  }

  private getControlErrorsEditarDirector(campo: string): boolean {
        if (!(<FormControl>this.formularioTutor.controls[campo]).valid &&
            this.validacionActivaEditarDirector) {
            return true;
        }
        return false;
  }

  private errorMessagEditarDirector(control: FormControl): string {
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

  private validarFormularioEditarDirector(): boolean {
        if (this.formularioTutor.valid) {
            this.validacionActivaEditarDirector = false;
            return true;
        }
        this.validacionActivaEditarDirector = true;
        return false;
  }

  private obtenerLgacActual(idProfesor, idProgramaDocente) {
        this.opcionesSelelectLgac = [];
        if (idProfesor) {
            let urlSearch: URLSearchParams = new URLSearchParams();
            urlSearch.set('criterios', 'idProfesor~' + idProfesor +
                ':IGUAL,idLgac.idProgramaDocente~' + idProgramaDocente + ':IGUAL');
            //this._spinner.start();
            this.tutorLGAC.getListaIntegranteLgacPag(
                this.erroresConsultas,
                urlSearch
            ).subscribe(
                response => {
                    response.json().lista.forEach((item) => {
                        this.opcionesSelelectLgac.push(new Lgac(item.id_lgac));
                    });
                    //this._spinner.stop();
                },
                error => {
                    //this._spinner.stop();
                }
                ,
                () => {
                    //this._spinner.stop();
                    //console.log('opcionesSelectLgac', this.opcionesSelelectLgac);
                    //console.log('idLgaNuevo', this.idLgacActual);
                }
            );
        }
  }

  private obtenerLgac(idProfesor) {
        if (idProfesor) {
            this.opcionesSelelectLgac = [];
            let urlSearch: URLSearchParams = new URLSearchParams();
            urlSearch.set('criterios', 'idProfesor~' + idProfesor +
                ':IGUAL,idLgac.idProgramaDocente~' + this.idProgramaDocenteEstudiante + ':IGUAL');
            urlSearch.set('ordenamiento', 'idProfesor.primerApellido:ASC,' +
                'idProfesor.segundoApellido:ASC, idProfesor.nombre:ASC');
            this._spinner.start('obtenerLGAC');
            this.tutorLGAC.getListaIntegranteLgacPag(
                this.erroresConsultas,
                urlSearch
            ).subscribe(
                response => {
                    response.json().lista.forEach((item) => {
                        //this.opcionesSelectProfesores.push(new Profesor(item.id_profesor));
                        //console.log('Lgac', new Lgac(item.id_lgac));
                        this.opcionesSelelectLgac.push(new Lgac(item.id_lgac));
                    });
                    if (this.opcionesSelelectLgac.length > 0) {
                        this.idLgacActual = this.opcionesSelelectLgac[0].id;
                        this.getControl('idLgac').patchValue(
                            this.opcionesSelelectLgac[0].id
                        );
                    }
                    //this._spinner.stop();
                },
                error => {
                    this._spinner.stop('obtenerLGAC');
                }
                ,
                () => {
                    this._spinner.stop('obtenerLGAC');
                    //console.log('opcionesSelectLgac', this.opcionesSelelectLgac);
                    //console.log('idLgaNuevo', this.idLgacActual);
                }
            );
        }
  }

  private elegirLgac(idLgac): void {
        this.idLgacActual = idLgac;
  }

  private obtenerCatalogoEditarDirector(): void {
    this._spinner.start('obtenerCatalogo');
      let idNivelEstudio: number = 0;
      let urlSearch: URLSearchParams = new URLSearchParams();
      urlSearch.set('ordenamiento', 'primerApellido:ASC,segundoApellido:ASC,nombre:ASC');
      this.opcionesSelectProfesores = [];
        this.opcionesSelectProfsCodir = [];
        this.opcionesSelelectLgac = [];
      idNivelEstudio =
      this.registroSeleccionado.promocion.programaDocente.nivelEstudios.id;
        this.estatusCatalogoService.getProfesor().getListaProfesor(this.erroresConsultas, urlSearch).
        subscribe(response => {
            response.json().lista.forEach((item) => {
                this.opcionesSelectProfsCodir.push(new Profesor(item));
            });
            if (idNivelEstudio === 2 || idNivelEstudio === 3) {
                if (this.registroSeleccionado.lgac.id) {
                    let criterios = 'idLgac.idProgramaDocente~'
                        //+ this.context.componenteLista.registroSeleccionado.lgac.id
                        + this.idProgramaDocenteEstudiante
                        + ':IGUAL';
                    urlSearch.set('criterios', criterios);
                    urlSearch.set('ordenamiento', 'idProfesor.primerApellido:ASC,' +
                    'idProfesor.segundoApellido:ASC, idProfesor.nombre:ASC');
                    this.tutorLGAC.getListaIntegranteLgacPag(
                        this.erroresConsultas,
                        urlSearch
                    ).subscribe(response => {
                        response.json().lista.forEach((item) => {
                            let profesor = new Profesor(item.id_profesor);
                            if (!this.verificarProfesorRepetido(profesor.id)) {
                                this.opcionesSelectProfesores.push(profesor);
                            }
                        });
                        this.obtenerCodirectorEditar();
                        //this._spinner.stop();
                    });
                }
            } else {
              urlSearch.set('ordenamiento', 'primerApellido:ASC,' +
                    'segundoApellido:ASC, nombre:ASC');
                this.estatusCatalogoService.getProfesor().getListaProfesor(this.erroresConsultas, urlSearch).
                subscribe(response => {
                    response.json().lista.forEach((item) => {
                        this.opcionesSelectProfesores.push(new Profesor(item));
                    });
                    this.obtenerCodirectorEditar();
                    //this._spinner.stop();
                });
            }
        },
        error => {
            console.log(error);
        });
  }

  private verificarProfesorRepetido(id: number): boolean {
        let repetido = false;
        this.opcionesSelectProfesores.forEach((item) => {
            if (id === item.id) {
                repetido = true;
            }
        });

        return repetido;
  }

  private obtenerCodirectorEditar(): void {
        let urlParams = new URLSearchParams();
        urlParams.set('criterios', 'idEstudiante.id~' + this.idEstudianteEditar + ':IGUAL,' +
            'idTutor.idTipo.id~3:IGUAL;AND');
        urlParams.set('ordenamiento', 'id:DESC');
        this.estudianteTutorService.getListaEstudianteTutor(this.erroresConsultas, urlParams).
            subscribe(response => {
                if (response.json().lista.length > 0) {
                    if ( response.json().lista[0].id_tutor.id_profesor) {
                        (<FormControl>this.formularioTutor.controls['idProfCodirector']).patchValue(
                            response.json().lista[0].id_tutor.id_profesor.id);
                        this.idCodirector = response.json().lista[0].id_tutor.id;
                    } else {
                        (<FormControl>this.formularioTutor.controls['idProfCodirector']).patchValue(0);
                    }
                }
                this._spinner.stop('obtenerCatalogo');
        });
  }

  private limpiarArreglosEditarDirector(): void {
    this.opcionesSelectProfesores = [];
    this.opcionesSelectProfsCodir = [];
    this.opcionesSelelectLgac = [];
  }

  private limpiarFormularioEditarDirector(): void {
    this.inicializarFormularioEditarDirector();
  }

  private limpiarFormularioCodirectorEditar(): void {
    if (this.formularioCodirector) {
      //console.log('se reinicio fromulio coodirecrtor');
      this.inicializarFormularioCoodierector();
    }
  }
  /// Fin del modal de editar director ///
  /// Inicia modal editar tutor //////
  abrirModalEditarTutor(): void {
    this.modalEditarTutor.open('lg');
    this.obtenerCatalogoEditarTutor();
    this.cargarInforMacionTutorEditar();
  }

  private obtenerCatalogoEditarTutor(): void {
      let idNivelEstudio: number = 0;
      let urlSearch: URLSearchParams = new URLSearchParams();
      this.opcionesSelectProfesores = [];
      idNivelEstudio =
      this.registroSeleccionado.promocion.programaDocente.nivelEstudios.id;
      if (idNivelEstudio === 2 || idNivelEstudio === 3) {
        if (this.registroSeleccionado.lgac.id) {
          this._spinner.start('catalogo');
          let criterios = 'idLgac~'
          + this.registroSeleccionado.lgac.id
          + ':IGUAL';
          urlSearch.set('criterios', criterios);
          urlSearch.set('ordenamiento', 'idProfesor.primerApellido:ASC,' +
                    'idProfesor.segundoApellido:ASC, idProfesor.nombre:ASC');
          this.tutorLGAC.getListaIntegranteLgacPag(
            this.erroresConsultas,
            urlSearch
          ).subscribe(response => {
            response.json().lista.forEach((item) => {
              this.opcionesSelectProfesores.push(new Profesor(item.id_profesor));
            });
            this._spinner.stop('catalogo');
          });
        }
      }else {
        this._spinner.start('catalogoProfesor');
        urlSearch.set('ordenamiento', 'primerApellido:ASC,' +
                    'segundoApellido:ASC, nombre:ASC');
        this.estatusCatalogoService.getProfesor().
        getListaProfesor(this.erroresConsultas, urlSearch).subscribe(response => {
          response.json().lista.forEach((item) => {
            this.opcionesSelectProfesores.push(new Profesor(item));
          });
          this._spinner.stop('catalogoProfesor');
        });
      }
  }

  inicializaFormularioTutorEdiccion(): void {
    this.formularioEditarTutor = new FormGroup({
            idProfesor: new FormControl('')
    });
  }

  private cargarInforMacionTutorEditar(): void {
    this.getControlTutorEditar('idProfesor').patchValue(this.registroSeleccionado.tutor.profesor.id);
   // this.getControlTutorEditar('fechaAsignacion').patchValue(this.registroSeleccionado.tutor.fechaAsignacion);

   // let fechaRecuperar = moment(this.registroSeleccionado.tutor.fechaAsignacion);
   // this.dt = new Date(fechaRecuperar.toJSON());
  }

  activarBotonAsignarEditarTutor(numero: number): any {
        if (numero === 1) {
            this.botonValidoEditarTutor = true;
        }else {
            this.botonValidoEditarTutor = false;
        }
  }

  getControlTutorEditar(campo: string): FormControl {
        return (<FormControl>this.formularioEditarTutor.controls[campo]);
  }

  getControlErrorsTutorEditar(campo: string): boolean {
        if (!(<FormControl>this.formularioEditarTutor.controls[campo]).valid &&
            this.validacionActiva) {
            return true;
        }
        return false;
  }

  private errorMessageTutorEditar(control: FormControl): string {
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


  enviarFormularioEditarTutor(): void {
        if (this.validarFormularioTutorEditar()) {
            this._spinner.start('editar');
            let jsonFormulario = JSON.stringify(this.formularioEditarTutor.value, null, 2);

            this.tutorService
                .putTutor(
                    this.registroSeleccionado.tutor.id,
                    jsonFormulario,
                    this.erroresGuardado
                ).subscribe(
                () => {}, //console.log('Success'),
                console.error,
                () => {
                  this._spinner.stop('editar');
                  this.onCambiosTabla();
                  this.cerrarModalEditarTutor();
                }
            );

        } else {
            //alert('error en el formulario');
        }
  }
 public getDate(): number {
        let fecha = moment(this.dt).format('DD/MM/YYYY hh:mm a');
        let fechaString = 'fecha';
        return this.dt && this.dt.getTime() || new Date().getTime();
  }
  validarFormularioTutorEditar(): boolean {
        if (this.formularioEditarTutor.valid) {
            this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
  }

  limpiarFormularioTutorEditar(): void {
    if (this.formularioEditarTutor) {
      this.inicializaFormularioTutorEdiccion();
    }
  }

  cerrarModalEditarTutor(): void {
    this.modalEditarTutor.close();
    this.limpiarFormularioTutorEditar();
    this.validacionActiva = false;
  }
  // Fin modal de editar tutor ////
  /// inicio de modal agregar tutor ////
  modalAsignarTutor(): void {
    this.modalAgregarTutor.open('lg');
    this.obtenerCatalogoAgregarTutor();
  }

  cerrarModalAsignarTutor(): void {
    this.modalAgregarTutor.close();
    this.opcionesSelectProfesores = [];
    this.getControlAgregarTutor('idProfesor').patchValue('');
    this.validacionActiva = false;
    this.botonValidoAgregarTutor = false;
    this.inicializarFormularioAgregarTutor();
  }

  private inicializarFormularioAgregarTutor(): void {
    this.formularioAgregarTutor = new FormGroup({
            idProfesor: new FormControl(''),
            nombreTrabajo: new FormControl('', Validators.required),
            calificacion: new FormControl(''),
            idLgac: new FormControl(''),
            idTipoTesis: new FormControl(1),
            idTipo: new FormControl(1)
            //idEstudiante: new Control('')
        });
  }

  private activarBotonAsignarAgregarTutor(numero: number): any {
        if (numero === 1) {
            this.botonValidoAgregarTutor = true;
        }else {
            this.botonValidoAgregarTutor = false;
        }
  }

  private enviarFormularioAgregarTutor(): void {
    if (this.validarFormularioAgregarTutor()) {

            this._spinner.start('guardarTutor');
            let jsonFormulario =
              JSON.stringify(this.formularioAgregarTutor.value, null, 2);
            this.tutorService
                .postTutor(
                    jsonFormulario,
                    this.erroresGuardado
                ).subscribe(
                response => {
                  let id = response.json().id;
                  if (id) {
                    let formularioJson = '{"idTutor": ' + id + '}';
                    this.estudianteService.putEstudiante(
                      this.registroSeleccionado.id,
                      formularioJson,
                      this.erroresGuardado).subscribe(() => {
                        if (this.registroSeleccionado.id) {
                          let estudianteTutorJson = '{"idTutor": ' + id +
                          ', "idEstudiante": ' + this.registroSeleccionado.id + '}';
                          this.estudianteTutorService.postEstudianteTutor(
                            estudianteTutorJson,
                            this.erroresGuardado
                          ).subscribe(response => {
                            this.onCambiosTabla();
                            this._spinner.stop('guardarTutor');
                            this.cerrarModalAsignarTutor();
                          });
                        }
                      });
                  }
                }
            );

        } else {
            //alert('error en el formulario');
        }
  }

  getControlAgregarTutor(campo: string): FormControl {
        return (<FormControl>this.formularioAgregarTutor.controls[campo]);
  }

  getControlErrorsAgregarTutor(campo: string): boolean {
        if (!(<FormControl>this.formularioAgregarTutor.controls[campo]).valid &&
            this.validacionActiva) {
            return true;
        }
        return false;
  }

  validarFormularioAgregarTutor(): boolean {
        if (this.formularioAgregarTutor.valid) {
            this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
  }

  private errorMessageAgregarTutor(control: FormControl): string {
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

  private obtenerCatalogoAgregarTutor(): void {
      let idNivelEstudio: number = 0;
      let urlSearch: URLSearchParams = new URLSearchParams();
      this.opcionesSelectProfesores = [];
      idNivelEstudio =
      this.registroSeleccionado.promocion.programaDocente.nivelEstudios.id;
      if (idNivelEstudio === 2 || idNivelEstudio === 3) {
        if (this.registroSeleccionado.lgac.id) {
          this._spinner.start('buscarCat');
          let criterios = 'idLgac~'
          + this.registroSeleccionado.lgac.id
          + ':IGUAL';
          urlSearch.set('criterios', criterios);
          urlSearch.set('ordenamiento', 'idProfesor.primerApellido:ASC,' +
                    'idProfesor.segundoApellido:ASC, idProfesor.nombre:ASC');
          this.tutorLGAC.getListaIntegranteLgacPag(
            this.erroresConsultas,
            urlSearch
          ).subscribe(response => {
            response.json().lista.forEach((item) => {
              this.opcionesSelectProfesores.push(new Profesor(item.id_profesor));
            });
            this._spinner.stop('buscarCat');
          });
        }
      }else {
            this._spinner.start('buscarCat2');
            urlSearch.set('ordenamiento', 'primerApellido:ASC,' +
                    'segundoApellido:ASC, nombre:ASC');
            this.estatusCatalogoService.getProfesor().
            getListaProfesor(this.erroresConsultas).subscribe(response => {
              response.json().lista.forEach((item) => {
                this.opcionesSelectProfesores.push(new Profesor(item));
              });
              this._spinner.stop('buscarCat2');
            });
      }
  }
  /// fin de modal agregar tutor /////
/*  constructor() { }

  ngOnInit() {
  }

  mostrarFormato(): boolean {
    return true;
  }
  mostrarBotonDirector(): boolean {
    return true;
  }
  mostrarBotonTutor(): boolean {
    return true;
  }
  mostrarBotones(): boolean {
    return true;
  }
  mostrarBotoneditar(): boolean {
    return true;
  }
  desabilitarCampos(): boolean {
    return true;
  }*/

 limpiarVariablesSession() {
    sessionStorage.removeItem('asignarCriterios');
    sessionStorage.removeItem('asignarOrdenamiento');
    sessionStorage.removeItem('asignarLimite');
    sessionStorage.removeItem('asignarPagina');
  }

}
