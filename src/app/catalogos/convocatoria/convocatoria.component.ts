import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {Convocatoria} from "../../services/entidades/convocatoria.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {ConvocatoriaTiposDocumento} from "../../services/entidades/convocatoria-tipos-documento.model";
import {ConvocatoriaService} from "../../services/entidades/convocatoria.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ConvocatoriaTiposDocumentoService} from "../../services/entidades/convocatoria-tipos-documentot.service";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-convocatoria',
  templateUrl: './convocatoria.component.html',
  styleUrls: ['./convocatoria.component.css']
})
export class ConvocatoriaComponent implements OnInit {

  paginacion: PaginacionInfo;
  catalogoServices;
  modificarEstatus;
  registroSeleccionado: Convocatoria;
  public registros: Array<Convocatoria> = [];
  paginaActual: number = 1;
  maxSizePags: number = 5;
  limite: number = 10;
  columnas: Array<any> = [
    { titulo: 'Programa docente*', nombre: 'idProgramaDocente', sort: false},
    { titulo: 'Promoción', nombre: 'idPromocion', sort: false},
    { titulo: 'Año de publicación', nombre: 'anioPublicacion'},
    { titulo: 'Fecha de cierre de publicación', nombre: 'cierre'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idProgramaDocente.descripcion' }
  };
  private erroresGuardado: Array<Object> = [];
  private erroresConsultas: Array<Object> = [];
  constructor(//private modal: Modal,
              private _spinner: SpinnerService,
              private injector: Injector,
              public _catalogosService: CatalogosServices,
              public evaluadorService: ConvocatoriaTiposDocumentoService) {
    this.formularioConvocatoria = new FormGroup({
      idProgramaDocente: new FormControl(),
      url: new FormControl(),
      anioPublicacion: new FormControl(),
      fechaResultadosPrimera: new FormControl(),
      fechaResultadosSegunda: new FormControl(),
      fechaPublicacionResultados: new FormControl(),
      cierre: new FormControl(),
      maximaInscipcion: new FormControl(),
      cupoMaximo: new FormControl(),
      idPromocion: new FormControl(),
      idEstatus: new FormControl(),
      ultimaActualizacion: new FormControl(),
      fechaInvalidaResultadosPrimeraFase: new FormControl(),
      fechaInvalidaResultadosSegundaFase: new FormControl(),
    });
    this.prepareServices();
    this.mostrarTabla();

       if(sessionStorage.getItem('convocatoria')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('convocatoriaCriterios')){
        this.mostrarTabla();
  }
  }

  ngOnInit(): void {
    this.mostrarTabla();
  }

/*  modalAgregarActualizarConvocatoria(modo): void {
    let dialog: Promise<ModalDialogInstance>;
    let idConvocatoriaEditar: number;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (modo === 'editar' && this.registroSeleccionado) {
      idConvocatoriaEditar = this.registroSeleccionado.id;
    }
    let modalConvocatoriaRegistroData = new ModalConvocatoriaCRUDData(
      this,
      idConvocatoriaEditar
    );
    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue:  modalConvocatoriaRegistroData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalConvocatoriaCRUD,
      bindings,
      modalConfig
    );
  }

  modalDetalles(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idConvocatoria = this.registroSeleccionado.id;
      let modalDetallesData = new ModalConvocatoriaDetalleData(
        this,
        idConvocatoria
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalConvocatoriaDetalle,
        bindings,
        modalConfig
      );
    }
  }*/

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
      this.mostrarTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.mostrarTabla();
  }

  mostrarTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
     let ordenamiento = '';
    if (!sessionStorage.getItem('convocatoriaCriterios')) {
    //console.log(this.configuracion.filtrado);
    //console.log(this.configuracion.filtrado.textoFiltro);
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      this._spinner.start("convocatoria1");
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      //console.log(filtros);
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      //console.log(criterios);
      urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    sessionStorage.setItem('convocatoriaCriterios', criterios);
    sessionStorage.setItem('convocatoriaOrdenamiento', ordenamiento);
    sessionStorage.setItem('convocatoriaLimite', this.limite.toString());
    sessionStorage.setItem('convocatoriaPagina', this.paginaActual.toString());
}

this.limite = +sessionStorage.getItem('convocatoriaLimite') ? +sessionStorage.getItem('convocatoriaLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('convocatoriaPagina') ? +sessionStorage.getItem('convocatoriaPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('convocatoriaCriterios')
     ? sessionStorage.getItem('convocatoriaCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('convocatoriaOrdenamiento') 
    ? sessionStorage.getItem('convocatoriaOrdenamiento') : ordenamiento);
   urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());

