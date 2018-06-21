import {Component, OnInit, Renderer, Injector, ElementRef} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {PromocionPeriodoEscolarService} from '../../services/entidades/promocion-periodo-escolar.service';
import {MateriaImpartidaService} from '../../services/entidades/materia-impartida.service';
import {ProfesorMateriaService} from '../../services/entidades/profesor-materia.service';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {EstudianteMateriaImpartidaService} from '../../services/entidades/estudiante-materia-impartida.service';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {ItemSelects} from '../../services/core/item-select.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Promocion} from '../../services/entidades/promocion.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {FormGroup, FormControl} from '@angular/forms';
import {Materia} from '../../services/entidades/materia.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {ProfesorMateria} from '../../services/entidades/profesor-materia.model';
import {AuthService} from '../../auth/auth.service';
import {Validacion} from '../../utils/Validacion';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';

@Component({
  selector: 'app-asistencia-list',
  templateUrl: './asistencia-list.component.html',
  styleUrls: ['./asistencia-list.component.css']
})
export class AsistenciaListComponent implements OnInit {

  promocionService: PromocionServices;
  promocionPeriodoService: PromocionPeriodoEscolarService;
  materiaImpartidaService: MateriaImpartidaService;
  profesorMateriaService: ProfesorMateriaService;
  usuarioRolService: UsuarioRolService;
  estudianteMateriaImpartidaService: EstudianteMateriaImpartidaService;
  formFiltro: FormGroup;
  paginacion: PaginacionInfo;
  opcionesSelectProgramaDocente: Array<ItemSelects> = [];
  erroresConsultas: Array<ErrorCatalogo> = [];
  listaPromociones: Array<Promocion> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  opcionesSelectMateria: Array<MateriaImpartida> = [];
  registros: Array<EstudianteMateriaImpartida> = [];
  promocionSeleccionada: number;
  programaSeleccionado: number;
  periodoSeleccionado: number;
  programaDocente: String = '';
  criteriosCabezera: String = '';
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  botonBuscar: boolean = false;
  coordinador: boolean;
  idProfesorMateriaSeleccionada: number;

