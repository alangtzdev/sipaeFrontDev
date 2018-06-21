import {Component, OnInit, Renderer, Injector, ElementRef, ViewChild, Inject, NgZone} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {AcreditacionIdioma} from '../../services/entidades/acreditacion-idioma.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {URLSearchParams} from '@angular/http';
import {Router} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {errorMessages} from '../../utils/error-mesaje';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Matricula} from '../../services/entidades/matricula.model';
import {IdiomaEstudiante} from '../../services/entidades/idioma-estudiante.model';
import {EstudianteGrupoIdioma} from '../../services/entidades/estudiante-grupo-idioma.model';
import {DocumentoProbatorioAcreditacion} from '../../services/entidades/documento-probatorio-acreditacion.model';
import * as moment from 'moment';
import {Validacion} from '../../utils/Validacion';
import {NgUploaderOptions} from 'ngx-uploader';
import {ConfigService} from '../../services/core/config.service';
import {AuthService} from '../../auth/auth.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {DocumentoProbatorioAcreditacionService} from '../../services/entidades/documento-probatorio-acreditacion.service';

export class Registro {
  idTipo: number;
  idArchivo: number;
  nombre: string;
  otroTipo: string;
  constructor(tipo: number, archivo: number, nombre: string, otro: string = null) {
    this.idTipo = tipo;
    this.idArchivo = archivo;
    this.nombre = nombre;
    this.otroTipo = otro;
  }
}

@Component({
  selector: 'app-idiomas-acreditacion',
  templateUrl: './idiomas-acreditacion.component.html',
  styleUrls: ['./idiomas-acreditacion.component.css']
})

export class IdiomasAcreditacionComponent implements OnInit {

  estudianteService;
  catalogoService;
  acreditacionIdiomaService;

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;

  columnas: Array<any> = [
    { titulo: 'Idioma*', nombre: 'idIdioma.descripcion'},
    { titulo: 'Forma de acreditación*', nombre: 'documentoAcreditacion'},
    { titulo: 'Fecha de vencimiento', nombre: 'fechaVencimiento', sort: false},
    { titulo: 'Estatus', nombre: 'acreditado'}
  ];

  columnasDocencia: Array<any> = [
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Idioma*', nombre: 'idIdioma.descripcion'},
    { titulo: 'Forma de acreditación*', nombre: 'documentoAcreditacion'},
    { titulo: 'Fecha de vencimiento ', nombre: 'fechaVencimiento', sort: false},
    { titulo: 'Estatus', nombre: 'acreditado'}
  ];

  registros: Array<AcreditacionIdioma> = [];
  registroSeleccionado: AcreditacionIdioma;
  usuarioLogueado: UsuarioSesion;
  idEstudiante: number;
  idUsuarioObjetivo: number;
  auxiliar: number;
  //  permisoDocencia: boolean = false;

  // encabezado solo para docencia
  botonBuscar: boolean = false;
  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesSelectPromocion: Array<ItemSelects>;
  criteriosCabezera: string = '';
  entidadEstudiante: Estudiante;

  public configuracion: any = {
    paginacion: true,
    filtrado: {
      textoFiltro: '',
      columnas: 'idIdioma.descripcion,documentoAcreditacion,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idDatosPersonales.nombre'
    }
  };
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private vistaDocencia: boolean = false;

  constructor(@Inject(NgZone) private zone: NgZone,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private documentoProbatorioAcreditacionServiceDetalle: DocumentoProbatorioAcreditacionService,
              public _spinner: SpinnerService,
              private authService: AuthService,
              private _archivoService: ArchivoService,
              private _catalogosServices: CatalogosServices,
              private _catalogosService: CatalogosServices,
              params: Router,
              private _router: Router
  ) {
    /*this.idUsuarioObjetivo = _router.paren.currentInstruction.component.params.usuarioObjetivo;
    // console.log(Seguridad.getUsuarioLogueado());
    // console.log(Seguridad.getUsuarioRoles());
    if (this.idUsuarioObjetivo) {
/*      if (assertionsEnabled()) {
        // console.log(this.idUsuarioObjetivo + ' ::::::::::::::::::::');

      }
      //  this.permisoDocencia = true;
      this.auxiliar = this.idUsuarioObjetivo;
    } else {
      this.usuarioLogueado = this.authService.getUsuarioLogueado();
      this.auxiliar = this.usuarioLogueado.id;
  /*    if (assertionsEnabled()) {
        // console.log(this.usuarioLogueado);
      }
    }*/
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
    this.auxiliar = this.usuarioLogueado.id;
    this.prepareServices();

    if (sessionStorage.getItem('idiomasAcreditacion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('idiomasAcreditacionCriterios')) {
      this.onCambiosTabla();
    }

    this.formularioBuscar = new FormGroup ({
      idIdioma: new FormControl(''),
      matricula: new FormControl(''),
    });

    this.formularioAcreditacion = new FormGroup({
      //  institucionBachillerato: new Control('', Validators.required),   // Licenciatura
      calificacionEvaluacionDiagnostica: new FormControl(''),
      fechaEvaluacionDiagnostica: new FormControl(''),
      idNivelIdioma: new FormControl(''),
      documentoAcreditacion: new FormControl(''),
      observaciones: new FormControl(''),
      acreditado: new FormControl(''),
      puntosCertificado: new FormControl(''),
      fechaVencimiento: new FormControl(''),
      aplicaVencimiento: new FormControl(''),
      auxiliar: new FormControl(''),
      seteador: new FormControl(''),
      idIdioma: new FormControl(''),
      idEstudiante: new FormControl(''),
    });
    this.listaAlumnos();

    this.formularioRegistroPagina = new FormGroup({
      registrosPorPagina: new FormControl('')
    });
    if (sessionStorage.getItem('idiomasAcreditacionLimite')) {
      this.limite = +sessionStorage.getItem('idiomasAcreditacionLimite');
    }
    (<FormControl>this.formularioRegistroPagina.controls['registrosPorPagina'])
      .setValue(this.limite);
  }

  recuperarEstudiante(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario.id~' + ':IGUAL');
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((estudiante) => {
          this.idEstudiante = estudiante.id;
          this.entidadEstudiante = new Estudiante(estudiante);
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          // console.log('Estudiante actual: ' + this.idEstudiante);
        }*/
        if ( !this.idEstudiante ) {
          this.vistaDocencia = true;
        }

        this.onCambiosTabla();
      }
    );
  }
  activarBotonBusqueda(numero: number): any {
    if (numero== 1) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {

    // // console.log('idProgramaDocente', idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');

    this.opcionesSelectPromocion = this.catalogoService.getPromocion().
    getSelectPromocion(this.erroresConsultas, urlParameter);

  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
    this.limpiarVariablesSession();
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.idProgramaDocente.id~' + idProgramaDocente + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    // console.log('------------------------');
    sessionStorage.setItem('acreditacionIdPromocion', idProgramaDocente.toString());
    sessionStorage.setItem('acreditacionIdProgramaDocente', idPromocion.toString());
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    this._spinner.start('idiomasacreditacion1' );
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioOriginal = 'idEstudiante.id~' + this.idEstudiante + ':IGUAL';

    if (this.idEstudiante) {
      urlParameter.set('criterios', criterioOriginal);
    }

    let criterios = '';
    let ordenamiento = '';

    criterios = this.criteriosCabezera;
    urlParameter.set('criterios', criterios);

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
        let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
        if (criterios !== '') { criterios = criterios + ';ANDGROUPAND'; }
        if (!this.vistaDocencia) {
          criterios = criterioOriginal + ';ANDGROUPAND';
        }
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        });
  /*      if (assertionsEnabled()) {
          // console.log(criterios);
        }*/

