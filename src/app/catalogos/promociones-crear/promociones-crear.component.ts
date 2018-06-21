import { Component, OnInit } from '@angular/core';
import {PromocionPeriodoEscolar} from "../../services/entidades/promocion-periodo-escolar.model";
import {PromocionLgac} from "../../services/entidades/promocion-lgac.model";
import {Promocion} from "../../services/entidades/promocion.model";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import * as moment from "moment";
import {FormControl, Validators, FormGroup} from "@angular/forms";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Router, Route, ActivatedRoute} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import {Validacion} from "../../utils/Validacion";
import {ProgramaDocenteServices} from "../../services/entidades/programa-docente.service";

@Component({
  selector: 'app-promociones-crear',
  templateUrl: './promociones-crear.component.html',
  styleUrls: ['./promociones-crear.component.css']
})
export class PromocionesCrearComponent implements OnInit {
  numeroRegistroLGAC: number;
  numeroRegistroPeriodoEscolar: number;

  registrosLGAC: Array<PromocionLgac>;
  registrosPeriodoEscolar: Array<PromocionPeriodoEscolar>;
  paginaActual: number = 1;
  estadoBoton: boolean;
  estadoBotonPeriodo: boolean = false;
  limite: number = 10;
  registrosPromociones: Array<Promocion> = [];
  registroSeleccionadoPromPeriodoEscolar: PromocionPeriodoEscolar;
  registrosPromPeriodoEscolar: Array<PromocionPeriodoEscolar> = [];
  registroSeleccionadoPromLgac: PromocionLgac;
  registroPromocionLgac: Array<PromocionLgac> = [];
  edicionFormulario: boolean = false;
  formularioPromociones: FormGroup;
  formularioPeriodo: FormGroup;
  formularioLGAC: FormGroup;
  programaDocenteInstancia: ProgramaDocente;
  promocionInstancia: Promocion;
  idProgramaDocente: number;
  promocionLgacService;
  promocionPeriodoEscolarService;
  idCatalogoPromocion: number;
  consecutivo: number;
  cons :string;
  // se declaran variables para consultas de base de datos
  estatusCatalogoService;
  promocionesService;
  catalogoLgac;
  catalogoProgramaDocente;
  catalogoPeriodoEscolar;
  catalogoPlanEstudios;
  catalogoDocumentos;
  validacionActiva: boolean = false;
  mostrarLgac: boolean = false;
  banderaBtnEliminar: boolean = false;
  columnas: Array<any> = [
    { titulo: 'Línea generadora y/o aplicación del conocimiento'}
  ];

  columnasT2: Array<any> = [
    {titulo: 'No. Semestre'},
    {titulo: 'Período escolar'},
    {titulo: 'Período inicio/fin'}
  ];

  mensajeErrors: Array<ErrorCatalogo>;
  fechaInvalida: boolean = false;

  private opcionesEstatus: Array<ItemSelects> = [];
  private opcionesLgacs: Array<ItemSelects> = [];
  private opcionesProgramasDocente: Array<ItemSelects> = [];
  private opcionesPeriodosEscolar: Array<ItemSelects> = [];
  private opcionesPlanEstudios: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private entidadPromocion: Promocion;

