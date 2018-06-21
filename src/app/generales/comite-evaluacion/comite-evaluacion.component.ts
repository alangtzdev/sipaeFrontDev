import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {DatePipe} from "@angular/common";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ComiteEvaluador} from "../../services/entidades/comite-evaluador.model";
import {Promocion} from "../../services/entidades/promocion.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ComiteEvaluadorService} from "../../services/entidades/comite-evaluador.service";
import {EvaluadorService} from "../../services/entidades/evaluador.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {Evaluador} from "../../services/entidades/evaluador.model";
import {AuthService} from "../../auth/auth.service";
import {UsuarioServices} from "../../services/usuario/usuario.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";
import {IntegranteNucleoAcademico} from "../../services/entidades/integrante-nucleo-academico.model";
import {errorMessages} from "../../utils/error-mesaje";
import {NucleoAcademicoBasico} from "../../services/entidades/nucleo-academico-basico.model";
import {NucleoAcademicoBasicoService} from "../../services/entidades/nucleo-academico-basico.service";
import { CompleterService, CompleterData } from 'ng2-completer';
import {IntegranteNucleoAcademicoService} from '../../services/entidades/integrante-nucleo-academico.service';



@Component({
  selector: 'app-comite-evaluacion',
  templateUrl: './comite-evaluacion.component.html',
  styleUrls: ['./comite-evaluacion.component.css']
})
export class ComiteEvaluacionComponent  {
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  @ViewChild('modalAgregarEditarComite')
  modalAgregarEditarComite :ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';
  idComiteEvaluador: number;
  entidadComiteEvaluador: ComiteEvaluador;
  registroSeleccionado: ComiteEvaluador;

  numeroProfesorComite: number;
  idProgramaUsr : number;
  registrosComite: Array<Evaluador>;
  idProfesorAgregar: number;
  estadoBoton: boolean = false;
  edicionFormulario: boolean = false;
  modalComite: FormGroup;
  disablePromoSelect: boolean = true;
  idNucleoAcademicoBasico;

  columnas2: Array<any> = [
    { titulo: 'Evaluadores', nombre: 'idProfesor', sort: false }
  ];
  registroSeleccionado2: Evaluador;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '' }
  };

  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;
