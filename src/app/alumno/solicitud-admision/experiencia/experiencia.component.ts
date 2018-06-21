import {Component, ElementRef, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {FormControl, FormGroup} from "@angular/forms";
import {Estudiante} from "../../../services/entidades/estudiante.model";
import {ExperienciaProfesional} from "../../../services/entidades/experiencia-profesional.model";
import {Publicacion} from "../../../services/entidades/publicacion.model";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {PaginacionInfo} from "../../../services/core/pagination-info";
import {ModalDetalleExperienciaComponent} from "../modal-detalle-experiencia/modal-detalle-experiencia.component";
import {ModalRegistroExperienciaComponent} from "../modal-registro-experiencia/modal-registro-experiencia.component";
import {ModalDetallePublicacionesComponent} from "../modal-detalle-publicaciones/modal-detalle-publicaciones.component";
import {ModalRegistroPublicacionesComponent} from "../modal-registro-publicaciones/modal-registro-publicaciones.component";

@Component({
  selector: 'app-experiencia',
  templateUrl: './experiencia.component.html',
  styleUrls: ['./experiencia.component.css']
})
export class ExperienciaComponent implements OnInit {

  @ViewChild("modalDetalleExp")
  modalDetalleExp:ModalDetalleExperienciaComponent;
  @ViewChild("modalRegistroExp")
  modalRegistroExp:ModalRegistroExperienciaComponent;
  @ViewChild("modalDetallePub")
  modalDetallePub:ModalDetallePublicacionesComponent;
  @ViewChild("modalRegistroPub")
  modalRegistroPub:ModalRegistroPublicacionesComponent;

  router: Router;
  idEstudiante: number;
  errorNext: string = '';
  formulario: FormGroup;
  entidadEstudiante: Estudiante;
  edicionFormulario: boolean = false;
  nivelEstudiosEstudiante;
  ocultarExperiencia: boolean = false;
  //private idEstudiante: number = 1;
  paginaActual: number = 1;
  limite: number = 10;
  registros: Array<ExperienciaProfesional> = [];
  columnas: Array<any> = [
    { titulo: 'Experiencia', nombre: 'id'},
    { titulo: 'Institución/Empresa', nombre: 'valor', sort: false },
    { titulo: 'Desde', nombre: 'activo'},
    { titulo: 'Hasta', nombre: 'activo'}
  ];
  registroSeleccionado: ExperienciaProfesional;
  registroExperienciaProfesionalService;
  registroActividadActualEstudianteService;

  //columnas Publicacion
  registrosPublicacion: Array<Publicacion> = [];
  columnasPublicacion: Array<any> = [
    { titulo: 'Título', nombre: 'titulo'},
    { titulo: 'Fecha', nombre: 'fecha', sort: false }
  ];
  registroSeleccionadoPublicacion: Publicacion;
  registroPublicacionService;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'valor' }
  };
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  idExperiencia: number;
  idListaExperiencia: number;
  idPublicacion: number;


  constructor(route: ActivatedRoute, private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer, _router: Router,
              public _catalogosService: CatalogosServices,
              private  _spinner: SpinnerService) {
    this.prepareServices();
    this.router = _router;
    let params;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });    this.idEstudiante = params.id;
    this.formulario = new FormGroup({
      actividadActual: new FormControl(''),
      exposicionMotivos: new FormControl(''),
    });
    if (this.idEstudiante) {
      this.edicionFormulario = true;
      let estudiante: Estudiante;
      //console.log('Spinner en constructor para obtener estudiante');
      this._spinner.start("idEstudiante");
      this.entidadEstudiante =
        this.registroActividadActualEstudianteService.getEstudiante(
          this.idEstudiante,
          this.erroresConsultas
        ).subscribe(
          response =>
            estudiante = new Estudiante(
              response.json()),
          error => {

          },
          () => {

            this.nivelEstudiosEstudiante =
              estudiante.promocion.programaDocente.nivelEstudios.descripcion;
            if (this.formulario) {
              let stringActividadActual = 'actividadActual';
              let stringExpocicionMotivos = 'exposicionMotivos';
              (<FormControl>this.formulario.controls[stringActividadActual])
                .setValue(estudiante.actividadActual);
              (<FormControl>this.formulario.controls[stringExpocicionMotivos])
                .setValue(estudiante.exposicionMotivos);
            }
            this._spinner.stop("idEstudiante");
          }
        );
    }
  }

  eliminarExperiencia () {
    if (this.registroSeleccionado) {
      //console.log('Eliminando...');
      this._spinner.start("eliminarExperiencia");
      this.registroExperienciaProfesionalService.deleteExperienciaProfesional(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        () => {},
        error => {
          this._spinner.stop("eliminarExperiencia");
        },
        () => {
          this.registroSeleccionado = null;
          this._spinner.stop("eliminarExperiencia");
          this.onCambiosTabla();
        }
      );
    }else {
      alert('Selecciona un registro');
      //console.log('Selecciona un registro');
    }
  }

  nextMethod(): any {
    if (this.formulario.valid) {
      //console.log('STEP 4!!' + jsonFormulario);
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      if (this.edicionFormulario) {
        this._spinner.start("nextMethod");
        return this.registroActividadActualEstudianteService
          .putEstudiante(
            this.idEstudiante,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
            () => {}, //console.log('Success'),
            console.error,
            () => {
              this._spinner.stop("nextMethod");
            }
          );
      } else {
        return this.registroActividadActualEstudianteService
          .postEstudiante(
            jsonFormulario,
            this.erroresGuardado
          );
      }
    } else {
      this.errorNext = 'Error en los campos, favor de verificar';
      return false;
    }
  }

  previusMethod(): boolean {
    return true;
  }

  eliminarPublicacion () {
    if (this.registroSeleccionadoPublicacion) {
      ////console.log('Eliminando...');
      this.registroPublicacionService.deletePublicacion(
        this.registroSeleccionadoPublicacion.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTablaPublicacionAlterna();
        }
      );
    }else {
      alert('Selecciona un registro');
      //console.log('Selecciona un registro');
    }
  }

  ngOnInit(): void {
    this.onCambiosTabla();
    this.onCambiosTablaPublicacion();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlSearch.set('criterios', criterioIdEstudiante);

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    //urlSearch.set('ordenamiento', ordenamiento);
    //urlSearch.set('limit', this.limite.toString());
    //urlSearch.set('pagina', this.paginaActual.toString());
    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<ExperienciaProfesional>
    } = this.registroExperienciaProfesionalService.getListaExperienciaProfesional(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    );
    this.registros = resultados.lista;
  }

  onCambiosTablaExperienciaSpinner(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlSearch.set('criterios', criterioIdEstudiante);

    this._spinner.start("onCambiosTablaExperienciaSpinner");
    this.registroExperienciaProfesionalService.getListaExperienciaProfesionalOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registros = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new ExperienciaProfesional(item));
        });
      },
      error => {
        this._spinner.stop("onCambiosTablaExperienciaSpinner");
      },
      () => {
        this._spinner.stop("onCambiosTablaExperienciaSpinner");
      }
    );
  }

  onCambiosTablaPublicacion(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlSearch.set('criterios', criterioIdEstudiante);
    //urlSearch.set('limit', this.limite.toString());
    //urlSearch.set('pagina', this.paginaActual.toString());

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<Publicacion>
    } = this.registroPublicacionService.getListaPublicacion(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    );
    this.registrosPublicacion = resultados.lista;

  }

  onCambiosTablaPublicacionAlterna(): void {

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlSearch.set('criterios', criterioIdEstudiante);

    this._spinner.start("onCambiosTablaPublicacionAlterna");
    this.registroPublicacionService.getListaPublicacionOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registrosPublicacion = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.registrosPublicacion.push(new Publicacion(item));
        });
      },
      error => {
        this._spinner.stop("onCambiosTablaPublicacionAlterna");

      },
      () => {
        this._spinner.stop("onCambiosTablaPublicacionAlterna");

      }
    );
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

  rowSeleccionadoPublicacion(registro): boolean {
    return (this.registroSeleccionadoPublicacion === registro);
  }

  rowSeleccionPublicacion(registro): void {
    if (this.registroSeleccionadoPublicacion !== registro) {
      this.registroSeleccionadoPublicacion = registro;
    } else {
      this.registroSeleccionadoPublicacion = null;
    }
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


  mostrarCampurarExperiencia(): boolean {
    // esta condicion es para ocultar a alumnos de
    // licenciatura que puedan campturar publicaciones
    // y/o experiencia laborar
    ////console.log(this.nivelEstudiosEstudiante);
    if (this.nivelEstudiosEstudiante !== 'Licenciatura') {
      this.ocultarExperiencia = true;
      return true;
    }else {
      this.ocultarExperiencia = false;
      return false;
    }
  }

  //Botones ocultar
  mostarBotonesExperiencia(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  //Botones ocultar
  mostarBotonesPublicacion(): boolean {
    if (this.registroSeleccionadoPublicacion) {
      return true;
    }else {
      return false;
    }
  }

  private prepareServices(): void {
    this.registroExperienciaProfesionalService =
      this._catalogosService.getExperienciaPrforesional();

    this.registroPublicacionService =
      this._catalogosService.getPublicaciones();

    this.registroActividadActualEstudianteService =
      this._catalogosService.getEstudiante();
  }

  modalAgregarRegistroExperiencia(modo): void {
    if (modo === 'editar' && this.registroSeleccionado) {
      this.idExperiencia = this.registroSeleccionado.id;
    }else if (modo === 'agregar'){
      this.idExperiencia = null;
    }
    this.modalRegistroExp.onInit();
    console.log(this.idExperiencia);
    this.modalRegistroExp.dialog.open('lg');
  }

  modalDetalles(): void {
    if (this.registroSeleccionado) {
      this.idListaExperiencia = this.registroSeleccionado.id;
      this.modalDetalleExp.onInit();
      this.modalDetalleExp.dialog.open('lg');
    }
  }

  modalDetallePublicacion(): void {
    if (this.registroSeleccionadoPublicacion) {
      this.idPublicacion = this.registroSeleccionadoPublicacion.id;
      this.modalDetallePub.onInit();
      this.modalDetallePub.dialog.open('lg');
    } else {
      alert('Seleccione un registro de publicaciòn');
    }
  }

  modalRegistroPublicacion(modo): void {
    if (modo === 'editar' && this.registroSeleccionadoPublicacion) {
      this.idPublicacion = this.registroSeleccionadoPublicacion.id;
    }else if(modo === 'agregar'){
      this.idPublicacion = null;
    }
    this.modalRegistroPub.onInit();
    this.modalRegistroPub.dialog.open('lg');
  }
}
