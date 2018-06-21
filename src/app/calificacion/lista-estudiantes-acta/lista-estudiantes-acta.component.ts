import { Component, OnInit, Input,ViewChild } from '@angular/core';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {URLSearchParams} from '@angular/http';
import {EstudianteMateriaImpartida
} from '../../services/entidades/estudiante-materia-impartida.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';
import {Puesto} from '../../services/catalogos/puesto.model';
import {Puestos} from '../../services/entidades/puestos.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {FormGroup, Validators, FormControl} from '@angular/forms';

@Component({
  selector: 'lista-estudiantes-acta',
  templateUrl: './lista-estudiantes-acta.component.html',
  styleUrls: ['./lista-estudiantes-acta.component.css']
})
export class ListaEstudiantesActaComponent implements OnInit {

  @Input() materiaImpartidaId: number;
  @Input() idTipoMateria: number;

  @ViewChild('modalConfirmacionActa')
  modalConfirmacionActa: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  errores: Array<any> = [];
  materiaImpartida: MateriaImpartida;
  materiaImpartidaService;
  estudianteMateriaImpartidaService;
  columnas: Array<any> = [
    {titulo: 'Matrícula', nombre: ''},
      {titulo: 'Nombre del estudiante',
          nombre: 'idEstudiante.idDatosPersonales.primerApellido', sort: 'asc'},
      {titulo: 'Calificación numérica', nombre: ''},
      {titulo: 'Calificación con letra', nombre: ''}
  ];
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  paginacion: PaginacionInfo;
  public configuracion: any = {
      paginacion: true,
      filtrado: { textoFiltro: '', columnas: '' }
  };
  registroSeleccionado: EstudianteMateriaImpartida;
  estudiantes: Array<EstudianteMateriaImpartida> = [];

  estudiantesOrdenadosTodos: Array<any> = [];

  usuarioRolService;
  puestoService;
  actaCalificacionService;
  idUsuario: number;
  idPuesto: number;
  usuarioRol: UsuarioRoles;
  idActaCalificaciones: number;
  validacionProfesor: boolean = false;
  validacionCoordinador: boolean = false;
  validacionDocencia: boolean = false;
  validacionSecAcademcia: boolean = false;
  usuarioSecretariaAcademica: boolean = false;

  //// variables para modal confirmar acta /////
  private formularioActa: FormGroup;
  /// termina variables para modal confirmar acta////

  constructor(private _spinner: SpinnerService,
              private authService: AuthService,
              public catalolosService: CatalogosServices) {
    this.prepareService();
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.idUsuario = usuarioLogueado.id;
    this.recuperarPermisosUsuario(usuarioLogueado.id);
    console.log('Tipo',this.idTipoMateria);
  }

