import {Component, OnInit, ElementRef, Injector, ViewChild, Renderer} from '@angular/core';
import {FormGroup, FormControl} from '@angular/forms';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {Profesor} from "../../services/entidades/profesor.model";
import {MateriaImpartida} from "../../services/entidades/materia-impartida.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {MateriaImpartidaService} from "../../services/entidades/materia-impartida.service";
import {EstudianteMateriaImpartidaService} from "../../services/entidades/estudiante-materia-impartida.service";
import {ProgramaDocenteServices} from "../../services/entidades/programa-docente.service";
import {PromocionServices} from "../../services/entidades/promocion.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {PromocionPeriodoEscolar} from "../../services/entidades/promocion-periodo-escolar.model";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {TemarioParticular} from "../../services/entidades/temario-particular.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {EstudianteMateriaImpartida} from "../../services/entidades/estudiante-materia-impartida.model";
import {ConfigService} from "../../services/core/config.service";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

export class HistorialProfesorMateria {
  profesor: Profesor;
  materiaImpartida: MateriaImpartida;
  constructor(profesor: Profesor, materiaImpartida: MateriaImpartida) {
    this.profesor = profesor;
    this.materiaImpartida = materiaImpartida;
  }
}

@Component({
  selector: 'app-historial-materias',
  templateUrl: './historial-materias.component.html',
  styleUrls: ['./historial-materias.component.css']
})
export class HistorialMateriasComponent implements OnInit {

  @ViewChild('modalListaEstudiantes')
  modalListaEstudiantes: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  catalogoService: CatalogosServices;
  materiaImpartidaService: MateriaImpartidaService;
  estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService;
  programaDocenteService: ProgramaDocenteServices;
  promocionPeriodoService;
  promocionService: PromocionServices;
  periodoEscolarService;
  usuarioRolService;
  profesorMateriaService;
  profesorService;
  materiaImpartidaTutorialService;
  firmasValidacionService;
  archivoService;
  temarioParticularMateriaService;

  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesSelectMateria: Array<MateriaImpartida> = [];
  opcionesSelectProfesor: Array<Profesor> = [];

  registros: Array<HistorialProfesorMateria> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  listaPromociones: Array<ItemSelects> = [];

  formFiltro: FormGroup;
  registroSeleccionado: HistorialProfesorMateria;
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
  edicion: boolean;
  esCoordinador: boolean = false;
  materiasHabilitadas: boolean = true;
  materiaImpartida: MateriaImpartida;
  usuarioRolProf: UsuarioRoles;
  entidadTemarioParticular: TemarioParticular;
  materiaTutorial: boolean = false;

