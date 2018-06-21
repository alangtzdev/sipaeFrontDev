import {Component, OnInit, ViewChild, Input, ElementRef, Injector, Renderer} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {ExperienciaProfesional} from '../../services/entidades/experiencia-profesional.model';
import {Publicacion} from '../../services/entidades/publicacion.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ActivatedRoute} from '@angular/router';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';

@Component({
  selector: 'experiencia',
  templateUrl: './aspirante-detalle-experiencia.component.html',
  styleUrls: ['./aspirante-detalle-experiencia.component.css']
})
export class AspiranteDetalleExperienciaComponent implements OnInit {

  @Input()
  entidadAspirante: Estudiante;

  @Input()
  idEstudiante: number;

  @Input()
  soloLicenciatura: boolean;

  @ViewChild('modalDetalleExperienciaProfesional')
  modalDetalleExperienciaProfesional: ModalComponent;
  @ViewChild('modalDetallePublicacionSolicitud')
  modalDetallePublicacionSolicitud: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  id: number;
  seleccionExperiencia: ExperienciaProfesional;
  seleccionPublicacion: Publicacion;

  columnasExperiencia: Array<any> = [
    { titulo: 'Experiencia', nombre: 'experiencia' },
    { titulo: 'Institución / Empresa', nombre: 'instEmpresa'},
    { titulo: 'Desde', nombre: 'desde'},
    { titulo: 'Hasta', nombre: 'hasta'}
  ];
  columnasPublicaciones: Array<any> = [
    { titulo: 'Título', nombre: 'titulo' },
    { titulo: 'Fecha', nombre: 'fecha'}
  ];

  experiencaProfesionalService;
  publicacionesService;

  private registrosExperiencias: Array<ExperienciaProfesional> = [];
  private registrosPublicaciones: Array<String> = [];
  private erroresConsultas: Array<Object> = [];

  // variables detalle experiencia //
  private entidadDetalleExperiencia: ExperienciaProfesional = undefined;
  private idTipoExperiencia: number = undefined;
  private mostrarCampo: boolean = false;
  // fin variables detalle experiencia //

  // variables detalle publicacion //
  private entidadDetallePublicacion: Publicacion = undefined;
  // fin variables detalle publicacion //

  constructor(route: ActivatedRoute,
              // private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices) {
    this.prepareServices();
  }

  ngOnInit(): void {
    this.id = this.idEstudiante;
    // console.log('id antecedentes aca: ' + this.id);
    this.obtenerExperiencias();
    this.obtenerPublicaciones();
  }

  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.obtenerExperiencias();
    }
  }

  sortChangedPublicacion(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.obtenerPublicaciones();
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.seleccionExperiencia === registro);
  }

  rowSeleccion(registro): void {
    if (this.seleccionExperiencia !== registro) {
      this.seleccionExperiencia = registro;
    } else {
      this.seleccionExperiencia = null;
    }
  }

  rowSeleccionadoPublicacion(registro): boolean {
    return (this.seleccionPublicacion === registro);
  }

  rowSeleccionPublicacion(registro): void {
    if (this.seleccionPublicacion !== registro) {
      this.seleccionPublicacion = registro;
    } else {
      this.seleccionPublicacion = null;
    }
  }

/*  modalDetalleExperiencia(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.seleccionExperiencia) {
      let idListaExperiencia = this.seleccionExperiencia.id;
      let modalDetallesData = new ModalDetalleExperienciaProfesionalData(
        this,
        idListaExperiencia
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleExperienciaProfesional,
        bindings,
        modalConfig
      );
    } else {
      alert('Seleccione un solicitante');
    }
  }*/

/*  modalDetallePublicacion(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.seleccionPublicacion) {
      let idListaPublicacion = this.seleccionPublicacion.id;
      let modalDetallesData = new ModalDetallePublicacionData(
        this,
        idListaPublicacion
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetallePublicacion,
        bindings,
        modalConfig
      );
    } else {
      alert('Seleccione un solicitante');
    }
  }*/

  obtenerExperiencias(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.id + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registrosExperiencias = this.experiencaProfesionalService
      .getListaExperienciaProfesional(
        this.erroresConsultas,
        urlParameter
      ).lista;
    // console.log('resgitrsoExp: ' + this.registrosExperiencias.length);
  }
  obtenerDetalleActividadActual(): void {

  }

  obtenerPublicaciones(): void {
    let urlParameterPublicaciones: URLSearchParams = new URLSearchParams();
    let criterioIdIPublicaciones = 'idEstudiante~' + this.id + ':IGUAL';
    urlParameterPublicaciones.set('criterios', criterioIdIPublicaciones);
    this.registrosPublicaciones = this.publicacionesService
      .getListaPublicacion(
        this.erroresConsultas,
        urlParameterPublicaciones
      ).lista;
    // console.log('resgitrsoPublicacion: ' + this.registrosPublicaciones.length);
  }

  prepareServices(): void {
    this.experiencaProfesionalService = this._catalogosService.getExperienciaPrforesional();
    this.publicacionesService = this._catalogosService.getPublicaciones();
  }

  mostrarBotones(): boolean {
    if (this.seleccionExperiencia) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonDetallePublicacion(): boolean {
    if (this.seleccionPublicacion) {
      return true;
    }else {
      return false;
    }
  }

  /***********************************************
   * INICIA MODAL DETALLE EXPERIENCIA PROFESIONAL
   * *********************************************
  */

  private modalDetalleExperiencia(): void {
    this.entidadDetalleExperiencia = this.seleccionExperiencia;
    this.idTipoExperiencia = this.entidadDetalleExperiencia.tipoExperiencia.id;
    this.modalDetalleExperienciaProfesional.open('lg');
  }

  private mostrarCamposTipoExperiencia(): boolean {
    ////console.log('ejecutado');
    ////console.log(this.idTipoExperiencia);

    if (this.idTipoExperiencia === 1) {
        this.mostrarCampo = true;
        return true;
    } else {
        this.mostrarCampo = false;
        return false;
    }

  }

  private cerrarModalDetalleExperiencia(): void {
    this.entidadDetalleExperiencia = undefined;
    this.idTipoExperiencia = undefined;
    this.mostrarCampo = false;
    this.modalDetalleExperienciaProfesional.close();
  }

  /***********************************************
   * TERMINA MODAL DETALLE EXPERIENCIA PROFESIONAL
   * *********************************************
  */

  /***********************************************
   * INICIA MODAL DETALLE PUBLICACION
   * *********************************************
  */
  modalDetallePublicacion(): void {
    this.entidadDetallePublicacion = this.seleccionPublicacion;
    this.modalDetallePublicacionSolicitud.open('lg');
  }

  cerrarModalDetallePublicacion(): void {
    this.entidadDetallePublicacion = undefined;
    this.modalDetallePublicacionSolicitud.close();
  }
  /***********************************************
   * TERMINA MODAL DETALLE PUBLICACION
   * *********************************************
  */

}
