import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {MateriaImpartidaService} from '../../services/entidades/materia-impartida.service';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {ProgramaDocenteServices} from '../../services/entidades/programa-docente.service';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {ItemSelects} from '../../services/core/item-select.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {FormGroup, FormControl} from '@angular/forms';
import {TemarioParticular} from '../../services/entidades/temario-particular.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {AuthService} from '../../auth/auth.service';
import {URLSearchParams} from '@angular/http';
import {Profesor} from '../../services/entidades/profesor.model';
import {ConfigService} from "../../services/core/config.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

export class RegistroMateriaProfesor {
  profesor: Profesor;
  materiaImpartida: MateriaImpartida;
  titular: boolean;
  constructor(profesor: Profesor, materiaImpartida: MateriaImpartida,
              titular: boolean) {
    this.profesor = profesor;
    this.materiaImpartida = materiaImpartida;
    this.titular = titular;
  }
}

@Component({
  selector: 'app-temarios-particulares',
  templateUrl: './temarios-particulares.component.html',
  styleUrls: ['./temarios-particulares.component.css']
})
export class TemariosParticularesComponent implements OnInit {


  catalogoService: CatalogosServices;
  materiaImpartidaService: MateriaImpartidaService;
  estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService;
  programaDocenteService: ProgramaDocenteServices;
  promocionPeriodoService;
  promocionService: PromocionServices;
  periodoEscolarService;
  profesorMateriaService;
  profesorService;
  usuarioRolService;
  materiaImpartidaTutorialService;
  firmasValidacionService;
  archivoService;
  temarioParticularMateriaService;

  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  opcionesSelectMateria: Array<MateriaImpartida> = [];

  registros: Array<RegistroMateriaProfesor> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  listaPromociones: Array<ItemSelects> = [];

  formFiltro: FormGroup;
  registroSeleccionado: RegistroMateriaProfesor;
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
  esCoordinador: boolean = false;
  materiasHabilitadas: boolean = true;
  materiaImpartida: MateriaImpartida;
  usuarioRolProf: UsuarioRoles;
  entidadTemarioParticular: TemarioParticular;
  materiaTutorial: boolean = false;