//  private typeAheadEventEmitter = new Rx.Subject<string>();
  private isComplete: boolean = false;
  private profesorSelAutocomplete: IntegranteNucleoAcademico;
  private alertas: Array<Object> = [];
  private opcionesSelectCatalogo: Array<Promocion> = [];
  private programaDocente: Array<ProgramaDocente> = [];
  private evaluador: Array<ItemSelects> = [];
  private criterioSelectProgramaDocente: string = '';
  private criterioSelectPromocion: string = '';
  private cirteriosConsultaComites: string = '';
  private comiteEvaluador: ComiteEvaluador;

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];


  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  registros: Array<ComiteEvaluador> = [];
  registros2: Array<Evaluador> = [];
  usuarioRolService;
  programaDocenteService;
  promocionesService;
  catalogoServices;
  formulario: FormGroup;
  criteriosCabezera: string = '';
  botonBuscar: boolean = false;
  selectProgramaDocenteDeshabilitado: boolean = false;
  idProgramaDocenteUsr: number;
  idsPromocionesUtilizadas: Array<number> = [];

  columnas: Array<any> = [
    { titulo: 'Promoción', nombre: 'idProgramaDocente'},
    { titulo: 'Comité de evaluación', nombre: 'idPromocion', sort: false }
  ];

  private opcionesPromociones: Array<Promocion> = [];
  private opcionesProgramaDocente: Array<ItemSelects> = [];

  protected searchStr2: string;
  protected opcions = [];
  private integranteNucleoAutocomplet: IntegranteNucleoAcademico;

  constructor(
    private completerService: CompleterService,
    private elementRef: ElementRef,
    public nucleoAcademicoBasicoService: NucleoAcademicoBasicoService,
    private injector: Injector, private _renderer: Renderer,
    public _catalogosService: CatalogosServices,
    public comiteEvaluadorService: ComiteEvaluadorService,
    public evaluadorService: EvaluadorService,
    public usuarioService: UsuarioServices,
    public catalogoService: CatalogosServices,
    public  authService :AuthService,
    public spinner: SpinnerService,
    private integrantesNucleAcademicService: IntegranteNucleoAcademicoService
  ) {
    this.inicializarFormulario();
    this.prepareServices();
    this.formulario = new FormGroup({
      idPromocion: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl('', Validators.required),
    });
    this.obtenerCatalogoProgramaDocente();
    this.obtenerRolUsuarioLogeado(authService.getUsuarioLogueado().id);
//    this.onCambiosTabla2();
    this.onCambiosTabla();

  if(sessionStorage.getItem('comiteEvaluacion')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('comiteEvaluacionCriterios')){
        this.onCambiosTabla();
  }
  }

  obtenerRolUsuarioLogeado(idUsuario: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let usuarioRol;
    urlSearch.set('criterios', 'idUsuario.id~' + idUsuario + ':IGUAL');
    this.spinner.start("comiteevaluacion1");
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          usuarioRol = new UsuarioRoles (elemento);
        });
      },
      error => {
        this.spinner.stop("comiteevaluacion1");
      },
      () => {
        this.obtenerProgramaDocenteSiEsCoordinador(usuarioRol);
        this.spinner.stop("comiteevaluacion1");
      }
    );
  }

  obtenerProgramaDocenteSiEsCoordinador(usuarioRol: UsuarioRoles) {
    if (usuarioRol.rol.id === 2) {
      this.getProgramaUsuario();
      this.selectProgramaDocenteDeshabilitado = true;
    }
  }

  getProgramaUsuario(): void {
    this.spinner.start("comiteevaluacion2");
    this.usuarioService.getEntidadUsuario(
      this.authService.getUsuarioLogueado().id,
      this.erroresConsultas).
    subscribe(
      response => {
        if (response.json().id_programa_docente) {
          this.idProgramaDocenteUsr = response.json().id_programa_docente.id;
          this.idProgramaUsr = this.idProgramaDocenteUsr;
        }
      },
      error => {
        this.spinner.stop("comiteevaluacion2");
      },
      () => {
        this.spinner.stop("comiteevaluacion2");
        if (this.idProgramaDocenteUsr) {
          this.criteriosCabezera = 'idProgramaDocente~' + this.idProgramaDocenteUsr +
            ':IGUAL';
          (<FormControl>this.formulario.controls['idProgramaDocente']).
          setValue(this.idProgramaDocenteUsr);
          this.cambioProgramaDocenteFiltro(this.idProgramaDocenteUsr);
          this.onCambiosTabla();
        }
      }
    );
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    this.opcionesPromociones = [];
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente.id~' + idProgramaDocente + ':IGUAL;AND,idEstatus~1235:NOT');
    //urlParameter.set('criterios', 'idProgramaDocente.id~' + 9 + ':IGUAL');
    this.promocionesService.getListaPromocionesPag(this.erroresConsultas, urlParameter)
      .subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.opcionesPromociones.push(new Promocion(item));
          });
          // console.log('opcionesPromicionest', this.opcionesPromociones);
        },
      );
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number
  ): void {
  this.limpiarVariablesSession(); 
    this.criteriosCabezera = '';
    if (idProgramaDocente) {
      this.criteriosCabezera = this.criteriosCabezera + 'idProgramaDocente.id~'
        + idProgramaDocente + ':IGUAL';
    }
    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + ',idPromocion.id~'
        + idPromocion + ':IGUAL';
    }
    // console.log('idProgramaDocente', idProgramaDocente);
    // console.log('citeriosCabezera', this.criteriosCabezera);
    sessionStorage.setItem('comiteIdPromocion', idProgramaDocente.toString());
    sessionStorage.setItem('comiteIdProgramaDocente', idPromocion.toString());
    this.onCambiosTabla();  }


  sortChanged(columna): void {
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

  onCambiosTabla2(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idComiteEvaluador~' + this.idComiteEvaluador + ':IGUAL';
    urlSearch.set('criterios', criterio);

    this.registros2 =
      this.evaluadorService.getListaEvaluador(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';


    if (!sessionStorage.getItem('comiteEvaluacionCriterios')) {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE';
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

    sessionStorage.setItem('comiteEvaluacionCriterios', criterios);
    sessionStorage.setItem('comiteEvaluacionOrdenamiento', ordenamiento);
    sessionStorage.setItem('comiteEvaluacionLimite', this.limite.toString());
    sessionStorage.setItem('comiteEvaluacionPagina', this.paginaActual.toString());
}

    this.limite = +sessionStorage.getItem('comiteEvaluacionLimite') ? +sessionStorage.getItem('comiteEvaluacionLimite') : this.limite;
    this.paginaActual = +sessionStorage.getItem('comiteEvaluacionPagina') ? +sessionStorage.getItem('comiteEvaluacionPagina') : this.paginaActual;
   
    urlSearch.set('criterios', sessionStorage.getItem('comiteEvaluacionCriterios')
     ? sessionStorage.getItem('comiteEvaluacionCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('comiteEvaluacionOrdenamiento') 
    ? sessionStorage.getItem('comiteEvaluacionOrdenamiento') : ordenamiento);
    urlSearch.set('limit',this.limite.toString());
    urlSearch.set('pagina',this.paginaActual.toString());





    this.comiteEvaluadorService.getListaComiteEvaluador(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        this.idsPromocionesUtilizadas = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.setPaginacion(new PaginacionInfo(
            paginacionInfoJson.registrosTotales,
            paginacionInfoJson.paginas,
            paginacionInfoJson.paginaActual,
            paginacionInfoJson.registrosPagina
        ));
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new ComiteEvaluador(item));
          this.idsPromocionesUtilizadas.push(item.id_promocion.id);
        });
        this.spinner.stop("comiteevaluacion3");
      },
      error => {
        console.error(error);
        this.spinner.stop("comiteevaluacion3");
      },
      () => {
        //console.log('paginacionInfo', this.paginacion);
        //console.log('registros', this.registros);
        this.spinner.stop("comiteevaluacion3");
      }
    );

  }

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    //console.log('evento', evento);
    //console.log('Page changed to: ' + evento.page);
    //console.log('Number items per page: ' + evento.itemsPerPage);
    //console.log('paginaActual', this.paginaActual);
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;

  }
  getPaginacion() {
    return this.paginacion;
  }

  /*  modalFormulario(modo): void {
   //console.log(modo);
   let idComiteEvaluador: number;
   if (modo === 'editar' && this.registroSeleccionado) {
   idComiteEvaluador = this.registroSeleccionado.id;
   }
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('lg', true, 27);
   let modalFormularioData = new ModalAgregarComiteData(
   this,
   this.idProgramaDocenteUsr,
   idComiteEvaluador
   );

   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: modalFormularioData }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>ModalAgregarComite,
   bindings,
   modalConfig
   );
   }

   */

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
    if (this.registros.length > 0) {
      this.limite = Number(limite);
      this.onCambiosTabla();
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

  mostarBotones(): boolean {
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

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  private obtenerCatalogoProgramaDocente(): void {
    this.opcionesProgramaDocente =
      this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas);
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
    this.promocionesService = this._catalogosService.getPromocion();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.catalogoServices = this.catalogoService;
  }

  obtenerdetalle() {
    this.spinner.start('obtenerDetalle');
    this.comiteEvaluadorService
      .getEntidadComiteEvaluador(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadComiteEvaluador
          = new ComiteEvaluador(response.json());
      },
      error => {
        this.spinner.stop('obtenerDetalle');
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
        this.spinner.stop('obtenerDetalle');
        //console.log(this.entidadComiteEvaluador);
      }
    );
    this.modalDetallesComite();
  }

  modalDetallesComite(): void {
    this.idComiteEvaluador = this.registroSeleccionado.id;
    this.onCambiosTabla2();
    this.modalDetalle.open();
  }

  cerrarModal(): void {
    this.idComiteEvaluador = undefined;
    this.modalDetalle.close();
  }

  modalFormulario(modo): void {
    this.modalAgregarEditarComite.open();
  }

  cerrarModalFormulario(): void {
    this.opcions = [];
    this.idComiteEvaluador = undefined;
    this.modalAgregarEditarComite.close();
  }

  ///////////////MODAL CRUD///////////////////////

  obetenercrud(modo) {
    ///this.modalComite.reset();
    this.opcionesSelectCatalogo = [];
    this.getControl('idPromocion').setValue("");
    // this.prepareServices();
    this.cargarCatalogosSelects();
    if (modo == 'editar') {
      this.getControl('idPromocion').disable();
      this.idComiteEvaluador = this.registroSeleccionado.id;
      this.listaProfesores();
      this.obtenerYMostrarInformacionComite();
      this.onCambiosTabla3();
    } else {
      // console.log('entre a else');
      this.getControl('idPromocion').enable();
      this.edicionFormulario = false;
      this.disablePromoSelect = true;
    }
    this.modalAgregarEditarComite.open('lg');
  }

  enviarFormularioComite(): void {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.modalComite.value, null, 2);
      if (this.edicionFormulario) {
        this.spinner.start('actualizar');
        this.comiteEvaluadorService
          .putComiteEvaluador(
            this.idComiteEvaluador,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          error => { this.spinner.stop('actualizar'); },
          () => {
            this.spinner.stop('actualizar');
            this.onCambiosTabla();
            this.cerrarModalFormulario();
          }
        );
      } else {
        this.verificarYCrearComite();
      }
    }
  }

  agregarEvaluador(): void {
    //JSON.stringify(this.modalComite.value, null, 2);
    let jsonFormulario = '{"idComiteEvaluador": "' + this.idComiteEvaluador +
      '", "idProfesor": "' + this.profesorSelAutocomplete.profesor.id + '"}';
    this.spinner.start('agregarEvaluador');
    this.evaluadorService
      .postEvaluador(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
      () => {
        //console.log('Success'),
      },
      error => { this.spinner.stop('agregarEvaluador'); },
      () => {
        this.spinner.stop('agregarEvaluador');
        this.onCambiosTabla3();
      }
    );
    this.estadoBoton = false;
    this.evaluador = [];
    this.profesorSelAutocomplete = null;
//    document.getElementById('agregarProfesor').value = '';

    /*this.evaluador =
     this.catalogoServices
     .getProfesor().getSelectProfesor(this.erroresConsultas);*/
  }

  rowSeleccionado3(registro): boolean {
    return (this.registroSeleccionado2 === registro);
  }

  rowSeleccion3(registro): void {
    if (this.registroSeleccionado2 !== registro) {
      this.registroSeleccionado2 = registro;
    } else {
      this.registroSeleccionado2 = null;
    }
  }

  onCambiosTabla3(): void {

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = '';

    if (this.idComiteEvaluador) {
      criterio = 'idComiteEvaluador.id~' + this.idComiteEvaluador + ':IGUAL';
    }

    urlSearch.set('criterios', criterio);

    this.registros2 =
      this.evaluadorService.getListaEvaluador(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  setLimite3(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla3();
  }

  ngOnInit(): void {
    /// this.onCambiosTabla3();
  }

  sortChanged2(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla3();
    }
  }

  eliminarEvaluador () {
    //console.log('Eliminando...');
    this.evaluadorService.deleteProfesor(
      this.registroSeleccionado2.id,
      this.erroresConsultas
    ).subscribe(
      () => {}, //console.log('Success'),
      console.error,
      () => {
        this.onCambiosTabla3();
      }
    );
    this.estadoBoton = null;
    /*this.evaluador =
     this.catalogoServices
     .getProfesor().getSelectProfesor(this.erroresConsultas);
     */
  }

  validarFormulario(): boolean {
    if (this.modalComite.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.modalComite.controls[campo]);
  }

  mostarBotones3(): boolean {
    if (this.registroSeleccionado2) {
      return true;
    }else {
      return false;
    }
  }

  //Validación de profesores que ya estan agregados al comite

  mostrarBotonAgregar(): boolean {
    return this.estadoBoton;
  }

  getIdProfesorSelect(idProfesor): void {
    this.estadoBoton = false;
    if (idProfesor) {
      this.idProfesorAgregar = idProfesor;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idProfesor~' + this.idProfesorAgregar + ':IGUAL' +
        ',idComiteEvaluador~' + this.idComiteEvaluador +
        ':IGUAL'); // 1004 id del catalogo de estatus

      this.catalogoService.getEvaluador().getLsitaEvaluadorPag(this.erroresConsultas,
        urlParameter).subscribe(
        response => {
          this.registrosComite = [];
          let respuesta = response.json();
          respuesta.lista.forEach((item) => {
            this.registrosComite.push(new Evaluador(item));
          });
          this.numeroProfesorComite = this.registrosComite.length;
          //console.log('TAMAÑO' + this.registrosComite.length);
        },
        error => {
          console.error(error);
        },
        () => {
          if (this.numeroProfesorComite < 1) {
            this.estadoBoton = true;
          }else {
            this.estadoBoton = false;
          }
        }
      );
    }else {
      this.estadoBoton = false;
    }
  }

  filtroChanged2sortChanged(filtroTexto): void {
    this.estadoBoton = false;
    this.configuracion.filtrado.textoFiltro = filtroTexto;
//    this.typeAheadEventEmitter.next(filtroTexto);
  }

  filter(urlParameter: URLSearchParams) : void {
    this.catalogoServices
      .getIntegrantesNAB().getListaIntegrantesNucleoAcademicoPag(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        //console.log(response.json());
        if (response.json().lista) {
          this.evaluador = [];
          response.json().lista.forEach((item) => {
            this.evaluador.push(
              new ItemSelects(new IntegranteNucleoAcademico(item).id,
                new IntegranteNucleoAcademico(item).profesor.nombre + ' ' +
                new IntegranteNucleoAcademico(item).profesor.primerApellido + ' ' +
                new IntegranteNucleoAcademico(item).profesor.segundoApellido));
          });
        }
      },
      error => {
        console.error(error);
        this.spinner.stop("modalagregar5");
        this.isComplete = false;
      },
      () => {
        //console.log(this.evaluador);
        this.spinner.stop("modalagregar5");
        this.isComplete = false;
      }
    );
  }

  private inicializarFormulario(): void {
    this.modalComite = new FormGroup({
      idPromocion: new FormControl('', Validators.required),
      idProgramaDocente: new FormControl(this.idProgramaUsr, Validators.required),
      idComiteEvaluador: new FormControl(),
      idProfesor: new FormControl(),
    });
  }

  private obtenerYMostrarInformacionComite(): void {
    this.edicionFormulario = true;
    this.spinner.start("modalagregar4");
    this.comiteEvaluadorService
      .getComiteEvaluador(
        this.idComiteEvaluador,
        this.erroresConsultas
      ).subscribe(
      // response es la respuesta correcta(200) del servidor
      // se convierte la respuesta a JSON,
      // se realiza la convercion del json a una entidad
      // de tipo ClasificacionPreguntasFrecuentes
      response =>
        this.comiteEvaluador = new ComiteEvaluador(
          response.json()),
      // en caso de presentarse un error se agrega un nuevo error al array errores
      error => {
        this.spinner.stop("modalagregar4");
        console.error(error);
      },
      // assertionsEnabled() evalua si estamos en modo Produccion o Desarrollo
      // al finalizar correctamente la ejecucion se muestra en consola el resultado
      () => {
        //console.log(this.comiteEvaluador);
        if (this.modalComite) {
          this.mostrarInformacionDelComite();
          this.obtenerNucleoAcademico();
          this.cargarSelectPromocion();
        }
        this.spinner.stop("modalagregar4");
      }
    );
  }

  private mostrarInformacionDelComite(): void {
    let stringPromocion = 'idPromocion';
    let stringProgramaDocente = 'idProgramaDocente';
    (<FormControl>this.modalComite.controls[stringPromocion])
      .setValue(this.comiteEvaluador.promocion.id);
    (<FormControl>this.modalComite.controls[stringProgramaDocente])
      .setValue(this.comiteEvaluador.programaDocente.id);
    (<FormControl>this.modalComite.controls['idComiteEvaluador'])
      .setValue(this.comiteEvaluador.id);
    //console.log(this.modalComite);
  }

  private obtenerNucleoAcademico(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idProgramaDocente~' +
      this.comiteEvaluador.programaDocente.id + ':IGUAL';
    urlSearch.set('criterios', criterios);

    //Obtener el id del nucleo academico basico
    //console.log(criterios);
    this.nucleoAcademicoBasicoService.getListaNucleoAcademicoBasico(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      // response es la respuesta correcta(200) del servidor
      // se convierte la respuesta a JSON,
      // se realiza la convercion del json a una entidad
      // de tipo ClasificacionPreguntasFrecuentes
      response => {
        //console.log(response.json());
        response.json().lista.forEach((nab) => {
          this.idNucleoAcademicoBasico =
            new NucleoAcademicoBasico(nab).id;
          //console.log(this.idNucleoAcademicoBasico);
        });

      }
    );
  }

  private autocompleteOnSelect(e: any) {
    // console.log('e', e);
    this.spinner.start("modalagregar3");
    this.catalogoService.getIntegrantesNAB().getIntegranteNucleoAcademico(
      e.id,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.profesorSelAutocomplete = new IntegranteNucleoAcademico(response.json());
        this.getIdProfesorSelect(this.profesorSelAutocomplete.profesor.id);
      },
      error => {
        console.error(error);
        this.spinner.stop("modalagregar3");
      },
      () => {
        // console.log(this.profesorSelAutocomplete);

        this.spinner.stop("modalagregar3");
      }
    );
    this.spinner.stop("modalagregar3");
  }

  private cargarCatalogosSelects(): void {
    this.cargarSelectProgramaDocente();
  }

  private cargarSelectProgramaDocente(): void {
    this.crearCriterio();

    if (this.hasRol('COORDINADOR')) {
      this.crearCriterioCoordinacion();
    }
    this.establecerIdProgramaDocenteSelect('0');
    this.obtenerRegistrosProgramaDocente();

  }

  private cargarSelectPromocion(): void {
    this.vaciarRegistrosSelectPromocion();
    this.crearCriterioSelectPromocion();
    this.obtenerRegistrosPromocion();
  }

  private verificarYCrearComite(): void {
    this.crearCriterioConsultaComites();
    this.obtenerPorPromiconYCrearRegistrosComites();

  }

  private crearCriterio(): void {
    this.criterioSelectProgramaDocente = 'idEstatus~1007:IGUAL';
  }

  private crearCriterioCoordinacion(): void {
    this.criterioSelectProgramaDocente = 'id~' +
      this.idProgramaUsr + ':IGUAL;AND,' +
      'idEstatus~1007:IGUAL;AND';
  }

  private crearCriterioSelectPromocion(): void {
    this.criterioSelectPromocion = 'idProgramaDocente~' +
      this.obtenerIdProgramaDocenteElegido() + ':IGUAL;AND';
  }

  private crearCriterioConsultaComites(): void {
    this.cirteriosConsultaComites = 'idPromocion~' +
      this.obtenerIdPromocionElegida() + ':IGUAL';
  }

  private obtenerRegistrosProgramaDocente(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', this.criterioSelectProgramaDocente);
    this.programaDocente = [];
    this.catalogoServices.getCatalogoProgramaDocente().
    getListaProgramaDocente(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.programaDocente.push(new ProgramaDocente(item));
        });
      },
      error => {

      },
      () => {
        if (this.hasRol('COORDINADOR')) {
          this.establecerIdProgramaDocenteSelect(this.idProgramaUsr);
          this.cargarSelectPromocion();
        }
      }
    );
  }

  private obtenerRegistrosPromocion(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', this.criterioSelectPromocion);
    this.catalogoServices.getPromocion().getListaPromocionesPag(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.opcionesSelectCatalogo.push(new Promocion(item));
        });
      }
    );
    this.disablePromoSelect = false;
  }

  private obtenerPorPromiconYCrearRegistrosComites(): void {
    let tamanoRegistro: number = 0;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', this.cirteriosConsultaComites);
    this.spinner.start("modalagregar2");
    this.comiteEvaluadorService.getListaComiteEvaluador(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        tamanoRegistro = response.json().lista.length;
      },
      error => {this.spinner.stop("modalagregar2"); },
      () => {
        this.spinner.stop("modalagregar2");
        if (tamanoRegistro > 0) {
          this.addMensajeAlert('Ya hay comites con esa promoción');
        } else {
          this.postComiteEvaluador();
        }
      }
    );
  }

  private postComiteEvaluador(): void {
    let jsonFormulario = JSON.stringify(this.modalComite.value, null, 2);
    this.spinner.start("modalagregar1");
    // console.log('jsonFormuario psotComite', jsonFormulario);
    this.comiteEvaluadorService
      .postComiteEvaluador(
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
      () => {this.spinner.stop("modalagregar1"); }, //console.log('Success'),
      console.error,
      () => {
        this.spinner.stop("modalagregar1");
        this.onCambiosTabla();
        this.cerrarModalFormulario();
      }
    );
  }

  private getControlErrors3(campo: string): boolean {
    if (!(<FormControl>this.modalComite.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  private hasRol(rol: string): boolean {
    return this.authService.hasRol(rol);
  }

  private establecerIdProgramaDocenteSelect(id): void {
    this.getControl('idProgramaDocente').setValue(id);
  }

  private obtenerIdProgramaDocenteElegido(): number {
    return this.getControl('idProgramaDocente').value;
  }

  private obtenerIdPromocionElegida(): number {
    return this.getControl('idPromocion').value;
  }

  private vaciarRegistrosSelectPromocion(): void {
    this.opcionesSelectCatalogo = [];
  }

  private addMensajeAlert(mensaje: String) {
    this.alertas.push({
      type: 'danger',
      msg: mensaje,
      closable: true
    });
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  private listaProfesores(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.spinner.start('filter');
    this.integrantesNucleAcademicService.
    getListaIntegrantesNucleoAcademicoPag(this.erroresConsultas, urlParameter).subscribe(
        response => {
          let items = response.json().lista;
          if (items) {
            this.opcions = [];
            items.forEach((item) => {
              let it = new IntegranteNucleoAcademico(item);
              if (it.profesor) {
                // console.log('it', it);
                this.opcions.push({"id": item.id, "name": it.profesor.nombre + ' ' +
                  it.profesor.primerApellido + ' ' +
                  (it.profesor.segundoApellido ? it.profesor.segundoApellido : '')
                });
              }
            });
          }
        },
        error => {

          this.spinner.stop('filter');
          this.isComplete = false;
        },
        () => {
          this.spinner.stop('filter');
          this.isComplete = false;
        }
    );
  }

limpiarVariablesSession() {
    sessionStorage.removeItem('comiteEvaluacionCriterios');
    sessionStorage.removeItem('comiteEvaluacionOrdenamiento');
    sessionStorage.removeItem('comiteEvaluacionLimite');
    sessionStorage.removeItem('comiteEvaluacionPagina');
  }

}



