import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ItemSelects} from '../../services/core/item-select.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-actas-calificacion',
  templateUrl: './actas-calificacion.component.html',
  styleUrls: ['./actas-calificacion.component.css']
})
export class ActasCalificacionComponent implements OnInit {

  @ViewChild('modalTabsDetalle')
  modalTabsDetalle: ModalComponent;
  @ViewChild('modalEditarConsecutivo')
  modalEditarConsecutivo: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';
  programaDocenteService;
  promocionService;
  periodoEscolarService;
  materiaImpartidaService;
  profesorMateriaService;
  promocionPeriodoService;
  movilidadCurricularService;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  errores: Array<Object> = [];
  criteriosCabezera: string = '';
  columnas: Array<any> = [
    {titulo: 'Clave materia*', nombre: 'idMateria.clave', sort: 'asc'},
    {titulo: 'Nombre de materia*', nombre: 'idMateria', sort: false},
    {titulo: 'Profesor titular', nombre: '', sort: false},
    {titulo: 'Profesor', nombre: 'profesor', sort: false},
    {titulo: 'Coordinador', nombre: 'coordinacion', sort: false},
    {titulo: 'Docencia', nombre: 'docencia', sort: false},
    {titulo: 'Secretaría Académica', nombre: 'sacademica', sort: false},
    {titulo: 'Estatus', nombre: 'idActaCalificacion', sort: false}
  ];
  paginacion: PaginacionInfo;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idMateria.clave,idMateria.descripcion' }
  };
  listaProgramas: Array<ItemSelects> = [];
  listaPromociones: Array<Promocion> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  listaMateriaImpartida: Array<MateriaImpartida> = [];
  programaSeleccionado: number;
  periodoSeleccionado: number;
  promocionSeleccionada: number;
  registroSeleccionado: MateriaImpartida;
  profesor: {[key: number]: string; } = {};
  exportarFormato = '';
  materiaMovilidadCurricular: boolean = false;
  idMovilidadcurricular;

  // variable para modal detalle acta calificacion tabs
  private idMateriaImpartidaSeleccionada: number = undefined;
  private profesorTitularDetalleActa: string = undefined;
  // fin de variables par amodal detalle acta calificacion tabs


  // variables para editar acta de calificacion //
  private formulario: FormGroup;
  private validacionActiva: boolean = false;
  private actaCalificacionService;
  private modoVista: string = '';
  // termina variables para editar acta de calificacion //

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public spinner: SpinnerService,
              private authService: AuthService) {
    this.crearFormularioActa();
    this.prepareServices();
  }

/*  modalConfirmacionActaCalificacion(modo: string): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    if (this.registroSeleccionado) {

      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ModalConfirmarActaCalificacionData(
            this.registroSeleccionado, this, modo)
        }),
        provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
        provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)}),
        provide(Renderer, {useValue: this._renderer})
      ]);

      dialog = this.modal.open(
        <any>ModalConfirmarActaCalificacion,
        bindings,
        modalConfig
      );
    }
  }*/

