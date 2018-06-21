import { element } from 'protractor';
import { Subscription } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {ActividadContinuaEstudiante} from '../../services/entidades/actividad-continua-estudiante.model';
import {ActividadContinuaProfesor} from '../../services/entidades/actividad-continua-profesor.model';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Router, ActivatedRoute} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ActividadEvaluacionContinua} from '../../services/entidades/actividad-evaluacion-continua.model';
import * as moment from 'moment';
import { CompleterService, CompleterData } from 'ng2-completer';

@Component({
  selector: 'app-editar-formacion-continua',
  templateUrl: './editar-formacion-continua.component.html',
  styleUrls: ['./editar-formacion-continua.component.css']
})
export class EditarFormacionContinuaComponent implements OnInit {
  public idActividadContinuaUpdate: number = 0;
  formularioEditarActividades: FormGroup;
  actividadEvaluacionContinuaService;

  registrosEstudiante: Array<ActividadContinuaEstudiante> = [];
  registrosEstudianteTemporal: Array<ActividadContinuaEstudiante> = [];
  registroSeleccionadoEstudiante: ActividadContinuaEstudiante;
  registrosProfesor: Array<ActividadContinuaProfesor> = [];
  registrosProfesorTemporal: Array<ActividadContinuaProfesor> = [];
  registroSeleccionadoProfesor: ActividadContinuaProfesor;

  // Autocomplete
  // selects

  public elementRef;
  // Services
  estudianteService;

  mensajeErrors: any = { 'required': 'Este campo es requerido' };
  enableValidation: boolean = false;
  errorNext: string = '';
  // lista de estudiantes
  registros: Array<Estudiante> = [];

  idProfesor: number = 0;
  idProfesorAgregar: number;
  idEstudiante: number = 0;
  idEstudianteAgregar: number;
  registrosActividadProfesorByID: Array<ActividadContinuaProfesor>;
  numeroProfesor: number;
  registrosActividadEstudianteByID: Array<ActividadContinuaEstudiante>;
  numeroEstudiante: number;

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;


  actividadContinuaEstudiante;
  actividadContinuaEstudianteService;
  actividadContinuaProfesor;

  formularioTablaAutocomplete: FormGroup;

  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'matricula', sort: false},
    { titulo: 'Nombre',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: false },
    { titulo: 'Programa Docente', nombre: 'programaDocente', sort: false}
  ];

  columnasProfesores: Array<any> = [
    { titulo: 'Lista de profesores', nombre: 'idProfesor', sort: false}
  ];

  // banderaEstudianteTemporal: boolean = false;
  banderaProfesorTemporal: boolean = false;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'matricula'}
  };

  private opcionSelectedActividadContinuaProfesor: Array<ItemSelects> = [];
  private opcionSelectedActividadContinuaEstudiante: Array<ItemSelects> = [];
  private idEstudiantesAgregados: Array<number> = [];
  ////// picker ///
  public dt: Date = new Date();
  public minDate: Date = new Date();
  ////////////////////////////////////
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  // Autocomplete
  private isComplete: boolean = false;
  private estudianteSelAutocomplete: Estudiante;
