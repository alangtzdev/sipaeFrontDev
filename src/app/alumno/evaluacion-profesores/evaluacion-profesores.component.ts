import { Component, OnInit } from '@angular/core';
import {Estudiante} from "../../services/entidades/estudiante.model";
import {EstudianteMovilidadExterna} from "../../services/entidades/estudiante-movilidad-externa.model";
import {EvaluacionDocenteAlumno} from "../../services/entidades/evaluacion-docente-alumno.model";
import {EstudianteGrupoIdioma} from "../../services/entidades/estudiante-grupo-idioma.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {ErrorCatalogo} from "../../services/core/error.model";
import {Router, ActivatedRoute} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {AuthService} from "../../auth/auth.service";
import {URLSearchParams} from "@angular/http";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import {Usuarios} from "../../services/usuario/usuario.model";
import {EstudianteMateriaImpartida} from "../../services/entidades/estudiante-materia-impartida.model";
import {MateriaImpartida} from "../../services/entidades/materia-impartida.model";
import {RespuestasEvaluacionDocenteIdiomasService} from "../../services/entidades/respuestas-evaluacion-docente-idiomas.service";

@Component({
  selector: 'app-evaluacion-profesores',
  templateUrl: './evaluacion-profesores.component.html',
  styleUrls: ['./evaluacion-profesores.component.css']
})
export class EvaluacionProfesoresComponent implements OnInit {

  idEstudiante: number;
  estudianteActual: Estudiante;
  estudianteMovilidadActual: EstudianteMovilidadExterna;
  evaluacionDocenteAlumnoActual: EvaluacionDocenteAlumno;
  registros: Array<any> = [];
  registrosIdiomas: Array<EstudianteGrupoIdioma> = [];
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  registroSeleccionado: any;

  //variables para consulta de base de datos
  estudianteService;
  estudianteMovilidadService;
  evaluacionDocenteService;
  evaluacionDocenteAlumnoService;
  evaluacionDocenteIdiomasAlumnoService;
  evaluacionDocenteIdiomasService;
  estudianteMateriaImpartidaService;
  usuarioService;
  usuarioRolService;
  profesorMateriaService;
  estudianteGrupoIdiomaService;

  relacionMateriasEvaluaciones: {
    materias: number,
    evaluaciones: number,
    materiasContadas: number,
    evaluacionesContadas: number
  } = {
    materias: 0,
    evaluaciones: 0,
    materiasContadas: 0,
    evaluacionesContadas: 0
  };

  columnasIdioma: Array<any> = [
    { titulo: 'Idioma', nombre: 'idIdioma' },
    { titulo: 'Periodo', nombre: 'periodo'},
    { titulo: 'Nivel', nombre: 'nivel'}
  ];

