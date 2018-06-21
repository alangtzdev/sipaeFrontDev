import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {EstudianteGrupoIdioma} from "../../services/entidades/estudiante-grupo-idioma.model";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {Router} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {errorMessages} from "../../utils/error-mesaje";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-idiomas-evaluacion',
  templateUrl: './idiomas-evaluacion.component.html',
  styleUrls: ['./idiomas-evaluacion.component.css']
})
export class IdiomasEvaluacionComponent implements OnInit {

  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  parametroBusqueda: string = '';
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  exportarExcelUrl = '';
  exportarPdfUrl = '';
  registros: Array<EstudianteGrupoIdioma> = [];
  registroSeleccionado: EstudianteGrupoIdioma;
  validacionActiva: boolean = false;

  columnas: Array<any> = [
    { titulo: 'Matrícula*', nombre: 'idEstudiante.idMatricula.matriculaCompleta'},
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc' },
    { titulo: 'Idioma*', nombre: 'idGrupoIdioma.idIdioma.descripcion' },
    { titulo: 'Período', nombre: 'idGrupoIdioma', sort: false },
  ];

  periodoService;
  grupoIdiomaService;
  estudianteGrupoIdiomaService;
  formulario: FormGroup;

  public configuracion: any = {
    paginacion: true,
    filtrado: {
      textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,'
      + 'idEstudiante.idDatosPersonales.primerApellido,'
      + 'idEstudiante.idDatosPersonales.segundoApellido,'
      + 'idEstudiante.idMatricula.matriculaCompleta,'
      + 'idGrupoIdioma.idIdioma.descripcion'
    }
  };

