import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ModalidadCalificacion} from "../../services/entidades/modalidad-calificacion.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Validacion} from "../../utils/Validacion";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-calificaciones',
  templateUrl: './calificaciones.component.html',
  styleUrls: ['./calificaciones.component.css']
})
export class CalificacioneComponent implements OnInit {

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<ModalidadCalificacion> = [];
  columnas: Array<any> = [
    { titulo: 'Descripción*', nombre: 'descripcion'},
    { titulo: 'Promoción*', nombre: 'idPromocion',  sort: false},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];

  exportarExcelUrl = '';
  exportarPDFUrl = '';
  registroSeleccionado: ModalidadCalificacion;
  modalidadCalificacionService;

  public disabled: boolean = false;
  public status: {isopen: boolean} = {isopen: false};

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'descripcion,idPromocion.abreviatura'}
  };
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(//private modal: Modal,
              private injector: Injector,
              public catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              public _estatusService: EstatusCatalogoService
  ) {
    this.prepareService();
    this.formularioModalidadCalificacion = new FormGroup({
      descripcion: new FormControl(''),
      idEstatus: new FormControl(''),
      calificacionMaxima: new FormControl(''),
      calificacionMinima: new FormControl(''),
      calificacionMinimaAprobatoria: new FormControl(''),
      promedioMinimo: new FormControl(''),
      idPromocion: new FormControl('')
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
      this._spinner.start("catalogocalificaciones1");
    }

    this.modalidadCalificacionService.getListaModalidadCalificacion(
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
          this.registros.push(new ModalidadCalificacion(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("catalogocalificaciones1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("catalogocalificaciones1");
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

  cambiarEstatusModalidadCalificacion(modo): void {
    // //console.log(modo);
    let idModalidadCalificacion: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    }else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      this._spinner.start("catalogocalificaciones1");
      idModalidadCalificacion = this.registroSeleccionado.id;
      // //console.log(idModalidadCalificacion);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      //console.log(jsonCambiarEstatus);

      this.modalidadCalificacionService.putModalidadCalificacion(
        idModalidadCalificacion,
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

  mostrarBotones(): boolean {
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
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Metodo para formato de fecha                               //
///////////////////////////////////////////////////////////////////////////////////////////////

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format("DD/MM/YYYY");
    }
    return retorno;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////

  //                       Metodos para desplegar menu de boton de exportar                      //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  public toggled(open:boolean):void {
    //console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event:MouseEvent):void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  // exportar a excel y pdf
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

  private prepareService(): void {
    this.modalidadCalificacionService =
      this.catalogosService.getModalidadCalificacionService();
  }

/*  constructor() { }

  ngOnInit() {
  }

  mostrarBotones(): boolean {
    return true;
  }

  mostrarBotonEditar(): boolean {
    return true;
  }

  mostrarBotonAgregar(): boolean {
    return true;
  }
  mostrarBotonConstancia(): boolean {
    return true;
  }
  mostrarBotonValidarActa(): boolean {
    return true;
  }
  habilitarProgramas(): boolean {
    return true;
  }

  habilitarPromociones(): boolean {
    return true;
  }
  habilitarPeriodos(): boolean {
    return true;
  }

  habilitarMaterias(): boolean {
    return true;
  }*/

//////////////////////////////////// MODALS/////////////////////////////////////////////////////////////

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

  /////////////////////////////////////// AGREGAR / EDITAR /////////////////////////////////////////////

  edicionFormulario: boolean = false;
  formularioModalidadCalificacion: FormGroup;
  entidadModalidadCalificacion: ModalidadCalificacion;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};
  catalogoEstatus;
  validacionActiva: boolean = false;
  idModalidadCalificacion;

  private opcionesCatalogoPromocion: Array<ItemSelects> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private erroresConsultasAE: Array<ErrorCatalogo> = [];
  private erroresGuardadoAE: Array<ErrorCatalogo> = [];

  constructorAgreEdiCalif(modo): void {

    this.edicionFormulario = false;
    this.validacionActiva = false;
    this.opcionesCatalogoPromocion = [];
    this.opcionesCatalogoEstatus = [];
    this.erroresConsultasAE = [];
    this.erroresGuardadoAE = [];
    this.prepareServices();

    if (modo === 'editar' && this.registroSeleccionado) {
      this.idModalidadCalificacion = this.registroSeleccionado.id;
    } else {
      this.idModalidadCalificacion = null;
    }

    this.formularioModalidadCalificacion = new FormGroup({
      descripcion: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      idEstatus: new FormControl('', Validators.required),
      calificacionMaxima: new FormControl('', Validators.
      compose([Validators.required, Validacion.numerosValidator])),
      calificacionMinima: new FormControl('', Validators.
      compose([Validators.required, Validacion.numerosValidator])),
      calificacionMinimaAprobatoria: new FormControl('', Validators.
      compose([Validators.required, Validacion.numerosValidator])),
      promedioMinimo: new FormControl('', Validators.
      compose([Validators.required, Validacion.numerosValidator])),
      idPromocion: new FormControl('', Validators.required)
    });

    if (this.idModalidadCalificacion) {
      //console.log(this.context.idModalidadCalificacion);
      this.edicionFormulario = true;
      let modalidadCalificacion: ModalidadCalificacion;
      this.entidadModalidadCalificacion = this.modalidadCalificacionService
          .getModalidadCalificacion(
              this.idModalidadCalificacion,
              this.erroresConsultasAE
          ).subscribe(
              // response es la respuesta correcta(200) del servidor
              // se convierte la respuesta a JSON,
              // se realiza la convercion del json a una entidad
              // de tipo ClasificacionPreguntasFrecuentes
              response =>
                  modalidadCalificacion = new ModalidadCalificacion(
                      response.json()),
              // en caso de presentarse un error se agrega un nuevo error al array errores
              error => {

              },
              // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
              // al finalizar correctamente la ejecucion se muestra en consola el resultado
              () => {

                if (this.formularioModalidadCalificacion) {

                  let stringDescripcion = 'descripcion';
                  let intIdEstatus = 'idEstatus';
                  let stringCalificacionMaxima = 'calificacionMaxima';
                  let stringCalificacionMinima = 'calificacionMinima';
                  let stringCalificacionMinimaAprobatoria =
                      'calificacionMinimaAprobatoria';
                  let stringPromedioMinimo = 'promedioMinimo';
                  let intIdPromocion = 'idPromocion';
                  //console.log(modalidadCalificacion);
                  (<FormControl>this.formularioModalidadCalificacion.
                      controls[stringDescripcion])
                      .setValue(modalidadCalificacion.descripcion);
                  (<FormControl>this.formularioModalidadCalificacion.controls[intIdEstatus])
                      .setValue(modalidadCalificacion.estatus.id);
                  (<FormControl>this.formularioModalidadCalificacion.
                      controls[stringCalificacionMaxima])
                      .setValue(modalidadCalificacion.calificacionMaxima);
                  (<FormControl>this.formularioModalidadCalificacion.
                      controls[stringCalificacionMinima])
                      .setValue(modalidadCalificacion.calificacionMinima);
                  (<FormControl>this.formularioModalidadCalificacion.
                      controls[stringCalificacionMinimaAprobatoria])
                      .setValue(modalidadCalificacion.calificacionMinimaAprobatoria);
                  (<FormControl>this.formularioModalidadCalificacion.
                      controls[stringPromedioMinimo])
                      .setValue(modalidadCalificacion.promedioMinimo);
                  (<FormControl>this.formularioModalidadCalificacion.controls[intIdPromocion])
                      .setValue(modalidadCalificacion.promocion.id);
                }
              }
          );
    }
    this.modalAgreEdiCalif();
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      event.preventDefault();
      this._spinner.start('env');
      let jsonFormulario = JSON.
      stringify(this.formularioModalidadCalificacion.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.modalidadCalificacionService
            .putModalidadCalificacion(
                this.idModalidadCalificacion,
                jsonFormulario,
                this.erroresGuardadoAE
            ).subscribe(
            () => {}, //console.log('Success Edition'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgreEdiCalif();
              this._spinner.stop('env');
            }
        );
      } else {
        this.modalidadCalificacionService
            .postModalidadCalificacion(
                jsonFormulario,
                this.erroresGuardadoAE
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgreEdiCalif();
              this._spinner.stop('env');
            }
        );
      }
    } else {   }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioModalidadCalificacion.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioModalidadCalificacion.controls[campo]).valid &&
        this.validacionActiva) {
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

  validarFormulario(): boolean {
    if (this.formularioModalidadCalificacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  private prepareServices(): void {
    this.catalogoEstatus = this.catalogosService;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    //console.log(urlParameter);
    this.opcionesCatalogoEstatus =
        this._estatusService.
        getSelectEstatusCatalogo(this.erroresConsultasAE, urlParameter);
    urlParameter.set('criterios', 'idEstatus~' + '1011' + ':IGUAL');
    // 1011 promociones activas
    this.opcionesCatalogoPromocion =
        this.catalogoEstatus.getPromocion().
        getSelectPromocion(this.erroresConsultasAE, urlParameter);
  }

  modalAgreEdiCalif(): void {
    this.modalAgreActu.open();
  }

  cerrarModalAgreEdiCalif(): void {
    this.modalAgreActu.close();
  }

  /////////////////////////////////// DETALLE //////////////////////////////////////////////////

  constructorDetalleCalif(): void {
    this.erroresConsultasAE = [];

    this.modalidadCalificacionService
        .getEntidadModalidadCalificacion(
            this.registroSeleccionado.id,
            this.erroresConsultasAE
        ).subscribe(
        response => {
          this.entidadModalidadCalificacion
              = new ModalidadCalificacion(response.json());
          //console.log(this.entidadModalidadCalificacion);
        },
        error => {

        },
        () => {
        }
    );
    this.modalDetalleCalif();
  }

  modalDetalleCalif(): void {
    this.modalDetalle.open();
  }

  cerrarModalDetalleCalif(): void {
    this.modalDetalle.close();
  }

}
