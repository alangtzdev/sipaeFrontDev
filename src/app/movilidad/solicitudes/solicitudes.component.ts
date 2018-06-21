import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {MovilidadCurricular} from "../../services/entidades/movilidad-curricular.model";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {MovilidadCurricularService} from "../../services/entidades/movilidad-curricular.service";
import {DocumentoMovilidadCurricularService} from "../../services/entidades/documento-movilidad-curricular.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {AuthService} from "../../auth/auth.service";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {DocumentoMovilidadCurricular} from "../../services/entidades/documento-movilidad-curricular.model";
import {ConfigService} from "../../services/core/config.service";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css']
})
export class SolicitudesComponent {

  @ViewChild('detalleMovilidad')
  detalleMovilidadCoordinacion: ModalComponent;
  @ViewChild('rechazarSolMovilidad')
  rechazarSolMovilidad: ModalComponent;
  @ViewChild('confirmarAceptarSolMovilidad')
  confirmarAceptarSolMovilidad: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<MovilidadCurricular> = [];
  criteriosCabezera: string = '';
  usuarioRol: UsuarioRoles;
  modalidadService;
  promocionService;
  catalogoServices;
  usuarioRolService;
  archivoService;
  documentoMovilidadService;
  criteriosDefecto: string = '';
  registroSeleccionado: MovilidadCurricular;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,'
      + 'idEstudiante.idDatosPersonales.primerApellido,'
      + 'idEstudiante.idDatosPersonales.segundoApellido,'
      + 'idEstudiante.idMatricula.matriculaCompleta,'
      + 'idTipoMovilidad.valor,'
      + 'institucionInteres,lugar,idConvenio.idInstitucion.nombre,'
      + 'idEstatus.valor'
    }
  };
  columnas: Array<any> = [
    { titulo: 'Matrícula*', nombre: 'idMatricula', sort: false},
    { titulo: 'Estudiante *', nombre: 'idEstudiante' },
    { titulo: 'Modalidad*', nombre: 'idTipoMovilidad.valor', sort: false },
    { titulo: 'Universidad o Institución*', nombre: 'idConvenio', sort: false},
    { titulo: 'Estatus*', nombre: 'idEstatus.valor', sort: false }
  ];
  private opcionesPromocion: Array<ItemSelects> = [];
  private opcionesSelectModalidad: Array<ItemSelects>;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  //variables detalle movilidad
  entidadDetalleMoilidad: MovilidadCurricular;
  solicitudActiva: boolean= false;
  registroSeleccionadoDocumento: DocumentoMovilidadCurricular;
  registrosDocumentos: Array<DocumentoMovilidadCurricular> = [];
  columnasDetalle: Array<any> = [
    { titulo: 'Documento', nombre: 'idArchivo', sort: false },
    { titulo: 'Fecha actualización', nombre: 'fechaActualizacion', sort: false}
  ];

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public movilidadCurricularService: MovilidadCurricularService,
              private _spinner: SpinnerService,
              authService : AuthService,
              private _archivoService: ArchivoService,
              private _documentoMovilidadService: DocumentoMovilidadCurricularService) {
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado(); //Seguridad.getUsuarioLogueado();
    this.prepareServices();
    this.recuperarPermisosUsuarioYPromocion(usuarioLogueado.id);
    this.inicializarFormularioConfirmarsolicitud();
    this.inicializarFormularioRechazar();

  }
  recuperarPermisosUsuarioYPromocion(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this._spinner.start("solicitudes1");
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
        });
      },
      error => {
        this._spinner.stop("solicitudes1");
      },
      () => {
        this._spinner.stop("solicitudes1");
        this.obtenerPromocionUsuarioLogeado();
      }
    );
  }
/*  modalDetalleMovilidad(): void {
    let idMovilidadCurricular: number;

    if (this.registroSeleccionado) {
      idMovilidadCurricular = this.registroSeleccionado.id;
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('lg', true, 27);

      let modalSolicitud = new ModalDetalleMovilidadData(
        this,
        idMovilidadCurricular
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalSolicitud}),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleMovilidad,
        bindings,
        modalConfig
      );
    }
  }*/

  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  buscarCriteriosCabezera(
    idPromocion: number,
    idTipoMovilidad: number
  ): void {
    console.log(idPromocion);
    this.criteriosCabezera = '';
    if (idPromocion && !idTipoMovilidad) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL';
    }else if (idTipoMovilidad && !idPromocion) {
      this.criteriosCabezera = 'idTipoMovilidad.id~'
        + idTipoMovilidad + ':IGUAL';
    }else if (idPromocion && idTipoMovilidad) {
      this.criteriosCabezera = 'idTipoMovilidad.id~'
        + idTipoMovilidad + ':IGUAL,'
        + 'idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL;AND';
    }