  private erroresConsultas: Array<Object> = [];
  private opcionesPeriodo: Array<ItemSelects> = [];
  private opcionesIdioma: Array<ItemSelects> = [];
  private opcionesGrupo: Array<ItemSelects> = [];

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _route: Router,
//              public location: Location,
              private _spinner: SpinnerService,
              private _catalogosServices: CatalogosServices) {
    this.prepareServices();
    this.formularioEva = new FormGroup({
      calificacion: new FormControl('')
    });
    this.formularioEvaConf = new FormGroup({
      calificacion: new FormControl('')
    });
    this.tipoCalif = new FormGroup({
      tipoCalificacion: new FormControl('')
    });

     if (sessionStorage.getItem('idiomasIdPeriodo')) {
      let periodo = 'idPeriodo';
    }

    if (sessionStorage.getItem('solicitanteCriterios')) {
      this.onCambiosTabla();
    }
  }

  sortChanged(columna): void {
    this.limpiarVariablesSession();
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

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPdfUrl) {
          window.open(this.exportarPdfUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  listarGrupoIdioma(idIdioma): void {
    let urlSearch = new URLSearchParams();
    urlSearch.set('criterios', 'idIdioma.id~' + idIdioma + ':IGUAL');
    //console.log(urlSearch)
    this.opcionesGrupo = [];
    this.grupoIdiomaService.getListaGrupoIdiomaCriterios(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let items = response.json().lista;
        if (items) {
          for ( var i in items ) {
            //console.log(items[i]);
          }
          items.forEach((item) => {
            this.opcionesGrupo.push(
              new ItemSelects(
                item.id,
                item.institucion
              )
            );
          });
        }
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('listo');
        }*/
      }
    );
  }

  buscarCriteriosCabezera(
    idPeriodo: number,
    idIdioma: number/*,
     idGrupoIdioma: number*/
  ): void {
    this.limpiarVariablesSession(); 
    this.criteriosCabezera = '';
    if (idPeriodo) {
      this.criteriosCabezera = 'idGrupoIdioma.idPeriodo.id~' + idPeriodo + ':IGUAL';
      /*if (idGrupoIdioma) {
       this.criteriosCabezera = this.criteriosCabezera + ';AND,idGrupoIdioma.id~'
       + idGrupoIdioma + ':IGUAL';
       }*/
    }
    if (idIdioma && idPeriodo) {
      this.criteriosCabezera += ',idGrupoIdioma.id~' + idIdioma + ':IGUAL';
    }else {
      if (idIdioma){
        this.criteriosCabezera = 'idGrupoIdioma.id~' + idIdioma + ':IGUAL';
      }
    }
    /*else {
     if (idIdioma) {
     this.criteriosCabezera = this.criteriosCabezera + 'idGrupoIdioma.idIdioma.id~'
     + idIdioma + ':IGUAL';
     if (idGrupoIdioma) {
     this.criteriosCabezera = this.criteriosCabezera + ';AND,idGrupoIdioma.id~'
     + idGrupoIdioma + ':IGUAL';
     }
     }
     }*/

    //console.log('idPeriodo', idPeriodo);
    //console.log('idIdioma', idIdioma);
    //console.log('idGrupoIdioma', idGrupoIdioma);

    sessionStorage.setItem('idiomasIdPeriodo', idPeriodo.toString());
    sessionStorage.setItem('idiomasIdIdioma', idIdioma.toString());

    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
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

  mostrarDetalle(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonAgregarCalificacion(): boolean {
    if (this.registroSeleccionado && !this.registroSeleccionado.calificacion) {
      return true;
    } else {
      return false;
    }
  }

  mostrarBotonBoletaDetalle(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.calificacion) {
      return true;
    } else {
      return false;
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }
  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

    if (!sessionStorage.getItem('idiomasCriterios')) {

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      if (criterios !== '')
        criterios += ';ANDGROUPAND';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlSearch.set('criterios', criterios);
    }
    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    sessionStorage.setItem('idiomasCriterios', criterios);
    sessionStorage.setItem('idiomasOrdenamiento', ordenamiento);
    sessionStorage.setItem('idiomasLimite', this.limite.toString());
    sessionStorage.setItem('idiomasPagina', this.paginaActual.toString());

    }

    urlSearch.set('criterios', sessionStorage.getItem('idiomasCriterios')
    ? sessionStorage.getItem('idiomasCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('idiomasOrdenamiento') ? sessionStorage.getItem('idiomasOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('idiomasLimit') ? sessionStorage.getItem('idiomasLimit') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('idiomasPagina') ? sessionStorage.getItem('idiomasPagina') : this.paginaActual.toString());
    //console.log(urlSearch);
    this._spinner.start("idiomasevaluacion1");
    this.estudianteGrupoIdiomaService.getListaEstudiantesGrupoIdioma(this.erroresConsultas,
      urlSearch, this.configuracion.paginacion)
      .subscribe(
        response => {
          let grupoIdiomaJson = response.json();

          this.registros = [];
          this.setPaginacion(new PaginacionInfo(
              grupoIdiomaJson.registrosTotales,
              grupoIdiomaJson.paginas,
              grupoIdiomaJson.paginaActual,
              grupoIdiomaJson.registrosPagina
          ));

          grupoIdiomaJson.lista.forEach((item) => {
            this.registros.push(new EstudianteGrupoIdioma(item));
          });

          this.exportarExcelUrl = grupoIdiomaJson.exportarEXCEL;
          this.exportarPdfUrl = grupoIdiomaJson.exportarPDF;
        },
        error => {
//          if (assertionsEnabled())
          //console.log(error);

            this._spinner.stop("idiomasevaluacion1");
        },
        () => {
  /*        if (assertionsEnabled()) {
            //console.log('paginacionInfo', this.paginacion);
            //console.log('registros', this.registros);
          }*/
          this._spinner.stop("idiomasevaluacion1");
        }
      );
  }

/*  modalRegistroCalificacion(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idEstudianteGrupoIdioma = this.registroSeleccionado.id;
      let modalDetallesData = new ModalRegistroCalificacionFrancesData(
        this,
        idEstudianteGrupoIdioma
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalRegistroCalificacionFrances,
        bindings,
        modalConfig
      );
    }else {
      alert('Seleccione un solicitante');
    }
  }*/

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;

  }
  getPaginacion() {
    return this.paginacion;
  }

  recuperarIdiomas(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idPeriodo.id~' + id + ':IGUAL');
    //console.log(urlParameter);
    this.opcionesIdioma = [];
    this.opcionesGrupo = [];
    this.grupoIdiomaService.getListaGrupoIdiomaCriterios(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let items = response.json().lista;
        if (items) {
          for (var i in items) {
            //console.log(items[i]);
          }
          items.forEach((item) => {
            this.opcionesIdioma.push(
              new ItemSelects(
                item.id,
                item.id_idioma.descripcion + ' ' + item.id_nivel.valor + ' - ' +
                item.institucion + ' - ' + item.profesor
              )
            );
          });
        }
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('listo');
        }*/
      }
    );
  }

