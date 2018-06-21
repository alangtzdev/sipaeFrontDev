import {Component, OnInit, Injector, ElementRef, Renderer, ViewChild, ViewChildren} from '@angular/core';
import {PagoEstudiante} from "../../services/entidades/pago-estudiante.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {Router} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import {Promocion} from "../../services/entidades/promocion.model";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {NgControlStatusGroup, FormGroup, FormControl, Validators, NgControl} from "@angular/forms";

import {EstudianteDocumentoEntregado} from
  '../../services/entidades/estudiante-documento-entregado.model';
import {EstudianteDocumentoEntregadoService} from
  '../../services/entidades/estudiante-documento-entregado.service';
import {EstudianteService} from '../../services/entidades/estudiante.service';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {TipoDocumento} from '../../services/catalogos/tipo-documento.model';
import {Validacion} from "../../utils/Validacion";
import {MateriaImpartida} from "../../services/entidades/materia-impartida.model";
import {EstudianteMateriaImpartida} from "../../services/entidades/estudiante-materia-impartida.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {ConvocatoriaTiposDocumentoService} from "../../services/entidades/convocatoria-tipos-documentot.service";
import {ConvocatoriaTiposDocumento} from "../../services/entidades/convocatoria-tipos-documento.model";


@Component({
  selector: 'app-recepcion-documento',
  templateUrl: './recepcion-documento.component.html',
  styleUrls: ['./recepcion-documento.component.css']
})
export class RecepcionDocumentoComponent  {

  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  @ViewChild('modalAcepRecha')
  modalAcepRecha: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  botonValido: boolean = false;
  registroPagoEstudiante: PagoEstudiante;
  paginaActual: number = 1;
  limite: number = 10;
  idEstatusEstudiante: number = 1002;
  paginacion: PaginacionInfo;
  router: Router;
  registroSelecionado: PagoEstudiante = null;
  criteriosCabezera: string = '';
  maxSizePags: number = 5;
  ocultarRecepcionDocumentos: boolean = false;
  primerPeriodo: number; // para obtener el primer periodo de la promocion.
  ///idPagoEstudiante: number
  entrega: boolean;

  catalogoService;
  estudianteService;
  pagoEstudianteService;
  programaDocenteService;
  promocionService;
  periodoPromocionService;

  registros: Array<PagoEstudiante> = [];
  opcionesProgramaDocente: Array<ItemSelects> = [];
  opcionesPromocion: Array<ItemSelects> = [];

  exportarExcelUrl = '';
  exportarPDFUrl = '';
  exportarFormato = '';

  columnas: Array<any> = [
    { titulo: 'Folio COLSAN*', nombre: '', sort: false },
    { titulo: 'Nombre* ', nombre: 'idEstudiante.idDatosPersonales.primerApellido',sort: 'asc'},
    { titulo: 'Colegiatura', nombre: 'idEstatus.valor'},
    { titulo: 'Estatus ', nombre: '', sort: false},
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idFolioSolicitud.folioCompleto' }
  };

  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private erroresGuardados: Array<ErrorCatalogo> = [];
  private erroresConsulta: Array<ErrorCatalogo> = [];



