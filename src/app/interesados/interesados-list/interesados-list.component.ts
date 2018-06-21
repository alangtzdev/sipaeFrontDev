import {
  Component, OnInit, Renderer, ViewChild, Injector, IterableDiffers, KeyValueDiffers,
  ApplicationRef, ElementRef
} from '@angular/core';
import 'rxjs/add/operator/map';
import {Interesado} from '../../services/entidades/interesado.model';
import {URLSearchParams} from '@angular/http';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {Convocatoria} from '../../services/entidades/convocatoria.model';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import * as moment from 'moment';
import {NacionalidadService} from '../../services/catalogos/nacionalidad.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {Validacion} from '../../utils/Validacion';
import {Promocion} from '../../services/entidades/promocion.model';
import {AuthService} from '../../auth/auth.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';

@Component({
  selector: 'app-interesados-list',
  templateUrl: './interesados-list.component.html',
  styleUrls: ['./interesados-list.component.css']
})
export class InteresadosListComponent implements OnInit {

  @ViewChild('modalRegistr')
  modalRegistr: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';
  captcha: string;
  reCaptchaValido: boolean = false;
  formulario: FormGroup;
  formularioCriteriosCabecera: FormGroup;
  formularioRegistroPagina: FormGroup;
  validacionActiva: boolean = false;
  catalogoServices;
  mensajeErrors: any = {'required': 'Este campo es requerido'};
  private opcionSelectProgramaDocente: Array<ItemSelects> = [];
  private opcionSelectMedioDifusion: Array<ItemSelects> = [];
  private opcionSelectPromocion: Array<ItemSelects> = [];
  private opcionSelectPais: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  paginacion: PaginacionInfo;
  criteriosCabezera: string = '';
  programasDocentesSelect: Array<ItemSelects> = [];
  promocionesSelect: Array<ItemSelects>;
  opcionSelectNacionalidad: Array<ItemSelects> = [];
  usuarioRolService;
  interesadoService;
  correoConvocatoria;
  convocatoria;
  entidadConvocatoria: Convocatoria;
  public registros: Array<Interesado> = [];
  registrosEnviar: Array<any> = [];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  contador: number = 0;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  columnas: Array<any>;
  registroSeleccionado: Interesado = null;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'primerApellido,segundoApellido,nombre'}
  };
  oculto: boolean; // FALSE docencia TRUE coordinacion
  usuarioRol: UsuarioRoles;
  desahabilitarSelectorCoordiancion: boolean = false;

  desactivarBotonConvocatoria: boolean = true;
  desactivarBotonBuscar: boolean = false;
  _idProgramaDocente: number = 0;
  promocionId: number = null;

  private _programaDocenteService;
  private _promocionService;