//  private typeAheadEventEmitter = new Rx.Subject<string>();
  private opcionesEstudiante: Array<ItemSelects> = [];
  // mesajes de error
  // aleret
  errorAgregarEstudiante = false;
  errorAgregarProfesor = false;
  private alertas: Array<Object> = [];

  // variable para obtener el parms
  private sub: any;

  // variables para le autocomplete
  private searchStr2: string;
  private opcionesEstudiantes: any = [];

  constructor(private _router: Router,
              private route: ActivatedRoute,
              public catalogosService: CatalogosServices,
              private _spinner: SpinnerService) {
    this.obtenerIdActivadContinua();
    this.prepareService();
    this.listaAlumnos();
    this.obtenerIDEstudiantesActividadConstinua();
    this.inicializarFormularioActividadContinua();
    this.inicializarFormularioAsistentes();
    this.obtenerEntidadActividadContinua();
    this.onCambiosTablaEstudiantes();
    this.onCambiosTablaProfesores();
  }

  obtenerIDEstudiantesActividadConstinua(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    if (this.idActividadContinuaUpdate) {
      urlSearch.set('criterios', 'idActividadEvaluacionContinua~' +
        this.idActividadContinuaUpdate + ':IGUAL');
      this._spinner.start('buscarIdEstudiantes');
      this.actividadContinuaEstudiante.getListaActividadEstudiantes(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          let responseElemetosActividad = response.json();

          responseElemetosActividad.lista.forEach(element => {
            this.idEstudiantesAgregados.push(element.id_estudiante.id);
          });

        },
        error => {
          this._spinner.stop('buscarIdEstudiantes');
        },
        () => {
          this._spinner.stop('buscarIdEstudiantes');
        }
      );
    }

  }

  obtenerIdActivadContinua(): void {
    this.sub = this.route.params.subscribe(params => {
      this.idActividadContinuaUpdate = params['id'];
    });
  }

  obtenerEntidadActividadContinua(): void {
    if (this.idActividadContinuaUpdate) {
      this._spinner.start('obtenerEntidad');
      let actividadContinuaUpddate: ActividadEvaluacionContinua;
      this.actividadEvaluacionContinuaService.getActividadEvaluacionContinua(
        this.idActividadContinuaUpdate,
        this.erroresConsultas
      ).subscribe(
        response =>
          actividadContinuaUpddate = new ActividadEvaluacionContinua(
            response.json()),
        error => {
          this._spinner.stop('obtenerEntidad');
          console.error(error);
        },
        () => {
          if (this.formularioEditarActividades) {
            this._spinner.stop('obtenerEntidad');
            let stringActividad = 'actividad';
            let fechaRecuperar = moment(actividadContinuaUpddate.fecha);

            (<FormControl>this.formularioEditarActividades.controls[stringActividad]).
              patchValue(actividadContinuaUpddate.actividad);

            this.dt = new Date(fechaRecuperar.toJSON());
          }
        }
      );
    }
  }

  inicializarFormularioActividadContinua(): void {
    this.formularioEditarActividades = new FormGroup({
      actividad: new FormControl('', Validators.required),
      fecha: new FormControl('', Validators.required)
    });
  }

  inicializarFormularioAsistentes(): void {
    this.formularioTablaAutocomplete = new FormGroup({
      agregarAsistentes: new FormControl('')
    });
  }

 filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
//    this.typeAheadEventEmitter.next(filtroTexto);
  }

  filter(urlParameter: URLSearchParams): void {
    this.estudianteService.getSelectEstudianteNombre(
      this.erroresConsultas, urlParameter).subscribe(
      response => {
        let items = response.json().lista;
        if (items) {
          this.opcionesEstudiante = [];
          items.forEach((item) => {
            this.opcionesEstudiante.push(
              new ItemSelects(item.id,
                item.id_matricula.matricula_completa + ' ' +
                item.id_datos_personales.nombre + ' ' +
                item.id_datos_personales.primer_apellido + ' ' +
                item.id_datos_personales.segundo_apellido));
          });
        }
      },
      error => {
          console.error(error);

        this._spinner.stop('editarformacioncontinua1');
        this.isComplete = false;
      },
      () => {
        //// // console.log(this.opcionesEstudiante);

        this._spinner.stop('editarformacioncontinua1');
        this.isComplete = false;
      }
    );
  }

  private autocompleteOnSelect(e: any) {
    this._spinner.start('editarformacioncontinua2');
    this.catalogosService.getEstudiante().getEstudiante(
      e.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.estudianteSelAutocomplete = new Estudiante(response.json());
        this.idEstudiante = this.estudianteSelAutocomplete.id;
        //// // console.log('este es el id del estudiante: ' + this.idEstudiante);

      },
      error => {
        this._spinner.stop('editarformacioncontinua2');
      },
      () => {
        this._spinner.stop('editarformacioncontinua2');
      }
    );
    // this._spinner.stop();
  }

  ////// picker ///
  getFecha(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioEditarActividades.controls['fecha']).patchValue(fechaConFormato + ' 10:30am');
