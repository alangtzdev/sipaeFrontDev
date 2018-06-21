import {Component, OnInit, Renderer, Injector, ElementRef, ViewChild} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ApoyoEconomicoService} from "../../services/entidades/apoyo-economico.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {PromocionServices} from "../../services/entidades/promocion.service";
import {FuenteApoyoService} from "../../services/catalogos/fuente-apoyo.service";
import {ApoyoEconomico} from "../../services/entidades/apoyo-economico.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import * as moment from "moment";
import {ClasificacionBecaService} from "../../services/catalogos/clasificacion-beca.service";
import {BecaService} from "../../services/entidades/beca.service";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {ClasificacionBeca} from "../../services/catalogos/clasificacion-beca.model";
import {Beca} from "../../services/entidades/beca.model";
import {Validacion} from "../../utils/Validacion";
import {EstudianteService} from "../../services/entidades/estudiante.service";

@Component({
  selector: 'app-apoyo-economico',
  templateUrl: './apoyo-economico.component.html',
  styleUrls: ['./apoyo-economico.component.css']
})
export class ApoyoEconomicoComponent implements OnInit {

  @ViewChild('modal')
  modal: ModalComponent;
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';
  fuenteApoyo: string;
  entidad: ApoyoEconomico;


  paginacion: PaginacionInfo;
  apoyoEconomicoService: ApoyoEconomicoService;
  catalogoService: CatalogosServices;
  promocionService: PromocionServices;
  fuenteApoyoService: FuenteApoyoService;
  clasificacionBecaService: ClasificacionBecaService;

