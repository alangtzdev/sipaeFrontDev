import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {PagoEstudiante} from "../../services/entidades/pago-estudiante.model";
import {ProrrogaEstudiante} from "../../services/entidades/prorroga-estudiante.model";
import {PromocionPeriodoEscolar} from "../../services/entidades/promocion-periodo-escolar.model";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";
import {Promocion} from "../../services/entidades/promocion.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import * as moment from "moment";
import {Router} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {FormGroup, Form, Validators, FormControl} from "@angular/forms";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {Validacion} from '../../utils/Validacion';
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-colegiatura',
  templateUrl: './colegiatura.component.html',
  styleUrls: ['./colegiatura.component.css']
})
export class ColegiaturaComponent implements OnInit {

  @ViewChild('modalGenePro')
  modalGenePro: ModalComponent;
  @ViewChild('modalAgrePag')
  modalAgrePag: ModalComponent;
  @ViewChild('modalDetaPag')
  modalDetaPag: ModalComponent;
  @ViewChild('modalGeneCar')
  modalGeneCar: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  paginaActual: number = 1;
  botonValido: boolean = false;
  criteriosCabezera: string = '';
  detallePago: boolean = false;
  nuevaProrroga: boolean = false;
  mostrarAgregarPago: boolean = false;
  estatusPagado: boolean = true;

  paginacion: PaginacionInfo;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<PagoEstudiante> = [];
  columnas: Array<any> = [
    {titulo: 'Folio COLSAN', nombre: 'idFolioSolicitud', sort: false},
    {titulo: 'Nombre *', nombre: 'idEstudiante', sort: false},
    {titulo: 'Programa Docente', nombre: 'idProgramaDocente', sort: false},
    {titulo: 'Registro de pago', nombre: 'monto', sort: false},
    {titulo: 'Estado', nombre: 'idEstatus.valor'}
  ];
  registroSeleccionado: PagoEstudiante;
  catProgramaDocenteService;
  catPromocionesService;
  pagoColegiaturaService;
  prorrogaColegiaturaService;
  prorrogaEstudianteService;
  promocionPeriodoEscolarService;
  entidadProrrogaEstudiante: ProrrogaEstudiante;
  estadoBotonCartera: boolean = false;
  requierePagoProgramaDocente: boolean = false;
  idPromocionSeleccionado: number;

  fechaHoy: Date = new Date();

