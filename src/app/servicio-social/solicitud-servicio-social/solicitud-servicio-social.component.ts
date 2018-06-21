import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import * as moment from 'moment';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ServicioSocial} from '../../services/entidades/servicio-social.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {
  DocumentoServicioSocialService
} from '../../services/entidades/documento-servicio-social.service';
import {
  ServicioSocialService
} from '../../services/entidades/servicio-social.service';
import {
  SolicitudServicioSocialService
} from '../../services/entidades/solicitud-servicio-social.service';
import {DocumentoServicioSocial} from
  '../../services/entidades/documento-servicio-social.model';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {AuthService} from '../../auth/auth.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {ConfigService} from '../../services/core/config.service';
@Component({
  selector: 'app-solicitud-servicio-social',
  templateUrl: './solicitud-servicio-social.component.html',
  styleUrls: ['./solicitud-servicio-social.component.css']
})
export class SolicitudServicioSocialComponent implements OnInit {

  Ng2Bs3ModalModule

  @ViewChild('modalSolicitudServicio')
  modalCrud: ModalComponent;
  @ViewChild('modalDetalleServicioSocial')
  modalDetalleServicioSocial: ModalComponent;
  @ViewChild('modalConfirmacionServicioSocial')
  modalConfirmacionServicioSocial: ModalComponent;
  @ViewChild('modalrechazarServicioSocial')
  modalrechazarServicioSocial: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  size: string = 'lg';
  output: string;
  private descripcionError: string = '';

  paginacion: PaginacionInfo;
  botonValido: boolean = false;
  criteriosCabezera: string = '';
  paginaActual: number = 1;
  limite: number = 10;

  registros: Array<ServicioSocial> = [];

  columnas: Array<any> = [
        { titulo: 'Matrícula',
            nombre: 'idSolicitudServicio.idEstudiante.idMatricula.matriculaCompleta', sort: 'asc' },
        { titulo: 'Nombre del estudiante*',
            nombre: 'idSolicitudServicio.idEstudiante.idDatosPersonales.primerApellido',
            sort: 'asc' },
        { titulo: 'Tipo de servicio', nombre: 'idSolicitudServicio.institucion', sort: 'asc' },
        { titulo: 'Fecha de solicitud', nombre: 'idSolicitudServicio.fechaSolicitud', sort: 'asc' },
        { titulo: 'Estatus', nombre: 'idSolicitudServicio.idEstatus.valor', sort: 'asc' }
  ];

  registroSeleccionado: ServicioSocial;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  public configuracion: any = {
    paginacion: true,
    filtrado: {
      textoFiltro: '',
      columnas: 'idSolicitudServicio.idEstudiante.idDatosPersonales.primerApellido,' +
      'idSolicitudServicio.idEstudiante.idDatosPersonales.segundoApellido,' +
      'idSolicitudServicio.idEstudiante.idDatosPersonales.nombre,' +
      'idSolicitudServicio.idEstatus.valor',
      textoFecha: ''
    }
  };
  promocionSeleccionada = null;
  catalogoEstatusService;
  exportarFormato = '';

  /// variables para el modal info servicio social}]//
  private servicioSocialElegido: ServicioSocial;
  private botonValidoInformacionSS: boolean = false;
  private registrosEvidencia: Array<any>;
  private registrosGenerales: Array<any>;
  private registroSeleccionadoInformacionSS: any;
  private formularioSolicitudServicioSocial: FormGroup;
  private formularioSolicitudServicio: FormGroup;
  private validacionActiva: boolean = false;
  private validacionActiva2: boolean = false;
  private rangoFechasValido: boolean = true;
  public status: { isopen: boolean } = { isopen: false };
  mensajeErrors: any = {
        'required': 'Este campo es requerido',
        'invalidEmailAddress': 'Correo electrónico inválido',
        'invalidPassword': 'Contraseña inválida, debe contener al menos 6 caracteres' +
        ' un número y una letra en mayúscula',
        'invalidNumero': 'Sólo admite números',
        'invalidLetras': 'Sólo admite letras',
        'invalidLetrasNumeros': 'Sólo admite letras y números',
        'invalidLetrasWithoutSpace': 'Sólo admite letras sin espacio',
        'invalidLetrasNumerosWithoutSpace': 'Sólo admite letras y números sin espacio',
        'invalidCurp': 'CURP Inválida',
        'invalidNumeroTelefonico': 'Formato incorrecto(000-000-0000) ó (000-000-0)',
        'invalidCaracter': 'Caracteres no validos',
        'invalidLetrasNumerosAcentoPuntoComa':
        'Sólo admite letras, números, ".", ",", ":", "-" y espacio',
        'invalidLetrasNumerosAcentoPuntoComaGato':
        'Sólo admite letras, números, ".", ",", ":", "-", "#" y espacio',
        'invalidNumerosFloat': 'El formato es: 100.00',
        'invalidAnio': 'El formato es: YYYY',
        'invalidHora': 'El formato de 24 hr HH:MM am|pm',
        'pattern': 'Formato incorrecto',
        'pattern_horario': 'El formato es: "HH:MM" (24Hrs)'
  };
  public dt: Date = new Date();
  public dtend: Date = new Date();
  public minDate: Date = void 0;
  public events: Array<any>;
  public tomorrow: Date;
  public afterTomorrow: Date;
  public formats: Array<string> = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY', 'shortDate'];
  public format: string = this.formats[0];
  public dateOptions: any = {
      formatYear: 'YY',
      startingDay: 1
  };
  private opened: boolean = false;
  private archivoService;
  /// Fin de seccion variables para le modal info ss//

