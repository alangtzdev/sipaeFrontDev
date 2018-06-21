import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {EstudianteMovilidadExternaService} from '../../services/entidades/estudiante-movilidad-externa.service';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ItemSelects} from '../../services/core/item-select.model';
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {Router} from '@angular/router';
import {ProgramaDocenteServices} from '../../services/entidades/programa-docente.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';
import {AuthService} from '../../auth/auth.service';
import {NacionalidadService} from '../../services/catalogos/nacionalidad.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {Promocion} from '../../services/entidades/promocion.model';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {PromocionService} from '../../services/servicios-especializados/promocion/promocion.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';

@Component({
  selector: 'app-aceptados-rechazados',
  templateUrl: './aceptados-rechazados.component.html',
  styleUrls: ['./aceptados-rechazados.component.css']
})
export class AceptadosRechazadosComponent implements OnInit {

  // modals
  @ViewChild('modalPromocion')
  modalPromocion: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  usuarioRolService;
  usuarioRol: UsuarioRoles;

  estudianteMovilidadExternaService: EstudianteMovilidadExternaService;
  dt: Date = new Date();
  maxDate: Date = new Date();
  fechaBuscar;
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  catalogoServices;
//   nacionalidadService;
  programasDocentesSelect: Array<ItemSelects> = [];
  opcionSelectNacionalidad: Array<ItemSelects> = [];
  registros: Array<any> = [];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  columnas: Array<any> = [
    { titulo: 'Nombre*', nombre: 'idDatosPersonales.primerApellido' },
    { titulo: 'Correo electrónico*', nombre: 'idDatosPersonales.email'},
    { titulo: 'Programa docente', nombre: 'idProgramaDocente.descripcion'},
    { titulo: 'Promoción', nombre: 'idPromocion.abreviatura', sort: false},
    { titulo: 'Fecha de registro', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus.valor' }
  ];
  conPromocion: boolean = false;
  registroSeleccionado: EstudianteMovilidadExterna;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idDatosPersonales.nombre,' +
    'idDatosPersonales.primerApellido,idDatosPersonales.segundoApellido,' +
    'idDatosPersonales.email'}
  };
  btnActivo: boolean = false;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  // variables modal agregar promocion
  asignarPromocion: FormGroup;
  validacionActiva = false;
  opcionesPromociones: Array<Promocion> = [];

  constructor(// private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              private nacionalidadService: NacionalidadService,
              private router: Router,
              private _programaDocente: ProgramaDocenteServices,
              public _catalogosService: CatalogosServices,
              private authService: AuthService,
              private promocionService: PromocionServices
  ) {
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.prepareServices();
    // this.mostrarTabla();
    this.getCatNacionalidad();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.inicializarFormularioPromocion();
  }

  inicializarFormularioPromocion() {
    this.asignarPromocion = new FormGroup({
      idPromocion: new FormControl('', Validators.compose([Validators.required])),
      idEstatus: new FormControl('1006')
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
        });
        this.getProgramaDocente(this.usuarioRol.rol.id);
      }
    );
  }

  ngOnInit(): void {

  }

  opcionAsignar(): void {
    if (this.registroSeleccionado && this.registroSeleccionado.idPromocion.id) {
      this.conPromocion = false;
    } else {
      this.conPromocion = true;
    }
    // console.log(this.registroSeleccionado.idPromocion.id && this.registroSeleccionado);
    // console.log(this.conPromocion, 'sfs');

    // this.conPromocion = (this.registroSeleccionado && this.registroSeleccionado.idPromocion.id);
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    fecha: string,
    idNacionalidad: number
  ): void  {// this.fechaBuscar
    this.criteriosCabezera = '';
    // this.criteriosCabezera = 'ultimaActualizacion~' + fecha + ':MAYOR;AND';
    if (idProgramaDocente) {
      this.criteriosCabezera = this.criteriosCabezera +
        ',idProgramaDocente~' + idProgramaDocente + ':IGUAL;ANDGROUPAND';
      if (idNacionalidad) {
        if (idNacionalidad == 5) {
          // TODO construccion de filtro para nacionalidad
          this.criteriosCabezera = this.criteriosCabezera + ',idDatosPersonales.idPaisOrigen~'
            + 82 + ':IGUAL';
        } else {
          this.criteriosCabezera = this.criteriosCabezera + ',idDatosPersonales.idPaisOrigen~'
            + 82 + ':NOT';
        }
      }
    }
    if (idNacionalidad && !idProgramaDocente) {
      if (idNacionalidad == 5) {
        // TODO construccion de filtro para nacionalidad
        this.criteriosCabezera = this.criteriosCabezera + ',idDatosPersonales.idPaisOrigen~'
          + 82 + ':IGUAL';
      }else {
        this.criteriosCabezera = this.criteriosCabezera + ',idDatosPersonales.idPaisOrigen~'
          + 82 + ':NOT';
      }
    }
    if (!idNacionalidad && !idProgramaDocente) {
      this.criteriosCabezera += 'ultimaActualizacion~' + fecha + ':MAYOR;OR';
    } else {
      this.criteriosCabezera += ';ANDGROUPAND,ultimaActualizacion~' + fecha + ':MAYOR;OR';
    }
    this.mostrarTabla();
  }

  mostrarTabla(): void {
    /* Se agrega criterio para mostrar los siguientes estatus de aspirante/estudiante de movilidad
    * 1005 - Aspirante
    * 1006 - Estudiante
    * 1010 - Por validar
    * 1002 - Aspirante-aceptado
    * 1009 - Incumple
    * */
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idEstatus.id~1005:IGUAL;OR,idEstatus.id~1006:IGUAL;OR,' +
      'idEstatus.id~1010:IGUAL;OR,idEstatus.id~1002:IGUAL;OR,idEstatus.id~1009:IGUAL;OR';
    urlSearch.set('criterios', criterios);

    if (this.criteriosCabezera !== '') {
      criterios =  criterios + 'GROUPAND' + this.criteriosCabezera;
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
    // console.log(urlSearch);
    this._spinner.start('aceptadosrechazados1');

    this.estudianteMovilidadExternaService.getListaEstudianteMovilidadExterna(
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
          this.registros.push(new EstudianteMovilidadExterna(item));
        });
        this._spinner.stop('aceptadosrechazados1');
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('aceptadosrechazados1');
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop('aceptadosrechazados1');
      }
    );
  }

