import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {ComiteTutorial} from '../../services/entidades/comite-tutorial.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ErrorCatalogo} from '../../services/core/error.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {ExamenGrado} from '../../services/entidades/examen-grado.model';
import {ExamenGradoService} from '../../services/entidades/examen-grado.service';
import {ComiteTutorialService} from '../../services/entidades/comite-tutorial.service';
import {RegistroTituloService} from '../../services/entidades/registro-titulo.service';
import {Validacion} from '../../utils/Validacion';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-dictamen-defensa-tesis',
  templateUrl: './dictamen-defensa-tesis.component.html',
  styleUrls: ['./dictamen-defensa-tesis.component.css']
})
export class DictamenDefensaTesisComponent implements OnInit {

  @ViewChild('modalAgregarVeredicto')
  modalAgregarVeredicto: ModalComponent;
  @ViewChild('modalDetalleDictame')
  modalDetalleDictame: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<ComiteTutorial> = [];
  // private opcionesProgramaDocente: Array<ItemSelects> = [];
  // private opcionesPromocion: Array<ItemSelects> = [];
  programaDocenteService;
  promcionesService;
  catalogoServices;
  formulario: FormGroup;
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  botonBuscar: boolean = false;
  formularioRegistroPagina: FormGroup;
  formularioCriteriosCabecera: FormGroup;

  columnas: Array<any> = [
    {titulo: 'Matrícula del estudiante', nombre: 'idEstudiante', sort: false},
    {titulo: 'Nombre del estudiante *',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido,idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idDatosPersonales.nombre', sort: 'asc'
    },
    {titulo: 'Título de tesis *', nombre: 'tituloTesis'},
    {titulo: 'Fecha de examen', nombre: 'idExamenGrado.fechaExamen'},
    {titulo: 'Dictamen', nombre: 'idExamenGrado.dictamenTexto'}
  ];

  private erroresConsultas: Array<ErrorCatalogo> = [];
  registroSeleccionado: ComiteTutorial;

  public configuracion: any = {
    paginacion:  true,
    filtrado: {
      textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido',
      columnasUnCriterio: 'idEstudiante.idDatosPersonales.primerApellido,idEstudiante.idDatosPersonales.segundoApellido',
      columnasDosCriterios: 'idEstudiante.idDatosPersonales.segundoApellido,idEstudiante.idDatosPersonales.nombre',
      columnaTercer: 'idEstudiante.idDatosPersonales.nombre',
      columnaTituloTesis: 'tituloTesis'
    }
  };

  /// inicia variables de agregar veredictro /////
  modalDictamen: FormGroup;
  private dictamenOpciones: Array<ItemSelects> = [];
  opcionesPromocion: Array<ItemSelects>;
  entidadTutor: ComiteTutorial;
  registrosAgregarVeredicto: Array<ExamenGrado> = [];
  programaDocenteAbreviatura;
  validacionActiva: boolean = false;
  dt: Date;
  usuarioRolService;
  oculto: boolean; // FALSE docencia TRUE coordinacion
  usuarioRol: UsuarioRoles;
  desahabilitarSelectorCoordiancion: boolean = false;

  _idProgramaDocente: number = 0;
  promocionId: number = null;
  desactivarBotonBuscar: boolean = false;
  private _programaDocenteService;
  private _promocionService;
  opcionesProgramaDocente: Array<ItemSelects> = [];

  private erroresGuardado: Array<ErrorCatalogo> = [];

  // fin de variables de agregar veredicto ////

