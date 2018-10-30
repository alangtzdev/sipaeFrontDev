import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {InformacionComplementaria} from '../../../services/entidades/informacion-complementaria.model';
import {Lgac} from '../../../services/entidades/lgac.model';
import {AspiranteLgac} from '../../../services/entidades/aspirante-lgac.model';
import {errorMessages} from '../../../utils/error-mesaje';
import {ItemSelects} from '../../../services/core/item-select.model';
import {CatalogosServices} from '../../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../../services/spinner/spinner/spinner.service';
import {Validacion} from '../../../utils/Validacion';
import {Estudiante} from '../../../services/entidades/estudiante.model';
import {URLSearchParams} from '@angular/http';

@Component({
  selector: 'app-info-complementaria',
  templateUrl: './info-complementaria.component.html',
  styleUrls: ['./info-complementaria.component.css']
})
export class InfoComplementariaComponent implements OnInit {
  router: Router;
  //
  edicionFormulario: boolean = false;
  errorAspiranteLgac: boolean = false;
  formulario: FormGroup;
  formularioLgac: FormGroup;
  informacionComplementariaService;
  medioDifusionService;
  estudianteService;
  lgacService;
  aspiranteLgacService;
  entidadInformacionComplementaria: InformacionComplementaria;
  campoParaOtro: boolean = false;
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;
  programaDocenteSolicitante = '';
  programaDocenteID;
  registrosLGAC: Array<Lgac> = [];
  registrosAspiranteLgac: Array<AspiranteLgac> = [];
  registroAspiranteLgacSeleccionado;
  estudianteActual: Estudiante;
  private mostarOtro: boolean = false;
  private idComplementaria: number;
  private idEstudiante: number;
  private opcionesCatalogoMedioDifusion: Array<ItemSelects>;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(route: ActivatedRoute, private _router: Router, private _catalogosServices: CatalogosServices,
              private _spinnerService: SpinnerService) {
    this.router = _router;
    let params;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });
    this.idEstudiante = params.id;
    this.prepareServices();
    this.formulario = new FormGroup({
      actividades: new FormControl(''),
      idMedioDifusion: new FormControl(''),
      otro: new FormControl('',
        Validators.compose([
          Validacion.textoValidator,
        ])
      ),
      nombreAnteproyecto: new FormControl('')
    });

    this.formularioLgac = new FormGroup({
      idLgac: new FormControl('', Validators.required),
      idEstudiante: new FormControl('', Validators.required)
    });
    if (this.idEstudiante) {
      this.obtenerEstudiante();
    }
  }

  obtenerEstudiante(): void {
    this.estudianteService.getEntidadEstudiante(
      this.idEstudiante,
      this.erroresConsultas
    ).subscribe(
      response =>
        this.estudianteActual = new Estudiante(
          response.json()),
      error => {
      },
      () => {
        let nivelProgramaDocente = this.estudianteActual.promocion.programaDocente.nivelEstudios.descripcion;
        if (nivelProgramaDocente === 'Doctorado') {
          this.programaDocenteSolicitante = 'del ' + this.estudianteActual.promocion.programaDocente.descripcion;
        } else {
          this.programaDocenteSolicitante = 'de la ' + this.estudianteActual.promocion.programaDocente.descripcion;
        }

        this.programaDocenteID = this.estudianteActual.promocion.programaDocente.id;

        if (this.estudianteActual.complementaria.id) {
          this.idComplementaria = this.estudianteActual.complementaria.id;
          this.edicionFormulario = true;
          let stringActividades = 'actividades';
          let stringNombreAnteproyecto = 'nombreAnteproyecto';
          let stringIdMedioDifusion = 'idMedioDifusion';
          let stringOtro = 'otro';

          this.formulario.controls[stringActividades].setValue(this.estudianteActual.complementaria.actividades);
          this.formulario.controls[stringNombreAnteproyecto].setValue(this.estudianteActual.complementaria.nombreAnteproyecto);

          if (this.estudianteActual.complementaria.medioDifusion.id !== undefined) {
            this.formulario.controls[stringIdMedioDifusion].setValue(this.estudianteActual.complementaria.medioDifusion.id);
          }
          this.formulario.controls[stringOtro].setValue(this.estudianteActual.complementaria.otro);
          // console.log('Tipo de difusion: ' + estudianteActual.complementaria.medioDifusion.id);
          if (this.estudianteActual.complementaria.medioDifusion.id === 7) {
            this.campoParaOtro = true;
          } else {
            this.campoParaOtro = false;
          }

          // console.log('mostrar datos: ' + this.mostarOtro);
        }

        this.obtenerListaLGAC();
        this.obtenerListaAspiranteLgac();
      }
    );
  }

  obtenerListaLGAC(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + this.programaDocenteID + ':IGUAL');

    this._spinnerService.start('listaLGAC');

    this.lgacService.getListaLgac(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.registrosLGAC.push(new Lgac(item));
        });
      },
      error => {
        console.error(error);
        this._spinnerService.stop('listaLGAC');
      },
      () => {
        this._spinnerService.stop('listaLGAC');
      }
    );
  }

  obtenerListaAspiranteLgac(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.estudianteActual.id + ':IGUAL');

    this._spinnerService.start('listaAspiranteLgac');

    this.aspiranteLgacService.getListaAspiranteLgacPag(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        this.registrosAspiranteLgac = [];
        this.registroAspiranteLgacSeleccionado = null;
        response.json().lista.forEach((item) => {
          this.registrosAspiranteLgac.push(new AspiranteLgac(item));
        });
      },
      error => {
        console.error(error);
        this._spinnerService.stop('listaAspiranteLgac');
      },
      () => {
        this._spinnerService.stop('listaAspiranteLgac');
      }
    );
  }

  agregarLgac(): void {
    this.formularioLgac.controls['idEstudiante'].setValue(this.estudianteActual.id);

    let jsonFormulario = JSON.stringify(this.formularioLgac.value, null, 2);

    if (this.existeRegistroLgac(this.formularioLgac.controls['idLgac'].value)) {
      this.erroresConsultas.push({
        tipo: 'danger',
        mensaje: 'Ya existe el registro LGAC'
      });
      return;
    }

    this._spinnerService.start('postAspiranteLgac');

    this.aspiranteLgacService.postAspiranteLgac(
        jsonFormulario,
        this.erroresConsultas
    ).subscribe(
      response => {
        this.errorAspiranteLgac = false;
      },
      error => {
        console.error(error);
        this._spinnerService.stop('postAspiranteLgac');
      },
      () => {
        this._spinnerService.stop('postAspiranteLgac');
        this.obtenerListaAspiranteLgac();
      }
    );
  }

  eliminarLgac () {
    this._spinnerService.start('deleteAspiranteLgac');

    this.aspiranteLgacService.deleteAspiranteLgac(
        this.registroAspiranteLgacSeleccionado.id,
        this.erroresConsultas
    ).subscribe(
      response => {

      },
      error => {
        console.error(error);
        this._spinnerService.stop('deleteAspiranteLgac');
      },
      () => {
        this._spinnerService.stop('deleteAspiranteLgac');
        this.obtenerListaAspiranteLgac();
      }
    );
  }

  existeRegistroLgac(id): boolean {
    let result = false;
    this.registrosAspiranteLgac.forEach(item => {
      if (item.lgac.id == id)
        result = true;
    });
    return result;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroAspiranteLgacSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroAspiranteLgacSeleccionado !== registro) {
      this.registroAspiranteLgacSeleccionado = registro;
    } else {
      this.registroAspiranteLgacSeleccionado = null;
    }
  }

  nextMethod(): any {
    if (this.estudianteActual.promocion.programaDocente.nivelEstudios.descripcion == 'Licenciatura') {
      // TODO Se cambia validación para licenciatura, ahora solo se mostrara en vista diferentes texto dependiendo del nivel.
      // this.formulario.controls['nombreAnteproyecto'].disable();
    } else if (this.registrosAspiranteLgac.length < 1) {
      this.errorAspiranteLgac = true;
      return;
    }

    if (this.edicionFormulario && this.validarFormulario()) {
      this.limpiarFormulario();
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      // this._spinnerService.start();
      return this.informacionComplementariaService
        .putInformacionComplementaria(
          this.idComplementaria,
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          () => {
            // TODO y este?
            // this._spinnerService.stop();
          }
        );
    } else {
      if (this.validarFormulario()) {
        this.limpiarFormulario ();
        let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
        // console.log('POST!!');
        this._spinnerService.start('nextMethod');
        return this.informacionComplementariaService
          .postInformacionComplementaria(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
            response => {
              try {
                // console.log(response.json());
                let json = '{"idComplementaria": "' + response.json().id + '"}';
                this.estudianteService.putEstudiante(
                  this.idEstudiante,
                  json,
                  this.erroresGuardado
                ).subscribe(
                  () => {
                    this._spinnerService.stop('nextMethod');
                  }
                );
              } catch (Exception) {
                // console.log('PUT');
              }
            });
      }
    }
  }

  previusMethod(): boolean {
    return true;
  }

  mostrarOtroMedio(): boolean {
    let valor = this.getControl('idMedioDifusion');
    // console.log('Tipo de medio: ' + valor.value);

    if (valor.value === '7') { // id:3 === valor:'otro' actualmente
      this.mostarOtro = true;

    }else {
      this.mostarOtro = false;
    }
    return this.mostarOtro;
  }

  cambiarTipoExperiencia(idMedioDifusion: number): void {
    let limpiarFormulario = '';
    // console.log(idMedioDifusion);
    // Si el tipo de grado academico es 6
    // (Bachillerato va a mostrar los campos solo para bachillerato)
    if (idMedioDifusion == 7) {
      this.campoParaOtro = true;

    } else {
      this.campoParaOtro = false;
    }
    // console.log(this.campoParaOtro);
  }

  validarFormulario(): boolean {
    // console.log('validar form ' + !this.campoParaOtro);
    if (!this.campoParaOtro) {
      // console.log('es otro medio!!!!!!!!');
      (<FormControl>this.formulario.
        controls['otro']).setValue('auxiliarOtros');
    }
    // console.log(this.formulario.value);
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  limpiarFormulario (): any {
    // console.log('Lo limpio: ' + !this.campoParaOtro);
    if (!this.campoParaOtro) {
      (<FormControl>this.formulario.
        controls['otro']).setValue('');
    }
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  private prepareServices(): void {
    this.estudianteService = this._catalogosServices.getEstudianteService();
    this.medioDifusionService = this._catalogosServices.getMedioDifusion();
    this.opcionesCatalogoMedioDifusion =
      this.medioDifusionService.getSelectMedioDifusion(this.erroresConsultas);
    this.informacionComplementariaService =
      this._catalogosServices.getInformacionComplementaria();
    this.lgacService = this._catalogosServices.getlgac();
    this.aspiranteLgacService = this._catalogosServices.getAspiranteLgacService();
  }

  ngOnInit() {
  }

}
