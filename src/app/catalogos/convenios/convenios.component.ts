import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {Convenio} from "../../services/entidades/convenio.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import { DatepickerModule } from 'ng2-bootstrap';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Validacion} from "../../utils/Validacion";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-convenios',
  templateUrl: './convenios.component.html',
  styleUrls: ['./convenios.component.css']
})
export class ConveniosComponent implements OnInit {

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Convenio> = [];

  columnas: Array<any> = [
    { titulo: 'Convenio*', nombre: 'descripcion'},
    { titulo: 'Detalles', nombre: 'detalles' },
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  registroSeleccionado: Convenio;
  convenioService;
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'descripcion'}
  };
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(public _catalogosService: CatalogosServices,
//              private modal: Modal,
              private injector: Injector,
              private _spinner: SpinnerService,
              public _estatusService: EstatusCatalogoService
  ) {
    (this.minDate = new Date()).setDate(this.minDate.getDate());
    this.prepareServices();
    this.formularioConvenios = new FormGroup({
      descripcion: new FormControl(''),
      idSector: new FormControl(''),
      idTipoConvenio: new FormControl(''),
      idAlcance: new FormControl(''),
      idInstitucion: new FormControl(''),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl(''),
      idEstatus: new FormControl(''),
      detalles: new FormControl(''),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      aplicaFechaFin: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.onCambiosTabla();
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
    if (this.configuracion.filtrado.textoFiltro !== '') {
      this._spinner.start("convenios1");
    }

    this.convenioService.getListaConvenio(
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
          this.registros.push(new Convenio(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
  /*      if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("convenios1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("convenios1");
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

  cambiarEstatus(modo): void {
    this._spinner.start('convenios1');
    ////console.log(modo);
    let idConvenio: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    } else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      idConvenio = this.registroSeleccionado.id;
      ////console.log(idConvenio);
      let jsonCambiarEstatus = JSON.stringify(estatus, null, 2);
      ////console.log(jsonCambiarEstatus);

      this.convenioService.putConvenio(
        idConvenio,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTabla();
        }
      );
    }
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar(): boolean {
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
      /!*!//console.log('evento', evento);
       //console.log('Page changed to: ' + evento.page);
       //console.log('Number items per page: ' + evento.itemsPerPage);
       //console.log('paginaActual', this.paginaActual);*!/
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

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        ////console.log(this.exportarExcelUrl);
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

  private prepareServices(): void {
    this.convenioService =
      this._catalogosService.getConvenio();
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
////////////////////////////MODALS////////////////////////////////////////////**********************

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

  ///////////////////////////////////////////////-- AGREGAR/EDITAR -- ///////////////////////////////////////////////
  private idconvenio: number;
  edicionFormulario: boolean = false;
  formularioConvenios: FormGroup;
  entidadConvenio: Convenio;
  catalogoEstatus;
  catalogoAlcance;
  catalogoTipoConvenio;
  catalogoInstitucion;
  catalogoSector;
  validacionActiva: boolean = false;
  mensajeErrors: Array<Object> = [
    {mensaje: 'La fecha fin debe ser mayor a la fecha de inicio',
      traduccion: 'La fecha debe ser mayor a la fecha de inicio'}
  ];
  fechaInvalida: boolean = false;
  ocultarFeacha: boolean = false;

  ////// picker ///
  public dt: Date;
  public dt2: Date; // Para el 2da DatePicker
  public minDateFechaFin;
  public minDate: Date;

  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private opcionesCatalogoTipoConvenio: Array<ItemSelects> = [];
  private opcionesCatalogoInstitucion: Array<ItemSelects> = [];
  private opcionesCatalogoAlcance: Array<ItemSelects> = [];
  private opcionesCatalogoSector: Array<ItemSelects> = [];
  private erroresConsultasCAA: Array<ErrorCatalogo> = [];
  private erroresGuardadoCAA: Array<ErrorCatalogo> = [];
  private _estatusServiceCAA: EstatusCatalogoService;

  getDate(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioConvenios.controls['fechaInicio'])
          .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }


  getDateFecha(): string { //Metodo para incorporar uun 2da Datepick
    if (this.dt2) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      (<FormControl>this.formularioConvenios.controls['fechaFin'])
          .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  private constructorAgreActuConvenios(modo): void {
    this.ocultarFeacha = false;
    this.fechaInvalida = false;
    this.edicionFormulario = false;

    this.dt = new Date();
    this.dt2 = new Date(); // Para el 2da DatePicker
    this.minDateFechaFin = new Date();
    this.minDate = void 0;

    if (modo === 'editar' && this.registroSeleccionado) {
      this.idconvenio = this.registroSeleccionado.id;
    } else {
      this.idconvenio = null;
    }
    this.prepareServicesCAA();

    this.formularioConvenios = new FormGroup({
      descripcion: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      idSector: new FormControl('', Validators.required),
      idTipoConvenio: new FormControl('', Validators.required),
      idAlcance: new FormControl('', Validators.required),
      idInstitucion: new FormControl('', Validators.required),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl(''),
      idEstatus: new FormControl('', Validators.required),
      detalles: new FormControl('', Validators.
      compose([Validacion.parrafos])),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      aplicaFechaFin: new FormControl(''),
    });

    moment.locale('es');

    if (this.idconvenio) {
      ////console.log(this.context.idconvenio);
      this.edicionFormulario = true;
      let convenio: Convenio;
      this.entidadConvenio = this.convenioService
          .getConvenio(
              this.idconvenio,
              this.erroresConsultasCAA
          ).subscribe(
              // response es la respuesta correcta(200) del servidor
              // se convierte la respuesta a JSON,
              // se realiza la convercion del json a una entidad
              // de tipo ClasificacionPreguntasFrecuentes
              response =>
                  convenio = new Convenio(
                      response.json()),
              // en caso de presentarse un error se agrega un nuevo error al array errores
              error => {

              },
              // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
              // al finalizar correctamente la ejecucion se muestra en
              // consola el resultado
              () => {

                if (this.formularioConvenios) {
                  let stringDescripcion = 'descripcion';
                  let stringIdSector = 'idSector';
                  let stringIdTipoConvenio = 'idTipoConvenio';
                  let stringIdAlcance = 'idAlcance';
                  let strinigIdInstitucion = 'idInstitucion';
                  let strinigIdEstatus = 'idEstatus';
                  let strinigDetalles = 'detalles';
                  let stringaplicaFechaFin = 'aplicaFechaFin';

                  let fechaInicioRecuperar = moment(convenio.fechaInicio);
                  let fechaFinRecuperar = moment(convenio.fechaFin);

                  (<FormControl>this.formularioConvenios.controls[stringDescripcion])
                      .setValue(convenio.descripcion);
                  (<FormControl>this.formularioConvenios.controls[stringIdSector])
                      .setValue(convenio.sector.id);
                  (<FormControl>this.formularioConvenios.controls[stringIdTipoConvenio])
                      .setValue(convenio.tipo.id);
                  (<FormControl>this.formularioConvenios.controls[stringIdAlcance])
                      .setValue(convenio.alcance.id);
                  (<FormControl>this.formularioConvenios.controls[strinigIdInstitucion])
                      .setValue(convenio.institucion.id);
                  (<FormControl>this.formularioConvenios.controls[strinigIdEstatus])
                      .setValue(convenio.estatus.id);
                  (<FormControl>this.formularioConvenios.controls[strinigDetalles])
                      .setValue(convenio.detalles);
                  (<FormControl>this.formularioConvenios.controls[stringaplicaFechaFin])
                      .setValue(convenio.aplicaFechaFin);
                  ////console.log(this.formularioConvenios);

                  this.dt = new Date(fechaInicioRecuperar.toJSON());
                  this.dt2 = new Date(fechaFinRecuperar.toJSON());
                  if (convenio.aplicaFechaFin) {
                    this.ocultarFeacha = true;
                    //console.log('this.ocultarFeacha: ' + this.ocultarFeacha);
                  }
                }
              }
          );
    }
    this.modalAgregarActualizar();
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this.borrarFechaHasta();
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formularioConvenios.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.convenioService
            .putConvenio(
                this.idconvenio,
                jsonFormulario,
                this.erroresGuardadoCAA
            ).subscribe(
            () => {}, //console.log('Success Edition'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgregarActualizar();
            }
        );
      } else {
        this.convenioService
            .postConvenio(
                jsonFormulario,
                this.erroresGuardadoCAA
            ).subscribe(
            () => {}, //console.log('Success Save'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgregarActualizar();
            }
        );
      }
    } else { }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioConvenios.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioConvenios.controls[campo]).valid &&
        this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormulario(): boolean {
    if (this.ocultarFeacha) {
      if (this.formularioConvenios.valid) {
        this.validacionActiva = false;
        return true;
      }
      this.validacionActiva = true;
      return false;
    } else {
      this.validarFecha();
      if (this.formularioConvenios.valid && !this.fechaInvalida) {
        this.validacionActiva = false;
        return true;
      }
      this.validacionActiva = true;
      return false;
    }
  }

  validarFecha(): any {
    let fechaInicio = moment(this.dt).format('YYYY/MM/DD'); //'DD/MM/YYYY'
    let fechaFin = moment(this.dt2).format('YYYY/MM/DD');


    //let splitFechaDe = fechaInicio.split('/');
    //let dateFechaDe = new Date(splitFechaDe[2], splitFechaDe[1] - 1, splitFechaDe[0]);
    ////console.log(dateFechaDe);
    //let splitFechaHasta = fechaFin.split('/');
    //let dateFechaHasta =
      //  new Date(splitFechaHasta[2], splitFechaHasta[1] - 1, splitFechaHasta[0]);
    ////console.log(dateFechaHasta);

    if (fechaInicio > fechaFin) {
      this.fechaInvalida = true;
      ////console.log(this.fechaInvalida);
      //(<Control>this.formularioConvenios.controls['fechaInvalida']).updateValue('');

    } else {
      ////console.log('fecha bien');
      this.fechaInvalida = false;
      ////console.log(this.fechaInvalida);
      //(<Control>this.formularioConvenios.controls['fechaInvalida']).updateValue('1');
    }
  }

  ocultarFechaFin(activado: boolean): void {
    //this.fechaInvalida = activado;
    if (this.ocultarFeacha) {
      this.ocultarFeacha = false;
    } else {
      this.ocultarFeacha = true;
    }
  }

  borrarFechaHasta(): void {
    if (this.ocultarFeacha) {
      (<FormControl>this.formularioConvenios.
          controls['fechaFin']).setValue(null);
    }
  }

  errorMessageFecha(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
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

  private prepareServicesCAA(): void {
    this.catalogoEstatus =
        this._catalogosService.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    ////console.log(urlParameter);
    this.opcionesCatalogoEstatus =
        this._estatusService.
        getSelectEstatusCatalogo(this.erroresConsultasCAA, urlParameter);

    this.catalogoAlcance =
        this._catalogosService.getAlcanceConvenio();
    this.opcionesCatalogoAlcance =
        this.catalogoAlcance.getSelectAlcanceConvenio(this.erroresConsultasCAA);

    this.catalogoTipoConvenio =
        this._catalogosService.getTipoConvenio();
    this.opcionesCatalogoTipoConvenio =
        this.catalogoTipoConvenio.getSelectTipoConvenio(this.erroresConsultasCAA);

    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = 'nombre:ASC';
    urlSearch.set('ordenamiento', ordenamiento);

    this.catalogoInstitucion =
        this._catalogosService.getInstitucion();
    this.opcionesCatalogoInstitucion =
        this.catalogoInstitucion.getSelectInstitucion(this.erroresConsultasCAA, urlSearch);

    this.catalogoSector = this._catalogosService.getSector();
    this.opcionesCatalogoSector =
        this.catalogoSector.getSelectSector(this.erroresConsultasCAA);
  }

  modalAgregarActualizar(): void {
    this.modalAgreActu.open('lg');
  }

  cerrarModalAgregarActualizar(): void {
    this.modalAgreActu.close();
    this.formularioConvenios.reset();
  }

  /////////////////////////////////////////-- DETALLE --//////////////////////////////////////
  //entidadConvenio: Convenio;
  //private erroresConsultas: Array<ErrorCatalogo> = [];

  private constructorDetaConvenios(): void {

    this.convenioService
        .getEntidadConvenio(
            this.registroSeleccionado.id,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadConvenio
              = new Convenio(response.json());
          //console.log(this.entidadConvenio);
        },
        error => {

        },
        () => {

        }
    );
    this.modalDetalleConvenio();
  }

  modalDetalleConvenio(): void {
    this.modalDetalle.open();
  }

  cerrarModalDetalleConvenio(): void {
    this.modalDetalle.close();
  }
}
