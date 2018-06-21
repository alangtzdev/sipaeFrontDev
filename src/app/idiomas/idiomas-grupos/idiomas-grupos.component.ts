import {Component, ViewChild, OnInit, Renderer, Injector} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {GrupoIdioma} from '../../services/entidades/grupo-idioma.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {URLSearchParams} from '@angular/http';
import {Validacion} from '../../utils/Validacion';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {ConfigService} from '../../services/core/config.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {EstudianteGrupoIdioma} from '../../services/entidades/estudiante-grupo-idioma.model';
// import {RespuestasEvaluacionDocenteIdiomasService} from '../../services/entidades/respuestas-evaluacion-docente-idiomas.service';
import {RespuestasEvaluacionDocenteIdiomas} from '../../services/entidades/respuestas-evaluacion-docente-idiomas.model';

@Component({
  selector: 'app-idiomas-grupos',
  templateUrl: './idiomas-grupos.component.html',
  styleUrls: ['./idiomas-grupos.component.css']
})
export class IdiomasGruposComponent implements OnInit {

  @ViewChild('modalDetalleGrupo')
  modalDetalleGrupo: ModalComponent;
  @ViewChild('modalDetalleEvaluacionProfor')
  modalDetalleEvaluacionProfor: ModalComponent;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';
  paginacion: PaginacionInfo;
  parametroBusqueda: string = '';
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  exportarExcelUrl = '';
  exportarPdfUrl = '';

  exportarListaAsistenciaExcelUrl = '';
  exportarListaAsistenciaPdfUrl = '';
  registros: Array<GrupoIdioma> = [];
  registroSeleccionado: GrupoIdioma;
//  mensajesError: any = errorMessages;
  validacionActiva: boolean = false;

  columnas: Array<any> = [
    { titulo: 'Idioma*', nombre: 'idIdioma.descripcion', sort: 'asc' },
    { titulo: 'Nivel*', nombre: 'idNivel.valor', sort: 'asc' },
    { titulo: 'Nombre del profesor*', nombre: 'profesor', sort: 'asc' },
  ];

  periodoService;
  idiomaService;
  grupoIdiomaService;
  estudianteGrupoIdiomaService;
  formulario: FormGroup;
  exportarFormato = '';

