import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Promocion} from '../../services/entidades/promocion.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {URLSearchParams} from '@angular/http';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {AuthService} from '../../auth/auth.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {UsuarioServices} from '../../services/usuario/usuario.service';

@Component({
  selector: 'app-revision-actas-calificacion',
  templateUrl: './revision-actas-calificacion.component.html',
  styleUrls: ['./revision-actas-calificacion.component.css']
})
export class RevisionActasCalificacionComponent implements OnInit {

  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  @ViewChild('modalRechazar')
  modalRechazarMov: ModalComponent;
  @ViewChild('modalAceptar')
  modalAceptarMov: ModalComponent;
  @ViewChild('modalTabsDetalle')
  modalTabsDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
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
  errores: Array<any> = [];
  criteriosCabezera: string = '';
  columnas: Array<any> = [
    {titulo: 'Clave materia', nombre: 'idMateria.clave', sort: 'asc'},
    {titulo: 'Nombre de materia*', nombre: 'idMateria.descripcion', sort: false },
    {titulo: 'Profesor titular', nombre: '', sort: false},
    {titulo: 'Profesor', nombre: 'profesor', sort: false},
    {titulo: 'Coordinador', nombre: 'coordinacion', sort: false},
    {titulo: 'Docencia', nombre: 'docencia', sort: false},
    {titulo: 'Secretaría Académica', nombre: 'sacademica', sort: false},
    {titulo: 'Estatus', nombre: '', sort: false}
  ];
  paginacion: PaginacionInfo;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idMateria.descripcion,idCursoOptativo.descripcion'}
  };
  listaPromociones: Array<Promocion> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  listaMateriaImpartida: Array<MateriaImpartida> = [];
  periodoSeleccionado: number;
  promocionSeleccionada: number;
  registroSeleccionado: MateriaImpartida;
  idProgramaDocenteUsr: number;
  exportarFormato = '';
  profesor: {[key: number]: string; } = {};
  materiaMovilidadCurricular: boolean = false;
  idMovilidadcurricular;

  // variables para modal detalle acta tabas //
  private idMateriaImpartidaSeleccionada: number = undefined;
  private profesorTitularDetalleActa: string = undefined;
  // termina variables para modal detalle acta tabs //

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public usuarioService: UsuarioServices,
              public spinner: SpinnerService,
              private authService: AuthService) {
    this.prepareServices();
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    usuarioService.getEntidadUsuario(authService.getUsuarioLogueado().id,
      this.errores).subscribe(response => {
      if (response.json().id_programa_docente) {
        this.idProgramaDocenteUsr = response.json().id_programa_docente.id;
        this.listarPromociones();
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
  }

/*  modalDetalleActaTabs(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    if (this.registroSeleccionado) {
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: new ModalDetallesActasData(
          this.registroSeleccionado,
          this.registroSeleccionado.getProfesorTitular(),
          this)}),
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

    if(sessionStorage.getItem('actasIdPromocion') && sessionStorage.getItem('actasIdPeriodo')){
      this.onCambiosTabla();
    }
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

  listarPromociones(): void {
    this.listaPromociones = [];
    this.promocionSeleccionada = null;
    let urlSearch = new URLSearchParams();
    urlSearch.set('criterios', 'idProgramaDocente.id~' +
      this.idProgramaDocenteUsr + ':IGUAL;AND,idEstatus~1235:NOT');
    this.promocionService.getListaPromocionesPag(this.errores, urlSearch).
    subscribe(response => {
      response.json().lista.forEach((item) => {
        this.listaPromociones.push(new Promocion(item));
      });
    });
  }

  getIdPeriodo(idPeriodo): void {
    this.periodoSeleccionado = idPeriodo ? idPeriodo : null;
  }

  onCambiosTabla(): void {
    this.spinner.start('revisionactascalifiacion1');
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
    console.log('urlSearch', urlSearch);
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
      },
      erro => {
        this.spinner.stop('revisionactascalifiacion1');
      },
      () => {
        this.spinner.stop('revisionactascalifiacion1');
      }
    );
  }

  conformarCriteriosCabezera(): void {
    this.criteriosCabezera = 'idEstatus~1222:IGUAL;AND,';
    if (this.promocionSeleccionada) {
      this.criteriosCabezera += 'idPromocion.id~' + this.promocionSeleccionada + ':IGUAL';
      sessionStorage.setItem('actasIdPromocion', this.promocionSeleccionada.toString());
    } 
    else if (sessionStorage.getItem('actasIdPromocion')){
      this.criteriosCabezera += 'idPromocion.id~' + sessionStorage.getItem('actasIdPromocion') + ':IGUAL';
    }

    if (this.periodoSeleccionado) {
      this.criteriosCabezera += ',idPeriodoEscolar.id~' + this.periodoSeleccionado + ':IGUAL';
      sessionStorage.setItem('actasIdPeriodo', this.periodoSeleccionado.toString());
    } 
    else  if (sessionStorage.getItem('actasIdPeriodo')){
      this.criteriosCabezera += ',idPeriodoEscolar.id~' + sessionStorage.getItem('actasIdPeriodo') + ':IGUAL';
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
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

  limpiarInput(): void {
    this.configuracion.filtrado.textoFiltro = '';
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

  descargarActaCalificaciones(): void {
    console.log(this.registroSeleccionado.materia.tipoMateria.id);
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
    this.spinner.start('revisionactascalifiacion2');
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
        this.spinner.stop('revisionactascalifiacion2');
      }
    );
  }

  descargarActaMovilidadCurricular(): void {
    this.spinner.start('revisionactascalifiacion3');
    this.materiaImpartidaService.getActaMovilidadCurricular(
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
        this.spinner.stop('revisionactascalifiacion3');
      }
    );
  }

  verificarMateriaMovilidad(idMateria): void {
    this.materiaMovilidadCurricular = false;
    let urlSearch: URLSearchParams = new URLSearchParams();
    // console.log('fitlro: ' + this.configuracion.filtrado.textoFiltro);
    let criterios = 'idEstudianteMateriaImpartida.idMateriaImpartida~' + idMateria + ':IGUAL,idEstatus~1219';
    urlSearch.set('criterios', criterios);
    this.movilidadCurricularService.getListaMovilidadCurricularSimple(
      this.errores,
      urlSearch
    ).subscribe(response => {
      console.log(response.json().lista.length);
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
        console.log('Es materia de movilidad curricular');
        this.descargarActaMovilidadCurricular();
      } else {
        console.log('Materia normal');
        this.descargarActaNormal();
      }
    });
  }
  /********************************
   * ******************************
   * INICIA MODAL DE DETALLE ACTAS
   * ******************************/
  modalDetalleActaTabs(): void {
    if (this.registroSeleccionado) {
      this.idMateriaImpartidaSeleccionada = this.registroSeleccionado.id;
      this.profesorTitularDetalleActa = this.registroSeleccionado.getProfesorTitular();
      this.modalTabsDetalle.open('lg');
    }
  }

  cerrarModalDetalleActaTabs(): void {
    this.idMateriaImpartidaSeleccionada = undefined;
    this.profesorTitularDetalleActa = undefined;
    this.onCambiosTabla();
    this.modalTabsDetalle.close();
  }

  /********************************
   * ******************************
   * TERMINA MODAL DE DETALLE ACTAS
   * ******************************/


/*  constructor() { }

  ngOnInit() {
  }*/

}