/*    if (assertionsEnabled()) {
      //console.log('idPromocion', idPeriodoEscolar);
      //console.log('idTipoMovilidad', idTipoMovilidad);
    }*/
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    criterios = 'idEstudiante.idPromocion.idProgramaDocente.id~'
      + this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
    if (this.criteriosCabezera !== '') {
      criterios += ';AND,' + this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {

      let filtrosCriterio: Array<string> = this.configuracion.filtrado.textoFiltro.split(' ');
      let filtros: Array<string> = [];
/*      if (assertionsEnabled()) {
        //console.log('filstros 2:::' + filtrosCriterio + 'tamaño' + filtrosCriterio.length);
      }*/
      if (filtrosCriterio.length >= 1 && criterios != '')
        criterios = criterios + ';ANDGROUPAND';
      if (filtrosCriterio.length >= 1 ) {
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
        if (filtrosCriterio.length > 2) {
          filtros = this.configuracion.filtrado.columnas.split(',');
          filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
              filtrosCriterio[2] + ':LIKE;OR';
          });
        }
      }

      urlSearch.set('criterios', criterios);
    }

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
/*    if (assertionsEnabled()) {
      //console.log('urlSearch::' + urlSearch);
      //console.log('criteriosss::' + criterios);
    }*/
    this._spinner.start("solicitudes2");
    this.movilidadCurricularService.
    getListaMovilidadCurricularSimple(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
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
          this.registros.push(new MovilidadCurricular(item));
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("solicitudes2");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("solicitudes2");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
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
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
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

  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  private obtenerPromocionUsuarioLogeado(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idProgramaDocente~' +
      this.usuarioRol.usuario.programaDocente.id + ':IGUAL');
    this.opcionesPromocion =
      this.promocionService.getSelectPromocion(this.erroresConsultas, urlSearch);
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.modalidadService = this._catalogosService.getTipoMovilidadService();
    this.promocionService = this._catalogosService.getPromocion();
    this.opcionesSelectModalidad =
      this.modalidadService.getSelectTipoMovilidad(this.erroresConsultas);
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.archivoService = this._catalogosService.getArchivos();
    this.documentoMovilidadService =
      this._catalogosService.getDocumentoMovilidadCurricularService();
  }


  ///Detalle de movilidad


  modalDetalleMovilidad() {
    this.getEntidadByIDMovilidad();
    this.getMovilidadDocumento();
    this.detalleMovilidadCoordinacion.open('lg');
  }

  getEntidadByIDMovilidad() {
    this.movilidadCurricularService.
    getEntidadMovilidadCurricular(
      this.registroSeleccionado.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this._spinner.start('datosMovilidadDetalle');
        this.entidadDetalleMoilidad
          = new MovilidadCurricular(response.json());
        if (this.entidadDetalleMoilidad.estatus.id == 1230) {
          this.solicitudActiva = true;
        }else {
          this.solicitudActiva = false;
        }
      },
      error => {
        /*if (assertionsEnabled()) {
         console.error(error);
         console.error(this.erroresConsultas);
         }*/
        this._spinner.stop('datosMovilidadDetalle');
      },
      () => {
        /*if (assertionsEnabled()) {
         //console.log(this.entidadDetalleMoilidad);
         }*/
        this._spinner.stop('datosMovilidadDetalle');
      }
    );
  }

  getMovilidadDocumento(): void {
    this.registrosDocumentos = [];
    this._spinner.start('documentosMovilidad');
    /*this.movilidadCurricularService.getMovilidad(
     this.registroSeleccionado.id,
     this.erroresConsultas
     ).subscribe(
     response => {
     this.entidadDetalleMoilidad = new MovilidadCurricular(response.json());*/
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMovilidad.id~'
      + this.registroSeleccionado.id + ':IGUAL');
    this._documentoMovilidadService
      .getListaDocumentoMovilidadCurricularOpcional(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
      response => {
        response.json().lista.forEach((documento) => {
          this.registrosDocumentos.push( new DocumentoMovilidadCurricular(documento));
        });
      },
      error => {
        this._spinner.stop('documentosMovilidad');
      },
      () => {
        this._spinner.stop('documentosMovilidad');
      }
    );
    /*},
     error => {
     this._spinner.stop('documentosMovilidad');
     },
     () => {
     this._spinner.stop('documentosMovilidad');
     }
     );*/
  }

  rowSeleccionadoDetalle(registro): boolean {
    return (this.registroSeleccionadoDocumento === registro);
  }
  rowSeleccionDetalle(registro): void {
    if (this.registroSeleccionadoDocumento !== registro) {
      this.registroSeleccionadoDocumento = registro;
    } else {
      this.registroSeleccionadoDocumento = null;
    }
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
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
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            this._spinner.stop('verArchivo');
          },
          () => {
            this._spinner.stop('verArchivo');
          }
        );
    }
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
            this._spinner.stop('descargarArchivo');
          },
          () => {
            this._spinner.stop('descargarArchivo');
          }
        );
    }

  }

  mostrarBotonesDetalle(): boolean {
    if (this.registroSeleccionadoDocumento) {
      return true;
    }else {
      return false;
    }
  }

  //variables modal rechazar
  formularioRechazar: FormGroup;
  validacionActiva: boolean = false;
  alumnoSolicitud: MovilidadCurricular;
  idUsuarioCoordinador: number;
  idPlantilla: number;

  inicializarFormularioRechazar() {
    this.formularioRechazar = new FormGroup({
      comentarioTutor: new FormControl('', Validators.required),
      idEstatus: new FormControl('1221')
    });
  }

  modalRechazarSolicitud() {
    this.detalleMovilidadCoordinacion.close();
    this.validacionActiva = false;
    this.alumnoSolicitud = this.entidadDetalleMoilidad;
    this.inicializarFormularioRechazar();
    this.definirPlantilla('rechazarMovilidad');
    this.obtenerIdCoordinador();
    this.rechazarSolMovilidad.open('sm');
  }

  cerrarModalRechazarSolicitud() {
    this.rechazarSolMovilidad.close();
  }

  obtenerIdCoordinador(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idRol~2:IGUAL,' + 'idUsuario.idProgramaDocente.id~'
      + this.entidadDetalleMoilidad.estudiante.promocion.programaDocente.id + ':IGUAL;AND');

    this._catalogosService
      .getUsuarioRolService().getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        this.idUsuarioCoordinador = response.json().lista[0].id_usuario.id;
      },
      error => {

      },
      () => {

      }
    );
  }

  definirPlantilla(decision): void {
    if (decision === 'rechazarMovilidad'){
      if (this.entidadDetalleMoilidad.tipoMovilidad.id === 1) {
        this.idPlantilla = 16;
      } else if (this.entidadDetalleMoilidad.tipoMovilidad.id === 2) {
        this.idPlantilla = 46;
      } else {
        this.idPlantilla = 47;
      }
    } else if (decision === 'aceptatMovilidad') {
      if (this.entidadDetalleMoilidad.tipoMovilidad.id === 1) {
        this.idPlantilla = 17;
      } else if (this.entidadDetalleMoilidad.tipoMovilidad.id === 2) {
        this.idPlantilla = 44;
      } else {
        this.idPlantilla = 45;
      }
    }

  }

  validarFormularioModalRechazar(): boolean {
    if (this.formularioRechazar.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  // rechazar solicitud id Estatus 1221 = Denegada
  enviarFormularioModalRechazar(): void {
    if (this.validarFormularioModalRechazar()) {
      let json = JSON.stringify(this.formularioRechazar.value, null, 2);
      // let json = '{"idEstatus": "1221"}';
      this.saveUpdateMovilidad(json, 'rechazarMovilidad');
    }
  }

  enviarCorreoRechazadoDocencia(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      asunto: new FormControl('Rechazo de solicitud por coordinación académica'),
      entidad: new FormControl({ MovilidadCurricular: this.registroSeleccionado.id,
        usuarios: this.idUsuarioCoordinador}),
      idPlantillaCorreo: new FormControl(this.idPlantilla)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.envioCorreosGeneral(jsonFormulario);

  }

  envioCorreosGeneral(jsonDatosCorreo) {
    this._spinner.start('envioCorreos');
    this._catalogosService.getEnvioCorreoElectronicoService()
      .postCorreoElectronico(
        jsonDatosCorreo,
        this.erroresConsultas
      ).subscribe(
      response => {},
      error => {
        this._spinner.stop('envioCorreos');
      },
      () => {
        this._spinner.stop('envioCorreos');
      }
    );
  }

  enviarCorreoRechazadoAlumno(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(
        this.alumnoSolicitud.estudiante.usuario.email), // correo del alumno
      asunto: new FormControl('Rechazo de solicitud por director de tésis'),
      entidad: new FormControl({ MovilidadCurricular: this.registroSeleccionado.id,
        usuarios: this.idUsuarioCoordinador}),
      idPlantillaCorreo: new FormControl(this.idPlantilla)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.envioCorreosGeneral(jsonFormulario);
  }

  getControlModalRechazar(campo: string): FormControl {
    return (<FormControl>this.formularioRechazar.controls[campo]);
  }

  getControlErrorsModalRechazar(campo: string): boolean {
    if (!(<FormControl>this.formularioRechazar.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
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
    return resultado;
  }

  cerrarModalDetalleMov() {
    this.detalleMovilidadCoordinacion.close();
  }

  //variables modal confirmar solicitud
  formularioConfirmaar: FormGroup;

  inicializarFormularioConfirmarsolicitud() {
    this.formularioConfirmaar = new FormGroup({
      comentarioTutor: new FormControl('', Validators.required),
      idEstatus: new FormControl('1218')
    });
  }

  modalConfirmarSolicitud() {
    this.detalleMovilidadCoordinacion.close();
    this.validacionActiva = false;
    this.alumnoSolicitud = this.entidadDetalleMoilidad;
    this.inicializarFormularioConfirmarsolicitud();
    this.definirPlantilla('aceptatMovilidad');
    this.obtenerIdCoordinador();
    this.confirmarAceptarSolMovilidad.open('sm');
  }

  cerrarModalConfirmarSolicitud() {
    this.confirmarAceptarSolMovilidad.close();
  }

  validarFormularioModalConfirmar(): boolean {
    if (this.formularioConfirmaar.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  // aceptar solicitud id Estatus 1230 = aceptada
  enviarFormularioModalConfirmar(): void {
    if (this.validarFormularioModalConfirmar()) {
      let json = JSON.stringify(this.formularioConfirmaar.value, null, 2);
      this.saveUpdateMovilidad(json, 'aceptarMovilidad')
    }
  }

  saveUpdateMovilidad(json, decision){
    this._spinner.stop('saveMovilidad');
    this.movilidadCurricularService
      .putMovilidadCurricular(
        this.registroSeleccionado.id,
        json,
        this.erroresConsultas
      ).subscribe(
      response => {
      },
      error => {
        this._spinner.stop('saveMovilidad');

      },
      () => {
        this._spinner.stop('saveMovilidad');
        this.onCambiosTabla();
        switch (decision) {
          case 'aceptarMovilidad':
            this.cerrarModalConfirmarSolicitud();
            this.cerrarModalDetalleMov();
            this.enviarCorreoAceptadoDocencia();
            this.enviarCorreoAceptadoAlumno();
            break;
          case 'rechazarMovilidad':
            this.cerrarModalRechazarSolicitud();
            this.cerrarModalDetalleMov();
            this.enviarCorreoRechazadoDocencia();
            this.enviarCorreoRechazadoAlumno();
            break;
          default:
            console.log(decision,'-----Algo anda mal aqui...-----------');
            break
        }

      }
    );
  }

  enviarCorreoAceptadoDocencia(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      entidad: new FormControl({ movilidadCurricular: this.registroSeleccionado.id,
        usuarios: this.idUsuarioCoordinador}),
      idPlantillaCorreo: new FormControl(this.idPlantilla)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.envioCorreosGeneral(jsonFormulario);
  }

  enviarCorreoAceptadoAlumno(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(
        this.alumnoSolicitud.estudiante.usuario.email), // correo alumno
      entidad: new FormControl({ movilidadCurricular: this.registroSeleccionado.id,
        usuarios: this.idUsuarioCoordinador}),
      idPlantillaCorreo: new FormControl(this.idPlantilla)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.envioCorreosGeneral(jsonFormulario);
  }

  getControlModalConfirmar(campo: string): FormControl {
    return (<FormControl>this.formularioConfirmaar.controls[campo]);
  }

  getControlErrorsModalConfirmar(campo: string): boolean {
    if (!(<FormControl>this.formularioConfirmaar.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  /*modalRechazarSolicitud(): void {
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('sm', true, 27);

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: new ModalRechazarSolicitudProfesorData(
   this,
   this.context.idMovilidadCurricular
   )
   }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>ModalRechazarSolicitudProfesor,
   bindings,
   modalConfig
   );
   }

   modalConfirmarSolicitud(): void {
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('sm', true, 27);

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: new ModalConfirmarSolicitudProfesorData(
   this,
   this.context.idMovilidadCurricular
   )
   }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
   provide(Renderer, { useValue: this._renderer })
   ]);

   dialog = this.modal.open(
   <any>ModalConfirmarSolicitudProfesor,
   bindings,
   modalConfig
   );
   }*/

/*  constructor() { }

  ngOnInit() {
  }

  mostrarBotones(): boolean {
    return true;
  }*/

}
