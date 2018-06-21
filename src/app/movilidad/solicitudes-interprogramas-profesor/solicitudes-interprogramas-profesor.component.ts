import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {MovilidadCurricular} from "../../services/entidades/movilidad-curricular.model";
import {Router} from "@angular/router";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {MovilidadInterprograma} from "../../services/entidades/movilidad-interprograma.model";
import {AuthService} from "../../auth/auth.service";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {ConfigService} from "../../services/core/config.service";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'app-solicitudes-interprogramas-profesor',
  templateUrl: './solicitudes-interprogramas-profesor.component.html',
  styleUrls: ['./solicitudes-interprogramas-profesor.component.css']
})
export class SolicitudesInterprogramasProfesorComponent implements OnInit {

  @ViewChild('detalleInterprogramaProf')
  detalleInterprogramaProf: ModalComponent;
  @ViewChild('aceptarMovInter')
  aceptarMovInterprogramas: ModalComponent;
  @ViewChild('rechazarMovInter')
  rechazarMovInterprogramas: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //variable para service
  catalogoServices;
  periodoEscolarService;
  tutorService;
  //variables para la tabla y paginación
  registroSeleccionado: MovilidadInterprograma;
  usuarioLogueado: UsuarioSesion;
  nivelEstudios: number;
  idTutor: number;
  public registros: Array<MovilidadInterprograma> = [];
  public periodos: Array<ItemSelects> = [];
  columnas: Array<any> = [
    { titulo: 'Matrícula*', nombre: 'idEstudiante'},
    { titulo: 'Estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc' },
    { titulo: 'Materia base', nombre: 'idMateriaCambiar'},
    { titulo: 'Materia de cambio', nombre: 'idMateriaCursar'},
    { titulo: 'Estatus ', nombre: 'idEstatus', sort: 'asc'}
  ];
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,'
      + 'idEstudiante.idDatosPersonales.primerApellido,'
      + 'idEstudiante.idDatosPersonales.segundoApellido,'
      + 'idEstudiante.idMatricula.matriculaCompleta'
    }
  };
  mostrarBotonDetalle: boolean = false;

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<ErrorCatalogo> = [];

  //Se declara constructor de la clase
  constructor(//private modal: Modal,
              private injector: Injector,
              private _catalogoServices: CatalogosServices,
              public spinner: SpinnerService,
              authService: AuthService,
              private _archivoService: ArchivoService) {
    this.usuarioLogueado = authService.getUsuarioLogueado(); //Seguridad.getUsuarioLogueado();
    this.prepareServices();
    this.obtenerPeriodosEscolares();
    this.onCambiosTabla();
    this.inicializarFormularioAceptar();
    this.inicializarFormularioRechazar();
  }

  onCambiosTabla() {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    criterios = this.criteriosCabezera;
    urlSearch.set('criterios', criterios);

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = this.criteriosCabezera ? criterios + ';ANDGROUPAND' : criterios;
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlSearch.set('criterios', criterios);
    }
    criterios = criterios ? criterios + ',idEstudiante.idTutor.idProfesor.idUsuario.id~' +
      this.usuarioLogueado.id + ':IGUAL;AND' : criterios + 'idEstudiante.idTutor.idProfesor.idUsuario.id~' +
    this.usuarioLogueado.id + ':IGUAL;AND';
    urlSearch.set('criterios', criterios);

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
    console.log(urlSearch);

    this.spinner.start("interprogramasprofesor1");
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
        this.spinner.stop("interprogramasprofesor1");
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        console.log(this.registros);
        this.spinner.stop("interprogramasprofesor1");
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
        'idMateriaCambiar.idMateriaImpartida.idPeriodoEscolar.id~'
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
      let modalDetallesData = new ModalDetalleInterprogramaProfesorData(
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
        <any>ModalDetalleInterprogramaProfesor,
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
    this.tutorService = this._catalogoServices.getTutor();
  }
