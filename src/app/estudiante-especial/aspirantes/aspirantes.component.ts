import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild, NgZone, Inject} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {EstudianteMovilidadExternaService} from '../../services/entidades/estudiante-movilidad-externa.service';
import {ProgramaDocenteServices} from '../../services/entidades/programa-docente.service';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {ItemSelects} from '../../services/core/item-select.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {NacionalidadService} from '../../services/catalogos/nacionalidad.service';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {NgUploaderOptions} from 'ngx-uploader';
import {ConfigService} from '../../services/core/config.service';
import * as moment from 'moment';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {DatoInformacionColsan} from '../../services/entidades/dato-informacion-colsan.model';
import {DatoInformacionColsanService} from '../../services/entidades/dato-informacion-colsan.service';
import {Puestos} from '../../services/entidades/puestos.model';
import {PuestosService} from '../../services/entidades/puestos.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {UsuarioServices} from '../../services/usuario/usuario.service';

@Component({
  selector: 'app-aspirantes',
  templateUrl: './aspirantes.component.html',
  styleUrls: ['./aspirantes.component.css'],
})
export class AspirantesComponent {

  @ViewChild('modalAsignarCorreo')
  modalAsignarCorreo: ModalComponent;
  @ViewChild('modalCredencial')
  modalCredencia: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  @ViewChild('modalMatriculaEI')
  modalMatriculaEI: ModalComponent;
  @ViewChild('modalAgregarMateria')
  modalAgregarMateriaMov: ModalComponent;
  @ViewChild('modalEliminarMateria')
  modalEliminarMateria: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idMatricula.matriculaCompleta'},
    { titulo: 'Nombre del estudiante*', nombre: 'idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Correo institucional', nombre: 'idUsuario.email', sort: false},
    { titulo: 'Institución', nombre: 'idDatosAcademicos', sort: false},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'}
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
    'idMatricula.matriculaCompleta,idDatosPersonales.primerApellido,' +
    'idDatosPersonales.segundoApellido,idDatosPersonales.nombre'}
  };

  registros: Array<EstudianteMovilidadExterna> = [];
  registroSeleccionado: EstudianteMovilidadExterna;
  catalogoService: CatalogosServices;
  estudianteMovilidadExternaService: EstudianteMovilidadExternaService;
  programaDocenteService: ProgramaDocenteServices;
  promocionService: PromocionServices;
  matriculaService;
  boletaService;
  usuarioRolService;
  evaluacionDocenteAlumnoService;
  estudianteMateriaService;
  periodoPromocionService;
  profesorMateriaService;
  opcionesSelectProgramaDocente: Array<ItemSelects>;
  opcionSelectNacionalidad: Array<ItemSelects> = [];
  opcionesSelectPromocion: Array<Promocion>;
  opcionesSelectNacionalidad: Array<ItemSelects>;
  generarMatricula: boolean = false;
  generarCredencial: boolean = false;
  usuarioLdap: boolean = false;
  planMaterias;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  vistaDetalle: boolean = false;
  private idProgramaDocente;
  private botonBuscar: boolean = true;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresConsultasModelo: Array<ErrorCatalogo> = [];

  private nombreArchivoFotografia: string = '';
  private nombrearchivoFirmaEstudiante: string = '';

  columnasDetalleMaterias: Array<any> = [
    { titulo: 'Materia', nombre: '' },
    { titulo: 'Profesor', nombre: ''},
    { titulo: 'Calificación', nombre: ''}
  ];
  private registrosEstudianteMateria: Array<EstudianteMateriaImpartida> = [];
  periodos;
  listaPromocionPeriodo: Array<PromocionPeriodoEscolar> = [];
  private registroAgregar: number = 0;
  opcionesSelectProfesorMateria: Array<ProfesorMateria> = [];
  opcionesSelectProfesorMateriaAux: Array<ProfesorMateria> = [];
  numeroPeriodo: number = 0;
  periodoEscolar: number = 0;
  mostrarAlerta: boolean = false;
  materiaAlerta: boolean = false;
  registroSeleccionadoProfesorMateria: ProfesorMateria;
  selectPeriodo: boolean = false;

  // variables modal expedir credenciaal
  formularioCredenciales: FormGroup;

  idArchivoFoto: number;
  idArchivoFirmaEstudiante: number;
  idArchivoFirmaAutorizacion: number;
  firmaDocencia: boolean = false;

  ////// picker ///
  dt: Date;
  dt2: Date;
  fechaMinima = new Date();
  fechaMaxima: Date;
  contador: number = 0;

  // variables subir archivos
  uploadFile: any;
  /*options: Object = {
   url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
   withCredentials: false,
   authToken: localStorage.getItem('token')
   };*/
  optionsJpg: NgUploaderOptions;
  optionsPNG: NgUploaderOptions;
  // zone: NgZone;
  basicProgressJpg: number = 0;
  basicProgressPng: number = 0;
  basicResp: Object;
  dropProgressJpg: number = 0;
  dropProgressPng: number = 0;
  dropResp: any[] = [];

  private alertas: Array<Object> = [];
  validacionActivaCredenciales: boolean = false;
  validarImagenCredencial: boolean = false;

  constructor(@Inject(NgZone) private zone: NgZone,
              private elementRef: ElementRef,
              private nacionalidadService: NacionalidadService,
              private injector: Injector,
              private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              private _usuarioService: UsuarioServices,
              private archivoService: ArchivoService,
              private datoInformacionCOLSANService: DatoInformacionColsanService,
              private puestoService: PuestosService
  ) {
    this.inicializarFormularioCredenciales();
    this.inicializarOpcionesNgZone();
    this.prepareServices();
    this.obtenerCatalogos();
    this.getCatNacionalidad();
    this.onCambiosTabla();

  }

  inicializarFormularioCredenciales() {
    this.formularioCredenciales = new FormGroup({
      fechaDe: new FormControl(''),
      fechaHasta: new FormControl(''),
      idFoto: new FormControl('', Validators.required),
      idFirma: new FormControl('', Validators.required)
    });
    this.dt = new Date();
    this.dt2 = new Date();
  }

  inicializarOpcionesNgZone(): void {
    this.optionsJpg = new NgUploaderOptions({
      // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      // filterExtensions: true,
      // allowedExtensions: ['jpg', 'jpeg', 'JPG','JPEG'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });

    this.optionsPNG = new NgUploaderOptions({
      // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      // filterExtensions: true,
      // allowedExtensions: ['png', 'PNG'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idNacionalidad: number
  ): void {
      this.criteriosCabezera = '';
      console.log('nan' + idNacionalidad);
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idUsuario.idProgramaDocente.id~' + idProgramaDocente + ':IGUAL';
      if (idPromocion) {
        this.criteriosCabezera = this.criteriosCabezera +
          ',idPromocion~'
          + idPromocion + ':IGUAL';
      }
      if (idNacionalidad) {
        if (idNacionalidad == 5) {
          // TODO construccion de filtro para nacionalidad
          this.criteriosCabezera = this.criteriosCabezera + ';ORGROUPAND,idUsuario.idPais.id~'
            + 82 + ':IGUAL;OR';
        }else {
          this.criteriosCabezera = this.criteriosCabezera + ';ORGROUPAND,idUsuario.idPais.id~'
            + 82 + ':NOT;OR';
        }
      }
    }
    if (idNacionalidad && !idProgramaDocente) {
      if (idNacionalidad === 5) {
        // TODO construccion de filtro para nacionalidad
        this.criteriosCabezera = 'idUsuario.idPais~'
          + 82 + ':IGUAL';
      }else {
        this.criteriosCabezera = 'idUsuario.idPais~'
          + 82 + ':NOT';
      }
    }
    this.onCambiosTabla();
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    this.idProgramaDocente = idProgramaDocente;
    if (idProgramaDocente) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL;AND,idEstatus~1235:NOT');
      this._spinner.start('aspirantes1');
      this.promocionService.getSelectPromocionID(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          this.opcionesSelectPromocion = [];
          let paginacionInfoJson = response.json();
          paginacionInfoJson.lista.forEach((item) => {
            this.opcionesSelectPromocion.push(new Promocion(item));
          });
        },
        error => {
          this._spinner.stop('aspirantes1');
        },
        () => {
          this._spinner.stop('aspirantes1');
          this.botonBuscar = false;
        }
      );
    } else {
      this.botonBuscar = true;
    }
  }

  cambioNacionalidadFiltro(idNacionalidad: number) {
    if (!this.idProgramaDocente && idNacionalidad) {
      this.botonBuscar = false;
    } else if (!this.idProgramaDocente && !idNacionalidad) {
      this.botonBuscar = true;
    }
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    this.generarMatricula = false;
    this.generarCredencial = false;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }else {
      criterios = 'idPromocion.id~:NOT';
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      // //console.log(filtros);
      let criteriosAux = criterios;
      criterios = '';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      criteriosAux ? criterios = criteriosAux + 'GROUPAND,' + criterios
          : criterios = criterios;
      // //console.log(criterios);
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
    console.log(urlSearch);
    this._spinner.start('aspirantes2');
    this.estudianteMovilidadExternaService.getListaEstudianteMovilidadExterna(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registros = [];
        let paginasArray: Array<number> = [];
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
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
     /*   if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('aspirantes2');
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop('aspirantes2');
      }
    );
  }

  habilitarBotonAgregarDetalle(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
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

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
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

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
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
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  rowSeleccion(registro): void {
    this.generarMatricula = false;
    this.generarCredencial = false;
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      if (this.registroSeleccionado.matricula.id) {
        this.generarCredencial = true;
      } else {
        this.generarMatricula = true;
        this.generarCredencial = false;
      }

      if (!this.registroSeleccionado.usuario.ldap) { // Condicion para mostrar btn de agenerar correo y usuarioldap
        this.usuarioLdap = true;
      } else {
        this.usuarioLdap = false;
      }
    } else {
      this.registroSeleccionado = null;
    }
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  prepareServices(): void {
    // this.obtenerCatalogos();
    this.catalogoService = this._catalogosService;
    this.estudianteMovilidadExternaService =
      this.catalogoService.getEstudianteMovilidadExterna();
/*    this.programaDocenteService =
      this.catalogoService.getCatalogoProgramaDocente();*/
    this.promocionService =
      this.catalogoService.getPromocion();
    this.evaluacionDocenteAlumnoService =
      this.catalogoService.getEvaluacionDocenteAlumnoService();
    this.matriculaService = this.catalogoService.getMatriculas();
    this.boletaService =
      this.catalogoService.getBoletaService();
    this.usuarioRolService =
      this.catalogoService.getUsuarioRolService();
    this.estudianteMateriaService =
      this.catalogoService.getEstudianteMateriaImpartidaService();
    this.periodoPromocionService =
      this.catalogoService.getPromocionPeriodoEscolarService();
    this.profesorMateriaService =
      this.catalogoService.getProfesorMateriaService();
  }

  obtenerCatalogos(): void {
    this.opcionesSelectProgramaDocente =
      this.catalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
    // se usa en modal agregar materia
/*    this.periodoPromocionService =
      this.catalogoService.getPromocionPeriodoEscolarService();*/
/*    this.planMaterias =
      this.catalogoService.getPlanEstudiosMateria();*/
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
//    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1007 id del catalogo de estatus solo activos
    urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
    /*this.nacionalidadService.getListaSelectNacionalidad (
      this.erroresConsultas, urlParameter,false
    ).then(
      nacionalidades => {
        console.log(nacionalidades);
        //let items = response.json().lista;
        if (nacionalidades) {
          for (var i in nacionalidades) {
            //console.log(items[i]);
          }
          nacionalidades.forEach(
            (item) => {
              this.opcionesSelectNacionalidad.push(new ItemSelects(item.id, item.valor));
            }
          )
        }
      }
    );*/
/*    this.opcionesSelectNacionalidad = this.catalogoService.getNacionalidad().
    getListaSelectNacionalidad  (this.erroresConsultas, urlParameter);*/
  }
  getCatNacionalidad(): void {
    // console.log('entre');
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
          if (!nacionalidades) {
          } else {
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
    console.log(this.opcionSelectNacionalidad);
    /*    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
     let urlParameter: URLSearchParams = new URLSearchParams();
     // 1007 id del catalogo de estatus solo activos
     urlParameter.set('criterios', 'tipo~' + 'Persona' + ':IGUAL');
     ////console.log(urlParameter);
     this.opcionSelectNacionalidad =
     this.nacionalidadService.getListaSelectNacionalidad (
     this.erroresConsultas, urlParameter);*/
  }

  ////////////////////////////codigo de modals////////////////////////

  generarCorreo(): void {
    this.modalAsignarCorreo.open('sm');
  }

  crearCorreoEstudianteMovilidd(): void {
    this.estudianteMovilidadExternaService.postCorreoUsuarioLdapEstMovExt(
      this.registroSeleccionado.id,
      this.erroresConsultas
    ).subscribe (
      response => {
        /*if (assertionsEnabled()) {
          //console.log(response);
        }*/
      },
      error => {
        /*this.cerrarModal();
        if (assertionsEnabled()) {
          //console.log(error);
        }*/
      },
      () => {
        this.cerrarModalCorreo();
        this.onCambiosTabla();
        /*if (assertionsEnabled()) {
          //console.log('Se crea correo y usuario ldap');
        }*/

      }
    );
  }

  cerrarModalCorreo(): void {
    this.modalAsignarCorreo.close();
  }

  ////// Modal expedir credencial

  modalExpedirCredencial(): void {
    this.inicializarFormularioCredenciales();
    this.getInfoEstudiante();
    this.verificarArchivosCredencial();
    this.validarPuestoConFirma();
    this.modalCredencia.open('lg');
  }
  cerrarModalCredencia(): void {
    this.validacionActivaCredenciales = false;
    this.firmaDocencia = false;
    this.validarImagenCredencial = false;
    this.modalCredencia.close();
  }

  getInfoEstudiante() {
    if (this.formularioCredenciales) {
      let intFoto = 'idFoto';
      let intFirmaEstudiante = 'idFirma';
      if (this.registroSeleccionado.usuario.foto.id) {
        (<FormControl>this.formularioCredenciales.controls[intFoto])
          .patchValue(this.registroSeleccionado.usuario.foto.id);
      }
      if (this.registroSeleccionado.usuario.firma.id) {
        (<FormControl>this.formularioCredenciales.controls[intFirmaEstudiante])
          .patchValue(this.
            registroSeleccionado.usuario.firma.id);
      }

      this.nombreArchivoFotografia =
        this.registroSeleccionado.usuario.foto.nombre;
      this.nombrearchivoFirmaEstudiante =
        this.registroSeleccionado.usuario.firma.nombre;

    }
  }

  elegirFechaInicio(): any {
    this.contador = 0;
  }
  elegirFechaFin(): any {
    this.contador = 1;
  }
  getFechaInicio(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioCredenciales.controls['fechaDe'])
        .patchValue(fechaConFormato + ' 10:30 am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('L');
    }
  }
  getFechaHasta(): string {
    if (this.dt2) {
      if ( this.contador === 0 ) {
        this.fechaMaxima = this.dt;
        // this.dt2 = Date(this.fechaMaxima.valueOf());
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioCredenciales.controls['fechaHasta'])
          .patchValue(fechaConFormato + ' 10:30 am');
        return fechaConFormato;
      } else {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioCredenciales.controls['fechaHasta'])
          .patchValue(fechaConFormato + ' 00:00am');
        return fechaConFormato;
      }
    } else {
      return moment(new Date()).format('L');
    }
  }

  generarCredencialFormatoPDF(): void {
    this._spinner.start('generarCredencial');

    if (this.validarFormulario() && this.firmaDocencia) {
      if (this.validarImagenCredencial) {
        let jsonFormulario = JSON.stringify(this.formularioCredenciales.value, null, 2);

        this._usuarioService.putUsuario(
          this.registroSeleccionado.usuario.id,
          jsonFormulario,
          this.erroresConsultasModelo
        ).subscribe(
          response => {
            console.log(response);
          },
          error => {
            this._spinner.stop('generarCredencial');
            console.log(error);
            console.error(error);
          }, // console.log('Success'),
          () => {
            this._spinner.stop('generarCredencial');
            this.descargarCredencial(this.registroSeleccionado.id);
            this.cerrarModalCredencia();
          }
        );
      }else {
        this._spinner.stop('generarCredencial');
        this.addErrorsMesaje('No se encontro el/los archivos para ' +
          'la generación de la credencial en el catálogo de institución', 'danger');
        // console.log('no pasa la validacion la validacion');
      }
    }
  }

  esJpg(name: string): boolean {
    let nombreArchivoArray: string[];
    nombreArchivoArray = name.split('.');
    if (nombreArchivoArray[1] && nombreArchivoArray[1] === 'jpg') {
      return true;
    } else {
      return false;
    }
  }

  esPng(name: string): boolean {
    let nombreArchivoArray: string[];
    nombreArchivoArray = name.split('.');
    if (nombreArchivoArray[1] && nombreArchivoArray[1] === 'png') {
      return true;
    } else {
      return false;
    }
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  handleBasicUploadJpg(data, tipo): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgressJpg = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        if (this.esJpg(responseJson.originalName)) {
          let idArchivo = responseJson.id;
          let jsonArchivo = '{"Foto": ' + responseJson.id + '}';
          this.idArchivoFoto = responseJson.id;
          this.nombreArchivoFotografia = responseJson.originalName;
          this.formularioCredenciales.value.idFoto = idArchivo;
          (<FormControl>this.formularioCredenciales.controls['idFoto']).
          patchValue(idArchivo);

        } else {
          this.addErrorsMesaje('El archivo debe de ser jpg', 'danger');
          this.archivoService.deleteArchivo(responseJson.id, this.erroresConsultas)
            .subscribe(
              () => {
                // console.log('Se borro el archivo');
              }
            );
        }
      }
    });
  }

  handleBasicUploadPng(data, tipo): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgressPng = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        if (this.esPng(responseJson.originalName)) {
          let idArchivo = responseJson.id;

          let jsonArchivo = '{"Foto": ' + responseJson.id + '}';
          this.idArchivoFirmaEstudiante = responseJson.id;
          this.formularioCredenciales.value.idFirma = idArchivo;
          this.nombrearchivoFirmaEstudiante = responseJson.originalName;
          (<FormControl>this.formularioCredenciales.
            controls['idFirma']).patchValue(idArchivo);
        } else {
          this.addErrorsMesaje('El archivo debe de ser png', 'danger');
          this.archivoService.deleteArchivo(responseJson.id, this.erroresConsultas)
            .subscribe(
              () => {
                // console.log('Se borro el archivo');
              }
            );
        }
      }
    });
  }

  enableBasicJpg(): boolean {
    return (this.basicProgressJpg >= 1 && this.basicProgressJpg <= 99);
  }

  enableBasicPng(): boolean {
    return (this.basicProgressPng >= 1 && this.basicProgressPng <= 99);
  }

  handleDropUploadJpg(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
        // console.log(this.dropResp);
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgressJpg = Math.floor(uploaded / (total / 100));
  }
  handleDropUploadPNG(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
        // console.log(this.dropResp);
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgressPng = Math.floor(uploaded / (total / 100));
  }

  enableDropPng(): boolean {
    return (this.dropProgressPng >= 1 && this.dropProgressPng <= 99);
  }

  enableDropJpg(): boolean {
    return (this.dropProgressJpg >= 1 && this.dropProgressJpg <= 99);
  }

  descargarCredencial(idEstudiante: number): void {

    let formularioCredenciales = idEstudiante;
    let fechaInicio = this.getControl('fechaDe').value;
    let fechaFin = this.getControl('fechaHasta').value;
    let url;

    this.estudianteMovilidadExternaService.postTicketCredencial(
      idEstudiante,
      this.erroresConsultas).subscribe(
      response => {
        this.estudianteMovilidadExternaService.getGenerarCredencial(
          // JSON.stringify(this.formularioCredenciales.value, null, 2),
          this.registroSeleccionado.id,
          fechaInicio,
          fechaFin,
          this.erroresConsultas,
          response.json().ticket
        ).subscribe(
          response => {
            // console.log(response);
            url = response.url;
          },
          error => {
            /*if (assertionsEnabled()) {
              console.error(error);
            }*/
          },
          () => {
            /*if (assertionsEnabled()) {
              //console.log('Credencial Creada');
            }*/
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
            this.cerrarModalCredencia();
          });
      },
      error => {
        // console.log("2");
        error = new Error;
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        // console.log("3");
        /*if (assertionsEnabled()) {
          //console.log('Reporte Creado');
        }*/
      });

  }

  getControlFromCredenciales(campo: string): FormControl {
    return (<FormControl>this.formularioCredenciales.controls[campo]);
  }

  validarFormulario(): boolean {
    if (this.formularioCredenciales.valid) {
      this.validacionActivaCredenciales = false;
      return true;
    }
    this.validacionActivaCredenciales = true;
    return false;
  }

  verificarArchivosCredencial(): void {
    // Validar que el pcatalogo de institucion
    // tenga imagen de credencial frontal y reverso
    // console.log('validacion de imagen en institucion');
    let datosCOLSAN: DatoInformacionColsan;

    this.datoInformacionCOLSANService.getDatoInformacionColsan(
      3,
      this.erroresConsultas
    ).subscribe(
      response => {

        datosCOLSAN = new DatoInformacionColsan(
          response.json());

      },
      error => {
        error = new Error;
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {

        }*/
        if (datosCOLSAN.archivoCredencialFrontalMov.id &&
          datosCOLSAN.archivoCredencialReversaMov.id) {
          // console.log('pasa la validacion');
          this.validarImagenCredencial = true;
          // console.log(this.validarImagenCredencial);
        }
        /*this.addErrorsMesaje('No se encontro el/los archivos para ' +
         'la generación de la credencial en el catálogo de institución', 'danger');
         //console.log('no pasa la validacion la validacion');*/

      }
    );

  }

  validarPuestoConFirma(): any {
    let urlSearch: URLSearchParams = new URLSearchParams();

    urlSearch.set('criterios', 'idPuesto~1:IGUAL');
    let puestoDireccionDocencia: Puestos;

    this.puestoService.getListaPuestos(
      this.erroresConsultas,
      urlSearch,
      false
    ).subscribe(
      response => {
        // console.log(response);
        response.json().lista.forEach((item) => {
          puestoDireccionDocencia = new Puestos(item);
        });
        // console.log(puestoDireccionDocencia);
        if (puestoDireccionDocencia.usuario.firma.id &&
          puestoDireccionDocencia.usuario.firma.extencion.toLowerCase() === 'png') {
          this.firmaDocencia = true;
        } else {
          this.addErrorsMesaje('El archivo de la firma de ' +
            'autorización no ha sido encontrado ' +
            'o el formato del archivo es incorrecto.', 'danger');
          this.firmaDocencia = false;
        }
      },
      error => {
        error = new Error;
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {

        }*/
      }
    );
  }

  private getControl(campo: string): FormControl {
    return (<FormControl>this.formularioCredenciales.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioCredenciales.controls[campo]).
        valid && this.validacionActivaCredenciales) {
      return true;
    }
    return false;
  }

  // Modal detalle de aspirante de movilidad

  modalDetalleAspirante(): void {
    this.vistaDetalle = true;
    this.modalDetalle.open('lg');
    this.cargarListaMaterias();
  }

  cerrarModalDetalle(): void{
    this.vistaDetalle = false;
    this.modalDetalle.close();
    this.registrosEstudianteMateria = [];
  }

  modalAgregarMaterias() {
    this.registrosEstudianteMateria = [];
    this.listaPromocionPeriodo = [];
    this.opcionesSelectProfesorMateria = [];
    this.vistaDetalle = false;
    this.materiaAlerta = false;
    this.modalDetalle.open('lg');
    this.cargarListaMaterias();

  }

  confirmarGenerarMatricula(): void {
    this.modalMatriculaEI.open('sm');
  }

  cerrarModalMatricula(): void {
    this.modalMatriculaEI.close();
  }

  generarMatriculaEstudianteMovilidad() {
    this._spinner.start('generarMatricula');
    let formularioGenerarMatricula = new FormGroup({
      idEstudiante: new FormControl(this.registroSeleccionado.id)
    });
    this.matriculaService.postMatriculaEstudiantesIntercambio(
      JSON.stringify(formularioGenerarMatricula.value, null, 2),
      this.erroresConsultas
    ).subscribe(
      response => {
        // console.log(response);
      },
      error => {
        /*if (assertionsEnabled()) {
          //console.error(error);
        }*/
        this._spinner.start('generarMatricula');
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log("Matrícula generada: " + this.entidadMatricula.matriculaCompleta );
        }
        this.context.componentSolicitud.onCambiosTabla();
        this.cerrarModal();*/
        this._spinner.start('generarMatricula');
        this.asignarRolEstMovilidad();
        this.crearEvaluacionDocenteAlumno();
        this.insertarBoleta();
        this.cerrarModalMatricula();
        this.onCambiosTabla();
      });
  }

  asignarRolEstMovilidad(): void {
    this._spinner.start('asignarRolEstMovilidad');
    let jsonFormulario = new FormGroup({
      idRol: new FormControl(14)
    });
    let jsonCambiarEstatus = JSON.stringify(jsonFormulario.value, null , 2);
    // console.log('json: ' + jsonCambiarEstatus);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' +
      this.registroSeleccionado.usuario.id +
      ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let idUsuarioRol: number;
        response.json().lista.forEach((usuarioRol) => {
          idUsuarioRol = usuarioRol.id;
        });
        this.usuarioRolService.putUsuarioRol(
          idUsuarioRol,
          jsonCambiarEstatus,
          this.erroresConsultas
        ).subscribe(
          response => {
            /*if (assertionsEnabled()) {
              //console.log(response);
            }*/
          },
          error => {
            /*if (assertionsEnabled()) {
              //console.log(error);
            }*/
            this._spinner.stop('asignarRolEstMovilidad');
          },
          () => {
            /*if (assertionsEnabled()) {
              //console.log('Se actualizo rol de estudiante');
            }*/
            this._spinner.stop('asignarRolEstMovilidad');
          }
        );
      },
      error => {
        /*if (assertionsEnabled()) {
          //console.error(error);
        }*/
        this._spinner.stop('asignarRolEstMovilidad');
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('Sucess');
        }*/
        this._spinner.stop('asignarRolEstMovilidad');
      }
    );
  }

  crearEvaluacionDocenteAlumno(): void {
    this._spinner.start('evaluacionDocente');
    let formulacioEvaluacion = new FormGroup ({
      evaluacionesFinalizadas: new FormControl(false),
      estudianteAbsuelto: new FormControl(false),
      idPeriodoEscolar: new FormControl(
        this.registroSeleccionado.idPeriodoActual.id),
      idEstudianteMovilidadExterna: new FormControl(this.registroSeleccionado.id)
    });
    let jsonEvaluacion = JSON.stringify(formulacioEvaluacion.value, null , 2);
    // console.log('json: ' + jsonEvaluacion);
    this.evaluacionDocenteAlumnoService.postEvaluacionDocenteAlumno(
      jsonEvaluacion,
      this.erroresConsultas
    ).subscribe(
      response => {

      },
      error => {
        /*if (assertionsEnabled()) {
          //console.log(error);
        }*/
        this._spinner.stop('evaluacionDocente');
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('se creo correctamente');
        }*/
        this._spinner.stop('evaluacionDocente');
      }

    );

  }

  insertarBoleta(): void {
    this._spinner.start('boleta');
    let formulario = new FormGroup({
      expedida: new FormControl(false),
      idEstudianteMovilidad: new FormControl(this.registroSeleccionado.id)
    });

    let formularioBoletas = JSON.stringify(formulario.value, null, 2);
    this.boletaService.postBoleta(
      formularioBoletas,
      this.erroresConsultas
    ).subscribe(
      response => {
        /*if (assertionsEnabled()) {
          //console.log('response boleta: ' + response);
        }*/
      },
      error => {
        this._spinner.stop('boleta');
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('SE genero la boleta');
        }*/
        this._spinner.stop('boleta');
      }
    );
  }

  cargarListaMaterias(): void {
    // this.registroSeleccionado = null;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio =
      'idEstudianteMovilidadExterna~' + this.registroSeleccionado.id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this._spinner.start('listaMaterias');
    this.estudianteMateriaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        /*if (assertionsEnabled()) {
          //console.log('json respuesta: ' + response.json());
        }*/
        this.registrosEstudianteMateria = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.registrosEstudianteMateria.push(new EstudianteMateriaImpartida(item));
        });
        /*if (assertionsEnabled()) {
          //console.log('periodo escolar:' + this.registros);
        }*/
        this.periodos = this.registrosEstudianteMateria;
        if (this.periodos && this.periodos != '') {
          /*if (assertionsEnabled()) {
            //console.log('entra');
          }*/
          this.obtenerMateriaProgramaDocente(this.registrosEstudianteMateria[0].
            materiaImpartida.periodoEscolar.id);
          this.listaPromocionPeriodo.forEach((item) => {
            let index = this.listaPromocionPeriodo.indexOf(item);
            this.listaPromocionPeriodo.splice(index);
          });
        } else {
          let urlParameter: URLSearchParams = new URLSearchParams();
          urlParameter.set('criterios', 'idPromocion.id~' +
            this.registroSeleccionado.idPromocion.id
            + ':IGUAL');
          this.periodoPromocionService
            .getListaPromocionPeriodoEscolarPaginacion(
              this.erroresConsultas, urlParameter)
            .subscribe(response => {
              response.json().lista.forEach((item) => {
                this.listaPromocionPeriodo.push(new PromocionPeriodoEscolar(item));
              });
            });
        }

      },
      error => {
        this._spinner.stop('listaMaterias');
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('registros', this.registros);
          //this._spinner.stop();
        }*/
        //if (cargaInicio && !this.vistaDetalle) {
        if (!this.vistaDetalle) {
          if (this.registroSeleccionado.idProgramaDocente) {
            // this. obtenerMateriaProgramaDocente();
            this._spinner.stop('listaMaterias');
          }
        // } else if (!cargaInicio || this.vistaDetalle ) {
        } else if (this.vistaDetalle ) {
          /*if (assertionsEnabled()) {
            //console.log('vista detalle o recarga');
          }*/
          this._spinner.stop('listaMaterias');
        }
      }
    );
    /*
     this.registros = this.movilidadExternaMateriaService
     .getListaMovilidadExternaMateria(
     this.erroresConsultas,
     urlParameter
     ).lista;
     */
  }

  obtenerMateriaProgramaDocente(periodo): void {
    this._spinner.start('obtenerMateriaPrograma');
    this.registroAgregar = 0;
    this.opcionesSelectProfesorMateria = [];
    /*if (assertionsEnabled()) {
      //console.log('programa docente: ' + this.context.idProgramaDocente);
    }*/
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'titular~' + true + ':IGUAL;AND,'
      + 'idMateriaImpartida.idPromocion~' +
      this.registroSeleccionado.idPromocion.id + ':IGUAL;AND,'
      + 'idMateriaImpartida.idPeriodoEscolar.id~' + periodo + ':IGUAL');
    // 'idMateriaImpartida.idPeriodoEscolar.id~' +  + ':IGUAL'
    /*if (assertionsEnabled()) {
      //console.log('crietrias ' + urlParameter);
    }*/
    // this._spinner.start();
    this.profesorMateriaService.getListaProfesorMateria(
      this.erroresConsultas, urlParameter, true
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        /*if (assertionsEnabled()) {
          //console.log('json respuesta: ' + response.json());
        }*/
        this.opcionesSelectProfesorMateriaAux = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.opcionesSelectProfesorMateriaAux.push(new ProfesorMateria(item));
        });

        this.opcionesSelectProfesorMateriaAux.forEach((profeMateria) => {
          if (!profeMateria.materiaImpartida.getIdProfesorTitular()) {
            /*if (assertionsEnabled()) {
              //console.log('Profe titular: ' +profeMateria.materiaImpartida.getProfesorTitular());
            }*/
            this.opcionesSelectProfesorMateria.push(profeMateria);
            this.numeroPeriodo = profeMateria.materiaImpartida.numeroPeriodo;
            this.periodoEscolar = periodo;
          }
        });

      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('obtenerMateriaPrograma');
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('registros', this.opcionesSelectProfesorMateria);
        }*/
        this.habilitaAlerta();
        this._spinner.stop('obtenerMateriaPrograma');
      }
    );
  }

  habilitaAlerta(): boolean {
    if (this.opcionesSelectProfesorMateria.length > 0) {
      this.mostrarAlerta = false;
      return this.mostrarAlerta;
    } else {
      this.mostrarAlerta = true;
      return this.mostrarAlerta;
    }
  }

  seleccionarMateria(idMateria: number): void {
    this.materiaAlerta = false;
    this.registroAgregar = idMateria;
    /*if (assertionsEnabled()) {
      //console.log('Materiaimpartida: ' + this.registroAgregar);
    }*/
  }

  habilitarBotonEliminar(): boolean {
    if (this.registroSeleccionadoProfesorMateria) {
      return true;
    } else {
      return false;
    }
  }

  habilitarBotonAgregar(): boolean {
    if (this.registroAgregar) {
      return true;
    } else {
      return false;
    }
  }

  rowSeleccionadoMaterias(registro): boolean {
    return (this.registroSeleccionadoProfesorMateria === registro);
  }

  rowSeleccionMaterias(registro): void {
    if (this.registroSeleccionadoProfesorMateria !== registro) {
      this.registroSeleccionadoProfesorMateria = registro;
    } else {
      this.registroSeleccionadoProfesorMateria = null;
    }
  }

  ////////////////////////////codigo de modals: Confirmar agregar Materia////////////////////////
  /*agregarMateriaMovilidadExterna(): void {
   if (this.registroAgregar) {
   this.modalConfirmarMateria();
   this.registroAgregar = 0;
   (<Control>this.formularioCheck.controls['seteador'])
   .updateValue('');
   } else {
   if (assertionsEnabled()) {
   //console.log('Selecciona algo');
   }
   }
   }*/
  agregarMateriaMovilidadExterna(): void {
    this.modalAgregarMateriaMov.open('sm');
  }

  cerrarModalAgregarMateria() {
    this.modalAgregarMateriaMov.close();
  }

  existeMateria(idMateriaImpartida) {
    let result: boolean = false;

    this.registrosEstudianteMateria.forEach(item => {
      if (item.materiaImpartida.id == idMateriaImpartida)
        result = true;
    });

    return result;
  }

  agregarMateria(): void {
    this.materiaAlerta = false;
    if (this.existeMateria(this.registroAgregar)) {
      this.materiaAlerta = true;
      return;
    }

    this._spinner.start('agregarMateria');
    let formulario = new FormGroup ({
      idEstudianteMovilidadExterna: new FormControl(this.registroSeleccionado.id),
      idMateriaImpartida: new FormControl(this.registroAgregar),
    });
    let formularioEstudiante = new FormGroup ({
      numPeriodoActual: new FormControl(this.numeroPeriodo),
      idPeriodoActual: new FormControl(this.periodoEscolar),
    });
    let jsonFormulario = JSON.stringify(formulario.value, null, 2);
    let jsonEstudiante = JSON.stringify(formularioEstudiante.value, null, 2);
    // console.log('JsonEstuidnateMateriaImpartida: ' + jsonFormulario);
    // console.log('JsonEstuidnateMateriaImpartida: ' + jsonEstudiante);
    // console.log('materiasAlumno', this.registrosEstudianteMateria);

    this.estudianteMateriaService.postEstudianteMateriaImpartida(
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {
        // console.log('idCreado: ' + response.json().id);
        // this.insertarBoleta();
        this.estudianteMovilidadExternaService.putEstudianteMovilidadExterna(
          this.registroSeleccionado.id,
          jsonEstudiante,
          this.erroresConsultas
        ).subscribe(response => {
          // console.log('succes');
        });
      },
      error => {
        /*if (assertionsEnabled()) {
          //console.log(error);
        }*/
        this._spinner.stop('agregarMateria');
        this.cerrarModalAgregarMateria();

      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('se agrego la materia');

        }*/
        this.selectPeriodo = true;
        this._spinner.stop('agregarMateria');
        this.cerrarModalAgregarMateria();
        this.cargarListaMaterias();
      }
    );
  }

  ////////////////////////////codigo de modals: Confirmar eliminar Materia////////////////////////

  eliminarMateriaMovilidadExterna(): void {
    this.modalEliminarMateria.open('sm');
  }

  cerrarModalEliminarMateria() {
    this.modalEliminarMateria.close();
  }

  eliminarMateria(): void {
    this._spinner.start('eliminarConfirmarMateria');
    this.estudianteMateriaService.deleteEstudianteMateriaImpartida(
      this.registroSeleccionadoProfesorMateria.id,
      this.erroresConsultas
    ).subscribe(
      response => {

      },
      error => {
        this._spinner.stop('eliminarConfirmarMateria');
      },
      () => {
        this._spinner.stop('eliminarConfirmarMateria');
        this.cerrarModalEliminarMateria();
        this.cargarListaMaterias();
      }
    );
  }

}
