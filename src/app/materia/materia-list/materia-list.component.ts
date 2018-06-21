import {Component, OnInit, ElementRef,
  Injector, Renderer, ViewChild} from '@angular/core';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ItemSelects} from '../../services/core/item-select.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {FormGroup, FormControl} from '@angular/forms';
import {URLSearchParams} from '@angular/http';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {MateriaService} from '../../services/entidades/materia.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {PlantillaEditorService} from '../../services/entidades/plantilla-editor.service';
import {Materia} from "../../services/entidades/materia.model";
import {PlanEstudiosMateria} from "../../services/entidades/plan-estudios-materia.model";
import {Router, ActivatedRoute} from "@angular/router";
import {PeriodoEscolar} from "../../services/entidades/periodo-escolar.model";
import {ProgramaDocenteService} from "../../services/servicios-especializados/programa-docente/programa-docente.service";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

export class RegistroMateria {
  materia: Materia;
  materiaImpartida: MateriaImpartida;
  planEstudioMateria: PlanEstudiosMateria;
  constructor(materia: Materia, materiaImpartida: MateriaImpartida,
              planEstudioMateria: PlanEstudiosMateria) {
    this.materia = materia;
    this.materiaImpartida = materiaImpartida;
    this.planEstudioMateria = planEstudioMateria;

  }
}

@Component({
  selector: 'app-materia-list',
  templateUrl: './materia-list.component.html',
  styleUrls: ['./materia-list.component.css']
})
export class MateriaListComponent implements OnInit {

  @ViewChild('modalTutoria')
  modalTutoria: ModalComponent;

  router: Router;
  route: ActivatedRoute;
  // variables para la tabla materias
  registros: Array<PlanEstudiosMateria> = [];
  registrosMostrar: Array<RegistroMateria> = [];
  registroSeleccionado: RegistroMateria;
  materia: Materia = null;
  columnas: Array<any> = [
    {titulo: 'Clave', nombre: 'clave', sort: false},
    {titulo: 'Nombre de la materia', nombre: 'descripcion', sort: false},
    {titulo: 'Créditos', nombre: 'creditos', sort: false},
    {titulo: 'Nombre titular', nombre: 'titular', sort: false}
  ];

  params = null;
  criteriosCabezera: string = '';
  materiaImpartidaService;
  programaDocenteService;
  planEstudiosMateriaService;
  profesorMateriaService;
  promocionService;
  periodoEscolarService
  formulario: FormGroup;
  i: number = 0;

  planEstudios: PlanEstudio;
  promocionElegida: Promocion;
  idPromocion: number = null;
  programaSeleccionado: number = null;
  promocionSeleccionada;
  mensajeAdvertencia;

  usuarioRolService;
  usuarioRol: UsuarioRoles;
  oculto: boolean;
  edicion: boolean = false;
  detalle: boolean = true;

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private opcionesCatalogoPeriodo: Array<PromocionPeriodoEscolar> = [];
  private opcionesCatalogoPromocion: Array<Promocion> = [];
  private opcionesCatalogoProgramaDocente: Array<ItemSelects> = [];

  botonBuscar: boolean = false;
  programasDocentesSelect: ItemSelects[];
  promocionesSelect: Array<Promocion> = [];
  //promocionesSelect: ItemSelects[];
  periodosSelect: ItemSelects[];
  alertas: Array<Object> = [];
  errores: Array<ErrorCatalogo> = [];
  idPeriodoEscolar: number = null;
  usuarioLogueado: UsuarioSesion;

