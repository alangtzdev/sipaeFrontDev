import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import * as moment from 'moment';
import {Boleta} from '../../services/entidades/boleta.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';

@Component({
  selector: 'app-boletas-calificacion',
  templateUrl: './boletas-calificacion.component.html',
  styleUrls: ['./boletas-calificacion.component.css']
})
export class BoletasCalificacionComponent {

  @ViewChild('modalAceptar')
  modalAceptar: ModalComponent;
  @ViewChild('modalAlertaCalificaciones')
  modalAlertaCalificaciones: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  criteriosCabezera: string = '';
  // variables para la tabla materias
  paginacion: PaginacionInfo;
  paginasArray: Array<number> = [];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Boleta> = [];
  registroSeleccionado: Boleta = null;
  columnas: Array<any> = [
    { titulo: 'Mátricula*', nombre: 'idEstudiante.idMatricula.matriculaCompleta', sort: 'asc'},
    { titulo: 'Nombre del estudiante*', nombre: 'idEstudiante', sort: false},
    { titulo: 'Período Escolar', nombre: 'idPeriodoEscolar', sort: false},
    { titulo: 'Estatus', nombre: 'expedida'},
  ];
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,'
    + 'idEstudiante.idDatosPersonales.primerApellido,'
    + 'idEstudiante.idDatosPersonales.segundoApellido,' +
    'idEstudiante.idMatricula.matriculaCompleta' }
  };

  catalogoService;
  programaDocenteService;
  periodoService;
  promocionService;
  boletaService;
  estudianteMateriaImpartidaService;

  listaProgramaDocente: Array<ItemSelects> = [];
  listaPeriodo: Array<ItemSelects> = [];
  listaPromocion: Array<ItemSelects> = [];
  deshabilitar: boolean = true;

  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private registrosMateria: Array <EstudianteMateriaImpartida> = [];

  constructor(// private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              private _catalogosService: CatalogosServices) {
    this.dt = new Date();
    this.prepareServices();
    this.inicializarformularioBoletas();

    if (sessionStorage.getItem('boletas')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('boletasCriterios')) {
      this.onCambiosTabla();
    }
  }

  private prepareServices(): void {
    this.catalogoService = this._catalogosService;
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosService.getPromocion();
    this.periodoService = this._catalogosService.getPromocionPeriodoEscolarService();
    this.boletaService = this._catalogosService.getBoletaService();
    this.estudianteMateriaImpartidaService =
      this._catalogosService.getEstudianteMateriaImpartidaService();
    this.listaProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
    this.onCambiosTabla();
  }

  verificarCalificaciones(): void {
    if (this.registroSeleccionado) {
      this._spinner.start('boletascalificacion1');
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstudiante.id~' +
        this.registroSeleccionado.estudiante.id + ':IGUAL,' +
        'idMateriaImpartida.idPeriodoEscolar.id~' +
        this.registroSeleccionado.periodoEscolar.id + ':IGUAL;AND');

      this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.erroresConsultas,
        urlParameter,
        false
      ).subscribe(
        response => {
          // let i: number = 0;
          response.json().lista.forEach((elemento) => {
            this.registrosMateria.push(new EstudianteMateriaImpartida(elemento));
          });
        },
        error => {
          this._spinner.stop('boletascalificacion1');
//          console.error(error);
        },
        () => {
          this.registrosMateria.forEach((materia) => {
            if (materia.calificacionOrdinaria) {
              this.deshabilitar = false;
            }else {
              this.deshabilitar = true;
            }});
          if (this.deshabilitar === true) {
            this.modalAdvertenciaBoleta();
          }

          this._spinner.stop('boletascalificacion1');
        });
    }
  }

/*  modalConfirmacionBoletaCalificacion(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalConfirmarBoletaCalificacionData(
        this.registroSeleccionado,
        this
      ) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
      <any>ModalConfirmarBoletaCalificacion,
      bindings,
      modalConfig
    );
  }*/

/*  modalDetalleBoletas(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalDetalleBoletaData(2, 3) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);
    dialog = this.modal.open(
      <any>ModalDetalleBoleta,
      bindings,
      modalConfig
    );
  }*/

