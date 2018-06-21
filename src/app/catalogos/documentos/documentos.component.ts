import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {TipoDocumento} from "../../services/catalogos/tipo-documento.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Validacion} from "../../utils/Validacion";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-documentos',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export class DocumentosComponent implements OnInit {

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<TipoDocumento> = [];
  columnas: Array<any> = [
    { titulo: 'Nombre del documento*', nombre: 'valor', sort: 'asc'},
    { titulo: 'Área del documento*', nombre: 'idAreaDocumento.valor', sort: 'asc'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion', sort: 'asc'},
    { titulo: 'Estatus', nombre: 'activo', sort: 'asc'}
  ];
  registroSeleccionado: TipoDocumento;
  nombreCatalogo: string = 'TipoDocumento';
  tipoDocumentoService;

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'valor,idAreaDocumento.valor'}
  };
  private erroresConsultas: Array<Object> = [];

  public disabled: boolean = false;
  public status:{isopen:boolean} = {isopen: false};

  constructor(
//    private modal: Modal,
    private injector: Injector,
    public _catalogosService: CatalogosServices,
    private _spinner: SpinnerService
  ) {
    this.inicializarFormulario();
    this.prepareServices();

        if(sessionStorage.getItem('documentos')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('documentosCriterios')){
        this.onCambiosTabla();
  }
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
     let ordenamiento = '';
    if (!sessionStorage.getItem('documentosCriterios')) {
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
     sessionStorage.setItem('documentosCriterios', criterios);
    sessionStorage.setItem('documentosOrdenamiento', ordenamiento);
    sessionStorage.setItem('documentosLimite', this.limite.toString());
    sessionStorage.setItem('documentosPagina', this.paginaActual.toString());
}

this.limite = +sessionStorage.getItem('documentosLimite') ? +sessionStorage.getItem('documentosLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('documentosPagina') ? +sessionStorage.getItem('documentosPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('documentosCriterios')
     ? sessionStorage.getItem('documentosCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('documentosOrdenamiento') 
    ? sessionStorage.getItem('documentosOrdenamiento') : ordenamiento);
   urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());

    if (this.configuracion.filtrado.textoFiltro !== '') {
      this._spinner.start("catalogodocumentos1");
    }

    this.tipoDocumentoService.getListaTipoDocumento(
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
          this.registros.push(new TipoDocumento(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
          this._spinner.stop();
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);

        }*/
        this._spinner.stop("catalogodocumentos1");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
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
      limpiarVariablesSession() {
    sessionStorage.removeItem('documentosCriterios');
    sessionStorage.removeItem('documentosOrdenamiento');
    sessionStorage.removeItem('documentosLimite');
    sessionStorage.removeItem('documentosPagina');
    }
    

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CAMBIAR ESTATUS                                             //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  activarDesacticarRegistro(accion): void {
    if (this.registroSeleccionado) {
      this._spinner.start("catalogodocumentos1");
      let tipoEstatus: boolean = false;
      if (accion === 'activar') {
        tipoEstatus = true;
      }
      let estatus = {'activo': tipoEstatus};
      let jsonFormulario = JSON.stringify(estatus, null, 2);
      this.tipoDocumentoService.putTipoDocumento(
        this.registroSeleccionado.id,
        jsonFormulario,
//        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTabla();
        }
      );
    }else {
      alert('Seleccione un registro.');
    }
  }

  private prepareServices(): void {
    this.tipoDocumentoService =
      this._catalogosService.getTipoDocumento();
    this.catalogoAreaDocumento =
        this._catalogosService.getAreaDocumentoService();
    this.opcionesCatalogoAreaDocumento =
        this.catalogoAreaDocumento.getSelectAreaDocumento(this.erroresConsultasAEConvo);
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
      this.registroSeleccionado.activo === false) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.activo === true) {
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

  edicionFormulario: boolean = false;
  formulario: FormGroup;
  entidadTipoDocumento: TipoDocumento;
  validacionActiva: boolean = false;
  catalogoAreaDocumento;
  idTipoDocumento: number;

  private erroresConsultasAEConvo: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private opcionesCatalogoAreaDocumento: Array<ItemSelects> = [];

  inicializarFormulario(): void {
    this.formulario = new FormGroup({
      valor: new FormControl(
          '', Validators.compose([Validacion.parrafos,
            Validators.required])
      ),
      activo: new FormControl(
          '',
          Validators.required
      ),
      idAreaDocumento: new FormControl('', Validators.required),
      descripcion: new FormControl('', Validators.compose([Validacion.parrafos]))
    });
  }

  private constructorAgreEditDocs(modo): void {
    this.edicionFormulario =false;
    this.validacionActiva = false;

    if ( modo === 'editar'&& this.registroSeleccionado ) {
        this.idTipoDocumento = this.registroSeleccionado.id;
    } else {
      this.idTipoDocumento = null;
    }
    this.edicionFormulario = false;
    this.validacionActiva = false;
    this.erroresConsultasAEConvo = [];
    this.erroresGuardado = [];
    this.opcionesCatalogoAreaDocumento = [];
    this.prepareServices();
    this.inicializarFormulario();

    if (this.idTipoDocumento) {
      this.edicionFormulario = true;
      let tipoDocumento: TipoDocumento;
      this.entidadTipoDocumento = this.tipoDocumentoService
          .getTipoDocumento(
              this.idTipoDocumento,
              this.erroresConsultasAEConvo
          ).subscribe(
              response =>
                  tipoDocumento = new TipoDocumento(
                      response.json()),
              error => {

              },
              () => {

                if (this.formulario) {
                  let stringDescripcion = 'descripcion';
                  let stringValor = 'valor';
                  let stringActivo = 'activo';
                  let stringIdAreaDocumento = 'idAreaDocumento';

                  (<FormControl>this.formulario.controls[stringValor])
                      .setValue(tipoDocumento.valor);
                  (<FormControl>this.formulario.controls[stringActivo])
                      .setValue(tipoDocumento.activo ? 1 : 0);
                  //console.log(this.formulario);
                  (<FormControl>this.formulario.controls[stringIdAreaDocumento])
                      .setValue(tipoDocumento.idAreaDocumento.id);
                  //console.log(this.formulario);
                  (<FormControl>this.formulario.controls[stringDescripcion])
                      .setValue(tipoDocumento.descripcion);
                }
              }
          );
      }
      this.modalAgregarEditarDocs();
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      event.preventDefault();
      this._spinner.start("catalogodocumentos1");
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log('JSON' +jsonFormulario);
      if (this.edicionFormulario) {
        this.tipoDocumentoService
            .putTipoDocumento(
                this.idTipoDocumento,
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgregarEditarDocs();
            }
        );
      } else {
        this.tipoDocumentoService
            .postTipoDocumento(
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.onCambiosTabla();
              this.cerrarModalAgregarEditarDocs();
            }
        );
      }
    } else {}
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid &&
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
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  modalAgregarEditarDocs(): void {
    this.modalAgreActu.open();
  }

  cerrarModalAgregarEditarDocs(): void {
    this.modalAgreActu.close();
    this.formulario.reset();
  }

  ////////////////////////////////////////////// EDITAR ////////////////////////////////////////

  //entidadTipoDocumento: TipoDocumento;
  //private erroresConsultas: Array<ErrorCatalogo> = [];

  private constructorDetalleDocs(): void {
    this.tipoDocumentoService
        .getEntidadTipoDocumento(
            this.registroSeleccionado.id,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadTipoDocumento
              = new TipoDocumento(response.json());
        },
        error => {

        },
        () => {

        }
    );
    this.modalDetalleDocs();
  }

  modalDetalleDocs(): void {
    this.modalDetalle.open('lg');
  }

  cerrarModalDetalleDocs(): void {
    this.modalDetalle.close();
  }

}
