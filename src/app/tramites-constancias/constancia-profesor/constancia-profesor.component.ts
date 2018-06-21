import {Component, OnInit, Renderer, Injector, ElementRef} from '@angular/core';
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {MateriaImpartidaService} from "../../services/entidades/materia-impartida.service";
import {EstudianteMateriaImpartidaService} from "../../services/entidades/estudiante-materia-impartida.service";
import {MateriaImpartida} from "../../services/entidades/materia-impartida.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {PromocionPeriodoEscolar} from "../../services/entidades/promocion-periodo-escolar.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ErrorCatalogo} from "../../services/core/error.model";
import {EstudianteMateriaImpartida} from "../../services/entidades/estudiante-materia-impartida.model";
import {TemarioParticular} from "../../services/entidades/temario-particular.model";
import {URLSearchParams} from "@angular/http";
import {FormControl, FormGroup} from "@angular/forms";
import {Profesor} from "../../services/entidades/profesor.model";
import {ConfigService} from "../../services/core/config.service";
import {AuthService} from "../../auth/auth.service";
import {PromocionServices} from "../../services/entidades/promocion.service";
import {ProgramaDocenteServices} from "../../services/entidades/programa-docente.service";


export class RegistroMateriaProfesor {
  idProfesorMateria: number;
  profesor: Profesor;
  materiaImpartida: MateriaImpartida;
  titular: boolean;
  constructor(id: number, profesor: Profesor, materiaImpartida: MateriaImpartida,
              titular: boolean) {
    this.idProfesorMateria = id;
    this.profesor = profesor;
    this.materiaImpartida = materiaImpartida;
    this.titular = titular;
  }
}

@Component({
  selector: 'app-constancia-profesor',
  templateUrl: './constancia-profesor.component.html',
  styleUrls: ['./constancia-profesor.component.css']
})
export class ConstanciaProfesorComponent {

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
  criteriosCabezeraTutoriales: string = '';
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
  listaEstudianteMateriaTutorial: Array<EstudianteMateriaImpartida> = [];