    //this._spinner.start();
    this.catalogoServices.getListaConvocatoria(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion).subscribe(
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
          this.registros.push(new Convocatoria(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("convocatoria1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("convocatoria1");
      }
    );
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.mostrarTabla();
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  cambiarEstatus(accion): void {
    //console.log('llego id:' + this.registroSeleccionado);
    if (this.registroSeleccionado) {
      this._spinner.start("convocatoria1");
      let tipoEstatus: any = 0;
      if (accion === 'activo') {
        tipoEstatus = '1007';
      }else {
        tipoEstatus = '1008';
      }

      if ( tipoEstatus !== 0 ) {
        let estatus = {'idEstatus': tipoEstatus};
        let jsonFormulario = JSON.stringify(estatus, null, 2);
        //console.log('JSON GENERADO: ' + jsonFormulario);
        this.catalogoServices.putConvocatoria(
          this.registroSeleccionado.id,
          jsonFormulario, this.erroresGuardado
        ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.mostrarTabla();
          }
        );
      }
      this.registroSeleccionado = null;
    }
  }
  private prepareServices(): void {
    this.catalogoServices = this._catalogosService.getConvocatoria();
  }

  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
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

  ocultarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1007) {
      return true;
    } else {
      return false;
    }
    }
 limpiarVariablesSession() {
    sessionStorage.removeItem('convocatoriaCriterios');
    sessionStorage.removeItem('convocatoriaOrdenamiento');
    sessionStorage.removeItem('convocatoriaLimite');
    sessionStorage.removeItem('convocatoriaPagina');
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

/*  constructor() { }

  ngOnInit() {
  }

  ocultarOpcionActivar(): boolean {
    return true;
  }
  ocultarOpcionDesactivar(): boolean {
    return true;
  }*/

////////////////////////////////////////////// MODALS /////////////////////////////////////////////////
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

  ////////////////////////////////////////////// AGREGAR - EDITAR////////////////////////////////////////

  convocatoriaDocumento;
  estadoBoton: boolean;
  numeroIdTipoDocumento: number;
  numeroDocumentos: number;
  regitrosTiposDocumentos: Array<ConvocatoriaTiposDocumento>;
  paginaActualAE: number = 1;
  limiteAE: number = 10;
  registroSeleccionadoAE: ConvocatoriaTiposDocumento;
  entidadComiteEvaluador: Convocatoria;
  edicionFormulario: boolean = false;
  idConvocatoriaEditar;
  dtCierre: Date;
  dtInicio: Date;
  dtPrimera: Date;
  dtSegunda: Date;
  dtMaxima: Date;
  dt: Date;
  public registrosAE: Array<ConvocatoriaService> = [];
  public registrosDocumentos: Array<ConvocatoriaTiposDocumento> = [];
  catalogoServicesAE;
  columnasAE: Array<any> = [
    { titulo: 'Documentos', nombre: 'idTipoDocumento.valor', sort: false },
    { titulo: 'Clasificación', nombre: 'idClasificacion.valor', sort: false }
  ];
  public configuracionAE: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnasAE: 'idTipoDocumento.valor'}
  };
  formularioConvocatoria: FormGroup;
  agregarDocumento: FormGroup;
  validacionActiva: boolean = false;

  mensajeErrors: Array<Object> = [
    {mensaje: 'La fecha de resultados de primera fase no debe ser menor a la fecha de cierre de convocatoria.',
      traduccion: 'La fecha de resultados de primera fase no debe ser menor a la fecha de cierre de convocatoria.'}
  ];
  fechaInvalida: boolean = false;

  private opcionSelectProgramaDocente: Array<ItemSelects> = [];
  private opcionSelectPromocion: Array<ItemSelects> = [];
  private opcionPeriodoEscolar: Array<ItemSelects> = [];
  private opcionSelectDocumento: Array<ItemSelects> = [];
  private opcionSelectClasificacion: Array<ItemSelects> = [];
  private opcionEstatus: Array<ItemSelects> = [];
  private erroresConsultasAE: Array<ErrorCatalogo> = [];
  private erroresGuardadoAE: Array<ErrorCatalogo> = [];

  private constructorAgreEditConvo(modo): void {
    if (modo === 'editar' && this.registroSeleccionado) {
      this.idConvocatoriaEditar = this.registroSeleccionado.id;
    }else {
      this.idConvocatoriaEditar = null;
    }

    this.dtCierre = new Date();
    this.dtInicio = new Date();
    this.dtPrimera = new Date();
    this.dtSegunda = new Date();
    this.dtMaxima = new Date();
    this.dt = new Date();

    this.paginaActualAE = 1;
    this.limiteAE = 10;
    this.edicionFormulario = false;
    this.registrosAE = [];
    this.registrosDocumentos = [];
    this.validacionActiva = false;
    this.fechaInvalida = false;

    this.opcionSelectProgramaDocente = [];
    this.opcionSelectPromocion = [];
    this.opcionPeriodoEscolar = [];
    this.opcionSelectDocumento = [];
    this.opcionSelectClasificacion = [];
    this.opcionEstatus = [];
    this.erroresConsultasAE = [];
    this.erroresGuardadoAE = [];

    this.formularioConvocatoria = new FormGroup({
      idProgramaDocente: new FormControl('', Validators.required),
      url: new FormControl('', Validators.required),
      anioPublicacion: new FormControl('', Validators.
      compose([Validacion.anio])),
      fechaResultadosPrimera: new FormControl('', Validators.required),
      fechaResultadosSegunda: new FormControl('', Validators.required),
      fechaPublicacionResultados: new FormControl('', Validators.required),
      cierre: new FormControl('', Validators.required),
      maximaInscipcion: new FormControl('', Validators.required),
      cupoMaximo: new FormControl('', Validators.
      compose([Validacion.numerosValidator])),
      idPromocion: new FormControl('', Validators.required),
      idEstatus: new FormControl('', Validators.required),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      fechaInvalidaResultadosPrimeraFase: new FormControl(''),
      fechaInvalidaResultadosSegundaFase: new FormControl(''),
    });

    this.agregarDocumento = new FormGroup({
      idConvocatoria: new FormControl(this.idConvocatoriaEditar),
      idTipoDocumento: new FormControl('', Validators.required),
      idClasificacion: new FormControl('', Validators.required)
    });

    this.mostrarTablaAE();
    moment.locale('es');
    this.prepareServicesAE();

    this.getCatPeriodoEscolar();
    this.getCatEstatus();
    this.getClasificaciones();
    this.getCatalogoDocumento();

    ////console.log('revisando el ID' + this.context.idConvocatoriaEditar);
    if (this.idConvocatoriaEditar) {
      this.edicionFormulario = true;
      let convocatoriaEditar: Convocatoria;
      this.entidadComiteEvaluador = this.catalogoServices
          .getEntidadConvocatoria(
              this.idConvocatoriaEditar,
              this.erroresConsultasAE
          ).subscribe(
              // response es la respuesta correcta(200) del servidor
              // se convierte la respuesta a JSON,
              // se realiza la convercion del json a una entidad
              // de tipo editarConvocatoria
              response =>
                  convocatoriaEditar = new Convocatoria(
                      response.json()),
              // en caso de presentarse un error se agrega un nuevo error al array errores
              error => {

              },
              // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
              // al finalizar correctamente la ejecucion se muestra en consola el resultado
              () => {

                if (this.formularioConvocatoria) {

                  let stringidProgramaDocente = 'idProgramaDocente';
                  let stringurl = 'url';
                  let stringanioPublicacion = 'anioPublicacion';
                  let stringperiodoEscolar = 'periodoEscolar';
                  let strinigfechaResultadosPrimera = 'fechaResultadosPrimera';
                  let strinigfechaResultadosSegunda =  'fechaResultadosSegunda';
                  let strinigfechaPublicacionResultados = 'fechaPublicacionResultados';
                  let strinigcierre = 'cierre';
                  let strinigmaximaInscipcion = 'maximaInscipcion';
                  let strinigcupoMaximo = 'cupoMaximo';
                  let strinigidPromocion = 'idPromocion';
                  let strinigidEstatus = 'idEstatus';

                  let fechaResultadosPrimeraRecuperar = moment(
                      convocatoriaEditar.fechaResultadosPrimera);
                  let fechaResultadosSegundaRecuperar = moment(
                      convocatoriaEditar.fechaResultadosSegunda);
                  let fechaPublicacionResultadosRecuperar = moment(
                      convocatoriaEditar.fechaPublicacionResultados);
                  let cierreRecuperar = moment(convocatoriaEditar.cierre);
                  let maximaInscipcionRecuperar =
                      moment(convocatoriaEditar.maximaInscipcion);

                  (<FormControl>this.formularioConvocatoria.controls[stringidProgramaDocente])
                      .setValue(convocatoriaEditar.programaDocente.id);
                  (<FormControl>this.formularioConvocatoria.controls[stringurl])
                      .setValue(convocatoriaEditar.url);
                  (<FormControl>this.formularioConvocatoria.controls[stringanioPublicacion])
                      .setValue(convocatoriaEditar.anioPublicacion);
                  (<FormControl>this.formularioConvocatoria.controls[strinigcupoMaximo])
                      .setValue(convocatoriaEditar.cupoMaximo);
                  (<FormControl>this.formularioConvocatoria.controls[strinigidPromocion])
                      .setValue(convocatoriaEditar.promocion.id);
                  ////console.log(convocatoriaEditar.promocion.id);
                  (<FormControl>this.formularioConvocatoria.controls[strinigidEstatus])
                      .setValue(convocatoriaEditar.estatus.id);

                  this.cambioProgramaDocenteFiltro(convocatoriaEditar.programaDocente.id);
                  this.dtPrimera = new Date(fechaResultadosPrimeraRecuperar.toJSON());
                  this.dtSegunda = new Date(fechaResultadosSegundaRecuperar.toJSON());
                  this.dt = new Date(fechaPublicacionResultadosRecuperar.toJSON());
                  this.dtCierre = new Date(cierreRecuperar.toJSON());
                  this.dtMaxima = new Date(maximaInscipcionRecuperar.toJSON());
                  ////console.log('Revisando DATOS' + this.formularioConvocatoria);
                  this.cambioProgramaDocenteFiltro(convocatoriaEditar.programaDocente.id);
                }
              });
    }
    this.getCatalogoProgramasDocente();
    this.modalAgregarEditarConvo();
  }

  sortChangedAE(columna): void {
    this.columnasAE.forEach((column) => {
      if (columna !== column) {
        if (column.sort !== false) {
          column.sort = '';
        }
      }
    });

    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.mostrarTablaAE();
    }
  }

  mostrarTablaAE(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    if(this.idConvocatoriaEditar){
      criterios = 'idConvocatoria~' + this.idConvocatoriaEditar + ':IGUAL';
    }
    urlSearch.set('criterios', criterios);
    let ordenamiento = '';
    this.columnasAE.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('pagina', this.paginaActualAE.toString());
    //console.log(urlSearch);
    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<ConvocatoriaTiposDocumento>
    }  =
        this.evaluadorService.getListaConvocatoriaTiposDocumento(
            this.erroresConsultasAE, urlSearch, this.configuracionAE.paginacion);
    this.registrosDocumentos = resultados.lista;
    ////console.log('watchOUT');
    //console.log(resultados.lista);
    ////console.log('pruebas');
    ////console.log(resultados.lista);
  }

  rowSeleccionadoAE(registro): boolean {
    // //console.log(registro.id);
    return (this.registroSeleccionadoAE === registro);
  }

  setLimiteAE(limite: string): void {
    this.limiteAE = Number(limite);
    this.mostrarTabla();
  }

  rowSeleccionAE(registro): void {
    //console.log(registro.id);
    if (this.registroSeleccionadoAE !== registro) {
      this.registroSeleccionadoAE = registro;
    } else {
      this.registroSeleccionadoAE = null;
    }
  }

  validarFormulario(): boolean {
    this.validarFecha();
    if (this.formularioConvocatoria.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarFecha(): any {
    let fechaCierreConvocatoria = moment(this.dtCierre).format('DD/MM/YYYY');
    let fechaResultadosPrimeraFase = moment(this.dtPrimera).format('DD/MM/YYYY');
    let fechaResultadosSegundaFase = moment(this.dtSegunda).format('DD/MM/YYYY');
    //console.log(fechaCierreConvocatoria);
    //console.log(fechaResultadosPrimeraFase);

    /*let splitFechacierre = fechaCierreConvocatoria.split('/');
    let dateFechaCierreConvocatoria =
        new Date(splitFechacierre[2], splitFechacierre[1] - 1, splitFechacierre[0]);
    ////console.log(dateFechaDe);
    let splitFechaResultaPrimeraFase = fechaResultadosPrimeraFase.split('/');
    let dateFechaResultadosPrimeraFase =
        new Date(splitFechaResultaPrimeraFase[2],
            splitFechaResultaPrimeraFase[1] - 1, splitFechaResultaPrimeraFase[0]);
    ////console.log(dateFechaHasta);

    let splitFechaResultadosSegundaFase = fechaResultadosSegundaFase.split('/');
    let dateFechaResultadosSegundafase =
        new Date(splitFechaResultadosSegundaFase[2], splitFechaResultadosSegundaFase[1] - 1, splitFechaResultadosSegundaFase[0]);
    ////console.log(dateFechaDe);
*/
    if (fechaCierreConvocatoria > fechaResultadosPrimeraFase) {
      this.fechaInvalida = true;
      (<FormControl>this.formularioConvocatoria.controls[
          'fechaInvalidaResultadosPrimeraFase']).setValue('');

    } else {
      this.fechaInvalida = false;
      (<FormControl>this.formularioConvocatoria.controls[
          'fechaInvalidaResultadosPrimeraFase']).setValue('1');

    }

    if (fechaResultadosPrimeraFase > fechaResultadosSegundaFase) {
      this.fechaInvalida = true;
      (<FormControl>this.formularioConvocatoria.controls[
          'fechaInvalidaResultadosSegundaFase']).setValue('');

    } else {
      this.fechaInvalida = false;
      (<FormControl>this.formularioConvocatoria.controls[
          'fechaInvalidaResultadosSegundaFase']).setValue('1');
    }
  }

  validarFormularioDoc(): boolean {
    if (this.agregarDocumento.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this._spinner.start('enviar');
      // codigo para enviar el formulario
      event.preventDefault();
      let jsonFormulario = JSON.
      stringify(this.formularioConvocatoria.value, null, 2);
      //console.log(jsonFormulario);
      // codigo para enviar el formulario
      if (this.edicionFormulario) {
        this.catalogoServices
            .putConvocatoria(
                this.idConvocatoriaEditar,
                jsonFormulario,
                this.erroresGuardadoAE
            ).subscribe(
            () => {}, //console.log('Success Edition'),
            console.error,
            () => {
              this.mostrarTabla();
              this._spinner.stop('enviar');
              this.cerrarModalAgregarEditarConvo();
            }
        );
      }else {
        this.catalogoServices.
        postConvocatoriaModal(
            jsonFormulario,
            this.erroresGuardadoAE
        ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this._spinner.stop('enviar');
              this.mostrarTabla();
              this.cerrarModalAgregarEditarConvo();
            }
        );
      }
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioConvocatoria.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioConvocatoria.controls[campo]).valid &&
        this.validacionActiva) {
      return true;
    }
    return false;
  }
  getControlDoc(campo: string): FormControl {
    return (<FormControl>this.agregarDocumento.controls[campo]);
  }

  getControlErrorsDoc(campo: string): boolean {
    if (!(<FormControl>this.agregarDocumento.controls[campo]).valid &&
        this.validacionActiva) {
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
    return null;
  }

  getCatEstatus(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idCatalogo~' + '1004' + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionEstatus =
        this.catalogoServicesAE.getEstatusCatalogo().
        getSelectEstatusCatalogo(
            this.erroresConsultasAE, urlParameter);
    ////console.log('periodoEscolar');
    ////console.log(this.opcionPeriodoEscolar);
  }

  getClasificaciones(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idCatalogo~' + '1015' + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionSelectClasificacion =
        this.catalogoServicesAE.getEstatusCatalogo().
        getSelectEstatusCatalogo(
            this.erroresConsultasAE, urlParameter);
  }

  getCatPeriodoEscolar(): void {
    this.opcionPeriodoEscolar =
        this.catalogoServicesAE.getPeriodoEscolar().
        getSelectPeriodoEscolarPeriodo(
            this.erroresConsultasAE);
    ////console.log('periodoEscolar');
    ////console.log(this.opcionPeriodoEscolar);
  }

  getCatalogoProgramasDocente(): void {
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    if (this.edicionFormulario) {
      //console.log('edicion');
      let urlParameter: URLSearchParams = new URLSearchParams();
      // 1007 id del catalogo de estatus solo avtivos
      let resultados: {
        lista: Array<ConvocatoriaService>
      }  =
          this.catalogoServicesAE.getCatalogoProgramaDocente().
          getListaProgramaDocenteModal(
              this.erroresConsultasAE, urlParameter);
      this.registrosAE = resultados.lista;
      ////console.log(resultados.lista);
    } else {
      //console.log('else');
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstatus~' + '1007' + ':IGUAL');
      // 1007 id del catalogo de estatus solo avtivos
      let resultados: {
        lista: Array<ConvocatoriaService>
      }  =
          this.catalogoServicesAE.getCatalogoProgramaDocente().
          getListaProgramaDocenteModal(
              this.erroresConsultasAE, urlParameter);
      this.registrosAE = resultados.lista;
      ////console.log(resultados.lista);
    }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    if (this.edicionFormulario) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
      this.opcionSelectPromocion = this.catalogoServicesAE.getPromocion()
          .getSelectPromocion(this.erroresConsultasAE, urlParameter);
    } else {
      ////console.log('idProgramaDocente', idProgramaDocente);
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL' +
          ',idEstatus~' + '1011' + ':IGUAL');
      this.opcionSelectPromocion = this.catalogoServicesAE.getPromocion()
          .getSelectPromocion(this.erroresConsultasAE, urlParameter);
    }

  }

  ////// picker ///

  getFechaPrimera(): string {
    ///console.log(this.dtPrimera);
    if (this.dtPrimera) {
      let fechaConFormato = moment(this.dtPrimera).format('DD/MM/YYYY');
      (<FormControl>this.formularioConvocatoria.controls['fechaResultadosPrimera'])
          .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaCierre(): string {
    if (this.dtCierre) {
      let fechaConFormato = moment(this.dtCierre).format('DD/MM/YYYY');
      (<FormControl>this.formularioConvocatoria.controls['cierre'])
          .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaSegunda(): string {
    if (this.dtSegunda) {
      let fechaConFormato = moment(this.dtSegunda).format('DD/MM/YYYY');
      (<FormControl>this.formularioConvocatoria.controls['fechaResultadosSegunda'])
          .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaPublicacion(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioConvocatoria.controls['fechaPublicacionResultados'])
          .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaMaxima(): string {
    if (this.dtMaxima) {
      let fechaConFormato = moment(this.dtMaxima).format('DD/MM/YYYY');
      (<FormControl>this.formularioConvocatoria.controls['maximaInscipcion'])
          .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getCatalogoDocumento(): void {
    //    SE OBTIENE CATALOGO Documento
    this.opcionSelectDocumento =
        this.catalogoServicesAE.getTipoDocumento().getSelectTipoDocumento(
            this.erroresConsultasAE);
    ////console.log('documento');
    ////console.log(this.opcionSelectDocumento);
  }

  agregarDocumentos(): void {
    if ( this.numeroDocumentos < 1) {
      if (this.validarFormularioDoc()) {
        let jsonFormulario = JSON.stringify(this.agregarDocumento.value, null, 2);

        this.convocatoriaDocumento
            .postConvocatoriaTiposDocumento(
                jsonFormulario,
                this.erroresGuardadoAE
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.mostrarTablaAE();
            }
        );
      }
    }
    this.opcionSelectDocumento =
        this.catalogoServicesAE.getTipoDocumento().getSelectTipoDocumento(
            this.erroresConsultasAE);
    this.estadoBoton = false;

    this.agregarDocumento = new FormGroup({
      idConvocatoria: new FormControl(this.idConvocatoriaEditar),
      idTipoDocumento: new FormControl('', Validators.required),
      idClasificacion: new FormControl('', Validators.required)
    });
  }

  eliminarDocumento () {
    if (this.registroSeleccionadoAE) {
      ////console.log('Eliminando...');
      this.evaluadorService.deleteConvocatoriaDocumento(
          this.registroSeleccionadoAE.id,
          this.erroresConsultasAE
      ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.mostrarTablaAE();
          }
      );
    }else {
      //alert('Selecciona un registro');
      //console.log('Selecciona un registro');
    }
    this.registroSeleccionadoAE =  null;
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionadoAE) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonAgregar(): boolean{
    if (this.agregarDocumento.valid) {
      return true;
    }
    return false;
  }

  getIdTipoDocumento(idTipoDocumento): void {
    this.estadoBoton = false;
    if (idTipoDocumento) {
      this.numeroIdTipoDocumento = idTipoDocumento;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idTipoDocumento~' +
          this.numeroIdTipoDocumento + ':IGUAL' +
          ',idConvocatoria~' + this.idConvocatoriaEditar + ':IGUAL');
      // 1004 id del catalogo de estatus

      this.evaluadorService.getListaConvocatoriaTiposDocumentoPag(this.erroresConsultasAE,
          urlParameter).subscribe(
          response => {
            this.regitrosTiposDocumentos = [];
            let respuesta = response.json();
            respuesta.lista.forEach((item) => {
              this.regitrosTiposDocumentos.push(new ConvocatoriaTiposDocumento(item));
            });
            this.numeroDocumentos = this.regitrosTiposDocumentos.length;
            //console.log('TAMAÑO' + this.regitrosTiposDocumentos.length);
          },
          error => {

          },
          () => {
            if(this.numeroDocumentos<1){
              this.estadoBoton = true;
            }else {
              this.estadoBoton = false;
            }
          }
      );
    }else {
      this.estadoBoton = false;
    }
  }

  private prepareServicesAE(): void {
    this.catalogoServicesAE = this._catalogosService;
    this.convocatoriaDocumento = this._catalogosService
        .getDocumentoConvocatoria();
  }

  modalAgregarEditarConvo(): void {
    this.modalAgreActu.open('lg');
  }

  cerrarModalAgregarEditarConvo(): void {
    this.formularioConvocatoria.reset();
    this.agregarDocumento.reset();
    this.modalAgreActu.close();
  }

  ////////////////////////////////////////////// DETALLE ////////////////////////////////////////

  entidadConvocatoria: Convocatoria;
  convocatoriaDocumentos;

  private constructorDetalleConvo(): void {
    this.erroresConsultasAE = [];
    this.prepareServicesEC();

    this.catalogoServices.getEntidadConvocatoria(
        this.registroSeleccionado.id,
        this.erroresConsultasAE
    ).subscribe(
        response => {
          this.entidadConvocatoria
              = new Convocatoria(response.json());
        },
        error => {

        },
        () => {

        }
    );
    this.modalDetalleConvo();
  }

  listaDocumentosConvocatoria(): void{
    let urlSearch: URLSearchParams = new URLSearchParams();
    //console.log('---------------------------');
    //console.log(this.context.idConvocatoria);
    let criterio = 'idConvocatoria~' + this.registroSeleccionado.id + ':IGUAL';
    urlSearch.set('criterios', criterio);

    this.registrosAE =
        this.convocatoriaDocumentos.getListaConvocatoriaTiposDocumento(
            this.erroresConsultasAE,
            urlSearch
        ).lista;
    //console.log(this.registros);
  }

  private prepareServicesEC(): void {
    this.convocatoriaDocumentos =
        this._catalogosService.getDocumentoConvocatoria();
    this.listaDocumentosConvocatoria();
  }

  modalDetalleConvo(): void {
    this.modalDetalle.open('lg');
  }

  cerrarModalDetalleConvo(): void {
    this.modalDetalle.close();
  }

}
