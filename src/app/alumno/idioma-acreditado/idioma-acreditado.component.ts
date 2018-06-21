import {Component, OnInit, Injector, Renderer, ElementRef, ViewChild, NgZone, Inject} from '@angular/core';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {URLSearchParams} from '@angular/http';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import * as moment from 'moment';
import {DocumentoProbatorioAcreditacionService} from '../../services/entidades/documento-probatorio-acreditacion.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {AcreditacionIdioma} from '../../services/entidades/acreditacion-idioma.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {EstudianteGrupoIdioma} from '../../services/entidades/estudiante-grupo-idioma.model';
import {DocumentoProbatorioAcreditacion} from '../../services/entidades/documento-probatorio-acreditacion.model';
import {Matricula} from '../../services/entidades/matricula.model';
import {IdiomaEstudiante} from '../../services/entidades/idioma-estudiante.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ConfigService} from '../../services/core/config.service';
import {errorMessages} from '../../utils/error-mesaje';
import {inject} from '@angular/core/testing';
import { CompleterService, CompleterData } from 'ng2-completer';


export class RegistroEditar {
  idTipo: number;
  idArchivo: number;
  nombre: string;
  otroTipo: string;
  constructor(tipo: number, archivo: number, nombre: string, otro: string = null) {
    this.idTipo = tipo;
    this.idArchivo = archivo;
    this.nombre = nombre;
    this.otroTipo = otro;
  }
}

export class Registro {
  idTipo: number;
  idArchivoModal: number;
  nombre: string;
  otroTipo: string;
  constructor(tipo: number, archivo: number, nombre: string, otro: string = null) {
    this.idTipo = tipo;
    this.idArchivoModal = archivo;
    this.nombre = nombre;
    this.otroTipo = otro;
  }
}


@Component({
  selector: 'app-idioma-acreditado',
  templateUrl: './idioma-acreditado.component.html',
  styleUrls: ['./idioma-acreditado.component.css'],
  providers: [DocumentoProbatorioAcreditacionService, ArchivoService]

})
export class IdiomaAcreditadoComponent implements OnInit {

  @ViewChild('modalDetalleIdioma')
  modalDetalleIdioma: ModalComponent;

  estudianteService;
  catalogoService;
  acreditacionIdiomaService;
  validacionService;
  estudianteGrupoIdioma;

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;

  columnas: Array<any> = [
    { titulo: 'Idioma*', nombre: 'idIdioma.descripcion', sort: 'asc'},
    { titulo: 'Forma de acreditación', nombre: 'documentoAcreditacion', sort: 'asc'},
    { titulo: 'Fecha de vencimiento', nombre: 'fechaVencimiento', sort: 'asc'},
    { titulo: 'Estatus', nombre: 'acreditado', sort: false}
  ];

  columnasDocencia: Array<any> = [
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Idioma*', nombre: 'idIdioma.descripcion', sort: 'asc'},
    { titulo: 'Forma de acreditación', nombre: 'documentoAcreditacion', sort: 'asc'},
    { titulo: 'Fecha de vencimiento', nombre: 'fechaVencimiento', sort: 'asc'},
    { titulo: 'Estatus', nombre: 'acreditado', sort: false}
  ];

  registros: Array<AcreditacionIdioma> = [];
  registroSeleccionado: AcreditacionIdioma;
  usuarioLogueado: UsuarioSesion;
  idEstudiante: number;
  idAcreditacion: number;
  idUsuarioObjetivo: number;
  auxiliar: number;
  // permisoDocencia: boolean = false;

  // encabezado solo para docencia
  botonBuscar: boolean = false;
  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesSelectPromocion: Array<ItemSelects>;
  criteriosCabezera: string = '';
  entidadEstudiante: Estudiante;
  auth : AuthService;
  public configuracion: any = {
    paginacion: true,
    filtrado: {
      textoFiltro: '',
      columnas: 'idIdioma.descripcion,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstudiante.idDatosPersonales.nombre'
    }
  };
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private vistaDocencia: boolean = false;
  entidadAcreditacion: AcreditacionIdioma;

  formularioAcreditacion: FormGroup;
  estudianteGruposIdioma: Array<EstudianteGrupoIdioma> = [];
  private documentosAcreditacionLista: Array<DocumentoProbatorioAcreditacion> = [];
  private estudiantes: Array<ItemSelects> = [];
  // Autocomplete
  private isComplete: boolean = false;
  private matriculaSelAutocomplete: Estudiante;
  idIdioma: number = null;
  zone: NgZone;
  edicion: boolean = false;
  formularioBuscar: FormGroup;
  matricula: Matricula;
  entidadIdiomaEstudiante: IdiomaEstudiante = null;
  entidadAcreditacionIdioma: AcreditacionIdioma = null;
  estudiante: Estudiante = null;
  acreditacionService;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = []; acceso: boolean = true;    tipoArchivo: number;
  public dt1: Date = new Date();
  public dt2: Date = new Date();    validacionActiva: boolean = false;
  registrosEditar: Array<RegistroEditar> = [];
  registroSeleccionadoEditar: RegistroEditar = null;
  idArchivo: number;
  nombreArchivo: string;
  private erroresGuardado: Array<ErrorCatalogo> = [];
  archivoService;
  private listaDocumentos: Array<ItemSelects> = [];
  programaDocenteService;
  idiomaService;
  matriculaService;
  catNivelIdiomaService;
  catTipoDocumentoService;
  idiomaEstudianteService;
  habilitarFecha: boolean = false;

  registrosDocumentos;

