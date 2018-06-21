import {Component, OnInit, Renderer, Injector, ElementRef, ViewChild} from '@angular/core';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ComiteTutorial} from '../../services/entidades/comite-tutorial.model';
import {ComiteTutorialService} from '../../services/entidades/comite-tutorial.service';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {ExamenGradoService} from '../../services/entidades/examen-grado.service';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Validacion} from '../../utils/Validacion';
import {URLSearchParams} from '@angular/http';

@Component({
  selector: 'app-defensa-tesis',
  templateUrl: './defensa-tesis.component.html',
  styleUrls: ['./defensa-tesis.component.css']
})
export class DefensaTesisComponent implements OnInit {

  @ViewChild('modalValidarRequisitos')
  modalValidarRequisitos: ModalComponent;
  @ViewChild('modalDetalleRequisitos')
  modalDetalleRequisitos: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  opcionesSelectProgramaDocente: Array<ItemSelects>;
  opcionesSelectPromocion: Array<ItemSelects>;
  // se declaran variables para consultas de base de datos
  programaDocenteService;
  promocionesService;
  catalogoServices;
  erroresConsultas: Array<ErrorCatalogo> = [];
  limite: number = 10;
  paginaActual: number = 1;
  maxSizePags: number = 5;
  formulario: FormGroup;
  formularioRegistroPagina: FormGroup;
  registros: Array<ComiteTutorial> = [];
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;

