import {Component, Inject, OnInit, ElementRef, Injector, Renderer, ViewChild, NgZone} from '@angular/core';
import {Usuarios} from '../../services/usuario/usuario.model';
import {Roles} from '../../services/entidades/rol.model';
import {ProgramaDocente} from '../../services/entidades/programa-docente.model';
import {Puesto} from '../../services/catalogos/puesto.model';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {ConfigService } from '../../services/core/config.service';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import { NgUploaderOptions } from 'ngx-uploader';


@Component({
  selector: 'app-lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements OnInit {

  @ViewChild('modalAgregarUsuario')
  modalAgregarUsuario: ModalComponent;
  @ViewChild('modalDetalleUsuario')
  modalDetalleUsuario: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  size: string = 'lg';
  output: string;
  private descripcionError: string = '';

  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Usuarios> = [];
  paginacion: PaginacionInfo;

  columnas: Array<any> = [
    {titulo: 'Rol ', nombre: '', sort: false},
    {titulo: 'Nombre de usuario*', nombre: 'username'},
    {titulo: 'Nombre completo*', nombre: 'nombre'},
    {titulo: 'Correo institucional', nombre: 'email'},
    {titulo: 'Estatus', nombre: 'enabled'}
  ];

  roles: {[key: number]: string; } = {};

  exportarExcelUrl = '';
  exportarPDFUrl = '';
  ////////// Seccion de variables para detalles usuario
  usuarioService;
  usuarioRolService;
  archivosService;
  puestosService;
  fotografiaPerfil: string = 'images/usuario.png';
  firmaUsuario: string = 'images/usuario.png';
  puesto: string = '';
  //////// fin seccion de variables para detalles usuario
  // Seccion de variables para agregar usuario ///////
  modalEditar: FormGroup;
  agregarRol: FormGroup;
  agregarPuesto: FormGroup;
  usuarioAgregarEditarService;
  puestoService;
  rolService;
  programaDocenteService;
  usuarioLdapService;
  profesorService;
  validacionActiva: boolean = false;
  validacionActivaPuesto: boolean = false;
  validacionActivaRol: boolean = false;
  usuarioSeleccionado: Usuarios;
  idsProgramasUsados: Array<number> = [];
  listaRoles: Array<Roles> = [];
  listaProgramas: Array<ProgramaDocente> = [];
  listaPuestos: Array<Puesto> = [];
  basicProgressFirma: number = 0;
  basicResp: Object;
  nombreArchivo: string = '';
  dropProgress: number = 0;
  dropProgressFirma: number = 0;
  basicProgress: number = 0;
  esCoordinador: boolean = false;
  edicionUsuario: boolean = false;
  rolSeleccionado: UsuarioRoles;
  rolSelecNuevoUsr: Roles;
  esProfesor: boolean = false;
  rolCoordinador: boolean = false;
  usrRoles: Array<Roles> = [];
  usuarioRoles: Array<UsuarioRoles> = [];
  numeroRoles: number;
  numeroIdRol: number;
  estadoBoton: boolean;
  registroRoles: Array<UsuarioRoles> = [];
  puestoValido: boolean = false;
  usuarioEdicion: Usuarios;
  conProgramaDocente: boolean = false;
  columnasUsuarioRol: Array<any> = [
        { titulo: 'Rol', nombre: 'nombre', sort: false }
    ];
  idUsuarioCreado: number;
  nombreFotografiaUsuario: string = '';
  hayDirectorDocencia: boolean = false;
  idDirectorDocencia;
  puestoId: number;
  options: NgUploaderOptions;
  /// Fin de la seccion de variables para agregar usuario /////
  registroSeleccionado: Usuarios;
  criteriosCabezera: string = 'rolesdb.idRol.id~5:NOT,rolesdb.idRol.id~6:NOT,' +
    'rolesdb.idRol.id~13:NOT,rolesdb.idRol.id~14:NOT;AND';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'nombre,primerApellido,' +
    'segundoApellido,email,username' }
  };

  private alertas: Array<Object> = [];
  private erroresConsultas: Array<Object> = [];

  constructor(@Inject(NgZone) private zone: NgZone,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private _spinnerService: SpinnerService) {
    this.prepareServices();
    this.inicializarOpcionesNgZone();
    this.inicalizarFormularioAgregarEditar();
    this.inicializarFormularioPuesto();
    this.inicializarFormularioRol();
  }

  ngOnInit(): void {
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

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    ////console.log('fitlro: ' + this.configuracion.filtrado.textoFiltro);
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      criterios = criterios + 'GROUPAND';
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
    this._spinnerService.start('listausuarios1');
    this.usuarioService.getListaUsuario(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion).subscribe(
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
          this.registros.push(new Usuarios(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinnerService.stop('listausuarios1');
      },
      () => {
/*        if (assertionsEnabled()) {
          ////console.log('paginacionInfo', this.paginacion);
          ////console.log('registros', this.registros);
        }*/
        this._spinnerService.stop('listausuarios1');
      }
    );
  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      ////console.log('evento', evento);
      ////console.log('Page changed to: ' + evento.page);
      ////console.log('Number items per page: ' + evento.itemsPerPage);
      ////console.log('paginaActual', this.paginaActual);
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

  rowSeleccionado(registro) {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
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

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  mostrarOpcionActivar(): boolean {
    if (this.registroSeleccionado && !this.registroSeleccionado.activo) {
      return true;
    } else {
      return false;
    }
  }

  mostrarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.activo) {
      return true;
    } else {
      return false;
    }
  }

  activarUsuario(): void {
    if (this.registroSeleccionado) {
      let jsonActivar = '{ "enabled": "true"}';
      this.usuarioService.putUsuario(this.registroSeleccionado.id,
        jsonActivar,
        this.erroresConsultas
      ).subscribe(
        response => { }
      );
    }
    this.onCambiosTabla();
  }

  desactivarUsuario(): void {
    if (this.registroSeleccionado) {
      let jsonDesactivar = '{ "enabled": ""}';
      this.usuarioService.putUsuario(this.registroSeleccionado.id,
        jsonDesactivar,
        this.erroresConsultas
      ).subscribe(
        response => { }
      );
    }
    this.onCambiosTabla();
  }

  abrirModalAgregarEditarUsuario(tipo: string): void {

    if (this.registroSeleccionado) {
      this.edicionUsuario = true;
      this.usuarioEdicion = this.registroSeleccionado;
      this.obtenerInformacionUsarioEdicion();
    } else {
      this.modalEditar.addControl('password', new FormControl('admin'));
      this.puestoValido = true;
    }

    this.zone = new NgZone({ enableLongStackTrace: false });
    this.configurarModalAgregarEditarUsuario();
    this.obtenerDirectorDocencia();
    this.puestoValido = true;
    this.modalAgregarUsuario.open('lg');
  }

  cerrarModalAgregarEditarUsuario(): void {
    console.log('cerrarModal');
    this.modalAgregarUsuario.close();
    this.limpiarVariablesModalCrearEditarUsuario();
  }

  configurarModalAgregarEditarUsuario(): void {
    this.getProgramasUtilizados();
  }

  getProgramasUtilizados(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'rolesdb.idRol.id~2:IGUAL');
    this._spinnerService.start('cargarCatalogos');
    this.usuarioAgregarEditarService.getListaUsuario(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          if (item.id_programa_docente) {
            if (this.usuarioSeleccionado) {
              if (item.id_programa_docente.id !== this.usuarioSeleccionado.programaDocente.id) {
                this.idsProgramasUsados.push(item.id_programa_docente.id);
              }
            }else {
              this.idsProgramasUsados.push(item.id_programa_docente.id);
            }
          }
        });
      },
      error => {
        this._spinnerService.stop('cargarCatalogos');
      },
      () => {
        this.listarRoles();
        this.listarProgramasDocentes();
        this.listarPuestos();
        this._spinnerService.stop('cargarCatalogos');
      }
    );
  }

  listarRoles(): void {
        let urlSearch: URLSearchParams = new URLSearchParams();
        urlSearch.set('criterios', 'id~5:NOT,id~6:NOT,id~13:NOT,id~14:NOT;AND,' +
            'activo~true:IGUAL;AND');
        urlSearch.set('ordenamiento', 'nombre:ASC');
        this.listaRoles = this.rolService.getListaRol(this.erroresConsultas, urlSearch).lista;
  }

  listarProgramasDocentes(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    this.idsProgramasUsados.forEach((id) => {
      criterios = criterios + 'id~' + id + ':NOT;AND,';
    });
    criterios = criterios.slice(0, -1);
    console.log('criterios', criterios);
    urlSearch.set('criterios', criterios);
    this.programaDocenteService.getListaProgramaDocente(this.erroresConsultas, urlSearch).subscribe(
        response => {
            response.json().lista.forEach((item) => {
                this.listaProgramas.push(new ProgramaDocente(item));
            });
        },
        error => {},
        () => {
          // this._spinnerService.stop('cargarCatalogos');
          this.getControl('auxiliar').patchValue(0);
          // console.log('auxiliarFinal', this.getControl('auxiliar').value);
        }
    );
  }

  listarPuestos(): void {
        let urlSearch: URLSearchParams = new URLSearchParams();
        this.listaPuestos = this.puestoService.getListaPuesto(this.erroresConsultas, urlSearch).lista;
  }

  obtenerDirectorDocencia(): void {
        let urlSearch: URLSearchParams = new URLSearchParams();
        urlSearch.set('criterios', 'idPuesto.id~1:IGUAL');
        this.puestosService.getListaPuestos(this.erroresConsultas, urlSearch).subscribe(response => {
            if (response.json().lista.length > 0) {
                this.idDirectorDocencia = response.json().lista[0].id_usuario.id;
                if (this.usuarioEdicion) {
                    if (this.idDirectorDocencia != this.usuarioEdicion.id) {
                        if (!this.puestoId || this.puestoId != 1) {
                          this.puestoValido = true;
                          this.hayDirectorDocencia = true;
                      }
                    }else {
                        this.puestoValido = true;
                    }
                }else {
                    this.puestoValido = true;
                    this.hayDirectorDocencia = true;
                }
            }else {
                this.puestoValido = true;
            }
        });
  }

  inicalizarFormularioAgregarEditar(): void {
    this.modalEditar = new FormGroup({
      nombre: new FormControl('', Validators.compose([ Validacion.parrafos,
      Validators.required])),
      primerApellido: new FormControl('', Validators.compose([Validacion.parrafos,
      Validators.required])),
      segundoApellido: new FormControl('', Validators.compose([Validacion.parrafos])),
      username: new FormControl('', Validators.compose([Validacion.parrafos,
      Validators.required])),
      idProgramaDocente: new FormControl(''),
      idFirma: new FormControl(''),
      idFoto: new FormControl(''),
      email: new FormControl(''),
      auxiliar: new FormControl('sin', Validators.required)
    });
  }

  inicializarFormularioRol(): void {
    this.agregarRol = new FormGroup({
      idRol: new FormControl(''),
      listaRoles: new FormControl('', Validators.required)
    });
  }

  inicializarFormularioPuesto(): void {
    this.agregarPuesto = new FormGroup({
      idPuesto: new FormControl('', Validators.required)
    });
  }

  abrirModalDetalleUsuario(): void {
    this.modalDetalleUsuario.open('lg');
    this.obtenerInformacionUsuarioSeleccionado();
  }

  cerrarModalDetalleUsuario(): void {
    this.modalDetalleUsuario.close();
    this.limpiarVariablesDetalleUsuario();
  }

  obtenerInformacionUsarioEdicion(): void {
    this.agregarRol.addControl('idUsuario', new FormControl(this.usuarioEdicion.id));
    this.agregarPuesto.addControl('idUsuario', new FormControl(''));
    if (this.usuarioEdicion) {
      this.obtenerDatosPersonalesUsuarioEdicion();
      this.obtenerProgramaDocenteUsuarioEdicion();
      this.obtenerFirmaUsuarioEdicion();
      this.obtenerInfoFotoUsuarioEdicion();
      this.obtenerInfoPuestoUsuarioEdicion();
      this.obtenerRolesEdicion();
      this.obtenerPuestoEdicion();
    }
  }

  private obtenerDatosPersonalesUsuarioEdicion(): void {
    this.getControl('nombre').patchValue(this.usuarioEdicion.nombre);
    this.getControl('primerApellido').patchValue(this.usuarioEdicion.primerApellido);
    this.getControl('segundoApellido').patchValue(this.usuarioEdicion.segundoApellido);
    this.getControl('username').patchValue(this.usuarioEdicion.username);
  }

  private obtenerProgramaDocenteUsuarioEdicion(): void {
     if (this.usuarioEdicion.programaDocente.id) {
      this.esCoordinador = true;
      this.conProgramaDocente = true;
      this.getControl('idProgramaDocente').patchValue(this.usuarioEdicion.programaDocente.id);
      this.getControl('auxiliar').patchValue(0);
    } else {
      this.getControl('auxiliar').patchValue('sin');
    }
  }

  private obtenerFirmaUsuarioEdicion(): void {
    if (this.usuarioEdicion.firma.id) {
      this.nombreArchivo = this.usuarioEdicion.firma.nombre;
      this.getControl('idFirma').patchValue(this.usuarioEdicion.firma.id);
    }
  }

  private obtenerInfoFotoUsuarioEdicion(): void {
    if (this.usuarioEdicion.foto.id) {
      this.nombreFotografiaUsuario = this.usuarioEdicion.foto.nombre;
      this.getControl('idFoto').patchValue(this.usuarioEdicion.foto.id);
    }
  }

  private obtenerInfoPuestoUsuarioEdicion(): void {
    if (this.agregarPuesto) {
      this.getControlPuesto('idUsuario').patchValue(this.usuarioEdicion.id);
    }
  }

  private obtenerInformacionUsuarioSeleccionado(): void {
    this.obtenerImagenUsuario();
    this.obtenerRoles();
    this.obtenerPuesto();
  }

  private obtenerImagenUsuario(): void {
    if (this.registroSeleccionado.foto.id) {
          this.fotografiaPerfil =
          ConfigService.getUrlBaseAPI() + '/api/v1/imagenperfil/' +
          this.registroSeleccionado.foto.id;
        }
      if (this.registroSeleccionado.firma.id) {
          let jsonToken = '{"idArchivo": "' +
              this.registroSeleccionado.firma.id + '"}';
          this.archivosService.generarTicket(jsonToken,
              this.erroresConsultas).subscribe(response => {
              this.firmaUsuario =
                  ConfigService.getUrlBaseAPI() + '/api/v1/archivovisualizacion/' +
                  this.registroSeleccionado.firma.id + '?ticket=' + response.json().ticket;
          });
      }
  }

  private obtenerRoles(): void {
        let urlSearch: URLSearchParams = new URLSearchParams();
        urlSearch.set('criterios', 'idUsuario~' + this.registroSeleccionado.id + ':IGUAL');
        this.usuarioRolService.getListaUsuarioRol(this.erroresConsultas, urlSearch).subscribe(
            response => {
                let listaRoles = response.json().lista;
                listaRoles.forEach((lista) => {
                    this.roles += lista.id_rol.nombre + ' ';
                });
            });
  }

  private obtenerPuesto(): void {
        let urlSearch: URLSearchParams = new URLSearchParams();
        urlSearch.set('criterios', 'idUsuario~' + this.registroSeleccionado.id + ':IGUAL');
        this.puestosService.getListaPuestos(this.erroresConsultas, urlSearch).subscribe(
            response => {
                if (response.json().lista.length > 0) {
                  this.puesto = response.json().lista[0].id_puesto.valor;
                }
            }
        );
  }

  private limpiarVariablesDetalleUsuario(): void {
    this.fotografiaPerfil = 'images/usuario.png';
    this.firmaUsuario = 'images/usuario.png';
    this.puesto = '';
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.modalEditar.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.modalEditar.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  getControlDoc(campo: string): FormControl {
        return (<FormControl>this.agregarRol.controls[campo]);
    }

    getControlErrorsDoc(campo: string): boolean {
        if (!(<FormControl>this.agregarRol.controls[campo]).valid &&
            this.validacionActivaRol) {
            return true;
        }
        return false;
    }

    getControlPuesto(campo: string): FormControl {
        return (<FormControl>this.agregarPuesto.controls[campo]);
    }

    getControlErrorsPuesto(campo: string): boolean {
        if (!(<FormControl>this.agregarPuesto.controls[campo]).valid &&
            this.validacionActivaPuesto) {
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
      return null;
  }

  private cambiaEsCoord(valor): void {
        if (valor) {
            this.esCoordinador = true;
            (<FormControl>this.modalEditar.controls['auxiliar']).patchValue('');
        }else {
            this.esCoordinador = false;
            (<FormControl>this.modalEditar.controls['auxiliar']).patchValue('sin');
            (<FormControl>this.modalEditar.controls['idProgramaDocente']).patchValue('');
        }
  }

  private checkPrograma(idPrograma): void {
        (<FormControl>this.modalEditar.controls['idProgramaDocente']).patchValue(idPrograma);
  }

  private inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
        // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['jpg', 'png'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  private enableBasic(): boolean {
        return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  private enableBasicFirma(): boolean {
        return (this.basicProgressFirma >= 1 && this.basicProgressFirma <= 99);
  }


  private enableDropFirma(): boolean {
        return (this.dropProgressFirma >= 1 && this.dropProgressFirma <= 99);
  }

  private enableDrop(): boolean {
        return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }

  private handleBasicUploadFirma(data): void {
        this.basicResp = data;
        this.zone.run(() => {
            this.basicProgressFirma = data.progress.percent;
            if (this.basicResp['response'] && this.basicResp['status'] === 201) {
                let responseJson = JSON.parse(this.basicResp['response']);

                let jsonArchivo = '{"idFirma": ' + responseJson.id + '}';
                ////console.log(jsonArchivo);

                if (this.esImagen(responseJson.originalName)) {
                    ////console.log('firma');
                    let idArchivo = responseJson.id;

                    this.nombreArchivo = responseJson.originalName;
                    this.modalEditar.value.idFirma = idArchivo;
                    (<FormControl>this.modalEditar.controls['idFirma']).setValue(idArchivo);
                } else {
                    this.addErrorsMesaje('El archivo debe de ser en jpg o png', 'danger');
                    this.archivosService.deleteArchivo(
                        responseJson.id,
                        this.erroresConsultas
                    );
                }

            }
        });
  }

  private handleBasicUpload(data, tipo: string): void {
        this.basicResp = data;
        this.zone.run(() => {
            this.basicProgress = data.progress.percent;
            if (this.basicResp['response'] && this.basicResp['status'] == 201) {
                let responseJson = JSON.parse(this.basicResp['response']);
                if (this.esImagen(responseJson.originalName)) {
                    let idArchivo = responseJson.id;

                    this.nombreFotografiaUsuario = responseJson.originalName;
                    this.modalEditar.value.idFoto = idArchivo;
                    (<FormControl>this.modalEditar.controls['idFoto']).setValue(idArchivo);
                } else {
                    this.addErrorsMesaje('El archivo debe de ser en jpg o png', 'danger');
                    this.archivosService.deleteArchivo(
                        responseJson.id,
                        this.erroresConsultas
                    );
                }
            }
        });
  }

  private esImagen(nombreArchiov: string): boolean {
        let nombreArchivoArray: string[];
        let tamanoArreglo: number;
        nombreArchivoArray = nombreArchiov.split('.');
        tamanoArreglo = nombreArchivoArray.length - 1;
        if (nombreArchivoArray[tamanoArreglo] && (
            nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpg' ||
            nombreArchivoArray[tamanoArreglo].toLowerCase() === 'png') ) {
            return true;
        } else {
            return false;
        }
  }

  private addErrorsMesaje(mensajeError, tipo): void {
        this.alertas.push({
            type: tipo,
            msg: mensajeError,
            closable: true
        });
  }

  private mostrarBotonEliminarRol(): boolean {
        if (this.edicionUsuario) {
            if (this.rolSeleccionado) {
                return true;
            } else {
                return false;
            }
        }else {
            if (this.rolSelecNuevoUsr) {
                return true;
            } else {
                return false;
            }
        }
  }


  private agregarRoles(): void {
        if (this.numeroRoles < 1) {
            if (this.edicionUsuario) {
                this.rolSeleccionado = null;
                this.getControlDoc('idRol').patchValue(this.numeroIdRol);
                let jsonFormulario = JSON.stringify(this.agregarRol.value, null, 2);

                this.usuarioRolService
                    .postUsuarioRol(
                        jsonFormulario,
                        this.erroresConsultas
                    ).subscribe(
                    () => {
                        ////console.log('Success');
                        if (this.numeroIdRol == 3) {
                            this.esProfesor = true;
                        }
                        if (this.numeroIdRol == 2) {
                            this.rolCoordinador = true;
                            this.esCoordinador = true;
                            this.cambiaEsCoord(true);
                        }
                    },
                    console.error,
                    () => {
                        this.mostrarTabla();
                    }
                );
            }else {
                this.rolSelecNuevoUsr = null;
                this.listaRoles.forEach((rol) => {
                    if (rol.id == this.numeroIdRol) {
                        this.usrRoles.push(rol);
                        if (this.numeroIdRol == 3) {
                            this.esProfesor = true;
                        }
                        if (this.numeroIdRol == 2) {
                            this.rolCoordinador = true;
                            this.esCoordinador = true;
                            this.cambiaEsCoord(true);
                        }
                    }
                });
                if (this.usrRoles.length > 0) {
                  this.getControlDoc('listaRoles').patchValue(this.usrRoles.length);
                } else {
                  this.getControlDoc('listaRoles').patchValue('');
                }
            }
        }

        this.listarRoles();
        this.estadoBoton = false;
  }

  private eliminarRol () {
        if (this.edicionUsuario) {
            if (this.rolSeleccionado) {
                ////console.log('Eliminando...');
                let idRol = this.rolSeleccionado.rol.id;
                this.usuarioRolService.deleteUsuarioRol(
                    this.rolSeleccionado.id,
                    this.erroresConsultas
                ).subscribe(
                    () => { },
                    console.error,
                    () => {
                        if (idRol == 3) {
                            this.esProfesor = false;
                            console.log('Se elimino un rol Profesor del usuario');
                            console.log('desactivar profesor en catalogo profesor');
                            this.buscarProfesorADescativar();
                        }
                        if (idRol == 2) {
                            this.rolCoordinador = false;
                            this.esCoordinador = false;
                            this.cambiaEsCoord(false);
                        }
                        this.mostrarTabla();
                    }
                );
            } else {
                alert('Selecciona un registro');
                ////console.log('Selecciona un registro');
            }
            this.rolSeleccionado = null;
        }else {
            if (this.rolSelecNuevoUsr) {
                let idx = this.usrRoles.indexOf(this.rolSelecNuevoUsr);
                if (this.usrRoles[idx].id == 3) {
                    this.esProfesor = false;
                }
                if (this.usrRoles[idx].id == 2) {
                    this.rolCoordinador = false;
                    this.esCoordinador = false;
                    this.cambiaEsCoord(false);
                }
                this.usrRoles.splice(idx, 1);
                this.rolSelecNuevoUsr = null;
                if (this.usrRoles.length > 0) {
                    this.getControlDoc('listaRoles').patchValue(this.usrRoles.length);

                } else {
                    this.getControlDoc('listaRoles').patchValue('');

                }
            }
        }
  }

  private buscarProfesorADescativar() {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let idProfesorADesactivar: number = undefined;
    this._spinnerService.start('buscarProfesor');
    urlParameter.set('criterios', 'idUsuario~' + this.registroSeleccionado.id + ':IGUAL');
    this.profesorService.getListaProfesor(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((profesor) => {
          idProfesorADesactivar = profesor.id;
        });
      },
      error => { this._spinnerService.stop('buscarProfesor'); },
      () => {
        this._spinnerService.stop('buscarProfesor');
        if (idProfesorADesactivar) {
          this.descactivarProfesor(idProfesorADesactivar);
        }
      }
    );
  }

  private descactivarProfesor(idProfesor: number) {
    let jsonProfesor = {
      'idEstatus' : '1008'
    };

    this.profesorService.putProfesor(
      idProfesor,
      jsonProfesor
    ).subscribe(
      response => {
        console.log('response.json()', response.json());
      },
      error => {

      },
      () => {
        console.log('profesor desactivado');
      }
    );
  }

  getIdRol(idRol): void {
        this.estadoBoton = false;
        if (idRol) {
            this.numeroIdRol = idRol;
            let urlParameter: URLSearchParams = new URLSearchParams();
            urlParameter.set('criterios', 'idRol~' + this.numeroIdRol + ':IGUAL' +
                ',idUsuario~' + this.registroSeleccionado.id + ':IGUAL');

            this.usuarioRolService.getListaUsuarioRol(this.erroresConsultas,
                urlParameter).subscribe(
                response => {
                    this.registroRoles = [];
                    let respuesta = response.json();
                    respuesta.lista.forEach((item) => {
                        this.registroRoles.push(new UsuarioRoles(item));
                    });
                    this.numeroRoles = this.registroRoles.length;
                },
                error => {},
                () => {
                    this.estadoBoton = (this.numeroRoles < 1);
                }
            );
        }else {
            this.estadoBoton = false;
        }
    }

  getRol(idRol): void {
    this.estadoBoton = false;
    if (idRol) {
        this.numeroRoles = 0;
        this.numeroIdRol = idRol;
        this.usrRoles.forEach((rol) => {
            if (rol.id.toString() === idRol) {
                this.numeroRoles++;
            }
        });
        this.estadoBoton = (this.numeroRoles < 1);
    }else {
        this.estadoBoton = false;
    }
  }

  private mostrarTabla(): void {
        this.obtenerRolesEdicion();
  }

  private rowSeleccionadoUsuarioRol(usuarioRol): boolean {
        if (this.edicionUsuario) {
            return (this.rolSeleccionado === usuarioRol);
        } else {
            return (this.rolSelecNuevoUsr === usuarioRol);
        }
  }

  private rowSeleccionUsuarioRol(usuarioRol): void {
        if (this.edicionUsuario) {
            if (this.rolSeleccionado !== usuarioRol) {
                this.rolSeleccionado = usuarioRol;
                console.log('rolSeleccionado', this.rolSeleccionado);
            } else {
                this.rolSeleccionado = null;
            }
        }else {
            if (this.rolSelecNuevoUsr !== usuarioRol) {
                this.rolSelecNuevoUsr = usuarioRol;
            }else {
                this.rolSelecNuevoUsr = null;
            }
        }
  }

  private mostrarBotonAgregar(): boolean {
        return this.estadoBoton;
  }

  private deshabilitarEleiminar(): boolean {
    let deshabilitarBoton: boolean = true;
        if (this.edicionUsuario) {
            if (this.usuarioRoles.length > 1) {
              deshabilitarBoton = false;
            }
        }else {
            deshabilitarBoton = false;
        }
    return deshabilitarBoton;
  }

  private obtenerRolesEdicion(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
      urlSearch.set('criterios', 'idUsuario~' + this.registroSeleccionado.id + ':IGUAL');
      this.usuarioRolService.getListaUsuarioRol(this.erroresConsultas, urlSearch).subscribe(
        response => {
          let listRoles = response.json().lista;
          this.usuarioRoles = [];
          listRoles.forEach((lista) => {
            this.usuarioRoles.push(new UsuarioRoles(lista));
            if (lista.id_rol.id == 2) {
                this.rolCoordinador = true;
                this.esCoordinador = true;
                this.cambiaEsCoord(true);
            }
          });
          if (this.usuarioRoles.length > 0) {
            this.getControlDoc('listaRoles').patchValue(this.usuarioRoles.length);
          }else {
            this.getControlDoc('listaRoles').patchValue('');
          }
        }
    );
  }

  private obtenerPuestoEdicion(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario~' + this.usuarioEdicion.id + ':IGUAL');
    this.puestosService.getListaPuestos(this.erroresConsultas, urlSearch).subscribe(
        response => {
            response.json().lista.forEach((lista) => {
                if (lista.id_puesto) {
                  this.puestoId = lista.id_puesto.id;
                }
            });
            this.obtenerDirectorDocencia();
            if (this.puestoId) {
                this.getControlPuesto('idPuesto').patchValue(this.puestoId);
            }
        }
    );
  }

  private verificarPuesto(idPuesto: number): void {
        if (idPuesto == 1) {
            if (this.hayDirectorDocencia) {
                if (this.edicionUsuario &&
                    this.usuarioEdicion.id == this.idDirectorDocencia) {
                    this.puestoValido = true;
                }else {
                    this.puestoValido = false;
                    this.addErrorsMesaje('El puesto Direccion Docencia ya está ocupado', 'danger');
                }
            }else {
                this.puestoValido = true;
            }
        }else {
            this.puestoValido = true;
        }
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  private crearUsuario() {
    this.getControl('email').patchValue(
      this.getControl('username').value + '@colsan.edu.mx');
    if (this.validarFormularios()) {
      if (this.edicionUsuario) {
        let jsonUsuarioEidcion = JSON.stringify(this.modalEditar.value, null, 2);
        console.log('jsonUsuarioNuevo', jsonUsuarioEidcion);
        this.editarUsuario();
      } else {
        let jsonUsuarioNuevo = JSON.stringify(this.modalEditar.value, null, 2);
        this.postUsuarioNuevo(jsonUsuarioNuevo);
      }
    }
  }


   private validarFormularios(): boolean {
        let validos = true;
        if (!this.validarFormulario()) {
          validos = false;
        }
        if (!this.validarFormularioDoc()) {
          validos = false;
        }
        if (!this.validarPuesto()) {
          validos = false;
        }
        if (!this.puestoValido) {
            validos = false;
            this.addErrorsMesaje('El puesto Direccion Docencia ya está ocupado', 'danger');
        }
        return validos;
  }

  private validarFormulario(): boolean {
        if (this.modalEditar.valid) {
            this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
  }

  private validarFormularioDoc(): boolean {
        if (this.agregarRol.valid) {
            this.validacionActivaRol = false;
            return true;
        }
        this.validacionActivaRol = true;
        return false;
  }

  private validarPuesto(): boolean {
        if (this.agregarPuesto.valid) {
            this.validacionActivaPuesto = false;
            return true;
        }
        this.validacionActivaPuesto = true;
        return false;
  }

  private editarUsuario(): void {
    console.log('editar usuario');
    event.preventDefault();
    let jsonFormulario = JSON.stringify(this.modalEditar.value, null, 2);
    this._spinnerService.start('editarUsuario');
    this.usuarioAgregarEditarService.putUsuario(
      this.usuarioEdicion.id,
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.verificarPuestoEdicion();
        this.verficarUsuarioLDAP();
        if (this.esProfesor) {
          this.verificarProfesor();
        }
      },
      error => {
        this._spinnerService.stop('editarUsuario');
        this.addErrorsMesaje('No se pudo editar el usuario', 'danger');
      },
      () => {
        this.conProgramaDocente = true;
        // this.spinner.stop();
         this._spinnerService.stop('editarUsuario');
        // this.cerrarModal();
      }
    );
  }

  private verificarPuestoEdicion(): void {
    console.log('Verificar puesto');
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario~' + this.usuarioEdicion.id
      + ':IGUAL');

    let jsonPuesto = JSON.stringify(this.agregarPuesto.value, null, 2);
    this.puestosService.getListaPuestos(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        this.agregarActualizarPuesto(jsonPuesto, response);
      },
      erro => {},
      () => { }
    );
  }

  private agregarActualizarPuesto(jsonPuesto, responselista): void {
    if (responselista.json().lista.length > 0) {
        let idPuestos = responselista.json().lista[0].id;
        let idCatPuesto = responselista.json().lista[0].id_puesto.id;
        if (idCatPuesto != this.getControlPuesto('idPuesto').value) {
            this.puestosService.putPuestos(idPuestos, jsonPuesto,
                this.erroresConsultas).subscribe(
                  response => {},
                  error => {this._spinnerService.stop('editarUsuario');},
                  () => {});
        }
    } else {
        this.puestosService.postPuestos(jsonPuesto, this.erroresConsultas)
            .subscribe(
              response => {},
              error => { this._spinnerService.stop('editarUsuario'); },
              () => {});
    }
  }

  private verficarUsuarioLDAP(): void {
    console.log('verificar usuario LDAP');
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' +
      this.usuarioEdicion.id + ':IGUAL');
    this.usuarioLdapService.getListaUsuarioLdap(
      this.erroresConsultas,
      urlSearch
      ).subscribe(
        response => {
          this.agregarActualizarUsuarioLDAP(response);
        },
        erro => {
          this._spinnerService.stop('editarUsuario');
        },
        () => {}
      );
  }

  private agregarActualizarUsuarioLDAP(responseLista): void {
    console.log('agregar usuario ldap');
    if (responseLista.json().lista.length > 0) {
      let jsonUsrLdap = '{"email": "' +
        this.getControl('email').value +
        '", "username": "' +
      this.getControl('username').value + '"}';
      let idUsrLdap = responseLista.json().lista[0].id;
      let usrnameLdap = responseLista.json().lista[0].
          username_ldap;
      if (usrnameLdap != this.getControl('email').value) {
          this.usuarioLdapService.putUsuarioLdap(idUsrLdap,
            jsonUsrLdap, this.erroresConsultas).subscribe(
            response => {
              console.log('UsuarioLDAP actualizado');
              // this.cerrarModal();
              // this.spinner.stop();
              this._spinnerService.stop('editarUsuario');
            },
            error => {
              this._spinnerService.stop('editarUsuario');
            },
            () => {
              this.cerrarModal();
            }
          );
      }else {
          this.cerrarModal();
      }
    } else {

      let jsonUsrLdap = '{"email": "' +
        this.getControl('email').value +
        '", "idUsuario": "' +
        this.usuarioEdicion.id +
        '", "username": "' +
        this.getControl('username').value + '"}';

      this.usuarioLdapService.postUsuarioLdap(
        jsonUsrLdap,
        this.erroresConsultas
      ).subscribe(
        response => {},
        error => {this._spinnerService.stop('editarUsuario'); },
        () => {this._spinnerService.stop('editarUsuario'); }
      );
    }
    this._spinnerService.stop('editarUsuario');
  }

  private verificarProfesor(): void {
    let tamanoLista: number;
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario~' + this.usuarioEdicion.id + ':IGUAL');
    this.profesorService.getListaProfesor(
        this.erroresConsultas,
        urlSearch
    ).subscribe(
      response => {
        tamanoLista = response.json().lista.length;
      },
      error => {
        this._spinnerService.stop('editarUsuario');
      },
      () => {
        if (tamanoLista === 0) {
          let jsonProfesor = '{"nombre": "' +
            this.getControl('nombre').value + '", ' +
            '"primerApellido": "'
            + this.getControl('primerApellido').value +
            '", "segundoApellido": "' +
            this.getControl('segundoApellido').value + '", ' +
            '"lugarNacimiento": "Lugar de nacimiento", ' +
            '"discapacidad": "false", "idClasificacion": "1", ' +
            '"idTipoTiempoTrabajo": "1", "idEstatus": "1008", ' +
            '"idUsuario": "' + this.usuarioEdicion.id + '"}';
            this.postProfesorNuevo(jsonProfesor);
            this._spinnerService.stop('editarUsuario');
        }
      }
    );
  }

  private postUsuarioNuevo(jsonUusuario): void {
    this._spinnerService.start('crearUsuario');
    this.usuarioService.postUsuario(
      jsonUusuario,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.idUsuarioCreado = response.json().id;
      },
      error => {

      },
      () => {
        let jsonUsrLdap = '{"email": "' + this.getControl('email').value +
          '", "idUsuario": "' +
          this.idUsuarioCreado + '", "username": "' + this.getControl('username').value +
          '"}';
        this.postUsuarioLDAP(jsonUsrLdap);
      }
    );
  }

  private postUsuarioLDAP(jsonUsrLdap) {
    let jsonPuesto;
    this.usuarioLdapService.postUsuarioLdap(
      jsonUsrLdap,
      this.erroresConsultas
    ).subscribe(
      response => {
        jsonPuesto = '{ "idUsuario": "' + this.idUsuarioCreado +
          '", "idPuesto": "' + this.getControlPuesto('idPuesto').value +
          '"}';
      },
      error => {},
      () => {
        this.postPuestoUsuario(jsonPuesto);
      }
    );
  }

  private postPuestoUsuario(jsonPuesto): void {
    this.puestosService.postPuestos(
      jsonPuesto,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.usrRoles.forEach((rol) => {
          let jsonUsrRol = '{ "idUsuario": "' + this.idUsuarioCreado +
            '", "idRol": "' + rol.id + '"}';
          this.postUsuarioRol(jsonUsrRol);
        });
      },
      error => {

      },
      () => {
        this._spinnerService.stop('crearUsuario');
        if (this.esProfesor) {
          let jsonProfesor = '{"nombre": "' +
            this.getControl('nombre').value + '", ' +
            '"primerApellido": "'
            + this.getControl('primerApellido').value +
            '", "segundoApellido": "' +
            this.getControl('segundoApellido').value + '", ' +
            '"lugarNacimiento": "Lugar de nacimiento", ' +
            '"discapacidad": "false", "idClasificacion": "1", ' +
            '"idTipoTiempoTrabajo": "1", "idEstatus": "1008", ' +
            '"idUsuario": "' + this.idUsuarioCreado + '"}';

          this.postProfesorNuevo(jsonProfesor);
        }
        this._spinnerService.stop('crearUsuario');
        this.onCambiosTabla();
        this.cerrarModalAgregarEditarUsuario();
      }
    );
  }

  private postUsuarioRol(jsonUsrRol): void {
    this.usuarioRolService.postUsuarioRol(jsonUsrRol,
        this.erroresConsultas).subscribe(response => {
        ////console.log('Rol agregado');
        this._spinnerService.stop('crearUsuario');
    });
  }

  private postProfesorNuevo(jsonProfesor): void {
    this.profesorService.postProfesor(
      jsonProfesor,
      this.erroresConsultas
    ).subscribe(response => {});
  }

  cerrarModal(): void {
    if ((this.edicionUsuario && this.validarFormularioDoc()) || !this.edicionUsuario) {
         if (this.edicionUsuario && this.rolCoordinador &&
            !this.conProgramaDocente) {
            this.addErrorsMesaje(
                'Coordinador sin programa docente: asignar programa docente y guardar o quitar rol de coordinador', 'danger');
        }else {
            this.onCambiosTabla();
            this.cerrarModalAgregarEditarUsuario();
        }
    }
    // this.spinner.stop();
  }

  private limpiarVariablesModalCrearEditarUsuario(): void {
    this.usrRoles = [];
    this.usuarioRoles = [];
    this.edicionUsuario = false;
    this.idsProgramasUsados = [];
    this.listaRoles = [];
    this.listaProgramas = [];
    this.listaPuestos = [];
    this.nombreArchivo = '';
    this.esProfesor = false;
    this.rolCoordinador = false;
    this.puestoValido = false;
    this.conProgramaDocente = false;
    this.idUsuarioCreado  = undefined;
    this.nombreFotografiaUsuario = '';
    this.hayDirectorDocencia = false;
    this.idDirectorDocencia  = undefined;
    this.puestoId = undefined;
    this.validacionActiva = false;
    this.validacionActivaPuesto = false;
    this.validacionActivaRol = false;
    this.esCoordinador = false;
    this.usuarioEdicion = undefined;
    this.limpiarFormularioModalEditar();
    this.limpiarFormularioPuesto();
    this.limpiarFormularioRoles();
  }

  private limpiarFormularioModalEditar(): void {
    this.getControl('nombre').patchValue('');
    this.getControl('primerApellido').patchValue('');
    this.getControl('segundoApellido').patchValue('');
    this.getControl('username').patchValue('');
    this.getControl('idProgramaDocente').patchValue('');
    this.getControl('auxiliar').patchValue('');
    this.getControl('idFirma').patchValue('');
    this.getControl('idFoto').patchValue('');
    this.getControl('email').patchValue('');
  }

  private limpiarFormularioPuesto(): void {
    this.getControlPuesto('idPuesto').patchValue('');
  }

  private limpiarFormularioRoles(): void {
   this.getControlDoc('idRol').patchValue('');
   this.getControlDoc('listaRoles').patchValue('');
  }

  private prepareServices(): void {
    this.usuarioService = this._catalogosService.getUsuarioService();
    this.usuarioAgregarEditarService = this._catalogosService.getUsuarioService();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.puestosService = this._catalogosService.getPuestosService();
    this.puestoService = this._catalogosService.getPuestoService();
    this.archivosService = this._catalogosService.getArchivos();
    this.rolService = this._catalogosService.getRolService();
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.usuarioLdapService = this._catalogosService.getUsuarioLdapService();
    this.profesorService = this._catalogosService.getProfesor();
  }

/*  constructor() { }

  ngOnInit() {
  }

  mostrarOpcionActivar(): boolean {
    return true;
  }
  mostrarOpcionDesactivar(): boolean {
    return true;
  }
  mostarBotones(): boolean {
    return true;
  }*/

}