  ////// picker ///
  public dt: Date = new Date();
  public dt2: Date = new Date(); // Para el 2da DatePicker
  public dt3: Date = new Date();
  public minDate: Date = void 0;
  private edicion : number;
  public events: any[];
  public tomorrow: Date;
  public afterTomorrow: Date;
  public dateDisabled: {date: Date, mode: string}[];
  public formats: string[] = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY',
    'shortDate'];
  public format: string = this.formats[0];
  public dateOptions: any = {
    formatYear: 'YY',
    startingDay: 1
  };
  private opened: boolean = false;
  private sub: any;


  getDate(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioPromociones.controls['planEstudiosInicio'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getDate2(): string { //Metodo para incorporar uun 2da Datepicker
    if (this.dt2) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      (<FormControl>this.formularioPromociones.controls['planEstudiosFin'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getDate3(): string { //Metodo para incorporar uun 2da Datepicker
    if (this.dt3) {
      let fechaConFormato = moment(this.dt3).format('DD/MM/YYYY');
      (<FormControl>this.formularioPromociones.controls['cohorte'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  constructor(private route: ActivatedRoute,
              private _spinner: SpinnerService,
              private _catalogosService: CatalogosServices,
              private router: Router
  ) {
    this.obtenerParams();
    (this.tomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
    (this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 2);
    (this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
    (this.dateDisabled = []);
    this.events = [
      {date: this.tomorrow, status: 'full'},
      {date: this.afterTomorrow, status: 'partially'}
    ];

    this.idCatalogoPromocion = Number();
    this.edicionFormulario = false;
    this.idProgramaDocente = Number();
    this.prepareServices();
    moment.locale('es');

    this.idCatalogoPromocion = this.edicion;

    this.formularioPeriodo = new FormGroup({
      idPromocion: new FormControl(this.idCatalogoPromocion),
      numSemestre: new FormControl('', Validators.required),
      idPeriodoEscolar: new FormControl('', Validators.required),
      inicio: new FormControl(''),
      fin: new FormControl('')
    });

    this.formularioPromociones = new FormGroup({
      abreviatura: new FormControl(),
      consecutivo: new FormControl(this.consecutivo?this.consecutivo:''),
      cohorte: new FormControl(''),
      idProgramaDocente: new FormControl('', Validators.required),
      idPlanEstudios: new FormControl('', Validators.required),
      planEstudiosInicio: new FormControl(''),
      planEstudiosFin: new FormControl(''),
      idPeriodoEscolarInicio: new FormControl(''),
      idPeriodoEscolarFin: new FormControl(''),
      idEstatus: new FormControl('', Validators.required),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      fechaInvalida: new FormControl('')
    });

    this.formularioLGAC = new FormGroup ({
      idLgac: new FormControl(''),
      idPromocion: new FormControl(this.idCatalogoPromocion)
    });

    if (this.edicion) {
      this.edicionFormulario = true;
      this.obteneredicion(this.edicion);
    }
  }

  obtenerParams(): void {
    this.sub = this.route.params.subscribe(params => {
      this.edicion = +params['id']; // (+) converts string 'id' to a number
      // In a real app: dispatch action to load the details here.
    });
  }

  obteneredicion(edicion : number) {
    if (this.idCatalogoPromocion) {
      this.onCambiosPeridosEscolares(false);
      this.onCambiosLgacs(false);
      let promocionCatalogo: Promocion;

      this._spinner.start('obtenerPromocion');
      this.entidadPromocion = this.promocionesService.getEntidadPromocion(
        this.idCatalogoPromocion,
        this.erroresConsultas).subscribe(
        response => {promocionCatalogo = new Promocion(response.json()); },
        error => {
          this._spinner.stop('obtenerPromocion');
          console.error(error);
        },
        () => {
          this._spinner.stop('obtenerPromocion');

          this.idProgramaDocente = promocionCatalogo.programaDocente.id;
          if (this.formularioPromociones) {
            let stringAbreviatura = 'abreviatura';
            let stringConsecutivo = 'consecutivo';
            let stringIdPlanEstudios = 'idPlanEstudios';
            let stringCohorte = 'cohorte';
            let stringEstatus = 'idEstatus';
            let stringProgramaDocente = 'idProgramaDocente';
            let stringPeriodoEscolarInicio = 'idPeriodoEscolarInicio';
            let stringPeriodoEscolarFin = 'idPeriodoEscolarFin';
            let planEstudiosInicioRecuperar = moment(promocionCatalogo.planEstudiosInicio);
            let planEstudiosFinRecuperar = moment(promocionCatalogo.planEstudiosFin);
            let cohorteRecuperar = moment(promocionCatalogo.cohorte);
            this.dt = new Date(planEstudiosInicioRecuperar.toJSON());
            this.dt2 = new Date(planEstudiosFinRecuperar.toJSON());
            this.dt3 = new Date(cohorteRecuperar.toJSON());

            (<FormControl>this.formularioPromociones.controls[stringAbreviatura])
              .setValue(promocionCatalogo.abreviatura);
            (<FormControl>this.formularioPromociones.controls[stringCohorte])
              .setValue(promocionCatalogo.cohorte);
            (<FormControl>this.formularioPromociones.controls[stringConsecutivo])
              .setValue(promocionCatalogo.consecutivo);
            (<FormControl>this.formularioPromociones.controls[stringEstatus])
              .setValue(promocionCatalogo.estatus.id);
            (<FormControl>this.formularioPromociones.controls[stringProgramaDocente])
              .setValue(promocionCatalogo.programaDocente.id);
            (<FormControl>this.formularioPromociones.controls[stringPeriodoEscolarInicio])
              .setValue(promocionCatalogo.idPeriodoEscolarInicio.id);
            (<FormControl>this.formularioPromociones.controls[stringPeriodoEscolarFin])
              .setValue(promocionCatalogo.idPeriodoEscolarFin.id);
            (<FormControl>this.formularioPromociones.controls[stringIdPlanEstudios])
              .setValue(promocionCatalogo.idPlanEstudios.id);
            this.idProgramaDocente = promocionCatalogo.programaDocente.id;

            this.obtenerProgramaDocente(promocionCatalogo.programaDocente.id);
            //console.log(this.formularioPromociones);

            this.promocionInstancia = promocionCatalogo;
            this.ocultarLgacs(this.promocionInstancia.programaDocente.nivelEstudios.descripcion);
          }
        }
      );
    }

  }


  // todo: implement custom class cases
  public getDayClass(date: any, mode: string): string {
    if (mode === 'day') {
      let dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (let event of this.events) {
        let currentDay = new Date(event.date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return event.status;
        }
      }
    }

    return '';
  }

  public disabled(date: Date, mode: string): boolean {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  }

  public open(): void {
    this.opened = !this.opened;
  }

  ocultarLgacs(descripcion: string): void {
    if (descripcion !== 'Licenciatura') {
      this.mostrarLgac = true;
    } else {
      this.mostrarLgac = false;
    }
  }

  enviarFormulario(event): void {
    if (this.validarFormulario()) {
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formularioPromociones.value, null, 2);
      this._spinner.start('guardar');
      if (this.edicionFormulario) {
        this.promocionesService.putPromocion(
          this.idCatalogoPromocion,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          response => { }, // console.log('Success'),
          error => { this._spinner.stop('guardar'); },
          () => {
            this._spinner.stop('guardar');
            this.regresarLista();
          }
        );
      } else {
        this.promocionesService.postPromocion(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          response => {}, // console.log('Success'),
          error => { this._spinner.stop('guardar'); },
          () => {
            this._spinner.stop('guardar');
            this.regresarLista();
          }
        );
    }
    } else {  }
  }

  obtenerProgramaDocente(id: number): void {
    let consecutivo;
    this.catalogoProgramaDocente.getEntidadProgramaDocente(
      id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.programaDocenteInstancia = new ProgramaDocente(response.json())
      },
      error => {
        console.error(error);
      },
      () => {
        let stringAbreviatura = 'abreviatura';
        (<FormControl>this.formularioPromociones.controls[stringAbreviatura])
          .patchValue(this.programaDocenteInstancia.abreviatura);
      }
    );

    //console.log('idProgramaDocente', id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + id + ':IGUAL'+
      ',idEstatus~' + '1007' + ':IGUAL');
    this.opcionesPlanEstudios = this.catalogoPlanEstudios
      .getSelectPlanEstudioCriterios(this.erroresConsultas, urlParameter);
    this.obtenerLgacs();
    //console.log('Programa docente ' + id);
    if (!this.edicionFormulario) {
      //console.log(this.edicionFormulario);
      this.totalPromo(id);
    }
  }

  totalPromo(id:number): any {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idProgramaDocente~' + id + ':IGUAL';
    let ordenamiento = 'consecutivo' + ':DESC';
    urlSearch.set('criterios', criterio);
    urlSearch.set('ordenamiento', ordenamiento);

    this.promocionesService.
    getListaPromocionesPag(
      this.erroresConsultas,
      urlSearch,
      false
    ).subscribe(
      response => {
        this.registrosPromociones = [];
        let respuesta = response.json();
        respuesta.lista.forEach((item) => {
          this.registrosPromociones.push(new Promocion(item));
          //console.log('Este el consecutivo', item.consecutivo);
        });

        if (this.registrosPromociones.length !== 0 && !this.idCatalogoPromocion) {
          this.consecutivo = parseInt((this.registrosPromociones[0].consecutivo + 1), 10);
        } else {
          this.consecutivo = 1;
        }
        ////console.log('Valor Final: ' + this.consecutivo);
      },
      error => {
        console.error(error);
      },
      () => {
        let stringConsecutivo = 'consecutivo';
        (<FormControl>this.formularioPromociones.controls[stringConsecutivo])
          .patchValue(this.consecutivo);
      }
    );
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioPromociones.controls[campo]);
  }

  getControlPeriodo(campo: string): FormControl {
    return (<FormControl>this.formularioPeriodo.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioPromociones.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  getControlErrorsPeriodo(campo: string): boolean {
    if (!(<FormControl>this.formularioPeriodo.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormulario(): boolean {
    this.validarFecha();
    if (this.formularioPromociones.valid && !this.fechaInvalida) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }


  validarFormularioPeriodo(): boolean {
    if (this.formularioPeriodo.valid) {
      this.validacionActiva = false;
      return true;
    }

    this.validacionActiva = true;
    return false;
  }


  validarFecha(): any {
    let fechaInicio = moment(this.dt).format('DD/MM/YYYY');
    let fechaFin = moment(this.dt2).format('DD/MM/YYYY');
    ////console.log(fechaInicio);
    ////console.log(fechaFin);

    let splitFechaDe = fechaInicio.length;
    let dateFechaDe = new Date(splitFechaDe[2], splitFechaDe[1] - 1, splitFechaDe[0]);
    ////console.log(dateFechaDe);
    let splitFechaHasta = fechaFin.length ;
    let dateFechaHasta =
      new Date(splitFechaHasta[2], splitFechaHasta[1] - 1, splitFechaHasta[0]);
    ////console.log(dateFechaHasta);

    if (dateFechaDe > dateFechaHasta) {
      ////console.log('fecha menor');
      this.fechaInvalida = true;
      ////console.log(this.fechaInvalida);
      (<FormControl>this.formularioPromociones.controls['fechaInvalida']).setValue('');

    } else {
      ////console.log('fecha bien');
      this.fechaInvalida = false;
      ////console.log(this.fechaInvalida);
      (<FormControl>this.formularioPromociones.controls['fechaInvalida']).setValue('1');

    }
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

  private regresarLista(): void {
    this.router.navigate(['catalogo', 'promociones-lista']);
  }

  // Metodos para Agregar Periodos Escoalres

  onCambiosPeridosEscolares(bandera: boolean): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterio = 'idPromocion~' + this.idCatalogoPromocion + ':IGUAL';
    urlSearch.set('criterios', criterio);
    if (bandera) {
      this._spinner.start("promocionescrear1");
    }
    this.promocionPeriodoEscolarService.getListaPromocionPeriodoEscolarPaginacion(
      this.erroresConsultas,
      urlSearch
    ).subscribe (
      response => {
        this.registrosPromPeriodoEscolar = [];
        let respuesta = response.json();
        respuesta.lista.forEach((item) =>
          this.registrosPromPeriodoEscolar.push(new PromocionPeriodoEscolar(item)));
        this._spinner.stop("promocionescrear1");
      },
      error => {
        console.error(error);
        this._spinner.stop("promocionescrear1");
      },
      () => {
        this._spinner.stop("promocionescrear1");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionadoPromPeriodoEscolar === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionadoPromPeriodoEscolar !== registro) {
      this.registroSeleccionadoPromPeriodoEscolar = registro;
      this.banderaBtnEliminar = true;
    } else {
      this.registroSeleccionadoPromPeriodoEscolar = null;
    }
  }

  agregarPeriodoEscolar(): void {
    let jsonFormulario = JSON.stringify(this.formularioPeriodo.value, null, 2);
    if (this.validarFormularioPeriodo()) {
      event.preventDefault();
      this.promocionPeriodoEscolarService
        .postPromocionPeriodoEscolar(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        response => {
          console.log('Success', response);
        },
        error => {
          console.error(error);
        },
        () => {
          this.onCambiosPeridosEscolares(true);
        }
      );
      this.limpiarFormulario();
    }
    this.estadoBoton = false;
  }

  limpiarFormulario(): void {
    (<FormControl>this.formularioLGAC.controls['idLgac']).setValue('');
    (<FormControl>this.formularioPeriodo.controls['idPeriodoEscolar']).setValue('');
    (<FormControl>this.formularioPeriodo.controls['numSemestre']).setValue('');
    (<FormControl>this.formularioPeriodo.controls['inicio']).setValue('');
    (<FormControl>this.formularioPeriodo.controls['fin']).setValue('');
  }

  eliminarPeriodoEscolar () {
    if (this.registroSeleccionadoPromPeriodoEscolar) {
      this.promocionPeriodoEscolarService.deletePeriodoEscolar(
        this.registroSeleccionadoPromPeriodoEscolar.id,
        this.erroresConsultas
      ).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.error(error);
        },
        () => {
          //console.log('Success');
          this.onCambiosPeridosEscolares(true);
          this.banderaBtnEliminar = false;
        }
      );
    }
  }

  // Metodos para Agregar Lgacs
  onCambiosLgacs(bandera: boolean): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idPromocion~' + this.idCatalogoPromocion + ':IGUAL';
    urlSearch.set('criterios', criterio);

    if (bandera) {
      this._spinner.start("promocionescrear2");
    }
    this.promocionLgacService.getListaPromoLgacPag(
      this.erroresConsultas,
      urlSearch
    ).subscribe (
      response => {
        this.registroPromocionLgac = [];
        let respuesta = response.json();
        respuesta.lista.forEach((item) =>
          this.registroPromocionLgac.push(new PromocionLgac(item)));
        this._spinner.stop("promocionescrear2");
      },
      error => {
        console.error(error);
        this._spinner.stop("promocionescrear2");
      },
      () => {
        //console.log('Success');
        this._spinner.stop("promocionescrear2");
      }
    );
    //console.log(this.registroPromocionLgac);
  }

  rowSeleccionadoLgacs(registro): boolean {
    return (this.registroSeleccionadoPromLgac === registro);
  }

  rowSeleccionLgacs(registro): void {
    if (this.registroSeleccionadoPromLgac !== registro) {
      this.registroSeleccionadoPromLgac = registro;
    } else {
      this.registroSeleccionadoPromLgac = null;
    }
  }

  agregarLgacs(): void {
    let jsonFormulario = JSON.stringify(this.formularioLGAC.value, null, 2);
    //console.log('jsonLGAC' + jsonFormulario);
    this.promocionLgacService
      .postPromocionLgac(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
      response => {
        //console.log(response);
      },
      error => {
        console.error (error);
      },
      () => {
        console.log('Success');
        this.onCambiosLgacs(true);
        this.limpiarFormulario();
      }
    );
  }

  eliminarLgac () {
    if (this.registroSeleccionadoPromLgac) {
      this.promocionLgacService.deletePromocionLgac(
        this.registroSeleccionadoPromLgac.id,
        this.erroresConsultas
      ).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.error(error);
        },
        () => {
          //console.log('Se elimina registro: ' + response.json().id);
          this.onCambiosLgacs(true);
        }
      );
    } else {
      ////console.log('Selecciona un registro');
    }
    this.registroSeleccionadoPromLgac = null;
  }

  private prepareServices(): void {
    this.promocionesService = this._catalogosService.getPromociones();

    this.estatusCatalogoService = this._catalogosService.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1005' + ':IGUAL'); // 1004 id del catalogo de estatus

    this.catalogoLgac = this._catalogosService.getlgac();
    this.catalogoProgramaDocente = this._catalogosService.getCatalogoProgramaDocente();
    this.catalogoPeriodoEscolar = this._catalogosService.getPeriodoEscolar();
    this.catalogoPlanEstudios = this._catalogosService.getPlanEstudios();
    this.catalogoDocumentos = this._catalogosService.getTipoDocumento();

    this.opcionesEstatus = this.estatusCatalogoService.
    getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);

    urlParameter.set('criterios', 'idEstatus~' + '1007' + ':IGUAL'); // 1007 id del catalogo de estatus solo avtivos
    this.opcionesProgramasDocente =
      this.catalogoProgramaDocente.getSelectProgramaDocente
      (this.erroresConsultas, urlParameter);

    let urlParameterPeriodos: URLSearchParams = new URLSearchParams();
    urlParameterPeriodos.set('criterios', 'idEstatus~' + '1007' + ':IGUAL');

    console.log('urlParameter en periodo escolar', urlParameterPeriodos);
    this.opcionesPeriodosEscolar =
      this.catalogoPeriodoEscolar.getSelectPeriodoEscolarPeriodoCriterios
      (this.erroresConsultas, urlParameterPeriodos);

      this.promocionPeriodoEscolarService =
        this._catalogosService.getPromocionPeriodoEscolarService();

   this.promocionLgacService =
      this._catalogosService.getPromocionLgac();

  }

  obtenerLgacs(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + this.idProgramaDocente + ':IGUAL' +
      ',idEstatus~' + '1007' + ':IGUAL');// 1007 id del catalogo de estatus solo activo
    this.opcionesLgacs = this.catalogoLgac
      .getSelectLgaCriterios(this.erroresConsultas, urlParameter);
  }

  cambioLGACSelec(idLGAC): void {
    this.estadoBoton = false;
    if (idLGAC) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idLgac~' + idLGAC + ':IGUAL'+
        ',idPromocion~' + this.idCatalogoPromocion + ':IGUAL');
      this._spinner.start("promocionescrear3");
      this.promocionLgacService.getListaPromoLgacPag(this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          this.registrosLGAC = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosLGAC.push(new PromocionLgac(item));
          });
          this.numeroRegistroLGAC = this.registrosLGAC.length;
          this._spinner.stop("promocionescrear3");
        },
        error => {
          console.error(error);
          this._spinner.stop("promocionescrear3");
        },
        () => {
          if (this.numeroRegistroLGAC < 1) {
            this.estadoBoton = true;
          } else {
            this.estadoBoton = false;
          }
          this._spinner.stop("promocionescrear3");
        }
      );
    } else {
      this.estadoBoton = false;
    }
  }

  cambioPeriodoEscolarSelect(idPromocionPeriodoEscolar): void {
    this.estadoBotonPeriodo = false;
    if (idPromocionPeriodoEscolar) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idPeriodoEscolar~' + idPromocionPeriodoEscolar + ':IGUAL' +
        ',idPromocion~' + this.idCatalogoPromocion + ':IGUAL'); // 1004 id del catalogo de estatus
      this._spinner.start("promocionescrear4");

      this.promocionPeriodoEscolarService.getListaPromocionPeriodoEscolarPaginacion(
        this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          this.registrosPeriodoEscolar = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosPeriodoEscolar.push(new PromocionPeriodoEscolar(item));
          });
          this.numeroRegistroPeriodoEscolar = this.registrosPeriodoEscolar.length;
          this._spinner.stop("promocionescrear4");
          //console.log('TAMAÑO PERIODO: ' + this.registrosPeriodoEscolar.length);
        },
        error => {
          console.error(error);
          this._spinner.stop("promocionescrear4");
        },
        () => {
          if (this.numeroRegistroPeriodoEscolar < 1) {
            this.estadoBotonPeriodo = true;
          } else {
            this.estadoBotonPeriodo = false;
          }
          this._spinner.stop("promocionescrear4");
        }
      );
    } else {
      this.estadoBotonPeriodo = false;
    }
  }

  mostrarBotonAgregar(): boolean {
    return this.estadoBoton;
  }

  mostrarCamposPeriodo(): boolean {
    return this.estadoBotonPeriodo;
  }

  mostrarBtnEliminar(): boolean {
    return this.banderaBtnEliminar;
  }
  ngOnInit() {
  }

}
