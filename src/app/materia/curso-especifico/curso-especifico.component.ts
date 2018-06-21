import {Component, OnInit, ElementRef, Renderer, Injector, ViewChild} from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ProfesorMateria} from "../../services/entidades/profesor-materia.model";
import {PlanEstudiosMateria} from "../../services/entidades/plan-estudios-materia.model";
import {MateriaImpartida} from "../../services/entidades/materia-impartida.model";
import {Promocion} from "../../services/entidades/promocion.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import {GestionOptativaComponent} from "../gestion-optativa/gestion-optativa.component";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {errorMessages} from "../../utils/error-mesaje";
import {Profesor} from "../../services/entidades/profesor.model";
import {FormControl, FormGroup} from "@angular/forms";
import * as moment from 'moment/moment';

@Component({
  selector: 'app-curso-especifico',
  templateUrl: './curso-especifico.component.html',
  styleUrls: ['./curso-especifico.component.css'],
})
export class CursoEspecificoComponent implements OnInit {

  @ViewChild('gestionChild')
  child: GestionOptativaComponent;

  @ViewChild('detalle')
  modalDetalle: ModalComponent;

  router: Router;
  paginacion: PaginacionInfo;
  maxSizePags: number = 5;
  paginaActual: number = 1;
  limite: number = 10;
  edicionFormulario: boolean = false;
  mensajeErrors: any = errorMessages;
  registros: Array<ProfesorMateria> = [];
  tipoAlerta: number = 0;

  entidadPlanEstudioMateria: PlanEstudiosMateria;
  materiaImpartida: MateriaImpartida;
  promocion: Promocion;
  idPeriodoEscolar: number = null;
  idPromocion: number = null;
  idTipoMateria: number;

  materiaImpartidaService;
  planEstudiosMateriaService;
  promocionService;
  profesorMateriaService;
  columnas: Array<any> = [
    { titulo: 'Nombre curso específico', nombre: 'idCursoOptativo', sort: false },
    { titulo: 'Nombre del profesor', nombre: 'idProfesor' }
  ];