  // varialbes para detalle de servico social ///
  isActiveDetalleSS: boolean = false;
  // fin de valirables para detalle de servicio socila////

  // varibales modal confirmar solicitud servicio social
  private formularioActivarSolicitud: FormGroup;
  private validacionActivaValidarSoliciutd: boolean = false;
  private numeroHoras: number = undefined;
  private usuarioLogueado: UsuarioSesion = undefined;
  // fin de variables para modal confirmar solicitud servicio social

  // varibales modal rechazar solicitud servicio social
  private formularioRechazarSolicitud: FormGroup;
  private validacionActivaRechazarSoliciutd: boolean = false;
  private numeroHorasRechazarSolicitud: number = undefined;
  // fin de variables para modal rechazar solicitud servicio social

  private opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  private opcionesSelectPromocion: Array<ItemSelects> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private programaDocente: Array<ItemSelects> = [];

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _documentoServicioSocialService: DocumentoServicioSocialService,
              private _servicioSocialService: ServicioSocialService,
              private _solicitudServicioSocialService: SolicitudServicioSocialService,
              public _catalogosService: CatalogosServices,
              private _enviarCorreo: EnvioCorreoElectronicoService,
              private auth: AuthService,
              public _spinner: SpinnerService) {

    moment.locale('es');
    this.prepareServices();
    this.inicializarFormularioServicioSocial();
    this.inicializarFormularioServicio();
    this.inicializarFormularioActivarSolicitud();
    this.inicializarFormularioRechazarSolicitud();
    this.usuarioLogueado = this.auth.getUsuarioLogueado();

    if (sessionStorage.getItem('solicitudServicioIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('solicitudServicioCriterios')) {
      this.onCambiosTabla();
    }  

  }
  ngOnInit(): void {
    this.onCambiosTabla();
  }
  activarBotonBusqueda(numero: number): any {
    this.botonValido = (numero === 1 && this.promocionSeleccionada);
  }

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;
  }
  getPaginacion() {
    return this.paginacion;
  }
  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';
    let criterios = '';
    if (!sessionStorage.getItem('solicitudServicioCriterios')) {
    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios += (criterios !== '') ? 'GROUPAND' : '';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ';OR,') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE';
      });
      criterios = criterios + ((criterios === '') ? '' : ';OR');

    }
