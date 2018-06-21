import {Component, Inject, Injector, NgZone, OnInit, ViewChild} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {ConfigService} from "../../../services/core/config.service";
import {errorMessages} from "../../../utils/error-mesaje";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {DatosPersonalesComponent} from "../datos-personales/datos-personales.component";

@Component({
  selector: 'app-modal-fotografia',
  templateUrl: './modal-fotografia.component.html',
  styleUrls: ['./modal-fotografia.component.css']
})
export class ModalFotografiaComponent implements OnInit {

  @ViewChild("modalFoto")
  modalFoto: ModalComponent;
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
  validacionActiva: boolean = false;
  mensajeErrors: any = errorMessages;
  habilitarBotonAgregar: boolean = true;
  formularioDocumentacion: FormGroup;
  idArchivoDoc: number;
  usuarioService;
  archivoService;
  parentComponent: DatosPersonalesComponent;

  private nombreArchivo: String = '';
  private alertas: Array<Object> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];

  constructor(private inj:Injector,
              @Inject(NgZone) private zone: NgZone,
              private _spinner: SpinnerService) {

    this.parentComponent = this.inj.get(DatosPersonalesComponent);


    this.prepareServices();
    if (this.parentComponent.nombreFotografiaEstudiante) {
      this.nombreArchivo = this.parentComponent.nombreFotografiaEstudiante;
    }
    this.formularioDocumentacion = new FormGroup({
      idFoto: new FormControl('')
    });

    console.log(this.parentComponent.edicionDocencia);
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {

        let responseJson = JSON.parse(this.basicResp['response']);
        let idArchivo = responseJson.id;
        //console.warn(responseJson);
        if (this.esImagen(responseJson.originalName)) {
          this.idArchivoDoc = responseJson.id;
          this.habilitarBoton(this.idArchivoDoc);
          this.nombreArchivo = responseJson.originalName;
          this.formularioDocumentacion.value.idFoto = idArchivo;
          (<FormControl>this.formularioDocumentacion.controls['idFoto']).
          setValue(idArchivo);
        } else {
          this.addErrorsMesaje('El archivo debe de ser en jpg o png', 'danger');
          this.archivoService.deleteArchivo(
            responseJson.id,
            this.erroresGuardado)
            .subscribe(
              () => {

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

  cerrarModal(): void {
    this.modalFoto.close();
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  validarFormulario(): boolean {
    if (this.formularioDocumentacion.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioDocumentacion.controls[campo]);
  }

  errorMessage(control: FormControl): string {
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

  habilitarBoton(idArchivo: number): void {
    if (idArchivo) {
      this.habilitarBotonAgregar = false;
    }
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }
  enviarFormulario(): void {
    let usuarioID;
    if(this.parentComponent.edicionDocencia){
      usuarioID = this.parentComponent.idUsuarioActual;
    }else {
       usuarioID = this.parentComponent.usuarioLogueado.id;
    }

    if (this.validarFormulario()) {
      let jsonFormulario = JSON.stringify(
        this.formularioDocumentacion.value,
        null, 2);
      console.log(jsonFormulario);
      console.log(usuarioID);
      this._spinner.start("enviarFormulario");
      this.usuarioService.putUsuario(
        usuarioID,
        jsonFormulario,
        this.erroresGuardado
      ).subscribe(
        response => {

        },
        error => {
          this._spinner.stop("enviarFormulario");
          this.cerrarModal();
        },
        () => {
          this._spinner.stop("enviarFormulario");
          this.cerrarModal();
        }
      );
    }
  }

  private esImagen(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    let tamanoArreglo: number;
    nombreArchivoArray = nombreArchiov.split('.');
    tamanoArreglo = nombreArchivoArray.length - 1;
    if (nombreArchivoArray[tamanoArreglo] && (
      nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpg' ||
      nombreArchivoArray[tamanoArreglo].toLowerCase() === 'png') ) {
      return true;
    } else {
      return false;
    }
  }

  private getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioDocumentacion.controls[campo]).valid
      && this.validacionActiva) {
      return true;
    }
    return false;
  }

  private prepareServices(): void {
    this.usuarioService =
      this.parentComponent._catalogosServices.getUsuarioService();
    this.archivoService =
      this.parentComponent._catalogosServices.getArchivos();
  }

  ngOnInit() {
  }

}