  constructor(private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer,
              public _spinner: SpinnerService,    private completerService: CompleterService,
              @Inject(NgZone) private zoneModal: NgZone,
              private _catalogosService: CatalogosServices,
              params: ActivatedRoute, private _router: Router, auth:AuthService,
              private documentoProbatorioAcreditacionService: DocumentoProbatorioAcreditacionService,
              private _archivoService: ArchivoService) {

    this.auth = auth;
    params.params.subscribe(params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });    //console.log(Seguridad.getUsuarioLogueado());
    //console.log(Seguridad.getUsuarioRoles());
    if (this.idUsuarioObjetivo) {

      // this.permisoDocencia = true;
      this.auxiliar = this.idUsuarioObjetivo;
    } else {
      this.usuarioLogueado = auth.getUsuarioLogueado();
      this.auxiliar = this.usuarioLogueado.id;

    }
    this.prepareServices();
  }
  ngOnInit() {
    this.initModalEditar();
  }

  recuperarEstudiante(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((estudiante) => {
          this.idEstudiante = estudiante.id;
          this.entidadEstudiante = new Estudiante(estudiante);
        });
      },
      error => {
      },
      () => {
        if ( !this.idEstudiante ) {
          this.vistaDocencia = true;
        }

        this.onCambiosTabla();
      }
    );
  }
  activarBotonBusqueda(numero: number): any {
    if(numero== 1){
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {

    ////console.log('idProgramaDocente', idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');

    this.opcionesSelectPromocion = this.catalogoService.getPromocion().
    getSelectPromocion(this.erroresConsultas, urlParameter);

  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
    if (idProgramaDocente) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.idProgramaDocente.id~' + idProgramaDocente + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    // console.log('------------------------');
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    this._spinner.start('onCambiosTabla');
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioOriginal = 'idEstudiante.id~' + this.idEstudiante + ':IGUAL';
    if (this.idEstudiante) {
      urlParameter.set('criterios', criterioOriginal);
    }

    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlParameter.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      if (!this.vistaDocencia) {
        criterios = criterioOriginal + ';ANDGROUPAND';
      }
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });

      urlParameter.set('criterios', criterios);
    }
    let ordenamiento = '';
    let vista;
    if (this.vistaDocencia) {
      vista = this.columnasDocencia;
    } else {
      vista = this.columnas;
    }
    vista.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    urlParameter.set('ordenamiento', ordenamiento);
    urlParameter.set('limit', this.limite.toString());
    urlParameter.set('pagina', this.paginaActual.toString());

    this.acreditacionIdiomaService.getListaAcreditacionIdiomaControlable(
      this.erroresConsultas,
      urlParameter,
      true
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
        paginacionInfoJson.lista.forEach((elemento) => {
          this.registros.push(new AcreditacionIdioma(elemento));
        });
      },
      error => {
        this._spinner.stop('onCambiosTabla');
      },
      () => {
        this._spinner.stop('onCambiosTabla');
      }
    );
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

  rowSeleccionado(registro): boolean {
    // //console.log(registro.id);
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

  sortChanged(columna): void {
    let vista;
    if (this.vistaDocencia) {
      vista = this.columnasDocencia;
    } else {
      vista = this.columnas;
    }
    vista.forEach((column) => {
      if (columna.nombre !== column.nombre) {
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

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  hasRol(rol: string): boolean {
    return this.auth.hasRol(rol);
  }

  openModalDetalleIdioma(): void{
      this.getDetalleIdioma();
      this.modalDetalleIdioma.open('lg');
  }

  getDetalleIdioma(): void {
    // console.log(this.context.idAcreditacion);
    this.acreditacionIdiomaService
      .getEntidadAcreditacionIdioma(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadAcreditacion
          = new AcreditacionIdioma(response.json());
        // console.log(this.entidadAcreditacion);
      },
      error => {
      },
      () => {
      }
    );
    this.cargarListaDocumentos();
  }

  cerrarDetalleModal(): void {
    this.modalDetalleIdioma.close();
  }

  cargarListaDocumentos(): any {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idAcreditacion~' + this.registroSeleccionado.id + ':IGUAL';
    // console.log(criterios);
    urlSearch.set('criterios', criterios);
    // console.log(urlSearch);

    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<DocumentoProbatorioAcreditacion>
    }  =
      this.documentoProbatorioAcreditacionService.getListaDocumentoProbatorioAcreditacion(
        this.erroresConsultas, urlSearch, false);

    this.registrosDocumentos = resultados.lista;
    // console.log(resultados.lista);
    // console.log('pruebas');
    // console.log(resultados.lista);
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
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
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            // console.log('Error downloading the file.');
            this._spinner.stop('verArchivo');
          },
          () => {
            console.info('OK');
            this._spinner.stop('verArchivo');
          }
        );
    }
  }

  descargarArchivo(id: number): void {
    // console.log('descarga');
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
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
            this._spinner.stop('descargarArchivo');
          },
          () => {
            console.info('OK');
            this._spinner.stop('descargarArchivo');
          }
        );
    }

  }

  /* modalAcreditacionIdioma(): void {
     //console.log('ENTRA');
     let idEstudiante: number;
     if (this.registroSeleccionado) {
       idEstudiante = this.registroSeleccionado.estudiante.id;
     }else {
       idEstudiante = null;
     }

     let dialog: Promise<ModalDialogInstance>;
     let modalConfig = new ModalConfig('lg', true, 27);
     let acreditacionIdiomaData = new ModalsAcreditacionIdiomasData(
       this,
       idEstudiante
     );

     let bindings = Injector.resolve([
       provide(ICustomModal, { useValue: acreditacionIdiomaData}),
       provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
       provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
     ]);

     dialog = this.modal.open(
       <any>ModalsAcreditacionIdiomas,
       bindings,
       modalConfig
     );
   }

   modalDetalleAcreditacion(): void {
     //console.log('ENTRA');
     let dialog: Promise<ModalDialogInstance>;
     let modalConfig = new ModalConfig('lg', true, 27);
     if (this.registroSeleccionado) {
       let idAcreditacion = this.registroSeleccionado.id;
       let detalleAcreditacionIdiomaData = new DetalleAcreditacionIdiomaData(
         this,
         idAcreditacion
       );

       let bindings = Injector.resolve([
         provide(ICustomModal, { useValue: detalleAcreditacionIdiomaData }),
         provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
         provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
       ]);

       dialog = this.modal.open(
         <any>DetalleAcreditacionIdioma,
         bindings,
         modalConfig
       );
     }

   }*/


  openModalEditar(): void {
    this.initModalEditar();
    this.modalAcredita.open('lg');

  }


  filter(urlParameter: URLSearchParams) : void {
    // console.log(urlParameter);
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let items = response.json().lista;
        if (items) {
          this.estudiantes = [];
          items.forEach((item) => {
            let it = new Estudiante(item);
            this.estudiantes.push(
              new ItemSelects(item.id, it.matricula.matriculaCompleta + ' ' +
                it.datosPersonales.getNombreCompleto()));
          });
        }
      },
      error => {
        this.isComplete = false;
      },
      () => {
      }
    );
  }

  recuperarEntidadEstudiante(): void {
    this.estudianteService.getEntidadEstudiante(
      this.idEstudiante,
      this.erroresConsultas,
      null
    ).subscribe(
      response => {
        let estudent: Estudiante = new Estudiante(response.json());
        this.obtenerInformacionEstudianteEdicion(estudent);
      },
      error => {
      }
      /*       () => {
       if (this.estudiante)
       this.filtrarIdioma();
       } */
    );
  }

