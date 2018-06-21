import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {ItemSelects} from "../../services/core/item-select.model";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {PlanEstudiosMateria} from "../../services/entidades/plan-estudios-materia.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {Materia} from "../../services/entidades/materia.model";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-plan-estudios-steps-materias',
  templateUrl: './plan-estudios-steps-materias.component.html',
  styleUrls: ['./plan-estudios-steps-materias.component.css']
})
export class PlanEstudiosStepsMateriasComponent implements OnInit {
  edicionFormulario: boolean = false;
  mensajeErrors: any = { 'required': 'Este campo es requerido' };
  enableValidation: boolean = false;
  errorNext: string = '';
  catalogoMaterias;
  formulario: FormGroup;
  idPlanEstudios;
  idProgramaDocente: number;
  planEstudiosMateriaService;
  registroSeleccionadoMateria: PlanEstudiosMateria;
  registroSeleccionadoCursoOptativo: PlanEstudiosMateria;
  registrosMaterias: Array<PlanEstudiosMateria>  = [];
  registrosCursosOptativos: Array<PlanEstudiosMateria>  = [];
  validacionActiva: boolean = false;
  totalHoras: number = 0;
  auxiliar: number = 0;
  totalMaterias: number = 0;
  numeroCreditos: number = 0;
  totalCreditos: number = 0;
  creditosTesis: number = 0;
  horasDocente: number = 0;
  horasIndependientes: number = 0;
  entidadPlanEstudios = PlanEstudio;
  planEstudiosService;
  planEstudiosInstancia: number = 0;
  estadoBoton: boolean;
  registrosAuxiliares: Array<PlanEstudiosMateria> = [];
  numeroMateria: number;
  numeroIdMateria: number;

  temporalMaterias: Array<Materia> = [];

  columnas: Array<any> = [

    { titulo: 'Período', nombre: 'numeroPeriodo' },
    { titulo: 'Lista de asignaturas o unidades de aprendizaje', nombre: 'idMateria' },
    { titulo: 'Clave', nombre: 'idMateria' },
    { titulo: 'Seriación', nombre: 'idMateria' },
    { titulo: 'Horas con docente', nombre: 'horasDocente' },
    { titulo: 'Horas independientes', nombre: 'horasIndependiente' },
    { titulo: 'Créditos', nombre: 'numeroCreditodos' }

  ];

  columnasMateriasOptativas: Array<any> = [

    { titulo: 'Período', nombre: 'numeroPeriodo' },
    { titulo: 'Lista de asignaturas o unidades de aprendizaje cursos optativos', nombre: 'idMateria' },
    { titulo: 'Clave', nombre: 'idMateria' },
    { titulo: 'Seriación', nombre: 'idMateria' },
    { titulo: 'Horas con docente', nombre: 'horasDocente' },
    { titulo: 'Horas independientes', nombre: 'horasIndependiente' },
    { titulo: 'Créditos', nombre: 'numeroCreditodos' }

  ];
  private opcionesCatMaterias: Array<ItemSelects> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private sub: any;

  constructor(private elementRef: ElementRef,
              route: ActivatedRoute,
              private injector: Injector, private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private _router: Router, private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    //console.log(params.id);
    this.prepareService();

    this.formulario = new FormGroup({
      idMateria: new FormControl(''),
      numeroAsignaturas: new FormControl(''),
      horasDocente: new FormControl(''),
      horasIndependiente: new FormControl(''),
      numeroPeriodo:  new FormControl('', Validators.required),
      sumaCreditos:  new FormControl(''),
      totalCreditos:  new FormControl(''),
      creditosTesis:  new FormControl(''),
      idPlanEstudios: new FormControl(this.idPlanEstudios)
    });

    if (this.idPlanEstudios) {
      let planEstudios: PlanEstudio;
      this.edicionFormulario = true;
      this.planEstudiosService.getEntidadPlanEstudio(
        this.idPlanEstudios,
        this.erroresConsultas
      ).subscribe(
        response => planEstudios = new PlanEstudio(response.json()),
        error => {
          console.error(error);
        },
        () => {
          //console.log(planEstudios);
          if (this.formulario) {
            let stringhorasDocente = 'horasDocente';
            let stringhorasIndependiente = 'horasIndependiente';
            let stringnumeroAsignaturas = 'numeroAsignaturas';
            let stringsumaCreditos = 'sumaCreditos';
            let stringcreditosTesis = 'creditosTesis';
            let stringtotalCreditos = 'totalCreditos';

            (<FormControl>this.formulario.controls[stringcreditosTesis])
              .setValue(planEstudios.creditosTesis);
            (<FormControl>this.formulario.controls[stringnumeroAsignaturas])
              .setValue(planEstudios.numeroAsignaturas);
            (<FormControl>this.formulario.controls[stringhorasDocente])
              .setValue(planEstudios.horasDocente);
            (<FormControl>this.formulario.controls[stringhorasIndependiente])
              .setValue(planEstudios.horasIndependiente);
            (<FormControl>this.formulario.controls[stringnumeroAsignaturas])
              .setValue(planEstudios.numeroAsignaturas);
            (<FormControl>this.formulario.controls[stringtotalCreditos])
              .setValue(planEstudios.totalCreditos);
            (<FormControl>this.formulario.controls[stringsumaCreditos])
              .setValue(planEstudios.sumaCreditos);

            this.creditosTesis = planEstudios.creditosTesis;
            this.idProgramaDocente = planEstudios.programaDocente.id;
            this.filtrarMaterias(this.idProgramaDocente);
          }
        }
      );
    }

    this.onCambiosMateriasPlanEstudios();
    this.cargarListaCursosOptativos();
  }

