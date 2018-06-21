import {Component, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {errorMessages} from '../../utils/error-mesaje';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {PlanEstudiosMateria} from '../../services/entidades/plan-estudios-materia.model';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {Validacion} from '../../utils/Validacion';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment/moment';
import {Profesor} from '../../services/entidades/profesor.model';
import {HorariosMateria} from '../../services/entidades/horarios-materia.model';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-gestion-curso-base',
  templateUrl: './gestion-curso-base.component.html',
  styleUrls: ['./gestion-curso-base.component.css']
})
export class GestionCursoBaseComponent implements OnInit {


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

  router: Router;
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  edicionFormulario: boolean = false;
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;
  registroSeleccionado: ProfesorMateria;
  materiaImpartida : MateriaImpartida;
  hayProfesorTitular: boolean = false;
  titular: boolean = false;
  idPlanEstudioMateria: number;
  promocion: Promocion;
  entidadPlanEstudioMateria: PlanEstudiosMateria;
  edicion: boolean = false;
  profesorMateria: Array<ProfesorMateria> = [];
  registrosProfesores: Array<ProfesorMateria> = [];
  idPeriodoEscolar: number;
  idPromocion: number = null;
  titular1: boolean = false;
  titular2: boolean = false;

  columnas: Array<any> = [
    { titulo: 'Profesor', nombre: 'clave', sort: false},
    { titulo: 'Titular de la materia', nombre: 'titular' },
    { titulo: 'Horas asignadas', nombre: 'horasAsignadas' }
  ];

  // Services
  materiaImpartidaService;
  promocionService;
  profesoresService;
  profesorMateriaService;
  planEstudiosMateriaService;
  salasService;
  materiaService;
  periodoEscolarService;
  horarioService;
  formularioProfesorMateria: FormGroup;
  formularioHorarios: FormGroup;
  formularioMateriaImpartida: FormGroup;

  public configuracion: any = {
    paginacion: true
  };

  private idMateriaImpartida: number = null;
  private idMateria: number = null;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  private opcionesProfesores: Array<ItemSelects> = [];
  private opcionesAulas: Array<ItemSelects> = [];
  private opcionesCatalogoPeriodoEscolar: Array<ItemSelects> = [];
  private alertas: Array<Object> = [];

  @ViewChild('modalAdvetencia')
  dialog: ModalComponent;
  tipoGuardado: number;

  @ViewChild('modalConfirmacion')
  dialogC: ModalComponent;
  mensajeAdvertencia: String = '';
  detalle: boolean = false;

