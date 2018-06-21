import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {InteresadoMovilidadExterna} from '../../services/entidades/interesado-movilidad-externa.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {InteresadoMovilidadExternaService} from '../../services/entidades/interesado-movilidad-externa.service';
import {ProgramaDocenteServices} from '../../services/entidades/programa-docente.service';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import * as moment from 'moment';
import {NacionalidadService} from '../../services/catalogos/nacionalidad.service';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {MovilidadExternaMateria} from '../../services/entidades/movilidad-externa-materia.model';
import {FormControl, FormGroup, Validators, Validator} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {ConfigService} from '../../services/core/config.service';

@Component({
  selector: 'app-estudiante-especial-interesados-coordinacion',
    templateUrl: './estudiante-especial-interesados-coordinacion.component.html',
  styleUrls: ['./estudiante-especial-interesados-coordinacion.component.css']
})
export class EstudianteEspecialInteresadosCoordinacionComponent {

  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  @ViewChild('modalRechazar')
  modalRechazarMov: ModalComponent;
  @ViewChild('modalAceptar')
  modalAceptarMov: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  columnas: Array<any> = [
    { titulo: 'Nombre', nombre: 'primerApellido', sort: 'asc'},
    { titulo: 'Correo electrónico', nombre: 'email'},
    { titulo: 'Programa docente', nombre: 'idProgramaDocente.descripcion'},
    { titulo: 'Fecha de registro', nombre: 'fechaRegistro'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'nombre,primerApellido,segundoApellido,email,' +
    'idProgramaDocente.descripcion,idEstatus.valor'}
  };

  registros: Array<InteresadoMovilidadExterna> = [];
  registroSeleccionado: InteresadoMovilidadExterna;

  // Service
  catalogoService: CatalogosServices;
  interesadoMovilidadExternaService: InteresadoMovilidadExternaService;
  programaDocenteService: ProgramaDocenteServices;
  promocionService: PromocionServices;
  usuarioRol: UsuarioRoles;
//  nacionalidadService;
  usuarioRolService;
  archivoService;
  correoService;
  materiasMovilidadService;

  // Select
  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesSelectPromocion: Array<ItemSelects> = [];
  opcionesSelectNacionalidad: Array<ItemSelects> = [];
  // opcionSelectNacionalidad: Array<ItemSelects> = [];

  // exportar lista
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  /// DatePicker ///
  private fechaRegistroDP: Date = new Date();
  private maxDate: Date = new Date();

  // errores
  private mensajeErrors: any = { 'required': 'Este campo es requerido'};
  private erroresConsultas: Array<ErrorCatalogo> = [];

  // variables del modal
  entidadInteresadoMovilidadExterna;
  columnasTablaModal: Array<any> = [
    { titulo: 'Materia(s) a cursar en el COLSAN', nombre: 'idMateria'},
    { titulo: 'Materia(s) que convalida', nombre: 'materiaOrigen' }
  ];
  private registrosMaterias: Array<MovilidadExternaMateria> = [];
  deshabilitarBotones: boolean = false;
  validacionActiva: boolean = false;

  formularioAceptarMov: FormGroup;

  // REchazo
  formularioRechazo: FormGroup;

  constructor(
    private elementRef: ElementRef,
    private _spinner: SpinnerService,
    private injector: Injector,
    private _renderer: Renderer,
    private nacionalidadService: NacionalidadService,
    public _catalogosService: CatalogosServices,
    private authService: AuthService) {
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado(); // Seguridad.getUsuarioLogueado();
    console.log(authService.getUsuarioLogueado());
    this.prepareServices();
    this.obtenerCatalogos();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.inicializarFormularioRechazo();
    this.inicializarFormularioAceptar();
  }

  inicializarFormularioRechazo() {
    this.formularioRechazo = new FormGroup({
      comentariosCoordinador: new FormControl('', Validators.compose([Validators.required,
        Validacion.parrafos])),
      idEstatus: new FormControl(103, Validators.required)
    });
  }

