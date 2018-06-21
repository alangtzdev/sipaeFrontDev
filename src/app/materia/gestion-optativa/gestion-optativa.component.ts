import {Component, OnInit, Injector, Renderer, ViewChild, Input} from '@angular/core';
import * as moment from 'moment/moment';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {Validacion} from '../../utils/Validacion';
import {URLSearchParams} from '@angular/http';
import {HorariosMateria} from '../../services/entidades/horarios-materia.model';
import {Router, ActivatedRoute} from '@angular/router';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {CursoEspecificoComponent} from '../curso-especifico/curso-especifico.component';
import {errorMessages} from '../../utils/error-mesaje';
import {isNullOrUndefined} from 'util';


@Component({
  selector: 'app-gestion-optativa',
  templateUrl: './gestion-optativa.component.html',
  styleUrls: ['./gestion-optativa.component.css'],

})
export class GestionOptativaComponent implements OnInit {

  @ViewChild('modalAgregaOptativa')
  mAgregarOptativa: ModalComponent;

  @ViewChild('modalAdvertenciaMensaje')
  mAdvertencia: ModalComponent;

  @ViewChild('modalConfirmacion')
  mConfirmacion: ModalComponent;

  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';



  /*timepicker example */
  public hstep: number = 1;
  public mstep: number = 10; /*desplazamiento de 10 en 10 en los minutos */
  public ismeridian: boolean = false;

  lunesI: Date = new Date(new Date().setHours(0, 0, 0, 0)); /* se inicializa en 00:00 los componentes */
  lunesF: Date = new Date(new Date().setHours(0, 0, 0, 0));
  martesI: Date = new Date(new Date().setHours(0, 0, 0, 0));
  martesF: Date = new Date(new Date().setHours(0, 0, 0, 0));
  miercolesI: Date = new Date(new Date().setHours(0, 0, 0, 0));
  miercolesF: Date = new Date(new Date().setHours(0, 0, 0, 0));
  juevesI: Date = new Date(new Date().setHours(0, 0, 0, 0));
  juevesF: Date = new Date(new Date().setHours(0, 0, 0, 0));
  viernesI: Date = new Date(new Date().setHours(0, 0, 0, 0));
  viernesF: Date = new Date(new Date().setHours(0, 0, 0, 0));
  /*timepicker example */

  public minLu: Date = new Date(new Date().setHours(0, 0, 0, 0)); // se asigna en hora minina las 00:00
  public minMa: Date = new Date(new Date().setHours(0, 0, 0, 0));
  public minMi: Date = new Date(new Date().setHours(0, 0, 0, 0));
  public minJu: Date = new Date(new Date().setHours(0, 0, 0, 0));
  public minVi: Date = new Date(new Date().setHours(0, 0, 0, 0));

  habilitarLunes: boolean = false;
  habilitarLunesFin: boolean = false;
  habilitarMartes: boolean  = false;
  habilitarMartesFin: boolean  = false;
  habilitarMiercoles: boolean = false;
  habilitarMiercolesFin: boolean = false;
  habilitarJueves: boolean  = false;
  habilitarJuevesFin: boolean  = false;
  habilitarViernes: boolean  = false;
  habilitarViernesFin: boolean  = false;

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;

  context: CursoEspecificoComponent;
  registros: Array<Profesor>;
  registroSeleccionado: ProfesorMateria = null;
  registrosProfesores: Array<ProfesorMateria> = [];
  profesorMateria: Array<ProfesorMateria> = [];
  entidadMateriaOptativaCurso: MateriaImpartida;
  titular: boolean = false;
  titular1: boolean = false;
  titular2: boolean = false;
  promocion: Promocion;
  idCursoOptativo: number;
  hayProfesorTitular: boolean = false;
  edicion: any = false;
  cursoOptativoEdicionId: number = null;
  tipoDeMataria: number;
  edicionFormulario = null;
  idLGACSelect: number = undefined;

  public configuracion: any = {
    paginacion: true
  };

  columnas: Array<any> = [
    { titulo: 'Profesor', nombre: 'clave', sort: false},
    { titulo: 'Titular de la materia', nombre: 'titular' },
    { titulo: 'Horas asignadas', nombre: 'horasAsignadas' }
  ];

  // Services
  lgacService;
  materiaService;
  materiaImpartidaService;
  promocionService;
  profesoresService;
  profesorMateriaService;
  salasService;
  horarioService;
  periodoEscolarService;
  formularioProfesorMateria: FormGroup;
  formularioHorarios: FormGroup;
  formularioMateriaImpartida: FormGroup;
  contentAdvert: String;

  private opcionesCursoBase: Array<ItemSelects> = [];
  private opcionesProfesores: Array<ItemSelects> = [];
  private opcionesAulas: Array<ItemSelects> = [];
  private opcionesCatalogoPeriodoEscolar: Array<ItemSelects> = [];
  private opcionesLgacs: Array<ItemSelects> = [];
  private opcionesMaterias: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  params;
  tipoGuardado: number;

  // nuevas varialbes
  private idProgramaDocente: number;
  private idMateria: number;
  private idPromocion: number;
  private idPeriodoEScola; number;
  private numeroPeriodo: number;
  private idTipoMateria: number;

  constructor(private _router: Router, private _route: ActivatedRoute,
              private _catalogosServices: CatalogosServices,
              private injector: Injector, private _renderer: Renderer,
              private _spinner: SpinnerService ) {

    _route.params.subscribe(params => {
      this.params = params;
    });

    this.prepareServices();
    this.inicializarVariables();
    this.inicilizarFormularioProfesorMateria();
    this.inicializarFormularioHorario();
    this.inicializarFormularioMateriaImpartida();
    this.obtenerListaCursosBases();
    this.obtenerListaLGACS();
    this.obtenerCursosEspecificos();

  }

