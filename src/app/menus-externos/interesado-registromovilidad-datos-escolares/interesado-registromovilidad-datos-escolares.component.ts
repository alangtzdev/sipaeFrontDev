import {Component, OnInit, ViewChild, NgZone, Injector, Inject, ApplicationRef} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {ConfigService} from "../../services/core/config.service";
import {Router} from "@angular/router";
import {errorMessages} from "../../utils/error-mesaje";
import {InteresadoMovilidadExterna} from "../../services/entidades/interesado-movilidad-externa.model";
import {MovilidadExternaMateria} from "../../services/entidades/movilidad-externa-materia.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {Validators, FormControl, FormGroup} from "@angular/forms";
import * as moment from 'moment/moment';
import {Validacion} from "../../utils/Validacion";
import {InteresadoRegistromovilidadDatosGeneralesComponent} from "../interesado-registromovilidad-datos-generales/interesado-registromovilidad-datos-generales.component";
import { NgUploaderOptions } from 'ngx-uploader';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
  selector: 'registromovilidad-datos-escolares',
  templateUrl: './interesado-registromovilidad-datos-escolares.component.html',
  styleUrls: ['./interesado-registromovilidad-datos-escolares.component.css']
})
export class InteresadoRegistromovilidadDatosEscolaresComponent implements OnInit {
  
  @ViewChild('modalRegistroExitoso')
  modalRegistroExitoso: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  private descripcionError: string = '';

  uploadFile: any;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  continuarRegistro: boolean = false;
  mostrarAlertaMaterias: boolean = false;
  router: Router;
  formulario: FormGroup;
  formularioMaterias: FormGroup;
  errorNext: string = '';
  enableValidation: boolean = false;
  //errorNext: string = '';
  //interesadoMovilidadService;
  idSolicitudMovilidad;
  idArchivoCartaPresentacion: number;
  validacionActiva: boolean = false;
  validacionActivaFormMaterias: boolean = false;
  mensajeErrors: any = errorMessages;
  materiasMovilidadService;
  materiasService;
  interesadoMovilidadService;
  correoService;
  entidadInteresado: InteresadoMovilidadExterna;
  interesadoMov: InteresadoMovilidadExterna;
  idProgramaDocente: number;
  auxiliar: boolean;
  registroSeleccionadoMaterias: MovilidadExternaMateria; //Pendiente no hay entidad
  columnasMateriasAsignaturas: Array<any> = [
    { titulo: 'Materia(s) a cursar en el COLSAN', nombre: 'idMateria' },
    { titulo: 'Materia(s) que convalida', nombre: 'materiaOrigen' },

  ];
  documentoGuardado: Array<number> = [];
  captcha: string;
  reCaptchaValido: boolean = false;
  private mostrarBotonAgregarMateria: boolean = false;
  private registrosMaterias: Array<MovilidadExternaMateria> = [];
  private opcionesMaterias: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private email: string;
  private tipoArchivo: string;
  private nombreCartaPresentacion: string = '';
  private alertas: Array<Object> = [];

