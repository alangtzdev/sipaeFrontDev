import { Component, OnInit, ElementRef, Injector, Renderer, ViewChild } from '@angular/core';
import { Profesor } from "../../services/entidades/profesor.model";
import { ProfesorRevisionTrabajo } from "../../services/entidades/profesor-revision-trabajo.model";
import { PaginacionInfo } from "../../services/core/pagination-info";
import { ItemSelects } from "../../services/core/item-select.model";
import { CatalogosServices } from "../../services/catalogos/catalogos.service";
import { SpinnerService } from "../../services/spinner/spinner/spinner.service";
import { URLSearchParams } from "@angular/http";
import { Promocion } from "../../services/entidades/promocion.model";
import { UsuarioSesion } from "../../services/usuario/usuario-sesion";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ModalComponent } from "ng2-bs3-modal/components/modal";
import { ErrorCatalogo } from "../../services/core/error.model";
import { AuthService } from "../../auth/auth.service";
import { PeriodoEscolar } from "../../services/entidades/periodo-escolar.model";
import { PromocionPeriodoEscolar } from "../../services/entidades/promocion-periodo-escolar.model";
//import {ListaTrabajosRecuperacion} from "../lista-trabajos-recuperacion";
import {Validacion} from "../../utils/Validacion";

@Component({
  selector: 'app-trabajo-recuperacion-recursos',
  templateUrl: './trabajo-recuperacion-recursos.component.html',
  styleUrls: ['./trabajo-recuperacion-recursos.component.css']
})

export class TrabajoRecuperacionRecursosComponent {

  solicitudExamenTrabajo;
  
  trabajosRecuperacionService;
  programaDocenteService;
  periodoEscolarService;
  promocionService;
  profesorService;

  //Add Variables
  mensajeErrors: any = { 'required': 'Este campo es requerido'};
  validacionActiva: boolean = false;
  profesorRevisionTrabajo: ProfesorRevisionTrabajo;
  cambiarEstatusSolicitud: boolean = false;
  solicitudService;
  formularioCalificacionesRecuperacion: FormGroup;
  //End Variables
    selectPromo: boolean = true;
    selectPerio: boolean = true;
    botonBuscar: boolean = true;
  mostrarBotonRegistro: boolean = false;
  criteriosCabezera: string = '';
  usuarioLogueado: UsuarioSesion;
  profesor: Profesor;
  registros: Array<ProfesorRevisionTrabajo> = [];
  registrosAlumnoSeleccionado: Array<ProfesorRevisionTrabajo> = [];
  registroSeleccionado: ProfesorRevisionTrabajo;
  columnas: Array<any> = [
    { titulo: 'Matrícula del estudiante', nombre: 'idSolicitudExamenTrabajo.idEstudiante.idMatricula.matriculaCompleta'},
    { titulo: 'Nombre del estudiante*', nombre: 'idSolicitudExamenTrabajo.idEstudiante.idDatosPersonales.primerApellido'},
    { titulo: 'Clave de materia', nombre: 'idSolicitudExamenTrabajo.idMateria.idMateria.clave',sort:false},
    { titulo: 'Materia', nombre: 'idSolicitudExamenTrabajo.idMateria.idMateria.descripcion',sort:false},
    { titulo: 'Estatus', nombre: 'idEstatus.value',sort:false},
  ];

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  maxSizePags: number = 5;
  limite: number = 10;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idSolicitudExamenTrabajo.idEstudiante.idDatosPersonales.nombre,' +
    'idSolicitudExamenTrabajo.idEstudiante.idDatosPersonales.primerApellido,' +
    'idSolicitudExamenTrabajo.idEstudiante.idDatosPersonales.segundoApellido' }
  };

  opcionSelectProgramaDocente: Array<ItemSelects> = [];
  opcionSelectPeriodoEscolar: Array<ItemSelects> = [];
  opcionSelectPromocion: Array<ItemSelects> = [];

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  constructor(
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              public catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              private _authService: AuthService,
              //public listaTrabajosRecuperacion: ListaTrabajosRecuperacion

              ) {
    this.prepareServices();
    this.obtenerProgramasDocentes();
    this.usuarioLogueado = this._authService.getUsuarioLogueado();
    this.obtenerProfesor();
//Add Code
      this.solicitudService = this.catalogosService.getSolicitudExamenTrabajoService();
//End Code

//Add Forms
    this.formularioCalificacionesRecuperacion = new FormGroup({
      calificacionDefinitiva: new FormControl('', Validators.compose([Validacion.calificacionValidator, Validators.required])),
      idEstatus: new FormControl(1225),
      comentariosEvaluacion: new FormControl('', Validators.required)
    });
//End Forms

  }

  ngOnInit(): void {
  }
  obtenerProfesor(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario.id~' + this.usuarioLogueado.id + ':IGUAL');
    this.profesorService.getListaProfesor(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        if (response.json().lista.length  > 0)
          this.profesor = new Profesor(response.json().lista[0]);
        this.onCambiosTabla();
      }
    );

  }

     onCambiosTabla(): void {
        this.registroSeleccionado = null;
        this.mostrarBotonRegistro = false;
        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterios = '';
        criterios = 'idSolicitudExamenTrabajo.id~0:NOT,' + 'idProfesor.id~' + this.profesor.id + ':IGUAL';
        urlSearch.set('criterios', criterios);

        if (this.criteriosCabezera !== '') {
            criterios = criterios + ';ANDGROUPAND,' + this.criteriosCabezera;
            //urlSearch.set('criterios', criterios);
        }

        if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
            let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
            criterios = criterios + ';ANDGROUPAND';
            filtros.forEach((filtro) => {
                criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
                    this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
                //console.log('cirterios en el forEach: ' + criterios);
            });
            //urlSearch.set('criterios', criterios);
        }

        urlSearch.set('criterios', criterios);
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
        console.log('url', urlSearch);
        this._spinner.start("_OnCambiosTabla");
        this.trabajosRecuperacionService.getListaProfesorRevisionTrabajo(
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
                    this.registros.push(new ProfesorRevisionTrabajo(item));
                });
            },
            error => {
                this._spinner.stop("_OnCambiosTabla");
                    console.error(error);
            },
            () => {
                this._spinner.stop("_OnCambiosTabla");
            }
        );
}



