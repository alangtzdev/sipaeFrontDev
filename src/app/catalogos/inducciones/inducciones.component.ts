import {Component, OnInit, Injector, ViewChild, NgZone, Inject } from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {InduccionService} from "../../services/entidades/induccion.service";
import {Induccion} from "../../services/entidades/induccion.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ConfigService} from '../../services/core/config.service';
import {ItemSelects} from "../../services/core/item-select.model";
import { NgUploaderOptions } from 'ngx-uploader';
@Component({
  selector: 'app-inducciones',
  templateUrl: './inducciones.component.html',
  styleUrls: ['./inducciones.component.css']
})
export class InduccionesComponent implements OnInit {

  @ViewChild('modalDetalleInduccion')
  modalDetalleInduccion: ModalComponent;
  @ViewChild('modalAgregarEditarInduccion')
  modalAgregarEditarInduccion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  paginacion: PaginacionInfo;
  catalogoServices;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  public registros: Array<Induccion> = [];
  columnas: Array<any> = [
    { titulo: 'Nombre del documento*', nombre: 'nombre' },
    { titulo: 'Tema*', nombre: 'idTema.valor' },
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus.valor'}
  ];

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  registroSeleccionado: Induccion;

  public configuracion: any = {paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'nombre,idTema.valor' }};

  ///////seccion de las varialbes detalle induccion/////
  idInduccionSeleccionada: number;
  entidadInduccion: Induccion;
  private archivoSerice;
  //////fin de la seccion de detalle induccion //////////
  ///// inico variables agregar - editar induccion //////
  private idInduccionEditar: number;
  private induccionAEditar: Induccion;
  private formularioInduccion: FormGroup;
  private validacionActiva: boolean = false;
  private edicionFormulario: boolean = false;
  private opcionSelectEstatus: Array<ItemSelects> = [];
  private opcionSelectSubTema: Array<ItemSelects> = [];
  private opcionSelectTema: Array<ItemSelects> = [];
  private catalogosEditarService;

  private basicProgress: number = 0;
  private dropProgress: number = 0;
  private basicResp: Object;
  private idArchivo: number;
  dropResp: any[] = [];
  uploadFile: any;
  options: NgUploaderOptions;
  //zone: NgZone;
  //// fin de la seccion de variables agregar - editar////

  private erroresGuardado: Array<Object> = [];
  private erroresConsultas: Array<Object> = [];
  constructor(@Inject(NgZone) private zone: NgZone,
              private injector: Injector,
              private _spinner: SpinnerService,
              private _catalogosService: CatalogosServices
  ) {
    this.inicializarOpcionesNgZone();
    this.prepareServices();
    this.mostrarTabla();
    this.inicializarFormulario();
  }
  ngOnInit(): void {
  }

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
        // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['pdf'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }
/*  modalAgregarActualizarInduccion(modo): void {
    let dialog: Promise<ModalDialogInstance>;
    let idInduccionEditar: number;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (modo === 'editar' && this.registroSeleccionado) {
      idInduccionEditar = this.registroSeleccionado.id;
    }
    let modalInduccionRegistroData = new ModalCatalogoInduccionData(
      this,
      idInduccionEditar
    );
    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue:  modalInduccionRegistroData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);
    dialog = this.modal.open(
      <any>ModalCatalogoInduccion,
      bindings,
      modalConfig
    );
  }*/
