import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import {MovilidadInterprograma} from "../../services/entidades/movilidad-interprograma.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {AuthService} from "../../auth/auth.service";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ConfigService} from "../../services/core/config.service";
import {Validacion} from "../../utils/Validacion";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'app-solicitudes-interprogramas-coordinacion',
  templateUrl: './solicitudes-interprogramas-coordinacion.component.html',
  styleUrls: ['./solicitudes-interprogramas-coordinacion.component.css']
})
export class SolicitudesInterprogramasCoordinacionComponent implements OnInit {

  @ViewChild('modalDetalleInterprograma')
  modalDetalleInterprograma: ModalComponent;
  @ViewChild('modalAceptar')
  modalAceptarInterprogramas: ModalComponent;
  @ViewChild('modalDenegar')
  modalDenegarInterprograma: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //variable para service
  catalogoServices;
  periodoEscolarService;
  archivoService;
  usuarioService;
  estudianteMateriaService;
  //variables para la tabla y paginación
  registroSeleccionado: MovilidadInterprograma;
  usuarioLogueado: UsuarioSesion;
  nivelEstudios: number;
  programaDocente: number;
  coordinador: boolean = true;
  public registros: Array<MovilidadInterprograma> = [];
  public periodos: Array<ItemSelects> = [];

  columnas: Array<any> = [
    { titulo: 'Matrícula*', nombre: 'idEstudiante.idMatricula.matriculaCompleta', sort: 'asc'},
    { titulo: 'Nombre del estudiante*', nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc' },
    { titulo: 'Materia base', nombre: 'idMateriaCambiar.idMateriaInterprograma.idMateria.descripcion'},
    { titulo: 'Materia de cambio', nombre: 'idMateriaCursar.idMateria.descripcion', sort: 'asc'},
    { titulo: 'Estatus con director', nombre: 'idEstatusDirector.valor', sort: 'asc'},
    { titulo: 'Estatus coordinador de carrera', nombre: 'idEstatus.valor', sort: 'asc'},
    { titulo: 'Estatus coordinador de movilidad', nombre: 'idEstatusMovilidad.valor', sort: 'asc'}
  ];

  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idEstudiante.idMatricula.matriculaCompleta,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idDatosPersonales.nombre' }
  };
  mostrarBotonDetalle: boolean = false;
  mostrarBotones: boolean = false;

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<ErrorCatalogo> = [];

  // variables modal de aceptacion de mov interprogramas
  aceptarInterprograma: FormGroup;
  validacionActivaAceptar: boolean = false;

  // variables rechazar movilidad interprogramas
  rechazarInterprograma: FormGroup;

  //Se declara constructor de la clase
  constructor(//private modal: Modal,
              private injector: Injector,
              private _catalogoServices: CatalogosServices,
              public spinner: SpinnerService,
              authService : AuthService) {
    this.usuarioLogueado = authService.getUsuarioLogueado();  //Seguridad.getUsuarioLogueado();
    this.prepareServices();
    this.obtenerNivelCoordinador();
    this.obtenerPeriodosEscolares();
    this.inicializarFormularioAceptar();
    this.inicializarFormularioDenegar();
  }

  inicializarFormularioAceptar() {
    this.aceptarInterprograma = new FormGroup({
      comentarios: new FormControl('', Validators.required),
      idEstatus: new FormControl(102),
      idEstatusMovilidad: new FormControl(101)
    });
  }

  inicializarFormularioDenegar() {
    this.rechazarInterprograma = new FormGroup({
      comentarios: new FormControl('', Validators.required),
      idEstatus: new FormControl(103),
      idEstatusMovilidad: new FormControl(101)
    });
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idProgramaDocenteCursar~' + this.programaDocente + ':IGUAL;OR,' +
      'idEstudiante.idPromocion.idProgramaDocente~' + this.programaDocente + ':IGUAL;OR';
    //console.log('los criterios::::: ' + criterios);
    criterios = this.criteriosCabezera ? criterios + this.criteriosCabezera : criterios;
    urlSearch.set('criterios', criterios);

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = this.criteriosCabezera ? (criterios + ';ANDGROUPAND') : '';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    this.obtenerSolicitudesInterprograma(urlSearch);
    console.log(urlSearch);
  }

