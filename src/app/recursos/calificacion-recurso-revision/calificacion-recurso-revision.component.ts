import { Component, OnInit } from '@angular/core';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Profesor} from '../../services/entidades/profesor.model';
import {RecursoRevision} from '../../services/entidades/recurso-revision.model';
import {ProfesorRevisionTrabajo} from '../../services/entidades/profesor-revision-trabajo.model';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {ProfesorService} from '../../services/entidades/profesor.service';
import {RecursoRevisionService} from '../../services/entidades/recurso-revision.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {ProfesorRevisionTrabajoService} from '../../services/entidades/profesor-revision-trabajo.service';
import {AuthService} from '../../auth/auth.service';
import {Validacion} from '../../utils/Validacion';
import {URLSearchParams} from '@angular/http';
import {ConfigService} from '../../services/core/config.service';

@Component({
  selector: 'app-calificacion-recurso-revision',
  templateUrl: './calificacion-recurso-revision.component.html',
  styleUrls: ['./calificacion-recurso-revision.component.css']
})
export class CalificacionRecursoRevisionComponent implements OnInit {
  usuarioLogueado: UsuarioSesion;
  idRecursoRevision: number;
  idRevisionTrabajo: number;
  erroresConsultas: Array<ErrorCatalogo> = [];
  listaProfesores: Array<Profesor> = [];
  entidadProfesor: Profesor;
  profesor: Profesor;
  idProfesor: number = 0;
  entidadRecursoRevision: RecursoRevision;
  busquedaRecursoRevisioin: RecursoRevision;
  obtenerEstatusProfesor: ProfesorRevisionTrabajo;
  arregloEstatusProfesor: Array<ProfesorRevisionTrabajo> = [];
  idEntidadRecursorevision: number;
  validacionActiva: boolean = false;
  formulario: FormGroup;
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private sub: any;

  constructor(private _router: Router, route: ActivatedRoute,
              private _profesorService: ProfesorService,
              private _recursoRevisionService: RecursoRevisionService,
              private _spinner: SpinnerService,
              private _archivoService: ArchivoService,
              private _profesorRevisionTrabajoService: ProfesorRevisionTrabajoService,
  private _authService: AuthService) {
    this.sub = route.params.subscribe(params => {
      this.idRecursoRevision = +params['id']; //  (+) converts string 'id' to a number
      this.idRevisionTrabajo = +params['idRevisionTrabajo']; //  (+) converts string 'id' to a number

      //  In a real app: dispatch action to load the details here.
    });
    // // console.log('Revisando id que llega '
    // + this.idRecursoRevision + 'este id de RevisionTrabajo' + this.idRevisionTrabajo);
    this.usuarioLogueado = this._authService.getUsuarioLogueado();
    // console.log(this.usuarioLogueado.id);
    this.recuperarUsuarioActual();
    this.obtenerRecursoRevision();
    this.formulario = new FormGroup({
      calificacionDefinitiva: new FormControl('', Validators.compose([
        Validators.required, Validacion.calificacionValidator])),
      comentariosEvaluacion: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])),
      idEstatus: new FormControl('')
    });
  }

  ngOnInit() {
  }

  recuperarUsuarioActual(): void {
    // console.log('usuario actual: ' + this.usuarioLogueado.id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL');
    this._profesorService.getListaProfesor(
      this.erroresConsultas,
      urlParameter
    ).subscribe(response => {
      response.json().lista.forEach((profesor) => {
        this.idProfesor = profesor.id;
        // console.log('id del profesor' + this.idProfesor);
      });
    });

  }
  obtenerRecursoRevision(): void {
    this._spinner.start('obtenerRecurso');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'id~' + this.idRecursoRevision + ':IGUAL');
    this._recursoRevisionService.getListaRecursoRevisionModal(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((busquedaRecursoRevisioin) => {
          this.idEntidadRecursorevision = busquedaRecursoRevisioin.id;
          // console.log('este es el id' + this.idEntidadRecursorevision);
        });
        this.recursoRevision();
      },
      error => {
        this._spinner.stop('obtenerRecurso');
      },
      () => {
        this._spinner.stop('obtenerRecurso');
      }
    );
  }

  recursoRevision(): void {
    this._recursoRevisionService.getEntidadRecursoRevision(
      this.idEntidadRecursorevision, this.erroresConsultas).subscribe(response => {
      this.entidadRecursoRevision = new RecursoRevision(response.json());

    });
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  evaluacionRecursoRevision(): void {
    if (this.validarFormulario()) {
      this._spinner.start('evaluacionRecursoRevision');
      (<FormControl>this.formulario.controls['idEstatus'])
        .patchValue(1225);
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      // console.log(jsonFormulario);
      this._profesorRevisionTrabajoService.putProfesorRevisionTrabajo(
        this.idRevisionTrabajo,
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {},
        error => {
          this._spinner.stop('evaluacionRecursoRevision');
        },
        () => {
          this._spinner.stop('evaluacionRecursoRevision');
        this.revisarEstatusRevisionProfesores(); }
      );
    }
  }

  revisarEstatusRevisionProfesores(): void {
    this._spinner.start('revisarEstatusRevisionProfesores');
    let contadorEstatusAprobado: number = 0;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idRecursoRevision~' + this.idRecursoRevision + ':IGUAL');
    this._profesorRevisionTrabajoService.getListaProfesorRevisionTrabajo(
      this.erroresConsultas,
      urlParameter
    ).subscribe(response => {
      response.json().lista.forEach((obtenerEstatusProfesor) => {
        this.arregloEstatusProfesor.push(new ProfesorRevisionTrabajo( obtenerEstatusProfesor));
      });
      this.arregloEstatusProfesor.forEach((obtenerEstatusProfesor) => {
        if (obtenerEstatusProfesor.estatus.id === 1225) {
          // console.log(obtenerEstatusProfesor.estatus.id);
          contadorEstatusAprobado++;
        }
      });
      if (contadorEstatusAprobado === this.arregloEstatusProfesor.length) {
        // console.log('se cumplio el requerimiento');
        let json = '{"idEstatus": ' + 1225 + '}';
        // console.log(json);
        this._recursoRevisionService.putRecursoRevision(
          this.idRecursoRevision, json, this.erroresGuardado).subscribe(
          response => {},
          error => {
            this._spinner.stop('revisarEstatusRevisionProfesores');
          },
          () => {
            this._spinner.stop('revisarEstatusRevisionProfesores');
            // console.log('success');
          this._router.navigate(['formacion-academica', 'evaluacion-recurso-revision']);
        });
      } else {
        this._spinner.stop('revisarEstatusRevisionProfesores');
        // console.log('aun no califican todos');
        this._router.navigate(['formacion-academica', 'evaluacion-recurso-revision']);
      }
    });
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
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
            this._spinner.stop('descargarArchivo');
          },
          () => {
            // console.info('OK');
            this._spinner.stop('descargarArchivo');
          }
        );
    }

  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
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

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

}
