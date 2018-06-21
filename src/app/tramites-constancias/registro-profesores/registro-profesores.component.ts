import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild, NgZone, Inject} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {GestionInstitucional} from "../../services/entidades/gestion-institucional.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {GestionInstitucionalService} from "../../services/entidades/gestion-institucional.service";
import {Router} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {ConfigService} from "../../services/core/config.service";
import {NgUploaderOptions} from "ngx-uploader";
import * as moment from "moment";
import {Validacion} from "../../utils/Validacion";
import {ErrorCatalogo} from "../../services/core/error.model";
import {GestionDocumentosInstitucionalService} from "../../services/entidades/gestion-documentos-institucional.service";
import {PromocionServices} from "../../services/entidades/promocion.service";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {Promocion} from "../../services/entidades/promocion.model";
import {GestionDocumentosInstitucional} from "../../services/entidades/gestion-documentos-institucional.model";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-registro-profesores',
  templateUrl: './registro-profesores.component.html',
  styleUrls: ['./registro-profesores.component.css']
})

export class RegistroProfesoresComponent implements OnInit {

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<GestionInstitucional> = [];
  columnas: Array<any> = [
    {titulo: 'Programa Docente*', nombre: 'idProgramaDocente.descripcion'},
    {titulo: 'Trámite*', nombre: 'tramite'},
    {titulo: 'Fecha de trámite', nombre: 'fechaRegistro'},
    {titulo: 'Fecha de autorización del consejo académico', nombre: 'fechaResolucionDictamen'},
  ];
  registroSeleccionado: GestionInstitucional;

  exportarExcelUrl = '';
  exportarPDFUrl = '';
  formulario: FormGroup;
  public configuracion: any = {
    paginacion: true,
    filtrado: {textoFiltro: '',
      columnas: 'idProgramaDocente.descripcion,tramite'}
  };