  columnas: Array<any> = [
    { titulo: 'Clave', nombre: 'idMateria', sort: false},
    { titulo: 'Materia', nombre: 'idMateria', sort: false},
    { titulo: 'Nombre', nombre: 'idProfesor.primerApellido', sort: 'asc'},
    { titulo: 'Tipo', nombre: 'idProfesor', sort: false},
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
  private idMateriaElegida: Number;

  constructor(//private modal: Modal,
              private elementRef: ElementRef,
              private _promocionService: PromocionServices,
              private authService: AuthService,
              private _programadocenteService : ProgramaDocenteServices,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              public _catalogosService: CatalogosServices) {

    let usuarioLogueado = this.authService.getUsuarioLogueado();//Seguridad.getUsuarioLogueado();
    this.idUsuario = usuarioLogueado.id;
    this.prepareServices();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    this.formFiltro = new FormGroup({
      idProgramaDocente: new FormControl(''),
      idPeriodoEscolar: new FormControl(''),
      idPromocion: new FormControl(''),
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
          this.usuarioRol = new UsuarioRoles  (elemento);
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
    if (numero === 3) {
      this.botonBuscar = true;
    }else {
      this.botonBuscar = false;
    }
  }


  borrar(){
    sessionStorage.removeItem('cProfesorIdPeriodoEscolar');
  sessionStorage.removeItem('cProfesorIdPromocion');
  sessionStorage.removeItem('profesorCriterios');
     //sessionStorage.removeItem('interesadosOrdenamiento');
  }

  criteriosBusquedaMaterias(): void {
    this.borrar();
    this.materiaTutorial = false;
    this.materiaImpartida = null;
    let idPeriodoEscolar = this.formFiltro.controls['idPeriodoEscolar'].value;
    let idPromocion = this.formFiltro.controls['idPromocion'].value;
    /*if (this.idMateriaElegida) {
     if (this.materiaElegidaEsTutorial(this.idMateriaElegida)) {
     this.buscarProfesoresMateriasTutoriales(this.idMateriaElegida);
     } else {
     this.criteriosCabezera = 'idMateriaImpartida~' + this.idMateriaElegida +
     ':IGUAL';
     this.onCambiosTabla();
     }
     }*/
    this.criteriosCabezera = 'idMateriaImpartida.idPeriodoEscolar~' + idPeriodoEscolar +
        ':IGUAL,idMateriaImpartida.idPromocion~' + idPromocion + ':IGUAL,idMateriaImpartida.idEstatus~1222';
    this.criteriosCabezeraTutoriales =
        'idMateriaImpartida.idPeriodoEscolar~' + idPeriodoEscolar +
        ':IGUAL,idMateriaImpartida.idPromocion~' + idPromocion +
        ':IGUAL,idMateriaImpartida.idEstatus~1222:IGUAL,' +
        'idMateriaImpartida.idMateria.idTipo~3:IGUAL';
    this.onCambiosTabla();

  sessionStorage.setItem('cProfesorIdPeriodoEscolar', idPeriodoEscolar.toString());
  sessionStorage.setItem('cProfesorIdPromocion', idPromocion.toString());


  }

  busquedaListaMaterias(idPeriodoEscolar: number, idPromocion: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.opcionesSelectMateria = [];
    this.materiaImpartida = null;
    this.materiasHabilitadas = true;

    if (idPeriodoEscolar) {
      urlParameter.set('criterios', 'idPeriodoEscolar.id~' +
          idPeriodoEscolar +
          ':IGUAL;AND,idPromocion~' + idPromocion + ':IGUAL;AND,idEstatus~1222:IGUAL;AND');
      this._spinner.start('bus');
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
            this._spinner.stop('bus');
          },
          () => {
            this._spinner.stop('bus');
            //console.log('opcionesSelectMateria', this.opcionesSelectMateria);
            if (this.opcionesSelectMateria.length === 0) {
              this.mostrarMensajeTipoAlert(
                  'No tiene materias asignadas con la promoción y período seleccionados',
                  'danger'
              );
            }else {
              this.materiasHabilitadas = false;
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
    this.registros = [];
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

    if (!sessionStorage.getItem('profesorCriterios')) {
    sessionStorage.setItem('profesorCriterios', criterios);
    }
      
  urlSearch.set('criterios', sessionStorage.getItem('profesorCriterios'));
      

      let ordenamiento = '';
      this.columnas.forEach((columna) => {
        if (columna.sort) {
          ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
              columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
      });

    /*if (!sessionStorage.getItem('interesadosOrdenamiento')) {
    
      sessionStorage.setItem('interesadosOrdenamiento', ordenamiento);
    }
    */

  urlSearch.set('ordenamiento', 'idMateriaImpartida.idMateria.clave:ASC');
      // urlSearch.set('limit', this.limite.toString());
      //urlSearch.set('pagina', this.paginaActual.toString());
      this._spinner.start('tabla');
      this.profesorMateriaService.getListaProfesorMateria(
          this.erroresConsultas,
          urlSearch,
          false
      ).subscribe(
          response => {
            let materiaImpartidaElegida;
            let paginacionInfoJson = response.json();
            this.registros = [];
            let profesorMateria;

            paginacionInfoJson.lista.forEach((item) => {
              /*if (this.materiaElegidaEsTutorial(materiaImpartidaElegida)) {
               this.materiaTutorial = true;
               this.buscarProfesoresMateriasTutoriales(materiaImpartidaElegida.id);
               } */
              //console.log(item);
              let profesor = new Profesor(item.id_profesor);
              materiaImpartidaElegida = new MateriaImpartida(item.id_materia_impartida);
              this.registros.push(
                  new RegistroMateriaProfesor(
                      item.id,
                      profesor,
                      materiaImpartidaElegida,
                      item.titular
                  )
              );
            });

            this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
            this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
          },
          error => {
            this._spinner.stop('tabla');
          },
          () => {
            this.buscarProfesoresMateriasTutoriales();
            this._spinner.stop('tabla');
            if (this.registros.length === 0 && !this.materiaTutorial) {
              this.mostrarMensajeTipoAlert(
                  'No hay materias para el período seleccionado',
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

  generarConstancia(): void {
    //console.log('Generar constancia');
    //console.log(this.registroSeleccionado);
    //console.log(this.registroSeleccionado.materiaImpartida.materia.tipoMateria.id);
    if (this.registroSeleccionado.materiaImpartida.materia.tipoMateria.id == 3) {
      //console.log('Es tutorial');
      this.generarConstanciaTutorial();
    } else {
      //console.log('No es tutorial');
      this.generarConstanciaMateriaNotutorial();
    }
  }

  generarConstanciaMateriaNotutorial(): void {
    this._spinner.start('geneCons');
    this.profesorMateriaService.getConstancia(
        this.registroSeleccionado.idProfesorMateria,
        this.erroresConsultas
    ).subscribe(
        response => {
          this.exportarFormato = response.json();
          this._spinner.stop('geneCons');
        },
        error => {
          console.error(error);
          this._spinner.stop('geneCons');
        },
        () => {
          window.open(this.exportarFormato);
          this._spinner.stop('geneCons');
        }
    );
  }

  generarConstanciaTutorial(): void {
    this._spinner.start('geneConstut');
    let constanciaProfesor;
    let estudianteTutor: EstudianteMateriaImpartida;
    let buscarEstudiante: boolean = true;
    this.listaEstudianteMateriaTutorial.forEach( (emi) => {
      if (buscarEstudiante) {
        if (emi.materiaImpartida.id === this.registroSeleccionado.materiaImpartida.id
            && emi.estudiante.tutor.profesor.id === this.registroSeleccionado.profesor.id) {
          estudianteTutor = emi;
          buscarEstudiante = false;
        }
      }
    });
    // console.log(this.registroSeleccionado.materiaImpartida.id, 'materia impartida');
    // console.log(estudianteTutor.estudiante.tutor.profesor.id, 'estudiante impartida');
    // console.log(this.registroSeleccionado.profesor.id, 'profesor impartida');
    this.profesorMateriaService.getConstanciaTutorial(
        estudianteTutor.estudiante.id,
        estudianteTutor.estudiante.tutor.id,
        this.registroSeleccionado.materiaImpartida.id,
        this.erroresConsultas
    ).subscribe(
        response => {
          constanciaProfesor = response.json();
          this._spinner.stop('geneConstut');
        },
        error => {
          console.error(error);
          this._spinner.stop('geneConstut');
        },
        () => {
          //console.log(constanciaProfesor);
          window.open(constanciaProfesor);
          this._spinner.stop('geneConstut');
        }
    );
  }

  private materiaElegidaEsTutorial(materiaImpartida) {
    let esTutorial = false;
    if (materiaImpartida.materia.tipoMateria.id ==  3) {
      esTutorial = true;
    }

    return esTutorial;
  }

  private buscarProfesoresMateriasTutoriales(): void {
    //console.log('Es tutorial');
    this.listaEstudianteMateriaTutorial = [];

    let urlSerach: URLSearchParams = new URLSearchParams();
    //urlSerach.set('criterios', 'idMateriaImpartida~' + idMateriaImpartida + ':IGUAL');
    urlSerach.set('criterios', this.criteriosCabezeraTutoriales);
    this._spinner.start('buscarFrofe');
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.erroresConsultas,
        urlSerach
    ). subscribe(
        response => {
          //console.log(response.json().lista);
          response.json().lista.forEach((item) => {
            this.listaEstudianteMateriaTutorial.push(
                new EstudianteMateriaImpartida(item));
            if (this.validarTutorMateriaImpartida(item)) {
              if (!this.profesorEstaAgregado(item.id_estudiante.id_tutor.id_profesor.id, item.id_materia_impartida.id)) {
                this.registros.push(
                    new RegistroMateriaProfesor(null,
                        new Profesor(item.id_estudiante.id_tutor.id_profesor),
                        new MateriaImpartida(item.id_materia_impartida),
                        true)
                );
              }
            }
          });
        },
        error => {
          this._spinner.stop('buscarFrofe');
        },
        () => {
          this._spinner.stop('buscarFrofe');
          if (this.registros.length === 0) {
            this.mostrarMensajeTipoAlert(
                'No hay profesores en la materia seleccionada',
                'danger'
            );
          }
        }
    );

  }
  validarTutorMateriaImpartida(item): boolean {
    if (item.id_estudiante.exist) {
      if (item.id_materia_impartida.exist) {
        if (item.id_estudiante.id_tutor.exist) {
          if (item.id_estudiante.id_tutor.id_profesor.exist) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private profesorEstaAgregado(idProfesor, idMateriaImpartida) {
    //console.log('Verificar si esta idProfesor y materia');
    let estaAgregado = false;
    this.registros.forEach((profesor) => {
      if (profesor.profesor.id === idProfesor && profesor.materiaImpartida.id === idMateriaImpartida)  {
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
      this._spinner.start('detalleTem');
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
            this._spinner.stop('detalleTem');
          },
          () => {
            this._spinner.stop('detalleTem');
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
      this._spinner.start('verArch');
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
                this._spinner.stop('verArch');
              },
              () => {
                //console.info('OK');
                this._spinner.stop('verArch');
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
    }
   

    if (sessionStorage.getItem('cProfesorIdPromocion'))
   {

      this.criteriosCabezera = 'idMateriaImpartida.idPeriodoEscolar~' + sessionStorage.getItem('cProfesorIdPeriodoEscolar') +
      ':IGUAL,idMateriaImpartida.idPromocion~' + sessionStorage.getItem('cProfesorIdPromocion') + ':IGUAL,idMateriaImpartida.idEstatus~1222';
    this.criteriosCabezeraTutoriales =
    'idMateriaImpartida.idPeriodoEscolar~' + sessionStorage.getItem('cProfesorIdPeriodoEscolar') +
  ':IGUAL,idMateriaImpartida.idPromocion~' + sessionStorage.getItem('cProfesorIdPromocion') +
        ':IGUAL,idMateriaImpartida.idEstatus~1222:IGUAL,' +
        'idMateriaImpartida.idMateria.idTipo~3:IGUAL';
    this.materiaTutorial = false;
    this.materiaImpartida = null;

      this.onCambiosTabla();

   }
  }

  private setearSelectProgramaDocenteCoordinador(): void {
    (<FormControl>this.formFiltro.controls['idProgramaDocente']).
    setValue(this.usuarioRol.usuario.programaDocente.id);
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

}