        urlParameter.set('criterios', criterios);
      }
    if (!sessionStorage.getItem('idiomasAcreditacionOrdenamiento')) {
      let colum;
      if (this.vistaDocencia) {
        colum = this.columnasDocencia;
      }else {
        colum = this.columnas;
      }
      colum.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      console.log(ordenamiento);
      sessionStorage.setItem('idiomasAcreditacionOrdenamiento', ordenamiento);
    }

    if (!sessionStorage.getItem('idiomasAcreditacionCriterios')) {
      sessionStorage.setItem('idiomasAcreditacionCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('idiomasAcreditacionLimite') ? +sessionStorage.getItem('idiomasAcreditacionLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('idiomasAcreditacionPagina') ?
      +sessionStorage.getItem('idiomasAcreditacionPagina') : this.paginaActual;

    console.log(sessionStorage.getItem('idiomasAcreditacionOrdenamiento'));
    urlParameter.set('criterios', sessionStorage.getItem('idiomasAcreditacionCriterios'));
    urlParameter.set('ordenamiento', sessionStorage.getItem('idiomasAcreditacionOrdenamiento'));
    urlParameter.set('limit', this.limite.toString());
    urlParameter.set('pagina', this.paginaActual.toString());

    console.log(urlParameter);
    this._spinner.start('idiomasacreditacion1');
    this.acreditacionIdiomaService.getListaAcreditacionIdiomaControlable(
      this.erroresConsultas,
      urlParameter,
      true
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
        paginacionInfoJson.lista.forEach((elemento) => {
          this.registros.push(new AcreditacionIdioma(elemento));
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('idiomasacreditacion1' );
      },
      () => {
        this._spinner.stop('idiomasacreditacion1');
      }
    );
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    // this.params = null;
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    sessionStorage.setItem('idiomasAcreditacionPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  rowSeleccionado(registro): boolean {
    //  // console.log(registro.id);
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    sessionStorage.setItem('idiomasAcreditacionLimite', this.limite.toString());
    sessionStorage.setItem('idiomasAcreditacionPagina', '1');
    this.onCambiosTabla();
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  sortChanged(columna): void {
    sessionStorage.removeItem('idiomasAcreditacionOrdenamiento');
      let colum;
      if (this.vistaDocencia) {
        colum = this.columnasDocencia;
      }else {
        colum = this.columnas;
      }
    colum.forEach((column) => {
      if (columna !== column) {
        if (column.sort !== false) {
          column.sort = '';
        } else {
          column.sort = false;
        }
      }
    });
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  hasRol(rol: string) {
    // return Seguridad.hasRol(rol);
  }

  private prepareServices(): void {
    this.catalogoService = this._catalogosService;
    this.estudianteService = this.catalogoService.getEstudianteService();
    this.acreditacionIdiomaService = this.catalogoService.getAcreditacionIdiomaService();
    this.opcionesSelectProgramaDocente =
      this.catalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
    this.recuperarEstudiante(this.auxiliar);
    this.estudianteServiceAcre = this._catalogosServices.getEstudianteService();
  }

  ngOnInit() {
  }

  // ------------------------------------ MODALS ----------------------------------------//
  @ViewChild('modalAcreditar')
  modalAcreditar: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  @ViewChild('modalAdvertencia')
  modalAdvertencia: ModalComponent;
  @ViewChild('modalConfirmacion')
  modalConfirmacion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  // ------------------------------------ MODAL ACREDITAR ----------------------------------------//

  idEstudianteAcre: number;
  mensajeErrors: any = errorMessages;
  validacionActiva: boolean = false;

  idArchivo: number;
  nombreArchivo: string;
  tipoArchivo: number;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  options: NgUploaderOptions;
  registrosAcre: Array<Registro> = [];
  acceso: boolean = true;
  registroSeleccionadoAcre: Registro = null;

  protected searchStr2: string;
  protected opcions = [];

  formularioBuscar: FormGroup;
  formularioAcreditacion: FormGroup;
  formularioRegistroPagina: FormGroup;
  campos: number = 0;

  habilitarFecha: boolean = false;
  matricula: Matricula;
  entidadEstudianteAcre: Estudiante = null;
  entidadIdiomaEstudiante: IdiomaEstudiante = null;
  entidadAcreditacionIdioma: AcreditacionIdioma = null;
  estudiante: Estudiante = null;
  idIdioma: number = null;
  columnasAcre: Array<any> = [];
  opcion: number = 0;
  edicion: boolean = false;

  programaDocenteService;
  idiomaService;
  matriculaService;
  estudianteServiceAcre;
  catNivelIdiomaService;
  estudianteGrupoIdioma;
  archivoService;
  catTipoDocumentoService;
  idiomaEstudianteService;
  acreditacionService;
  documentoProbatorioAcreditacionService;

  public dt1: Date;
  public dt2: Date;
  public configuracionAcre: any = {
    paginacion: false,
    filtrado: { textoFiltro: ''}
  };

  private opcionesProgramaDocente: Array<ItemSelects> = [];
  private opcionesCatIdiomas: Array<ItemSelects> = [];
  private opcionesNivelIdioma: Array<ItemSelects> = [];
  private listaDocumentos: Array<ItemSelects> = [];
  private alertasAcre: Array<Object> = [];
  private estudiantes: Array<ItemSelects> = [];

  private erroresConsultasAcre: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private estudianteGruposIdioma: Array<EstudianteGrupoIdioma> = [];
  private documentosAcreditacionLista: Array<DocumentoProbatorioAcreditacion> = [];

  // Autocomplete
  private isComplete: boolean = false;
  private matriculaSelAutocomplete: Estudiante;

  private columnasDocumentos: Array<any> = [
    { titulo: 'Nombre Documento', nombre: '', sort: false} ];

  private constructorAcreditar(): void {
    this.estudiante = null;
    this.validacionActiva = false;
    this.basicProgress = 0;
    this.dropProgress = 0;
    this.dropResp = [];
    this.registrosAcre = [];
    this.acceso = true;
    this.registroSeleccionadoAcre = null;
    this.campos = 0;
    this.habilitarFecha = false;
    this.entidadEstudianteAcre = null;
    this.entidadIdiomaEstudiante = null;
    this.entidadAcreditacionIdioma = null;
    this.estudiante = null;
    this.searchStr2 = null;
    this.idIdioma = null;
    this.columnasAcre = [];
    this.opcion = 0;
    this.edicion = false;
    this.dt1 = new Date();
    this.dt2 = new Date();
    this.opcionesProgramaDocente = [];
    this.opcionesCatIdiomas = [];
    this.opcionesNivelIdioma = [];
    this.listaDocumentos = [];
    this.alertasAcre = [];
    this.estudiantes = [];
    this.erroresConsultasAcre = [];
    this.erroresGuardado = [];
    this.estudianteGruposIdioma = [];
    this.documentosAcreditacionLista = [];
    this.isComplete = false;
    this.idEstudianteAcre = null;

  if (this.registroSeleccionado) {
      this.idEstudianteAcre = this.registroSeleccionado.estudiante.id;
    }else {
      this.idEstudianteAcre = null;
    }
    moment.locale('es');
    this.prepareServicesAcre();
    this.getTiposDocumentos();

    if (this.idEstudianteAcre) {
      this._spinner.start('cons');
      this.edicion = true;
      this.idIdioma = this.registroSeleccionado.idioma.id;
      this.recuperarEntidadEstudiante();
    }

    this.formularioBuscar = new FormGroup ({
      idIdioma: new FormControl('', Validators.required),
      matricula: new FormControl('', Validators.required),
    });

    this.formularioAcreditacion = new FormGroup({
      //  institucionBachillerato: new Control('', Validators.required),   // Licenciatura
      calificacionEvaluacionDiagnostica: new FormControl(''),
      fechaEvaluacionDiagnostica: new FormControl(''),
      idNivelIdioma: new FormControl(''),
      documentoAcreditacion: new FormControl('', Validators.compose([
        Validacion.parrafos])),
      observaciones: new FormControl('', Validators.compose([
        Validacion.parrafos])),
      acreditado: new FormControl('', Validators.required),
      puntosCertificado: new FormControl(''),
      fechaVencimiento: new FormControl(''),
      aplicaVencimiento: new FormControl('', Validators.required),
      auxiliar: new FormControl('', Validators.required),
      seteador: new FormControl(''),
      idIdioma: new FormControl(''),
      idEstudiante: new FormControl('', Validators.required),
    });
    this.inicializarOpcionesNgZone();
    this.zone = new NgZone({ enableLongStackTrace: false});
    this.modalAcreditarIdioma();
  }

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['pdf', 'PDF'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  listaAlumnos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.estudianteServiceAcre.
    getListaEstudianteOpcional(this.erroresConsultasAcre, urlParameter).subscribe(
      response => {
        let items = response.json().lista;
        if (items) {
          this.opcions = [];
          items.forEach((item) => {
            let it = new Estudiante(item);
            this.opcions.push({"id": item.id, "name": (it.matricula.matriculaCompleta ?
                it.matricula.matriculaCompleta : '') + ' ' +
            it.getNombreCompleto()});
          });
        }
      },
      error => {
        this.isComplete = false;
      },
      () => {
        this.isComplete = false;
      }
    );
  }

  recuperarEntidadEstudiante(): void {
    this.estudianteService.getEntidadEstudiante(
      this.idEstudianteAcre,
      this.erroresConsultasAcre,
      null
    ).subscribe(
      response => {
        let estudent: Estudiante = new Estudiante(response.json());
        this.obtenerInformacionEstudianteEdicion(estudent);
      },
      error => {
      }
      /*       () => {
       if (this.estudiante)
       this.filtrarIdioma();
       } */
    );
  }

  filtroChangedAcre(filtroTexto): void {
    this.configuracionAcre.filtrado.textoFiltro = filtroTexto;
  }

  obtenerEstudianteGrupoIdioma(): void {
    (<FormControl>this.formularioAcreditacion.controls['idEstudiante']).
    setValue(this.entidadEstudianteAcre.id);

    this.idIdioma = this.getControl('idIdioma').value;
    if (this.idIdioma === 1 || this.idIdioma === 2) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstudiante~' + this.entidadEstudianteAcre.id + ':IGUAL,'
          + 'idGrupoIdioma.idIdioma~' + this.idIdioma + ':IGUAL');
      this.estudianteGrupoIdioma.getListaEstudiantesGrupoIdioma(
        this.erroresConsultasAcre,
        urlParameter
      ).subscribe(
        response => {
          if (response.json().lista.length > 0) {
            response.json().lista.forEach((item) => {
              this.estudianteGruposIdioma.push(new EstudianteGrupoIdioma(item));
            });
            this.validarIdiomasColsan();
          }
        }
      );
    }
  }

  validarIdiomasColsan(): void {
    if (this.idIdioma == 1 && this.estudianteGruposIdioma.length === 2) {
      let ingles = true;
    }
    if (this.idIdioma == 2 && this.estudianteGruposIdioma.length === 4) {
      let frances = true;
    }
  }

  definirEncabezado(idIdioma: number) {
    if (idIdioma == 1) {
      this.columnasAcre = [
        { titulo: 'Curso 1', nombre: 'curso1'},
        { titulo: 'Curso 2', nombre: 'curso2' },
      ];
    }else {
      this.columnasAcre = [
        { titulo: 'Curso 1', nombre: 'curso1'},
        { titulo: 'Curso 2', nombre: 'curso2' },
        { titulo: 'Curso 3', nombre: 'curso3' },
        { titulo: 'Curso 4', nombre: 'curso4' },
      ];
    }
  }

  validarIdioma(idIdioma: number): void {
    this._spinner.start('validar');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' +
        this.estudiante.id + ':IGUAL,idIdioma~' + idIdioma + ':IGUAL;AND');
    this.acreditacionService.getListaAcreditacionIdiomaControlable(
        this.erroresConsultasAcre,
        urlParameter,
        false
    ).subscribe(
      response => {
          if (response.json().lista.length > 0) {
            (<FormControl>this.formularioBuscar.controls['idIdioma']).setValue('');
            this.constructorAdvertencia('Este idioma ya tiene acreditación, si ' +
                'requiere modificar algún valor debe editarlo', 1);
            this._spinner.stop('validar');
          }else {
            this._spinner.stop('validar');
          }
        }
    );
  }

  obtenerInformacionEstudiante(): void {
    if (this.validarFormulario()) {
      this.entidadEstudianteAcre = this.estudiante;
      this.obtenerEstudianteGrupoIdioma();
      this.definirEncabezado(this.idIdioma);
      this.obtenerEstudianteNivelIdiomaAdmision();
      (<FormControl>this.formularioAcreditacion.controls['idIdioma']).setValue(this.idIdioma);
    }
  }

  obtenerInformacionEstudianteEdicion(estudiante: Estudiante): void {
    this.entidadEstudianteAcre = estudiante;
    this.obtenerEstudianteGrupoIdioma();
    this.definirEncabezado(this.idIdioma);
    this.obtenerEstudianteNivelIdiomaAdmision();
    this.cargarDatosAcreditacion();
    (<FormControl>this.formularioAcreditacion.controls['idIdioma']).setValue(this.idIdioma);
  }

  cargarDatosAcreditacion(): void {
    this.acreditacionService.getAcreditacionIdioma(
        this.registroSeleccionado.id,
        this.erroresConsultasAcre,
        null
    ).subscribe(
      response => {
          this.entidadAcreditacionIdioma = new AcreditacionIdioma(response.json());

          (<FormControl>this.formularioBuscar.
              controls['idIdioma']).setValue
          (this.entidadAcreditacionIdioma.idioma.id);

          this.entidadAcreditacionIdioma = new AcreditacionIdioma(response.json());
          (<FormControl>this.formularioAcreditacion.
              controls['calificacionEvaluacionDiagnostica']).setValue
          (this.entidadAcreditacionIdioma.calificacionEvaluacionDiagnostica);
          this.dt2 = new Date (Date.parse(this.entidadAcreditacionIdioma.fechaEvaluacionDiagnostica));
          if (this.entidadAcreditacionIdioma.aplicaVencimiento) {
            this.dt1 = new Date (Date.parse(this.entidadAcreditacionIdioma.fechaVencimiento));
          }else { }
          (<FormControl>this.formularioAcreditacion.
              controls['idNivelIdioma']).setValue
          (this.entidadAcreditacionIdioma.nivelIdioma.id);
          (<FormControl>this.formularioAcreditacion.
              controls['documentoAcreditacion']).setValue
          (this.entidadAcreditacionIdioma.documentoAcreditacion);
          (<FormControl>this.formularioAcreditacion.
              controls['observaciones']).setValue
          (this.entidadAcreditacionIdioma.observaciones);
          (<FormControl>this.formularioAcreditacion.
              controls['acreditado']).setValue
          (this.entidadAcreditacionIdioma.acreditado);
          (<FormControl>this.formularioAcreditacion.
              controls['puntosCertificado']).setValue
          (this.entidadAcreditacionIdioma.puntosCertificado);
          (<FormControl>this.formularioAcreditacion.
              controls['aplicaVencimiento']).setValue
          (this.entidadAcreditacionIdioma.aplicaVencimiento);
          (<FormControl>this.formularioAcreditacion.
              controls['idIdioma']).setValue
          (this.entidadAcreditacionIdioma.idioma.id);
          (<FormControl>this.formularioAcreditacion.
              controls['idEstudiante']).setValue
          (this.entidadAcreditacionIdioma.estudiante.id);

          this.obtenerDocumentosProbatorioAcreditacion();

          if (this.entidadAcreditacionIdioma.aplicaVencimiento)
            this.habilitarFecha = true;
          else
            this.habilitarFecha = false;
        }
    );

  }

  obtenerDocumentosProbatorioAcreditacion(): void {
    this.documentosAcreditacionLista = [];
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAcreditacion~' +
      this.entidadAcreditacionIdioma.id + ':IGUAL');
    this._spinner.start('obtener');
    this.documentoProbatorioAcreditacionService.getListaDocumentoProbatorioControlable(
      this.erroresConsultasAcre,
      urlParameter,
      false
    ).subscribe(
      response => {
          this.registrosAcre = [];
          if (response.json().lista.length > 0) {
            response.json().lista.forEach((item) => {
              this.documentosAcreditacionLista.push(new DocumentoProbatorioAcreditacion(item));
            });

            if (this.documentosAcreditacionLista) {
              this.documentosAcreditacionLista.forEach((item) => {
                this.registrosAcre.push(new Registro(item.tipoDocumento.id,
                    item.archivo.id,
                    item.tipoDocumento.valor));
                this.validarDocumentos();
              });
              this._spinner.stop('obtener');
            }
          }
          this._spinner.stop('obtener');
        }
    );
  }

  obtenerEstudianteNivelIdiomaAdmision(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.entidadEstudianteAcre.id + ':IGUAL,'
        + 'idIdioma~' + this.idIdioma + ':IGUAL');
    this.idiomaEstudianteService.getListaIdiomaEstudiantePaginacion(
      this.erroresConsultasAcre,
      urlParameter
    ).subscribe(
      response => {
          if (response.json().lista.length > 0) {
            response.json().lista.forEach((item) => {
              this.entidadIdiomaEstudiante = new IdiomaEstudiante(item);
            });
          }
        }
    );
  }

  confirmarGuardarAcreditacion(): void {
    if (this.habilitarFecha == false) {
      (<FormControl>this.formularioAcreditacion.controls['fechaVencimiento']).reset();
    }

    if (this.validarFormularioAcreditacion()) {
      if (this.edicion)
        this.constructorConfirmacion('¿Está seguro de actualizar esta acreditación?', 1);
      else
        this.constructorConfirmacion('¿Está seguro de guardar esta acreditación?', 1);
    }
  }

  guardarAcreditacion(): void {
    if (this.edicion) {
      let jsonFormularioAcreditacion =
        JSON.stringify(this.formularioAcreditacion.value, null, 2);
      this.acreditacionService.putAcreditacionIdioma(
        this.entidadAcreditacionIdioma.id,
        jsonFormularioAcreditacion,
        this.erroresGuardado
      ).subscribe(
        response => {
          this.registrosAcre.forEach((registro) => {
            let urlParameter: URLSearchParams = new URLSearchParams();
            urlParameter.set('criterios', 'idAcreditacion~' +
                this.entidadAcreditacionIdioma.id + ':IGUAL,'
                + 'idArchivo~' + registro.idArchivo + ':IGUAL,' +
                'idTipoDocumento~' + registro.idTipo + ':IGUAL;AND');
            this.documentoProbatorioAcreditacionService.
            getListaDocumentoProbatorioControlable(
                this.erroresConsultasAcre,
                urlParameter,
                false
            ).subscribe(
                response => {
                  if (response.json().lista.length > 0) {
                  }else {
                    let json =
                        '{"idAcreditacion":"' +
                        this.entidadAcreditacionIdioma.id + '"' +
                        ', "idArchivo": "' + registro.idArchivo + '"' +
                        ', "idTipoDocumento": "' + registro.idTipo + '"}';
                    this.guardarDocumentoProbatorioAcreditacion(json);
                  }
                }
            );
          });
          this.onCambiosTabla();
          this.addErrorsMesaje
          ('La acreditación se actualizó correctamente', 'success' );
          this.cerrarModalAcreditarIdioma();
        },
        error => {
          console.error(error);
        }
      );
    } else {
      let jsonFormularioAcreditacion =
        JSON.stringify(this.formularioAcreditacion.value, null, 2);
      this.acreditacionService.postAcreditacionIdioma(
        jsonFormularioAcreditacion,
        this.erroresGuardado
      ).subscribe(
        response => {
          let idAcreditacion = response.json().id;
          this.registrosAcre.forEach((registro) => {
            let json =
                '{"idAcreditacion":"' + idAcreditacion + '"' +
                ', "idArchivo": "' + registro.idArchivo + '"' +
                ', "idTipoDocumento": "' + registro.idTipo + '"}';
            this.guardarDocumentoProbatorioAcreditacion(json);
          });
          this.onCambiosTabla();
          this.addErrorsMesaje('La acreditación se realizó correctamente', 'success' );
          this.cerrarModalAcreditarIdioma();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  guardarDocumentoProbatorioAcreditacion(json: String): void {
    this.documentoProbatorioAcreditacionService.
    postDocumentoProbatorioAcreditacion(
      json,
      this.erroresGuardado
    ).subscribe(
      response => {
        (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('1');
      }
    );
  }

  ocultarFechaVencimiento(): boolean {
    if (this.habilitarFecha) {
      return true;
    }else {
      return false;
    }
  }

  cambioRadioVencimiento(aplica: boolean): void {
    if (aplica === true) {
      this.habilitarFecha = true;
      (<FormControl>this.formularioAcreditacion.controls['aplicaVencimiento'])
        .setValue(true);
    }else {
      (<FormControl>this.formularioAcreditacion.controls['aplicaVencimiento'])
        .setValue(false);
      this.habilitarFecha = false;
    }
  }

  cambioRadioAcreditado(acreditado: boolean): void {
    if (acreditado === true) {
      (<FormControl>this.formularioAcreditacion.controls['acreditado'])
        .setValue(true);
    }else {
      (<FormControl>this.formularioAcreditacion.controls['acreditado'])
        .setValue(false);
    }
  }

  getTiposDocumentos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAreaDocumento~8:IGUAL');
    this.listaDocumentos = this.catTipoDocumentoService.
    getSelectTipoDocumentoCriterio(this.erroresConsultasAcre, urlParameter);
  }

  // //// picker ///
  getFechaVencimiento(): any {
    if (this.habilitarFecha) {
      if (this.dt1) {
        let fechaConFormato = moment(this.dt1).format('DD/MM/YYYY');
        (<FormControl>this.formularioAcreditacion.controls['fechaVencimiento'])
            .setValue(fechaConFormato + ' 10:30am');
        return fechaConFormato;
      } else {
        return moment(new Date()).format('DD/MM/YYYY');
      }
    }
  }

  // //// picker ///
  getFechaEvaluacionDiagnostica(): any {
    if (this.dt2) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      (<FormControl>this.formularioAcreditacion.controls['fechaEvaluacionDiagnostica'])
        .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  confirmarCancelar(): void {
    // console.log('LENGTH______________' + this.documentosAcreditacionLista.length);
    if (this.edicion) {
      if (this.documentosAcreditacionLista.length > 0){
        this.constructorAdvertencia('¿Está seguro de cancelar la acreditación?', 4);
      }else {
        this.constructorAdvertencia('No se puede cancelar porque los nuevos registros ' +
          'se perderan y debe haber por lo menos uno guardado', 1);
      }
    }else {
      this.constructorAdvertencia('¿Está seguro de cancelar la acreditación?', 4);
    }
  }

  eliminarArchivosCancelar(): void {
    if (this.edicion) {
      // console.log('ENTRATRATR');
      let encontrado: boolean = false;
      this.registrosAcre.forEach((archivos) => {
        this.documentosAcreditacionLista.forEach((archivosDC) => {
              if (archivos.idArchivo === archivosDC.archivo.id) {
                encontrado = true;
              }
            }
        );

        if (encontrado === true) {
          // console.log('El archivo ' + archivos.idArchivo + 'se encuentra en documentos');
          encontrado = false;
        }else {
          // console.log('El archivo ' + archivos.idArchivo + ' No se encuentra en documentos');
          this.registroSeleccionadoAcre = archivos;
          this.eliminarRegistro();
          encontrado = false;
        }
      });

    }else {
      // console.log('Entra:::');
      if (this.registrosAcre.length > 0) {
        this.registrosAcre.forEach((registro) => {
          this.registroSeleccionadoAcre = registro;
          this.eliminarRegistro();
        });
      }
    }
    this.cerrarModalAcreditarIdioma();
  }

  eliminarDocumentoEdicion() {
    if (this.edicion) {
      this.documentosAcreditacionLista.forEach((archivosDC) => {
        if (this.registroSeleccionadoAcre.idArchivo === archivosDC.archivo.id) {
          this.documentoProbatorioAcreditacionService
            .deleteDocumentoProbatorioAcreditacion(
              archivosDC.id,
              this.erroresConsultasAcre
            ).subscribe(
            response => {
              this.obtenerDocumentosProbatorioAcreditacion();
              this.eliminarRegistro();
            },
            error => {
              // console.log(error);
            }
          );
        }else {
          this.eliminarRegistro();
        }
      });
    }else {
      this.eliminarRegistro();
    }
  }

  eliminarRegistro(): void {  // ELIMINAR ARCHIVO
    if (this.registroSeleccionadoAcre) {
      this.archivoService.deleteArchivo(
        this.registroSeleccionadoAcre.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => {
          let auxiliar: Array<Registro> = [];
          for (let i = 0; i < this.registrosAcre.length; i++) {
            if (this.registroSeleccionadoAcre.idArchivo !==
                this.registrosAcre[i].idArchivo) {
              auxiliar.push(this.registrosAcre[i]);
            }
          }
          this.registrosAcre = auxiliar;
          this.registroSeleccionadoAcre = null;
          this.validarDocumentos();
        }
      );
    }
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.idArchivo = responseJson.id;
        this.agregarRegistro();
        (<FormControl>this.formularioAcreditacion.controls['seteador'])
            .setValue('');
        this.nombreArchivo = responseJson.originalName;
      }
    });
  }

  agregarRegistro(): void {
    for (let i = 0; i < this.registrosAcre.length; i++) {
      if (this.tipoArchivo == this.registrosAcre[i].idTipo) {
        this.acceso = false;
        break;
      }
    }
    if (this.acceso) {
      this.registrosAcre.push(new Registro(this.tipoArchivo, this.idArchivo, this.nombreArchivo));
      this.validarDocumentos();
      this.resetearValores();
    } else {
      this.addErrorsMesajeAgre(
        'No puedes subir otro documento de tipo ' + this.nombreArchivo,
        'danger'
      );
      this.resetearValores();
      this.acceso = true;
    }

  }

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  handleDropUpload(data): void {
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

  addErrorsMesajeAgre(mensajeError, tipo): void {
    this.alertasAcre.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  resetearValores(): void {
    this.tipoArchivo = null;
    this.idArchivo = null;
    this.nombreArchivo = null;
  }

  agregarDocumento(valor: string): void {
    let algo: Array<any> = valor.split('-');
    this.tipoArchivo = algo[0];
    this.nombreArchivo = algo[1];
  }

  habilitarOtro(id: number): void {
    console.log('habilitarOtro: ', id);
    if (id == Number('35-Otro')) {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('');
    } else {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('aux');
    }
  }

  cambiarAuxiliar(): void {
    (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue(
        this.getControl('otroTipoDocumento').value
    );
  }

  rowSeleccionadoAcre(registro): boolean {
    return (this.registroSeleccionadoAcre === registro);
  }

  rowSeleccionAcre(registro): void {
    if (this.registroSeleccionadoAcre !== registro) {
      this.registroSeleccionadoAcre = registro;
    } else {
      this.registroSeleccionadoAcre = null;
    }
  }

  validarDocumentos(): void {
    if (this.registrosAcre.length > 0) {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('1');
    } else {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('');
    }
  }

  mostrarBotones(): boolean {
    if (this.registroSeleccionadoAcre) {
      return true;
    }else {
      return false;
    }
  }

  validarFormulario(): boolean {
    if (this.formularioBuscar.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarFormularioAcreditacion(): boolean {
    if (this.formularioAcreditacion.valid) {
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
          resultado += this.mensajeErrors[errorType] + ' ';
        }
      }
    }
    return resultado;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioBuscar.controls[campo]);
  }

  getControlFormAcreditacion(campo: string): FormControl {
    return (<FormControl>this.formularioAcreditacion.controls[campo]);
  }

  private autocompleteOnSelect(e) {
    if (e.id) {
      // (<FormControl>this.formularioBuscar.controls['matricula']).setValue(a);
      this.estudianteServiceAcre.getEntidadEstudiante(e.id, this.erroresConsultasAcre
      ).subscribe(
        response => {
          this.matriculaSelAutocomplete = new Estudiante(response.json());
          this.estudiante = this.matriculaSelAutocomplete;
        },
        error => {

        }
        /*       () => {
         if (this.estudiante)
         this.filtrarIdioma();
         } */
      );
    }
  }
  filtroAutocompleteChanged(): void {
    this.estudiante = null;
  }
  private pruebaMatricula(mat) {
    (<FormControl>this.formularioBuscar.controls['matricula']).setValue(mat);
  }


  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioBuscar.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private getControlErrorsFormAcreditacion(campo: string): boolean {
    if (!(<FormControl>this.formularioAcreditacion.controls[campo]).
            valid && this.validacionActiva) {
      return true;
    }
    return false;
  }


  private prepareServicesAcre(): void {
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.idiomaService = this._catalogosServices.getIdioma();
    this.matriculaService = this._catalogosServices.getMatriculas();
    this.estudianteGrupoIdioma = this._catalogosServices.getEstudianteGrupoIdiomaService();
    this.catNivelIdiomaService = this._catalogosServices.getNivelIdioma();
    this.catTipoDocumentoService = this._catalogosServices.getTipoDocumento();
    this.idiomaEstudianteService = this._catalogosServices.getIdiomaEstudiante();
    this.archivoService = this._catalogosServices.getArchivos();
    this.acreditacionService = this._catalogosServices.getAcreditacionIdiomaService();
    this.documentoProbatorioAcreditacionService =
        this._catalogosServices.getDocumentoProbatorioAcreditacionService();

    this.opcionesProgramaDocente =
        this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultasAcre);

    this.opcionesNivelIdioma =
        this.catNivelIdiomaService.getSelectNivelIdioma(this.erroresConsultasAcre);


    this.opcionesCatIdiomas = this.idiomaService.getSelectIdioma(this.erroresConsultasAcre);
  }

  private modalAcreditarIdioma(): void {
    this.modalAcreditar.open('lg');
  }
  private cerrarModalAcreditarIdioma(): void {
    this.registroSeleccionado = null;
    this.modalAcreditar.close();
  }
  // ------------------------------------ MODAL DETALLE ----------------------------------------//
  idAcreditacion;
  entidadAcreditacion: AcreditacionIdioma;
  private erroresConsultasDetalle: Array<ErrorCatalogo> = [];
  registrosDocumentos;

  private constructorDetalleAcreditar(): void {
  this.erroresConsultasDetalle = [];
  this.registrosDocumentos = null;

    if (this.registroSeleccionado) {
      this.idAcreditacion = this.registroSeleccionado.id;
      this.acreditacionIdiomaService
        .getEntidadAcreditacionIdioma(
          this.idAcreditacion,
          this.erroresConsultasDetalle
        ).subscribe(
        response => {
          this.entidadAcreditacion
              = new AcreditacionIdioma(response.json());
          // console.log(this.entidadAcreditacion);
        },
        error => {

        },
        () => {

        }
      );
      this.cargarListaDocumentos();
      this.modalDetalleAcreditar();
    }
  }

  cargarListaDocumentos(): any {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idAcreditacion~' + this.idAcreditacion + ':IGUAL';
    // console.log(criterios);
    urlSearch.set('criterios', criterios);
    // console.log(urlSearch);

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<DocumentoProbatorioAcreditacion>
    }  =
      this.documentoProbatorioAcreditacionServiceDetalle.getListaDocumentoProbatorioAcreditacion(
        this.erroresConsultasDetalle, urlSearch, false);
    this.registrosDocumentos = resultados.lista;

    // console.log(resultados.lista);
    // console.log('pruebas');
    // console.log(resultados.lista);
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultasDetalle)
        .subscribe(
          data => {
            let json = data.json();
            let url =
                ConfigService.getUrlBaseAPI() +
                '/api/v1/archivovisualizacion/' +
                id +
                '?ticket=' +
                json.ticket;
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            // console.log('Error downloading the file.');
            this._spinner.stop('verArchivo');
          },
          () => {
            console.info('OK');
            this._spinner.stop('verArchivo');
          }
        );
    }
  }

  descargarArchivo(id: number): void {
    // console.log('descarga');
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargar');
      this._archivoService.generarTicket(
        jsonArchivo,
        this.erroresConsultasDetalle
      ).subscribe(
        data => {
          let json = data.json();
          let url =
            ConfigService.getUrlBaseAPI() +
            '/api/v1/archivodescargar/' +
            id +
            '?ticket=' +
            json.ticket;
          window.open(url);
        },
          error => {
            // console.log('Error downloading the file.');
            this._spinner.stop('descargar');
          },
          () => {
            console.info('OK');
            this._spinner.stop('descargar');
          }
        );
    }
  }
  private modalDetalleAcreditar(): void {
    this.modalDetalle.open('lg');
  }
  private cerrarModalDetalleAcreditar(): void {
    this.modalDetalle.close();
  }

  // ------------------------------------ MODAL ADVERTENCIA ----------------------------------------//
  mensajeAdvertencia: String;
  tipoGuardado: number;
  private constructorAdvertencia(mensajeAdvertencia: String, tipoGuardado: number): void {
    this.mensajeAdvertencia = mensajeAdvertencia;
    this.tipoGuardado = tipoGuardado;
    this.modalAdvertenciaIdiomas();
  }
  opcionCancelado(): void {
    if (this.tipoGuardado == 1) {
      this.cerrarModalAdvertenciaIdiomas();
    }
    if (this.tipoGuardado == 2) {
      this.cerrarModalAdvertenciaIdiomas();
      this.cerrarModalAcreditarIdioma();
    }

    if (this.tipoGuardado == 3) {
      this.eliminarDocumentoEdicion();
      this.cerrarModalAdvertenciaIdiomas();
    }

    if (this.tipoGuardado == 4) {
      // console.log('Entra a 4');
      this.eliminarArchivosCancelar();
      this.cerrarModalAdvertenciaIdiomas();
    }
  }
  private modalAdvertenciaIdiomas(): void {
    this.modalAdvertencia.open();
  }
  private cerrarModalAdvertenciaIdiomas(): void {
    this.modalAdvertencia.close();
  }

  // ------------------------------------ MODAL CONFIRMACION ----------------------------------------//
  mensajeAdvertenciaConfirm: String;
  tipoGuardadoConfirm: number;
  private constructorConfirmacion(mensajeAdvertencia: String, tipoGuardado: number): void {
    this.mensajeAdvertenciaConfirm = mensajeAdvertencia;
    this.tipoGuardadoConfirm = tipoGuardado;
    this.modalConfirmacionIdiomas();
  }

  opcionGuardado(): void {
    // console.log('ENTRA A OPCION');
    // console.log('this.tipoGuardado::' + this.tipoGuardado);
    if (this.tipoGuardadoConfirm == 1) {
      this.cerrarModalConfirmacionIdiomas();
      this.guardarAcreditacion();
    }
    /*      if (this.tipoGuardado == 2) {
     // console.log('entra MI:::>>>' + this.tipoGuardado);
     this.dialog.close();
     this.context.componenteLista.enviarFormulario();
     }*/
  }
  private modalConfirmacionIdiomas(): void {
    this.modalConfirmacion.open();
  }
  private cerrarModalConfirmacionIdiomas(): void {
    this.modalConfirmacion.close();
  }

limpiarVariablesSession() {
    sessionStorage.removeItem('idiomasAcreditacionCriterios');
    sessionStorage.removeItem('idiomasAcreditacionOrdenamiento');
    sessionStorage.removeItem('idiomasAcreditacionLimite');
    sessionStorage.removeItem('idiomasAcreditacionPagina');
  }

}
