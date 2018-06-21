import {
  Component, OnInit, NgZone, ElementRef, Injector, Renderer, CUSTOM_ELEMENTS_SCHEMA, Inject,
  ViewChild
} from '@angular/core';
import {Archivos} from "../../services/entidades/archivo.model";
import {URLSearchParams} from "@angular/http";
import {ReacreditacionProgramaDocente} from "../../services/entidades/reacreditacion-programa-docente.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstatusCatalogoService} from "../../services/catalogos/estatus-catalogo.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import * as moment from 'moment/moment';
import {Validators, FormControl, FormGroup} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ConfigService} from "../../services/core/config.service";
import {NgUploaderOptions} from "ngx-uploader";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {ReacreditacionService} from "../../services/catalogos/reacreditacion.service";
import {PaginacionInfo} from "../../services/core/pagination-info";

export class Registro {
  tipo: string;
  archivo: Archivos;
  constructor(tipo: string, archivo: Archivos) {
    this.tipo = tipo;
    this.archivo = archivo;
  }
}

@Component({
  selector: 'app-programa-docente-crud',
  templateUrl: './programa-docente-crud.component.html',
  styleUrls: ['./programa-docente-crud.component.css']
})
export class ProgramaDocenteCrudComponent implements OnInit {
  @ViewChild('modalCrud')
  modalCrud: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  edicionFormulario: boolean = false;
  formulario: FormGroup;
  idProgramaDocente: number;
  // se declaran variables para consultas de base de datos
  programaDocenteService;
  nivelEstudiosCatalogo;
  reacreditacionService;
  estatusCatalogo;
  validacionActiva: boolean = false;
  uploadFile: any;
  credencial: number;
  optionReversa:  boolean = false;
  optionFrontal:  boolean = false;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };

  option: NgUploaderOptions;
  response: any;
  hasBaseDropZoneOver: boolean;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
      'abreviatura,descripcion' }
  };
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];

  idArchivoCredencialFrontal: number;
  idArchivoCredencialReversa: number;

  auxiliar: boolean = false;
  registroSeleccionado: ReacreditacionProgramaDocente;
  columnas: Array<any> = [
    {titulo: 'Fecha', nombre: 'fecha'},
    {titulo: 'Años de reacreditación', nombre: 'anios'},
    {titulo: 'Nivel de reacreditación', nombre: 'idNivelReacreditacion'},
  ];

  columnasDocumentos: Array<any> = [
    {titulo: 'Documento', nombre: '', sort: false},
    {titulo: 'Archivo', nombre: '', sort: false},
  ];
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  registros:Array<ReacreditacionProgramaDocente> ;
  registrosCredencial: Array<Registro> = [];
  registroSeleccionadoCredencial: Registro;
  archivoService;
  public _nivelReacreditacion: ReacreditacionService;
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;

  ////// picker ///
  dt: Date = new Date();
  dt2: Date = new Date();

  private nombreArchivoCredencialFrente: string = '';
  private nombreArchivoCredencialReverso: string = '';

  private opcionesCatNivelEstudios: Array<ItemSelects>;
  private opcionesCatEstatus: Array<ItemSelects>;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];
  private entidadProgramaDocente: ProgramaDocente;
  private alertas: Array<Object> = [];
  private sub: any;

  constructor(private elementRef: ElementRef,
              route: ActivatedRoute,
              private injector: Injector, private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              public _estatusService: EstatusCatalogoService,
              private router: Router, public _spinner: SpinnerService,
              @Inject(NgZone) private zone: NgZone
  ) {
    this.sub = route.params.subscribe(params => {
      this.idProgramaDocente = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
/*    this.option = new NgUploaderOptions({
      url: 'http://api.ngx-uploader.com/upload',
      autoUpload: true,
      calculateSpeed: true
    });*/
    this.inicializarOpcionesNgZone();
    moment.locale('es');
//    this.idProgramaDocente = Number(params.get('id'));
    ////console.log(this.idProgramaDocente);
    this.prepareServices();

    this.formulario = new FormGroup({
      abreviatura: new FormControl('', Validators.
      compose([Validators.required, Validacion.letrasNumerosSinEspacioValidator])),
      descripcion: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      nomenclatura: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      consecutivo: new FormControl('', Validators.
      compose([Validators.required, Validacion.numerosValidator])),
      claveDgp: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      mesAnioPrimerPeriodo: new FormControl(''),
      campus: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      modalidad: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      numeroRegistroSege: new FormControl('', Validators.
      compose([Validators.required, Validacion.letrasNumerosSinEspacioValidator])),
      fechaRegistroPnpc: new FormControl(''),
      numeroReferenciaPnpc: new FormControl('', Validators.
      compose([Validators.required, Validacion.letrasNumerosSinEspacioValidator])),
      requierePago: new FormControl('', Validators.required),
      colorRgb: new FormControl('', Validators.
      compose([Validators.required, Validacion.letrasNumerosSinEspacioValidator])),
      idNivelEstudios: new FormControl('', Validators.required),
      idEstatus: new FormControl('', Validators.required),
      idArchivoCredencialFrontal: new FormControl('', Validators.required),
      idArchivoCredencialReversa: new FormControl('', Validators.required),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      seteador: new FormControl(''),
      auxiliarCredencial: new FormControl('', Validators.required)
    });

    if (this.idProgramaDocente) {
      this._spinner.start("programadocentecrud");
      let programaDocenteCatalogo: ProgramaDocente;
      this.edicionFormulario = true;
      this.entidadProgramaDocente = this.programaDocenteService.getEntidadProgramaDocente(
        this.idProgramaDocente,
        this.erroresConsultas).subscribe(
        response => programaDocenteCatalogo = new ProgramaDocente(response.json()),
        error => {
          console.error(error);
        },
        () => {
          console.log("ID PD "+this.idProgramaDocente);
          if (this.formulario) {

            let stringAbreviatura = 'abreviatura';
            let stringDescripcion = 'descripcion';
            let stringConsecutivo = 'consecutivo';
            let stringClaveDGP = 'claveDgp';
            let stringCampus = 'campus';
            let stringModalidad = 'modalidad';
            let stringNumeroRegistroSege = 'numeroRegistroSege';
            let stringNumeroReferenciaPnpc = 'numeroReferenciaPnpc';
            let stringRequierePago =  'requierePago';
            let stringColorRgb =  'colorRgb';
            let stringNivelEstudios =  'idNivelEstudios';
            let stringEstatus =  'idEstatus';
            let stringNomenclatura =  'nomenclatura';
            let stringIdArchivoCredencialFrontal = 'idArchivoCredencialFrontal';
            let stringIdArchivoCredencialReversa = 'idArchivoCredencialReversa';

            let fechaRegistro = moment(
              programaDocenteCatalogo.fechaRegistroPnpc);
            let fechaMesAnio = moment(
              programaDocenteCatalogo.mesAnioPrimerPeriodo);

            (<FormControl>this.formulario.controls[stringAbreviatura])
              .setValue(programaDocenteCatalogo.abreviatura);
            (<FormControl>this.formulario.controls[stringNomenclatura])
              .setValue(programaDocenteCatalogo.nomenclatura);
            for (var i in this.formulario.controls)
              (<FormControl>this.formulario.controls[stringDescripcion])
                .setValue(programaDocenteCatalogo.descripcion);
            (<FormControl>this.formulario.controls[stringConsecutivo])
              .setValue(programaDocenteCatalogo.consecutivo);
            (<FormControl>this.formulario.controls[stringClaveDGP])
              .setValue(programaDocenteCatalogo.claveDgp);
            (<FormControl>this.formulario.controls[stringCampus])
              .setValue(programaDocenteCatalogo.campus);
            (<FormControl>this.formulario.controls[stringModalidad])
              .setValue(programaDocenteCatalogo.modalidad);
            (<FormControl>this.formulario.controls[stringNumeroRegistroSege])
              .setValue(programaDocenteCatalogo.numeroRegistroSege);
            (<FormControl>this.formulario.controls[stringNumeroReferenciaPnpc])
              .setValue(programaDocenteCatalogo.numeroReferenciaPnpc);
            (<FormControl>this.formulario.controls[stringColorRgb])
              .setValue(programaDocenteCatalogo.colorRgb);
            (<FormControl>this.formulario.controls[stringNivelEstudios])
              .setValue(programaDocenteCatalogo.nivelEstudios.id);
            (<FormControl>this.formulario.controls[stringEstatus])
              .setValue(programaDocenteCatalogo.estatus.id);
            (<FormControl>this.formulario.controls[stringIdArchivoCredencialFrontal])
              .setValue(programaDocenteCatalogo.archivoCredencialFrontal.id);
            (<FormControl>this.formulario.controls[stringIdArchivoCredencialReversa])
              .setValue(programaDocenteCatalogo.archivoCredencialReversa.id);

            if (programaDocenteCatalogo.requierePago) {
              this.auxiliar = true;

              (<FormControl>this.formulario.controls[stringRequierePago])
                .setValue(programaDocenteCatalogo.requierePago);
            }

            if (programaDocenteCatalogo.archivoCredencialFrontal) {
              //console.log(programaDocenteCatalogo.archivoCredencialFrontal);
              this.registrosCredencial.push(
                new Registro(
                  '600',
                  programaDocenteCatalogo.archivoCredencialFrontal
                )
              );
            }

            if (programaDocenteCatalogo.archivoCredencialReversa) {
              //console.log(programaDocenteCatalogo.archivoCredencialReversa);
              this.registrosCredencial.push(
                new Registro(
                  '500',
                  programaDocenteCatalogo.archivoCredencialReversa
                )
              );
            }

            this.dt = new Date(fechaRegistro.toJSON());
            this.dt2 = new Date(fechaMesAnio.toJSON());
            this._spinner.stop("programadocentecrud");
            this.resetearValorCredencial();
          }
        }
      );
    }

    this.zone = new NgZone({ enableLongStackTrace: false});

    ////console.log(this.context.componenteLista.idProgramaDocente);
    this.formularioReacreditacion = new FormGroup({
      fecha: new FormControl(''),
      idNivelReacreditacion: new FormControl('', Validators.required),
      anios: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      comentario: new FormControl('', Validators.
      compose([ Validacion.parrafos])),
      idProgramaDocente: new FormControl(this.idProgramaDocente)
    });
  }

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['jpg','png','JPG','PNG','JPGE','jpge'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  handleUpload(data: any) {
    setTimeout(() => {
      this.zone.run(() => {
        this.response = data;
        if (data && data.response) {
          this.response = JSON.parse(data.response);
        }
      });
    });
  }

  fileOverBase(e: boolean) {
    this.hasBaseDropZoneOver = e;
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

  ////// picker ///

  getFechaIngreso(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaRegistroPnpc'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaMes(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt2).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['mesAnioPrimerPeriodo'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  cambiarAuxiliar(valor): any {
    if (valor) {
      (<FormControl>this.formulario.controls['requierePago']).setValue(true);
      this.auxiliar = true;
    }else {
      (<FormControl>this.formulario.controls['requierePago']).setValue(true);
      this.auxiliar = false;
    }
  }

  cambioRadio(): boolean {
    if (this.auxiliar) {
      (<FormControl>this.formulario.controls['requierePago']).setValue(true);
      return true;
    }else {
      (<FormControl>this.formulario.controls['requierePago']).setValue(false);
      return false;
    }
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      event.preventDefault();
      ////console.log(' formulario valido');
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      ////console.log(jsonFormulario);
      if (this.edicionFormulario) {
        ////console.log('editar');
        this.programaDocenteService.putProgramaDocente(
          this.idProgramaDocente,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.regresarListaProgramas();
          }
        );
      } else {
        ////console.log(' nuevo');
        this.programaDocenteService.postProgramaDocente(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this.regresarListaProgramas();
          }
        );
      }
    } else {
    }

  }

  regresarListaProgramas(): any {
    this.router.navigate(['/catalogo/programa-docente']);
  }

  validarFormulario(): boolean {
    let stringAuxiliar = 'auxiliarCredencial';
    if (this.registrosCredencial.length === 2) {
      (<FormControl>this.formulario.controls[stringAuxiliar])
        .setValue('Si hay 2 archivos');
    }

    if (this.formulario.valid) {
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
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
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

  rowSeleccionadoCredencial(registro): boolean {
    return (this.registroSeleccionadoCredencial === registro);
  }

  rowSeleccionCredencial(registro): void {
    if (this.registroSeleccionadoCredencial !== registro) {
      this.registroSeleccionadoCredencial = registro;

    } else {
      this.registroSeleccionadoCredencial = null;
    }
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    ////console.log('---------------------------');
    ////console.log(this.idProgramaDocente);
    let criterio = 'idProgramaDocente~' + 7 + ':IGUAL';
    urlSearch.set('criterios', criterio);
    this.registros = this.reacreditacionService
      .getListaReacreditacionProgramaDocente(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  tipoArchivo(archivo): void {
    this.tipoArchivo = archivo;
    //console.log('tipo archivo' + this.tipoArchivo);
  }

  handleBasicUpload(data): void {
    console.log('1');
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      console.log('2');
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        let idArchivo = responseJson.id;
        let tipo = this.getControl('seteador').value;
        console.log('3');
        if (tipo) {
          console.log('4');
          if (this.esImagen(responseJson.originalName)) {
            console.log('5');
            let acceso = true;
            this.registrosCredencial.forEach((item) => {
              //console.log(item);
              if (item.tipo == tipo) {
                acceso = false;
                ///pocisionArreglo = this.registrosCredencial.
              }
            });
            if (acceso) {
              console.log('6');
              if (tipo === '600') {
                console.log('7');
                this.idArchivoCredencialFrontal = responseJson.id;
                this.nombreArchivoCredencialFrente = responseJson.originalName;
                this.formulario.value.idArchivoCredencialFrontal = idArchivo;
                (<FormControl>this.formulario.controls['idArchivoCredencialFrontal']).
                setValue(idArchivo);
                this.registrosCredencial.push(
                  new Registro(
                    tipo,
                    responseJson
                  )
                );
                this.optionFrontal=true;
                this.resetearValorCredencial();
                (<FormControl>this.formulario.controls['seteador']).setValue('');
              } else {
                console.log('8');
                this.idArchivoCredencialReversa = responseJson.id;
                this.formulario.value.idArchivoCredencialReversa = idArchivo;
                this.nombreArchivoCredencialReverso = responseJson.originalName;
                (<FormControl>this.formulario.controls['idArchivoCredencialReversa']).
                setValue(idArchivo);
                this.registrosCredencial.push(
                  new Registro(
                    tipo,
                    responseJson
                  )
                );
                this.optionReversa=true;
                this.resetearValorCredencial();
                (<FormControl>this.formulario.controls['seteador']).setValue('');
              }
            } else {
              console.log('9');
              this.addErrorsMesaje(
                'Ya hay un archivo del tipo seleccionado',
                'danger'
              );
              this.resetearValorCredencial();
              (<FormControl>this.formulario.controls['seteador']).setValue('');
            }
          }else {
            console.log('10');
            this.addErrorsMesaje('El archivo debe de ser en jpg', 'danger');
            this.archivoService.deleteArchivo(
              responseJson.id,
              this.erroresGuardado)
              .subscribe(
                () => {
                  console.log('Se borro el archivo');
                }
              );
          }
        } else {
          console.log('11');
          this.addErrorsMesaje(
            'Selecciona un tipo de documento',
            'danger'
          );
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
        //console.log(this.dropResp);
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

  eliminarArchivoCredencial(): void {
    if (this.registroSeleccionadoCredencial) {
      this.archivoService.deleteArchivo(
        this.registroSeleccionadoCredencial.archivo.id,
        this.erroresGuardado
      ).subscribe(
        response => {
          let auxiliar: Array<any> = [];
          for (var i = 0; i < this.registrosCredencial.length; i++) {
            if (this.registroSeleccionadoCredencial.tipo !== this.registrosCredencial[i].tipo) {
              auxiliar.push(this.registrosCredencial[i]);
            }
            if (this.registroSeleccionadoCredencial.tipo=='600'){
              this.optionFrontal=false;
            }
            if (this.registroSeleccionadoCredencial.tipo=='500'){
              this.optionReversa=false;
            }
          }
          this.registrosCredencial = auxiliar;
          this.registroSeleccionadoCredencial = null;
        }
      );
    } else {
      this.addErrorsMesaje(
        'Seleccione un docuemento de la tabla ',
        'danger'
      );
    }
  }

  ladoCredencial(valor: string): void {
    let algo: Array<any> = valor.split('-');
    this.credencial = algo[0];
  }

  resetearValorCredencial(): void {
    this.credencial = null;
  }

  private esImagen(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    let tamanoArreglo: number;
    nombreArchivoArray = nombreArchiov.split('.');
    tamanoArreglo = nombreArchivoArray.length - 1;
    if (nombreArchivoArray[tamanoArreglo] && (
      nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpg' ||
      nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpeg') ) {
      return true;
    } else {
      return false;
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {

    this.nivelEstudiosCatalogo = this._catalogosService.getCatalogoNivelEstudios();
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus~' + '1007' + ':IGUAL');
    // idEstatus = 1007 mostrar solo activos
    this.opcionesCatNivelEstudios =
      this.nivelEstudiosCatalogo.getSelectNivelFiltrado(this.erroresConsultas, urlParameter);
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.estatusCatalogo = this._catalogosService.getEstatusCatalogo();
    urlParameter.set('criterios', 'idCatalogo~' + '1004' + ':IGUAL');
    // 1004 id del catalogo de estatus
    ////console.log(urlParameter);
    this.opcionesCatEstatus =
      this._estatusService.getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
    this.reacreditacionService = this._catalogosService.getReacreditacionProgramaDocente();
    this.archivoService =
      this._catalogosService.getArchivos();
    this.onCambiosTabla();
    this.getListaAcreditaciones();
    this.opcionesNivelEstudios =
      this._catalogosService.getNivelReacreditacion().getSelectReacreditacion(this.erroresConsultas)

  }


  getListaAcreditaciones(): void {  //Tabla
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
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
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    if (this.configuracion.filtrado.textoFiltro !== '') {
      this._spinner.start("reacfedicacion1");
    }

    this.reacreditacionService.getListaReacreditacion (
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
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
          this.registros.push(new ReacreditacionProgramaDocente(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this._spinner.stop("reacfedicacion1");
      },
      () => {
        this._spinner.stop("reacfedicacion1");
      }
    );
  }

  ngOnInit() {
  }

  //////////////////////////CODIGO DE MODALS////////////////////////////

  edicionFormulario2: boolean = false;
  formularioReacreditacion: FormGroup;
  entidadReacreditacion: ReacreditacionProgramaDocente;
  catalogoNivelEstudios;
  validacionActiva2: boolean = false;

  ////// picker ///
  public fechaReacreditacion: Date = new Date();

  private opcionesNivelEstudios: Array<ItemSelects> = [];
  private erroresConsultas2: Array<Object> = [];


  abrirModal(): void{
    this.modalCrud.open('lg');
  }
  cerrarModal(): void {
    this.modalCrud.close();
  }

  modalAgregarReacreditacion(modo): void {
    this.formularioReacreditacion.reset();
    let idReacreditacion: number;
    console.log(modo);
    if (modo === 'editar' && this.registroSeleccionado) {
      idReacreditacion = this.registroSeleccionado.id;
    }else{
      this.registroSeleccionado = null;
      idReacreditacion = null;
      this.fechaReacreditacion = new Date();
      (<FormControl>this.formularioReacreditacion.controls['idNivelReacreditacion']).setValue('');
    }

    console.log("IMPRIMO ID:: " +idReacreditacion);
    if (this.registroSeleccionado) {
      this._spinner.start("modalcrud");
      this.edicionFormulario2 = true;
      let reacreditacion: ReacreditacionProgramaDocente;
      this.entidadReacreditacion = this.reacreditacionService
        .getEntidadReacreditacionProgramaDocente(
          this.registroSeleccionado.id,
          this.erroresConsultas2
        ).subscribe(
          // response es la respuesta correcta(200) del servidor
          // se convierte la respuesta a JSON,
          // se realiza la convercion del json a una entidad
          // de tipo ClasificacionPreguntasFrecuentes
          response =>
            reacreditacion = new ReacreditacionProgramaDocente(
              response.json()),
          // en caso de presentarse un error se agrega un nuevo error al array errores
          error => {
            console.error(error);
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // al finalizar correctamente la ejecucion se muestra en consola el resultado
          () => {
            //console.log('ENTIDADDDD ' +this.entidadReacreditacion.nivelReacreditacion.id);
            console.log('|||| '+reacreditacion.nivelReacreditacion.id);
            if (this.formularioReacreditacion) {
              let stringNivel = 'idNivelReacreditacion';
              let stringAnio = 'anios';
              let stringComentario = 'comentario';
              let fechaRecuperar = moment(reacreditacion.fecha);
              (<FormControl>this.formularioReacreditacion.controls[stringNivel]).setValue(reacreditacion.nivelReacreditacion.id);
              (<FormControl>this.formularioReacreditacion.controls[stringAnio]).setValue(reacreditacion.anios);
              (<FormControl>this.formularioReacreditacion.controls[stringComentario]).setValue(reacreditacion.comentario);
              ////console.log(this.formularioReacreditacion);
              this.fechaReacreditacion = new Date(fechaRecuperar.toJSON());
            }
            this._spinner.stop("modalcrud");
          }
        );
    }

    this.abrirModal();
  }

  getFechaReacreditacion(): string {
    if (this.fechaReacreditacion) {
      let fechaConFormato = moment(this.fechaReacreditacion).format('DD/MM/YYYY');
      (<FormControl>this.formularioReacreditacion.controls['fecha'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  enviarFormulario2(): void {
    if (this.validarFormulario2()) {
      this._spinner.start("modalcrud2");
      let jsonFormulario = JSON.stringify(this.formularioReacreditacion.value, null, 2);
      ////console.log(jsonFormulario);
      if (this.edicionFormulario2) {

        this.reacreditacionService
          .putReacreditacionProgramaDocente(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this._spinner.stop("modalcrud2");
            this.getListaAcreditaciones();
            this.cerrarModal();
          }
        );
      } else {
        this.reacreditacionService
          .postReacreditacionProgramaDocente(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this._spinner.stop("modalcrud2");
            this.getListaAcreditaciones();
            this.cerrarModal();
          }
        );
      }
    } else {
      //alert('error en el formulario');
    }
  }

  validarFormulario2(): boolean {
    if (this.formularioReacreditacion.valid) {
      this.validacionActiva2 = false;
      return true;
    }
    this.validacionActiva2 = true;
    return false;
  }

  errorMessage2(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  getControl2(campo: string): FormControl {
    return (<FormControl>this.formularioReacreditacion[campo]);
  }

  private getControlErrors2(campo: string): boolean {
    if (!(<FormControl>this.formularioReacreditacion[campo]) &&
      this.validacionActiva2) {
      return true;
    }
    return false;
  }

  /////////////////////////////CODIGO DE MODAL DETALLE //////////////////////////////////////////
  entidadReacreditacion2: ReacreditacionProgramaDocente;
  abirModal2(){
    this.modalDetalle.open('lg');
  }

  cerrarModal2(){
    this.modalDetalle.close();
  }

  modalDetalleReacreditacion(): void {
    this.reacreditacionService
      .getEntidadReacreditacionProgramaDocente(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadReacreditacion2
          = new ReacreditacionProgramaDocente(response.json());
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
      }
    );
    this.abirModal2()
  }
}