/*  modalAcreditacionIdioma(): void {
    //console.log('ENTRA');
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalsAcreditacionIdiomasData(2, 3) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalsAcreditacionIdiomas,
      bindings,
      modalConfig
    );
  }*/

  private prepareServices () {
    this.periodoService = this._catalogosServices.getPeriodoEscolar();

    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus.id~1007:IGUAL');
    urlParameter.set('ordenamiento', 'anio:ASC');
    //console.log(urlParameter);
    this.opcionesPeriodo = this.periodoService.getSelectPeriodoEscolarPeriodoCriterios(
      this.erroresConsultas,
      urlParameter
    );

    this.grupoIdiomaService = this._catalogosServices.getGrupoIdiomaService();
    this.estudianteGrupoIdiomaService =
      this._catalogosServices.getEstudianteGrupoIdiomaService();
    this.onCambiosTabla();
  }
  ngOnInit() {
  }
  //------------------------------------------- MODALS ---------------------------------------------------//
  @ViewChild('modalCalificacion')
  modalCalificacion: ModalComponent;
  @ViewChild('modalConfirmacion')
  modalConfirmacion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //------------------------------------------- MODAL CALIFICACION ---------------------------------------------------//
  idEstudianteGrupoIdioma;
  entidadEstudianteGrupoIdioma: EstudianteGrupoIdioma;
  formularioEva: FormGroup;
  tipoCalif: FormGroup;
  mensajeErrors: any = errorMessages;
  validacionActivaEva: boolean = false;
  detalleRegistro: boolean = false;
  idTipoCalificacion: number;
  private alertas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private erroresConsultasEva: Array<ErrorCatalogo> = [];

  private constructorEvaluacionIdioma(): void {
    this.entidadEstudianteGrupoIdioma = null;
    this.validacionActivaEva = false;
    this.detalleRegistro = false;
    this.idTipoCalificacion = null;
    this.alertas = [];
    this.erroresGuardado = [];
    this.erroresConsultasEva = [];

    if (this.registroSeleccionado) {
      this.idEstudianteGrupoIdioma = this.registroSeleccionado.id;
    }else {
      this.idEstudianteGrupoIdioma = null;
    }
    this.obtenerEntidadRecursoRevision();
    this.formularioEva = new FormGroup({
      calificacion: new FormControl('',
          Validators.compose([Validators.required, Validacion.calificacionValidator]))
    });
    this.tipoCalif = new FormGroup({
      tipoCalificacion: new FormControl('')
    });
    this.modalEvaluacionIdioma();
  }

  obtenerEntidadRecursoRevision(): void {
    this._spinner.start('entidad');
    this.estudianteGrupoIdiomaService
        .getEntidadEstudianteGrupoIdioma(
            this.idEstudianteGrupoIdioma,
            this.erroresConsultasEva
        ).subscribe(
        response => {
          this.entidadEstudianteGrupoIdioma = new EstudianteGrupoIdioma(response.json());
        },
        error => {
          this._spinner.stop('entidad');
        },
        () => {
          if (this.entidadEstudianteGrupoIdioma.calificacion) {
            this.detalleCalificacion();
          }
          this._spinner.stop('entidad');
        }
    );
  }

  detalleCalificacion(): void {
    this.detalleRegistro = true;
    let stringCalificacion = 'calificacion';

    switch (this.entidadEstudianteGrupoIdioma.calificacion)
    {
      case 201:
        this.getControl('calificacion').setValue('Acreditado');
        break;
      case 202:
        this.getControl('calificacion').setValue('No acreditado');
        break;
      case 203:
        this.getControl('calificacion').setValue('N/A');
        break;
      default:
        this.getControl(stringCalificacion).setValue(
            this.entidadEstudianteGrupoIdioma.calificacion);
    }
  }

  validarFormulario(): boolean {
    if(!this.idTipoCalificacion) {
      this.addErrorsMesaje('Seleccione una tipo de califcación', 'danger');
      this.getControl('calificacion').setValue('0');
    } else {
      if (this.formularioEva.valid) {
        this.validacionActivaEva = false;
        return true;
      }else {
        if (this.idTipoCalificacion.toString() !== "4"){
          this.validacionActivaEva = false;
          return true;
        }
      }
      this.validacionActivaEva = true;
      return false;
    }
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this._spinner.start('enviar');
      let jsonFormulario = JSON.stringify(this.formularioEva.value, null, 2);
      this.estudianteGrupoIdiomaService.putEstudianteGrupoIdioma(
          this.idEstudianteGrupoIdioma,
          jsonFormulario,
          this.erroresGuardado
      ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.onCambiosTabla();
            this.constructorConfirmacion(this.idEstudianteGrupoIdioma);
            this._spinner.stop('enviar');
          }
      );

    } else {
      //alert('error en el formulario');
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioEva.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioEva.controls[campo]).valid && this.validacionActivaEva) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl): string {
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  optenerTipoCalificacion(idTipoCalificacion): void {
    this.idTipoCalificacion = idTipoCalificacion;
    this.getControl('calificacion').setValue('');
    this.asignarCalificacionFormulario();
  }


  asignarCalificacionFormulario(): void {
    switch (this.idTipoCalificacion.toString())
    {
      case '1':
        this.getControl('calificacion').patchValue(201);
        break;
      case '2':
        this.getControl('calificacion').patchValue(202);
        break;
      case '3':
        this.getControl('calificacion').patchValue(203);
        break;
    }
      let jsonFormulario = JSON.stringify(this.formularioEva.value, null, 2);
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
    this.alertas.length = 0;
  }

  // debug del formulario no usar para produccion
  get cgValue(): string {
    return JSON.stringify(this.formularioEva.value, null, 2);
  }

  private modalEvaluacionIdioma(): void {
    this.modalCalificacion.open('lg');
  }
  private cerrarModalEvaluacionIdioma(): void {
    this.modalCalificacion.close();
  }

  //------------------------------------------- MODAL CONFIRMACION ---------------------------------------------------//
  formularioEvaConf: FormGroup;
  idEstudianteGrupoIdiomaConf;
  entidadEstudianteGrupoIdiomaEvaConf: EstudianteGrupoIdioma;
  private constructorConfirmacion(estudiante): void {
    this.idEstudianteGrupoIdiomaConf = estudiante;
    if (this.idEstudianteGrupoIdiomaConf) {
      this.obtenerEntidadRecursoRevisionConfirm();
      this.formularioEvaConf = new FormGroup({
        calificacion: new FormControl('')
      });
      this.modalConfim();
    }
  }
  obtenerEntidadRecursoRevisionConfirm(): void {
    this._spinner.start('obtenerEntidad');
    this.estudianteGrupoIdiomaService
        .getEntidadEstudianteGrupoIdioma(
            this.idEstudianteGrupoIdiomaConf,
            this.erroresConsultasEva
        ).subscribe(
        response => {
          this.entidadEstudianteGrupoIdiomaEvaConf = new EstudianteGrupoIdioma(response.json());
        },
        error => {
          this._spinner.stop('obtenerEntidad');
        },
        () => {
          this._spinner.stop('obtenerEntidad');
        }
    );
  }

  formularioDenegar(): void {
    this._spinner.start('denegar');
    let jsonFormulario = JSON.stringify(this.formularioEvaConf.value, null, 2);
    //console.log(jsonFormulario);

    this.estudianteGrupoIdiomaService.putEstudianteGrupoIdioma(
        this.idEstudianteGrupoIdiomaConf,
        jsonFormulario,
        this.erroresGuardado
    ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          //this.entidadEstudianteGrupoIdioma.calificacion = null;
          this.onCambiosTabla();
          this.cerrarModalConfirm();
          this._spinner.stop('denegar');
        }
    );
  }

  cerrarModalAceptar(): void {
    this.cerrarModalEvaluacionIdioma();
    this.cerrarModalConfirm();
  }

  private modalConfim(): void {
    this.modalConfirmacion.open();
  }
  private cerrarModalConfirm(): void {
    this.modalConfirmacion.close();
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('idiomasCriterios');
    sessionStorage.removeItem('idiomasOrdenamiento');
    sessionStorage.removeItem('idiomasLimite');
    sessionStorage.removeItem('idiomasPagina');
  }
}
