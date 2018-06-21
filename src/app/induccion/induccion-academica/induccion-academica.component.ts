import {Component, OnInit, Injector, Renderer, ViewChild} from '@angular/core';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {InduccionService} from '../../services/entidades/induccion.service';
import {EstudianteService} from '../../services/entidades/estudiante.service';
import {AuthService} from '../../auth/auth.service';
import {URLSearchParams} from '@angular/http';
import {Induccion} from '../../services/entidades/induccion.model';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ConfigService} from '../../services/core/config.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {PlanEstudio} from '../../services/entidades/plan-estudio.model';

@Component({
  selector: 'app-induccion-academica',
  templateUrl: './induccion-academica.component.html',
  styleUrls: ['./induccion-academica.component.css']
})
export class InduccionAcademicaComponent implements OnInit {

  @ViewChild('induccionAcademica')
  induccionAcademica: ModalComponent;
  @ViewChild('induccionServicios')
  induccionServicios: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  datosCompartidos: any = {};
  idTema: number = 1;
  idSubtema: number = 1;
  errores: Array<any> = [];
  usuarioLogueado: UsuarioSesion;
  idEstudiante: number;
  entidadEstudiante: Estudiante = null;
  // se declaran variables para consultas de base de datos
  servicioInduccion;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  showCheckAcept: boolean = false;

  constructor(private injector: Injector, private _renderer: Renderer,
              private _servicioInduccion: InduccionService,
              private _estudianteServiace: EstudianteService,
              private _authService: AuthService,
              private _spinner: SpinnerService,
              private archivoService: ArchivoService) {
    this.usuarioLogueado = this._authService.getUsuarioLogueado();
    this.recuperarUsuarioActual(this.usuarioLogueado.id);
    this.prepareServices();
  }

  ngOnInit() {
  }

