import { Component, OnInit, NgZone, ViewChild, Inject} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import * as moment from 'moment';
import {ConfigService} from '../../services/core/config.service';
import { NgUploaderOptions } from 'ngx-uploader';
import {ItemSelects} from "../../services/core/item-select.model";
import {Promocion} from "../../services/entidades/promocion.model";
import {PromocionPeriodoEscolar} from "../../services/entidades/promocion-periodo-escolar.model";
import {MateriaImpartida} from "../../services/entidades/materia-impartida.model";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";
import {TemarioParticular} from "../../services/entidades/temario-particular.model";
import {PeriodoEscolar} from "../../services/entidades/periodo-escolar.model";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {Profesor} from "../../services/entidades/profesor.model";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {EstudianteMateriaImpartida} from "../../services/entidades/estudiante-materia-impartida.model";
import {ErrorCatalogo} from "../../services/core/error.model";

declare var tinymce: any;

export class Registro {
    // idTipo: number;
    idArchivo: number;
    nombre: string;
    temarioParticular: any;
    // otroTipo: string;
    constructor(archivo: number, nombre: string) {
        // this.idTipo = tipo;
        this.idArchivo = archivo;
        this.nombre = nombre;
        // this.otroTipo = otro;
    }
}

@Component({
  selector: 'app-programa',
  templateUrl: './programa.component.html',
  styleUrls: ['./programa.component.css']
})
export class ProgramaComponent implements OnInit {

  @ViewChild('modalAgregarTemarioParticular')
  modalAgregarTemarioParticular: ModalComponent;
  @ViewChild('modalDetalleTemarioParticular')
  modalDetalleTemarioParticular: ModalComponent;
  @ViewChild('modalListaEstudiantes')
  modalListaEstudiantes: ModalComponent;
  @ViewChild('modalDetalleTemarioBase')
  modalDetalleTemarioBase: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  criteriosCabezera: string = '';

  /////////////////////////////////
  programaDocenteService;
  promocionService;
  periodoEscolarService;
  materiaImpartidaService;
  profesorMateriaService;
  promocionPeriodoService;
  materiaService;
  profesorService;
  usuarioRolService;
  temarioParticularService;
  archivoService;
  estudianteMateriaImpartidaService;
  materiaImpartidaTemarioParticularService;

  listaProgramas: Array<ItemSelects> = [];
  listaPromociones: Array<Promocion> = [];
  listaPeriodos: Array<PromocionPeriodoEscolar> = [];
  listaProfesorMaterias: Array<MateriaImpartida>;

  entidadProgramaDocente: ProgramaDocente;
  entidadPromocion: Promocion;
  entidadPeriodo: PeriodoEscolar;
  entidadMateria: MateriaImpartida;
  entidadProgramaDocenteVista;
  entidadPromocionVista;
  entidadPeriodoVista;
  entidadMateriaVista;
  entidadTemarioParticular: TemarioParticular;

  botonBuscar: boolean = false;

  banderaMostrarCampos: boolean = false;
  programaSeleccionado: number;
  periodoSeleccionado: number;
  promocionSeleccionada: number;
  materiaImpartidaSeleccionada: number;
  // registroSeleccionado: MateriaImpartida;
  profesor: {[key: number]: string; } = {};

  idProgramaDocente: number;
  idPromocion: number;
  idPeriodoEscolar: number;
  idProfesor: number;
  idTemarioParticular: number;

  usuarioRol: UsuarioRoles;
  entidadProfesor: Profesor;
  ////////////////////////////////////

  // idPromocion: number = null;
  planEstudiosMateriaService;
  estatusCatalogoService;
  // registroSeleccionado: Materia;
  exportarExcelUrl = '';
  exportarPDFUrl = '';

  botonValido: boolean = false;

  // Variable tipo boolean para indicar si el tipo de materia es Tutial
  materiaEsTutorial: boolean = false;

