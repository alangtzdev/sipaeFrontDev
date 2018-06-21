import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ProfesorRevisionTrabajo} from '../../services/entidades/profesor-revision-trabajo.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, FormControl} from '@angular/forms';
import {Promocion} from '../../services/entidades/promocion.model';
import {ProgramaDocenteService} from '../../services/servicios-especializados/programa-docente/programa-docente.service';
import {PromocionService} from '../../services/servicios-especializados/promocion/promocion.service';
import {Router} from '@angular/router';
import {PeriodoEscolarService} from '../../services/servicios-especializados/periodo-escolar/periodo-escolar.service';
import {RecursoRevisionService} from '../../services/entidades/recurso-revision.service';
import {ProfesorService} from '../../services/entidades/profesor.service';
import {ProfesorRevisionTrabajoService} from '../../services/entidades/profesor-revision-trabajo.service';
import {PromocionPeriodoEscolarService} from '../../services/entidades/promocion-periodo-escolar.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {ProgramaDocenteServices} from '../../services/entidades/programa-docente.service';
import {Usuarios} from '../../services/usuario/usuario.model';
import {RecursoRevision} from '../../services/entidades/recurso-revision.model';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {ConfigService} from '../../services/core/config.service';

@Component({
  selector: 'app-evaluacion-recurso-revision',
  templateUrl: './evaluacion-recurso-revision.component.html',
  styleUrls: ['./evaluacion-recurso-revision.component.css']
})
export class EvaluacionRecursoRevisionComponent implements OnInit {