  constructor(private params: Router,
//              private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              public catalogosService: CatalogosServices,
              private convocatoriaTiposDocumentoService: ConvocatoriaTiposDocumentoService) {
    this.prepareServices();
    this.formulario = new FormGroup({
      entregado: new FormControl('false'),
      comentarios: new FormControl(''),
      idTipoDocumento: new FormControl(''),
      idEstudiante: new FormControl(this.idEstudiante)
    });

    if (sessionStorage.getItem('recepcionDocumentoIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('recepcionDocumentoCriterios')) {
      this.onCambiosTabla();
    }
  }

  modalDetalleInscripcion(auxiliar): void {
    this.entrega = auxiliar;
    this.constructorModalDetalle();
    this.modalDetalles();
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

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';

    let criterios = '';
    if (!sessionStorage.getItem('recepcionDocumentoCriterios')) {
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
        //console.log('cirterios en el forEach: ' + criterios);
      });
      urlSearch.set('criterios', criterios);
    }

    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    sessionStorage.setItem('recepcionDocumentoCriterios', criterios);
    sessionStorage.setItem('recepcionDocumentoOrdenamiento', ordenamiento);
    sessionStorage.setItem('recepcionDocumentoLimite', this.limite.toString());
    sessionStorage.setItem('recepcionDocumentoPagina', this.paginaActual.toString());
    }
    
    this.limite = +sessionStorage.getItem('recepcionDocumentoLimite') ? +sessionStorage.getItem('recepcionDocumentoLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('recepcionDocumentoPagina') ? +sessionStorage.getItem('recepcionDocumentoPagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('recepcionDocumentoCriterios') ? sessionStorage.getItem('recepcionDocumentoCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('recepcionDocumentoOrdenamiento') ? sessionStorage.getItem('recepcionDocumentoOrdenamiento') : ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    //console.log('criterios', urlSearch);
    this._spinner.start('recepciondocumento1');
    this.pagoEstudianteService
        .getListaPagoEstudianteAceptados(
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
            this.registroPagoEstudiante = new PagoEstudiante(item);
            if (this.registroPagoEstudiante.estudiante.estatus.id === 1002) {
              this.registros.push(this.registroPagoEstudiante);
            }if (this.registroPagoEstudiante.estudiante.estatus.id === 1006) {
              this.registros.push(this.registroPagoEstudiante);
            }
          });

          this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
          this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
          //this._spinner.stop('recepciondocumento1');
          this.registroSelecionado = null;
        },
        error => {
          this._spinner.stop('recepciondocumento1');
        },
        () => {
          this._spinner.stop('recepciondocumento1');
        }
    );

  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente.id~' + idProgramaDocente + ':IGUAL');
    this.opcionesPromocion = this.promocionService
      .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  buscarCriteriosCabezer(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
    this.limpiarVariablesSession();
    this._spinner.start("recepciondocumento2");
    if (idPromocion) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    this.obtenerPrimerPeriodoPromocion(idPromocion);
   sessionStorage.setItem('recepcionDocumentoIdPromocion', idPromocion.toString());
  }

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
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

  mostrarDetalle(): boolean {
    if (
      this.registroSelecionado &&
      (this.registroSelecionado.estatus.id === 1 ||
      this.registroSelecionado.estatus.id === 1104 ||
      this.registroSelecionado.estatus.id === 3) &&
      this.registroSelecionado.estudiante.estatus.id === 1006
    ) {
      return true;
    }else {
      return false;
    }
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  mostrarEstatus(idEstatus: number): string {
    if (idEstatus == 1006) {
      return 'Inscrito';
    }else {
      return 'No inscrito';
    }
  }

  ocultarEstatus(): boolean {
    if (this.registroSelecionado && this.registroSelecionado.estudiante.estatus.id == 1006) {
      return true;
    }
  }

  ocultarEstatusInscrito(): void {
    //console.log(this.registroSelecionado);
    if (this.registroSelecionado &&
      (this.registroSelecionado.estatus.id == 1104 ||
      this.registroSelecionado.estatus.id == 1 || this.registroSelecionado.estatus.id == 3) &&
      this.registroSelecionado.estudiante.estatus.id !== 1006) {
      this.ocultarRecepcionDocumentos = true;
    } else {
      this.ocultarRecepcionDocumentos = false;
    }
  }

  rowSeleccionado(registro): boolean {
    if(registro)
      return (this.registroSelecionado === registro);
  }

  rowSeleccion(registro): void {
    //console.log('ENTRA AQUI PRIMERO');
    if (this.registroSelecionado !== registro) {
      this.registroSelecionado = registro;
    } else {
      this.registroSelecionado = null;
    }
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    if (this.registros.length > 0) {
      this.limite = Number(limite);
      this.onCambiosTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  validarFormulario(): void {

  }

  obtenerAspirantes(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

  }
  listaToDocumento(): void {

  }
  getAspirante(registro): void {
    if (this.registroSelecionado !== registro) {
      this.registroSelecionado = registro;
      this.ocultarEstatusInscrito();
      this.registroSelecionado.estudiante.datosPersonales.getNombreCompleto();
    } else {
      this.registroSelecionado = null;
      this.ocultarEstatusInscrito();

    }
  }

  aspiranteDetalles(): void {
    if ( this.rowSeleccionado ) {
      this.router.navigate(['Detalles', //.parent.navigate(['Detalles',
        {id: this.registroSelecionado.id, vistaSolicitante: false}]);

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

  descargarFormatoInscripcion(): void {
    this._spinner.start("recepciondocumento3");
    this.estudianteService.getFormatoPdf(
      this.registroSelecionado.estudiante.id,
      this.erroresConsultas, 'DocumentosEntregados'
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        //console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop("recepciondocumento3");
      }
    );
  }

  obtenerPrimerPeriodoPromocion(idPromocion): void {
    this.primerPeriodo = 0;
    let periodoPromocion: Promocion;
    this.promocionService.getEntidadPromocion(
      idPromocion,
      this.erroresConsultas
    ).subscribe(
      response => {
        periodoPromocion
          = new Promocion(response.json());
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        if (periodoPromocion) {
          this.primerPeriodo = periodoPromocion.idPeriodoEscolarInicio.id;
        }
        this.criteriosCabezera += ',idPeriodo~' + this.primerPeriodo + ':IGUAL';
        this._spinner.stop("recepciondocumento3");
        this.onCambiosTabla();
      });
  }

  private prepareServices(): void {
    this.catalogoService = this.catalogosService;
    this.estudianteService = this.catalogosService.getEstudianteService();
    this.pagoEstudianteService = this.catalogosService.getPagoEstudiante();
    this.programaDocenteService = this.catalogosService.getCatalogoProgramaDocente();
    this.promocionService = this.catalogosService.getPromociones();
    this.periodoPromocionService = this.catalogosService.getPromocionPeriodoEscolarService();

    this.opcionesProgramaDocente = this.programaDocenteService
      .getSelectProgramaDocente(this.erroresConsultas);
    //this.opcionesPromocion = this.promocionService
      //.getSelectPromocion(this.erroresConsultas);

    this.tipoDocumentoService =
        this.catalogosService.getTipoDocumento();
    this.estudianteDocumentoEntregadoService =
        this.catalogosService.getEstudianteDocumentoEntregadoService();
    this.estudianteService =
        this.catalogosService.getEstudiante();
    this.materiaImpartidaService =
        this.catalogosService.getMateriaImpartidaService();
    this.estudianteMateriaImpartidaService =
        this.catalogosService.getEstudianteMateriaImpartidaService();
    this.usuarioRolService = this.catalogosService.getUsuarioRolService();
    this.boletaService = this.catalogosService.getBoletaService();
    this.evaluacionDocenteAlumnoService =
        this.catalogosService.getEvaluacionDocenteAlumnoService();
  }

/*  constructor() { }

  ngOnInit() {
  }
  mostrarDetalle(): boolean {
    return true;

  }*/
////////////////////////////////// MODAL DETALLE ////////////////////////////*********************************
  paginacionDetalle: PaginacionInfo;
  paginaActualDetalle: number = 1;
  limiteDetalle: number = 10;
  ///dialog: ModalDialogInstance;
  //context: ModalDetalleInscripcionData;
  formularioInscripcion: FormGroup;

  entidadPagoEstudiante: PagoEstudiante;
  entidadEstudianteDocumentos: EstudianteDocumentoEntregado;
  idEstudiante: number = null;
  formulario: FormGroup;
  edicionFormulario: boolean = false;
  registroSeleccionado: EstudianteDocumentoEntregado;
  criteriosDocumentoEntregado: string = '';
  validacionActiva: boolean = false;

  //services
  tipoDocumentoService;
  estudianteDocumentoEntregadoService: EstudianteDocumentoEntregadoService;
  ///estudianteService: EstudianteService;
  materiaImpartidaService;
  estudianteMateriaImpartidaService;
  usuarioRolService;
  boletaService;
  evaluacionDocenteAlumnoService;
  estadoBotonAgregar: boolean = false;

  estudiante: Estudiante;
  registrosDetalle: Array<EstudianteDocumentoEntregado> = [];
  estudianteDocs: EstudianteDocumentoEntregado;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};
  inscrito: boolean = false;
  idBoletaGenerada;
  public configuracionDetalle: any = {
    paginacionDetalle: true,
    filtrado: { textoFiltro: '', columnas: 'id' }
  };
 /// private erroresGuardado: Array<ErrorCatalogo> = [];

  columnasDetalle: Array<any> = [
    { titulo: 'Nombre de documento', nombre: 'denominacion', sort: false},
    { titulo: 'Entregado', nombre: '', sort: false},
    { titulo: 'Comentarios', nombre: '', sort: false}
  ];

  private opcionesTiposDocumentos: Array<ConvocatoriaTiposDocumento> = [];
  ///private erroresConsultas: Array<ErrorCatalogo> = [];

  constructorModalDetalle(): void {
    this.paginaActualDetalle = 1;
    this.idEstudiante = null;
    this.edicionFormulario = false;
    this.registroSeleccionado = null;
    this.criteriosDocumentoEntregado = '';
    this.validacionActiva = false;
    this.estadoBotonAgregar = false;
    this.registrosDetalle = [];
    this.opcionesTiposDocumentos = [];

    this.formularioInscripcion = new FormGroup({
      inscrito: new FormControl('')
    });
    //this._spinner.start();
    this.pagoEstudianteService
        .getEntidadPagoEstudiante(
            this.registroSelecionado.id,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadPagoEstudiante = new PagoEstudiante(response.json());
          if (this.entidadPagoEstudiante) {
            this.recuperarOpcionesTiposDocumento
            (this.entidadPagoEstudiante.estudiante.convocatoria.id);
            this.idEstudiante = this.entidadPagoEstudiante.estudiante.id;
            this.onCambiosTablaDetalle();
          }
        },
        error => {

        },
        () => {

        }
    );

    this.formulario = new FormGroup({
      entregado: new FormControl('false', Validators.required),
      comentarios: new FormControl(''),
      idTipoDocumento: new FormControl('', Validators.required),
      idEstudiante: new FormControl(this.idEstudiante)
    });
}

  recuperarOpcionesTiposDocumento(idConvocatoria): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    criterios = 'idConvocatoria.id~' +
      idConvocatoria + ':IGUAL';
    urlSearch.set('criterios', criterios);
    let tiposDocs: Array<ConvocatoriaTiposDocumento> = [];
    this.convocatoriaTiposDocumentoService.getListaConvocatoriaTiposDocumentoPag(
        this.erroresConsulta,
        urlSearch
    ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          paginacionInfoJson.lista.forEach((item) => {
            this.opcionesTiposDocumentos.push(new ConvocatoriaTiposDocumento(item));
          });
        },
        error => {
          console.error(error);
        }
    );
  }

  validarFormularioDetalle(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
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

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  cambioRadioInscrito(inscrito: boolean): void {
    //console.log('opcion cambioRadioInscrito  ::' + inscrito);
    //console.log('estatus' + this.entidadPagoEstudiante.estudiante.estatus.id);
    if (inscrito === true) {
      if (this.entidadPagoEstudiante.estudiante.estatus.id === 1002) {
        this.inscrito = true;
        //console.log('opcion cambioRadioInscrito  ::' + this.inscrito);

      }
    }
    else {
      this.inscrito = false;
      //console.log('opcion cambioRadioInscrito  ::' + this.inscrito);
    }
  }

  enviarFormulario(): void {
    (<FormControl>this.formulario.controls['idEstudiante']).patchValue(this.idEstudiante);
    if (this.validarFormularioDetalle()) {
      this._spinner.start('tablaDetalle');
      event.preventDefault();
      //console.log('primero');
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.estudianteDocumentoEntregadoService
            .putEstudianteDocumentoEntregado(
                this.registroSeleccionado.id,
                jsonFormulario,
                this.erroresGuardados
            ).subscribe(
            () => {}, //console.log('Success Edition'),
            console.error,
            () => {
              this.estadoBotonAgregar = false;
              this.onCambiosTablaDetalle();
              this.setearFormulario();
              this.edicionFormulario = false;
            }
        );
      } else {
        this.estudianteDocumentoEntregadoService
            .postEstudianteDocumentoEntregado(
                jsonFormulario,
                this.erroresGuardados
            ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this.estadoBotonAgregar = false;
              this.setearFormulario();
              this.onCambiosTablaDetalle();
              // this.cerrarModal();
            }
        );
      }
    } else {
    }
  }

  setearFormulario(): void {
    (<FormControl>this.formulario.controls['comentarios']).patchValue('');
    (<FormControl>this.formulario.controls['idTipoDocumento']).patchValue('');
  }

  enviarFormularioInscripcion(): void {
    if (this.entidadPagoEstudiante.estudiante.estatus.id !== 1006) {
      if (this.inscrito === true) {
        //console.log('LeL');
        //this._spinner.start();
        this._spinner.start('tablaDetalle');
        let cadenajson = {'id': this.idEstudiante, 'idEstatus': '1006'};
        let jsonCambiarEstatus = JSON.stringify(cadenajson, null , 2);
        //console.log(jsonCambiarEstatus);
        event.preventDefault();

        this.estudianteService.putEstudiante(
            this.idEstudiante,
            jsonCambiarEstatus,
            this.erroresGuardado
        ).subscribe(
            response => {
              // Actualizacion Rol
              let urlParameter: URLSearchParams = new URLSearchParams();
              urlParameter.set('criterios', 'idUsuario.id~' +
                  this.entidadPagoEstudiante.estudiante.usuario.id + ':IGUAL');
              this.usuarioRolService.getListaUsuarioRol(
                  this.erroresConsultas,
                  urlParameter
              ).subscribe(
                  response => {
                    let idUsuarioRol = response.json().lista[0].id;
                    //console.log(idUsuarioRol);
                    let jsonRol = '{"idRol": 5}';
                    this.usuarioRolService.putUsuarioRol(
                        idUsuarioRol,
                        jsonRol,
                        this.erroresGuardado
                    ).subscribe(
                        response => {
                          //      this.insertarBoleta();
                          //      this.insertarEvaluacionDocente();

                          //    this.recuperarMateriasImpartidas(this.idEstudiante);
                          this.generarCargaAcademica();
                        }

                    );
                  }
              );
              this.cerrarModal();
              this.onCambiosTabla();
            }
        );
      }else {
        this.cerrarModal();
        this.onCambiosTabla();
      }
    } else {
      this.cerrarModal();
      this.onCambiosTabla();
    }
  }

  generarCargaAcademica(): void {
    this._spinner.start('tablaDetalle');
    let jsonEstudiante = '{"idEstudiante": "' + this.idEstudiante + '"}';
    this.estudianteService.postGenerarCargaAcademica(
        jsonEstudiante,
        this.erroresConsultas
    ).subscribe(
        response => {
          //  //console.log('respuesta JSON:::::::::', response.json());
        },
        error =>  {

        },
        () => {
          //console.log('entra a cerrar model :):):):):)');
          this.onCambiosTablaDetalle();
          ///this.cerrarModal();
        }
    );
  }
  recuperarMateriasImpartidas(idEstudiante: number): void {
    this._spinner.start('recupMaterImpart');
    this.estudianteService.getEntidadEstudiante(
        idEstudiante,
        this.erroresConsultas,
        null
    ).subscribe(
        response => {
          this.estudiante = new Estudiante(response.json());
          //console.log('Estudiante Recuperado', this.estudiante);
        },
        error => {
          console.error(error);
        },
        () => {
          let urlParameter: URLSearchParams = new URLSearchParams();
          urlParameter.set('criterios', 'numeroPeriodo~1:IGUAL,' +
              'idPromocion.id~' + this.estudiante.promocion.id + ':IGUAL');
          this.materiaImpartidaService.getListaMateriaImpartida(
              this.erroresConsultas,
              urlParameter
          ).subscribe(
              response => {
                let listaMaterias: Array<MateriaImpartida> = [];
                if (response.json().lista.length > 0) {
                  let i = 0;
                  response.json().lista.forEach((item) => {
                    listaMaterias.push(new MateriaImpartida(item));
                    if (listaMaterias[i].materia.tipoMateria.id === 4) {
                      this.guardarEstudianteMateriaImpartida(listaMaterias[i]);
                    }
                    if (listaMaterias[i].materia.tipoMateria.id === 1) {
                      this.guardarEstudianteMateriaImpartida(listaMaterias[i]);
                    }
                    i++;
                  });

                }else {
                  //console.log('No hay materias para para agregar');
                }
              }
          );
          this._spinner.stop('recupMaterImpart');
        }
    );
  }

  guardarEstudianteMateriaImpartida(materiaImpartida : MateriaImpartida): void {
    //console.log('materiaImpartida', materiaImpartida);
    let jsonFormularioMateriaImpartida =
        '{"idEstudiante": "' + this.estudiante.id +
        '", "idMateriaImpartida": "' + materiaImpartida.id +
        '", "idBoleta":' + this.idBoletaGenerada + '}';

    //console.log(jsonFormularioMateriaImpartida);

    this.estudianteMateriaImpartidaService.postEstudianteMateriaImpartida(
        jsonFormularioMateriaImpartida,
        this.erroresGuardado
    ).subscribe(
        response => {
          //console.log(response.json());
          let estudentMat = new EstudianteMateriaImpartida(response.json());
          //console.log('estudentMat::::', estudentMat);
        },
        error => {
          console.error(error);
        },
        () => {
          //console.log('LO HACE:::');
        }
    );
  }
  onCambiosTablaDetalle(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';
    this.criteriosDocumentoEntregado = 'idEstudiante.id~' +
        this.entidadPagoEstudiante.estudiante.id + ':IGUAL';
    urlSearch.set('criterios', this.criteriosDocumentoEntregado);
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('pagina', this.paginaActualDetalle.toString());
    this._spinner.start('tablaDetalle');

    this.estudianteDocumentoEntregadoService.getListaEstudianteDocumentoEntregado(
        this.erroresConsulta,
        urlSearch,
        this.configuracionDetalle.paginacionDetalle
    ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          let paginasArray: Array<number> = [];
          this.registrosDetalle = [];
          for (var i = 0; i < paginacionInfoJson.paginas; i++) {
            paginasArray.push(i);
          }
          this.paginacionDetalle = new PaginacionInfo(
              paginacionInfoJson.registrosTotales,
              paginacionInfoJson.paginas,
              paginacionInfoJson.paginaActualDetalle,
              paginacionInfoJson.registrosPagina
          );
          paginacionInfoJson.lista.forEach((item) => {
            this.registrosDetalle.push(new EstudianteDocumentoEntregado(item));
          });
          //console.log('ta' + this.registros.length);
        },
        error => {
          this._spinner.stop('tablaDetalle');
        },
        () => {
          this._spinner.stop('tablaDetalle');
        }
    );
  }
  rowSeleccionadoDetalle(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  rowSeleccionDetalle(registro): void {
    if (this.registroSeleccionado !== registro) {
      this._spinner.start('rowSelec-on');
      this.registroSeleccionado = registro;
      if (this.registroSeleccionado.id) {
        this.estadoBotonAgregar = true;
        this.edicionFormulario = true;
        let estudianteDoc : EstudianteDocumentoEntregado;
        this.entidadEstudianteDocumentos =
            this.estudianteDocumentoEntregadoService.
            getEntidadEstudianteDocumentoEntregado(
                this.registroSeleccionado.id,
                this.erroresConsulta
            ).subscribe(
                response => {
                  estudianteDoc = new EstudianteDocumentoEntregado(
                      response.json()
                  );
                },
                // en caso de presentarse un error se agrega un nuevo error al array errores
                error => {
                  this._spinner.stop('rowSelec-on');

                },
                () => {

                  if (this.formulario) {
                    let booleanEntregado = 'entregado';
                    let stringComentarios = 'comentarios';
                    let intEstudiante = 'idEstudiante';
                    let intTipoDocumento = 'idTipoDocumento';

                    (<FormControl>this.formulario.controls[booleanEntregado])
                        .patchValue(estudianteDoc.entregado);
                    (<FormControl>this.formulario.controls[stringComentarios])
                        .patchValue(estudianteDoc.comentarios);
                    (<FormControl>this.formulario.controls[intEstudiante])
                        .patchValue(estudianteDoc.estudiante);
                    (<FormControl>this.formulario.controls[intTipoDocumento])
                        .patchValue(estudianteDoc.tipoDocumento.id);
                    this._spinner.stop('rowSelec-on');
                  }
                }
            );
      } else {
        this.registroSeleccionado = null;
        this._spinner.stop('rowSelec-on');
      }
    } else {
      this.registroSeleccionado = null;
      this.reiniciarCamposAgregarDocumentos();
    }
  }
  reiniciarCamposAgregarDocumentos(): void {
    this.estadoBotonAgregar = false;
    this.getControl('comentarios').patchValue('');
    this.getControl('idTipoDocumento').patchValue('');
    this.getControl('entregado').patchValue(false);
  }

  getEstudianteDocumento(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  cambioRadio(opcionAceptado: boolean): void {
    (<FormControl>this.formulario.controls['entregado']).patchValue(opcionAceptado);
  }

  verificarDocumentoAgregado(idDocumentoEntregado: number): void {
    this._spinner.start('verificarDocAgregado');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante.id~' + this.idEstudiante + ':IGUAL,' +
        'idTipoDocumento~' + idDocumentoEntregado + ':IGUAL');
    let stringComentarios = 'comentarios';

    this.estudianteDocumentoEntregadoService.getListaEstudianteDocumentoEntregado(
        this.erroresConsulta,
        urlParameter,
        this.configuracionDetalle.paginacionDetalle
    ).subscribe(
        response => {
          let listaEntidad = response.json();
          //console.log(response.json());
          if (listaEntidad.lista.length  > 0) {
            this.estudianteDocs =
                new EstudianteDocumentoEntregado(listaEntidad.lista[0]);
          }

          if (this.estudianteDocs) {
            // //console.log('ya esta un registro de este documento agregado a la tabla');
            (<FormControl>this.formulario.controls['idTipoDocumento']).patchValue('');
            this.estadoBotonAgregar = false;
            this._spinner.stop('verificarDocAgregado');
            this.modalDocumentoAgregadoRechazar();
            listaEntidad = null;
            this.estudianteDocs = null;
          }else {
            //(<FormControl>this.formulario.controls['idTipoDocumento']).patchValue(idDocumentoEntregado);
            //(<FormControl>this.formulario.controls['comentarios']).patchValue(this.estudianteDocs.comentarios);
            this.estadoBotonAgregar = true;
            //this.setearFormulario();
            this._spinner.stop('verificarDocAgregado');
          }
        },
        error => {

        });
  }

  insertarBoleta(): any {
    let formularioBoletas = new FormGroup({
      expedida: new FormControl(false),
      idPeriodoEscolar: new FormControl(this.entidadPagoEstudiante.estudiante.periodoActual.id),
      idEstudiante: new FormControl(this.entidadPagoEstudiante.estudiante.id)
    });

    //console.log(formularioBoletas.value);
    this.boletaService.postBoleta(
        JSON.stringify(formularioBoletas.value, null, 2),
        this.erroresGuardado
    ).subscribe(
        response =>{
          //console.log(response);
          //console.log(response.json().id);
          this.idBoletaGenerada = response.json().id;
        },
        error => {

        },
        () => {

        });
  }

  insertarEvaluacionDocente(): any {
    console.warn('Metodo para insertar en evaluación docente');
    let formularioEvaluacionDocente = new FormGroup({
      idPeriodoEscolar: new FormControl(this.entidadPagoEstudiante.estudiante.periodoActual.id),
      idEstudiante: new FormControl(this.entidadPagoEstudiante.estudiante.id),
      observaciones: new FormControl('observaciones'),
      evaluacionesFinalizadas: new FormControl(false),
      estudianteAbsuelto: new FormControl(false),
    });

    //console.log(formularioEvaluacionDocente.value);
    this.evaluacionDocenteAlumnoService.postEvaluacionDocenteAlumno(
        JSON.stringify(formularioEvaluacionDocente.value, null, 2),
        this.erroresGuardado
    ).subscribe(
        response =>{
          //console.log(response);
        },
        error => {

        },
        () => {

        });
  }
  cerrarModal(): void{
    this.modalDetalle.close();
  }

  modalDetalles(): void {
    this.modalDetalle.open('lg');
  }

  ////////////////////////--MODAL ACEPTAR-RECHAZAR///////////////**********

  modalDocumentoAgregadoRechazar(): void {
    this.modalAcepRecha.open();
  }

  cerrarModal1(): void{
   // this.modalAcepRecha.close();
    ///this.modalAcepRecha.dismiss();
    this.modalAcepRecha.ngOnDestroy();
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////
//                       Metodos para desplegar menu de boton de exportar                      //
///////////////////////////////////////////////////////////////////////////////////////////////
  public status: { isopen: boolean } = {isopen: false};

  public toggled(open: boolean): void {
    ////console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('recepcionDocumentoCriterios');
    sessionStorage.removeItem('recepcionDocumentoOrdenamiento');
    sessionStorage.removeItem('recepcionDocumentoLimite');
    sessionStorage.removeItem('recepcionDocumentoPagina');
  }

}