  public configuracion: any = {
    paginacion: true,
    filtrado: {textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido,idEstudiante.idDatosPersonales.nombre'}
  };

  // se declaran variables para consultas de base de datos
  estudianteservice;
  opcionSelectPeriodoEscolar: Array<PromocionPeriodoEscolar> = [];
  private erroresConsultas: Array<Object> = [];
  private opcionesProgramaDocente: Array<ProgramaDocente> = [];
  private opcionesPromocion: Array<Promocion> = [];

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              params: Router,
              private _catalogosService: CatalogosServices,
              public _spinner: SpinnerService,
              private router: Router) {
    this.prepareServices();
    this.formulario = new FormGroup({
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl(''),
      cantidadPendiente: new FormControl(''),
      cantidadLiquidada: new FormControl(''),
      idPagoEstudiante: new FormControl(''),
      fecha: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });
    this.formularioAP = new FormGroup({
      idForma: new FormControl(''),
      idTipo: new FormControl(''),
      monto: new FormControl(''), // Se coloca validacion temporal
      comentarios: new FormControl(''),
      idEstudiante: new FormControl(),
      idEstatus: new FormControl(),
      fecha: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });

    if (sessionStorage.getItem('colegiaturaIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('colegiaturaCriterios')) {
      this.onCambiosTabla();
    }
  }

  ngOnInit(): void {
    // this.onCambiosTabla();
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
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

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    this.detallePago = false;

    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';
    let criterios = '';
    if (!sessionStorage.getItem('colegiaturaCriterios')) {
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

    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    sessionStorage.setItem('colegiaturaCriterios', criterios);
    sessionStorage.setItem('colegiaturaOrdenamiento', ordenamiento);
    sessionStorage.setItem('colegiaturaLimite', this.limite.toString());
    sessionStorage.setItem('colegiaturaPagina', this.paginaActual.toString());
    }
    this.limite = +sessionStorage.getItem('colegiaturaLimite') ? +sessionStorage.getItem('colegiaturaLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('colegiaturaPagina') ? +sessionStorage.getItem('colegiaturaPagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('colegiaturaCriterios') ? sessionStorage.getItem('colegiaturaCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('colegiaturaOrdenamiento') ? sessionStorage.getItem('colegiaturaOrdenamiento') : ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    if (this.configuracion.filtrado.textoFiltro === '') {
      this._spinner.start("coleegiatura1");
    }

    this.estudianteservice.getListaPagoEstudiantePaginador(
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
          this.registros.push(new PagoEstudiante(item));
          let pagoEstudiante : PagoEstudiante;
          pagoEstudiante = new PagoEstudiante(item);
          if (pagoEstudiante.estatus.id === 3) {
            //console.log('estatus::' + pagoEstudiante.estatus.valor);
            this.cambiarEstatusProrrogaVencida(pagoEstudiante);
          }else {
            //console.log('estatus::' + pagoEstudiante.estatus.valor);
          }
        });
        this._spinner.stop("coleegiatura1");
        //this.onCambiosTabla();
        //console.log(this.registros);
        //this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        //this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("coleegiatura1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("coleegiatura1");
      }
    );
  }

  cambiarEstatusProrrogaVencida(pagoEstudiante: PagoEstudiante): void {

    //console.log('entra::' + pagoEstudiante.estudiante.id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idPagoEstudiante~' +
      pagoEstudiante.id + ':IGUAL');
    this.prorrogaEstudianteService.getListaProrrogaEstudianteRegistrado
    (this.erroresConsultas, urlParameter, null)
      .subscribe(
        response => {
          //console.log('entra a resultados lista' );

          let entidadProrrogaEstudianteTemporal: ProrrogaEstudiante;
          let listaEntidad = response.json();
          if (listaEntidad.lista.length  > 0) {
            entidadProrrogaEstudianteTemporal =
              new ProrrogaEstudiante(listaEntidad.lista[0]);
            let fechaFinProrroga =
               moment(entidadProrrogaEstudianteTemporal.fechaFin).
              format('DD/MM/YYYY');
            //console.log('Tiene prorroga::' + fechaFinProrroga);
            let fechaHoy =  moment(this.fechaHoy).format('DD/MM/YYYY');
            if (fechaHoy > fechaFinProrroga) {
              let cambioEstatusPagoEstudiante;
              cambioEstatusPagoEstudiante =
                {'id': pagoEstudiante.id, 'idEstatus': '4'};
              let jsonCcambioEstatusPago =
                JSON.stringify(cambioEstatusPagoEstudiante, null , 2);
              //console.log(jsonCcambioEstatusPago);
              this.pagoColegiaturaService
                .putPagoEstudiante(
                  pagoEstudiante.id,
                  jsonCcambioEstatusPago,
                  this.erroresConsultas
                );
              //  //console.log('La fecha es mayor');
            } else {
              //console.log('nada que cambiar');
            }
          } else {
            //console.log('No tiene prorroga:::' + listaEntidad.lista.length );
          }
        },
        error => {
/*          if (assertionsEnabled()) {
            console.error(error);
          }*/
        });
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  buscarCriteriosCabezera(
    idPromocion: number,
    idPeriodoEscolar: number,
    idProgramDocente: number
  ): void {
    this.limpiarVariablesSession();
    this.estadoBotonCartera = true;
    this.idPromocionSeleccionado = idPromocion;
    this.requierePagoProgramaDocente = false;
    if (idPromocion) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL';
    }

    if (idPeriodoEscolar) {
      this.criteriosCabezera += ',idPeriodo~'
        + idPeriodoEscolar + ':IGUAL';
    }
    //console.log(this.criteriosCabezera);
    this.validarGenerarCarteraProgramaDocente(idProgramDocente);
    sessionStorage.setItem('colegiaturaIdPromocion', idPromocion.toString());
    sessionStorage.setItem('colegiaturaIdProgramaDocente', idProgramDocente.toString());
    sessionStorage.setItem('colegiaturaIdPeriodoEscolar', idPeriodoEscolar.toString());
    this.onCambiosTabla();
  }


  rowSeleccionado(registro): boolean {
    //  this.entidadProrrogaEstudiante = null;
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
     sessionStorage.removeItem('colegiaturaLimite');
    if (this.registros.length > 0) {
      this.limite = Number(limite);
      sessionStorage.setItem('colegiaturaLimite', this.limite.toString());
      this.onCambiosTabla();
    }
  }

  rowSeleccion(registro: PagoEstudiante): void {
    this.detallePago = false;
    this.nuevaProrroga = false;
    this.estatusPagado = true;
    this.mostrarAgregarPago = false;
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;

      //console.log(this.registroSeleccionado.estatus.id);
      //console.log('entra aquí');
      if (this.registroSeleccionado.estatus.id === 1) {
        //console.log('Estatus pagado');
        this.detallePago = true;
      }else if (this.registroSeleccionado.estatus.id === 3 ||
        this.registroSeleccionado.estatus.id === 4) {
        //console.log(this.registroSeleccionado.estatus.valor);
        this.nuevaProrroga = true;
      }else if (this.registroSeleccionado.estatus.id === 2) {
        //console.log('Estatus pendiente');
        this.mostrarAgregarPago = true;
        this.nuevaProrroga = true;
      }
    } else {
      this.registroSeleccionado = null;
      this.detallePago = false;
      this.nuevaProrroga = false;
    }
  }

  mostarBotonDetalle(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id === 1 ) {
      return true;
    }else {
      return false;
    }
  }

  mostarBotonProrroga(): boolean {
    // No mostrar el boton de prorroga si el estatus es pagos o exento
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id !== 1 &&
      this.registroSeleccionado.estatus.id !== 1104 ) {
      return true;
    }else {
      return false;
    }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    this.estadoBotonCartera = false;
    //console.log('idProgramaDocente', idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.catPromocionesService = this._catalogosService.getPromocion();
    this.opcionesPromocion =
      this.catPromocionesService.getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  cambiarPagina(evento: any): void {
    sessionStorage.removeItem('colegiaturaPagina');
    this.paginaActual = evento.page;
    sessionStorage.setItem('colegiaturaPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  obtenerPeriodosEscolares(idPromocion: number): void {
    //console.log('este es el id de promocion' + idPromocion);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios',
      'idPromocion~' + idPromocion +
      ':IGUAL');
    this.opcionSelectPeriodoEscolar =
      this.promocionPeriodoEscolarService.
      getSelectPromocionPeriodoEscolarParametros(
        this.erroresConsultas, urlParameter);

  }

  validarGenerarCarteraProgramaDocente(idProgramaDocente: number): void {
    this.requierePagoProgramaDocente = false;
    let programaDocente: ProgramaDocente;
    this.catProgramaDocenteService.getEntidadProgramaDocente(
      idProgramaDocente,
      this.erroresConsultas
    ).subscribe(
      response => {
        //console.log(response.json());
        programaDocente = new ProgramaDocente(response.json());
        //console.log(programaDocente);
        this.requierePagoProgramaDocente = programaDocente.requierePago;

        //console.log(this.requierePagoProgramaDocente);
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
        }*/
      }
    );
  }


  private prepareServices(): void {
    this.estudianteservice = this._catalogosService.getPagoEstudiante();
    //console.log(this.estudianteservice);
    this.catProgramaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.opcionesProgramaDocente =
      this.catProgramaDocenteService.getSelectProgramaDocente(this.erroresConsultas);

    this.pagoColegiaturaService = this._catalogosService.getPagoEstudiante();
    this.prorrogaColegiaturaService = this._catalogosService.getProrrogaEstudiante();
    this.prorrogaEstudianteService = this._catalogosService.getProrrogaEstudiante();
    this.promocionPeriodoEscolarService =
      this._catalogosService.getPromocionPeriodoEscolarService();

  }