  @ViewChild('detalleRecursoRevision')
  detalleRecursoRevision: ModalComponent;
  @ViewChild('modalEvaluarRecursoRevision')
  modalEvaluarRecursoRevision: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  mostrarBotonBuscar: boolean = false;
  usuarioLogueado: UsuarioSesion;
  promocionSeleccionada: number = 0;
  listaPeriodos: Array<PromocionPeriodoEscolar>;
  periodoSeleccionado: number = 0;
  idProfesor: number = 0;
  errores: Array<ErrorCatalogo> = [];
  paginacion: PaginacionInfo;
  registroSeleccionado: ProfesorRevisionTrabajo;
  programasDocentesSelect: Array<ItemSelects> = [];
  opcionesSelectPeriodo: Array<ItemSelects>;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<ProfesorRevisionTrabajo> = [];
  opcionesSelectProgramaDocente: Array<ItemSelects>;
  estatusCatalogoService;
  criteriosCabezera: string = '';
  botonValido: boolean = false;
  formularioCriterios: FormGroup;
  textoBusqueda: string = '';
  columnas: Array<any> = [
    { titulo: 'Matricula del estudiante', nombre: 'matricula', sort: false },
    { titulo: '*Nombre del estudiante', nombre: 'idRecursoRevision', sort: false},
    { titulo: '*Clave de materia', nombre: 'idRecursoRevision', sort: false},
    { titulo: '*Profesor titular', nombre: 'idRecursoRevision', sort: false},
    { titulo: '*Materia', nombre: 'idRecursoRevision', sort: false},
    { titulo: '*Estatus', nombre: 'idEstatus', sort: false }
  ];
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
    'idRecursoRevision.idEstudiante.idDatosPersonales.nombre'
    + ',idRecursoRevision.idMateria.idMateria.clave'
    + ',idRecursoRevision.idProfesor.nombre'
    + ',idRecursoRevision.idMateria.idMateria.descripcion'
    + ',idEstatus.valor,'
    + 'idRecursoRevision.idEstudiante.idMatricula.matriculaCompleta'}
  };
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private promocionSelect: Array<Promocion> = [];
  private periodoSelect: Array<ItemSelects> = [];

  //   variables par modal detalle // /
  private entidadRecursoRevision: RecursoRevision;
  //  fin de variables para modal detalle // /
  constructor(// private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _programaDocenteService: ProgramaDocenteServices,
              private _promocion: PromocionServices,
              private _recursoRevisionService: RecursoRevisionService,
              private _periodoEscolarService: PeriodoEscolarService,
              private router: Router, params: Router,
              private _profesorService: ProfesorService,
              private _profesorRevisionTrabajoService: ProfesorRevisionTrabajoService,
              private _promocionPeriodoEscolarService: PromocionPeriodoEscolarService,
              private _archivoService: ArchivoService,
              private _spinner: SpinnerService,
              private _authservice: AuthService) {
    this.usuarioLogueado = this._authservice.getUsuarioLogueado();
    //  this.obtenerPeriodoEscolar();
    this.formularioCriterios =  new FormGroup({
      seteador: new FormControl(''),
      seteadorPeriodo: new FormControl('')});
    this.prepareServices();
    this.recuperarUsuarioActual();
    //  this.mostrarTabla();
  }

  prepareServices(): void {
    this.programasDocentesSelect = this._programaDocenteService
      .getSelectProgramaDocente(this.erroresConsultas);
  }

  ngOnInit(): void {

  }
  recuperarUsuarioActual(): void {
    // console.log('usuario actual: ' + this.usuarioLogueado.id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL');
    this._profesorService.getListaProfesor(
      this.erroresConsultas,
      urlParameter
    ).subscribe(response => {
      response.json().lista.forEach((profesor) => {
        this.idProfesor = profesor.id;
        // console.log('id del profesor' + this.idProfesor);
      });

      if(sessionStorage.getItem('evaluacionIdProgramaDocente') &&
        sessionStorage.getItem('evaluacionIdPromocion') &&
        sessionStorage.getItem('evaluacionIdPeriodoEscolar'))
      {
        this.criteriosCabezera = '';
        this.criteriosCabezera =
          'idRecursoRevision.idMateria.idPromocion.idProgramaDocente.id~'
          + sessionStorage.getItem('evaluacionIdProgramaDocente') + ':IGUAL'
          + ';AND,idRecursoRevision.idMateria.idPromocion.id~'
          + sessionStorage.getItem('evaluacionIdPromocion') + ':IGUAL'
          + ';AND,idRecursoRevision.idMateria.idPeriodoEscolar.id~'
          + sessionStorage.getItem('evaluacionIdPeriodoEscolar') + ':IGUAL'
          + ';AND,idProfesor.id~' + this.idProfesor +
          ':IGUAL;AND,' +
          'idRecursoRevision.idEstudiante.idPromocion.idProgramaDocente.idNivelEstudios.id~'
          + 1 + ':NOT';
      }

      this.mostrarTabla();
    });

  }