/*  modalAgregarPromocion(): void {
    if (this.registroSeleccionado) {
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('sm', true, 27);
      let modalFormularioData = new ModalAgregarPromocionData(
        this.registroSeleccionado.id,
        this
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, {useValue: modalFormularioData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalAgregarPromocion,
        bindings,
        modalConfig
      );
    } else {  }
  }*/

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
      this.mostrarTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.mostrarTabla();
  }

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.opcionAsignar();
    } else {
      this.registroSeleccionado = null;
    }
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.mostrarTabla();
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
/*    if (assertionsEnabled()) {
      // console.log('evento', evento);
      // console.log('Page changed to: ' + evento.page);
      // console.log('Number items per page: ' + evento.itemsPerPage);
      // console.log('paginaActual', this.paginaActual);
    }*/
    this.mostrarTabla();
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          // alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          // alert('no existe url para exportar a PDF');
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
/*    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1007 id del catalogo de estatus solo activos
    urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
    ////console.log(urlParameter);
    this.opcionSelectNacionalidad =
      this.nacionalidadService.getListaSelectNacionalidad (
        this.erroresConsultas, urlParameter);*/
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  ////// picker ///
  getDate(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      this.fechaBuscar = moment(this.dt).format();
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }

  detalle(): void {
    if (this.registroSeleccionado) {
      // console.log('dvsdvsdvs');
      this.router.navigate([ 'movilidad-academica', 'detalle',
        {id: this.registroSeleccionado.id}]);
    }
  }

  generarFormatoFormalizacion(): any {
    this.estudianteMovilidadExternaService.getFormatoPdfEstExteMov(
      this.registroSeleccionado.id,
      this.erroresConsultas,
      'Formalizacion'
    ).subscribe(
      response => {
        window.open(response.json());
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      }
    );
  }

  hasRol(rol: string): boolean {
    return this.authService.hasRol(rol); // Seguridad.hasRol(rol);
  }

  private getProgramaDocente(id: number): void {
    if (id === 2) { // Si valor igual a id de COORDINADOR
      this.programasDocentesSelect.push(
        new ItemSelects (
          this.usuarioRol.usuario.programaDocente.id,
          this.usuarioRol.usuario.programaDocente.descripcion
        )
      );
      this.criteriosCabezera = 'idProgramaDocente~' +
        this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
      this.mostrarTabla();
    } else {
      this.programasDocentesSelect = this._programaDocente
        .getSelectProgramaDocente(this.erroresConsultas);
      this.mostrarTabla();
    }
  }

  private prepareServices(): void {
    this.estudianteMovilidadExternaService = this._catalogosService.
    getEstudianteMovilidadExterna();
    this.catalogoServices = this._catalogosService.getInteresadoMovilidadExterna();
//    this.getCatNacionalidad();
//    this.nacionalidadService = this._catalogosService.getNacionalidad();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
  }

  modalAgregarPromocion() {
    this.inicializarFormularioPromocion();
    this.obtenerPromociones(this.registroSeleccionado.idProgramaDocente.id);
    this.modalPromocion.open('sm');
  }

  enviarFormularioPromoAgregar(): void {
    this._spinner.start('savePromocion');
    if (this.validarFormularioAgregarPromo()) {
      let jsonFormulario = JSON.stringify(this.asignarPromocion.value, null, 2);
      this.estudianteMovilidadExternaService
        .putEstudianteMovilidadExterna(
          this.registroSeleccionado.id,
          jsonFormulario,
          this.erroresConsultas
        ).subscribe(
        response => {

        },
        error => {
          console.error(error);
          this._spinner.stop('savePromocion');
        },
        () => {
          /*if (assertionsEnabled()) {
          }*/
          // console.log('Success');
          this._spinner.stop('savePromocion');

          this.mostrarTabla();
          this.cerrarModalAgregarPromo();
        }
      );
    }
  }


  validarFormularioAgregarPromo(): boolean {
    if (this.asignarPromocion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  private getControlAgregarPromo(campo: string): FormControl {
    return (<FormControl>this.asignarPromocion.controls[campo]);
  }

  private getControlErrorsAgregarPromo(campo: string): boolean {
    /*if (!(<FormControl>this.asignarPromocion.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;*/
    return (!(<FormControl>this.asignarPromocion.controls[campo]).valid && this.validacionActiva);
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
    return resultado;
  }

  obtenerPromociones(id: number): void {
    // console.log('Programa docente: ' + id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + id +
      ':IGUAL' + ',idEstatus.id~1011:IGUAL');
    this.opcionesPromociones = this.promocionService.getListaPromocion(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }

  cerrarModalAgregarPromo() {
    this.modalPromocion.close();
  }

}