  paginaActual: number = 1;
  limite: number = 10;
  registros: Array<ApoyoEconomico> = [];
  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idEstudiante.idMatricula.matriculaCompleta', sort: false},
    { titulo: 'Nombre del estudiante*',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
    { titulo: 'Fuente de apoyo', nombre: 'idFuenteApoyo.valor'}
  ];
  configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido,' +
    'idEstudiante.idMatricula.matriculaCompleta' }
  };

  // variables para exportar
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  registroSeleccionado: ApoyoEconomico;
  formFiltro: FormGroup;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};
  criteriosCabezera: string = '';
  botonBuscar: boolean = false;
  fuentesApoyo: Array<ItemSelects> = [];
  maxSizePags: number = 5;

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private opcionesSelectProgramaDocente: Array<ItemSelects>;
  private opcionesSelectPromocion: Array<ItemSelects>;

  constructor(
    private elementRef: ElementRef,
    private _spinner: SpinnerService,
    private apoyoService : ApoyoEconomicoService,
    private injector: Injector,
    private _renderer: Renderer,
    public _catalogosService: CatalogosServices,
    private _becaService: BecaService,
    private estudianteService: EstudianteService
  ) {
    this.prepareServices();
    this.obtenerCatalogos();
    this.formFiltro = new FormGroup({
      idProgramaDocente: new FormControl(''),
      idPromocion: new FormControl(''),
      fuenteApoyoEconomico: new FormControl('')
    });
    this.inicializarFormularioAgregarEditar();
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  busquedaListaApoyo(): void {
    let fuenteApoyo = this.formFiltro.controls['fuenteApoyoEconomico'].value;
    let idPromocion = this.formFiltro.controls['idPromocion'].value;

    if (idPromocion) {
      this.criteriosCabezera = 'idEstudiante.idPromocion.id~' + idPromocion + ':IGUAL';
      if (fuenteApoyo) {
        this.criteriosCabezera =
          this.criteriosCabezera + ';AND,idFuenteApoyo~' + fuenteApoyo + ':IGUAL';
      }
    }else {
      if (fuenteApoyo) {
        this.criteriosCabezera = 'idFuenteApoyo~' + fuenteApoyo + ':IGUAL';
      }else {
        this.criteriosCabezera = '';
      }
    }
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let fuenteApoyo = this.formFiltro.controls['fuenteApoyoEconomico'].value;
    let criterios = '';

    this.registroSeleccionado = null;

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      let palabrasFiltro: Array<string> = this.configuracion.filtrado.textoFiltro.split(' ');

      palabrasFiltro.forEach((palabra) => {
        filtros.forEach((filtro) => {
          criterios = criterios + ((criterios === '') ? '' : ';ANDGROUPAND,') + filtro + '~' +
            palabra + ':LIKE;OR';
        });
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

    this._spinner.start("apoyoeconomico1");
    this.apoyoEconomicoService.getListaApoyoEconomico(
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
          this.registros.push(new ApoyoEconomico(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        console.error(error);
        /*        if (assertionsEnabled()) {
         }*/
        this._spinner.stop("apoyoeconomico1");
      },
      () => {
        /*        if (assertionsEnabled()) {
         //console.log('paginacionInfo', this.paginacion);
         //console.log('registros', this.registros);
         }*/
        this._spinner.stop("apoyoeconomico1");
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

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  sortChanged(columna): void {
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
      this.onCambiosTabla();
    }
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

  mostrarBotones(): boolean {

    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }

  }

  activarBotonBusqueda(numero: number): any {
    if (numero == 1) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();

    urlParameter.set('ordenamiento', 'abreviatura:ASC,consecutivo:ASC');
    if (idProgramaDocente) {
      urlParameter.set('criterios', 'idProgramaDocente.id~' + idProgramaDocente + ':IGUAL');
      this.opcionesSelectPromocion =
        this.promocionService.getSelectPromocion(this.erroresConsultas, urlParameter);
    }else {
      (<FormControl>this.formFiltro.controls['idPromocion']).patchValue('');  //.patchValue('');
    }

  }

  private getControl(campo: string): FormControl {
    return (<FormControl>this.formFiltro.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formFiltro.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this.catalogoService = this._catalogosService;
    this.apoyoEconomicoService =
      this._catalogosService.getApoyoEconomico();
    this.promocionService =
      this._catalogosService.getPromocion();
    this.fuenteApoyoService =
      this._catalogosService.getFuenteApoyoService();
    this.clasificacionBecaService = this._catalogosService.getClasificacionBeca();
  }

  private obtenerCatalogos(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    urlSearch.set('ordenamiento', 'descripcion:ASC');
    this.opcionesSelectProgramaDocente =
      this.catalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    this.fuentesApoyo = this.fuenteApoyoService.getSelectFuenteApoyo(
      this.erroresConsultas,
      urlSearch
    );
  }

  /*  modalFormulario(modo): void {
   let modalConfig = new ModalConfig('lg', true, 27);
   let idEntidad: number;
   let fuenteApoyo: number;

   if (modo === 'editar' && this.registroSeleccionado) {
   idEntidad = this.registroSeleccionado.id;
   fuenteApoyo = this.registroSeleccionado.fuenteApoyo.id;
   }

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: new ModalsApoyosEconomicosData(
   this, fuenteApoyo, idEntidad)}),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   this.modal.open(
   <any>ModalsApoyosEconomicos,
   bindings,
   modalConfig
   );
   }*/

  modalDetalles(): void {
    this.modalDetalle.open('lg');

    if(this.registroSeleccionado.id){
      this._spinner.start("modaldetalles1");
      this.apoyoService
        .getEntidadApoyoEconomico(
          this.registroSeleccionado.id,
          this.erroresConsultas
        ).subscribe(
        response => {
          this.entidad = new ApoyoEconomico(response.json());
        },
        error => {
          console.error(error);
          console.error(this.erroresConsultas);
          this._spinner.stop("modaldetalles1");
        },
        () => {
          //console.log(this.entidad);
          this._spinner.stop("modaldetalles1");
        }
      );
    }
  }

  cerrarModal(): void {
    this.edicionFormulario = false;
    this.modalDetalle.close();
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }
  modalFormulario(modo): void {
    this.edicionFormulario = false;
    let idEntidad: number;
    let fuenteApoyo: number;
    this.inicializarFormularioAgregarEditar();
    this.listaAlumnos();

    this.obtenerCatalogosModalAgregar();
    if (modo === 'editar' && this.registroSeleccionado) {
      this.cargarInformarcionEditar();
      idEntidad = this.registroSeleccionado.id;
      fuenteApoyo = this.registroSeleccionado.fuenteApoyo.id;
    }

    this.modal.open('lg');
  }

  /*----------TODO VARIABLES MODAL AGREGAR/EDITAR-----------------*/
  formulario: FormGroup;

  estudiantes: Array<Object> = [];
  private opcionesEstudiante: Array<ItemSelects> = [];
  tiposBeca: Array<ClasificacionBeca> = [];
  becas: Array<Beca> = [];
  validacionActiva: boolean = false;

  /// DatePicker ///
  private fechaDP: Date;
  private minDate: Date;
  edicionFormulario: boolean = false;

  public configuracionModalEditar: any = {
    paginacion: false,
    filtrado: { textoFiltro: ''}
  };

  /*---------------------------------TODO INICIA modal agregar/editar apoyo economico*/

  inicializarFormularioAgregarEditar(){
    this.formulario = new FormGroup({
      //COLSAN
      conceptoApoyo: new FormControl('',Validators.required),
      cantidad: new FormControl('',Validators.required),
      fecha: new FormControl(''),
      idBeca: new FormControl('',Validators.required),
      tipoBeca: new FormControl('',Validators.required),
      //CONACYT
      numeroBeca: new FormControl('',Validators.required),
      numeroApoyo: new FormControl('',Validators.required),
      cvuConacyt: new FormControl('',Validators.required),
      //COMUN
      idFuenteApoyo: new FormControl('',Validators.required),
      fuenteApoyo: new FormControl(''),
      observaciones: new FormControl(''),
      idEstudiante: new FormControl('',Validators.required)
    });
    this.fechaDP = new Date();
  }

  cargarInformarcionEditar() {
    (<FormControl>this.formulario.controls['fecha'])
      .patchValue(this.getDate());
    if (this.registroSeleccionado) {
      this.edicionFormulario = true;
      let entidad: ApoyoEconomico;
      this._spinner.start('cargarDatosEditar');
      this.entidad = this.apoyoEconomicoService
        .getApoyoEconomico(
          this.registroSeleccionado.id,
          this.erroresConsultas
        ).subscribe(
          response =>
            entidad = new ApoyoEconomico(response.json()),
          error => {

            this._spinner.stop('cargarDatosEditar');
          },
          // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
          // muestra en consola el resultado
          () => {
            if (this.formulario) {
              (<FormControl>this.formulario.controls['idFuenteApoyo'])
                .patchValue(entidad.fuenteApoyo.id);
              (<FormControl>this.formulario.controls['observaciones'])
                .patchValue(entidad.observaciones);
              (<FormControl>this.formulario.controls['idEstudiante'])
                .patchValue(entidad.estudiante.id);
              (<FormControl>this.formulario.controls['conceptoApoyo'])
                .patchValue(entidad.conceptoApoyo);
              (<FormControl>this.formulario.controls['cantidad'])
                .patchValue(entidad.cantidad);
              (<FormControl>this.formulario.controls['fecha'])
                .patchValue(this.obtenerFecha(entidad.fecha));
              (<FormControl>this.formulario.controls['cvuConacyt'])
                .patchValue(entidad.cvuConacyt);
              (<FormControl>this.formulario.controls['numeroBeca'])
                .patchValue(entidad.numeroBeca);
              (<FormControl>this.formulario.controls['numeroApoyo'])
                .patchValue(entidad.numeroApoyo);
              this.changeFuenteApoyo(entidad.fuenteApoyo.id);

              if (this.registroSeleccionado.fuenteApoyo.id == 1) {
                //Fuente de apoyo COLSAN
                (<FormControl>this.formulario.controls['idBeca'])
                  .patchValue(entidad.beca.id);
                (<FormControl>this.formulario.controls['tipoBeca'])
                  .patchValue(entidad.beca.clasificacion.id);
                this.changeTipoApoyo(entidad.beca.clasificacion.id);
              }
              this.entidad = entidad;
            }
            this._spinner.stop('cargarDatosEditar');
          }
        );
    }
  }


  private changeTipoApoyo(tipo: number) {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idClasificacion.id~' + tipo + ':IGUAL');

    this._becaService.getListaBeca(
      this.erroresConsultas,
      urlSearch,
      false
    ).subscribe(
      response => {
        this.becas = [];
        response.json().lista.forEach((beca) => {
          this.becas.push(new Beca(beca));
        });
      }
    );
  }

  private changeFuenteApoyo(fuente) {
    if (fuente == 1) {
      //Fuente de apoyo COLSAN
      this.formulario.removeControl('numeroBeca');
      this.formulario.removeControl('numeroApoyo');
      this.formulario.removeControl('cvuConacyt');
      this.formulario.addControl('idFuenteApoyo', new FormControl(''));
      this.formulario.addControl('conceptoApoyo', new FormControl(''));
      this.formulario.addControl('cantidad', new FormControl(''));
      this.formulario.addControl('fecha', new FormControl(''));
      this.formulario.addControl('observaciones', new FormControl(''));
      this.formulario.addControl('idBeca', new FormControl(''));
      this.formulario.addControl('tipoBeca', new FormControl(''));
      this.formulario.addControl('idEstudiante', new FormControl(''));
    }else if (fuente == 2) {
      //Fuente de apoyo CONACYT
      this.formulario.addControl('idFuenteApoyo', new FormControl(''));
      this.formulario.removeControl('conceptoApoyo');
      this.formulario.removeControl('cantidad');
      this.formulario.removeControl('fecha');
      this.formulario.addControl('observaciones', new FormControl(''));
      this.formulario.removeControl('idBeca');
      this.formulario.removeControl('tipoBeca');
      this.formulario.addControl('numeroBeca', new FormControl(''));
      this.formulario.addControl('numeroApoyo', new FormControl(''));
      this.formulario.addControl('cvuConacyt', new FormControl(''));
      this.formulario.addControl('idEstudiante', new FormControl(''));
    }
  }

  private cerrarModalEditar(): void {
    this.formulario.reset();
    this.modal.close();
  }

  private enviarFormulario() {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log(jsonFormulario);
      if (this.edicionFormulario) {
        this.apoyoEconomicoService
          .putApoyoEconomico(
            this.registroSeleccionado.id,
            jsonFormulario,
            this.erroresConsultas
          ).subscribe(
          response => {},
          error => {
            console.error(error);
          },
          () => {
            this.onCambiosTabla();
            this.cerrarModalEditar();
          }
        );
      } else {
        this.apoyoEconomicoService
          .postApoyoEconomico(
            jsonFormulario,
            this.erroresConsultas
          ).subscribe(
          response => {},
          error => {
            console.error(error);
          },
          () => {
            this.onCambiosTabla();
            this.cerrarModalEditar();
          }
        );
      }
    }

  }

  private getControlEditarFormulario(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  private getControlErrorsEditarFormulario(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).
        valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private validarFormulario(): boolean {

    if(this.formulario.controls['idFuenteApoyo'].value == 1){
      //Fuente de apoyo COLSAN
      (<FormControl>this.formulario.controls['fuenteApoyo'])
        .patchValue('COLSAN');
        /*
      (<FormControl>this.formulario.controls['cvuConacyt'])
        .patchValue(' ');
      (<FormControl>this.formulario.controls['numeroBeca'])
        .patchValue(0);
      (<FormControl>this.formulario.controls['numeroApoyo'])
        .patchValue(0);*/
    }else if(this.formulario.controls['idFuenteApoyo'].value == 2){
      //Fuente de apoyo CONACYT
      (<FormControl>this.formulario.controls['fuenteApoyo'])
        .patchValue('CONACYT');
      /*(<FormControl>this.formulario.controls['conceptoApoyo'])
        .patchValue(' ');
      (<FormControl>this.formulario.controls['cantidad'])
        .patchValue(0);
      (<FormControl>this.formulario.controls['fecha'])
        .patchValue(null);
      (<FormControl>this.formulario.controls['idBeca'])
        .patchValue(0);
      (<FormControl>this.formulario.controls['tipoBeca'])
        .patchValue(0);*/
    }

    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
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

  private obtenerCatalogosModalAgregar(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    this.tiposBeca = this.clasificacionBecaService.getListaClasificacionBeca(
      this.erroresConsultas,
      urlSearch
    ).lista;
  }

  getDate(): string {
    if (this.fechaDP) {
      let fechaConFormato = moment(this.fechaDP).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fecha'])
        .setValue(fechaConFormato + ' 12:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  //TODO autocomplete
  //Autocomplete
  private isComplete: boolean = false;
  private matriculaSelAutocomplete: Estudiante;
  //private estudianteSelAutocomplete: Estudiante;

  protected searchStr2: string;
  protected opcions = [];
  idEstudiante;

  private autocompleteOnSelect(e) {
    this._spinner.start('auto');
    this.estudianteService.getEntidadEstudiante(
      e.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.matriculaSelAutocomplete = new Estudiante(response.json());
        this.idEstudiante = this.matriculaSelAutocomplete.id;
        this._spinner.stop('auto');
      },
      error => {
        this._spinner.stop('auto');
      },
      () => {
        this._spinner.stop('auto');
      }
    );
    ///
  }

  listaAlumnos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();

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
            this.estudiantes.push({"id": item.id, "name": (it.matricula.matriculaCompleta ?
              it.matricula.matriculaCompleta : '') + ' ' +
            it.getNombreCompleto()});
          });
        }
      },
      error => {
        console.error(error);
        this.isComplete = false;
      },
      () => {
        this.isComplete = false;
      }
    );
  }


  /*TODO INICIA modal agregar/editar apoyo economico---------------------------------*/



}
