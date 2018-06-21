import {Component, OnInit, Input, ElementRef, Injector, Renderer} from '@angular/core';
import {DatoAcademico} from "../../services/entidades/dato-academico.model";
import {Profesor} from "../../services/entidades/profesor.model";
import {ExperienciaProfesional} from "../../services/entidades/experiencia-profesional.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import * as moment from "moment";
import {URLSearchParams} from "@angular/http";

@Component({
  selector: 'experienciaProfesor',
  templateUrl: './profesor-detalle-expeciencia.component.html',
  styleUrls: ['./profesor-detalle-expeciencia.component.css']
})
export class ProfesorDetalleExpecienciaComponent implements OnInit {

  @Input()
  entidadProfesor: Profesor;

  idProfesor;
  planEstudiosService;
  paginaActual: number = 1;
  limite: number = 10;
  private sub: any;
  datosAcademicosService;
  experienciaProfesionalService;
  registrosAcademico: Array<DatoAcademico> = [];
  registrosExperiencia: Array<ExperienciaProfesional> = [];
  registroSeleccionadoAcademico: DatoAcademico;
  registroSeleccionadoExperiencia: ExperienciaProfesional;
  profesorService;

  columnas: Array<any> = [
    { titulo: 'Nivel Académico', nombre: 'idNivel' },
    { titulo: 'Disiplina/área de especialización', nombre: 'disiplinaAreaEspecializacion'},
  ];

  columnasExperienciaProfesional: Array<any> = [
    { titulo: 'Nivel Académico', nombre: 'nivelAcademico' },
    { titulo: 'Disiplina/área de especialización', nombre: 'disiplinaAreaEspecializacion'},
  ];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor (route: ActivatedRoute,
               public _catalogosService: CatalogosServices,
               private _router: Router,
               //private modal: Modal,
               private elementRef: ElementRef,
               private injector: Injector,
               private _renderer: Renderer) {
    this.sub = route.params.subscribe(params => {
      this.idProfesor = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
//    this.idProfesor = Number(params.get('id'));
    ////console.log(this.idPlanEstudios);
    this.prepareServices();

  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionadoAcademico === registro);
  }

  rowSeleccionadoExperiencia(registro): boolean {
    return (this.registroSeleccionadoExperiencia === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionadoAcademico !== registro) {
      this.registroSeleccionadoAcademico = registro;
    } else {
      this.registroSeleccionadoAcademico = null;
    }
  }

  rowSeleccionExperiencia(registro): void {
    if (this.registroSeleccionadoExperiencia !== registro) {
      this.registroSeleccionadoExperiencia = registro;
    } else {
      this.registroSeleccionadoExperiencia = null;
    }
  }

  onCambiosTablaDatoAcademico(): void {
//    this.registroSeleccionadoAcademico = '';
    let urlParameter: URLSearchParams = new URLSearchParams();
    console.warn(this.idProfesor);
    let criterio = 'idProfesor~' + this.idProfesor + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.registrosAcademico = this.datosAcademicosService.getListaDatoAcademico(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }

  onCambiosTablaExperienciaProfesional(): void {
//    this.registroSeleccionadoExperiencia = '';
    console.warn(this.idProfesor);
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idProfesor~' + this.idProfesor + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.registrosExperiencia =
      this.experienciaProfesionalService.getListaExperienciaProfesional(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  mostrarBotonesDetalleExperiencia() {
    if (this.registroSeleccionadoExperiencia) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonesDetalleAcademico() {
    if (this.registroSeleccionadoAcademico) {
      return true;
    }else {
      return false;
    }
  }

/*  modalDetalleDatoAcademico(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionadoAcademico) {
      let idDatoAcademico = this.registroSeleccionadoAcademico.id;
      let modalDetalleDatosAcademicosProfesorData =
        new ModalDetalleDatosAcademicosProfesorData(
          this,
          idDatoAcademico
        );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetalleDatosAcademicosProfesorData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleDatosAcademicosProfesor,
        bindings,
        modalConfig
      );
    }
  }*/

/*  modalDetalleExperiencia(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionadoExperiencia) {
      let idExperiencia = this.registroSeleccionadoExperiencia.id;
      let modalDetalleExperienciaProfesionalData =
        new ModalDetalleExperienciaProfesionalData(
          this,
          idExperiencia
        );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetalleExperienciaProfesionalData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleExperienciaProfesional,
        bindings,
        modalConfig
      );
    }
  }*/

  private prepareServices(): void {
    this.datosAcademicosService = this._catalogosService.getDatoAcademico();
    this.experienciaProfesionalService = this._catalogosService.getExperienciaPrforesional();

    this.profesorService = this._catalogosService.getProfesor();
    this.onCambiosTablaDatoAcademico();
    this.onCambiosTablaExperienciaProfesional();

  }


  ngOnInit() {
  }

}
