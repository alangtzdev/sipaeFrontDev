import { Component, OnInit } from '@angular/core';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ActividadContinuaEstudiante} from '../../services/entidades/actividad-continua-estudiante.model';
import {ActividadContinuaProfesor} from '../../services/entidades/actividad-continua-profesor.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {Router} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import * as moment from 'moment/moment';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import {URLSearchParams} from '@angular/http';
import {Validacion} from '../../utils/Validacion';
import { CompleterService, CompleterData } from 'ng2-completer';


@Component({
  selector: 'app-crear-formacion-continua',
  templateUrl: './crear-formacion-continua.component.html',
  styleUrls: ['./crear-formacion-continua.component.css']
})
export class CrearFormacionContinuaComponent implements OnInit {
  guardarRegistro: boolean = false;
  public elementRef;
  //Services
  estudianteService;
  mensajeErrors: any = { 'required': 'Este campo es requerido' };
  enableValidation: boolean = false;
  errorNext: string = '';

  //   mesajes de error
  // private erroresConsultas: Array<Object> = [];

  // lista de estudiantes
  registros: Array<Estudiante> = [];
  ////////////////////////////////////////////////////////////////////

  public idActividadEvaluacionContinua: number = 0;
  validacionActiva: boolean = false;

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  registrosEstudiante: Array<ActividadContinuaEstudiante> = [];
  registroSeleccionadoEstudiante: ActividadContinuaEstudiante;
  registrosProfesor: Array<ActividadContinuaProfesor> = [];
  registroSeleccionadoProfesor: ActividadContinuaProfesor;
  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idEstudiante', sort: false},
    { titulo: 'Nombre', nombre: 'idEstudiante', sort: false},
    { titulo: 'Programa Docente', nombre: 'idPromocion', sort: false}
  ];
  public configuracionTablaEstudiante: any = {
    paginacion: true,
    filtradoBusquedaTabla: { textoFiltroBusquedaTabla: '', columnas:
    'idEstudiante.idMatricula,idEstudiante.idUsuario.nombre,' +
    'idEstudiante.idUsuario.primerApellido,' +
    'idEstudiante.idUsuario.segundoApellido,idPromocion.idProgramaDocente.descripcion'}
  };
  columnasProfesores: Array<any> = [
    { titulo: 'Lista de profesores', nombre: 'profesor'}
  ];
  public configuracion: any = {
    paginacion: false,
    filtrado: { textoFiltro: ''}
  };

  idProfesor: number = 0;
  idProfesorAgregar: number;
  idEstudiante: number = 0;

  registrosActividadProfesorByID: Array<ActividadContinuaProfesor>;
  numeroProfesor: number;

  formularioActividades: FormGroup;
  formularioTablaAutocomplete: FormGroup;

  actividadEvaluacionContinua;
  actividadContinuaEstudiante;
  actividadContinuaProfesor;

  // vairables par mostar mensaje error
  errorAgregarEstudiante = false;
  errorAgregarProfesor = false;

  ////// picker ///
  public dt: Date = new Date();
  public minDate: Date = new Date();
  ////////////////////////////////////

  edicionFormulario: boolean = false;
  public idActividadContinua: number;

  // aleret
  private alertas: Array<Object> = [];

  private erroresGuardado: Array<ErrorCatalogo> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private idEstudiantesAgregados: Array<number> = [];
  private idProfesoresAgregados: Array<number> = [];
  // selects
  private opcionesEstudiante: Array<ItemSelects> = [];
  private opcionSelectedActividadContinuaProfesor: Array<ItemSelects> = [];

  // Autocomplete
  private isComplete: boolean = false;
  private estudianteSelAutocomplete: Estudiante;
  private opcionesEstudiantes = [];

  protected searchStr2: string;