  // variables de detalle dictamen /////
  entidadComiteTutorial: ComiteTutorial = undefined;
  // fin de variables de detalle de dictamen ////

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private examenGradoService: ExamenGradoService,
              private comiteTutorialService: ComiteTutorialService,
              private  authService: AuthService,
              private registroTituloService: RegistroTituloService,
              private _spinner: SpinnerService) {
    this.crearFormularioDictame();
    this.prepareServices();
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.formularioCriteriosCabecera = new FormGroup({
      idProgramaDocente: new FormControl('', Validators.required),
      idPromocionSeleccionada: new FormControl('')
    });

    this.formularioRegistroPagina = new FormGroup({
      dictamenDefensaTesisPorPagina: new FormControl('')
    });

    if (sessionStorage.getItem('dictamenDefensaTesisLimite')) {
      this.limite = +sessionStorage.getItem('dictamenDefensaTesisLimite');
    }
    (<FormControl>this.formularioRegistroPagina.controls['dictamenDefensaTesisPorPagina'])
      .setValue(+sessionStorage.getItem('dictamenDefensaTesisLimite') ?
        +sessionStorage.getItem('dictamenDefensaTesisLimite') : this.limite);

    this.formulario = new FormGroup({
      idProgramaDocente: new FormControl(),
      idPromocion: new FormControl(),
    });
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    this._idProgramaDocente = idProgramaDocente;
    this.promocionId = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.desactivarBotonBuscar = false;
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesPromocion = this._promocionService
      .getSelectPromocionProxima(this.erroresConsultas, urlParameter);

  }

  buscarCriteriosCabezera(idProgramaDocente: number,
                          idPromocion: number): void {
    this.limpiarVariablesSession();
    this.criteriosCabezera = '';
    this.promocionId = idPromocion;
    // console.log(idPromocion);
    if (idPromocion) {
      // console.log(idPromocion);
      this.criteriosCabezera = 'idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    sessionStorage.setItem('dictamenDefensaTesisIdPromocion', idPromocion.toString());
    sessionStorage.setItem('dictamenDefensaTesisIdProgramaDocente', idProgramaDocente.toString());
    this.onCambiosTabla();
  }

  habilitarBtnBuscar(): void {
    if (this.opcionesPromocion.length > 0) {
      this.desactivarBotonBuscar = true;
    }
  }

  sortChanged(columna): void {
    sessionStorage.removeItem('dictamenDefensaTesisOrdenamiento');
    this.columnas.forEach((column) => {
      if (columna !== column) {
        if (column.sort !== false) {
          column.sort = '';
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

  filtroChanged(filtroTexto): void {
     this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
   limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

    if (this.authService.hasRol('COORDINADOR')) {
      criterios = 'idProgramaDocente~' +
        this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
      urlSearch.set('criterios', criterios);
    }

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      // urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = this.criteriosCabezera ? (criterios + ';ANDGROUPAND') : '';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      //  urlSearch.set('criterios', criterios);
    }

   ordenamiento = '';
    if (!sessionStorage.getItem('dictamenDefensaTesisOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('dictamenDefensaTesisOrdenamiento', ordenamiento);
    }

    if (!sessionStorage.getItem('dictamenDefensaTesisCriterios')) {
     // console.log('criterios no hay sesion', criterios);
      sessionStorage.setItem('dictamenDefensaTesisCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('dictamenDefensaTesisLimite') ?
      +sessionStorage.getItem('dictamenDefensaTesisLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('dictamenDefensaTesisPagina') ?
      +sessionStorage.getItem('dictamenDefensaTesisPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('dictamenDefensaTesisCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('dictamenDefensaTesisOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

   // console.log(urlSearch);

    this._spinner.start('dictamendefensatesis1');

    this._catalogosService.getComiteTutorialService().getListaComiteTutorial(
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
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('dictamendefensatesis1');
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop('dictamendefensatesis1');
      }
    );
  }

  cambiarPagina(evento: any): void {
    sessionStorage.removeItem('dictamenDefensaTesisPagina');
    this.paginaActual = evento.page;
    sessionStorage.setItem('dictamenDefensaTesisPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  private getProgramaDocente(): void {
    if (this.oculto) {
      this.desahabilitarSelectorCoordiancion = true;
      let urlParameterCoordinador: URLSearchParams = new URLSearchParams();
      let criterioCoordinador = 'id~' + this.usuarioRol.usuario.programaDocente.id +
        ':IGUAL';
      urlParameterCoordinador.set('criterios', criterioCoordinador);
      this.opcionesProgramaDocente =
        this._programaDocenteService
          .getSelectProgramaDocente(this.erroresConsultas, urlParameterCoordinador);
      let programaDocente = 'idProgramaDocente';

      (<FormControl>this.formularioCriteriosCabecera.controls[programaDocente]).
      setValue(this.usuarioRol.usuario.programaDocente.id);

      let criteriosCabezera =
        'idProgramaDocente~' + this.usuarioRol.usuario.programaDocente.id +
        ':IGUAL';

      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', criteriosCabezera);
      this.opcionesPromocion = this._catalogosService.getPromocion().
      getSelectPromocionProxima(this.erroresConsultas, urlParameter);

      let idPromocionSeleccionada = 'dictamenDefensaTesisIdPromocion';

      if (sessionStorage.getItem('dictamenDefensaTesisIdPromocion')) {
        (<FormControl>this.formularioCriteriosCabecera.controls[idPromocionSeleccionada]).
        setValue(sessionStorage.getItem('interesadosIdPromocion'));
      }
      this.onCambiosTabla();
    } else {
      this.opcionesProgramaDocente = this._programaDocenteService
        .getSelectProgramaDocente(this.erroresConsultas);
      this.onCambiosTabla(); // esta dos veces por la asincronia y coordinacion
    }
  }

 recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        // console.log(response.json());
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          ////console.log(this.usuarioRol);
          if (this.usuarioRol.rol.id === 1) {
            this.oculto = false;
          }
          if (this.usuarioRol.rol.id === 2) {
            this.oculto = true;
            ////console.log('TRUE');
          }
        });
        this.getProgramaDocente();
      }
    );
  }


  setLimite(limite: string): void {
    sessionStorage.removeItem('dictamenDefensaTesisLimite');
    this.limite = Number(limite);
    sessionStorage.setItem('dictamenDefensaTesisLimite', this.limite.toString());
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

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  mostrarDetalle(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
  }

  mostrarDictamen(): boolean {
    if (this.registroSeleccionado
      && !(this.registroSeleccionado.examenGrado
    && this.registroSeleccionado.examenGrado.idDictamen
    && this.registroSeleccionado.examenGrado.idDictamen.valor)) {
      return true;
    } else {
      return false;
    }
  }

  private prepareServices(): void {
    this._programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this._promocionService = this._catalogosService.getPromocion();
    this.catalogoServices = this._catalogosService;
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();


    /* this.opcionesProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.promcionesService = this._catalogosService.getPromociones(); */
    // this.opcionesPromocion = this.promcionesService.getSelectPromocion(this.erroresConsultas);
  }

  /**********************************************
   * ********************************************
   * INICIA SECCION DE AGREGAR DICTAME *
  **********************************************/

  modalrDictamenExamen(): void {
    this.obtenerEntidadTutor();
    this.obtenerProgramaDocenteAbreviado();
    this.obtenerSelectCatalogo();
    this.getControl('idEstudiante').patchValue(this.registroSeleccionado.id);
    this.dt = new Date();
    this.modalAgregarVeredicto.open('lg');
  }

  obtenerEntidadTutor(): void {
    this.entidadTutor = this.registroSeleccionado;
  }

  obtenerProgramaDocenteAbreviado(): void {
    this.programaDocenteAbreviatura =
      this.registroSeleccionado.estudiante.
        promocion.programaDocente.abreviatura;
  }

  guardarDictamen(): void {
    let fechaExamen = this.getControl('fechaExamen');
    let dictamen = this.getControl('idDictamen');

    if (this.validarFormulario()) {
        let jsonAgregarRegistroTitulo = '{ "idEstudiante": "' +
            this.entidadTutor.estudiante.id + '",' +
            '"idEstatus": "1201"' + ',' + '"fechaExamen": "'  + fechaExamen.value + '",' +
            '"grado": "' + this.programaDocenteAbreviatura + '"}';
        let jsonFormulario = JSON.stringify(this.modalDictamen.value, null, 2);
        this._spinner.start('guardar');
        this.examenGradoService
            .postExamenGrado(
                jsonFormulario,
                this.erroresGuardado
            ).subscribe(
            response => {
                let jsonComite = '{"idExamenGrado": "' + response.json().id + '"}';
                this.comiteTutorialService.putComiteTutorial(
                  this.entidadTutor.id, jsonComite, this.erroresGuardado)
                    .subscribe(
                        response => {
                            // console.log('success');
                            this.cerrarModalAgregarDictame();
                            this.onCambiosTabla();
                        },
                        error => {
                          this._spinner.stop('guardar');
                        },
                        () => {
                          this._spinner.stop('guardar');
                        }
                    );
                // Solo se agregara a la tabla de registros de titulo si
                // el estudiante es aprobado es decir diferrente de 6: no aprobado
                if (dictamen.value !== 7) {
                    this.registroTituloService
                        .postRegistroTitulo(
                        jsonAgregarRegistroTitulo,
                        this.erroresGuardado
                    ).subscribe();
                }

            }
        );
    }

  }

  private obtenerSelectCatalogo(): void {
        this.dictamenOpciones =
            this._catalogosService.getCatDictamen().
              getSelectDictamen(this.erroresConsultas);
  }

  validarFormulario(): boolean {
        if (this.modalDictamen.valid) {
            this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
  }

  getFechaEjemplo(): string {
        if (this.dt) {
            let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
            (<FormControl>this.modalDictamen.controls['fechaExamen'])
                .patchValue(fechaConFormato + '10:00am');
            return fechaConFormato;
        } else {
            return moment(new Date()).format('L');
        }
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

  getControl(campo: string): FormControl {
        return (<FormControl>this.modalDictamen.controls[campo]);
  }

  private getControlErrorsVeredicto(campo: string): boolean {
        if (!(<FormControl>this.modalDictamen.controls[campo]).valid && this.validacionActiva) {
            return true;
        }
        return false;
  }


  crearFormularioDictame(): void {
    this.modalDictamen = new FormGroup({
      idDictamen: new FormControl('', Validators.required),
      idEstudiante: new FormControl(''),
      fechaExamen: new FormControl(''),
    });

  }

  cerrarModalAgregarDictame(): void {
    this.dictamenOpciones = [];
    this.crearFormularioDictame();
    this.modalAgregarVeredicto.close();
  }


  /**********************************************
   * ********************************************
   * FIN SECCION DE AGREGAR DICTAME *
  **********************************************/

  /**********************************************
   * ********************************************
   * INICIA SECCION DE DETALLE *
  **********************************************/

  modalDetallesDictamen(): void {
    this.entidadComiteTutorial = this.registroSeleccionado;
    this.modalDetalleDictame.open('lg');

  }


  cerrarModalDetalleDictame(): void {
    this.entidadComiteTutorial = undefined;
    this.modalDetalleDictame.close();
  }

  /**********************************************
   * ********************************************
   * FIN DE SECCION DE DETALLE *
  **********************************************/

    limpiarVariablesSession() {
    sessionStorage.removeItem('dictamenDefensaTesisCriterios');
    sessionStorage.removeItem('dictamenDefensaTesisOrdenamiento');
    sessionStorage.removeItem('dictamenDefensaTesisLimite');
    sessionStorage.removeItem('dictamenDefensaTesisPagina');
  }

}

