import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {RegistroTitulo} from '../../services/entidades/registro-titulo.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import * as moment from 'moment';
import {URLSearchParams} from '@angular/http';
import {Validacion} from '../../utils/Validacion';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';

@Component({
  selector: 'app-emision-titulos',
  templateUrl: './emision-titulos.component.html',
  styleUrls: ['./emision-titulos.component.css']
})
export class EmisionTitulosComponent implements OnInit {

  @ViewChild('modalAsignarFecha')
  modalAsignarFecha: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';
  // tabla dependientes
  paginacion: PaginacionInfo;
  botonValido: boolean = false;
  criteriosBusqueda: string = '';
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  validacionActiva: boolean = false;
  registros: Array<RegistroTitulo> = [];
  registroSeleccionado: RegistroTitulo;
//  mensajeErrors: any = errorMessages;
  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'matricula', sort: false },
    { titulo: 'Nombre del graduado',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido,idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idDatosPersonales.nombre', sort: 'asc' },
    { titulo: 'Grado del título', nombre: 'grado', sort: false },
    { titulo: 'Fecha de examen', nombre: 'fechaExamen', sort: false },
    { titulo: 'Fecha de expedición', nombre: 'fechaExpedicion', sort: false },
    { titulo: 'Fecha de recepción', nombre: 'fechaRecepcion', sort: false },
    { titulo: 'Fecha de entrega', nombre: 'fechaEntrega', sort: false },
    { titulo: 'Estatus', nombre: 'estatus', sort: false },
  ];
  registroTituloService;
  estatusService;
  promocionService;
  programaDocenteService;
  formulario: FormGroup;
  formularioRegistroPagina: FormGroup;
  public dt: Date = new Date();
  public dtFin: Date = new Date();
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido,grado,idEstatus.valor' }
  };
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects>;
  private opcionesCatalogoPromocion: Array<ItemSelects>;
  private opcionesCatalogoProgramaDocente: Array<ItemSelects>;

  /// variables para agregar fecha ///
  botonValidoAgregaFecha: boolean = false;
  entidadDetalleTitulo: RegistroTitulo;
  registroSeleccionadoAgregaFecha: RegistroTitulo;
  estatusCatalogoService;
  validacionActivaAgregaFecha: boolean = false;
  formularioTitulo: FormGroup;
  opcionesSelectProfesores: Array<ItemSelects>;
  fa: Date;
  tipoDeFecha: string;
  /// fin de variables para agregar fecha //

  constructor (private injector: Injector,
               private _catalogosServices: CatalogosServices,
               private _spinner: SpinnerService) {
    this.crearFormulario();
    this.prepareServices();
    this.formulario = new FormGroup({
      idEstatus: new FormControl(''),
      idPromocion: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
      fechaInicio: new FormControl(''),
      fechaTermino: new FormControl(''),
    });
    this.formularioRegistroPagina = new FormGroup ({
      registrosPorPagina: new FormControl('')
    });
    if (sessionStorage.getItem('emisionTitulosLimite')) {
      this.limite = +sessionStorage.getItem('emisionTitulosLimite');
    }
    (<FormControl>this.formularioRegistroPagina.controls['registrosPorPagina'])
      .setValue(this.limite);
  }

  activarBotonAsignar(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
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
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  ////// picker ///
  getFechaInicio(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaInicio']).patchValue(fechaConFormato);
        // .updateValue(fechaConFormato);
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaFin(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dtFin).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaTermino']).patchValue(fechaConFormato);
       // .updateValue(fechaConFormato);
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }
  ///// picker ///

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    sessionStorage.setItem('emisionTitulosPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
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

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    console.log('Criterio cabecera', this.criteriosBusqueda);
    if (this.criteriosBusqueda !== '') {
      criterios = this.criteriosBusqueda;
      // urlSearch.set('criterios', criterios);
    }
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      // urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    if (!sessionStorage.getItem('emisionTitulosOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('emisionTitulosOrdenamiento', ordenamiento);
    }
    console.log(criterios);
    if (!sessionStorage.getItem('emisionTitulosCriterios')) {
      console.log('dfsdgdsgdsgdsgs');
      sessionStorage.setItem('emisionTitulosCriterios', criterios);
    }
    this.limite = +sessionStorage.getItem('emisionTitulosLimite') ? +sessionStorage.getItem('emisionTitulosLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('emisionTitulosPagina') ?
      +sessionStorage.getItem('emisionTitulosPagina') : this.paginaActual;
    console.log(sessionStorage.getItem('emisionTitulosCriterios'));

    urlSearch.set('criterios', sessionStorage.getItem('emisionTitulosCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('aspirantesOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    this._spinner.start('emisiontitulos1');
    this.registroTituloService.getListaRegistroTitulo(
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
          this.registros.push(new RegistroTitulo(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('emisiontitulos1');
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop('emisiontitulos1');
      }
    );
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
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

  setLimite(limite: string): void {
    this.limite = Number(limite);
    sessionStorage.setItem('emisionTitulosLimite', this.limite.toString());
    sessionStorage.setItem('emisionTitulosPagina', '1');
    this.onCambiosTabla();
  }

  setPagina(pagina: string): void {
    this.paginaActual = Number(pagina);
    this.onCambiosTabla();
  }

  cambiarEstatus(idEstatus: number): void {
    if (this.registroSeleccionado) {
      let json = '{"idEstatus": "' + idEstatus + '"}';
      this.registroTituloService.putRegistroTitulo(
        this.registroSeleccionado.id,
        json,
        this.erroresGuardado
      ).subscribe(
        // //console.log('LISTO!!!')
      );
    } else {
      // //console.log('SELECCIONA UN REGISTRO');
    }
  }

  habilitarSelect(idRegistro: number): boolean {
    if (this.registroSeleccionado) {
      if (idRegistro === this.registroSeleccionado.id) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  private filtrarRegistros(
    idPromocion: number,
    idEstatus: number = null,
    inicio: string = null,
    fin: string = null
  ) {
    this.limpiarVariablesSession();
    console.log(idPromocion, idEstatus, inicio, fin);
    if (this.validarFormulario()) {
      if (idPromocion) {
        this.criteriosBusqueda = 'idEstudiante.idPromocion~' + idPromocion + ':IGUAL';
      }
      if (idEstatus) {
        if (this.criteriosBusqueda === '') {
          this.criteriosBusqueda = 'idEstatus~' + idEstatus + ':IGUAL';
        } else {
          this.criteriosBusqueda =
            this.criteriosBusqueda +
            ',idEstatus~' + idEstatus + ':IGUAL';
        }
      }

      if (inicio && fin) {
        if (this.criteriosBusqueda === '') {
          this.criteriosBusqueda =
            'fechaExamen~' + inicio + ':MAYOR' +
            ',fechaExamen~' + inicio + ':MENOR'; // Falta AND
        } else {
          this.criteriosBusqueda = this.criteriosBusqueda +
            ',fechaExamen~' + inicio + ':MAYOR' +
            ',fechaExamen~' + fin + ':MENOR';
        }
      } else {
        if (fin) {
          if (this.criteriosBusqueda === '') {
            this.criteriosBusqueda = 'fechaExamen~' + fin + ':MENOR';
          } else {
            this.criteriosBusqueda = this.criteriosBusqueda + ',fechaExamen~' + fin + ':MENOR';
          }
        }
        if (inicio) {
          if (this.criteriosBusqueda === '') {
            this.criteriosBusqueda = 'fechaExamen~' + inicio + ':MAYOR';
          } else {
            this.criteriosBusqueda = this.criteriosBusqueda +
              ',fechaExamen~' + inicio + ':MAYOR';
          }
        }
      }
      this.onCambiosTabla();
    }
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
          return Validacion.getValidatorMensajeError(errorType); // ValidacionService.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  private recuperarPromociones(idPrograma: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idProgramaDocente~' + idPrograma + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesCatalogoPromocion =
      this.promocionService.getSelectPromocion(this.erroresConsultas, urlParameter);
    (<FormControl>this.formulario.controls['idPromocion']).patchValue('');
//      .updateValue('');
  }

  private prepareServices () {
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.opcionesCatalogoProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);

    this.estatusService = this._catalogosServices.getEstatusCatalogo();
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idCatalogo~' + 1007 + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesCatalogoEstatus =
      this.estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);

    this.promocionService = this._catalogosServices.getPromocion();
    this.registroTituloService = this._catalogosServices.getRegistroTitulo();
    this.onCambiosTabla();
  }

  mostrarBotonAgregarFecha(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
  }

  ngOnInit() {
  }

  /**********************************************
   * ********************************************
   * INICIO DE SECCION DE AGREGAR FECHA *
  **********************************************/
  modalAgregarFecha(tipoFecha): void {
    this.tipoDeFecha = tipoFecha;
    this.obtenerEntidadTitulo();
    this.cargarInformacion();
    this.getFechaAsignacion();
    this.fa = new Date();
    this.modalAsignarFecha.open('lg');
  }

  obtenerEntidadTitulo(): void {
    this.entidadDetalleTitulo = this.registroSeleccionado;
  }

  cargarInformacion(): void {
    if (this.registroSeleccionado.fechaExpedicion) {
      (<FormControl>this.formularioTitulo.controls['fechaExpedicion'])
        .patchValue(this.registroSeleccionado.getFechaExpedicion);
    }
    if (this.registroSeleccionado.fechaEnvioImpresor) {
      (<FormControl>this.formularioTitulo.controls['fechaEnvioImpresor'])
        .patchValue(this.registroSeleccionado.getFechaEnvioImpresor);
    }
    if (this.registroSeleccionado.fechaEntregaImpresor) {
      (<FormControl>this.formularioTitulo.controls['fechaEntregaImpresor'])
        .patchValue(this.registroSeleccionado.getFechaEntregaImpresor);

    }
  }

  getFechaAsignacion(): string {
    if (this.fa) {
      if (this.tipoDeFecha == 'fechaExpedicion') {
        let fechaInicioFormato = moment(this.fa).format('DD/MM/YYYY');
      (<FormControl>this.formularioTitulo.controls['fechaExpedicion'])
        .patchValue(fechaInicioFormato + ' 10:30am');
        return fechaInicioFormato;
      }
      if (this.tipoDeFecha == 'fechaEnvioImpresor') {
        let fechaInicioFormato = moment(this.fa).format('DD/MM/YYYY');
        (<FormControl>this.formularioTitulo.controls['fechaEnvioImpresor'])
          .patchValue(fechaInicioFormato + ' 10:30am');
        return fechaInicioFormato;
      }
      if (this.tipoDeFecha == 'fechaEntregaImpresor') {
        let fechaInicioFormato = moment(this.fa).format('DD/MM/YYYY');
        (<FormControl>this.formularioTitulo.controls['fechaEntregaImpresor'])
          .patchValue(fechaInicioFormato + ' 10:30am');
        return fechaInicioFormato;
      }
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }


  activarBotonAsignarAgregaFecha(numero: number): any {
    if (numero === 1) {
      this.botonValidoAgregaFecha = true;
    }else {
      this.botonValidoAgregaFecha = false;
    }
  }

  enviarFormulario(): void {
    this._spinner.start('guardar');
    let jsonFormulario = JSON.stringify(this.formularioTitulo.value, null, 2);
    // console.log(jsonFormulario);

    this.registroTituloService
      .putRegistroTitulo(
        this.registroSeleccionado.id,
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
      () => {}, // console.log('Success'),
      console.error,
      () => {
        this.onCambiosTabla();
        this._spinner.stop('guardar');
        this.cerrarModalAgregarFecha();
      }
    );
  }

  private crearFormulario(): void {
    this.formularioTitulo = new FormGroup({
      fechaExpedicion: new FormControl(),
      fechaEnvioImpresor: new FormControl(),
      fechaEntregaImpresor: new FormControl()
    });
  }

  cerrarModalAgregarFecha(): void {
    this.botonValidoAgregaFecha = false;
    this.entidadDetalleTitulo = undefined;
    this.crearFormulario();
    this.modalAsignarFecha.close();
  }
  /**********************************************
   * ********************************************
   * INICIO DE SECCION DE AGREGAR FECHA *
  **********************************************/

  limpiarVariablesSession() {
    sessionStorage.removeItem('emisionTitulosCriterios');
    sessionStorage.removeItem('emisionTitulosOrdenamiento');
    sessionStorage.removeItem('emisionTitulosLimite');
    sessionStorage.removeItem('emisionTitulosPagina');
  }
}
