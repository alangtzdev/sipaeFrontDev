import { element } from 'protractor';
import {Component, OnInit, ViewChild, Renderer, Injector, ElementRef, KeyValueDiffers, IterableDiffers} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {EvaluacionAspirante} from '../../services/entidades/evaluacion-aspirante.model';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {Router} from '@angular/router';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {URLSearchParams} from '@angular/http';
import {ItemSelects} from '../../services/core/item-select.model';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {AuthService} from '../../auth/auth.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import {EvaluacionCurricularService} from '../../services/entidades/evaluacion-curricular.service';
import {EvaluacionAspiranteService} from '../../services/entidades/evaluacion-aspirante.service';
import {EvaluacionCurricular} from '../../services/entidades/evaluacion-curricular.model';

@Component({
  selector: 'app-aspirante',
  templateUrl: './aspirante.component.html',
  styleUrls: ['./aspirante.component.css']
})
export class AspiranteComponent implements OnInit {

  @ViewChild('modalDictamenNoAceptacion')
  modalDictamenNoAceptacion: ModalComponent;
  formularioComentarios: FormGroup;
  formularioRegistroPagina: FormGroup;

  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  paginacion: PaginacionInfo;
  // registros: Array<Estudiante> = [];
  registros: Array<EvaluacionAspirante> = [];
  registrosEstudiante: Array<Estudiante> = [];
  vistaARegresar = 'ListaAspirantes';
  opcionesResultados: Array<ItemSelects> = [];
  opcionesProgramaDocente: Array<ItemSelects>;
  opcionesPromocion: Array<ItemSelects> = [];
  mostrarGenerarDictamen: boolean = false;
  mostrarGenerarDictamenNoAceptacion: boolean = false;