  columnas: Array<any> = [
    { titulo: 'Nombre', nombre: 'idProfesor.primerApellido', sort: 'asc'},
    { titulo: 'Materia', nombre: 'idMateria', sort: false},
    { titulo: 'Titular', nombre: 'idProfesor', sort: false}
  ];
  configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre,' +
    'idEstudiante.idDatosPersonales.primerApellido,' +
    'idEstudiante.idDatosPersonales.segundoApellido' }
  };

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private idMateriaElegida;

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              private authService: AuthService,
              public _catalogosService: CatalogosServices) {
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
  //  this.idUsuario = usuarioLogueado.id;
    this.prepareServices();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.formFiltro = new FormGroup({
            idProgramaDocente: new FormControl(''),
            idMateriaImpartida: new FormControl(''),
    });
    (<FormControl>this.formFiltro.controls['idMateriaImpartida']).disable();
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
    (<FormControl>this.formFiltro.controls['idMateriaImpartida']).disable();
    (<FormControl>this.formFiltro.controls['idMateriaImpartida']).patchValue('');
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
          this.mostrarMensajeTipoAlert(
            'No se encontraron periodos para la promoción seleccionada',
            'danger'
          );
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
    (<FormControl>this.formFiltro.controls['idMateriaImpartida']).disable();
    (<FormControl>this.formFiltro.controls['idMateriaImpartida']).patchValue('');
    let urlSearch = new URLSearchParams();
    urlSearch.set('ordenamiento', 'abreviatura:ASC,consecutivo:ASC');
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL');

      this.listaPromociones = this.promocionService
        .getSelectPromocion(this.erroresConsultas, urlSearch);
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
    this.materiaTutorial = false;
    this.materiaImpartida = null;
    this.idMateriaElegida = this.formFiltro.controls['idMateriaImpartida'].value;
    if (this.idMateriaElegida) {
      if (this.materiaElegidaEsTutorial(this.idMateriaElegida)) {
        this.buscarProfesoresMateriasTutoriales(this.idMateriaElegida);
      } else {
        this.criteriosCabezera = 'idMateriaImpartida~' + this.idMateriaElegida +
          ':IGUAL';
        this.onCambiosTabla();
      }
    }
  }

  busquedaListaMaterias(idPeriodoEscolar: number, idPromocion: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.opcionesSelectMateria = [];
    this.materiaImpartida = null;
    this.materiasHabilitadas = true;
    (<FormControl>this.formFiltro.controls['idMateriaImpartida']).disable();
    (<FormControl>this.formFiltro.controls['idMateriaImpartida']).patchValue('');
    if (idPeriodoEscolar) {
      urlParameter.set('criterios', 'idPeriodoEscolar.id~' +
        idPeriodoEscolar +
        ':IGUAL;AND,idPromocion~' + idPromocion + ':IGUAL;AND,idEstatus~1222:IGUAL;AND');
      this._spinner.start('temariosparticulares1');
      this.materiaImpartidaService.
      getListaMateriaImpartida(this.erroresConsultas, urlParameter).
      subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.opcionesSelectMateria.push(
              new MateriaImpartida(item));
          });
        },
        error => {
          this._spinner.stop('temariosparticulares1');
        },
        () => {
          this._spinner.stop('temariosparticulares1');
          //console.log('opcionesSelectMateria', this.opcionesSelectMateria);
          if (this.opcionesSelectMateria.length === 0) {
            this.mostrarMensajeTipoAlert(
              'No tiene materias asignadas con la promoción y período seleccionados',
              'danger'
            );
          }else {
            this.materiasHabilitadas = false;
            (<FormControl>this.formFiltro.controls['idMateriaImpartida']).enable();
          }
        }
      );
    }
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

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

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

      urlSearch.set('ordenamiento', ordenamiento);
      // urlSearch.set('limit', this.limite.toString());
      //urlSearch.set('pagina', this.paginaActual.toString());
      this._spinner.start('temariosparticulares2');
      this.profesorMateriaService.getListaProfesorMateria(
        this.erroresConsultas,
        urlSearch,
        false
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          this.registros = [];

          paginacionInfoJson.lista.forEach((item) => {
            this.registros.push(
              new RegistroMateriaProfesor(
                new Profesor(item.id_profesor),
                new MateriaImpartida(item.id_materia_impartida),
                item.titular
              )
            );
          });

          //this.paginacion.registrosTotales = idregistrosTotales;
          /*

           */
          this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
          this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
        },
        error => {
/*          if (assertionsEnabled()) {
            console.error(error);
          }*/
          this._spinner.stop('temariosparticulares2');
        },
        () => {
/*          if (assertionsEnabled()) {
            //console.log('paginacionInfo', this.paginacion);
            //console.log('registros', this.registros);
          }*/
          this._spinner.stop('temariosparticulares2');
          if (this.registros.length === 0) {
            this.mostrarMensajeTipoAlert(
              'No hay profesores en la materia seleccionada',
              'danger'
            );
          }
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

  private materiaElegidaEsTutorial(idMateriaImpartida) {
    let esTutorial = false;
    this.opcionesSelectMateria.forEach((materiaImpartida) => {
      if ((materiaImpartida.id == idMateriaImpartida) &&
        (materiaImpartida.materia.tipoMateria.id ===  3)) {
        esTutorial = true;
      }
    });
    return esTutorial;
  }

  private buscarProfesoresMateriasTutoriales(idMateriaImpartida: number): void {

    let urlSerach: URLSearchParams = new URLSearchParams();
    urlSerach.set('criterios', 'idMateriaImpartida~' + idMateriaImpartida + ':IGUAL');
    urlSerach.set('ordenamiento', 'idEstudiante.idTutor.idProfesor.primerApellido:ASC');
    this._spinner.start('temariosparticulares3');
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlSerach
    ). subscribe(
      response => {
        this.registros = [];
        response.json().lista.forEach((item) => {
          if (!this.profesorEstaAgregado(item.id_estudiante.id_tutor.id_profesor.id)) {
            this.registros.push(
              new RegistroMateriaProfesor(
                new Profesor(item.id_estudiante.id_tutor.id_profesor),
                new MateriaImpartida(item.id_materia_impartida),
                true)
            );
          }
        });
      },
      error => {
        this._spinner.stop('temariosparticulares3');
      },
      () => {
        this._spinner.stop('temariosparticulares3');
        if (this.registros.length === 0) {
          this.mostrarMensajeTipoAlert(
            'No hay profesores en la materia seleccionada',
            'danger'
          );
        }
      }
    );

  }

  private profesorEstaAgregado(idProfesor) {
    let estaAgregado = false;
    this.registros.forEach((profesor) => {
      if (profesor.profesor.id === idProfesor)  {
        estaAgregado = true;
      }
    });
    return estaAgregado;
  }

  private detalleTemarioParticular(): void {
    if (this.registroSeleccionado.materiaImpartida) {
      this.entidadTemarioParticular = undefined;
      let urlSearch: URLSearchParams = new URLSearchParams();
      urlSearch.set('criterios', 'idMateriaImpartida~' +
        this.registroSeleccionado.materiaImpartida.id + ':IGUAL;AND,' +
        'idProfesor~' + this.registroSeleccionado.profesor.id +
        ':IGUAL;AND');
      this._spinner.start('temariosparticulares4');
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
          this._spinner.stop('temariosparticulares4');
        },
        () => {
          this._spinner.stop('temariosparticulares4');
          if (this.entidadTemarioParticular) {
            this.verArchivo();
          } else {
            this.mostrarMensajeTipoAlert(
              'El profesor no ha subido el temario',
              'danger'
            );
          }
        }
      );
    }

  }


  private verArchivo(): void {
    if (this.entidadTemarioParticular.archivoTemario.id) {
      let jsonArchivo = '{"idArchivo": ' +
        this.entidadTemarioParticular.archivoTemario.id + '}';
      this._spinner.start('temariosparticulares5');
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
            this._spinner.stop('temariosparticulares5');
          },
          () => {
            //console.info('OK');
            this._spinner.stop('temariosparticulares5');
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
    if (this.usuarioRol.rol.id === 2) {
      this.setearSelectProgramaDocenteCoordinador();
      this.listarPromociones(this.usuarioRol.usuario.programaDocente.id);
      this.esCoordinador = true;
      (<FormControl>this.formFiltro.controls['idProgramaDocente']).disable();
    }
  }

  private setearSelectProgramaDocenteCoordinador(): void {
    (<FormControl>this.formFiltro.controls['idProgramaDocente']).patchValue(this.usuarioRol.usuario.programaDocente.id);
//    updateValue(this.usuarioRol.usuario.programaDocente.id);
  }

  private mostrarMensajeTipoAlert(mensaje: string, tipo: string) {
    this.alertas.push({
      msg: mensaje,
      type: tipo,
      closable: true,
      tiempo: 3000
    });
  }

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
