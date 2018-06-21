import {Component, ElementRef, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Validacion} from "../../../utils/Validacion";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {DependienteEconomico} from "../../../services/entidades/dependiente-economico.model";
import {errorMessages} from "../../../utils/error-mesaje";
import {ContactoEmergencia} from "../../../services/entidades/contacto-emergencia.model";
import {ItemSelects} from "../../../services/core/item-select.model";
import {Estudiante} from "../../../services/entidades/estudiante.model";
import {URLSearchParams} from "@angular/http";
import {ModalDetalleDependientesComponent} from "../modal-detalle-dependientes/modal-detalle-dependientes.component";
import {ModalRegistroDependientesComponent} from "../modal-registro-dependientes/modal-registro-dependientes.component";

@Component({
  selector: 'app-dependientes-contacto',
  templateUrl: './dependientes-contacto.component.html',
  styleUrls: ['./dependientes-contacto.component.css']
})
export class DependientesContactoComponent implements OnInit {

  router: Router;
  // formulario
  edicionFormulario: boolean = false;
  errorNext: string = '';
  formulario: FormGroup;
  // tabla dependientes
  registros: Array<DependienteEconomico>;
  registroSeleccionado: DependienteEconomico;
  columnas: Array<any> = [
    {titulo: 'Nombre completo', nombre: 'nombreCompleto'},
    {titulo: 'Parentesco', nombre: 'parentesco'},
    {titulo: 'Fecha de nacimiento', nombre: 'fechaNacimiento'},
    {titulo: 'Sexo', nombre: 'sexo'},
  ];

  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;

  // variables para service
  paisService;
  estadoService;
  municipioService;
  parentescoService;
  estudianteService;
  dependienteEconomicoService;
  contactoEmergenciaService;
  idContactoEmergencia: number;
  ocultarDireccion: boolean;
  nivelEstudiosEstudiante;
  entidadContactoEmergencia: ContactoEmergencia;
  idEstudiante: number;
  private opcionesCatalogoPais: Array<ItemSelects>;
  private opcionesCatalogoEstado: Array<ItemSelects>;
  private opcionesCatalogoMunicipio: Array<ItemSelects>;
  private opcionesCatalogoParentesco: Array<ItemSelects>;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  idDependiente: number;

  @ViewChild("modalDetDependientes")
  modalDetDependientes: ModalDetalleDependientesComponent;
  @ViewChild("modalRegDependientes")
  modalRegDependientes: ModalRegistroDependientesComponent;

