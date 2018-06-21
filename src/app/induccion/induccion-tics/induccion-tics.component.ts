import {Component, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {AsistenciaInduccion} from '../../services/entidades/lista-asistencia-induccion.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {EstudianteService} from '../../services/entidades/estudiante.service';
import {AsistenciaInduccionService} from '../../services/entidades/lista-asistencia-induccion.service';
import {EstudianteListaAsistenciaService} from '../../services/entidades/estudiantes-lista-asistencia.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {EstudianteListaAsistencia} from '../../services/entidades/estudiantes-lista-asistencia.model';
import {ItemSelects} from '../../services/core/item-select.model';

@Component({
  selector: 'app-induccion-tics',
  templateUrl: './induccion-tics.component.html',
  styleUrls: ['./induccion-tics.component.css']
})
export class InduccionTicsComponent {
  @ViewChild('modalCrearEditar')
  modalCrearEditar: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  idTipoLista: number;
  registros: Array<AsistenciaInduccion> = [];

  columnas: Array<any> = [
    { titulo: 'Sala*', nombre: 'idSala.descripcion' },
    { titulo: 'Fecha', nombre: 'horario' },
    { titulo: 'Horario', nombre: 'horario', sort: false },
    { titulo: 'Estatus', nombre: 'estatus', sort: false }
  ];

  registroSeleccionado: AsistenciaInduccion;
  usuarioRolService;
  criteriosCabecera: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';
  criteriosFecha: string = '';
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idSala.descripcion', textoFecha: '' }
  };
  public dt: Date = new Date();
  formularioRegistroPagina: FormGroup;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  
  constructor(// private modal: Modal,
              private elementRef: ElementRef,
              private authService: AuthService,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public _estudianteService: EstudianteService,
              public _asistenciaInduccionService: AsistenciaInduccionService,
              public _estudianteListaAsistenciaService: EstudianteListaAsistenciaService,
              public spinner: SpinnerService) {
    this.prepareServices();
    this.formularioListaAsistencia = new FormGroup({
      horario: new FormControl(''),
      idSala: new FormControl(''),
      idTipo: new FormControl(''),
      idEstudiante: new FormControl('')
    });
    this.getRolUsrActual();
    this.listaAlumnos();
    (this.minDate = new Date()).setDate(this.minDate.getDate());
    if (sessionStorage.getItem('induccion')) {
      let promocion = 'idPromocion';
    }

    this.formularioRegistroPagina = new FormGroup({
      registroPorPagina: new FormControl('')
    });

    (<FormControl>this.formularioRegistroPagina.controls['registroPorPagina']) 
      .setValue(+sessionStorage.getItem('induccionTicsLimite') ? +sessionStorage.getItem('induccionTicsLimite') : this.limite);

  }

  getRolUsrActual(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + this.authService.getUsuarioLogueado().id +
        ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(this.erroresConsultas, urlSearch).subscribe(
      response => {
        response.json().lista.forEach((item) => { });
        if (this.authService.hasRol('DOCENCIA')) {
          this.idTipoLista = 1;
        }
        if (this.authService.hasRol('BIBLIOTECA')) {
          this.idTipoLista = 2;
        }
        if (this.authService.hasRol('UTIC')) {
          this.idTipoLista = 3;
        }
        this.criteriosCabecera = 'idTipo.id~' + this.idTipoLista + ':IGUAL';
        this.onCambiosTabla();
      }
    );
  }

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;

  }
  getPaginacion() {
    return this.paginacion;
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;

    let urlSearch: URLSearchParams = new URLSearchParams();
    let ordenamiento = '';
    let criterios = '';

    if (this.criteriosCabecera !== '') {
      criterios = this.criteriosCabecera;
      urlSearch.set('criterios', criterios);
    }
    if (this.criteriosFecha !== '') {
      criterios = criterios + ';AND,' + this.criteriosFecha;
      urlSearch.set('criterios', criterios);
    }
    if (this.configuracion.filtrado && (this.configuracion.filtrado.textoFiltro !== '' ||
      this.configuracion.filtrado.textoFecha !== '')) {
        if (criterios !== '') {
          criterios = criterios + 'GROUPAND';
        }
        let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracion.filtrado.textoFiltro + ':LIKE';
        });
      }

    if (!sessionStorage.getItem('induccionTicsOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('induccionTicsOrdenamiento', ordenamiento);
    }
    if (!sessionStorage.getItem('induccionTicsCriterios')) {
      sessionStorage.setItem('induccionTicsCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('induccionTicsLimite') ? +sessionStorage.getItem('induccionTicsLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('induccionTicsPagina') ? +sessionStorage.getItem('induccionTicsPagina') : this.paginaActual;
    urlSearch.set('criterios', sessionStorage.getItem('induccionTicsCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('induccionTicsOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    ////console.log("urlSearch",urlSearch);
    this.spinner.start('tabla1');

    this._asistenciaInduccionService.getListaAsistenciaInduccion(
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
          this.setPaginacion(new PaginacionInfo(
              paginacionInfoJson.registrosTotales,
              paginacionInfoJson.paginas,
              paginacionInfoJson.paginaActual,
              paginacionInfoJson.registrosPagina
          ));

          paginacionInfoJson.lista.forEach((item) => {
            this.registros.push(new AsistenciaInduccion(item));
          });
          this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
          this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
        },
        error => {
          this.spinner.stop('tabla1');
        },
        () => {
          this.spinner.stop('tabla1');
        }
    );
  }
  sortChanged(columna): void {
    sessionStorage.removeItem('induccionTicsOrdenamiento');
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

  getFechaEjemplo(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      this.fechaInicio = fechaConFormato;
      this.fechaFin = moment(this.dt).add(1, 'day').format('DD/MM/YYYY');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }
  filtrarPorFecha(): void {
    this.limpiarVariablesSession();
    this.criteriosFecha = 'horario~' + this.fechaInicio + ':MAYORIGUAL;AND,horario~' +
      this.fechaFin + ':MENOR;AND';
    this.onCambiosTabla();
  }

  mostrarTodos(): void {
    this.limpiarVariablesSession();
    this.criteriosFecha = '';
    this.dt = new Date();
    this.onCambiosTabla();
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

  setLimite(limite: string): void {
    sessionStorage.removeItem('induccionTicsLimite');
    this.limite = Number(limite);
    sessionStorage.setItem('induccionTicsLimite', this.limite.toString());
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
  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }
  obtenerHora(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('HH:mm');

    }
    return retorno;
 }
  limpiarVariablesSession() {
    sessionStorage.removeItem('induccionTicsCriterios');
    sessionStorage.removeItem('induccionTicsOrdenamiento');
    sessionStorage.removeItem('induccionTicsLimite');
    sessionStorage.removeItem('induccionTicsPagina');
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  cambiarPagina(evento: any): void {
    sessionStorage.removeItem('induccionTicsPagina');
    this.paginaActual = evento.page;
    sessionStorage.setItem('induccionTicsPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  prepareServices(): void {
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
  }

////////////////////////////////////////// MODAL CREAR / EDITAR LISTA DE ASISTENCIA////////////////////////////*****

  private modo: string;

  paginacionCLA: PaginacionInfo;
  paginaActualCLA: number = 1;
  limiteCLA: number = 60;
  formularioListaAsistencia: FormGroup;
  entidadListaAsistencia: AsistenciaInduccion;
  resultadoEstudiantes;
  mensajeErrors: any = {
    'required': 'Este campo es requerido',
    'pattern': 'Formato incorrecto',
    'pattern_horario': 'El formato es: "HH:MM" (24Hrs)'
  };
  validacionActiva: boolean = false;
  idEstudiante: number = 0;
  entidadEstudiante: Estudiante;
  estudiantes: Array<Estudiante> = [];
  criteriosCabeceraCLA: string = '';
  numeroEstudiante: number;
  public stringHorario: string = 'horario';
  public intIdsala: string = 'idSala';

  registroSeleccionadoCLA: EstudianteListaAsistencia;
  public configuracionCLA: any = {
    paginacionCLA: true,
    filtrado: { textoFiltro: '',
      columnasCLA: 'idEstudiante.idDatosPersonales.nombre,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idMatricula.matriculaCompleta,' +
      'idEstudiante.idPromocion.idProgramaDocente.descripcion'}
  };
  configuracionAutocomplete: any = {
    paginacionCLA: true,
    filtrado: { textoFiltro: ''}
  };
  columnasCLA: Array<any> = [
    { titulo: 'Matrícula*', nombre: 'matricula', sort: false },
    { titulo: 'Nombre del estudiante*', nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc' },
    { titulo: 'Programa docente*', nombre: 'promocion', sort: false },
    { titulo: 'Asistencia', nombre: 'asitio', sort: false}
  ];
  exportarExcelUrlCLA = '';
  exportarPDFUrlCLA = '';
  estudiantesListaAsistencia: Array<EstudianteListaAsistencia> = [];
  estadoBoton: boolean = false;
  idEstudianteAgregar: number;
  correoService;
  idListaAsistencia: number;
  band:boolean = false;
  public dtCLA: Date;
  public minDate: Date;
  private isComplete: boolean = false;
  private estudianteSelAutocomplete: Estudiante;
  private opcionesCatalogoEstudiante: Array<ItemSelects> = [];
  private opcionesCatalogoSala: Array<ItemSelects> = [];

  private erroresConsultasCLA: Array<ErrorCatalogo> = [];
  private erroresGuardadoCLA: Array<ErrorCatalogo> = [];

  protected searchStr2: string;
  protected opcions = [];

  constructorCLA(modo: string): void {
    this.paginaActualCLA = 1;
    this.limiteCLA = 60;
    this.formularioListaAsistencia.reset();
    this.validacionActiva = false;
    this.idEstudiante = 0;
    this.estudiantes = [];
    this.criteriosCabeceraCLA = '';
    this.stringHorario = 'horario';
    this.intIdsala = 'idSala';
    this.dtCLA = new Date();
    this.minDate = void 0;

    this.exportarExcelUrlCLA = '';
    this.exportarPDFUrlCLA = '';
    this.estudiantesListaAsistencia = [];
    this.estadoBoton = false;
    this.isComplete = false;
    this.opcionesCatalogoSala = [];

    this.erroresConsultasCLA = [];
    this.erroresGuardadoCLA = [];

    this.idListaAsistencia = null;
    this.band = false;

    this.prepareServicesCLA();
    this.getRolUsrActual();

    if (modo === 'editar' && this.registroSeleccionado) {
      this.idListaAsistencia = this.registroSeleccionado.id;
      this.band = true;
    }
    if (modo === 'agregar' && this.registroSeleccionado) {
      this.registroSeleccionado = null;
      this.idListaAsistencia = null;
      this.band = false;
    }
    this.modo = modo;

    if ((modo === 'agregar') || (modo === 'editar' && this.registroSeleccionado)) {
      this.modalCrearListaAsistencia();
    }

    if (this.idListaAsistencia) {
      this.inicializarFormulario();
    }

    this.formularioListaAsistencia = new FormGroup({
      horario: new FormControl('', Validators.required),
      idSala: new FormControl('', Validators.required),
      idTipo: new FormControl('', Validators.required),
      idEstudiante: new FormControl('')
    });

    (<FormControl>this.formularioListaAsistencia.controls['idTipo'])
        .setValue(this.idTipoLista);

    this.criteriosCabeceraCLA = 'idListaAsistencia.id~' + this.idListaAsistencia +
        ':IGUAL';
  }

  listaAlumnos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    this._estudianteService.
    getListaEstudianteOpcional(this.erroresConsultasCLA, urlParameter).subscribe(
        response => {
          let items = response.json().lista;
          if (items) {
            this.opcions = [];
            items.forEach((item) => {
              let it = new Estudiante(item);
              this.opcions.push({"id": item.id, "name": (it.matricula.matriculaCompleta ?
                  it.matricula.matriculaCompleta : '') + ' ' +
              it.getNombreCompleto()});
            });
          }
        },
        error => {

          this.spinner.stop('filter');
          this.isComplete = false;
        },
        () => {
          this.spinner.stop('filter');
          this.isComplete = false;
        }
    );
  }

  setLimiteCLA(limite: string): void {
    this.limiteCLA = Number(limite);
    this.onCambiosTablaCLA();
  }

  inicializarFormulario(): void {
    if (this.idListaAsistencia) {
      let listaAsistencia: AsistenciaInduccion;
      this.entidadListaAsistencia = this._asistenciaInduccionService
        .getEntidadAsistenciaInduccion(
          this.idListaAsistencia,
          this.erroresConsultasCLA
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo AsistenciaInduccion
          response => {
            listaAsistencia = new AsistenciaInduccion(
                response.json());
            this.onCambiosTablaCLA();
          },
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {},
          () => {
            if (this.formularioListaAsistencia) {
              let tmpDate = moment(listaAsistencia.horario);
              (<FormControl>this.formularioListaAsistencia.controls[this.stringHorario])
                .setValue(tmpDate.format('HH:mm'));
              (<FormControl>this.formularioListaAsistencia.controls[this.intIdsala])
                .setValue(listaAsistencia.sala.id);

              this.dtCLA = new Date(tmpDate.toJSON());
            }
          }
        );
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioListaAsistencia.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioListaAsistencia.controls[campo]).valid &&
        this.validacionActiva) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl, campo?: string): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {

      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          if (errorType === 'pattern') {
            if (campo === 'horario') {
              resultado += this.mensajeErrors[errorType + '_' + campo];
            } else {
              resultado += this.mensajeErrors[errorType];
            }
          } else {
            resultado += this.mensajeErrors[errorType];
          }

        }
      }
    }
    return resultado;
  }

  validarFormulario(): boolean {
    if (this.formularioListaAsistencia.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario(): void {
    event.preventDefault();
    if (this.validarFormulario()) {
      if (this.formularioListaAsistencia.valid) {
        this.spinner.start('enviarForm');
        let jsonFormulario = JSON.stringify(this.formularioListaAsistencia.value, null, 2);
        let objFormulario = JSON.parse(jsonFormulario);
        objFormulario.horario = moment(this.dtCLA).format('DD/MM/YYYY') + ' ' +
            moment(objFormulario.horario, 'hh:mm').format('hh:mma');
        if (objFormulario.hasOwnProperty('fecha')) {
          delete objFormulario.fecha;
        }
        jsonFormulario = JSON.stringify(objFormulario, null, 2);

        if (this.idListaAsistencia) {
          this._asistenciaInduccionService
              .putAsistenciaInduccion(
                  this.idListaAsistencia,
                  jsonFormulario,
                  this.erroresGuardadoCLA
              ).subscribe(
              () => {
                // console.log('Success Edition');
                this.enviarCorreoDodencia();

                this.estudiantesListaAsistencia.forEach((asistente) => {
                  this.enviarCorreo(asistente);
                });
              },
              console.error,
              () => {
                this.cerrarModalCrearListaAsistencia();
                this.spinner.stop('enviarForm');
              }
          );
        } else {
          this._asistenciaInduccionService
              .postAsistenciaInduccion(
                  jsonFormulario,
                  this.erroresGuardadoCLA
              ).subscribe(
              response => {
                // //console.log("Success Add");
                let json = response.json();
                ////console.log("json", json);
                if (json.id) {
                  this.idListaAsistencia = json.id;
                  this.criteriosCabeceraCLA = 'idListaAsistencia.id~' +
                      this.idListaAsistencia + ':IGUAL';
                  this.inicializarFormulario();
                }
              },
              console.error,
              () => {
                this.spinner.stop('enviarForm');
                ////console.log("cerrar");
                // this.cerrarModal();
                // this.spinner.stop();
              }
          );
        }

      }
    }
  }

  enviarCorreo(asistente): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(asistente.estudiante.datosPersonales.email),
      entidad: new FormControl({ estudiantesListaAsistencia: asistente.id}),
      idPlantillaCorreo: new FormControl(37)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.correoService
        .postCorreoElectronico(
            jsonFormulario,
            this.erroresGuardadoCLA
        ).subscribe(
        response => {},
        error => {},
        () => {}
    );
  }

  enviarCorreoDodencia(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      entidad: new FormControl({ estudiantesListaAsistencia: this.idListaAsistencia}),
      idPlantillaCorreo: new FormControl(37)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.correoService
        .postCorreoElectronico(
            jsonFormulario,
            this.erroresGuardadoCLA
        ).subscribe(
        response => {},
        error => {},
        () => {}
    );
  }

  rowSeleccionadoCLA(registro): boolean {
    return (this.registroSeleccionadoCLA === registro);
  }

  rowSeleccionCLA(registro): void {
    if (this.registroSeleccionadoCLA !== registro) {
      this.registroSeleccionadoCLA = registro;
    } else {
      this.registroSeleccionadoCLA = null;
    }
  }

  sortChangedCLA(columna): void {
    this.columnasCLA.forEach((column) => {
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
      this.onCambiosTablaCLA();
    }
  }

  marcarAsistencia(nuevoValor: boolean): void {
    if (this.registroSeleccionadoCLA && this.registroSeleccionadoCLA.id) {
      this.spinner.start('marcaAsis');
      this.registroSeleccionadoCLA.asitio = nuevoValor;
      let objForm = {
        id: this.registroSeleccionadoCLA.id,
        idEstudiante: this.registroSeleccionadoCLA.estudiante.id,
        idListaAsistencia: this.idListaAsistencia,
        asitio: this.registroSeleccionadoCLA.asitio
      };
      let jsonForm = JSON.stringify(objForm, null, 2);
      this._estudianteListaAsistenciaService
        .putEstudianteListaAsistencia(this.registroSeleccionadoCLA.id, jsonForm,
          this.erroresGuardadoCLA)
        .subscribe(
          response => {
            // console.log('Success Add student');
          },
          console.error,
          () => {
            this.onCambiosTablaCLA();
          }
        );
    }
  }

  agregarEstudiante(): void {
    if (this.estudianteSelAutocomplete) {
      this.spinner.start('agregaEstud');
      /*var asistente = new EstudianteListaAsistencia(false);
       asistente.asitio = false;
       asistente.estudiante = this.estudianteSelAutocomplete;*/

      let objForm = {
        idEstudiante: this.estudianteSelAutocomplete.id,
        idListaAsistencia: this.idListaAsistencia,
        asitio: 0
      };
      let jsonForm = JSON.stringify(objForm, null, 2);
      this._estudianteListaAsistenciaService
        .postEstudianteListaAsistencia(jsonForm, this.erroresGuardadoCLA)
        .subscribe(
          response => {
            // console.log('Success Add student');
          },
          console.error,
          () => {
            this.estadoBoton = false;
            this.estudianteSelAutocomplete = null;
            this.onCambiosTablaCLA();
          }
        );
    }
  }

  columnaAsistencia(valor: boolean): string {
    let cls = (valor) ? 'check' : 'times';
    return cls;
  }

  setPaginacionCLA(paginacion: PaginacionInfo): void {
    this.paginacionCLA = paginacion;

  }

  getPaginacionCLA() {
    return this.paginacionCLA;
  }

  getFechaEjemploCLA(): string {
    if (this.dtCLA) {
      let fechaConFormato = moment(this.dtCLA).format('DD/MM/YYYY');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  filtroChangedCLA(filtroTexto): void {
    this.configuracionCLA.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTablaCLA();
  }

  autocompleteOnSelect(e): void {
    this.spinner.start('select');
    this._estudianteService.getEntidadEstudiante(e.id,
      this.erroresConsultasCLA).subscribe(
      response => {
        this.estudianteSelAutocomplete = new Estudiante(response.json());
        this.getIdEstudiante(this.estudianteSelAutocomplete.id);
      },
      error => {
        this.spinner.stop('select');
      },
      () => {
        this.spinner.stop('select');
      }
    );
  }

  getIdEstudiante(idEstudiante): void {
    this.spinner.start('select2');
    this.estadoBoton = false;
    if (idEstudiante) {
      this.idEstudianteAgregar = idEstudiante;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstudiante.id~' + this.idEstudianteAgregar +
          ':IGUAL;AND,idListaAsistencia.id~' + this.idListaAsistencia +
          ':IGUAL');
      this._estudianteListaAsistenciaService.getListaEstudianteListaAsistencia(
        this.erroresConsultasCLA, urlParameter).subscribe(
        response => {
          this.numeroEstudiante = response.json().lista.length;
        },
        error => {
          this.spinner.stop('select2');
        },
        () => {
          if (this.numeroEstudiante < 1) {
            this.estadoBoton = true;
          }else {
            this.estadoBoton = false;
          }
          this.spinner.stop('select2');
        }
      );
    }else {
      this.estadoBoton = false;
      this.spinner.stop('select2');
    }
  }

  filtroAutocompleteChanged(): void {
    this.estadoBoton = false;
  }

  onCambiosTablaCLA(): void {
    this.registroSeleccionadoCLA = null;

    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    if (this.criteriosCabeceraCLA !== '') {
      criterios = this.criteriosCabeceraCLA;
      urlSearch.set('criterios', criterios);
    }
    if (this.configuracionCLA.filtrado && this.configuracionCLA.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracionCLA.filtrado.columnasCLA.split(',');
      if (criterios !== '') { criterios = criterios + ';ANDGROUPAND'; }
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracionCLA.filtrado.textoFiltro + ':LIKE;OR';
      });

    }

    ////console.log("criterios",criterios);
    let ordenamiento = '';
    this.columnasCLA.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('criterios', criterios);
    urlSearch.set('limit', this.limiteCLA.toString());
    urlSearch.set('pagina', this.paginaActualCLA.toString());
    this.spinner.start('tabla');
    // console.log('urlSearch', urlSearch);

    this._estudianteListaAsistenciaService.getListaEstudianteListaAsistencia(
        this.erroresConsultasCLA,
        urlSearch,
        this.configuracionCLA.paginacionCLA
    ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          let paginasArray: Array<number> = [];
          this.estudiantesListaAsistencia = [];
          for (let i = 0; i < paginacionInfoJson.paginas; i++) {
            paginasArray.push(i);
          }
          this.setPaginacion(new PaginacionInfo(
            paginacionInfoJson.registrosTotales,
            paginacionInfoJson.paginas,
            paginacionInfoJson.paginaActualCLA,
            paginacionInfoJson.registrosPagina
          ));

          paginacionInfoJson.lista.forEach((item) => {
            this.estudiantesListaAsistencia.push(new EstudianteListaAsistencia(item));
          });
          this.exportarExcelUrlCLA = paginacionInfoJson.exportarEXCEL;
          this.exportarPDFUrlCLA = paginacionInfoJson.exportarPDF;

        },
        error => {

          this.spinner.stop('tabla');
        },
        () => {
          this.spinner.stop('tabla');
        }
    );
  }

  exportarCLA(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrlCLA) {
          window.open(this.exportarExcelUrlCLA);
        } else {
          alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrlCLA) {
          window.open(this.exportarPDFUrlCLA);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  private prepareServicesCLA(): void {
    this.correoService =
        this._catalogosService.getEnvioCorreoElectronicoService();

    let resultadoEstudiantes: {
      paginacionInfo: PaginacionInfo,
      lista: Array<Estudiante>
    } = this._estudianteService.getListaEstudiante(this.erroresConsultasCLA);
    this.estudiantes = resultadoEstudiantes.lista;

    this.opcionesCatalogoSala =
        this._catalogosService.getSalas().getSelectSalaHorario(
            this.erroresConsultasCLA);
  }

  modalCrearListaAsistencia(): void {
    this.modalCrearEditar.open('lg');
  }

  cerrarModalCrearListaAsistencia(): void {
    if (this.onCambiosTabla) {
      this.onCambiosTabla();
    }
    this.modalCrearEditar.close();
  }

  ///////////////////////////////////////// MODAL DETALLE//////////////////////////////////////**************


  paginacionDL: PaginacionInfo;
  paginaActualDL: number = 1;
  limiteDL: number = 60;
  registroSeleccionadoDL: EstudianteListaAsistencia;
  estudianteListaAsistenciaService;
  catalogoService;
  asistenciaInduccion: AsistenciaInduccion;

  public configuracionDL: any = {
    paginacionDL: true,
    filtrado: { textoFiltro: '',
      columnasDL: 'idEstudiante.idDatosPersonales.nombre,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idMatricula.matriculaCompleta,' +
      'idEstudiante.idPromocion.idProgramaDocente.descripcion'}
  };

  columnasDL: Array<any> = [
    { titulo: '*Matricula', nombre: 'matricula', sort: false },
    { titulo: '*Nombre', nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc' },
    { titulo: '*Programa docente',
      nombre: 'idEstudiante.idPromocion.idProgramaDocente.descripcion', sort: 'asc' },
    { titulo: 'Asistencia', nombre: 'asitio', sort: false }
  ];

  private erroresConsultasDL: Array<ErrorCatalogo> = [];

  constructorDL(): void {
    this.estudiantesListaAsistencia = [];
    this.paginaActualDL = 1;
    this.limiteDL = 60;
    this.erroresConsultasDL = [];
    this.asistenciaInduccion = this.registroSeleccionado;

    this.prepareServicesDL();
    this.modalDetalleLista();
  }

  onCambiosTablaDL(): void {

    this.spinner.start('tabla');
    this.registroSeleccionadoDL = null;

    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = 'idListaAsistencia.id~' + this.asistenciaInduccion.id +
        ':IGUAL';

    if (this.configuracionDL.filtrado && this.configuracionDL.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracionDL.filtrado.columnasDL.split(',');
      if (criterios !== '') {
        criterios = criterios + ';ANDGROUPAND';
      }
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
            this.configuracionDL.filtrado.textoFiltro + ':LIKE;OR';
      });

    }

    ////console.log("criterios",criterios);
    let ordenamiento = '';
    this.columnasDL.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('criterios', criterios);
    urlSearch.set('limit', this.limiteDL.toString());
    urlSearch.set('pagina', this.paginaActualDL.toString());
    // console.log('urlSearch', urlSearch);

    this.estudianteListaAsistenciaService.getListaEstudianteListaAsistencia(
        this.erroresConsultasDL,
        urlSearch,
        this.configuracionDL.paginacionDL
    ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          let paginasArray: Array<number> = [];
          this.estudiantesListaAsistencia = [];
          for (let i = 0; i < paginacionInfoJson.paginas; i++) {
            paginasArray.push(i);
          }
          this.setPaginacion(new PaginacionInfo(
              paginacionInfoJson.registrosTotales,
              paginacionInfoJson.paginas,
              paginacionInfoJson.paginaActualDL,
              paginacionInfoJson.registrosPagina
          ));

          paginacionInfoJson.lista.forEach((item) => {
            this.estudiantesListaAsistencia.push(new EstudianteListaAsistencia(item));
          });
        },
        error => {
          this.spinner.stop('tabla');
        },
        () => {
          this.spinner.stop('tabla');
        }
    );
  }

  columnaAsistenciaDL(valor: boolean): string {
    let cls = (valor) ? 'check' : 'times';
    return cls;
  }

  setPaginacionDL(paginacion: PaginacionInfo): void {
    this.paginacionDL = paginacion;

  }

  setLimiteDL(limite: string): void {
    this.limiteDL = Number(limite);
    this.onCambiosTablaDL();
  }

  rowSeleccionadoDL(registro): boolean {
    return (this.registroSeleccionadoDL === registro);
  }

  rowSeleccionDL(registro): void {
    if (this.registroSeleccionadoDL !== registro) {
      this.registroSeleccionadoDL = registro;
    } else {
      this.registroSeleccionadoDL = null;
    }
  }

  sortChangedDL(columna): void {
    this.columnasDL.forEach((column) => {
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
      this.onCambiosTablaDL();
    }
  }

  filtroChangedDL(filtroTexto): void {
    this.configuracionDL.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTablaDL();
  }

  cambiarPaginaDL(evento: any): void {
    this.paginaActualDL = evento.page;
    this.onCambiosTablaDL();
  }

  isSetPaginacionDL(): boolean {
    let result: boolean = false;

    if (this.hasOwnProperty('paginacion') && this.paginacionDL.hasOwnProperty(
            'registrosPagina')) {
      result = true;
    }
    return result;
  }

  private prepareServicesDL(): void {
    this.catalogoService = this._catalogosService;
    this.estudianteListaAsistenciaService =
        this.catalogoService.getEstudianteListaAsistenciaService();
    this.onCambiosTablaDL();
  }

  modalDetalleLista(): void {
    this.modalDetalle.open('lg');
  }

  cerrarModalDetalleLista(): void{
    this.modalDetalle.close();
  }

}