  ngOnInit() {
      this.obtenerInformacionMateria();
  }

  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
        this.errores,
        urlSearch
    ).subscribe(
        response => {
            response.json().lista.forEach((elemento) => {
                let rolUsuario = new UsuarioRoles (elemento);
                    // id=2 -- Cordinador
                console.log('rolUsuario',rolUsuario);
                if (rolUsuario.rol.id === 2) {
                    this.usuarioRol = rolUsuario;
                        // console.log('Es coordinador...');
                } else if (rolUsuario.rol.id == 1) {
                    this.usuarioRol = rolUsuario;
                        // console.log('Es docencia...');
                    this.obtenerPuesto(this.usuarioRol.usuario.id);
                } else if (rolUsuario.rol.id == 16) {
                    this.usuarioRol = rolUsuario;
                        // console.log('Es Secretaria Academica...');
                    this.usuarioSecretariaAcademica = true;
                        // this.obtenerPuesto(this.usuarioRol.usuario.id);
                }
            });
        }
    );
  }

  obtenerPuesto(idUusario): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + idUusario + ':IGUAL');
    this.puestoService.getListaPuestos(
        this.errores,
        urlSearch
     ).subscribe(
        response => {
                ///this.idPuesteo = response.json().lista[0];
            response.json().lista.forEach((puesto) => {
                this.idPuesto = new Puestos(puesto).puesto.id;
            });
        },
        error => {
            console.log(error);
        },
        () => {
            // console.log('idPuesto', this.idPuesto);
        }
    );
  }

  private obtenerInformacionMateria(): void {
      if (this.materiaImpartidaId) {
        this.obtenerMateriaImpartida();
      }
  }

  private obtenerMateriaImpartida(): void {
    this.estudiantes = [];
    this.materiaImpartidaService.getEntidadMateriaImpartida(
      this.materiaImpartidaId,
      this.errores
    ).subscribe(
      response => {
        this.materiaImpartida = new MateriaImpartida(response.json());
      },
      error => {
        console.log(error);
      },
      () => {
        console.log(this.materiaImpartida.materia.tipoMateria.id);
        if (this.materiaImpartida.materia.tipoMateria.id != 3) {
          this.getListaEstudiantesOrdenados();
        } else {
          this.obtenerRegistrosEstudiantes();
        }
        this.setearVariablesValidacion();
      }
    );

  }


  private setearVariablesValidacion(): void {
    if (this.materiaImpartida) {
      // Se obtine el id del acta de calificaciones que se va a editar
      this.idActaCalificaciones = this.materiaImpartida.actaCalificacion.id;
      this.validacionProfesor = this.materiaImpartida.actaCalificacion.profesor;
      this.validacionCoordinador = this.materiaImpartida.actaCalificacion.coordinador;
      this.validacionDocencia = this.materiaImpartida.actaCalificacion.docencia;
      this.validacionSecAcademcia = this.materiaImpartida.actaCalificacion.secAcademica;
    }
  }

  private obtenerRegistrosEstudiantes(): void {
    this.estudiantes = [];
    this._spinner.start('registrosEstudiantes');
    let urlSearch = new URLSearchParams();
    let ordenamiento = 'idEstudiante.idDatosPersonales.primerApellido:ASC';
    urlSearch.set('criterios', 'idMateriaImpartida.id~' +
        this.materiaImpartidaId + ':IGUAL');
    urlSearch.set('ordenamiento', ordenamiento);
    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.errores, urlSearch
    ).subscribe(
        response => {
            response.json().lista.forEach((item) => {
                let estudianteMateria = new EstudianteMateriaImpartida(item);
                this.estudiantes.push(estudianteMateria);

            });
        },
        error => {
            this._spinner.stop('registrosEstudiantes');
        },
        () => {
            this._spinner.stop('registrosEstudiantes');
        }
    );
  }

  private prepareService(): void {
    this.materiaImpartidaService = this.catalolosService.getMateriaImpartidaService();
    this.estudianteMateriaImpartidaService =
        this.catalolosService.getEstudianteMateriaImpartidaService();
    this.usuarioRolService = this.catalolosService.getUsuarioRolService();
    this.puestoService = this.catalolosService.getPuestosService();
    this.actaCalificacionService = this.catalolosService.getActaCalificacionService();
  }

  ///////////////////////////////////////////////////
  ////////////  INICIA MODAL CONFIRMAR ACTA /////////
  ///////////////////////////////////////////////////
  modalValidarActaCalificaciones(): void {
      this.modalConfirmacionActa.open();
  }

  validarActa(): void {
        if (this.usuarioRol.rol) {
            if (this.usuarioRol.rol.id === 3 && this.materiaImpartida) {

                this.formularioActa = new FormGroup({
                    idMateriaImpartida: new FormControl(this.materiaImpartida.id),
                    tipo: new FormControl('PROFESOR')
                });
                let actaJson = JSON.stringify(this.formularioActa.value, null, 2);
                this.postAcataCalificacion(actaJson);
            }
            if (this.usuarioRol.rol.id === 2 && this.materiaImpartida) {
                console.log('es coordinador');

                this.formularioActa = new FormGroup({
                    idMateriaImpartida: new FormControl(this.materiaImpartida.id),
                    tipo: new FormControl('COORDINADOR')
                });
                let actaJson = JSON.stringify(this.formularioActa.value, null, 2);
                this.postAcataCalificacionUsuarios(actaJson);
            }
            if (this.idPuesto == 1 && this.materiaImpartida) {
                console.log('es director de docencia');

                this.formularioActa = new FormGroup({
                    idMateriaImpartida: new FormControl(this.materiaImpartida.id),
                    tipo: new FormControl('DOCENCIA')
                });
                let actaJson = JSON.stringify(this.formularioActa.value, null, 2);
                this.postAcataCalificacionUsuarios(actaJson);
            }
            if (this.usuarioRol.rol.id == 16 && this.materiaImpartida) {
                console.log('es Secretaria Academica');

                this.formularioActa = new FormGroup({
                    idMateriaImpartida: new FormControl(this.materiaImpartida.id),
                    tipo: new FormControl('SECRETARIA_ACADEMICA')
                });
                let actaJson = JSON.stringify(this.formularioActa.value, null, 2);
                this.postAcataCalificacionUsuarios(actaJson);
            }
        }
  }

  private setActaCalificacion( actaJson ): void {
        this._spinner.start('setCalif');
        this.actaCalificacionService.putActaCalificacion(
            this.materiaImpartida.actaCalificacion.id,
            actaJson,
            this.errores
        ).subscribe(
            response => {},
            error => {
                console.log(error);
                this._spinner.stop('setCalif');
            },
            () => {
                this._spinner.stop('setCalif');
                this.cerrarModalValidarActa();
            }
        );
  }

  private postAcataCalificacion( actaJson ): void {
        console.log('entras');
        console.log('json para firma', actaJson);
        this._spinner.start('postActa');
        this.materiaImpartidaService.postFirma(
            actaJson,
            this.errores
        ).subscribe(
            response => {
                // console.log(response.json());
            },
            error => {
                this._spinner.stop('postActa');
                console.log(error);
            },
            () => {
                this.cerrarModalValidarActa();
                this._spinner.stop('postActa');
            }
        );
    }

    private postAcataCalificacionUsuarios( actaJson ): void {
        console.log('entras');
        console.log('json para firma', actaJson);
        this._spinner.start('postActaUsuario');
        this.materiaImpartidaService.postFirma(
            actaJson,
            this.errores
        ).subscribe(
            response => {
                // console.log(response.json());
            },
            error => {
                console.log(error);
                this._spinner.stop('postActaUsuario');
            },
            () => {
                this.cerrarModalValidarActa();
                this._spinner.stop('postActaUsuario');
                this.obtenerMateriaImpartida();
            }
        );
  }

  cerrarModalValidarActa(): void {
      this.modalConfirmacionActa.close();
  }
  ///////////////////////////////////////////////////
  ////////////  TERMINA MODAL CONFIRMAR ACTA ////////
  ///////////////////////////////////////////////////

  getListaEstudiantesOrdenados() {
    this.estudiantesOrdenadosTodos = [];
    this._spinner.start('ordenados');

    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartidaOrdenada(
      this.errores,
      this.materiaImpartidaId
    ).subscribe(
      response => {

        this.estudiantes = [];

        response.json().lista.forEach((item) => {
          this.estudiantes.push(new EstudianteMateriaImpartida(item));
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

}
