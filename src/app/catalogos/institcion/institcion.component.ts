import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {DatoInformacionColsan} from "../../services/entidades/dato-informacion-colsan.model";
import {Archivos} from "../../services/entidades/archivo.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {DatoInformacionColsanService} from "../../services/entidades/dato-informacion-colsan.service";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Router} from "@angular/router";
import {ConfigService} from '../../services/core/config.service';


@Component({
  selector: 'app-institcion',
  templateUrl: './institcion.component.html',
  styleUrls: ['./institcion.component.css']
})
export class InstitcionComponent implements OnInit {

  entidadCOLSAN: DatoInformacionColsan;
  listaArchivos: Array<Archivos> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(public datosDireccionCedula: DatoInformacionColsanService,
              public archivoService: ArchivoService,
              public spinner: SpinnerService,
              //private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private router: Router) {
    this.cargarInformacion();

  }

  cargarInformacion(): any {
    this.datosDireccionCedula.getEntidadDatoInformacionColsan(
      3,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadCOLSAN
          = new DatoInformacionColsan(response.json());
        //console.log(this.entidadCOLSAN);
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
          console.error(this.erroresConsultas);
        }*/
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log(this.entidadCOLSAN);
          if (this.entidadCOLSAN.archivoCredencialFrontalMov.id) {
            this.archivoService.getEntidadArchivo(
              this.entidadCOLSAN.archivoCredencialFrontalMov.id,
              this.erroresConsultas
            ).subscribe(
              response => {
                this.listaArchivos.push(new Archivos(response.json()));
              }
            );
          }

          if (this.entidadCOLSAN.archivoCredencialReversaMov.id) {
            this.archivoService.getEntidadArchivo(
              this.entidadCOLSAN.archivoCredencialReversaMov.id,
              this.erroresConsultas
            ).subscribe(
              response => {
                this.listaArchivos.push(new Archivos(response.json()));
              }
            );
          }
        }*/
        if (this.entidadCOLSAN.archivoCredencialFrontalMov.id) {
          this.archivoService.getEntidadArchivo(
            this.entidadCOLSAN.archivoCredencialFrontalMov.id,
            this.erroresConsultas
          ).subscribe(
            response => {
              this.listaArchivos.push(new Archivos(response.json()));
            }
          );
        }

        if (this.entidadCOLSAN.archivoCredencialReversaMov.id) {
          this.archivoService.getEntidadArchivo(
            this.entidadCOLSAN.archivoCredencialReversaMov.id,
            this.erroresConsultas
          ).subscribe(
            response => {
              this.listaArchivos.push(new Archivos(response.json()));
            }
          );
        }
      }
    );
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start("catalogoinstitucion1");
      this.archivoService
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
            this.spinner.stop("catalogoinstitucion1");
          },
          () => {
            console.info('OK');
            this.spinner.stop("catalogoinstitucion1");
          }
        );
    }
  }

  descargarArchivo(id: number): void {

    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this.spinner.start("catalogoinstitucion2");
      this.archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivodescargar/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this.spinner.stop("catalogoinstitucion2");
          },
          () => {
            console.info('OK');
            this.spinner.stop("catalogoinstitucion2");
          }
        );
    }

  }

  cambiarVista(): void {
    this.router.navigate(['institucion', 'editar']);
  }

//  constructor() { }

  ngOnInit() {
  }

}