/*  modalDetalles(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idInduccion = this.registroSeleccionado.id;
      let modalDetalleInduccionData = new ModalInduccionDetalleData(
        this,
        idInduccion
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetalleInduccionData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalInduccionDetalle,
        bindings,
        modalConfig
      );
    }
  }*/
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                COMPORTAMIENTO TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** ordenamiento de registros**************************************//
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

    //console.log(columna);
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.mostrarTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.mostrarTabla();
  }

  mostrarTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    //console.log(this.configuracion.filtrado);
    //console.log(this.configuracion.filtrado.textoFiltro);
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      //console.log(filtros);
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
    if (this.configuracion.filtrado.textoFiltro !== '') {
    }
    this._spinner.start("catalogoinducciones1");
    this.catalogoServices.getListaInduccion(
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
          this.registros.push(new Induccion(item));
        });
        this._spinner.stop("catalogoinducciones1");
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("catalogoinducciones1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("catalogoinducciones1");
      }
    );
  }
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.mostrarTabla();
  }
  rowSeleccion(registro): void {
    //console.log(registro.id);
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  cambiarEstatus(accion): void {
    if (this.registroSeleccionado) {
      let tipoEstatus: any = 0;
      if (accion === 'activo') {
        tipoEstatus = '1007';
      }else {
        tipoEstatus = '1008';
      }

      if ( tipoEstatus !== 0 ) {
        let estatus = {'idEstatus': tipoEstatus};
        let jsonFormulario = JSON.stringify(estatus, null, 2);
        ////console.log('JSON GENERADO: ' + jsonFormulario);
        this._spinner.start('cambiarEstatus');
        this.catalogoServices.putInduccion(
          this.registroSeleccionado.id,
          jsonFormulario, this.erroresGuardado
        ).subscribe(
          response => {}, //console.log('Success'),
          error => {
            this._spinner.stop('cambiarEstatus');
          },
          () => {
            this._spinner.stop('cambiarEstatus');
            this.mostrarTabla();
          }
        );
      }
      this.registroSeleccionado = null;
    }
  }

  ocultarOpcionActivar(): any {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar(): any {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1007) {
      return true;
    } else {
      return false;
    }
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

///////////////////////////////////////////////////////////////////////////////////////////////
//                                Paginador                                                  //
///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.mostrarTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  // Exportar a Excel y pdf

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        //console.log(this.exportarExcelUrl);
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
  ////// Inicio del modal Detalle /////////
  private modalDetalles(): void {
    if (this.registroSeleccionado.id) {
      this.modalDetalleInduccion.open('lg');
      this.idInduccionSeleccionada =
        this.registroSeleccionado.id;
      this.obtenerEntidadInduccion();
    }
  }

  private obtenerEntidadInduccion(): void {
    this._spinner.start('obtenerInduccion');
    this.catalogoServices.getEntidadInduccionModal(
      this.idInduccionSeleccionada,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadInduccion = new Induccion(response.json());
      },
      error => {
        this._spinner.stop('obtenerInduccion');
      },
      () => {
        this._spinner.stop('obtenerInduccion');
      }
    );
  }

  private verArchivo(id: number): void {
    if (id) {
        let jsonArchivo = '{"idArchivo": ' + id + '}';
        this._spinner.start('verArchivo');
        this.archivoSerice
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

  private descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
      this.archivoSerice
          .generarTicket(jsonArchivo, this.erroresConsultas)
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
                console.log('error', error);
                  this._spinner.stop('descargarArchivo');
              },
              () => {
                  this._spinner.stop('descargarArchivo');
              }
          );
    }
  }

  private cerrarModalDetalleInduccion(): void {
    this.modalDetalleInduccion.close();
    this.idInduccionSeleccionada = undefined;
    this.entidadInduccion = undefined;
  }
  ///// Fin del modal Detalle ////////////

  //// Inicio del modal induccion ////////
  private modalAgregarActualizarInduccion(modo): void {
    if (modo === 'editar' && this.registroSeleccionado) {
      this.induccionAEditar = this.registroSeleccionado;
      this.idInduccionEditar = this.registroSeleccionado.id;
      this.getCatalogoSubTema(this.induccionAEditar.tema.id);
      this.cargarInformacionAEditar(this.induccionAEditar);
      this.edicionFormulario = true;
    }
    this.modalAgregarEditarInduccion.open('lg');
    this.getCatalogoTema();
    this.getCatalogoEstatus();
  }

  private cargarInformacionAEditar(entidadInduccion: Induccion): void {
    this.getControl('nombre').patchValue(entidadInduccion.nombre);
    this.getControl('idTema').patchValue(entidadInduccion.tema.id);
    this.getControl('idEstatus').patchValue(entidadInduccion.estatus.id);
    this.getControl('nombreArchivo').patchValue(entidadInduccion.idArchivo.nombre);
    this.getControl('idSubtema').patchValue(entidadInduccion.subtema.id);
  }

  private getControl(campo: string): FormControl {
        return (<FormControl>this.formularioInduccion.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
        if (!(<FormControl>this.formularioInduccion.controls[campo]).valid && this.validacionActiva) {
            return true;
        }
        return false;
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

  private enableBasic(): boolean {
        return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  private enableDrop(): boolean {
        return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }

  handleBasicUpload(data): void {
        this.basicResp = data;
        this.zone.run(() => {
            this.basicProgress = data.progress.percent;
            if (this.basicResp['response'] && this.basicResp['status'] === 201) {
                let responseJson = JSON.parse(this.basicResp['response']);
                this.idArchivo = responseJson.id;
                (<FormControl>this.formularioInduccion.controls['idArchivo'])
                    .patchValue(this.idArchivo);
                (<FormControl>this.formularioInduccion.controls['nombreArchivo'])
                    .patchValue(responseJson.originalName);
            }
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

  private validarFormulario(): boolean {
        if (this.formularioInduccion.valid) {
            this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
  }

  private inicializarFormulario(): void {
    this.formularioInduccion = new FormGroup({
      nombre: new FormControl('',
         Validators.compose([Validacion.textoValidator,
        Validators.required])),
      idTema: new FormControl('', Validators.required),
      idSubtema: new FormControl('', Validators.required),
      idEstatus: new FormControl('', Validators.required),
      idArchivo: new FormControl(),
      nombreArchivo: new FormControl(),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });
  }

  private guardarInduccion(): void {
    let jsonFormulario =
      JSON.stringify(this.formularioInduccion.value, null, 2);
    if (this.validarFormulario()) {
      if (this.edicionFormulario) {
        this.actualizarInduccion(jsonFormulario);
      } else {
        this.crearInduccion(jsonFormulario);
      }
    }
  }

  private crearInduccion(json): void {
    this._spinner.start('crearInduccion');
    this.catalogoServices.postInduccionModal(
        json,
        this.erroresGuardado
    ).subscribe(
      response => {},
      error => { this._spinner.stop('crearInduccion'); }, // console.log('Success'),                    // console.error,
      () => {
        this._spinner.stop('crearInduccion');
        this.mostrarTabla();
        this.cerrarModalAgregarEditarInduccion();
      }
    );
  }

  private actualizarInduccion(json): void {
    this._spinner.start('acutalizaInduccion');
    this.catalogoServices.
      putInduccion(
        this.idInduccionEditar,
        json,
        this.erroresGuardado
      ).subscribe(
        response => {}, // console.log('Success Edition'),
        error => { this._spinner.stop('acutalizaInduccion'); },
        () => {
          this._spinner.stop('acutalizaInduccion');
          this.mostrarTabla();
          this.cerrarModalAgregarEditarInduccion();
        }
    );
  }

  private cerrarModalAgregarEditarInduccion(): void {
    this.modalAgregarEditarInduccion.close();
    this.limpiarVariables();
  }

  private getCatalogoTema(): void {
        //    SE OBTIENE CATALOGO DE TEMAS DE INDUCCIÓN
    this.opcionSelectTema =
      this.catalogosEditarService.getTemaInduccion().getSelectTemaInduccion(
        this.erroresConsultas);
        // console.log('Temas');
        // console.log(this.opcionSelectTema);
  }

  private getCatalogoSubTema(idTemaInduccion: number): void {
        //    SE OBTIENE CATALOGO DE SUBTEMAS DE INDUCCIÓN
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idTemaInduccion~' + idTemaInduccion + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionSelectSubTema =
        this.catalogosEditarService.getSubtemaInduccion().getSelectSubtemaInduccion(
            this.erroresConsultas, urlParameter);
        // console.log('Subtema');
        // console.log(this.opcionSelectSubTema);
  }
  private getCatalogoEstatus(): void {
        //    SE OBTIENE CATALOGO DE PAISES
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idCatalogo~' + '1004' + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionSelectEstatus =
        this.catalogosEditarService.getEstatusCatalogo().getSelectEstatusCatalogo(
            this.erroresConsultas, urlParameter);
        // console.log('Estatus');
        // console.log(this.opcionSelectEstatus);
  }

  private limpiarVariables(): void {
    this.validacionActiva = false;
    this.edicionFormulario = false;
    this.induccionAEditar = undefined;
    this.idInduccionEditar = undefined;
    this.inicializarFormulario();
  }
  ////  Fin del modla induccion /////////

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService.getInduccion();
    this.archivoSerice = this._catalogosService.getArchivos();
    this.catalogosEditarService = this._catalogosService;
  }

/*  constructor() { }

  ngOnInit() {
  }

  ocultarOpcionActivar(): boolean {
    return true;
  }
  ocultarOpcionDesactivar(): boolean {
    return true;
  }*/

}
