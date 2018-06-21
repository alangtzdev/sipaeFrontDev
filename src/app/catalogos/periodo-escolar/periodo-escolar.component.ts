import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {PeriodoEscolar} from "../../services/entidades/periodo-escolar.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";

@Component({
  selector: 'app-periodo-escolar',
  templateUrl: './periodo-escolar.component.html',
  styleUrls: ['./periodo-escolar.component.css']
})
export class PeriodoEscolarComponent implements OnInit {
  @ViewChild('modalCrudPeriodoEsc')
  modalCrudPeriodoEsc: ModalComponent;
  @ViewChild('modalDetallePeriodoEsc')
  modalDetallePeriodoEsc: ModalComponent;
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
  registros: Array<PeriodoEscolar> = [];
  columnas: Array<any> = [
    { titulo: 'Año*', nombre: 'anio'},
    { titulo: 'Período', nombre: 'periodo', sort: false },
    { titulo: 'Inicio de cursos', nombre: 'inicioCurso'},
    { titulo: 'Fin de cursos', nombre: 'finCurso'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'},
  ];
  registroSeleccionado: PeriodoEscolar;

  periodoEscolarService;
  // variables para exportar
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'anio' }
  };
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  //variables modal agregar editar periodo
  edicionFormulario: boolean = false;
  entidadPeriodoEscolar: PeriodoEscolar;
  formularioPeriodoEscolar: FormGroup;

  ////// picker ///
  public dt: Date;
  public dt2: Date; // Para el 2da DatePicker
  public dt3: Date; // Para el 3er DatePicker

  validacionActiva: boolean = false;
  fechaInvalida: boolean = false;
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];

  public minDate: Date = void 0;
  public dateDisabled: {date: Date, mode: string}[];
  /*public dt3: Date = new Date();
  public events: any[];
  public tomorrow: Date;
  public afterTomorrow: Date;
  public formats: string[] = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY',
    'shortDate'];
  public format: string = this.formats[0];
  public dateOptions: any = {
    formatYear: 'YY',
    startingDay: 1
  };
  private opened: boolean = false;*/

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogoService: CatalogosServices,
              public _estatusService: EstatusCatalogoService,
              public spinner: SpinnerService
  ) {
    moment.locale('es');
    this.inicializarFormulario();
    this.prepareServices();
  }

  private inicializarFormulario(): void {
    this.formularioPeriodoEscolar = new FormGroup({
      anio: new FormControl('', Validators.compose([Validacion.anio, Validators.required])),
      periodo: new FormControl('', Validators.compose([Validacion.letrasSinEspacioValidator, Validators.required])),
      inicioCurso: new FormControl({disabled: true}),
      finCurso: new FormControl({disabled: true}),
      mesInicio: new FormControl('', Validators.required),
      mesFin: new FormControl('', Validators.required),
      limitePago: new FormControl({disabled: true}),
      idEstatus: new FormControl('', Validators.required),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      fechaInvalida: new FormControl(''),
    });
    this.dt =  new Date();
    this.dt2 = new Date();
    this.dt3 = new Date();
  }

  ngOnInit(): void {
    this.getListaPeriodosEscolares();
  }

  getListaPeriodosEscolares(): void {

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

    this.spinner.start("catalogoperiodoescolar1");

    this.periodoEscolarService.getListaPeriodoEscolar(
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
        //comentario inecesario
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new PeriodoEscolar(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this.spinner.stop("catalogoperiodoescolar1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop("catalogoperiodoescolar1");
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
    this.getListaPeriodosEscolares();
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
    this.getListaPeriodosEscolares();
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
      this.getListaPeriodosEscolares();
    }
  }

/*  modalAgregarActualizarPeriodoEscolar(modo): void {
    //console.log(modo);
    let idPeriodoEscolar: number;
    if (modo === 'editar' && this.registroSeleccionado) {
      idPeriodoEscolar = this.registroSeleccionado.id;
    }
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalFormularioData = new ModalPeriodoEscolarData(
      this,
      idPeriodoEscolar
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalPeriodoEscolar,
      bindings,
      modalConfig
    );
  }

  modalDetalles(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idPeriodoEscolar = this.registroSeleccionado.id;
      let modalDetallesData = new DetallePeriodoEscolarData(
        this,
        idPeriodoEscolar
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>DetallePeriodoEscolar,
        bindings,
        modalConfig
      );
    }
  }*/

  cambiarEstatus(modo): void {
    //console.log(modo);
    let idPeriodoEscolar: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    } else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      idPeriodoEscolar = this.registroSeleccionado.id;
      //console.log(idPeriodoEscolar);
      let jsonCambiarEstatus = JSON.stringify(estatus, null, 2);
      //console.log(jsonCambiarEstatus);

      this.periodoEscolarService.putPeriodoEscolar(
        idPeriodoEscolar,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.getListaPeriodosEscolares();
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
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.getListaPeriodosEscolares();
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
    this.periodoEscolarService =
      this._catalogoService.getPeriodoEscolar();
  }

  modalAgregarActualizarPeriodoEscolar(modo): void {
    this.inicializarFormulario();
    this.getSelectorAUsar();
    this.edicionFormulario = false;
    if (modo === 'editar'  && this.registroSeleccionado) {
      this.getDatosPeriodoSeleccionado();
    }
    this.modalCrudPeriodoEsc.open('lg');
  }

  getDatosPeriodoSeleccionado(){
    if (this.registroSeleccionado) {
      this.spinner.start('traerInformacionPeriodo');
      ////console.log(this.context.idPeriodoEscolar);
      this.edicionFormulario = true;
      let periodoEscolar: PeriodoEscolar;
      this.periodoEscolarService
        .getPeriodoEscolar(
          this.registroSeleccionado.id,
          this.erroresConsultas
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>{
            periodoEscolar = new PeriodoEscolar(response.json());
            this.entidadPeriodoEscolar= periodoEscolar;
          },error => {
          // en caso de presentarse un error se agrega un nuevo error al array errores
            /*if (assertionsEnabled()) {
              console.error(error);
            }*/
          this.spinner.stop('traerInformacionPeriodo');
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            /*if (assertionsEnabled()) {
              ////console.log(periodoEscolar);

            }*/
            if (this.formularioPeriodoEscolar) {
              let stringAnio = 'anio';
              let stringPeriodo = 'periodo';
              let strinigMesInicio = 'mesInicio';
              let strinigMesFin = 'mesFin';
              let strinigIdEstatus = 'idEstatus';

              let fechaFinCursoRecuperar = moment(periodoEscolar.finCurso);
              let fechaInicioCursoRecuperar = moment(periodoEscolar.inicioCurso);
              let fechaLimitePagoRecuperar = moment(periodoEscolar.limitePago);

              (<FormControl>this.formularioPeriodoEscolar.controls[stringAnio])
                .setValue(periodoEscolar.anio);
              (<FormControl>this.formularioPeriodoEscolar.controls[stringPeriodo])
                .setValue(periodoEscolar.periodo);
              (<FormControl>this.formularioPeriodoEscolar.controls[strinigMesInicio])
                .setValue(periodoEscolar.mesInicio);
              (<FormControl>this.formularioPeriodoEscolar.controls[strinigMesFin])
                .setValue(periodoEscolar.mesFin);
              (<FormControl>this.formularioPeriodoEscolar.controls[strinigIdEstatus])
                .setValue(periodoEscolar.estatus.id);
              //console.log(this.formularioPeriodoEscolar);

              this.dt = new Date(fechaInicioCursoRecuperar.toJSON());
              this.dt2 = new Date(fechaFinCursoRecuperar.toJSON());
              this.dt3 = new Date(fechaLimitePagoRecuperar.toJSON());
            }
            this.spinner.stop('traerInformacionPeriodo');
          }
        );
    }
  }

  cerrarModal(){
    this.modalCrudPeriodoEsc.close();
    this.limpiarFormulario();
  }

  enviarFormulario(): void {
    console.log(this.formularioPeriodoEscolar.value);
    if (this.validarFormulario()) {
      this.spinner.start('guardarEditarPeriodo');
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formularioPeriodoEscolar.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.periodoEscolarService
          .putPeriodoEscolar(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          error => {
            this.spinner.stop('guardarEditarPeriodo');
          }, //console.log('Success Edition'),
          console.error,
          () => {
            this.spinner.stop('guardarEditarPeriodo');
          }
        );
      } else {
        //console.log('Para guardar');
        this.periodoEscolarService
          .postPeriodoEscolar(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          error => {
            this.spinner.stop('guardarEditarPeriodo');
          }, //console.log('Success Save'),
          console.error,
          () => {
            this.spinner.stop('guardarEditarPeriodo');

          }
        );
      }
      this.getListaPeriodosEscolares();
      this.cerrarModal();
    }

  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioPeriodoEscolar.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioPeriodoEscolar.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormulario(): boolean {
    //this.validarFecha();
    if (this.formularioPeriodoEscolar.valid && !this.fechaInvalida) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  /*validarFecha(): any {
    let fechaInicio =  moment(this.dt).format('DD/MM/YYYY');
    let fechaFin =  moment(this.dt2).format('DD/MM/YYYY');
    ////console.log(fechaInicio);
    ////console.log(fechaFin);

    let splitFechaDe = fechaInicio.split('/');
    let dateFechaDe = new Date(splitFechaDe[2], splitFechaDe[1] - 1, splitFechaDe[0]);
    ////console.log(dateFechaDe);
    let splitFechaHasta = fechaFin.split('/');
    let dateFechaHasta =
      new Date(splitFechaHasta[2], splitFechaHasta[1] - 1, splitFechaHasta[0]);
    ////console.log(dateFechaHasta);

    if (dateFechaDe > dateFechaHasta) {
      ////console.log('fecha menor');
      this.fechaInvalida = true;
      ////console.log(this.fechaInvalida);
      (<Control>this.formularioPeriodoEscolar.controls['fechaInvalida']).setValue('');

    } else {
      ////console.log('fecha bien');
      this.fechaInvalida = false;
      ////console.log(this.fechaInvalida);
      (<Control>this.formularioPeriodoEscolar.controls['fechaInvalida']).setValue('1');

    }
  }*/

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

  getSelectorAUsar(){
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    ////console.log(urlParameter);
    this.opcionesCatalogoEstatus =
      this._estatusService.
      getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
  }

  getFechaInicio(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioPeriodoEscolar.controls['inicioCurso'])
              .setValue(fechaConFormato + ' 12:00am');

      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }



  getFechaFinCurso(): string {
    if (this.dt2) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      (<FormControl>this.formularioPeriodoEscolar.controls['finCurso'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaLimitePago(): string {
    if (this.dt3) {
      let fechaConFormato = moment(this.dt3).format('DD/MM/YYYY');
      (<FormControl>this.formularioPeriodoEscolar.controls['limitePago'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  modalDetalles(){
    this.getDatosPeriodoSeleccionado();
    this.modalDetallePeriodoEsc.open('lg');
    this.formularioPeriodoEscolar.reset();
  }

  obtenerMes(mes) {
    let retorno = '';
    switch (mes) {
      case 1:
        retorno = 'Enero';
        break;
      case 2:
        retorno = 'Febrero';
        break;
      case 3:
        retorno = 'Marzo';
        break;
      case 4:
        retorno = 'Abril';
        break;
      case 5:
        retorno = 'Mayo';
        break;
      case 6:
        retorno = 'Junio';
        break;
      case 7:
        retorno = 'Julio';
        break;
      case 8:
        retorno = 'Agosto';
        break;
      case 9:
        retorno = 'Septiembre';
        break;
      case 10:
        retorno = 'Octubre';
        break;
      case 11:
        retorno = 'Noviembre';
        break;
      case 12:
        retorno = 'Diciembre';
        break;
    }

    return retorno;
  }

  cerrarModalDetalles() {
    this.entidadPeriodoEscolar = null;
    this.modalDetallePeriodoEsc.close();
    this.cerrarModal();
  }

  limpiarFormulario() {
    this.entidadPeriodoEscolar = null;
    this.validacionActiva = false;
    this.edicionFormulario = false;
    this.edicionFormulario = false;
    //this.formularioPeriodoEscolar.reset();
    this.getControl('idEstatus').patchValue('0');
    this.getControl('mesInicio').patchValue('0');
    this.getControl('mesFin').patchValue('0');
  }

  /*validarFecha(): any {
    let fechaInicio = moment(this.dt).format('DD/MM/YYYY');
    let fechaFin = moment(this.dt2).format('DD/MM/YYYY');
    ////console.log(fechaInicio);
    ////console.log(fechaFin);

    let splitFechaDe = fechaInicio.split('/');
    let dateFechaDe = new Date(splitFechaDe[2], splitFechaDe[1] - 1, splitFechaDe[0]);
    ////console.log(dateFechaDe);
    let splitFechaHasta = fechaFin.split('/');
    let dateFechaHasta =
      new Date(splitFechaHasta[2], splitFechaHasta[1] - 1, splitFechaHasta[0]);
    ////console.log(dateFechaHasta);

    if (dateFechaDe > dateFechaHasta) {
      ////console.log('fecha menor');
      this.fechaInvalida = true;
      ////console.log(this.fechaInvalida);
      (<FormControl>this.formularioPeriodoEscolar.controls['fechaInvalida']).setValue('');

    } else {
      ////console.log('fecha bien');
      this.fechaInvalida = false;
      ////console.log(this.fechaInvalida);
      (<FormControl>this.formularioPeriodoEscolar.controls['fechaInvalida']).setValue('1');

    }
  }*/

/*  constructor() { }

  ngOnInit() {
  }

  ocultarOpcionActivar(): boolean {
    return true;
  }
  ocultarOpcionDesactivar(): boolean {
    return true;
  }
  mostarBotones(): boolean {
    return true;
  }*/

}