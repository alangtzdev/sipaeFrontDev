import {Component, OnInit, ApplicationRef, Injector, ViewChild} from '@angular/core';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {Validators, FormGroup, FormControl} from '@angular/forms';
import {Validacion} from '../../utils/Validacion';
import {PaisService} from '../../services/servicios-especializados/pais/pais.service';
import {ProgramaDocenteService} from '../../services/servicios-especializados/programa-docente/programa-docente.service';
import {MedioDifusionService} from '../../services/servicios-especializados/medio-difusion/medio-difusion.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {InteresadoServices} from '../../services/entidades/interesado.service';
import {DatePipe} from '@angular/common';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {URLSearchParams} from '@angular/http';
import {Promocion} from '../../services/entidades/promocion.model';
import {PromocionService} from '../../services/servicios-especializados/promocion/promocion.service';
import {PromocionServices} from '../../services/entidades/promocion.service';
import {ConvocatoriaService} from '../../services/entidades/convocatoria.service';
import {Convocatoria} from '../../services/entidades/convocatoria.model';

@Component({
  selector: 'app-interesado-registro',
  templateUrl: './interesado-registro.component.html',
  styleUrls: ['./interesado-registro.component.css']
})

export class InteresadoRegistroComponent implements OnInit {

  @ViewChild('modal')
  modal: ModalComponent;
  @ViewChild('modalInteresadoDuplicado')
  modalInteresadoDuplicado: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = false;

  captcha: string;

  reCaptchaValido: boolean = false;
  formulario: FormGroup;
  validacionActiva: boolean = false;
  seleccionOtroMedio: boolean = false;

  programasDocentesSelect: ItemSelects[];
  medioDifusionSelect: ItemSelects[];
  paisesSelect: ItemSelects[];
  errores: Array<ErrorCatalogo> = [];
  convocatoriaInteresado;

  private idPlantillaNuevoInteresadoDocencia: number = 14;
  private idPlantillaInterasodRepetidoDocencia: number = 51;
  private idPlantillaNuevoInteresado: number = 1;
  private idPlantillaInteresadoDuplicado: number = 52;