/*  filtroChangedDetalle(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.typeAheadEventEmitter.next(filtroTexto);
  }*/

  obtenerEstudianteGrupoIdioma(): void {
    (<FormControl>this.formularioAcreditacion.controls['idEstudiante']).setValue(this.entidadEstudiante.id);

    this.idIdioma = this.getControl('idIdioma').value;
    if (this.idIdioma === 1 || this.idIdioma === 2) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstudiante~' + this.entidadEstudiante.id + ':IGUAL,'
        + 'idGrupoIdioma.idIdioma~' + this.idIdioma + ':IGUAL');
      this.estudianteGrupoIdioma.getListaEstudiantesGrupoIdioma(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          if (response.json().lista.length > 0) {
            response.json().lista.forEach((item) => {
              this.estudianteGruposIdioma.push(new EstudianteGrupoIdioma(item));
            });
            this.validarIdiomasColsan();
          }
        }
      );
    }
  }

  validarIdiomasColsan(): void {
    if (this.idIdioma == 1 && this.estudianteGruposIdioma.length === 2) {
      let ingles = true;
    }
    if (this.idIdioma == 2 && this.estudianteGruposIdioma.length === 4) {
      let frances = true;
    }
  }

  definirEncabezado(idIdioma: number) {
    if (idIdioma == 1) {
      this.columnas = [
        { titulo: 'Curso 1', nombre: 'curso1'},
        { titulo: 'Curso 2', nombre: 'curso2' },
      ];
    }else {
      this.columnas = [
        { titulo: 'Curso 1', nombre: 'curso1'},
        { titulo: 'Curso 2', nombre: 'curso2' },
        { titulo: 'Curso 3', nombre: 'curso3' },
        { titulo: 'Curso 4', nombre: 'curso4' },
      ];
    }
  }

  validarIdioma(idIdioma: number): void {
    this._spinner.start('validarIdioma');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' +
      this.estudiante.id + ':IGUAL,idIdioma~' + idIdioma + ':IGUAL;AND');
    this.acreditacionService.getListaAcreditacionIdiomaControlable(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        if (response.json().lista.length > 0) {
          (<FormControl>this.formularioBuscar.controls['idIdioma']).setValue("");
          // this.modalAdvertencia('Este idioma ya tiene acreditación, si' +
          //   'requiere modificar algún valor debe editarlo', 1);
          this._spinner.stop('validarIdioma');
        }else {
          this._spinner.stop('validarIdioma');
        }
      }
    );
  }

  obtenerInformacionEstudiante(): void {
    if (this.validarFormulario()) {
      this.entidadEstudiante = this.estudiante;
      this.obtenerEstudianteGrupoIdioma();
      this.definirEncabezado(this.idIdioma);
      this.obtenerEstudianteNivelIdiomaAdmision();
      (<FormControl>this.formularioAcreditacion.controls['idIdioma']).setValue(this.idIdioma);
    }

  }

  obtenerInformacionEstudianteEdicion(estudiante: Estudiante): void {
    this.entidadEstudiante = estudiante;
    this.obtenerEstudianteGrupoIdioma();
    this.definirEncabezado(this.idIdioma);
    this.obtenerEstudianteNivelIdiomaAdmision();
    this.cargarDatosAcreditacion();
    (<FormControl>this.formularioAcreditacion.controls['idIdioma']).setValue(this.idIdioma);
  }

  cargarDatosAcreditacion(): void {
    this.acreditacionService.getAcreditacionIdioma(
      this.registroSeleccionado.id,
      this.erroresConsultas,
      null
    ).subscribe(
      response => {
        this.entidadAcreditacionIdioma = new AcreditacionIdioma(response.json());

        (<FormControl>this.formularioBuscar.
          controls['idIdioma']).setValue
        (this.entidadAcreditacionIdioma.idioma.id);

        this.entidadAcreditacionIdioma = new AcreditacionIdioma(response.json());
        (<FormControl>this.formularioAcreditacion.
          controls['calificacionEvaluacionDiagnostica']).setValue
        (this.entidadAcreditacionIdioma.calificacionEvaluacionDiagnostica);
        // this.dt2 = Date.parse(this.entidadAcreditacionIdioma.fechaEvaluacionDiagnostica);
        // if (this.entidadAcreditacionIdioma.aplicaVencimiento) {
        //   this.dt1 = Date.parse(this.entidadAcreditacionIdioma.fechaVencimiento);
        // }
        (<FormControl>this.formularioAcreditacion.
          controls['idNivelIdioma']).setValue
        (this.entidadAcreditacionIdioma.nivelIdioma.id);
        (<FormControl>this.formularioAcreditacion.
          controls['documentoAcreditacion']).setValue
        (this.entidadAcreditacionIdioma.documentoAcreditacion);
        (<FormControl>this.formularioAcreditacion.
          controls['observaciones']).setValue
        (this.entidadAcreditacionIdioma.observaciones);
        (<FormControl>this.formularioAcreditacion.
          controls['acreditado']).setValue
        (this.entidadAcreditacionIdioma.acreditado);
        (<FormControl>this.formularioAcreditacion.
          controls['puntosCertificado']).setValue
        (this.entidadAcreditacionIdioma.puntosCertificado);
        (<FormControl>this.formularioAcreditacion.
          controls['aplicaVencimiento']).setValue
        (this.entidadAcreditacionIdioma.aplicaVencimiento);
        (<FormControl>this.formularioAcreditacion.
          controls['idIdioma']).setValue
        (this.entidadAcreditacionIdioma.idioma.id);
        (<FormControl>this.formularioAcreditacion.
          controls['idEstudiante']).setValue
        (this.entidadAcreditacionIdioma.estudiante.id);

        this.obtenerDocumentosProbatorioAcreditacion();

        if (this.entidadAcreditacionIdioma.aplicaVencimiento)
          this.habilitarFecha = true;
        else
          this.habilitarFecha = false;
      }
    );

  }

  obtenerDocumentosProbatorioAcreditacion(): void {
    this.documentosAcreditacionLista = [];
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAcreditacion~' +
      this.entidadAcreditacionIdioma.id + ':IGUAL');
    this.documentoProbatorioAcreditacionService.getListaDocumentoProbatorioControlable(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        this.registrosEditar = [];
        if (response.json().lista.length > 0) {
          response.json().lista.forEach((item) => {
            this.documentosAcreditacionLista.push(new DocumentoProbatorioAcreditacion(item));
          });

          if (this.documentosAcreditacionLista) {
            this.documentosAcreditacionLista.forEach((item) => {
              this.registrosEditar.push(new RegistroEditar(item.tipoDocumento.id,
                item.archivo.id,
                item.tipoDocumento.valor));
              this.validarDocumentos();
            });
            this._spinner.stop('initModalEdita');
          }
        }
      }
    );
  }

  obtenerEstudianteNivelIdiomaAdmision(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.entidadEstudiante.id + ':IGUAL,'
      + 'idIdioma~' + this.idIdioma + ':IGUAL');
    this.idiomaEstudianteService.getListaIdiomaEstudiantePaginacion(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        if (response.json().lista.length > 0) {
          response.json().lista.forEach((item) => {
            this.entidadIdiomaEstudiante = new IdiomaEstudiante(item);
          });
        }
      }
    );
  }

  confirmarGuardarAcreditacion(): void {
    if (this.habilitarFecha === false) {
      (<FormControl>this.formularioAcreditacion.controls['fechaVencimiento']).setValue("");
    }

    if (this.validarFormularioAcreditacion()) {
      // if (this.edicion)
      //   this.modalConfirmacion('¿Está seguro de actualizar esta acreditación?', 1);
      // else
      //   this.modalConfirmacion('¿Está seguro de guardar esta acreditación?', 1);
    }
  }

  guardarAcreditacion(): void {
    if (this.edicion) {
      let jsonFormularioAcreditacion =
        JSON.stringify(this.formularioAcreditacion.value, null, 2);
      this.acreditacionService.putAcreditacionIdioma(
        this.entidadAcreditacionIdioma.id,
        jsonFormularioAcreditacion,
        this.erroresGuardado
      ).subscribe(
        response => {
          this.registrosEditar.forEach((registro) => {
            let urlParameter: URLSearchParams = new URLSearchParams();
            urlParameter.set('criterios', 'idAcreditacion~' +
              this.entidadAcreditacionIdioma.id + ':IGUAL,'
              + 'idArchivo~' + registro.idArchivo + ':IGUAL,' +
              'idTipoDocumento~' + registro.idTipo + ':IGUAL;AND');
            this.documentoProbatorioAcreditacionService.
            getListaDocumentoProbatorioControlable(
              this.erroresConsultas,
              urlParameter,
              false
            ).subscribe(
              response => {
                if (response.json().lista.length > 0) {
                }else {
                  let json =
                    '{"idAcreditacion":"' +
                    this.entidadAcreditacionIdioma.id + '"' +
                    ', "idArchivo": "' + registro.idArchivo + '"' +
                    ', "idTipoDocumento": "' + registro.idTipo + '"}';
                  this.guardarDocumentoProbatorioAcreditacion(json);
                }
              }
            );
          });
          this.onCambiosTabla();
          this.addErrorsMesaje
          ('La acreditación se actualizó correctamente', 'success' );
          this.cerrarModal();
        },
        error => {
          console.error(error);
        }
      );
    } else {

      let jsonFormularioAcreditacion =
        JSON.stringify(this.formularioAcreditacion.value, null, 2);
      this.acreditacionService.postAcreditacionIdioma(
        jsonFormularioAcreditacion,
        this.erroresGuardado
      ).subscribe(
        response => {
          let idAcreditacion = response.json().id;
          this.registrosEditar.forEach((registro) => {
            let json =
              '{"idAcreditacion":"' + idAcreditacion + '"' +
              ', "idArchivo": "' + registro.idArchivo + '"' +
              ', "idTipoDocumento": "' + registro.idTipo + '"}';
            this.guardarDocumentoProbatorioAcreditacion(json);
          });
          this.onCambiosTabla();
          this.
          addErrorsMesaje('La acreditación se realizó correctamente', 'success' );
          this.cerrarModal();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  guardarDocumentoProbatorioAcreditacion(json: String): void {
    this.documentoProbatorioAcreditacionService.
    postDocumentoProbatorioAcreditacion(
      json,
      this.erroresGuardado
    ).subscribe(
      response => {
        (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('1');
      }
    );
  }

  ocultarFechaVencimiento(): boolean {
    if (this.habilitarFecha) {
      return true;
    }else {
      return false;
    }
  }

  cambioRadioVencimiento(aplica: boolean): void {
    if (aplica === true) {
      this.habilitarFecha = true;
      (<FormControl>this.formularioAcreditacion.controls['aplicaVencimiento'])
        .setValue(true);
    }else {
      (<FormControl>this.formularioAcreditacion.controls['aplicaVencimiento'])
        .setValue(false);
      this.habilitarFecha = false;
    }
  }

  cambioRadioAcreditado(acreditado: boolean): void {
    if (acreditado === true) {
      (<FormControl>this.formularioAcreditacion.controls['acreditado'])
        .setValue(true);
    }else {
      (<FormControl>this.formularioAcreditacion.controls['acreditado'])
        .setValue(false);
    }
  }

  getTiposDocumentos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAreaDocumento~8:IGUAL');
    this.listaDocumentos = this.catTipoDocumentoService.
    getSelectTipoDocumentoCriterio(this.erroresConsultas, urlParameter);
  }

  ////// picker ///
  getFechaVencimiento(): any {
    if (this.dt1) {
      let fechaConFormato =  moment(this.dt1).format('L');
      (<FormControl>this.formularioAcreditacion.controls['fechaVencimiento'])
        .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return  moment(new Date()).format('L');
    }
  }

  ////// picker ///
  getFechaEvaluacionDiagnostica(): any {
    if (this.dt2) {
      let fechaConFormato =  moment(this.dt2).format('L');
      (<FormControl>this.formularioAcreditacion.controls['fechaEvaluacionDiagnostica'])
        .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return  moment(new Date()).format('L');
    }
  }

/*
  confirmarCancelar(): void {
    //console.log('LENGTH______________' + this.documentosAcreditacionLista.length);
    if (this.edicion) {
      if (this.documentosAcreditacionLista.length > 0) {
        this.modalAdvertencia('¿Está seguro de cancelar la acreditación?', 4);
      }else {
        this.modalAdvertencia('No se puede cancelar porque los nuevos registros ' +
          'se perderan y debe haber por lo menos uno guardado', 1);
      }
    }else {
      this.modalAdvertencia('¿Está seguro de cancelar la acreditación?', 4);
    }
  }
*/

  cerrarModal(): void {
    this.modalAcredita.close();
    this.registroSeleccionado = null;
  }

  eliminarArchivosCancelar(): void {
    if (this.edicion) {
      //console.log('ENTRATRATR');
      let encontrado: boolean = false;
      this.registrosEditar.forEach((archivos) => {
        this.documentosAcreditacionLista.forEach((archivosDC) => {
            if (archivos.idArchivo === archivosDC.archivo.id) {
              encontrado = true;
            }
          }
        );

        if (encontrado === true) {
          //console.log('El archivo ' + archivos.idArchivo + 'se encuentra en documentos');
          encontrado = false;
        }else {
          //console.log('El archivo ' + archivos.idArchivo + ' No se encuentra en documentos');
          this.registroSeleccionadoEditar = archivos;
          this.eliminarRegistro();
          encontrado = false;
        }
      });

    }else {
      //console.log('Entra:::');
      if (this.registrosEditar.length > 0) {
        this.registrosEditar.forEach((registro) => {
          this.registroSeleccionadoEditar = registro;
          this.eliminarRegistro();
        });
      }
    }
    //this.dialog.close();
    this.registroSeleccionadoEditar = null;
  }

  eliminarDocumentoEdicion() {
    if (this.edicion) {
      this.documentosAcreditacionLista.forEach((archivosDC) => {
          if (this.registroSeleccionadoEditar.idArchivo === archivosDC.archivo.id) {
            this.documentoProbatorioAcreditacionService
              .deleteDocumentoProbatorioAcreditacion(
                archivosDC.id,
                this.erroresConsultas
              ).subscribe(
              response => {
                this.obtenerDocumentosProbatorioAcreditacion();
                this.eliminarRegistro();
              },
              error => {
                //console.log(error);
              }
            );
          }else {
            this.eliminarRegistro();
          }
        }
      );
    }else {
      this.eliminarRegistro();
    }
  }

  eliminarRegistro(): void {  //ELIMINAR ARCHIVO
    if (this.registroSeleccionadoEditar) {
      this.archivoService.deleteArchivo(
        this.registroSeleccionadoEditar.idArchivo,
        this.erroresGuardado
      ).subscribe(
        response => {
          let auxiliar: Array<RegistroEditar> = [];
          for (var i = 0; i < this.registrosEditar.length; i++) {
            if (this.registroSeleccionadoEditar.idArchivo !==
              this.registrosEditar[i].idArchivo) {
              auxiliar.push(this.registrosEditar[i]);
            }
          }
          this.registrosEditar = auxiliar;
          this.registroSeleccionadoEditar = null;
          this.validarDocumentos();
        }
      );
    }
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        this.idArchivo = responseJson.id;
        this.agregarRegistro();
        (<FormControl>this.formularioAcreditacion.controls['seteador'])
          .setValue('');
        this.nombreArchivo = responseJson.originalName;
      }
    });
  }

  agregarRegistro(): void {
    for (var i = 0; i < this.registros.length; i++) {
      if (this.tipoArchivo == this.registrosEditar[i].idTipo) {
        this.acceso = false;
        break;
      }
    }
    if (this.acceso) {
      this.registrosEditar.push(new RegistroEditar(this.tipoArchivo, this.idArchivo, this.nombreArchivo));
      this.validarDocumentos();
      this.resetearValores();
    } else {
      this.addErrorsMesaje(
        'No puedes subir otro documento de tipo ' + this.nombreArchivo,
        'danger'
      );
      this.resetearValores();
      this.acceso = true;
    }

  }


  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }

  handleDropUpload(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgress = Math.floor(uploaded / (total / 100));
  }

  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }

  addErrorsMesajeDetalle(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  resetearValores(): void {
    this.tipoArchivo = null;
    this.idArchivo = null;
    this.nombreArchivo = null;
  }

  agregarDocumento(valor: string): void {
    let algo: Array<any> = valor.split('-');
    this.tipoArchivo = algo[0];
    this.nombreArchivo = algo[1];
  }

/*  habilitarOtro(id: number): void {
    if (id == '35-Otro') {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('');
    } else {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('aux');
    }
  }*/

  cambiarAuxiliar(): void {
    (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue(
      this.getControl('otroTipoDocumento').value
    );
  }

  rowSeleccionadoDetalle(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccionDetalle(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  validarDocumentos(): void {
    if (this.registros.length > 0) {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('1');
    } else {
      (<FormControl>this.formularioAcreditacion.controls['auxiliar']).setValue('');
    }
  }

  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  validarFormulario(): boolean {
    if (this.formularioBuscar.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarFormularioAcreditacion(): boolean {
    if (this.formularioAcreditacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += Validacion.getValidatorMensajeError(errorType) + ' ';
        }
      }
    }
    return resultado;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioBuscar.controls[campo]);
  }

  /*modalConfirmacion(mensajeAdvertencia: String, tipoGuardado: number): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let modalConfirmacion = new ModalConfirmacionData(
      this,
      mensajeAdvertencia,
      tipoGuardado
    );


    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalConfirmacion}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
    ]);

    dialog = this.modal.open(
      <any>ModalConfirmacion,
      bindings,
      modalConfig
    );
  }*/

/*
  modalAdvertencia(mensajeAdvertencia: String, tipoGuardado: number): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let modalAdvertencia = new ModalAdvertenciaAcreditacionData(
      this,
      mensajeAdvertencia,
      tipoGuardado
    );


    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalAdvertencia}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
    ]);

    dialog = this.modal.open(
      <any>ModalAdvertenciaAcreditacion,
      bindings,
      modalConfig
    );
  }*/

  getControlFormAcreditacion(campo: string): FormControl {
    return (<FormControl>this.formularioAcreditacion.controls[campo]);
  }


  private prepareServices(): void {
    this.catalogoService = this._catalogosService;
    this.estudianteService = this.catalogoService.getEstudianteService();
    this.acreditacionIdiomaService = this.catalogoService.getAcreditacionIdiomaService();
    this.opcionesSelectProgramaDocente =
      this.catalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
    this.recuperarEstudiante(this.auxiliar);
  }













//  dialog: ModalDialogInstance;
//  context: ModalsAcreditacionIdiomasData;


  mensajeErrorsModal: any = errorMessages;
  validacionActivaModalModal: boolean = false;

  uploadFileModal: any;
  optionsModal: Object = {
    //url: 'http://ng2-uploader.com:10050/upload'
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };

  idArchivoModal: number;
  nombreArchivoModal: string;
  tipoArchivoModal: number;
  basicProgressModal: number = 0;
  basicRespModal: Object;
  dropProgressModal: number = 0;
  dropRespModal: any[] = [];
  registrosModal: Array<Registro> = [];
  accesoModal: boolean = true;
  registrosModaleleccionadoModal: Registro = null;

  formularioBuscarModal: FormGroup;
  formularioAcreditacionModal: FormGroup;
  camposModal : number = 0;

  habilitarFechaModal: boolean = false;
  matriculaModal: Matricula;
  entidadestudianteModalModal: Estudiante = null;
  entidadIdiomaestudianteModalModal: IdiomaEstudiante = null;
  entidadAcreditacionIdiomaModal: AcreditacionIdioma = null;
  estudianteModal: Estudiante = null;
  idIdiomaModal: number = null;
  columnasModal: Array<any> = [];
  opcionModal: number = 0;
  edicionModal: boolean = false;

  matriculaModalService;
  estudianteModalService;
  estudianteModalGrupoIdiomaModal;
  idiomaestudianteModalService;

  @ViewChild("modalAcreditaIdioma")
  modalAcredita: ModalComponent;

  public dt1M: Date = new Date();
  public dt2M: Date = new Date();
  public configuracionModal: any = {
    paginacion: false,
    filtrado: { textoFiltro: ''}
  };

  private opcionModalesProgramaDocenteModal: Array<ItemSelects> = [];
  private opcionModalesCatIdiomasModal: Array<ItemSelects> = [];
  private opcionModalesNivelIdiomaModal: Array<ItemSelects> = [];
  private listaDocumentosModal: Array<ItemSelects> = [];
  private alertasModal: Array<Object> = [];
  private estudianteModals: Array<ItemSelects> = [];

  private erroresConsultasModal: Array<ErrorCatalogo> = [];
  private erroresGuardadoModal: Array<ErrorCatalogo> = [];
  private estudianteModalGruposIdiomaModal: Array<EstudianteGrupoIdioma> = [];
  private documentosAcreditacionListaModal: Array<DocumentoProbatorioAcreditacion> = [];


  // Autocomplete
  private isCompleteModal: boolean = false;
  private matriculaModalSelAutocompleteModal: Estudiante;
  // private typeAheadEventEmitterModal = new Rx.Subject<string>();

  initModalEditar(): void {
    this.prepareServicesModal();
    this.getTiposDocumentos();

    if (this.idEstudiante) {
      this._spinner.start('initModalEditar');
      this.edicion = true;
      this.idIdioma = this.registroSeleccionado.idioma.id;
      this.recuperarentidadestudianteModalModal();
    }

    this.formularioBuscarModal = new FormGroup ({
      idIdioma: new FormControl('', Validators.required),
      matricula: new FormControl('', Validators.required),
    });

    this.formularioAcreditacionModal = new FormGroup({
      //  institucionBachillerato: new Control('', Validators.required),   //Licenciatura
      calificacionEvaluacionDiagnostica: new FormControl(''),
      fechaEvaluacionDiagnostica: new FormControl(''),
      idNivelIdioma: new FormControl(''),
      documentoAcreditacion: new FormControl('', Validators.compose([
        Validacion.parrafos])),
      observaciones: new FormControl('', Validators.compose([
        Validacion.parrafos])),
      acreditado: new FormControl('', Validators.required),
      puntosCertificado: new FormControl(''),
      fechaVencimiento: new FormControl(''),
      aplicaVencimiento: new FormControl('', Validators.required),
      auxiliar: new FormControl('', Validators.required),
      seteador: new FormControl(''),
      idIdioma: new FormControl(''),
      idEstudiante: new FormControl('', Validators.required),

    });


    /*//Evento para el autocomplete que se activa (evento keyup) cuado se construye la clase
     this.typeAheadEventEmitter
     .debounceTime(700)
     .switchMap(val => {
     let urlSearch: URLSearchParams = new URLSearchParams();
     let criterios = '';
     let filtros: Array<string> = val.split(' ');

     if (this.configuracion.filtrado && val !== '' && this.estudiantes.length == 0) {
     if (!this.isComplete)
     criterios = 'idMatricula.matriculaCompleta~' + filtros[0] + ':LIKE;OR';
     this.isComplete = true;
     urlSearch.set('criterios', criterios);
     this.filter(urlSearch);
     } else if (this.configuracion.filtrado.textoFiltro === ''){
     this.estudiantes = [];
     }
     }).subscribe(results => {},
     error => {//console.log(error);
     });*/

    this.zoneModal = new NgZone({ enableLongStackTrace: false});
  }



  private columnasModalDocumentos: Array<any> = [
    { titulo: 'Nombre Documento', nombre: '', sort: false} ];


  filterModal(urlParameter: URLSearchParams) : void {
    //console.log(urlParameter);
    this.estudianteModalService.getListaEstudianteOpcional(
      this.erroresConsultasModal,
      urlParameter
    ).subscribe(
      response => {
        let items = response.json().lista;
        if (items) {
          this.estudianteModals = [];
          items.forEach((item) => {
            let it = new Estudiante(item);
            this.estudianteModals.push(
              new ItemSelects(item.id, it.matricula.matriculaCompleta + ' ' +
                it.datosPersonales.getNombreCompleto()));
          });
        }
      },
      error => {
        this.isCompleteModal = false;
      },
      () => {
          this.isCompleteModal = false;
      }
    );
  }

  recuperarentidadestudianteModalModal(): void {
    this.estudianteModalService.getEntidadEstudiante(
      this.idEstudiante,
      this.erroresConsultasModal,
      null
    ).subscribe(
      response => {
        let estudent: Estudiante = new Estudiante(response.json());
        this.obtenerInformacionestudianteModaledicionModal(estudent);
      },
      error => {
          console.error(error);
      }
      /*       () => {
       if (this.estudianteModal)
       this.filtrarIdioma();
       } */
    );
  }

  filtroChangedModal(filtroTexto): void {
    this.configuracionModal.filtrado.textoFiltro = filtroTexto;
    //this.typeAheadEventEmitterModal.next(filtroTexto);
  }

  obtenerestudianteModalGrupoIdiomaModal(): void {
    (<FormControl>this.formularioAcreditacionModal.controls['idEstudiante']).
    setValue(this.entidadestudianteModalModal.id);

    this.idIdiomaModal = this.getControlModal('idIdioma').value;
    if (this.idIdiomaModal === 1 || this.idIdiomaModal === 2) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstudiante~' + this.entidadestudianteModalModal.id + ':IGUAL,'
        + 'idGrupoIdioma.idIdioma~' + this.idIdiomaModal + ':IGUAL');
      this.estudianteModalGrupoIdiomaModal.getListaestudianteModalsGrupoIdioma(
        this.erroresConsultasModal,
        urlParameter
      ).subscribe(
        response => {
          if (response.json().lista.length > 0) {
            response.json().lista.forEach((item) => {
              this.estudianteModalGruposIdiomaModal.push(new EstudianteGrupoIdioma(item));
            });
            this.validarIdiomaModalsColsanModal();
          }
        }
      );
    }
  }

  validarIdiomaModalsColsanModal(): void {
    if (this.idIdiomaModal == 1 && this.estudianteModalGruposIdiomaModal.length === 2) {
      let ingles = true;
    }
    if (this.idIdiomaModal == 2 && this.estudianteModalGruposIdiomaModal.length === 4) {
      let frances = true;
    }
  }

  definirEncabezadoModal(idIdiomaModal: number) {
    if (idIdiomaModal == 1) {
      this.columnasModal = [
        { titulo: 'Curso 1', nombre: 'curso1'},
        { titulo: 'Curso 2', nombre: 'curso2' },
      ];
    }else {
      this.columnasModal = [
        { titulo: 'Curso 1', nombre: 'curso1'},
        { titulo: 'Curso 2', nombre: 'curso2' },
        { titulo: 'Curso 3', nombre: 'curso3' },
        { titulo: 'Curso 4', nombre: 'curso4' },
      ];
    }
  }

  validarIdiomaModal(idIdiomaModal: number): void {
    this._spinner.start("validarIdiomaModal");
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' +
      this.estudianteModal.id + ':IGUAL,idIdioma~' + idIdiomaModal + ':IGUAL;AND');
    this.acreditacionService.getListaAcreditacionIdiomaControlable(
      this.erroresConsultasModal,
      urlParameter,
      false
    ).subscribe(
      response => {
        if (response.json().lista.length > 0) {
          (<FormControl>this.formularioBuscarModal.controls['idIdioma']).setValue("");
          this.modalAdvertenciaModal('Este idioma ya tiene acreditación, si' +
            'requiere modificar algún valor debe editarlo', 1);
          this._spinner.stop("validarIdiomaModal");
        }else {
          this._spinner.stop("validarIdiomaModal");
        }
      }
    );
  }

  obtenerInformacionestudianteModal(): void {
    if (this.validarFormularioModal()) {
      this.entidadestudianteModalModal = this.estudianteModal;
      this.obtenerestudianteModalGrupoIdiomaModal();
      this.definirEncabezadoModal(this.idIdiomaModal);
      this.obtenerestudianteModalNivelIdiomaAdmision();
      (<FormControl>this.formularioAcreditacionModal.controls['idIdioma']).setValue(this.idIdiomaModal);
    }

  }

  obtenerInformacionestudianteModaledicionModal(estudianteModal: Estudiante): void {
    this.entidadestudianteModalModal = estudianteModal;
    this.obtenerestudianteModalGrupoIdiomaModal();
    this.definirEncabezadoModal(this.idIdiomaModal);
    this.obtenerestudianteModalNivelIdiomaAdmision();
    this.cargarDatosAcreditacionModal();
    (<FormControl>this.formularioAcreditacionModal.controls['idIdioma']).setValue(this.idIdiomaModal);
  }

  cargarDatosAcreditacionModal(): void {
    this.acreditacionService.getAcreditacionIdioma(
      this.registroSeleccionado.id,
      this.erroresConsultasModal,
      null
    ).subscribe(
      response => {
        this.entidadAcreditacionIdiomaModal = new AcreditacionIdioma(response.json());

        (<FormControl>this.formularioBuscarModal.
          controls['idIdioma']).setValue
        (this.entidadAcreditacionIdiomaModal.idioma.id);

        this.entidadAcreditacionIdiomaModal = new AcreditacionIdioma(response.json());
        (<FormControl>this.formularioAcreditacionModal.
          controls['calificacionEvaluacionDiagnostica']).setValue
        (this.entidadAcreditacionIdiomaModal.calificacionEvaluacionDiagnostica);
        this.dt2M = new Date (Date.parse(this.entidadAcreditacionIdiomaModal.fechaEvaluacionDiagnostica));
        if (this.entidadAcreditacionIdiomaModal.aplicaVencimiento) {
          this.dt1M = new Date( Date.parse(this.entidadAcreditacionIdiomaModal.fechaVencimiento));
        }else{}
        (<FormControl>this.formularioAcreditacionModal.
          controls['idNivelIdioma']).setValue
        (this.entidadAcreditacionIdiomaModal.nivelIdioma.id);
        (<FormControl>this.formularioAcreditacionModal.
          controls['documentoAcreditacion']).setValue
        (this.entidadAcreditacionIdiomaModal.documentoAcreditacion);
        (<FormControl>this.formularioAcreditacionModal.
          controls['observaciones']).setValue
        (this.entidadAcreditacionIdiomaModal.observaciones);
        (<FormControl>this.formularioAcreditacionModal.
          controls['acreditado']).setValue
        (this.entidadAcreditacionIdiomaModal.acreditado);
        (<FormControl>this.formularioAcreditacionModal.
          controls['puntosCertificado']).setValue
        (this.entidadAcreditacionIdiomaModal.puntosCertificado);
        (<FormControl>this.formularioAcreditacionModal.
          controls['aplicaVencimiento']).setValue
        (this.entidadAcreditacionIdiomaModal.aplicaVencimiento);
        (<FormControl>this.formularioAcreditacionModal.
          controls['idIdioma']).setValue
        (this.entidadAcreditacionIdiomaModal.idioma.id);
        (<FormControl>this.formularioAcreditacionModal.
          controls['idEstudiante']).setValue
        (this.entidadAcreditacionIdiomaModal.estudiante.id);

        this.obtenerDocumentosProbatorioAcreditacionModal();

        if (this.entidadAcreditacionIdiomaModal.aplicaVencimiento)
          this.habilitarFechaModal = true;
        else
          this.habilitarFechaModal = false;
      }
    );

  }

  obtenerDocumentosProbatorioAcreditacionModal(): void {
    this.documentosAcreditacionListaModal = [];
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAcreditacion~' +
      this.entidadAcreditacionIdiomaModal.id + ':IGUAL');
    this.documentoProbatorioAcreditacionService.getListaDocumentoProbatorioControlable(
      this.erroresConsultasModal,
      urlParameter,
      false
    ).subscribe(
      response => {
        this.registrosModal = [];
        if (response.json().lista.length > 0) {
          response.json().lista.forEach((item) => {
            this.documentosAcreditacionListaModal.push(new DocumentoProbatorioAcreditacion(item));
          });

          if (this.documentosAcreditacionListaModal) {
            this.documentosAcreditacionListaModal.forEach((item) => {
              this.registrosModal.push(new Registro(item.tipoDocumento.id,
                item.archivo.id,
                item.tipoDocumento.valor));
              this.validarDocumentosModal();
            });
            this._spinner.stop('initModalEditar');
          }
        }
      }
    );
  }

  obtenerestudianteModalNivelIdiomaAdmision(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.entidadestudianteModalModal.id + ':IGUAL,'
      + 'idIdioma~' + this.idIdiomaModal + ':IGUAL');
    this.idiomaestudianteModalService.getListaIdiomaEstudiantePaginacion(
      this.erroresConsultasModal,
      urlParameter
    ).subscribe(
      response => {
        if (response.json().lista.length > 0) {
          response.json().lista.forEach((item) => {
            this.entidadIdiomaestudianteModalModal = new IdiomaEstudiante(item);
          });
        }
      }
    );
  }

  confirmarguardarAcreditacionModalModal(): void {
    if (this.habilitarFechaModal === false) {
      (<FormControl>this.formularioAcreditacionModal.controls['fechaVencimiento']).setValue("");
    }

    if (this.validarFormularioModalAcreditacionModal()) {
      if (this.edicionModal)
        this.modalConfirmacionModal('¿Está seguro de actualizar esta acreditación?', 1);
      else
        this.modalConfirmacionModal('¿Está seguro de guardar esta acreditación?', 1);
    }
  }

  guardarAcreditacionModal(): void {
    if (this.edicionModal) {
      let jsonformularioAcreditacionModal =
        JSON.stringify(this.formularioAcreditacionModal.value, null, 2);
      this.acreditacionService.putAcreditacionIdioma(
        this.entidadAcreditacionIdiomaModal.id,
        jsonformularioAcreditacionModal,
        this.erroresGuardadoModal
      ).subscribe(
        response => {
          this.registrosModal.forEach((registro) => {
            let urlParameter: URLSearchParams = new URLSearchParams();
            urlParameter.set('criterios', 'idAcreditacion~' +
              this.entidadAcreditacionIdiomaModal.id + ':IGUAL,'
              + 'idArchivoModal~' + registro.idArchivoModal + ':IGUAL,' +
              'idTipoDocumento~' + registro.idTipo + ':IGUAL;AND');
            this.documentoProbatorioAcreditacionService.
            getListaDocumentoProbatorioControlable(
              this.erroresConsultasModal,
              urlParameter,
              false
            ).subscribe(
              response => {
                if (response.json().lista.length > 0) {
                }else {
                  let json =
                    '{"idAcreditacion":"' +
                    this.entidadAcreditacionIdiomaModal.id + '"' +
                    ', "idArchivoModal": "' + registro.idArchivoModal + '"' +
                    ', "idTipoDocumento": "' + registro.idTipo + '"}';
                  this.guardarDocumentoProbatorioAcreditacionModal(json);
                }
              }
            );
          });
          this.onCambiosTabla();
          this.addErrorsMesaje
          ('La acreditación se actualizó correctamente', 'success' );
          this.cerrarModal2();
        },
        error => {
          console.error(error);
        }
      );
    } else {

      let jsonformularioAcreditacionModal =
        JSON.stringify(this.formularioAcreditacionModal.value, null, 2);
      this.acreditacionService.postAcreditacionIdioma(
        jsonformularioAcreditacionModal,
        this.erroresGuardadoModal
      ).subscribe(
        response => {
          let idAcreditacion = response.json().id;
          this.registrosModal.forEach((registro) => {
            let json =
              '{"idAcreditacion":"' + idAcreditacion + '"' +
              ', "idArchivoModal": "' + registro.idArchivoModal + '"' +
              ', "idTipoDocumento": "' + registro.idTipo + '"}';
            this.guardarDocumentoProbatorioAcreditacionModal(json);
          });
          this.onCambiosTabla();
          this.addErrorsMesaje('La acreditación se realizó correctamente', 'success' );
          this.cerrarModal2();
        },
        error => {
          console.error(error);
        }
      );
    }
  }

  guardarDocumentoProbatorioAcreditacionModal(json: String): void {
    this.documentoProbatorioAcreditacionService.
    postDocumentoProbatorioAcreditacion(
      json,
      this.erroresGuardadoModal
    ).subscribe(
      response => {
        (<FormControl>this.formularioAcreditacionModal.controls['auxiliar']).setValue('1');
      }
    );
  }

  ocultarFechaVencimientoModal(): boolean {
    if (this.habilitarFechaModal) {
      return true;
    }else {
      return false;
    }
  }

  cambioRadioVencimientoModal(aplica: boolean): void {
    if (aplica === true) {
      this.habilitarFechaModal = true;
      (<FormControl>this.formularioAcreditacionModal.controls['aplicaVencimiento'])
        .setValue(true);
    }else {
      (<FormControl>this.formularioAcreditacionModal.controls['aplicaVencimiento'])
        .setValue(false);
      this.habilitarFechaModal = false;
    }
  }

  cambioRadioAcreditadoModal(acreditado: boolean): void {
    if (acreditado === true) {
      (<FormControl>this.formularioAcreditacionModal.controls['acreditado'])
        .setValue(true);
    }else {
      (<FormControl>this.formularioAcreditacionModal.controls['acreditado'])
        .setValue(false);
    }
  }

  getTiposDocumentosModal(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idAreaDocumento~8:IGUAL');
    this.listaDocumentosModal = this.catTipoDocumentoService.
    getSelectTipoDocumentoCriterio(this.erroresConsultasModal, urlParameter);
  }

  ////// picker ///
  getFechaVencimientoModal(): any {
    if (this.dt1M) {
      let fechaConFormato =  moment(this.dt1M).format('L');
      (<FormControl>this.formularioAcreditacionModal.controls['fechaVencimiento'])
        .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return  moment(new Date()).format('L');
    }
  }

  ////// picker ///
  getFechaEvaluacionDiagnosticaModal(): any {
    if (this.dt2M) {
      let fechaConFormato =  moment(this.dt2M).format('L');
      (<FormControl>this.formularioAcreditacionModal.controls['fechaEvaluacionDiagnostica'])
        .setValue(fechaConFormato + ' 10:30am');
      return fechaConFormato;
    } else {
      return  moment(new Date()).format('L');
    }
  }

  confirmarCancelarModal(): void {
    //console.log('LENGTH______________' + this.documentosAcreditacionListaModal.length);
    if (this.edicionModal) {
      if (this.documentosAcreditacionListaModal.length > 0) {
        this.modalAdvertenciaModal('¿Está seguro de cancelar la acreditación?', 4);
      }else {
        this.modalAdvertenciaModal('No se puede cancelar porque los nuevos registrosModal ' +
          'se perderan y debe haber por lo menos uno guardado', 1);
      }
    }else {
      this.modalAdvertenciaModal('¿Está seguro de cancelar la acreditación?', 4);
    }
  }

  cerrarModal2(): void {
    this.modalAcredita.close();
    this.registrosModaleleccionadoModal = null;
  }

  eliminarArchivosCancelarModal(): void {
    if (this.edicionModal) {
      //console.log('ENTRATRATR');
      let encontrado: boolean = false;
      this.registrosModal.forEach((archivos) => {
        this.documentosAcreditacionListaModal.forEach((archivosDC) => {
            if (archivos.idArchivoModal === archivosDC.archivo.id) {
              encontrado = true;
            }
          }
        );

        if (encontrado === true) {
          //console.log('El archivo ' + archivos.idArchivoModal + 'se encuentra en documentos');
          encontrado = false;
        }else {
          //console.log('El archivo ' + archivos.idArchivoModal + ' No se encuentra en documentos');
          this.registrosModaleleccionadoModal = archivos;
          this.eliminarRegistroModal();
          encontrado = false;
        }
      });

    }else {
      //console.log('Entra:::');
      if (this.registrosModal.length > 0) {
        this.registrosModal.forEach((registro) => {
          this.registrosModaleleccionadoModal = registro;
          this.eliminarRegistroModal();
        });
      }
    }
    this.modalAcredita.close();
    this.registrosModaleleccionadoModal = null;
  }

  eliminarDocumentoedicionModal() {
    if (this.edicionModal) {
      this.documentosAcreditacionListaModal.forEach((archivosDC) => {
          if (this.registrosModaleleccionadoModal.idArchivoModal === archivosDC.archivo.id) {
            this.documentoProbatorioAcreditacionService
              .deleteDocumentoProbatorioAcreditacion(
                archivosDC.id,
                this.erroresConsultasModal
              ).subscribe(
              response => {
                this.obtenerDocumentosProbatorioAcreditacionModal();
                this.eliminarRegistroModal();
              },
              error => {
                //console.log(error);
              }
            );
          }else {
            this.eliminarRegistroModal();
          }
        }
      );
    }else {
      this.eliminarRegistroModal();
    }
  }

  eliminarRegistroModal(): void {  //ELIMINAR ARCHIVO
    if (this.registrosModaleleccionadoModal) {
      this.archivoService.deleteArchivo(
        this.registrosModaleleccionadoModal.idArchivoModal,
        this.erroresGuardadoModal
      ).subscribe(
        response => {
          let auxiliar: Array<Registro> = [];
          for (var i = 0; i < this.registrosModal.length; i++) {
            if (this.registrosModaleleccionadoModal.idArchivoModal !==
              this.registrosModal[i].idArchivoModal) {
              auxiliar.push(this.registrosModal[i]);
            }
          }
          this.registrosModal = auxiliar;
          this.registrosModaleleccionadoModal = null;
          this.validarDocumentosModal();
        }
      );
    }
  }

  handleBasicUploadModal(data): void {
    this.basicRespModal = data;
    this.zoneModal.run(() => {
      this.basicProgressModal = data.progress.percent;
      if (this.basicRespModal['response'] && this.basicRespModal['status'] === 201) {
        let responseJson = JSON.parse(this.basicRespModal['response']);
        this.idArchivoModal = responseJson.id;
        this.agregarRegistroModal();
        (<FormControl>this.formularioAcreditacionModal.controls['seteador'])
          .setValue('');
        this.nombreArchivoModal = responseJson.originalName;
      }
    });
  }

  agregarRegistroModal(): void {
    for (var i = 0; i < this.registrosModal.length; i++) {
      if (this.tipoArchivoModal == this.registrosModal[i].idTipo) {
        this.accesoModal = false;
        break;
      }
    }
    if (this.accesoModal) {
      this.registrosModal.push(new Registro(this.tipoArchivoModal, this.idArchivoModal, this.nombreArchivoModal));
      this.validarDocumentosModal();
      this.resetearValoresModal();
    } else {
      this.addErrorsMesajeModal(
        'No puedes subir otro documento de tipo ' + this.nombreArchivoModal,
        'danger'
      );
      this.resetearValoresModal();
      this.accesoModal = true;
    }

  }


  enableBasicModal(): boolean {
    return (this.basicProgressModal >= 1 && this.basicProgressModal <= 99);
  }

  handleDropUploadModal(data): void {
    let index = this.dropRespModal.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropRespModal.push(data);
    } else {
      this.zoneModal.run(() => {
        this.dropRespModal[index] = data;
      });
    }

    let total = 0, uploaded = 0;
    this.dropRespModal.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgressModal = Math.floor(uploaded / (total / 100));
  }

  enableDropModal(): boolean {
    return (this.dropProgressModal >= 1 && this.dropProgressModal <= 99);
  }

  addErrorsMesajeModal(mensajeError, tipo): void {
    this.alertasModal.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  resetearValoresModal(): void {
    this.tipoArchivoModal = null;
    this.idArchivoModal = null;
    this.nombreArchivoModal = null;
  }

  agregarDocumentoModal(valor: string): void {
    let algo: Array<any> = valor.split('-');
    this.tipoArchivoModal = algo[0];
    this.nombreArchivoModal = algo[1];
  }

  habilitarOtroModal(id: number): void {
    if (id == 35) {
      (<FormControl>this.formularioAcreditacionModal.controls['auxiliar']).setValue('');
    } else {
      (<FormControl>this.formularioAcreditacionModal.controls['auxiliar']).setValue('aux');
    }
  }

  cambiarAuxiliarModal(): void {
    (<FormControl>this.formularioAcreditacionModal.controls['auxiliar']).setValue(
      this.getControlModal('otroTipoDocumento').value
    );
  }

  rowSeleccionModaladoModal(registro): boolean {
    return (this.registrosModaleleccionadoModal === registro);
  }

  rowSeleccionModal(registro): void {
    if (this.registrosModaleleccionadoModal !== registro) {
      this.registrosModaleleccionadoModal = registro;
    } else {
      this.registrosModaleleccionadoModal = null;
    }
  }

  validarDocumentosModal(): void {
    if (this.registrosModal.length > 0) {
      (<FormControl>this.formularioAcreditacionModal.controls['auxiliar']).setValue('1');
    } else {
      (<FormControl>this.formularioAcreditacionModal.controls['auxiliar']).setValue('');
    }
  }

  mostrarBotonesModal(): boolean {
    if (this.registrosModaleleccionadoModal) {
      return true;
    }else {
      return false;
    }
  }

  validarFormularioModal(): boolean {
    if (this.formularioBuscarModal.valid) {
      this.validacionActivaModalModal = false;
      return true;
    }
    this.validacionActivaModalModal = true;
    return false;
  }

  validarFormularioModalAcreditacionModal(): boolean {
    if (this.formularioAcreditacionModal.valid) {
      this.validacionActivaModalModal = false;
      return true;
    }
    this.validacionActivaModalModal = true;
    return false;
  }

  errorMessageModal(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrorsModal[errorType] + ' ';
        }
      }
    }
    return resultado;
  }

  getControlModal(campo: string): FormControl {
    return (<FormControl>this.formularioBuscarModal.controls[campo]);
  }

  modalConfirmacionModal(mensajeAdvertencia: String, tipoGuardado: number): void {
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let modalConfirmacionModal = new modalConfirmacionModalData(
      this,
      mensajeAdvertencia,
      tipoGuardado
    );


    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalConfirmacionModal}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
    ]);

    dialog = this.modal.open(
      <any>modalConfirmacionModal,
      bindings,
      modalConfig
    );*/
  }

  modalAdvertenciaModal(mensajeAdvertencia: String, tipoGuardado: number): void {
    /*let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let modalAdvertenciaModal = new modalAdvertenciaModalAcreditacionData(
      this,
      mensajeAdvertencia,
      tipoGuardado
    );


    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalAdvertenciaModal}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
    ]);

    dialog = this.modal.open(
      <any>modalAdvertenciaModalAcreditacion,
      bindings,
      modalConfig
    );*/
  }

  getControlModalFormAcreditacion(campo: string): FormControl {
    return (<FormControl>this.formularioAcreditacionModal.controls[campo]);
  }

  private autocompleteOnSelectModal(e: any, a) {
    if (a !== '') {
      (<FormControl>this.formularioBuscarModal.controls['matriculaModal']).setValue(a);
      this.estudianteModalService.getEntidadEstudiante(e.item.id, this.erroresConsultasModal
      ).subscribe(
        response => {
          this.matriculaModalSelAutocompleteModal = new Estudiante(response.json());
          this.estudianteModal = this.matriculaModalSelAutocompleteModal;
        },
        error => {
            console.error(error);
        }
        /*       () => {
         if (this.estudianteModal)
         this.filtrarIdioma();
         } */
      );
    }

  }


  private getControlModalErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioBuscarModal.controls[campo]).valid && this.validacionActivaModalModal) {
      return true;
    }
    return false;
  }

  private getControlModalErrorsFormAcreditacion(campo: string): boolean {
    if (!(<FormControl>this.formularioAcreditacionModal.controls[campo]).
        valid && this.validacionActivaModalModal) {
      return true;
    }
    return false;
  }


  private prepareServicesModal(): void {
    this.programaDocenteService = this.catalogoService.getCatalogoProgramaDocente();
    this.idiomaService = this.catalogoService.getIdioma();
    this.matriculaModalService = this.catalogoService.getMatriculas();
    this.estudianteModalService = this.catalogoService.getEstudiante();
    this.estudianteModalGrupoIdiomaModal = this.catalogoService.getEstudianteGrupoIdiomaService();
    this.catNivelIdiomaService = this.catalogoService.getNivelIdioma();
    this.catTipoDocumentoService = this.catalogoService.getTipoDocumento();
    this.idiomaestudianteModalService = this.catalogoService.getIdiomaEstudiante();
    this.archivoService = this.catalogoService.getArchivos();
    this.acreditacionService = this.catalogoService.getAcreditacionIdiomaService();
    this.documentoProbatorioAcreditacionService =
      this.catalogoService.getDocumentoProbatorioAcreditacionService();

    this.opcionModalesProgramaDocenteModal =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultasModal);

    this.opcionModalesNivelIdiomaModal =
      this.catNivelIdiomaService.getSelectNivelIdioma(this.erroresConsultasModal);


    this.opcionModalesCatIdiomasModal = this.idiomaService.getSelectIdioma(this.erroresConsultasModal);
  }

}