  inicializarFormularioAceptar() {
    this.formularioAceptarMov = new FormGroup({
      comentariosCoordinador: new FormControl('', Validators.compose([Validators.required,
        Validacion.parrafos])),
      idEstatus: new FormControl(102, Validators.required)
    });
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
        });
        this.getProgramaDocente();
      }
    );
  }

/*  modalDetallesinteresado(): void {
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
    } else {   }
  }*/

/*  modalAceptarMovilidad(): void {
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id === 104) {
      let idUusario = this.usuarioRol.usuario.id;
      let modalConfig = new ModalConfig('sm', true, 27);

      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ModalAceptarMovilidadData(
            this,
            this.registroSeleccionado.id,
            this.registroSeleccionado.email,
            idUusario
          )
        }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      this.modal.open(
        <any>ModalAceptarMovilidad,
        bindings,
        modalConfig
      );
    }
  }*/

/*  modalRechazarMovilidad(): void {
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id === 104) {
      let idUsuario = this.usuarioRol.usuario.id;
      let modalConfig = new ModalConfig('sm', true, 27);
      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ModalRechazarMovilidadData(
            this,
            this.registroSeleccionado.id,
            this.registroSeleccionado.email,
            idUsuario
          )
        }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      this.modal.open(
        <any>ModalRechazarMovilidad,
        bindings,
        modalConfig
      );
    }
  }*/

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    fechaRegistro: string,
    idNacionalidad: number
  ): void {
    this.criteriosCabezera = 'idProgramaDocente~' +
      this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
    if (fechaRegistro) {
      this.criteriosCabezera = this.criteriosCabezera + ',fechaRegistro~'
        + fechaRegistro + ':MAYOR';
    }

    if (idNacionalidad) {
      if (idNacionalidad == 5) {
        this.criteriosCabezera = this.criteriosCabezera + ',idPais~'
          + 82 + ':IGUAL';
      }else {
        this.criteriosCabezera = this.criteriosCabezera + ',idPais~'
          + 82 + ':NOT';
      }
    }
    this.onCambiosTabla();
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion =
      this.promocionService.getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    this._spinner.start('estudianteespecialinteresadocoordinacion1');
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idEstatus.id~102:IGUAL;OR,idEstatus.id~103:IGUAL;OR,' +
    'idEstatus.id~104:IGUAL;OR';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      criterios =  criterios + 'GROUPAND,' + this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = criterios + ';ANDGROUPAND';
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
        for (let i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
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
        this._spinner.stop('estudianteespecialinteresadocoordinacion1');
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
      }
    );
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

  pendienteRegistroSelecciondo(): boolean {
    return this.registroSeleccionado ? (this.registroSeleccionado.estatus.id === 104) : false;
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          // alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          // alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  private filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  private limpiarFiltro(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  private rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  private cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  private setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  private rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  private isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }


  /*private getDateRegistro() { //: number {
    this.maxDate = new Date();
    return moment(this.fechaRegistroDP).format('DD/MM/YYYY');
  }*/

  getDateRegistro(): string {
    if (this.fechaRegistroDP) {
      let fechaConFormato = moment(this.fechaRegistroDP).format('DD/MM/YYYY');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }

  private prepareServices(): void {
    this.catalogoService = this._catalogosService;
    this.interesadoMovilidadExternaService =
      this.catalogoService.getInteresadoMovilidadExterna();
    this.programaDocenteService =
      this.catalogoService.getCatalogoProgramaDocente();
    this.promocionService =
      this.catalogoService.getPromocion();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.archivoService = this._catalogosService.getArchivos();
    this.materiasMovilidadService = this._catalogosService.getMateriasMovilidad();
    this.correoService = this._catalogosService.getEnvioCorreoElectronicoService();

  }

  private getProgramaDocente(): void {
    this.opcionesSelectProgramaDocente.push(
      new ItemSelects (
        this.usuarioRol.usuario.programaDocente.id,
        this.usuarioRol.usuario.programaDocente.descripcion
      )
    );
    this.criteriosCabezera =
      'idEstatus.id~102:IGUAL;OR,idEstatus.id~103:IGUAL;OR,' +
      'idEstatus.id~104:IGUAL;ORGROUPAND,' + 'idProgramaDocente~' +
      this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
    this.onCambiosTabla(); // este es la primera carga
  }

  private obtenerCatalogos(): void {
    /*//    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
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
    );*/
    // this.nacionalidadService = this.catalogoService.getNacionalidad();
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'tipo~Persona:IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesSelectNacionalidad = this.nacionalidadService.
      getSelectNacionalidadParametros(this.erroresConsultas, urlParameter);
  }

/*  constructor() { }

  ngOnInit() {
  }

  getDateRegistro(): boolean {
    return true;
  }
  pendienteRegistroSelecciondo(): boolean {
    return true;
  }*/

////////////////////////////codigo de modals////////////////////////

  modalDetallesinteresado(): void {
    this.modalDetalle.open('lg');
    this.obtenerDetalleInteresado();
    this.getMateriasInteresado();
  }

  cerrarModalDetalle(): void {
    this.modalDetalle.close();
  }

  obtenerDetalleInteresado() {
    this._spinner.start('detalleInteresado1');
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
        this._spinner.stop('detalleInteresado1');
      },
      () => {
        /*if (assertionsEnabled()) {
         //console.log(this.entidadInteresadoMovilidadExterna);
         }*/
        this._spinner.stop('detalleInteresado1');
      }
    );
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarCarta');
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
          // console.log('Error downloading the file.');
          this._spinner.stop('descargarCarta');
        },
        () => {
          console.log('OK');
          this._spinner.stop('descargarCarta');
        }
      );
    }
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
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
          // console.log('Error downloading the file.');
          this._spinner.stop('verArchivo');
        },
        () => {
          // console.log('OK');
          this._spinner.stop('verArchivo');
        }
      );
    }
  }

  getMateriasInteresado(): void {
    console.log('Entrar a obtener materias');
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

  obtenerFecha(fecha: string) {
    let retorno = fecha;
    if (fecha) {

      // retorno = new moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  modalRechazarMovilidad(): void {
    this.validacionActiva = false;
    this.inicializarFormularioRechazo();
    this.modalRechazarMov.open('sm');
  }

  cerrarModalRechazar(): void {
    this.validacionActiva = false;
    this.formularioRechazo.reset();
    this.modalRechazarMov.close();
  }

  validarFormularioRecahzo(): boolean {
    console.log(this.formularioRechazo.value);
    if (this.formularioRechazo.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  saveDecisionCoordiandor (tipoDecision): void {
    console.log(tipoDecision);
    if (tipoDecision === 'rechazo') {
      console.log('RECHAZO');
      if (this.validarFormularioRecahzo()) {
        // se deshabilitan botones para evitar multiples peticiones
        this.deshabilitarBotones = true;
        let jsonFormulario = JSON.stringify(this.formularioRechazo.value, null, 2);
        console.log(jsonFormulario);
        this.actualizarMovilidad(jsonFormulario, 'rechazo');
      } /*else {
       }*/
    }else if (tipoDecision === 'aceptacion') {
      console.log('ACEPTACION');
      if (this.validarFormularioAceptarMov()) {
        // se deshabilitan botones para evitar multiples peticiones
        this.deshabilitarBotones = true;
        let jsonFormulario = JSON.stringify(this.formularioAceptarMov.value, null, 2);
        console.log(jsonFormulario);
        this.actualizarMovilidad(jsonFormulario, 'aceptacion');
      } /*else {
       }*/
    }
  }

  actualizarMovilidad(json, tipoDecision) {
    this._spinner.start('actualizarMovilidad');
    this.interesadoMovilidadExternaService
      .putInteresadoMovilidadExterna(
        this.registroSeleccionado.id,
        json,
        this.erroresConsultas
      ).subscribe(
      response => {}, // console.log('Success'),
      error => {
        /*if (assertionsEnabled()) {
         console.error(error);
         }*/
        this._spinner.stop('actualizarMovilidad');
      },
      () => {
        /*if (assertionsEnabled()) {
         //console.log('Correo Enviado');
         }*/
        this._spinner.stop('actualizarMovilidad');
        if (tipoDecision === 'rechazo') {
          this.enviarCorreoRechazo();
        }else if (tipoDecision === 'aceptacion') {
          this.enviarCorreoAceptacion();
        }
      }
    );
  }

  private enviarCorreoRechazo(): void {
    this._spinner.start('enviarcorreorechazo');
    let correoFormulario = new FormGroup ({
      destinatario: new FormControl(this.registroSeleccionado.email),
      entidad: new FormControl({interesadoMovilidadExterna: this.registroSeleccionado.id,
        Usuarios: this.usuarioRol.usuario.id}),
      idPlantillaCorreo: new FormControl(34)
    });
    let jsonFormulario = JSON.stringify(correoFormulario.value, null, 2);
    // console.log('Formualrio correo: ' + jsonFormulario);
    this.correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.onCambiosTabla();
        this.registroSeleccionado = null;
        this.pendienteRegistroSelecciondo();
        this.deshabilitarBotones = false;

      }, error => {
        this._spinner.stop('enviarcorreorechazo');
        this.cerrarModalRechazar();
      },
      () => {
        this._spinner.stop('enviarcorreorechazo');
        this.cerrarModalRechazar();
      }
    );
  }

  private getControlRechazo(campo: string): FormControl {
    return (<FormControl>this.formularioRechazo.controls[campo]);
  }

  private getControlErrorsRechazo(campo: string): boolean {
    if (!(<FormControl>this.formularioRechazo.controls[campo]).valid && this.validacionActiva) {
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
    return resultado;
  }


  // ----------------------Modal aceptar movilidad-----------------------------------//

  modalAceptarMovilidad(): void {
    this.inicializarFormularioAceptar();
    this.modalAceptarMov.open('sm');
  }

  cerrarModalAceptar(): void {
    this.formularioAceptarMov.reset();
    this.modalAceptarMov.close();
  }

  getControlAceptarMov(campo: string): FormControl {
    return (<FormControl>this.formularioAceptarMov.controls[campo]);
  }

  getControlErrorsAceptarMov(campo: string): boolean {
    if (!(<FormControl>this.formularioAceptarMov.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormularioAceptarMov(): boolean {
    if (this.formularioAceptarMov.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  /*enviarFormulario (): void {
    if (this.validarFormulario()) {
      // se deshabilitan botones para evitar multiples peticiones
      this.deshabilitarBotones = true;
      let jsonFormulario = JSON.stringify(this.formularioAceptarRechazar.value, null, 2);
      this.interesadoMovilidadExternaService.putInteresadoMovilidadExterna(
          this.registroSeleccionado.id,
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.enviarCorreo();
        },
        error => {
          /!*if (assertionsEnabled()) {
            console.error(error);
          }*!/
        }
      );
    } else {
    }
  }*/

  enviarCorreoAceptacion(): void {
    this._spinner.start('correoAceptacion');
    let correoFormulario = new FormGroup ({
      destinatario: new FormControl(this.registroSeleccionado.email),
      entidad: new FormControl({interesadoMovilidadExterna: this.registroSeleccionado.id,
        Usuarios: this.usuarioRol.usuario.id}),
      idPlantillaCorreo: new FormControl(9)
    });
    let jsonFormulario = JSON.stringify(correoFormulario.value, null, 2);
    // console.log('Formualrio correo: ' + jsonFormulario);
    this.correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.onCambiosTabla();
        this.registroSeleccionado = null;
        this.pendienteRegistroSelecciondo();
        this.deshabilitarBotones = false;

      },
      error => {
        this._spinner.stop('correoAceptacion');
        this.cerrarModalAceptar();
      },
      () => {
        this._spinner.stop('correoAceptacion');
        this.cerrarModalAceptar();
      });
  }

}