  constructor(
    private appRef: ApplicationRef,
    public spinner: SpinnerService,
    private datePipe: DatePipe,
    private paisService: PaisService,
    private spinnerService: SpinnerService,
    private programaDocenteService: ProgramaDocenteService,
    private medioDifusionService: MedioDifusionService,
    private interesadoService: InteresadoServices,
    private correoService: EnvioCorreoElectronicoService,
    private promocionService: PromocionServices,
    private convocatoriaService: ConvocatoriaService
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
      fechaSolicitud: new FormControl(this.datePipe.transform(new Date(), 'dd/MM/yyyy h:mma')),
      idPromocion: new FormControl(''),
    });

    window['checkReCaptch'] = (response: any) => {
      this.checkReCaptch(response);
    };
    window['caducidadReCatch'] = (response: any) => {
      this.captcha = null;
      this.reCaptchaValido = false;
      this.appRef.tick();
    };
    // detectar cambios en el formulario
    this.formulario.valueChanges.subscribe(data => {
      if (data.idMedioDifucion == 7) {
        this.seleccionOtroMedio = true;
        (<FormControl>this.formulario.controls['otroMedio']).setValidators(Validators.required);
      } else {
        this.seleccionOtroMedio = false;
        (<FormControl>this.formulario.controls['otroMedio']).clearValidators();
      }
    });
  }

  enviarFormulario(): void {
    if (this.validarFormulario()) {
      this.verificarCorreoYPromocionExistentes();
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
    let doc = <HTMLDivElement>document.body;
    let script = document.createElement('script');
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

  enviarCorreoAreaDocencia(id: number, idPlantilla: number): void {
    console.log('Correo a docencia');
    let formularioCorreo1: FormGroup;
    if (id) {
      formularioCorreo1 = new FormGroup({
        destinatario: new FormControl('docencia@colsan.edu.mx'),
        entidad: new FormControl({interesados: id}),
        idPlantillaCorreo : new FormControl(idPlantilla)
      });
      let jsonCorreo = JSON.stringify(formularioCorreo1.value, null, 2);
      console.log('jsonCorreoDocencia', jsonCorreo);
      this.correoService.postCorreoElectronico(
        jsonCorreo,
        this.errores
      ).subscribe(
        response => {
          // console.log(response);
        },
        error => {
          console.error(error);
        },
        () => {

        }
      );
    }
  }

  enviarCorreoInteresado(idPlantilla: number): void {
    let programaDocenteInteresado = this.getControl('idProgramaDocente').value;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = 'idProgramaDocente.id~' + programaDocenteInteresado + ':IGUAL';
    let ordenamiento = 'id:DESC';
    urlSearch.set('criterios', criterios);
    urlSearch.set('ordenamiento', ordenamiento);
    console.log('correo a interesado');

    this.convocatoriaService.getListaConvocatoria(
      this.errores,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
        this.convocatoriaInteresado = new Convocatoria(item);
        });
      },
      error => {
        console.error(error);
      },
      () => {
        console.log(this.convocatoriaInteresado);
        let formularioCorreo: FormGroup;
        formularioCorreo = new FormGroup({
          destinatario: new FormControl(this.getControl('email').value ),
          asunto: new FormControl('Gracias por interesarte en COLSAN'),
          idPlantillaCorreo : new FormControl(idPlantilla),
          entidad: new FormControl({Convocatoria: this.convocatoriaInteresado.id})
        });
        let jsonCorreo = JSON.stringify(formularioCorreo.value, null, 2);
        console.log('jsonCoreoInteresado', jsonCorreo);
        this.correoService.postCorreoElectronico(
          jsonCorreo,
          this.errores
        ).subscribe(
          response => {
            // console.log(response);
          },
          error => {
            console.error(error);

          },
          () => {
          }
        );

      }
    );
  }

  getPromocionNuevoInteresado(programaDocenteId): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    // 1011 id del estatus  de promociones solo promociones activas
    let listaEstatus: Array<Promocion> = [];
    let ordenamiento = 'consecutivo:DESC';
    urlParameter.set('criterios', 'idProgramaDocente~' + programaDocenteId +
      ':IGUAL,idEstatus~1012:NOT');
    urlParameter.set('ordenamiento', ordenamiento);
    console.log(urlParameter);
    this.promocionService.getSelectPromocionID(
      this.errores,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          listaEstatus.push(new Promocion(item));
        });

        if (listaEstatus[0]) {
          (<FormControl>this.formulario.controls['idPromocion'])
            .patchValue(listaEstatus[0].id);
        }
      }
    );
  }

  private verificarCorreoYPromocionExistentes(): void {
    let idPromocion = this.getControl('idPromocion').value;
    let correo = this.getControl('email').value;
    let listaInteresado = undefined;

    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idPromocion~' + idPromocion + ':IGUAL;AND,' +
      'email~' + correo + ':IGUAL;AND');

    this.spinner.start('buscarCoincidencas');
    this.interesadoService.getListaInteresado(
      this.errores,
      urlParameter,
      false
    ).subscribe(
      response => {
        listaInteresado = response.json().lista;
      },
      error => {
        this.spinner.stop('buscarCoincidencas');
      },
      () => {
        this.spinner.stop('buscarCoincidencas');
        if (listaInteresado.length > 0) {
          this.notificarDocenciaInteresadoRepetido(listaInteresado[0].id);
        } else {
          this.guardarInteresado();
        }
      }
    );
  }

  private notificarDocenciaInteresadoRepetido(idInteresado: number): void {
    this.enviarCorreoAreaDocencia(idInteresado, this.idPlantillaInterasodRepetidoDocencia);
    this.enviarCorreoInteresado(this.idPlantillaInteresadoDuplicado);
    this.abrirModalInteresadoDuplibcado();
  }

  private abrirModalInteresadoDuplibcado(): void {
    this.modalInteresadoDuplicado.open();
  }

  private cerrarModalInteresadoDuplicado(): void {
    this.modalInteresadoDuplicado.close();
  }

  private guardarInteresado(): void {

    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);

    if (this.getControl('idMedioDifucion').value != 7) {
        (<FormControl>this.formulario.controls['otroMedio']).setValue('');
    }

    let idSpinner = 'postInteresado';
    this.spinnerService.start(idSpinner);
      this.interesadoService.postInteresadoModal(
        jsonFormulario,
        this.errores
      ).subscribe(
        response => {
          if (response.json().id) {
            this.enviarCorreoAreaDocencia(response.json().id, this.idPlantillaNuevoInteresadoDocencia);
            this.enviarCorreoInteresado(this.idPlantillaNuevoInteresado);
            this.modal.open();
          }
        },
        error => {
          console.log(error);
          this.spinnerService.stop(idSpinner);
        },
        () => {
          this.spinnerService.stop(idSpinner);
        }
      );
  }

}
