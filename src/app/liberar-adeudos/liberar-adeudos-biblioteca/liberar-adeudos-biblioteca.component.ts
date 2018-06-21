import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {SolicitudNoAdeudo} from "../../services/entidades/solicitud-no-adeudo.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {Router} from "@angular/router";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {AuthService} from "../../auth/auth.service";
import {FirmaSimpleService} from "../../services/entidades/firma-simple.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {DocumentoFirmaSimpleService} from "../../services/entidades/documento-firma-simple.service";
import {DocumentoFirmaSimpleCartaNoAdeudoService} from "../../services/entidades/documento-firma-simple-carta-no-adeudo.service";

@Component({
  selector: 'app-liberar-adeudos-biblioteca',
  templateUrl: './liberar-adeudos-biblioteca.component.html',
  styleUrls: ['./liberar-adeudos-biblioteca.component.css']
})
export class LiberarAdeudosBibliotecaComponent implements OnInit {
  criteriosCabezera: string = '';
  // variables para la tabla materias
  paginacion: PaginacionInfo;
  paginasArray: Array<number> = [];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  botonValido: boolean = false;
  registros: Array<SolicitudNoAdeudo> = [];
  registroSeleccionado: SolicitudNoAdeudo;
  columnas: Array<any> = [
    { titulo: 'Motivo', nombre: 'motivo'},
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Matrícula*', nombre: 'idEstudiante.idMatricula.matriculaCompleta'},
    { titulo: 'Fecha de solicitud', nombre: 'fecha'},
    { titulo: 'Estatus', nombre: 'idEstatus.valor', sort: false},
  ];
  solicitudNoAdeudoService;
  programaDocenteService;
  promocionService;
  estatusService;
  formulario: FormGroup;
  formularioCheck: FormGroup;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido,' +
    'idEstudiante.idMatricula.matriculaCompleta'}
  };
  public area: string; // variable para cambiar el area del componente, menu.html
  public textoArea: string;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects>;
  private opcionesCatalogoPromocion: Array<ItemSelects>;
  private opcionesCatalogoProgramaDocente: Array<ItemSelects>;

  constructor(//private modal: Modal,
      private elementRef: ElementRef,
      private authService: AuthService,
      private injector: Injector,
      private _renderer: Renderer,
      public _catalogosServices: CatalogosServices, _router: Router,
      private spinner: SpinnerService) {
//    let params = _router.parent.currentInstruction.component.params;
    this.area = 'biblioteca';
    this.textoArea = this.generarTextoArea(this.area);
    this.prepareServices();
    this.formulario = new FormGroup({
      idEstatus: new FormControl('', Validators.required),
      idPromocion: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
    });
    this.formularioCheck = new FormGroup({
      checked: new FormControl(''),
    });
  }

  generarTextoArea(area: string): string {
    switch (area) {
      case 'docencia':
        return 'Docencia';
      case 'utic':
        return 'Unidad Tecnologías de la Información';
      case 'finanzas':
        return 'Presupuestos y finanzas';
      case 'rms':
        return 'Recursos Materiales y Servicios';
      case 'biblioteca':
        return 'Biblioteca';
    }
  }

  getEstadoValidacion(area: string): boolean {
    switch (area) {
      case 'docencia':
        return this.registroSeleccionado.docencia;
      case 'utic':
        return this.registroSeleccionado.utic;
      case 'finanzas':
        return this.registroSeleccionado.finanzas;
      case 'rms':
        return this.registroSeleccionado.rms;
      case 'biblioteca':
        return this.registroSeleccionado.biblioteca;
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
    this.onCambiosTabla();
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    //console.log('idProgramaDocente', idProgramaDocente);
    (<FormControl>this.formulario.
        controls['idPromocion']).setValue('');
    (<FormControl>this.formulario.
        controls['idEstatus']).setValue('');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesCatalogoPromocion =
        this.promocionService.getSelectPromocion(this.erroresConsultas, urlParameter);
    this.opcionesCatalogoEstatus =
        this.estatusService.getSelectEstatusCatalogo(this.erroresConsultas);
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  buscarCriteriosCabezera(
      idProgramaDocente: number,
      idPromocion: number,
      idEstatus: number
  ): void {
    this.criteriosCabezera = '';
    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + 'idEstudiante.idPromocion.id~'
          + idPromocion + ':IGUAL';
    }
    if (idEstatus) {
      if (this.criteriosCabezera !== '')
        this.criteriosCabezera += ',';
      this.criteriosCabezera = this.criteriosCabezera + this.area + '~'
          + idEstatus + ':IGUAL';
    }
    //console.log(this.criteriosCabezera);
    this.onCambiosTabla();
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

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  onCambiosTabla(): void {
    this.spinner.start("liberaradeudosdocencia1");
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
      //this.criteriosCabezera = '';
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      if (criterios !== '')
        criterios += ';ANDGROUPAND';
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
    this.solicitudNoAdeudoService.getListaSolicitudNoAdeudo(
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
            this.registros.push(new SolicitudNoAdeudo(item));
          });

        },
        error => {
          /*        if (assertionsEnabled()) {
           console.error(error);
           }*/
          this.spinner.stop("liberaradeudosdocencia1");
        },
        () => {
          /*        if (assertionsEnabled()) {
           //console.log('paginacionInfo', this.paginacion);
           //console.log('registros', this.registros);
           }*/
          this.spinner.stop("liberaradeudosdocencia1");
        }
    );
  }

  sortChanged(columna): void {
    this.columnas.forEach((column) => {
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
      this.onCambiosTabla();
    }
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  private prepareServices (): void {
    this.solicitudNoAdeudoService = this._catalogosServices.getSolicitudNoAdeudo();
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosServices.getPromocion();
    this.estatusService = this._catalogosServices.getEstatusCatalogo();
    this.opcionesCatalogoProgramaDocente =
        this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.onCambiosTabla();
  }

//  constructor() { }

  ngOnInit() {
  }

  ///////////////////////////////////////MODALS/////////////////////////////

  @ViewChild('modalAsignarFirma')
  modalAsignarFirma: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  ////////////////////////////////// ASIGNAR FIRMA //////////////////***********************

  cartaNoAdeudoService;
  firmaSimpleService;
  documentoFirmaSimpleService;
  documentoFirmaSimpleCartaNoAdeudosService;
  usuarioLogueado: UsuarioSesion;
  documentoFirmaSimple: number;
  private erroresGuardadoAF: Array<ErrorCatalogo> = [];
  private erroresConsultasAF: Array<Object> = [];

  instanciaSolicitud: SolicitudNoAdeudo;
  validacion: boolean;

  constructorAF(): void {
    this.instanciaSolicitud = this.registroSeleccionado;
    this.validacion = this.getEstadoValidacion(this.area);
    this.erroresGuardadoAF = [];
    this.erroresConsultasAF = [];
    this.prepareServicesAF();
    this.usuarioLogueado = this.authService.getUsuarioLogueado();
    this.formularioCheck = new FormGroup({
      checked: new FormControl(false),
    });
    this.modalAsignarFirmaOpen();
  }

  generarJson(area: string): string {
    return '{ "' + area + '": true }';
  }

  asignarFirma(): void {
    this.insertarFirmaSimple();

  }

  firmarCartaNoAdeudo(): void {
    // cuando el método firmar funcione descomentar código
    this.spinner.start('firmarCartaNA');
    let jsonFormulario = this.generarJson(this.area);
    //console.log(jsonFormulario);
    this.solicitudNoAdeudoService
        .putSolicitudNoAdeudo(
            this.instanciaSolicitud.id,
            jsonFormulario,
            this.erroresGuardadoAF
        ).subscribe(
        () => {}, //console.log('Success'),
        // console.error,
        error => {
          //console.error(error);
          this.spinner.stop('firmarCartaNA');
        },
        () => {
          this.insertarDocFirmaSimpleNoAdeudo(
              this.documentoFirmaSimple, this.instanciaSolicitud.id);
        }
    );
  }
  insertarFirmaSimple(): void {
    //console.log('Firma simple');
    //let idUsuario= this.usuarioLogueado.id; //Entrada
    let formulario = '{ "idUsuario":' + this.usuarioLogueado.id + ' }';
    this.firmaSimpleService.postFirmaSimple(
        formulario,
        this.erroresGuardadoAF
    ).subscribe(
        response => {
          let idFirmaSimple = response.json().id;
          this.insertarDocumentoFirmaSimple(idFirmaSimple);
        },
        error => {
          console.error(error);
        },
        () => {

        }
    );
  }

  insertarDocumentoFirmaSimple(idFirmaSimple): void {
    //console.log('Documento Firma simple');
    let formulario = '{ "idFirmaSimple":' + idFirmaSimple + ' }';
    this.documentoFirmaSimpleService.postDocumentoFirmaSimple(
        formulario,
        this.erroresGuardadoAF
    ).subscribe(
        response => {
          let idDocFirmaSimple = response.json().id;
          //this.insertarDocFirmaSimpleNoAdeudo(idDocFirmaSimple);
          this.documentoFirmaSimple = response.json().id;
          this.firmarCartaNoAdeudo();
        },
        error => {
          console.error(error);
        },
        () => {

        }
    );
  }

  insertarDocFirmaSimpleNoAdeudo(idDocumentoFirmaSimple, idCartaNoAdeudos): void {
    /*let formulario = '{ "idDocumentoFirmaSimple":' + idDocumentoFirmaSimple +
     '",idCartaNoAdeudos:"' + idCartaNoAdeudos + ' "}';*/
    let formulario = new FormGroup({
      idDocumentoFirmaSimple: new FormControl(idDocumentoFirmaSimple),
      idCartaNoAdeudo: new FormControl(idCartaNoAdeudos)
    });

    //console.log(formulario.value);
    this.documentoFirmaSimpleCartaNoAdeudosService.postDocumentoFirmaSimpleCartaNoAdeudo(
        JSON.stringify(formulario.value, null, 2),
        this.erroresGuardadoAF
    ).subscribe(
        response => {
          let idFirmaSimple = response.json().id;
        },
        error => {
          console.error(error);
        },
        () => {
          //console.log(response.json());
          //console.log('¡¡LISTO!!');

          this.spinner.stop('');
          this.cerrarModalAsignarFirma();
          this.onCambiosTabla();
        }
    );
  }

  private prepareServicesAF(): void {
    this.cartaNoAdeudoService =
        this._catalogosServices.getCartaNoAdeudo();
    this.firmaSimpleService =
        this._catalogosServices.getFirmaSimpleService();
    this.documentoFirmaSimpleService =
        this._catalogosServices.getDocumentoFirmaSimpleService();
    this.documentoFirmaSimpleCartaNoAdeudosService =
        this._catalogosServices.getDocumentoFirmaSimpleCartaNoAdeudosService();
  }

  modalAsignarFirmaOpen(): void {
    this.modalAsignarFirma.open();
  }
  cerrarModalAsignarFirma(): void {
    this.modalAsignarFirma.close();
  }
}