//        .updateValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }
  ///////

  validarFormularioActividadContinua(): boolean {
    if (this.formularioEditarActividades.valid) {
      return true;
    }
  }

  rowSeleccionadoEstudiante(registro): boolean {
    return (this.registroSeleccionadoEstudiante === registro);
  }

  rowSeleccionEstudiante(registro): void {
    if (this.registroSeleccionadoEstudiante !== registro) {
      this.registroSeleccionadoEstudiante = registro;
    } else {
      this.registroSeleccionadoEstudiante = null;
    }
  }

  rowSeleccionadoProfesor(registro): boolean {
    return (this.registroSeleccionadoProfesor === registro);
  }

  rowSeleccionProfesor(registro): void {
    if (this.registroSeleccionadoProfesor !== registro) {
      this.registroSeleccionadoProfesor = registro;
    } else {
      this.registroSeleccionadoProfesor = null;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioEditarActividades.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioEditarActividades.controls[campo])) {
      return true;
    }
    return false;
  }

  getIdEstudianteSelect(idEstudiante): void {
    if (idEstudiante) {
      this.idEstudianteAgregar = idEstudiante;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstudiante~' + this.idEstudianteAgregar + ':IGUAL' +
        ',idActividadEvaluacionContinua~' + this.idActividadContinuaUpdate + ':IGUAL');

      this.actividadContinuaEstudiante.getListaActividadEstudiantes(this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          this.registrosActividadEstudianteByID = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosActividadEstudianteByID.push(
              new ActividadContinuaEstudiante(item));
          });
          this.numeroEstudiante = this.registrosActividadEstudianteByID.length;
          //// // console.log('TAMAÑO' + this.registrosActividadEstudianteByID.length);
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  getIdProfesorSelect(idProfesor): void {
    if (idProfesor) {
      this.idProfesorAgregar = idProfesor;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idProfesor~' + this.idProfesorAgregar + ':IGUAL' +
        ',idActividadEvaluacionContinua~' + this.idActividadContinuaUpdate + ':IGUAL');

      this.actividadContinuaProfesor.getListaActividadProfesores(this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          this.registrosActividadProfesorByID = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosActividadProfesorByID.push(
              new ActividadContinuaProfesor(item));
          });
          this.numeroProfesor = this.registrosActividadProfesorByID.length;
          //// console.log('TAMAÑO' + this.registrosActividadProfesorByID.length);
        },
        error => {
          console.error(error);

        }
      );
    }
  }

  // REGISTRO TEMPORAL DE PROFESORES
  // agregarProfesorTemporal(): void {
  //     let profesorSeleccionado: Profesor;
  //     this.catalogosService.getProfesor().
  //     getProfesor(this.idProfesorAgregar, this.erroresConsultas).subscribe(
  //         response => {
  //             profesorSeleccionado = new Profesor(response.json());
  //         },
  //         error =>{ console.error(error);},
  //         () => {
  //             let actividadProfesorTemporal: ActividadContinuaProfesor =
  //                  new ActividadContinuaProfesor('');
  //             actividadProfesorTemporal.profesor = profesorSeleccionado;
  //             this.registrosProfesorTemporal.push(actividadProfesorTemporal);
  //             this.banderaProfesorTemporal = true;
  //         }
  //     )
  // }

  agregarProfesor(): void {
    if (this.idProfesorAgregar) {
      let jsonProfesor = {
        idProfesor: this.idProfesorAgregar,
        idActividadEvaluacionContinua: this.idActividadContinuaUpdate
      };

      //// console.log(jsonProfesor);
      let jsonFormulario = JSON.stringify(jsonProfesor, null, 2);

      this.actividadContinuaProfesor
        .postActividadContinuaProfesor(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        () => {
          this.idProfesorAgregar = null;
          //// console.log('Success')
        },
        console.error,
        () => {
          this.onCambiosTablaProfesores();
          this.idProfesorAgregar = null;
          this.opcionSelectedActividadContinuaProfesor =
            this.catalogosService
              .getProfesor().getSelectProfesor(this.erroresConsultas);

        }
      );

    }
  }

  // REGISTRO TEMPORAL DE ESTUDIANTES
  // agregarEstudianteTemporal(): void {
  //     let estudianteSeleccionado: Estudiante;
  //     this.catalogosService.getEstudiante().getEstudiante(
  //          this.idEstudiante, this.erroresConsultas).subscribe(
  //         response => {
  //             estudianteSeleccionado = new Estudiante(response.json());
  //         },
  //         error =>{ console.error(error);},
  //         () => {
  //             let actividadEstudianteTemporal: ActividadContinuaEstudiante =
  //                  new ActividadContinuaEstudiante('');
  //             actividadEstudianteTemporal.estudiante = estudianteSeleccionado;
  //             this.registrosEstudianteTemporal.push(actividadEstudianteTemporal);
  //             this.banderaEstudianteTemporal = true;
  //         }
  //     )
  // }

  agregarEstudiante(): void {
    if (!this.verificarEstuidantesAgregados(this.idEstudiante)) {
      if (this.idEstudiante) {

        let jsonEstudiante = {
          idEstudiante: this.idEstudiante,
          idActividadEvaluacionContinua: this.idActividadContinuaUpdate
        };

        let jsonFormulario = JSON.stringify(jsonEstudiante, null, 2);
        this._spinner.start('agregarEstudiante');
        this.actividadContinuaEstudiante
          .postActividadContinuaEstudiante(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {},
          error => {
            this._spinner.stop('agregarEstudiante');
          },
          () => {
            this._spinner.stop('agregarEstudiante');
            this.opcionesEstudiante = [];
            this.estudianteSelAutocomplete = null;
            this.idEstudiantesAgregados.push(this.idEstudiante);
            this.idEstudiante = null;
            this.searchStr2 = null;
            this.onCambiosTablaEstudiantes();
          }
        );
      }
    } else {
        this.errorAgregarEstudiante = true;
        this.opcionesEstudiante = [];
        this.estudianteSelAutocomplete = null;
        this.idEstudiante = null;
        this.addErrorsMesaje('Ya se registro el estudiante', 'danger');
      }
  }

  private verificarEstuidantesAgregados(idEstudiante: number): boolean {
    let hayEstudiantesAgregados = false;
    if ( this.idEstudiantesAgregados.length > 0) {
      this.idEstudiantesAgregados.forEach((item) => {
        if (item === idEstudiante) {
          hayEstudiantesAgregados = true;
        }
      });
    } else {
      hayEstudiantesAgregados = false;
    }
    return hayEstudiantesAgregados;
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
    this.errorAgregarEstudiante = false;
    this.errorAgregarProfesor = false;
  }

  eliminarProfesor() {
    //// console.log('Eliminando...');
    this.actividadContinuaProfesor.deleteProfesor(
      this.registroSeleccionadoProfesor.id,
      this.erroresConsultas
    ).subscribe(
      () => {}, //// console.log('Success'),
      console.error,
      () => {
        this.onCambiosTablaProfesores();
      }
    );
    this.opcionSelectedActividadContinuaProfesor =
      this.catalogosService
        .getProfesor().getSelectProfesor(this.erroresConsultas);
  }

  eliminarEstudiante() {
    //// console.log('Eliminando...');
    this._spinner.start('eliminarEstudiante');
    this.actividadContinuaEstudiante.deleteEstudiante(
      this.registroSeleccionadoEstudiante.id,
      this.erroresConsultas
    ).subscribe(
      () => {}, //// console.log('Success'),
      error => {
        this._spinner.stop('eliminarEstudiante');
      },
      () => {
        this.eliminarElementoArregloIdEstudiantes(
          this.registroSeleccionadoEstudiante.estudiante.id
        );
        this._spinner.stop('eliminarEstudiante');
        this.onCambiosTablaEstudiantes();
      }
    );
  }

  eliminarElementoArregloIdEstudiantes(idEstudiante: number): void {
    let indexElementoABorrar = this.idEstudiantesAgregados.indexOf(idEstudiante);
    if (indexElementoABorrar > -1) {
      this.idEstudiantesAgregados.splice(indexElementoABorrar, 1);
    }
  }

  // METODO REGISTRAR REGISTROS ESTUDIANTES/PROFESORES EN MODO TEMPORAL
  // editarActividadContinua():void {
  //     //Update de Actividad Continua
  //     if (this.validarFormularioActividadContinua()) {
  //         let jsonFormularioActividad =
  //              JSON.stringify(this.formularioEditarActividades.value, null, 2);
  //         //// console.log('entra aqui');
  //         this.actividadEvaluacionContinuaService.putActividadEvaluacionContinua(
  //             this.idActividadContinuaUpdate,
  //             jsonFormularioActividad,
  //             this.erroresGuardado
  //         );
  //         //Update si se agregan estudiantes
  //         if (this.banderaEstudianteTemporal === true && this.idEstudiante) {
  //             let item;
  //             for (var _i = 0; _i < this.registrosEstudianteTemporal.length; _i++) {
  //                 item = this.registrosEstudianteTemporal[_i];
  //
  //                 let idEstudianteTemporal = item.estudiante.id;
  //
  //                 let jsonEstudiante = {
  //                     idEstudiante: idEstudianteTemporal,
  //                     idActividadEvaluacionContinua: this.idActividadContinuaUpdate
  //                 };
  //
  //                 let jsonFormulario = JSON.stringify(jsonEstudiante, null, 2);
  //                 //// console.log('entra post');
  //                 this.actividadContinuaEstudiante
  //                     .postActividadContinuaEstudiante(
  //                         jsonFormulario,
  //                         this.erroresGuardado
  //                     ).subscribe(
  //                     () =>
  //                         //// console.log('Success'),
  //                     console.error
  //                 );
  //             }
  //         }
  //         //Update si se agregan profesores
  //         if (this.banderaProfesorTemporal === true) {
  //             let item;
  //             for (var _i = 0; _i < this.registrosProfesorTemporal.length; _i++) {
  //                 item = this.registrosProfesorTemporal[_i];
  //
  //                 let idProfesorTemporal = item.profesor.id;
  //
  //                 let jsonProfesor = {
  //                     idProfesor: idProfesorTemporal,
  //                     idActividadEvaluacionContinua: this.idActividadContinuaUpdate
  //                 };
  //
  //                 let jsonFormulario = JSON.stringify(jsonProfesor, null, 2);
  //
  //                 this.actividadContinuaProfesor
  //                     .postActividadContinuaProfesor(
  //                         jsonFormulario,
  //                         this.erroresGuardado
  //                     ).subscribe(
  //                     () =>
  //                         //// console.log('Success'),
  //                     console.error
  //                 );
  //             }
  //         }
  //
  //         this._router.parent.navigate(['ListaAprendizajes']);
  //     }
  //     else {
  //         alert('Se deben completar todos los campos');
  //     }
  // }

  editarActividadContinua(): void {
    if (this.validarFormularioActividadContinua()) {
      let jsonFormularioActividad =
        JSON.stringify(this.formularioEditarActividades.value, null, 2);

      this._spinner.start('actualizar');
      this.actividadEvaluacionContinuaService.putActividadEvaluacionContinua(
        this.idActividadContinuaUpdate,
        jsonFormularioActividad,
        this.erroresGuardado
      ).subscribe(
        response => {},
        error => { this._spinner.stop('actualizar'); },
        () => {
          this._spinner.stop('actualizar');
          this.regresarListaActividades();
        }
      );
    }
  }

  // Tabla Lista Estudiantes UPDATE
  onCambiosTablaEstudiantes(): void {
    //// console.log('entra metodo oncambiostabla estudiante')
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = '';

    if (this.idActividadContinuaUpdate) {
      criterio = 'idActividadEvaluacionContinua~' + this.idActividadContinuaUpdate + ':IGUAL';
    }else {
      //// console.log('este es el el idActiContinua' + this.idActividadContinuaUpdate);
    }
    urlSearch.set('criterios', criterio);
    //// console.log('este es el resultado' + criterio);

    this.registrosEstudiante =
      this.actividadContinuaEstudiante.getListaActividadContinuaEstudiante(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  // Tabla Lista Profesores UPDATE
  onCambiosTablaProfesores(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = '';

    if (this.idActividadContinuaUpdate) {
      criterio = 'idActividadEvaluacionContinua~' + this.idActividadContinuaUpdate + ':IGUAL';
    }
    urlSearch.set('criterios', criterio);

    this.registrosProfesor =
      this.actividadContinuaProfesor.getListaActividadContinuaProfesor(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  private listaAlumnos(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idEstatus~1006:IGUAL');
    this._spinner.start('listaAlumno');
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((estudianteJson) => {
          let estudiante = new Estudiante(estudianteJson);
          this.opcionesEstudiantes.push({'id': estudiante.id, 'matricula': estudiante.matricula.matriculaCompleta,
           'name': this.generarEstructuraEstudiante(estudiante)
          });
        });
      },
      error => { this._spinner.stop('listaAlumno'); },
      () => { this._spinner.stop('listaAlumno'); }
    );
  }

  private generarEstructuraEstudiante(estudiante: Estudiante): string {
    return (estudiante.matricula.matriculaCompleta ? estudiante.matricula.matriculaCompleta : ' ' ) + ' ' +
                  estudiante.datosPersonales.nombre + ' ' +
                  estudiante.datosPersonales.primerApellido + ' ' +
                  (estudiante.datosPersonales.segundoApellido ? estudiante.datosPersonales.segundoApellido : '');
  }

  private regresarListaActividades(): void {
    this._router.navigate(['formacion-continua']);
  }

  private prepareService(): void {
    this.actividadEvaluacionContinuaService =
      this.catalogosService.getActividadEvaluacionContinuaService();

    this.actividadContinuaEstudiante =
      this.catalogosService.getActividadContinuaEstudianteService();

    this.actividadContinuaEstudianteService =
      this.catalogosService.getActividadContinuaEstudianteService();  

    this.actividadContinuaProfesor =
      this.catalogosService.getActividadContinuaProfesorService();

    this.opcionSelectedActividadContinuaProfesor =
      this.catalogosService
        .getProfesor().getSelectProfesor(this.erroresConsultas);

    // this.opcionSelectedActividadContinuaEstudiante =
    //     this.catalogosService
    //         .getEstudiante().getSelectEstudiante(this.erroresConsultas);

    this.estudianteService = this.catalogosService.getEstudiante();
  }


  ngOnInit() {
  }

}
