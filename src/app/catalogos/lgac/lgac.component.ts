import {Component, OnInit, Injector, Renderer, ViewChild} from '@angular/core';
import * as moment from 'moment';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Lgac} from '../../services/entidades/lgac.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {IntegranteLgac} from '../../services/entidades/integrante-lgac.model';
import {ProgramaDocente} from '../../services/entidades/programa-docente.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {NucleoAcademicoBasico} from '../../services/entidades/nucleo-academico-basico.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {IntegranteLgacService} from '../../services/entidades/integrante-lgac.service';
import {LgacService} from '../../services/entidades/lgac.service';

@Component({
  selector: 'app-lgac',
  templateUrl: './lgac.component.html',
  styleUrls: ['./lgac.component.css']
})
export class LgacComponent implements OnInit {

  @ViewChild('modalAgregarEditarLGAC')
  modalAgregarEditarLGAC: ModalComponent;
  @ViewChild('modalDetalleLGAC')
  modalDetalleLGAC: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  size: string = 'lg';
  output: string;
  private descripcionError: string = '';

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Lgac> = [];
  columnas: Array<any> = [
    { titulo: 'Denominación LGAC*', nombre: 'denominacion'},
    { titulo: 'Programa docente*', nombre: 'idProgramaDocente.descripcion', sort: false},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public disabled: boolean = false;
  public status: {isopen: boolean} = {isopen: false};

  registroSeleccionado: Lgac;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'denominacion,idProgramaDocente.descripcion,idProgramaDocente.descripcion' }
  };

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  /// variables para el agregar-editar registro lgac ////
  private registroLGACEditar: Lgac;
  formularioLGAC: FormGroup;
  edicionFormulario: boolean = false;
  entidadLgac: Lgac;
  idProfesor: number = 0;
  catalogos;
  catalogoProgramaDocente;
  validacionActiva: boolean = false;
  registrosLgac: Array<IntegranteLgac> = [];
  registrosIntegrantesLGAC: Array<IntegranteLgac> = [];
  estadoBoton: boolean = false;
  idProgramaDocente: number;
  idNab: number
  numeroIntegrantes: number;
  fechaInvalida: boolean = false;

  ////// picker ///
  public dt: Date = new Date();
  public dt2: Date = new Date(); // Para el 2da DatePicker
  public minDateFechaFin: Date = new Date();

  programaDocente: Array<ProgramaDocente> = [];

  columnasIntegrantesLGAC: Array<any> = [
      { titulo: 'Nombre del integrante', nombre: 'idProfesor', sort: false }
  ];
  registroIntegranteLGACSeleccionado: IntegranteLgac;

  public configuracionTablaIntegrantesLGAC: any = {
      paginacion: true,
      filtrado: { textoFiltro: '', columnas: 'idProfesor' }
  };

  private opcionesCatalogoProgramaDocente: Array<ItemSelects> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private opcionesCatalogoProfesores: Array<Profesor> = [];
  private opcionNAB: Array<NucleoAcademicoBasico> = [];
  private alertas: Array<Object> = [];
  /// fin de variables para el agregar-editar registro lgac ////

  /// inicia varialbes para el modal de detalle lgac ////
  private registroLGACDetalle: Lgac;
  private registrosIntegrantesDetalle: Array<IntegranteLgac> = [];
  /// fin de variables para el modal de detalle lgac ////
  constructor(//private modal: Modal,
              private injector: Injector,
              private _renderer: Renderer,
              public catalogosService: CatalogosServices,
              private integrantelgacService: IntegranteLgacService,
              private lgacService: LgacService,
              private _spinner: SpinnerService
  ) {
    this.prepareService();
    this.inicializarFormulario();
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
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
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    if (this.configuracion.filtrado.textoFiltro !== '') {
    }
    this._spinner.start("catalogolgac1");
    this.lgacService.getListaLgac(
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
          this.registros.push(new Lgac(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("catalogolgac1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("catalogolgac1");
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

/*  modalAgregarActualizarLGAC(modo): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let idLgac: number;
    if (modo === 'editar' && this.registroSeleccionado) {
      idLgac = this.registroSeleccionado.id;
    }

    if (modo === 'agregar' && this.registroSeleccionado) {
      this.registroSeleccionado = null;
      idLgac = null;
    }

    if ((modo === 'agregar') || (modo === 'editar' && this.registroSeleccionado)) {

      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ModalLGACData(
            this,
            idLgac)
        }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalLGAC,
        bindings,
        modalConfig
      );
    }
  }

  modalDetalles(): void {
    if (this.registroSeleccionado) {
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('lg', true, 27);
      if (this.registroSeleccionado) {
        let idLGAC = this.registroSeleccionado.id;
        let modalDetallesData = new DetalleLGACData(
          this,
          idLGAC
        );
        let bindings = Injector.resolve([
          provide(ICustomModal, { useValue: modalDetallesData }),
          provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
          provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
        ]);

        dialog = this.modal.open(
          <any>DetalleLGAC,
          bindings,
          modalConfig
        );
      }
    }
  }*/

  cambiarEstatusLGAC(modo): void {
    //console.log(modo);
    let idLGAC: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    }else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      idLGAC = this.registroSeleccionado.id;
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      this.lgacService.putLgac(
        idLGAC,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTabla();
        }
      );
    }
  }

  private prepareService(): void {
    this.lgacService =
      this.catalogosService.getlgac();
  }

///////////////////////////////////////////////////////////////////////////////////////////////
//                       Metodos para ocultar botones                                        //
///////////////////////////////////////////////////////////////////////////////////////////////

  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1007) {
      return true;
    } else {
      return false;
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
//                       Metodos para desplegar menu de boton de exportar                      //
///////////////////////////////////////////////////////////////////////////////////////////////
  public toggled(open: boolean): void {
    //console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        //console.log(this.exportarExcelUrl);
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

  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Metodo para formato de fecha                               //
///////////////////////////////////////////////////////////////////////////////////////////////

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format("DD/MM/YYYY");
    }
    return retorno;
  }

  /// inicia seccion de agregar-editar registro lgac ////
  modalAgregarActualizarLGAC(modo: string): void {
    this.prepareServicesModalAgregarEditar();
    if (modo === 'editar' && this.registroSeleccionado) {
      this.edicionFormulario = true;
      this.registroLGACEditar = this.registroSeleccionado;
      this.onCambiosTablaProfesores();
      this.cargarInformacionLGAC(this.registroLGACEditar);
    }

    if (modo === 'agregar' && this.registroSeleccionado) {
      this.registroSeleccionado = null;
      this.registroLGACEditar = null;
    }

    if ((modo === 'agregar') || (modo === 'editar' && this.registroSeleccionado)) {
      this.modalAgregarEditarLGAC.open('lg');
    }
  }
  private cargarInformacionLGAC(registroLGAC: Lgac): void {
    this.getControl('idProgramaDocente').patchValue(registroLGAC.programaDocente.id);
    this.getControl('idEstatus').patchValue(registroLGAC.estatus.id);
    this.getControl('denominacion').patchValue(registroLGAC.denominacion);
    this.getControl('tematica').patchValue(registroLGAC.tematica);

    // Recuperar fecha con formato en edicion
    this.dt = new Date(moment(registroLGAC.fechaInicio).toJSON());
    this.dt2 = new Date(moment(registroLGAC.fechaFin).toJSON());
    this.idProgramaDocente = registroLGAC.programaDocente.id;
    this.obtenerIntegrantesNab(this.idProgramaDocente);

  }

  private obtenerIntegrantesNab(idProgramaDocente): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL'+
        ',idEstatus~' + '1007' + ':IGUAL');
    // console.log('url:  ' + urlParameter);
    this.catalogosService.getNucleoAcadBasico().getListaNucleoAcademicoBasico(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
              response.json().lista.forEach((nab) =>{
                this.opcionNAB.push(new NucleoAcademicoBasico(nab));
            });
            this.opcionesCatalogoProfesores = this.opcionNAB[0].integrantesNab;
        }
    );
  }

  getDate(): string {
    if (this.dt) {
        let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
         (<FormControl>this.formularioLGAC.controls['fechaInicio'])
              .patchValue(fechaConFormato + ' 12:00am');
        return fechaConFormato;
    } else {
        return moment(new Date()).format('DD/MM/YYYY');
    }
  }


  getDateFecha(): string { //Metodo para incorporar uun 2da Datepick
      if (this.dt2) {
          let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
          (<FormControl>this.formularioLGAC.controls['fechaFin'])
                .patchValue(fechaConFormato + ' 12:00am');
          return fechaConFormato;
      } else {
          return moment(new Date()).format('DD/MM/YYYY');
      }
  }


  getControl(campo: string): FormControl {
        return (<FormControl>this.formularioLGAC.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
      if (!(<FormControl>this.formularioLGAC.controls[campo]).valid &&
          this.validacionActiva) {
          return true;
      }
      return false;
  }

  validarFormulario(): boolean {
      this.validarFecha();
      if (this.formularioLGAC.valid && !this.fechaInvalida) {
          this.validacionActiva = false;
          return true;
      }
      this.validacionActiva = true;
      return false;
  }

  validarFecha(): any {
    let fechaInicio = moment(this.dt).format('L');
    let fechaFin = moment(this.dt2).format('L');

    let splitFechaDe = fechaInicio.split('/');
    let dateFechaDe = new Date(Number(splitFechaDe[2]), Number(splitFechaDe[1]) - 1, Number(splitFechaDe[0]));

    let splitFechaHasta = fechaFin.split('/');
    let dateFechaHasta =
        new Date(Number(splitFechaHasta[2]), Number(splitFechaHasta[1]) - 1, Number(splitFechaHasta[0]));
    if (dateFechaDe > dateFechaHasta) {
        //console.log('fecha menor');
        this.fechaInvalida = true;
        //console.log('fechainvalida', this.fechaInvalida);
        (<FormControl>this.formularioLGAC.controls['fechaInvalida']).patchValue('');
        this.addErrorsMesaje('La fecha fin debe ser mayor a la fecha de inicio', 'danger');

    } else {
        this.fechaInvalida = false;
        (<FormControl>this.formularioLGAC.controls['fechaInvalida']).patchValue('1');

    }
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
        event.preventDefault();
        let jsonFormulario = JSON.stringify(this.formularioLGAC.value, null, 2);
        // console.log(jsonFormulario);
        if (this.edicionFormulario) {
            this.lgacService
                .putLgac(
                    this.registroLGACEditar.id,
                    jsonFormulario,
                    this.erroresGuardado
                ).subscribe(
                () => {}, // console.log('Success Edition'),
                console.error,
                () => {
                    this.onCambiosTabla();
                    this.cerrarModalAgregarEditar();
                 }
            );
        } else {
            this.lgacService
                .postLgac(
                    jsonFormulario,
                    this.erroresGuardado
                ).subscribe(
                () => {}, // console.log('Success'),
                console.error,
                () => {
                    this.onCambiosTabla();
                    this.cerrarModalAgregarEditar();
                }
            );
        }
    } else {
    }
  }

  agregarProfesor(): void {
    let objForm = {
        idProfesor: this.idProfesor,
        idLgac: this.registroLGACEditar.id,
    };

    let jsonFormulario = JSON.stringify(objForm, null, 2);
    this._spinner.start('agregarProfesor');
    this.catalogosService.
    getIntegrantesLgacService().postIntegranteLgac(
        jsonFormulario,
        this.erroresGuardado
    ).subscribe(
        response => {}, // console.log('Success'),
        error => {
          this._spinner.stop('agregarProfesor');
        },
        () => {
            this._spinner.stop('agregarProfesor');
            this.onCambiosTablaProfesores();
        }
    );
    this.limpiarCampo();
  }

  limpiarCampo(): void {
      (<FormControl>this.formularioLGAC.controls['idProfesor']).patchValue('');
  }

  rowSeleccionadoTablaModalAgregarEditar(registro): boolean {
      return (this.registroIntegranteLGACSeleccionado === registro);
  }

  rowSeleccionTablaModalAgregarEditar(registro): void {
      if (this.registroIntegranteLGACSeleccionado !== registro) {
          this.registroIntegranteLGACSeleccionado = registro;
      } else {
          this.registroIntegranteLGACSeleccionado = null;
      }
  }

  eliminarProfesor () {
      if (this.registroIntegranteLGACSeleccionado) {
          this._spinner.start('eliminarProfesor');
          this.catalogosService.
          getIntegrantesLgacService().deleteProfesor(
              this.registroIntegranteLGACSeleccionado.id,
              this.erroresConsultas
          ).subscribe(
              response => {
                this._spinner.stop('eliminarProfesor');
              }, // console.log('Success'),
              error => {
              },
              () => {
                this._spinner.stop('eliminarProfesor');
                  this.onCambiosTablaProfesores();
              }
          );
      } else {
          // console.log('Selecciona un registro');
      }
  }

  ocultarOpcionEliminar(): boolean {
        if (this.registroIntegranteLGACSeleccionado) {
            return true;
        } else {
            return false;
        }
    }

    onCambiosTablaProfesores(): void {
        if (this.registroLGACEditar.id) {
            // console.log('Entra a oncambios tabla');
            let urlSearch: URLSearchParams = new URLSearchParams();

            let criterios = '';
            criterios = criterios + ((criterios === '') ? '' : ',') + 'idLgac~' +
                this.registroLGACEditar.id + ':IGUAL';
            if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
                let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
                filtros.forEach((filtro) => {
                    criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
                        this.configuracion.filtrado.textoFiltro + ':LIKE';
                });
            }

            let ordenamiento = '';
            this.columnas.forEach((columna) => {
                if (columna.sort) {
                    ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
                        columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
                }
            });
            urlSearch.set('criterios', criterios);
            //urlSearch.set('ordenamiento', ordenamiento);
            //urlSearch.set('limit', this.limite.toString());
            //urlSearch.set('pagina', this.paginaActual.toString());
            let resultados: {
                paginacionInfo: PaginacionInfo,
                lista: Array<IntegranteLgac>
            } = this.integrantelgacService
                .getListaIntegranteLgac(
                    this.erroresConsultas,
                    urlSearch,
                    false
                );
            this.registrosIntegrantesLGAC = resultados.lista;
        }
    }

    setLimiteTablaModalAgregarEditar(limite: string): void {
        this.limite = Number(limite);
        this.onCambiosTablaProfesores();
    }

    sortChangedTablaModalAgregarEditar(columna): void {
        if (columna.sort !== false) {
            if (columna.sort) {
                columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
            } else {
                columna.sort = 'desc';
            }
            this.onCambiosTablaProfesores();
        }
    }

    cambioProfesor(idProfesor): void {
        this.idProfesor = idProfesor;
        // console.log('TRAIGO ID: ', +idProfesor);
        this.estadoBoton = false;
        if (idProfesor) {
            let urlParameter: URLSearchParams = new URLSearchParams();
            urlParameter.set('criterios', 'idProfesor~' + idProfesor + ':IGUAL' +
                ',idLgac~' + this.registroLGACEditar.id + ':IGUAL');
            this.catalogos.getIntegrantesLgacService().getListaIntegranteLgacPag(
                this.erroresConsultas,
                urlParameter
            ).subscribe(
                response => {
                    this.registrosLgac = [];
                    let respuesta = response.json();
                    respuesta.lista.forEach((item) => {
                        this.registrosLgac.push(new IntegranteLgac(item));
                    });
                    this.numeroIntegrantes = this.registrosLgac.length;
                    // console.log('TAMAÑO LISTA: ' + this.registrosLgac.length);
                },
                error => {},
                () => {
                    if (this.numeroIntegrantes < 1) {
                        this.estadoBoton = true;
                    } else {
                        this.estadoBoton = false;
                    }
                }
            );
        } else {
            this.estadoBoton = false;
        }
    }

    mostrarBotonAgregar(): boolean {
        return this.estadoBoton;
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

  private prepareServicesModalAgregarEditar(): void {
      this.catalogos = this.catalogosService;
      this.opcionesCatalogoEstatus =
          this.catalogos.getEstatusCatalogo().
          getSelectEstatusCatalogo(this.erroresConsultas);

      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL'); // 1004 id del catalogo de estatus
      // console.log(':::::::' + urlParameter);
      this.opcionesCatalogoEstatus =
          this.catalogos.getEstatusCatalogo().getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);

      // 1007 id del catalogo de estatus solo activos
      urlParameter.set('criterios', 'descripcion~Licenciatura' +
        ':NOTLIKE;' + 'AND,' + 'idEstatus~' + '1007' + ':IGUAL');
      this.opcionesCatalogoProgramaDocente =
          this.catalogos.getCatalogoProgramaDocente().
          getSelectProgramaDocente(this.erroresConsultas, urlParameter);
  }

  private inicializarFormulario(): void {
    this.formularioLGAC = new FormGroup({
            idProgramaDocente: new FormControl('', Validators.required),
            denominacion: new FormControl('', Validators.compose([Validacion.parrafos,
                Validators.required])),
            fechaInicio: new FormControl(),
            fechaFin: new FormControl(),
            tematica: new FormControl('', Validators.compose([Validacion.parrafos,
                Validators.required])),
            idEstatus: new FormControl('', Validators.required),
            creditos: new FormControl('12'),
            ultimaActualizacion:  new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
            idProfesor: new FormControl(''),
            fechaInvalida: new FormControl('')
        });

  }

  private cerrarModalAgregarEditar(): void {
    this.formularioLGAC.reset();
    this.validacionActiva = false;
    this.registroLGACEditar = undefined;
    this.edicionFormulario = false;
    this.registrosLgac  = [];
    //this.registrosIntegrantesLGAC  = [];
    this.estadoBoton = false;
    this.idProgramaDocente = undefined;
    this.idNab = undefined;
    this.numeroIntegrantes = undefined;
    this.fechaInvalida = false;
    this.dt = new Date();
    this.dt2 = new Date();
    this.opcionesCatalogoEstatus = [];
    this.opcionesCatalogoProgramaDocente = [];
    this.opcionesCatalogoProfesores = [];
    this.modalAgregarEditarLGAC.close();
  }
  /// Fin seccion de agregar-editar registro lgac ////
  /// Inicio seccion de detalle lgac ////
  public modalDetalles(): void {
    if (this.registroSeleccionado) {
      this.registroLGACDetalle = this.registroSeleccionado;
      this.onCambiosTablaDetalle(this.registroLGACDetalle.id);
      this.modalDetalleLGAC.open('lg');
    }
  }

  public cerrarModalDetalleLgac(): void {
    this.registroLGACDetalle = undefined;
    this.modalDetalleLGAC.close();
  }

  onCambiosTablaDetalle(idLgac): void {

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    criterios = criterios + ((criterios === '') ? '' : ',') + 'idLgac~' +
        idLgac + ':IGUAL';
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
        let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
        filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
                this.configuracion.filtrado.textoFiltro + ':LIKE';
        });
    }

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
        if (columna.sort) {
            ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
                columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
    });
    urlSearch.set('criterios', criterios);
    urlSearch.set('ordenamiento', ordenamiento);
    //urlSearch.set('limit', this.limite.toString());
    //urlSearch.set('pagina', this.paginaActual.toString());
    let resultados: {
        paginacionInfo: PaginacionInfo,
        lista: Array<IntegranteLgac>
    } = this.integrantelgacService.getListaIntegranteLgac(
        this.erroresConsultas,
        urlSearch,
        false
    );
    this.registrosIntegrantesDetalle = resultados.lista;
  }

  private obtenerFechaDetalle(fecha: string): string {
    let retorno = '';
    if (fecha) {
         retorno = moment(fecha).format('D/MM/YYYY');
    }
    return retorno;
  }
/// fin de seccion de detalle lgac ////
}
