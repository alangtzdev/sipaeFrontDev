import {Component, OnInit, Injector, Renderer, ViewChild} from '@angular/core';
import * as moment from "moment";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {PreguntaFrecuente} from "../../services/entidades/pregunta-frecuente.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {ErrorCatalogo} from "../../services/core/error.model";
import {PreguntaFrecuenteService} from "../../services/entidades/pregunta-frecuente.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-preguntas-fecuentes',
  templateUrl: './preguntas-fecuentes.component.html',
  styleUrls: ['./preguntas-fecuentes.component.css']
})
export class PreguntasFecuentesComponent implements OnInit {

  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  @ViewChild('modalEdicion')
  modalEdicion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  validacionActiva: boolean = false;
  edicionFormulario: boolean = false;
  formularioPreguntasFrecuentes: FormGroup;
  entidadPreguntasFrecuente: PreguntaFrecuente;
  catalogoEstatus;
  catalogoProgramaDocente;
  catalogoClasificacion;

  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private opcionesCatalogoProgramaDocente: Array<ItemSelects> = [];
  private opcionesCatalogoClasificion: Array<ItemSelects> = [];
  private _preguntaFrecuente: PreguntaFrecuenteService;

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];


  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<PreguntaFrecuente> = [];
  columnas: Array<any> = [
    { titulo: 'Pregunta*', nombre: 'pregunta'},
    { titulo: 'Clasificación*', nombre: 'idClasificacion'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  entidadPreguntaFrecuente: PreguntaFrecuente;
  registroSeleccionado: PreguntaFrecuente;
  public status: {isopen: boolean} = {isopen: false};
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'pregunta,idClasificacion.valor' }
  };

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public disabled: boolean = false;
//  public status: {isopen: boolean } = {isopen: false};

  constructor(
//    private modal: Modal,
    private injector: Injector, private _renderer: Renderer,
    public _catalogosService: CatalogosServices,
    public _estatusService: EstatusCatalogoService,
    public spinner: SpinnerService,
    public preguntaFrecuenteService : PreguntaFrecuenteService
  ) {

    this.prepareServices();

    this.formularioPreguntasFrecuentes = new FormGroup({
      pregunta: new FormControl('', Validators.compose([
        Validacion.parrafos, Validators.required])),
      respuesta: new FormControl('', Validators.compose([
        Validacion.parrafos, Validators.required])),
      idClasificacion: new FormControl('', Validators.required),
      idEstatus: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl(),
      ultimaActualizacion:  new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });

  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
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
      this.spinner.start("preguntasfrecuentes1");
    }

    this.preguntaFrecuenteService.getListaPreguntaFrecuente(
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
          this.registros.push(new PreguntaFrecuente(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
  /*      if (assertionsEnabled()) {
          console.error(error);
        }*/
        this.spinner.stop("preguntasfrecuentes1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this.spinner.stop("preguntasfrecuentes1");
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
    ////console.log(modo);
    let registroSeleccionado: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    } else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      this.spinner.start("preguntasfrecuentes2");
      registroSeleccionado = this.registroSeleccionado.id;
      ////console.log(registroSeleccionado);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      this.preguntaFrecuenteService.putPreguntaFrecuente(
        registroSeleccionado,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.spinner.stop("preguntasfrecuentes2");
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
//                       Metodos para desplegar menu de boton de exportar                      //
///////////////////////////////////////////////////////////////////////////////////////////////
  public toggled(open: boolean): void {
    //console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event: MouseEvent): void {
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
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  private prepareServices(): void {
    this.preguntaFrecuenteService =
      this._catalogosService.getPreguntasFrecuentes();

    this.catalogoEstatus = this._catalogosService.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    //console.log(urlParameter);
    this.opcionesCatalogoEstatus =
      this._estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);

    this.catalogoClasificacion = this._catalogosService.getClasificacionPreguntasFrecuentes();
    this.opcionesCatalogoClasificion =
      this.catalogoClasificacion
        .getSelectClasificacionPreguntasFrecuentes(this.erroresConsultas);

    this.catalogoProgramaDocente = this._catalogosService.getCatalogoProgramaDocente();
    this.opcionesCatalogoProgramaDocente =
      this.catalogoProgramaDocente.getSelectProgramaDocente(this.erroresConsultas);
  }
////////////////////////MODALS////////////////////////

  /*  modalAgregarPreguntaFrecuente(modo): void {
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);
   let idLgac: number;
   if (modo === 'editar' && this.registroSeleccionado) {
   idLgac = this.registroSeleccionado.id;
   }

   if (modo === 'agregar' && this.registroSeleccionado) {
   this.registroSeleccionado = null;
   idLgac = null;
   }

   if ((modo === 'agregar') || (modo === 'editar' && this.registroSeleccionado)) {

   let bindings = Injector.resolve([
   provide(ICustomModal, {
   useValue: new ModalPreguntaFrecuenteCRUDData(
   this,
   idLgac)
   }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
   provide(Renderer, { useValue: this._renderer })
   ]);

   dialog = this.modal.open(
   <any>ModalPreguntaFrecuenteCRUD,
   bindings,
   modalConfig
   );
   }
   }

   modalDetalles(): void {
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);
   if (this.registroSeleccionado) {
   let registroSeleccionado = this.registroSeleccionado.id;
   let modalDetallesData = new DetallePreguntaFrecuenteData(
   this,
   registroSeleccionado
   );
   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: modalDetallesData }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>DetallePreguntaFrecuente,
   bindings,
   modalConfig
   );
   }
   }*/
  modalDetalles(): void {
    this.modalDetalle.open();


    this.preguntaFrecuenteService.getEntidadPreguntaFrecuente(
      this.registroSeleccionado.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadPreguntaFrecuente
          = new PreguntaFrecuente(response.json());
        //console.log(this.entidadPreguntaFrecuente);
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
        //console.log(this.entidadPreguntaFrecuente);
      }
    );

  }
  modalAgregarPreguntaFrecuente(modo): void {
    if ((modo === 'agregar') || (modo === 'editar' && this.registroSeleccionado)) {
      this.modalEdicion.open();
    }

    if (this.registroSeleccionado) {
      this.spinner.start("preguntasfrecuentesmodal1");
      //console.log(this.context.registroSeleccionado);
      this.edicionFormulario = true;
      let preguntasFrecuentes: PreguntaFrecuente;
      this.entidadPreguntasFrecuente = this.preguntaFrecuenteService.getPreguntaFrecuente(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad
        // de tipo ClasificacionPreguntasFrecuentes
        response =>{
          this.entidadPreguntaFrecuente
            = new PreguntaFrecuente(response.json());
          preguntasFrecuentes = new PreguntaFrecuente(
            response.json())
        },
        // en caso de presentarse un error se agrega un nuevo error al array errores
        error => {
          console.error(error);
        },
        // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
        // al finalizar correctamente la ejecucion se muestra en consola el resultado
        () => {
          console.log(preguntasFrecuentes);
          if (this.formularioPreguntasFrecuentes) {

            let stringPregunta = 'pregunta';
            let stringRespuesta = 'respuesta';
            let stringIdEstatus = 'idEstatus';
            let stringIdClasificacion = 'idClasificacion';
            let strinigIdProgramaDocente = 'idProgramaDocente';

            (<FormControl>this.formularioPreguntasFrecuentes.controls[stringPregunta])
              .setValue(preguntasFrecuentes.pregunta);
            (<FormControl>this.formularioPreguntasFrecuentes.controls[stringRespuesta])
              .setValue(preguntasFrecuentes.respuesta);
            (<FormControl>this.formularioPreguntasFrecuentes.controls[stringIdEstatus])
              .setValue(preguntasFrecuentes.estatus.id);
            (<FormControl>this.formularioPreguntasFrecuentes.
              controls[stringIdClasificacion])
              .setValue(preguntasFrecuentes.clasificacion.id);
            (<FormControl>this.formularioPreguntasFrecuentes
              .controls[strinigIdProgramaDocente])
              .setValue(preguntasFrecuentes.programaDocente.id);
            //console.log(this.formularioPreguntasFrecuentes);
          }
          this.spinner.stop("preguntasfrecuentesmodal1");
        }
      );
    }
  }
  cerrarModal(): void {
    this.modalEdicion.close();
  }

  cerrarModal1(): void {
    this.modalDetalle.close();
  }


  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioPreguntasFrecuentes.controls[campo]);
  }


  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioPreguntasFrecuentes.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this.spinner.start("modalpreguntasfrecuentes2");
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.
        formularioPreguntasFrecuentes.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.preguntaFrecuenteService.putPreguntaFrecuente(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success Edition'),
          console.error,
          () => {
            this.spinner.stop("modalpreguntasfrecuentes2");
            this.onCambiosTabla();
            this.cerrarModal();
          }
        );
      } else {
        this.preguntaFrecuenteService.postPreguntaFrecuente(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.spinner.stop("modalpreguntasfrecuentes2");
            this.onCambiosTabla();
            this.cerrarModal();
          }
        );
      }
    } else { }
  }

  mostrarTiposService(): boolean {
    let valor = this.getControl('idClasificacion');

    if (valor.value == 2) { // id:7 === valor:'otro' actualmente
      return true;
    }else {
      return false;
    }
  }


  validarFormulario(): boolean {
    if (this.formularioPreguntasFrecuentes.valid) {
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
}
