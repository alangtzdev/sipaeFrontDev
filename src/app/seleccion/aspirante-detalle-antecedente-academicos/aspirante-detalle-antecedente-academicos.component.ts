import {Component, OnInit, Input, ViewChild, Renderer, Injector, ElementRef} from '@angular/core';
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {URLSearchParams} from '@angular/http';
import {RecomendanteAcademicoService} from '../../services/entidades/recomendante-academico.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {IdiomaEstudiante} from '../../services/entidades/idioma-estudiante.model';
import {DatoAcademico} from '../../services/entidades/dato-academico.model';
import {RecomendanteAcademico} from '../../services/entidades/recomendante-academico.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'antecedentes-academicos',
  templateUrl: './aspirante-detalle-antecedente-academicos.component.html',
  styleUrls: ['./aspirante-detalle-antecedente-academicos.component.css']
})
export class AspiranteDetalleAntecedenteAcademicosComponent implements OnInit {
  @Input()
  idEstudiante: number;

  @Input()
  soloLicenciatura: boolean;

  @ViewChild('modalDetalleDatoAcademico')
  modalDetalleDatoAcademico: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  id: number;

  datoAcademicoService;
  idiomaEstudianteService;
  seleccionAntecedenteAcademico: DatoAcademico;

  columnas: Array<any> = [
    { titulo: 'Nivel académico', nombre: 'nivelAcademico' },
    { titulo: 'Universidad o Institución', nombre: 'universidad'}
  ];

  columnasIdiomas: Array<any> = [
    { titulo: 'Idioma', nombre: 'idioma' },
    { titulo: 'Nivel', nombre: 'nivel'}
  ];
  // Recomentantes academicos
  registrosRecomendantesAcademicos: Array<RecomendanteAcademico> = [];
  registroRecomendanteSeleccionado: RecomendanteAcademico;
  columnasRecomendantes: Array<any> = [
    { titulo: 'Nombre', nombre: 'nombre' },
    { titulo: 'Institución', nombre: 'institucion'},
    { titulo: 'Teléfono', nombre: 'telefono'},
  ];

  private descripcionError : string = '';

  private registrosAcademicos: Array<DatoAcademico> = [];
  private registrosIdiomas: Array<IdiomaEstudiante> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  // variables para modal detalle dato academico //
  private entidadDatoAcademico: DatoAcademico;
  private ocultarEstado: boolean = false;
  private camposParaBachillerato: boolean = false;
  // fin de variables para modal detalle academico  //


  constructor(// params: RouteParams, private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public recomendateAcademicoService: RecomendanteAcademicoService) {
    this.prepareServices();
  }

  ngOnInit(): void {
    this.id = this.idEstudiante;
    // console.log('id antecedentes aca: ' + this.id);
    // this.onCambiosTabla();
    this.getListaIdiomas();
    this.getListaAntecedentesAcademicos();
    this.onCambiosTablaRecomendanteAcademico();
  }

  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.getListaAntecedentesAcademicos();
    }
  }

  sortChangedIdioma(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.getListaIdiomas();
    }
  }

  getListaIdiomas(): void {
    let urlParameterIdiomas: URLSearchParams = new URLSearchParams();
    let criterioIdIdiomas = 'idEstudiante~' + this.id + ':IGUAL';
    urlParameterIdiomas.set('criterios', criterioIdIdiomas);
    this.registrosIdiomas = this.idiomaEstudianteService
      .getListaIdiomaEstudiante(
        this.erroresConsultas,
        urlParameterIdiomas
      ).lista;
  }

  getListaAntecedentesAcademicos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.id + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registrosAcademicos = this.datoAcademicoService
      .getListaDatoAcademico(
        this.erroresConsultas,
        urlParameter
      ).lista;

  }

  onCambiosTablaRecomendanteAcademico(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    // console.log(criterioIdEstudiante);
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registrosRecomendantesAcademicos = this.recomendateAcademicoService
      .getListaRecomendantesAcademicos(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

/*  modalDetalleAntecedenteAcademico(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    if (this.seleccionAntecedenteAcademico) {
      let idDireccion = this.seleccionAntecedenteAcademico.id;
      //console.log(idDireccion);
      let modalDetallesData = new ModalDetalleDatoAcademicoData(
        this,
        idDireccion
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleDatoAcademico,
        bindings,
        modalConfig
      );
    }
  }*/

  obtenerAntecedenteAcademico(registro): void {
    if (this.seleccionAntecedenteAcademico !== registro) {
      this.seleccionAntecedenteAcademico = registro;
    } else {
      this.seleccionAntecedenteAcademico = null;
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.seleccionAntecedenteAcademico === registro);
  }

  prepareServices(): void {
    this.datoAcademicoService = this._catalogosService.getDatoAcademico();
    this.idiomaEstudianteService = this._catalogosService.getIdiomaEstudiante();
  }

  mostrarBotones() {
    if (this.seleccionAntecedenteAcademico) {
      return true;
    }else {
      return false;
    }
  }

  /************************************* 
   * INICIA MODAL DETALLE DATO ACADEMICO*
  ****************************************/
  private modalDetalleAntecedenteAcademico(): void {
    this.entidadDatoAcademico = this.seleccionAntecedenteAcademico;
    this.mostrarDetallePaisMexico();
    this.mostrarDetalleBachillerato();
    this.modalDetalleDatoAcademico.open('lg');
  }

  private mostrarDetallePaisMexico(): void {
    if (this.entidadDatoAcademico.pais.id === 82) {
      this.ocultarEstado = true;
    } else {
      this.ocultarEstado = false;
    }
  }

  private mostrarDetalleBachillerato(): void {
    if (this.entidadDatoAcademico.gradoAcademico.id === 6) {
        this.camposParaBachillerato = true;
    } else {
        this.camposParaBachillerato = false;
    }
  }

  private cerrarModalDetalleAcademico(): void {
    this.entidadDatoAcademico = undefined;
    this.ocultarEstado = false;
    this.camposParaBachillerato = false;
    this.modalDetalleDatoAcademico.close();
  }

  /************************************* 
   * TERMINA MODAL DETALLE DATO ACADEMICO*
  ****************************************/

}