/**/
/*  modalCapturarCalificaciones(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new RegistroCalificacionesRecupracionData(this) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>RegistroCalificacionesRecupracion,
      bindings,
      modalConfig
    );
  }*/

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      if (this.registroSeleccionado.estatus.id != 1225)
        this.mostrarBotonRegistro = true;
    } else {
        this.mostrarBotonRegistro = false;
        this.registroSeleccionado = null;
    }
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

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

/*  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }
*/

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

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltro(): void {
    this.configuracion.filtrado.textofiltro = '';
  }

  obtenerProgramasDocentes(): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    let nivelEstudios = 'Licenciatura';
    paramUrl.set('criterios','idNivelEstudios.descripcion~'+nivelEstudios+':IGUAL');
    this.programaDocenteService.getListaProgramaDocente(
      this.erroresConsultas,
      paramUrl
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.opcionSelectProgramaDocente = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.opcionSelectProgramaDocente.push(
            new ItemSelects(item.id,item.descripcion)
          );
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('Programas docente', this.opcionSelectProgramaDocente);
        }*/
      }
    );
  }

  obtenerPromociones(idProgramaDocente: number): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    let ordenamiento = 'id:DESC';
    let criterios = 'idProgramaDocente.id~'+idProgramaDocente+':IGUAL;AND,idEstatus~1235:NOT';
    paramUrl.set('ordenamiento',ordenamiento);
    paramUrl.set('criterios',criterios);
    //console.log("URL",paramUrl);
    this.promocionService.getListaPromocionesPag(
      this.erroresConsultas,
      paramUrl
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.opcionSelectPromocion = [];
        paginacionInfoJson.lista.forEach((item) => {
          var promocion = new Promocion(item);
          var clavePromocion = promocion.getClavePromocion();
          this.opcionSelectPromocion.push(
            new ItemSelects(item.id,clavePromocion)
          );
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
          this.selectPromo = false;
          this.selectPerio = true;
          this.botonBuscar = true;
/*        if (assertionsEnabled()) {
          //console.log('Promociones', this.opcionSelectPromocion);
        }*/
      }
    );
  }
  habilitarBotonBuscar(periodo): void {
      if (periodo !== ''){
          this.botonBuscar = false;
      } else {
          this.botonBuscar = true;
      }
  }

  obtenerPeriodosEscolares(idPromocion: number): void {
    let paramUrl: URLSearchParams = new URLSearchParams;
    // let ordenamiento = 'numSemestre:ASC';/**/
     let ordenamiento = '';
    let criterios = 'idPromocion~'+idPromocion+':IGUAL';
    paramUrl.set('ordenamiento',ordenamiento);
    paramUrl.set('criterios',criterios);
    //console.log("URL",paramUrl);
    let itemPeriodoEscolar;/**/
    this.periodoEscolarService.getListaPromocionPeriodoEscolarPaginacion(
      this.erroresConsultas,
      paramUrl
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.opcionSelectPeriodoEscolar = [];
        //console.log("INFO",paginacionInfoJson);
        paginacionInfoJson.lista.forEach((item) => {
          itemPeriodoEscolar = new PromocionPeriodoEscolar(item);/**/
          this.opcionSelectPeriodoEscolar.push(
            new ItemSelects(
              itemPeriodoEscolar.idPeriodoEscolar.id,
              itemPeriodoEscolar.idPeriodoEscolar.getPeriodo())/**/
          )
        });
      },
      error => {

      },
      () => {
          this.selectPerio = false;
          this.botonBuscar = true;
      }
    );
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPeriodoEscolar: number,
    idPromocion: number
  ): void {
    this.criteriosCabezera = '';
    if (idProgramaDocente && idPeriodoEscolar && idPromocion) {
      this.criteriosCabezera = 'idSolicitudExamenTrabajo.idMateria.idMateria.idProgramaDocente.id~' + idProgramaDocente + ':IGUAL,' +
        'idSolicitudExamenTrabajo.idMateria.idPeriodoEscolar.id~' + idPeriodoEscolar + ':IGUAL,' +
        'idSolicitudExamenTrabajo.idMateria.idPromocion.id~' + idPromocion + ':IGUAL';
    }
    //console.log('criteriosCabezera', this.criteriosCabezera);
    this.onCambiosTabla();
  }

  private prepareServices(): void {
    this.trabajosRecuperacionService = this.catalogosService.getProfesorRevisionTrabajoService();
    this.programaDocenteService = this.catalogosService.getCatalogoProgramaDocente();
    this.promocionService = this.catalogosService.getPromocion();
    this.periodoEscolarService = this.catalogosService.getPromocionPeriodoEscolarService();
    this.profesorService = this.catalogosService.getProfesor();
  }

