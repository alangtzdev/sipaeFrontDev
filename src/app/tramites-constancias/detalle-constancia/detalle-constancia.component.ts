
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {error} from "util";
import {getResponseURL} from "@angular/http/src/http_utils.d";
import {Component, OnInit, ElementRef, Injector, Renderer, NgZone} from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import * as moment from "moment";
import {URLSearchParams} from "@angular/http";
import {TinyMCEComponent} from '../../utils/tiny-mce.component';
import {SolicitudConstancia} from "../../services/entidades/solicitud-constancia.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ConfigService} from "../../services/core/config.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Expediente} from "../../services/entidades/expediente.model";
declare var tinyMCE: any;

@Component({
  selector: 'app-detalle-constancia',
  templateUrl: './detalle-constancia.component.html',
  styleUrls: ['./detalle-constancia.component.css']
})
export class DetalleConstanciaComponent {
  entidadSolicitudConstancia: SolicitudConstancia;
  solicitudConstanciaService;
  expediente;
  expedienteService;
  archivoService;
  disableDescarga: boolean = true;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private idSolicitudConstancia: number;
  private sub: any;

  constructor(route: ActivatedRoute, private catalogosService: CatalogosServices,
              private spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idSolicitudConstancia = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.prepareServices();
    this.cargarDatos();

  }

  cargarDatos(): void {
    this.solicitudConstanciaService
        .getEntidadSolicitudConstancia(
            this.idSolicitudConstancia,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadSolicitudConstancia = new SolicitudConstancia(response.json());
          let urlParams = new URLSearchParams();
          urlParams.set('criterios', 'idEstudiante~' +
              this.entidadSolicitudConstancia.estudiante.id +
              ':IGUAL,idSolicitudConstancia~' + this.entidadSolicitudConstancia.id +
              ':IGUAL;AND');
          tinyMCE.activeEditor.getBody().setAttribute('contenteditable', false);
          this.expedienteService.getListaExpediente(this.erroresConsultas, urlParams).
          subscribe(response => {
            if (response.json().lista.length > 0) {
              this.expediente = new Expediente(response.json().lista[0]);
              if (this.expediente.html)
                tinyMCE.activeEditor.setContent(this.expediente.html);
              if (this.expediente.archivo)
                this.disableDescarga = false;
            }
          });
        },
        error => {

        },
        () => {

        }
    );
  }

  descargarConstancia(): void {
    let jsonArchivo = '{"idArchivo": ' + this.expediente.archivo.id + '}';
    this.spinner.start('descarga');
    this.archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
            data => {
              let json = data.json();
              let url =
                  ConfigService.getUrlBaseAPI() +
                  '/api/v1/archivodescargar/' +
                  this.expediente.archivo.id +
                  '?ticket=' +
                  json.ticket;
              window.open(url);
            },
            error => {
              this.spinner.stop('descarga');
            },
            () => {
              this.spinner.stop('descarga');
            }
        );
  }

  private prepareServices(): void {
    this.solicitudConstanciaService = this.catalogosService.getSolicitudConstancia();
    this.expedienteService = this.catalogosService.getExpedienteService();
    this.archivoService = this.catalogosService.getArchivos();
  }
}