  planEstudios: PlanEstudio;
  idMateria: number = 0;
  idMateriaImpartida: number = 0;
  private alertas: Array<Object> = [];
  private erroresConsultas: Array<Object> = [];
  private usuarioLogueado: UsuarioSesion;

  //// Variable de modal agregar temario particular /////
  options: NgUploaderOptions;

  formularioProgramaParticular: FormGroup;
  formularioDocumentacion: FormGroup;
  registros: Array<Registro> = [];
  registroSeleccionado: Registro;
  validacionActiva: boolean = false;
  materiaImpartidaTemarioService;

  dt: Date = new Date();
  fechaConFormato: string = moment(this.dt).format('DD/MM/YYYY');
  //Documents
  idArchivo: number;
  nombreArchivo: string;
  tipoArchivo: number;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  acceso: boolean = true;
  uploadFile: any;
  idMateriaImpartidaAgregarTemario: number;
  idProfesorAgregarTemario: number;
  idTemarioDetalle: number;
  entidadTemarioParticularDetalle: TemarioParticular;

  archivoSubido: boolean = false;

  columnas: Array<any> = [
      {titulo: 'Documento', nombre: '', sort: false},
      {titulo: 'Fecha de actualización', nombre: '', sort: false},
  ];

  columnasDetalle: Array<any> = [
      {titulo: 'Documento', nombre: '', sort: false},
  ];

  private erroresGuardado: Array<ErrorCatalogo> = [];
  //// Fin de variables del modal agregar temario partiuclar ///

  // variable modal lista estudiante //
  registrosAsistencia: Array<EstudianteMateriaImpartida> = [];
  // fin variable modal lista estudiante //7

  // variables modal detalle tmario base
  plantillaEditorService
  // fin variables modal detalle temaro base

  constructor(@Inject(NgZone) private zone: NgZone,
             private _catalogosServices: CatalogosServices,
              private _spinner: SpinnerService,
              private authService: AuthService) {

      this.usuarioLogueado = this.authService.getUsuarioLogueado();
      this.inicializarFormularioTemario();
      this.inicializarOpcionesNgZone();
      this.prepareServices();
      this.obtenerCatalogo();
      this.recuperarPermisosUsuario();
  }

  ngOnInit() {
    this.listarProgramas();
  }

