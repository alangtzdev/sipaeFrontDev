import {Component, OnInit, Injector, ViewChild, NgZone} from '@angular/core';
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {MovilidadInterprograma} from "../../services/entidades/movilidad-interprograma.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {AuthService} from "../../auth/auth.service";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {errorMessages} from "../../utils/error-mesaje";
import {ConfigService} from "../../services/core/config.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ItemSelects} from "../../services/core/item-select.model";
import * as moment from "moment";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {NgUploaderOptions} from "ngx-uploader";

@Component({
  selector: 'app-movilidad-interprogramas',
  templateUrl: './movilidad-interprogramas.component.html',
  styleUrls: ['./movilidad-interprogramas.component.css']
})
export class MovilidadInterprogramasComponent {
  catalogoServices;
  estudianteService;
  correoService;
  mostrarBotonSolicitud: boolean = false;

  usuarioLogueado: UsuarioSesion;
  estudiante: Estudiante;
  // ************************** TABLAS**************************************//
  registroSeleccionado: MovilidadInterprograma;
  public registros: Array<MovilidadInterprograma> = [];
  columnas: Array<any> = [
    { titulo: 'Materia*', nombre: 'idMateriaCursar'},
    { titulo: 'Programa educativo', nombre: 'idProgramaDocenteCursar'},
    { titulo: 'Estatus con director', nombre: 'idEstatusDirector'},
    { titulo: 'Estatus Coordinador de carrera', nombre: 'idEstatusMovilidad'},
    { titulo: 'Estatus Coordinador de movilidad*', nombre: 'idEstatus'}
  ];
  paginacion: PaginacionInfo;
  limite: number = 10;
  paginaActual: number = 1;
  maxSizePags: number = 5;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idMateriaCursar.idMateria.descripcion,' +
    'idEstatus.valor,idEstatusDirector.valor' }
  };

  idUsuarioObjetivo: number;
  permisoDocencia: boolean = false;
  sub: any;

  // Se declaran variables para propiedades del formulario
  formulario: FormGroup;
  oculto: boolean = false;
  validacionActiva: boolean = false;
  mensajeErrors: any = {
    'required': 'Este campo es requerido',
    'correo': 'Escriba un correo válido'
  };

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CONSTRUCTOR                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  constructor(//routeParams: RouteParams,
              private injector: Injector,
              private _router: Router,
              route: ActivatedRoute,
              private _catalogoServices: CatalogosServices,
              public spinner: SpinnerService,
              private authService: AuthService) {
    this.prepareServices();
    let tipoLista;
    this.sub = route.params.subscribe(params => {
      tipoLista = +params['usuarioObjetivo'];
      console.log('UO-',tipoLista);
      this.idUsuarioObjetivo = tipoLista;
      if (tipoLista) {
        if (tipoLista === 'coordinacion') {
          this.oculto = true;
        }
      }
    });
    //this.idUsuarioObjetivo = _router.parent.currentInstruction.component.params.usuarioObjetivo;
    let auxiliar: number;
    if (this.authService.hasRol('DOCENCIA')) {
      console.log('SI Docencia');
      this.permisoDocencia = true;
      auxiliar = this.idUsuarioObjetivo;
    } else {
      console.log('NO Docencia');
      this.usuarioLogueado = this.authService.getUsuarioLogueado();
      auxiliar = this.usuarioLogueado.id;
    }
    this.obtenerEstudiante(auxiliar);
    this.formulario = new FormGroup({programaDocente: new FormControl('',
        Validators.required), promocion: new FormControl('', Validators.required),
      nacionalidad: new FormControl('', Validators.required)});

    this.formularioRegistro = new FormGroup({
      idMateriaCambiar: new FormControl(''),
      idProgramaDocenteCursar: new FormControl(''),
      idMateriaCursar: new FormControl(''),
      idEstudiante: new FormControl(''),
      idEstatus: new FormControl(''),
      idEstatusDirector: new FormControl(''),
      idEstatusMovilidad: new FormControl(''),
      upload: new FormControl('')
    });
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                             SE EJECUTA AUTOMATICAMENTE                                    //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  obtenerEstudiante(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.estudianteService.getListaEstudianteOpcional(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          if (response.json().lista.length  > 0)
            this.estudiante = new Estudiante(response.json().lista[0]);
          this.onCambiosTabla();
          if (this.estudiante.tutor && this.estudiante.tutor.tipo &&
              this.estudiante.tutor.tipo.id === 2)
            this.mostrarBotonSolicitud = true;
        }
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                OBTENER LISTA TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    try {
      criterios = 'idEstudiante.id~' + this.estudiante.id + ':IGUAL';
    } catch (ex) {
      criterios = 'idEstudiante.id~0:IGUAL';
    }
    urlSearch.set('criterios', criterios);

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = criterios + ';ANDGROUPAND';
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
    this.spinner.start('tabla');
    this.catalogoServices.getListaMovilidadInterprograma(
        this.erroresConsultas,
        urlSearch,
        this.configuracion.paginacion
    ).subscribe(
        response => {
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
          paginacionInfoJson.lista.forEach((item) => {
            this.registros.push(new MovilidadInterprograma(item));
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

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                COMPORTAMIENTO TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** ordenamiento de registros**************************************//
  sortChanged(columna): void {
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
  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  // ************************** para ponrle como una clase atributo seleccionar **************//
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  // ************************** Cuantos registros quieres que se muestren **************//
  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }
  // ************************** El usuario selecciona el registro **************//
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                INSTANCIAMIENTOS                                           //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  private prepareServices(): void {
    this.catalogoServices = this._catalogoServices.getMovilidadInterprograma();
    this.estudianteService = this._catalogoServices.getEstudiante();
    this.correoService = this._catalogoServices.getEnvioCorreoElectronicoService();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CAMBIAR VISTAS                                             //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** Modal para nueva solicitud de interprograma **************//

  @ViewChild('modalRegistro')
  modalRegistro: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //========================================MODAL REGISTRO==========================================//
  //VARIABLES DE VISTA
  formularioRegistro: FormGroup;

  //VARIABLES PARA VALIDACION DE CAMPOS
  mensajeErrorsRegis: any = errorMessages;
  validacionActivaRegis: boolean = false;

  //VARIABLES PARA DROPZONE
  uploadFile: any;
  option: NgUploaderOptions;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  idArchivo: number;
  existeArchivo: boolean = false;
  fechaModificacion;
  descripcionDocumento: string = '';
  correoCoordinador: string = '';
  correoCoordinadorReceptor: string = '';
  correoDirectorTesis: string = '';

  //VARIABLE PARA SERVICE
  catalogoServicesRegis;
  _archivosService;
  usuarioRolService;
  estudianteServiceRegis;

  //VARIABLES PARA ERRORES DE BD
  erroresConsultasRegis: Array<ErrorCatalogo> = [];
  erroresGuardadoRegis: Array<ErrorCatalogo> = [];

  //VARIABLES PARA REGLA DE NEGOCIO
  opcionSelectMateria: Array<ItemSelects> = [];
  opcionSelectProgramaDocente: Array<ItemSelects> = [];
  opcionSelectMateriaXProgramaDocente: Array<ItemSelects> = [];

  private constructorRegistro(): void {
    //console.log('REGISTRO');
    this.prepareServicesRegistro();
    this.inicializarOpcionesNgZone();
    moment.locale('es');
    this.obtenerCorreoCoordinador(
        this.estudiante.promocion.programaDocente.id,
        'CoordinadorCarrera');
    this.obtenerCorreoDirector();
    this.zone = new NgZone({ enableLongStackTrace: false});
    this._archivosService = this._catalogoServices.getArchivos();
    this.formularioRegistro = new FormGroup({
      idMateriaCambiar: new FormControl('', Validators.required),
      idProgramaDocenteCursar: new FormControl('', Validators.required),
      idMateriaCursar: new FormControl('', Validators.required),
      idEstudiante: new FormControl(this.estudiante.id),
      idEstatus: new FormControl(101),
      idEstatusDirector: new FormControl(101),
      idEstatusMovilidad: new FormControl(101),
      upload: new FormControl('', Validators.required)
    });
    this.obtenerMateriaOptativa();
    this.obtenerProgramasDocentes();
    this.abrirModalRegistro();
  }

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['pdf','PDF'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }
  //INSTANCÍA SERVICE
  prepareServicesRegistro(): void {
    this.catalogoServicesRegis = this._catalogoServices;
    this.usuarioRolService = this.catalogoServicesRegis.getUsuarioRolService();
    this.estudianteServiceRegis = this.catalogoServicesRegis.getEstudianteService();

  }

  //METODOS PARA REGLA DE NEGOCIO
  obtenerMateriaOptativa(): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    let idEstudiante = this.estudiante.id;
    let idPeriodoEscolar = this.estudiante.periodoActual.id;
    paramUrl.set('criterios', 'idMateriaImpartida.idCursoOptativo.idTipo.id~5:IGUAL,' +
        'idEstudiante.id~' + idEstudiante + ':IGUAL,idMateriaImpartida.idPeriodoEscolar.id~' +
        idPeriodoEscolar + ':IGUAL');
    //console.log('para',paramUrl);
    this._catalogoServices.getEstudianteMateriaImpartidaService()
        .getListaEstudianteMateriaImpartida(
            this.erroresConsultasRegis,
            paramUrl
        ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          this.opcionSelectMateria = [];
          paginacionInfoJson.lista.forEach((item) => {
            //console.log('item*',item);
            this.opcionSelectMateria.push(
                new ItemSelects(item.id,
                    item.id_materia_impartida.id_curso_optativo.descripcion
                )
            );
          });
        },
        error => {
          console.log('Error al obtener Materia optativa');
        },
        () => {
          console.log('Se obtuvo Materia optativa');
        }
    );
  }

  obtenerProgramasDocentes(): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    let idNivelEstudios = this.estudiante.
        promocion.programaDocente.nivelEstudios.id;
    paramUrl.set('criterios', 'idNivelEstudios.id~' + idNivelEstudios + ':IGUAL');
    this._catalogoServices.getCatalogoProgramaDocente().getListaProgramaDocente(
        this.erroresConsultasRegis,
        paramUrl
    ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          this.opcionSelectProgramaDocente = [];
          paginacionInfoJson.lista.forEach((item) => {
            this.opcionSelectProgramaDocente.push(
                new ItemSelects(item.id, item.descripcion)
            );
          });
        },
        error => {
          console.log('Error al obtener Programas Docentes');
        },
        () => {
          console.log('Se obtuvieron Programas Docentes');
        }
    );
  }

  obtenerMateriasXProgramaDocente(idProgramaDocente: number): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    let criterios = 'idMateria.idProgramaDocente.id~' + idProgramaDocente + ':IGUAL,' +
        'idPeriodoEscolar.id~' +
        this.estudiante.periodoActual.id + ':IGUAL';
    paramUrl.set('criterios', criterios);
    //console.log('cri',paramUrl);
    this._catalogoServices.getMateriaImpartidaService().getListaMateriaImpartida(
        this.erroresConsultasRegis,
        paramUrl
    ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          this.opcionSelectMateriaXProgramaDocente = [];
          paginacionInfoJson.lista.forEach((item) => {
            this.opcionSelectMateriaXProgramaDocente.push(
                new ItemSelects(item.id, item.id_materia.descripcion)
            );
          });
        },
        error => {
          console.log('Error al obtener Materias');
        },
        () => {
          console.log('Se obtuvieron Materias');
        }
    );
  }


  //REALIZAR VALIDACION DE CAMPOS
  validarFormulario(): boolean {
    if (this.formularioRegistro.valid) {
      this.validacionActivaRegis = false;
      return true;
    }
    this.validacionActivaRegis = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioRegistro.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioRegistro.controls[campo]).valid && this.validacionActivaRegis) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrorsRegis[errorType];
        }
      }
    }
    return resultado;
  }


  //DROPZONE
  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
    });
    this.existeArchivo = true;
    this.fechaModificacion = moment(new Date()).format('DD/MM/YYYY');
    this.descripcionDocumento = 'Carta de motivos';
    (<FormControl>this.formularioRegistro.controls['upload']).disable();
    //this.formularioRegistro.exclude('upload');
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

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }


  //GUARDADO DE SOLICITUD PARA INTERPROGRAMA
  enviarFormulario(): void {
    if (this.validarFormulario()) {
      if (this.basicResp) {
        //if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        this.spinner.start('enviar');
        let responseJson = JSON.parse(this.basicResp['response']);
        this.formularioRegistro.addControl('idArchivo', new FormControl(responseJson.id));
        (<FormControl>this.formularioRegistro.controls['idArchivo']).enable();
        //this.formulario.include('idArchivo');
        let jsonFormulario = JSON.stringify(this.formularioRegistro.value, null, 2);
        ///console.log('formu',jsonFormulario);
        this.catalogoServices.postMovilidadInterprograma(
            jsonFormulario,
            this.erroresGuardadoRegis
        ).subscribe(
            response => {
              let mail = this.correoCoordinador +
                  this.correoDirectorTesis +
                  this.correoCoordinadorReceptor;

              let formularioCorreo: FormGroup;
              formularioCorreo = new FormGroup({
                destinatario: new FormControl(mail),
                entidad: new FormControl({ movilidadInterprograma: response.json().id}),
                idPlantillaCorreo: new FormControl(20),
                comentarios: new FormControl()
              });
              let jsonCorreo = JSON.stringify(formularioCorreo.value, null, 2);
              this._catalogoServices.getEnvioCorreoElectronicoService().
              postCorreoElectronico(
                  jsonCorreo,
                  this.erroresGuardadoRegis
              ).subscribe(
                  response => {
                  },
                  error => {
                    this.spinner.stop('enviar');
                    console.log('Error envio correo');
                  },
                  () => {
                    this.spinner.stop('enviar');
                    console.log('Se envio correo');
                  }
              );
            },
            error => {
              console.log('NO se envio formulario');
              this.spinner.stop('enviar');
            },
            () => {
              console.log('SE envío formulario');
              this.onCambiosTabla();
              this.modalRegistro.close();
              this.spinner.stop('enviar');
            }
        );
        this.spinner.stop('enviar');
        //}
      }
    }
  }

  //METODOS PARA ARCHIVO CARGADO
  eliminarCartaMotivo () {
    if (this.existeArchivo) {
      this.existeArchivo = false;
      let responseJson = JSON.parse(this.basicResp['response']);
      this._archivosService.deleteArchivo(
          responseJson.id,
          this.erroresGuardadoRegis
      ).subscribe(
          response => {},
          error => {
            console.log('NO se elimino carta motivo');
          },
          () => {
            console.log('SE elimino carta motivo');
            this.basicResp = null;
            this.formularioRegistro.addControl('upload', new FormControl('', Validators.required));
            (<FormControl>this.formularioRegistro.controls['upload']).enable();
            //this.formularioRegistro.include('upload');
          }
      );
    }
  }

  //MÉTODO PARA RECUPERAR EL CORREO DEL COORDINADOR DE CARRERA DEL ESTUDIANTE SOLICITANTE
  /* El metodo se usar para encontrar el correo del coordinador de carrera y el coordinador
   * receptor*/
  obtenerCorreoCoordinador(idProgramaDocente, tipoCoordinador: string): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idRol~2:IGUAL,' + 'idUsuario.idProgramaDocente.id~'
        + idProgramaDocente + ':IGUAL;AND');
    let usuarioRol: UsuarioRoles;
    this.usuarioRolService.getListaUsuarioRol(
        this.erroresConsultasRegis,
        urlSearch
    ).subscribe(
        response => {
          response.json().lista.forEach((usurioRol) => {
            // //console.log('rol.idUsuario.email: ' + usurioRol.id_usuario.email);
            usuarioRol = new UsuarioRoles(usurioRol);
            // //console.log(usuarioRol.usuario.email);
          });
        },
        error => {
          //console.log(error);
        },
        () => {
          if (usuarioRol) {
            if (tipoCoordinador === 'Receptor') {
              this.correoCoordinadorReceptor = usuarioRol.usuario.email;
            } else {
              this.correoCoordinador = usuarioRol.usuario.email;
            }
          }

        }
    );
  }

  obtenerCorreoDirector(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idTutor.idTipo~2:IGUAL,' + 'id~'
        + this.estudiante.id + ':IGUAL;AND');
    // //console.log('urlSearch :::' + urlSearch);
    this.estudianteServiceRegis.getListaEstudianteOpcional(
        this.erroresConsultasRegis,
        urlSearch
    ).subscribe(
        response => {
          response.json().lista.forEach((estudianteTutor) => {
            let tutorEstudiante = new Estudiante(estudianteTutor);
            this.correoDirectorTesis = tutorEstudiante.tutor.profesor.usuario.email;
          });
        },
        error => {
          //console.log(error);
        },
        () => {
        }
    );
  }
  private abrirModalRegistro(): void {
    this.modalRegistro.open('lg');
  }
  private cerrarModalRegistro(): void {
    this.modalRegistro.close();
    this.eliminarCartaMotivo();
  }

  //========================================MODAL DETALLE==========================================//
  idMovilidadInterprograma;
  idArchivoDetalle;
  entidadMovilidadInterprograma: MovilidadInterprograma;
  archivoService;
  private erroresConsultasDeta: Array<ErrorCatalogo> = [];

  private constructorDetalle(): void {
    //console.log('DETALLE');
    this.idMovilidadInterprograma = this.registroSeleccionado.id;
    this.idArchivoDetalle = this.registroSeleccionado.archivo.id;
    this.prepareServicesDetalle();
    this.entidadMovilidadInterprograma = this.registroSeleccionado;
    //console.log('*.*',this.entidadMovilidadInterprograma);
    this.abrirModalDetalle();
  }
  prepareServicesDetalle(): void {
    this.archivoService = this._catalogoServices.getArchivos();
  }
  descargarArchivo(): void {
    let jsonArchivo = '{"idArchivo": ' + this.idArchivoDetalle + '}';
    this.spinner.start('descargar');
    this.archivoService
        .generarTicket(jsonArchivo, this.erroresConsultasDeta)
        .subscribe(
            data => {
              let json = data.json();
              let url =
                  ConfigService.getUrlBaseAPI() +
                  '/api/v1/archivovisualizacion/' +
                  this.idArchivoDetalle +
                  '?ticket=' +
                  json.ticket;
              window.open(url);
            },
            error => {
              this.spinner.stop('descargar');
            },
            () => {
              this.spinner.stop('descargar');
            }
        );
  }
  private abrirModalDetalle(): void {
    this.modalDetalle.open('lg');
  }
  private cerrarModalDetalle(): void {
    this.modalDetalle.close();
  }



  /*modalRegistro(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalInteresadoRegistroData = new ModalInterprogramasData(
        this
    );
    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue:  modalInteresadoRegistroData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);
    dialog = this.modal.open(
        <any>ModalInterprogramas,
        bindings,
        modalConfig
    );
  }*/

  // ************************** Modal detalle de una solicitud de interprograma **************//
  /*modalDetalle(): void {
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

}
