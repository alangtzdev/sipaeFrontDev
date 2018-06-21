import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {NucleoAcademicoBasico} from '../../services/entidades/nucleo-academico-basico.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {EstatusCatalogoService} from '../../services/catalogos/estatus-catalogo.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import * as moment from 'moment';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {IntegranteNucleoAcademico} from '../../services/entidades/integrante-nucleo-academico.model';
import {Validacion} from '../../utils/Validacion';
import {IntegranteNucleoAcademicoService} from '../../services/entidades/integrante-nucleo-academico.service';
import {AuthService} from '../../auth/auth.service';
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {UsuarioRolService} from "../../services/usuario/usuario-rol.service";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";

@Component({
  selector: 'app-nab',
  templateUrl: './nab.component.html',
  styleUrls: ['./nab.component.css']
})
export class NabComponent implements OnInit {

  @ViewChild('modalCrudNAB')
  modalCrudNAB: ModalComponent;
  @ViewChild('modalDetalleNAB')
  modalDetalleNAB: ModalComponent;
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
  registros: Array<NucleoAcademicoBasico> = [];
  columnas: Array<any> = [
    { titulo: 'Programa docente*', nombre: 'idProgramaDocente'},
    { titulo: 'Fecha de aprobación', nombre: 'aprobacion' },
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  registroSeleccionado: NucleoAcademicoBasico;
  nucleoAcadBasicoService;
  public disabled: boolean = false;
  public status: {isopen: boolean} = {isopen: false};

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idProgramaDocente.descripcion' }
  };

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  usuarioRol: UsuarioRoles;

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  // variables de modal agregar/editar
  formularioNAB: FormGroup;
  edicionFormulario: boolean = false;
  entidadNAB: NucleoAcademicoBasico;
  validacionActiva: boolean = false;
  estadoBoton: boolean;
  numeroIntegrantes: number;
  numeroProfesor: number;
  registroProfesores: Array<IntegranteNucleoAcademico> = [];

  catalogoProfesores;
  catalogoProgramaDocente;
  catalogoEstatus;
  integrantesNABService;