  recuperarUsuarioActual(id: number): void {
    this._spinner.start('recuperarEstudiante');
    // console.log('usuario actual: ' + id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + id + ':IGUAL');
    this._estudianteServiace.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let estudiante;
        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
          // console.log(estudiante);
        });
        this.idEstudiante = estudiante.id;
        this.entidadEstudiante = estudiante;
        // console.log('Estudiante logeado: ' + this.idEstudiante);
      },
      error => {
        this._spinner.stop('recuperarEstudiante');
      },
      () => {
        this._spinner.stop('recuperarEstudiante');
      }
    );

  }
  private prepareServices(): void {
    this.servicioInduccion = this._servicioInduccion;
  }

  private ejecutarConsultaArchivos(): void {

    if (!this.datosCompartidos.respuestas) {
      this.datosCompartidos.respuestas = Array<any>();
    }
    if (!this.datosCompartidos.respuestas[this.idTema]) {
      this.datosCompartidos.respuestas[this.idTema] = Array<any>();
    }
    if (!this.datosCompartidos.respuestas[this.idTema][this.idSubtema]) {
      this.datosCompartidos.respuestas[this.idTema][this.idSubtema] = {
        respondido: true,
        aceptado: this.entidadEstudiante.terminos
      };
    }
    this.datosCompartidos.terminosAceptados =
      this.datosCompartidos.respuestas[this.idTema][this.idSubtema];


    this.datosCompartidos.listadoInducciones = Array<Induccion>();

    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = 'idTema~' + this.idTema + ',idSubtema~' + this.idSubtema;

    urlSearch.set('criterios', criterios);


    this.servicioInduccion.getListaInduccion(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.datosCompartidos.listadoInducciones.push(new Induccion(item));
        });
      },
      error => {

      },
      () => {
        // console.log(this.datosCompartidos.listadoInducciones);

      }
    );
  }

  /*--------------------TODO INICIA modal Nomras y reglamentos*/
  formularioTerminos: FormGroup;
  showHelp: boolean = false;
  terminoAceptado: boolean = false;
  terminos: boolean = false;
  tipoModal;
  planEstudio: PlanEstudio;

  limpiarVariables() {
    this.showHelp = false;
    this.terminoAceptado = false;
    this.terminos = false;
    this.planEstudio = null;
  }
  modalInduccionAcademica(tipoInduccion) {
    this.datosCompartidos.listadoInducciones = Array<Induccion>();
    // console.log(this.datosCompartidos.listadoInducciones);
    // console.log('tipo', tipoInduccion);
    this.tipoModal = tipoInduccion;
    this.limpiarVariables();
    this.inicializarFormularioNormasReglamentos();
    this.idSubtema = 0;
    
    this.idTema = 1;
    switch (this.tipoModal) {
      case 'reglamentos':
        this.tituloModal = 'Normas y reglamento';
        // this.imagenModal = 'images/iconos/biblioteca.png';
        this.idSubtema = 3;
        break;
      case 'programa':
        this.idSubtema = 2;
        this.tituloModal = 'Programa de estudio';
        break;
      case 'planEstudios':
        this.idSubtema = 1;
        this.tituloModal = 'Plan de estudios';
        this.planEstudio = this.entidadEstudiante.promocion.idPlanEstudios;
        break;
      default:
        break;

    }
    this.ejecutarConsultaArchivos();
    this.condicionesModalValidacion(this.tipoModal);
    this.showHelp = false;
    this.induccionAcademica.open('lg');

  }

  condicionesModalValidacion(tipo) {
    this.recuperarUsuarioActual(this.usuarioLogueado.id);
    // console.log('tipo', tipo);
    switch (tipo) {
      case 'reglamentos':
        this.showCheckAcept = this.entidadEstudiante.terminos;
        break;
      case 'programa':
        this.showCheckAcept = this.entidadEstudiante.terminosPrograma;
        break;
      case 'planEstudios':
        this.showCheckAcept = this.entidadEstudiante.terminosPlan;
        break;
      default:
        break;

    }

  }

  closeModalNormasReglamentos() {
    if (this.showCheckAcept === true) {
      this.induccionAcademica.close();
    } else {
      if (this.terminos === true) {
        let jsonTerminos;
        switch (this.tipoModal) {
          case 'reglamentos':
            jsonTerminos = '{"terminos": ' + true + '}';
                break;
          case 'programa':
            jsonTerminos = '{"terminosPrograma": ' + true + '}';
                break;
          case 'planEstudios':
            jsonTerminos = '{"terminosPlan": ' + true + '}';
                break;
          default:
                break;
        }

        this.updateEstudiante(jsonTerminos);
        this.induccionAcademica.close();
        this.showHelp = false;
      } else {
        this.showHelp = true;
      }
    }
  }

  updateEstudiante(json) {
    this._estudianteServiace.putEstudiante(
      this.idEstudiante , json , this.erroresConsultas
    ).subscribe(
      response => {

      },
      error => {
        console.error(error);
      },
      () => {
        this.showCheckAcept = false;
      }
    );
    this.induccionAcademica.close();
    this.showHelp = false;
  }

  inicializarFormularioNormasReglamentos() {
    this.formularioTerminos = new FormGroup({
      checkTerminos: new FormControl('', Validators.compose([
        Validators.required])),
    });
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
      this.archivoService
        .generarTicket(jsonArchivo, this.errores)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
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

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
      this.archivoService
        .generarTicket(jsonArchivo, this.errores)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivodescargar/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            // console.log('Error downloading the file.');
            this._spinner.stop('descargarArchivo');
          },
          () => {
            // console.info('OK');
            this._spinner.stop('descargarArchivo');
          }
        );
    }

  }
  validarTerminos(valor): void {
    this.terminos = valor;
    if (this.terminos === true) {
      this.showHelp = false;
      // console.log('chals' + valor);
    } else {
      this.showHelp = true;
    }
  }
  /*TODO TERMINA modal NorMas y reglamentos-------------------*/

  /*TODO INICIA MODALS de induccion de servicios -------------------*/
  tituloModal= '';
  imagenModal;

  modalsInduccionServicios(tipoInduccionServicio) {
    this.idTema = 2;
    switch (tipoInduccionServicio) {
      case 'biblioteca':
        this.tituloModal = 'Biblioteca';
        // this.imagenModal = 'images/iconos/biblioteca.png';
        this.idSubtema = 5;
        break;
      case 'fotocopiadora':
        this.idSubtema = 6;
        this.tituloModal = 'Fotocopiadora';
        break;
      case 'tic':
        this.idSubtema = 7;
        this.tituloModal = 'TIC´s';
        break;
      case 'seguro':
        this.idSubtema = 8;
        this.tituloModal = 'Seguro Escolar';
        break;
      case 'becas':
        this.idSubtema = 9;
        this.tituloModal = 'Becas';
        break;
      case 'movilidad':
        this.idTema = 1;
        this.idSubtema = 4;
        this.tituloModal = 'Movilidad académica';
        break;
      case 'titulacion':
        this.idTema = 1;
        this.idSubtema = 10;
        this.tituloModal = 'Guías y documentación para titulación';
        break;
      default:
        break;

    }

    this.ejecutarConsultaArchivos();
    this.induccionServicios.open('lg');
  }

  closeModalServicioInduccion() {
    this.induccionServicios.close();
  }

  /*TODO TERMINA MODALS de induccion de servicios -------------------*/
}