/*  modalDetalleActaTabs(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    if (this.registroSeleccionado) {
      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ModalDetallesActasData(
            this.registroSeleccionado,
            this.registroSeleccionado.getProfesorTitular(),
            this)
        }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetallesActas,
        bindings,
        modalConfig
      );
    }

  }*/

  ngOnInit(): void {
    this.paginacion = new PaginacionInfo(0, 1, 0, 0);
    this.listarProgramas();

    if (sessionStorage.getItem('actasCalifIdProgramaDocente') &&
        sessionStorage.getItem('actasCalifIdPromocion') &&
        sessionStorage.getItem('actasCalifIdPeriodo')) {
      this.onCambiosTabla();
    }
  }

  listarProgramas(): void {
    let urlSearch = new URLSearchParams();
    this.listaProgramas = this.programaDocenteService.
    getSelectProgramaDocente(this.errores, urlSearch);
  }

  listarPeriodos(idPromocion): void {
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    let urlSearch = new URLSearchParams();
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      urlSearch.set('criterios',
        'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
        ':IGUAL;AND');
      // urlSearch.set('ordenamiento', 'anio:DESC,mesInicio:ASC');
      this.promocionPeriodoService.getListaPromocionPeriodoEscolarPaginacion(this.errores,
        urlSearch).subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPeriodos.push(new PromocionPeriodoEscolar(item));
        });
      });
    }
  }

  listarPromociones(idPrograma): void {
    this.listaPromociones = [];
    this.promocionSeleccionada = null;
    let urlSearch = new URLSearchParams();
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL;AND,idEstatus~1235:NOT');
      this.promocionService.getListaPromocionesPag(this.errores, urlSearch).
      subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPromociones.push(new Promocion(item));
        });
      });
    }else {
      this.programaSeleccionado = null;
    }
  }

  getIdPeriodo(idPeriodo): void {
    this.periodoSeleccionado = idPeriodo ? idPeriodo : null;
  }

  onCambiosTabla(): void {
    this.spinner.start('actascalificacion1');
    this.conformarCriteriosCabezera();
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    // console.log('fitlro: ' + this.configuracion.filtrado.textoFiltro);
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      if (criterios !== '') {
          criterios = criterios + 'GROUPAND';
        }
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
    this.materiaImpartidaService.getListaMateriaImpartida(this.errores,
      urlSearch, this.configuracion.paginacion).subscribe(
      response => {
        this.listaMateriaImpartida = [];
        let paginacionInfoJson = response.json();
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.listaMateriaImpartida.push(new MateriaImpartida(item));
        });
        this.spinner.stop('actascalificacion1');
      }
    );
  }

  conformarCriteriosCabezera(): void {
    this.criteriosCabezera = '';
    if (this.programaSeleccionado) {
      this.criteriosCabezera += 'idMateria.idProgramaDocente.id~' + this.programaSeleccionado + ':IGUAL;AND';
      sessionStorage.setItem('actasCalifIdProgramaDocente', this.programaSeleccionado.toString());
    }
    else if (sessionStorage.getItem('actasCalifIdProgramaDocente')){
      this.criteriosCabezera += 'idMateria.idProgramaDocente.id~' + sessionStorage.getItem('actasCalifIdProgramaDocente') + ':IGUAL;AND';
    }

    if (this.promocionSeleccionada) {
      if (this.criteriosCabezera.indexOf(';') > -1) {
        this.criteriosCabezera += ',idPromocion.id~' + this.promocionSeleccionada + ':IGUAL;AND';
      } else {
        this.criteriosCabezera += ';AND,idPromocion.id~' + this.promocionSeleccionada + ':IGUAL;AND';
      }
      sessionStorage.setItem('actasCalifIdPromocion', this.promocionSeleccionada.toString());
    }
    else if (sessionStorage.getItem('actasCalifIdPromocion')){
      if (this.criteriosCabezera.indexOf(';') > -1) {
        this.criteriosCabezera += ',idPromocion.id~' + sessionStorage.getItem('actasCalifIdPromocion') + ':IGUAL;AND';
      } else {
        this.criteriosCabezera += ';AND,idPromocion.id~' + sessionStorage.getItem('actasCalifIdPromocion') + ':IGUAL;AND';
      }
    }

    if (this.periodoSeleccionado) {
      if (this.criteriosCabezera.indexOf(';') > -1) {
        this.criteriosCabezera += ',idPeriodoEscolar.id~' + this.periodoSeleccionado + ':IGUAL;AND';
      } else {
        this.criteriosCabezera += ';AND,idPeriodoEscolar.id~' + this.periodoSeleccionado + ':IGUAL;AND';
      }
      sessionStorage.setItem('actasCalifIdPeriodo', this.periodoSeleccionado.toString());
    }
    else if (sessionStorage.getItem('actasCalifIdPeriodo')){
      if (this.criteriosCabezera.indexOf(';') > -1) {
        this.criteriosCabezera += ',idPeriodoEscolar.id~' + sessionStorage.getItem('actasCalifIdPeriodo') + ':IGUAL;AND';
      } else {
        this.criteriosCabezera += ';AND,idPeriodoEscolar.id~' + sessionStorage.getItem('actasCalifIdPeriodo') + ':IGUAL;AND';
      }
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      // console.log('registrosSelecionaod', this.registroSeleccionado);
    } else {
      this.registroSeleccionado = null;
    }
  }

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

  setLimite(limite: string): void {
    if (this.listaMateriaImpartida.length > 0) {
      this.limite = Number(limite);
      this.onCambiosTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
    if (this.listaMateriaImpartida.length > 0) {
      if (columna.sort !== false) {
          if (columna.sort) {
              columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
          } else {
              columna.sort = 'desc';
          }
          this.onCambiosTabla();
      }
    }
  }

  descargarActaCalificaciones(): void {
    // Comentario para ver cambios en merge
    // Segundo comentario
    // console.log(this.registroSeleccionado.materia.tipoMateria.id);
    if (this.registroSeleccionado.materia.tipoMateria.id == 3) {
      this.descargarActaTutorial();
    } else {
      this.verificarMateriaMovilidad(this.registroSeleccionado.id);
    }
  }

  descargarActaTutorial(): void {
    this.materiaImpartidaService.getActaTutoriales(
      this.registroSeleccionado.id,
      this.errores
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
      }
    );

    this.materiaImpartidaService.getActaTutorialesGeneral(
      this.registroSeleccionado.id,
      this.errores
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
      }
    );

  }

  descargarActaNormal(): void {
    this.spinner.start('actascalificacion2');
    this.materiaImpartidaService.getActaCalificaciones(
      this.registroSeleccionado.id,
      this.errores
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
        this.spinner.stop('actascalificacion2');
      }
    );
  }

  descargarActaMovilidadCurricular(): void {
    this.spinner.start('actascalificacion3');
    this.movilidadCurricularService.getActaCalificaciones(
      this.idMovilidadcurricular,
      this.errores,
      'ActaCalificacionesFinales'
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
        this.spinner.stop('actascalificacion3');
      }
    );
  }

  habilitarBotonGenerarActa(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.actaCalificacion.docencia
      && this.registroSeleccionado.actaCalificacion.profesor &&
      this.registroSeleccionado.actaCalificacion.secAcademica
      && this.registroSeleccionado.actaCalificacion.coordinador &&
      !this.registroSeleccionado.actaCalificacion.consecutivo && this.authService.hasRol('DOCENCIA')) {
      return true;
    } else {
      return false;
    }
  }

  habilidarBotonDescargarActa(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.actaCalificacion.docencia
      && this.registroSeleccionado.actaCalificacion.profesor &&
      this.registroSeleccionado.actaCalificacion.secAcademica
      && this.registroSeleccionado.actaCalificacion.coordinador &&
      this.registroSeleccionado.actaCalificacion.consecutivo ) {
      return true;
    } else {
      return false;
    }
  }

  habilitarBotonEditarrActa(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.actaCalificacion.docencia
      && this.registroSeleccionado.actaCalificacion.profesor &&
      this.registroSeleccionado.actaCalificacion.secAcademica
      && this.registroSeleccionado.actaCalificacion.coordinador &&
      this.registroSeleccionado.actaCalificacion.consecutivo && this.authService.hasRol('DOCENCIA')) {
      return true;
    } else {
      return false;
    }
  }

  verificarMateriaMovilidad(idMateria): void {
    this.idMovilidadcurricular = 0;
    this.materiaMovilidadCurricular = false;
    let urlSearch: URLSearchParams = new URLSearchParams();
    // console.log('fitlro: ' + this.configuracion.filtrado.textoFiltro);
    let criterios = 'idEstudianteMateriaImpartida.idMateriaImpartida~' + idMateria + ':IGUAL,idEstatus~1219';
    urlSearch.set('criterios', criterios);
    this.movilidadCurricularService.getListaMovilidadCurricularSimple(
      this.errores,
      urlSearch
    ).subscribe(response => {
      // console.log(response.json().lista.length);
      if (response.json().lista.length > 0) {
        response.json().lista.forEach((item) => {
          this.idMovilidadcurricular = item.id;
        });

        this.materiaMovilidadCurricular = true;
      }
    }, error => {
      console.error(error);
    }, () => {
      if (this.materiaMovilidadCurricular) {
        // console.log('Es materia de movilidad curricular');
        this.descargarActaMovilidadCurricular();
      } else {
        // console.log('Materia normal');
        this.descargarActaNormal();
      }
    });
  }

  private prepareServices(): void {
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosService.getPromocion();
    this.periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this.materiaImpartidaService = this._catalogosService.getMateriaImpartidaService();
    this.profesorMateriaService = this._catalogosService.getProfesorMateriaService();
    this.promocionPeriodoService = this._catalogosService.getPromocionPeriodoEscolarService();
    this.movilidadCurricularService = this._catalogosService.getMovilidadCurricularService();
    this.actaCalificacionService = this._catalogosService.getActaCalificacionService();
  }