  constructor(private _router: Router, route: ActivatedRoute,
              private _spinner: SpinnerService,
              private _catalogosServices: CatalogosServices,
              private injector: Injector, private _renderer: Renderer) {

    this.router = _router;
    this.prepareServices();
    let params ;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });
    this.idPlanEstudioMateria = params.id;
    this.idPeriodoEscolar = params.idPe;
    this.idPromocion = params.idPr;

    this.detalle = params.detalle;
    // console.log('detalle', this.detalle);

    this.recuperarPlanEstudiosMateria();

    this.formularioProfesorMateria = new FormGroup({

      horasAsignadas: new FormControl('', Validators.compose([
        Validacion.numerosValidator, Validators.required])),
      idProfesor: new FormControl('', Validators.required),
      titular: new FormControl('', Validators.required),
      idMateriaImpartida: new FormControl(''),
      idEstatus: new FormControl(''),

    });

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

    this.formularioMateriaImpartida = new FormGroup({
      idMateria: new FormControl(''),
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
    this.deshabilitarCamposDetalle();
  }

  deshabilitarCamposDetalle(): void {
    if (this.detalle) {
      // console.log('controles', this.formularioHorarios.controls);
      // this.formularioHorarios.controls['lunesInicio'].disable();
      // this.formularioHorarios.controls['lunesFin'].disable();
      // this.formularioHorarios.controls['martesInicio'].disable();
      // this.formularioHorarios.controls['martesFin'].disable();
      // this.formularioHorarios.controls['miercolesInicio'].disable();
      // this.formularioHorarios.controls['miercolesFin'].disable();
      // this.formularioHorarios.controls['juevesInicio'].disable();
      // this.formularioHorarios.controls['juevesFin'].disable();
      // this.formularioHorarios.controls['viernesInicio'].disable();
      // this.formularioHorarios.controls['viernesFin'].disable();
      this.formularioMateriaImpartida.controls['idSala'].disable();
    }
  }

  recuperarPlanEstudiosMateria(): void {
    // console.log('start recuperarPlanEstudiosMateria');
    this._spinner.start('recuperarPlanEstudiosMateria');
    this.planEstudiosMateriaService.getEntidadPlanEstudiosMateria(
      this.idPlanEstudioMateria,
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

  recuperarPromocion(): void {
    this.promocionService.getEntidadPromocion(
      this.idPromocion,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.promocion = new Promocion(response.json());
      },
      error => {
        console.error(error);
      },
      () => {
        this.verificarMateriaImpartida();
      }
    );
  }

  verificarMateriaImpartida (): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMateria~' +
      this.entidadPlanEstudioMateria.materia.id + ':IGUAL' +
      ',idPromocion~' + this.promocion.id + ':IGUAL,idPeriodoEscolar~' + this.idPeriodoEscolar
      + ':IGUAL;AND');
    urlParameter.set('ordenamiento', 'idEstatus:ASC');

    this.materiaImpartidaService.getListaMateriaImpartida(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        let listaEntidad = response.json();
        if (listaEntidad.lista.length  > 0) {
          this.materiaImpartida = new MateriaImpartida(listaEntidad.lista[0]);
          if (this.materiaImpartida.estatus.id === 1222) {
            (<FormControl>this.formularioProfesorMateria.
              controls['idMateriaImpartida']).setValue(this.materiaImpartida.id);
            this.edicion = true;
            this.cargarDatosMateriaImpartida();
            this.onCambiosTabla();
          }
          if (this.materiaImpartida.estatus.id === 1227) {
            (<FormControl>this.formularioProfesorMateria.
              controls['idMateriaImpartida']).setValue(this.materiaImpartida.id);
            (<FormControl>this.formularioMateriaImpartida.controls['idPeriodoEscolar'])
              .setValue(this.materiaImpartida.periodoEscolar.getPeriodoAnioConsecutivo());
            this.verificarProfesoresInactivos();
          }
        }else {

          let jsonFormularioMateriaImpartida =
            '{"idMateria": "' +
            this.entidadPlanEstudioMateria.materia.id +
            '", "idTemarioParticular":"0' +
            '", "idPeriodoEscolar": "' + this.idPeriodoEscolar +
            '", "idPromocion": "' + this.promocion.id +
            '", "numeroPeriodo": "' +
            this.entidadPlanEstudioMateria.numeroPeriodo +
            '", "idSala": "0' +
            '", "idHorario": "0' +
            '", "idLgac": "0' +
            '", "idCursoOptativo": "0' +
            '", "idActaCalificacion": "' +
            '", "idEstatus": "1227"}';
          this.materiaImpartidaService.postMateriaImpartida(
            jsonFormularioMateriaImpartida,
            this.erroresGuardado
          ).subscribe(
            response => {
              let materiaImp = new MateriaImpartida(response.json());
              if (materiaImp) {
                this.obtenerMateriaImpartida(materiaImp.id);
              }
            }
          );
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  verificarProfesoresInactivos() {
    if (this.materiaImpartida.estatus.id === 1227) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idMateriaImpartida~' +
        this.materiaImpartida.id + ':IGUAL');
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
              this.eliminarProfesor(profesorMateria[i].id)
              i++;
            });
          }else {
          }
          // console.log('stop recuperarPlanEstudiosMateria');
          this._spinner.stop('recuperarPlanEstudiosMateria');
        }

      );
    }
  }

  // Materia impartida curso optativp
  obtenerMateriaImpartida(idMateriaImp: number): void {
    this.materiaImpartidaService.getMateriaImpartida(
      idMateriaImp,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.materiaImpartida = new MateriaImpartida(response.json());
        (<FormControl>this.formularioProfesorMateria.
          controls['idMateriaImpartida']).
        setValue(this.materiaImpartida.id);
        this.cargarDatosMateriaImpartida();
        // console.log('stop recuperarPlanEstudiosMateria');
        this._spinner.stop('recuperarPlanEstudiosMateria');
      },
      () => {
        // console.log('stop recuperarPlanEstudiosMateria');
        this._spinner.stop('recuperarPlanEstudiosMateria');
      }
    );
  }

  getLunesInicio(): string {
    if (this.lunesI) {
      let fechaConFormato =  moment(this.lunesI).format('HH:mm');

      (<FormControl>this.formularioHorarios.controls['lunesInicio'])
        .setValue(fechaConFormato);  // se asigna la nueva hora
      this.minLu = new Date(new Date().setHours(this.lunesI.getHours(),
        (this.lunesI.getMinutes() + 10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.lunesI >= this.lunesF) {
        this.lunesF = new Date(new Date().setHours(this.lunesI.getHours(), (this.lunesI.getMinutes() + 10), 0, 0));
        (<FormControl>this.formularioHorarios.controls['lunesFin']).setValue(this.lunesF);
        // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
      }

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
      this.minMa = new Date(new Date().setHours(this.martesI.getHours(),
        (this.martesI.getMinutes() + 10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.martesI >= this.martesF)
      {
        this.martesF = new Date(new Date().setHours(this.martesI.getHours(), (this.martesI.getMinutes() + 10), 0, 0));
        (<FormControl>this.formularioHorarios.controls['martesFin']).setValue(this.martesF);
        // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
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
      this.minJu = new Date(new Date().setHours(this.juevesI.getHours(),
        (this.juevesI.getMinutes() + 10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.juevesI >= this.juevesF)
      {
        this.juevesF = new Date(new Date().setHours(this.juevesI.getHours(), (this.juevesI.getMinutes() + 10), 0, 0)); // se asigna la hora minima al timepicker, si la hora inicial es mayor o igual  a la final
        (<FormControl>this.formularioHorarios.controls['juevesFin']).setValue(this.juevesF);
        // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
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
      this.minVi = new Date(new Date().setHours(this.viernesI.getHours(),
        (this.viernesI.getMinutes() + 10), 0, 0)); // se asigna la hora minima (es la nueva hora + 10 minutos)
      if (this.viernesI >= this.viernesF)
      {
        this.viernesF = new Date(new Date().setHours(this.viernesI.getHours(), (this.viernesI.getMinutes() + 10), 0, 0)); // se asigna la hora minima al timepicker, si la hora inicial es mayor o igual  a la final
        (<FormControl>this.formularioHorarios.controls['viernesFin']).setValue(this.viernesF);
        // se asigna la hora minima al input, si la hora inicial es mayor o igual a la final
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

    if (this.materiaImpartida) {

      let intMateria = 'idMateria';
      let intTemarioParticular = 'idTemarioParticular';
      let intPeriodoEscolar = 'idPeriodoEscolar';
      let intPromocion = 'idPromocion';
      let intNumeroPeriodo = 'numeroPeriodo';
      let intSala = 'idSala';
      let intHorario = 'idHorario';
      let intLgac = 'idLgac';
      let intCursoOptativo = 'idCursoOptativo';
      let intEstatus = 'idEstatus';
      let intActaCalificacion = 'idActaCalificacion';

      (<FormControl>this.formularioMateriaImpartida.controls[intMateria])
        .setValue(this.materiaImpartida.materia.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intTemarioParticular])
        .setValue(this.materiaImpartida.temarioParticular.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intPeriodoEscolar])
        .setValue(this.materiaImpartida.periodoEscolar.getPeriodoAnioConsecutivo());
      (<FormControl>this.formularioMateriaImpartida.controls[intPromocion])
        .setValue(this.materiaImpartida.promocion.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intNumeroPeriodo])
        .setValue(this.entidadPlanEstudioMateria.numeroPeriodo);
      if (this.materiaImpartida.estatus.id === 1222) {
        (<FormControl>this.formularioMateriaImpartida.controls[intSala])
          .setValue(this.materiaImpartida.sala.id);
      }
      if (!this.materiaImpartida.sala.id) {
        (<FormControl>this.formularioMateriaImpartida.controls['idSala']).setValue('');
      }

      (<FormControl>this.formularioMateriaImpartida.controls[intHorario])
        .setValue(this.materiaImpartida.horario.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intLgac])
        .setValue(this.materiaImpartida.lgac.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intCursoOptativo])
        .setValue(this.materiaImpartida.cursoOptativo.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intEstatus])
        .setValue(this.materiaImpartida.estatus.id);
      (<FormControl>this.formularioMateriaImpartida.controls[intActaCalificacion])
        .setValue(this.materiaImpartida.actaCalificacion.id);
    }

    if (this.materiaImpartida.horario.id) {

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
      if (this.materiaImpartida.horario.lunesInicio && this.materiaImpartida.horario.lunesInicio != '') {
        let fecha = this.materiaImpartida.horario.lunesInicio.split(":");
        this.lunesI = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringLunesInicio])
          .setValue(this.lunesI);
      }
      if (this.materiaImpartida.horario.lunesFin && this.materiaImpartida.horario.lunesFin != ''){
        let fecha = this.materiaImpartida.horario.lunesFin.split(":");
        this.lunesF = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringLunesFin])
          .setValue(this.lunesF);
      }
      if (this.materiaImpartida.horario.martesInicio && this.materiaImpartida.horario.martesInicio != '') {
        let fecha  = this.materiaImpartida.horario.martesInicio.split(":");
        this.martesI = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringMartesInicio])
          .setValue(this.martesI);
      }
      if (this.materiaImpartida.horario.martesFin && this.materiaImpartida.horario.martesFin != '') {
        let fecha  = this.materiaImpartida.horario.martesFin.split(":");
        this.martesF = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringMartesFin])
          .setValue(this.martesF);
      }
      if (this.materiaImpartida.horario.miercolesInicio && this.materiaImpartida.horario.miercolesInicio != '') {
        let fecha  = this.materiaImpartida.horario.miercolesInicio.split(":");
        this.miercolesI = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringMiercolesInicio])
          .setValue(this.miercolesI);
      }
      if (this.materiaImpartida.horario.miercolesFin && this.materiaImpartida.horario.miercolesFin != '') {
        let fecha  = this.materiaImpartida.horario.miercolesFin.split(":");
        this.miercolesF = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringMiercolesFin])
          .setValue(this.miercolesF);
      }
      if (this.materiaImpartida.horario.juevesInicio && this.materiaImpartida.horario.juevesInicio != '') {
        let fecha  = this.materiaImpartida.horario.juevesInicio.split(":");
        this.juevesI =new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringJuevesInicio])
          .setValue(this.juevesI);
      }
      if (this.materiaImpartida.horario.juevesFin && this.materiaImpartida.horario.juevesFin != '') {
        let fecha  = this.materiaImpartida.horario.juevesFin.split(":");
        this.juevesF = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        (<FormControl>this.formularioHorarios.controls[StringJuevesFin])
          .setValue(this.juevesF);
      }
      if (this.materiaImpartida.horario.viernesInicio && this.materiaImpartida.horario.viernesInicio != '') {
        let fecha  = this.materiaImpartida.horario.viernesInicio.split(":");
        this.viernesI = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        // console.log('viernesI asign ' + this.viernesI);
        (<FormControl>this.formularioHorarios.controls[StringViernesInicio])
          .setValue(this.viernesI);
      }
      if (this.materiaImpartida.horario.viernesFin && this.materiaImpartida.horario.viernesFin != '') {
        let fecha  = this.materiaImpartida.horario.viernesFin.split(":");
        this.viernesF = new Date(new Date().setHours(Number.parseInt(fecha[0]), Number.parseInt(fecha[1]), 0, 0));
        // console.log('viernesF asign ' + this.viernesF);
        (<FormControl>this.formularioHorarios.controls[StringViernesFin])
          .setValue(this.viernesF);
      }

      if (this.materiaImpartida.horario.lunesInicio &&
        this.materiaImpartida.horario.lunesFin) {
        this.habilitarLunes = true;
        this.habilitarLunesFin = true;
      } if (this.materiaImpartida.horario.martesInicio &&
        this.materiaImpartida.horario.martesFin) {
        this.habilitarMartes = true;
        this.habilitarMartesFin = true;
      } if (this.materiaImpartida.horario.miercolesInicio &&
        this.materiaImpartida.horario.miercolesFin) {
        this.habilitarMiercoles = true;
        this.habilitarMiercolesFin = true;
      } if (this.materiaImpartida.horario.juevesInicio &&
        this.materiaImpartida.horario.juevesFin) {
        this.habilitarJueves = true;
        this.habilitarJuevesFin = true;
      } if (this.materiaImpartida.horario.viernesInicio &&
        this.materiaImpartida.horario.viernesFin) {
        this.habilitarViernes = true;
        this.habilitarViernesFin = true;
      }

    }
    this._spinner.stop('verificarCurso');
    // console.log('stop verificarCurso');
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

  cambioRadio(titular: boolean): void {
    this.hayProfesorTitular = false;
    if (titular === true)
      this.titular1 = true;
    else
      this.titular2 = true;

    if (titular === true) {
      this._spinner.start('cambioRadio');
      // console.log('start cambioRadio');
      let urlParameter: URLSearchParams = new URLSearchParams();

      let criterios = 'titular~true:IGUAL,' +
        'idMateriaImpartida~' + this.materiaImpartida.id + ':IGUAL';

      if (this.materiaImpartida.estatus.id === 1227) {
        criterios = criterios + ',idEstatus.id~1229:IGUAL;AND';
      }
      if (this.materiaImpartida.estatus.id === 1222) {
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
            this.hayProfesorTitular = true;
            this.modalAdvertencia('Ya hay un profesor ' +
              'titular para esta materia, por favor cambie el valor', 1);
            this._spinner.stop('cambioRadio');
            // console.log('stop cambioRadio');
          }else {
            this._spinner.stop('cambioRadio');
            // console.log('stop cambioRadio');
          }
        },
        error => {
          // console.error(error);
        });
    }else {
      this.hayProfesorTitular = false;
    }
    (<FormControl>this.formularioProfesorMateria.controls['titular']).setValue(titular);
  }

  validarProfesor(): void {
    if (this.validarFormulario()) {
      if (this.hayProfesorTitular === false) {
        if (this.registroSeleccionado)
          this.modalConfirmacion('¿Está seguro de actualizar este profesor?', 1);
        else
          this.modalConfirmacion('¿Está seguro de agregar este profesor?', 1);
      }else {
        this.modalAdvertencia
        ('Ya hay un profesor titular, por favor modifique el valor', 1);
        this.titular1 = false;
        this.titular2 = false;
        this.hayProfesorTitular = true;
      }
    } else {
    }
  }

  guardarProfesor(): void {
    if (this.materiaImpartida.estatus.id === 1222) {
      (<FormControl>this.formularioProfesorMateria.
        controls['idEstatus']).setValue(1228);
    }
    if (this.materiaImpartida.estatus.id === 1227) {
      (<FormControl>this.formularioProfesorMateria.
        controls['idEstatus']).setValue(1229);
    }
    if (this.registroSeleccionado) {
      (<FormControl>this.formularioProfesorMateria.
        controls['idMateriaImpartida']).setValue(this.materiaImpartida.id);
      let jsonFormularioPM = JSON.stringify(this.formularioProfesorMateria.value, null, 2);
      ////console.log(jsonFormularioPM);
      this._spinner.start('guardarProfesor');
      // console.log('start guardarProfesor');
      if (this.edicionFormulario) {
        this.profesorMateriaService.putProfesorMateria(
          this.registroSeleccionado.id,
          jsonFormularioPM,
          this.erroresGuardado
        ).subscribe(
          () => {}, // console.log('Success Edition'),
          console.error,
          () => {
            this.limpiarCampos();
            this.cerrarAlerta(0);
            this.addErrorsMesaje('El profesor se actualizó correctamente', 'success');
            this.registroSeleccionado = null;
            this.onCambiosTabla();
          }
        );
      }
    } else {

      let jsonFormularioPM =
        JSON.stringify(this.formularioProfesorMateria.value, null, 2);
      this._spinner.start('guardarProfesor');
      // console.log('start guardarProfesor');
      this.profesorMateriaService.postProfesorMateria(
        jsonFormularioPM,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log('Success');
        },
        console.error,
        () => {
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

  eliminarProfesor(idProfesorMateria: number): void {
    this._spinner.start('eliminarProfesor');
    // console.log('start eliminarProfesor');
    this.profesorMateriaService.deleteProfesorMateria(
      idProfesorMateria,
      this.erroresConsultas
    ).subscribe(
      response => {
        // console.log('success');
      },
      error => {
        console.error(error);
      },
      () => {
        this.limpiarCampos();
        this.addErrorsMesaje('El profesor se eliminó correctamente', 'warning');
        this.registroSeleccionado = null;
        this.onCambiosTabla();
      }
    );
  }

  validarProfesorTitular(): void {  // validar que haya profesor titular
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMateriaImpartida~' +
      this.materiaImpartida.id + ':IGUAL');
    this._spinner.start('validarProfesorTitular');
    // console.log('start validarProfesorTitular');
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
            if (profesor.titular === true) {
              this.titular = true;
            }
          });
        }
      },
      error => {
        console.error(error);
      },
      () => {
        if (this.titular) {
          this._spinner.stop('validarProfesorTitular');
          // console.log('stop validarProfesorTitular');
          if (this.edicion) {
            this.modalConfirmacion('¿Está seguro de actualizar este registro?', 2);
          }else {
            this.modalConfirmacion('¿Está seguro de guardar este registro?', 2);
          }
        } else {
          this._spinner.stop('validarProfesorTitular');
          console.log('stop validarProfesorTitular');
          this.modalAdvertencia('Debe haber un profesor titular en el curso', 1);
        }
      }
    );
  }

  enviarFormulario(): void {
    this._spinner.start('enviarFormulario');
    // console.log('start enviarFormulario');
    let jsonFormularioHorario = JSON.stringify
    (this.formularioHorarios.value, null, 2);
    if (!this.materiaImpartida.horario.id) {
      this.horarioService.postHorariosMateria(
        jsonFormularioHorario,
        this.erroresGuardado
      ).subscribe(
        response => {
          let horarioMateria = new HorariosMateria(response.json());
          this.profesorMateria.forEach((profesor) => {
            if (profesor.estatus.id === 1229) {
              this.cambiarEstatusProfesorMateria(profesor.id);
            }
          });
          this.guardarMateriaImpartidaEdicion(horarioMateria.id);

        });

    }else {
      this.horarioService.putHorariosMateria(
        this.materiaImpartida.horario.id,
        jsonFormularioHorario,
        this.erroresGuardado
      ).subscribe(
        () => {}, // console.log('Success'),
        console.error,
        () => {
          this.profesorMateria.forEach((profesor) => {
            if (profesor.estatus.id === 1229) {
              this.cambiarEstatusProfesorMateria(profesor.id);
            }
          });
          this.guardarMateriaImpartidaEdicion
          (this.materiaImpartida.horario.id);
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
      () => {}, // console.log('Success'),
      console.error,
      () => {
        // console.log('Cambia estatus');
      }
    );
  }

  guardarMateriaImpartidaEdicion(horarioMateriaId: number) {
    if (horarioMateriaId) {
      (<FormControl>this.formularioMateriaImpartida.
        controls['idHorario']).setValue(horarioMateriaId);
    }
    (<FormControl>this.formularioMateriaImpartida.
      controls['idMateria']).setValue(this.materiaImpartida.materia.id);
    (<FormControl>this.formularioMateriaImpartida.
      controls['idPeriodoEscolar']).setValue(this.materiaImpartida.periodoEscolar.id);
    (<FormControl>this.formularioMateriaImpartida.
      controls['idPromocion']).setValue(this.materiaImpartida.promocion.id);
    (<FormControl>this.formularioMateriaImpartida.
      controls['numeroPeriodo']).setValue(this.materiaImpartida.numeroPeriodo);
    (<FormControl>this.formularioMateriaImpartida.
      controls['idEstatus']).setValue('1222');

    let jsonFormularioMateriaImpartida =
      JSON.stringify(this.formularioMateriaImpartida.value, null, 2);
    ////console.log(jsonFormularioMateriaImpartida);
    this.materiaImpartidaService.putMateriaImpartida(
      this.materiaImpartida.id,
      jsonFormularioMateriaImpartida,
      this.erroresGuardado
    ).subscribe(
      () => {}, // console.log('Success'),
      console.error,
      () => {
        this._spinner.stop('enviarFormulario');
        console.log('stop enviarFormulario');
        this.regresarLista();
      }
    );
  }

  cancelarRegistro(): void {
    this._spinner.start('cancelarRegistro');
    // console.log('start |cancelarRegistro');
    if (this.materiaImpartida.estatus.id === 1222) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idMateriaImpartida~' +
        this.materiaImpartida.id + ':IGUAL');
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
              if (profesor.titular === true) {
                this.titular = true;
              }
            });
          }
        },
        error => {
          console.error(error);
        },
        () => {
          if (this.titular) {
            this._spinner.stop('cancelarRegistro');
            // console.log('stop cancelarRegistro');
            this.regresaListaCancelar();
          }
          if (!this.titular) {
            this._spinner.stop('cancelarRegistro');
            // console.log('stop cancelarRegistro');
            this.modalAdvertencia('Debe haber un profesor titular en la materia', 1);
          }
        }
      );
    }
    if (this.materiaImpartida.estatus.id === 1227) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idMateriaImpartida~' +
        this.materiaImpartida.id + ':IGUAL');
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
              this.eliminarProfesor(profesorMateria[i].id);
              i++;
            });
          }else {
            // //console.log('No hay profesores para eliminar');
          }
          this.eliminarMateriaBase(this.materiaImpartida.id);
        }

      );
    }
  }

  eliminarMateriaBase(idMateriaImpartidaBase: number): void {
    this.materiaImpartidaService.deleteMateriaImpartida(
      idMateriaImpartidaBase,
      this.erroresConsultas
    ).
    subscribe(
      response => {
        //  //console.log('SE ELIMINO TODO::::');
      }
    );
    this._spinner.stop('cancelarRegistro');
    // console.log('stop cancelarRegistro');
    this.regresaListaCancelar();
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

  regresarLista(): void {
    if (this.edicion === true) {
      // console.log('entra a regresar  33');
      this.router.navigate(['reinscripcion', 'materia', {e: 1}]);
    }
    if (this.edicion === false) {
      // console.log('entra a regresar  55');
      this.router.navigate(['reinscripcion', 'materia', {e: 2}]);
    }
  }

  regresaListaCancelar(): void {
    // console.log('entra aca');
    this.router.navigate(['reinscripcion', 'materia']);
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
    let criterios = 'idMateriaImpartida~' + this.materiaImpartida.id + ':IGUAL';

    if (this.materiaImpartida.estatus.id === 1227) {
      criterios = criterios + ',idEstatus~1229:IGUAL;AND';
    }
    if (this.materiaImpartida.estatus.id === 1222) {
      criterios = criterios + ',idEstatus~1228:IGUAL;AND';
    }

    urlSearch.set('criterios', criterios);
    this.profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registrosProfesores = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.registrosProfesores.push(new ProfesorMateria(item));
        });
        this._spinner.stop('guardarProfesor');
        // console.log('stop guardarProfesor');
        // console.log('stop recuperarPlanEstudiosMateria');
        this._spinner.stop('recuperarPlanEstudiosMateria');
      },
      error => {
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if ((this.registroSeleccionado !== registro) && !this.detalle) {
      this.registroSeleccionado = registro;
      this.edicionFormulario = true;
      let profesorMateria : ProfesorMateria;
      this._spinner.start('rowSeleccion');
      // console.log('start rowSeleccion');
      this.profesorMateriaService.
      getEntidadProfesorMateria(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        response => {
          profesorMateria = new ProfesorMateria(
            response.json()
          );
        },
        // en caso de presentarse un error se agrega un nuevo error al array errores
        error => {
            console.error(error);
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

            this._spinner.stop('rowSeleccion');
            // console.log('stop rowSeleccion');
          }
        }
      );

    } else {
      this.registroSeleccionado = null;
      this.limpiarCampos();
    }
  }

  verificarProfesor(idProfesor: number): void {
    this._spinner.start('verificarProfesor');
    // console.log('start verificarProfesor');
    let urlParameter: URLSearchParams = new URLSearchParams();

    let criterios = 'idProfesor.id~' + idProfesor + ':IGUAL,' +
      'idMateriaImpartida.id~' + this.materiaImpartida.id + ':IGUAL';

    if (this.materiaImpartida.estatus.id === 1227) {
      criterios = criterios + ',idEstatus.id~1229:IGUAL;AND';
    }
    if (this.materiaImpartida.estatus.id === 1222) {
      criterios = criterios + ',idEstatus.id~1228:IGUAL;AND';
    }

    urlParameter.set('criterios', criterios);

    this.profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas,
      urlParameter,
      null
    ).subscribe(
      response => {
        let profesor: ProfesorMateria;
        let listaEntidad = response.json();
        if (listaEntidad.lista.length  > 0) {
          profesor = new ProfesorMateria(listaEntidad.lista[0]);
        }
        if (profesor) {
          (<FormControl>this.formularioProfesorMateria.
            controls['idProfesor']).setValue('');
          this.modalAdvertencia('Este profesor ya está agregado en la lista', 1);
          this._spinner.stop('verificarProfesor');
          // console.log('stop verificarProfesor');

        }else {
          this._spinner.stop('verificarProfesor');
          // console.log('stop verificarProfesor');
        }
      },
      error => {
      }
    );
  }

  modalAdvertencia(mensajeAdvertencia: String, tipoGuardado: number): void {
    // console.log('modal advertencia');
    if (this.detalle) {
      this.regresaListaCancelar();
    } else {
      this.mensajeAdvertencia = mensajeAdvertencia;
      this.tipoGuardado = tipoGuardado;
      this.dialog.open('sm');
    }
  }

  modalConfirmacion(mensajeAdvertencia: String, tipoGuardado: number): void {
    this.mensajeAdvertencia = mensajeAdvertencia;
    this.tipoGuardado = tipoGuardado;
    this.dialogC.open('sm');
  }

  detenerSpinner(): void {
    this._spinner.stop('');
    // console.log('stop ');
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
  limpiarInput(valor, dia): void {
    // console.log('esto es lo que obtine:::::::::::::::' + valor + dia);
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
      switch (dia) {
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
      }
    }
  }

  verificarHabilitarCampo(dia): void {
    switch (dia) {
      case 'L':
        if (this.getControlHorario('lunesInicio').value)
          this.habilitarLunesFin = true;
        break;
      case 'M':
        if (this.getControlHorario('martesInicio').value)
          this.habilitarMartesFin = true;
        break;
      case 'Mi':
        if (this.getControlHorario('miercolesInicio').value)
          this.habilitarMiercolesFin = true;
        break;
      case 'J':
        if (this.getControlHorario('juevesInicio').value)
          this.habilitarJuevesFin = true;
        break;
      case 'V':
        if (this.getControlHorario('viernesInicio').value)
          this.habilitarViernesFin = true;
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
    this.materiaImpartidaService = this._catalogosServices.getMateriaImpartidaService();
    this.profesorMateriaService = this._catalogosServices.getProfesorMateriaService();
    this.profesoresService = this._catalogosServices.getProfesor();
    this.salasService = this._catalogosServices.getSalas();
    this.materiaService = this._catalogosServices.getMateria();
    this.planEstudiosMateriaService = this._catalogosServices.getPlanEstudiosMateria();
    this.promocionService = this._catalogosServices.getPromocion();
    this.periodoEscolarService = this._catalogosServices.getPeriodoEscolar();
    this.horarioService = this._catalogosServices.getHorariosMateriaService();


    this.opcionesProfesores =
      this.profesoresService.getSelectProfesor(this.erroresConsultas);
    this.opcionesAulas = this.salasService.getSelectSala(this.erroresConsultas);
    this.opcionesCatalogoPeriodoEscolar =
      this.periodoEscolarService.getSelectPeriodoEscolarPeriodo(this.erroresConsultas);

  }
  ngOnInit() {
  }

  cerrarModalAdvertencia(): void {
    this.dialog.close();
  }

  opcionCancelado(): void {
    if (this.tipoGuardado == 1) {

      this.dialog.close();
      this.guardarProfesor();
    }
    if (this.tipoGuardado == 2) {
      this.dialog.close();
      this.eliminarProfesor(
        this.registroSeleccionado.id);
    }
    if (this.tipoGuardado == 3) {
      this.dialog.close();
      if (this.materiaImpartida) {
        this.cancelarRegistro();
      }else {
        this.cerrarModalAdvertencia();
      }
    }
  }

  cerrarModalConfirmacion(): void {
    this.detenerSpinner();
    this.dialogC.close();
  }

  opcionGuardado(): void {
    if (this.tipoGuardado == 1) {
      this.dialogC.close();
      this.guardarProfesor();
    }
    if (this.tipoGuardado == 2) {
      this.dialogC.close();
      this.enviarFormulario();
    }
  }

}