  botonBuscar: boolean = false;
  estudianteService;
  idTutor: number;
  exportarFormato = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido',
      columnasUnCriterio: 'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido',
      columnasDosCriterios: 'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idDatosPersonales.nombre',
      columnaTercer: 'idEstudiante.idDatosPersonales.nombre'}
  };

  columnas: Array<any> = [
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Título de Tesis', nombre: 'idEstudiante'},
    { titulo: 'Fecha de asignación', nombre: 'idEstudiante'},
    { titulo: 'Tipo de trabajo', nombre: 'idEstudiante'},
    { titulo: 'Tutor / Director', nombre: 'idEstudiante'}
  ];
  registroSeleccionado: ComiteTutorial;
  private opcionesPromociones: Array<ItemSelects> = [];

  /// Inica variables para valida requisitos ////
  erroresGuardado: Array<ErrorCatalogo> = [];
  estudianteActual: Estudiante;
  private entidadComiteTutoria: ComiteTutorial;
  validacionActiva: boolean = false;
  // mensajeErrors: any = errorMessages;
  edicionFormulario: boolean = false;
  idExamenGrado: number;
  entidadComiteTutorial: ComiteTutorial = undefined;
  /// Termiabn variables para valida requisitos // /

  constructor(// private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private examenGradoService: ExamenGradoService,
              private comiteTutorialService: ComiteTutorialService,
              private spinner: SpinnerService) {

    this.formulario = new FormGroup({
      idProgramaDocente: new FormControl(),
      idLgac: new FormControl(),
    });
    this.crearFormularioRequisitos();
    this.prepareServices();

    this.formularioRegistroPagina = new FormGroup({
      registroPorPagina: new FormControl()
    });

     if (sessionStorage.getItem('defensaTesisIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('defensaTesisLimite')) {
      this.limite = +sessionStorage.getItem('defensaTesisLimite');
    }
    (<FormControl>this.formularioRegistroPagina.controls['registroPorPagina'])
      .setValue(this.limite);

    if (sessionStorage.getItem('defensaTesisCriterios')) {
      this.onCambiosTabla();
    }

  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesPromociones = this.promocionesService
      .getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
      this.limpiarVariablesSession();
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.idProgramaDocente.id~'
        + idProgramaDocente + ':IGUAL';
      if (idPromocion) {
        this.criteriosCabezera = this.criteriosCabezera + ',idEstudiante.idPromocion.id~'
          + idPromocion + ':IGUAL';
      }
    }
    sessionStorage.setItem('defensaTesisIdPromocion', idPromocion.toString());
    this.onCambiosTabla();
  }

  ngOnInit(): void {
    // this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {

      let filtrosCriterio: Array<string> = this.configuracion.filtrado.textoFiltro.split(' ');
      let filtros: Array<string> = [];
      if (filtrosCriterio.length >= 1 && criterios != '') {
        criterios = criterios + ';ANDGROUPAND';
      }
      if (filtrosCriterio.length == 1) {
        filtros = this.configuracion.filtrado.columnas.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        });
      }if (filtrosCriterio.length == 2) {
        filtros = this.configuracion.filtrado.columnasUnCriterio.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[0] + ':LIKE;OR';
        });
        filtros = this.configuracion.filtrado.columnasDosCriterios.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[1] + ':LIKE;OR';
        });
      }
      if (filtrosCriterio.length >= 3) {
        filtros = this.configuracion.filtrado.columnasUnCriterio.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[0] + ':LIKE;OR';
        });
        filtros = this.configuracion.filtrado.columnasDosCriterios.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[1] + ':LIKE;OR';
        });
        filtros = this.configuracion.filtrado.columnaTercer.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            filtrosCriterio[2] + ':LIKE;OR';
        });
      }

      urlSearch.set('criterios', criterios);
    }

    ordenamiento = '';
    if (!sessionStorage.getItem('defensaTesisOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('defensaTesisOrdenamiento', ordenamiento);
    }

    if (!sessionStorage.getItem('defensaTesisCriterios')) {
      sessionStorage.setItem('defensaTesisCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('defensaTesisLimite') ?
      +sessionStorage.getItem('defensaTesisLimite')  : this.limite;
    this.paginaActual = +sessionStorage.getItem('defensaTesisPagina') ? +sessionStorage.getItem('defensaTesisPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('defensaTesisCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('defensaTesisOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    this.spinner.start('defensatesis1');
    this.comiteTutorialService.getListaComiteTutorial(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        for (let i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new ComiteTutorial(item));
        });
      },
      error => {
        this.spinner.stop('defensatesis1');
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop('defensatesis1');
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
      }
    );
  }

  mostarBotonVeredicto(): boolean {
    if (this.registroSeleccionado
      && !this.registroSeleccionado.examenGrado.id) {
      return true;
    }else {
      return false;
    }
  }
  mostrarBotones(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.examenGrado.id) {
      return true;
    }else {
      return false;
    }
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonBuscar = true;
    } else {
      this.botonBuscar = false;
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    sessionStorage.removeItem('defensaTesisLimite');
    this.limite = Number(limite);
    sessionStorage.setItem('defensaTesisLimite', this.limite.toString());
    sessionStorage.setItem('defensaTesisPagina', '1');
    this.onCambiosTabla();
  }
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    sessionStorage.setItem('defensaTesisPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  sortChanged(columna): void {
    sessionStorage.removeItem('defensaTesisOrdenamiento');
    this.columnas.forEach((column) => {
      if (columna !== column) {
        if (column.sort !== false) {
          column.sort = '';
        } else {
          column.sort = false;
        }
      }
    });
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  descargarFormato(formatoComent): void {
    this.spinner.start('defensatesis2');
    let comentarios = '';
    let formato = null;
    switch (formatoComent) {
      case 'OficioConfirmacion':
      case 'CriteriosEvaluacion':
      case 'ActaExamen':
      case 'ProtestaGraduados':
      case 'Invitacion':
        formato = formatoComent;
        break;
      case 'Presidente':
      case 'Secretario':
      case 'Vocal':
      case 'CoDirector':
        formato = 'Constancia';
        comentarios = formatoComent;
        break;
    }
    if (formato) {
      this.comiteTutorialService.getFormatoPdf(
        this.registroSeleccionado.id,
        this.erroresConsultas, formato, comentarios
      ).subscribe(
        response => {
          this.exportarFormato = response.json();
          // console.log(this.exportarFormato);
        },
        error => {
          console.error(error);
        },
        () => {
          window.open(this.exportarFormato);
          this.spinner.stop('defensatesis2');
        }
      );
    }else {
      alert('Formato no válido');
    }
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.opcionesSelectProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.promocionesService = this._catalogosService.getPromocion();
    this.estudianteService =
      this._catalogosService.getEstudiante();
  }

  /**********************************************
   * ********************************************
   * INICIA SECCION DE VALIDAR REQUISITOS *
  **********************************************/

  modalrAgregarRequisito(): void {
    this.obtenerEntidadComite();
    this.recuperarInformacionEstudiante();
    if (this.registroSeleccionado) {
      this.edicionFormulario = true;
      this.cargarInformacionComite();
    }
    this.modalValidarRequisitos.open('lg');
  }

  obtenerEntidadComite(): void {
    this.entidadComiteTutorial = this.registroSeleccionado;
  }

  cargarInformacionComite(): void {
    // Input Values

    this.getControl('totalAsginaturaC').patchValue(this.entidadComiteTutorial.examenGrado.totalAsginaturaC);
    this.getControl('idioma1C').patchValue(this.entidadComiteTutorial.examenGrado.idioma1C);
    this.getControl('idioma2C').patchValue(this.entidadComiteTutorial.examenGrado.idioma2C);
    this.getControl('noAdeudosC').patchValue(this.entidadComiteTutorial.examenGrado.noAdeudosC);
    this.getControl('votosAprobatoriosC').patchValue(this.entidadComiteTutorial.examenGrado.votosAprobatoriosC);
    this.getControl('aprobarExamenC').patchValue(this.entidadComiteTutorial.examenGrado.aprobarExamenC);
    this.getControl('fotosC').patchValue(this.entidadComiteTutorial.examenGrado.fotosC);


    this.idExamenGrado = this.entidadComiteTutorial.examenGrado.id;

    // CheckBox Values

    this.getControl('totalAsginatura').patchValue(this.entidadComiteTutorial.examenGrado.totalAsginatura);
    this.getControl('idioma1').patchValue(this.entidadComiteTutorial.examenGrado.idioma1);
    this.getControl('idioma2').patchValue(this.entidadComiteTutorial.examenGrado.idioma2);
    this.getControl('noAdeudos').patchValue(this.entidadComiteTutorial.examenGrado.noAdeudos);
    this.getControl('votosAprobatorios').patchValue(this.entidadComiteTutorial.examenGrado.votosAprobatorios);
    this.getControl('aprobarExamen').patchValue(this.entidadComiteTutorial.examenGrado.aprobarExamen);
    this.getControl('fotos').patchValue(this.entidadComiteTutorial.examenGrado.fotos);

  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this.spinner.start('guardar');
      if (this.edicionFormulario) {
        console.log (':::: id_examn grado: ' + this.idExamenGrado);
        let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
        this.examenGradoService
          .putExamenGrado(
            this.idExamenGrado,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {
            // console.log(response.json());
            let jsonComite = '{"idExamenGrado": "' + this.idExamenGrado+ '"}';
            this.comiteTutorialService.putComiteTutorial(
              this.entidadComiteTutorial.id,
              jsonComite,
              this.erroresGuardado
            ).subscribe(
              response => {
                // console.log('success');
                this.cerrarModalAgregarRequisitos();
                this.spinner.stop('guardar');
                this.onCambiosTabla();
              }
            );
          }
        );
      }

    }

  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  recuperarInformacionEstudiante(): void {
    this.estudianteActual = this.entidadComiteTutorial.estudiante;
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
        return true;
    }
    return false;
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    // return resultado;
  }

  private habilitarBotonGuardar(): boolean {
    return this.idExamenGrado != undefined;
  }

  crearFormularioRequisitos(): void {
    this.formulario = new FormGroup({
      totalAsginatura: new FormControl(false),
      totalAsginaturaC: new FormControl('',
      Validators.compose([Validacion.parrafos])),
      idioma1: new FormControl(false),
      idioma1C: new FormControl('',
      Validators.compose([Validacion.parrafos])),
      idioma2: new FormControl(false),
      idioma2C: new FormControl('',
      Validators.compose([Validacion.parrafos])),
      noAdeudos: new FormControl(false),
      noAdeudosC: new FormControl('',
      Validators.compose([Validacion.parrafos])),
      votosAprobatorios: new FormControl(false),
      votosAprobatoriosC: new FormControl('',
      Validators.compose([Validacion.parrafos])),
      aprobarExamen: new FormControl(false),
      aprobarExamenC: new FormControl('',
      Validators.compose([Validacion.parrafos])),
      fotos: new FormControl(false),
      fotosC: new FormControl('',
      Validators.compose([Validacion.parrafos])),

      // idEstudiante: new Control(this.estudianteActual.id)

    });
  }

  cerrarModalAgregarRequisitos(): void {
    this.entidadComiteTutorial = undefined;
    this.estudianteActual = undefined;
    this.edicionFormulario = false;
    this.crearFormularioRequisitos();
    this.modalValidarRequisitos.close();
  }

  /**********************************************
   * ********************************************
   * TERMINA SECCION DE VALIDAR REQUISITOS *
  **********************************************/

  /**********************************************
   * ********************************************
   * INICIA SECCION DE DETALLE *
  **********************************************/
  modalDetallesRequisitos(): void {
    this.entidadComiteTutorial = this.registroSeleccionado;
    this.modalDetalleRequisitos.open('lg');
  }

  cerrarModalDetalle(): void {
    this.entidadComiteTutorial = undefined;
    this.modalDetalleRequisitos.close();
  }


  /**********************************************
   * ********************************************
   * TERMINA SECCION DE DETALLE *
  **********************************************/
limpiarVariablesSession() {
    sessionStorage.removeItem('defensaTesisCriterios');
    sessionStorage.removeItem('defensaTesisOrdenamiento');
    sessionStorage.removeItem('defensaTesisLimite');
    sessionStorage.removeItem('defensaTesisPagina');
  }

}