/*  modalDetalle(): void {
    if (this.registroSeleccionado) {
      let dialog: Promise<ModalDialogInstance>;
      let modalConfig = new ModalConfig('lg', true, 27);
      let idRecurso = this.registroSeleccionado.recursoRevision.id;
      let modalDetallesData = new ModalDetalleEvaluacionRecursoRevisionData(
        this,
        idRecurso
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData}),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
        provide(Renderer, { useValue: this._renderer })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleEvaluacionRecursoRevision,
        bindings,
        modalConfig
      );
    }
  }*/
  /*cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
   // console.log('idProgramaDocente', idProgramaDocente);
   let urlParameter: URLSearchParams = new URLSearchParams();
   urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
   this.promocionSelect = this._promocion.
   getSelectPromocion(this.erroresConsultas, urlParameter);
   }*/
  listarPeriodos(idPromocion): void {
    this._spinner.start('evaluacionrecursosrevision1');
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    let urlSearch = new URLSearchParams();
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      urlSearch.set('criterios',
        'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
        ':IGUAL;AND');
      // urlSearch.set('ordenamiento', 'anio:DESC,mesInicio:ASC');
      this._promocionPeriodoEscolarService.getListaPromocionPeriodoEscolarPaginacion(
        this.errores,
        urlSearch).subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPeriodos.push(new PromocionPeriodoEscolar(item));
        });
        this._spinner.stop('evaluacionrecursosrevision1');
      });
    }
  }
  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idPeriodoEscolar: number
  ): void {
    // this._spinner.start('evaluacionrecursosrevision2');
    this.criteriosCabezera = '';
    this.criteriosCabezera =
      'idRecursoRevision.idMateria.idPromocion.idProgramaDocente.id~'
      + idProgramaDocente + ':IGUAL'
      + ';AND,idRecursoRevision.idMateria.idPromocion.id~'
      + idPromocion + ':IGUAL'
      + ';AND,idRecursoRevision.idMateria.idPeriodoEscolar.id~'
      + idPeriodoEscolar + ':IGUAL'
      + ';AND,idProfesor.id~' + this.idProfesor +
      ':IGUAL;AND,' +
      'idRecursoRevision.idEstudiante.idPromocion.idProgramaDocente.idNivelEstudios.id~'
      + 1 + ':NOT';

    sessionStorage.setItem('evaluacionIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('evaluacionIdPromocion', idPromocion.toString());
    sessionStorage.setItem('evaluacionIdPeriodoEscolar', idPeriodoEscolar.toString());

    // console.log('idProgramaDocente', idProgramaDocente);
    // console.log('idPromocion', idPromocion);
    // console.log('idPeriodoEscolar', idPeriodoEscolar);

    this.mostrarTabla();
  }
  mostrarTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    /*criterios =
     'idProfesor.id~' + this.idProfesor +
     ':IGUAL;AND,' +
     'idRecursoRevision.idEstudiante.idPromocion.idProgramaDocente.idNivelEstudios.id~'
     + 1 + ':NOT';
     urlSearch.set('criterios', criterios);*/
    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    } else {
      criterios = 'idProfesor~' + this.idProfesor + ':IGUAL';
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

    /*console.log('estos son los criterios' + criterios);
    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });*/
    // console.log(criterios);
    urlSearch.set('ordenamiento', 'id:DESC');
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    this._spinner.start('evaluacionrecursosrevision2');
    this._profesorRevisionTrabajoService.getListaProfesorRevisionTrabajo(
      this.erroresConsultas,
      urlSearch, this.configuracion.paginacion
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
          this.registros.push(new ProfesorRevisionTrabajo(item));
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('evaluacionrecursosrevision2');
      },
      () => {
/*        if (assertionsEnabled()) {
          // console.log('paginacionInfo', this.paginacion);
          // console.log('registros', this.registros);
        }*/
        this.textoBusqueda = '';
        this._spinner.stop('evaluacionrecursosrevision2');
      }
    );
  }
  rowSeleccionado(registro): boolean {
    //  // console.log(registro.id);
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this._spinner.start('evaluacionrecursosrevision3');
    this.limite = Number(limite);
    this.mostrarTabla();
  }

  rowSeleccion(registro): void {
    // console.log(registro.id);
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  sortChanged(columna, columnaSeleccionada): void {
    // console.log('estta es la columna' + columnaSeleccionada);
    if (this.registros.length > 0) {
      if (columnaSeleccionada !== 'Matricula del estudiante' ) {
        this.columnas.forEach((column) => {
          if (columna !== column) {
            column.sort = '';
          }
        });
        if (columna.sort !== false) {
          if (columna.sort) {
            columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
          } else {
            columna.sort = 'desc';
          }
          this._spinner.start('evaluacionrecursosrevision4');
          this.mostrarTabla();
        }
      }
    }
  }
  filtroChanged(filtroTexto): void {
    this._spinner.start('evaluacionrecursosrevision5');
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.textoBusqueda = filtroTexto;
    this.mostrarTabla();
  }
  cambiarPagina(evento: any): void {
    this._spinner.start('evaluacionrecursosrevision6');
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      // console.log('evento', evento);
      // console.log('Page changed to: ' + evento.page);
      // console.log('Number items per page: ' + evento.itemsPerPage);
      // console.log('paginaActual', this.paginaActual);
    }*/
    this.mostrarTabla();
  }
  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }
  obtenerPromocion(idProgramaDocente: number): void {
    (<FormControl>this.formularioCriterios.controls['seteador']).patchValue('');
//       .updateValue('');
    (<FormControl>this.formularioCriterios.controls['seteadorPeriodo']).patchValue('');
  //     .updateValue('');
    this._spinner.start('evaluacionrecursosrevision7');
    this.mostrarBotonBuscar = false;
    this.listaPeriodos = [];
    this.promocionSelect = [];
    this.registros = [];
    // console.log('llego al metodo' + idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL;AND,idEstatus~1235:NOT');
    this._promocion.getSelectPromocionID(
      this.erroresConsultas, urlParameter).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.promocionSelect.push(new Promocion(item));
        // console.log('veamos el conflicto');
      });
      this._spinner.stop('evaluacionrecursosrevision7');
    });
  }
  /*obtenerPeriodoEscolar(): void {
   let urlParameter: URLSearchParams = new URLSearchParams();
   urlParameter.set('criterios', 'idEstatus.valor~Activo:IGUAL');
   this.opcionesSelectPeriodo = this._periodoEscolarService.
   getSelectPeriodoEscolarPeriodoCriterios(this.erroresConsultas, urlParameter);
   }*/

  desabilitarRecurso(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.id !== 1225) {
        return true;
      } else {
        return false;
      }
    }
  }
  cambiarEstatus(estatus): String {
    if (estatus === 'En evaluacion') {
      return 'No evaluado';
    } else {
      return estatus;
    }
  }
  mostrarDetalle(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }
  mostrarBoton(valor): void {
    if (valor) {
      this.mostrarBotonBuscar = true;
    }
  }
  desabilitarFiltro(): boolean {
    if (this.registros.length > 0) {
      return false;
    }else if (this.registros.length === 0 && this.textoBusqueda === '') {
      return true;
    }
  }
  limpiarBuscador(): void {
    this.textoBusqueda = '';
  }

  /****************************
  * INICIA MODAL DETALLE ***
  * ***************************
  ****************************/

  modalDetalle() {
    this.detalleRecursoRevision.open('lg');
    this.entidadRecursoRevision = this.registroSeleccionado.recursoRevision;
  }

  descargarArchivo(id: number): void {

        if (id) {
            let jsonArchivo = '{"idArchivo": ' + id + '}';
            this._spinner.start('descargar');
            this._archivoService
                .generarTicket(jsonArchivo, this.erroresConsultas)
                .subscribe(
                    data => {
                        let json = data.json();
                        let url =
                            ConfigService.getUrlBaseAPI() +
                            '/api/v1/archivovisualizacion/' +
                            id +
                            '?ticket=' +
                            json.ticket;
                        window.open(url);
                    },
                    error => {
                        // console.log('Error downloading the file.');
                        this._spinner.stop('descargar');
                    },
                    () => {
                        // console.info('OK');
                        this._spinner.stop('descargar');
                    }
                );
        }

  }

  closeModalDetalle(): void {
    this.entidadRecursoRevision = undefined;
    this.detalleRecursoRevision.close();
  }

  /****************************
  * TERMINA MODAL DETALLE ***
  * ***************************
  ****************************/

  /****************************
  * INICIA EVALUAR RECURSO ***
  * ***************************
  ****************************/

  evaluarRecursoRevision(): void {
    if (this.registroSeleccionado) {
      this.router.navigate(['formacion-academica', 'evaluacion-recursos-resolucion', // .parent.navigate(['EvaluacionRecursoResolucion',
        {id: this.registroSeleccionado.recursoRevision.id,
          idRevisionTrabajo: this.registroSeleccionado.id}]);
    }
  }

  /****************************
  * TERMINA EVALUAR RECURSO ***
  * ***************************
  ****************************/

}
