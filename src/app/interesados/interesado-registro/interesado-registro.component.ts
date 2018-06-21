import {Component, OnInit, ApplicationRef, Injector, ViewChild} from '@angular/core';
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Validators, FormGroup, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {PaisService} from "../../services/servicios-especializados/pais/pais.service";
import {ProgramaDocenteService} from "../../services/servicios-especializados/programa-docente/programa-docente.service";
import {MedioDifusionService} from "../../services/servicios-especializados/medio-difusion/medio-difusion.service";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {InteresadoService} from "../../services/servicios-especializados/interesado/interesado.service";
import {DatePipe} from "@angular/common";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {EnvioCorreoElectronicoService} from "../../services/entidades/envio-correo-electronico.service";
@Component({
  selector: 'app-interesado-registro',
  templateUrl: './interesado-registro.component.html',
  styleUrls: ['./interesado-registro.component.css']
})
export class InteresadoRegistroComponent implements OnInit {

  @ViewChild('modal')
  modal: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;

  captcha: string;

  reCaptchaValido: boolean = false;
  formulario: FormGroup;
  validacionActiva: boolean = false;
  seleccionOtroMedio: boolean = false;

  programasDocentesSelect: ItemSelects[];
  medioDifusionSelect: ItemSelects[];
  paisesSelect: ItemSelects[];
  errores: Array<ErrorCatalogo> = [];

  constructor(
    private appRef: ApplicationRef,
    public spinner: SpinnerService,
    private datePipe: DatePipe,
    private paisService: PaisService,
    private spinnerService: SpinnerService,
    private programaDocenteService: ProgramaDocenteService,
    private medioDifusionService: MedioDifusionService,
    private interesadoService: InteresadoService,
    private correoService: EnvioCorreoElectronicoService
  ) {
    this.captcha = null;
    this.prepareServices();
    this.formulario = new FormGroup({
      nombre: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.textoValidator])),
      primerApellido: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.textoValidator])),
      segundoApellido: new FormControl('', Validators.compose([
        Validacion.textoValidator])),
      email: new FormControl('',
        Validators.compose([Validators.required, Validacion.emailValidator])),
      telefono: new FormControl('', Validators.compose([
        Validacion.telefonoValidator])),
      celular: new FormControl('', Validators.compose([
        Validacion.celularValidator])),
      idPais: new FormControl('', Validators.compose([
        Validators.required])),
      idProgramaDocente: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      idMedioDifucion: new FormControl('', Validators.compose([
        Validators.required,
      ])),
      otroMedio: new FormControl(''),
      comentarios: new FormControl(''),
      institucion: new FormControl('', Validators.compose([
        Validacion.textoValidator
      ])),
      idEstatus: new FormControl('8'),
      fechaSolicitud: new FormControl(this.datePipe.transform(new Date(), 'dd/MM/yyyy h:mma'))
    });

    window['checkReCaptch'] = (response: any) => {
      this.checkReCaptch(response);
    };
    window['caducidadReCatch'] = (response: any) => {
      this.captcha = null;
      this.reCaptchaValido = false;
      this.appRef.tick();
    };
    //detectar cambios en el formulario
    this.formulario.valueChanges.subscribe(data => {
      if (data.idMedioDifucion == 7) {
        this.seleccionOtroMedio=true;
        (<FormControl>this.formulario.controls['otroMedio']).setValidators(Validators.required);
      }else{
        this.seleccionOtroMedio=false;
        (<FormControl>this.formulario.controls['otroMedio']).clearValidators();
      }
    })
  }

  enviarFormulario(): void {
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    if (this.validarFormulario()) {
      if(this.getControl('idMedioDifucion').value != 7){
        (<FormControl>this.formulario.controls['otroMedio']).setValue('');
      }

      let idSpinner = 'postInteresado';
      this.spinnerService.start(idSpinner);
      this.interesadoService.post(
        jsonFormulario,
        this.errores
      ).subscribe(
        response => {
          if (response.json().id) {
            this.enviarCorreoAreaDocencia(response.json().id);
            this.enviarCorreoInteresado();
            this.modal.open();
          }
        },
        error =>{
          console.log(error);
          this.spinnerService.stop(idSpinner);
        },
        ()=>{
          this.spinnerService.stop(idSpinner);
        }
      );
    }
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  // recaptcha
  static displayReCaptcha() {
    var doc = <HTMLDivElement>document.body;
    var script = document.createElement('script');
    script.innerHTML = '';
    script.src = 'https://www.google.com/recaptcha/api.js?hl=es';
    script.async = true;
    script.defer = true;
    doc.appendChild(script);
  }

  private prepareServices(): void {
    this.paisService.getSelect(this.errores).then(paises => this.paisesSelect = paises);
    this.medioDifusionService.getSelect(this.errores).then(mediosDifusion => this.medioDifusionSelect = mediosDifusion);
    this.programaDocenteService.getSelectActivos(this.errores).then(programasDocentes => this.programasDocentesSelect = programasDocentes);
  }

  checkReCaptch(response) {
    this.captcha = response;
    this.reCaptchaValido = true;
    this.appRef.tick();
  }

  ngOnInit() {
    InteresadoRegistroComponent.displayReCaptcha();
  }

  public errorMessage(control: FormControl): string {
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  enviarCorreoAreaDocencia(id: number): void {
    console.log('Correo a docencia');
    let formularioCorreo1: FormGroup;
    if (id) {
      formularioCorreo1 = new FormGroup({
        destinatario: new FormControl('docencia@colsan.edu.mx'),
        entidad: new FormControl({interesados: id}),
        idPlantillaCorreo : new FormControl(14)
      });
      let jsonCorreo = JSON.stringify(formularioCorreo1.value, null, 2);
      this.correoService.postCorreoElectronico(
        jsonCorreo,
        this.errores
      ).subscribe(
        response => {
          //console.log(response);
        },
        error => {
            console.error(error);

        },
        () => {

        }
      );
    }
  }

  enviarCorreoInteresado(): void {
    console.log('correo a interesado');
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(this.getControl('email').value ),
      asunto: new FormControl('Gracias por interesarte en COLSAN'),
      idPlantillaCorreo : new FormControl('1')
    });
    let jsonCorreo = JSON.stringify(formularioCorreo.value, null, 2);
    this.correoService.postCorreoElectronico(
      jsonCorreo,
      this.errores
    ).subscribe(
      response => {
        //console.log(response);
      },
      error => {
          console.error(error);

      },
      () => {
      }
    );
  }
   
   // Comentario agregado
}