  columnas: Array<any> = [
    { titulo: 'Clave', nombre: 'idMateriaImpartida.idMateria.clave', sort: 'asc'},
    { titulo: 'Materia', nombre: 'idMateria', sort: false},
    { titulo: 'Período', nombre: 'idMateriaImpartida.idPeriodoEscolar.periodo', sort: 'asc'}
  ];
  configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idMateriaImpartida.idMateria.clave,' +
    'idMateriaImpartida.idMateria.descripcion' }
  };

  // variables modal lista de estudiantes //
  registrosDeEstudiantes: Array<EstudianteMateriaImpartida> = [];
  materiaImpartidaActula: MateriaImpartida;
  // fin de variables modal lista de estudiantes //

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private idMateriaElegida: Number;
  private ID_ROL_DOCENCIA: number = 1;
  private ID_ROL_COORDINADOR: number = 2;
  private ID_ROL_PROFESOR: number = 3;

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              private authService: AuthService,
              public _catalogosService: CatalogosServices) {
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.prepareServices();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.formFiltro = new FormGroup({
      idProgramaDocente: new FormControl(''),
      idPromocion: new FormControl(''),
      idMateriaImpartida: new FormControl(''),
      idProfesor: new FormControl('')
    });
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
          this.usuarioRol = new UsuarioRoles (elemento);
          this.usuarioRolProf = this.usuarioRol;
        });
      },
      error => {

      },
      () => {
        this.obtenerCatalogos();
        this.obtenerProgramaDocenteYPromocionCoordinador();
      }
    );
  }

  listarPeriodos(idPromocion): void {
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    this.materiaImpartida = null;
    this.materiasHabilitadas = true;
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
    this.getControlFormularioFiltro('idProfesor').patchValue('');
    this.getControlFormularioFiltro('idProfesor').disable();
    let urlSearch = new URLSearchParams();

    urlSearch.set('ordenamiento', 'abreviatura:ASC,consecutivo:ASC');
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL');

      this.listaPromociones = this.promocionService
        .getSelectPromocion(this.erroresConsultas, urlSearch);
      this.listaPeriodos = [];
      this.opcionesSelectMateria = [];
      this.getControlFormularioFiltro('idPromocion').enable();
    }

  }

  listaProfesores(idProgramaDocente, idPromocion): void {
 

    if (this.usuarioRol && (this.usuarioRol.rol.id !== this.ID_ROL_PROFESOR)) {
      this.getControlFormularioFiltro('idProfesor').disable();
      this.getControlFormularioFiltro('idProfesor').patchValue('');
      let urlSearch : URLSearchParams = new URLSearchParams();
      urlSearch.set('criterios', 'idMateriaImpartida.idPromocion.idProgramaDocente.id~' +
        idProgramaDocente +
        ':IGUAL;AND,idMateriaImpartida.idPromocion~' + idPromocion + ':IGUAL;AND');
urlSearch.set('ordenamiento', 'idProfesor.primerApellido:ASC, idProfesor.segundoApellido:ASC, idProfesor.nombre:ASC');

      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlSearch,
        this.configuracion.paginacion
      ).subscribe(
        response => {
          this.opcionesSelectProfesor = [];
          response.json().lista.forEach((profesorJson) => {
            // this.opcionesSelectProfesor.push(new Profesor(profesorJson.id_profesor));
            this.agregarProfesorALista(profesorJson);
          });
        },
        error => {

        },
        () => {
          this.habilitarSelectProfesores();
        }
      );
    }

  }

  agregarProfesorALista(profesorJson): void {
    let estaRepetido = false;
    if (this.opcionesSelectProfesor.length > 0) {
      this.opcionesSelectProfesor.forEach((profesor) => {
        if ( profesorJson.id_profesor.id == profesor.id) {
          estaRepetido = true;
        }
      });

      if (!estaRepetido) {
        this.opcionesSelectProfesor.push(new Profesor(profesorJson.id_profesor));
      }

    } else {
      this.opcionesSelectProfesor.push(new Profesor(profesorJson.id_profesor));
    }

  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 4) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  crearCriteriosBusqueda(): void {
    this.materiaTutorial = false;
    this.materiaImpartida = null;
    this.crearCriteriosSiEsDocencia();
    this.crearCriteriosSiEsCoordinador();
    this.crearCriteriosSiEsProfesor();
  }

  habilitarProgramas(): boolean {
    if (this.opcionesSelectProgramaDocente.length === 0) {
      return true;
    }
    return false;
  }

  habilitarPromociones(): boolean {
    if (this.listaPromociones.length === 0) {
      return true;
    }
    return false;
  }

  habilitarPeriodos(): boolean {
    if (this.listaPeriodos.length === 0) {
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

  habilitarSelectProfesores(): boolean {
    if (this.opcionesSelectProfesor.length > 0) {
      this.getControlFormularioFiltro('idProfesor').enable();
      return false;
    } else {
      return true;
    }
  }

  habilitarBotonBusqueda(idPromocion): void {
    if (idPromocion && this.usuarioRol) {
      if (this.usuarioRol.rol.id === this.ID_ROL_PROFESOR) {
        this.botonBuscar = true;
      } else {
        this.botonBuscar = false;
      }
    }
  }

  mostrarSelectProfesores(): boolean {
   if (this.usuarioRol && ((this.usuarioRol.rol.id === this.ID_ROL_COORDINADOR) ||
      this.usuarioRol.rol.id === this.ID_ROL_DOCENCIA)) {
      return true;
    } else {
      return false;
    }
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
      this.idProfesor = this.registroSeleccionado.profesor.id;
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
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let sinCalificacion : number = 0;

    this.registroSeleccionado = null;

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

      let ordenamiento = '';
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });

      urlSearch.set('ordenamiento', 'idMateriaImpartida.idMateria.clave:ASC,' +
        'idMateriaImpartida.idPeriodoEscolar.periodo:ASC');
      //console.log('urlSearch', urlSearch);
      this._spinner.start('historialmaterias1');
      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlSearch,
        this.configuracion.paginacion
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          this.registros = [];

          paginacionInfoJson.lista.forEach((item) => {
            this.registros.push(
              new HistorialProfesorMateria(
                new Profesor(item.id_profesor),
                new MateriaImpartida(item.id_materia_impartida)
              )
            );
          });

          //this.paginacion.registrosTotales = idregistrosTotales;

          if (this.registros.length === 0) {
            let mensaje = 'No tienes materias asignadas';
            this.alertas.push({
              msg: mensaje,
              closable: true,
              tiempo: 3000,
              type: 'danger'
            });
          }

          this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
          this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
        },
        error => {
/*          if (assertionsEnabled()) {
            console.error(error);
          }*/
          this._spinner.stop('historialmaterias1');
        },
        () => {
/*          if (assertionsEnabled()) {
            //console.log('paginacionInfo', this.paginacion);
            //console.log('registros', this.registros);
          }*/
          this._spinner.stop('historialmaterias1');
          this.crearCriteriosMateriasTutorialesSiEsProfesor();
          this.crearCriteriosMateriasTutorialesSiEsDocenciaCoordinador();
          this.agregarMateriasTutoriales();
        }
      );
    }
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  mostrarBotonDetalleTemario(): boolean {
    let hayTemario: boolean = false;
    if (this.registroSeleccionado &&
      this.registroSeleccionado.materiaImpartida.id) {
      hayTemario = true;
    }

    return hayTemario;
  }

  private agregarMateriasTutoriales(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', this.criteriosCabezera);
    urlSearch.set('ordenamiento', 'idMateriaImpartida.idMateria.clave:ASC,' +
      'idMateriaImpartida.idPeriodoEscolar.periodo:ASC');
    //console.log('urlSearch materias tutorial', urlSearch);
    this._spinner.start('historialmaterias2');
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlSearch,
    ).subscribe(
      response => {
        response.json().lista.forEach((estudianteMateria) => {
          if (!this.materiaImpartidaEstaAgregada(
              new EstudianteMateriaImpartida(estudianteMateria).materiaImpartida.id)) {
            this.registros.push(
              new HistorialProfesorMateria(
                new Profesor(estudianteMateria.id_estudiante.id_tutor.id_profesor),
                new MateriaImpartida(estudianteMateria.id_materia_impartida),
              )
            );
          }
        });
      },
      error => {
        this._spinner.stop('historialmaterias2');
      },
      () => {
        console.log('registroCompleto', this.registros);
        this._spinner.stop('historialmaterias2');
      }
    );

  }

  private materiaImpartidaEstaAgregada(idMateriaImpartida: number): boolean {
    let estaAgregada: boolean = false;
    this.registros.forEach((registro) => {
      if (registro.materiaImpartida.id == idMateriaImpartida) {
        //console.log('idMateriaimpartiada que entro', idMateriaImpartida);
        //console.log('idMateriaImpartida de los registros', registro.materiaImpartida.id);
        estaAgregada = true;
      }
    });
    //console.log('estaAgregada', estaAgregada);
    return estaAgregada;
  }

  private detalleTemarioParticular(): void {
    if (this.registroSeleccionado.materiaImpartida) {
      this.entidadTemarioParticular = undefined;
      let urlSearch: URLSearchParams = new URLSearchParams();
      urlSearch.set('criterios', 'idMateriaImpartida~' +
        this.registroSeleccionado.materiaImpartida.id + ':IGUAL;AND,' +
        'idProfesor~' + this.registroSeleccionado.profesor.id +
        ':IGUAL;AND');

      this._spinner.start('historialmaterias3');
      this.temarioParticularMateriaService.getListaTemarioParticularMateriaImpartida(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.entidadTemarioParticular =
              new TemarioParticular(item.id_temario_particular);
          });
        },
        error => {
          this._spinner.stop('historialmaterias3');
        },
        () => {
          this._spinner.stop('historialmaterias3');
          //console.log(this.entidadTemarioParticular);
          if (this.entidadTemarioParticular) {
            this.verArchivo();
          } else {
            let mensaje = 'El profesor no ha subido el temario';
            this.alertas.push({
              msg: mensaje,
              type: 'danger',
              closable: true,
              tiempo: 3000
            });
          }
        }
      );
    }

  }

