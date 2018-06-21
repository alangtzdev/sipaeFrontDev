import {
  Component, OnInit, ElementRef, Injector, Renderer, IterableDiffers, KeyValueDiffers,
  ViewChild
} from '@angular/core';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {MateriaImpartidaService} from '../../services/entidades/materia-impartida.service';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {ProgramaDocenteService} from '../../services/servicios-especializados/programa-docente/programa-docente.service';
import {PromocionService} from '../../services/servicios-especializados/promocion/promocion.service';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {ErrorCatalogo} from '../../services/core/error.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {URLSearchParams} from '@angular/http';
import {ProgramaDocente} from '../../services/entidades/programa-docente.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {ProgramaDocenteServices} from '../../services/entidades/programa-docente.service';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {ItemSelects} from '../../services/core/item-select.model';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {Validacion} from '../../utils/Validacion';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {AuthService} from '../../auth/auth.service';
import * as moment from 'moment';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';

@Component({
  selector: 'app-calificaciones',
  templateUrl: './calificaciones.component.html',
  styleUrls: ['./calificaciones.component.css']
})
export class CalificacionesComponent {

  @ViewChild('modalRegistrarCalif')
  modalRegistrarCalif: ModalComponent;
  @ViewChild('modalDetalleCalif')
  modalDetalleCalif: ModalComponent;
  @ViewChild('modalConfirmarCalifIncompleta')
  modalConfirmarCalifIncompleta: ModalComponent;
  @ViewChild('modalConfirmarCalifDefinitiva')
  modalConfirmarCalifDefinitiva: ModalComponent;
  @ViewChild('modalAdvertenciaInterprograma')
  modalAdvertenciaInterprograma: ModalComponent;
  @ViewChild('modalValidarActaProfesor')
  modalValidarActaProfesor: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  catalogoService: CatalogosServices;
  materiaImpartidaService: MateriaImpartidaService;
  estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService;
  promocionPeriodoService;
  periodoEscolarService;
  usuarioRolService;
  profesorMateriaService;
  profesorService;
//  usuarioRolService;
  materiaImpartidaTutorialService;
  firmasValidacionService;

  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesSelectMateria: Array<MateriaImpartida> = [];

  registros: Array<EstudianteMateriaImpartida> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  listaPromociones: Array<ItemSelects> = [];

  formFiltro: FormGroup;
  registroSeleccionado: EstudianteMateriaImpartida;
  paginacion: PaginacionInfo;
  usuarioRol: UsuarioRoles;

  botonBuscar: boolean = false;
  constancia: boolean = false;
  criteriosCabezera: string = '';
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  accion = '';
  materia = '';
  exportarFormato = '';
  licenciatura: boolean = false;
  programaSeleccionado: number;
  periodoSeleccionado: number;
  promocionSeleccionada: number;
  idProfesor: number;
  idProfesorMateria: number;
  idUsuario: number;
  edicion: boolean;
  materiasHabilitadas: boolean = true;
  idUsuarioProfesorTitular: number;
  materiaImpartida: MateriaImpartida;
  usuarioRolProf: UsuarioRoles;
  idEstudianteContanciaProfesorTutorial: number;
  idTutorConstancias: number;
  materiaTutorial: boolean = false;
  hayTemarioParticular: boolean = false;
  usuarioFirmoActa: boolean = false;
  entidadEMI: EstudianteMateriaImpartida;
  mostrarMensaje: boolean = true;
  calificacionModalConfirmacion: number;
  incompletaModalConfirmacion: number;