/////////////////////////////////////MODAL GENERAR PRORROGA///////////////////////////********

  edicionFormulario: boolean = false;
  formulario: FormGroup;
  entidadPagoEstudiante: PagoEstudiante;
  //entidadProrrogaEstudiante: ProrrogaEstudiante;
  estudianteService;
  // se declaran variables para consultas de base de datos
  ////// picker ///
  public dt: Date;
  public minDate: Date;
  dt2: Date;
  contador: number = 0;
  validacionActiva: boolean = false;
  registrosProrrogas: Array<ProrrogaEstudiante> = [];

  private alertas: Array<Object> = [];
  private erroresConsultasGP: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private fechaInvalida: boolean = false;

  mensajeErrorsFecha: Array<Object> = [];

  constructorGP(): void {
    this.edicionFormulario = false;

    // se declaran variables para consultas de base de datos
    ////// picker ///
    this.dt = new Date();
    this.minDate = new Date();
    this.dt2 = new Date();
    this.contador = 0;
    this.validacionActiva = false;
    this.registrosProrrogas = [];

    this.alertas = [];
    this.erroresConsultasGP = [];
    this.erroresGuardado = [];
    this.fechaInvalida = false;
    this.mensajeErrorsFecha = [
        {mensaje: 'La Fecha Fin no puede ser menor que la Fecha Inicio, verificar.',
        traduccion: 'La Fecha Fin no puede ser menor que la Fecha Inicio.'}];

    this.prepareServicesGP();
    moment.locale('es');
    this.cargarListaProrrogasAnteriores();

    this.formulario = new FormGroup({
      fechaInicio: new FormControl('', Validators.required),
      fechaFin: new FormControl('', Validators.required),
      cantidadPendiente: new FormControl('', Validators.
      compose([Validators.required,
        Validacion.cantidadDinero])),
      cantidadLiquidada: new FormControl('', Validators.
      compose([Validators.required,
        Validacion.cantidadDinero])),
      idPagoEstudiante: new FormControl(this.registroSeleccionado.id),
      fecha: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });

    let estudiante: Estudiante;
    this.pagoColegiaturaService.getEntidadPagoEstudiante(
        this.registroSeleccionado.id,
        this.erroresConsultasGP
    ).subscribe(
        response => {
          this.entidadPagoEstudiante = new PagoEstudiante(
              response.json());
        },
        error => {

        }
    );
    this.modalGenerarProrroga();
  }

  getNombreCompleto(): void { // PendientePendiente
    let nombre = this.getControl('idEstudiante.datoPersonal.nombre');
  }

  elegirFechaInicio(): any {
    this.contador = 0;
  }
  elegirFechaFin(): any {
    this.contador = 1;
  }
  ////// picker ///
  getFechaInicio(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaInicio'])
          .patchValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaFin(): string {
    if (this.dt2) {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
       (<FormControl>this.formulario.controls['fechaFin'])
       .setValue(fechaConFormato + ' 10:30am');
       return fechaConFormato;
    } else {
       return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  validadorFechas(): boolean {
    let fechaInicio = moment(this.dt).format('YYYY/MM/DD'); //'DD/MM/YYYY'
    let fechaFin = moment(this.dt2).format('YYYY/MM/DD');
    if (fechaInicio < fechaFin) {
      return true;
    }else if (fechaInicio === fechaFin) {
      this.mensajeErrorsFecha = [{mensaje: 'Las fecha inicio y fecha fin no pueden ser iguales.',
        traduccion: 'Las fecha inicio y fecha fin no pueden ser iguales.'}];
      return false;
    } else {
      this.mensajeErrorsFecha = [{mensaje: 'La fecha inicio no puede ser mayor que la fecha fin.',
        traduccion: 'La fecha fin no puede ser mayor que la fecha inicio.'}];
      return false;
    }
  }

  enviarFormulario(): void {
    this.fechaInvalida = false;
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      if (this.validadorFechas()) {
        /* if (this.context.componenteLista.entidadProrrogaEstudiante === null) {*/
        this._spinner.start('eviarForm');
        this.prorrogaEstudianteService
            .postProrrogaEstudiante(
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            response => {
              this.entidadProrrogaEstudiante =  new ProrrogaEstudiante(
                  response.json());
              //console.log(response.json());
              //console.log(this.entidadProrrogaEstudiante);

              if (response.json().id) {
                this.prorrogaEstudianteService
                    .getEntidadProrrogaEstudiante(
                        response.json().id,
                        this.erroresGuardado
                    ).subscribe(
                    response => {
                      this.entidadProrrogaEstudiante =
                          new ProrrogaEstudiante(response.json());
                      //console.log('Entra a post lista');
                      if (this.entidadProrrogaEstudiante) {
                        this.guardarEstatusPagoEstudiante();
                      }
                    },
                    error => {
                      this._spinner.stop('eviarForm');
                    },
                    () => {
                      this._spinner.stop('eviarForm');
                    }
                );
              }
            }
        );
      }
      else {
        this.fechaInvalida = true;
      }
    } else {
      //alert('error en el formulario');
    }
  }

  guardarEstatusPagoEstudiante(): void {
    let estatus;
    let fecha = this.getControl('fecha').value;
    if (this.entidadProrrogaEstudiante.cantidadPendiente === '0') {
      estatus = {'idEstatus': '1', 'fecha': fecha };
    } else {
      estatus = {'idEstatus': '3', 'fecha': fecha};
    }
    let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
    //console.log(jsonCambiarEstatus);
    this.pagoColegiaturaService
        .putPagoEstudiante(
            this.entidadPagoEstudiante.id,
            jsonCambiarEstatus,
            this.erroresGuardado
        ).subscribe(
        response => {
          this.onCambiosTabla();
          this.cerrarModalGenerarProrroga();
        }
    );
  }

  cargarListaProrrogasAnteriores(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idPagoEstudiante~' +
        this.registroSeleccionado.id + ':IGUAL');
    this.prorrogaEstudianteService.getListaProrrogaEstudianteRegistrado
    (this.erroresConsultas, urlParameter, null)
        .subscribe(
            response => {
              response.json().lista.forEach((item) => {
                    //console.log(item);
                    this.registrosProrrogas.push(new ProrrogaEstudiante(item));
                  }, error => {

                  },
                  () => {
                    //console.log('prorrogas anteriores: ' + this.registrosProrrogas);
                  });
            });
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      let cantidadPendiente = this.getControl('cantidadPendiente').value;
      let cantidadLiquidada = this.getControl('cantidadLiquidada').value;
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

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).
            valid && this.validacionActiva) {
     return true;
    }
    return false;
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  private prepareServicesGP(): void {
    //this.catalogoTipoPago = this.catalogosService.getCatTipoPago();

  }

  modalGenerarProrroga(): void {
    this.modalGenePro.open('lg');
  }

  cerrarModalGenerarProrroga(): void{
    this.fechaInvalida = false;
    this.registroSeleccionado = null;
    this.modalGenePro.close();
  }

  ///////////////////////// MODAL AGREGAR PAGO //////////////////////////**************

  formularioAP: FormGroup;
  idEstatusCatalogo: number;
  // se declaran variables para consultas de base de datos
  entidadEstudiante: Estudiante;
  estatusCatalogoService;
  pagoEstudianteService;
  catalogoTipoPago;
  catalogoFormaPago;
  catalogoServices;
  validacionActivaAP: boolean = false;
  mostrarMatricula: boolean = false;
  private opcionesCatalogoTipoPago: Array<ItemSelects>;
  private opcionesCatalogoFormaPago: Array<ItemSelects>;

  constructorAP(): void {
    let idEstatusCatalogoAux: number;
    this.idEstatusCatalogo = idEstatusCatalogoAux;
    this.validacionActivaAP = false;
    this.mostrarMatricula = false;
    this.erroresConsultas = [];
    this.erroresGuardado = [];
    this.opcionesCatalogoTipoPago = [];
    this.opcionesCatalogoFormaPago = [];

    this.prepareServicesAP();
    moment.locale('es');
    this.formularioAP = new FormGroup({
      idForma: new FormControl('', Validators.required),
      idTipo: new FormControl('', Validators.required),
      monto: new FormControl('', Validators.
      compose([Validators.required, Validacion.numerosValidator])), // Se coloca validacion temporal
      comentarios: new FormControl(''),
      idEstudiante: new FormControl(),
      idEstatus: new FormControl(),
      fecha: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });

    this.estudianteservice
        .getEntidadPagoEstudiante(
            this.registroSeleccionado.id,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadPagoEstudiante
              = new PagoEstudiante(response.json());
        },
        error => {

        },
        () => {

          //console.log(this.entidadPagoEstudiante);
          (<FormControl>this.formularioAP.controls['idEstudiante'])
            .setValue(this.entidadPagoEstudiante.estudiante.id);
          (<FormControl>this.formularioAP.controls['idEstatus'])
             .setValue(1);

          if(this.entidadPagoEstudiante.estudiante.numPeriodoActual !== 1){
            this.mostrarMatricula = true;
          }
        }
    );
    this.modalAgregarPago();
  }

  enviarFormularioAP(): void {
    if (this.validarFormularioAP()) {
      this._spinner.start('validarform');
      let jsonFormulario = JSON.stringify(this.formularioAP.value, null, 2);
      //console.log(jsonFormulario);
      //console.log(this.context.idPagoEstudiante);

      this.pagoColegiaturaService
          .putPagoEstudiante(
              this.registroSeleccionado.id,
              jsonFormulario,
              this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this._spinner.stop('validarform');
            this.onCambiosTabla();
            this.cerrarModalAgregarPago();
          }
      );

    } else {
      //alert('error en el formulario');
    }
  }

  getControlAP(campo: string): FormControl {
    return (<FormControl>this.formularioAP.controls[campo]);
  }

  validarFormularioAP(): boolean {
    if (this.formularioAP.valid) {
      this.validacionActivaAP = false;
      return true;
    }
    this.validacionActivaAP = true;
    return false;
  }


  private getControlErrorsAP(campo: string): boolean {
    if (!(<FormControl>this.formularioAP.controls[campo]).
           valid && this.validacionActivaAP) {
    return true;
    }
    return false;
  }

  private prepareServicesAP(): void {
    this.catalogoTipoPago = this._catalogosService.getCatTipoPago();
    this.opcionesCatalogoTipoPago =
        this.catalogoTipoPago.getSelectTipoPago(this.erroresConsultas);
    this.catalogoFormaPago = this._catalogosService.getFormaPago();
    this.opcionesCatalogoFormaPago =
        this.catalogoFormaPago.getSelectFormaPago(this.erroresConsultas);
  }

  modalAgregarPago(): void {
    this.modalAgrePag.open('lg');
  }

  cerrarModalAgregarPago(): void{
    this.modalAgrePag.close();
  }

  ////////////////////////////////////// MODAL DETALE PAGO ////////////////////////********

  //entidadPagoEstudiante;
  private erroresConsultasDP: Array<ErrorCatalogo> = [];

  constructorDP(): void {
    let erroresConsultasDPAux: Array<ErrorCatalogo> = [];
    this.erroresConsultasDP = erroresConsultasDPAux;

    this.estudianteservice
        .getEntidadPagoEstudiante(
            this.registroSeleccionado.id,
            this.erroresConsultasDP
        ).subscribe(
        response => {
          this.entidadPagoEstudiante
              = new PagoEstudiante(response.json());
        },
        error => {

        },
        () => {

        }
    );
    this.modalDetallePago();
  }

  modalDetallePago(): void {
    this.modalDetaPag.open();
  }

  cerrarModalDetallePago(): void{
    this.modalDetaPag.close();
  }

  ////////////////////////////// MODAL GENERAR CARTERA DE PAGOS ///////////////**********

  progDocente;
  private erroresConsultasGCP: Array<Object> = [];
  private idPromocionGCP: number;

  private formularioGenPa = new FormGroup({
  checkedGP: new FormControl(false)
});

  constructorGCP(idPromocion): void {
    this.idPromocionGCP = idPromocion;
    this.erroresConsultasGCP = [];
  this.formularioGenPa = new FormGroup({
      checkedGP: new FormControl(false)
    });
    this.modalGenerarCarteraPagos();
  }

  generarCartera(): any {
    this.estadoBotonCartera = false;
    let formularioCartera = new FormGroup({
      idPromocion: new FormControl(this.idPromocionGCP)
    });
    this.pagoColegiaturaService.postGenerarCartera(
        JSON.stringify(formularioCartera.value, null, 2),
        this.erroresConsultasGCP
    ).subscribe(
        response => {
          //console.log(response.json());
        },
        error => {

        },
        () => {

          this.onCambiosTabla();
          this.cerrarModalGenerarCarteraPagos();

        });
  }

  modalGenerarCarteraPagos(): void {
    this.modalGeneCar.open();
  }

  cerrarModalGenerarCarteraPagos(): void{
    this.modalGeneCar.close();
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('colegiaturaCriterios');
    sessionStorage.removeItem('colegiaturaOrdenamiento');
    sessionStorage.removeItem('colegiaturaLimite');
    sessionStorage.removeItem('colegiaturaPagina');
  }

}
