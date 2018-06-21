import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild, NgZone} from '@angular/core';
import {MovilidadCurricular} from '../../services/entidades/movilidad-curricular.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Router, ActivatedRoute} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {ErrorCatalogo} from '../../services/core/error.model';
import {errorMessages} from '../../utils/error-mesaje';
import {ConfigService} from '../../services/core/config.service';
import * as moment from 'moment';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {PlanEstudiosMateria} from '../../services/entidades/plan-estudios-materia.model';
import {TipoDocumento} from '../../services/catalogos/tipo-documento.model';

@Component({
  selector: 'app-agregar-movilidad-alumno',
  templateUrl: './agregar-movilidad-alumno.component.html',
  styleUrls: ['./agregar-movilidad-alumno.component.css']
})
export class AgregarMovilidadAlumnoComponent implements OnInit {
  @ViewChild('modalTrabajoCampos')
  modalTrabajoCampos: ModalComponent;
  @ViewChild('modalEstanciaInvestigacion')
  modalEstanciaInvestigacion: ModalComponent;
  @ViewChild('modalCurricular')
  modalCurricular: ModalComponent;
  @ViewChild('modalAnexoDocumentos')
  modalAnexoDocumentos: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  registros: Array<MovilidadCurricular> = [];
  columnas: Array<any> = [
    { titulo: 'Movilidad', nombre: '', sort: false},
    { titulo: 'Universidad o institución externa', nombre: '', sort: false},
    { titulo: 'Estatus', nombre: 'id.Estatus.valor', sort: false},
  ];
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'id.Estatus.valor' }
  };
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  // enviar: boolean = true;
  documentos: boolean = true;
  seleccion: boolean = true;
  registroSeleccionado: MovilidadCurricular;
  usuarioLogueado: UsuarioSesion;
  estudianteServive;
  entidadEstudiante: Estudiante;
  movilidadCurricularService;
  documentosMovilidadCurricularService;
  idEstudiante: number = 0;
  router: Router;

  idUsuarioObjetivo: number;
  permisoDocencia: boolean = false;

  private erroresConsulta: Array<Object> = [];
  private sub: any;

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _enviarCorreo: EnvioCorreoElectronicoService,
              private authService: AuthService,
              public catalogosServices: CatalogosServices,
              private _router: Router,
              private route: ActivatedRoute,
              private spinner: SpinnerService) {
    this.spinner.start('agregarmovilidad1');
    this.router = _router;
    this.prepareServices();
    this.sub = route.params.subscribe(params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo']; // (+) converts string 'id' to a number
    });
    // console.log('Buscando...');
