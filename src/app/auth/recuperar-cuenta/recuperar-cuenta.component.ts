import {Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {EnvioCorreoElectronicoService} from '../../services/entidades/envio-correo-electronico.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Validacion} from '../../utils/Validacion';
import {UsuarioServices} from '../../services/usuario/usuario.service';
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {Router} from "@angular/router";

@Component({
  selector: 'app-recuperar-cuenta',
  templateUrl: './recuperar-cuenta.component.html',
  styleUrls: ['./recuperar-cuenta.component.css']
})
export class RecuperarCuentaComponent implements OnInit {

  @ViewChild('modalConfirmarRegistro')
  modalConfirmarRegistro: ModalComponent;

  errores: Array<ErrorCatalogo> = [];
  formularioCorreo: FormGroup;
  validacionActiva: boolean = false;
  private alertas: Array<Object> = [];

  constructor( private correoService: EnvioCorreoElectronicoService,
               private _usuarioService: UsuarioServices,
               private _spinner: SpinnerService,
               private router: Router) {
    this.formularioCorreo = new FormGroup({
      usuario: new FormControl('',
        Validators.compose([Validators.required, Validacion.emailValidator])),
      destinatario: new FormControl(),
      entidad: new FormControl(),
      idPlantillaCorreo : new FormControl(50)
    });
  }

  ngOnInit() {
  }

  verificarUsuarioReset() {
    if (this.validarFormulario()) {
      this._spinner.start('verificarUsuario');
      let correo = this.getControl('usuario').value;
      let resetPass = {'correo': correo};
      let jsonReset = JSON.stringify(resetPass, null , 2);
      this._usuarioService.resetPassUsuario(
        resetPass,
        this.errores
      ).subscribe(
        response => {
          console.log(response.json());
          this._spinner.stop('verificarUsuario');
          if (response.json().id) {
            this.enviarCorreo(response.json().id);
            this.modalConfirmacionReset();
          } else {
            this.errorUsuarioReset('No se encontro correo o no se puede realizar proceso.');
          }
        },
        error => {
          console.error(error);
          this.errorUsuarioReset('No se encontro usuario o no se puede realizar proceso.');
          this._spinner.stop('verificarUsuario');
        },
        () => {
          this._spinner.stop('verificarUsuario');

        }
      );
    }
  }

  enviarCorreo(idUsuario): void {
    (<FormControl>this.formularioCorreo.controls['entidad']).setValue(
      {PasswordReset: idUsuario}
    );
    (<FormControl>this.formularioCorreo.controls['destinatario']).setValue(
      this.getControl('usuario').value
    );
    // console.log('Correo a recuperar contraseña');
    let jsonCorreo = JSON.stringify(this.formularioCorreo.value, null, 2);
    // console.log('jsonCorreoPass', jsonCorreo);
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

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioCorreo.controls[campo]);
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
    if (!(<FormControl>this.formularioCorreo.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  validarFormulario(): boolean {
    if (this.formularioCorreo.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  errorUsuarioReset(mensaje: string): void {
    // this.modal.open();
    this.alertas.push({
      msg: mensaje,
      closable: true,
      type: 'danger'
    });
  }

  private modalConfirmacionReset(): void {
    this.modalConfirmarRegistro.open();
  }

  private cerrarModalResetPass() {
    this.modalConfirmarRegistro.close();
    this.router.navigate([
      'login'
    ]);
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

}