  // ************************** Obtener las solicitudes de interprograma **************//
  obtenerSolicitudesInterprograma(urlSearch): void {
    this.spinner.start("interprogramascoordinacion1");
    this.catalogoServices.getListaMovilidadInterprograma(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registros = [];
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new MovilidadInterprograma(item));
        });
      },
      error => {
        this.spinner.stop("interprogramascoordinacion1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this.spinner.stop("interprogramascoordinacion1");
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
      }
    );
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

  // ************************** Obtener los periodos escolares activos **************//
  obtenerPeriodosEscolares(): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    paramUrl.set('criterios', 'idEstatus~1007:IGUAL');

    this.periodoEscolarService.getListaPeriodoEscolar(
      this.erroresConsultas,
      paramUrl
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.periodos = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.periodos.push(new ItemSelects(item.id, item.anio + ' - ' + item.periodo));
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('periodos', this.periodos);
        }*/
      }
    );
  }

  buscarCriteriosCabezera(
    idPeriodoEscolar: number
  ): void {
    this.criteriosCabezera = '';
    if (idPeriodoEscolar) {
      this.criteriosCabezera = this.criteriosCabezera +
        ',idMateriaCambiar.idMateriaImpartida.idPeriodoEscolar.id~'
        + idPeriodoEscolar + ':IGUAL';
    }
    this.onCambiosTabla();
  }

  // ************************** para ponrle como una clase atributo seleccionar **************//
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  // ************************** El usuario selecciona el registro **************//
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.mostrarBotonDetalle = true;
    } else {
      this.registroSeleccionado = null;
      this.mostrarBotonDetalle = false;
    }
  }

  // ************************** Muestra detalle de Interprograma **************//
