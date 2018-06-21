import {Component, OnInit, Renderer, Injector, ViewChild} from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {GrupoIdioma} from "../../services/entidades/grupo-idioma.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {URLSearchParams} from "@angular/http";
import {Validacion} from "../../utils/Validacion";
import {Step} from "../../utils/steps/step";
import {EstadoStep} from "../../utils/steps/modelos/estado-step";
import {TipoStep} from "../../utils/steps/modelos/tipo-step";
import {ErrorCatalogo} from "../../services/core/error.model";
import {DatosCursoComponent} from "../steps-datos-curso-idiomas/datos-curso.component";
import {EstudiantesCursoComponent} from "../steps-estudiantes-curso-idiomas/estudiantes-curso.component";
import {WizardComponent} from "../../wizard/wizard.component";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {EstudianteGrupoIdioma} from "../../services/entidades/estudiante-grupo-idioma.model";


@Component({
  selector: 'app-agregar-grupo-idiomas',
  templateUrl: './agregar-grupo-idiomas.component.html',
  styleUrls: ['./agregar-grupo-idiomas.component.css']
})
export class AgregarGrupoIdiomasComponent implements OnInit {
  idFormularioGuardado;
  private alertas: Array<Object> = [];
  editarCursoBandera: boolean = false;
  entidadProfesor;
  idParametro = null;
  profesorService;
  private sub: any;

  @ViewChild('wizard')
  wc : WizardComponent;

  @ViewChild('datosCurso')
  datosCurso : DatosCursoComponent;

  @ViewChild('agregarEstudiantes')
  agregarEstudiantes : EstudiantesCursoComponent;

  constructor(private _router: Router,
              route: ActivatedRoute,
              public _catalogosService: CatalogosServices,
              private _spinner: SpinnerService) {
    this.idParametro = null;
    sessionStorage.clear();
    this.sub = route.params.subscribe(params => {
      this.idParametro = +params['id'];
      if (this.idParametro) {
        console.log('hay parametro');
        sessionStorage.setItem("idGrupoIdioma",params['id']);
        this.editarCursoBandera = true;
      }
    });
    this.formularioEvaluacionDocente = new FormGroup({
      idEstudiante: new FormControl(''),
      idPeriodoEscolar: new FormControl(''),
      idEstudianteGrupoIdioma: new FormControl('')
    });
  }

  previous(){
      //this.datosCurso.prevMethod();
      this.wc.previous();
      this.datosCurso.prevMethod();
  }

  next(){
    console.log('next');
    //console.log(this.wc);
    this.wc.toNext();
  }

  onStep1Next(): any {
    if(this.datosCurso.nextMethod())
      this.wc.next();
  }
  onStep2Next(): any {
    if(this.onComplete())
      this.wc.next();
  }

  onComplete(): any {
    console.log('Finalizar');
    if (!sessionStorage.getItem("estudiantes") || sessionStorage.getItem("estudiantes") == "") {
      console.log('fin');
      this.agregarEstudiantes.noEstudiantes('Debe agregar Estudiantes al grupo.');
      this.alertas[0] = {
        type: 'danger',
        msg: "Debe agregar Estudiantes al grupo.",
        closable: true
      };
    } else {
      console.log('Confirmar');
      this.constructorConfirma();
      //this.modalConfirmarAgregarGrupoIdioma();
    }
  }