/*  private modalListaDeEstudiantes(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: new ModalDetalleEstudiantesData(
        this.registroSeleccionado.materiaImpartida,
        this
      )
      }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
      <any>ModalDetalleEstudiantes,
      bindings,
      modalConfig
    );
  }*/

  private crearCriteriosSiEsDocencia(): void {
    if (this.usuarioRol.rol.id === this.ID_ROL_DOCENCIA) {
      let idProfesor = this.formFiltro.controls['idProfesor'].value;
      let idProgramaDocente = this.formFiltro.controls['idProgramaDocente'].value;
      let idPromocion = this.formFiltro.controls['idPromocion'].value;
      this.criteriosCabezera = 'idMateriaImpartida.idPromocion.idProgramaDocente.id~' +
        idProgramaDocente +
        ':IGUAL;AND,idMateriaImpartida.idPromocion~' + idPromocion + ':IGUAL;AND,' +
        'idProfesor~' + idProfesor + ':IGUAL;AND';
      this.onCambiosTabla();
    }
  }

  private crearCriteriosSiEsProfesor(): void {


    if (this.usuarioRol.rol.id === this.ID_ROL_PROFESOR) {
      let idProgramaDocente = this.formFiltro.controls['idProgramaDocente'].value;
      let idPromocion = this.formFiltro.controls['idPromocion'].value;
      this.criteriosCabezera = 'idMateriaImpartida.idPromocion.idProgramaDocente.id~' +
        idProgramaDocente +
        ':IGUAL;AND,idMateriaImpartida.idPromocion~' + idPromocion + ':IGUAL;AND,' +
        'idProfesor.idUsuario~' + this.usuarioRol.usuario.id + ':IGUAL;AND';
      this.onCambiosTabla();
    }
  }

  private crearCriteriosSiEsCoordinador(): void {
    if (this.usuarioRol.rol.id === this.ID_ROL_COORDINADOR) {
      let idProfesor = this.formFiltro.controls['idProfesor'].value;
      let idProgramaDocente = this.formFiltro.controls['idProgramaDocente'].value;
      let idPromocion = this.formFiltro.controls['idPromocion'].value;
      this.criteriosCabezera = 'idMateriaImpartida.idPromocion.idProgramaDocente.id~' +
        idProgramaDocente +
        ':IGUAL;AND,idMateriaImpartida.idPromocion~' + idPromocion + ':IGUAL;AND,' +
        'idProfesor~' + idProfesor + ':IGUAL;AND';
      this.onCambiosTabla();
    }
  }

  private crearCriteriosMateriasTutorialesSiEsProfesor(): void {

    if (this.usuarioRol.rol.id === this.ID_ROL_PROFESOR) {
      let idProgramaDocente = this.formFiltro.controls['idProgramaDocente'].value;
      let idPromocion = this.formFiltro.controls['idPromocion'].value;
      this.criteriosCabezera = 'idMateriaImpartida.idPromocion~'
        + idPromocion + ':IGUAL;AND,' +
        'idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND,' +
        'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND,' +
        'idEstudiante.idTutor.idProfesor.idUsuario~' +
        this.usuarioRol.usuario.id + ':IGUAL;AND';
    }
  }

  private crearCriteriosMateriasTutorialesSiEsDocenciaCoordinador(): void {

    if (this.usuarioRol.rol.id === this.ID_ROL_COORDINADOR ||
      this.usuarioRol.rol.id === this.ID_ROL_DOCENCIA) {
      let idProfesor = this.formFiltro.controls['idProfesor'].value;
      let idProgramaDocente = this.formFiltro.controls['idProgramaDocente'].value;
      let idPromocion = this.formFiltro.controls['idPromocion'].value;
      this.criteriosCabezera = 'idMateriaImpartida.idPromocion~'
        + idPromocion + ':IGUAL;AND,' +
        'idMateriaImpartida.idMateria.idTipo.id~3:IGUAN;AND,' +
        'idMateriaImpartida.idEstatus.id~1222:IGUAL;AND,' +
        'idEstudiante.idTutor.idProfesor~' + idProfesor + ':IGUAL;AND';
    }
  }

  private verArchivo(): void {
    if (this.entidadTemarioParticular.archivoTemario.id) {
      let jsonArchivo = '{"idArchivo": ' +
        this.entidadTemarioParticular.archivoTemario.id + '}';
      this._spinner.start('historialmaterias4');
      this.archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              this.entidadTemarioParticular.archivoTemario.id +
              '?ticket=' +
              json.ticket;
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop('historialmaterias4');
          },
          () => {
            //console.info('OK');
            this._spinner.stop('historialmaterias4');
          }
        );
    }
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  private obtenerCatalogos(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('ordenamiento', 'descripcion:ASC');

    this.opcionesSelectProgramaDocente =
      this.catalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    this.opcionesSelectMateria = [];
  }

  private obtenerProgramaDocenteYPromocionCoordinador(): void {
    if (this.usuarioRol.rol.id === this.ID_ROL_COORDINADOR) {
      this.setearSelectProgramaDocenteCoordinador();
      this.listarPromociones(this.usuarioRol.usuario.programaDocente.id);
      this.esCoordinador = true;
      this.getControlFormularioFiltro('idProgramaDocente').disable();
    }
  }

  private setearSelectProgramaDocenteCoordinador(): void {
    (<FormControl>this.formFiltro.controls['idProgramaDocente']).patchValue(this.usuarioRol.usuario.programaDocente.id);
//    updateValue(this.usuarioRol.usuario.programaDocente.id);
  }

  private getControlFormularioFiltro(campo: string): FormControl {
    return(<FormControl>this.formFiltro.controls[campo]);
  }


  /*************************************
   *************************************
   * INICIA MODAL LISTA DE ESTUDIANTES *
   *************************************
  *************************************/
  modalListaDeEstudiantes(): void {
    this.obtenerMateriaImpartadiaElegida();
    this.obtenerEstudiantes();
    this.modalListaEstudiantes.open('lg');
  }

  obtenerMateriaImpartadiaElegida(): void {
    this.materiaImpartidaActula =
      this.registroSeleccionado.materiaImpartida;
  }

  obtenerEstudiantes(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
        let criterios = 'idMateriaImpartida~' + this.materiaImpartidaActula.id +
            ':IGUAL,idMateriaInterprograma~' + this.materiaImpartidaActula.id + ':IGUAL;OR';

        if ( this.materiaImpartidaActula.materia.tipoMateria.id === 3) {
            criterios  +=
            'GROUPAND,idEstudiante.idTutor.idProfesor~' + this.idProfesor +
            ':IGUAL;AND';
        }

        urlSearch.set('criterios', criterios);
        this._spinner.start('buscarAlumno');
        this.estudianteMateriaImpartidaService
            .getListaEstudianteMateriaImpartida(
                this.erroresConsultas,
                urlSearch
            ).subscribe(
                response => {
                    response.json().lista.forEach((item) => {
                        let estudianteMateriaImpartida = new EstudianteMateriaImpartida(item);
                            if (estudianteMateriaImpartida.materiaInterprograma.id ===
                                this.materiaImpartidaActula.id) {
                                this.agregarEstudiantes(estudianteMateriaImpartida);

                            } else if (!estudianteMateriaImpartida.materiaInterprograma.id) {
                                this.agregarEstudiantes(estudianteMateriaImpartida);
                            }
                            this.agregarEstudiantesMovilidadExterna(estudianteMateriaImpartida);
                        }
                    );
                },
                error => {
                    this._spinner.stop('buscarAlumno');
                },
                () => {
                    this._spinner.stop('buscarAlumno');
                }
        );
  }

  agregarEstudiantes(registroEstudiante: EstudianteMateriaImpartida): void {
        if (registroEstudiante.estudiante.id
            && registroEstudiante.estudiante.estatus.id === 1006) {
            this.registrosDeEstudiantes.push(registroEstudiante);
        }

    }

  agregarEstudiantesMovilidadExterna(registroEstudiante: EstudianteMateriaImpartida): void {
    if (registroEstudiante.estudianteMovilidadExterna.id &&
        registroEstudiante.estudianteMovilidadExterna.estatus.id === 1006) {
            this.registrosDeEstudiantes.push(registroEstudiante);
        }
  }


  cerrarModalListaEstudiantes(): void {
    this.registrosDeEstudiantes = [];
    this.materiaImpartidaActula = undefined;
    this.modalListaEstudiantes.close();
  }
   /*************************************
   *************************************
   * INICIA MODAL LISTA DE ESTUDIANTES *
   *************************************
  *************************************/

  private prepareServices(): void {
    this.catalogoService = this._catalogosService;
    this.materiaImpartidaService =
      this._catalogosService.getMateriaImpartidaService();
    this.estudianteMateriaImpartidaService =
      this._catalogosService.getEstudianteMateriaImpartidaService();
    this.programaDocenteService =
      this._catalogosService.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosService.getPromocion();
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
    this.archivoService =
      this._catalogosService.getArchivos();
    this.temarioParticularMateriaService =
      this._catalogosService.getMateriaImpartidaTemarioParticularService();
  }

  ngOnInit() {
  }

}
