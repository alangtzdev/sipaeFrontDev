import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild, NgZone, Inject} from '@angular/core';
import {Estudiante} from "../../services/entidades/estudiante.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {FormGroup, FormControl, Form, Validators} from "@angular/forms";
import {Promocion} from "../../services/entidades/promocion.model";
import {Router} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {MatriculaService} from '../../services/entidades/matricula.service';
import {ErrorCatalogo} from "../../services/core/error.model";
import {EstudianteService} from "../../services/entidades/estudiante.service";
//import {errorMessages} from '../../utils/validaciones/error-messages';
//import {NgZone} from 'angular2/core';
import {Puestos} from '../../services/entidades/puestos.model';
import {ArchivoService} from  '../../services/entidades/archivo.service';
import * as moment from "moment";
import {NgUploaderOptions} from "ngx-uploader";
import {ConfigService} from "../../services/core/config.service";
import {UsuarioServices} from "../../services/usuario/usuario.service";
import {PuestosService} from "../../services/entidades/puestos.service";
import {ItemSelects} from "../../services/core/item-select.model";

@Component({
  selector: 'app-credencial',
  templateUrl: './credencial.component.html',
  styleUrls: ['./credencial.component.css']
})
export class CredencialComponent implements OnInit {

  @ViewChild('modalAsigCorreo')
  modalAsigCorreo: ModalComponent;
  @ViewChild('modalGeneMatri')
  modalGeneMatri: ModalComponent;
  @ViewChild('modalGeneCred')
  modalGeneCred: ModalComponent;
  @ViewChild('modalOmitirMatri')
  modalOmitirMatri: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Estudiante> = [];
  columnas: Array<any> = [
    { titulo: 'Nombre *', nombre: 'idDatosPersonales.primerApellido',  sort: 'asc' },
    { titulo: 'Programa docente *', nombre: 'idProgramadocente.descripcion', sort: false},
    { titulo: 'Correo', nombre: 'idDatosPersonales.email', sort: false},
    { titulo: 'Matrícula', nombre: 'idMatricula.matriculaCompleta'},
    { titulo: 'Estatus', nombre: 'idEstatus.valor' }
  ];
  registroSeleccionado: Estudiante;
  catalogoProgramaDocente;
  catalogoPromocion;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  estudianteAuxiliar;
  idProgramaDocente;
  idPromocion;
  nombreProgramaDocente;
  nombrePromocion;
  mostrarMaricula: boolean = false;
  estadoOmitirMatricula: boolean = false;
  formulario: FormGroup;
  desabilitarBuscar: boolean = true;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
    'idDatosPersonales.nombre,idDatosPersonales.primerApellido,' +
    'idDatosPersonales.segundoApellido,idPromocion.idProgramaDocente.descripcion'}
  };
  estudiantesService;


  // se declaran variables para consultas de base de datos
  private opcionesCatProgramaDocente: Array<ItemSelects> = [];
  private opcionesCatPromociones: Array<Promocion> = [];
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private alertas: Array<Object> = [];

  constructor(//private modal: Modal,
              @Inject(NgZone) private zone: NgZone,
              ///private estudiantesService: EstudianteService,
              private puestoService: PuestosService,
              private _usuarioService: UsuarioServices,
              private _archivoService: ArchivoService,
              private elementRef: ElementRef,
              private _matriculaService: MatriculaService,
              private injector: Injector,
              private _renderer: Renderer,
              params: Router,
              private router: Router,
              private _catalogosService: CatalogosServices,
              private _spinner: SpinnerService) {
    this.prepareServices();
    this.inicializarOpcionesNgZone();

       if(sessionStorage.getItem('credencial')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('credencialCriterios')){
        this.onCambiosTabla();
  }
  
    this.zone = new NgZone({ enableLongStackTrace: false});
    this.formulario = new FormGroup({
      setearPromocion: new FormControl('')
    });
    this.formularioCredenciales = new FormGroup({
      fechaDe: new FormControl(''),
      fechaHasta: new FormControl(''),
      idFoto: new FormControl(''),
      idFirma: new FormControl(''),
    });
  }

  ngOnInit(): void {
    //this.onCambiosTabla();
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

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  onCambiosTabla(): void {
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';
    if (!sessionStorage.getItem('credencialCriterios')) {


    let criterios = 'idEstatus~1006:IGUAL' + this.criteriosCabezera;
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
    //console.log(criterios);
    sessionStorage.setItem('credencialCriterios', criterios);
    sessionStorage.setItem('credencialOrdenamiento', ordenamiento);
    sessionStorage.setItem('credencialLimite', this.limite.toString());
    sessionStorage.setItem('credencialPagina', this.paginaActual.toString());
}

this.limite = +sessionStorage.getItem('credencialLimite') ? +sessionStorage.getItem('credencialLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('credencialPagina') ? +sessionStorage.getItem('credencialPagina') : this.paginaActual;

    urlSearch.set('criterios', sessionStorage.getItem('credencialCriterios')
     ? sessionStorage.getItem('credencialCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('credencialOrdenamiento') 
    ? sessionStorage.getItem('credencialOrdenamiento') : ordenamiento);
   urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());
    //console.log(urlSearch);

    
    this._spinner.start("credencial1");
    this.estudiantesService.getListaEstudiantesProgramaPromocion(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        let auxiliarMostrarBoton: boolean = false;
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
          this.estudianteAuxiliar = new Estudiante(item);
          this.nombreProgramaDocente =
            this.estudianteAuxiliar.promocion.programaDocente.descripcion;
          this.nombrePromocion =
            this.estudianteAuxiliar.promocion.getClavePromocion();
          this.registros.push(new Estudiante(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
        this._spinner.stop("credencial1");
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop("credencial1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop("credencial1");
      }
    );
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

  mostrarBotones(): boolean {
    if (this.registroSeleccionado && this.registroSeleccionado.estatus.id !== 1105) {
      return true;
    }else {
      return false;
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    if (this.registros.length > 0) {
      this.limite = Number(limite);
      this.onCambiosTabla();
    }
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.omitir();
    } else {
      this.registroSeleccionado = null;
    }
  }


  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = '';
    //this.mostrarMaricula = true;
    this.idProgramaDocente = idProgramaDocente;
    this.idPromocion = idPromocion;
    if (idProgramaDocente) {
      this.criteriosCabezera =
        ',idPromocion.idProgramaDocente~' + idProgramaDocente + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera += ',idPromocion~'
        + idPromocion + ':IGUAL';
    }
    sessionStorage.setItem('credencialIdPromocion', idProgramaDocente.toString());
    sessionStorage.setItem('credenciaIdProgramaDocente', idPromocion.toString());
           this.onCambiosTabla();
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    (<FormControl>this.formulario.controls['setearPromocion']).patchValue('');
      //.updateValue('');
    this.desabilitarBuscar = true;
    this.opcionesCatPromociones = [];
    this.registros = [];
    this._spinner.start("credencial2");
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL;AND,idEstatus~1235:NOT');
    this.catalogoPromocion
      .getListaPromocionesPag(this.erroresConsultas, urlParameter).subscribe(
      response => {
        response.json().lista.forEach((promocion) => {
          this.opcionesCatPromociones.push(new Promocion(promocion));
        });
        this._spinner.stop("credencial2");
      }
    );
  }

  tieneMatricula(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.matricula.getMatriculaCompleta() !== '---') {
      return true;
    }else {
      return false;
    }
  }

  omitir(): any {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.matricula.getMatriculaCompleta() === '---') {
      this.estadoOmitirMatricula = true;
    }else {
      this.estadoOmitirMatricula = false;
    }
  }

  private prepareServices(): void {
    this.estudiantesService = this._catalogosService.getEstudiante();
    this.catalogoProgramaDocente = this._catalogosService.getCatalogoProgramaDocente();
    this.opcionesCatProgramaDocente =
      this.catalogoProgramaDocente.getSelectProgramaDocente(this.erroresConsultas);
    this.catalogoPromocion = this._catalogosService.getPromocion();
  }

  /////////////////// MODAL ASIGNAR CORREO///////////////////////////////*****************

  habilitarBotonEnviar: boolean = true;
  private erroresGuardadoAC: Array<Object> = [];

  private formularioAsigCorreo = new FormGroup({
  checkedAC: new FormControl(false)
});

  constructorAC(): void {
  this.formularioAsigCorreo = new FormGroup({
      checkedAC: new FormControl(false)
    });
    this.habilitarBotonEnviar = true;
    this.erroresGuardadoAC = [];
    this.modalAsignarCorreo();
  }

  generarCorreos(): any {
    this.estudiantesService.generarCorreoUsuarioLdap(
        this.idPromocion,
        this.erroresGuardadoAC).subscribe(
        response => {
          //console.log(response);
        },
        error => {
          this.cerrarModalAsignarCorre();
          this.addErrorsMesaje('No hay estudiantes para asignar correo institucional', 'danger');
        },
        () => {
          this.onCambiosTabla();
          this.cerrarModalAsignarCorre();
        });

  }

  modalAsignarCorreo(): void {
    this.modalAsigCorreo.open();
  }

  cerrarModalAsignarCorre(): void{
    this.modalAsigCorreo.close();
  }

  /////////////////// MODAL GENERAR MATRICULA///////////////////////////////*****************

  habilitarBotonEnviarGM: boolean = true;
  idMatricula;
  private erroresGuardadoGM: Array<ErrorCatalogo> = [];

  private formularioGeneMatri = new FormGroup({
    checkedGM: new FormControl(false)
  });

  constructorGM(): void {
    this.habilitarBotonEnviarGM = true;
    this.erroresGuardadoGM = [];

    this.formularioGeneMatri = new FormGroup({
      checkedGM: new FormControl(false)
    });

    this.modalGenerarMatricula();
  }

  generarMatriculas(): any {
    let formularioCorreo2 = new FormGroup({
      idPromocion: new FormControl(this.idPromocion)
    });

    this._matriculaService.postMatriculaPromocion(
        JSON.stringify(formularioCorreo2.value, null, 2), this.erroresGuardadoGM).subscribe(
        response => {
          //console.log(response);
        },
        error => {

        },
        () => {
          this.onCambiosTabla();
          this.cerrarModalGenerarMatricula();
        });

  }

  modalGenerarMatricula(): void {
    this.modalGeneMatri.open();
  }

  cerrarModalGenerarMatricula(): void{
    this.modalGeneMatri.close();
  }

  /////////////////// MODAL GENERAR CREDENCIAL///////////////////////////////*****************

  formularioCredenciales: FormGroup;

  basicProgressJpg: number = 0;
  basicProgressPng: number = 0;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropProgressJpg: number = 0;
  dropProgressPng: number = 0;
  dropResp: any[] = [];
  options: NgUploaderOptions;

  idArchivoFoto: number;
  idArchivoFirmaEstudiante: number;
  validacionActiva: boolean = false;

  dt: Date;
  dt2: Date;
  fechaMinima = new Date();
  contador: number = 0;

  uploadFile: any;
  private erroresConsultasGC: Array<Object> = [];
  private erroresGuardadoGC: Array<ErrorCatalogo> = [];

  private nombreArchivoFotografia: string = '';
  private nombrearchivoFirmaEstudiante: string = '';
  private puestoDireccionDocencia: Puestos;

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['jpg','JPG','jpeg','JPEG','PNG','png'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  constructorGC(): void { /////Constructor Modal

    this.basicProgressJpg = 0;
    this.basicProgressPng = 0;
    this.basicProgress = 0;
    this.dropProgress = 0;
    this.dropProgressJpg = 0;
    this.dropProgressPng = 0;
    this.dropResp = [];

    this.validacionActiva = false;

    this.dt = new Date();
    this.dt2 = new Date();
    this.fechaMinima = new Date();
    this.contador = 0;

    this.erroresConsultasGC = [];
    this.erroresGuardadoGC = [];

    this.nombreArchivoFotografia = '';
    this.nombrearchivoFirmaEstudiante = '';
    this.alertas = [];

    this.zone = new NgZone({ enableLongStackTrace: false });
    moment.locale('es');
    this.prepareServicesGC();
    this.inicializarOpcionesNgZone();
    this.consultarPuestoConFirma();

    this.formularioCredenciales = new FormGroup({
      fechaDe: new FormControl(''),
      fechaHasta: new FormControl(''),
      idFoto: new FormControl('', Validators.required),
      idFirma: new FormControl('', Validators.required),
    });

    if (this.formularioCredenciales) {
      let intFoto = 'idFoto';
      let intFirmaEstudiante = 'idFirma';
      (<FormControl>this.formularioCredenciales.controls[intFoto])
          .patchValue(this.registroSeleccionado.usuario.foto.id);
      (<FormControl>this.formularioCredenciales.controls[intFirmaEstudiante])
          .patchValue(this.registroSeleccionado.usuario.firma.id);
      this.nombreArchivoFotografia =
          this.registroSeleccionado.usuario.foto.nombre;
      this.nombrearchivoFirmaEstudiante =
          this.registroSeleccionado.usuario.firma.nombre;
    }
  }

  getFechaInicio(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formularioCredenciales.controls['fechaDe'])
          .patchValue(fechaConFormato + ' 10:30 am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaHasta(): string {
    if (this.dt2) {
        let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
        (<FormControl>this.formularioCredenciales.controls['fechaHasta'])
            .patchValue(fechaConFormato + ' 10:30 am');
        return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  enviarFormulario(): void {
    if (this.validarFormulario() && this.validarPrecondicionesGenerarCredencial()
        && this.validarPuestoConFirma()) {
      let jsonFormulario = JSON.stringify(this.formularioCredenciales.value, null, 2);
      this._spinner.start('enviarForm');
      this._usuarioService.putUsuario(
          this.registroSeleccionado.usuario.id,
          jsonFormulario,
          this.erroresGuardadoGC
      ).subscribe(
          () => {}, // console.log('Success'),
          error => {
            this._spinner.stop('enviarForm');
          },
          () => {
            this._spinner.stop('enviarForm');
            this.descargarCredencial(this.registroSeleccionado.id);
            this.onCambiosTabla();
            this.cerrarModalGenerarCredencial();
          }
      );
    } else {
      // alert('error en el formulario');
    }
  }

  handleBasicUpload(data, tipo): void {
    this.alertas = [];
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        let idArchivo = responseJson.id;

        let jsonArchivo = '{"Foto": ' + responseJson.id + '}';
        if (tipo === 'foto') {
          if (this.esImagenJPG(responseJson.originalName)) {
            this.idArchivoFoto = responseJson.id;
            this.nombreArchivoFotografia = responseJson.originalName;
            this.formularioCredenciales.value.idArchivoFotografia = idArchivo;
            (<FormControl>this.formularioCredenciales.controls['idFoto']).
            patchValue(idArchivo);
          } else {
            this.borrarArchivoFormatoInvalido(responseJson.id, 'jpg');
          }
        }else if (tipo === 'firmaEstudiante') {
          if (this.esImagenPNG(responseJson.originalName)) {
            this.idArchivoFirmaEstudiante = responseJson.id;
            this.nombrearchivoFirmaEstudiante = responseJson.originalName;
            this.formularioCredenciales.value.idArchivoFirmaEstudiante = idArchivo;
            (<FormControl>this.formularioCredenciales.controls['idFirma']).
            patchValue(idArchivo);
          } else {
            this.borrarArchivoFormatoInvalido(responseJson.id, 'PNG');
          }
        }
      }
    });
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
        // console.log(this.dropResp);
      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgress = Math.floor(uploaded / (total / 100));
  }

  enableDropPng(): boolean {
    return (this.dropProgressPng >= 1 && this.dropProgressPng <= 99);
  }

  enableDropJpg(): boolean {
    return (this.dropProgressJpg >= 1 && this.dropProgressJpg <= 99);
  }

  descargarCredencial(idEstudiante: number): void {
    // console.log('Generar Credencial');
    // console.log(idEstudiante);
    let fechaInicio = this.getControl('fechaDe').value;
    let fechaFin = this.getControl('fechaHasta').value;
    let formularioCredenciales = idEstudiante;
    let url;

    this.estudiantesService.postTicketCredencial(
        idEstudiante,
        this.erroresGuardadoGC).subscribe(
        response => {
          this.estudiantesService.getGenerarCredencial(
              idEstudiante,
              fechaInicio,
              fechaFin,
              this.erroresGuardadoGC,
              response.json().ticket
          ).subscribe(
              response => {
                // console.log(response);
                url = response.url;
              },
              error => {
                error = new Error;
              },
              () => {
                window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
                this.cerrarModalGenerarCredencial();
              });
        },
        error => {
          //console.log("2");
          error = new Error;
        },
        () => {
          //console.log("3");
        });
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioCredenciales.controls[campo]);
  }

  borrarArchivoFormatoInvalido(idArchivo, tipo): void {
    this.addErrorsMesaje('El archivo debe de ser de tipo ' + tipo, 'danger');
    this._archivoService.deleteArchivo(
        idArchivo,
        this.erroresGuardadoGC)
        .subscribe(
            () => {
            }
        );
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  validarFormulario(): boolean {
    if (this.formularioCredenciales.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarPrecondicionesGenerarCredencial(): boolean {
    // Validar que el program docente tenga imagen de credencial frontal y reverso
    if (this.registroSeleccionado.promocion.
            programaDocente.archivoCredencialFrontal.id &&
        this.registroSeleccionado.promocion.
            programaDocente.archivoCredencialReversa.id) {
      return true;
    }

    this.addErrorsMesaje('El programa docente: ' +
        this.registroSeleccionado.promocion.
            programaDocente.descripcion +
        ' no cuenta con el/los archivos para la generación de la credencial', 'danger');
    return false;
  }

  validarPuestoConFirma(): boolean {
    if (this.puestoDireccionDocencia.usuario.firma.id &&
        this.puestoDireccionDocencia.usuario.firma.extencion.toLowerCase() === 'png') {
      return true;
    } else {
      this.addErrorsMesaje('El archivo de la firma de ' +
          'autorización no ha sido encontrado ' +
          'o el formato del archivo es incorrecto', 'danger');
      return false;
    }
  }

  private consultarPuestoConFirma(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    urlSearch.set('criterios', 'idPuesto~1:IGUAL');

    this.puestoService.getListaPuestos(
        this.erroresGuardadoGC,
        urlSearch,
        false
    ).subscribe(
        response => {

          // console.log(response);
          response.json().lista.forEach((item) => {
            this.puestoDireccionDocencia = new Puestos(item);
          });
          // console.log(puestoDireccionDocencia);
        },
        error => {
          error = new Error;
        },
        () => {

        }
    );
  }

  private esImagenJPG(nombreArchivo: string): boolean {
    let nombreArchivoArray: string[];
    let tamanoArreglo: number;
    nombreArchivoArray = nombreArchivo.split('.');
    tamanoArreglo = nombreArchivoArray.length - 1;
    if (nombreArchivoArray[tamanoArreglo] && (
        nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpg' ||
        nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpeg') ) {
      return true;
    } else {
      return false;
    }
  }

  private esImagenPNG(nombreArchivo: string): boolean {
    let nombreArchivoArray: string[];
    let tamanoArreglo: number;
    nombreArchivoArray = nombreArchivo.split('.');
    tamanoArreglo = nombreArchivoArray.length - 1;
    if (nombreArchivoArray[tamanoArreglo] && (
        nombreArchivoArray[tamanoArreglo].toLowerCase() === 'png') ) {
      return true;
    } else {
      return false;
    }
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        /*if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }*/
      }
    }
    return resultado;
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioCredenciales.controls[campo]).
            valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServicesGC(): void {
    this._archivoService = this._catalogosService.getArchivos();
    this._usuarioService = this._catalogosService.getUsuarioService();
    this.puestoService = this._catalogosService.getPuestosService();
  }

  modalGenerarCredencial(): void {
    this.modalGeneCred.open('lg');
    this.constructorGC();
  }

  cerrarModalGenerarCredencial(): void{
    this.modalGeneCred.close();
  }

  /////////////////// MODAL OMITIR MATRICULA///////////////////////////////*****************
  private erroresGuardadoOM: Array<Object> = [];
  private _estudianteService: EstudianteService;

  private formularioOmitMatri = new FormGroup({
    checkedOM: new FormControl(false)
  });

  constructorOM(): void {
    this.erroresGuardadoOM = [];
    this.prepareServicesOM();

    this.formularioOmitMatri = new FormGroup({
      checkedOM: new FormControl(false)
    });
    this.modalOmitirMatricula();
  }

  omitirMatricula(): void {
    let idEstudiante: number;
    if (this.registroSeleccionado) {
      idEstudiante = this.registroSeleccionado.id;
      let omitirMatricula = {'idEstatus': '1105'};
      let jsonFormulario = JSON.stringify(omitirMatricula, null , 2);
      //console.log(jsonFormulario);
      this.estudiantesService.putEstudiante(
          idEstudiante,
          jsonFormulario,
          this.erroresGuardadoOM
      ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.onCambiosTabla();
          }
      );

    }
  }

  private prepareServicesOM(): void {
    this._estudianteService = this._catalogosService.getEstudiante();
  }

  modalOmitirMatricula(): void {
    this.modalOmitirMatri.open();
  }

  cerrarModalOmitirMatricula(): void{
    this.modalOmitirMatri.close();
  }
limpiarVariablesSession() {
    sessionStorage.removeItem('credencialCriterios');
    sessionStorage.removeItem('credencialOrdenamiento');
    sessionStorage.removeItem('credencialLimite');
    sessionStorage.removeItem('credencialPagina');
  }

}
