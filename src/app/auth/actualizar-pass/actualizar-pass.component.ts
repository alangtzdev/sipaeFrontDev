import { SpinnerService } from './../../services/spinner/spinner/spinner.service';
import { Route, Router } from '@angular/router';
import { CatalogosServices } from './../../services/catalogos/catalogos.service';
import { PassWordResetService } from './../../services/entidades/passwordReset.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Validacion} from '../../utils/Validacion';
import {ActivatedRoute} from '@angular/router';
import {ModalComponent} from "ng2-bs3-modal/components/modal";

@Component({
  selector: 'app-actualizar-pass',
  templateUrl: './actualizar-pass.component.html',
  styleUrls: ['./actualizar-pass.component.css']
})
export class ActualizarPassComponent implements OnInit {

  @ViewChild('modalError')
  modalError: ModalComponent;
  @ViewChild('modalExito')
  modalExito: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = false;
  css: boolean = true;
  output: string;
  errores: Array<ErrorCatalogo> = [];
  formularioResetPass: FormGroup;
  private sub: any;
  private hash: string;
  validacionActiva: boolean = false;

   private passwordResetService: PassWordResetService;
   private contrasenasDiferentes: boolean = false;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private catalogoService: CatalogosServices,
    private spinner: SpinnerService) {
    this.prepareService();
    this.formularioResetPass = new FormGroup({
      password: new FormControl('',
        Validators.compose([Validators.required, Validacion.passwordValidator])),
      confirmarpassword: new FormControl('', Validators.required),
      auxiliar: new FormControl('', Validators.required)
    });

    this.sub = route.params.subscribe(params => {
      this.hash = params['hash']; // (+) converts string 'id' to a number
    });
  }

  ngOnInit() {
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioResetPass.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioResetPass.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl): string {
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

  validarFormulario(): boolean {
    // console.log(this.formulario);
    if (this.formularioResetPass.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;

  }

  validarContrasenias(): boolean {
    if (this.getControl('confirmarpassword').value === this.getControl('password').value) {
      (<FormControl>this.formularioResetPass.controls['auxiliar'])
        .setValue(this.getControl('password').value);
        this.contrasenasDiferentes = false;
      return true;
    } else {
      this.contrasenasDiferentes = true;
      return false;
    }
  }

  private prepareService(): void {
    this.passwordResetService =
      this.catalogoService.getResetPassWordService();

  }

  private actualizarContrasena(): void {
    if (this.validarFormulario() && this.validarContrasenias()) {
      let formularioPass = new FormGroup({
        password: new FormControl(this.getControl('password').value),
        token: new FormControl(this.hash)
      });
      let jsonFormulario = JSON.stringify(formularioPass.value, null, 2);
      this.spinner.start('actualizarPass');
      this.passwordResetService.postResetPassword(
        jsonFormulario,
        this.errores
      ).subscribe(
        response => {},
        error => {
          console.log(error);
          this.spinner.stop('actualizarPass');
          this.abrirModal();
        },
        () => {
          this.spinner.stop('actualizarPass');
          this.abrirModalExito();
        }
      );

    }
  }

  private abrirModal(): void {
    this.modalError.open('sm');
  }

  private cerrarModal(): void {
    this.modalError.close();
    this.router.navigate(['/login']);
  }

  private abrirModalExito(): void {
     this.modalExito.open('sm');
  }

  private cerrarModalExito(): void {
    this.modalExito.close();
    this.router.navigate(['/login']);
  }
}