  columnas: Array<any> = [
    { titulo: 'Folio COLSAN', nombre: 'idFolioSolicitud', sort: false},
    { titulo: 'Nombre del aspirante*', nombre: 'idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Programa Docente', nombre: 'idPromocion.idProgramaDocente.descripcion',
      sort: 'asc'},
    // { titulo: 'LGAC', nombre: 'idLgac.denominacion', sort: false},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion', sort: 'asc'},
    { titulo: 'Resultado', nombre: 'idEstatus.valor', sort: 'asc'},
  ];
  // TODO se elimina columna LGAC, ya que no guarda relevancia para Docencia HD-827

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  router: Router;
  botonValido: boolean = false;
  estudiantesService;
  estatusCatalogoService;
  programaDocneteService;
  promocionService;
  evaluacionAspiranteService;
  registroSelecionado: Estudiante;
  criteriosCabezera: string = '';
  exportarFormato = '';
  noSeleccionoPromocion: boolean = true;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
    'idDatosPersonales.nombre,idDatosPersonales.primerApellido,' +
    'idDatosPersonales.segundoApellido' }
  };

  usuarioRol: UsuarioRoles;

  private erroresConsultas: Array<Object> = [];
  private errorConsulta: Array<ErrorCatalogo> = [];
  private selectPromocionDeshabilitado: boolean = true;
  private selectResultados: boolean = true;

  constructor( private elementRef: ElementRef,
               private injector: Injector,
               private _renderer: Renderer,
               private _router: Router,
               public _catalogosService: CatalogosServices,
               public _spinner: SpinnerService,
               public usuarioRolService: UsuarioRolService,
               private authService: AuthService,
               private _evaluacioncurricularService: EvaluacionCurricularService,
               private _evaluacionAspirantesService: EvaluacionAspiranteService
               ) {
    this.router = _router;

    this.formularioComentarios = new FormGroup({
      comentarios: new FormControl('', Validators.required)
    });

    this.prepareServices();
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.recuperarRolUsuarioLogueadoYProgramasDocentes(usuarioLogueado.id);

    // this.getCatalogoPromocion();
    this.getCatalogoResultado();

    this.formularioRegistroPagina = new FormGroup ({
      registrosPorPagina: new FormControl('')
    });
    if (sessionStorage.getItem('aspirantesLimite')) {
      this.limite = +sessionStorage.getItem('aspirantesLimite');
    }
    (<FormControl>this.formularioRegistroPagina.controls['registrosPorPagina'])
      .setValue(this.limite);

  }

  ngOnInit(): void {
    // this.onCambiosTabla();
  }

  recuperarRolUsuarioLogueadoYProgramasDocentes(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this._spinner.start('recuperarUsuario');
    this.usuarioRolService.getListaUsuarioRol(
      this.errorConsulta,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
        });
      },
      error => {
        console.error(error);
        this._spinner.stop('recuperarUsuario');
      },
      () => {
        this._spinner.stop('recuperarUsuario');
        this.getCatalogoProgramaDocente();
        if (this.usuarioRol.rol.id !== 2 || sessionStorage.getItem('aspirantesCriterios')) {
          this.onCambiosTabla();
        }
      }
    );
  }

  sortChanged(columna): void {
    sessionStorage.removeItem('aspirantesOrdenamiento');
    // console.log('columna', columna);
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

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  onCambiosTabla(): void {
    this.registroSelecionado = null;
    this.mostrarGenerarDictamen = false;
    this.mostrarGenerarDictamenNoAceptacion = false;
    this.registrosEstudiante = [];
    let urlSearch: URLSearchParams = new URLSearchParams();
    // console.log('fitlro: ' + this.configuracion.filtrado.textoFiltro);
    let criterios = '';
    let ordenamiento = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      // urlSearch.set('criterios', criterios);
      // criterios = '';
    } else if (this.criteriosCabezera == '' && this.usuarioRol.rol.id === 2) {
      this.criteriosCabezera = 'idPromocion.idProgramaDocente~' + this.usuarioRol.usuario.programaDocente.id + ':IGUAL';
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

    if (!sessionStorage.getItem('aspirantesOrdenamiento')) {
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });
      sessionStorage.setItem('aspirantesOrdenamiento', ordenamiento);
    }

    if (!sessionStorage.getItem('aspirantesCriterios')) {
      sessionStorage.setItem('aspirantesCriterios', criterios);
    }

    this.limite = +sessionStorage.getItem('aspirantesLimite') ? +sessionStorage.getItem('aspirantesLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('aspirantesPagina') ? +sessionStorage.getItem('aspirantesPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('aspirantesCriterios'));
    urlSearch.set('ordenamiento', sessionStorage.getItem('aspirantesOrdenamiento'));
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    this._spinner.start('aspirante1');
    this.estudiantesService.getListaEstudianteOpcional(
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
          this.registrosEstudiante.push(new Estudiante(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        console.error(error);
        this._spinner.stop('aspirante1');
      },
      () => {
        // console.log('paginacionInfo', this.paginacion);
        // console.log('registros', this.registrosEstudiante);
        this._spinner.stop('aspirante1');
      }
    );
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.promocionService
      .getListaPromocionesPag(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
      response => {
        this.opcionesPromocion = [];

        response.json().lista.forEach((promocion) => {
          this.opcionesPromocion = this.promocionService
            .getSelectPromocion(this.erroresConsultas, urlParameter);
        });
      },
      error => { },
      () => {
        this.selectPromocionDeshabilitado = false;
        this.selectResultados = false;
      }
    );
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idEstatus: number
  ): void {
    this.limpiarVariablesSession();
    let estatus: string = '';
    if (idEstatus == 1102) {
      // 1014  Proceso de admision en proceso
      // 1102 - en proceso
      // 1009 - incumple
      // 1010 - Por validar

      estatus = 'idEstatus~1014:IGUAL;OR,idEstatus~1102:IGUAL;OR,idEstatus~1009:IGUAL;OR,idEstatus~1010:IGUAL;ORGROUPAND';
    } else {
      estatus = 'idEstatus~' + idEstatus + ':IGUAL';
    }

    if (idProgramaDocente) {
      // this.criteriosCabezera = 'idEstatus.idCatalogo~1002:IGUAL';
      this.criteriosCabezera = 'idPromocion.idProgramaDocente~' +
        idProgramaDocente + ':IGUAL';
      if (idPromocion) {
        // console.log('solo programa docente y promocion');
        this.criteriosCabezera = this.criteriosCabezera + ',idPromocion~'
          + idPromocion + ':IGUAL';
      }
      if (idEstatus) {
        this.criteriosCabezera = this.criteriosCabezera + ',' + estatus;
      }
    }
    // si todos los selects contiene informacion
    if (idProgramaDocente && idPromocion && idEstatus) {
      this.criteriosCabezera = estatus;
      this.criteriosCabezera = this.criteriosCabezera + ',idPromocion.idProgramaDocente~' +
        idProgramaDocente + ':IGUAL';
      this.criteriosCabezera = this.criteriosCabezera + ',idPromocion~'
        + idPromocion + ':IGUAL';

    }
    if (idEstatus && !idProgramaDocente && !idPromocion) {
      this.criteriosCabezera = estatus;
    }

    sessionStorage.setItem('aspirantesIdPromocion', idPromocion.toString());
    sessionStorage.setItem('aspirantesIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('aspirantesIdEstatus', idEstatus.toString());
    this.onCambiosTabla();
  }

  cambiarPagina(evento: any): void {
    sessionStorage.removeItem('aspirantesPagina');
    this.paginaActual = evento.page;
    sessionStorage.setItem('aspirantesPagina', this.paginaActual.toString());
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSelecionado === registro);
  }

  setLimite(limite: string): void {
    sessionStorage.removeItem('aspirantesLimite');
    this.limite = Number(limite);
    sessionStorage.setItem('aspirantesLimite', this.limite.toString());
    sessionStorage.setItem('aspirantesPagina', '1');
    this.onCambiosTabla();
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  aspiranteDetalles(): void {
    if (this.registroSelecionado ) {
      this.router.navigate(['aspirante', 'detalles',
        {id: this.registroSelecionado.id, vistaSolicitante: false,
          vistaAnterior: this.vistaARegresar}]);

    }
  }

  getCatalogoProgramaDocente(): void {
    // this.opcionesProgramaDocente = this.programaDocneteService.getSelectProgramaDocente(this.erroresConsultas);
    let urlSearch = new URLSearchParams();
    urlSearch.set('ordenamiento', 'descripcion:ASC');

    if (this.usuarioRol.rol.id === 2) {
      urlSearch.set('criterios', 'id~' + this.usuarioRol.usuario.programaDocente.id + ':IGUAL');
    }
    this.opcionesProgramaDocente = this.programaDocneteService.
    getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    // console.log('cat', this.opcionesProgramaDocente);
  }

  getCatalogoPromocion(): void {
    this.opcionesPromocion =
      this.promocionService.getSelectPromocion(this.erroresConsultas);
  }

  getCatalogoResultado(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
          urlParameter.set('ordenamiento', 'valor:ASC');

    urlParameter.set('criterios', 'idCatalogo~1002:IGUAL;OR,idCatalogo~1006:IGUAL;OR'); // 4 catalogo de estudiantes
    this.estatusCatalogoService.
      getListaEstatusOpcional(
          this.erroresConsultas,
          urlParameter
      ). subscribe(
        response => {
          let respuesta = response.json();
          respuesta.lista.forEach(element => {
            if (element.id !== 1006 && element.id !== 1105 &&
              element.id !== 1106 && element.id !== 1107) {
              this.opcionesResultados.push(
                new ItemSelects(element.id, element.valor)
              );
            }
          });
        },
        error => {

        },
        () => {

        }
      );
  }

  validarFormulario(): void {

  }

  obtenerAspirantes(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

  }

  listaToDocumento(): void {

  }

  getAspirante(registro): void {
    this.mostrarGenerarDictamen = false;
    this.mostrarGenerarDictamenNoAceptacion = false;

    if (this.registroSelecionado !== registro) {
      this.registroSelecionado = registro;
      if (this.registroSelecionado.estatus.id === 1002 || this.registroSelecionado.estatus.id === 1006) {
        this.mostrarGenerarDictamen = true;
      } else  if (this.registroSelecionado.estatus.id === 1101 ||
        this.registroSelecionado.estatus.id === 1100) {
        // Estatus 1101 Aspirante rechazaado segunda fase
        // Estatus 1100 Aspirante rechazaado primera fase
        this.mostrarGenerarDictamenNoAceptacion = true;
      }

    } else {
      this.registroSelecionado = null;
      this.mostrarGenerarDictamen = false;
      this.mostrarGenerarDictamenNoAceptacion = false;
    }
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

  modalRegistro(idPromocion: number): void {
    if (idPromocion) {
      this._spinner.start('aspirante2');
      this.promocionService.getFormatoPdf(
        idPromocion,
        this.erroresConsultas,
        'ResultadosFinales'
      ).subscribe(
        response => {
          this.exportarFormato = response.json();
          // console.log(this.exportarFormato);
        },
        error => {
          console.error(error);
          this._spinner.stop('aspirante2');
        },
        () => {
          window.open(this.exportarFormato);
          this._spinner.stop('aspirante2');
        }
      );
    }else {
      alert('no se ha seleccionado una promoción');
    }
  }

  hayPromocion(idPromocion: number): void {
    if (idPromocion) {
      this.noSeleccionoPromocion = false;
    }else {
      this.noSeleccionoPromocion = true;
    }

  }

  descargarFormatoDictamenAceptacion(): void {
    this._spinner.start('aspirante3');
    this.estudiantesService.getFormatoPdf(
      this.registroSelecionado.id,
      this.erroresConsultas, 'DictamenAceptacion'
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
        this._spinner.stop('aspirante3');
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop('aspirante3');
      }
    );
  }

  generarSolicitudAdminision(): void {
    this._spinner.start('solicitudAdmision');
    this.estudiantesService.getFormatoPdf(
      this.registroSelecionado.id,
      this.erroresConsultas, 'SolicitudAdmision'
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
        this._spinner.stop('solicitudAdmision');
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop('solicitudAdmision');
      }
    );
  }

  descargarFormatoActa(idPromocion: number): void {
    if (idPromocion) {
      this._spinner.start('aspirante4');
      this.promocionService.getFormatoPdf(
        idPromocion,
        this.erroresConsultas,
        '​ActaComiteAdmision'
      ).subscribe(
        response => {
          this.exportarFormato = response.json();
          // console.log(this.exportarFormato);
        },
        error => {
          console.error(error);
          this._spinner.stop('aspirante4');
        },
        () => {
          window.open(this.exportarFormato);
          this._spinner.stop('aspirante4');
        }
      );
    }else {
      alert('no se ha seleccionado una promoción');
    }
  }

  descargarFormatoDictamenNoAceptacion(comentarios): void {
    this._spinner.start('aspirante5');
    this.estudiantesService.getFormatoPdf(
      this.registroSelecionado.id,
      this.erroresConsultas, 'DictamenNoAceptacion',comentarios
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        // console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
        this._spinner.stop('aspirante5');
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop('aspirante5');
        this.modalDictamenNoAceptacion.close();
      }
    );
  }

  abrirModalDictamenNoAceptacion(): void {
    if (this.registroSelecionado.estatus.id === 1101) {
      // Estatus 1101 Aspirante rechazaado segunda fase
      // Se obtiene comentarios de la evaluacion
      console.log('2da. FASE');
      this.getConsideracionRechazadoSegundaFase();
    } else if (this.registroSelecionado.estatus.id === 1100) {
      // Estatus 1100 Aspirante rechazaado primera fase
      console.log('1ra. FASE');
      this.getConsideracionRechazadoPrimeraFase();
    }

  }

  cerrarModalDictamenNoAceptacion(): void {
    this.modalDictamenNoAceptacion.close();
  }

  enviarFormulario(): void {
    let comentarios = (<FormControl>this.formularioComentarios.controls['comentarios']).value;
    console.log('comentarios: ',comentarios);
    this.descargarFormatoDictamenNoAceptacion(comentarios);
  }

  private prepareServices(): void {
    this.estudiantesService =
      this._catalogosService.getEstudianteService();
    this.programaDocneteService =
      this._catalogosService.getCatalogoProgramaDocente();
    this.promocionService =
      this._catalogosService.getPromocion();
    this.estatusCatalogoService =
      this._catalogosService.getEstatusCatalogo();
    this.evaluacionAspiranteService =
      this._catalogosService.getEvaluacionAspirante();
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('aspirantesCriterios');
    sessionStorage.removeItem('aspirantesOrdenamiento');
    sessionStorage.removeItem('aspirantesLimite');
    sessionStorage.removeItem('aspirantesPagina');
  }

  getConsideracionRechazadoPrimeraFase() {
    this._spinner.start('getConsideracionesPrimeraFase');
    let criterios = 'idEstudiante~' + this.registroSelecionado.id + ':IGUAL,coordinador~true:IGUAL';
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterios);
    this._evaluacioncurricularService.getListaEvaluacionCurricularOpcional(
      this.errorConsulta,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          let evaluacioncurricular = new EvaluacionCurricular(item);
          (<FormControl>this.formularioComentarios.controls['comentarios']).setValue(evaluacioncurricular.consideraciones);
        });
      },
      error => {
        console.error(error);
        this._spinner.stop('getConsideracionesPrimeraFase');
        this.modalDictamenNoAceptacion.open('sm');
      },
      () => {
        this._spinner.stop('getConsideracionesPrimeraFase');
        this.modalDictamenNoAceptacion.open('sm');
      }
    );
  }

  getConsideracionRechazadoSegundaFase() {
    this._spinner.start('getConsideracionesSegundaFase');
    let criterios = 'idEstudiante~' + this.registroSelecionado.id + ':IGUAL,coordinador~true:IGUAL';
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', criterios);
    this._evaluacionAspirantesService.getListaEvaluacionOpcional(
      this.errorConsulta,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          let segundaFase = new EvaluacionAspirante(item);
          (<FormControl>this.formularioComentarios.controls['comentarios']).setValue(segundaFase.consideraciones);
        });
      },
      error => {
        console.error(error);
        this._spinner.stop('getConsideracionesSegundaFase');
        this.modalDictamenNoAceptacion.open('sm');
      },
      () => {
        this._spinner.stop('getConsideracionesSegundaFase');
        this.modalDictamenNoAceptacion.open('sm');
      }
    );
  }
}
