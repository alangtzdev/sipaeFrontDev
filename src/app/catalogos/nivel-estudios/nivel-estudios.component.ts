import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import * as moment from "moment";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {NivelEstudio} from "../../services/entidades/nivel-estudio.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {Validacion} from "../../utils/Validacion";
import {ErrorCatalogo} from "../../services/core/error.model";

@Component({
  selector: 'app-nivel-estudios',
  templateUrl: './nivel-estudios.component.html',
  styleUrls: ['./nivel-estudios.component.css']
})
export class NivelEstudiosComponent implements OnInit {

  @ViewChild('modalCrudNivel')
  modalCrudNivel: ModalComponent;
  @ViewChild('modalDetalleNivel')
  modalDetalleNivel: ModalComponent;
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
  registros: Array<NivelEstudio> = [];
  columnas: Array<any> = [
    { titulo: 'Descripción*', nombre: 'descripcion'},
    { titulo: 'Clave*', nombre: 'clave'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  registroSeleccionado: NivelEstudio;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'descripcion,clave' }
  };

  // variables para exportar
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  // se declaran variables para consultas de base de datos
  catNivelEstudiosService;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  // variables modal de crud
  formularioNivelEstudios: FormGroup;
  entidadNivelEstudios: NivelEstudio;
  validacionActiva: boolean = false;
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  edicionFormulario: boolean = false;

  // paginacion nueva implementacion
  public totalItems: number = 64;
  public currentPage: number = 4;
  public smallnumPages: number = 0;

  public setPage(pageNo: number): void {
    this.currentPage = pageNo;
  }

  public pageChanged(event: any): void {
    console.log('Page changed to: ' + event.page);
    console.log('Number items per page: ' + event.itemsPerPage);
  }

  constructor(//private modal: Modal,
              private injector: Injector,
              public _catalogosService: CatalogosServices,
              public _estatusService: EstatusCatalogoService,
              private _spinner: SpinnerService) {
    moment.locale('es');
    this.inicializarFormulario();
    this.prepareServices();
  }

  private inicializarFormulario(): void {
    this.formularioNivelEstudios = new FormGroup({
      clave: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      descripcion: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      idEstatus: new FormControl('', Validators.required),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });
    this.getControl('idEstatus').patchValue('0');
  }

  ngOnInit(): void {
    this.getListaNivelEstudios();
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
      this.getListaNivelEstudios();
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.getListaNivelEstudios();
  }

  getListaNivelEstudios(): void {
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
      this._spinner.start("catalogonivelestudios1");
    }

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<NivelEstudio>
    } = this.catNivelEstudiosService.getListaNivelEstudio(
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
          this.registros.push(new NivelEstudio(item));

        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("catalogonivelestudios1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
        }*/
        this._spinner.stop("catalogonivelestudios1");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.getListaNivelEstudios();
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

/*  modalNivelEstudios(modo): void {
    let idNivelEstudios: number;
    if (modo === 'editar' && this.registroSeleccionado) {
      idNivelEstudios = this.registroSeleccionado.id;
    }

    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalNivelEstudiosCRUDData = new ModalNivelEstudiosCRUDData(
      this,
      idNivelEstudios
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, {useValue: modalNivelEstudiosCRUDData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalNivelEstudiosCRUD,
      bindings,
      modalConfig
    );

  }

  modalDetalleNivelEstudios(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idNivelEstudios = this.registroSeleccionado.id;
      let modalNivelEstudiosDetalleData = new ModalNivelEstudiosDetalleData(
        this,
        idNivelEstudios
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalNivelEstudiosDetalleData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalNivelEstudiosDetalle,
        bindings,
        modalConfig
      );
    }
  }*/

  cambiarEstatusNivel(modo): void {
    ////console.log(modo);
    let idNivelEstudios: number;
    let estatus;
    this._spinner.start("catalogonivelestudios2");

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    }else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      idNivelEstudios = this.registroSeleccionado.id;
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      ////console.log(jsonCambiarEstatus);

      this.catNivelEstudiosService.putNivelEstudio(
        idNivelEstudios,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this._spinner.stop("catalogonivelestudios2");
          this.getListaNivelEstudios();
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

    this.getListaNivelEstudios();
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

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          ///alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          //alert('no existe url para exportar a PDF');
        }
        break;
      default:
        //alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  private prepareServices(): void {
    this.catNivelEstudiosService =
      this._catalogosService.getCatalogoNivelEstudios();
  }

  modalNivelEstudios(modo): void {
    this.inicializarFormulario();
    this.getSelectCatEstatus();
    this.edicionFormulario = false;
    if (modo === 'editar'  && this.registroSeleccionado) {
      this.getDatosNivelEstudios();
    }
    this.modalCrudNivel.open('lg');
  }

  getSelectCatEstatus(){
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    //console.log(urlParameter);
    this.opcionesCatalogoEstatus =
      this._estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
  }

  cerrarModal(){
    this.modalCrudNivel.close();
    this.limpiarFormulario();
  }

  getDatosNivelEstudios() {
    if (this.registroSeleccionado) {
      this.edicionFormulario = true;
      let nivelEstudios: NivelEstudio;
      this.catNivelEstudiosService
        .getNivelEstudio(
          this.registroSeleccionado.id,
          this.erroresConsultas
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>{
            nivelEstudios = new NivelEstudio(
              response.json());
            this.entidadNivelEstudios = nivelEstudios;
          },
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
            /*if (assertionsEnabled()) {
              console.error(error);
            }*/
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            /*if (assertionsEnabled()) {
              // //console.log(nivelEstudios);
            }*/
            if (this.formularioNivelEstudios) {

              let stringClave = 'clave';
              let stringDescripcion = 'descripcion';
              let stringEstatus = 'idEstatus';
              (<FormControl>this.formularioNivelEstudios.controls[stringClave])
                .setValue(nivelEstudios.clave);
              (<FormControl>this.formularioNivelEstudios.controls[stringDescripcion])
                .setValue(nivelEstudios.descripcion);
              (<FormControl>this.formularioNivelEstudios.controls[stringEstatus])
                .setValue(nivelEstudios.estatus.id);
              //console.log(this.formularioNivelEstudios);
            }
          }
        );
    }
  }

  guardarNivelEstudios(): void {
    if (this.validarFormulario()) {
      this._spinner.start('guardarNivelEstudios');
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formularioNivelEstudios.value, null, 2);

      if (this.edicionFormulario) {

        this.catNivelEstudiosService
          .putNivelEstudio(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          error => {
            this._spinner.stop('guardarNivelEstudios');
          },
          () => {
            this._spinner.stop('guardarNivelEstudios');
          }
        );
      } else {
        this.catNivelEstudiosService
          .postNivelEstudio(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          error => {
            this._spinner.stop('guardarNivelEstudios');
          },
          () => {
            this._spinner.stop('guardarNivelEstudios');
          }
        );
      }
      this.formularioNivelEstudios.reset();
      this.getListaNivelEstudios();
      this.cerrarModal();
    } //else { }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioNivelEstudios.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioNivelEstudios.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormulario(): boolean {
        if (this.formularioNivelEstudios.valid) {
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

  // modal detalle nivel de estudios
  modalDetalleNivelEstudios(): void {
    this.getDatosNivelEstudios();
    this.modalDetalleNivel.open('lg');
  }

  cerrarModalDetalle() {
    this.entidadNivelEstudios = null;
    this.modalDetalleNivel.close();
  }

  limpiarFormulario() {
    this.entidadNivelEstudios = null;
    this.validacionActiva = false;
    this.edicionFormulario = false;
    //this.formularioPeriodoEscolar.reset();
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