  cancelar(): void {
    this._router.navigate(['idiomas','grupos-idiomas']);
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  ngOnInit() {
  }
  redirectListaGrupoIdioma() : void {
    this._router.navigate(['idiomas','grupos-idiomas']);
  }
  //////////////////////////////MODALS//////////////////////----------------------------------------------------
  @ViewChild('modalConfirmar')
  modalConfirmar: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';
  ///////////////////////////////////////////-------------MODAL CONFORMACION-----------------------------//////////
  dias = {Lunes: 'Lu', Martes: 'Ma', Miercoles: 'Mi', Jueves: 'Ju', Viernes: 'Vi', Sabado: 'Sa'};
  //Json para ser enviado a guardar
  jsonDatosGrupo: any;
  //services
  grupoIdiomaService;
  estudianteGrupoIdiomaService;
  estudianteService;
  evaluacionDocenteIdiomaAlumnoService;
  entidadEstudianteGrupoIdioma: EstudianteGrupoIdioma;
  idPeriodoGrupo;

  formularioEvaluacionDocente: FormGroup;

  //mesajes de error
  private erroresConsultas: Array<Object> = [];

  private constructorConfirma(): void {
  this.erroresConsultas = [];
    this.prepareServices();
    this.jsonDatosGrupo = {
      horario: sessionStorage.getItem("horario"),
      fechaInicio: sessionStorage.getItem("inicioCurso") + ' 10:30 am',
      fechaFin: sessionStorage.getItem("finCurso") + ' 10:30 am',
      diasSemana:"",
      institucion: sessionStorage.getItem("institucionAcreditadora"),
      idPeriodo: sessionStorage.getItem("periodo"),
      idIdioma: sessionStorage.getItem("idioma"),
      idArchivoPrograma: sessionStorage.getItem('archivoPrograma'),
      idNivel: sessionStorage.getItem("nivel"),
      profesor: sessionStorage.getItem("profesor")
    };

    this.idPeriodoGrupo = sessionStorage.getItem('periodo');

    for (let dia in this.dias) {
      //console.log('DIASSS:::' + dia);
      if (sessionStorage.getItem(dia) == "true")
        this.jsonDatosGrupo.diasSemana += this.dias[dia] + ', ';
    }
    this.abrirModalConfirma();
  }
  agregarGrupo(): void {
    this._spinner.start('agre');
    let idGrupoIdioma = 0;

    if (sessionStorage.getItem("idGrupoIdioma")) {
      idGrupoIdioma = Number(sessionStorage.getItem("idGrupoIdioma"));
      this.grupoIdiomaService.putGrupoIdioma(idGrupoIdioma,
          JSON.stringify(this.jsonDatosGrupo), this.erroresConsultas).subscribe(
          responseGrupoIdioma => {
            let estudiantes = eval(sessionStorage.getItem('estudiantes'));
            let estudiantesRegistrados =
                eval(sessionStorage.getItem('estudiantesRegistrados'));
            let estudiantesEliminados =
                eval(sessionStorage.getItem('estudiantesEliminados'));

            if (estudiantes) {
              estudiantes.forEach(idEstudiante => {
                if (estudiantesRegistrados.indexOf(idEstudiante) == -1) {
                  this.estudianteService.getEstudiante(idEstudiante, this.erroresConsultas).subscribe(
                      responseEstudiante => {
                        let jsonEstudianteGrupoIdioma = JSON.stringify(
                            {
                              idGrupoIdioma: idGrupoIdioma,
                              idEstudiante: responseEstudiante.json().id
                            });

                        this.estudianteGrupoIdiomaService.postEstudianteGrupoIdioma(
                            jsonEstudianteGrupoIdioma,
                            this.erroresConsultas
                        ).subscribe(
                            response => {
                              console.log(response.json());
                              this.agregarEvaluacionDocente(
                                  responseEstudiante.json().id,
                                  this.idPeriodoGrupo,
                                  response.json().id
                              );
                            },
                            error => {
                              this._spinner.stop('agre');
                            },
                            () => {
                            }
                        );
                      });
                }
              });
              ////console.log(estudiantesEliminados.length);
              if (estudiantesEliminados  === null) {
              } else {
                estudiantesEliminados.forEach(idEstudianteRegistrado => {
                  //TO DO eliminar EstudianteGrupoIdioma
                  //console.log('estudiantesss::' + estudiantes.indexOf(idEstudianteRegistrado));
                  let urlParameter: URLSearchParams = new URLSearchParams();
                  urlParameter.set('criterios', 'idGrupoIdioma.id~' + idGrupoIdioma + ':IGUAL' +
                      ',idEstudiante.id~' + idEstudianteRegistrado + ':IGUAL;AND');
                  this.estudianteGrupoIdiomaService
                      .getListaEstudiantesGrupoIdioma(
                          this.erroresConsultas,
                          urlParameter
                      ).subscribe(
                      response => {
                        if (response.json().lista.length > 0) {
                          let idEstudianteGrupo = response.json().lista[0].id;
                          this.eliminarEvaluacionDocenteIdiomaAlumno(idEstudianteGrupo);
                          this.estudianteGrupoIdiomaService.deleteEstudianteGrupoIdioma(
                              idEstudianteGrupo,
                              this.erroresConsultas
                          ).subscribe(
                              error => {
                              },
                              () => {
                              }
                          );
                        }
                      }
                  );
                });
              }
              sessionStorage.clear();
              this.redirectListaGrupoIdioma();
            }
          },
          error => {
            this._spinner.stop('agre');
          },
          () => {
            this._spinner.stop('agre');
            this.cerrarModalConfirma();
            this.redirectListaGrupoIdioma();
          }
      );
    }else {
      this.grupoIdiomaService.postGrupoIdioma(
          JSON.stringify(this.jsonDatosGrupo),
          this.erroresConsultas
      ).subscribe(
          responseGrupoIdioma => {
            let estudiantes = eval(sessionStorage.getItem("estudiantes"));
            if (estudiantes) {
              for(let idEstudiante = 0; idEstudiante < estudiantes.length; idEstudiante++) {
                this.estudianteService.getEstudiante(estudiantes[idEstudiante], this.erroresConsultas).subscribe(
                    responseEstudiante => {
                      let jsonEstudianteGrupoIdioma = JSON.stringify(
                          {
                            idGrupoIdioma:responseGrupoIdioma.json().id,
                            idEstudiante: responseEstudiante.json().id
                          });

                      this.estudianteGrupoIdiomaService.postEstudianteGrupoIdioma(
                          jsonEstudianteGrupoIdioma,
                          this.erroresConsultas
                      ).subscribe(
                          responseEstudianteGrupoIdiomaService => {
                            this.agregarEvaluacionDocente(
                                responseEstudiante.json().id,
                                this.idPeriodoGrupo,
                                responseGrupoIdioma.json().id
                            );
                            sessionStorage.clear();
                            this.redirectListaGrupoIdioma();
                          }
                      );
                    });
              }
            }
          },
          error => {
            this._spinner.stop('agre');
          },
          () => {
            this._spinner.stop('agre');
            this.cerrarModalConfirma();
            this.redirectListaGrupoIdioma();
          }
      );
    }
  }

  agregarEvaluacionDocente(idEstudiante, periodo, estudianteGrupo) {
    console.log(idEstudiante, periodo, estudianteGrupo);
    this.formularioEvaluacionDocente = new FormGroup({
      idEstudiante: new FormControl(idEstudiante),
      idPeriodoEscolar: new FormControl(periodo),
      idEstudianteGrupoIdioma: new FormControl(estudianteGrupo)
    });
    this.evaluacionDocenteIdiomaAlumnoService.postEvaluacionDocenteIdiomasAlumno(
        JSON.stringify(this.formularioEvaluacionDocente.value, null, 2),
        this.erroresConsultas
    ).subscribe(
        response => {
          console.log(response.json());
        },
        error => {
          console.error(error);
        },
        () => {
        });
  }
  eliminarEvaluacionDocenteIdiomaAlumno(idEstudianteGrupoIdioma): void {
    console.log(idEstudianteGrupoIdioma);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudianteGrupoIdioma~' + idEstudianteGrupoIdioma + ':IGUAL');
    this.evaluacionDocenteIdiomaAlumnoService.getListaEvaluacionDocenteIdiomasAlumno(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
        response => {
          console.log(response.json());
          let idEvaluacionDocenteIdiomaAlumno = response.json().id;

        },
        error => {
          console.error(error);
        },
        () => {
        });
  }

  /*eliminarRegistroEvaluacion(idEvaluacionDocente): void {
    this.evaluacionDocenteIdiomaAlumnoService.deleteEvaluacionDocenteIdiomasAlumno(
        idEvaluacionDocenteIdiomaAlumno,
        this.erroresConsultas
    ).subscribe(
        response => {
          console.log('Se elimino');
        },
        error => {
          console.error(error);
        },
        () => {
        });
  }*/

  private prepareServices() {
    this.estudianteService = this._catalogosService.getEstudiante();
    this.grupoIdiomaService = this._catalogosService.getGrupoIdiomaService();
    this.estudianteGrupoIdiomaService =
        this._catalogosService.getEstudianteGrupoIdiomaService();
    this.evaluacionDocenteIdiomaAlumnoService =
        this._catalogosService.getEvaluacionDocenteIdiomasAlumnoService();
  }
  private abrirModalConfirma(): void {
    this.modalConfirmar.open('lg');
  }
  private cerrarModalConfirma(): void {
    this.modalConfirmar.close();
  }
}