  private opcionesCatalogoProfesores: Array<ItemSelects> = [];
  private opcionesCatalogoProgramaDocente: Array<ItemSelects> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];

  registrosNab: Array<NucleoAcademicoBasico>  = [];
  registrosProfesoresNab: Array<IntegranteNucleoAcademico>  = [];

  registroSeleccionadoIntegrante: IntegranteNucleoAcademico;

  columnasEditarForm: Array<any> = [
    { titulo: 'Profesor', nombre: 'profesor' }
  ];

  programaDocenteInvalido: boolean = false;
  registroMayorADos: boolean = false;

  registrosListaProfesores: Array<IntegranteNucleoAcademico> = [];

  mensajeErrorsProgramaDocente: Array<any> =
    [{mensaje: 'El Programa docente seleccionado ya cuenta con un NAB activo.',
      traduccion: 'Sólo puede haber un NAB por Programa docente.'}];

  mensajeErrorsIntegranteNAB: Array<any> =
    [{mensaje: 'El profesor seleccionado ya está registrado en 2 NAB activos',
      traduccion: 'Sólo puede haber 2 registros de profesor en NAB activos'}];

  idProgramaDocenteFromView: number;

  ////// picker ///
  dt: Date;

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public _estatusService: EstatusCatalogoService,
              public spinner: SpinnerService,
              private _authService: AuthService,
              private _usuarioRolService: UsuarioRolService
  ) {
    let usuarioLogueado: UsuarioSesion = this._authService.getUsuarioLogueado();
    this.recuperarPermisosUsuario(usuarioLogueado.id);

    this.inicializarFormulario();
    this.prepareServices();
  }

  private inicializarFormulario(): void {
    this.formularioNAB = new FormGroup({
      idProgramaDocente: new FormControl('', Validators.required),
      aprobacion: new FormControl(''),
      idEstatus: new FormControl('', Validators.required),
      idProfesor: new FormControl(''),
      idNucleoAcademico: new FormControl(),
      ultimaActualizacion:  new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))

    });

    this.dt =  new Date();
  }

  ngOnInit(): void {
    // this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    if (this.usuarioRol.rol.id === 2) {
      criterios = 'idProgramaDocente~' + this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
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
    // console.log(ordenamiento);
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    urlSearch.set('criterios', criterios);
    if (this.configuracion.filtrado.textoFiltro !== '') {
      this.spinner.start('nab1');
    }

    this.nucleoAcadBasicoService.getListaNucleoAcademicoBasico(
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
          this.registros.push(new NucleoAcademicoBasico(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this.spinner.stop('nab1');

      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this.spinner.stop('nab1');

      }
    );

  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

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

  cambiarEstatus(modo): void {
    ////console.log(modo);
    let idNAB: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    } else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      this.spinner.start('nab2');
      idNAB = this.registroSeleccionado.id;
      ////console.log(idNAB);
      let jsonCambiarEstatus = JSON.stringify(estatus, null, 2);
      ////console.log(jsonCambiarEstatus);

      this.nucleoAcadBasicoService.putNucleoAcademicoBasico(
        idNAB,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, // console.log('Success'),
        console.error,
        () => {
          this.spinner.stop('nab2');
          this.onCambiosTabla();
        }
      );
    }
  }

  ocultarOpcionActivar() {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar() {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1007) {
      return true;
    } else {
      return false;
    }
  }

  mostarBotones() {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

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
  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Metodo para formato de fecha                               //
///////////////////////////////////////////////////////////////////////////////////////////////

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////

  //                       Metodos para desplegar menu de boton de exportar                   //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  public toggled(open: boolean): void {
    // console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        // console.log(this.exportarExcelUrl);
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

  private prepareServices(): void {
    this.nucleoAcadBasicoService = this._catalogosService.getNucleoAcadBasico();
    this.catalogoEstatus = this._catalogosService.getEstatusCatalogo();
    this.catalogoProgramaDocente = this._catalogosService.getCatalogoProgramaDocente();
    this.catalogoProfesores = this._catalogosService.getProfesor();
    this.integrantesNABService = this._catalogosService.getIntegrantesNAB();
  }

  modalAgregarActualizarNAB(modo): void {
    this.inicializarFormulario();
    this.getSelectorCatalogos();
    this.edicionFormulario = false;
    if (modo === 'editar'  && this.registroSeleccionado) {
      this.getDatosNABSeleccionado();
    }
    this.modalCrudNAB.open('lg');
  }

  getSelectorCatalogos() {
    // console.log('modal agregar/detalle');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    this.opcionesCatalogoEstatus = this._estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);

    urlParameter.set('criterios', 'idEstatus~' + '1007' + ':IGUAL');
    // 1007 id del catalogo de estatus solo avtivos

    this.opcionesCatalogoProgramaDocente =
      this.catalogoProgramaDocente.
      getSelectProgramaDocente(this.erroresConsultas, urlParameter);

    urlParameter.set('criterios', 'idEstatus~' + '1007' + ',idClasificacion~1:IGUAL');
    urlParameter.set('ordenamiento', 'primerApellido:ASC,segundoApellido:ASC,nombre:ASC');
    this.opcionesCatalogoProfesores =
      this.catalogoProfesores.getSelectProfesorCriterios(this.erroresConsultas, urlParameter);
  }

  getDatosNABSeleccionado() {
    if (this.registroSeleccionado) {
      this.spinner.start('getDatosNAB');
      this.onCambiosProfesores();
      this.edicionFormulario = true;
      let nucleoAcademicoBasico: NucleoAcademicoBasico;
      this.nucleoAcadBasicoService
        .getEntidadNucleoAcademicoBasico(
          this.registroSeleccionado.id,
          this.erroresConsultas
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response => {
            nucleoAcademicoBasico = new NucleoAcademicoBasico(
              response.json());
            this.entidadNAB = nucleoAcademicoBasico;
          },
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
            this.spinner.stop('getDatosNAB');
            /*if (assertionsEnabled()) {
              console.error(error);
            }*/
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            /*if (assertionsEnabled()) {
              ////console.log();
            }*/
            if (this.formularioNAB) {
              let stringAprobacion = 'aprobacion';
              let stringIdProgramaDocente = 'idProgramaDocente';
              let stringIdEstatus = 'idEstatus';

              let fechaAprobacionRecuperar = moment(nucleoAcademicoBasico.aprobacion);

              (<FormControl>this.formularioNAB.controls[stringIdProgramaDocente])
                .patchValue(nucleoAcademicoBasico.programaDocente.id);
              (<FormControl>this.formularioNAB.controls[stringIdEstatus])
                .patchValue(nucleoAcademicoBasico.estatus.id);

              this.dt = new Date(fechaAprobacionRecuperar.toJSON());
            }
            this.spinner.stop('getDatosNAB');
          }
        );
    }
  }

  cerrarModal(): void {
    this.modalCrudNAB.close();
    this.programaDocenteInvalido = false;
    this.registroMayorADos = false;
  }

  onCambiosProfesores(): void {
    // console.log('lista de profesores');
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idNucleoAcademico~' + this.registroSeleccionado.id + ':IGUAL';
    urlSearch.set('criterios', criterio);
    urlSearch.set('ordenamiento', 'idProfesor.primerApellido:ASC,idProfesor.segundoApellido:ASC,idProfesor.nombre:ASC');

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<IntegranteNucleoAcademico>
    } = this.integrantesNABService.getListaIntegranteNucleoAcademico(
      this.erroresConsultas,
      urlSearch,
      false
      );
    this.registrosListaProfesores = resultados.lista;
    // console.log(resultados, 'sdjfhs');
    // console.log(this.registrosListaProfesores);
  }

  rowSeleccionadoEditar(registro): boolean {
    return (this.registroSeleccionadoIntegrante === registro);
  }

  rowSeleccionEditar(registro): void {
    if (this.registroSeleccionadoIntegrante !== registro) {
      this.registroSeleccionadoIntegrante = registro;
    } else {
      this.registroSeleccionadoIntegrante = null;
    }
  }

  getIdProgramaDocente(idProgramaDocente: number): void {
    this.idProgramaDocenteFromView = idProgramaDocente;
    // console.log('este es el id seleccionado'+this.idProgramaDocenteFromView);
  }

  enviarFormulario(): void {
    this.programaDocenteInvalido = false;
    let urlParameter: URLSearchParams = new URLSearchParams();

    if (this.validarFormulario()) {
      event.preventDefault();
      let jsonFormulario = JSON.stringify(this.formularioNAB.value, null, 2);

      if (this.edicionFormulario) {
        this.spinner.start('guardarEditarFormulario');
        this.nucleoAcadBasicoService
          .putNucleoAcademicoBasico(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          error => {
            this.spinner.stop('guardarEditarFormulario');
          }, // console.log('Success Edition'),
          console.error,
          () => {
            this.spinner.stop('guardarEditarFormulario');
            this.onCambiosTabla();
            this.cerrarModal();
          });
      } else {
        this.spinner.start('validacionProgramaInvalido');
        urlParameter.set('criterios',
          'idProgramaDocente~' + this.idProgramaDocenteFromView + ':IGUAL,idEstatus~1007');
        this.nucleoAcadBasicoService.getListaNucleoAcademicoBasico(
          this.erroresConsultas,
          urlParameter
        ).subscribe(
          response => {
            this.registrosNab = [];
            let respuesta = response.json();
            respuesta.lista.forEach((item) => {
              this.registrosNab.push(new NucleoAcademicoBasico(item));
            });
            this.registrosNab.forEach((item) => {
              if (this.idProgramaDocenteFromView == item.programaDocente.id) {
                this.programaDocenteInvalido = true;
              }
            });

            if (this.programaDocenteInvalido == false) {
              this.nucleoAcadBasicoService
                .postNucleoAcademicoBasico(
                  jsonFormulario,
                  this.erroresGuardado
                ).subscribe(
                response => {

                },
                error => {
                  console.error(error);
                  this.spinner.stop('validacionProgramaInvalido');
                },
                () => {
                  this.spinner.stop('validacionProgramaInvalido');
                  this.onCambiosTabla();
                  this.cerrarModal();
                }
              );
            }
          },
          error => {
            this.spinner.stop('validacionProgramaInvalido');
          },
          () => {
            this.spinner.stop('validacionProgramaInvalido');
          });
      }
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioNAB.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioNAB.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormulario(): boolean {
    if (this.formularioNAB.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  agregarIntegranteNAB(): void {
    this.registroMayorADos = false;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus~' + '1007' + ',idClasificacion~1:IGUAL');
    // 1007 id del catalogo de estatus activo, 1 id de Profesor Interno
    if (this.numeroIntegrantes < 1) {
      urlParameter.set('criterios', 'idProfesor~' + this.numeroProfesor + ':IGUAL,idNucleoAcademico.idEstatus~1007');
      this.integrantesNABService.getListaIntegrantesNucleoAcademicoPag(
        this.erroresConsultas, urlParameter
      ).subscribe(
        response => {
          this.registrosProfesoresNab = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosProfesoresNab.push(new IntegranteNucleoAcademico(item));
          });

          if (this.registrosProfesoresNab.length < 2) {
            // console.log('agregar profesor pasando la primera condicion');
            this.spinner.start('agregarProfesor');
            (<FormControl>this.formularioNAB.controls['idNucleoAcademico']).patchValue(this.registroSeleccionado.id);
            let jsonFormulario = JSON.stringify(this.formularioNAB.value, null, 2);
            this.integrantesNABService
              .postIntegranteNucleoAcademico(
                jsonFormulario,
                this.erroresGuardado
              ).subscribe(
              response => {
                // console.log(response.json());
              },
              error => {
                this.spinner.stop('agregarProfesor');
                console.error(error);
              }, // console.log('Success Save'),

              () => {
                this.spinner.stop('agregarProfesor');
                this.onCambiosProfesores();
              }
            );
          } else {
            // console.log('mo paso la condicion');
            this.registroMayorADos = true;
          }
        },
        error => {
          console.error(error);
        },
        () => {}

      );

    }else {
      this.opcionesCatalogoProfesores =
        this.catalogoProfesores.getSelectProfesorCriterios(
          this.erroresConsultas, urlParameter);
    }
    this.estadoBoton = false;
  }

  eliminarIntegrante (): void {
    if (this.registroSeleccionadoIntegrante) {
      this.spinner.start('eliminarIntegrante');
      this.integrantesNABService.deleteIntegranteNAB(
        this.registroSeleccionadoIntegrante.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, // console.log('Success'),
        console.error,
        () => {
          this.spinner.stop('eliminarIntegrante');
          this.onCambiosProfesores();
        }
      );
      this.registroSeleccionadoIntegrante = null;
    }else {
      // alert('Selecciona un registro');
      // //console.log('Selecciona un registro');
    }
  }

  mostarBotonesEditar() {
    if (this.registroSeleccionadoIntegrante) {
      return true;
    }else {
      return false;
    }
  }

  mostrarBotonAgregar(): boolean {
    return this.estadoBoton;
  }

  getIdProfesor(idProferos): void {
    this.estadoBoton = false;

    this.numeroProfesor = idProferos;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProfesor~' + this.numeroProfesor + ':IGUAL' +
      ',idNucleoAcademico~' + this.registroSeleccionado.id + ':IGUAL');
    // 1004 id del catalogo de estatus

    this.integrantesNABService.
    getListaIntegrantesNucleoAcademicoPag(this.erroresConsultas, urlParameter).subscribe(
      response => {
        this.registroProfesores = [];
        let respuesta = response.json();
        respuesta.lista.forEach((item) => {
          this.registroProfesores.push(new IntegranteNucleoAcademico(item));
        });
        this.numeroIntegrantes = this.registroProfesores.length;
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        if (this.numeroIntegrantes < 1) {
          this.estadoBoton = true;
        }else {
          this.estadoBoton = false;
        }
      }
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Datepicker                                                 //
///////////////////////////////////////////////////////////////////////////////////////////////

  getFechaRegistro(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioNAB.controls['aprobacion'])
        .patchValue(fechaConFormato + ' 10:30am');
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
    return null;
  }

  modalDetalles() {
    this.getDatosNABSeleccionado();
    this.modalDetalleNAB.open('lg');
  }

  cerrarModalDetalle() {
    this.modalDetalleNAB.close();
    this.entidadNAB = null;
  }

  limpiarFormulario() {
    this.validacionActiva = false;
    this.edicionFormulario = false;
    // this.formularioMateria.reset();
    this.getControl('idEstatus').patchValue('0');
    this.getControl('idSeriacion').patchValue('0');
    this.getControl('idProgramaDocente').patchValue('0');
    this.getControl('idTipo').patchValue('0');
  }

// Implementacion de filtro para docencia y para coordinacion

  hasRol(rol: string): boolean {
    return this._authService.hasRol(rol);
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this._usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        // console.log(response.json());
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          ////console.log(this.usuarioRol);
        });
      },
      error => {
      },
      () => {
        this.onCambiosTabla();
      }
    );
  }

}