  // No se va ordenar por ninguna columna, porque son dos tablas diferentes
  columnas: Array<any> = [
        { titulo: 'Matrícula', nombre: 'idEstudiante.idMatricula.matriculaCompleta', sort: false},
        { titulo: 'Estudiante*',
            nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: false},
        { titulo: 'Calificación incompleta', nombre: 'calificacionIncompleta'},
        { titulo: 'Calificación definitiva', nombre: 'calificacionOrdinaria'}
    ];
  configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido' }
  };

  private prepareServices(): void {
    this.catalogoService = this._catalogosService;
    this.materiaImpartidaService =
      this._catalogosService.getMateriaImpartidaService();
    this.estudianteMateriaImpartidaService =
      this._catalogosService.getEstudianteMateriaImpartidaService();
    this.periodoEscolarService = this._catalogosService.getPeriodoEscolar();
    this.promocionPeriodoService = this._catalogosService.getPromocionPeriodoEscolarService();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.profesorMateriaService = this._catalogosService.getProfesorMateriaService();
    this.profesorService = this._catalogosService.getProfesor();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.materiaImpartidaTutorialService =
      this._catalogosService.getMateriaImpartidaTemarioParticularService();
    this.firmasValidacionService =
      this._catalogosService.getFirmaValidacionService();
  }

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private idMateriaElegida: number;

  // variables modal registrar calificacion
  formularioRegistraarCali: FormGroup;
  auxiliarAsist: boolean = false;
  comentarios: boolean = false;
  auxiliarCalif: boolean = false;
  nombreEstudiante: String = '';
  matricula: String = '';
  idUsuarioRol: number;
  validacionActiva: boolean = false;

  // variables modal de confirmacion de calif definitiva
  materiaDetalleDef = '';

  /// variables para modal validar acta ///
  formularioActa: FormGroup;
  /// termina variables para modal validar acta ////

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              public _catalogosService: CatalogosServices,
              private programaDocenteService: ProgramaDocenteServices,
              private promocionService: PromocionServices,
              private _enviarCorreo: EnvioCorreoElectronicoService,
              private authService: AuthService) {
    let usuarioLogueado: UsuarioSesion = this.authService.getUsuarioLogueado();
    this.idUsuario = usuarioLogueado.id;
    this.prepareServices();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.formFiltro = new FormGroup({
      idProgramaDocente: new FormControl(''),
      idMateriaImpartida: new FormControl(''),
    });
    this.getControFiltro('idMateriaImpartida').disable();
    this.crearFormularioCalificacion();


if (sessionStorage.getItem('calificacionCriterios')) {
      this.onCambiosTabla();
    }

  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        console.log(response.json());
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          if (this.usuarioRol.rol.id === 3) {
            this.obtenerIdProfesor(id);
            this.obtenerCatalogos();
            this.usuarioRolProf = this.usuarioRol;
          }
        });
      }
    );
  }

  getControFiltro(campo: string): FormControl {
    return (<FormControl>this.formFiltro.controls[campo]);
  }

  listarPeriodos(idPromocion): void {
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    this.materiaImpartida = null;
    this.materiasHabilitadas = true;
    this.getControFiltro('idMateriaImpartida').disable();
    this.getControFiltro('idMateriaImpartida').patchValue('');
    let urlSearch = new URLSearchParams();
    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      urlSearch.set('criterios',
        'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
        ':IGUAL;AND');

      this.promocionPeriodoService.
      getListaPromocionPeriodoEscolarPaginacion(this.erroresConsultas,
        urlSearch).subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPeriodos.push(new PromocionPeriodoEscolar(item));
        });
        if (this.listaPeriodos.length === 0) {
          let mensaje = 'No se encontraron periodos para la promoción seleccionada';
          this.alertas.push({
            msg: mensaje,
            closable: true,
            tiempo: 3000
          });
        }
      });
      this.opcionesSelectMateria = [];
    }
  }

  listarPromociones(idPrograma): void {
    this.listaPromociones = [];
    this.promocionSeleccionada = null;
    this.materiaImpartida = null;
    this.materiasHabilitadas = true;
    this.getControFiltro('idMateriaImpartida').disable();
    this.getControFiltro('idMateriaImpartida').patchValue('');
    let urlSearch = new URLSearchParams();

    urlSearch.set('ordenamiento', 'abreviatura:ASC,consecutivo:ASC');
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL');

      this.listaPromociones = this.promocionService
        .getSelectPromocion(this.erroresConsultas, urlSearch);
      this.verificarNivelEstudios(idPrograma);
      this.listaPeriodos = [];
      this.opcionesSelectMateria = [];
    }

  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 4) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  busquedaListaEstudiantes(): void {
    this.limpiarVariablesSession();
    this.materiaTutorial = false;
    this.materiaImpartida = null;
    this.idMateriaElegida = this.formFiltro.controls['idMateriaImpartida'].value;
    if (this.idMateriaElegida) {
      sessionStorage.setItem('idMateriaElegidaCalifcaciones', ''  + this.idMateriaElegida);
      this._spinner.start('califiaciones1');
      this.obtenerIdProfesorMateria(this.idProfesor, this.idMateriaElegida);
      this.criteriosCabezera = 'idMateriaImpartida~' + this.idMateriaElegida +
        ':IGUAL';
      this.materiaImpartidaService.getMateriaImpartida(this.idMateriaElegida,
        this.erroresConsultas
      ).subscribe(
        response => {
          this.materiaImpartida = new MateriaImpartida(response.json());
          if (response.json().id_materia.id_tipo.id == '3') {
            this.materiaTutorial = true;
            this.criteriosCabezera +=
              'GROUPAND,idEstudiante.idTutor.idProfesor~' + this.idProfesor +
              ':IGUAL;AND';
            this.obtenerFirmaUsuario(this.idUsuario, this.idMateriaElegida);
          }
        },
        error => { this._spinner.stop('califiaciones1'); },
        () => {
          // console.log('materiImpartida', this.materiaImpartida);
          let urlSearch: URLSearchParams = new URLSearchParams();
          urlSearch.set('criterios', 'idMateriaImpartida~' +
            this.idMateriaElegida + ':IGUAL,'
            + 'idProfesor~' + this.idProfesor + ':IGUAL;AND');
          this.materiaImpartidaTutorialService.
          getListaTemarioParticularMateriaImpartida(
            this.erroresConsultas,
            urlSearch
          ).subscribe(
            response => {
              response.json().lista.forEach((item) => {
                if (item.id_temario_particular) {
                  if (item.id_temario_particular.id) {
                    this.hayTemarioParticular = true;
                  }
                }
              });
            },
            error => {
              this._spinner.stop('califiaciones1');
            },
            () => {
              this._spinner.stop('califiaciones1');
              this.onCambiosTabla();
            }
          );
        }
      );
    }
  }

  busquedaListaMaterias(idPeriodoEscolar: number, idPromocion: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.opcionesSelectMateria = [];
    this.materiaImpartida = null;
    this.materiasHabilitadas = true;

    if (idPeriodoEscolar && this.idProfesor) {
      urlParameter.set('criterios', 'idMateriaImpartida.idPeriodoEscolar.id~' +
        idPeriodoEscolar +
        ':IGUAL;AND,idMateriaImpartida.idPromocion~' + idPromocion +
        ':IGUAL;AND,idProfesor.id~' + this.idProfesor + ':IGUAL');
      // console.log('parametors para profesorMateria en busarlistaMateris', urlParameter);
      this.profesorMateriaService.
      getListaProfesorMateria(this.erroresConsultas, urlParameter).
      subscribe(response => {
        response.json().lista.forEach((item) => {
          this.opcionesSelectMateria.push(
            new MateriaImpartida(item.id_materia_impartida));
        });
        // console.log('opcionesSelectMateria antes de buscar tutiroales', this.opcionesSelectMateria);
        urlParameter.set('criterios', 'idMateriaImpartida.idPeriodoEscolar.id~' +
          idPeriodoEscolar +
          ':IGUAL;AND,idMateriaImpartida.idPromocion~' + idPromocion +
          ':IGUAL;AND,idEstudiante.idTutor.idProfesor.id~' + this.idProfesor +
          ':IGUAL;AND,idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND');
        let materiasTutorialesIds: Array<number> = [];
        this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
          this.erroresConsultas, urlParameter).subscribe(response => {
          response.json().lista.forEach((item) => {
            let flag = false;
            if (materiasTutorialesIds.length > 0) {
              materiasTutorialesIds.forEach((id) => {
                if (!flag) {
                  if (id == item.id_materia_impartida.id) {
                    flag = true;
                  }
                }
              });
              if (!flag) {
                this.opcionesSelectMateria.push(
                  new MateriaImpartida(item.id_materia_impartida));
                materiasTutorialesIds.push(item.id_materia_impartida.id);
              }
            }else {
              materiasTutorialesIds.push(item.id_materia_impartida.id);
              this.opcionesSelectMateria.push(
                new MateriaImpartida(item.id_materia_impartida));
            }
          });
          // console.log('selectMAterias despues de buscar tutorial', this.opcionesSelectMateria);
          if (this.opcionesSelectMateria.length == 0) {
            let mensaje =
              'No tiene materias asignadas con la promoción y período seleccionados';
            this.alertas.push({
              msg: mensaje,
              closable: true,
              type: 'danger',
              tiempo: 3000
            });
          }else {
            this.materiasHabilitadas = false;
            this.getControFiltro('idMateriaImpartida').enable();
          }
        });
      });
    }
  }

  habilitarProgramas(): boolean {
    if (this.opcionesSelectProgramaDocente.length == 0){
      return true;
    }
    return false;
  }

  habilitarPromociones(): boolean {
    if (this.listaPromociones.length == 0) {
      return true;
    }
    return false;
  }

  habilitarPeriodos(): boolean {
    if (this.listaPeriodos.length == 0) {
      return true;
    }
    return false;
  }

  habilitarMaterias(): boolean {
    /*if (this.opcionesSelectMateria.length == 0) {
     return true;
     }*/
    return this.materiasHabilitadas;
  }

  obtenerIdProfesor(idUsuario: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let profesor: Profesor;

    if (idUsuario) {
      urlSearch.set('criterios', 'idUsuario.id~' + idUsuario + ':IGUAL');
      this.profesorService.getListaProfesor(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          response.json().lista.forEach((elemento) => {
            profesor = new Profesor (elemento);
            this.idProfesor = profesor.id;
          });
        }
      );
    }
  }

  obtenerIdProfesorMateria(idProfesor: number, idMateriaImpartida: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let profesorMateria: ProfesorMateria;
    if (idProfesor && idMateriaImpartida) {
      urlSearch.set('criterios', 'idProfesor.id~' + idProfesor +
        ':IGUAL;AND,idMateriaImpartida.id~' + idMateriaImpartida + ':IGUAL');
      // console.log('criterios en obtenerIdProfesorMateria', urlSearch);
      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          response.json().lista.forEach((elemento) => {
            profesorMateria = new ProfesorMateria (elemento);
            this.materia = profesorMateria.materiaImpartida.materia.descripcion;
            this.idProfesorMateria = profesorMateria.id;
            if (profesorMateria.titular) {
              this.idUsuarioProfesorTitular = profesorMateria.profesor.usuario.id;
            }
            // console.log(profesorMateria.titular);
          });
        }
      );
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
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
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.mostrarMensaje = false;
    this.onCambiosTabla();
  }

  limpiarInput(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  sortChanged(columna): void {
    this.limpiarVariablesSession();
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

  cambiarPagina(evento: any): void {
    this.limpiarVariablesSession();
    this.paginaActual = evento.page;
  /*  if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    console.log('bandera', this.mostrarMensaje);
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let sinCalificacion: number = 0;
    let idMateriaImpartidaElegida = undefined;

    this.registroSeleccionado = null;
    let ordenamiento = '';

    if (!sessionStorage.getItem('calificacionCriterios')) {
      if (this.criteriosCabezera !== '') {
        if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
          let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
          filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
              this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
          });
          criterios += 'GROUPAND,' + this.criteriosCabezera;
        }else {
          criterios += this.criteriosCabezera;
        }
        urlSearch.set('criterios', criterios);
      }

      sessionStorage.setItem('calificacionCriterios', criterios);
      // sessionStorage.setItem('calificacionOrdenamiento', ordenamiento);
      // sessionStorage.setItem('calificacionLimite', this.limite.toString());
      // sessionStorage.setItem('calificacionPagina', this.paginaActual.toString());

    }

    urlSearch.set('criterios', sessionStorage.getItem('calificacionCriterios')
      ? sessionStorage.getItem('calificacionCriterios') : criterios);

   if (!sessionStorage.getItem('idMateriaElegidaCalifcaciones')) {
     idMateriaImpartidaElegida = this.idMateriaElegida;
   } else {
     idMateriaImpartidaElegida = sessionStorage.getItem('idMateriaElegidaCalifcaciones');
   }

    // console.log('getCriterios', urlSearch.get('criterios'));
    this.verificarCalificacionAlumnos(urlSearch.get('criterios'));

    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartidaOrdenada(
        this.erroresConsultas,
        idMateriaImpartidaElegida,
        this.idProfesor
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          let paginasArray: Array<number> = [];

          this.registros = [];

          paginacionInfoJson.lista.forEach((item) => {

            if (item.id_estudiante) {
              if (item.id_estudiante.id_matricula) {
                this.registros.push(new EstudianteMateriaImpartida(item));

                this.idEstudianteContanciaProfesorTutorial = item.id_estudiante.id;
                if (this.idTutorConstancias = item.id_estudiante.id_tutor) {
                  this.idTutorConstancias = item.id_estudiante.id_tutor.id;
                  /*
                   * TODO 13/12/2016 se agregan validaciones
                   * para constancia tipo tutorial
                   * idEstudianteContanciaProfesorTutorial se utiliza para
                   * almacenar un alumno para la api de generarContanciaTutorial
                   * idtutorConstancia parametro de la api generarContanciaTutorial
                   * Se agrega la condición si existe el id_tutor para los casos de
                   * Licenciatura que no tiene este campo hasta sexto semestre
                   * */
                }
              }
            }

            if (item.id_estudiante_movilidad_externa) {
              if (item.id_estudiante_movilidad_externa.id_matricula) {
                this.registros.push(new EstudianteMateriaImpartida(item));
              }
            }
          });


          if (this.registros.length === 0) {
            this.mostrarMensajeSinAlumnos();
          }

        },
        error => {
          this._spinner.stop('califiaciones2');
        },
        () => {

          let begin = ((this.paginaActual - 1) * this.limite);
          let end = begin + this.limite;

          this.setPaginacion(new PaginacionInfo(
            this.registros.length,
            this.obtenerNumeroPaginas(),
            this.paginaActual,
            this.limite
          ));

          this.registros = this.registros.slice(begin, end);

        }
      );

  }

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;
  }

  obtenerNumeroPaginas() {
    return Math.ceil(this.registros.length / this.limite);
  }

  verificarCalificacionAlumnos(criterios): void {
    let sinCalificacion = 0;
    let urlSearchVerifcarAlumnos: URLSearchParams = new URLSearchParams();

    this._spinner.start('califiaciones2');
    urlSearchVerifcarAlumnos.set('criterios', criterios);
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.erroresConsultas,
        urlSearchVerifcarAlumnos
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();

          paginacionInfoJson.lista.forEach((item) => {
            if (item.id_estudiante && item.id_estudiante.id_matricula) {
              if (item.calificacion_ordinaria === undefined) {
                  sinCalificacion++;
              }
            }

            if (item.id_estudiante_movilidad_externa) {
              if (item.id_estudiante_movilidad_externa.id_matricula) {
                if (item.calificacion_ordinaria === undefined) {
                  sinCalificacion++;
                }
              }
            }
          });

          if (this.configuracion.filtrado.textoFiltro === '') {
            if (paginacionInfoJson.registrosTotales === 0 || sinCalificacion > 0) {
              this.constancia = false;
            } else if (sinCalificacion === 0 && paginacionInfoJson.registrosPagina !== 0) {
              this.constancia = true;
            }
          }
        },
        error => {
          this._spinner.stop('califiaciones2');
        },
        () => {
          this._spinner.stop('califiaciones2');
        }
      );
  }

  mostrarMensajeSinAlumnos(): void {
    if (this.mostrarMensaje) {
      let mensaje = 'No hay estudiantes registrados en la materia seleccionada';
      this.alertas.push({
        msg: mensaje,
        closable: true,
        type: 'danger',
        tiempo: 3000
      });
    } else {
      this.mostrarMensaje = true;
    }
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  mostrarBotones(): boolean {

    return this.registroSeleccionado ? true : false;

  }

  mostrarBotonConstancia(): boolean {
    //console.log(this.constancia);
    if (this.materiaImpartida &&
      (this.materiaImpartida.actaCalificacion.profesor || this.usuarioFirmoActa)
      && this.hayTemarioParticular && this.constancia) {
      return true;
    } else {
      return false;
    }
  }

  mostrarBotonValidarActa(): boolean {
    if (this.materiaImpartida) {
      if (this.materiaImpartida.materia.tipoMateria.id === 3) {
        return this.validarActaTutorial();
      } else if (this.materiaImpartida.materia.tipoMateria.id !== 3) {
        return this.validarActaMateriaNormal();
      }
    }
  }

/*  validarActa(): void {
//    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    if (this.usuarioRolProf && this.materiaImpartida) {
      let bindings = Injector.resolve([
        provide(ICustomModal, {
          useValue: new ConfirmarGenerarActaData(this,
            this.usuarioRolProf.rol, this.materiaImpartida)
        }),
        provide(IterableDiffers, {useValue: this.injector.get(IterableDiffers)}),
        provide(KeyValueDiffers, {useValue: this.injector.get(KeyValueDiffers)})
      ]);

      dialog = this.modal.open(
        <any>ConfirmarGenerarActa,
        bindings,
        modalConfig
      );
    }
  }*/

  mostrarBotonAgregar(): boolean {
    this.edicion = false;
    if (this.mostrarBotones()) {
      if ((this.registroSeleccionado.calificacionOrdinaria == undefined)
        && !this.registroSeleccionado.calificacionIncompleta &&
        ((this.idUsuario == this.idUsuarioProfesorTitular) ||
        this.esMateriTutorial())) {
        return true;
      }else {
        return false;
      }
    }else {
      return false;
    }
  }

  mostrarBotonEditar(): boolean {
    this.edicion = true;

    if (this.mostrarBotones()) {
      if (!this.registroSeleccionado.calificacionOrdinaria
        && this.registroSeleccionado.calificacionIncompleta &&
        ((this.idUsuario == this.idUsuarioProfesorTitular) ||
        this.esMateriTutorial())) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  esMateriTutorial(): boolean {
    if (this.mostrarBotones()) {
      if (this.registroSeleccionado.materiaImpartida.materia.tipoMateria.id === 3) {
        return true;
      } else {
        return false;
      }
    }
  }

  verificarNivelEstudios(idProgramaDocente: number): void {
    let programaDocente : ProgramaDocente;

    this.programaDocenteService.getEntidadProgramaDocente(
      idProgramaDocente,
      this.erroresConsultas
    ).subscribe(
      response => {
        programaDocente = new ProgramaDocente(response.json());

        if (programaDocente.nivelEstudios.id === 1) {
          this.licenciatura = true;
        }else {
          this.licenciatura = false;
        }
      },
      error => {
      /*  if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log(programaDocente);
        }*/
      }
    );
  }

  generarConstanciasTodoTipo(): void {
    if (this.materiaTutorial) {
      this.generarConstanciaTutorial();
    } else {
      this.generarConstancia();
    }
  }

  generarConstancia(): void {
  //  let usuarioLogueado: UsuarioSesion = Seguridad.getUsuarioLogueado();
    console.log('idProfesorMAteria', this.idProfesorMateria);
    this._spinner.start('califiaciones3');
    this.profesorMateriaService.getConstancia(
      this.idProfesorMateria,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
      },
      error => {
        console.error(error);
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop('califiaciones3');
      }
    );
  }

  generarConstanciaTutorial(): void {
    let usuarioLogueado: UsuarioSesion = this.authService.getUsuarioLogueado();
    let materiaImpartida = this.formFiltro.controls['idMateriaImpartida'].value;
    this._spinner.start('califiaciones4');
    let constanciaProfesor;
    console.log(materiaImpartida, 'materia impartida');
    console.log(this.idEstudianteContanciaProfesorTutorial, 'estudiante impartida');
    console.log(this.idProfesorMateria, 'profesor impartida');
    this.profesorMateriaService.getConstanciaTutorial(
      this.idEstudianteContanciaProfesorTutorial,
      this.idTutorConstancias,
      materiaImpartida,
      this.erroresConsultas
    ).subscribe(
      response => {
        constanciaProfesor = response.json();
        this._spinner.stop('califiaciones4');
      },
      error => {
        console.error(error);
        this._spinner.stop('califiaciones4');
      },
      () => {
        console.log(constanciaProfesor);
        window.open(constanciaProfesor);
        this._spinner.stop('califiaciones4');
      }
    );
  }

  obtenerFirmaUsuario(idUsuario: number, idMateriaImpartida: number): void {
    this.materiaImpartidaService.getFirmasActa(
      idMateriaImpartida,
      this.erroresConsultas
    ).subscribe(
      response => {
        if (response.json().firmas) {
          let idMateriaImpartidaResponse = response.json().idMateriaImpartida;
          console.log('response', response.json());
          response.json().firmas.forEach((item) => {
              if (item.idUsuario === idUsuario &&
                  idMateriaImpartida === idMateriaImpartidaResponse) {
                  this.usuarioFirmoActa = true;
              }
          });
        }
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {}
    );

  }

  private validarActaTutorial(): boolean {
    let habilitarBoton: boolean = false;
    if (!this.usuarioFirmoActa && this.constancia) {
      habilitarBoton = true;
    }

    return habilitarBoton;
  }

  private  validarActaMateriaNormal() {
    let habilitarBoton: boolean = false;
    if (this.materiaImpartida.actaCalificacion) {
      if (!this.materiaImpartida.actaCalificacion.profesor && this.constancia) {
        habilitarBoton = true;
      }
    } else if (!this.materiaImpartida.actaCalificacion && this.constancia) {
      habilitarBoton = true;
    }

    return habilitarBoton;
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  private obtenerCatalogos(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    // urlSearch.set('ordenamiento', 'descripcion:ASC');
    this.opcionesSelectProgramaDocente = this.programaDocenteService.getSelectProgramaDocente(this.erroresConsultas, urlSearch);
      this.catalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    this.opcionesSelectMateria = [];
  }

  // modal registrar calificacion

  modalRegistrarCalificaciones(): void {
    let idMateriaImpartidaEleccion = this.formFiltro.controls['idMateriaImpartida'].value;
    if (this.registroSeleccionado.interprograma &&
      (this.registroSeleccionado.materiaInterprograma.id != idMateriaImpartidaEleccion)) {
      this.modalAdvertenciaMateriaInterprograma();
    } else {
      this.getInformacionAlumno();
      this.modalRegistrarCalif.open('lg');
    }

  }

  cerrarModalRegistroCalificaciones() {
    this.crearFormularioCalificacion();
    this.validacionActiva = false;
    this.modalRegistrarCalif.close();
  }

  modalAdvertenciaMateriaInterprograma() {
    this.modalAdvertenciaInterprograma.open();
  }

  cerrarModalAdvertenciaInterprograma(): void {
    this.modalAdvertenciaInterprograma.close();
  }

  crearFormularioCalificacion(): void {
    this.formularioRegistraarCali = new FormGroup({
      asistencia : new FormControl(''),
      calificacion : new FormControl('', Validators.compose([Validacion.calificacionValidator, Validators.required])),
      comentarioAsistencia : new FormControl(''),
      huboCalifIncompleta: new FormControl(''),
      calificacionOrdinaria: new FormControl(''),
      calificacionIncompleta: new FormControl('')
    });
  }

  getInformacionAlumno() {
    if (this.registroSeleccionado.id) {
      let entidad: EstudianteMateriaImpartida;
      this._spinner.start('getInformacionalumno');
      this.estudianteMateriaImpartidaService
        .getEstudianteMateriaImpartida(
          this.registroSeleccionado.id,
          this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadEMI = new EstudianteMateriaImpartida(response.json());
          entidad = new EstudianteMateriaImpartida(response.json());
        },
        error => {
          /*if (assertionsEnabled()) {
            console.error(error);
          }*/
          this._spinner.stop('getInformacionalumno');
        },
        () => {
          /*if (assertionsEnabled()) {
            //console.log(entidad);
          }*/

          if (this.formularioRegistraarCali) {
            let stringAsistencia = 'asistencia';
            let stringHuboCalifIncompleta = 'huboCalifIncompleta';
            let stringCalificacion = 'calificacion';
            let stringComentarioAsistencia = 'comentarioAsistencia';

            if (entidad.asistencia) {
              this.auxiliarAsist = true;
              this.comentarios = false;
              (<FormControl>this.formularioRegistraarCali.controls[stringAsistencia]).setValue(entidad.asistencia);
            } else {
              this.comentarios = true;
              (<FormControl>this.formularioRegistraarCali.controls[stringComentarioAsistencia]).setValue(entidad.comentarioAsistencia);
            }

            if (entidad.huboCalifIncompleta) {
              this.auxiliarCalif = true;
              this.comentarios = true;

              (<FormControl>this.formularioRegistraarCali.controls[stringHuboCalifIncompleta])
                .setValue(entidad.huboCalifIncompleta);
              (<FormControl>this.formularioRegistraarCali.controls[stringCalificacion])
                .setValue(entidad.calificacionIncompleta);
            }

            if (entidad.estudiante.id) {
              this.nombreEstudiante = entidad.estudiante.getNombreCompleto();
              this.matricula = entidad.estudiante.matricula.matriculaCompleta;
            } else if (entidad.estudianteMovilidadExterna.id) {
              this.nombreEstudiante =
                entidad.estudianteMovilidadExterna.getNombreCompletoOpcional();
              this.matricula =
                entidad.estudianteMovilidadExterna.matricula.matriculaCompleta;
            }

            if (!entidad.calificacionOrdinaria && !entidad.calificacionIncompleta) {
              ///console.log('Trae entidad', entidad);
              // this.cambiarAuxiliar(true);
              // this.cambioRadio();
              // (<FormControl>this.formularioRegistraarCali.controls['asistencia']).setValue(true);
              // this.comentarios = false;
              this.cambiarAuxiliar(true);
            }

          }
          this._spinner.stop('getInformacionalumno');
        }
      );
    }
  }

  getControlRegistroCalif(campo: string): FormControl {
    return (<FormControl>this.formularioRegistraarCali.controls[campo]);
  }

  getControlErrorsRegistroCalif(campo: string): boolean {
    if (!(<FormControl>this.formularioRegistraarCali.controls[campo]).
        valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormularioRegistroCalif(): boolean {
    if (this.formularioRegistraarCali.valid) {
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

  /*confirmarCalificacionDefinitiva(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);
    let calificacion = (<FormControl>this.formularioRegistraarCali.controls['calificacion']).value;

    let bindings = Injector.resolve([
      provide(ICustomModal,
        { useValue: new ModalConfirmarCalificaciionDefinitivaData(this,
          this.nombreEstudiante,
          calificacion, this.context.componenteLista.registroSeleccionado) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalConfirmarCalificaciionDefinitiva,
      bindings,
      modalConfig
    );
  }

  confirmarCalificacionIncompleto(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalConfirmarCalificacionIncompletaData(this) }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
    ]);

    dialog = this.modal.open(
      <any>ModalConfirmarCalificacionIncompleta,
      bindings,
      modalConfig
    );
  }*/

  confirmarActualizacion(): void {
    let incompleta: boolean;
    let calificacion: number;

    incompleta = (<FormControl>this.formularioRegistraarCali.controls['huboCalifIncompleta']).value;
    calificacion = (<FormControl>this.formularioRegistraarCali.controls['calificacion']).value;
    this.incompletaModalConfirmacion = (<FormControl>this.formularioRegistraarCali.controls['huboCalifIncompleta']).value;
    this.calificacionModalConfirmacion = (<FormControl>this.formularioRegistraarCali.controls['calificacion']).value;
    if (this.validarFormularioRegistroCalif()) {
      if (incompleta) {
        this.getControlRegistroCalif('calificacionOrdinaria').patchValue('');
        (<FormControl>this.formularioRegistraarCali.controls['calificacionIncompleta'])
          .setValue(calificacion);
        this.confirmarCalificacionIncompleto();
      } else {
        this.getControlRegistroCalif('calificacionIncompleta').patchValue('');
        (<FormControl>this.formularioRegistraarCali.controls['calificacionOrdinaria']).
        setValue(calificacion);
        this.confirmarCalificacionDefinitiva();
      }
    }
  }

  cambiarAuxiliar(valor: boolean): void {
    if (valor) {
      (<FormControl>this.formularioRegistraarCali.controls['comentarioAsistencia']).patchValue('');
      (<FormControl>this.formularioRegistraarCali.controls['asistencia']).patchValue(true);
      this.comentarios = false;
      this.auxiliarAsist = true;
    }else {
      (<FormControl>this.formularioRegistraarCali.controls['asistencia']).patchValue(false);
      this.comentarios = true;
      this.auxiliarAsist = false;
    }
  }

  cambioRadio(): boolean {
    if (this.auxiliarAsist) {
      (<FormControl>this.formularioRegistraarCali.controls['asistencia']).patchValue(true);
      this.comentarios = false;
      return true;
    }else {
      (<FormControl>this.formularioRegistraarCali.controls['asistencia']).patchValue(false);
      this.comentarios = true;
      return false;
    }
  }

  enviarFormularioRegistroCalificacion(): void {
    this.limpiarVariablesSession();
    let jsonFormulario = JSON.stringify(this.formularioRegistraarCali.value, null, 2);
    // this.dialog.close();
    this._spinner.start('registrarCalificacion');
    this.estudianteMateriaImpartidaService.putEstudianteMateriaImpartida(
      this.registroSeleccionado.id,
      jsonFormulario,
        this.erroresConsultas
      ).subscribe( response => {
        this.estudianteMateriaImpartidaService.getEstudianteMateriaImpartida(
          this.registroSeleccionado.id,
            this.erroresConsultas
          ).subscribe(
          response => {
            let estudianteMateria =
              new EstudianteMateriaImpartida(response.json());
            if (estudianteMateria.calificacionOrdinaria < 70) {
              this.consultarCorreoCoordinador(estudianteMateria);
            }
          }
        );
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('registrarCalificacion');
      },
      () => {
        this.onCambiosTabla();
        this._spinner.stop('registrarCalificacion');
        this.cerrarModalRegistroCalificaciones();
      }
    );
  }

  obtenerDocencia(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idRol~1:IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let correoCoordinador;
        // console.log('rol.idUsuario.nombre: ' + response.json().lista[0].id_usuario.nombre);
        this.idUsuarioRol = response.json().lista[0].id;
        // console.log('this.idUsuarioRol: ' + this.idUsuarioRol);
      },
      error => {
        // console.log(error);
      },
      () => {
      }
    );
  }

  consultarCorreoCoordinador(estudiannteMateria: EstudianteMateriaImpartida): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    if (estudiannteMateria.estudiante.id) {
      urlSearch.set('criterios', 'idRol~2:IGUAL,' + 'idUsuario.idProgramaDocente.id~'
        + estudiannteMateria.estudiante.promocion.programaDocente.id + ':IGUAL;AND');
    } else {
      urlSearch.set('criterios', 'idRol~2:IGUAL,' + 'idUsuario.idProgramaDocente.id~'
        + estudiannteMateria.estudianteMovilidadExterna.
          idPromocion.programaDocente.id + ':IGUAL;AND');
    }
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let correoCoordinador;
        response.json().lista.forEach((usurioRol) => {
          // console.log('rol.idUsuario.email: ' + usurioRol.id_usuario.email);
          correoCoordinador = usurioRol.id_usuario.email;
        });

        if (estudiannteMateria.estudiante.id) {
          this.enviarCorreo(estudiannteMateria.id,
            estudiannteMateria.estudiante.usuario.email);
          this.enviarCorreo(estudiannteMateria.id, 'docencia@colsan.edu.mx');
          this.enviarCorreo(estudiannteMateria.id, correoCoordinador);
        } else if (estudiannteMateria.estudianteMovilidadExterna.id) {
          this.enviarCorreoMovilidad(estudiannteMateria.id,
            estudiannteMateria.estudianteMovilidadExterna.usuario.email);
          this.enviarCorreoMovilidad(estudiannteMateria.id,
            'docencia@colsan.edu.mx');
          this.enviarCorreoMovilidad(estudiannteMateria.id, correoCoordinador);
        }
      },
      error => {
        //console.log(error);
      },
      () => {
      }
    );
  }

  cambiarAuxiliarCalif(valor: boolean): any {
    if (valor) {
      (<FormControl>this.formularioRegistraarCali.controls['huboCalifIncompleta']).patchValue(true);
      this.auxiliarCalif = true;
    }else {
      (<FormControl>this.formularioRegistraarCali.controls['huboCalifIncompleta']).patchValue(true);
      this.auxiliarCalif = false;
    }
  }

  cambioRadioCalif(): boolean {
    if (this.auxiliarCalif) {
      (<FormControl>this.formularioRegistraarCali.controls['huboCalifIncompleta']).patchValue(true);
      return true;
    }else {
      (<FormControl>this.formularioRegistraarCali.controls['huboCalifIncompleta']).patchValue(false);
      ///this.getControlRegistroCalif('comentarioAsistencia').patchValue('');
      return false;
    }
  }

  private enviarCorreo(estudianteMateria: number, correo: string): void {
    this._spinner.start('enviarCorreo');
    let formularioCorreo = new FormGroup({
      destinatario: new FormControl(correo),
      entidad: new FormControl({ estudianteMateriaImpartida: estudianteMateria,
        Usuarios: this.idUsuario, UsuariosRoles: this.idUsuarioRol}),
      idPlantillaCorreo: new FormControl('23')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._enviarCorreo
      .postCorreoElectronico(
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
      response => {},
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('enviarCorreo');
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('Correo Enviado a ' + correo);
        }*/
        this._spinner.stop('enviarCorreo');
      }
    );
  }

  private enviarCorreoMovilidad(estudiante: number, correo: string): void {
    this._spinner.start('enviarCorreoMovilidad');
    let formularioCorreo = new FormGroup({
      destinatario: new FormControl(correo),
      entidad: new FormControl({ estudianteMateriaImpartida: estudiante,
        Usuarios: this.idUsuario, UsuariosRoles: this.idUsuarioRol}),
      idPlantillaCorreo: new FormControl('42')
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this._enviarCorreo.postCorreoElectronico(
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
      response => {},
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('enviarCorreoMovilidad');
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log('Correo Enviado a ' + correo);
        }*/
        this._spinner.stop('enviarCorreoMovilidad');
      }
    );
  }

  // modal detalle de calificacion

  modalDetalleCalificacion() {
    // this.getInformacionAlumno();
    this.entidadEMI = this.registroSeleccionado;
    this.modalDetalleCalif.open('lg');

  }

  cerrarModalDetalleCalificacion() {
    this.modalDetalleCalif.close();
    this.entidadEMI = undefined;
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  private esEstudianteNormal(): boolean {
    let estudianteNormal: boolean = false;
    if (this.entidadEMI && this.entidadEMI.estudiante
      && this.entidadEMI.estudiante.id) {
      estudianteNormal = true;
    }

    return estudianteNormal;
  }

  // modal confirmar calificacion

  confirmarCalificacionIncompleto(): void {
    this.modalConfirmarCalifIncompleta.open();
  }

  cerrarConfirmarIncompleta() {
    this.modalConfirmarCalifIncompleta.close();
  }

  // modal calificacion definitiva

  confirmarCalificacionDefinitiva(): void {
    let calificacion = (<FormControl>this.formularioRegistraarCali.controls['calificacion']).value;
    this.calificacionModalConfirmacion = (<FormControl>this.formularioRegistraarCali.controls['calificacion']).value;
    this.mostrarMateria();
    this.modalConfirmarCalifDefinitiva.open('sm');
  }

  cerrarConfirmarCalidDefinitiva() {
    this.modalConfirmarCalifDefinitiva.close();
  }

  mostrarMateria(): void {
    let registrosMateria = this.registroSeleccionado;
    if ( !registrosMateria.interprograma ) {
      if (!registrosMateria.materiaImpartida.cursoOptativo.id) {
        this.materiaDetalleDef = registrosMateria.materiaImpartida.materia.descripcion;
      } else {
        this.materiaDetalleDef = registrosMateria.materiaImpartida.cursoOptativo.descripcion;
      }
    }else {
      this.materiaDetalleDef = registrosMateria.materiaInterprograma.materia.descripcion;
    }
  }


  /*******************************************
   *******************************************
   * INICIA MODA DE VALIDAR ACTA
  ********************************************
  ********************************************/
  validarActa(): void {
    this.modalValidarActaProfesor.open();
  }

  validarActaCalificacion(): void {
    if (this.usuarioRolProf.rol) {
      this.guardarActaCalificacion();
    }
  }

  guardarActaCalificacion(): void {
    if (this.usuarioRolProf.rol.id === 3) {
      this.formularioActa = new FormGroup({
          idMateriaImpartida: new FormControl(this.materiaImpartida.id),
          tipo: new FormControl('PROFESOR')
      });
      let actaJson = JSON.stringify(this.formularioActa.value, null, 2);
      this.postAcataCalificacion(actaJson);
    }
  }

  private postAcataCalificacion( actaJson ): void {

    this._spinner.start('validar');
    this.materiaImpartidaService.postFirma(
        actaJson,
        this.erroresConsultas
    ).subscribe(
        response => {
            // console.log(response.json());
        },
        error => {
            // console.log(error);
            this._spinner.stop('validar');
        },
        () => {
            this.cerrarModalValidarActa();
            this._spinner.stop('validar');
            this.busquedaListaEstudiantes();
        }
    );
  }

  cerrarModalValidarActa(): void {
    this.modalValidarActaProfesor.close();
  }

  /*******************************************
   *******************************************
   * TERMINA MODA DE VALIDAR ACTA
  ********************************************
  ********************************************/

/*  constructor() { }

  ngOnInit() {
  }*/

  limpiarVariablesSession() {
    sessionStorage.removeItem('calificacionCriterios');
    sessionStorage.removeItem('calificacionOrdenamiento');
    sessionStorage.removeItem('calificacionLimite');
    sessionStorage.removeItem('calificacionPagina');
  }

}