////////////////////////Variables Modals/////////////////////////
  campoOtro: boolean = false;
  entidadInteresado: Interesado;

  constructor(private _spinner: SpinnerService,
              private elementRef: ElementRef,
              private appRef: ApplicationRef,
              private injector: Injector,
              private nacionalidadService: NacionalidadService,
              private _catalogosService: CatalogosServices,
              private  authService: AuthService,
              private _renderer: Renderer) {
    this.prepareServices();
    this.getCatNacionalidad();
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.formularioCriteriosCabecera = new FormGroup({
      idProgramaDocente: new FormControl('', Validators.required),
      idPromocionSeleccionada: new FormControl('')
    });

     if ( authService.hasRol('COORDINADOR')) {
        this.columnas = [
          { titulo: 'Nombre del interesado*', nombre: 'primerApellido', sort: 'asc'},
          { titulo: 'Correo electrónico', nombre: 'email', sort: false},
          { titulo: 'Programa docente', nombre: 'idProgramaDocente.descripcion', sort: false},
          { titulo: 'Pais', nombre: 'idPais.valor', sort: false},
          { titulo: 'Fecha', nombre: 'fechaSolicitud'},
          { titulo: 'Estatus', nombre: 'idEstatus.valor', sort: false}
        ];
      }else {
        this.columnas = [
          { titulo: 'Nombre del interesado*', nombre: 'primerApellido', sort: 'asc'},
          { titulo: 'Correo electrónico', nombre: 'email', sort: false},
          { titulo: 'Programa docente', nombre: 'idProgramaDocente.descripcion', sort: false},
          { titulo: 'Fecha', nombre: 'fechaSolicitud'},
          { titulo: 'Estatus', nombre: 'idEstatus.valor', sort: false}

        ];
      }

///////////////modals////////////////
    // this.prepareServices();
    this.getCatalogoMediosInformativos();
    this.getCatalogoPaises();
    this.inicializarFormularioInteresado();
    this.getCatalogoProgramasDocente();
    window['checkReCaptch'] = (response: any) => {
      this.checkReCaptch(response);
    };
    window['caducidadReCatch'] = (response: any) => {
      this.captcha = null;
      this.reCaptchaValido = false;
      this.appRef.tick();
    };

    this.formularioRegistroPagina = new FormGroup({
      registroPorPagina: new FormControl('')
    });

    if (sessionStorage.getItem('interesadosLimite')) {
      this.limite = +sessionStorage.getItem('interesadosLimite');
    }
    (<FormControl>this.formularioRegistroPagina.controls['registroPorPagina'])
      .setValue(+sessionStorage.getItem('interesadosLimite') ? +sessionStorage.getItem('interesadosLimite') : this.limite);
  }

  inicializarFormularioInteresado() {
    this.formulario = new FormGroup({
      nombre: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])),
      primerApellido: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])),
      segundoApellido: new FormControl('', Validators.compose([
        Validacion.parrafos])),
      email: new FormControl('',
        Validators.compose([Validators.required,
          Validacion.emailValidator])),
      telefono: new FormControl('', Validators.compose([
        Validacion.telefonoValidator])),
      celular: new FormControl('', Validators.compose([
        Validacion.celularValidator])),
      idPais: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      idProgramaDocente: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      idMedioDifucion: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      otroMedio: new FormControl(''),
      auxiliarOtroMedio: new FormControl('ok', Validators.required),
      comentarios: new FormControl(''),
      institucion: new FormControl('', Validators.compose([
        Validacion.parrafos])),
      idEstatus: new FormControl('8'),

      fechaSolicitud: new FormControl(moment(new Date()).format('DD/MM/Y hh:mma')),
      idPromocion: new FormControl('', Validators.required),
    });
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

  ngOnInit(): void {
    this.displayReCaptcha();
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    this._idProgramaDocente = idProgramaDocente;
    this.promocionId = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.desactivarBotonBuscar = false;
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.promocionesSelect = this._promocionService
      .getSelectPromocionProxima(this.erroresConsultas, urlParameter);

  }

  habilitarBtnBuscar(): void {
    if (this.promocionesSelect.length > 0) {
      this.desactivarBotonBuscar = true;
    }
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idNacionalidad
  ): void {
  this.limpiarVariablesSession();
    this.promocionId = idPromocion;
    this.criteriosCabezera = '';
    this.desactivarBotonConvocatoria = false;
    if (idProgramaDocente) {
      if (!this.oculto) {
        this.criteriosCabezera = 'idProgramaDocente~' + idProgramaDocente + ':IGUAL';
      } else {
          this.criteriosCabezera = 'idProgramaDocente~' +
            this.usuarioRol.usuario.programaDocente.id + ':IGUAL';

      }
      // console.log(this.criteriosCabezera);
      if (idPromocion) {
        this.criteriosCabezera = this.criteriosCabezera + ',idPromocion~'
          + idPromocion + ':IGUAL';
      }
      if (idNacionalidad) {
        if (idNacionalidad === '5') {
          // TODO construccion de filtro para nacionalidad
          this.criteriosCabezera = this.criteriosCabezera + ',idPais~'
            + 82 + ':IGUAL';
        } else {
          this.criteriosCabezera = this.criteriosCabezera + ',idPais~'
            + 82 + ':NOT';
        }
      }
    }
    if (idNacionalidad && !idProgramaDocente) {
      if (idNacionalidad === '5') {
        // TODO construccion de filtro para nacionalidad
        this.criteriosCabezera = 'idPais~'
          + 82 + ':IGUAL';
      }else {
        this.criteriosCabezera = 'idPais~'
          + 82 + ':NOT';
      }
    }
    // console.log(this.criteriosCabezera);
    this.mostrarTabla();

    sessionStorage.setItem('interesadosIdPromocion', idPromocion.toString());
    sessionStorage.setItem('interesadosIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('interesadosIdNacionalidad', idNacionalidad.toString());
   // console.log(sessionStorage);
  }

  sortChanged(columna): void {
    // this.limpiarVariablesSession();
    sessionStorage.removeItem('interesadosOrdenamiento');

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
      this._spinner.start('interesados2');
      this.mostrarTabla();
      // columna.sort = '';
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this._spinner.start('interesados3');
    this.mostrarTabla();
  }

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  mostrarTabla(): void {
    this._spinner.start('interesados1');
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

    // console.log(this.usuarioRol);

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
      // urlSearch.set('criterios', criterios);
    }

    ordenamiento = '';
    if (!sessionStorage.getItem('interesadosOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('interesadosOrdenamiento', ordenamiento);
    }

    if (!sessionStorage.getItem('interesadosCriterios')) {
      sessionStorage.setItem('interesadosCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('interesadosLimite') ? +sessionStorage.getItem('interesadosLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('interesadosPagina') ? +sessionStorage.getItem('interesadosPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('interesadosCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('interesadosOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    // console.log(urlSearch);

    this.interesadoService.getListaInteresado(
      this.erroresConsultas,
      urlSearch, this.configuracion.paginacion
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
          this.registros.push(new Interesado(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this._spinner.stop('interesados1');
        console.error(error);
        this.registroSeleccionado = null;
      },
      () => {
        this._spinner.stop('interesados1');
        // console.log('paginacionInfo', this.paginacion);
        // console.log('registros', this.registros);
        if (this.registros.length === 0) {
          this.desactivarBotonConvocatoria = true;
        }
        this.registroSeleccionado = null;
      }
    );
  }

  rowSeleccionado(registro): boolean {
    // //console.log(registro.id);
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    sessionStorage.removeItem('interesadosLimite');
    this.limite = Number(limite);
    sessionStorage.setItem('interesadosLimite', this.limite.toString());
    this.mostrarTabla();
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      // this.desactivarBotonConvocatoria = false;
    } else {
      this.registroSeleccionado = null;
    }
  }

  enviarCorreoInteresado(interesado: Interesado): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idPromocion.id~' + this.promocionId + ':IGUAL';
    urlSearch.set('criterios', criterios);
    this.convocatoria.getListaConvocatoria(
      this.erroresConsultas,
      urlSearch).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.entidadConvocatoria = new Convocatoria(item);
      });
      let formularioCorreo = new FormGroup({
        destinatario: new FormControl (interesado.email),
        asunto: new FormControl('Gracias por interesarte en COLSAN'),
        idPlantillaCorreo : new FormControl('2'),
        entidad: new FormControl({Convocatoria: this.entidadConvocatoria.id})
      });
      let jsonCorreo = JSON.stringify(formularioCorreo.value, null, 2);
      this.correoConvocatoria.postCorreoElectronico(
        jsonCorreo,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log(response);
          this.contador++;
          if (this.contador === this.registros.length) {
            this.mostrarTabla();
            this.desactivarBotonConvocatoria = true;
          }
        },
        error => {
          console.error(error);
        },
        () => {
          // console.log('Correo Enviado');
        }
      );
    });
  }

  cambiarEstatus(): void {
    let tipoEstatus: any = 0;
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.valor === 'Por contactar') {
        tipoEstatus = '7';
      }else {
        tipoEstatus = 0;
      }
      if ( tipoEstatus !== 0 ) {
        let estatus = {'idEstatus': tipoEstatus};
        let jsonFormulario = JSON.stringify(estatus, null, 2);
        this.interesadoService.putInteresado(
          this.registroSeleccionado.id,
          jsonFormulario, this.erroresGuardado
        ).subscribe(
          () => {}, // console.log('Success'),
          console.error,
          () => {
            this.mostrarTabla();
          }
        );
        this.registroSeleccionado = null;
      }
    } else {  }
  }

  ocultarOpcion(): any {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.valor !== 'Contactado'
        && this.registroSeleccionado.estatus.valor !== 'Convocatoria enviada') {
        return true;
      } else {
        return false;
      }
    }
  }

  desabilitarSelector(algo): any {
    if (algo === 'Convocatoria enviada') {
      return true;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Paginador                                                  //
///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    sessionStorage.removeItem('interesadosPagina');
    this.paginaActual = evento.page;
    sessionStorage.setItem('interesadosPagina', this.paginaActual.toString());
    this.mostrarTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  mostarBotonesCoordinador(): boolean {
    if (
      !this.oculto &&
      this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 8) {
      return true;
    }else {
      return false;
    }
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
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
  getCatNacionalidad(): void {
//    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1007 id del catalogo de estatus solo activos
    urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
    this.nacionalidadService.getListaSelectNacionalidad (
      this.erroresConsultas, urlParameter, false
    ).then(
      nacionalidades => {
        // console.log(nacionalidades);
        // let items = response.json().lista;
        if (nacionalidades) {
          for (let i in nacionalidades) {
            // console.log(items[i]);
          }
          nacionalidades.forEach(
            (item) => {
              this.opcionSelectNacionalidad.push(new ItemSelects(item.id, item.valor));
            }
          );
        }
      }
    );
  }

  enviarConvocatoriaByProgramaDocente(): void {
    this._spinner.start('enviarConvocatoriaByProgramaDocente');
    this.registrosEnviar = [];
    if (this._idProgramaDocente !== 0) {
      if (this.registros !== null) {
        this.contador = 0;
        this.registros.forEach((item) => {
          if (item.estatus.id !== 9) {
            let estatus = {'idEstatus': 9};
            let jsonFormulario = JSON.stringify(estatus, null, 2);
            this.interesadoService.putInteresado(
              item.id,
              jsonFormulario, this.erroresGuardado
            ).subscribe(
              response => {},
              error => {
                this._spinner.stop('enviarConvocatoriaByProgramaDocente');
                console.error(error);
              },
              () => {
                this._spinner.stop('enviarConvocatoriaByProgramaDocente');
                this.enviarCorreoInteresado(item);
              }
            );
          }else {
            this._spinner.stop('enviarConvocatoriaByProgramaDocente');
            this.contador++;
            if (this.contador === this.registros.length) {
              this.mostrarTabla();
              this.desactivarBotonConvocatoria = true;
            }
          }
        });
      }
      this._spinner.stop('enviarConvocatoriaByProgramaDocente');
    }
    this._spinner.stop('enviarConvocatoriaByProgramaDocente');
  }

  private prepareServices(): void {
    this._programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this._promocionService = this._catalogosService.getPromocion();
    this.interesadoService = this._catalogosService.getInteresados();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.correoConvocatoria = this._catalogosService.getEnvioCorreoElectronicoService();
    this.convocatoria = this._catalogosService.getConvocatoria();
    this.catalogoServices = this._catalogosService;

  }

  private getProgramaDocente(): void {
    if (this.oculto) {
      this.desahabilitarSelectorCoordiancion = true;
      let urlParameterCoordinador: URLSearchParams = new URLSearchParams();
      let criterioCoordinador = 'id~' + this.usuarioRol.usuario.programaDocente.id +
        ':IGUAL';
      urlParameterCoordinador.set('criterios', criterioCoordinador);
      this.programasDocentesSelect =
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
      this.promocionesSelect = this._catalogosService.getPromocion().
      getSelectPromocionProxima(this.erroresConsultas, urlParameter);

      let idPromocionSeleccionada = 'idPromocionSeleccionada';

      if (sessionStorage.getItem('interesadosIdPromocion')) {
        (<FormControl>this.formularioCriteriosCabecera.controls[idPromocionSeleccionada]).
        setValue(sessionStorage.getItem('interesadosIdPromocion'));
      }
      this.mostrarTabla();
    } else {
      this.programasDocentesSelect = this._programaDocenteService
        .getSelectProgramaDocente(this.erroresConsultas);
      this.mostrarTabla(); // esta dos veces por la asincronia y coordinacion
    }
  }

  ////////////////CODIGO DE MODAL´S/////////////////////////

  modalDetalles(): void {
    this.modalDetalle.open('lg');

    this.interesadoService
      .getEntidadInteresado(
        this.registroSeleccionado.id ,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadInteresado
          = new Interesado(response.json());
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
        // console.log(this.entidadInteresado);
      }
    );
  }
  cerrarModal1(): void {
      this.modalDetalle.close();
  }
  modalRegistro(): void {
    this.inicializarFormularioInteresado();
      this.modalRegistr.open('lg');
  }
  cerrarModal(): void {
    this.formulario.reset();
    this.modalRegistr.close();
  }
  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }
  enviarFormulario(): void {
    if (this.getControl('otroMedio').value !== '')
      (<FormControl>this.formulario.controls['auxiliarOtroMedio']).setValue(
        this.getControl('otroMedio').value
      );
    if (this.validarFormulario()) {
      this._spinner.start('modalintersado1');
      // codigo para enviar el formulario
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      // codigo para enviar el formulario
      this.interesadoService.postInteresadoModal(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {
          this.enviarCorreoAreaDocenciaNuevoInteresado(response.json().id);
          this.enviarCorreoInteresadoNuevo();
        },
        error => {
          console.error(error);
          this._spinner.stop('modalintersado1');
        },
        () => {

          this.mostrarTabla();
          this.cerrarModal();
          this._spinner.stop('modalintersado1');
        }
      );
    }
  }
  getCatalogoPaises(): void {
    //    SE OBTIENE CATALOGO DE PAISES
    this.opcionSelectPais =
      this.catalogoServices.getPais().getSelectPais(
        this.erroresConsultas);
  }

  getCatalogoProgramasDocente(): void {
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1007 id del catalogo de estatus solo activos
    urlParameter.set('criterios', 'idEstatus~' + '1007' + ':IGUAL');
    this.opcionSelectProgramaDocente =
      this.catalogoServices.getCatalogoProgramaDocente().getSelectProgramaDocente(
        this.erroresConsultas, urlParameter);
  }
  getCatalogoMediosInformativos(): void {
    //  SE OBTIENE CATALOGO DE MEDIOS INFORMATIVOS
    this.opcionSelectMedioDifusion =
      this.catalogoServices.getMedioDifusion().getSelectMedioDifusion(
        this.erroresConsultas);
  }
  // recaptcha
  displayReCaptcha() {
    let doc = <HTMLDivElement>document.body;
    let script = document.createElement('script');
    script.innerHTML = '';
    script.src = 'https://www.google.com/recaptcha/api.js?hl=es';
    script.async = true;
    script.defer = true;
    doc.appendChild(script);
  }

  checkReCaptch(response) {
    this.captcha = response;
    this.reCaptchaValido = true;
    this.appRef.tick();

  }

  // Mostrar campo otro
  mostraOtroService(): boolean {
    let valor = this.getControl('idMedioDifucion');
    if (valor.value == 7) { // id:7 === valor:'otro' actualmente
      (<FormControl>this.formulario.controls['auxiliarOtroMedio']).setValue('');
      return true;
    }else {
      (<FormControl>this.formulario.controls['auxiliarOtroMedio']).setValue('ok');
      (<FormControl>this.formulario.controls['otroMedio']).setValue('');
      return false;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
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
  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private getPromocionNuevoInteresado(programaDocenteId): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1011 id del estatus  de promociones solo promociones activas
    let listaEstatus: Array<Promocion> = [];
    let ordenamiento = 'id' + ':DESC';
    urlParameter.set('criterios', 'idProgramaDocente~' + programaDocenteId +
      ':IGUAL');
    urlParameter.set('ordenamiento', ordenamiento);
    // console.log(urlParameter);
    this.catalogoServices.getPromocion()
      .getSelectPromocionID(this.erroresConsultas, urlParameter).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          listaEstatus.push(new Promocion(item));
        });
        if (listaEstatus[0]) {
          (<FormControl>this.formulario.controls['idPromocion'])
            .setValue(listaEstatus[0].id);
        }
      }
    );
  }

  enviarCorreoAreaDocenciaNuevoInteresado(id: number): void {
    // console.log('Correo a docencia');
    let formularioCorreo1: FormGroup;
    if (id) {
      formularioCorreo1 = new FormGroup({
        destinatario: new FormControl('docencia@colsan.edu.mx'),
        entidad: new FormControl({interesados: id}),
        idPlantillaCorreo : new FormControl(14)
      });
      let jsonCorreo = JSON.stringify(formularioCorreo1.value, null, 2);
      this.correoConvocatoria.postCorreoElectronico(
        jsonCorreo,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log(response);
        },
        error => {
          console.error(error);

        },
        () => {

        }
      );
    }
  }

  enviarCorreoInteresadoNuevo(): void {
    // console.log('correo a interesado');

    let convocatoriaInteresado;

    let programaDocenteInteresado = this.getControl('idProgramaDocente').value;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idProgramaDocente.id~' + programaDocenteInteresado + ':IGUAL';
    let ordenamiento = 'id:DESC';
    urlSearch.set('criterios', criterios);
    urlSearch.set('ordenamiento', ordenamiento);

    this.convocatoria.getListaConvocatoria(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          convocatoriaInteresado = new Convocatoria(item);
        });
      },
      error => {
        console.error(error);
      },
      () => {
        let formularioCorreo: FormGroup;
        formularioCorreo = new FormGroup({
          destinatario: new FormControl(this.getControl('email').value ),
          asunto: new FormControl('Gracias por interesarte en COLSAN'),
          idPlantillaCorreo : new FormControl('1'),
          entidad: new FormControl({Convocatoria: convocatoriaInteresado.id})
        });
        let jsonCorreo = JSON.stringify(formularioCorreo.value, null, 2);
        this.correoConvocatoria.postCorreoElectronico(
          jsonCorreo,
          this.erroresGuardado
        ).subscribe(
          response => {
            // console.log(response);
          },
          error => {
            console.error(error);

          },
          () => {
          }
        );

      }
    );
  }

    limpiarVariablesSession() {
    sessionStorage.removeItem('interesadosCriterios');
    sessionStorage.removeItem('interesadosOrdenamiento');
    sessionStorage.removeItem('interesadosLimite');
    sessionStorage.removeItem('interesadosPagina');
  }

}