  constructor(route: ActivatedRoute, public catalogosServices: CatalogosServices, private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer, _router: Router,
              private _spinner: SpinnerService) {

    let params;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });
    this.idEstudiante = params.id;
    this.router = _router;
    this.prepareServices();
    this.formulario = new FormGroup({
      padecimiento: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      nombreCompleto: new FormControl('',
        Validators.compose([Validators.required, Validacion.parrafos])),
      idParentesco: new FormControl(''),
      calleNumero: new FormControl('',
        Validators.compose([Validacion.parrafos])), // val
      colonia: new FormControl('',
        Validators.compose([Validacion.letrasNumerosAcentoPuntoComaValidator])), // val
      codigoPostal: new FormControl('',
        Validators.compose([Validacion.numerosValidator])), // val
      idPais: new FormControl(''),
      idEntidadFederativa: new FormControl(''),
      idMunicipio: new FormControl(''),
      telefono: new FormControl('',
        Validators.compose([Validacion.telefonoValidator])), // val
      celular: new FormControl('',
        Validators.compose([Validators.required, Validacion.celularValidator])), // val
      correoElectronico: new FormControl('',
        Validators.compose([Validacion.emailValidatorOptional])),
      idEstudiante: new FormControl(this.idEstudiante),
    });
    if (this.idEstudiante) {
      this.obtenerEstudiante();
    }
  }

  obtenerEstudiante(): void {
    let estudianteActual: Estudiante;
    this.estudianteService.getEntidadEstudiante(
      this.idEstudiante,
      this.erroresConsultas
    ).subscribe(
      response =>
        estudianteActual = new Estudiante(
          response.json()),
      error => {
      },
      () => {
        this.nivelEstudiosEstudiante =
          estudianteActual.promocion.programaDocente.nivelEstudios.descripcion;
        //console.log(estudianteActual);
        //console.log("prueba");
        if (this.formulario) {
          if (estudianteActual.contactoEmergencia.id) {
            this.idContactoEmergencia = estudianteActual.contactoEmergencia.id;
            this.edicionFormulario = true;
            let stringPadecimiento = 'padecimiento';
            let stringNombreCompleto = 'nombreCompleto';
            let stringParentesco = 'idParentesco';
            let stringCalleNumero = 'calleNumero';
            let stringColonia = 'colonia';
            let stringCodigoPostal = 'codigoPostal';
            let stringPais = 'idPais';
            let stringEstado = 'idEntidadFederativa';
            let stringMunicipio = 'idMunicipio';
            let stringTelefono = 'telefono';
            let stringCelular = 'celular';
            let stringCorreoElectronico = 'correoElectronico';

            (<FormControl>this.formulario.controls[stringPadecimiento])
              .setValue(estudianteActual.contactoEmergencia.padecimiento);
            (<FormControl>this.formulario.controls[stringNombreCompleto])
              .setValue(estudianteActual.contactoEmergencia.nombreCompleto);
            console.log(estudianteActual.contactoEmergencia.parentesco);
            if (estudianteActual.contactoEmergencia.parentesco.id !== undefined) {
              (<FormControl>this.formulario.controls[stringParentesco])
                .setValue(estudianteActual.contactoEmergencia.parentesco.id);
            }
            (<FormControl>this.formulario.controls[stringCalleNumero])
              .setValue(estudianteActual.contactoEmergencia.calleNumero);
            (<FormControl>this.formulario.controls[stringColonia])
              .setValue(estudianteActual.contactoEmergencia.colonia);
            (<FormControl>this.formulario.controls[stringCodigoPostal])
              .setValue(estudianteActual.contactoEmergencia.codigoPostal);
            if (estudianteActual.contactoEmergencia.pais.id !== undefined) {
              (<FormControl>this.formulario.controls[stringPais])
                .setValue(estudianteActual.contactoEmergencia.pais.id);
              this.getSelectPais(estudianteActual.contactoEmergencia.pais.id);
            }
            if (estudianteActual.contactoEmergencia.entidadFederativa.id !== undefined) {
              (<FormControl>this.formulario.controls[stringEstado])
                .setValue(estudianteActual.contactoEmergencia.entidadFederativa.id);
              this.cargarMunicipios(estudianteActual.contactoEmergencia.entidadFederativa.id);
            }
            if (estudianteActual.contactoEmergencia.municipio.id !== undefined) {
              (<FormControl>this.formulario.controls[stringMunicipio])
                .setValue(estudianteActual.contactoEmergencia.municipio.id);
            }
            (<FormControl>this.formulario.controls[stringTelefono])
              .setValue(estudianteActual.contactoEmergencia.telefono);
            (<FormControl>this.formulario.controls[stringCelular])
              .setValue(estudianteActual.contactoEmergencia.celular);
            (<FormControl>this.formulario.controls[stringCorreoElectronico])
              .setValue(estudianteActual.contactoEmergencia.correoElectronico);
          }
        }
      }
    );
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  nextMethod(): any {
    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log('STEP 2!!' + jsonFormulario);
      if (this.edicionFormulario) {
        //console.log('aqui no');
        this._spinner.start("nextMethod");
        return this.contactoEmergenciaService
          .putContactoEmergencia(
            this.idContactoEmergencia,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
            () => {
              this._spinner.stop("nextMethod");
            }
          );
      } else {
        //console.log('aqui si');
        //console.log(jsonFormulario);
        this._spinner.start("nextMethod");
        return this.contactoEmergenciaService
          .postContactoEmergencia(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
            response => {
              //console.log(response.json());
              let jsonForm = '{"idContactoEmergencia": "' + response.json().id + '"}';
              //console.log(jsonForm);
              this.estudianteService.putEstudiante(
                this.idEstudiante,
                jsonForm,
                this.erroresGuardado
              ).subscribe(
                () => {
                  this._spinner.stop("nextMethod");
                }
              );

            }
          );
      }
    }
  }

  previusMethod(): boolean {
    return true;
  }

  eliminarDependiente() {
    if (this.registroSeleccionado) {
      this._spinner.start("eliminarDependiente");
      //console.log('Eliminando...');
      this.dependienteEconomicoService.deleteDependienteEconomico(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        () => {
        }, //console.log('Success'),
        console.error,
        () => {
          this._spinner.stop("eliminarDependiente");
          this.onCambiosTabla();
        }
      );
    } else {
      //console.log('Selecciona un registro');
    }
    this.registroSeleccionado = null
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

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  onCambiosTabla(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registros = this.dependienteEconomicoService
      .getListaDependienteEconomico(
        this.erroresConsultas,
        urlParameter
      ).lista;
    //console.log(this.registros);
  }

  //Botones ocultar
  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
  }

  ocultarDireccionMexico(): boolean {
    if (this.ocultarDireccion) {
      return false;
    } else {
      return true;
    }
  }

  //ocultar datos de direción
  getSelectPais(idPais): void {
    if (idPais == 82) {
      this.ocultarDireccion = false;
    } else {
      this.ocultarDireccion = true;
    }
  }

  capturarDependientesEconomicos(): boolean {
    ////console.log(this.nivelEstudiosEstudiante);
    if (this.nivelEstudiosEstudiante !== 'Licenciatura') {
      return true;
    } else {
      return false;
    }
  }

  private cargarMunicipios(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEntidadFederativa~' + id + ':IGUAL';
    let ordenamiento = 'valor:ASC';
    urlParameter.set('criterios', criterio);
    urlParameter.set('ordenamiento', ordenamiento);
    this.municipioService = this.catalogosServices.getMunicipio();
    this.opcionesCatalogoMunicipio =
      this.municipioService.getListaMunicipio(this.erroresConsultas, urlParameter).lista;
  }


  private prepareServices(): void {
    this.estudianteService = this.catalogosServices.getEstudiante();

    this.paisService = this.catalogosServices.getPais();
    this.opcionesCatalogoPais = this.paisService.getSelectPais(this.erroresConsultas);

    this.estadoService = this.catalogosServices.getEntidadFederativa();
    this.opcionesCatalogoEstado =
      this.estadoService.getSelectEntidadFederativa(this.erroresConsultas);

    this.parentescoService = this.catalogosServices.getParentesco();
    this.opcionesCatalogoParentesco =
      this.parentescoService.getSelectParentesco(this.erroresConsultas);

    this.dependienteEconomicoService = this.catalogosServices.getDependienteEconomico();
    this.contactoEmergenciaService = this.catalogosServices.getContactoEmergencia();
    this.onCambiosTabla();
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
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

  ngOnInit() {
  }


  modalDependientesEconomicos(modo): void {
    if (modo === 'editar' && this.registroSeleccionado) {
      this.idDependiente = this.registroSeleccionado.id;
    }else if(modo === 'agregar') {
      this.idDependiente = null;
    }
    this.modalRegDependientes.onInit();
    this.modalRegDependientes.dialog.open("lg");
  }

  modalDetalleDependiente(): void {
    if (this.registroSeleccionado) {
      this.idDependiente = this.registroSeleccionado.id;
      this.modalDetDependientes.onInit();
    }
    this.modalDetDependientes.dialog.open("lg");
  }

}