  inicializarVariables() {
    this.idProgramaDocente = this.params.idProGD;
    this.idPromocion = this.params.idPro;
    this.idMateria = this.params.idMat;
    this.idPeriodoEScola = this.params.idPerEs;
    this.numeroPeriodo = this.params.numPer;
    this.tipoDeMataria = this.params.idTipoMat;
    this.edicion = <any>this.params.edt;
    if (this.convertToBoolean(this.edicion)) {
      this.obtenerMateriaImpartida(this.params.idMatRegSecc);
    }
  }

  inicilizarFormularioProfesorMateria(): void {
    this.formularioProfesorMateria = new FormGroup({

      horasAsignadas: new FormControl('', Validators.compose([
        Validacion.numerosValidator, Validators.required])),
      idProfesor: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      idMateriaImpartida: new FormControl('', Validators.required),
      idEstatus: new FormControl('')
    });

  }

  inicializarFormularioHorario(): void {
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

  inicializarFormularioMateriaImpartida(): void {
    this.formularioMateriaImpartida = new FormGroup({
      idMateria: new FormControl('', Validators.required),
      idTemarioParticular: new FormControl(''),
      idPeriodoEscolar: new FormControl(''),
      idPromocion: new FormControl(''),
      numeroPeriodo: new FormControl(''),
      idSala: new FormControl(''),
      idHorario: new FormControl(''),
      idLgac: new FormControl(''),
      idCursoOptativo: new FormControl(''),
      idEstatus: new FormControl(''),
      idActaCalificacion: new FormControl('')
    });
  }

  obtenerMateriaImpartida(idMateriaImp: number): void { // Materia impartida curso lgac
    this.materiaImpartidaService.getEntidadMateriaImpartida(
      idMateriaImp,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadMateriaOptativaCurso =
          new MateriaImpartida (response.json());
        (<FormControl>this.formularioProfesorMateria.
          controls['idMateriaImpartida']).
        setValue(this.entidadMateriaOptativaCurso.id);
        this.cargarDatosMateriaImpartida();
        this.onCambiosTabla();
      }
    );
  }