/*  modalAdvertenciaBoleta(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);
    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalAdvertenciaBoletaData(2, 3) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);
    dialog = this.modal.open(
      <any>ModalAdvertenciaBoleta,
      bindings,
      modalConfig
    );
  }*/

  recuperarPromociones(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente.id~' + id + ':IGUAL');
    this.listaPromocion =
      this.promocionService.getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  recuperarPeriodos(id: number): void {
    // console.log(id);
    // FALTA RECUPERAR LISTA DE PERIODOS ESCOLARES
    /*this.promocionService.getPromocion(
     id,
     this.erroresConsultas
     ).subscribe(
     response => {
     //console.log(response.json());
     let a: Promocion = new Promocion (response.json());
     //console.log(a);
     }
     );*/
    // Posiblemente no se use el codigo de abajo
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idPromocion.id~' + id + ':IGUAL');
    this.periodoService.getListaPromocionPeriodoEscolarPaginacion(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          // console.log(elemento);
          let auxiliar = new PromocionPeriodoEscolar(elemento);
          this.listaPeriodo.push(
            new ItemSelects(
              auxiliar.idPeriodoEscolar.id,
              auxiliar.idPeriodoEscolar.getPeriodo()
            )
          );
        });
      },
      error => {
        console.error(error);
      },
      () => {
        // console.log(this.listaPeriodo);
      }
    );
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  setLimite(limite: string): void {
    sessionStorage.removeItem('boletasLimite');
    this.limite = Number(limite);
    sessionStorage.setItem('boletasLimite', this.limite.toString());
    this.onCambiosTabla();
  }

  cambiarPagina(evento: any): void {
    sessionStorage.removeItem('boletasPagina');
    this.paginaActual = evento.page;
    sessionStorage.setItem('boletasPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  buscarCriteriosCabezera(
    idPrograma: number,
    idPromocion: number,
    idPeriodo: number
  ): void {
    this.limpiarVariablesSession();
    this.criteriosCabezera = '';
    if (idPrograma) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.idProgramaDocente.id~'
        + idPrograma + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + ',idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    if (idPeriodo) {
      this.criteriosCabezera = this.criteriosCabezera + ',idPeriodoEscolar.id~'
        + idPeriodo + ':IGUAL';
    }
    // console.log(this.criteriosCabezera);
    sessionStorage.setItem('boletasIdPromocion', idPrograma.toString());
    sessionStorage.setItem('boletasIdProgramaDocente', idPromocion.toString());
    sessionStorage.setItem('boletasIdNacionalidad', idPeriodo.toString());
           this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    //
    this._spinner.start('boletascalificacion2');
    this.registroSeleccionado = null;
    this.deshabilitar = true;

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

    criterios = this.criteriosCabezera;
    urlSearch.set('criterios', criterios);

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      if (criterios !== '')
        criterios += ';ANDGROUPAND';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlSearch.set('criterios', criterios);
    }
    if (!sessionStorage.getItem('boletasOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('boletasOrdenamiento', ordenamiento);
    }

    if (!sessionStorage.getItem('boletasCriterios')) {
      sessionStorage.setItem('boletasCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('boletasLimite') ? +sessionStorage.getItem('boletasLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('boletasPagina') ? +sessionStorage.getItem('boletasPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('boletasCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('boletasOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());


    this.boletaService.getListaBoleta(
      this.erroresConsultas,
      urlSearch,
      true
    ).subscribe(
      response => {
        this.registros = [];
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
        // console.log('this.paginacion');
        // console.log(this.paginacion);
        paginacionInfoJson.lista.forEach((elemento) => {
          this.registros.push(new Boleta(elemento));
        });
      },
      error => {
        console.error(error);
        this._spinner.stop('boletascalificacion2');
      },
      () => {
        this._spinner.stop('boletascalificacion2');
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.verificarCalificaciones();
    } else {
      this.registroSeleccionado = null;
      this.deshabilitar = true;
    }
  }

  sortChanged(columna): void {
    sessionStorage.removeItem('boletasOrdenamiento');
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  // variables modal confirmar boleta
  boletaForm: FormGroup;
  exportarPDFUrl = '';
  boletaExpedida: boolean = false;
  public dt: Date;


  modalConfirmacionBoletaCalificacion() {
    this.boletaExpedida = this.registroSeleccionado.expedida;
    if (this.registroSeleccionado.expedida) {
      let fechaBoletaExpedida =
        moment(this.registroSeleccionado.fechaExpedicion);
      this.dt = new Date (fechaBoletaExpedida.toJSON());
    }
    this.modalAceptar.open('sm');
  }

  cerrarModalBoletaCalif() {
    this.modalAceptar.close();
  }

  inicializarformularioBoletas() {
    this.boletaForm = new FormGroup({
      expedida : new FormControl(true),
      fechaExpedicion : new FormControl('', Validators.required)
    });
  }

  expedirBoleta(): void {
    /* TODO 30/05/2017 Se elimina condición para actualizar fecha de boleta
    * HD-849, Generacion de boletas para alumnos con
    * recurso de revisión/recuperacion. Se expide nuevamente y se asigna una nueva fecha.
    */

    // if (!this.registroSeleccionado.expedida) {
      this._spinner.start('expedirBoleta');
      this.boletaService.getBoleta(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        response => {
          // console.log(response.json());
          this.exportarPDFUrl = response.json().exportarPDF;

          let jsonFormulario = JSON.stringify(this.boletaForm.value, null, 2);
          console.log('formualrio: ' + jsonFormulario);

          this.boletaService.putBoleta(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
            response => {
              // console.log('Expedida!!!');
            },
            error => {
              console.error(error);
              this._spinner.stop('expedirBoleta');
            },
            () => {
              this._spinner.stop('expedirBoleta');
              window.open(this.exportarPDFUrl);
              this.cerrarModalBoletaCalif();
              this.onCambiosTabla();
            }
          );
        },
        error => {
          this._spinner.stop('expedirBoleta');
        },
        () => {
          this._spinner.stop('expedirBoleta');
        }
      );
    /*} else {
      this._spinner.start('expedirBoleta');
      this.boletaService.getBoleta(
        this.registroSeleccionado.id,
        this.erroresGuardado
      ).subscribe(
        response => {
          // console.log(response.json());
          this.exportarPDFUrl = response.json().exportarPDF;
        },
        error => {
          this._spinner.stop('expedirBoleta');
        },
        () => {
          this._spinner.stop('expedirBoleta');
          window.open(this.exportarPDFUrl);
          this.cerrarModalBoletaCalif();
        }
      );
    }*/
  }

  getFechaEjemplo(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.boletaForm.controls['fechaExpedicion'])
        .patchValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  /***
   *  INICIA MODAL ALERTA CALIFICACIONES
   *
  */

  modalAdvertenciaBoleta(): void {
    this.modalAlertaCalificaciones.open();
  }

  cerrarModalAdvertencia(): void {
    this.modalAlertaCalificaciones.close();
  }


/*  constructor() { }

  ngOnInit() {
  }*/

limpiarVariablesSession() {
    sessionStorage.removeItem('boletasCriterios');
    sessionStorage.removeItem('boletasOrdenamiento');
    sessionStorage.removeItem('boletasLimite');
    sessionStorage.removeItem('boletasPagina');
  }

}