  constructor(private programaDocente: ProgramaDocenteService, _route: ActivatedRoute, _router: Router,
              private _catalogosServices: CatalogosServices,
              private _spinner: SpinnerService, auth: AuthService) {

    this.usuarioLogueado  = auth.getUsuarioLogueado();
    this.route = _route;
    this.router = _router;
    this.route.params.subscribe(params => {
      this.params = params; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
     console.log('opcionesCatalogoPromocion',this.opcionesCatalogoPromocion);

    });
    if (this.params.e == 1) {
      this.addErrorsMesaje('La materia se actualizó correctamente', 'success');
    }
    if (this.params.e == 2) {
      this.addErrorsMesaje('La materia se guardó correctamente', 'success');
    }


    this.formulario = new FormGroup({
      idPeriodoEscolar: new FormControl(''),
      idPromocion: new FormControl(''),
      idProgramaDocente: new FormControl(''),
    });

    (<FormControl>this.formulario.controls['idPeriodoEscolar'])
      .setValue(
        sessionStorage.getItem('idPeriodoEscolar')
          ? sessionStorage.getItem('idPeriodoEscolar') : ''
      );
    (<FormControl>this.formulario.controls['idPromocion'])
      .setValue(
        sessionStorage.getItem('idPromocion')
          ? sessionStorage.getItem('idPromocion') : ''
      );
    (<FormControl>this.formulario.controls['idProgramaDocente'])
      .setValue(
        sessionStorage.getItem('idProgramaDocente')
          ? sessionStorage.getItem('idProgramaDocente') : ''
      );
  }

  ngOnInit() {
    this.prepareServices();
    this.recuperarPermisosUsuario(this.usuarioLogueado.id);
    if (sessionStorage.getItem('idProgramaDocente')) {
      this.cambioProgramaDocenteFiltro(sessionStorage.getItem('idProgramaDocente')); 
    }
  }