  recuperarPermisosUsuario(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + this.usuarioLogueado.id + ':IGUAL');
    this.profesorService.getListaProfesor(
        this.erroresConsultas,
        urlSearch
        )
        .subscribe(
            response => {
                response.json().lista.forEach((elemento) => {
                    this.entidadProfesor = new Profesor (elemento);
                    this.idProfesor = this.entidadProfesor.id;
                });
            }
        );
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
        this.botonValido = true;
    }else {
        this.botonValido = false;
    }
  }

  //// Filtro Programa Docente
  /////////////////////////////////////////////////////
  listarProgramas(): void {
    let urlSearch = new URLSearchParams();
    this.listaProgramas = this.programaDocenteService.
    getSelectProgramaDocente(this.erroresConsultas, urlSearch);
  }

  listarPeriodos(idPromocion): void {
    this.listaPeriodos = [];
    this.listaProfesorMaterias = [];
    this.periodoSeleccionado = null;
    this.materiaImpartidaSeleccionada = null;
    this.entidadProgramaDocenteVista = null;
    this.entidadPromocionVista = null;
    this.entidadPeriodoVista = null;
    this.entidadMateriaVista = null;
    this.botonBuscar = false;
    this.banderaMostrarCampos = false;
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
            if (this.listaPeriodos.length === 0) {
                let mensaje = 'No se encontraron periodos para la promoción seleccionada';
                this.alertas.push({
                    msg: mensaje,
                    closable: true,
                    tiempo: 3000
                });
            }
        });
        this.promocionService.getPromocion(
            idPromocion,
            this.erroresConsultas
        ).subscribe(
            response => {
                this.entidadPromocion
                    = new Promocion(response.json());
                // console.log(this.entidadPromocion);
            });
    }
    this.idPromocion = idPromocion;
    // console.log('id promocion: ' + idPromocion);
  }

  listarMaterias(idPeriodo, idPromocion): void {
        this.listaProfesorMaterias = [];
        this.materiaImpartidaSeleccionada = null;
        this.entidadProgramaDocenteVista = null;
        this.entidadPromocionVista = null;
        this.entidadPeriodoVista = null;
        this.entidadMateriaVista = null;
        this.botonBuscar = false;
        this.banderaMostrarCampos = false;
        let urlSearch = new URLSearchParams();
        if (idPeriodo) {
            this._spinner.start('buscarMateria');
            this.periodoSeleccionado = idPeriodo;
            urlSearch.set('criterios', 'idProfesor.id~' + this.idProfesor +
                ': IGUAL,idMateriaImpartida.idPeriodoEscolar.id~' + idPeriodo +
                ':IGUAL,idMateriaImpartida.idPromocion.id~' + idPromocion + ':IGUAL');
            let materia;
            this.profesorMateriaService.getListaProfesorMateria(this.erroresConsultas, urlSearch).
            subscribe(
                response => {
                    response.json().lista.forEach((item) => {
                        this.listaProfesorMaterias.push(
                            new MateriaImpartida(item.id_materia_impartida));
                    });

                    urlSearch.set('criterios', 'idMateriaImpartida.idPeriodoEscolar.id~' +
                        idPeriodo +
                        ':IGUAL;AND,idMateriaImpartida.idPromocion~' + idPromocion +
                        ':IGUAL;AND,idEstudiante.idTutor.idProfesor.id~' + this.idProfesor +
                        ':IGUAL;AND,idMateriaImpartida.idMateria.idTipo.id~3:IGUAL;AND');
                    let materiasTutorialesIds: Array<number> = [];
                    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
                        this.erroresConsultas, urlSearch).subscribe( response => {
                        response.json().lista.forEach((item) => {
                            if (materiasTutorialesIds.length > 0) {
                                materiasTutorialesIds.forEach((id) => {
                                    if (id !== item.id_materia_impartida.id) {
                                        this.listaProfesorMaterias.push(
                                           new MateriaImpartida(item.id_materia_impartida));
                                    }
                                });
                            }else {
                                materiasTutorialesIds.push(item.id_materia_impartida.id);
                                this.listaProfesorMaterias.push(
                                    new MateriaImpartida(item.id_materia_impartida));
                            }
                        });

                        if (this.listaProfesorMaterias.length === 0) {
                            let mensaje =
                                'No tiene materias asignadas con la promoción y período seleccionados';
                            this.alertas.push({
                                type: 'danger',
                                msg: mensaje,
                                closable: true,
                                tiempo: 3000
                            });
                        }else {
                            // this.materiasHabilitadas = false;
                        }

                    });
                },
                error => {
                    console.error(error);
                },
                () => {
                  this._spinner.stop('buscarMateria');
                }
            );
            this.periodoEscolarService.getPeriodoEscolar(
                idPeriodo,
                this.erroresConsultas
            ).subscribe(
                response => {
                    this.entidadPeriodo
                        = new PeriodoEscolar(response.json());
                    // console.log(this.entidadProgramaDocente);
                });

        }
        this.idPeriodoEscolar = idPeriodo;
        // console.log('id periodo escolar: ' + idPeriodo);
  }

  listarPromociones(idPrograma): void {
        this.listaPromociones = [];
        this.listaPeriodos = [];
        this.listaProfesorMaterias = [];
        this.promocionSeleccionada = null;
        this.periodoSeleccionado = null;
        this.materiaImpartidaSeleccionada = null;
        this.entidadProgramaDocenteVista = null;
        this.entidadPromocionVista = null;
        this.entidadPeriodoVista = null;
        this.entidadMateriaVista = null;
        this.botonBuscar = false;
        this.banderaMostrarCampos = false;
        let urlSearch = new URLSearchParams();
        if (idPrograma) {
            this.programaSeleccionado = idPrograma;
            urlSearch.set('criterios', 'idProgramaDocente.id~' + idPrograma + ':IGUAL;AND,idEstatus~1235:NOT');
            this.promocionService.getListaPromocionesPag(this.erroresConsultas, urlSearch).
            subscribe(
                response => {
                    // console.log(response.json());
                    response.json().lista.forEach((item) => {
                        this.listaPromociones.push(new Promocion(item));
                    });
                }
            );
            this.programaDocenteService.getProgramaDocente(
                idPrograma,
                this.erroresConsultas
            ).subscribe(
                response => {
                    this.entidadProgramaDocente
                        = new ProgramaDocente(response.json());
                    // console.log(this.entidadProgramaDocente);
                });
        }
        this.idProgramaDocente = idPrograma;
        // console.log('id programa docente: ' + idPrograma);
  }

  getIdMateria(idMateriaImpartida): void {
        let materiaImpartida;
        this.entidadProgramaDocenteVista = null;
        this.entidadPromocionVista = null;
        this.entidadPeriodoVista = null;
        this.entidadMateriaVista = null;
        this.banderaMostrarCampos = false;
        if (idMateriaImpartida) {
            this._spinner.start('buscarTemario');
            this.materiaImpartidaSeleccionada = idMateriaImpartida ? idMateriaImpartida : null;
            // console.log('idMateriaImpartida: ' + idMateriaImpartida);
            this.idMateria = idMateriaImpartida;
            this.materiaImpartidaService.getMateriaImpartida(
                this.idMateria,
                this.erroresConsultas
            ).subscribe(
                response => {
                    this.entidadMateria
                        = new MateriaImpartida(response.json());
                    this.botonBuscar = true;
                },
                error => {
                    this._spinner.stop('buscarTemario');
                },
                () => {
                    if (this.entidadMateria.temarioParticular.id) {
                        // this.idTemarioParticular = this.entidadMateria.temarioParticular.id;
                        // this.entidadTemarioParticular = this.entidadMateria.temarioParticular;
                    }
                    this.getTemarioParticular(this.entidadMateria.id, this.idProfesor);
                    // this._spinner.stop();
                }
            );
        }else {
            this.botonBuscar = false;
        }
  }

  getTemarioParticular(idMateria: number, idProfesor: number): void {
        let urlSearch = new URLSearchParams();
        urlSearch.set('criterios', 'idMateriaImpartida~' + idMateria + ':IGUAL,' +
            'idProfesor~' + idProfesor + ':IGUAL');
        this.materiaImpartidaTemarioParticularService.getListaTemarioParticularMateriaImpartida(
            this.erroresConsultas,
            urlSearch
        ).subscribe(
            response => {
                this.entidadTemarioParticular = undefined;
                response.json().lista.forEach((item) => {
                    if (item.id_temario_particular) {
                        this.entidadTemarioParticular =
                            new TemarioParticular(item.id_temario_particular);
                    }
                });
                // this.idTemarioParticular = this.entidadTemarioParticular.id;
            },
            error => {
                this._spinner.stop('buscarTemario');
            },
            () => {
                this._spinner.stop('buscarTemario');
                if (this.entidadTemarioParticular) {
                    this.idTemarioParticular = this.entidadTemarioParticular.id;
                }else {
                    this.idTemarioParticular = 0;
                }

            }
        );

  }

  getMateriaImpartidaByID(): void {
        if (this.idMateria) {
            this.banderaMostrarCampos = true;
            this.entidadProgramaDocenteVista = this.entidadProgramaDocente;
            this.entidadPromocionVista = this.entidadPromocion;
            this.entidadPeriodoVista = this.entidadPeriodo;
            this.entidadMateriaVista = this.entidadMateria;
        }
  }

  deshabilitarDetalleTemarioBase(): boolean {
        if (this.entidadMateria) {
            return this.entidadMateria.materia.archivoProgramaBase.id ? false : true;
        }
        return true;
  }

  private cerrarAlerta(i: number): void {
        this.alertas.splice(i, 1);
  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosServices;
  }

  private obtenerCatalogo(): void {
    this.programaDocenteService = this._catalogosServices.getCatalogoProgramaDocente();
    this.promocionService = this._catalogosServices.getPromocion();
    this.periodoEscolarService = this._catalogosServices.getPeriodoEscolar();
    this.materiaImpartidaService = this._catalogosServices.getMateriaImpartidaService();
    this.profesorMateriaService = this._catalogosServices.getProfesorMateriaService();
    this.promocionPeriodoService = this._catalogosServices.getPromocionPeriodoEscolarService();
    this.materiaService = this._catalogosServices.getMateria();
    this.profesorService = this._catalogosServices.getProfesor();
    this.usuarioRolService = this._catalogosServices.getUsuarioRolService();
    this.temarioParticularService = this._catalogosServices.getTemarioParticularService();
    this.archivoService = this._catalogosServices.getArchivos();
    this.estudianteMateriaImpartidaService =
        this._catalogosServices.getEstudianteMateriaImpartidaService();
    this.materiaImpartidaTemarioParticularService =
        this._catalogosServices.getMateriaImpartidaTemarioParticularService();
    this.materiaImpartidaTemarioService =
        this._catalogosServices.getMateriaImpartidaTemarioParticularService();
    this.plantillaEditorService =
        this._catalogosServices.getPlantillaEditorService();
  }

  /****************************
   * AGREGAR TEMARIO PARTICULAR
   * **************************
  *****************************/
  modalImportarProgramaParticular(): void {
      this.obtenerEntidadTemarioParticular();
    this.modalAgregarTemarioParticular.open('lg');
  }

  inicializarFormularioTemario(): void {
    this.formularioProgramaParticular = new FormGroup({
        horasCampo: new FormControl('', Validators.compose([Validacion.numerosValidator])),
        comentarios: new FormControl(''),
        idArchivoTemario: new FormControl('', Validators.required)
    });
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

  getControl(campo: string): FormControl {
        return (<FormControl>this.formularioProgramaParticular.controls[campo]);
 }

 getControlErrors(campo: string): boolean {
        if (!(<FormControl>this.formularioProgramaParticular.controls[campo]).valid &&
        this.validacionActiva) {
            return true;
        }
        return false;
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

 agregarDocumento(valor: string): void {
        let algo: Array<any> = valor.split('-');
        this.tipoArchivo = algo[0];
        this.nombreArchivo = algo[1];
 }

 addErrorsMesaje(mensajeError, tipo): void {
        this.alertas.push({
            type: tipo,
            msg: mensajeError,
            closable: true
        });
 }

 handleBasicUpload(data): void {
        this.basicResp = data;
        let responseJson;
        if (this.registros.length === 0) {
            this.zone.run(() => {
                this.basicProgress = data.progress.percent;
                if (this.basicResp['response'] && this.basicResp['status'] === 201) {
                    responseJson = JSON.parse(this.basicResp['response']);
                    if (this.esPdf(responseJson.originalName)) {
                        this.idArchivo = responseJson.id;
                        this.agregarRegistro();
                        (<FormControl>this.formularioProgramaParticular.controls['idArchivoTemario'])
                            .patchValue(responseJson.id);
                        this.nombreArchivo = responseJson.originalName;
                    }else {
                        this.addErrorsMesaje('El archivo debe de ser en .pdf', 'danger');
                        this.archivoService.deleteArchivo(
                            responseJson.id,
                            this.erroresGuardado
                        );
                    }
                }
            });
        } /*else {
            this.addErrorsMesaje('Solo de puede agregar un archivo por registro!', 'danger');
        }*/
  }

  agregarRegistro(): void {
            this.registros.push(new Registro(this.idArchivo, this.nombreArchivo));
            // console.log(this.registros);
            this.resetearValores();
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

 eliminarRegistro(): void {
        if (this.registroSeleccionado) {
            this.estatusCatalogoService.getArchivos().deleteArchivo(
                this.registroSeleccionado.idArchivo,
                this.erroresGuardado
             )
            .subscribe(
                 response => {
                     let auxiliar: Array<Registro> = [];
                     for (var i = 0; i < this.registros.length; i++) {
                        if (this.registroSeleccionado.idArchivo !== this.registros[i].idArchivo) {
                             auxiliar.push(this.registros[i]);
                         }
                     }
                     this.registros = auxiliar;
                     this.registroSeleccionado = null;
            //         this.validarDocumentos();
            (<FormControl>this.formularioProgramaParticular.controls['idArchivoTemario'])
                .patchValue('');
                 }
             );
        } else {
            this.addErrorsMesaje(
                'Seleccione un docuemento de la tabla ',
                'danger'
            );
        }
 }

 resetearValores(): void {
        // this.tipoArchivo = null;
        this.idArchivo = null;
        this.nombreArchivo = null;
 }

 validarFormulario(): boolean {
      if (this.formularioProgramaParticular.valid) {
          this.validacionActiva = false;
          return true;
      }
      this.validacionActiva = true;
      return false;
 }

 esEdicion(): boolean {
        let editar = false;
        if (this.idTemarioDetalle) {
            editar = true;
        }

        return editar;
 }

 enviarFormulario(): void {
        if (this.validarFormulario()) {
          this.guardarRegistros();
        }
 }

 private guardarRegistros(): void {
        if (this.esEdicion()) {
            this.editarTemarioParticular();
        } else {
            this.crearTemarioParticular();
        }
 }

 private crearTemarioParticular(): void {
        let idTemario: number;

        let jsonTemarioParticular = {
            horasCampo: this.formularioProgramaParticular.value.horasCampo,
            comentarios: this.formularioProgramaParticular.value.comentarios,
            idArchivoTemario: this.formularioProgramaParticular.value.idArchivoTemario,
            idProfesor: this.idProfesor,
            idMateriaImpartida: this.idMateria
        };

        let jsonFormulario = JSON.stringify(this.formularioProgramaParticular.value, null, 2);
        // console.log('contenido: ' + jsonFormulario);

        // codigo para enviar el formulario
        this.temarioParticularService.postTemarioParticular(
              jsonFormulario,
              this.erroresGuardado
        ).subscribe(
            response => {
              // console.log(response.json().id);
              idTemario = response.json().id;
            }, errors => {
                console.error(errors);
            },
            () => {
                this.agregarRegistroATemarioParticularMateriaImparitda(idTemario);
            }
        );

 }

 private agregarRegistroATemarioParticularMateriaImparitda(idTemario: Number): void {

            this.formularioDocumentacion = new FormGroup({
                idTemarioParticular: new FormControl(idTemario),
                idMateriaImpartida: new FormControl(this.idMateria),
                idProfesor: new FormControl(this.idProfesor)
            });

            let jsonFormularioMateria = JSON.stringify(this.formularioDocumentacion.value, null, 2);
            // console.log('jsonFormuarioMAteri', jsonFormularioMateria);
            this.materiaImpartidaTemarioService.postTemarioParticularMateriaImpartida(
                jsonFormularioMateria,
                this.erroresGuardado
            ).subscribe(
                response => {},
                error => {
                    console.error(error);
                },
                () => {
                    this.getIdMateria(this.materiaImpartidaSeleccionada);
                    this.cerrarModalImportarTemario();
                }
            );
 }

 private editarTemarioParticular(): void {
        let jsonEdicionTemario = JSON.stringify(this.formularioProgramaParticular.value, null, 2);

        this.temarioParticularService.putTemarioParticular(
            this.idTemarioDetalle,
            jsonEdicionTemario,
            this.erroresGuardado
        ).subscribe(
            response => {},
            error => {
                console.log(error);
            },
            () => {
                this.getIdMateria(this.materiaImpartidaSeleccionada);
                this.cerrarModalImportarTemario();
            }
        );
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

 private esPdf(nombreArchiov: string): boolean {
        let nombreArchivoArray: string[];
        let tamanoArreglo: number;
        nombreArchivoArray = nombreArchiov.split('.');
        tamanoArreglo = nombreArchivoArray.length - 1;
        if (nombreArchivoArray[tamanoArreglo] &&
            nombreArchivoArray[tamanoArreglo].toLowerCase() === 'pdf' ) {
            return true;
        } else {
            return false;
        }
 }

 private obtenerEntidadTemarioParticular(): void {
     if (this.entidadTemarioParticular) {
        this.entidadTemarioParticularDetalle = this.entidadTemarioParticular;
        this.nombreArchivo = this.entidadTemarioParticularDetalle.archivoTemario.nombre;
        this.mostrarDatosTemarioRecuperado();
        this.registros.push(
            new Registro(
                    this.entidadTemarioParticularDetalle.archivoTemario.id,
                    this.entidadTemarioParticularDetalle.archivoTemario.nombre
                )
        );
     }
 }

 private mostrarDatosTemarioRecuperado() {
        if (this.entidadTemarioParticularDetalle) {
            (<FormControl>this.formularioProgramaParticular.controls['comentarios'])
            .patchValue(this.entidadTemarioParticularDetalle.comentarios);

            (<FormControl>this.formularioProgramaParticular.controls['horasCampo'])
                .patchValue(this.entidadTemarioParticularDetalle.horasCampo);

            (<FormControl>this.formularioProgramaParticular.controls['idArchivoTemario'])
                .patchValue(this.entidadTemarioParticularDetalle.archivoTemario.id);
        }
 }

  cerrarModalImportarTemario(): void {
    this.inicializarFormularioTemario();
    this.registros = [];
    this.validacionActiva = false;
    this.entidadTemarioParticularDetalle = undefined;
    this.getMateriaImpartidaByID();
    this.modalAgregarTemarioParticular.close();
  }

  /****************************
   * TERMINA TEMARIO PARTICULAR
   * **************************
  *****************************/

  /****************************¨******
   * INICIA DETALLE TEMARIO PARTICULAR
   * *********************************
  ************************************/
  modalDetalleProgramaBase(): void {
      this.modalDetalleTemarioParticular.open('lg');
  }
  verArchivo(): void {
        if (this.entidadTemarioParticular.archivoTemario.id) {
            let jsonArchivo = '{"idArchivo": ' +
                this.entidadTemarioParticular.archivoTemario.id + '}';
            this._spinner.start('verArchivo');
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
                        // console.log('Error downloading the file.');
                        this._spinner.stop('verArchivo');
                    },
                    () => {
                        // console.info('OK');
                        this._spinner.stop('verArchivo');
                    }
                );
        }
  }

  cerrarModalDetalleTemario(): void {
      this.modalDetalleTemarioParticular.close();
  }
  /*************************************
   * TERMINA DETALLE TEMARIO PARTICULAR
   * ***********************************
  **************************************/

  /*************************************
   * INICIA MODAL LISTA ESTUDIANTES
   * ***********************************
  **************************************/

  modalDetalleAsistencia(): void {
      this.obtenerListaAsistencia();
      this.modalListaEstudiantes.open('lg');
  }

  obtenerListaAsistencia() {
        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterios = 'idMateriaImpartida~' + this.entidadMateria.id +
            ':IGUAL,idMateriaInterprograma~' + this.entidadMateria.id + ':IGUAL;OR';

        if ( this.entidadMateria.materia.tipoMateria.id == 3) {
            criterios  +=
            'GROUPAND,idEstudiante.idTutor.idProfesor~' + this.idProfesor +
            ':IGUAL;AND';
        }

        urlSearch.set('criterios', criterios);
        this._spinner.start('buscarAlumnos');
        this.estudianteMateriaImpartidaService
            .getListaEstudianteMateriaImpartida(
                this.erroresConsultas,
                urlSearch
            ).subscribe(
                response => {
                    response.json().lista.forEach((item) => {
                        let estudianteMateriaImpartida = new EstudianteMateriaImpartida(item);
                            if (estudianteMateriaImpartida.materiaInterprograma.id ===
                                this.entidadMateria.id) {
                                this.agregarEstudiantes(estudianteMateriaImpartida);

                            } else if (!estudianteMateriaImpartida.materiaInterprograma.id) {
                                this.agregarEstudiantes(estudianteMateriaImpartida);
                            }
                            this.agregarEstudiantesMovilidadExterna(estudianteMateriaImpartida);
                        }
                    );
                },
                error => {
                    this._spinner.stop('buscarAlumnos');
                },
                () => {
                    this._spinner.stop('buscarAlumnos');
                }
        );
 }

 agregarEstudiantes(registroEstudiante: EstudianteMateriaImpartida): void {
     if (registroEstudiante.estudiante.id
         && registroEstudiante.estudiante.estatus.id === 1006) {
         this.registrosAsistencia.push(registroEstudiante);
     }

 }

 agregarEstudiantesMovilidadExterna(registroEstudiante: EstudianteMateriaImpartida): void {
     if (registroEstudiante.estudianteMovilidadExterna.id &&
         registroEstudiante.estudianteMovilidadExterna.estatus.id === 1006) {
              this.registrosAsistencia.push(registroEstudiante);
         }
 }

 recuperarAlumnosMateria(tipo): void {
        this._spinner.start('exportar');
        let urlExportListaAsistenciaPDF;
        this.materiaImpartidaService.getExportarListaAsistencia(
            this.materiaImpartidaSeleccionada,
            this.idProfesor,
            tipo,
            this.erroresConsultas
        ).subscribe(
            response => {
                urlExportListaAsistenciaPDF = response.json();
            },
            error => {
                this._spinner.stop('exportar');
            },
            () => {
                this._spinner.stop('exportar');
                window.open(urlExportListaAsistenciaPDF);

            }
        );
 }


  cerrarModalDetalleAsistencia(): void {
      this.registrosAsistencia = [];
      this.modalListaEstudiantes.close();
  }

  /*************************************
   * TERMINA MODAL LISTA ESTUDIANTES
   * ***********************************
  **************************************/

  /*************************************
   * INICIA MODAL DETALLE PROGRAMA BASE
   * ***********************************
  **************************************/
  modalTemarioBase(): void {
      this.estableceContenidoEditorTxt();
      this.modalDetalleTemarioBase.open('lg');
  }

  estableceContenidoEditorTxt(): void {
      this._spinner.start('buscarTemario');
      this.plantillaEditorService.getEntidadPlantillaEditor(
            this.entidadMateria.materia.archivoProgramaBase.id,
            this.erroresConsultas
      ).subscribe(
          response => {
            tinymce.activeEditor.setContent(response.json().html_plantilla);
            tinymce.activeEditor.getBody().setAttribute('contenteditable', false);
        },
        error => {
            this._spinner.stop('buscarTemario');
        },
        () => {
            this._spinner.stop('buscarTemario');
        }
     );
  }

  cerrarModalTemarioBase(): void {
      tinymce.activeEditor.setContent('');
      this.modalDetalleTemarioBase.close();
  }


  /*************************************
   * TERMINA MODAL DETALLE PROGRAMA BASE
   * ***********************************
  **************************************/

}