  // se declaran variables para consultas de base de datos
  DGPService;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(//private modal: Modal,
              @Inject(NgZone) private zone: NgZone,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public _gestionInstitucionaService: GestionInstitucionalService,
              public documentosGestionService: GestionDocumentosInstitucionalService,
              private router: Router,
              public promocionService: PromocionServices,
              private _archivoService: ArchivoService,
              public spinner: SpinnerService) {
    this.zone = new NgZone({ enableLongStackTrace: false});
    this.inicializarOpcionesNgZone();

    this.formularioDGP = new FormGroup({
      idProgramaDocente: new FormControl(''),
      tramite: new FormControl(''),
      descripcion: new FormControl(''),
      fechaRegistro: new FormControl(''),
      fechaResolucionDictamen: new FormControl(''),
      idPromocion: new FormControl(''),
      vigencia: new FormControl(''),
      seteador: new FormControl(''),
      //auxiliar: new Control('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
    this.columnas.forEach((column) => {
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
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
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
    this.spinner.start("registroprofesores1");
    this._gestionInstitucionaService.getListaGestionInstitucionalPaginacion(
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
          this.registros.push(new GestionInstitucional(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this.spinner.stop("registroprofesores1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop("registroprofesores1");
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
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

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
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

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
     /*   if (assertionsEnabled()) {
          //console.log(this.exportarExcelUrl);
        }*/
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  /////////////////////////////// MODALS /////////////////////////////////////////////

  @ViewChild('modalAgreActu')
  modalAgreActu: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //////////////////////////////////////// MODAL AGREGAR-EDITAR ////////////////////////////
  idRegistroDGP: number;
  edicionFormulario: boolean = false;
  formularioDGP: FormGroup;
  entidadGestionInstntitucional: GestionInstitucional;
  catalogoProgramaDocente;
  catalogoPromociones;
  nombreDocumentoSoporte;
  promocionSelecionada: Promocion;
  vigencia: string;
  idArchivo: number;

  columnasAR: Array<any> = [
    { titulo: 'Archivo', nombre: 'idArchivoSoporte', sort: false }
  ];
  public registrosDocumentos: Array<GestionDocumentosInstitucional> = [];
  registroSeleccionadoAR: GestionDocumentosInstitucional;

  validacionActiva: boolean = false;

  options: NgUploaderOptions;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  tipoArchivo: number;
  nombreArchivo: string;
  acceso: boolean = true;

  ////// picker ///
  dt: Date;
  dt2: Date;

  private opcionesCatalogoProgramaDocente: Array<ItemSelects> = [];
  private opcionesCatalogoPromociones: Array<ItemSelects> = [];
  private erroresConsultasAR: Array<ErrorCatalogo> = [];
  private erroresGuardadoAR: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      //filterExtensions: true,
      //allowedExtensions: ['jpg','JPG','jpeg','JPEG','PNG','png'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  private constructorAR(modo): void {
    if (modo === 'editar' && this.registroSeleccionado) {
      this.idRegistroDGP = this.registroSeleccionado.id;
    }else {
      this.idRegistroDGP = null;
    }
    this.edicionFormulario = false;

    this.registrosDocumentos = [];
    this.validacionActiva = false;
    this.vigencia = "";
    this.registroSeleccionadoAR = null;

    this.basicProgress = 0;
    this.dropProgress = 0;
    this.dropResp = [];
    this.acceso = true;

    ////// picker ///
    this.dt = new Date();
    this.dt2 = new Date();

    this.opcionesCatalogoProgramaDocente = [];
    this.opcionesCatalogoPromociones = [];
    this.erroresConsultasAR = [];
    this.erroresGuardadoAR = [];
    this.alertas = [];

    this.prepareServicesAR();
    moment.locale('es');
    this.inicializarOpcionesNgZone();

    this.formularioDGP = new FormGroup({
      // Sera necesario cambiar el nombre de la variables
      // al nombre que se muestre en la API
      // cuando se carge la entidad
      idProgramaDocente: new FormControl('', Validators.required),
      tramite: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      descripcion: new FormControl('', Validators.
      compose([Validacion.parrafos])),
      fechaRegistro: new FormControl(''),
      fechaResolucionDictamen: new FormControl(''),
      idPromocion: new FormControl('', Validators.required),
      vigencia: new FormControl('', Validators.
      compose([Validacion.parrafos])),
      seteador: new FormControl(''),
      //auxiliar: new Control('', Validators.required),
    });

    if (this.idRegistroDGP) {

      this.edicionFormulario = true;
      let gestionInstitucional: GestionInstitucional;
      this.entidadGestionInstntitucional = this._gestionInstitucionaService
          .getEntidadGestionInstitucional(
              this.idRegistroDGP,
              this.erroresConsultasAR
          ).subscribe(
              // response es la respuesta correcta(200) del servidor
              // se convierte la respuesta a JSON,
              // se realiza la convercion del json a una entidad
              // de tipo ClasificacionPreguntasFrecuentes
              response =>
                  gestionInstitucional = new GestionInstitucional(
                      response.json()),
              // en caso de presentarse un error se agrega un nuevo error al array errores
              error => {

              },
              // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
              // al finalizar correctamente la ejecucion se muestra en consola el resultado
              () => {

                if (this.formularioDGP) {

                  let stringDescripcion = 'descripcion';
                  let intProgramaDocente = 'idProgramaDocente';
                  let stringTramite = 'tramite';
                  let stringFechaRegistro = 'fechaRegistro';
                  let stringFechaResolucion = 'fechaResolucionDictamen';
                  let intPromocion = 'idPromocion';
                  let stringVigencia = 'vigencia';

                  (<FormControl>this.formularioDGP.controls[stringDescripcion])
                      .setValue(gestionInstitucional.descripcion);
                  (<FormControl>this.formularioDGP.controls[intProgramaDocente])
                      .setValue(gestionInstitucional.idProgramaDocente.id);
                  (<FormControl>this.formularioDGP.controls[stringTramite])
                      .setValue(gestionInstitucional.tramite);
                  (<FormControl>this.formularioDGP.controls[intPromocion])
                      .setValue(gestionInstitucional.idPromocion.id);
                  (<FormControl>this.formularioDGP.controls[stringVigencia])
                      .setValue(gestionInstitucional.vigencia);

                  let fechaRegistroRecuperar = moment(
                      gestionInstitucional.fechaRegistro);
                  let fechaResolucionRecuperar = moment(
                      gestionInstitucional.fechaResolucionDictamen);

                  this.dt = new Date(fechaRegistroRecuperar.toJSON());
                  this.dt2 = new Date(fechaResolucionRecuperar.toJSON());

                  this.cambioProgramaDocenteFiltro(
                      gestionInstitucional.idProgramaDocente.id);
                  this.cambioPromocion(gestionInstitucional.idPromocion.id);
                }
              }
          );
      this.cargarListaDocumentos();
    }
    this.zone = new NgZone({ enableLongStackTrace: false});
    this.modalAgregarEditar();
  }

  getFechaRegistro(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioDGP.controls['fechaRegistro'])
          .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaResolucionDictamen(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      (<FormControl>this.formularioDGP.controls['fechaResolucionDictamen'])
          .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  cargarListaDocumentos(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idGestionInstitucional~' + this.idRegistroDGP + ':IGUAL';
    urlSearch.set('criterios', criterios);
    this.spinner.start('cargaDocs');

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<GestionDocumentosInstitucional>
    }  =
        this.documentosGestionService.getListaGestionDocumentosInstitucional(
            this.erroresConsultasAR, urlSearch, false);
    this.registrosDocumentos = resultados.lista;
    this.spinner.stop('cargaDocs');
  }

  // Agregar documentos

  agregarDocumento(idArchivo): void {
    this.spinner.start('agrega');
    let formularioArchivosSoporte = new FormGroup({
      idArchivoSoporte: new FormControl(idArchivo),
      idGestionInstitucional: new FormControl(this.idRegistroDGP)
    });

    this.documentosGestionService.postGestionDocumentosInstitucional(
        JSON.stringify(formularioArchivosSoporte.value, null, 2),
        this.erroresGuardadoAR
    ).subscribe(
        response => {

        },
        error => {

        },
        () => {
          this.spinner.start('agrega');
          this.cargarListaDocumentos();
        });
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

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        let idArchivo = responseJson.id;
        let nombreArchivoArray: string[];
        nombreArchivoArray = responseJson.originalName.split('.');
        if (nombreArchivoArray[nombreArchivoArray.length - 1] &&
            nombreArchivoArray[nombreArchivoArray.length - 1] === 'pdf') {
          this.agregarDocumento(responseJson.id);
        } else {
          this.addErrorsMesaje('El archivo debe de ser en pdf', 'danger');
          this._archivoService.deleteArchivo(
              responseJson.id,
              this.erroresGuardadoAR
          ).subscribe(
              () => {}
          );
        }
      }
    });
  }

  resetearValores(): void {
    this.tipoArchivo = null;
    this.idArchivo = null;
    this.nombreArchivo = null;
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
    this.alertas.length = 0;
  }

  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formularioDGP.value, null, 2);
      if (this.edicionFormulario) {
        this.spinner.start('enviar');
        this._gestionInstitucionaService
            .putGestionInstitucional(
                this.idRegistroDGP,
                jsonFormulario,
                this.erroresGuardadoAR
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.spinner.stop('enviar');
              this.onCambiosTabla();
              this.cerrarModalAgregarEditar();
            }
        );
      } else {
        this._gestionInstitucionaService
            .postGestionInstitucional(
                jsonFormulario,
                this.erroresGuardadoAR
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.spinner.stop('enviar');
              this.cerrarModalAgregarEditar();
              this.onCambiosTabla();
            }
        );
      }
    } else {
      //alert('no paso');
    }
  }