  registroSeleccionado: ProfesorMateria;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idProfesor' }
  };

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];


  constructor(private _router: Router, route: ActivatedRoute,
              private elementRef: ElementRef, private _spinner: SpinnerService,
              private injector: Injector, private _renderer: Renderer,
              private _catalogosServices: CatalogosServices) {
    this.router = _router;
    this.prepareServices();

    let params;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });

    let idPlanEstudioMateria: number = params.id;
    this.idPeriodoEscolar = params.idPe;
    this.idPromocion = params.idPr;
    this.idTipoMateria = params.idTipoMateria;
    this.guardarParamsEnSession(params);
    this.recuperarPlanEstudiosMateria(idPlanEstudioMateria);
    this.constructorDialog();
  }


  recuperarPlanEstudiosMateria(idPlanEstudioMateria: number): void {

    this.planEstudiosMateriaService.getEntidadPlanEstudiosMateria(
      idPlanEstudioMateria,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadPlanEstudioMateria = new PlanEstudiosMateria(response.json());
      },
      error => {
        console.error(error);
      },
      () => {
        this.recuperarPromocion();
      }
    );
  }

  guardarParamsEnSession(params): void {
    if (params) {
      sessionStorage.setItem('id', params.id);
      sessionStorage.setItem('idPe', params.idPe);
      sessionStorage.setItem('idPr', params.idPr);
      sessionStorage.setItem('idTipoMateria', params.idTipoMateria);
    }
  }

  recuperarPromocion(): void {
    this.promocionService.getEntidadPromocion(
      this.idPromocion,
      this.erroresConsultas
    ).subscribe(
      response => {
        if (response.json()) {
          this.promocion = new Promocion(response.json());
          this.onCambiosTabla();
        }
      },
      error => {
        console.error(error);
      }
    );
  }


  modalAgregarOptativa(modo): void {
    let idMateriaOptativaCurso: number;
    let idMateriaPadre: number = this.entidadPlanEstudioMateria.materia.id;
    let idTipoMateria: number = this.idTipoMateria;
    console.log(this.registroSeleccionado) ;
    console.log(modo) ;

    if (modo === 'editar' && this.registroSeleccionado) {
      idMateriaOptativaCurso = this.registroSeleccionado.materiaImpartida.id;
      this.abrirModalAgregarOptativa();
    }

    if (modo === 'agregar' && !this.registroSeleccionado) {
      this.registroSeleccionado = null;
      idMateriaOptativaCurso = null;
      this.abrirModalAgregarOptativa();
    }
  }

  abrirModalAgregarOptativa(): void {
    // this.child.ngOnInit();
    //this.child.mAgregarOptativa.open('lg');
    let edicion = false;
    let idMateriaImpartidaRegistroSeleccionado;

    if (this.registroSeleccionado != null && 
      this.registroSeleccionado.materiaImpartida.id) {
        edicion = true;
        idMateriaImpartidaRegistroSeleccionado =
          this.registroSeleccionado.materiaImpartida.id;
    }

    this.router.navigate(['materias', 'curso-optativo-esp',
    {
      idPro: this.promocion.id, idProGD: this.promocion.programaDocente.id,
      idMat: this.entidadPlanEstudioMateria.materia.id, idPerEs: this.idPeriodoEscolar,
      numPer: this.entidadPlanEstudioMateria.numeroPeriodo,
      idTipoMat: this.idTipoMateria,
      edt : edicion,
      idMatRegSecc: idMateriaImpartidaRegistroSeleccionado
    }]);
  }

  modalDetalleOptativa(): void {
    let idMateriaOptativaCurso: number;
    idMateriaOptativaCurso = this.registroSeleccionado.materiaImpartida.id;
    this.constructorDialog();
    this.modalDetalle.open('lg');
  }

  ngOnInit(): void {
    //   this.onCambiosTabla();
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
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idMateriaImpartida.idMateria~' +
      this.entidadPlanEstudioMateria.materia.id + ':IGUAL,' +
      'idMateriaImpartida.idPromocion~' + this.promocion.id + ':IGUAL'
      + ',titular~true,idMateriaImpartida.idEstatus~1222:IGUAL;AND';

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE';
      });
    }
    urlSearch.set('criterios', criterios);


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
    this._spinner.start("onCambiosTabla");
    this.profesorMateriaService.getListaProfesorMateria(
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
        response.json().lista.forEach((item) => {
          this.registros.push(new ProfesorMateria(item));
        });
        //    this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        //    this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
      },
      () => {
        if (this.tipoAlerta == 1) {
          this.addErrorsMesaje('La materia se actualizó correctamente', 'success');
        }if (this.tipoAlerta == 2) {
          this.addErrorsMesaje('La materia se guardó correctamente', 'success');
        }
        this._spinner.stop("onCambiosTabla");
      }
    );
  }
