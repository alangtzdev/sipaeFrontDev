import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {Beca} from "../../services/entidades/beca.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {BecaService} from "../../services/entidades/beca.service";
import {Validacion} from "../../utils/Validacion";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-becas-apoyos',
  templateUrl: './becas-apoyos.component.html',
  styleUrls: ['./becas-apoyos.component.css']
})
export class BecasApoyosComponent implements OnInit {

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  maxSizePags: number = 5;
  limite: number = 10;
  registros: Array<Beca> = [];
  columnas: Array<any> = [
    { titulo: 'Descripción*', nombre: 'descripcion', sort: 'asc'},
    { titulo: 'Clasificación', nombre: 'idClasificacion.valor', sort: 'asc'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion', sort: 'asc'},
    { titulo: 'Estatus', nombre: 'idEstatus.valor', sort: 'asc'}
  ];
  registroSeleccionado: Beca;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  formularioActualizarRegistro: FormGroup;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'descripcion' }
  };

  // se declaran variables para consultas de base de datos
  catalogoBecasService;

  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];


  constructor(//private modal: Modal,
              private _spinner: SpinnerService,
              private injector: Injector,
              public _catalogosService: CatalogosServices
  ) {
    this.formularioBecaApoyo = new FormGroup({
      descripcion: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      idClasificacion: new FormControl('', Validators.required),
      idEstatus: new FormControl('', Validators.required)
    });
    this.prepareServices();
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
      this._spinner.start("becaapoyos1");
    }
    this.catalogoBecasService.getListaBeca(
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
          this.registros.push(new Beca(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("becaapoyos1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("becaapoyos1");
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

  cambiarEstatusBeca(modo): void {
    this._spinner.start('becaapoyos1');
    //console.log(modo);
    let idBeca: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    }else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      idBeca = this.registroSeleccionado.id;
      //console.log(idBeca);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      //console.log(jsonCambiarEstatus);

      this.catalogoBecasService.putBeca(
        idBeca,
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

      retorno = moment(fecha).format("DD/MM/YYYY");
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

  private prepareServices(): void {
    this.catalogoBecasService
      = this._catalogosService.getCatalogoBecas();
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

  edicionFormulario: boolean = false;
  formularioBecaApoyo: FormGroup;
  entidadBecasApoyos: Beca;
  catalogoEstatus;
  catalogoClasificacionBecas;
  validacionActiva: boolean = false;

  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private opcionesCatalogoClasificacion: Array<ItemSelects> = [];
  private erroresConsultasAA: Array<ErrorCatalogo> = [];
  private erroresGuardadoAA: Array<Object> = [];
  private _estatusService: EstatusCatalogoService;
  private _becaService: BecaService;
  private idBeca: number;

  private constructorAgreActu(modo): void {

    let idBecaAux: number;
    this.idBeca = idBecaAux;
    this.edicionFormulario = false;
    this.validacionActiva = false;
    this.opcionesCatalogoEstatus = [];
    this.opcionesCatalogoClasificacion = [];
    this.erroresConsultasAA = [];
    this.erroresGuardadoAA = [];

    if (modo === 'editar' && this.registroSeleccionado) {
      this.idBeca = this.registroSeleccionado.id;
    }else {
      this.idBeca = null;
    }
    this.formularioBecaApoyo = new FormGroup({
      descripcion: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      idClasificacion: new FormControl('', Validators.required),
      idEstatus: new FormControl('', Validators.required)
    });
    this.prepareServicesAA();

    if (this.idBeca) {
      this.edicionFormulario = true;
      let beca: Beca;
      this.entidadBecasApoyos = this.catalogoBecasService
          .getBeca(
              this.idBeca,
              this.erroresConsultasAA
          ).subscribe(
              // response es la respuesta correcta(200) del servidor
              // se convierte la respuesta a JSON,
              // se realiza la convercion del json a una entidad
              // de tipo ClasificacionPreguntasFrecuentes
              response =>
                  beca = new Beca(
                      response.json()),
              // en caso de presentarse un error se agrega un nuevo error al array errores
              error => {
                //if (assertionsEnable()) {
                  //console.error(error);
                //}
              },
              // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
              // al finalizar correctamente la ejecucion se muestra en consola el resultado
              () => {
                //if (assertionsEnabled()) {
                  // //console.log(nivelEstudios);
                //}
                if (this.formularioBecaApoyo) {
                  let stringDescripcion = 'descripcion';
                  let stringClasificacion = 'idClasificacion';
                  let stringEstatus = 'idEstatus';
                  (<FormControl>this.formularioBecaApoyo.controls[stringDescripcion])
                      .setValue(beca.descripcion);
                  (<FormControl>this.formularioBecaApoyo.controls[stringClasificacion])
                      .setValue(beca.clasificacion.id);
                  (<FormControl>this.formularioBecaApoyo.controls[stringEstatus])
                      .setValue(beca.estatus.id);
                  //console.log(this.formularioBecaApoyo);
                }
              }
          );
    }
    this.modalAgregarActualizar();
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this._spinner.start('');
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formularioBecaApoyo.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.catalogoBecasService
            .putBeca(
                this.idBeca,
                jsonFormulario,
                this.erroresGuardadoAA
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgregarActualizar();
              this._spinner.stop('');
            }
        );
      } else {
        this.catalogoBecasService
            .postBeca(
                jsonFormulario,
                this.erroresGuardadoAA
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgregarActualizar();
              this._spinner.stop('');
            }
        );
      }
    } else { }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioBecaApoyo.controls[campo]);
  }

  validarFormulario(): boolean {
    if (this.formularioBecaApoyo.valid) {
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

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioBecaApoyo.controls[campo]).
            valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServicesAA(): void {
    this.catalogoEstatus = this._catalogosService.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    //console.log(urlParameter);
    let _estatusService: EstatusCatalogoService =
        this._catalogosService.getEstatusCatalogo();
    this.opcionesCatalogoEstatus =
        _estatusService.getSelectEstatusCatalogo(this.erroresConsultasAA, urlParameter);
    this.catalogoClasificacionBecas =
        this._catalogosService.getClasificacionBeca();
    this.opcionesCatalogoClasificacion =
        this.catalogoClasificacionBecas.getSelectClasificacionBeca(this.erroresConsultasAA);
  }

  modalAgregarActualizar(): void {
    this.modalAgreActu.open();
  }

  cerrarModalAgregarActualizar(): void {
    this.modalAgreActu.close();
  }
  ///////////////////////////////////////////////-- DETALLE -- ///////////////////////////////////////////////

  entidadBecas: Beca;
  private erroresConsultasDB: Array<ErrorCatalogo> = [];

  private constructorDB(): void {
    this.erroresConsultasDB = [];

    this.catalogoBecasService
        .getEntidadBeca(
            this.registroSeleccionado.id,
            this.erroresConsultasDB
        ).subscribe(
        response => {
          this.entidadBecas
              = new Beca(response.json());
        },
        error => {

        },
        () => {

        }
    );
    this.modalDetalleBeca();
  }

  modalDetalleBeca(): void {
    this.modalDetalle.open();
  }

  cerrarModalDetalleBeca(): void {
    this.modalDetalle.close();
  }
}
