import {Component, OnInit, Renderer, Injector, ElementRef, ViewChild} from '@angular/core';
import {ItemSelects} from "../../services/core/item-select.model";
import {FormGroup, FormControl} from "@angular/forms";
import {InteresadoMovilidadExterna} from "../../services/entidades/interesado-movilidad-externa.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, Route} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ProgramaDocenteServices} from "../../services/entidades/programa-docente.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {NacionalidadService} from "../../services/catalogos/nacionalidad.service";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {MovilidadExternaMateria} from "../../services/entidades/movilidad-externa-materia.model";
import {ConfigService} from "../../services/core/config.service";

@Component({
  selector: 'app-estudiante-especial-interesados',
  templateUrl: './estudiante-especial-interesados.component.html',
  styleUrls: ['./estudiante-especial-interesados.component.css']
})
export class EstudianteEspecialInteresadosComponent implements OnInit {

  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                VARIABLES                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  criteriosCabezera: string = '';
  // ************************** SELECTS**************************************//
  programasDocentesSelect: Array<ItemSelects>;
  promocionesSelectEstatus: Array <ItemSelects> = [];
  opcionSelectNacionalidad: Array<ItemSelects> = [];
  // ************************** SERVICES**************************************//
  catalogoService;
  archivoService;
  materiasMovilidadService;
  // ************************** FORMULARIOS**************************************//
  edicionFormulario: boolean = false;
  formulario: FormGroup;
  idEstatusCatalogo: number;
  validacionActiva: boolean = false;
  dataFormulario: any;
  formularioCheck: FormGroup;
  // ************************** TABLAS**************************************//
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  registroSeleccionado: InteresadoMovilidadExterna;
  registros: Array<any> = [];
  columnas: Array<any> = [
    { titulo: 'Nombre del aspirante*', nombre: 'primerApellido', sort: 'asc'},
    { titulo: 'Correo electrónico*', nombre: 'email' },
    { titulo: 'Programa docente*', nombre: 'idProgramaDocente' },
    { titulo: 'Fecha de registro', nombre: 'fechaRegistro'}, // pendiente nombre
    { titulo: 'Estatus*', nombre: 'idEstatus'} // pendiente nombre
  ];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'nombre,primerApellido,segundoApellido,email,' +
    'idProgramaDocente.descripcion,idEstatus.valor' } // definir bien que columa
  };
  paginacion: PaginacionInfo;
  interesadoMovilidadExternaService;
  // se declaran variables para consultas de base de datos

  /// DatePicker ///
  private maxDate: Date = new Date();

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];
  vistaDetalle: boolean;

  // variables del modal
  entidadInteresadoMovilidadExterna;
  columnasTablaModal: Array<any> = [
    { titulo: 'Materia(s) a cursar en el COLSAN', nombre: 'idMateria'},
    { titulo: 'Materia(s) que convalida', nombre: 'materiaOrigen' }
  ];
  private registrosMaterias: Array<MovilidadExternaMateria> = [];

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CONSTRUCTOR                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  constructor(params: Router,
//              private modal: Modal,
              private nacionalidadService: NacionalidadService,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _programaDocente: ProgramaDocenteServices,
              private _spinner: SpinnerService,
              private router: Router,
              public catalogosService: CatalogosServices,
              public _catalogosService: CatalogosServices) {
    this.prepareServices();
    this.obtenerCatalogos();
    // this.onCambiosTabla();
    this.getCatNacionalidad();
    //this.obtenerSelectCatalogo();
//    this.idEstatusCatalogo = Number(params.get('id'));
    if (this.idEstatusCatalogo) {
      this.edicionFormulario = true;
    }
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
    this._spinner.start("estudianteespecialinteresado1");
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = this.criteriosCabezera ? (criterios + ';ANDGROUPAND') : '';
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
    this.interesadoMovilidadExternaService.getListaInteresadoMovilidadExterna(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }              this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new InteresadoMovilidadExterna(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this._spinner.stop("estudianteespecialinteresado1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("estudianteespecialinteresado1");
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
        column.sort = '';
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

  limpiarFiltro(): void {
    this.configuracion.filtrado.textoFiltro = '';
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

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CAMBIAR ESTATUS                                             //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  cambiarEstatus(accion): void {
    if (this.registroSeleccionado) {
      let tipoEstatus: any = 0;
      if (accion === 'aplica') {
        tipoEstatus = '104';
      }else {
        tipoEstatus = '105';
      }

      if ( tipoEstatus !== 0 ) {
        let estatus = {'idEstatus': tipoEstatus};
        let jsonFormulario = JSON.stringify(estatus, null, 2);
        this.catalogoService.getInteresadoMovilidadExterna().putInteresadoMovilidadExterna(
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
    } else { }
    this.registroSeleccionado = null;
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          //alert('no existe url para exportar a Excel');
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
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  getCatNacionalidad(): void {
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1007 id del catalogo de estatus solo activos
    urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
    this.nacionalidadService.getListaSelectNacionalidad (
      this.erroresConsultas, urlParameter,false
    ).then(
      nacionalidades => {
        console.log(nacionalidades);
        //let items = response.json().lista;
        if (nacionalidades) {
          for (var i in nacionalidades) {
            //console.log(items[i]);
          }
          nacionalidades.forEach(
            (item) => {
              this.opcionSelectNacionalidad.push(new ItemSelects(item.id, item.valor));
            }
          )
        }
      }
    );
/*    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1007 id del catalogo de estatus solo activos
    urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
    this.opcionSelectNacionalidad =
      this.nacionalidadService.getListaSelectNacionalidad (
        this.erroresConsultas, urlParameter);*/
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                FORMULARIOS                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  enviarFormulario(event): void {
    event.preventDefault();
    if (this.formulario.valid) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      this.dataFormulario = this.formulario;
    }
  }
  buscarCriteriosCabezera(
    idProgramaDocente: number,
    //idPromocion: number,
    idNacionalidad: number
  ): void {
    this.criteriosCabezera = '';
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idProgramaDocente~' + idProgramaDocente + ':IGUAL';
      if (idNacionalidad) {
        if (idNacionalidad == 5) {
          // TODO construccion de filtro para nacionalidad
          this.criteriosCabezera = this.criteriosCabezera + ',idPais~'
            + 82 + ':IGUAL';
        }else {
          this.criteriosCabezera = this.criteriosCabezera + ',idPais~'
            + 82 + ':NOT';
        }
      }
    }
    if (idNacionalidad && !idProgramaDocente) {
      if (idNacionalidad == 5) {
        // TODO construccion de filtro para nacionalidad
        this.criteriosCabezera = 'idPais~'
          + 82 + ':IGUAL';
      }else {
        this.criteriosCabezera = 'idPais~'
          + 82 + ':NOT';
      }
    }
    this.onCambiosTabla();
  }

  mostarBotonDetalle(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  ocultarOpciones(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 101) {
      return true;
    } else {
      return false;
    }
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                OBTENER CATALOGOS                                          //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  obtenerCatalogos(): void {
    this.promocionesSelectEstatus =
      this.catalogoService.getPromocion()
        .getSelectPromocion(this.erroresConsultas);

  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                INSTANCIAMIENTOS                                           //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  prepareServices(): void {
    this.catalogoService = this.catalogosService;
//    this.nacionalidadService = this._catalogosService.getNacionalidad();
    this.interesadoMovilidadExternaService =
      this._catalogosService.getInteresadoMovilidadExterna();
    this.programasDocentesSelect = this._programaDocente
      .getSelectProgramaDocente(this.erroresConsultas);
    this.archivoService = this._catalogosService.getArchivos();
    this.materiasMovilidadService = this._catalogosService.getMateriasMovilidad();
  }

/*  constructor() { }

  ngOnInit() {
  }

  ocultarOpciones(): boolean {
    return true;
  }
  mostarBotonDetalle(): boolean {
    return true;
  }*/

  ////////////////////////////codigo de modals////////////////////////

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                MODALS                                                     //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  /*modalDetallesinteresado(): void {
    if (this.registroSeleccionado) {
     let dialog: Promise<ModalDialogInstance>;
     let modalConfig = new ModalConfig('lg', true, 27);
     let idInteresado = this.registroSeleccionado.id;
     let modalFormularioData = new ModalDetallesinteresadoData(
     this);
     let bindings = Injector.resolve([
     provide(ICustomModal, {useValue: modalFormularioData }),
     provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
     provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
     provide(Renderer, { useValue: this._renderer })
     ]);

     dialog = this.modal.open(
     <any>ModalDetallesinteresado,
     bindings,
     modalConfig
     );
     } else { }
  }*/

  modalDetallesinteresado(): void {
    this.modalDetalle.open('lg');
    this.obtenerDetalleInteresado();
    this.getMateriasInteresado();
  }

  cerrarModalDetalle(): void{
    this.modalDetalle.close();
    this.entidadInteresadoMovilidadExterna = null;
  }

  obtenerDetalleInteresado() {
    this._spinner.start("detalleInteresado1");
    this.interesadoMovilidadExternaService.getEntidadInteresadoMovilidadExterna(
      this.registroSeleccionado.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadInteresadoMovilidadExterna
          = new InteresadoMovilidadExterna(response.json());
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
          console.error(this.erroresConsultas);
        }*/
        this._spinner.stop("detalleInteresado1");
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log(this.entidadInteresadoMovilidadExterna);
        }*/
        this._spinner.stop("detalleInteresado1");
      }
    );
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("descargarCarta");
      this.archivoService.generarTicket(
        jsonArchivo,
        this.erroresConsultas
      ).subscribe(
        data => {
          let json = data.json();
          let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivodescargar/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("descargarCarta");
          },
          () => {
            console.info('OK');
            this._spinner.stop("descargarCarta");
          }
        );
    }
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("verArchivo");
      this.archivoService.generarTicket(jsonArchivo, this.erroresConsultas
      ).subscribe(
        data => {
          let json = data.json();
          let url =
            ConfigService.getUrlBaseAPI() +
            '/api/v1/archivovisualizacion/' +
            id +
            '?ticket=' +
            json.ticket;
          window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
        },
        error => {
          //console.log('Error downloading the file.');
          this._spinner.stop("verArchivo");
        },
        () => {
          console.info('OK');
          this._spinner.stop("verArchivo");
        }
      );
    }
  }

  getMateriasInteresado(): void {
    console.log("Entrar a obtener materias");
    let id = this.registroSeleccionado.id;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idMovilidadInteresado~' + id + ':IGUAL';
    urlSearch.set('criterios', criterio);
    this.registrosMaterias = this.materiasMovilidadService
      .getListaMovilidadExternaMateria(
        this.erroresConsultas,
        urlSearch
      ).lista;
    console.log(this.registrosMaterias);
  }
}