/////////////////////////////////////////////////////////////////////////////////////////////////
//                                Paginador                                                  //
///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }


  setLimite(limite: string): void {
    this.limite = Number(limite);
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

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.tipoAlerta = 0;
  }

  regresaLista(): void {
    this.router.navigate(['reinscripcion', 'materia']);
  }

  private prepareServices(): void {
    this.planEstudiosMateriaService =
      this._catalogosServices.getPlanEstudiosMateria();
    this.materiaImpartidaService =
      this._catalogosServices.getMateriaImpartidaService();

    this.promocionService = this._catalogosServices.getPromocion();
    this.profesorMateriaService = this._catalogosServices.getProfesorMateriaService();
  }



  /////////////  Detalle Modal /////////////////////////


  /*timepicker example */
  public hstep: number = 1;
  public mstep: number = 1; /*desplazamiento de 10 en 10 en los minutos */
  public ismeridian: boolean = false;
  lunesI: Date =new Date(new Date().setHours(0, 0, 0, 0)); /* se inicializa en 00:00 los componentes */
  lunesF: Date = new Date(new Date().setHours(0, 0, 0, 0));
  martesI: Date =new Date(new Date().setHours(0, 0, 0, 0));
  martesF: Date =new Date(new Date().setHours(0, 0, 0, 0));
  miercolesI: Date =new Date(new Date().setHours(0, 0, 0, 0));
  miercolesF: Date =new Date(new Date().setHours(0, 0, 0, 0));
  juevesI: Date =new Date(new Date().setHours(0, 0, 0, 0));
  juevesF: Date =new Date(new Date().setHours(0, 0, 0, 0));
  viernesI: Date =new Date(new Date().setHours(0, 0, 0, 0));
  viernesF: Date =new Date(new Date().setHours(0, 0, 0, 0));
  /*timepicker example */
  /*timepicker example */

  validacionActiva: boolean = false;
  registrosP: Array<Profesor>  = [];
  registrosProfesores: Array<ProfesorMateria> = [];
  entidadMateriaOptativaCurso: MateriaImpartida;

  columnasP: Array<any> = [
    { titulo: 'Profesor', nombre: 'clave', sort: false},
    { titulo: 'Titular de la materia', nombre: 'titular', sort: false },
    { titulo: 'Horas asignadas', nombre: 'horasAsignadas', sort: false }
  ];


  //Services
  profesoresService;
  formularioHorarios: FormGroup;
  edicion: boolean= false;

  constructorDialog() {

    /*timepicker example */
    this.lunesI = void 0;
    this.lunesF = void 0;
    this.martesI = void 0;
    this.martesF = void 0;
    this.miercolesI = void 0;
    this.miercolesF = void 0;
    this.juevesI = void 0;
    this.juevesF = void 0;
    this.viernesI = void 0;
    this.viernesF = void 0;
    /*timepicker example */

    this.prepareServicesDetalle();

    if (this.registroSeleccionado && this.registroSeleccionado.materiaImpartida.id) {
      this._spinner.start("constructorDialog");
      this.edicion = true;
      this.obtenerMateriaImpartida(this.registroSeleccionado.materiaImpartida.id);
    }else {}

    this.formularioHorarios = new FormGroup({
      lunesInicio: new FormControl(''),
      lunesFin: new FormControl(''),
      martesInicio: new FormControl(''),
      martesFin: new FormControl(''),
      miercolesInicio: new FormControl(''),
      miercolesFin: new FormControl(''),
      juevesInicio: new FormControl(''),
      juevesFin: new FormControl(''),
      viernesInicio: new FormControl(''),
      viernesFin: new FormControl('')
    });
  }

  obtenerMateriaImpartida(idMateriaImp: number): void { //Materia impartida curso lgac
    this.materiaImpartidaService.getEntidadMateriaImpartida(
      idMateriaImp,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadMateriaOptativaCurso =
          new MateriaImpartida (response.json());
        this.cargarHorario();
        this.onCambiosTablaDetalle();
      }
    );
  }


  getLunesInicio(): string {
    if (this.lunesI) {
      let fechaConFormato =  moment(this.lunesI).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['lunesInicio'])
        .setValue(fechaConFormato);  // se asigna la nueva hora
      return fechaConFormato;
    }
  }

  getLunesFin(): string {
    if (this.lunesF) {
      let fechaConFormato =  moment(this.lunesF).format('HH:mm');

      (<FormControl>this.formularioHorarios.controls['lunesFin'])
        .setValue(fechaConFormato);

      return fechaConFormato;
    }
  }

  getMartesInicio(): string {
    if (this.martesI) {
      let fechaConFormato = moment(this.martesI).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['martesInicio'])
        .setValue(fechaConFormato);
      return fechaConFormato;
    }
  }

  getMartesFin(): string {
    if (this.martesF) {
      let fechaConFormato = moment(this.martesF).format('HH:mm');

      (<FormControl>this.formularioHorarios.controls['martesFin'])
        .setValue(fechaConFormato);
      return fechaConFormato;
    }
  }

  getMiercolesInicio(): string {
    if (this.miercolesI) {
      let fechaConFormato = moment(this.miercolesI).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['miercolesInicio'])
        .setValue(fechaConFormato);
      return fechaConFormato;
    }
  }

  getMiercolesFin(): string {
    if (this.miercolesF) {
      let fechaConFormato = moment(this.miercolesF).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['miercolesFin'])
        .setValue(fechaConFormato);
      return fechaConFormato;
    }
  }

  getJuevesInicio(): string {
    if (this.juevesI) {
      let fechaConFormato = moment(this.juevesI).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['juevesInicio'])
        .setValue(fechaConFormato);
      return fechaConFormato;
    }
  }

  getJuevesFin(): string {
    if (this.juevesF) {
      let fechaConFormato = moment(this.juevesF).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['juevesFin'])
        .setValue(fechaConFormato);

      return fechaConFormato;
    }
  }

  getViernesInicio(): string {
    if (this.viernesI) {
      let fechaConFormato = moment(this.viernesI).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['viernesInicio']).setValue(fechaConFormato);
      return fechaConFormato;
    }
  }

  getViernesFin(): string {
    if (this.viernesF) {
      let fechaConFormato = moment(this.viernesF).format('HH:mm');
      (<FormControl>this.formularioHorarios.controls['viernesFin']).setValue(fechaConFormato);

      return fechaConFormato;
    }
  }

  cargarHorario(): void {
    if (this.entidadMateriaOptativaCurso.horario.id) {

      let StringLunesInicio = 'lunesInicio';
      let StringLunesFin = 'lunesFin';
      let StringMartesInicio = 'martesInicio';
      let StringMartesFin = 'martesFin';
      let StringMiercolesInicio = 'miercolesInicio';
      let StringMiercolesFin = 'miercolesFin';
      let StringJuevesInicio = 'juevesInicio';
      let StringJuevesFin = 'juevesFin';
      let StringViernesInicio = 'viernesInicio';
      let StringViernesFin = 'viernesFin';

      /*timepicker example */
      this.lunesI = void 0;
      this.lunesF = void 0;
      this.martesI = void 0;
      this.martesF = void 0;
      this.miercolesI = void 0;
      this.miercolesF = void 0;
      this.juevesI = void 0;
      this.juevesF = void 0;
      this.viernesI = void 0;
      this.viernesF = void 0;
      /*timepicker example */


      /*timepicker example */
      if (this.entidadMateriaOptativaCurso.horario.lunesInicio && this.entidadMateriaOptativaCurso.horario.lunesInicio != ''){
        let fecha = this.entidadMateriaOptativaCurso.horario.lunesInicio.split(":");
        this.lunesI = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        (<FormControl>this.formularioHorarios.controls[StringLunesInicio])
          .setValue(this.lunesI);
          // console.log('hora In concatenada', this.lunesI.getHours() + ':' + this.lunesI.getMinutes() );
      }
      if (this.entidadMateriaOptativaCurso.horario.lunesFin && this.entidadMateriaOptativaCurso.horario.lunesFin != ''){
        let fecha = this.entidadMateriaOptativaCurso.horario.lunesFin.split(":");
        this.lunesF = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        (<FormControl>this.formularioHorarios.controls[StringLunesFin])
          .setValue(this.lunesF);
          // console.log('hora Fin concatenada', this.lunesF.getHours() + ':' + this.lunesF.getMinutes() );
      }
      if (this.entidadMateriaOptativaCurso.horario.martesInicio && this.entidadMateriaOptativaCurso.horario.martesInicio != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.martesInicio.split(":");
        this.martesI = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('martesI asign ' + this.martesI);
        (<FormControl>this.formularioHorarios.controls[StringMartesInicio])
          .setValue(this.martesI);
      }
      if (this.entidadMateriaOptativaCurso.horario.martesFin && this.entidadMateriaOptativaCurso.horario.martesFin != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.martesFin.split(":");
        this.martesF = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('martesF asign ' + this.martesF);
        (<FormControl>this.formularioHorarios.controls[StringMartesFin])
          .setValue(this.martesF);
      }
      if (this.entidadMateriaOptativaCurso.horario.miercolesInicio && this.entidadMateriaOptativaCurso.horario.miercolesInicio != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.miercolesInicio.split(":");
        this.miercolesI = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('miercolesI asign ' + this.miercolesI);
        (<FormControl>this.formularioHorarios.controls[StringMiercolesInicio])
          .setValue(this.miercolesI);
      }
      if (this.entidadMateriaOptativaCurso.horario.miercolesFin && this.entidadMateriaOptativaCurso.horario.miercolesFin != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.miercolesFin.split(":");
        this.miercolesF = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('miercolesF asign ' + this.miercolesF);
        (<FormControl>this.formularioHorarios.controls[StringMiercolesFin])
          .setValue(this.miercolesF);
      }
      if (this.entidadMateriaOptativaCurso.horario.juevesInicio && this.entidadMateriaOptativaCurso.horario.juevesInicio != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.juevesInicio.split(":");
        this.juevesI =new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('juevesI asign ' + this.juevesI);
        (<FormControl>this.formularioHorarios.controls[StringJuevesInicio])
          .setValue(this.juevesI);
      }
      if (this.entidadMateriaOptativaCurso.horario.juevesFin && this.entidadMateriaOptativaCurso.horario.juevesFin != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.juevesFin.split(":");
        this.juevesF = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('juevesF asign ' + this.juevesF);
        (<FormControl>this.formularioHorarios.controls[StringJuevesFin])
          .setValue(this.juevesF);
      }
      if (this.entidadMateriaOptativaCurso.horario.viernesInicio && this.entidadMateriaOptativaCurso.horario.viernesInicio != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.viernesInicio.split(":");
        this.viernesI = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('viernesI asign ' + this.viernesI);
        (<FormControl>this.formularioHorarios.controls[StringViernesInicio])
          .setValue(this.viernesI);
      }
      if (this.entidadMateriaOptativaCurso.horario.viernesFin && this.entidadMateriaOptativaCurso.horario.viernesFin != ''){
        let fecha  = this.entidadMateriaOptativaCurso.horario.viernesFin.split(":");
        this.viernesF = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('viernesF asign ' + this.viernesF);
        (<FormControl>this.formularioHorarios.controls[StringViernesFin])
          .setValue(this.viernesF);
      }
      /*timepicker example */

    }
  }

  horarioLunesValido(): boolean {
    let valido = false;
    let horaInicio = this.lunesI.getHours() + ':' + this.lunesI.getMinutes();
    let horaFin = this.lunesF.getHours() + ':' + this.lunesF.getMinutes();

    if ( horaInicio !== '0:0' && horaFin !== '0:10') {
      valido = true;
    }

    return valido;
  }

  horarioMartesValido(): boolean {
    let valido = false;
    let horaInicio = this.martesI.getHours() + ':' + this.martesI.getMinutes();
    let horaFin = this.martesF.getHours() + ':' + this.martesF.getMinutes();

    if ( horaInicio !== '0:0' && horaFin !== '0:10') {
      valido = true;
    }

    return valido;
  }

  horarioMiercolesValido(): boolean {
    let valido = false;
    let horaInicio = this.miercolesI.getHours() + ':' + this.miercolesI.getMinutes();
    let horaFin = this.miercolesF.getHours() + ':' + this.miercolesF.getMinutes();

    if ( horaInicio !== '0:0' && horaFin !== '0:10') {
      valido = true;
    }

    return valido;
  }

  horarioJuevesValido(): boolean {
    let valido = false;
    let horaInicio = this.juevesI.getHours() + ':' + this.juevesI.getMinutes();
    let horaFin = this.juevesF.getHours() + ':' + this.juevesF.getMinutes();

    if ( horaInicio !== '0:0' && horaFin !== '0:10') {
      valido = true;
    }

    return valido;
  }

  horarioViernesValido(): boolean {
    let valido = false;
    let horaInicio = this.viernesI.getHours() + ':' + this.viernesI.getMinutes();
    let horaFin = this.viernesF.getHours() + ':' + this.viernesF.getMinutes();

    if ( horaInicio !== '0:0' && horaFin !== '0:10') {
      valido = true;
    }

    return valido;
  }


  cerrarModal(): void {
    this.modalDetalle.close();
  }

  onCambiosTablaDetalle(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = 'idMateriaImpartida~' +
      this.entidadMateriaOptativaCurso.id + ':IGUAL,idEstatus~1228:IGUAL;AND';

    urlSearch.set('criterios', criterios);

    //this._spinner.start();
    this.profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas,
      urlSearch,
      false
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.registrosProfesores.push(new ProfesorMateria(item));
        });
        this._spinner.stop("constructorDialog");
      },
      error => {
        console.error('error');
      }
    );
  }

  private prepareServicesDetalle(): void {
    this.profesoresService = this._catalogosServices.getProfesor();
    this.profesorMateriaService =
      this._catalogosServices.getProfesorMateriaService();
    this.materiaImpartidaService =
      this._catalogosServices.getMateriaImpartidaService();
  }
}
