import {Component, ViewEncapsulation, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import {AuthService} from "../auth.service";
import {Codes} from "../../utils/Codes";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
@Component({
  templateUrl: './login.component.html',
  encapsulation: ViewEncapsulation.None
})
export class LoginComponent {
  @ViewChild('modal')
  modal: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  regex = /^\S+@(([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6})$/;
  private descripcionError: string = '';
  private alertas: Array<Object> = [];

  constructor(
    public authService: AuthService,
    public router: Router,
    private spinnerService: SpinnerService
  ) {
    /*
    * TODO Se cierra la sesion al iniciar la carga de la página,
    * evitando que se vea al mismo tiempo el login y el menu
    * #HD-710
    * */
    this.authService.logout();
  }

  login(event, usuario: string, contrasenia: string) {
    event.preventDefault();
    usuario = this.isMail(usuario);
    // this._spinner.start();
    let idSpinner = 'loginIntento';
    this.spinnerService.start(idSpinner);

    this.authService.login(usuario,contrasenia, '/ldap/login_check')
      .subscribe(
        response => {
          console.log('response', response);
          let jsonResponse = response.json();
          this.authService.saveToken(jsonResponse);
          if (AuthService.isLoggedIn()) {
            this.router.navigate(['/dashboard']);
          }
        },
        error => {
          console.log('error', error);
          this.authService.login(usuario,contrasenia, '/auth/login_check')
            .subscribe(
              response => {
                let jsonResponse = response.json();
                this.authService.saveToken(jsonResponse);
                if (AuthService.isLoggedIn()) {
                  this.router.navigate(['/dashboard']);
                }
              },
              error => {
                this.spinnerService.stop(idSpinner);
                console.log(error);
                switch (error.status) {
                  case 400:
                    this.modalLoginError(Codes.BAD_REQUEST);
                    break;
                  case 401:
                    this.modalLoginError(Codes.BAD_CREDENTIALS);
                    break;
                  default:
                    this.modalLoginError(Codes.CONNECTION_ERROR);
                    break;
                }
                //reject(error);
              },
              () =>{
                this.spinnerService.stop(idSpinner);
              }
            );
        },
        () => {
          this.spinnerService.stop(idSpinner);
        }
      );
  }

  logout() {
    this.authService.logout();
  }

  modalLoginError(mensaje: string): void {
    this.descripcionError = mensaje;
    // this.modal.open();
    this.alertas.push({
      msg: mensaje,
      closable: true,
      type: 'danger'
    });
  }
  cerrarModal(): void {
    this.descripcionError = '';
    this.modal.close();
  }

  private isMail(username): string {
    if (!this.regex.test(username)) {
      username += '@colsan.edu.mx';
    }

    return username;
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }
}