  obtenerListaCursosBases(): void {
    this.opcionesCursoBase = [];
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idTipo.id~5:IGUAL,idProgramaDocente~'
      + this.idProgramaDocente + ':IGUAL;AND');
    /*this.opcionesCursoBase = this.materiaService.
     getSelectMateriasFiltrado(this.erroresConsultas, urlParameter);*/
    this.materiaService.getSelectMateriaNombre(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let respuesta = response.json().lista;
        respuesta.forEach((item) => {
          this.opcionesCursoBase.push(
            new ItemSelects(
              item.id,
              item.clave + ' - ' + item.descripcion));
        });
      }
    );
  }

  obtenerListaLGACS(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~'
      + this.idProgramaDocente + ':IGUAL');
    this.lgacService.getListaLgac(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        this.opcionesLgacs = [];
        let respuesta = response.json().lista;
        respuesta.forEach((item) => {
          this.opcionesLgacs.push(
            new ItemSelects(
              item.id,
              item.denominacion));
        });
      },
      () => {
        //// console.log('opcioensMaterias', this.opcionesLgacs);
      }

    );
  }

  obtenerCursosEspecificos(): void
  {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idTipo~7' + ':IGUAL;AND,' + 'idProgramaDocente~' +
      this.idProgramaDocente + ':IGUAL;AND');
    //// console.log('urlParameter',urlParameter);
    this.materiaService.getSelectMateriaNombre(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        this.opcionesMaterias = [];
        let respuesta = response.json().lista;
        respuesta.forEach((item) => {
          this.opcionesMaterias.push(
            new ItemSelects(
              item.id,
              item.clave + ' - ' + item.descripcion));
        });
      }
    );
  }

  obteneridLGAC(idLGAC: number): void {
    this.idLGACSelect = idLGAC;
  }

  verificarCurso(idCursoOptativo): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    // this._spinner.start("verificarCurso");
    urlParameter.set('criterios', 'idMateria.id~' +
      this.idMateria + ':IGUAL,' +
      'idCursoOptativo~' + idCursoOptativo + ':IGUAL' + ',idPromocion~' +
      this.idPromocion + ':IGUAL,idPeriodoEscolar~'
      + this.idPeriodoEScola + ':IGUAL;AND'
    );
    // this._spinner.start('verificarElCurso');
    this._spinner.start("verificarCurso");
    this.materiaImpartidaService.getListaMateriaImpartida(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        // console.log(response.json());
        if (response.json().lista.length > 0) {
          let entidadCursoOptativo: MateriaImpartida = null;
          entidadCursoOptativo = new MateriaImpartida(response.json().lista[0]);
          if (this.convertToBoolean(this.edicion)) {
            if (entidadCursoOptativo.estatus.id === 1222) {
              // console.log('YA HAY UNA MATERIAIMPARTIDA CURSO BASE AGREGADA A ESTA MATERIA');

              this.modalAdvertencia('Este curso base ya está agregado, elija otro.', 1);
              this.cargarDatosMateriaImpartida();
            }
            if (entidadCursoOptativo.estatus.id === 1227) {
              // console.log('CURSO ESTATUS ' + entidadCursoOptativo.estatus.id);
              this.eliminarCursoOptativo(entidadCursoOptativo.id);
              let urlParameter: URLSearchParams = new URLSearchParams();
              urlParameter.set('criterios', 'idMateriaImpartida~' +
                entidadCursoOptativo.estatus.id + ':IGUAL');
              this.profesorMateriaService.getListaProfesorMateria(
                this.erroresConsultas,
                urlParameter
              ).subscribe(
                response => {
                  let profesorMateria: Array <ProfesorMateria> = [];
                  if (response.json().lista.length > 0) {
                    let i = 0;
                    response.json().lista.forEach((item) => {
                      profesorMateria.push(new ProfesorMateria(item));
                      //// console.log(profesorMateria[i].id);
                      this.eliminarProfesor(profesorMateria[i].id);
                      i++;
                    });
                  } else {
                    //// console.log('No hay profesores para eliminar');
                  }
                }
              );
              this.cargarDatosMateriaImpartida();
              this._spinner.stop("verificarCurso");
            }
          } else {
            if (entidadCursoOptativo.estatus.id === 1222) {
              this.modalAdvertencia
              ('Este curso base ya está agregado, elija otro.', 1);
              this._spinner.stop("verificarCurso");
            }
            if (entidadCursoOptativo.estatus.id === 1222 &&
              this.entidadMateriaOptativaCurso) {
              this.modalAdvertencia('Este curso LGAC ya está agregado.', 1);
              this.cargarDatosMateriaImpartida();
              this._spinner.stop("verificarCurso");
            }
            if (entidadCursoOptativo.estatus.id === 1227) {
              this.entidadMateriaOptativaCurso = entidadCursoOptativo;
              (<FormControl>this.formularioProfesorMateria.
                controls['idMateriaImpartida']).
              setValue(this.entidadMateriaOptativaCurso.id);
              //// console.log('HAY UNA MATERIAIMPARTIDA CURSO BASE ' + 'AGREGADA estatus inactivo');
              this.verificarProfesoresInactivos();
              this.cargarDatosMateriaImpartida();
            }
          }
        } else {
          // console.log('Creo no hay curso optavio agregado');
          if (this.convertToBoolean(this.edicion)) {
            // console.log('NO hay materia::' + idCursoOptativo);
            this.cursoOptativoEdicionId = idCursoOptativo;
            this._spinner.stop("verificarCurso");
          } else {
            // console.log('NO HAY UNA MATERIAIMPARTIDA CURSO ' + 'BASE AGREGADA A ESTA MATERIA', idCursoOptativo);
            this.crearMICursoOptativoInicio(idCursoOptativo);
          }

          //  }
        }
      },
      error => {
        this._spinner.stop('verificarCurso');
      },
      () => {
        this._spinner.stop('verificarCurso');
      }
    );
  }

  verificarProfesoresInactivos(): void {
    if (this.entidadMateriaOptativaCurso.estatus.id === 1227) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idMateriaImpartida~' +
        this.entidadMateriaOptativaCurso.id + ':IGUAL');
      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          let profesorMateria: Array<ProfesorMateria> = [];
          if (response.json().lista.length > 0) {
            let i = 0;
            response.json().lista.forEach((item) => {
              profesorMateria.push(new ProfesorMateria(item));
              // // .log(profesorMateria[i].id);
              this.eliminarProfesor(profesorMateria[i].id);
              i++;
            });
          }else {
            // // .log('No hay profesores para eliminar');
          }
          this._spinner.stop("verificarCurso");
        }

      );
    }
  }

  // Crear Materia Impartida Curso Optativo, con estatus inactivo
  crearMICursoOptativoInicio(idCursoOptativo: number): void {
    // // .log('<<ENTRA>>');
    let jsonFormularioMateriaImpartida = '';
    if ( this.tipoDeMataria == 1 ) {
      jsonFormularioMateriaImpartida =
        '{"idMateria": "' +
        this.idMateria +
        '", "idProgramaParticular":"0' +
        '", "idPeriodoEscolar": "' + this.idPeriodoEScola +
        '", "idPromocion": "' + this.idPromocion +
        '", "numeroPeriodo": "' + this.numeroPeriodo +
        '", "idSala": "0' +
        '", "idHorario": "0' +
        '", "idLgac": "' + this.idLGACSelect +
        '", "idCursoOptativo": "' + idCursoOptativo +
        '", "idActaCalificacion": "' +
        '", "idEstatus": "1227"}';
      //
    } else if ( this.tipoDeMataria == 2 ) {
      jsonFormularioMateriaImpartida =
        '{"idMateria": "' +
        this.idMateria +
        '", "idProgramaParticular":"0' +
        '", "idPeriodoEscolar": "' + this.idPeriodoEScola +
        '", "idPromocion": "' + this.idPromocion +
        '", "numeroPeriodo": "' + this.numeroPeriodo +
        '", "idSala": "0' +
        '", "idHorario": "0' +
        '", "idLgac": "0' +
        '", "idCursoOptativo": "' + idCursoOptativo +
        '", "idActaCalificacion": "' +
        '", "idEstatus": "1227"}';
      //
    }

    this.materiaImpartidaService.postMateriaImpartida(
      jsonFormularioMateriaImpartida,
      this.erroresGuardado
    ).subscribe(
      response => {
        //// .log(response.json());
        let materiaImp = new MateriaImpartida(response.json());
        if (materiaImp) {
          this.obtenerMateriaImpartida(materiaImp.id);
        }
      },
      error => {
        // console.error(error);
      }
    );
  }


  getLunesInicio(): string {
    //// // console.log("lunes ini " + this.lunesI);
    if (this.lunesI) {
      let fechaConFormato =  moment(this.lunesI).format('HH:mm');

      (<FormControl>this.formularioHorarios.controls['lunesInicio'])
        .setValue(fechaConFormato);  // se asigna la nueva hora
      this.minLu = new Date(new Date().setHours(this.lunesI.getHours(), (this.lunesI.getMinutes()+10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      //// // console.log("lunes 1 y 2 " + this.lunesI + " " + this.lunesF);
      if (this.lunesI >= this.lunesF) {
        this.lunesF = new Date(new Date().setHours(this.lunesI.getHours(), (this.lunesI.getMinutes()+10), 0, 0));
        (<FormControl>this.formularioHorarios.controls['lunesFin']).setValue(this.lunesF); // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
      }

      return fechaConFormato;
    }
  }

  getLunesFin(): string {
    //// console.log("lunes fin " + this.lunesF);
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
      this.minMa = new Date(new Date().setHours(this.martesI.getHours(), (this.martesI.getMinutes()+10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.martesI >= this.martesF)
      {
        this.martesF = new Date(new Date().setHours(this.martesI.getHours(), (this.martesI.getMinutes()+10), 0, 0));
        (<FormControl>this.formularioHorarios.controls['martesFin']).setValue(this.martesF); // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
      }
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
      this.minMi = new Date(new Date().setHours(this.miercolesI.getHours(), (this.miercolesI.getMinutes()+10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.miercolesI >= this.miercolesF)
      {
        this.miercolesF = new Date(new Date().setHours(this.miercolesI.getHours(), (this.miercolesI.getMinutes()+10), 0, 0)); // se asigna la hora minima al timepicker, si la hora inicial es mayor o igual  a la final
        (<FormControl>this.formularioHorarios.controls['miercolesFin']).setValue(this.miercolesF); // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
      }
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
      this.minJu = new Date(new Date().setHours(this.juevesI.getHours(), (this.juevesI.getMinutes()+10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.juevesI >= this.juevesF)
      {
        this.juevesF = new Date(new Date().setHours(this.juevesI.getHours(), (this.juevesI.getMinutes()+10), 0, 0)); // se asigna la hora minima al timepicker, si la hora inicial es mayor o igual  a la final
        (<FormControl>this.formularioHorarios.controls['juevesFin']).setValue(this.juevesF); // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
      }
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
      this.minVi = new Date(new Date().setHours(this.viernesI.getHours(), (this.viernesI.getMinutes()+10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.viernesI >= this.viernesF)
      {
        this.viernesF = new Date(new Date().setHours(this.viernesI.getHours(), (this.viernesI.getMinutes()+10), 0, 0)); // se asigna la hora minima al timepicker, si la hora inicial es mayor o igual  a la final
        (<FormControl>this.formularioHorarios.controls['viernesFin']).setValue(this.viernesF); // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
      }

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


  cargarDatosMateriaImpartida(): void {

    if (this.entidadMateriaOptativaCurso) {

      let intMateria = 'idMateria';
      let intTemarioParticular = 'idTemarioParticular';
      let intPeriodoEscolar = 'idPeriodoEscolar';
      let intPromocion = 'idPromocion';
      let intNumeroPeriodo = 'numeroPeriodo';
      let intSala = 'idSala';
      let intHorario = 'idHorario';
      let intLgac = 'idLgac';
      let intIdCursoOptativo = 'idCursoOptativo';
      let intEstatus = 'idEstatus';
      let intActaCalificacion = 'idActaCalificacion';

      (<FormControl>this.formularioMateriaImpartida.controls[intMateria]).
      setValue(this.entidadMateriaOptativaCurso.materia.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intTemarioParticular])
        .setValue(this.entidadMateriaOptativaCurso.temarioParticular.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intPeriodoEscolar])
        .setValue(this.entidadMateriaOptativaCurso.
        periodoEscolar.getPeriodoAnioConsecutivo());
      (<FormControl>this.formularioMateriaImpartida.controls[intPromocion])
        .setValue(this.entidadMateriaOptativaCurso.promocion.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intNumeroPeriodo])
        .setValue(this.entidadMateriaOptativaCurso.numeroPeriodo);
      if(this.entidadMateriaOptativaCurso.estatus.id === 1222)
        (<FormControl>this.formularioMateriaImpartida.controls[intSala])
          .setValue(this.entidadMateriaOptativaCurso.sala.id);

      if(!this.entidadMateriaOptativaCurso.sala.id){
        (<FormControl>this.formularioMateriaImpartida.controls['idSala']).setValue('');
      }

      (<FormControl>this.formularioMateriaImpartida.controls[intHorario])
        .setValue(this.entidadMateriaOptativaCurso.horario.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intLgac])
        .setValue(this.entidadMateriaOptativaCurso.lgac.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intIdCursoOptativo])
        .setValue(this.entidadMateriaOptativaCurso.cursoOptativo.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intActaCalificacion])
        .setValue(this.entidadMateriaOptativaCurso.actaCalificacion.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intEstatus])
        .setValue(this.entidadMateriaOptativaCurso.estatus.id);
    }

    //// console.log('this.materiaImpartida.horario', this.entidadMateriaOptativaCurso);

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
      if (this.entidadMateriaOptativaCurso.horario.lunesInicio && this.entidadMateriaOptativaCurso.horario.lunesInicio != ''){
        let fecha = this.entidadMateriaOptativaCurso.horario.lunesInicio.split(":");
        this.lunesI = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        (<FormControl>this.formularioHorarios.controls[StringLunesInicio])
          .setValue(this.lunesI);
      }
      if (this.entidadMateriaOptativaCurso.horario.lunesFin && this.entidadMateriaOptativaCurso.horario.lunesFin != ''){
        let fecha = this.entidadMateriaOptativaCurso.horario.lunesFin.split(":");
        this.lunesF = new Date(new Date().setHours(Number.parseInt(fecha[0]),Number.parseInt(fecha[1]),0,0));
        // console.log('lunesF asign ' + this.lunesF);
        (<FormControl>this.formularioHorarios.controls[StringLunesFin])
          .setValue(this.lunesF);
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

      if(this.entidadMateriaOptativaCurso.horario.lunesInicio &&
        this.entidadMateriaOptativaCurso.horario.lunesFin){
        this.habilitarLunes = true;
        this.habilitarLunesFin = true;
      }if(this.entidadMateriaOptativaCurso.horario.martesInicio &&
        this.entidadMateriaOptativaCurso.horario.martesFin){
        this.habilitarMartes = true;
        this.habilitarMartesFin = true;
      }if(this.entidadMateriaOptativaCurso.horario.miercolesInicio &&
        this.entidadMateriaOptativaCurso.horario.miercolesFin){
        this.habilitarMiercoles = true;
        this.habilitarMiercolesFin = true;
      }if(this.entidadMateriaOptativaCurso.horario.juevesInicio &&
        this.entidadMateriaOptativaCurso.horario.juevesFin){
        this.habilitarJueves = true;
        this.habilitarJuevesFin = true;
      }if(this.entidadMateriaOptativaCurso.horario.viernesInicio &&
        this.entidadMateriaOptativaCurso.horario.viernesFin){
        this.habilitarViernes = true;
        this.habilitarViernesFin = true;
      }

    }
    this._spinner.stop("verificarCurso");
  }

  horarioLunesValido(): boolean {
    let valido = false;
    let horaInicio = undefined;
    let horaFin = undefined;

    if (this.lunesI && this.lunesF) {
      horaInicio = this.lunesI.getHours() + ':' + this.lunesI.getMinutes();
      horaFin = this.lunesF.getHours() + ':' + this.lunesF.getMinutes();
    }

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

  cerrarModalAlerta(): void {
    this.mAdvertencia.close();
    //this.dialog.close();
  }

  cerrarModal(): void {
    if (this.haySessionStorage()) {
      this._router.navigate(['materias', 'curso-especifico',
      {
        id: sessionStorage.getItem('id'),
        idPe: sessionStorage.getItem('idPe'),
        idPr: sessionStorage.getItem('idPr'),
        idTipoMateria: sessionStorage.getItem('idTipoMateria')
      }]);
    }
  }

  private haySessionStorage(): boolean {
    if ( sessionStorage.getItem('id') !== undefined &&
      sessionStorage.getItem('idPre') !== undefined &&
      sessionStorage.getItem('idPr') !== undefined &&
      sessionStorage.getItem('idTipoMateria') !== undefined ) {
        return true;
    } else {
      return false;
    }
  }

  cambioRadio(titular: boolean): void {
    this.hayProfesorTitular = false;
    if(titular === true)
      this.titular1 = true;
    else
      this.titular2 = true;
    if (titular === true) {
      this._spinner.start("cambioRadio");
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'titular~true:IGUAL,' +
        'idMateriaImpartida~' + this.entidadMateriaOptativaCurso.id + ':IGUAL';

      if (this.entidadMateriaOptativaCurso.estatus.id === 1227) {
        criterios = criterios + ',idEstatus.id~1229:IGUAL;AND';
      }
      if (this.entidadMateriaOptativaCurso.estatus.id === 1222) {
        criterios = criterios + ',idEstatus.id~1228:IGUAL;AND';
      }

      urlParameter.set('criterios', criterios);

      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          let profesor: ProfesorMateria;
          if (response.json().lista.length > 0) {
            profesor = new ProfesorMateria(response.json().lista[0]);
            this._spinner.stop("cambioRadio");
            this.modalAdvertencia('Ya hay un profesor titular para este curso', 1);
            this.hayProfesorTitular = true;
          }else {
            this._spinner.stop("cambioRadio");
          }
        },
        error => {
        });
    }else {
      //// console.log('ENTER TO CHANGE VALUE');
      this.hayProfesorTitular = false;
    }

    (<FormControl>this.formularioProfesorMateria.controls['titular']).setValue(titular);
  }

  validarProfesor(): void {
    // console.log('validarProfesor');
    if (this.validarFormulario()) {
      if (this.hayProfesorTitular === false) {
        if (this.registroSeleccionado) {
          this.modalConfirmacion('¿Está seguro de actualizar este profesor?', 1);
        } else {
          this.modalConfirmacion('¿Está seguro de agregar este profesor?', 1);
        }
      }else {
        this.modalAdvertencia
        ('Ya hay un profesor titular, por favor modifique el valor', 1);
        this.titular1 = false;
        this.titular2 = false;
        this.hayProfesorTitular = true;
      }
    }
  }

  guardarProfesor(): void {
    // console.log('guardarProfesor');
    if (this.entidadMateriaOptativaCurso.estatus.id === 1222) {
      //// console.log('ENTRA A COMPARAR ESTATUS' + this.entidadMateriaOptativaCurso.estatus.id);
      (<FormControl>this.formularioProfesorMateria.
        controls['idEstatus']).setValue(1228);
    }
    if (this.entidadMateriaOptativaCurso.estatus.id === 1227) {
      //// console.log('ENTRA A COMPARAR ESTATUS' + this.entidadMateriaOptativaCurso.estatus.id);
      (<FormControl>this.formularioProfesorMateria.
        controls['idEstatus']).setValue(1229);
    }
    if (this.registroSeleccionado) {
      (<FormControl>this.formularioProfesorMateria.
        controls['idMateriaImpartida']).setValue(this.entidadMateriaOptativaCurso.id);
      let jsonFormularioPM = JSON.stringify(this.formularioProfesorMateria.value, null, 2);
      //// console.log(jsonFormularioPM);
      this._spinner.start("guardarProfesor");
      if (this.edicionFormulario) {
        this.profesorMateriaService.putProfesorMateria(
          this.registroSeleccionado.id,
          jsonFormularioPM,
          this.erroresGuardado
        ).subscribe(
          response => {},
          error => {}, //// console.log('Success'),
          // console.error,
          () => {
            this._spinner.stop("guardarProfesor");
            this.limpiarCampos();
            this.addErrorsMesaje('El profesor se actualizó correctamente', 'success');
            this.registroSeleccionado = null;
            this.onCambiosTabla();
          }
        );
      }
    } else {

      let jsonFormularioPM =
        JSON.stringify(this.formularioProfesorMateria.value, null, 2);
      //// console.log(jsonFormularioPM);
      this._spinner.start("guardarProfesor");
      this.profesorMateriaService.postProfesorMateria(
        jsonFormularioPM,
        this.erroresGuardado
      ).subscribe(
        response => {},
        error => {}, //// console.log('Success'),
        // console.error,
        () => {
          this._spinner.stop("guardarProfesor");
          this.limpiarCampos();
          this.addErrorsMesaje('El profesor se guardó correctamente', 'success');
          this.registroSeleccionado = null;
          this.onCambiosTabla();
        }
      );
    }
  }

  limpiarCampos(): void {
    (<FormControl>this.formularioProfesorMateria.
      controls['horasAsignadas']).setValue(null);
    (<FormControl>this.formularioProfesorMateria.
      controls['idProfesor']).setValue('');
    (<FormControl>this.formularioProfesorMateria.
      controls['titular']).setValue(null);
    this.titular1 = false;
    this.titular2 = false;
  }

  verificarProfesor(idProfesor: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterios = 'idProfesor.id~' + idProfesor + ':IGUAL,' +
      'idMateriaImpartida.id~' + this.entidadMateriaOptativaCurso.id + ':IGUAL';

    if (this.entidadMateriaOptativaCurso.estatus.id === 1227) {
      criterios = criterios + ',idEstatus.id~1229:IGUAL;AND';
    }
    if (this.entidadMateriaOptativaCurso.estatus.id === 1222) {
      criterios = criterios + ',idEstatus.id~1228:IGUAL;AND';
    }

    urlParameter.set('criterios', criterios);
    this._spinner.start("verificarProfesor");
    this.profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let profesor: ProfesorMateria;
        if (response.json().lista.length > 0) {
          profesor = new ProfesorMateria(response.json().lista[0]);
          (<FormControl>this.formularioProfesorMateria.controls['idProfesor'])
            .setValue('');
          this._spinner.stop("verificarProfesor");
          this.modalAdvertencia('Este profesor ya está agregado en la lista', 1);
          // profesor = null;
        }else {
          this._spinner.stop("verificarProfesor");
        }
      },
      error => {
        // console.error(error);
      }
    );
  }

  eliminarProfesor(idProfesorMateria: number): void {
    if (this.registroSeleccionado) {
      this._spinner.start("eliminarProfesor");
    }
    this.profesorMateriaService.deleteProfesorMateria(
      idProfesorMateria,
      this.erroresConsultas
    ).subscribe(
      response => {
        //// console.log('success');
      },
      error => {
        // console.error(error);
      },
      () => {
        this.limpiarCampos();
        this.addErrorsMesaje('El profesor se eliminó correctamente', 'warning');
        this.registroSeleccionado = null;
        this.onCambiosTabla();
      }
    );
  }

  validarProfesorTitular(): void {  //validar que haya profesor titular
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMateriaImpartida~' +
      this.entidadMateriaOptativaCurso.id + ':IGUAL');
    this._spinner.start("validarProfesorTitular");
    this.profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        this.profesorMateria = [];
        if (response.json().lista.length > 0) {
          this.titular = false;
          response.json().lista.forEach((item) => {
            this.profesorMateria.push(new ProfesorMateria(item));
          });
          this.profesorMateria.forEach((profesor) => {
            //// console.log(profesor);
            if (profesor.titular === true) {
              this.titular = true;
            }
          });
        }
      },
      error => {
        // console.error(error);
      },
      () => {
        if (this.titular) {
          this._spinner.stop("validarProfesorTitular");
          if (this.convertToBoolean(this.edicion)) {
            this.modalConfirmacion('¿Está seguro de actualizar este registro?', 2);
          }else {
            this.modalConfirmacion('¿Está seguro de guardar este registro?', 2);
          }
        } else {
          this._spinner.stop("validarProfesorTitular");
          this.modalAdvertencia('Debe haber un profesor titular en el curso', 1);
        }
      }
    );
  }

  enviarFormulario(): void {

    this._spinner.start("enviarFormulario");

    let jsonFormularioHorario = JSON.stringify
    (this.formularioHorarios.value, null, 2);
    // console.log('jsonFormulairoHorario', jsonFormularioHorario);

    if (!this.entidadMateriaOptativaCurso.horario.id) {
      this.horarioService.postHorariosMateria(
        jsonFormularioHorario,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log('response postHorarioMateria', response);
          let horarioMateria = new HorariosMateria(response.json());
          //// console.log('Entra a Form');
          this.profesorMateria.forEach((profesor) => {
            //// console.log(profesor);
            if (profesor.estatus.id === 1229) {
              //// console.log('Cambia los estatus de los profesores');
              this.cambiarEstatusProfesorMateria(profesor.id);
            }
          });
          this.guardarMateriaImpartidaEdicion(horarioMateria.id);
        }
      );
    }else {
      this.horarioService.putHorariosMateria(
        this.entidadMateriaOptativaCurso.horario.id,
        jsonFormularioHorario,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log('response putHorarioMateria', response);
        },
        () => {}, //// console.log('Success'),
        // console.error,
        () => {
          this.profesorMateria.forEach((profesor) => {
            //// console.log(profesor);
            if (profesor.estatus.id === 1229) {
              //// console.log('Cambia los estatus de los profesores');
              this.cambiarEstatusProfesorMateria(profesor.id);
            }
          });
          this.guardarMateriaImpartidaEdicion
          (this.entidadMateriaOptativaCurso.horario.id);
        }
      );
    }
  }

  cambiarEstatusProfesorMateria(idProfesorMateria): void {

    let jsonCambiarEstatus = JSON.stringify({'id': idProfesorMateria, 'idEstatus': '1228'}, null , 2);
    this.profesorMateriaService.putProfesorMateria(
      idProfesorMateria,
      jsonCambiarEstatus,
      this.erroresGuardado
    ).subscribe(
      () => {}, //// console.log('Success'),
      // console.error,
      () => {
        //// console.log('Cambia estatus');
      }
    );
  }

  guardarMateriaImpartidaEdicion(horarioMateriaId: number){
    if (horarioMateriaId) {
      (<FormControl>this.formularioMateriaImpartida.
        controls['idHorario']).setValue(horarioMateriaId);
    }
    (<FormControl>this.formularioMateriaImpartida.
      controls['idMateria']).setValue(this.entidadMateriaOptativaCurso.materia.id);
    (<FormControl>this.formularioMateriaImpartida.
      controls['idPeriodoEscolar']).setValue
    (this.entidadMateriaOptativaCurso.periodoEscolar.id);
    (<FormControl>this.formularioMateriaImpartida.
      controls['idPromocion']).setValue(this.entidadMateriaOptativaCurso.promocion.id);
    (<FormControl>this.formularioMateriaImpartida.
      controls['numeroPeriodo']).setValue(this.entidadMateriaOptativaCurso.numeroPeriodo);
    (<FormControl>this.formularioMateriaImpartida.
      controls['idEstatus']).setValue('1222');
    let jsonFormularioMateriaImpartida =
      JSON.stringify(this.formularioMateriaImpartida.value, null, 2);
    // console.log('JSON MI::', jsonFormularioMateriaImpartida);

    this.materiaImpartidaService.putMateriaImpartida(
      this.entidadMateriaOptativaCurso.id,
      jsonFormularioMateriaImpartida,
      this.erroresGuardado
    ).subscribe(
      response => {
        // console.log('response', response);
      },
      () => {}, //// console.log('Success'),
      // console.error,
      () => {
        //// console.log('successsss');
        // this.cargarDatosMateriaImpartida();
        //// console.log('Entrar');
        this._spinner.stop("enviarFormulario");
        this.cerrarModal();
        if (this.convertToBoolean(this.edicion)) {
          // this.context.tipoAlerta = 1;
        }else {
          // this.context.tipoAlerta = 2;
        }
      }
    );
  }

  cancelarRegistro(): void {
    this._spinner.start("cancelarRegistro");
    if (this.entidadMateriaOptativaCurso.estatus.id === 1222) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idMateriaImpartida~' +
        this.entidadMateriaOptativaCurso.id + ':IGUAL');
      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          let profesorMateria: Array<ProfesorMateria> = [];
          if (response.json().lista.length > 0) {
            this.titular = false;
            response.json().lista.forEach((item) => {
              profesorMateria.push(new ProfesorMateria(item));
            });
            profesorMateria.forEach((profesor) => {
              //// console.log(profesor);
              if (profesor.titular === true) {
                this.titular = true;
              }
            });
          }
        },
        error => {
          // console.error(error);
        },
        () => {
          if (this.titular) {
            this.cerrarModal();
            // this.context.onCambiosTabla();
            this._spinner.stop("cancelarRegistro");
            //// console.log('Hay profesor titular en el curso');
          }else {
            this._spinner.stop("cancelarRegistro");
            this.modalAdvertencia('Debe haber un profesor titular en el curso', 1);
          }
        }
      );
    }
    if (this.entidadMateriaOptativaCurso.estatus.id === 1227) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idMateriaImpartida~' +
        this.entidadMateriaOptativaCurso.id + ':IGUAL');
      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          let profesorMateria: Array<ProfesorMateria> = [];
          if (response.json().lista.length > 0) {
            let i = 0;
            response.json().lista.forEach((item) => {
              profesorMateria.push(new ProfesorMateria(item));
              //// console.log(profesorMateria[i].id);
              this.eliminarProfesor(profesorMateria[i].id);
              i++;
            });
          }else {
            //// console.log('No hay profesores para eliminar');
          }
          //// console.log('Entra aca:');
          this.eliminarCursoOptativo(this.entidadMateriaOptativaCurso.id);
        }

      );
    }
  }

  eliminarCursoOptativo(idCursoOptativo: number): void{
    this.materiaImpartidaService.deleteMateriaImpartida(
      idCursoOptativo,
      this.erroresConsultas
    ).
    subscribe(
      response => {
        //// console.log('SE ELIMINO TODoO::::');

        this._spinner.stop("cancelarRegistro");
        this._spinner.stop("verificarCurso");
        this.cerrarModal();
      }
    );
  }

  validarFormulario(): boolean {
    if (this.formularioProfesorMateria.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarFormularioHorario(): boolean {
    if (this.formularioHorarios.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioProfesorMateria.controls[campo]);
  }

  getControlHorario(campo: string): FormControl {
    return (<FormControl>this.formularioHorarios.controls[campo]);
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    criterios = criterios + ((criterios === '') ? '' : ',') + 'idMateriaImpartida~' +
      this.entidadMateriaOptativaCurso.id + ':IGUAL';

    if (this.entidadMateriaOptativaCurso.estatus.id === 1227) {
      criterios = criterios + ',idEstatus.id~1229:IGUAL;AND';
    }
    if (this.entidadMateriaOptativaCurso.estatus.id === 1222) {
      criterios = criterios + ',idEstatus.id~1228:IGUAL;AND';
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
    }

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    urlSearch.set('criterios', criterios);
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    //this._spinner.start();
    this.profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registrosProfesores = [];
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
          this.registrosProfesores.push(new ProfesorMateria(item));
        });
        this._spinner.stop("idMateriaOptativaCurso");
        this._spinner.stop("guardarProfesor");
        this._spinner.stop("eliminarProfesor");
      },
      error => {
        // console.error('error');
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.edicionFormulario = true;
      let profesorMateria : ProfesorMateria;
      this._spinner.start("rowSeleccion");
      this.profesorMateriaService.
      getEntidadProfesorMateria(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        response => {
          profesorMateria = new ProfesorMateria(
            response.json()
          );
          //// console.log('this profesorMateria:::>' + profesorMateria);
        },
        // en caso de presentarse un error se agrega un nuevo error al array errores
        error => {
          // console.error(error);

        },
        () => {

          if (this.formularioProfesorMateria) {
            let intHorasAsignadas = 'horasAsignadas';
            let intIdProfesor = 'idProfesor';
            let boolenTtitular = 'titular';
            let intEstatus = 'idEstatus';

            (<FormControl>this.formularioProfesorMateria.controls[intHorasAsignadas])
              .setValue(profesorMateria.horasAsignadas);
            (<FormControl>this.formularioProfesorMateria.controls[intIdProfesor])
              .setValue(profesorMateria.profesor.id);
            (<FormControl>this.formularioProfesorMateria.controls[boolenTtitular])
              .setValue(profesorMateria.titular);
            (<FormControl>this.formularioProfesorMateria.controls[intEstatus])
              .setValue(profesorMateria.estatus);

            if (profesorMateria.titular)
              this.titular1 = true;
            else
              this.titular2 = true;

            this._spinner.stop("rowSeleccion");
          }
        }
      );

    } else {
      this.registroSeleccionado = null;
      this.limpiarCampos();
    }
  }

  modalAdvertencia(mensajeAdvertencia: String, tipoGuardado: number): void {
    this.contentAdvert = mensajeAdvertencia;
    this.tipoGuardado = tipoGuardado;
    this.mAdvertencia.open('sm');
  }

  mensajeConfirmacion:String;
  modalConfirmacion(mensajeAdvertencia: String, tipoGuardado: number):void {
    this.mensajeConfirmacion = mensajeAdvertencia;
    this.tipoGuardado = tipoGuardado;
    this.mConfirmacion.open("sm");

  }

  cerrarModalConfirmacion(){
    this.mConfirmacion.close();
  }

  opcionGuardado(): void {
    if (this.tipoGuardado == 1) {
      this.mConfirmacion.close();
      this.guardarProfesor();
    }
    if (this.tipoGuardado == 2) {
      this.mConfirmacion.close();
      this.enviarFormulario();
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
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
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

  detenerSpinner(): void {
    this._spinner.stop("spinner");
  }

  limpiarInput(valor, dia): void {
    //// console.log('esto es lo que obtine:::::::::::::::' + valor + dia);
    if (valor === false) {
      if (dia === 'L') {
        this.lunesI = void 0;
        this.lunesF = void 0;
        this.lunesI = new Date(new Date().setHours(0, 0, 0, 0));
        this.lunesF = new Date(new Date().setHours(0, 0, 0, 0));
        this.habilitarLunes = false;
        this.habilitarLunesFin = false;
      } else if (dia === 'M') {
        this.martesI = void 0;
        this.martesF = void 0;
        this.martesI = new Date(new Date().setHours(0, 0, 0, 0));
        this.martesF = new Date(new Date().setHours(0, 0, 0, 0));
        this.habilitarMartes = false;
      } else if (dia === 'Mi') {
        this.miercolesI = void 0;
        this.miercolesF = void 0;
        this.miercolesI = new Date(new Date().setHours(0, 0, 0, 0));
        this.miercolesF = new Date(new Date().setHours(0, 0, 0, 0));
        this.habilitarMiercoles = false;

      } else if (dia === 'J') {
        this.juevesI = void 0;
        this.juevesF = void 0;
        this.juevesI = new Date(new Date().setHours(0, 0, 0, 0));
        this.juevesF = new Date(new Date().setHours(0, 0, 0, 0));
        this.habilitarJueves = false;
      } else if (dia === 'V') {
        this.viernesI = void 0;
        this.viernesF = void 0;
        this.viernesI = new Date(new Date().setHours(0, 0, 0, 0));
        this.viernesF = new Date(new Date().setHours(0, 0, 0, 0));
        this.habilitarViernes = false;
      }
    }else {
      switch (dia){
        case 'L':
          this.habilitarLunes = true;
          this.habilitarLunesFin = false;
          break;
        case 'M':
          this.habilitarMartes = true;
          this.habilitarMartesFin = false;
          break;
        case 'Mi':
          this.habilitarMiercoles = true;
          this.habilitarMiercolesFin = false;

          break;
        case 'J':
          this.habilitarJueves = true;
          this.habilitarJuevesFin = false;
          break;
        case 'V':
          this.habilitarViernes = true;
          this.habilitarViernesFin = false;
          break;
        default:
          break;
      }
    }
  }

  verificarHabilitarCampo(dia): void {
    switch (dia){
      case 'L':
        if(this.getControlHorario('lunesInicio').value)
          this.habilitarLunesFin = true;
        break;
      case 'M':
        if(this.getControlHorario('martesInicio').value)
          this.habilitarMartesFin = true;
        break;
      case 'Mi':
        if(this.getControlHorario('miercolesInicio').value)
          this.habilitarMiercolesFin = true;
        break;
      case 'J':
        if(this.getControlHorario('juevesInicio').value)
          this.habilitarJuevesFin = true;
        break;
      case 'V':
        if(this.getControlHorario('viernesInicio').value)
          this.habilitarViernesFin = true;
        break;
      default:
        break;
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioProfesorMateria.controls[campo]).
        valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private errorMessage(control: FormControl): string {
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

  private prepareServices(): void {
    this.materiaService = this._catalogosServices.getMateria();
    this.salasService = this._catalogosServices.getSalas();
    this.profesoresService = this._catalogosServices.getProfesor();
    this.profesorMateriaService =
      this._catalogosServices.getProfesorMateriaService();
    this.materiaImpartidaService =
      this._catalogosServices.getMateriaImpartidaService();
    this.promocionService = this._catalogosServices.getPromocion();
    this.periodoEscolarService = this._catalogosServices.getPeriodoEscolar();
    this.horarioService = this._catalogosServices.getHorariosMateriaService();

    this.opcionesAulas = this.salasService.getSelectSala(this.erroresConsultas);
    this.opcionesProfesores = this.profesoresService.getSelectProfesor(this.erroresConsultas);
    this.opcionesCatalogoPeriodoEscolar =
      this.periodoEscolarService.getSelectPeriodoEscolarPeriodo(this.erroresConsultas);
    this.lgacService = this._catalogosServices.getlgac();
  }

  private convertToBoolean(input: string): boolean | undefined {
    try {
        return JSON.parse(input);
    } catch (e) {
        return undefined;
    }
  }

  ngOnInit(): void {
    /*
    
    this.tipoDeMataria = this.context.idTipoMateria;
    // console.log(this.context.registroSeleccionado) ;
    if( !isNullOrUndefined(this.context.registroSeleccionado) )
      // console.log(this.context.registroSeleccionado.materiaImpartida.id) ;
    if (this.context.registroSeleccionado != null && this.context.registroSeleccionado.materiaImpartida.id) {
      this._spinner.start("idMateriaOptativaCurso");
      this.edicion = true;
      this.obtenerMateriaImpartida(this.context.registroSeleccionado.materiaImpartida.id);
    }*/
  }

  opcionCancelado(): void {
    if (this.tipoGuardado == 1) {

      this.mAdvertencia.close();
      this.guardarProfesor();
    }
    if (this.tipoGuardado == 2) {
      this.mAdvertencia.close();
      this.eliminarProfesor(this.registroSeleccionado.id);
    }
    if (this.tipoGuardado == 3) {
      this.mAdvertencia.close();
      if (this.entidadMateriaOptativaCurso) {
        this.cancelarRegistro();
      }else {
        // // console.log('entra a cerrar modal');
        this.cerrarModal();
      }
    }
  }

}
