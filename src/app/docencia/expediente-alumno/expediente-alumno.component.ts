import {Component, OnInit, Injector, ElementRef, Renderer, KeyValueDiffers, IterableDiffers} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ItemSelects} from '../../services/core/item-select.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {Router, Routes} from '@angular/router';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Estudiante} from '../../services/entidades/estudiante.model';


@Component({
  selector: 'app-expediente-alumno',
  templateUrl: './expediente-alumno.component.html',
  styleUrls: ['./expediente-alumno.component.css']
})

export class ExpedienteAlumnoComponent implements OnInit {
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  maxSizePags: number = 5;
  limite: number = 10;
  registros: Array<Estudiante> = [];
  estatusCatalogoService;
  router: Router;
  opcionesSelectProgramaDocente: Array<ItemSelects>;
  opcionesSelectPromocion: Array<ItemSelects>;
  botonValido: boolean = false;
  // public elementRef;
  registroSeleccionado: Estudiante;
  sesiondocente: string;
  sesionpromocion: string;
  // Services
  estudianteService;
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idMatricula.matriculaCompleta'},
    { titulo: 'Estudiante*', nombre: 'idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Programa docente', nombre: 'idPromocion', sort: false},
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idDatosPersonales.nombre,' +
    'idDatosPersonales.primerApellido,' +
    'idDatosPersonales.segundoApellido' }
  };
  // Se quieta la busqueda por matricula debido a que algunos alumnos dados de baja, pueden no tener matricula

  opcionesResultados: Array<ItemSelects> = [];
  private opcionesEstudiante: Array<ItemSelects> = [];

  // Autocomplete
  private isComplete: boolean = false;
  private estudianteSelAutocomplete: Estudiante;
