import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {EvaluacionDocenteAlumno} from "../../services/entidades/evaluacion-docente-alumno.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {EvaluacionDocenteAlumnoService} from "../../services/entidades/evaluacion-docente-alumno.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {PeriodoEscolarServices} from "../../services/entidades/periodo-escolar.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {PromocionPeriodoEscolarService} from "../../services/entidades/promocion-periodo-escolar.service";
import {PromocionPeriodoEscolar} from "../../services/entidades/promocion-periodo-escolar.model";
import * as moment from "moment";

@Component({
  selector: 'app-estudiantes-pendientes-list',
  templateUrl: './estudiantes-pendientes-list.component.html',
  styleUrls: ['./estudiantes-pendientes-list.component.css']
})
export class EstudiantesPendientesListComponent implements OnInit {

  @ViewChild('absolverEstudianteEvaluacion')
  absolverEstudianteEvaluacion: ModalComponent;
  @ViewChild('confirmarAbsolver')
  confirmarAbsolver: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  registros: Array<EvaluacionDocenteAlumno> = [];
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registroSeleccionado: any;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido', textoFecha: '' }
  };
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  botonValido = false;
  criteriosCabezera: string = '';
  criteriosCabezeraBusqueda: string = '';
  mostrarFiltroPeriodo= true;
  tipoEstudianteSeleccionado=1;

  private opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  private opcionesSelectPromocion: Array<ItemSelects> = [];
  private opcionesSelectPeriodo: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _evaluacionDocenteAlumnoService: EvaluacionDocenteAlumnoService,
              private _catalogosService: CatalogosServices,
              private _periodoEscolarService: PeriodoEscolarServices,
              private _spinner: SpinnerService,
              private _promocionPeriodoEscolarService: PromocionPeriodoEscolarService) {
    this.onCambiosTabla();
    this.inicializarFormularioAbsolver();

    if (sessionStorage.getItem('estudiantesPendientesIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('estudiantesPendientesCriterios')) {
      this.onCambiosTabla();
    }

  }
  cambioFiltrosBusqueda(tipoEstudiante: number): void {
    console.log(tipoEstudiante);
    if (tipoEstudiante==1){
      this.mostrarFiltroPeriodo=true;
      this.tipoEstudianteSeleccionado=1;
    }else{
      this.mostrarFiltroPeriodo=false;
      this.tipoEstudianteSeleccionado=2;
    }
    this.opcionesSelectProgramaDocente =
      this._catalogosService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);

    this.opcionesSelectPromocion=[];
    this.opcionesSelectPeriodo = [];
    this.rowSeleccion(null);
  }
  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion =
      this._catalogosService.getPromocion().
      getSelectPromocion(this.erroresConsultas, urlParameter);
    this.opcionesSelectPeriodo = [];
  }

  getPeriodosEscolares(idPromocion: number): void {
    this.opcionesSelectPeriodo=[];
    this._spinner.start('cargarPeriodosPromocion');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios',
      'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
      ':IGUAL;AND');

    this.opcionesSelectPeriodo =
      this._promocionPeriodoEscolarService.getSelectPromocionPeriodoEscolarParametros(
        this.erroresConsultas,
        urlParameter
      );

    this._spinner.stop('cargarPeriodosPromocion');

    /*this._promocionPeriodoEscolarService.getListaPromocionPeriodoEscolarPaginacion(
      this.erroresConsultas, urlParameter).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          let promocionPeriodo = new PromocionPeriodoEscolar(item);
          this.opcionesSelectPeriodo.push(
            new ItemSelects(promocionPeriodo.idPeriodoEscolar.id,
              promocionPeriodo.idPeriodoEscolar.getPeriodo()));
        });

      },
      error => {
        this._spinner.stop('cargarPeriodosPromocion');
      },
      () => {
        this._spinner.stop('cargarPeriodosPromocion');
      });*/
  }

  activarBotonBusqueda(numero: number): any {
    if (numero == 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }
  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idPeriodo: number
  ): void {
    this.limpiarVariablesSession();
    if(this.tipoEstudianteSeleccionado==1){
      if (idPromocion&&idPeriodo) {
        this.criteriosCabezera = 'idEstudiante.idPromocion.id~'
          + idPromocion + ':IGUAL;AND,idPeriodoEscolar.id~'
          + idPeriodo + ':IGUAL';
      }
      this.criteriosCabezeraBusqueda="idEstudiante.idDatosPersonales.primerApellido:ASC,idEstudiante.idDatosPersonales.nombre:ASC"
    }
    if(this.tipoEstudianteSeleccionado==2){
      if (idProgramaDocente && idPromocion) {
        this.criteriosCabezera ='idEstudianteMovilidadExterna.idPromocion.idProgramaDocente.id~'
          + idProgramaDocente + ':IGUAL;AND'
          + ',idEstudianteMovilidadExterna.idPromocion.id~'
          + idPromocion + ':IGUAL';
      }
      this.criteriosCabezeraBusqueda="idEstudianteMovilidadExterna.idDatosPersonales.primerApellido:ASC,idEstudianteMovilidadExterna.idDatosPersonales.nombre:ASC"
    }
    sessionStorage.setItem('estudiantesPendientesIdPromocion', idPromocion.toString());
    sessionStorage.setItem('estudiantesPendientesIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('estudiantesPendientesIdPeriodo', idPeriodo.toString());
    ////console.log(this.criteriosCabezera);
    this.onCambiosTabla();
  }

/*  ModalAbsolverEstudiante(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalAbsolverEstudianteData(
        this, this.registroSeleccionado
      ) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalAbsolverEstudiante,
      bindings,
      modalConfig
    );
  }*/
  ngOnInit() {
    //console.log("hola");
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
    this.rowSeleccion(null);
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
  setPaginacion(paginacion: PaginacionInfo): void{
    this.paginacion = paginacion;
  }
  getPaginacion(){
    return this.paginacion;
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
    ////console.log("obtenerListaDatosEstudiante");

    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'evaluacionesFinalizadas~false:IGUAL';
    let ordenamiento = 'id:ASC';
    if (!sessionStorage.getItem('estudiantesPendientesCriterios')) {
    if (this.criteriosCabezera !== '') {
      criterio = criterio + ',' + this.criteriosCabezera;
    }
    if(this.criteriosCabezeraBusqueda!==''){
      ordenamiento = this.criteriosCabezeraBusqueda;
    }

    sessionStorage.setItem('estudiantesPendientesCriterios', criterio);
    sessionStorage.setItem('estudiantesPendientesOrdenamiento', ordenamiento);
    sessionStorage.setItem('estudiantesPendientesLimite', this.limite.toString());
    sessionStorage.setItem('estudiantesPendientesPagina', this.paginaActual.toString());
    }
    this.limite = +sessionStorage.getItem('estudiantesPendientesLimite') ? +sessionStorage.getItem('estudiantesPendientesLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('estudiantesPendientesPagina') ? +sessionStorage.getItem('estudiantesPendientesPagina') : this.paginaActual;
    urlParameter.set('criterios', sessionStorage.getItem('estudiantesPendientesCriterios') ? sessionStorage.getItem('estudiantesPendientesCriterios') : criterio);
    urlParameter.set('ordenamiento', sessionStorage.getItem('estudiantesPendientesOrdenamiento') ? sessionStorage.getItem('estudiantesPendientesOrdenamiento') : ordenamiento );
    urlParameter.set('limit', this.limite.toString());
    urlParameter.set('pagina', this.paginaActual.toString());

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterio = this.criteriosCabezera ? (criterio + ';ANDGROUPAND') : '';
      filtros.forEach((filtro) => {
        criterio = criterio + ((criterio === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlParameter.set('criterios', criterio);
    }
    this._spinner.start('cargarTablaEstudiantes');
    this._evaluacionDocenteAlumnoService.getListaEvaluacionDocenteAlumno(
      this.erroresConsultas,
      urlParameter,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros=[];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.setPaginacion(new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        ));
        paginacionInfoJson.lista.forEach((item) => {
          //console.log(item);
          if(item.id_estudiante){
            if(item.id_estudiante.id_matricula){
              if(item.id_estudiante.id_matricula.matricula_completa){
                this.registros.push(new EvaluacionDocenteAlumno(item));
              }
            }
          }else{
            if(item.id_estudiante_movilidad_externa){
              if(item.id_estudiante_movilidad_externa.id_matricula){
                if(item.id_estudiante_movilidad_externa.id_matricula.matricula_completa){
                  this.registros.push(new EvaluacionDocenteAlumno(item));
                }
              }
            }
          }
        });
        //console.log(this.registros);
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this._spinner.stop('cargarTablaEstudiantes');

      },
      () => {
        this.registroSeleccionado = null;
        this._spinner.stop('cargarTablaEstudiantes');

      }
    );
  }
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  setLimite(limite: string): void {
    this.limpiarVariablesSession();
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


  ModalAbsolverEstudiante() {
    this.inicializarFormularioAbsolver();
    this.inicializar();
    this.absolverEstudianteEvaluacion.open('lg');
  }

  cerrarModalCapturarcomentario() {
    this.absolverEstudianteEvaluacion.close();
  }

  /*--------------------------TODO INICIA VARIABLES modal de absolver estudiante*/
  formularioAbsolverEstudiante: FormGroup;
  public promocion:any;
  public programa:any;
  validacionActiva: boolean = false;
  public estudiante:EvaluacionDocenteAlumno;
  /*TODO TERMINA VARIABLES modal de absolver estudiante--------------------------*/


  /*--------------------------TODO INICIA modal de absolver estudiante*/

  inicializarFormularioAbsolver(): void {

    this.formularioAbsolverEstudiante = new FormGroup({
      observaciones: new FormControl('', Validators.required)
    });
  }

  inicializar():void{
    if(this.registroSeleccionado) {
      this.estudiante=this.registroSeleccionado;
      console.log(this.registroSeleccionado);
      if(this.estudiante.idEstudiante){
        if(this.estudiante.idEstudiante.promocion){
          this.promocion=this.estudiante.idEstudiante.promocion.abreviatura + '-'
            + this.estudiante.idEstudiante.promocion.consecutivo + '°';
          if(this.estudiante.idEstudiante.promocion.programaDocente){
            this.programa=this.estudiante.idEstudiante.promocion.programaDocente.descripcion;
          }
        }
      }
      if(this.estudiante.idEstudianteMovilidad){
        if(this.estudiante.idEstudianteMovilidad.idPromocion){
          this.promocion=this.estudiante.idEstudianteMovilidad.idPromocion.abreviatura + '-'
            + this.estudiante.idEstudianteMovilidad.idPromocion.consecutivo + '°';
        }
        if(this.estudiante.idEstudianteMovilidad.idProgramaDocente){
          this.programa=this.estudiante.idEstudianteMovilidad.idProgramaDocente.descripcion;
        }
      }
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioAbsolverEstudiante.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioAbsolverEstudiante.controls[campo]).valid && this.validacionActiva) {
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
    return null;
  }
  validarFormularioAbsolver(): boolean {
    if (this.formularioAbsolverEstudiante.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  /*modalConfirmarAbsolverEstudiante(): void {
    if (this.validarFormularioAbsolver()) {
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('sm', true, 27);

      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: new ModalConfirmarAbsolverEstudianteData(
          this,
          this.context.padre,
          this.context.elemento,
          this.formularioAbsolverEstudiante
        ) }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalConfirmarAbsolverEstudiante,
        bindings,
        modalConfig
      );
    }
  }*/



  /*TODO TERMINA modal de absolver estudiante------------------------*/


  /*------------------------TODO INICIA modal de confirmar absolver estudiante*/
  modalConfirmarAbsolverEstudiante() {
    if (this.validarFormularioAbsolver()) {
      this.confirmarAbsolver.open('sm');
    }
  }

  closeModalConfirmarAbsolver(){
    this.confirmarAbsolver.close();
  }

  absolverEstudiante():void{
    let jsonFormulario = JSON.stringify(this.formularioAbsolverEstudiante.value, null, 2);
    let objFormulario = JSON.parse(jsonFormulario);
    objFormulario.estudianteAbsuelto=true;
    jsonFormulario = JSON.stringify(objFormulario, null, 2);
    this._evaluacionDocenteAlumnoService.putEvaluacionDocenteAlumno(
      this.registroSeleccionado.id,
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.closeModalConfirmarAbsolver();
        this.cerrarModalCapturarcomentario();
        this.onCambiosTabla();
      },
      error => {
        console.error(error);
      },
      () => {
      }
    );
  }

  /*TODO TERMINA modal de confirmar absolver estudiante------------------------*/



/*  constructor() { }

  ngOnInit() {
  }*/

limpiarVariablesSession() {
    sessionStorage.removeItem('estudiantesPendientesCriterios');
    sessionStorage.removeItem('estudiantesPendientesOrdenamiento');
    sessionStorage.removeItem('estudiantesPendientesLimite');
    sessionStorage.removeItem('estudiantesPendientesPagina');
  }

}