//Add Class RegistroCalificacionesRecupracion

  validarFormulario(): boolean {
    if (this.formularioCalificacionesRecuperacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  definirStatusSolicitud(): void {
    //console.log(this.registros);
    for (let i=0; this.registrosAlumnoSeleccionado.length > i; i++) {
      if (this.registrosAlumnoSeleccionado[i].estatus.id == 1225) {
        this.cambiarEstatusSolicitud = true;
      }
    }
  }



  buscarTrabajos(): void {

    if(this.registroSeleccionado){
let criterios = 'idSolicitudExamenTrabajo.id~'+this.profesorRevisionTrabajo.solicitudExamenTrabajo.id+':IGUAL';
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', criterios);
    this.trabajosRecuperacionService.getListaProfesorRevisionTrabajo(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registrosAlumnoSeleccionado = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.registrosAlumnoSeleccionado.push(new ProfesorRevisionTrabajo(item));
        });
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {

        }*/
        this.definirStatusSolicitud();
      }
    );
    }
    
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this._spinner.start("RecursosTrabajoRecuperacion");
      let jsonFormulario = JSON.stringify(this.formularioCalificacionesRecuperacion.value, null, 2);
      this.trabajosRecuperacionService
        .putProfesorRevisionTrabajo(
          this.registroSeleccionado.id,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.changeEstatusSolicitud();
          this.closemodalRegistroCalificacionesRecuperacion();
          this._spinner.stop("RecursosTrabajoRecuperacion");
        }
      );
    }
  }

  changeEstatusSolicitud(): void {
    if (this.cambiarEstatusSolicitud) {
      let formulario: FormGroup;
      formulario = new FormGroup({
        idEstatus: new FormControl(1225)
      });
      let jsonFormulario = JSON.stringify(formulario.value, null, 2);
      this.solicitudService
        .putSolicitudExamenTrabajo(
          this.profesorRevisionTrabajo.solicitudExamenTrabajo.id,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        () => {}, //console.log('Success CHANGE'),
        console.error,
        () => {
        }
      );
    }
    this.onCambiosTabla();
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioCalificacionesRecuperacion.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioCalificacionesRecuperacion.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
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

//End Class

//Add Modals
  @ViewChild('modalRegistroCalificacionesRecuperacion')
  modalRegistroCalificacionesRecuperacion: ModalComponent;
  openmodalRegistroCalificacionesRecuperacion(): void {
    this.profesorRevisionTrabajo = this.registroSeleccionado;
    this.buscarTrabajos();
    this.modalRegistroCalificacionesRecuperacion.open('lg');}
  closemodalRegistroCalificacionesRecuperacion(): void {
    this.modalRegistroCalificacionesRecuperacion.close();}
//End Modals

}