/*    this.idUsuarioObjetivo = this.router.currentInstruction
      .component.params.usuarioObjetivo;*/
    let auxiliar: number;
    if (this.idUsuarioObjetivo) {
      this.permisoDocencia = true;
      auxiliar = this.idUsuarioObjetivo;
    } else {
      console.log('no hay usuarioObjetivo');
      this.usuarioLogueado = authService.getUsuarioLogueado();
      auxiliar = this.usuarioLogueado.id;
    }

    this.inicializarFormulario();
    this.inicializarFormulario2();
    this.inicializarFormuarlio3();
    this.inicializarFormulario4();
    this.recuperarUsuarioActual(auxiliar);

    this.dt = new Date();
    this.dt2 = new Date();
    this.fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
  }

  private inicializarFormulario(): void {
    this.formulario = new FormGroup({
      trabajoCampo: new FormControl('', Validators.compose([Validators.required, Validacion.parrafos])),
      lugar: new FormControl('', Validators.compose([Validators.required, Validacion.parrafos])),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl('', Validators.required),
      idEstatus: new FormControl(1220),
      idEstudiante: new FormControl(this.entidadEstudiante),
      idTipoMovilidad: new FormControl(3),
      seteador: new FormControl(''),
      auxiliar: new FormControl('', Validators.required),
      otroTipoDocumento: new FormControl (''),
      auxiliarOtro: new FormControl('', Validators.required),
    });
  }

  private inicializarFormulario2(): void {
    this.formulario2 = new FormGroup({
      estancia: new FormControl('',
        Validators.compose([Validators.required,
          Validacion.parrafos])),
      idConvenio: new FormControl(''),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl(''),
      institucionInteres: new FormControl('',
        Validators.compose([Validators.required])),
      idEstatus: new FormControl(1220),
      idEstudiante: new FormControl(this.entidadEstudiante),
      idTipoMovilidad: new FormControl(2),
      seteador: new FormControl(''),
      auxiliar: new FormControl('', Validators.required),
      otroTipoDocumento: new FormControl (''),
      auxiliarOtro: new FormControl('', Validators.required),
      nombreContacto: new FormControl('',
        Validators.compose([Validators.required,
          Validacion.parrafos])),
    });
  }

  private inicializarFormuarlio3(): void {
    this.formulario3 = new FormGroup({
      idConvenio: new FormControl(''),
      fechaInicio: new FormControl(''),
      fechaFin: new FormControl(''),
      institucionInteres: new FormControl('',
        Validators.compose([Validators.required,
          Validacion.parrafos])), // Se llama id pero es una cadena!!!
      materiaCursar: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      idPais: new FormControl('', Validators.required),
      nombreContacto: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      puestoContacto: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      idEstatus: new FormControl(1220),
      idEstudiante: new FormControl(this.entidadEstudiante),
      idTipoMovilidad: new FormControl(1),
      seteador: new FormControl(''),
      auxiliar: new FormControl('', Validators.required),
      otroTipoDocumento: new FormControl (''),
      idMateria: new FormControl('', Validators.required)
    });
  }

  private inicializarFormulario4(): void {
    this.formulario4 = new FormGroup ({
      idArchivo: new FormControl ('', Validators.required),
      idMovilidad: new FormControl (this.registroSeleccionado, Validators.required),
      auxiliar: new FormControl ('aux', Validators.required),
      otroTipoDocumento: new FormControl (''),
      idTipoDocumento: new FormControl ('', Validators.required),
    });
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  recuperarUsuarioActual(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + id + ':IGUAL');
    //// console.log('idUsuario: ' + id);
    this.estudianteServive.getListaEstudianteOpcional(
      this.erroresConsulta,
      urlParameter
    ).subscribe(
      response => {
        let estudiante;
        //// console.log(response.json().lista);
        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
          this.entidadEstudiante = new Estudiante(elemento);
          console.log(estudiante);
        });
        this.idEstudiante = estudiante.id;
        this.spinner.stop('agregarmovilidad1');
        this.getControl('idEstudiante').patchValue(this.idEstudiante);
        this.getControl2('idEstudiante').patchValue(this.idEstudiante);
        this.getControl3('idEstudiante').patchValue(this.idEstudiante);
        this.onCambiosTabla();
      }
    );

  }

  onCambiosTabla(): void {
    this.spinner.start('agregarmovilidad2');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.idEstudiante + ':IGUAL');
    urlParameter.set('limit', this.limite.toString());
    urlParameter.set('pagina', this.paginaActual.toString());
    this.movilidadCurricularService.getListaMovilidadCurricularSimple(
      this.erroresConsulta,
      urlParameter,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        // console.log(response.json());
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((movilidad) => {
          this.registros.push(new MovilidadCurricular (movilidad));
        });
        this.spinner.stop('agregarmovilidad2');
        //// console.log(this.registros);
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    // this.enviar = true;
    this.documentos = true;
    // this.enviar = true;
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
    if (this.registroSeleccionado) {
      this.habilitarDetalle(1);
    } else {
      this.seleccion = true;
      this.documentos = true;
    }
  }

  habilitarDetalle(id: number): void {
    if (id === 1) {
      this.seleccion = false;
      // this.habilitarBoton();
    } else {
      this.seleccion = true;
      // this.enviar = true;
    }
    this.habilitarBoton();
  }

  habilitarBoton(): void {
    if (!this.seleccion) {
      if (this.registroSeleccionado.estatus.id == 1218) {
        this.documentos = false;
        // this.habilitarEnvio();
      }
    } else {
      this.documentos = true;
      // this.enviar = true;
    }
  }
  redireccionarDetalle(): void {
    this.router.navigate(['movilidad','detalle-alumno', {id: this.registroSeleccionado.id}]);
  }

  prepareServices(): void {
    this.estudianteServive = this.catalogosServices.getEstudianteService();
    this.movilidadCurricularService = this.catalogosServices.getMovilidadCurricularService();
    this.documentosMovilidadCurricularService =
      this.catalogosServices.getDocumentoMovilidadCurricularService();
    this.catDocumentoService = this.catalogosServices.getTipoDocumento();
    this.documentoService = this.catalogosServices.getDocumentoMovilidadCurricularService();
    this.archivoService = this.catalogosServices.getArchivos();

    let urlParams = new URLSearchParams();
    urlParams.set('criterios', 'idAreaDocumento~6:IGUAL,id~35:IGUAL;OR');
    this.listaDocumentos = this.catDocumentoService.getSelectTipoDocumentoCriterio(
      this.erroresConsulta2, urlParams);
    this.movilidadCurricularService2 = this.catalogosServices.getMovilidadCurricularService();
    this.convenioService =
      this.catalogosServices.getConvenio();
    this.documentoService =
      this.catalogosServices
        .getDocumentoMovilidadCurricularService();
    this.catDocumentoService = this.catalogosServices.getTipoDocumento();
    this.archivoService = this.catalogosServices.getArchivos();
    this.correoService = this.catalogosServices.getEnvioCorreoElectronicoService();
    this.listaConvenios = this.convenioService.getSelectConvenio();
    urlParams.set('criterios', 'idAreaDocumento~5:IGUAL,id~35:IGUAL;OR');
    this.listaDocumentos = this.catDocumentoService.getSelectTipoDocumentoCriterio(
      this.erroresConsulta3, urlParams
    );
    this.movilidadCurricularService = this.catalogosServices.getMovilidadCurricularService();
    this.paisService = this.catalogosServices.getPais();
    this.convenioService = this.catalogosServices.getConvenio();
    this.documentoService =
      this.catalogosServices.getDocumentoMovilidadCurricularService();
    this.catDocumentoService = this.catalogosServices.getTipoDocumento();
    this.archivoService = this.catalogosServices.getArchivos();
    this.enviarCorreo = this.catalogosServices.getEnvioCorreoElectronicoService();
    this.listaPaises = this.paisService.getSelectPais();
    this.listaConvenios = this.convenioService.getSelectConvenio();
    urlParams.set('criterios', 'idAreaDocumento~4:IGUAL,id~35:IGUAL;OR');
    this.listaDocumentos = this.catDocumentoService.getSelectTipoDocumentoCriterio(
      this.erroresConsulta2, urlParams);
    this.planEstudiosMateria = this.catalogosServices.getPlanEstudiosMateria();
    this.movilidadCurricularService = this.catalogosServices.getMovilidadCurricularService();
    this.tipoDocumentoService =
      this.catalogosServices.getTipoDocumento();
    this.listaDocumentos2 = this.tipoDocumentoService.getSelectTipoDocumentoCriterio(
      this.erroresConsulta2, urlParams
    );
  }


  ngOnInit() {
  }


  /* llamar este metodo al cerrar el modal de agregar docs
   habilitarEnvio(): void {
   if (this.registroSeleccionado) {
   let urlParameter: URLSearchParams = new URLSearchParams();
   urlParameter.set('criterios', 'idMovilidad~' + this.registroSeleccionado.id + ':IGUAL');
   this.documentosMovilidadCurricularService.getListaDocumentoMovilidadCurricularOpcional(
   this.erroresConsulta,
   urlParameter
   ).subscribe(
   response => {
   let tamanio = response.json().lista.length;
   //console.log(tamanio);
   if (tamanio > 0) {
   this.enviar = false;
   }
   }
   );
   } else {
   this.enviar = true;
   }
   }*/

  ///////////////////////////////////CodigoModals///////////////////////////////////
  formulario: FormGroup;
  mensajeErrors: any = errorMessages;
  validacionActiva: boolean = false;
  uploadFile: any;
  options: Object = {
    // url: 'http://ng2-uploader.com:10050/upload'
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];

  public dt: Date;
  public dt2: Date;

  fechaConFormato;
  idArchivo: number;
  nombreArchivo: string;
  tipoArchivo: number;

  idMovilidadCurricularDelEstudiant: number;

  catalogosServices2;
  catDocumentoService;
  documentoService;
  archivoService;
  movilidadCurricularService2;

  columnas2: Array<any> = [
    { titulo: 'Documento', nombre: '', sort: false},
    { titulo: 'Fecha de actualización', nombre: '', sort: false},
  ];
  listaDocumentos: Array<ItemSelects> = [];
  registros2: Array<Registro> = [];
  registroSeleccionado2: Registro;
  acceso: boolean = true;
  fechaInvalida: boolean = false;
  otro: boolean = true;
  contador: number = 0;
  fechaMinima: Date;
  fechaMaxima: Date = new Date();
  private alertas: Array<Object> = [];
  private erroresConsulta2: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  abrirModal(){
    this.modalTrabajoCampos.open('lg');
  }

  cerrarModal() {
    this.registros2.forEach((registro) => {
      this.archivoService.deleteArchivo(
        registro.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => { }
      );
    });
    this.registros2 = [];
    this.modalTrabajoCampos.close();
  }

  cerrarModalAgregar(): void {
    this.borrarArchivosTrabajoCampo();
    this.inicializarFormulario();
    this.dt = new Date();
    this.dt2 = new Date();
    this.otro = true;
    this.tipoArchivo = undefined;
    this.validacionActiva = false;
    this.modalTrabajoCampos.close();
  }

  borrarArchivosTrabajoCampo(): void {
    this.registros2.forEach((registro) => {
      this.archivoService.deleteArchivo(
        registro.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => { }
      );
    });
    this.registros2 = [];
  }

  reiniciarFormulario(): void {
    this.inicializarFormuarlio3();
    this.registros4 = [];
    this.dt = new Date();
    this.dt2 = new Date();
    this.otro = true;
    this.tipoArchivo = undefined;
    this.validacionActiva = false;
    this.modalCurricular.close();
  }

  modalTrabajoCampo(): void {
    moment.locale('es');
    this.zone = new NgZone({ enableLongStackTrace: false});
      this.catalogosServices2 = this.catalogosServices;
      //this.prepareServices();
    this.abrirModal();
  }

  ////// picker ///

  elegirFechaInicio(): any {
    this.contador = 0;
  }
  elegirFechaFin(): any {
    this.contador = 1;
  }

  ////// picker ///
  getFechaInicio(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaInicio'])
        .setValue(fechaConFormato + ' 00:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  ////// picker ///
  getFechaFin(): string {
    if (this.dt2) {
      if ( this.contador === 0 ) {
        this.fechaMinima = this.dt;
        this.dt2 = this.dt;
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formulario.controls['fechaFin'])
          .setValue(fechaConFormato + ' 10:30 am');
        return fechaConFormato;
      } else {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formulario.controls['fechaFin'])
          .setValue(fechaConFormato + ' 00:00am');
        return fechaConFormato;
      }
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    if (this.fechaInvalida) {
      this.addErrorsMesaje(
        'La fecha de fin no es valida',
        'danger'
      );
    }
    return false;
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      // console.log('Some magic here!!!' + jsonFormulario);
      // codigo para enviar el formulario
      this.spinner.start('enviarSolicitudCampo');
      this.catalogosServices.getMovilidadCurricularService().postMovilidadCurricular(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {
          let idMovilidad = response.json().id;
          this.registros2.forEach((registro) => {
            let json =
              '{"idMovilidad":"' + idMovilidad + '"' +
              ', "idArchivo": "' + registro.idArchivo + '"' +
              ', "idTipoDocumento": "' + registro.idTipo + '"' +
              ', "otroTipoDocumento": "' + registro.otroTipo + '"' +
              ', "fechaInicio": "' + this.fechaConFormato + ' 10:30am' + '"' +
              ', "fechaFin": "' + this.fechaConFormato + ' 10:30am' + '"}';
            // console.log(json);
            this.documentoService.postDocumentoMovilidadCurricular(
              json,
              this.erroresGuardado
            ).subscribe(
              response => {
                // console.log(response.json());
              }
            );
          });
          let formularioCorreo: FormGroup;
          formularioCorreo = new FormGroup({
            destinatario: new FormControl('docencia@colsan.edu.mx'),
            asunto: new FormControl('Nueva solicitud de movilidad de trabajo de campo'),
            entidad: new FormControl({ MovilidadCurricular: idMovilidad }),
            idPlantillaCorreo: new FormControl('19')
          });
          let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
          this._enviarCorreo
            .postCorreoElectronico(
              jsonFormulario,
              this.erroresGuardado
            ).subscribe(
            response => {},
            error => {
              // console.error(error);
            }
          );
        },
        error => {
          this.spinner.stop('enviarSolicitudCampo');
        },
        () => {
          this.spinner.stop('enviarSolicitudCampo');
          this.onCambiosTabla();
          this.reiniciarModalTrabajoCampo();
        }
      );
    }
  }

  reiniciarModalTrabajoCampo(): void {
    this.inicializarFormulario();
    this.registros2 = [];
    this.dt = new Date();
    this.dt2 = new Date();
    this.otro = true;
    this.tipoArchivo = undefined;
    this.validacionActiva = false;
    this.modalTrabajoCampos.close();
  }

  editarFormularioSolicitudMovilidad(): void {
    this.getControl('auxiliar').setValue('1');
    this.getControl('auxiliarOtro').setValue('1');
    // console.log('this.formulario', this.formulario);
    if (this.validarFormulario()) {
      let formularioEdicion = JSON.stringify(this.formulario.value, null, 2);
      // console.log('formualrioEdicion', formularioEdicion);
      this.spinner.start('modaltrabajocampo1');
      this.movilidadCurricularService2.putMovilidadCurricular(
        this.idMovilidadCurricularDelEstudiant,
        formularioEdicion,
        this.erroresGuardado
      ).subscribe(
        response => {

        },
        error => {
          this.spinner.stop('modaltrabajocampo1');
        },
        () => {
          this.spinner.stop('modaltrabajocampo1');
          this.cerrarModal();
        }
      );
    }
  }

  habilitarOtro(id: string): void {
    console.log(id);
    if (id === '35-Otro') {
      (<FormControl>this.formulario.controls['auxiliarOtro']).setValue('');
      (<FormControl>this.formulario.controls['otroTipoDocumento']).setValue('');
      this.otro = false;
      // console.log('sdfsdf');
    } else {
      (<FormControl>this.formulario.controls['auxiliarOtro']).setValue('aux');
      this.otro = true;
    }
  }

  cambiarAuxiliar(): void {
    (<FormControl>this.formulario.controls['auxiliarOtro']).setValue(
      this.getControl('otroTipoDocumento').value
    );
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.idArchivo = responseJson.id;
        this.agregarRegistro();
        (<FormControl>this.formulario.controls['seteador'])
          .setValue('');
        this.otro = true;
      }
    });
  }

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  handleDropUpload(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgress = Math.floor(uploaded / (total / 100));
  }

  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
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
  }

  agregarDocumento(valor: string): void {
    let algo: Array<any> = valor.split('-');
    this.tipoArchivo = algo[0];
    this.nombreArchivo = algo[1];
  }


  eliminarRegistro(): void {
    if (this.registroSeleccionado2) {
      this.archivoService.deleteArchivo(
        this.registroSeleccionado2.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => {
          let auxiliar: Array<Registro> = [];
          for (var i = 0; i < this.registros2.length; i++) {
            if (this.registroSeleccionado2.idArchivo !== this.registros2[i].idArchivo) {
              auxiliar.push(this.registros2[i]);
            }
          }
          this.registros2 = auxiliar;
          this.registroSeleccionado2 = null;
          this.validarDocumentos();
        }
      );
    } else {
      this.addErrorsMesaje(
        'Seleccione un docuemento de la tabla ',
        'danger'
      );
    }
  }

  agregarRegistro(): void {
    console.log('registro2', this.registros2);
    for (var i = 0; i < this.registros2.length; i++) {
      if (this.tipoArchivo == this.registros2[i].idTipo) {
        this.acceso = false;
        break;
      }
    }
    console.log('tipoArchiov', this.tipoArchivo);
    // console.log('registros2[i].idTipo', this.registros2[0].idTipo);
    console.log(this.acceso);
    if (this.acceso) {
      if (this.tipoArchivo == 35)
        this.registros2.push(new Registro(this.tipoArchivo, this.idArchivo, this.nombreArchivo,
          (<FormControl>this.formulario.controls['otroTipoDocumento']).value));
      else
        this.registros2.push(new Registro(this.tipoArchivo, this.idArchivo,
          this.nombreArchivo));
      this.validarDocumentos();
      this.resetearValores();
    } else {
      this.addErrorsMesaje(
        'No puedes subir otro docuemento de tipo ' + this.nombreArchivo,
        'danger'
      );
      this.resetearValores();
      this.acceso = true;
    }

  }

  resetearValores(): void {
    this.tipoArchivo = null;
    this.idArchivo = null;
    this.nombreArchivo = null;
  }

  validarDocumentos(): void {
    if (this.registros2.length > 0) {
      (<FormControl>this.formulario.controls['auxiliar']).setValue('1');
    } else {
      (<FormControl>this.formulario.controls['auxiliar']).setValue('');
    }
  }

  rowSeleccionado2(registro): boolean {
    return (this.registroSeleccionado2 === registro);
  }

  rowSeleccion2(registro): void {
    if (this.registroSeleccionado2 !== registro) {
      this.registroSeleccionado2 = registro;
    } else {
      this.registroSeleccionado2 = null;
    }
  }

  mostrarBotones(): boolean {
    if (this.registroSeleccionado2) {
      return true;
    }else {
      return false;
    }
  }

  private obtenerDatosMovilidadCurricular(): void {
    this.spinner.start('modaltrabajocampo2');
    let movilidadCurricularEstudiante: MovilidadCurricular;
    this.movilidadCurricularService2.getEntidadMovilidadCurricular(
      this.idMovilidadCurricularDelEstudiant,
      this.erroresConsulta2
    ).subscribe(
      response => {
        movilidadCurricularEstudiante =
          new MovilidadCurricular(response.json());
      },
      error => {
        this.spinner.stop('modaltrabajocampo2');
      },
      () => {
        this.mostrarDatosSiHayMovilidad(movilidadCurricularEstudiante);
      }
    );
  }

  private mostrarDatosSiHayMovilidad(movilidadCurricularEstudiante: MovilidadCurricular) {
    if (movilidadCurricularEstudiante) {
      // console.log('movilidadCurricular', movilidadCurricularEstudiante);
      this.mostrarDatosMovilidadCurricularEstudiante(movilidadCurricularEstudiante);
    } else {
      this.spinner.stop('modaltrabajocampo2');
    }
  }

  private mostrarDatosMovilidadCurricularEstudiante(movilidad: MovilidadCurricular): void {
    if (movilidad) {
      let trabajoCampo = 'trabajoCampo';
      let fechaInicio = 'fechaInicio';
      let fechaFin = 'fechaFin';
      let lugar = 'lugar';
      let estatus = 'idEstatus';
      let idEstudiante = 'idEstudiante';
      let idTipoDeMovilidad = 'idTipoMovilidad';

      let fechaInicioMovilidad = moment(movilidad.fechaInicio);
      let fechaFinMovilidad = moment(movilidad.fechaFin);

      this.getControl(fechaInicio).setValue(movilidad.convenio.id);
      this.getControl(fechaFin).setValue(movilidad.convenio.id);
      this.getControl(trabajoCampo).setValue(movilidad.trabajoCampo);
      this.getControl(lugar).setValue(movilidad.lugar);
      this.getControl(idEstudiante).setValue(movilidad.estudiante.id);
      this.getControl(idTipoDeMovilidad).setValue(movilidad.tipoMovilidad.id);
      this.getControl(estatus).setValue(movilidad.estatus.id);

      this.dt = new Date(fechaInicioMovilidad.toJSON());
      this.dt2 = new Date(fechaFinMovilidad.toJSON());
    }

    this.spinner.stop('modaltrabajocampo2');
  }



  ///////////////////////////////////////MODAL ESTANCIA DE INVESTIGACION////////////////////////////////////
  formulario2: FormGroup;
  options2: Object = {
    // url: 'http://ng2-uploader.com:10050/upload'
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: true,
    authToken: localStorage.getItem('token')
  };
  idProgramaDocenteDelEstudiante: number;
  idDocumentoMovilidadCurricular: number;
  convenioService;
  correoService;
  listaConvenios: Array<ItemSelects> = [];
  institucion: boolean = false;
  columnas3: Array<any> = [
    { titulo: 'Documento', nombre: '', sort: false},
    { titulo: 'Fecha de actualización', nombre: '', sort: false},
  ];
  registros3: Array<Registro> = [];
  registroSeleccionado3: Registro;
  private erroresConsulta3: Array<ErrorCatalogo> = [];

  abrirModal1() {
    this.modalEstanciaInvestigacion.open('lg');
  }

  borrarArchivosInvestigacion() {
    this.registros3.forEach((registro) => {
      this.archivoService.deleteArchivo(
        registro.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => { }
      );
    });
    this.registros3 = [];
  }

  cerrarModal1() {
    this.formulario2.reset();
    this.inicializarFormulario2();
    this.borrarArchivosInvestigacion();
    this.dt = new Date();
    this.dt2 = new Date();
    this.otro = true;
    this.tipoArchivo = undefined;
    this.validacionActiva = false;
    this.modalEstanciaInvestigacion.close();
  }

  modalEstanciasInvestigacion(): void {
    moment.locale('es');
    //this.prepareServices();
    this.zone = new NgZone({ enableLongStackTrace: false});
      this.catalogosServices = this.catalogosServices;
      this.idProgramaDocenteDelEstudiante =
        this.entidadEstudiante.promocion.programaDocente.id;
      // this.prepareServices();
    this.abrirModal1();
  }


  getFechaInicio2(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario2.controls['fechaInicio'])
        .setValue(fechaConFormato + ' 00:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  ////// picker ///
  getFechaHasta(): string {
    if (this.dt2) {
      if ( this.contador === 0 ) {
        this.fechaMinima = this.dt;
        this.dt2 = this.dt;
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formulario2.controls['fechaFin'])
          .setValue(fechaConFormato  + ' 00:00am');
        return fechaConFormato;
      }else {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formulario2.controls['fechaFin'])
          .setValue(fechaConFormato + ' 10:30am');
        return fechaConFormato;
      }
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }


  validarFormulario2(): boolean {
    if (this.formulario2.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario2(): void {
    if (this.validarFormulario2()) {
      let jsonFormulario = JSON.stringify(this.formulario2.value, null, 2);
      // console.log('Some magic here!!!' + jsonFormulario);
      // codigo para enviar el formulario2
      this.spinner.start('enviarSolicitudInv');
      this.catalogosServices
        .getMovilidadCurricularService().postMovilidadCurricular(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {
          let idMovilidad = response.json().id;
          this.registros3.forEach((registro) => {
            let json =
              '{"idMovilidad":"' + idMovilidad + '"' +
              ', "idArchivo": "' + registro.idArchivo + '"' +
              ', "idTipoDocumento": "' + registro.idTipo + '"' +
              ', "otroTipoDocumento": "' + registro.otroTipo + '"' +
              ', "fechaInicio": "' + this.fechaConFormato + ' 00:00am' + '"' +
              ', "fechaFin": "' + this.fechaConFormato + ' 00:00am' + '"}';
            // console.log(json);
            this.documentoService.postDocumentoMovilidadCurricular(
              json,
              this.erroresGuardado
            ).subscribe(
              response => {
                // console.log(response.json());
              }
            );
          });
          let formularioCorreo: FormGroup;
          formularioCorreo = new FormGroup({
            destinatario: new FormControl('docencia@colsan.edu.mx'),
            asunto: new FormControl('Nueva solicitud de movilidad con carga curricular'),
            entidad: new FormControl({ MovilidadCurricular: idMovilidad }),
            idPlantillaCorreo: new FormControl('18')
          });
          let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
          // console.log(jsonFormulario);
          this.correoService
            .postCorreoElectronico(
              jsonFormulario,
              this.erroresGuardado
            ).subscribe(
            response => {},
            error => {
              console.error(error);
            },
            () => {
            }
          );
        },
        error => {
          this.spinner.stop('enviarSolicitudInv');
        },
        () => {
          this.spinner.stop('enviarSolicitudInv');
          this.onCambiosTabla();
          this.reiniciarModalEstancia();
        }
      );
    }
  }

  reiniciarModalEstancia(): void {
    this.inicializarFormulario2();
    this.registros3 = [];
    this.dt = new Date();
    this.dt2 = new Date();
    this.otro = true;
    this.tipoArchivo = undefined;
    this.validacionActiva = false;
    this.modalEstanciaInvestigacion.close();
  }

  editarFormularioSolicitudMovilidad2(): void {
    this.getControl2('auxiliar').setValue('1');
    this.getControl2('auxiliarOtro').setValue('1');
    // console.log('this.formulario2', this.formulario2);
    if (this.validarFormulario2()) {
      let formularioEdicion = JSON.stringify(this.formulario2.value, null, 2);
      // console.log('formualrioEdicion', formularioEdicion);
      this.spinner.start('modalmovilidadestanciainvestigacion1');
      this.movilidadCurricularService.putMovilidadCurricular(
        this.idMovilidadCurricularDelEstudiant,
        formularioEdicion,
        this.erroresGuardado
      ).subscribe(
        response => {

        },
        error => {
          this.spinner.stop('modalmovilidadestanciainvestigacion1');
        },
        () => {
          this.spinner.stop('modalmovilidadestanciainvestigacion1');
          this.cerrarModal();
        }
      );
    }
  }

  getControl2(campo: string): FormControl {
    return (<FormControl>this.formulario2.controls[campo]);
  }

  getControlErrors2(campo: string): boolean {
    if (!(<FormControl>this.formulario2.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }


  eliminarRegistro2(): void {
    if (this.registroSeleccionado3) {
      this.archivoService.deleteArchivo(
        this.registroSeleccionado3.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => {
          let auxiliar: Array<Registro> = [];
          for (var i = 0; i < this.registros3.length; i++) {
            if (this.registroSeleccionado3.idArchivo !== this.registros3[i].idArchivo) {
              auxiliar.push(this.registros3[i]);
            }
          }
          this.registros3 = auxiliar;
          this.registroSeleccionado3 = null;
          this.validarDocumentos2();
        }
      );
    } else {
      this.addErrorsMesaje(
        'Seleccione un docuemento de la tabla ',
        'danger'
      );
    }
  }

  habilitarOtro2(id: string): void {
    // console.log(id);
    if (id == '35-Otro') {
      (<FormControl>this.formulario2.controls['auxiliarOtro']).setValue('');
      (<FormControl>this.formulario2.controls['otroTipoDocumento']).setValue('');
      this.otro = false;
      // console.log('sdfsdf');
    } else {
      (<FormControl>this.formulario2.controls['auxiliarOtro']).setValue('aux');
      this.otro = true;
    }
  }

  cambiarAuxiliar2(): void {
    (<FormControl>this.formulario2.controls['auxiliarOtro']).setValue(
      this.getControl2('otroTipoDocumento').value
    );
  }

  agregarRegistro2(): void {
    for (var i = 0; i < this.registros3.length; i++) {
      if (this.tipoArchivo == this.registros3[i].idTipo) {
        this.acceso = false;
        break;
      }
    }
    // console.log(this.acceso);
    if (this.acceso) {
      if (this.tipoArchivo == 35)
        this.registros3.push(new Registro(this.tipoArchivo, this.idArchivo, this.nombreArchivo,
          (<FormControl>this.formulario2.controls['otroTipoDocumento']).value));
      else
        this.registros3.push(new Registro(this.tipoArchivo, this.idArchivo,
          this.nombreArchivo));
      this.validarDocumentos2();
      this.resetearValores();
    } else {
      this.addErrorsMesaje(
        'No puedes subir otro docuemento de tipo ' + this.nombreArchivo,
        'danger'
      );
      this.resetearValores();
      this.acceso = true;
    }

  }

  rowSeleccionado3(registro): boolean {
    return (this.registroSeleccionado3 === registro);
  }

  rowSeleccion3(registro): void {
    if (this.registroSeleccionado3 !== registro) {
      this.registroSeleccionado3 = registro;
    } else {
      this.registroSeleccionado3 = null;
    }
  }

  validarDocumentos2(): void {
    if (this.registros3.length > 0) {
      (<FormControl>this.formulario2.controls['auxiliar']).setValue('1');
    } else {
      (<FormControl>this.formulario2.controls['auxiliar']).setValue('');
    }
  }

  handleBasicUpload2(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.idArchivo = responseJson.id;
        this.agregarRegistro2();
        (<FormControl>this.formulario2.controls['seteador'])
          .setValue('');
        this.otro = true;
      }
    });

  }

  private obtenerDatosMovilidadCurricular2(): void {
    this.spinner.start('modalmovilidadestanciainvestigacion2');
    let movilidadCurricularEstudiante: MovilidadCurricular;
    this.movilidadCurricularService.getEntidadMovilidadCurricular(
      this.idMovilidadCurricularDelEstudiant,
      this.erroresConsulta3
    ).subscribe(
      response => {
        movilidadCurricularEstudiante =
          new MovilidadCurricular(response.json());
      },
      error => {
        this.spinner.stop('modalmovilidadestanciainvestigacion2');
      },
      () => {
        if (movilidadCurricularEstudiante) {
          // console.log('movilidadCurricular', movilidadCurricularEstudiante);
          this.mostrarDatosMovilidadCurricularEstudiante2(movilidadCurricularEstudiante);
        } else {
          this.spinner.stop('modalmovilidadestanciainvestigacion2');
        }
      }
    );
  }

  private mostrarDatosMovilidadCurricularEstudiante2(movilidad: MovilidadCurricular): void {
    if (movilidad) {
      let convenio = 'idConvenio';
      let fechaInicio = 'fechaInicio';
      let fechaFin = 'fechaFin';
      let institucion = 'institucionInteres';
      let estancia = 'estancia';
      let nombreContacto = 'nombreContacto';
      let estatus = 'idEstatus';
      let idEstudiante = 'idEstudiante';
      let idTipoDeMovilidad = 'idTipoMovilidad';
      let idDocumento = 'otroTipoDocumento';

      let fechaInicioMovilidad = moment(movilidad.fechaInicio);
      let fechaFinMovilidad = moment(movilidad.fechaFin);

      if (movilidad.convenio.id) {
        this.getControl2(convenio).setValue(movilidad.convenio.id);
      }
      this.getControl2(fechaInicio).setValue(movilidad.convenio.id);
      this.getControl2(fechaFin).setValue(movilidad.convenio.id);
      this.getControl2(institucion).setValue(movilidad.institucionInteres);
      this.getControl2(estancia).setValue(movilidad.estancia);
      this.getControl2(nombreContacto).setValue(movilidad.nombreContacto);
      this.getControl2(idEstudiante).setValue(movilidad.estudiante.id);
      this.getControl2(idTipoDeMovilidad).setValue(movilidad.tipoMovilidad.id);
      this.getControl2(estatus).setValue(movilidad.estatus.id);
      this.getControl2(idDocumento).setValue(movilidad.documentoMovilidadCurricular.id);


      this.dt = new Date(fechaInicioMovilidad.toJSON());
      this.dt2 = new Date(fechaFinMovilidad.toJSON());
    }

    this.spinner.stop('modalmovilidadestanciainvestigacion2');
  }






//////////////////////////////////////////////MODAL CURRICULAR////////////////////////////////////////
  formulario3: FormGroup;
  // validar rango
  minDate: Date = new Date();
  catalogosService;
  paisService;
  enviarCorreo;
  planEstudiosMateria;
  listaPaises: Array<ItemSelects> = [];
  listaMaterias: Array<PlanEstudiosMateria> = [];
  columnas4: Array<any> = [
    { titulo: 'Documento', nombre: '', sort: false},
    { titulo: 'Fecha de actualización', nombre: '', sort: false},
  ];
  registros4: Array<Registro> = [];
  registroSeleccionado4: Registro;

  abrirModal2() {
    this.modalCurricular.open('lg');
  }

  borrarArchivosCargaCurricualr(): void {
    this.registros4.forEach((registro) => {
      this.archivoService.deleteArchivo(
        registro.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log('Eliminado');
        }
      );
    });
    this.registros4 = [];
  }

  cerrarModal2() {
    this.borrarArchivosCargaCurricualr();
    this.formulario3.reset();
    this.inicializarFormuarlio3();
    this.dt = new Date();
    this.dt2 = new Date();
    this.otro = true;
    this.tipoArchivo = undefined;
    this.validacionActiva = false;
    this.modalCurricular.close();
  }

  modalSolicitarMovilidad(): void {

    this.zone = new NgZone({ enableLongStackTrace: false});
    // console.log(this.context);
    //this.prepareServices();
    // console.log(this.institucion);

      this.catalogosService = this.catalogosServices;
      this.idProgramaDocenteDelEstudiante =
        this.entidadEstudiante.promocion.programaDocente.id;
      // this.prepareServices();
    this.obtenerMAterias(this.idProgramaDocenteDelEstudiante);
    this.abrirModal2();
  }

  habilitarInstitucion(id: number): void {
    // console.log('convenio' + id);
    if (id == 1) { // 1 id otro
      this.institucion = true;
    } else {
      this.institucion = false;
    }
  }

  habilitarOtro3(id: string): void {
    // console.log(id);
    if (id == '35-Otro') {
      (<FormControl>this.formulario3.controls['auxiliar']).setValue('');
      this.otro = false;
      (<FormControl>this.formulario3.controls['otroTipoDocumento']).setValue('');
      // console.log('sdfsdf');
    } else {
      (<FormControl>this.formulario3.controls['auxiliar']).setValue('aux');
      this.otro = true;
    }
  }
  cambiarAuxiliar3(): void {
    (<FormControl>this.formulario3.controls['auxiliar']).setValue(
      this.getControl3('otroTipoDocumento').value
    );
  }


  validarFormulario3(): boolean {
    if (this.formulario3.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario3(): void {
    console.log('formulario3', this.formulario3);
    if (this.validarFormulario3()) {
      let jsonFormulario = JSON.stringify(this.formulario3.value, null, 2);
      // console.log('Some magic here!!!' + jsonFormulario);
      // codigo para enviar el formulario3
      this.spinner.start('enviarSolicitudCargaCurricular');
      this.catalogosServices.getMovilidadCurricularService().postMovilidadCurricular(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log(response.json());
          let idMovilidad = response.json().id;
          this.registros4.forEach((registro) => {
            let json =
              '{"idMovilidad":"' + idMovilidad + '"' +
              ', "idArchivo": "' + registro.idArchivo + '"' +
              ', "idTipoDocumento": "' + registro.idTipo + '"' +
              ', "otroTipoDocumento": "' + registro.otroTipo + '"' +
              ', "fechaInicio": "' + this.fechaConFormato + ' 10:30am' + '"' +
              ', "fechaFin": "' + this.fechaConFormato + ' 10:30am' + '"}';
            // console.log(json);
            this.documentoService.postDocumentoMovilidadCurricular(
              json,
              this.erroresGuardado
            ).subscribe(
              response => {
                // console.log(response.json());
              }
            );
          });

          let formularioCorreo: FormGroup;
          formularioCorreo = new FormGroup({
            destinatario: new FormControl('docencia@colsan.edu.mx'),
            asunto: new FormControl('Nueva solicitud de movilidad con carga curricular'),
            entidad: new FormControl({ MovilidadCurricular: idMovilidad }),
            idPlantillaCorreo: new FormControl('15')
          });
          let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
          this.enviarCorreo
            .postCorreoElectronico(
              jsonFormulario,
              this.erroresGuardado
            ).subscribe(
            response => {},
            error => {
              console.error(error);
            },
            () => {
            }
          );

        },
        error => {
          this.spinner.stop('enviarSolicitudCargaCurricular');
        },
        () => {
          this.spinner.stop('enviarSolicitudCargaCurricular');
          this.reiniciarFormulario();
          this.onCambiosTabla();
        }
      );
    }
  }

  editarFormularioSolicitudMovilidad3(): void {
    this.getControl3('auxiliar').setValue('1');
    if (this.validarFormulario3()) {
      let formularioEdicion = JSON.stringify(this.formulario3.value, null, 2);
      // console.log('formualrioEdicion', formularioEdicion);
      // console.log('this.formulario3', this.formulario3);
      this.spinner.start('modalsolicitarmovildiad1');
      this.movilidadCurricularService.putMovilidadCurricular(
        this.idMovilidadCurricularDelEstudiant,
        formularioEdicion,
        this.erroresGuardado
      ).subscribe(
        response => {

        },
        error => {
          this.spinner.stop('modalsolicitarmovildiad1');
        },
        () => {
          this.spinner.stop('modalsolicitarmovildiad1');
          this.cerrarModal();
        }
      );
    }
  }

  eliminarRegistro3(): void {
    if (this.registroSeleccionado4) {
      this.archivoService.deleteArchivo(
        this.registroSeleccionado4.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => {
          let auxiliar: Array<Registro> = [];
          for (var i = 0; i < this.registros4.length; i++) {
            if (this.registroSeleccionado4.idArchivo !== this.registros4[i].idArchivo) {
              auxiliar.push(this.registros4[i]);
            }
          }
          this.registros4 = auxiliar;
          this.registroSeleccionado4 = null;
          this.validarDocumentos3();
        }
      );
    } else {
      this.addErrorsMesaje(
        'Seleccione un docuemento de la tabla ',
        'danger'
      );
    }
  }

  getControl3(campo: string): FormControl {
    return (<FormControl>this.formulario3.controls[campo]);
  }

  getControlErrors3(campo: string): boolean {
    if (!(<FormControl>this.formulario3.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  handleBasicUpload3(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.idArchivo = responseJson.id;
        this.agregarRegistro3();
        (<FormControl>this.formulario3.controls['seteador'])
          .setValue('');
        this.otro = true;
      }
    });
  }

  agregarRegistro3(): void {
    for (var i = 0; i < this.registros4.length; i++) {
      if (this.tipoArchivo == this.registros4[i].idTipo) {
        this.acceso = false;
        break;
      }
    }
    //console.log(this.acceso);
    if (this.acceso) {
      if (this.tipoArchivo == 35)
        this.registros4.push(new Registro(this.tipoArchivo, this.idArchivo, this.nombreArchivo,
          (<FormControl>this.formulario3.controls['otroTipoDocumento']).value));
      else
        this.registros4.push(new Registro(this.tipoArchivo, this.idArchivo, this.nombreArchivo));
      this.validarDocumentos3();
      this.resetearValores();
    } else {
      this.addErrorsMesaje(
        'No puedes subir otro docuemento de tipo ' + this.nombreArchivo,
        'danger'
      );
      this.resetearValores();
      this.acceso = true;
    }

  }

  rowSeleccionado4(registro): boolean {
    return (this.registroSeleccionado4 === registro);
  }

  rowSeleccion4(registro): void {
    if (this.registroSeleccionado4 !== registro) {
      this.registroSeleccionado4 = registro;
    } else {
      this.registroSeleccionado4 = null;
    }
  }

  validarDocumentos3(): void {
    if (this.registros4.length > 0) {
      (<FormControl>this.formulario3.controls['auxiliar']).setValue('1');
    } else {
      (<FormControl>this.formulario3.controls['auxiliar']).setValue('');
    }
  }
  mostrarBotones2(): boolean {
    if (this.registroSeleccionado4) {
      return true;
    }else {
      return false;
    }
  }
  obtenerMAterias(idProgramaDocenteDelEstudiante): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idPlanEstudios.idProgramaDocente.id~'
      + idProgramaDocenteDelEstudiante + ':IGUAL');
    this.planEstudiosMateria.getListaPlanMateria(
      this.erroresConsulta2,
      urlSearch
    ).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.listaMaterias.push(new PlanEstudiosMateria(item));
      });
      // console.log(response);
    });
  }
  ////// picker ///
  getFechaInicio3(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario3.controls['fechaInicio'])
        .setValue(fechaConFormato + ' 00:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  ////// picker ///
  getFechaFin3(): string {
    if (this.dt2) {
      if ( this.contador === 0 ) {
        this.fechaMinima = this.dt;
        this.dt2 = this.dt;
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formulario3.controls['fechaFin'])
          .setValue(fechaConFormato  + ' 00:00am');
        return fechaConFormato;
      }else {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formulario3.controls['fechaFin'])
          .setValue(fechaConFormato + ' 10:30am');
        return fechaConFormato;
      }
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  private obtenerDatosMovilidadCurricular3(): void {
    this.spinner.start('modalsolicitarmovildiad2');
    let movilidadCurricularEstudiante: MovilidadCurricular;
    this.movilidadCurricularService.getEntidadMovilidadCurricular(
      this.idMovilidadCurricularDelEstudiant,
      this.erroresConsulta2
    ).subscribe(
      response => {
        movilidadCurricularEstudiante =
          new MovilidadCurricular(response.json());
      },
      error => {
        this.spinner.stop('modalsolicitarmovildiad2');
      },
      () => {
        if (movilidadCurricularEstudiante) {
          // console.log('movilidadCurricular', movilidadCurricularEstudiante);
          this.mostrarDatosMovilidadCurricularEstudiante3(movilidadCurricularEstudiante);
        } else {
          this.spinner.stop('modalsolicitarmovildiad2');
        }
      }
    );
  }

  private mostrarDatosMovilidadCurricularEstudiante3(movilidad: MovilidadCurricular): void {
    if (movilidad) {
      let convenio = 'idConvenio';
      let fechaInicio = 'fechaInicio';
      let fechaFin = 'fechaFin';
      let institucion = 'institucionInteres';
      let materia = 'materiaCursar';
      let pais = 'idPais';
      let nombreContacto = 'nombreContacto';
      let puestoDelContacto = 'puestoContacto';
      let estatus = 'idEstatus';
      let idEstudiante = 'idEstudiante';
      let idTipoDeMovilidad = 'idTipoMovilidad';
      let idMateria = 'idMateria';
      let idDocumento = 'otroTipoDocumento';

      let fechaInicioMovilidad = moment(movilidad.fechaInicio);
      let fechaFinMovilidad = moment(movilidad.fechaFin);

      this.getControl3(convenio).setValue(movilidad.convenio.id);
      this.getControl3(fechaInicio).setValue(movilidad.convenio.id);
      this.getControl3(fechaFin).setValue(movilidad.convenio.id);
      this.getControl3(institucion).setValue(movilidad.institucionInteres);
      this.getControl3(materia).setValue(movilidad.materiaCursar);
      this.getControl3(pais).setValue(movilidad.pais.id);
      this.getControl3(nombreContacto).setValue(movilidad.nombreContacto);
      this.getControl3(puestoDelContacto).setValue(movilidad.puestoContacto);
      this.getControl3(idEstudiante).setValue(movilidad.estudiante.id);
      this.getControl3(idTipoDeMovilidad).setValue(movilidad.tipoMovilidad.id);
      this.getControl3(idMateria).setValue(movilidad.materia.id);
      this.getControl3(estatus).setValue(movilidad.estatus.id);
      this.getControl3(idDocumento).setValue(movilidad.documentoMovilidadCurricular.id);


      this.dt = new Date(fechaInicioMovilidad.toJSON());
      this.dt2 = new Date(fechaFinMovilidad.toJSON());
    }

    this.spinner.stop('modalsolicitarmovildiad2');
  }

  private editarDocumentoMovilidadCurricular() {
    this.registros4.forEach((registro) => {
      let json =
        '{"idMovilidad":"' + this.idMovilidadCurricularDelEstudiant + '"' +
        ', "idArchivo": "' + registro.idArchivo + '"' +
        ', "idTipoDocumento": "' + registro.idTipo + '"' +
        ', "otroTipoDocumento": "' + registro.otroTipo + '"' +
        ', "fechaInicio": "' + this.fechaConFormato + ' 10:30am' + '"' +
        ', "fechaFin": "' + this.fechaConFormato + ' 10:30am' + '"}';
      // console.log(json);
      this.documentoService.postDocumentoMovilidadCurricular(
        json,
        this.erroresGuardado
      ).subscribe(
        response => {
          console.log(response.json().id);
          this.idDocumentoMovilidadCurricular = response.json().id;
          console.log('idDocumento', this.idDocumentoMovilidadCurricular);
        }
      );
    });
  }



  ///////////////////////////////////MODAL ANEXO DE DOCUMENTOS///////////////////////////////////////////
  formulario4: FormGroup;
  tipoDocumentoService;
  archivoNombre: string;
  listaDocumentos2: Array<TipoDocumento> = [];
  idAreaDocumento: number;

  abrirModal3() {
    this.modalAnexoDocumentos.open('lg');
  }

  cerrarModal3() {
    this.inicializarFormulario4();
    this.tipoArchivo = undefined;
    this.otro = true;
    this.validacionActiva = false;
    this.archivoNombre = undefined;
    this.modalAnexoDocumentos.close();
  }

  modalImportarDocumentos(): void {
    this.zone = new NgZone({ enableLongStackTrace: false});
    switch (this.registroSeleccionado.id) {
      case 1:
        this.idAreaDocumento = 4;
        break;
      case 2:
        this.idAreaDocumento = 5;
        break;
      case 3:
        this.idAreaDocumento = 6;
        break;
    }
    // this.prepareServices();
    this.getControl4('idMovilidad').patchValue(this.registroSeleccionado.id);
    this.abrirModal3();
  }
  validarFormulario4(): boolean {
    if (this.formulario4.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl4(campo: string): FormControl {
    return (<FormControl>this.formulario4.controls[campo]);
  }

  habilitarOtro4(id: number): void {
    if (id == 35) {
      (<FormControl>this.formulario4.controls['auxiliar']).setValue('');
      this.otro = false;
    } else {
      (<FormControl>this.formulario4.controls['auxiliar']).setValue('aux');
      this.otro = true;
    }
  }


  handleBasicUpload4(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.archivoNombre = responseJson.originalName;
        (<FormControl>this.formulario4.controls['idArchivo'])
          .setValue(responseJson.id);
        // console.log(responseJson.id);
      }
    });
  }

  cambiarAuxiliar4(): void {
    (<FormControl>this.formulario4.controls['auxiliar']).setValue(
      this.getControl4('otroTipoDocumento').value
    );
  }

  private getControlErrors4(campo: string): boolean {
    if (!(<FormControl>this.formulario4.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private enviarFormulario4(): void {
    let jsonFormulario = JSON.stringify(this.formulario4.value, null, 2);
    if (this.validarFormulario4()) {
      this.spinner.start('guardarDocumento');
      this.catalogosServices.getDocumentoMovilidadCurricularService().postDocumentoMovilidadCurricular(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {},
        error => {
          this.spinner.stop('guardarDocumento');
        },
        () => {
          this.spinner.stop('guardarDocumento');
          this.onCambiosTabla();
          this.cerrarModal3();
        }
      );
    }
  }

  handleDropUpload4(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgress = Math.floor(uploaded / (total / 100));
  }

}

export class Registro {
  idTipo: number;
  idArchivo: number;
  nombre: string;
  otroTipo: string;
  constructor(tipo: number, archivo: number, nombre: string, otro: string = null) {
    this.idTipo = tipo;
    this.idArchivo = archivo;
    this.nombre = nombre;
    this.otroTipo = otro;
  }
}