  borrarVariablesSession(idProgramaDocente: number): void {
    sessionStorage.clear();
    this.cambioProgramaDocenteFiltro(idProgramaDocente);
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        //console.log(response.json());
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          if (this.usuarioRol.rol.id == 1) {
            this.oculto = false;
          }
          if (this.usuarioRol.rol.id == 2) {
            this.oculto = true;
          }
          this.getProgramaDocente();
        });
      }
    );
  }

  getProgramaDocente(): void {
    if (this.oculto) {
      this.opcionesCatalogoProgramaDocente.push(
        new ItemSelects (
          this.usuarioRol.usuario.programaDocente.id,
          this.usuarioRol.usuario.programaDocente.descripcion
        )
      );
    } else {
      this.opcionesCatalogoProgramaDocente = this._catalogosServices.
      getCatalogoProgramaDocente()
        .getSelectProgramaDocente(this.erroresConsultas);
    }
  }

   cambioProgramaDocenteFiltro(idProgramaDocente): void {
    (<FormControl>this.formulario.controls['idProgramaDocente']).setValue(idProgramaDocente);
    this.registroSeleccionado = null;
    this.botonBuscar = false;
    this.opcionesCatalogoPromocion = [];
    this.opcionesCatalogoPeriodo = [];
    let urlSearch = new URLSearchParams();
    (<FormControl>this.formulario.controls['idPromocion']).setValue('');
    (<FormControl>this.formulario.controls['idPeriodoEscolar']).setValue('');

    if (idProgramaDocente !== undefined) {
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idProgramaDocente + ':IGUAL;AND,idEstatus~1235:NOT');
      this.promocionService.getListaPromocionesPag(this.erroresConsultas, urlSearch).
      subscribe(response => {
        response.json().lista.forEach((item) => {
          this.opcionesCatalogoPromocion.push(new Promocion(item));

        });
        if (sessionStorage.getItem('idPromocion')) {
          this.cambiosPeriodoEscolarFiltro(parseInt(sessionStorage.getItem('idPromocion')));
        }
      });
      //      //console.log(this.getControl('idPromocion').value);
    }
  }
  


  cambiosPeriodoEscolarFiltro(idPromocion: number): void {
    this.botonBuscar = false;
    this.registroSeleccionado = null;
    (<FormControl>this.formulario.controls['idPromocion']).setValue(idPromocion);
    (<FormControl>this.formulario.controls['idPeriodoEscolar']).setValue('');
    this.opcionesCatalogoPeriodo = [];
    this.opcionesCatalogoPromocion.forEach((promocion) => {
      if (promocion.id == idPromocion) {
        this.promocionElegida = promocion;
        promocion.promocionPeriodo.forEach((promocionPeriodo) => {
          this.opcionesCatalogoPeriodo.push(promocionPeriodo);
        });
        if (sessionStorage.getItem('idPeriodoEscolar')) {
          this.buscarCriteriosCabezera(parseInt(sessionStorage.getItem('idPeriodoEscolar')));
        }
      }

    });
  }

  buscarCriteriosCabezera(index: number): void {
    if (index !== undefined) {
      this.idPeriodoEscolar =
        this.opcionesCatalogoPeriodo[index].idPeriodoEscolar.id; //ID PERIODO ESCOLAR

      //console.log('Numero semestre::: ' + this.opcionesCatalogoPeriodo[index].numSemestre);

      (<FormControl>this.formulario.controls['idPeriodoEscolar']).setValue(index);
      //console.log('promocion de estudios::' + this.promocionElegida.id);
      //console.log('plan de estudios::' + this.promocionElegida.idPlanEstudios.id);

      if (index !== undefined) {
        this.criteriosCabezera =
          'idMateria.idTipo.id~1:IGUAL;OR,idMateria.idTipo.id~2:IGUAL;' +
          'OR,idMateria.idTipo.id~4:IGUAL;OR,idMateria.idTipo.id~3:IGUAL;ORGROUPAND,idPlanEstudios.id~' +
          this.promocionElegida.idPlanEstudios.id + ':IGUAL;AND,numeroPeriodo~'
          + this.opcionesCatalogoPeriodo[index].numSemestre + ':IGUAL;AND';
        this.onCambiosTabla();
      }
    }
  }

  materiasOptativas(): void {
    if (this.registroSeleccionado.materia.tipoMateria.id === 2
      || this.registroSeleccionado.materia.tipoMateria.id === 1) {
      for (let key in this.formulario.controls) {
        sessionStorage.setItem(
          key,
          (this.getControl(key).value !== undefined) ? this.getControl(key).value : ''
        );
      }

      this.router.navigate(['materias','curso-especifico',
        {id: this.registroSeleccionado.planEstudioMateria.id,
          idPe: this.idPeriodoEscolar,
          idPr: this.promocionElegida.id,
          idTipoMateria: this.registroSeleccionado.materia.tipoMateria.id}]);
    }
  }

  materiasLgac(): void {
    //console.log('MATERIA lgac ' + this.registroSeleccionado.materia.tipoMateria.id);
    if (this.registroSeleccionado.materia.tipoMateria.id === 1) {
      for (let key in this.formulario.controls) {
        sessionStorage.setItem(
          key,
          (this.getControl(key).value !== undefined) ? this.getControl(key).value : ''
        );
      }
      this.router.navigate(['MateriasLgac',
        {id: this.registroSeleccionado.planEstudioMateria.id,
          idPe: this.idPeriodoEscolar,
          idPr: this.promocionElegida.id}]);
    }
  }

  materiasBase(): void {
    if (this.registroSeleccionado.materia.tipoMateria.id === 4) {
      for (let key in this.formulario.controls) {
        sessionStorage.setItem(
          key,
          (this.getControl(key).value !== undefined) ? this.getControl(key).value : ''
        );
      }
      this.router.navigate(['materias', 'curso-base',
        {id: this.registroSeleccionado.planEstudioMateria.id,
          idPe: this.idPeriodoEscolar,
          idPr: this.promocionElegida.id,
          }]);
    }
  }

  materiasBaseDetalle(): void {
    if (this.registroSeleccionado.materia.tipoMateria.id === 4) {
      for (let key in this.formulario.controls) {
        sessionStorage.setItem(
          key,
          (this.getControl(key).value !== undefined) ? this.getControl(key).value : ''
        );
      }
      this.router.navigate(['materias', 'curso-base',
        {id: this.registroSeleccionado.planEstudioMateria.id,
          idPe: this.idPeriodoEscolar,
          idPr: this.promocionElegida.id,
          detalle: true}]);
    }
  }


  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    //console.log('ENTRA AQUI PRIMERO');
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }


  onCambiosTabla(): void {
    this.registros = [];

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = criterios + this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
      this._spinner.start("onCambiosTabla");
      this.planEstudiosMateriaService.getListaMateriasPlanSize(
        this.erroresConsultas,
        urlSearch,
        false
      ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            //   //console.log(item);
            this.registros.push(new PlanEstudiosMateria(item));
          });
          this.registrosMostrar = [];

        },
        error => {
          //console.log('error');
        },
        () => {
          if (this.registros.length > 0) {
            this.i = 0;
            this.registros.forEach((registro) => {
              this.buscarMateriaImpartida(registro);
            });
          }else {
            this._spinner.stop("onCambiosTabla");
          }
        }
      );
    }
  }

  buscarMateriaImpartida(planEstudioMateria: PlanEstudiosMateria): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMateria~' +
      planEstudioMateria.materia.id + ':IGUAL,idPeriodoEscolar~'
      + this.idPeriodoEscolar +
      ':IGUAL,idPromocion~' + this.promocionElegida.id
      + ':IGUAL,idEstatus~1222:IGUAL;AND');
    this.materiaImpartidaService.getListaMateriaImpartida(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        if (response.json().lista.length  > 0) {
          let materiaImpartida = new MateriaImpartida(response.json().lista[0]);
          this.registrosMostrar.push(new RegistroMateria
          (materiaImpartida.materia, materiaImpartida,
            planEstudioMateria));
          this.i ++;
          this.detenerSpinner();
        }else {
          this.registrosMostrar.push(new RegistroMateria
          (planEstudioMateria.materia, null, planEstudioMateria));
          this.i ++;
          this.detenerSpinner();
        }
      },
      error => {
        console.error(error);
      }
    );
  }

  detenerSpinner(): void {
    /*TODO Pendiente la validaciòn, para cuando los registros son 1, no esta correcta la validacion
     * se deteniene el spiner independietemente de la validacion
     */
    this._spinner.stop("onCambiosTabla");
    let u: number = this.i + 1;
    if (u == this.registros.length) {
      this._spinner.stop("onCambiosTabla");
    }
  }

  mostrarBotonBuscar(i: number): void {
    if (i)
      this.botonBuscar = true;
    this.registroSeleccionado = null;
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
    this.params = null;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  modalConfirmacionTutorial(msg:string) {
    this.mensajeAdvertencia = msg;
    this.modalTutoria.open();
  }
  cerrarModal():void {
    this.modalTutoria.close();
  }

/*
  modalConfirmacionTutorial(mensajeAdvertencia: String): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let modalConfirmacionTutorial = new ModalConfirmacionTutorialData(
      this,
      mensajeAdvertencia,
    );


    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalConfirmacionTutorial}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
    ]);

    dialog = this.modal.open(
      <any>ModalConfirmacionTutorial,
      bindings,
      modalConfig
    );
  }
*/
  guardarMateriaImpartidaTutorial(): void {
    let jsonFormularioMateriaImpartida =
      '{"idMateria": "' +
      this.registroSeleccionado.materia.id +
      '", "idTemarioParticular":"0' +
      '", "idPeriodoEscolar": "' + this.idPeriodoEscolar +
      '", "idPromocion": "' + this.promocionElegida.id +
      '", "numeroPeriodo": "' +
      this.registroSeleccionado.planEstudioMateria.numeroPeriodo +
      '", "idSala": "0' +
      '", "idHorario": "0' +
      '", "idLgac": "0' +
      '", "idCursoOptativo": "0' +
      '", "idActaCalificacion": "' +
      '", "idEstatus": "1222"}';
    //  //console.log(jsonFormularioMateriaImpartida);
    this.materiaImpartidaService.postMateriaImpartida(
      jsonFormularioMateriaImpartida,
      this.erroresConsultas
    ).subscribe(
      response => {
        if (response.json()) {
          ////console.log('MATERIA CREADA', new Materia(response.json()));
          this.registroSeleccionado = null;
          this.onCambiosTabla();

        }
        this.modalTutoria.close();

      }
    );

  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this.materiaImpartidaService = this._catalogosServices.getMateriaImpartidaService();
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosServices.getPromocion();
    this.periodoEscolarService = this._catalogosServices.getPeriodoEscolar();
    this.planEstudiosMateriaService = this._catalogosServices.getPlanEstudiosMateria();
    this.usuarioRolService = this._catalogosServices.getUsuarioRolService();
    this.profesorMateriaService = this._catalogosServices.getProfesorMateriaService();


    this.onCambiosTabla();
  }

}
/*
  getProgramasDocentes():void {

    let urlSearch = new URLSearchParams();
    this.promocionesSelect = this.programaDocenteService.
    getSelectProgramaDocente(this.erroresConsultas, urlSearch);


  }

  seleccionarProgramaDocente(programaDocenteId: number) {
    this.registroSeleccionado = null;
    this.botonBuscar = false;
    this.opcionesCatalogoPromocion = [];
    this.opcionesCatalogoPeriodo = [];

    this.promocionesSelect = [];
    this.promocionSeleccionada = null;
    let urlSearch = new URLSearchParams();
    if (programaDocenteId) {
      this.programaSeleccionado = programaDocenteId;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + programaDocenteId + ':IGUAL');
      this.promocionService.getListaPromocionesPag(this.erroresConsultas, urlSearch).
      subscribe(response => {
        response.json().lista.forEach((item) => {
          this.promocionesSelect.push(new Promocion(item));
        });
      });
    }

  }

  seleccionarPromocion(promocionId: number) {


    //    this.periodoEscolarService.getSelectByPromocion(promocionId, this.errores).then(periodosSelect => this.periodosSelect = periodosSelect);
  }

  seleccionarPeriodo(periodoId: number) {
    if(periodoId > 0)
      this.botonBuscar= true;
  }

  buscarMaterias(periodoId: number): void {
      if (periodoId) {
        this.idPeriodoEscolar = periodoId; //ID PERIODO ESCOLAR
        this.criteriosCabezera =
          'idMateria.idTipo.id~1:IGUAL;OR,idMateria.idTipo.id~2:IGUAL;' +
          'OR,idMateria.idTipo.id~4:IGUAL;OR,idMateria.idTipo.id~3:IGUAL;ORGROUPAND,idPlanEstudios.id~' +
          this.idPromocion + ':IGUAL;AND,numeroPeriodo~'
          + periodoId + ':IGUAL;AND';
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

  onCambiosTabla(): void {
    this.registros = [];

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = criterios + this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
      this._spinner.start("onCambiosTabla");
      this.planEstudiosMateriaService.getListaMateriasPlanSize(
        this.erroresConsultas,
        urlSearch,
        false
      ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            //   //console.log(item);
            this.registros.push(new PlanEstudiosMateria(item));
          });
          this.registrosMostrar = [];

        },
        error => {
          //console.log('error');
        },
        () => {
          if (this.registros.length > 0) {
            this.i = 0;
            this.registros.forEach((registro) => {
              this.buscarMateriaImpartida(registro);
            });
          }else {
            this._spinner.stop("onCambiosTabla");
          }
        }
      );
    }
  }

  buscarMateriaImpartida(planEstudioMateria: PlanEstudiosMateria): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMateria~' +
      planEstudioMateria.materia.id + ':IGUAL,idPeriodoEscolar~'
      + this.idPeriodoEscolar +
      ':IGUAL,idPromocion~' + this.promocionElegida.id
      + ':IGUAL,idEstatus~1222:IGUAL;AND');
    this.materiaImpartidaService.getListaMateriaImpartida(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        if (response.json().lista.length  > 0) {
          let materiaImpartida = new MateriaImpartida(response.json().lista[0]);
          this.registrosMostrar.push(new RegistroMateria
          (materiaImpartida.materia, materiaImpartida,
            planEstudioMateria));
          this.i ++;
          this.detenerSpinner();
        }else {
          this.registrosMostrar.push(new RegistroMateria
          (planEstudioMateria.materia, null, planEstudioMateria));
          this.i ++;
          this.detenerSpinner();
        }
      },
      error => {
        console.error(error);
      }
    );
  }


  detenerSpinner(): void {
    /*TODO Pendiente la validaciòn, para cuando los registros son 1, no esta correcta la validacion
     * se deteniene el spiner independietemente de la validacion
     *
    this._spinner.stop("onCambiosTabla");
    let u: number = this.i + 1;
    if (u == this.registros.length) {
      this._spinner.stop("onCambiosTabla");
    }
  }

  private prepareServices() {

    this.materiaImpartidaService = this._catalogosServices.getMateriaImpartidaService();
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.planEstudiosMateriaService = this._catalogosServices.getPlanEstudiosMateria();
    this.usuarioRolService = this._catalogosServices.getUsuarioRolService();
    this.profesorMateriaService = this._catalogosServices.getProfesorMateriaService();


    this.programaDocente.getSelectActivos(this.errores).then(programasDocentes => this.programasDocentesSelect = programasDocentes);

    this.onCambiosTabla();
  }
*/