//  private typeAheadEventEmitter = new Rx.Subject<string>();

  private erroresConsultas: Array<Object> = [];

  constructor(
    // private modal: Modal, private elementRef: ElementRef,
    private injector: Injector, private _renderer: Renderer,
    private _router: Router, private _catalogosService: CatalogosServices,
    private spinnerService: SpinnerService) {
    this.prepareServices();
    this.obtenerCatalogo();
    this.router = _router;
//    this.elementRef = elementRef;
    if (sessionStorage.getItem('alumnoIdPromocion')) {
     this.sesionpromocion = sessionStorage.getItem('alumnoIdPromocion');
    }
    if (sessionStorage.getItem('alumnoIdProgramaDocente')) {
     this.sesiondocente = sessionStorage.getItem('alumnoIdProgramaDocente');
    }
    /*if (sessionStorage.getItem('alumnoCriterios')) {
      this.onCambiosTabla();
    }*/
    this.getCatalogoResultado();
  }

  verExpedienteSeleccionado(): void {
    // console.log('LeL ', this.registroSeleccionado);
    this.router.navigate(['alumno', 'expediente',
      {usuarioObjetivo: this.registroSeleccionado.usuario.id}]);
  }

  ngAfterContentInit() {
    let estudiantes = eval(sessionStorage.getItem('estudiantes'));

    if (estudiantes) {
      this.spinnerService.start('expedientealumno2');
      for (let idEstudiante = 0; idEstudiante < estudiantes.length; idEstudiante++) {
        this.estudianteService.getEstudiante(
          estudiantes[idEstudiante],
          this.erroresConsultas
        ).subscribe(
          response => {
            this.registros.push(new Estudiante(response.json()));
          },
          error => {
            this.spinnerService.stop('expedientealumno2');
          },
          () => {
            this.spinnerService.stop('expedientealumno2');
          }
        );
      }
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

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    // console.log('idProgramaDocente', idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion = this.estatusCatalogoService.getPromocion().
    getSelectPromocion(this.erroresConsultas, urlParameter);
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idEstatusAlumno: number
  ): void {
    this.limpiarVariablesSession();
    console.log('busqueda de criterios de cabecera');
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idPromocion.idProgramaDocente~'
          + idProgramaDocente + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera = 'idPromocion~'
        + idPromocion + ':IGUAL';
    }
    if (idProgramaDocente && idPromocion) {
      this.criteriosCabezera = 'idPromocion.idProgramaDocente~'
          + idProgramaDocente + ':IGUAL,idPromocion~'
          + idPromocion + ':IGUAL';
    }
    if (idEstatusAlumno) {
      this.criteriosCabezera += ',idEstatus~'
        + idEstatusAlumno + ':IGUAL';
    }
    sessionStorage.setItem('alumnoIdPromocion', idPromocion.toString());
    sessionStorage.setItem('alumnoIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('alumnoIdEstatus', idEstatusAlumno.toString());
    // console.log('idProgramaDocente', idProgramaDocente);
    // console.log('idPromocion', idPromocion);
    this.onCambiosTabla();
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  // ------------------------------------------------------
  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    /* TODO
     * Se cambian criterios de busqueda.
     * Se filtra por los estatus de:
     * 1006 - Estudiante
     * 1105 - Baja
     * 1106 - Egresado
     * 1107 - Titulado
     * Considerando la coherencia de la vista referente a 'Alumnos', solo se muestran los que pueden
     * o pudieron ser alumno.
     */
    let criterios;
    let ordenamiento = '';
    if (!sessionStorage.getItem('alumnoIdEstatus')) {
      criterios = 'idEstatus.id~1006:IGUAL;OR,idEstatus.id~1105:IGUAL;OR,idEstatus.id~1106:IGUAL;OR,idEstatus.id~1107:IGUAL';
      criterios = this.criteriosCabezera ? criterios + ';ORGROUPAND,' + this.criteriosCabezera : criterios;
    } else {
      criterios = this.criteriosCabezera;
    }
    if (!sessionStorage.getItem('alumnoCriterios')) {
      /*if (this.criteriosCabezera !== '') {
        criterios = criterios + ',' + this.criteriosCabezera;
       urlSearch.set('criterios', criterios);
      }*/

      console.log(this.criteriosCabezera);
      // console.log('cr-',criterios);
      if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
        criterios = criterios + ';ANDGROUPAND';

        let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
        // criterios = 'idEstatus.id~' + '1006' + ':IGUAL;ANDGROUPAND';
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
              this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        });
      }


      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
              columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('alumnoCriterios', criterios);
      sessionStorage.setItem('alumnoOrdenamiento', ordenamiento);
      sessionStorage.setItem('alumnoLimite', this.limite.toString());
      sessionStorage.setItem('alumnoPagina', this.paginaActual.toString());
    }

    urlSearch.set('criterios', sessionStorage.getItem('alumnoCriterios')
      ? sessionStorage.getItem('alumnoCriterios') : criterios);
    urlSearch.set('ordenamiento',  sessionStorage.getItem('alumnoOrdenamiento')
      ? sessionStorage.getItem('alumnoOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('alumnoLimite')
      ? sessionStorage.getItem('alumnoLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('alumnoPagina')
      ? sessionStorage.getItem('alumnoPagina') : this.paginaActual.toString());

    console.log(urlSearch);
    this.spinnerService.start('taba');
    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<Estudiante>
    } = this.estudianteService.getListaEstudianteOpcional(
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
          this.registros.push(new Estudiante(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        console.log(error);
        this.spinnerService.stop('taba');
      },
      () => {
        this.spinnerService.stop('taba');
      }
    );
  }
  // -------------------------------------------------------------//

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarInput(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }
  sortChanged(columna): void {
    this.limpiarVariablesSession();
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
      this.onCambiosTabla();
      // columna.sort = '';
    }
  }

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
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

  private agregarEstudiante(): void {
    if (this.estudianteSelAutocomplete) {
      this.registros.push(this.estudianteSelAutocomplete);
      sessionStorage.setItem('estudiantes', JSON.stringify(this.registros.map(function (o) {
        return o.id;
      })));
      this.opcionesEstudiante = [];
      this.estudianteSelAutocomplete = null;
    }
  }

  private removerEstudiante(): void {
    let index = this.registros.indexOf(this.registroSeleccionado);
    this.registros.splice(index, 1);
    sessionStorage.setItem('estudiantes',
      JSON.stringify(this.registros.map(function(o) {return o.id})));

    if (this.registros.length == 0)
      sessionStorage.setItem('estudiantes', '');
  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.estudianteService =
      this._catalogosService.getEstudiante();
  }

  private obtenerCatalogo(): void {
    this.opcionesSelectProgramaDocente =
      this.estatusCatalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('alumnoCriterios');
    sessionStorage.removeItem('alumnoOrdenamiento');
    sessionStorage.removeItem('alumnoLimite');
    sessionStorage.removeItem('alumnoPagina');
    sessionStorage.removeItem('alumnoIdPromocion');
    sessionStorage.removeItem('alumnoIdProgramaDocente');
    sessionStorage.removeItem('alumnoIdEstatus');

  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  getCatalogoResultado(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('ordenamiento','valor:ASC');
    urlParameter.set('criterios', 'id~1006:IGUAL;OR,id~1105:IGUAL;OR,id~1106:IGUAL;OR,id~1107:IGUAL;OR'); // 4 catalogo de estudiantes
    this.opcionesResultados =
      this.estatusCatalogoService.getEstatusCatalogo().getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
  }
}