//  constructor() { }

  ngOnInit() {
  }

  //modal detalle interprograma profesor

  //variabbles de modal detalle
  mostrarBotonesDetalle: boolean = false;

  //variables modal aceptar
  aceptarInterprograma: FormGroup;
  validacionActiva: boolean = false;

  //variables modal rechazar
  rechazarInterprograma: FormGroup;

  modalDetalle() {
    this.mostrarBotonesDetalle = false;
    if (this.registroSeleccionado.estatusDirector.id === 101) {
      this.mostrarBotonesDetalle = true;
    }
    this.detalleInterprogramaProf.open('lg');

  }

  cerrarDetalleInter() {
    this.mostrarBotonesDetalle = false;
    this.detalleInterprogramaProf.close();
  }

  /*aceptar(): void {
    this.dialog.close();
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    if (this.entidadMovilidadInterprograma) {
      let idMovilidadInterprograma = this.entidadMovilidadInterprograma.id;
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: new ModalAceptarInterprogramaProfesorData(
          this.context.componenteLista,
          idMovilidadInterprograma,
          this.entidadMovilidadInterprograma.materiaCambiar.id,
          this.entidadMovilidadInterprograma.materiaCursar.id
        ) }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalAceptarInterprogramaProfesor,
        bindings,
        modalConfig
      );
    }
  }

  denegar(): void {
    this.dialog.close();
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    if (this.entidadMovilidadInterprograma) {
      let idMovilidadInterprograma = this.entidadMovilidadInterprograma.id;
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: new ModalDenegarInterprogramaProfesorData(this.context.componenteLista,idMovilidadInterprograma) }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDenegarInterprogramaProfesor,
        bindings,
        modalConfig
      );
    }
  }*/

  descargarArchivo(): void {
    let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionado.archivo.id + '}';
    this.spinner.start('descargarArchivo');
    this._archivoService.generarTicket(jsonArchivo, this.erroresConsultas)
      .subscribe(
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

  aceptar() {
    this.detalleInterprogramaProf.close();
    this.validacionActiva = false;
    this.inicializarFormularioAceptar();
    this.aceptarMovInterprogramas.open('sm');
  }

  inicializarFormularioAceptar() {
    this.aceptarInterprograma = new FormGroup({
      comentarios: new FormControl('', Validators.required),
      idEstatusDirector: new FormControl(102)
    });
  }

  getControlErrorsAceptar(campo: string): boolean {
    if (!(<FormControl>this.aceptarInterprograma.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormularioAceptar(): boolean {
    if (this.aceptarInterprograma.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlAceptar(campo: string): FormControl {
    return (<FormControl>this.aceptarInterprograma.controls[campo]);
  }

  errorMessage(control: FormControl): string {
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

  aceptarSolicitud(): void {
    if (this.validarFormularioAceptar()) {
      this.spinner.start('actualizarAceptarMovilidad');
      this.getControlAceptar('comentarios').patchValue('\nDirector de tesis: ' +
        this.getControlAceptar('comentarios').value + '\n\n'
      );
      let jsonFormulario = JSON.stringify(this.aceptarInterprograma.value, null, 2);
      this.catalogoServices.putMovilidadInterprograma(
        this.registroSeleccionado.id,
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
        response => {

        },
        error => {
          console.error(error);
          this.spinner.stop('actualizarAceptarMovilidad');
        },
        () => {
          this.spinner.stop('actualizarAceptarMovilidad');
          this.enviarCorreoAceptacionInterprograma();
          this.onCambiosTabla();
          this.cerrarModalAceptar();
        }
      );
    }
  }

  enviarCorreoAceptacionInterprograma(): void {
    ////console.log('Idddd ' + this.usuarioLogueado.email);
    let formularioCorreo = new FormGroup({
      destinatario: new FormControl(
        this.registroSeleccionado.estudiante.usuario.email),
      entidad: new FormControl({movilidadInterprograma: this.registroSeleccionado.id}),
      idPlantillaCorreo: new FormControl(22),
      comentarios: new FormControl('')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._catalogoServices.getEnvioCorreoElectronicoService().postCorreoElectronico(
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

  cerrarModalAceptar() {
    this.aceptarMovInterprogramas.close();
  }

  denegar() {
    this.detalleInterprogramaProf.close();
    this.validacionActiva = false;
    this.inicializarFormularioRechazar();
    this.rechazarMovInterprogramas.open('sm');
  }

  inicializarFormularioRechazar() {
    this.rechazarInterprograma = new FormGroup({
      comentarios: new FormControl('', Validators.required),
      idEstatusDirector: new FormControl('103')
    });
  }

  cerrarModalRechazar() {
    this.rechazarMovInterprogramas.close();
  }

  getControlErrorsRechazar(campo: string): boolean {
    if (!(<FormControl>this.rechazarInterprograma.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormularioRechazar(): boolean {
    if (this.rechazarInterprograma.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControlRechazar(campo: string): FormControl {
    return (<FormControl>this.rechazarInterprograma.controls[campo]);
  }

  denegarSolicitud(): void {
    if (this.validarFormularioRechazar()) {
      this.spinner.start('denegarSolicitudMovInter');
      this.getControlRechazar('comentarios').patchValue('\nDirector de tesis: ' +
        this.getControlRechazar('comentarios').value + '\n\n'
      );
      let jsonFormulario = JSON.stringify(this.rechazarInterprograma.value, null, 2);

      this.catalogoServices
        .putMovilidadInterprograma(
          this.registroSeleccionado.id,
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
        response => {}, //console.log('Success'),
        error => {
          console.error(error);
          this.spinner.stop('denegarSolicitudMovInter');
        }, //console.log('Success'),
        () => {
          this.spinner.stop('denegarSolicitudMovInter');
          this.enviarCorreoRechazoInterprograma();
          this.onCambiosTabla();
          this.cerrarModalRechazar();
        }
      );
    }
  }

  enviarCorreoRechazoInterprograma(): void {
    ////console.log('Idddd ' + this.usuarioLogueado.email);
    // Se envia correo de reclaza al estudiante al cual se esta evaluando
    let formularioCorreo = new FormGroup({
      destinatario: new FormControl(
        this.registroSeleccionado.estudiante.usuario.email),
      entidad: new FormControl({movilidadInterprograma: this.registroSeleccionado.id}),
      idPlantillaCorreo: new FormControl(21),
      comentarios: new FormControl('')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._catalogoServices.getEnvioCorreoElectronicoService().postCorreoElectronico(
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {},
      error => {},
      () => {}
    );
  }

}
