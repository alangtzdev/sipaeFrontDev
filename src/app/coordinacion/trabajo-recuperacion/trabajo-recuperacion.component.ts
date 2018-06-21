import { Component, OnInit, ElementRef, Injector, Renderer, ViewChild } from '@angular/core';
import { PaginacionInfo } from "../../services/core/pagination-info";
import { SolicitudExamenTrabajo } from "../../services/entidades/solicitud-examen-trabajo.model";
import { ItemSelects } from "../../services/core/item-select.model";
import { Promocion } from "../../services/entidades/promocion.model";
import { PromocionPeriodoEscolar } from "../../services/entidades/promocion-periodo-escolar.model";
import { UsuarioRoles } from '../../services/usuario/usuario-rol.model';
import { Router } from "@angular/router";
import { ErrorCatalogo } from "../../services/core/error.model";
import { CatalogosServices } from "../../services/catalogos/catalogos.service";
import { SolicitudExamenTrabajoService } from "../../services/entidades/solicitud-examen-trabajo.service";
import { ProfesorRevisionTrabajoService } from "../../services/entidades/profesor-revision-trabajo.service";
import { SpinnerService } from "../../services/spinner/spinner/spinner.service";
import { URLSearchParams } from "@angular/http";
import { AuthService } from "../../auth/auth.service";
import { ModalComponent } from "ng2-bs3-modal/components/modal";
import { Profesor } from "../../services/entidades/profesor.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { UsuarioSesion } from "../../services/usuario/usuario-sesion";
import {Validacion} from "../../utils/Validacion";
import {ProfesorRevisionTrabajo} from "../../services/entidades/profesor-revision-trabajo.model";

@Component({
  selector: 'app-trabajo-recuperacion',
  templateUrl: './trabajo-recuperacion.component.html',
  styleUrls: ['./trabajo-recuperacion.component.css']
})

export class TrabajoRecuperacionComponent implements OnInit {
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  // ********* select & variables***** //
  registros: Array<SolicitudExamenTrabajo> = [];
  registroSeleccionado: SolicitudExamenTrabajo;
  listaProgramas: Array<ItemSelects> = [];
  listaPromociones: Array<Promocion> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  criteriosCabezera: string = '';
  oculto: boolean = true;
  usuarioRol: UsuarioRoles;
  botonBuscar: boolean = false;

  // Add Variables
  formularioSeleccionarProfesor: FormGroup;
  formulario: FormGroup;
  validacionActiva_SeleccionarProfesor: boolean = false;
  listaProfesores: Array<Profesor> = [];
  formularioConfirmarAtenderTrabajoRecuperacion: FormGroup;
  validacionActiva_ConfirmarAtenderTrabajoRecuperacion: boolean = false;
  public idProfesor: string;
  mensajeErrors: any = { 'required': 'Este campo es requerido' };

  // End Variables

  // ********* services ***** //
  catalogoServices;
  programaDocenteService;
  promocionesService;
  periodoEscolarService;
  materiaImpartidaService;
  promocionPeriodoService;
  profesorService;
  usuarioRolService;
  criterioPrograma: string = '';
  criterioPeriodo: string = '';
  programaSeleccionado: number;
  periodoSeleccionado: number;
  promocionSeleccionada: number;
  errores: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  public idSolicitudExamen: number;
  public idProfesorTitular: number;
  router: Router;
  vistaARegresar = 'ListaTrabajoRecuperacion';

  public configuracion: any = {
    paginacion: true,
    filtrado: {
      textoFiltro: '',
      columnas: 'idEstudiante.idDatosPersonales.nombre,' +
      'idEstudiante.idDatosPersonales.primerApellido,' +
      'idEstudiante.idDatosPersonales.segundoApellido,' +
      'idEstatus.valor'
    }
  };
  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idMatricula', sort: false},
    { titulo: 'Nombre del estudiante*', nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc' },
    { titulo: 'Clave de materia', nombre: 'idProfesorMateria', sort: false },
    { titulo: 'Profesor titular', nombre: 'idProfesor', sort: false },
    { titulo: 'Materia', nombre: 'idProfesorMateria', sort: false },
    { titulo: 'Estatus*', nombre: 'idEstatus', sort: false }
  ];