  idUsuarioObjetivo: number;
  auxiliar: number;
  permisoDocencia: boolean = false;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idMateriaImpartida.idMateria.descripcion,' +
    'idMateriaImpartida.idMateria.descripcion', textoFecha: '' }
  };
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  private sub: any;
  router: Router;

  private usuarioLogueado: UsuarioSesion;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  constructor(private _router: Router, params: ActivatedRoute,
              private catalogoService: CatalogosServices, private _spinner: SpinnerService,
              //private respuestasEvaluacionDocenteIdiomasService: RespuestasEvaluacionDocenteIdiomasService,
              private _authService: AuthService) {
    this.prepareService();
    this.router = _router;
    params.params.subscribe(params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    //console.log('Buscando...');
    if (this.idUsuarioObjetivo) {
      this.permisoDocencia = true;
      this.auxiliar = this.idUsuarioObjetivo;
    } else {
      this.usuarioLogueado = this._authService.getUsuarioLogueado();
      this.auxiliar = this.usuarioLogueado.id;
    }

      this._spinner.start('obtenerUsuario');
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'idUsuario~' + this.auxiliar + ':IGUAL';
      urlSearch.set('criterios', criterio);

      this.usuarioRolService.getListaUsuarioRol(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          paginacionInfoJson.lista.forEach((item) => {
            //this._authService.setUsuarioRoles(new UsuarioRoles(item));
          });
        },
        error => {
          this._spinner.stop('obtenerUsuario');
        },
        () => {
          this._spinner.stop('obtenerUsuario');
          this.recuperarUsuario(this.auxiliar);
        }
      );

  }

  recuperarUsuario(id: number): void {
    //console.log('entro a recupearusuario');
    this.usuarioService.getEntidadUsuario(
      id,
      this.erroresConsultas
    ).subscribe(
      response => {
        let idRol: number;
        let usuarioActual: Usuarios = new Usuarios(response.json());
        //console.log('usuarioActual', response);

        usuarioActual.roles.forEach((rol) => {
          idRol = rol.id;
        });

        //console.log('el puto rol: ' + idRol);

        if (idRol === 5) {
          //console.log('estudiante nomral');
          this.recuperarUsuarioActual();
        } else if (idRol === 14) {
          //console.log('estudiante movilidad');
          this.recuperarUsuarioActualMovilidad();
        }

      }
    );

  }

  ngOnInit(): void {
    //this.onCambiosTabla();
    this.getSolicitud();
  }

  setPaginacion(paginacion: PaginacionInfo): void {
    this.paginacion = paginacion;
  }

  getPaginacion() {
    return this.paginacion;
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    //console.log(this.evaluacionDocenteAlumnoActual);
    if (this.evaluacionDocenteAlumnoActual) {
      if (this.evaluacionDocenteAlumnoActual.evaluacionesFinalizadas) {
        this.erroresConsultas.push(
          new ErrorCatalogo('success', false, 200, 'Evaluaciones Finalizadas', ''));
      }
    }
    ////console.log("obtenerListaDatosEstudiante");

    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante;
    if (this.estudianteActual) {
      criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL;AND,' +
        'idMateriaImpartida.idPeriodoEscolar.id~' +
        this.estudianteActual.periodoActual.id + ':IGUAL;AND';
    } else {
      criterioIdEstudiante = 'idEstudianteMovilidadExterna~' + this.idEstudiante + ':IGUAL';
    }

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterioIdEstudiante =
          criterioIdEstudiante + ((criterioIdEstudiante === '') ? '' : ',') +
          filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE';
      });

    }

    if (!this.evaluacionDocenteAlumnoActual.estudianteAbsuelto) {
      urlParameter.set('criterios', criterioIdEstudiante);
      urlParameter.set('ordenamiento', 'idMateriaImpartida.idMateria.clave:ASC');
      this._spinner.start('listaEstudianteMateriaImpartida');
      this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
        this.erroresConsultas,
        urlParameter,
        this.configuracion.paginacion
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          let paginasArray: Array<number> = [];
          this.registros = [];
          for (var i = 0; i < paginacionInfoJson.paginas; i++) {
            paginasArray.push(i);
          }
          this.setPaginacion(new PaginacionInfo(
            paginacionInfoJson.registrosTotales,
            paginacionInfoJson.paginas,
            paginacionInfoJson.paginaActual,
            paginacionInfoJson.registrosPagina
          ));
          ////console.log('paginacionInfoJson.lista.length', paginacionInfoJson.lista.length);

          urlParameter = new URLSearchParams();
          let criterioIdMateria = '';
          let arregloEstudiantes = [];

          this.relacionMateriasEvaluaciones.materias = paginacionInfoJson.lista.length;

          paginacionInfoJson.lista.forEach((item) => {
            this.relacionMateriasEvaluaciones.materiasContadas++;
            let estudianteMateriaImpartida = new EstudianteMateriaImpartida(item);
            urlParameter = new URLSearchParams();
            if (this.materiaImpartidaEsOptativa(
                estudianteMateriaImpartida.materiaImpartida)
              || this.materiaImpartidaESLGAC(
                estudianteMateriaImpartida.materiaImpartida)) {
              this.verificarEvaluacionDocenteNecesaria(
                estudianteMateriaImpartida);
            }
            this.verificarEvaluacionDocente(estudianteMateriaImpartida);
          });
          this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
          this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
        },
        error => {
          this._spinner.stop('listaEstudianteMateriaImpartida');
        },
        () => {
          this._spinner.stop('listaEstudianteMateriaImpartida');
        }
      );
    } else {
      this.erroresConsultas.push(
        new ErrorCatalogo('success', false, 200,
          'Absuelto de realizar Evaluaciones para este periodo', ''));
    }

  }

  verificarEvaluacionDocenteNecesaria(estudianteMateriaImpartida: EstudianteMateriaImpartida) {
    let informacionResponse: any;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let numeroDeAlumnosEnLaMateria: number = 0;

    urlParameter.set('criterios', 'idMateriaImpartida~' +
      estudianteMateriaImpartida.materiaImpartida.id + ':IGUAL');

    if (estudianteMateriaImpartida.materiaInterprograma &&
      estudianteMateriaImpartida.materiaInterprograma.id) {
      //console.log('criterio para interprograma');
      urlParameter.set('criterios', 'idMateriaInterprograma~' +
        estudianteMateriaImpartida.materiaInterprograma.id + ':IGUAL');
    }

    this.estudianteMateriaImpartidaService.getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlParameter,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        informacionResponse = response.json();
      },
      erro => { },
      () => {
        if (informacionResponse.registrosTotales < 3) {
          //console.log('No debe de hacer evaluacion la materia',
          //   estudianteMateriaImpartida);
          this.verificarEvaluacionDocenteMateriaOptativa(estudianteMateriaImpartida);
          //this.finalizarEvaluacionDocente(estudianteMateriaImpartida);
        } else {
          //console.log('debe hacer evaluacion para la materia:',
          //    estudianteMateriaImpartida);
        }

      }
    );
  }

  verificarEvaluacionDocenteMateriaOptativa(
    estudianteMateriaImpartida: EstudianteMateriaImpartida): void {
    let informacionResponse: any;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioEvaluacion =
      'idEstudianteMateriaImpartida~' + estudianteMateriaImpartida.id + ':IGUAL';
    urlParameter.set('criterios', criterioEvaluacion);
    urlParameter.set('ordenamiento', 'id:ASC');
    this.evaluacionDocenteService.getListaEvaluacionDocente(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        informacionResponse = response.json();
        //console.log('informacionResponse', informacionResponse);
      },
      error => { console.log(error); },
      () => {
        if (informacionResponse.registrosTotales < 1) {
          //console.log('finalizar su evaluacion de la materia Optativa',
          //estudianteMateriaImpartida.materiaImpartida);
          this.finalizarEvaluacionDocente(estudianteMateriaImpartida);
        } else {
          //console.log('Ya esta registrada su evaluacion de la materia',
          //    estudianteMateriaImpartida.materiaImpartida);
        }
      }
    );
  }

  verificarEvaluacionDocente(estudianteMateriaImpartida: EstudianteMateriaImpartida) {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioEvaluacion =
      'idEstudianteMateriaImpartida~' + estudianteMateriaImpartida.id + ':IGUAL';
    urlParameter.set('criterios', criterioEvaluacion);
    urlParameter.set('ordenamiento', 'id:ASC');
    this.evaluacionDocenteService.getListaEvaluacionDocente(
      this.erroresConsultas,
      urlParameter,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        this.relacionMateriasEvaluaciones.evaluacionesContadas++;
        let responseEvaluacion = response.json();
        let profesor = null;
        estudianteMateriaImpartida.materiaImpartida.profesores.forEach((itemProfesor) => {
          if (itemProfesor.titular) {
            profesor = itemProfesor.profesor;
          }
        });

        if (responseEvaluacion.registrosTotales < 1) {
          if (profesor) {
            this.registros.push({
              _estudiante: estudianteMateriaImpartida,
              _profesor: profesor
            });
          }
          //console.log(this.registros);
        } else {
          this.relacionMateriasEvaluaciones.evaluaciones++;
        }
        this.verificarEvaluaciones();
      }, error => {
          console.error(error);

      },
      () => {
      }
    );
  }

  finalizarEvaluacionDocente(estudianteMateria: EstudianteMateriaImpartida): void {

    let jsonActualizar = {
      idEstudianteMateriaImpartida : estudianteMateria.id,
      idProfesor : estudianteMateria.materiaImpartida.getIdProfesorTitular()
    };

    if (estudianteMateria.materiaInterprograma && estudianteMateria.materiaImpartida.id) {
      jsonActualizar = {
        idEstudianteMateriaImpartida : estudianteMateria.id,
        idProfesor : estudianteMateria.materiaInterprograma.getIdProfesorTitular()
      };
    }

    let jsonFormulario = JSON.stringify(jsonActualizar, null, 2);

    //console.log('jsonActualizar', jsonFormulario);
    this.evaluacionDocenteService.postEvaluacionDocente(
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {},
      error => {
        console.log(error);
      },
      () => {
        this.verificarEvaluacionDocente(estudianteMateria);
      }
    );
  }


  onCambiosTablaIdioma(): void {
    if (!this.evaluacionDocenteAlumnoActual.estudianteAbsuelto) {
      this.erroresConsultas.push(
        new ErrorCatalogo("success", false, 200, 'Evaluaciones Finalizadas', ''));
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idEstudiante~' + this.idEstudiante + ':IGUAL');
      this.estudianteGrupoIdiomaService.getListaEstudiantesGrupoIdioma(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
        response => {
          response.json().lista.forEach((idioma) => {
            let urlParams = new URLSearchParams();
            let criterios = "";
            criterios += "idPeriodo~" + this.estudianteActual.periodoActual.id + ":IGUAL";
            criterios += ",idEstudiante~" + this.estudianteActual.id + ":IGUAL";
            criterios += ",idEstudianteGrupoIdioma~" + idioma.id + ":IGUAL";
            urlParams.set("criterios", criterios);
            this.evaluacionDocenteIdiomasAlumnoService.getListaEvaluacionDocenteIdiomasAlumno(
              this.erroresConsultas,
              urlParams
            ).subscribe(
              response => {
                if(response.json().lista.length>=1){
                  response.json().lista.forEach((evaluacionidioma) => {
                    let urlParamsEDI = new URLSearchParams();
                    let criterios = "";
                    criterios += "idEvaluacionDocenteIdiomasAlumno~" + evaluacionidioma.id + ":IGUAL";
                    urlParamsEDI.set("criterios", criterios);
                    this.evaluacionDocenteIdiomasService.getListaEvaluacionDocente(
                      this.erroresConsultas,
                      urlParamsEDI
                    ).subscribe(
                      response => {
                        if(response.json().lista.length>=1){
                          console.log(response.json());
                          /*
                           let urlParamsREDI = new URLSearchParams();
                           let criterios = "";
                           urlParamsREDI.set("criterios", criterios);
                           this.respuestasEvaluacionDocenteIdiomasService.getListaRespuestasEvaluacionDocenteIdiomas(
                           this.erroresConsultas,
                           urlParamsREDI
                           ).subscribe(
                           response => {
                           console.log(response.json());
                           }
                           );
                           */
                        }else{
                          this.registrosIdiomas.push(new EstudianteGrupoIdioma(idioma));
                        }
                      }
                    );
                  });
                }
              }
            );

          });
        },
        error => {
          //console.log(error);
        },
        () => {
          ////console.log('registrosIdioma', this.registrosIdiomas);
        }
      );
    }
  }
  reiniciarContadoresEvauaciones(): void {
    this.relacionMateriasEvaluaciones.materias = 0;
    this.relacionMateriasEvaluaciones.materiasContadas = 0;
    this.relacionMateriasEvaluaciones.evaluaciones = 0;
    this.relacionMateriasEvaluaciones.evaluacionesContadas = 0;
  }
  verificarEvaluaciones(): void {
    let me = this;

    if (this.relacionMateriasEvaluaciones.materias == this.relacionMateriasEvaluaciones.materiasContadas &&
      this.relacionMateriasEvaluaciones.materiasContadas == this.relacionMateriasEvaluaciones.evaluacionesContadas &&
      this.relacionMateriasEvaluaciones.evaluacionesContadas == this.relacionMateriasEvaluaciones.evaluaciones) {
      if (this.evaluacionDocenteAlumnoActual) {
        let obj = { evaluacionesFinalizadas: true };
        let jsonFormulario = JSON.stringify(obj, null, 2);
        this.evaluacionDocenteAlumnoService.putEvaluacionDocenteAlumno(this.evaluacionDocenteAlumnoActual.id, jsonFormulario, this.erroresConsultas).subscribe(
          response => {
              console.log("success");
          },
          error => {
              console.error(error);
          },
          () => {
            ////console.log("actualizado");
            if (this.estudianteActual) {
              me.recuperarUsuarioActual();
            } else if (this.estudianteMovilidadActual) {
              me.recuperarUsuarioActualMovilidad();
            }

          }

        );
      }
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;


    if (this.hasOwnProperty('paginacion') &&
      this.paginacion.hasOwnProperty("registrosPagina")) {
      result = true;
    }
    return result;
  }


  getSolicitud(): void {

  }
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  gotoDetail() {
    if (this.registroSeleccionado) {
      if (this.registroSeleccionado._estudiante) {
        sessionStorage.clear();
        sessionStorage.setItem("idEstudianteMateriaImpartida",
          this.registroSeleccionado._estudiante.id);
        //sessionStorage.setItem("idEstudianteMateriaImpartida","11");
        sessionStorage.setItem("idProfesor", this.registroSeleccionado._profesor.id);
        sessionStorage.setItem("nombreMateria",
          this.registroSeleccionado._estudiante.materiaImpartida.getStrDescripcion());
        sessionStorage.setItem("nombreProfesor",
          this.registroSeleccionado._profesor.getNombreCompleto());
        //sessionStorage.setItem("idProfesor","3");
        //let link = ['EvaluacionSteps'];
        this.router.navigate(['alumno','evaluacion-steps']);
      }else {
        //console.log(this.registroSeleccionado);
        sessionStorage.clear();
        sessionStorage.setItem("idEstudianteGrupoIdioma",
          this.registroSeleccionado.id);
        sessionStorage.setItem("nombreMateria",
          this.registroSeleccionado.grupoIdioma.idioma.descripcion);
        sessionStorage.setItem("nombreProfesor",
          this.registroSeleccionado.grupoIdioma.profesor);
        sessionStorage.setItem("profesor", this.registroSeleccionado.grupoIdioma.profesor);

        let urlParams = new URLSearchParams();
        let criterios = "";
        criterios += "idPeriodo~" + this.estudianteActual.periodoActual.id + ":IGUAL";
        criterios += ",idEstudiante~" + this.estudianteActual.id + ":IGUAL";
        criterios += ",idEstudianteGrupoIdioma~" + this.registroSeleccionado.id + ":IGUAL";
        urlParams.set("criterios", criterios);
        this.evaluacionDocenteIdiomasAlumnoService.getListaEvaluacionDocenteIdiomasAlumno(
          this.erroresConsultas,
          urlParams
        ).subscribe(
          response => {
            if(response.json().lista.length>=1){
              response.json().lista.forEach((evaluacionidioma) => {
                sessionStorage.setItem("idEvaluacionDocenteIdiomasAlumno",
                  evaluacionidioma.id);
                //let link = ['EvaluacionIdiomaSteps'];
                //this.router.navigate(link);
                this.router.navigate(['alumno','evaluacion-idioma-steps']);
              });
            }
          }
        );
      }
    }
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  alumnoEvaluacionSteps(registro): void {
    if (this.registroSeleccionado !== registro) {
      ////console.log('Entra:::');
    } else {
      this.registroSeleccionado = null;
    }

  }
  recuperarUsuarioActual(): void {

    // if (Seguridad.hasRol("ESTUDIANTE")) {

    ////console.log('usuario actual: ' + this.usuarioLogueado.id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + this.auxiliar + ':IGUAL');
    //console.log('criterios en estudiante normal');
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let estudiante;

        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
        });
        this.idEstudiante = estudiante.id;
        this.estudianteActual = estudiante;
        ////console.log("idEstudiante", this.idEstudiante);
        if (this.estudianteActual && this.estudianteActual.periodoActual &&
          this.estudianteActual.periodoActual.id) {
          let urlParams = new URLSearchParams();
          let criterios = "";
          criterios += "idPeriodoEscolar~" + this.estudianteActual.periodoActual.id + ":IGUAL";
          criterios += ",idEstudiante~" + this.estudianteActual.id + ":IGUAL";
          urlParams.set("criterios", criterios);
          this.evaluacionDocenteAlumnoService.getListaEvaluacionDocenteAlumno(this.erroresConsultas, urlParams).subscribe(
            response => {
              let evDoAl;
              response.json().lista.forEach(function (e) {
                evDoAl = new EvaluacionDocenteAlumno(e);
              });
              this.evaluacionDocenteAlumnoActual = evDoAl;
              this.onCambiosTabla();
              this.onCambiosTablaIdioma();
              ////console.log("recuperado");

            }
          );
        }
      }
    );
    /*}
     else {
     console.error("No es usuario estudiante");
     }*/

  }

  recuperarUsuarioActualMovilidad(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + this.auxiliar + ':IGUAL');
    this.estudianteMovilidadService.getListaEstudianteMovilidadExterna(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let estudiante;

        response.json().lista.forEach((elemento) => {
          estudiante = new EstudianteMovilidadExterna(elemento);
        });
        this.idEstudiante = estudiante.id;
        this.estudianteMovilidadActual = estudiante;
        ////console.log("idEstudiante", this.idEstudiante);
        if (this.estudianteMovilidadActual && this.estudianteMovilidadActual.idPeriodoActual &&
          this.estudianteMovilidadActual.idPeriodoActual.id) {
          let urlParams = new URLSearchParams();
          let criterios = "";
          criterios += "idPeriodoEscolar~" + this.estudianteMovilidadActual.idPeriodoActual.id + ":IGUAL";
          criterios += ",idEstudianteMovilidadExterna~" + this.estudianteMovilidadActual.id + ":IGUAL";
          urlParams.set("criterios", criterios);
          //console.log('criterios', criterios);
          this.evaluacionDocenteAlumnoService.getListaEvaluacionDocenteAlumno(this.erroresConsultas, urlParams).subscribe(
            response => {
              let evDoAl;
              response.json().lista.forEach(function (e) {
                evDoAl = new EvaluacionDocenteAlumno(e);
              });
              this.evaluacionDocenteAlumnoActual = evDoAl;
              //console.log('evaluacionMovilidad', this.evaluacionDocenteAlumnoActual);
              this.onCambiosTabla();
              this.onCambiosTablaIdioma();
              ////console.log("recuperado");

            },
            () => {
              //console.log('evaluacionMovilidad', this.evaluacionDocenteAlumnoActual);
            }
          );
        }
      }
    );
  }
  private materiaImpartidaEsOptativa(materiaImpartida: MateriaImpartida): boolean {
    let esOptativa: boolean = false;
    if (materiaImpartida && materiaImpartida.materia.tipoMateria.id === 2) {
      esOptativa = true;
    }
    return esOptativa;
  }

  private materiaImpartidaESLGAC(materiaImpartida: MateriaImpartida): boolean {
    let estLGAC: boolean = false;
    if (materiaImpartida && materiaImpartida.materia.tipoMateria.id === 1) {
      estLGAC = true;
    }
    return estLGAC;
  }

  private prepareService(): void {
    this.estudianteService = this.catalogoService.getEstudianteService();
    this.estudianteMovilidadService = this.catalogoService.getEstudianteMovilidadExterna();
    this.evaluacionDocenteAlumnoService = this.catalogoService.getEvaluacionDocenteAlumnoService();
    this.usuarioService = this.catalogoService.getUsuarioService();
    this.estudianteMateriaImpartidaService =
      this.catalogoService.getEstudianteMateriaImpartidaService();
    this.profesorMateriaService = this.catalogoService.getProfesorMateriaService();
    this.evaluacionDocenteService = this.catalogoService.getEvaluacionDocenteService();
    this.usuarioRolService = this.catalogoService.getUsuarioRolService();
    this.estudianteGrupoIdiomaService = this.catalogoService.getEstudianteGrupoIdiomaService();
    this.evaluacionDocenteIdiomasAlumnoService = this.catalogoService.getEvaluacionDocenteIdiomasAlumnoService();
    this.evaluacionDocenteIdiomasService = this.catalogoService.getEvaluacionDocenteIdiomasService();
  }

}
