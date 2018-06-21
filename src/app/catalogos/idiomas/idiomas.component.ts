import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {Idioma} from "../../services/entidades/idioma.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";


@Component({
  selector: 'app-idiomas',
  templateUrl: './idiomas.component.html',
  styleUrls: ['./idiomas.component.css']
})
export class IdiomasComponent implements OnInit {

  @ViewChild('modalDetalleIdioma')
  modalDetalleIdioma: ModalComponent;
  @ViewChild('modalAgregarEditarIdioma')
  modalAgregarEditar: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                VARIABLES                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** SERVICES**************************************//
  catalogoService;
  catalogoEstatus;
  // ************************** TABLAS**************************************//
  registroSeleccionado: Idioma;
  registros: Array<Idioma> = [];
  columnas: Array<any> = [
    { titulo: 'Idioma*', nombre: 'descripcion' },
    { titulo: 'Lengua indígena', nombre: 'indigena', sort: false}, // pendiente nombre
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion' }, // pendiente nombre
    { titulo: 'Estatus', nombre: 'idEstatus'}, // pendiente nombre
  ];
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'descripcion' } // definir bien que columa
  };

  // se declaran variables para exportar
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  // se declaran variables para dropzone del btn exportar
  public disabled: boolean = false;
  public status: {isopen: boolean} = {isopen: false};

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  ///variable para almacenar la informacion de detalle idioma///
  private entidadIdioma: Idioma;
  private idEntidadIdiomaSeleccionada: number;
  ///// Fin de la secicon de variables para detalle idioma////

  //// varaibles para agregar - editar idioma/////
  formularioIdioma: FormGroup;
  validacionActiva: boolean = false;
  edicionFormulario: boolean = false;
  private idIdiomaEditar: number;
  private erroresConsultasAgregarEditar: Array<ErrorCatalogo> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  //// fin de la seccion de variables para agregar- editar idioma

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CONSTRUCTOR                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  constructor(//private modal: Modal,
              private injector: Injector,
              public catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              public _estatusService: EstatusCatalogoService) {
    this.prepareServices();
    this.inicalizarFormularioAgregarEdidtarIdioma();
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                             SE EJECUTA AUTOMATICAMENTE                                    //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(): void {
    this.onCambiosTabla();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                OBTENER LISTA TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
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

    }
    this._spinner.start("catalogoidiomas1");
    this.catalogoService.getListaIdioma(
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
          this.registros.push(new Idioma(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
  /*      if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("catalogoidiomas1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("catalogoidiomas1");
      }
    );
  }
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

    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }
  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  // ************************** para ponrle como una clase atributo seleccionar **************//
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  // ************************** Cuantos registros quieres que se muestren **************//
  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }
  // ************************** El usuario selecciona el registro **************//
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CAMBIAR ESTATUS                                             //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  activarDesacticarRegistro(accion): void {
    if (this.registroSeleccionado) {
      let tipoEstatus: number = 0;
      if (accion === 'activar' && this.registroSeleccionado.estatus.valor !== 'ACTIVO') {
        tipoEstatus = 1007;
      }else if ( this.registroSeleccionado.estatus.valor !== 'DESACTIVADO') {
        tipoEstatus = 1008;
      }
      if ( tipoEstatus !== 0 ) {
        let estatus = {'idEstatus': tipoEstatus};
        let jsonFormulario = JSON.stringify(estatus, null, 2);
        this.catalogoService.putIdioma(
          this.registroSeleccionado.id,
          jsonFormulario, this.erroresGuardado
        ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.onCambiosTabla();
          }
        );
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CAMBIAR VISTAS                                             //
  ///////////////////////////////////////////////////////////////////////////////////////////////
/*  modalFormulario(modo): void {
    //console.log(modo);
    let idIdiomas: number;

    if ((modo === 'editar' && this.registroSeleccionado) || modo === 'crear') {
      if (modo === 'editar') {
        idIdiomas = this.registroSeleccionado.id;
      }
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('lg', true, 27);
      let modalFormularioData = new ModalCatalogoIdiomaCrearActualizarData(
        this,
        idIdiomas
      );

      let bindings = Injector.resolve([
        provide(ICustomModal, {useValue: modalFormularioData}),
        provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
        provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
      ]);

      dialog = this.modal.open(
        <any>ModalCatalogoIdiomaCrearActualizar,
        bindings,
        modalConfig
      );
    }else {
      alert('Seleccione un registro');
    }
  }

  modalDetalles(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idIdiomas = this.registroSeleccionado.id;
      let modalDetallesData = new ModalDetallesData(
        this,
        idIdiomas
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);
      dialog = this.modal.open(
        <any>ModalDetalles,
        bindings,
        modalConfig
      );
    }


  }*/

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
/////////////// funcionalidad del modal detalle/////////
  private modalDetalles(): void {
    if (this.hayRegistroSeleccionado()) {
      this.idEntidadIdiomaSeleccionada =
        this.registroSeleccionado.id;
      this.modalDetalleIdioma.open('lg');
      this.cargarInformacionIdioma();
    }
  }

  private cerrarModalDetalle(): void {
    this.modalDetalleIdioma.close();
    this.limpiarVariablesDetalle();
  }

  private cargarInformacionIdioma(): void {
    this._spinner.start('obtenerIdioma');
    this.catalogoService.getEntidadIdioma(
      this.idEntidadIdiomaSeleccionada,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadIdioma = new Idioma(response.json());
      },
      error => {
        this._spinner.stop('obtenerIdioma');
      },
      () => {
        this._spinner.stop('obtenerIdioma');
      }
    );
  }

  private hayRegistroSeleccionado(): boolean {
    let hayRegistro: boolean = false;
    if (this.registroSeleccionado &&
        this.registroSeleccionado.id) {
          hayRegistro = true;
      }

      return hayRegistro;
  }

  private limpiarVariablesDetalle(): void {
    this.idEntidadIdiomaSeleccionada = undefined;
    this.entidadIdioma = undefined;
  }
  /////////////// fin funcionalidad del modal detalle/////////

  /////Inicio funcionalidad modal agrega-editar //////////
  modalFormulario(modo): void {
      //console.log(modo);

      if ((modo === 'editar' && this.registroSeleccionado) || modo === 'crear') {
        if (modo === 'editar') {
          this.idIdiomaEditar = this.registroSeleccionado.id;
          this.obtenerEntidadIdioma(this.idIdiomaEditar);
          this.edicionFormulario = true;
        }
        console.log('edicionFormulario', this.edicionFormulario);
        this.modalAgregarEditar.open('lg');
        this.cargarCatalogoEstatus();

      }else {
        alert('Seleccione un registro');
      }
  }

  cerrarModalAgregarEditar(): void {
    this.modalAgregarEditar.close();
    this.limpiarVariablesAgregarEditar();
    this.limpiarFormularioAgregarEditar();
  }

  private inicalizarFormularioAgregarEdidtarIdioma(): void {
    this.formularioIdioma = new FormGroup({
      descripcion: new FormControl('',
        Validators.compose([Validacion.textoValidator,
        Validators.required])
      ),
      indigena: new FormControl(''),
      idEstatus: new FormControl('', Validators.required),
      ultimaActualizacion:  new FormControl(
        moment(new Date()).format('DD/MM/Y h:mma')
      )
    });
  }

  private obtenerEntidadIdioma(idIdioma: number): void {
    let idioma: Idioma;
    this._spinner.start('obtenerEntidadIdioma');
    this.catalogoService.getEntidadIdioma(
      idIdioma,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadIdioma = new Idioma(response.json());
      },
      error => {
        this._spinner.stop('obtenerEntidadIdioma');
      },
      () => {
        this._spinner.stop('obtenerEntidadIdioma');
        this.cargarInformacionIdiomaEditar(this.entidadIdioma);
      }
    );
  }

  private cargarInformacionIdiomaEditar(idioma: Idioma): void {
    this.getControl('descripcion').patchValue(idioma.descripcion);
    this.getControl('idEstatus').patchValue(idioma.estatus.id);
    this.getControl('indigena').patchValue(idioma.indigena ? true : false);
  }

  private guardarIdioma(): void {
    if (this.validarFormulario()) {
      let jsonFormulario =
        JSON.stringify(this.formularioIdioma.value, null, 2);
      if (this.edicionFormulario) {
        this.actualizarIdioma(jsonFormulario);
      } else {
        this.crearIdioma(jsonFormulario);
      }
    }
  }

  private actualizarIdioma(json): void {
    this._spinner.start('actualizarIdioma');
    this.catalogoService.putIdioma(
      this.idIdiomaEditar,
      json,
      this.erroresGuardado
    ).subscribe(
      response => {},
      error => {
        this._spinner.stop('actualizarIdioma');
      },
      () => {
        this._spinner.stop('actualizarIdioma');
        this.cerrarModalAgregarEditar();
        this.onCambiosTabla();
      }
    );
  }

  private crearIdioma(json): void {
    this._spinner.start('crearIdioma');
    this.catalogoService.postIdioma(
      json,
      this.erroresGuardado
    ).subscribe(
      response => {},
      error => {
        this._spinner.stop('crearIdioma');
      },
      () => {
        this._spinner.stop('crearIdioma');
        this.cerrarModalAgregarEditar();
        this.onCambiosTabla();
      }
    );
  }

  private getControl(campo: string): FormControl {
    return (<FormControl>this.formularioIdioma.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioIdioma.controls[campo]).valid &&
        this.validacionActiva) {
        return true;
    }
    return false;
  }

  private validarFormulario(): boolean {
    if (this.formularioIdioma.valid) {
        this.validacionActiva = false;
        return true;
    }
    this.validacionActiva = true;
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

  private cargarCatalogoEstatus(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    this.opcionesCatalogoEstatus =
      this._estatusService.
        getSelectEstatusCatalogo(
          this.erroresConsultasAgregarEditar,
          urlParameter
        );
  }

  private limpiarVariablesAgregarEditar(): void {
    this.idIdiomaEditar = undefined;
    this.edicionFormulario = false;
    this.entidadIdioma = undefined;
  }

  private limpiarFormularioAgregarEditar(): void {
     this.getControl('descripcion').patchValue('');
    this.getControl('idEstatus').patchValue('');
    this.getControl('indigena').patchValue('');
    this.validacionActiva = false;
  }

  /////Final de la funcionalidad modal agrega-editar //////////


  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                INSTANCIAMIENTOS                                           //
///////////////////////////////////////////////////////////////////////////////////////////////
  private prepareServices(): void {
    this.catalogoService = this.catalogosService.getIdioma();
    this.catalogoEstatus = this.catalogosService.getEstatusCatalogo();
  }

}