  router: Router;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];
  private alertas: Array<Object> = [];

  private opcionesPeriodo: Array<ItemSelects> = [];
  private opcionesIdioma: Array<ItemSelects> = [];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'idIdioma.descripcion,idNivel.valor,profesor' }
  };

  // variables para detalle grupo idioma
  private paginacionDetalleGrupoIdioma: PaginacionInfo;
  private parametroBusquedaDetalleGrupoIdioma: string = '';
  private paginaActualDetalleGrupoIdioma: number = 1;
  private maxSizePagsDetalleGrupoIdioma: number = 5;
  private limiteDetalleGrupoIdioma: number = 3;
  private grupoIdioma: GrupoIdioma = undefined;
  private registrosGrupoIdioma: Array<EstudianteGrupoIdioma> = [];
  columnasTablaDetalleGrupoIdioma: Array<any> = [
        { titulo: 'Matrícula', nombre: 'matricula', sort: false },
        { titulo: 'Alumno', nombre: 'alumno', sort: false },
        { titulo: 'Programa Docente', nombre: 'programa docente', sort: false },
  ];
  // fin de variables para detalle grupo idioma

  // variables para graficas idiomas //
  private resultados: any = {observaciones: [], si: 0, no: 0, respuestas: [] };
  private profesorNombre: string = undefined;
  private materNombre: string = undefined;
  private curoOptativo: any = undefined;
  private erroresEvaluacionConsultas: Array<ErrorCatalogo> = [];
  private _evaluacionDocenteIdiomasService;
  private idEvaluacionDocente: number = undefined;
  private _respuestaEvaluacionDocenteIdiomasService;
  private tabSeleccionada: number = undefined;
  private idGrupoIdioma: number = undefined;
  // fin variables para graficas idiomas //

  constructor(private _catalogosServices: CatalogosServices,
              private _spinner: SpinnerService,
              private _archivoService: ArchivoService,
              // private _respuestaEvaluacionDocenteIdiomasService: RespuestasEvaluacionDocenteIdiomasService,
              public _router: Router) {
    this.prepareServices();

      if(sessionStorage.getItem('idioma')){
      let promocion='idIdioma';
      }

      if (sessionStorage.getItem('idiomasCriterios')){
        this.onCambiosTabla();
  }
    this.router = _router;
    this.formulario = new FormGroup({
      idPeriodo: new FormControl('', Validators.required),
      idIdioma: new FormControl(''),


    });
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
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      // console.log('registroSeleccionado:::' + this.registroSeleccionado.id);
    } else {
      this.registroSeleccionado = null;
    }
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

    urlSearch.set('criterios', criterios);
    if (!sessionStorage.getItem('idiomasCriterios')) {
    if (this.parametroBusqueda !== '') {
      criterios = this.parametroBusqueda;
      urlSearch.set('criterios', criterios);
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
    sessionStorage.setItem('idiomasCriterios', criterios);
    sessionStorage.setItem('idiomasOrdenamiento', ordenamiento);
    sessionStorage.setItem('idiomasLimite', this.limite.toString());
    sessionStorage.setItem('idiomasPagina', this.paginaActual.toString());

}
this.limite = +sessionStorage.getItem('idiomasLimite') ? +sessionStorage.getItem('idiomasLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('idiomasPagina') ? +sessionStorage.getItem('idiomasPagina') : this.paginaActual;


    urlSearch.set('criterios', sessionStorage.getItem('idiomasCriterios')
     ? sessionStorage.getItem('idiomasCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('idiomasOrdenamiento') 
    ? sessionStorage.getItem('idiomasOrdenamiento') : ordenamiento);

   urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());

    this._spinner.start('idiomasgrupos1');
    this.grupoIdiomaService.getListaGrupoIdioma(this.erroresConsultas,
      urlSearch, this.configuracion.paginacion)
      .subscribe(
        response => {
          let grupoIdiomaJson = response.json();

          this.registros = [];
          this.paginacion = new PaginacionInfo(
            grupoIdiomaJson.registrosTotales,
            grupoIdiomaJson.paginas,
            grupoIdiomaJson.paginaActual,
            grupoIdiomaJson.registrosPagina
          );

          grupoIdiomaJson.lista.forEach((item) => {
            this.registros.push(new GrupoIdioma(item));
          });

          this.exportarExcelUrl = grupoIdiomaJson.exportarEXCEL;
          this.exportarPdfUrl = grupoIdiomaJson.exportarPDF;
        },
        error => {
//          if (assertionsEnabled())
          // console.log(error);

            this._spinner.stop('idiomasgrupos1');
        },
        () => {
/*          if (assertionsEnabled()) {
            //console.log('paginacionInfo', this.paginacion);
            //console.log('registros', this.registros);
          }*/
          this._spinner.stop('idiomasgrupos1');
        }
      );
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession(); 
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltroBusqueda(): void {
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
    }
  }

  descargarActaCalificaciones(): void {
    this._spinner.start('idiomasgrupos2');
    this.grupoIdiomaService.getActaCalificaciones(
      this.registroSeleccionado.id,
      this.erroresConsultas
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
        this._spinner.stop('idiomasgrupos2');
      }
    );
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession(); 
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  setPagina(pagina: string): void {
    this.paginaActual = Number(pagina);
    this.onCambiosTabla();
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  private filtrarRegistros(
    idPeriodo: number,
    idIdioma: number = null
  ) {
       this.limpiarVariablesSession(); 
    if (this.validarFormulario()) {
      if (idPeriodo) {
        this.parametroBusqueda = 'idPeriodo~' + idPeriodo + ':IGUAL';
      }
      if (idIdioma) {
        this.parametroBusqueda = this.parametroBusqueda + ',idIdioma~' + idIdioma + ':IGUAL';
      }
     sessionStorage.setItem('idiomaIdPerodo', idPeriodo.toString());
      sessionStorage.setItem('idIdioma', idIdioma.toString());
           this.onCambiosTabla();
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);  // ValidacionService.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  agregarGrupo(): void {
    this.router.navigate(['idiomas','agregar-grupo-idiomas']);
  }

  editarGrupo(): void {
    this.router.navigate(['idiomas','agregar-grupo-idiomas', {id: this.registroSeleccionado.id}]);
    //this._router.navigate(['Idiomas', 'AgregarGrupoidiomas', {id: this.registroSeleccionado.id, editar: 'EDITAR'}]);
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
        if (this.exportarPdfUrl) {
          window.open(this.exportarPdfUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  exportarlistaAsistenciaGrupoIdioma(tipo): void {
    switch (tipo) {
      case 'Excel':
        if (this.exportarListaAsistenciaExcelUrl) {
          window.open(this.exportarListaAsistenciaExcelUrl);
        } else {
          alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarListaAsistenciaPdfUrl) {
          window.open(this.exportarListaAsistenciaPdfUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  listaAlumnosGrupoIdioma(tipoExport: string): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idGrupoIdioma.id~' + this.registroSeleccionado.id + ':IGUAL';

    urlSearch.set('criterios', criterios);

    this._spinner.start('idiomasgrupos3');
    this.estudianteGrupoIdiomaService.getListaEstudiantesGrupoIdioma(this.erroresConsultas,
      urlSearch).subscribe(
      response => {
        let listaEstudianteGrupoIdiomaJson = response.json();

        this.exportarListaAsistenciaExcelUrl = listaEstudianteGrupoIdiomaJson.exportarEXCEL;
        this.exportarListaAsistenciaPdfUrl = listaEstudianteGrupoIdiomaJson.exportarPDF;
        this.exportarlistaAsistenciaGrupoIdioma(tipoExport);
        if (listaEstudianteGrupoIdiomaJson.length === 0) {
          this._spinner.stop('idiomasgrupos3');
        }
      },
      error => {
        // if (assertionsEnabled())
        // console.log(error);

          this._spinner.stop('idiomasgrupos3');
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop('idiomasgrupos3');
      }
    );
  }

  private prepareServices () {
    this.periodoService = this._catalogosServices.getPeriodoEscolar();
    this.opcionesPeriodo = this.periodoService.getSelectPeriodoEscolarPeriodo(this.erroresConsultas);

    this.idiomaService = this._catalogosServices.getIdioma();
    this.opcionesIdioma = this.idiomaService.getSelectIdioma(this.erroresConsultas);

    this.grupoIdiomaService = this._catalogosServices.getGrupoIdiomaService();
    this.estudianteGrupoIdiomaService = this._catalogosServices.getEstudianteGrupoIdiomaService();
    this._evaluacionDocenteIdiomasService = this._catalogosServices.getEvaluacionDocenteIdiomasService();
    this._respuestaEvaluacionDocenteIdiomasService = this._catalogosServices.getRespuestasEvaluacionDocenteIdiomasService();
    this.onCambiosTabla();

  }

  ngOnInit() {
  }

  /**INICIA SECCION DE MODAL DETALLE GRUPO 
   * *************************************
   * *************************************
  */

  private modaldetalleGrupoIdioma(): void {
    this.grupoIdioma = this.registroSeleccionado;
    this.onCambiosTablaDetalleGrupoIdioma();
    this.modalDetalleGrupo.open('lg');
  }

  onCambiosTablaDetalleGrupoIdioma(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idGrupoIdioma.id~' + this.grupoIdioma.id + ':IGUAL';

    urlSearch.set('criterios', criterios);
    urlSearch.set('limit', this.limiteDetalleGrupoIdioma.toString());
    urlSearch.set('pagina', this.paginaActualDetalleGrupoIdioma.toString());

    this._spinner.start('obtenerListaEstudiantes');
    this.estudianteGrupoIdiomaService.getListaEstudiantesGrupoIdioma(this.erroresConsultas,
        urlSearch, this.configuracion.paginacion).subscribe(
            response => {
                let estGrupoIdiomaJson = response.json();

                this.registrosGrupoIdioma = [];
                this.paginacionDetalleGrupoIdioma = new PaginacionInfo(
                    estGrupoIdiomaJson.registrosTotales,
                    estGrupoIdiomaJson.paginas,
                     estGrupoIdiomaJson.paginaActual,
                    estGrupoIdiomaJson.registrosPagina
                );

                estGrupoIdiomaJson.lista.forEach((item) => {
                    this.registrosGrupoIdioma.push(new EstudianteGrupoIdioma(item));
                });
            },
            error => {
                this._spinner.stop('obtenerListaEstudiantes');
            },
            () => {
                 this._spinner.stop('obtenerListaEstudiantes');
            }
        );
  }

  private isSetPaginacionDetalleGrupoIdioma(): boolean {
        let result: boolean = false;
        if (this.paginacionDetalleGrupoIdioma) {
            result = true;
        }
        return result;
  }

  private cambiarPaginaDetalleGrupoIdioma(evento: any): void {
    this.limpiarVariablesSession(); 
        this.paginaActualDetalleGrupoIdioma = evento.page;
        this.onCambiosTablaDetalleGrupoIdioma();
  }

  private setLimiteDetalleGrupoIdioma(limite: string): void {
        this.limiteDetalleGrupoIdioma = Number(limite);
        this.onCambiosTablaDetalleGrupoIdioma();
  }

  private setPaginaDetalleGrupoIdioma(pagina: string): void {
        this.paginaActualDetalleGrupoIdioma = Number(pagina);
        this.onCambiosTablaDetalleGrupoIdioma();
  }

  private descargarArchivo(id: number): void {
        // console.log('descarga');
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
                            '/api/v1/archivodescargar/' +
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

  private cerrrarModalDetalleGrupo(): void {
    this.grupoIdioma = undefined;
    this.modalDetalleGrupo.close();
  }

  /**TERMINA SECCION DE MODAL DETALLE GRUPO 
   * **************************************
   * **************************************
  */

  /**INICIA SECCION DE MODAL EVALUACION 
   * **************************************
   * **************************************
  */
  private modaldetalleEvaluacionGrupoIdioma(): void {
    this.erroresEvaluacionConsultas = [];

        let profesorNombre: string;
        let materiaNombre: string;
        let cursoOptativo: any;
        cursoOptativo = null;
        if (this.registroSeleccionado) {
            this._spinner.start('buscarResultados');
            this.idGrupoIdioma = this.registroSeleccionado.id;
            console.log('this.idGrupoidioma', this.idGrupoIdioma);
            profesorNombre = this.registroSeleccionado.profesor;
            materiaNombre = this.registroSeleccionado.idioma.descripcion;
            let criterios = '';
            let urlParameter = new URLSearchParams();
            criterios += 'idEvaluacionDocenteIdiomasAlumno.idEstudianteGrupoIdioma.idGrupoIdioma~' +
                this.registroSeleccionado.id + ':IGUAL';
            criterios += ',idEvaluacionDocenteIdiomasAlumno.idEstudianteGrupoIdioma.idGrupoIdioma.idPeriodo~' +
             this.registroSeleccionado.periodo.id + ':IGUAL';
            // criterios ="";
            urlParameter.set('criterios', criterios);
            // console.log('criterios', criterios);
            // console.log('Registro seleccionado', this.registroSeleccionado);
            let resultados: any = { observaciones: [], si: 0, no: 0, respuestas: [] };
            for (let x = 1; x <= 5; x++) {
                for (let y = 0; y < 9; y++) {
                    if (!resultados.respuestas[x]) {
                        resultados.respuestas[x] = [];
                    }
                    if (!resultados.respuestas[x][y]) {
                        resultados.respuestas[x][y] = 0;
                    }
                }

            }
            let evaluaciones: any = [];
            this._evaluacionDocenteIdiomasService.getListaEvaluacionDocente(
                this.erroresEvaluacionConsultas,
                urlParameter
                ).subscribe(
                response => {
                    // console.log(response.json());
                    let auxEvaluaciones = [];
                    if (response.json().lista.length > 0) {
                        auxEvaluaciones.push(response.json().lista[0]);
                    }
                    // let evaluaciones = response.json().lista;
                    response.json().lista.forEach((item) => {
                        if (item.id_evaluacion_docente_idiomas_alumno) {
                            if (!this.registroEstaAgregado(auxEvaluaciones,
                            item.id_evaluacion_docente_idiomas_alumno.id)) {
                                 auxEvaluaciones.push(item);
                            }
                        }
                    });
                    // console.log('Auxilisar de acaluaciones', auxEvaluaciones);
                    evaluaciones = auxEvaluaciones;
                    // console.log('asignacion de evaluaciones', evaluaciones);

                    let criteriosEvaluaciones = '';
                    let idEvaluaciondocnete ;
                    let urlParameter = new URLSearchParams();
                    // console.log(evaluaciones.length);
                    if (evaluaciones.length >= 2) {
                        evaluaciones.forEach(function (elemento) {
                            idEvaluaciondocnete = elemento.id;
                            let existeObs = false;
                            if (elemento.observaciones) {
                                if (elemento.observaciones.length > 0) {
                                    for (let index = 0; index < resultados.observaciones.length; index++) {
                                        let obs = resultados.observaciones[index];
                                        if (obs == elemento.observaciones) {
                                            existeObs = true;
                                            break;
                                        }
                                    }
                                    if (!existeObs) {
                                        resultados.observaciones.push(elemento.observaciones);
                                    }
                                }
                            }

                            criteriosEvaluaciones = criteriosEvaluaciones + ((criteriosEvaluaciones === '') ? '' : ';ORGROUPOR,') +
                              'idEvaluacionDocenteIdiomas~' + elemento.id + ':IGUAL';
                        });
                        // TODO Se agrega variable para obtener una evaluacion docente para generar reporte en PDF 04/01/2017
                        this.idEvaluacionDocente = idEvaluaciondocnete;
                        // console.log("criteriosEvaluaciones", criteriosEvaluaciones);
                        urlParameter.set('criterios', criteriosEvaluaciones);
                        let contador = 0;
                        let me = this;
                        this._respuestaEvaluacionDocenteIdiomasService.getListaRespuestasEvaluacionDocenteIdiomas(
                            this.erroresEvaluacionConsultas,
                            urlParameter,
                            true
                        ).subscribe(
                            response => {
                                let respuesta;
                                response.json().lista.forEach(function (element) {

                                    respuesta = new RespuestasEvaluacionDocenteIdiomas(element);
                                    // let anio = respuesta.evaluacion.estudianteMateriaImpartida.materiaImpartida.periodoEscolar.anio;
                                    let clavePregunta = parseInt(respuesta.preguntaEvaluacionDocenteIdiomas.valor, 10);
                                    let claveRespuesta = parseInt(respuesta.respuestaEvaluacionDocenteIdiomas.valor, 10);
                                    switch (claveRespuesta) {
                                        case 1:
                                        case 2:
                                        case 3:
                                        case 4:
                                        case 5:
                                            resultados.respuestas[claveRespuesta][clavePregunta - 1] += 1;
                                            break;
                                        case 6:
                                            resultados.si++;
                                            break;
                                        case 7:
                                            resultados.no++;
                                            break;
                                        default:
                                            break;
                                    }
                                    contador++;

                                });
                            },
                            console.error,
                            () => {
                                this._spinner.stop('buscarResultados');

                                if (evaluaciones.length >= 2) {
                                  this.resultados = resultados;
                                  this.profesorNombre = profesorNombre;
                                  // this.cursoOptativo = cursoOptativo;
                                  this.materNombre = materiaNombre;

                                  this.abrirModalEvaluacionProfesor();

                                } else {
                                    this.alertas[0] = {
                                        type: 'danger',
                                        msg: 'No hay suficientes evaluaciones para graficar la materia',
                                        closable: true
                                    };
                                }
                            }
                        );
                    } else {
                        this._spinner.stop('buscarResultados');
                        this.alertas[0] = {
                            type: 'danger',
                            msg: 'No hay suficientes evaluaciones para graficar la materia',
                            closable: true
                        };
                    }
                }, console.error
            );
        }
  }

  private registroEstaAgregado(arregloEvaluaciones, itemABuscar): boolean {
        let estaAgregado = false;
        arregloEvaluaciones.forEach((item) => {
            if (item.id_evaluacion_docente_idiomas_alumno.id === itemABuscar ) {
                estaAgregado = true;
            }
        });

        return estaAgregado;
  }

  private abrirModalEvaluacionProfesor(): void {
    this.tabSeleccionada = 1;
    this.modalDetalleEvaluacionProfor.open('lg');
  }

  private seleccionarTab(registro): void {
        if (this.tabSeleccionada !== registro) {
            this.tabSeleccionada = registro;
        }
  }

  private descargarResultados(): void {
    let urlExportGraficos: string;
    this._spinner.start('descargarArchivo');
    this._evaluacionDocenteIdiomasService.getGraficosPDF(
        this.registroSeleccionado.id,
        this.erroresConsultas
    ).subscribe(
        response => {
            urlExportGraficos = response.json();
            // console.log(urlExportGraficos);
        },
        error => {
            this._spinner.stop('descargarArchivo');
        },
        () => {
            this._spinner.stop('descargarArchivo');
            window.open(urlExportGraficos);

        }
    );
  }

  private cerrarModalEvaluacionProfesor(): void {
    this.materNombre = undefined;
    this.profesorNombre = undefined;
    this.tabSeleccionada = 1;
    this.idGrupoIdioma = undefined;
    this.modalDetalleEvaluacionProfor.close();
  }
  /**TERMINA SECCION DE MODALEVALUACION 
   * **************************************
   * **************************************
  */

 limpiarVariablesSession() {
    sessionStorage.removeItem('idiomasCriterios');
    sessionStorage.removeItem('idiomasOrdenamiento');
    sessionStorage.removeItem('idiomasLimite');
    sessionStorage.removeItem('idiomasPagina');
  }

}