  // variables variables para consultas de base de datos
  private erroresConsultas: Array<ErrorCatalogo> = [];
  // ******************

  constructor(private elementRef: ElementRef,
    private injector: Injector, private _renderer: Renderer,
    public _catalogosService: CatalogosServices,
    public solicitudExamenTrabajoService: SolicitudExamenTrabajoService,
    public profesorResolverTrabajo: ProfesorRevisionTrabajoService,
    private _router: Router,
    private _spinner: SpinnerService,
    private _authService: AuthService) {

    let usuarioLogueado: UsuarioSesion = _authService.getUsuarioLogueado();
    this.router = _router;
    this.prepareServices();
    this.recuperarPermisosUsuario(usuarioLogueado.id);

    //Add Forms

    this.formulario = new FormGroup({
      idProgramaDocente: new FormControl(''),
      idPromocion: new FormControl(''),
      idPeriodo: new FormControl(''),
    });

    this.formularioSeleccionarProfesor = new FormGroup({
      idProfesor: new FormControl('', Validators.required),
      idEstatus: new FormControl('1224'),
      idSolicitudExamenTrabajo: new FormControl(this.idSolicitudExamen)
    });
    this.formularioConfirmarAtenderTrabajoRecuperacion = new FormGroup({
      idEstatus: new FormControl('1224'), // verificar si sigue siendo mismo estatus en evaluacion
      idProfesor: new FormControl(this.idProfesor),
      idSolicitudExamenTrabajo: new FormControl(this.idSolicitudExamen),
    });





    //End Forms

  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles(elemento);
          if (this.usuarioRol.rol.id == 1) {
            this.oculto = false;
            //console.log('1 - Usuario P');
          }
          if (this.usuarioRol.rol.id == 2) {
            (<FormControl>this.formulario.controls['idProgramaDocente']).disable();
          }
          this.getProgramaDocente();
          this.onCambiosTabla();
        });
      }
      );
  }

  detalleRecuperacion(): void {
    if (this.registroSeleccionado) {
      this.router.navigate(['formacion-academica', 'resolucion-recuperacion',
        { id: this.registroSeleccionado.id }]);
    }
  }

  mostrarDetalleRecuperacion(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.id === 1225
        && this.usuarioRol.rol.id === 2) {
        return true;
      }
    } else {
      return false;
    }
  }

  oculatarBotonAtender(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.valor === 'No atendido'
        && this.usuarioRol.rol.id === 2) {
        return true;
      }
    } else {
      return false;
    }
  }
  oculatarBotonResolver(): boolean {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado.estatus.valor === 'Evaluado'
          && this.usuarioRol.rol.id === 2) {
        return true;
      }
    } else {
      return false;
    }
  }

  ngOnInit(): void {
    this.paginacion = new PaginacionInfo(0, 1, 0, 0);
    this.listarProgramas();
  }

  listarProgramas(): void {
    let urlSearch = new URLSearchParams();
    /*this.listaProgramas = this.programaDocenteService.
     getSelectProgramaDocente(this.errores, urlSearch);*/
  }

  listarPeriodos(idPromocion): void {
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    let urlSearch = new URLSearchParams();
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      urlSearch.set('criterios',
        'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
        ':IGUAL;AND');
      //urlSearch.set('ordenamiento', 'anio:DESC,mesInicio:ASC');
      this.promocionPeriodoService.getListaPromocionPeriodoEscolarPaginacion(this.errores,
        urlSearch).subscribe(response => {
          response.json().lista.forEach((item) => {
            this.listaPeriodos.push(new PromocionPeriodoEscolar(item));
          });
        });
    }
  }

  listarPromociones(idPrograma): void {
    this.listaPromociones = [];
    this.promocionSeleccionada = null;
    let urlSearch = new URLSearchParams();
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL;AND,idEstatus~1235:NOT');
      this.promocionesService.getListaPromocionesPag(this.errores, urlSearch).
        subscribe(response => {
          response.json().lista.forEach((item) => {
            this.listaPromociones.push(new Promocion(item));
          });
        });
    }
  }

  getIdPeriodo(idPeriodo): void {
    this.periodoSeleccionado = idPeriodo ? idPeriodo : null;
  }

  onCambiosTabla(): void {

    this._spinner.stop("OnCambio");
    this.conformarCriteriosCabezera();
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    if (this.usuarioRol.rol.id == 2) {
      //console.log('2 - Usuario C');
      criterios = 'idEstudiante.idPromocion.idProgramaDocente.id~'+this.usuarioRol.usuario.programaDocente.id+':IGUAL';
      urlSearch.set('criterios', criterios);
    }

    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }

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

    //urlSearch.set('criterios', criterios);
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    //console.log(urlSearch);
    this._spinner.start("OnCambio");
    this.solicitudExamenTrabajoService.getListaSolicitudExamenTrabajoOpcional(
      this.errores, urlSearch, this.configuracion.paginacion).
      subscribe(
      response => {
        this.registros = [];
        let paginacionInfoJson = response.json();
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new SolicitudExamenTrabajo(item));
        });
      }, error => {
        console.error(error);
        this._spinner.stop("OnCambio");
      },
      () => {
        this._spinner.stop("OnCambio");
      }
      );
  }

  conformarCriteriosCabezera(): void {
    this.criteriosCabezera = '';
    if (this.programaSeleccionado)
      this.criteriosCabezera += 'idMateria.idPromocion.idProgramaDocente.id~' + this.programaSeleccionado + ':IGUAL';
    if (this.promocionSeleccionada) {
      if (this.criteriosCabezera.indexOf(';') > -1)
        this.criteriosCabezera += ',idMateria.idPromocion.id~' + this.promocionSeleccionada + ':IGUAL;AND';
      else
        this.criteriosCabezera += ';AND,idMateria.idPromocion.id~' + this.promocionSeleccionada + ':IGUAL;AND';
    }
    if (this.periodoSeleccionado) {
      if (this.criteriosCabezera === '')
        this.criteriosCabezera += 'idMateria.idPeriodoEscolar.id~' + this.periodoSeleccionado + ':IGUAL';
      else
        this.criteriosCabezera += ';AND,idMateria.idPeriodoEscolar.id~' + this.periodoSeleccionado + ':IGUAL';
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
  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  limpiarFiltroBusqueda():void {
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

  activarBotonBusqueda(numero: number): any {
    if (numero === 3) {
      this.botonBuscar = true;
    } else {
      this.botonBuscar = false;
    }
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    /*this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();*/
    this.promocionesService = this._catalogosService.getPromocion();
    this.periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this.materiaImpartidaService = this._catalogosService.getMateriaImpartidaService();
    this.promocionPeriodoService = this._catalogosService.getPromocionPeriodoEscolarService();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    //Atender
    this.profesorService = this._catalogosService.getProfesor();
    this.listaProfesores = this.profesorService.getSelectProfesor(this.erroresConsultas);
  }

  private getProgramaDocente(): void {
      let criterio = "idNivelEstudios~1:IGUAL";
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios',criterio);
      //console.log(urlParameter);
      this._catalogosService.getCatalogoProgramaDocente()
          .getListaProgramaDocente(this.erroresConsultas,urlParameter
          ).subscribe(
          response => {
            this.listaProgramas = [];
            response.json().lista.forEach((elemento) => {
              this.listaProgramas.push(new ItemSelects(elemento.id, elemento.descripcion))
            });
          }
      );
    if (this.oculto) {
      (<FormControl>this.formulario.controls['idProgramaDocente']).setValue(this.usuarioRol.usuario.programaDocente.id);
      this.listarPromociones(this.usuarioRol.usuario.programaDocente.id);
    }
  }
  // Add Clases


    getControl(campo: string): FormControl {
        return (<FormControl>this.formularioSeleccionarProfesor.controls[campo]);
    }
    getControlErrors(campo: string): boolean {
        if (!(<FormControl>this.formularioSeleccionarProfesor.controls[campo]).valid && this.validacionActiva_SeleccionarProfesor) {
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


/*  getControl_SeleccionarProfesor(campo: string): FormControl {
    return (<FormControl>this.formularioSeleccionarProfesor.controls[campo]);
  }
  getControlErrors_SeleccionarProfesor(campo: string): boolean {
    if (!(<FormControl>this.formularioSeleccionarProfesor.controls[campo]) && this.validacionActiva_SeleccionarProfesor) {
      return true;
    }
    return false;
  }
  validarFormulario_SeleccionarProfesor(): boolean {
    if (this.formularioSeleccionarProfesor) {
      this.validacionActiva_SeleccionarProfesor = false;
      return true;
    }
    this.validacionActiva_SeleccionarProfesor = true;
    return false;
  }*/
  getControl_ConfirmarAtenderTrabajoRecuperacion(campo: string): FormControl {
    return (<FormControl>this.formularioConfirmarAtenderTrabajoRecuperacion.controls[campo]);
  }
  getControlErrors_ConfirmarAtenderTrabajoRecuperacion(campo: string): boolean {
    if (!(<FormControl>this.formularioConfirmarAtenderTrabajoRecuperacion.controls[campo]) && this.validarFormulario_ConfirmarAtenderTrabajoRecuperacion) {
      return true;
    }
    return false;
  }
  validarFormulario_ConfirmarAtenderTrabajoRecuperacion(): boolean {
    if (this.formularioConfirmarAtenderTrabajoRecuperacion) {
      this.validacionActiva_ConfirmarAtenderTrabajoRecuperacion = false;
      return true;
    }
    this.validacionActiva_ConfirmarAtenderTrabajoRecuperacion = true;
    return false;
  }

  /*  enviarFormulario(): void {
      let json = JSON.stringify(this.formularioConfirmarAtenderTrabajoRecuperacion.value, null, 2);
      console.log('Start');
      this._spinner.start('hola')

      this.profesorResolverTrabajo.postProfesorRevisionTrabajo(
        json,
        this.erroresGuardado
      ).subscribe(
        response => {
          let jsonMovilidad = '{"idEstatus": " 1224 "}';
          this.solicitudExamenTrabajoService.putSolicitudExamenTrabajo(
            this.idSolicitudExamen,
            jsonMovilidad,
            this.erroresGuardado
          ).subscribe(
            response => {
            },
            error => {
            },
            () => {
              this.closemodalConfirmarAtenderTrabajoRecuperacion();
              this.crearResolucionProfesorTitular();
              this.onCambiosTabla();
              console.log('OnTabla');
            }
          );
        }
      );

      this._spinner.stop('hola')
      console.log('Stop');
    }*/




  enviarFormulario(): void {
    this.getControl('idProfesor').disable();
    this.idProfesor=this.getControl('idProfesor').value;
    this.formularioConfirmarAtenderTrabajoRecuperacion = new FormGroup({
      idEstatus: new FormControl('1224'), // verificar si sigue siendo mismo estatus en evaluacion
      idProfesor: new FormControl(this.idProfesor),
      idSolicitudExamenTrabajo: new FormControl(this.idSolicitudExamen),
    });
    this._spinner.start('SendForm');
    let json = JSON.stringify(this.formularioConfirmarAtenderTrabajoRecuperacion.value, null, 2);
    //console.log('1*',this.idSolicitudExamen);
    //console.log('2*',this.formularioConfirmarAtenderTrabajoRecuperacion.value);

    this.profesorResolverTrabajo. postProfesorRevisionTrabajo(json,this.erroresGuardado).subscribe(
      response => {
        let jsonMovilidad = '{"idEstatus": " 1224 "}';
        this.solicitudExamenTrabajoService
          .putSolicitudExamenTrabajo(
          this.idSolicitudExamen,
          jsonMovilidad,
          this.erroresGuardado
          ).subscribe(
          response => {

          },
          error => {
            console.error(error);
          },
          () => {
            this.crearResolucionProfesorTitular();
          }
          );
      }
    );
    this._spinner.stop('SendForm');
  }



  crearResolucionProfesorTitular(): void {
    this.formularioConfirmarAtenderTrabajoRecuperacion = new FormGroup({
      idEstatus: new FormControl('1224'),
      idProfesor: new FormControl(this.idProfesorTitular),
      idSolicitudExamenTrabajo: new FormControl(this.idSolicitudExamen),
    });
    let json = JSON.stringify(this.formularioConfirmarAtenderTrabajoRecuperacion.value, null, 2);
    //console.log('jon',json);
    this.profesorResolverTrabajo.
      postProfesorRevisionTrabajo(
      json,
      this.erroresGuardado
      ).subscribe(
      response => { },
      error => {

      },
      () => {
        this.onCambiosTabla();
        this.enviarCorreoAceptado();
      }
      );
  }


  enviarCorreoAceptado(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),  // debe ser correo del profesor
      asunto: new FormControl('Solicitud de recurso de revisión o trabajo de recuperación'),
      entidad: new FormControl({ SolicitudExamenTrabajo: this.idSolicitudExamen }),
      idPlantilla: new FormControl('35')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._catalogosService.getEnvioCorreoElectronicoService()
      .postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
      ).subscribe(
      error => {
        console.log('ErrorCorreoAceptado');
      },
      () => {
        console.log('enviarCorreoAceptado');
      }
      );
    this.closemodalAtenderTrabajoRecuperacion();
  }

/*  errorMessage(control: FormControl): string {
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
*/
/////////////////////////TAB //////////////////////////////////////////////
  entidadSolicitudExamenTrabajo: SolicitudExamenTrabajo;

  profesorTitular: ProfesorRevisionTrabajo = null;
  profesorAsignado: ProfesorRevisionTrabajo = null;

  columnasTAB: Array<any> = [
    { titulo: 'Profesor', nombre: 'idProfesor'},
    { titulo: 'Asignado/Titular', nombre: 'calificacionDefinitiva'}
  ];

  columnasAtencionTrabjo: Array<any> = [
    { titulo: 'Profesor', nombre: 'idProfesor'},
    { titulo: 'Calificación', nombre: 'calificacionDefinitiva'},
    { titulo: 'Comentarios', nombre: 'comentariosEvaluacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];

  listaProfesoresAtencionTrabajo: Array<ProfesorRevisionTrabajo> = [];
  calificaciones: number = 0;

  profesorRevisionTrabajoService;
  erroresTAB: Array<Object> = [];
  paginacionTAB: PaginacionInfo;
  catalogosService;
  solicitudExamenTrabajoServiceTAB;
  private erroresConsultasTAB: Array<ErrorCatalogo> = [];
  idSolicitudExamenTAB;

  constructorTAB(): void {
    this.entidadSolicitudExamenTrabajo = null;
    this.profesorTitular = null;
    this.profesorAsignado = null;
    this.listaProfesoresAtencionTrabajo = [];
    this.calificaciones = 0;
    this.profesorRevisionTrabajoService = null;
    this.erroresTAB = [];
    this.paginacionTAB = null;
    this.catalogosService = null;
    this.solicitudExamenTrabajoServiceTAB = null;
    this.erroresConsultasTAB = [];
    this.idSolicitudExamenTAB = this.registroSeleccionado.id;

    this.prepareServicesTAB();
    this.solicitudExamenTrabajoServiceTAB
        .getEntidadSolicitudExamenTrabajo(
            this.idSolicitudExamenTAB,
            this.erroresConsultasTAB
        ).subscribe(
        response => {
          this.entidadSolicitudExamenTrabajo
              = new SolicitudExamenTrabajo(response.json());
        },
        error => {
        },
        () => {
        }
    );
  }
  private prepareServicesTAB(): void {
    this.catalogosService = this._catalogosService;
    this.solicitudExamenTrabajoServiceTAB =
        this.catalogosService.getSolicitudExamenTrabajoService();
    this.profesorRevisionTrabajoService =
        this.catalogosService.getProfesorRevisionTrabajoService();
    this.getData();
  }

  private getData(): void {
    this._spinner.start('data');
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idSolicitudExamenTrabajo.id~' + this.idSolicitudExamenTAB + ':IGUAL');
    this.profesorRevisionTrabajoService.getListaProfesorRevisionTrabajo(
        this.erroresTAB, urlSearch).
    subscribe(
        response => {
          let paginacionInfoJson = response.json();
          this.paginacionTAB = new PaginacionInfo(
              paginacionInfoJson.registrosTotales,
              paginacionInfoJson.paginas,
              paginacionInfoJson.paginaActual,
              paginacionInfoJson.registrosPagina
          );
          paginacionInfoJson.lista.forEach((item) => {
            if (item) {
              if (item.calificacion_definitiva) {
                this.calificaciones += item.calificacion_definitiva;
              }

              this.listaProfesoresAtencionTrabajo.push(new ProfesorRevisionTrabajo(item));
              if(item.id_profesor.id == item.id_solicitud_examen_trabajo.id_profesor.id)
                this.profesorTitular = new ProfesorRevisionTrabajo(item);
              else
                this.profesorAsignado = new ProfesorRevisionTrabajo(item);
            }

          });

          this.calificaciones = Math.round(this.calificaciones / 2);
        }
    );
    this._spinner.stop('data');
  }


  // End Clases

  // Add Modals

  @ViewChild('modalDetalleTrabajoRecuperacion')
  modalDetalleTrabajoRecuperacion: ModalComponent;
  openmodalDetalleTrabajoRecuperacion(): void {
    if (this.registroSeleccionado.estatus.id != 1223) {
      this.constructorTAB();
    }
    this.modalDetalleTrabajoRecuperacion.open('lg');
  }
  closemodalDetalleTrabajoRecuperacion(): void {
    this.modalDetalleTrabajoRecuperacion.close();
  }

  @ViewChild('modalAtenderTrabajoRecuperacion')
  modalAtenderTrabajoRecuperacion: ModalComponent;
  openmodalAtenderTrabajoRecuperacion(): void {
    this.idSolicitudExamen = this.registroSeleccionado.id;
    this.idProfesorTitular = this.registroSeleccionado.profesor.id;
    this.getControl('idProfesor').enable();
    this.modalAtenderTrabajoRecuperacion.open('lg');
  }
  closemodalAtenderTrabajoRecuperacion(): void {
    this.modalAtenderTrabajoRecuperacion.close();
  }

  @ViewChild('modalConfirmarAtenderTrabajoRecuperacion')
  modalConfirmarAtenderTrabajoRecuperacion: ModalComponent;
  openmodalConfirmarAtenderTrabajoRecuperacion(): void {
    this.modalConfirmarAtenderTrabajoRecuperacion.open('sm');
  }
  closemodalConfirmarAtenderTrabajoRecuperacion(): void {
    this.modalConfirmarAtenderTrabajoRecuperacion.close();
  }

  detalleResolucionRecuperacion(): void {
    if (this.registroSeleccionado) {
      this.router.navigate(['formacion-academica', 'resolucion-recuperacion',
        { id: this.registroSeleccionado.id }]);
    }
  }

  //End Modals

}