  columnas: Array<any> = [
    { titulo: 'Matrícula', nombre: 'idEstudiante.idMatricula.matriculaCompleta'},
    { titulo: 'Nombre del estudiante',
      nombre: 'idEstudiante.idDatosPersonales.primerApellido'},
  ];
  configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstudiante.idDatosPersonales.nombre' }
  };

  private alertas: Array<Object> = [];
  private arregloIdProfesor: Array<number> = [];
  private idTipoTutorial: number = 3;
  private materiaElegidaSelect: Materia = undefined;

  constructor(private _spinner: SpinnerService,
              public _catalogosService: CatalogosServices,
              private authService: AuthService,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer) {
//    let usuarioLogueado: UsuarioSesion = Seguridad.getUsuarioLogueado();
    let usuarioLogueado: UsuarioSesion = this.authService.getUsuarioLogueado();
    this.formFiltro = new FormGroup({
      idProgramaDocente: new FormControl(''),
      idPromocion: new FormControl(''),
      idPeriodo: new FormControl(''),
      idMateriaImpartida: new FormControl(''),
    });
    this.getControl('idProgramaDocente').disable();
    this.getControl('idPromocion').disable();
    this.prepareServices();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
  }

  activarBotonBusqueda(numero: number): any {
    if (numero == 4) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }

  recuperarPermisosUsuario(id: number): void {
    // console.log(id);
    let urlSearch: URLSearchParams = new URLSearchParams();
    let usuarioRol: UsuarioRoles;

    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        // console.log(response.json());
        response.json().lista.forEach((elemento) => {
          usuarioRol = new UsuarioRoles (elemento);
          // console.log(usuarioRol);
          // console.log('');
          if (usuarioRol.rol.id == 2) {
            this.getControl('idProgramaDocente').enable();
            this.programaDocente = usuarioRol.usuario.programaDocente.descripcion;
            this.listarPromociones(usuarioRol.usuario.programaDocente.id);
            this.listaPromociones = [];
            this.listaPeriodos = [];
            this.opcionesSelectMateria = [];
            this.coordinador = true;
          }else if (usuarioRol.rol.id == 1) {
            this.coordinador = false;
            this.getControl('idProgramaDocente').enable();
            this.obtenerProgramasDocente();
          }
        });
      }
    );
  }

  listarPromociones(idPrograma): void {
    // console.log('idPrograma ' + idPrograma);
    this.listaPromociones = [];
    this.promocionSeleccionada = null;
    let urlSearch = new URLSearchParams();

    urlSearch.set('ordenamiento', 'abreviatura:ASC,consecutivo:ASC');
    if (idPrograma) {
      this.programaSeleccionado = idPrograma;
      urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL;AND,idEstatus~1235:NOT');
      this.promocionService.getListaPromocionesPag(this.erroresConsultas, urlSearch).
      subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPromociones.push(new Promocion(item));
        });
        if (this.listaPromociones.length == 0) {
          let mensaje = 'No hay promociones en el programa docente seleccionado';
          this.alertas.push({
            msg: mensaje,
            closable: true,
            tiempo: 3000
          });
        } else {
          this.getControl('idPromocion').enable();
        }
      });
      this.listaPeriodos = [];
      this.opcionesSelectMateria = [];
    }
  }

  listarPeriodos(idPromocion): void {
    // console.log('idPromocion ' + idPromocion);
    this.listaPeriodos = [];
    this.periodoSeleccionado = null;
    let urlSearch = new URLSearchParams();

    if (idPromocion) {
      this.promocionSeleccionada = idPromocion;
      urlSearch.set('criterios',
        'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
        ':IGUAL;AND');

      this.promocionPeriodoService.getListaPromocionPeriodoEscolarPaginacion(
        this.erroresConsultas,
        urlSearch
      ).subscribe(response => {
        response.json().lista.forEach((item) => {
          this.listaPeriodos.push(new PromocionPeriodoEscolar(item));
        });
        if (this.listaPeriodos.length == 0) {
          let mensaje = 'No hay periodos en la promoción seleccionada';
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

  listarMaterias(idPeriodoEscolar: number, idPromocion: number): void {
    this.opcionesSelectMateria = [];
    let urlParameter: URLSearchParams = new URLSearchParams();
    if (idPeriodoEscolar && idPromocion) {
      urlParameter.set('criterios', 'idPeriodoEscolar.id~' +
        idPeriodoEscolar +
        ':IGUAL;AND,idPromocion~' + idPromocion +
        ':IGUAL;AND');
      this._spinner.start('listaasistencia1');
      this.materiaImpartidaService.getListaMateriaImpartida(
        this.erroresConsultas,
        urlParameter,
        false).
      subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.opcionesSelectMateria.push(new MateriaImpartida(item));
          });

          // console.log(this.opcionesSelectMateria);
          if (this.opcionesSelectMateria.length == 0) {
            let mensaje = 'No hay materias en la promoción y período seleccionados';
            this.alertas.push({
              msg: mensaje,
              closable: true,
              tiempo: 3000
            });
          }/*else{
           this.opcionesSelectMateria.sort(function (a,b) {
           if(a.materia.descripcion < b.materia.descripcion)
           return -1;
           if(a.materia.descripcion > b.materia.descripcion)
           return 1;
           return 0;
           });
           }*/
        },
        error => {
          this._spinner.stop('listaasistencia1');
        },
        () => {
          this._spinner.stop('listaasistencia1');
        }
      );
    }
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  habilitarProgramas(): boolean {
    if (this.opcionesSelectProgramaDocente.length == 0) {
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
    if (this.opcionesSelectMateria.length == 0) {
      return true;
    }
    return false;
  }

  mostrarListaEstudiantes(): void {
    let materiaImpartidaTipoMateria = this.formFiltro.controls['idMateriaImpartida'].value;

    let arregloMateriaTipo: string[];
    arregloMateriaTipo = materiaImpartidaTipoMateria.split('-');
    let idMateriaImpartida = +arregloMateriaTipo[0];
    let idTipoMateria = +arregloMateriaTipo[1];
    if (idMateriaImpartida) {
      this.criteriosCabezera = 'idMateriaImpartida~' + idMateriaImpartida + ':IGUAL,' +
        'idMateriaInterprograma~' + idMateriaImpartida + ':IGUAL;OR';
      if (idTipoMateria == 3) {
        // Materia tipo tutorial, busqueda normal
        this.onCambiosTabla();
      } else {
        this.getListaEstudiantesOrdenados();
      }
      this.recuperarProfesorTitularMateria(idMateriaImpartida);
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    // console.log('criterios cabezera ' + this.criteriosCabezera);

    if (this.criteriosCabezera !== '') {
      // this.criteriosCabezera += 'ORGROUPAND,idEstudiante.idEstatus~1006:IGUAL';
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
      urlSearch.set('ordenamiento', 'idEstudiante.idDatosPersonales.primerApellido:ASC,' +
        'idEstudiante.idDatosPersonales.segundoApellido:ASC,idEstudiante.idDatosPersonales.nombre:ASC');
      urlSearch.set('limit', this.limite.toString());
      urlSearch.set('pagina', this.paginaActual.toString());
      // console.log('urlSearch', urlSearch);
      this._spinner.start('listaasistencia2');
      this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          let idregistrosTotales: Number = 0;
          let paginasArray: Array<number> = [];
          /*let idMateriaImpartidaEleccion =
            this.formFiltro.controls['idMateriaImpartida'].value;*/
          // El value del selecct esta compuesto por idMateriaImpartida y pot idTipoMateria
          let materiaImpartidaTipoMateria = this.formFiltro.controls['idMateriaImpartida'].value;

          let arregloMateriaTipo: string[];
          arregloMateriaTipo = materiaImpartidaTipoMateria.split('-');
          let idMateriaImpartidaEleccion = +arregloMateriaTipo[0];

          this.registros = [];
          this.arregloIdProfesor = [];
          for (let i = 0; i < paginacionInfoJson.paginas; i++) {
            paginasArray.push(i);
          }
          paginacionInfoJson.lista.forEach((item) => {
            let estudianteMateriaImpartida = new EstudianteMateriaImpartida(item);
            this.materiaElegidaSelect =
              estudianteMateriaImpartida.materiaImpartida.materia;
            if (estudianteMateriaImpartida.materiaInterprograma.id ===
              idMateriaImpartidaEleccion) {
              this.agregarEstudiantes(estudianteMateriaImpartida);

            } else if (!estudianteMateriaImpartida.materiaInterprograma.id) {
              this.agregarEstudiantes(estudianteMateriaImpartida);
            }
            this.agregarEstudiantesMovilidadExterna(estudianteMateriaImpartida);
            this.agregarIdProfesorDeMateriaTutorial(estudianteMateriaImpartida);
            // this.registros.push(new EstudianteMateriaImpartida(item));
          });

          if (this.registros.length === 0) {
            let mensaje = 'No hay estudiantes registrados en la materia seleccionada';
            this.alertas.push({
              msg: mensaje,
              closable: true,
              tiempo: 3000
            });
          }

          this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
          this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
        },
        error => {
/*          if (assertionsEnabled()) {
            console.error(error);
          }*/
          this._spinner.stop('listaasistencia2');
        },
        () => {
/*          if (assertionsEnabled()) {
            //console.log('paginacionInfo', this.paginacion);
            console.log('registros', this.registros);
            console.log('arreglo de ids de profesores par amateria tutorial',
              this.arregloIdProfesor);
          }*/
          // console.log('registros', this.registros);
          // console.log('arreglo de ids de profesores par amateria tutorial',
            // this.arregloIdProfesor);
          if (this.registros.length === 0) {
            let mensaje = 'No hay estudiantes registrados en la materia seleccionada';
            this.alertas.push({
              msg: mensaje,
              closable: true,
              tiempo: 3000
            });
          }
          this._spinner.stop('listaasistencia2');
        }
      );
    }
  }

  getListaEstudiantesOrdenados() {
    /*let idMateriaImpartida = this.formFiltro.controls['idMateriaImpartida'].value;*/
    // El value del selecct esta compuesto por idMateriaImpartida y pot idTipoMateria
    let materiaImpartidaTipoMateria = this.formFiltro.controls['idMateriaImpartida'].value;

    let arregloMateriaTipo: string[];
    arregloMateriaTipo = materiaImpartidaTipoMateria.split('-');
    let idMateriaImpartida = +arregloMateriaTipo[0];
    this.registros = [];
    this._spinner.start('ordenados');

    // Se agrega trecer parametro del metodo getListaEstudianteMateriaImpartidaOrdenada, como un 0 por default.
    // La lista ordenada solo es para materias NO TUTORIALES.

    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartidaOrdenada(
      this.erroresConsultas,
      idMateriaImpartida,
      0
    ).subscribe(
      response => {

        // this.registros = [];

        response.json().lista.forEach((item) => {
          this.registros.push(new EstudianteMateriaImpartida(item));
        });
      },
      error => {
        this._spinner.stop('ordenados');
      },
      () => {
        this._spinner.stop('ordenados');
      }
    );

  }

  agregarEstudiantes(registroEstudiante: EstudianteMateriaImpartida): void {
    if (registroEstudiante.estudiante.id
      && registroEstudiante.estudiante.estatus.id === 1006) {
      this.registros.push(registroEstudiante);
    }

  }

  agregarEstudiantesMovilidadExterna(registroEstudiante: EstudianteMateriaImpartida): void {
    if (registroEstudiante.estudianteMovilidadExterna.id &&
      registroEstudiante.estudianteMovilidadExterna.estatus.id === 1006) {
      this.registros.push(registroEstudiante);
    }
  }

  agregarIdProfesorDeMateriaTutorial(registroEstudiante: EstudianteMateriaImpartida): void {
    if (this.materiaEsTutorial(registroEstudiante.materiaImpartida.materia)) {
      if (!this.idProfesorEstaAgregado(registroEstudiante.estudiante.tutor.profesor.id)) {
        this.arregloIdProfesor.push(registroEstudiante.estudiante.tutor.profesor.id);
      }
    }
  }

  materiaEsTutorial(materia: Materia) {
    let materiaEsTutorial: boolean = false;

    if (materia && materia.tipoMateria.id === this.idTipoTutorial) {
      materiaEsTutorial = true;
    }

    return materiaEsTutorial;
  }

  idProfesorEstaAgregado(idProfesor: number): boolean {
    let estaAgregado: boolean = false;

    if (!(this.arregloIdProfesor.length < 0)) {
      this.arregloIdProfesor.forEach((item) => {
        if (item === idProfesor) {
          estaAgregado = true;
        }
      });
    }

    return estaAgregado;
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

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  /*exportar(tipo): void {
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
   }*/

  exportListaEstudiantes(tipo): void {
    if (this.materiaEsTutorial(this.materiaElegidaSelect)) {
      this._spinner.start('listaasistencia');
      this.arregloIdProfesor.forEach((idProfesor) => {
        this.exportar(tipo, idProfesor);
      });
    } else {
      this._spinner.start('listaasistencia');
      this.exportar(tipo, this.idProfesorMateriaSeleccionada);
    }
  }

  exportar(tipo, idProfesor): void {
    /*let idMateriaImpartida = this.formFiltro.controls['idMateriaImpartida'].value;*/
    // El value del selecct esta compuesto por idMateriaImpartida y pot idTipoMateria
    let materiaImpartidaTipoMateria = this.formFiltro.controls['idMateriaImpartida'].value;

    let arregloMateriaTipo: string[];
    arregloMateriaTipo = materiaImpartidaTipoMateria.split('-');
    let idMateriaImpartida = +arregloMateriaTipo[0];

    let urlExportListaAsistenciaPDF;
    this.materiaImpartidaService.getExportarListaAsistencia(
      idMateriaImpartida,
      idProfesor,
      tipo,
      this.erroresConsultas
    ).subscribe(
      response => {
        urlExportListaAsistenciaPDF = response.json();
        // console.log(urlExportListaAsistenciaPDF);
      },
      error => {
        this._spinner.stop('listaasistencia');
      },
      () => {
        this._spinner.stop('listaasistencia');
        window.open(urlExportListaAsistenciaPDF);

      }
    );
  }

  recuperarProfesorTitularMateria(idMateriaImpartida: number): void {

    // console.log(idMateriaImpartida);
    let urlSearch: URLSearchParams = new URLSearchParams();
    let profesorMateria: ProfesorMateria;

    urlSearch.set('criterios', 'idMateriaImpartida~' + idMateriaImpartida +
      ':IGUAL;AND,titular~true:IGUAL');
    this.profesorMateriaService.getListaProfesorMateriaOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        // console.log(response.json());
        response.json().lista.forEach((elemento) => {
          profesorMateria = new ProfesorMateria (elemento);
          this.idProfesorMateriaSeleccionada = profesorMateria.profesor.id;
          // console.log(this.idProfesorMateriaSeleccionada);
        });
      }
    );
  }

  private prepareServices(): void {
    this.promocionService = this._catalogosService.getPromocion();
    this.promocionPeriodoService = this._catalogosService.getPromocionPeriodoEscolarService();
    this.materiaImpartidaService = this._catalogosService.getMateriaImpartidaService();
    this.usuarioRolService = this._catalogosService.getUsuarioRolService();
    this.estudianteMateriaImpartidaService =
      this._catalogosService.getEstudianteMateriaImpartidaService();
    this.profesorMateriaService = this._catalogosService.getProfesorMateriaService();
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

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  private obtenerProgramasDocente(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    urlSearch.set('ordenamiento', 'descripcion:ASC');
    this.opcionesSelectProgramaDocente =
      this._catalogosService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas, urlSearch);
    this.listaPromociones = [];
    this.listaPeriodos = [];
    this.opcionesSelectMateria = [];
  }
//  constructor() { }

  ngOnInit() {
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

}