/*  constructor() { }

  ngOnInit() {
  }
  habilidarBotonDescargarActa(): boolean {
    return true;
  }
  habilitarBotonGenerarActa(): boolean {
    return true;
  }
  habilitarBotonEditarrActa(): boolean {
    return true;
  }*/

  /*******************************
   * INICIA MODAL TABS ***********
   * *****************************
  *******************************/
  modalDetalleActaTabs(): void {
    this.profesorTitularDetalleActa = this.registroSeleccionado.getProfesorTitular();
    this.idMateriaImpartidaSeleccionada = this.registroSeleccionado.id;
    this.modalTabsDetalle.open('lg');
  }

  cerrarModalDetalleTabas(): void {
    this.idMateriaImpartidaSeleccionada = undefined;
    this.profesorTitularDetalleActa = undefined;
    this.onCambiosTabla();
    this.modalTabsDetalle.close();
  }

  /*******************************
   * TERMINA MODAL TABS **********
   * *****************************
  *******************************/

  /***************************************
   * INICIA MODAL EDITAR ACTA ************
   * *************************************
  ***************************************/
  modalConfirmacionActaCalificacion(modo: string): void {
    this.modoVista = modo;
    let stringConsecutivo = 'consecutivo';
    (<FormControl>this.formulario.controls[stringConsecutivo])
      .setValue(this.registroSeleccionado ? this.registroSeleccionado.actaCalificacion.consecutivo : '');
    this.modalEditarConsecutivo.open();
  }

  crearFormularioActa(): void {
    this.formulario = new FormGroup({
      consecutivo: new FormControl('', Validators.compose([Validators.required]))
    });
  }

  generarActa(): void {
        let idActaCalificacion = this.registroSeleccionado.actaCalificacion.id;
        if (this.validarFormulario()) {
            let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
            this.actaCalificacionService.putActaCalificacion(
                idActaCalificacion,
                jsonFormulario,
                this.errores
            ).subscribe(
                response => {},
                error => {
                    console.log(error);
                },
                () => {
                    this.onCambiosTabla();
                    this.cerrarModalConfirmarActa();
                }
            );
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
        return resultado;
  }

  private validarFormulario(): boolean {
        // console.log(this.formulario.value);
        if (this.formulario.valid) {
            this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
    }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
        return true;
    }
    return false;
  }

  cerrarModalConfirmarActa(): void {
    this.crearFormularioActa();
    this.modoVista = '';
    this.modalEditarConsecutivo.close();
  }

  /***************************************
   * TERMINA  MODAL EDITAR ACTA **********
   * *************************************
  ***************************************/
}