//  private typeAheadEventEmitter = new Rx.Subject<string>();

  // Constructor
  constructor(public catalogosService: CatalogosServices,
              private router: Router,
              private _spinner: SpinnerService) {
/*    let params = router.parent.currentInstruction.component.params;
    this.idActividadContinua = params.id;
    if (this.idActividadContinua) {
      //console.log('este es el id:' + this.idActividadContinua);
    } else {
      //console.log('no hay id D:');
    }*/

    moment.locale('es');
    this.prepareService();
    this.listaAlumnos();

    this.formularioActividades = new FormGroup({
      actividad: new FormControl('',
        Validators.compose([Validators.required, Validacion.textoValidator])), // ValidacionService.textoValidator])),
      fecha: new FormControl('', Validators.required)
    });

    this.formularioTablaAutocomplete = new FormGroup({
      agregarAsistentes: new FormControl('')
    });

    // Evento para el autocomplete que se activa (evento keyup) cuado se construye la clase
/*    this.typeAheadEventEmitter
      .debounceTime(700)
      .switchMap(val => {
        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterios = '';
        let filtros: Array<string> = val.split(' ');

        if (this.configuracion.filtrado && val !== ''
          && this.opcionesEstudiante.length == 0) {
          if (!this.isComplete)
            this._spinner.start('crearformacioncontinua1');

          criterios = 'idMatricula.matriculaCompleta~' + filtros[0] + ':LIKE;OR';
          if (filtros.length == 2)
            criterios += ',idDatosPersonales.nombre~' + filtros[1] + ':LIKE;OR';
          if (filtros.length == 3)
            criterios += ',idDatosPersonales.primerApellido~' + filtros[2] + ':LIKE;OR';
          if (filtros.length == 4)
            criterios += ',idDatosPersonales.segundoApellido~' + filtros[3] + ':LIKE;OR';

          //console.log(criterios);

          this.isComplete = true;
          urlSearch.set('criterios', criterios);

          this.filter(urlSearch);
        } else if (this.configuracion.filtrado.textoFiltro === ''){
          this.opcionesEstudiante = [];
        }
        return this.opcionesEstudiante;
      }).subscribe(results => {},
      error => {//console.log(error);
      });*/


  }

  filtroChangedBusquedaTabla(filtroTexto): void {
    this.configuracionTablaEstudiante.
      filtradoBusquedaTabla.textoFiltroBusquedaTabla = filtroTexto;
    this.onCambiosTablaEstudiantes();
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
  //  this.typeAheadEventEmitter.next(filtroTexto);
  }

  filter(urlParameter: URLSearchParams): void {
    this.estudianteService.
    getSelectEstudianteNombre(this.erroresConsultas, urlParameter)
      .subscribe(
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

          this._spinner.stop('crearformacioncontinua1');
          this.isComplete = false;
        },
        () => {
          // console.log(this.opcionesEstudiante);

          this._spinner.stop('crearformacioncontinua1');
          this.isComplete = false;
        }
      );
  }

  ////// picker ///
  getFecha(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioActividades.controls['fecha']).setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
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

  validarFormulario(): boolean {
    if (this.formularioActividades.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioActividades.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioActividades.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }
  enviarFormularioActividad(): void {
    if (!this.idActividadEvaluacionContinua) {
      if (this.validarFormulario()) {
        this._spinner.start('crearformacioncontinua2');
        event.preventDefault();
        let jsonFormulario = JSON.stringify(this.formularioActividades.value, null, 2);
        // console.log('jsonFormulario activadd nueva', jsonFormulario);

        this.actividadEvaluacionContinua.postActividadEvaluacionContinua(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          response => {
            this.idActividadEvaluacionContinua = response.json().id ? response.json().id : undefined;
            // console.log('idActivadContinua', this.idActividadEvaluacionContinua);
            /*var json = response.json();
            if (json.id) {
              this.idActividadEvaluacionContinua = json.id;
              //console.log('este es el id de registro actividad:'+ this.idActividadEvaluacionContinua);
            }*/
          },
          error => {
            this._spinner.stop('crearformacioncontinua2');
          },
          () => {
            this._spinner.stop('crearformacioncontinua2');
          }
          );
      } else {
        // console.log('no se puede insertar formulario no valido');
      }
    } else {
      // console.log(this.registrosProfesor.length + 'registros'+ this.registrosEstudiante.length);
      if (this.registrosProfesor.length > 0 && this.registrosEstudiante.length > 0) {
        this.router.navigate(['formacion-continua']);
        this.guardarRegistro = false;
      } else {
        this.guardarRegistro = true;
      }
    }
  }

  getIdProfesorSelect(idProfesor): void {
    if (idProfesor) {
      this.idProfesorAgregar = idProfesor;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idProfesor~' + this.idProfesorAgregar + ':IGUAL' +
        ',idActividadEvaluacionContinua~' + this.idActividadEvaluacionContinua + ':IGUAL');

      this.actividadContinuaProfesor.getListaActividadProfesores(this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          this.registrosActividadProfesorByID = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosActividadProfesorByID.
            push(new ActividadContinuaProfesor(item));
          });
          this.numeroProfesor = this.registrosActividadProfesorByID.length;
          // console.log('TAMAÑO' + this.registrosActividadProfesorByID.length);
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  agregarProfesor(): void {
    if (!this.verificarProfesoresAgregados(this.idProfesorAgregar)) {
      if (this.idProfesorAgregar) {
        let jsonProfesor = {
          idProfesor: this.idProfesorAgregar,
          idActividadEvaluacionContinua: this.idActividadEvaluacionContinua
        };

        // console.log(jsonProfesor);
        let jsonFormulario = JSON.stringify(jsonProfesor, null, 2);
        this._spinner.start('crearformacioncontinua3');
        this.actividadContinuaProfesor
          .postActividadContinuaProfesor(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {
            // console.log('Success');
          },
          console.error,
          () => {
            this.idProfesoresAgregados.push(this.idProfesorAgregar);
            this.onCambiosTablaProfesores();
            this.idProfesorAgregar = null;
            this.opcionSelectedActividadContinuaProfesor =
              this.catalogosService
                .getProfesor().getSelectProfesor(this.erroresConsultas);
            this._spinner.stop('crearformacioncontinua3');

          }
        );

      }
    } else {
      this.errorAgregarProfesor = true;
      this.idProfesorAgregar = null;
      this.opcionSelectedActividadContinuaProfesor =
        this.catalogosService
          .getProfesor().getSelectProfesor(this.erroresConsultas);
      this.addErrorsMesaje('Ya se registro el profesor', 'danger');
    }
  }

  agregarEstudiante(): void {
    if (!this.verificarEstuidantesAgregados(this.idEstudiante)) {
      if (this.idEstudiante) {
        let jsonEstudiante = {
          idEstudiante: this.idEstudiante,
          idActividadEvaluacionContinua: this.idActividadEvaluacionContinua
        };

        let jsonFormulario = JSON.stringify(jsonEstudiante, null, 2);
        this._spinner.start('crearformacioncontinua4');
        this.actividadContinuaEstudiante
          .postActividadContinuaEstudiante(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {},
          // console.log('Success'),
          error => { this._spinner.stop('crearformacioncontinua4'); },
          () => {
            this.opcionesEstudiante = [];
            this.estudianteSelAutocomplete = null;
            this.idEstudiantesAgregados.push(this.idEstudiante);
            this.idEstudiante = null;
            this.searchStr2 = null;
            this.onCambiosTablaEstudiantes();
            this._spinner.stop('crearformacioncontinua4');
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
    if (this.registroSeleccionadoProfesor) {
      // console.log('Eliminando...');
      this.actividadContinuaProfesor.deleteProfesor(
        this.registroSeleccionadoProfesor.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, // console.log('Success'),
        console.error,
        () => {
          this.onCambiosTablaProfesores();
        }
      );
      this.opcionSelectedActividadContinuaProfesor =
        this.catalogosService
          .getProfesor().getSelectProfesor(this.erroresConsultas);
    }
  }

  eliminarEstudiante() {
    if (this.registroSeleccionadoEstudiante) {
      // console.log('Eliminando...');
      this._spinner.start('eliminarEstudiante');
      this.actividadContinuaEstudiante.deleteEstudiante(
        this.registroSeleccionadoEstudiante.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, // console.log('Success'),
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
  }

  eliminarElementoArregloIdEstudiantes(idEstudiante: number): void {
    let indexElementoABorrar = this.idEstudiantesAgregados.indexOf(idEstudiante);
    if (indexElementoABorrar > -1) {
      this.idEstudiantesAgregados.splice(indexElementoABorrar, 1);
    }
  }

  // Tabla Lista Estudiantes
  onCambiosTablaEstudiantes(): void {
    if (this.idActividadEvaluacionContinua) {
      let urlSearchGetById: URLSearchParams = new URLSearchParams();
      let criterio = '';
      criterio = 'idActividadEvaluacionContinua~' +
        this.idActividadEvaluacionContinua + ':IGUAL';
      urlSearchGetById.set('criterios', criterio);
      this.registrosEstudiante =
        this.actividadContinuaEstudiante.getListaActividadContinuaEstudiante(
          this.erroresConsultas,
          urlSearchGetById
        ).lista;
    }
  }

  // Tabla Lista Profesores
  onCambiosTablaProfesores(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = '';
    if (this.idActividadEvaluacionContinua) {
      criterio = 'idActividadEvaluacionContinua~' +
        this.idActividadEvaluacionContinua + ':IGUAL';
    }
    urlSearch.set('criterios', criterio);
    this.registrosProfesor =
      this.actividadContinuaProfesor.getListaActividadContinuaProfesor(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }
  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTablaEstudiantes();
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

  private verificarProfesoresAgregados(idProfesor: number): boolean {
    let hayProfesoresAgregados: boolean = false;

    this.idProfesoresAgregados.forEach((item) => {
      if (item === idProfesor) {
        // console.log('Coincidencia: ' + item);
        hayProfesoresAgregados = true;
      }
    });
    return hayProfesoresAgregados;
  }

  private autocompleteOnSelect(e: any) {
    this._spinner.start('autoComplete');
    this.catalogosService.getEstudiante().
    getEstudiante(e.id, this.erroresConsultas).
    subscribe(
      response => {
        this.estudianteSelAutocomplete = new Estudiante(response.json());
        this.idEstudiante = this.estudianteSelAutocomplete.id;
      },
      error => {
        console.error(error);

        this._spinner.stop('autoComplete');
      },
      () => {
        // console.log(this.estudianteSelAutocomplete);

        this._spinner.stop('autoComplete');
      }
    );
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
//          return ValidacionService.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  private listaAlumnos(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
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
      error => {
        this._spinner.stop('listaAlumno');
      },
      () => {
        this._spinner.stop('listaAlumno');
      }
    );
  }
  private generarEstructuraEstudiante(estudiante: Estudiante): string {
    return (estudiante.matricula.matriculaCompleta ? estudiante.matricula.matriculaCompleta : ' ' ) + ' ' +
        estudiante.datosPersonales.nombre + ' ' +
        estudiante.datosPersonales.primerApellido + ' ' +
        (estudiante.datosPersonales.segundoApellido ? estudiante.datosPersonales.segundoApellido : '');
  }

  private prepareService(): void {
    this.actividadEvaluacionContinua =
      this.catalogosService.getActividadEvaluacionContinuaService();

    this.actividadContinuaEstudiante =
      this.catalogosService.getActividadContinuaEstudianteService();

    this.actividadContinuaProfesor =
      this.catalogosService.getActividadContinuaProfesorService();

    this.opcionSelectedActividadContinuaProfesor =
      this.catalogosService
        .getProfesor().getSelectProfesor(this.erroresConsultas);

    this.estudianteService = this.catalogosService.getEstudiante();
  }


  ngOnInit() {
  }

}
