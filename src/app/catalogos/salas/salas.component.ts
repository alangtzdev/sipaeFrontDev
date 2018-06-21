import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import * as moment from "moment";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {Sala} from "../../services/entidades/sala.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {SalaService} from "../../services/entidades/sala.service";

@Component({
  selector: 'app-salas',
  templateUrl: './salas.component.html',
  styleUrls: ['./salas.component.css']
})
export class SalasComponent implements OnInit {

  @ViewChild('modalCrud')
  modalCrud: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  edicionFormulario: boolean = false;
  formularioSalas: FormGroup;
  entidadSala: Sala;
  validacionActiva: boolean = false;
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private salasComponent : SalasComponent;

  paginacion: PaginacionInfo;
  idSalas: number;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Sala> = [];
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  columnas: Array<any> = [
    { titulo: 'Nombre de sala*', nombre: 'descripcion'},
    { titulo: 'Ubicación*', nombre: 'ubicacion'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  registroSeleccionado: Sala;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'ubicacion,descripcion' }
  };

  public disabled: boolean = false;
  public status: { isopen: boolean } = {isopen: false};


  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              public _estatusService: EstatusCatalogoService,
              private salaService: SalaService
  ) {
    this.prepareService();

//    this.context = <ModalSalasData>modelContentData;
    this.prepareServices();

    this.formularioSalas = new FormGroup({
      descripcion: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      ubicacion: new FormControl('', Validators.
      compose([Validacion.parrafos, Validators.required])),
      ultimaActualizacion:  new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      idEstatus: new FormControl('', Validators.required)
    });

  }
getDatosSalas() {
  if (this.idSalas) {
    this._spinner.start("modalsalas1");
    ////console.log(this.context.idSalas);
    this.edicionFormulario = true;
    let sala: Sala;
    this.entidadSala = this.salaService
      .getSala(
        this.idSalas,
        this.erroresConsultas
      ).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad
        // de tipo ClasificacionPreguntasFrecuentes
        response =>
          sala = new Sala(
            response.json()),
        // en caso de presentarse un error se agrega un nuevo error al array errores
        error => {
          console.error(error);
        },
        // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
        // al finalizar correctamente la ejecucion se muestra en consola el resultado
        () => {
          if (this.formularioSalas) {
            let descripcion = '';

            let stringDescripcion = 'descripcion';
            let stringUbicacion = 'ubicacion';
            let intIdestatus = 'idEstatus';
            ////console.log(sala.ubicacion);

            (<FormControl>this.formularioSalas.controls[stringDescripcion]).setValue(sala.descripcion);
            (<FormControl>this.formularioSalas.controls[stringUbicacion]).setValue(sala.ubicacion);
            (<FormControl>this.formularioSalas.controls[intIdestatus]).setValue(sala.estatus.id);
          }
          this._spinner.stop("modalsalas1");
        }
      );
  }
}

  ngOnInit(): void {
    this.getListaSalas();
  }

  getListaSalas(): void {  //Tabla
//    this.registroSeleccionado = null;
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
      this._spinner.start("salas1");
    }

    this.salaService.getListaSala(
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
          this.registros.push(new Sala(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("salas1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("salas1");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.getListaSalas();
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
    this.getListaSalas();
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
      this.getListaSalas();
    }
  }




  cambiarEstatusSala(modo): void {
    ////console.log(modo);
    let idSala: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    }else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      this._spinner.start("salas2");
      idSala = this.registroSeleccionado.id;
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);

      this.salaService.putSala(
        idSala,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this._spinner.stop("salas2");
          this.getListaSalas();
        }
      );
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
    this.getListaSalas();
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
    ////console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
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

  private prepareService(): void {
    this.salaService =
      this.catalogosService.getSalas();
  }

  ////////////////////////////codigo de modals////////////////////////

crudSalas(modo){
  let idSala2: number;
  this.idSalas = idSala2
  if (modo === 'editar' && this.registroSeleccionado) {
    this.idSalas = this.registroSeleccionado.id
  }
  else {
    this.idSalas = null;
  }
  if (this.idSalas) {
    this._spinner.start("modalsalas1");
    ////console.log(this.context.idSalas);
    this.edicionFormulario = true;
    let sala: Sala;
    this.entidadSala = this.salaService
      .getSala(
        this.idSalas,
        this.erroresConsultas
      ).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad
        // de tipo ClasificacionPreguntasFrecuentes
        response =>
          sala = new Sala(
            response.json()),
        // en caso de presentarse un error se agrega un nuevo error al array errores
        error => {
          console.error(error);
        },
        // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
        // al finalizar correctamente la ejecucion se muestra en consola el resultado
        () => {
          if (this.formularioSalas) {
            let descripcion = '';

            let stringDescripcion = 'descripcion';
            let stringUbicacion = 'ubicacion';
            let intIdestatus = 'idEstatus';
            ////console.log(sala.ubicacion);

            (<FormControl>this.formularioSalas.controls[stringDescripcion]).setValue(sala.descripcion);
            (<FormControl>this.formularioSalas.controls[stringUbicacion]).setValue(sala.ubicacion);
            (<FormControl>this.formularioSalas.controls[intIdestatus]).setValue(sala.estatus.id);
          }
          this._spinner.stop("modalsalas1");
        }
      );
  }

  this.modalAgregarActualizarSalas();
}


  modalAgregarActualizarSalas(): void {
    this.modalCrud.open();
  }
/*  cerrarModal(): void {
    this.dialog.close();
  }*/
  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioSalas.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioSalas[campo]) &&
      this.validacionActiva) {
      return true;
    }else {
      return false;
    }
  }

  validarFormulario(): boolean {
    if (this.formularioSalas.valid) {
      this.validacionActiva = false;
      return true;
    }
    else {
      this.validacionActiva = true;
      return false;
    }

  }

  guardarSalas(): void {
    if (this.validarFormulario()) {
      this._spinner.start("modalsalas2");

      event.preventDefault();
      let salasComponent : SalasComponent;
      let jsonFormulario = JSON.stringify(this.formularioSalas.value, null, 2);
      console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.salaService
          .putSala(
            this.idSalas,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          console.log('Success Edition'),
          console.error,
          () => {
            this._spinner.stop("modalsalas2");
            this.getListaSalas();   //.salasComponent.getListaSalas(); //.context.componenteLista.getListaSalas();
            this.cerrarModal();
          }
        );
      } else {
        this.salaService
          .postSala(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this._spinner.stop("modalsalas2");
            this.getListaSalas();
//            this.context.componenteLista.getListaSalas();
            this.cerrarModal();
          }
        );
      }
    }
  }

  private prepareServices(): void {
   // this.catalogoEstatus = this.context.componenteLista.catalogosService.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    ////console.log(urlParameter);
    this.opcionesCatalogoEstatus = this._estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
/*      this.context.componenteLista._estatusService.
      getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);*/
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
  cerrarModal(): void{
    this.modalCrud.close();
  }

  modalDetalles(): void {
    this.modalDetalle.open();
    this.salaService
      .getEntidadSala(
//        7,
//        this.entidadSala.id,
        this.registroSeleccionado.id,
//        this.contexts.idSalas,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadSala
          = new Sala(response.json());
        console.log(this.entidadSala);
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
      }
    );
  }

  cerrarModal1(): void{
    this.modalDetalle.close();
  }
}