  eliminarDocumento () {
    if (this.registroSeleccionadoAR) {
      this.spinner.start('elimdocs');
      this.documentosGestionService.deleteDocumentosInstitucion(
          this.registroSeleccionadoAR.id,
          this.erroresConsultasAR
      ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.spinner.stop('elimdocs');
            this.cargarListaDocumentos();
          }
      );
    }else {
    }
    this.registroSeleccionadoAR =  null;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioDGP.controls[campo]);
  }

  validarFormulario(): boolean {
    if (this.formularioDGP.valid) {
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

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesCatalogoPromociones = this.catalogoPromociones
        .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  cambioPromocion(idPromocion: number): void {
    this.catalogoPromociones.getEntidadPromocion(idPromocion,
        this.erroresConsultasAR).subscribe(
        response => {
          this.promocionSelecionada = new Promocion (response.json());
          this.vigencia = this.promocionSelecionada.idPeriodoEscolarInicio.getPeriodo() + '/'
              + this.promocionSelecionada.idPeriodoEscolarFin.getPeriodo();
        }
    );
  }

  rowSeleccionadoAR(registro): boolean {
    return (this.registroSeleccionadoAR === registro);
  }

  setLimiteAR(limite: string): void {
    this.limite = Number(limite);
    // this.cambioPromocion();
  }

  rowSeleccionAR(registro): void {
    if (this.registroSeleccionadoAR !== registro) {
      this.registroSeleccionadoAR = registro;
    } else {
      this.registroSeleccionadoAR = null;
    }
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start('verArchivo');
      this._archivoService
          .generarTicket(jsonArchivo, this.erroresConsultasAR)
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
                this.spinner.stop('verArchivo');
              },
              () => {
                this.spinner.stop('verArchivo');
              }
          );
    }
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start('descargarArch');
      this._archivoService
          .generarTicket(jsonArchivo, this.erroresConsultasAR)
          .subscribe(
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
                this.spinner.stop('descargarArch');
              },
              () => {
                this.spinner.stop('descargarArch');
              }
          );
    }

  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioDGP.controls[campo]).
            valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServicesAR(): void {
    this.catalogoProgramaDocente =
        this._catalogosService.getCatalogoProgramaDocente();
    this.opcionesCatalogoProgramaDocente =
        this.catalogoProgramaDocente.getSelectProgramaDocente(this.erroresConsultasAR);
    this.catalogoPromociones =
        this._catalogosService.getPromocion();
  }

  private modalAgregarEditar(): void {
    this.modalAgreActu.open('lg');
  }
  private cerrarModalAgregarEditar(): void {
    this.modalAgreActu.close();
  }

  //////////////////////////////////////// MODAL DETALLE ////////////////////////////

  entidadGestionInstitucion: GestionInstitucional;

  registrosDR: Array<GestionDocumentosInstitucionalService> = [];
  registrosDocumentosDR: Array<GestionDocumentosInstitucional> = [];
  registroSeleccionadoDR: GestionDocumentosInstitucional;
  idPromocion;

  promocionSelecionadaDR: Promocion;
  vigenciaDR: string;

  columnasDR: Array<any> = [
    { titulo: 'Archivo', nombre: 'idArchivoSoporte', sort: false }
  ];
  private erroresConsultasDR: Array<ErrorCatalogo> = [];
  private erroresConsultasDR2: Array<ErrorCatalogo> = [];

  private constructorDR(): void {

    this.registrosDR = [];
    this.registrosDocumentosDR = [];
    this.vigenciaDR = '';
    this.registroSeleccionadoDR = null;
    this.cargarListaDocumentosDR();
    this._gestionInstitucionaService.getEntidadGestionInstitucional(
        this.registroSeleccionado.id,
        this.erroresConsultasDR
    ).subscribe(
        response => {
          this.entidadGestionInstitucion = new GestionInstitucional(response.json());

        },
        error => {
        },
        () => {
          this.idPromocion = this.entidadGestionInstitucion.idPromocion.id;
          this.cambioPromocionDR(this.idPromocion);
        }
    );
    this.modalDetalleRegistro();
  }

  cargarListaDocumentosDR(): any {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idGestionInstitucional~' + this.registroSeleccionado.id + ':IGUAL';
    urlSearch.set('criterios', criterios);
    this.spinner.start('cargar');

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<GestionDocumentosInstitucional>
    }  =
        this.documentosGestionService.getListaGestionDocumentosInstitucional(
            this.erroresConsultasDR, urlSearch, false);
    this.registrosDocumentosDR = resultados.lista;
    this.spinner.stop('cargar');
  }

  cambioPromocionDR(idPromocion: number): any {
    this.promocionService.getEntidadPromocion(idPromocion,
        this.erroresConsultasDR).subscribe(
        response => {
          this.promocionSelecionadaDR = new Promocion (response.json());
          this.vigenciaDR = this.promocionSelecionadaDR.idPeriodoEscolarInicio.getPeriodo()
              + '/' + this.promocionSelecionadaDR.idPeriodoEscolarFin.getPeriodo();
        }
    );
  }


  rowSeleccionadoDR(registro): boolean {
    return (this.registroSeleccionadoDR === registro);
  }

  setLimiteDR(limite: string): void {
    this.limite = Number(limite);
    // this.cambioPromocion();
  }

  rowSeleccionDR(registro): void {
    if (this.registroSeleccionadoDR !== registro) {
      this.registroSeleccionadoDR = registro;
    } else {
      this.registroSeleccionadoDR = null;
    }
  }

  verArchivoDR(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start('verArchivo');
      this._archivoService
          .generarTicket(jsonArchivo, this.erroresConsultasDR)
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
                this.spinner.stop('verArchivo');
              },
              () => {
                this.spinner.stop('verArchivo');
              }
          );
    }
  }

  descargarArchivoDR(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start('descargar');
      this._archivoService
          .generarTicket(jsonArchivo, this.erroresConsultasDR)
          .subscribe(
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
                this.spinner.stop('descargar');
              },
              () => {
                this.spinner.stop('descargar');
              }
          );
    }

  }
  private modalDetalleRegistro(): void {
    this.modalDetalle.open('lg');
  }
  private cerrarModalDetalleRegistro(): void {
    this.modalDetalle.close();
  }
}