/*    if (assertionsEnabled()) {
      //console.log('criterios', criterios);
    }*/
    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    sessionStorage.setItem('solicitudServicioCriterios', criterios);
    sessionStorage.setItem('solicitudServicioOrdenamiento', ordenamiento);
    sessionStorage.setItem('solicitudServicioLimite', this.limite.toString());
    sessionStorage.setItem('solicitudServicioPagina', this.paginaActual.toString());

    }
    this.limite = +sessionStorage.getItem('solicitudServicioLimite') ? +sessionStorage.getItem('solicitudServicioLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('solicitudServicioPagina') ? +sessionStorage.getItem('solicitudServicioPagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('solicitudServicioCriterios') ? sessionStorage.getItem('solicitudServicioCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('solicitudServicioOrdenamiento') ? sessionStorage.getItem('solicitudServicioOrdenamiento') : ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    ////console.log("urlSearch",urlSearch);
    this._spinner.start('solicitudserviciosocial1');
    this._servicioSocialService.getListaServicioSocial(
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
        this.setPaginacion(new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          this.limite
        ));
/*        if (assertionsEnabled()) { /!*console.log('paginasinfo', paginacionInfoJson);*!/ }*/
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new ServicioSocial(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this._spinner.stop('solicitudserviciosocial1');
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this._spinner.stop('solicitudserviciosocial1');
       /* if (assertionsEnabled()) {
          ////console.log({ paginacionInfo: this.registros, lista: this.registros });
        }*/
      }
    );

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
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      // //console.log('evento', evento);
      // //console.log('Page changed to: ' + evento.page);
      // //console.log('Number items per page: ' + evento.itemsPerPage);
      // //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.hasOwnProperty('paginacion') &&
      this.paginacion.hasOwnProperty('registrosPagina')) {
      result = true;
    }
    return result;
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
        this.limpiarVariablesSession();
        this.columnas.forEach((column) => {
            if (columna !== column) {
                if (column !== false) {
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
            // columna.sort = '';
        }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
/*    if (assertionsEnabled()) {
      // console.log('cambioProgramaDocenteFiltro');
    }*/
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion =
      this._catalogosService.getPromocion().
      getSelectPromocion(this.erroresConsultas, urlParameter);
    this.promocionSeleccionada = null;
  }

  promoSeleccionada(idPromocion: number): void {
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
    }else {
      this.promocionSeleccionada = null;
    }
    this.activarBotonBusqueda(1);
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idEstatus: number
  ): void {
    this.limpiarVariablesSession(); 
    if (idProgramaDocente) {
      this.criteriosCabezera =
        'idSolicitudServicio.idEstudiante.idPromocion.idProgramaDocente.id~' +
        idProgramaDocente + ':IGUAL;AND';
    }
    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera +
        ',idSolicitudServicio.idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL;AND';
    }
    if (idEstatus) {
      this.criteriosCabezera = this.criteriosCabezera +
        ',idSolicitudServicio.idEstatus.id~'
        + idEstatus + ':IGUAL;AND';
    }
    sessionStorage.setItem('solicitudServicioIdPromocion', idPromocion.toString());
    sessionStorage.setItem('solicitudServicioIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('solicitudServicioIdEstatus', idEstatus.toString());
   // console.log(sessionStorage);  
    this.onCambiosTabla();
  }

  mostrarBotonDetalles(): boolean {
    return (this.registroSeleccionado) ? true : false;
  }

  mostrarBotonInformacion(): boolean {
    if (this.registroSeleccionado &&
      (this.registroSeleccionado.solicitudServicioSocial.estatus.id == 1205 ||
      this.registroSeleccionado.solicitudServicioSocial.estatus.id == 1207)) {
      return true;
    }
    return false;
  }

  mostrarBotonLiberacion(): boolean {
    return (this.registroSeleccionado &&
    this.registroSeleccionado.solicitudServicioSocial.estatus.id == 1208);
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        // console.log(this.exportarExcelUrl);
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

  descargarConstancia(): void {
    this._spinner.start('solicitudserviciosocial2');
    this._servicioSocialService.getConstanciaServicioSocial(
      this.registroSeleccionado.id, this.erroresConsultas
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop('solicitudserviciosocial2');
      }
    );
  }
  ///// Inicio del modal Informacion del servicio Social ////
  ModalSolicitudServicioSocialTabs(): void {
    this.modalCrud.open();
    (this.tomorrow = new Date()).setDate(this.tomorrow.getDate());
      (this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
      (this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
      this.events = [
          { date: this.tomorrow, status: 'full' },
          { date: this.afterTomorrow, status: 'partially' }
    ];
    this.obtenerServicioSocilaElegido();
    this.limpiarArreglosInformacionSS();
    // this.obtenerDocumentosEvidencia();
    // this.obtenerDocumentosGenerales();
    this.inicializarObjeto();
  }

  cerrarModalInformacionServicioSocial(): void {
    this.modalCrud.close();
  }

  private inicializarFormularioServicioSocial(): void {
    this.formularioSolicitudServicioSocial = new FormGroup({
        proyecto: new FormControl('', Validators.compose([Validators.required,
            Validacion.letrasNumerosAcentoPuntoComaValidator])),
        fechaInicio: new FormControl('', Validators.required),
        fechaFin: new FormControl('', Validators.required),
        observaciones: new FormControl('', Validators.compose([Validators.required])),
        resoluciones: new FormControl('', Validators.compose([Validators.required,
            Validacion.letrasNumerosAcentoPuntoComaValidator])),
        actividades: new FormControl('', Validators.compose([Validators.required,
            Validacion.parrafos])),
        area: new FormControl('', Validators.compose([Validators.required,
            Validacion.letrasNumerosAcentoPuntoComaValidator])),
        tipoServicio: new FormControl('')
    });
  }

  private inicializarFormularioServicio(): void {
    this.formularioSolicitudServicio = new FormGroup({
      numeroHoras: new FormControl('', Validators.compose([Validators.required,
      Validacion.numerosValidator]))
    });
  }

  private inicializarFechas(): void {
        if (this.servicioSocialElegido) {
            if (this.servicioSocialElegido.fechaInicio) {
                this.dt = moment(this.servicioSocialElegido.fechaInicio).toDate();
                this.verificarFechas('fechaInicio', true);
            }
            if (this.servicioSocialElegido.fechaFin) {
                this.dtend = moment(this.servicioSocialElegido.fechaFin).toDate();
                this.verificarFechas('fechaFin', true);
            }
        }
  }

  verificarFechas(control: string, forzar = false): void {
        if (!this.status.isopen || forzar) {
            let valor;
            switch (control) {
                case 'fechaInicio': valor = moment(this.dt).format('DD/MM/YYYY'); break;
                case 'fechaFin': valor = moment(this.dtend).format('DD/MM/YYYY'); break;
            }
            this.rangoFechasValido = (this.dtend > this.dt) ? true : false;
            (<FormControl>this.formularioSolicitudServicioSocial.controls[control]).patchValue(valor);
        }
    }

  private obtenerServicioSocilaElegido(): void {
    if (this.registroSeleccionado) {
      this.servicioSocialElegido = this.registroSeleccionado;
    }
  }

  private cargarTablaDocumentos(): void {
    this.obtenerDocumentosEvidencia();
    this.obtenerDocumentosGenerales();
  }

  private obtenerDocumentosEvidencia(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterios = 'idServicio~' +
      this.servicioSocialElegido.solicitudServicioSocial.id +
        ':IGUAL';
    criterios += ',idTipoDocumento~' + 34 + ':IGUAL';
    urlParameter.set('criterios', criterios);
    this._documentoServicioSocialService
      .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
      .subscribe(
        response => {
          let dss;
          response.json().lista.forEach((item) => {
              dss = new DocumentoServicioSocial(item);
              this.registrosEvidencia.push(dss);
          });
            // console.log('registorsDocumentosServicio', this.registrosEvidencia);
        },
        // console.error,
        error => {
          console.log(error);
        },
        () => {}
      );
  }

  private obtenerDocumentosGenerales(): void {
    let urlParameter = new URLSearchParams();
    let criterios = 'idServicio~' + this.servicioSocialElegido.solicitudServicioSocial.id + ':IGUAL';
    urlParameter.set('criterios', criterios);
    this._documentoServicioSocialService
      .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
      .subscribe(
        response => {
            let dss;
            response.json().lista.forEach((item) => {
                dss = new DocumentoServicioSocial(item);
                this.registrosGenerales.push(dss);
            });
        },
        error => {
          console.log(error);
        },
        // console.error,
        () => {
        }
      );
  }

  public getDate(): string {
    return moment(this.dt).format('DD/MM/YYYY');
  }

  public getDateEnd(): string {
    return moment(this.dtend).format('DD/MM/YYYY');
  }

  private inicializarObjeto() {
    if (this.servicioSocialElegido) {
      let element = this.servicioSocialElegido;
      let jsonFormulario = JSON.stringify(
          this.formularioSolicitudServicioSocial.value, null, 2);
            // console.log('jsonFormualrio: ' + jsonFormulario);
      (<FormControl>this.formularioSolicitudServicio.controls['numeroHoras']).patchValue(
          element.solicitudServicioSocial.numeroHoras || 0);
      if (this.isActive()) {
          if (element.hasOwnProperty('area')) {
              if (element.area) {
                  this.getControl('area').patchValue(element.area);
              }
          }
          this.inicializarFechas();
          (<FormControl>this.formularioSolicitudServicioSocial.controls['proyecto']).
          patchValue(element.proyecto || '');
          (<FormControl>this.formularioSolicitudServicioSocial.controls['observaciones']).
          patchValue(element.observaciones || '');
          (<FormControl>this.formularioSolicitudServicioSocial.controls['resoluciones']).
          patchValue(element.resoluciones || '');
          (<FormControl>this.formularioSolicitudServicioSocial.controls['actividades']).
          patchValue(element.actividades || '');
      }
      // this.onCambiosTabla();
      this.cargarTablaDocumentos();
    }
  }

  actualizarNumeroHoras(): void {
    if (this.validarFormulario2()) {
        let jsonSolicitudFormulario =
            JSON.stringify(this.formularioSolicitudServicio.value, null, 2);
        this._spinner.start('actualizarHoras');
        this._solicitudServicioSocialService.putSolicitudServicioSocial(
            this.servicioSocialElegido.solicitudServicioSocial.id,
            jsonSolicitudFormulario,
            this.erroresGuardado
        ).subscribe(
            response => {},
            error => {
              this._spinner.stop('actualizarHoras');
            },
            () => {
              this._spinner.stop('actualizarHoras');
              this.onCambiosTabla();
              this.cerrarModalInformacionServicioSocial();
            }
        );
    }
  }

  validarSolicitudServicioSocial(): void {
    if (this.validarFormulario() && this.rangoFechasValido) {

      let jsonFormulario = JSON.stringify(this.formularioSolicitudServicioSocial.value, null,
          2);

      let objFormulario = JSON.parse(jsonFormulario);

      objFormulario.fechaInicio = moment(this.dt).format('DD/MM/YYYY hh:mma');
      // + " " + new moment("00:00", "hh:mm").format("hh:mma");
      objFormulario.fechaFin = moment(this.dtend).format('DD/MM/YYYY hh:mma');
      // + " " + new moment("00:00", "hh:mm").format("hh:mma");

      // console.log('fechaInicio ' + objFormulario.fechaInicio);
      // console.log('fechaFin ' + objFormulario.fechaFin);
      jsonFormulario = JSON.stringify(objFormulario, null, 2);
      this._spinner.start('actualizarInformacionSS');
      this._servicioSocialService.putServicioSocial(
          this.servicioSocialElegido.id,
          jsonFormulario,
          this.erroresGuardado
      ).subscribe(
          response => {
              // this.cerrarModal();
          },
          error => { this._spinner.stop('actualizarInformacionSS'); },
          () => {
            this._spinner.stop('actualizarInformacionSS');
            this.onCambiosTabla();
            this.cerrarModalInformacionServicioSocial();
          }
      );
    }

  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioSolicitudServicioSocial.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (campo == 'fechaFin' && this.rangoFechasValido == false &&
        this.validacionActiva == true) {
        return true;
    }
    if (!(<FormControl>this.formularioSolicitudServicioSocial.controls[campo]).valid &&
         this.validacionActiva) {
        return true;
    }
    return false;
  }

  errorMessage(control: FormControl, campo?: string): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
        for (let errorType of Object.keys(control.errors)) {
            if (control.hasError(errorType)) {
                if (errorType === 'pattern') {
                    if (campo === 'pais') {
                        resultado += this.mensajeErrors[errorType + '_' + campo];
                    } else {
                        resultado += this.mensajeErrors[errorType];
                    }
                } else {
                    resultado += this.mensajeErrors[errorType];
                }

            }
        }
    }
    return resultado;
  }

  validarFormulario(): boolean {
    this.rangoFechasValido = (this.dtend > this.dt) ? true : false;
    if (this.formularioSolicitudServicioSocial.valid) {
            // this.validacionActiva = false;
        return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarFormulario2(): boolean {
    this.rangoFechasValido = (this.dtend > this.dt) ? true : false;
    if (this.formularioSolicitudServicio.valid) {
        this.validacionActiva2 = false;
        return true;
    }
    this.validacionActiva2 = true;
    return false;
  }

  getControl2(campo: string): FormControl {
    return (<FormControl>this.formularioSolicitudServicio.controls[campo]);
  }

  getControlErrors2(campo: string): boolean {
    if (!(<FormControl>this.formularioSolicitudServicio.controls[campo]).valid &&
        this.validacionActiva2) {
        return true;
    }
    return false;
  }

  errorMessage2(control: FormControl, campo?: string): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
        for (let errorType of Object.keys(control.errors)) {
            if (control.hasError(errorType)) {
                if (errorType === 'pattern') {
                    if (campo === 'pais') {
                        resultado += this.mensajeErrors[errorType + '_' + campo];
                    } else {
                         resultado += this.mensajeErrors[errorType];
                    }
                } else {
                    resultado += this.mensajeErrors[errorType];
                }
            }
        }
    }
    return resultado;
  }

  canShow(): boolean {
    if (this.servicioSocialElegido) {
        if (this.servicioSocialElegido.solicitudServicioSocial) {
            let quantity = parseInt(this.servicioSocialElegido.solicitudServicioSocial.numeroHoras);
            if (this.registrosEvidencia) {
                if (this.registrosEvidencia.length === 0) {
                    if (quantity === 0) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
  }

  showButtoms(): boolean {
    if (this.servicioSocialElegido) {
         if (this.servicioSocialElegido.getStrEstatusSolicitud() === 'Pendiente') {
            return true;
        }
    }
    return false;
  }

  isActive(): boolean {
    if (this.servicioSocialElegido) {
        if (this.servicioSocialElegido.getStrEstatusSolicitud() === 'Activa') {
            return true;
        }
    }
    return false;
  }

  rowSeleccionadoModalInformacion(registro): boolean {
    return (this.registroSeleccionadoInformacionSS === registro);
  }

  rowSeleccionModalInformacion(registro): void {
    if (this.registroSeleccionadoInformacionSS !== registro) {
        this.registroSeleccionadoInformacionSS = registro;
        this.botonValido = true;
    } else {
        this.registroSeleccionadoInformacionSS = null;
        this.botonValido = false;
    }
  }

  private descargarArchivo(): void {
    if (this.registroSeleccionadoInformacionSS) {
            let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionadoInformacionSS.archivo.id + '}';
            this._spinner.start('descargar');
            this.archivoService
                .generarTicket(jsonArchivo, this.erroresConsultas)
                .subscribe(
                data => {
                    let json = data.json();
                    let url =
                        ConfigService.getUrlBaseAPI() +
                        '/api/v1/archivovisualizacion/' +
                        this.registroSeleccionadoInformacionSS.archivo.id +
                        '?ticket=' +
                        json.ticket;
                    window.open(url);
                },
                error => {
                    // console.log('Error downloading the file.');
                    this._spinner.stop('descargar');
                },
                () => {
                    // console.info('OK');
                    this._spinner.stop('descargar');
                }
                );
        }
  }

  private limpiarArreglosInformacionSS(): void {
    this.registrosEvidencia = [];
    this.registrosGenerales = [];
  }
  public todayEnd(): void { this.dtend = new Date(); }


    // todo: implement custom class cases
  public getDayClass(date: any, mode: string): string {
        if (mode === 'day') {
            let dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (let i = 0; i < this.events.length; i++) {
                let currentDay = new Date(this.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return this.events[i].status;
                }
            }
        }

        return '';
  }

  public disabled(date: Date, mode: string): boolean { return (mode === 'day' &&
        (date.getDay() === 0 || date.getDay() === 6)); }
  public open(): void { this.opened = !this.opened; }
  public clear(): void { this.dt = void 0; this.dtend = void 0; }
  public toggleMin(): void {
        this.dt = this.tomorrow;
        this.dtend = this.afterTomorrow;
  }

  getContextoPadre(): any {
    return this;
  }

  esDetalle(): boolean {
        return false;
    }


  ////// picker /////
  // DROPDOWN REQUERIDO PARA EL PICKER///
  public toggled(open: boolean): void { /*console.log('Dropdown is now: ', open);*/ }
  public toggleDropdown($event: MouseEvent): void {
      $event.preventDefault();
      $event.stopPropagation();
      this.status.isopen = !this.status.isopen;
  }
  //// Fin del modal Informacion del servicio social ///////

  // Incio del modal detalle del servicio socila/////////
  abrirModalDetalleServicioSocial(): void {
    if (this.registroSeleccionado) {
      this.limpiarArreglosInformacionSS();
      this.servicioSocialElegido = this.registroSeleccionado;
      this.modalDetalleServicioSocial.open('lg');
      this.cargarTablaDocumentos();
      this.inicializarObjetoDetalleSS();
    }
  }

  inicializarObjetoDetalleSS(): void {
    if (this.servicioSocialElegido) {
      // this.element = this.context.servicioSocial;
      if (this.servicioSocialElegido.solicitudServicioSocial.estatus.valor === 'Activa' ||
      this.servicioSocialElegido.solicitudServicioSocial.estatus.id == 1208) {
          this.isActiveDetalleSS = true;
      }
    }
  }

  cerrarModalDetalleServicioSocial(): void {
    this.modalDetalleServicioSocial.close();
    this.limpiarArreglosInformacionSS();
    this.servicioSocialElegido = undefined;
    this.isActiveDetalleSS = false;
  }
  /// Fin del modal detalle del servicio social ///////

  ///////////////////////////////////////////////7////
  //////INICIO MODAL CONFIRMACION SERVICIO SOCIAL////

  private modalConfirmarSolicitudServicioSocial(): void {
    if (this.validarFormulario2()) {
      let jsonFormularioNumero = JSON.stringify(this.formularioSolicitudServicio.value, null,
                2);
      let objFormularioNumero = JSON.parse(jsonFormularioNumero);

      this.numeroHoras = objFormularioNumero.numeroHoras;

      this.modalConfirmacionServicioSocial.open();
    }
  }

  private inicializarFormularioActivarSolicitud(): void {
    this.formularioActivarSolicitud = new FormGroup({
      observaciones: new FormControl('', Validators.required)
    });
  }

  private getControlValidarSolicitud(campo: string): FormControl {
        return (<FormControl>this.formularioActivarSolicitud.controls[campo]);
  }

  private getControlErrorsValidarSolicitud(campo: string): boolean {
        if (!(<FormControl>this.
                formularioActivarSolicitud.controls[campo]).valid
            && this.validacionActivaValidarSoliciutd) {
            return true;
        }
        return false;
  }

  private errorMessageValidarSolicitud(control: FormControl, campo?: string): string {
        let resultado = '';
        if (control.errors !== undefined && control.errors !== null) {
            for (let errorType of Object.keys(control.errors)) {
                if (control.hasError(errorType)) {
                    if (errorType === 'pattern') {
                        if (campo === 'pais') {
                            resultado += this.mensajeErrors[errorType + '_' + campo];
                        } else {
                            resultado += this.mensajeErrors[errorType];
                        }
                    } else {
                        resultado += this.mensajeErrors[errorType];
                    }

                }
            }
        }
        return resultado;
  }

  private validarFormularioValidarSolicitud(): boolean {
        if (this.formularioActivarSolicitud.valid) {
            this.validacionActivaValidarSoliciutd = false;
            return true;
        }
        this.validacionActivaValidarSoliciutd = true;
        return false;
  }

  private activarSolicitud(): void {
        if (this.validarFormularioValidarSolicitud()) {
            let objFormulario = {
                idEstatus: 0,
                numeroHoras: 0
            };

            objFormulario.idEstatus = 1207;
            // objFormulario.idEstatus=1205; //pendiente
            objFormulario.numeroHoras = this.numeroHoras;

            // console.log("jsonFormulario" , this.context.idServicioSocial.solicitudServicioSocial.id);

            let jsonFormulario = JSON.stringify(objFormulario, null, 2);

            this._solicitudServicioSocialService.putSolicitudServicioSocial(
                this.registroSeleccionado.solicitudServicioSocial.id,
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
                response => {
                    let jsonFormulario = JSON.stringify(this.formularioActivarSolicitud.value, null, 2);
                    let objFormulario = JSON.parse(jsonFormulario);
                    jsonFormulario = JSON.stringify(objFormulario, null, 2);
                    this._servicioSocialService.putServicioSocial(
                        this.registroSeleccionado.id,
                        jsonFormulario,
                        this.erroresGuardado
                    ).subscribe(
                        response => {
                            this._servicioSocialService.getEntidadServicioSocial(
                                this.registroSeleccionado.id,
                                this.erroresGuardado
                            ).subscribe(
                                response => {
                                    let entidadServicioSocial = new ServicioSocial(response.json());
                                    this.enviarCorreo(entidadServicioSocial);
                                }
                            );
                        },
                        console.error,
                        () => {
                            this.inicializarObjeto();
                            this.onCambiosTabla();
                            this.cerrarModalInformacionServicioSocial();
                            this.cerrarModalConfirmacionSolicitud();
                        }
                    );
                },
                console.error,
                () => {
                    // this.context.padre.inicializarObjeto();
                    // this.context.padre.context.padre.onCambiosTabla();
                    // this.context.padre.cerrarModal();
                    this.cerrarModalConfirmacionSolicitud();
                }
            );
        }
  }

  private enviarCorreo(entidadServicioSocial: ServicioSocial): void {
        let formularioCorreo: FormGroup;

        formularioCorreo = new FormGroup({
            destinatario: new FormControl(entidadServicioSocial.solicitudServicioSocial
            .estudiante.usuario.email),
            entidad: new FormControl({serviciosSociales: entidadServicioSocial.id,
                usuarios: this.usuarioLogueado.id }),
            idPlantillaCorreo: new FormControl('29')
        });
        let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
        this._enviarCorreo
            .postCorreoElectronico(
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            response => {},
            error => {
              console.error(error);
            },
            () => {}
        );
  }

  private cerrarModalConfirmacionSolicitud(): void {
    this.validacionActivaValidarSoliciutd = false;
    this.numeroHoras = undefined;
    this.inicializarFormularioActivarSolicitud();
    this.modalConfirmacionServicioSocial.close();
  }
  ///////////////////////////////////////////////7////
  //////FIN MODAL CONFIRMACION SERVICIO SOCIAL///////
  ///////////////////////////////////////////////////

  //////////////////////////////////////////////////////
  //////INICIO MODAL RECHAZAR SERVICIO SOCIAL//////////
  /////////////////////////////////////////////////////
  private modalRechazarSolicitudServicioSocial(): void {
    if (this.validarFormulario2()) {
      let jsonFormularioNumero = JSON.stringify(this.formularioSolicitudServicio.value, null,
                2);
      let objFormularioNumero = JSON.parse(jsonFormularioNumero);
      this.numeroHorasRechazarSolicitud = objFormularioNumero.numeroHoras;
      this.modalrechazarServicioSocial.open();
    }
  }

  private inicializarFormularioRechazarSolicitud(): void {
    this.formularioRechazarSolicitud = new FormGroup({
            observaciones: new FormControl('', Validators.required)
    });
  }

  private getControlRechazarSolicitud(campo: string): FormControl {
        return (<FormControl>this.formularioRechazarSolicitud.controls[campo]);
  }

  private getControlErrorsRechazarSolicitud(campo: string): boolean {
        if (!(<FormControl>this.formularioRechazarSolicitud.controls[campo]).valid 
          && this.validacionActivaRechazarSoliciutd) {
            return true;
        }
        return false;
  }

  private errorMessageRechazarSolicitud(control: FormControl, campo?: string): string {
        let resultado = '';
        if (control.errors !== undefined && control.errors !== null) {
            for (let errorType of Object.keys(control.errors)) {
                if (control.hasError(errorType)) {
                    if (errorType === "pattern") {
                        if (campo === "pais") {
                            resultado += this.mensajeErrors[errorType + "_" + campo];
                        } else {
                            resultado += this.mensajeErrors[errorType];
                        }
                    } else {
                        resultado += this.mensajeErrors[errorType];
                    }

                }
            }
        }
        return resultado;
  }

  validarFormularioRecharSolicitud(): boolean {
        if (this.formularioRechazarSolicitud.valid) {
            this.validacionActivaRechazarSoliciutd = false;
            return true;
        }
        this.validacionActivaRechazarSoliciutd = true;
        return false;
  }

  private rechazarSolicitud(): void {
        if (this.validarFormularioRecharSolicitud()) {
            let objFormulario = {
                idEstatus: 0,
                numeroHoras: 0
            };

            objFormulario.idEstatus = 1206;//denegada
            // objFormulario.idEstatus=1205; //pendiente
            objFormulario.numeroHoras = this.numeroHorasRechazarSolicitud;

            let jsonFormulario = JSON.stringify(objFormulario, null, 2);
            // console.log(jsonFormulario);
            this._solicitudServicioSocialService.putSolicitudServicioSocial(
                this.registroSeleccionado.solicitudServicioSocial.id,
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
                response => {

                    let jsonFormulario = JSON.stringify(this.formularioRechazarSolicitud.value, null, 2);
                    let objFormulario = JSON.parse(jsonFormulario);
                    jsonFormulario = JSON.stringify(objFormulario, null, 2);
                    this._servicioSocialService.putServicioSocial(
                        this.registroSeleccionado.id,
                        jsonFormulario,
                        this.erroresGuardado
                    ).subscribe(
                        response => {
                            this._servicioSocialService.getEntidadServicioSocial(
                                this.registroSeleccionado.id,
                                this.erroresGuardado
                            ).subscribe(
                                response => {
                                    let entidadServicioSocial = new ServicioSocial(response.json());

                                    let formularioCorreo: FormGroup;
                                    formularioCorreo = new FormGroup({
                                        destinatario: new FormControl(entidadServicioSocial.solicitudServicioSocial
                                            .estudiante.usuario.email),
                                        asunto: new FormControl('Solicitud de servicio social rechazada'),
                                        entidad: new FormControl({serviciosSociales: entidadServicioSocial.id,
                                            usuarios: this.usuarioLogueado.id }),
                                        comentarios: new FormControl(this.formularioRechazarSolicitud.value.comentarios),
                                        idPlantillaCorreo: new FormControl('30')
                                    });
                                    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
                                    this._enviarCorreo
                                        .postCorreoElectronico(
                                            jsonFormulario,
                                            this.erroresGuardado
                                        ).subscribe(
                                        response => {},
                                        error => {
                                          console.error(error);
                                        },
                                        () => { }
                                    );
                                }
                            );
                        },
                        console.error,
                        () => {
                            this.inicializarObjeto();
                            this.onCambiosTabla();
                            this.cerrarModalInformacionServicioSocial();
                            this.cerrarModalRechazarSolicitudServicioSocial();
                        }
                    );

                },
                console.error,
                () => {
                    // this.context.padre.inicializarObjeto();
                    // this.context.padre.context.padre.onCambiosTabla();
                    // this.context.padre.cerrarModal();
                    this.cerrarModalRechazarSolicitudServicioSocial();
                }
            );
        }
  }

  private cerrarModalRechazarSolicitudServicioSocial(): void {
    this.validacionActivaRechazarSoliciutd = false;
    this.numeroHorasRechazarSolicitud = undefined;
    this.inicializarFormularioRechazarSolicitud();
    this.modalrechazarServicioSocial.close();
  }
  //////////////////////////////////////////////////////
  ////// FIN MODAL RECHAZAR SERVICIO SOCIAL////////////
  /////////////////////////////////////////////////////
  private prepareServices(): void {
    this._servicioSocialService = this._catalogosService.getServicioSocialService();
    this._solicitudServicioSocialService =
      this._catalogosService.getSolicitudServicioSocialService();
      
      let urlSearchEstatus = new URLSearchParams();
      urlSearchEstatus.set('ordenamiento', 'valor:ASC');
      urlSearchEstatus.set('criterios', 'idCatalogo.id~1008:IGUAL');
      
    let urlSearch = new URLSearchParams();
    urlSearch.set('criterios', 'idNivelEstudios.id~1:IGUAL');
    this.opcionesSelectProgramaDocente =
      this._catalogosService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    this.catalogoEstatusService = this._catalogosService.getEstatusCatalogo();
  //  urlSearch.set('criterios', 'idCatalogo.id~1008:IGUAL');
    this.opcionesCatalogoEstatus = this.catalogoEstatusService.getSelectEstatusCatalogo(
      this.erroresConsultas, urlSearchEstatus);
    this.archivoService = this._catalogosService.getArchivos();
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('solicitudServicioCriterios');
    sessionStorage.removeItem('solicitudServicioOrdenamiento');
    sessionStorage.removeItem('solicitudServicioLimite');
    sessionStorage.removeItem('solicitudServicioPagina');
  }  

 
}