  constructor(@Inject(NgZone) private zone: NgZone,
              private injector: Injector,
              private _spinner: SpinnerService,
              private _archivoService: ArchivoService,
              public _catalogosServices: CatalogosServices,
              private _router: Router,
              private appRef: ApplicationRef) {
    this.router = _router;
    this.zone = new NgZone({ enableLongStackTrace: false });
    //console.log('¿Que imprime?');
    //console.log('?????' + this.datosGenerales.formulario);
    this.prepareServices();
    this.formulario = new FormGroup({
      institucionProcedencia: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])),
      programaCursa: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])),
      periodoCursa: new FormControl('', Validators.compose([
        Validators.required])),
      contactoInstitucion: new FormControl('', Validators.compose([
        Validators.required,
        Validacion.parrafos])),
      idArchivoCarta: new FormControl('', Validators.required),
      fechaRegistro: new FormControl(moment(new Date()).format('DD/MM/Y h:mma')),
      idEstatus: new FormControl(101) //idEstatus interesado de movilidad - Pendiente

    });
    this.formularioMaterias = new FormGroup({
      materiaOrigen: new FormControl('', Validators.required),
      idMovilidadInteresado: new FormControl(this.idSolicitudMovilidad),
      idMateria: new FormControl('', Validators.required)
    });
    this.captcha = null;

    for (let key in this.formulario.controls) {
      //console.log(key + ' ::::::: ' + sessionStorage.getItem(key));
      this.formulario.controls[key].setValue(
        sessionStorage.getItem(key) ? sessionStorage.getItem(key) : ''
      );
    }
    this.formulario.controls['fechaRegistro']
      .setValue(moment(new Date()).format('DD/MM/Y h:mma'));
    this.formulario.controls['idEstatus'].setValue(101);

    window['checkReCaptch'] = (response: any) => {
      this.checkReCaptch(response);
    };
    window['caducidadReCatch'] = (response: any) => {
      ////console.log('entre aca');
      this.captcha = null;
      this.reCaptchaValido = false;
      this.appRef.tick();
    };
  }

  displayReCaptcha() {
    var doc = <HTMLDivElement>document.body;
    var script = document.createElement('script');
    script.innerHTML = '';
    script.src = 'https://www.google.com/recaptcha/api.js?hl=es';
    script.async = true;
    script.defer = true;
    doc.appendChild(script);
  }

  checkReCaptch(response) {
    //zone.run(() => {
    ////console.log('checking captcha');

    this.captcha = response;
    ////console.log('captcha', this.captcha);
    this.reCaptchaValido = true;
    //this.captchaControl.setValue(true);
    //this.captchaControl.updateValueAndValidity({onlySelf: false, emitEvent: true});
    //this.userForm.updateValueAndValidity({onlySelf: false, emitEvent: true});
    //console.debug(this.captchaControl)

    //this.cdRef.markForCheck());
    this.appRef.tick();
    //});
  }

  finishMethod (formularioDatosgenerales): boolean {
    if (this.validarFormulario()) {
      //console.log('oooo' + formularioDatosgenerales.value);
      this.idProgramaDocente = formularioDatosgenerales.value.idProgramaDocente;
      this.email = formularioDatosgenerales.value.email;
      this.generarListaMaterias(this.idProgramaDocente);
      //console.log( '||||||' + formularioDatosgenerales.value.idProgramaDocente);
      let obj = Object.assign(formularioDatosgenerales.value, this.formulario.value);
      let  jsonFinal = JSON.stringify(obj, null, 2);
      //console.log(jsonFinal);
      let idMovilidadExteranInteresado = this.idSolicitudMovilidad;
      if (this.idSolicitudMovilidad) {

          if(this.registrosMaterias.length !== 0){

        if (this.reCaptchaValido) {
          this.interesadoMovilidadService
            .putInteresadoMovilidadExterna(
              idMovilidadExteranInteresado,
              jsonFinal,
              this.erroresGuardado
            ).subscribe(
            response => {
              //console.log('Success');
            },
            console.error,
            () => {
              // //console.log('Registro finalizado :)');
              //this.router.parent.navigate(['../']);
              //return true;
              //this.router.parent.navigate(['ListaROEspeciales']);
              //console.log('Success');
              this.enviarCorreoNuevoInteresado();
              this.enviarCorreoDocenciaCoordinacion();
            }
          );
        } else {
          //console.log('ERES UN ROBOT');
        }

      } else
       {
          //alert("Registra una materia a movilidad");
          this.mostrarAlertaMaterias = true;
       }
      } else {
        this.interesadoMovilidadService
          .postInteresadoMovilidadExterna(
            jsonFinal,
            this.erroresGuardado
          ).subscribe(
          response => {
            //console.log('Success');
            var json = response.json();
            //console.log('json', json);
            if (json.id) {
              //console.log('hay respuesta');
              //console.log(json.id);
              this.idSolicitudMovilidad = json.id;
              this.continuarRegistro = true;
              //this.enviarCorreoNuevoInteresado();
            }
          },
          error => {
            console.error(error);
          },
          () => {
            //console.log('Registro finalizado :)');
            this.displayReCaptcha();

          }
        );
        //return true;

      }


    } else {
      //this.errorNext = 'Error en los campos, favor de verificar';
      return false;
    }
  }

  enviarCorreoNuevoInteresado(): void {
    console.log('email', this.email);
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl(this.email),
      comentarios: new FormControl(),
      entidad: new FormControl({ InteresadoMovilidadExterna: this.idSolicitudMovilidad}),
      idPlantillaCorreo: new FormControl(13)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {

      },
      error => {
        // this.modalPreRegistroMovilidadExitoso();
        console.error(error);
      },
      () => {
        //console.log('Correo Enviado');
        this.modalPreRegistroMovilidadExitoso();
      }
    );
  }

  enviarCorreoDocenciaCoordinacion(): void {
    let formularioCorreo: FormGroup;
    formularioCorreo = new FormGroup({
      destinatario: new FormControl('docencia@colsan.edu.mx'),
      comentarios: new FormControl(),
      entidad: new FormControl({ InteresadoMovilidadExterna: this.idSolicitudMovilidad}),
      idPlantillaCorreo: new FormControl(7)
    });
    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    this.correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {

      },
      error => {
        console.error(error);
      },
      () => {
        //console.log('Correo Enviado');
      }
    );
  }

  limpiarFormulario(): void {
    sessionStorage.clear();
  }

  redireccionarRegistroSolicitante(): void {
    window.location.href = 'http://www.colsan.edu.mx/';
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  validarFormularioMaterias(): boolean {
    if (this.formularioMaterias.valid) {
      this.validacionActivaFormMaterias = false;
      return true;
    }
    this.validacionActivaFormMaterias = true;
    return false;
  }

  tipoArchivow(archivo): void {
    this.tipoArchivo = archivo;
    //console.log('tipo archivo' + this.tipoArchivo);
  }

  handleBasicUpload(data, tipo): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        if (this.esPdf(responseJson.originalName)) {
          let idArchivo = responseJson.id;
          let jsonArchivo = '{"Carta": ' + responseJson.id + '}';
          this.idArchivoCartaPresentacion = responseJson.id;
          this.nombreCartaPresentacion = responseJson.originalName;
          this.formulario.value.idArchivoCartaPresentacion = idArchivo;
          (<FormControl>this.formulario.controls['idArchivoCarta']).
          setValue(idArchivo);
        } else {
          this.addErrorsMesaje('El archivo debe de ser en pdf', 'danger');
          this._archivoService.deleteArchivo(
            responseJson.id,
            this.erroresGuardado
          ).subscribe(
            () => {
              //console.log('Se borro el archiov');
            }
          );
        }

      }
    });

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
        //console.log(this.dropResp);
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

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("registromovilidad1");
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
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("registromovilidad1");
          },
          () => {
            console.info('OK');
            this._spinner.stop("registromovilidad1");
          }
        );
    }
  }

  descargarArchivo(id: number): void {

    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("registromovilidad2");
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
            //console.log('Error downloading the file.');
            this._spinner.stop("registromovilidad2");
          },
          () => {
            console.info('OK');
            this._spinner.stop("registromovilidad2");
          }
        );
    }

  }

  previusMethod(): boolean {
    for (let key in this.formulario.controls) {
      //console.log(key + ' ::: ' + this.formulario.controls[key].value);
      sessionStorage.setItem(key, this.formulario.controls[key].value);
    }
    return true;
  }

  rowSeleccionadoMaterias(registro): boolean {
    return (this.registroSeleccionadoMaterias === registro);
  }

  rowSeleccionMaterias(registro): void {
    if (this.registroSeleccionadoMaterias !== registro) {
      this.registroSeleccionadoMaterias = registro;
    } else {
      this.registroSeleccionadoMaterias = null;
    }
  }

  onCambiosTablaMaterias(): void {
    this.auxiliar = false;
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idMovilidadInteresado~' + this.idSolicitudMovilidad + ':IGUAL';
    urlSearch.set('criterios', criterio);
    this.registrosMaterias = this.materiasMovilidadService
      .getListaMovilidadExternaMateria(
        this.erroresConsultas,
        urlSearch
      ).lista;
  }

  agregarMateriasMovilidad (): any {
    //console.log(this.idSolicitudMovilidad);
    let intIdMovilidad = 'idMovilidadInteresado';
    (<FormControl>this.formularioMaterias.controls[intIdMovilidad])
      .setValue(this.idSolicitudMovilidad);
    let valor = (<FormControl>this.formularioMaterias.controls['idMateria']).value;
    if (this.validarFormularioMaterias()) {
      this._spinner.start("registromovilidad3");
      this.documentoGuardado.push(valor);
      let jsonFormulario = JSON.stringify(this.formularioMaterias.value, null, 2);
      //console.log(jsonFormulario);
      //console.log('Para guardar');
      this.materiasMovilidadService
        .postMovilidadExternaMateria(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        () => {}, //console.log('Success Save'),
        console.error,
        () => {
          this._spinner.stop("registromovilidad3");
          this.onCambiosTablaMaterias();
          //console.log(this.documentoGuardado);
          // limpiar formulario
          let materiaOrigen = 'materiaOrigen';
          let materiaOrigenLimpia = '';
          let idMateria = 'idMateria';
          let idMateriaLimpiar = '';
          (<FormControl>this.formularioMaterias.controls[materiaOrigen])
            .setValue(materiaOrigenLimpia);
          (<FormControl>this.formularioMaterias.controls[idMateria])
            .setValue(idMateriaLimpiar);
        }
      );
    }

  }

  validarDocumento(id): boolean {
    this.auxiliar = true;
    for (var i = 0; i < this.documentoGuardado.length; i++) {
      if (this.documentoGuardado[i] === id) {
        this.auxiliar = false;
        break;
      } else {
        this.auxiliar = true;
      }
    }
    //console.log('es valido auxiliar: ' + this.auxiliar);
    return this.auxiliar;
  }

  eliminarMateriaMovilidad(): any {
    if (this.registroSeleccionadoMaterias) {
      this._spinner.start("registromovilidad4");
      //console.log('Eliminando...');
      this.materiasMovilidadService.deleteMovilidadExternaMateria(
        this.registroSeleccionadoMaterias.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.registroSeleccionadoMaterias = null;
          this._spinner.stop("registromovilidad4");
          this.onCambiosTablaMaterias();
        }
      );
    }else {
      // alert('Selecciona un registro');
    }
  }

  mostarBotonEliminar(): boolean {
    if (this.registroSeleccionadoMaterias) {
      return true;
    }else {
      return false;
    }
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlMaterias(campo: string): FormControl {
    return (<FormControl>this.formularioMaterias.controls[campo]);
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  private ocultarBotonoAgregarEliminar() {

  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private getControlErrorsMaterias(campo: string): boolean {

    if (!(<FormControl>this.formularioMaterias.controls[campo]).valid
      && this.validacionActivaFormMaterias) {
      return true;
    }
    return false;
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

  private generarListaMaterias(id: number): void {
    ////console.log(':::::jujujujuujuuuuuuuuuuuuuuuuuuu');
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + id + ':IGUAL');
    //console.log(':::::' + urlParameter);
    this.opcionesMaterias =
      this.materiasService.getSelectMateriasFiltrado(this.erroresConsultas, urlParameter);
  }

  private esPdf(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    nombreArchivoArray = nombreArchiov.split('.');
    if (nombreArchivoArray[nombreArchivoArray.length - 1] &&
      nombreArchivoArray[nombreArchivoArray.length - 1] === 'pdf' ||
      nombreArchivoArray[nombreArchivoArray.length - 1] === 'PDF') {
      return true;
    } else {
      return false;
    }
  }

  private prepareServices(): void {
    this.interesadoMovilidadService = this._catalogosServices.getInteresadoMovilidadExterna();
    this.materiasService = this._catalogosServices.getMateria();
    this.correoService = this._catalogosServices.getEnvioCorreoElectronicoService();


    this.materiasMovilidadService = this._catalogosServices.getMateriasMovilidad();
    //console.log('catalogo de materias');
    //console.log(this.opcionesMaterias);
  }

  ngOnInit() {
  }
  /*  modalPreRegistroMovilidadExitoso(): void {
   let dialog: Promise<ModalDialogInstance>;
   let modalConfig = new ModalConfig('sm', true, 27);

   let modalData = new ModalPreRegistroMovilidadExitosoData(
   this
   );
   let bindings = Injector.resolve([
   provide(ICustomModal, { useValue: modalData }),
   provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
   provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
   ]);

   dialog = this.modal.open(
   <any>ModalPreRegistroMovilidadExitoso,
   bindings,
   modalConfig
   );
   }*/

  modalPreRegistroMovilidadExitoso(): void {
    this.modalRegistroExitoso.open();
  }

  cerrarModal() {
    this.limpiarFormulario();
    this.redireccionarRegistroSolicitante();
    this.modalRegistroExitoso.close();
  }

}
