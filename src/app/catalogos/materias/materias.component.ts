import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild, NgZone, Inject} from '@angular/core';
import {Materia} from "../../services/entidades/materia.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ConfigService} from "../../services/core/config.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {NgUploaderOptions} from "ngx-uploader/ngx-uploader";
import {ArchivoService} from "../../services/entidades/archivo.service";

@Component({
  selector: 'app-materias',
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css']
})
export class MateriasComponent implements OnInit {

  @ViewChild('modalCrudMaterias')
  modalCrudMaterias: ModalComponent;
  @ViewChild('modalDetalleMateria')
  modalDetalleMateria: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Materia> = [];
  columnas: Array<any> = [
    { titulo: 'Clave*', nombre: 'clave'},
    { titulo: 'Descripción*', nombre: 'descripcion'},
    { titulo: 'Total de créditos*', nombre: 'creditos'},
    { titulo: 'Programa docente*', nombre: 'idProgramaDocente'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus*', nombre: 'idEstatus'}
  ];

  paginacion: PaginacionInfo;
  registroSeleccionado: Materia;
  materiaService;

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '',
      columnas: 'clave,descripcion,creditos,' +
      'idProgramaDocente.descripcion,idEstatus.valor' }
  };

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  //variables modal editar
  formularioMateria: FormGroup;
  edicionFormulario: boolean = false;
  entidadMateria: Materia;
  validacionActiva: boolean = false;

  private tipoArchivo: string;
  private nombreArchivoDesarrollar: string = '';
  private opcionesCatalogoProgramaDocente: Array<ItemSelects> = [];
  private opcionesCatalogoTipoMateria: Array <ItemSelects> = [];
  private opcionesCatalogoEstatus: Array<ItemSelects> = [];
  private opcionesCatalogoMaterias: Array<ItemSelects> = [];

  //variables subir archivos
  uploadFile: any;
  /*options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };*/
  options: NgUploaderOptions;
  //zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  idArchivoDesarrollo: number;

  constructor(@Inject(NgZone) private zone: NgZone,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public catalogosService: CatalogosServices,
              public spinner: SpinnerService,
              private _archivoService: ArchivoService
  ) {
    this.prepareService();
    this.inicializarFormulario();
    this.inicializarOpcionesNgZone();
  }

  private inicializarFormulario(): void {
    this.formularioMateria = new FormGroup({
      clave: new FormControl('', Validators.compose([Validacion.parrafos, Validators.required])),
      descripcion: new FormControl('', Validators.compose([Validacion.parrafos, Validators.required])),
      creditos: new FormControl('', Validators.compose([Validacion.numerosValidator, Validators.required])),
      idSeriacion: new FormControl(''),
      horasDocente: new FormControl('', Validators.compose([Validacion.numerosValidator, Validators.required])),
      horasIndependiente: new FormControl('', Validators.compose([Validacion.numerosValidator, Validators.required])),
      totalHoras: new FormControl('', Validators.compose([Validacion.numerosValidator, Validators.required])),
      modalidad: new FormControl('', Validators.compose([Validacion.parrafos, Validators.required])),
      objectivo: new FormControl('', Validators.compose([Validacion.parrafos])),
      sesiones: new FormControl('', Validators.compose([Validacion.numerosValidator, Validators.required])),
      idTipo: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
      idEstatus: new FormControl('', Validators.required),
      idArchivoTemasDesarrollar: new FormControl(''),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });

    this.getControl('idEstatus').patchValue('0');
    this.getControl('idSeriacion').patchValue('0');
    this.getControl('idProgramaDocente').patchValue('0');
    this.getControl('idTipo').patchValue('0');
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['pdf'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  onCambiosTabla(): void {  //Tabla
    this.registroSeleccionado = null;
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
    if (this.configuracion.filtrado.textoFiltro === ''){
      this.spinner.start("catalogomaterias1");
    }

    this.materiaService.getListaMateriaPaginador(
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
          this.registros.push(new Materia(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this.spinner.stop("catalogomaterias1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this.spinner.stop("catalogomaterias1");
      }
    );
  }

  rowSeleccionado(registro): boolean {
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

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
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



/*  modalMateriaCRUD(modo): void {
    let idMateria: number;
    if (modo === 'editar'  && this.registroSeleccionado) {
      idMateria = this.registroSeleccionado.id;
    }
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    let modalFormularioData = new ModalMateriaCRUDData(
      this,
      idMateria
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData}),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalMateriaCRUD,
      bindings,
      modalConfig
    );
  }

  modalDetalles(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idMateria = this.registroSeleccionado.id;
      let modalDetallesData = new DetalleMateriaData(
        this,
        idMateria
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>DetalleMateria,
        bindings,
        modalConfig
      );
    }
  }*/

  cambiarEstatus(modo): void {
    ////console.log(modo);
    let idMateria: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'id': idMateria, 'idEstatus': '1008'};
    } else {
      estatus = {'id': idMateria, 'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      this.spinner.start("catalogomaterias2");
      idMateria = this.registroSeleccionado.id;
      ////console.log(idMateria);
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      ////console.log(jsonCambiarEstatus);

      this.materiaService.putMateria(
        idMateria,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.spinner.stop("catalogomaterias2");
          this.onCambiosTabla();
        }
      );
    }
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  ocultarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1007) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
      return true;
    } else {
      return false;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Paginador                                                  //
///////////////////////////////////////////////////////////////////////////////////////////////

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

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        //console.log(this.exportarExcelUrl);
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  private prepareService(): void {
    this.materiaService =
      this.catalogosService.getMateria();
  }

  // modal agregar / editar materia
  modalMateriaCRUD(modo): void {
    this.inicializarFormulario();
    this.cargarSelectores();
    this.edicionFormulario = false;
    if (modo === 'editar'  && this.registroSeleccionado) {
      this.getDatosMateriaSeleccionada('editar');
    }
    this.modalCrudMaterias.open('lg');
  }

  cargarSelectores(){
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioEstatus = 'idCatalogo~' + '1004' + ':IGUAL';
    urlParameter.set('criterios', criterioEstatus);
    this.opcionesCatalogoEstatus = this.catalogosService.getEstatusCatalogo().
    getSelectEstatusCatalogo(this.erroresConsultas, urlParameter);
    let criterioProgramaDocente = 'idEstatus~' + '1007' + ':IGUAL';
    urlParameter.set('criterios', criterioProgramaDocente);
    this.opcionesCatalogoProgramaDocente =
      this.catalogosService.getCatalogoProgramaDocente().getSelectProgramaDocente(this.erroresConsultas,urlParameter);
    this.opcionesCatalogoTipoMateria =
      this.catalogosService.getTipoMateria().
      getSelectTipoMateria(this.erroresConsultas);
  }

  getDatosMateriaSeleccionada(modoMostrarDatos){
    if (this.registroSeleccionado.id) {
      //console.log(this.context.idMateria);
      console.log('ENTRA::');
      this.edicionFormulario = true;
      let materia: Materia;
      this.materiaService.getMateria(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        // response es la respuesta correcta(200) del servidor
        // se convierte la respuesta a JSON,
        // se realiza la convercion del json a una entidad
        // de tipo Materia
        response => {
          materia = new Materia(
            response.json());
          this.entidadMateria = materia;
            //this.obtenerEntidad(materia)
        },
        // en caso de presentarse un error se agrega un nuevo error al array errores
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
        },
        // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
        // al finalizar correctamente la ejecucion se muestra en consola el resultado
        () => {
          /*if (assertionsEnabled()) {
            //console.log(materia);
          }*/
          if (this.formularioMateria && modoMostrarDatos === 'editar' ) {

            let stringClave = 'clave';
            let stringDescripcion = 'descripcion';
            let intCreditos = 'creditos';
            let stringSeriacion = 'idSeriacion';
            let intHorasDocente = 'horasDocente';
            let intHorasIndependiente = 'horasIndependiente';
            let intTotalHoras = 'totalHoras';
            let stringModalidad	 = 'modalidad';
            let stringObjetivo = 'objectivo';
            let intSesiones  = 'sesiones';
            let intIdTipo = 'idTipo';
            let intIdEstatus = 'idEstatus';
            let intIdProgramaDocente = 'idProgramaDocente';
            let intIdArchivoTemasDesarrollar = ('idArchivoTemasDesarrollar');


            //console.log(materia);
            (<FormControl>this.formularioMateria.controls[stringClave])
              .setValue(materia.clave);
            (<FormControl>this.formularioMateria.controls[stringDescripcion])
              .setValue(materia.descripcion);
            (<FormControl>this.formularioMateria.controls[intCreditos])
              .setValue(materia.creditos);
            (<FormControl>this.formularioMateria.controls[intHorasDocente])
              .setValue(materia.horasDocente);
            (<FormControl>this.formularioMateria.controls[intHorasIndependiente])
              .setValue(materia.horasIndependiente);
            (<FormControl>this.formularioMateria.controls[intTotalHoras])
              .setValue(materia.totalHoras);
            (<FormControl>this.formularioMateria.controls[stringModalidad])
              .setValue(materia.modalidad);
            (<FormControl>this.formularioMateria.controls[stringObjetivo])
              .setValue(materia.objectivo);
            (<FormControl>this.formularioMateria.controls[intSesiones])
              .setValue(materia.sesiones);
            (<FormControl>this.formularioMateria.controls[intIdTipo])
              .setValue(materia.tipoMateria.id);
            (<FormControl>this.formularioMateria.controls[intIdProgramaDocente])
              .setValue(materia.programaDocente.id);
            (<FormControl>this.formularioMateria.controls[intIdEstatus])
              .setValue(materia.estatus.id);
            (<FormControl>this.formularioMateria.controls[intIdArchivoTemasDesarrollar])
              .setValue(materia.archivoTemasDesarrollar.id);
            this.cambioProgramaDocenteFiltro(materia.programaDocente.id);
            if (materia.seriacion.id !== undefined){
              //console.log(materia.seriacion.id);
              (<FormControl>this.formularioMateria.controls[stringSeriacion])
                .setValue(materia.seriacion.id);
            }
          }
        }
      );
    }
  }

  cerrarModal(): void {
    this.limpiarFormulario();
    this.modalCrudMaterias.close();
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioMateria.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioMateria.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  /*filter(urlParameter: URLSearchParams) : void{
    this.spinner.stop('traerCatMaterias');
    //console.log(urlParameter);
    this.materiaService.getSelectMateriaNombre(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let items = response.json().lista;
        //console.log(items);
        if (items) {
          this.opcionesCatalogoMaterias = [];
          items.forEach((item) => {
            this.opcionesCatalogoMaterias.push(
              new ItemSelect(item.id,
                item.clave + ' ' +
                item.descripcion + ' ' ));
          });
        }
      },
      error => {
        /!*if (assertionsEnabled())
          console.error(error);*!/

        this.spinner.stop('traerCatMaterias');
        this.isComplete = false;
      },
      () => {
        /!*if (assertionsEnabled())
        //console.log(this.opcionesCatalogoMaterias);*!/

          this.spinner.stop('traerCatMaterias');
        this.isComplete = false;
      }
    );
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.typeAheadEventEmitter.next(filtroTexto);
  }*/

  validarFormulario(): boolean {
    if (this.formularioMateria.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  enviarFormulario(): void {
    this.validacionActiva = false;
    if (this.validarFormulario()) {
      this.spinner.start('guardarEditar');
      event.preventDefault();
      let jsonFormulario = JSON.
      stringify(this.formularioMateria.value, null, 2);
      if (this.edicionFormulario) {
        this.materiaService.putMateria(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {},
          error => {
            console.error(error);
            this.spinner.stop('guardarEditar');
          },
          () => {
            this.spinner.stop('guardarEditar');
            this.onCambiosTabla();
            this.cerrarModal();
          }
        );
      } else {
        this.materiaService.postMateria(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {},
          error => {
            console.error(error);
            this.spinner.stop('guardarEditar');
          },
          () => {
            this.spinner.stop('guardarEditar');
            this.onCambiosTabla();
            this.cerrarModal();
          }
        );
      }

    } /*else {  }*/
  }

  tipoArchivow(archivo): void {
    this.tipoArchivo = archivo;
    //console.log('tipo archivo' + this.tipoArchivo);
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start('verArchivo');
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
            //console.log('Error downloading the file.');
            this.spinner.stop('verArchivo');
          },
          () => {
            console.info('OK');
            this.spinner.stop('verArchivo');
          }
        );
    }
  }

  descargarArchivo(id: number): void {

    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start('descargarArchivo');
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
            //console.log('Error downloading the file.');
            this.spinner.stop('descargarArchivo');
          },
          () => {
            console.info('OK');
            this.spinner.stop('descargarArchivo');
          }
        );
    }

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
    return null;
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    if (this.registroSeleccionado) {
      urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL,id~' + this.registroSeleccionado.id + ':NOT');
    }else {
      urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    }

    this.catalogosService.getMateria().getSelectMateriaNombre(
      this.erroresConsultas,
      urlParameter
    ).subscribe(response => {
      console.log(response.json());
        let respuesta = response.json().lista;
        respuesta.forEach((item) => {
          console.log(item);
          let materiaRecu: Materia = item;
          console.log(item.id);
          console.log(item.descripcion);
          this.opcionesCatalogoMaterias.push(new ItemSelects(item.id, item.clave + ' - ' + item.descripcion))
        })
      }
    );

  }

  //Metodos agregar documentos
  handleBasicUpload(data, tipo): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        let idArchivo = responseJson.id;

        let jsonArchivo = '{"Programa a desarrollar": ' + responseJson.id + '}';
        if (tipo === 'desarrollo') {
          this.idArchivoDesarrollo = responseJson.id;
          this.nombreArchivoDesarrollar = responseJson.originalName;
          this.formularioMateria.value.idArchivoTemasDesarrollar = idArchivo;
          this.getControl('idArchivoTemasDesarrollar').patchValue(idArchivo);
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

  // modal detalle materias

  modalDetalles(): void {
    this.getDatosMateriaSeleccionada('detalle');
    this.modalDetalleMateria.open('lg');
  }

  cerrarModalDetalle() {
    this.modalDetalleMateria.close();
    this.entidadMateria = null;

  }

  limpiarFormulario() {
    this.validacionActiva = false;
    this.edicionFormulario = false;
    this.opcionesCatalogoMaterias = null;
    //this.formularioMateria.reset();
    this.getControl('idEstatus').patchValue('0');
    this.getControl('idSeriacion').patchValue('0');
    this.getControl('idProgramaDocente').patchValue('0');
    this.getControl('idTipo').patchValue('0');
  }

/*  constructor() { }

  ngOnInit() {
  }

  ocultarOpcionActivar(): boolean {
    return true;
  }
  ocultarOpcionDesactivar(): boolean {
    return true;
  }*/

}