  previusMethod(): boolean {
    return true;
  }

  finishMethod() {
    let idPlanEstudiosGuardado;
    //console.log('next');
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    //console.log(jsonFormulario);
    if (this.idPlanEstudios) {
      this.planEstudiosService
        .putPlanEstudio(
          this.idPlanEstudios,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this._router.navigate(['/catalogo','plan-estudios']);
        }
      );
      //return true;
    }
  }

  agregarMateriaPlanEstudios(): any {
    if (this.numeroMateria < 1) {
      if (this.validarFormulario()) {
        this._spinner.start("planestudio1");
        let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
        //console.log(jsonFormulario);
        this.planEstudiosMateriaService
          .postPlanEstudiosMateria(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success Save'),
          console.error,
          () => {
            this.onCambiosMateriasPlanEstudios();
            this.cargarListaCursosOptativos();
            this.limpiarCampos();
            this.estadoBoton = false;
            this._spinner.stop("planestudio1");

          }
        );
      }
    }
    this.filtrarMaterias(this.idProgramaDocente);
  }

  limpiarCampos(): void {
    (<FormControl>this.formulario.controls['numeroPeriodo']).setValue('');
    (<FormControl>this.formulario.controls['idMateria']).setValue('');
    this.opcionesCatMaterias = [];

  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionadoMateria === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionadoMateria !== registro) {
      this.registroSeleccionadoMateria = registro;
    } else {
      this.registroSeleccionadoMateria = null;
    }
  }

  rowSeleccionadoCursoOptativo(registro): boolean {
    return (this.registroSeleccionadoCursoOptativo === registro);
  }

  rowSeleccionCursoOptativo(registro): void {
    if (this.registroSeleccionadoCursoOptativo !== registro) {
      this.registroSeleccionadoCursoOptativo = registro;
    } else {
      this.registroSeleccionadoCursoOptativo = null;
    }
  }

  onCambiosMateriasPlanEstudios(): void {
    this.registroSeleccionadoMateria = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idMateria.idTipo~5:NOT,idPlanEstudios~' + this.idPlanEstudios + ':IGUAL;AND';
    urlParameter.set('criterios', criterio);
    let ordenamiento = 'numeroPeriodo:ASC';
    urlParameter.set('ordenamiento', ordenamiento);

    this.planEstudiosMateriaService.
    getListaMateriasPlanSize(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        this.registrosMaterias = [];
        let respuesta = response.json();
        respuesta.lista.forEach((item) => {
          this.registrosMaterias.push(new PlanEstudiosMateria(item));
        });
        this.horasDocente = 0;
        this.horasIndependientes = 0;
        this.numeroCreditos = 0;

        //console.log('RESPUESTA  ' + respuesta);
        this.totalMaterias = this.registrosMaterias.length;
        this.registrosMaterias.forEach((item) => {
            this.horasDocente = this.horasDocente + item.materia.horasDocente;
            this.horasIndependientes = this.horasIndependientes + item.materia.horasIndependiente;
            this.numeroCreditos = this.numeroCreditos + +item.materia.creditos;
          }
        );
      },
      error => {
        console.error(error);
      },
      () => {
        this.totalCreditos = this.numeroCreditos + this.creditosTesis;
        let stringNumeroAsignaturas = 'numeroAsignaturas';
        let stringHorasDocente = 'horasDocente';
        let stringHorasIndependiente = 'horasIndependiente';
        let stringNumeroCreditos = 'sumaCreditos';
        let stringTotalCreditos = 'totalCreditos';
        (<FormControl>this.formulario.controls[stringNumeroAsignaturas])
          .setValue(this.totalMaterias);
        (<FormControl>this.formulario.controls[stringHorasDocente])
          .setValue(this.horasDocente);
        (<FormControl>this.formulario.controls[stringHorasIndependiente])
          .setValue(this.horasIndependientes);
        (<FormControl>this.formulario.controls[stringNumeroCreditos])
          .setValue(this.numeroCreditos);
        (<FormControl>this.formulario.controls[stringTotalCreditos])
          .setValue(this.totalCreditos);
      }
    );
  }

  cargarListaCursosOptativos(): void {
    this.registroSeleccionadoCursoOptativo = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idMateria.idTipo~5:IGUAL,idPlanEstudios~' + this.idPlanEstudios + ':IGUAL;AND';
    urlParameter.set('criterios', criterio);
    let ordenamiento = 'numeroPeriodo:ASC';
    urlParameter.set('ordenamiento', ordenamiento);

    this.planEstudiosMateriaService.
    getListaMateriasPlanSize(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        this.registrosCursosOptativos = [];
        let respuesta = response.json();
        respuesta.lista.forEach((item) => {
          this.registrosCursosOptativos.push(new PlanEstudiosMateria(item));
        });
      },
      error => {
        console.error(error);
      },
      () => {

      }
    );
  }

  eliminarMateria(): void {
    if (this.registroSeleccionadoMateria || this.registroSeleccionadoCursoOptativo) {
      //console.log('Eliminando...');
      this.planEstudiosMateriaService.deletePlanEstudiosMateria(
        this.registroSeleccionadoMateria.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosMateriasPlanEstudios();
          this.registroSeleccionadoMateria = null;
        }
      );
    } else { }
  }

  eliminarMateriaCursoOptativo(): void {
    if (this.registroSeleccionadoCursoOptativo) {
      //console.log('Eliminando...');
      this.planEstudiosMateriaService.deletePlanEstudiosMateria(
        this.registroSeleccionadoCursoOptativo.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.cargarListaCursosOptativos();
          this.registroSeleccionadoCursoOptativo = null;
        }
      );
    } else { }
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
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

  getIdMateria(idMateria): void {
    this.estadoBoton = false;
    if (idMateria) {
      this.numeroIdMateria = idMateria;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idMateria~' + this.numeroIdMateria + ':IGUAL' +
        ',idPlanEstudios~' + this.idPlanEstudios + ':IGUAL');

      this.planEstudiosMateriaService.getListaMateriasPlanSize(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          this.registrosAuxiliares = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosAuxiliares.push(new PlanEstudiosMateria(item));
          });
          this.numeroMateria = this.registrosAuxiliares.length;
          //console.log('TAMAÑO' + this.registrosAuxiliares.length);
        },
        error => {
          console.error(error);
        },
        () => {
          if (this.numeroMateria < 1) {
            this.estadoBoton = true;
          }else {
            this.estadoBoton = false;
          }
        }
      );
    }else {
      this.estadoBoton = false;
    }
  }

  mostrarBotonAgregar(): boolean {
    return this.estadoBoton;
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  filtrarMaterias(id: number): void{
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus~1007' + ':IGUAL' +
      ',idProgramaDocente~' + id  + ':IGUAL');

    this.catalogoMaterias.
    getSelectMateriaNombre(this.erroresConsultas, urlParameter)
      .subscribe(response => {
          let respuesta = response.json().lista;
          respuesta.forEach((item) => {
            this.opcionesCatMaterias.push(new ItemSelects(item.id, item.clave+' - '+item.descripcion))
          })
        }
      );
  }

  private prepareService(): void {
    this.catalogoMaterias = this._catalogosService.getMateria();
    this.planEstudiosMateriaService = this._catalogosService.getPlanEstudiosMateria();
    this.planEstudiosService = this._catalogosService.getPlanEstudios();
  }


  ngOnInit() {
  }

}