/*  modalDetalle(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    if (this.registroSeleccionado) {
      let idMovilidadInterprograma = this.registroSeleccionado.id;
      let modalDetallesData = new ModalDetalleInterprogramaData(
        this,
        idMovilidadInterprograma,
        this.registroSeleccionado.archivo.id
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleInterprograma,
        bindings,
        modalConfig
      );
    }
  }*/

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }
  // ************************** Cuantos registros quieres que se muestren **************//
  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }
  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  //Instanciamiento
  private prepareServices(): void {
    this.catalogoServices = this._catalogoServices.getMovilidadInterprograma();
    this.periodoEscolarService = this._catalogoServices.getPeriodoEscolar();
    this.archivoService = this._catalogoServices.getArchivos();
    this.estudianteMateriaService =
      this._catalogoServices.getEstudianteMateriaImpartidaService();
    this.usuarioService = this._catalogoServices.getUsuarioService();
  }

  private obtenerNivelCoordinador() {
    this.usuarioService.getEntidadUsuario(
      this.usuarioLogueado.id
    ).subscribe(
      response => {
        this.nivelEstudios = response.json().id_programa_docente.id_nivel_estudios.id;
        this.programaDocente = response.json().id_programa_docente.id;
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {

        }*/
        this.onCambiosTabla();
      }
    );
  }

  // Modal detalle interprogramas

  modalDetalle(): void {
    this.verBotones();
    this.modalDetalleInterprograma.open('lg');
  }

  cerrarModalDetalleInter() {
    this.modalDetalleInterprograma.close();
  }

  verBotones(): void {
    if (this.registroSeleccionado.estatus.id === 101 && this.registroSeleccionado.estatusDirector.id !== 101) {
      if (this.programaDocente === this.registroSeleccionado.estudiante.promocion.programaDocente.id) {
        this.mostrarBotones = true;
      }
    } else {
      if (this.registroSeleccionado.estatusDirector.id !== 101 && this.registroSeleccionado.estatusCoordinadorMovilidad.id === 101){
        if (this.programaDocente === this.registroSeleccionado.programaDocenteCursar.id) {
          this.mostrarBotones = true;
        }
      }
    }

  }

  descargarArchivo(): void {
    let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionado.archivo.id + '}';
    this.spinner.start('descargarArchivo');
    this.archivoService.generarTicket(
      jsonArchivo, this.erroresConsultas
    ).subscribe(
      data => {
        let json = data.json();
        let url =
         ConfigService.getUrlBaseAPI() +
         '/api/v1/archivovisualizacion/' +
         this.registroSeleccionado.archivo.id +
         '?ticket=' +
         json.ticket;
         window.open(url);
      },
      error => {
        this.spinner.stop('descargarArchivo');
      },
      () => {
        this.spinner.stop('descargarArchivo');
      }
    );
  }

  // Modal aceptar interprogramas

  aceptar() {
    this.inicializarFormularioAceptar();
    this.validacionActivaAceptar = false;
    this.modalDetalleInterprograma.close();
    this.modalAceptarInterprogramas.open('sm');
  }

  cerrarModalAceptarInter() {
    this.modalAceptarInterprogramas.close();
  }

  getControlErrorsAceptar(campo: string): boolean {
    if (!(<FormControl>this.aceptarInterprograma.controls[campo]).valid &&
      this.validacionActivaAceptar) {
      return true;
    }
    return false;
  }

  validarFormularioAceptar(): boolean {
    if (this.aceptarInterprograma.valid) {
      this.validacionActivaAceptar = false;
      return true;
    }
    this.validacionActivaAceptar = true;
    return false;
  }

  getControlAceptar(campo: string): FormControl {
    return (<FormControl>this.aceptarInterprograma.controls[campo]);
  }

  aceptarSolicitud(): void {
    if (this.validarFormularioAceptar()) {
      this.spinner.start('aceptarSolicitud');
      let statusCoordinadorCarrera = this.registroSeleccionado.estatus.id;
      let statusProfesor = this.registroSeleccionado.estatus.id;
      if (statusCoordinadorCarrera !== 101) {
        if (statusCoordinadorCarrera === 103)
          this.getControlAceptar('idEstatus').patchValue(103);
        this.getControlAceptar('idEstatusMovilidad').patchValue(102);
        this.getControlAceptar('comentarios').patchValue(
          this.registroSeleccionado.comentarios +
          'Coordinador de movilidad: ' + this.getControlAceptar('comentarios').value);
      } else {
        this.getControlAceptar('comentarios').patchValue(
          this.registroSeleccionado.comentarios +
          'Coordinador de carrera: ' + this.getControlAceptar('comentarios').value + '\n\n');
      }
      let jsonFormulario = JSON.stringify(this.aceptarInterprograma.value, null, 2);
      this.catalogoServices.putMovilidadInterprograma(
        this.registroSeleccionado.id,
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
        response => {},
        error => {
          console.error(error);
          this.spinner.stop('aceptarSolicitud');
        }, //console.log('Success'),
        () => {
          this.enviarCorreoAceptado();
          this.cambiarMaterias();
          this.onCambiosTabla();
          this.cerrarModalAceptarInter();
          this.spinner.stop('aceptarSolicitud');
        }
      );
    }
  }

  cambiarMaterias(): void {
    let formulario: FormGroup;
    formulario = new FormGroup({
      'idMateriaInterprograma': new FormControl(this.registroSeleccionado.materiaCursar.id),
      'interprograma': new FormControl(true)
    });
    let jsonFormulario = JSON.stringify(formulario.value, null, 2);
    this.estudianteMateriaService
      .putEstudianteMateriaImpartida(
        this.registroSeleccionado.materiaCambiar.id,
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
      response => {},
      error => {
        console.error(error);
      },
      () => {}
    );
  }

  enviarCorreoAceptado(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(
        this.registroSeleccionado.estudiante.usuario.email),
      entidad: new FormControl({movilidadInterprograma: this.registroSeleccionado.id}),
      idPlantillaCorreo: new FormControl(22),
      comentarios: new FormControl('')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._catalogoServices.getEnvioCorreoElectronicoService()
      .postCorreoElectronico(
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
      response => {},
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('Correo Enviado');
        }*/
      }
    );
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
    return null;
  }

  denegar() {
    this.inicializarFormularioDenegar();
    this.validacionActivaAceptar = false;
    this.modalDetalleInterprograma.close();

    this.modalDenegarInterprograma.open('sm');
  }

  cerrarModalDenegar() {
    this.modalDenegarInterprograma.close();
  }

  getControlErrorsRechazar(campo: string): boolean {
    if (!(<FormControl>this.rechazarInterprograma.controls[campo]).valid &&
      this.validacionActivaAceptar) {
      return true;
    }
    return false;
  }

  validarFormularioRechazar(): boolean {
    if (this.rechazarInterprograma.valid) {
      this.validacionActivaAceptar = false;
      return true;
    }
    this.validacionActivaAceptar = true;
    return false;
  }

  getControlRechazar(campo: string): FormControl {
    return (<FormControl>this.rechazarInterprograma.controls[campo]);
  }

  denegarSolicitud(): void {
    if (this.validarFormularioRechazar()) {
      this.spinner.start('rechazarMovInterprogramas');
      let statusCoordinadorCarrera =
        this.registroSeleccionado.estatus.id;
      if (statusCoordinadorCarrera !== 101) {
        if (statusCoordinadorCarrera === 103)
          this.getControlRechazar('idEstatus').patchValue(103);
        else this.getControlRechazar('idEstatus').patchValue(102);
        this.getControlRechazar('idEstatusMovilidad').patchValue(103);
        this.getControlRechazar('comentarios').patchValue(
          this.registroSeleccionado.comentarios +
          'Coordinador de movilidad: ' + this.getControlRechazar('comentarios').value);
      } else {
        this.getControlRechazar('comentarios').patchValue(
          this.registroSeleccionado.comentarios +
          'Coordinador de carrera: ' + this.getControlRechazar('comentarios').value + '\n\n');
      }
      let jsonFormulario = JSON.stringify(this.rechazarInterprograma.value, null, 2);
      this.catalogoServices
        .putMovilidadInterprograma(
          this.registroSeleccionado.id,
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
        response => {},
        error => {
          console.error(error);
          this.spinner.stop('rechazarMovInterprogramas');
        },
        () => {
          this.spinner.stop('rechazarMovInterprogramas');
          this.enviarCorreoDenegado();
          this.onCambiosTabla();
          this.cerrarModalDenegar();
        }
      );
    }
  }

  enviarCorreoDenegado(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(
        this.registroSeleccionado.estudiante.usuario.email),
      entidad: new FormControl({movilidadInterprograma: this.registroSeleccionado.id}),
      idPlantillaCorreo: new FormControl(21),
      comentarios: new FormControl('')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._catalogoServices.getEnvioCorreoElectronicoService()
      .postCorreoElectronico(
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('Correo Enviado');
        }*/
      }
    );
  }

/*  private obtenerNivelCoordinador() {
    this.usuarioService.getEntidadUsuario(
      //this.usuarioLogueado.id
    ).subscribe(
      response => {
        this.nivelEstudios = response.json().id_programa_docente.id_nivel_estudios.id;
        this.programaDocente = response.json().id_programa_docente.id;
      },
      error => {
  /!*      if (assertionsEnabled()) {
          console.error(error);
        }*!/
      },
      () => {
  /!*      if (assertionsEnabled()) {
          this.onCambiosTabla();
        }*!/
      }
    );
  }*/

//  constructor() { }

  ngOnInit() {
  }

}
