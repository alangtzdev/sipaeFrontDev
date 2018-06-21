import {Component, OnInit, Input} from '@angular/core';
import {ConfigService} from "../../services/core/config.service";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ArchivoService} from "../../services/entidades/archivo.service";
import * as moment from "moment";

@Component({
  selector: 'documentacionPlanEstudios',
  templateUrl: './plan-estudios-detalle-documentacion.component.html',
  styleUrls: ['./plan-estudios-detalle-documentacion.component.css']
})
export class PlanEstudiosDetalleDocumentacionComponent implements OnInit {


  @Input()
  entidadPlanEstudios: PlanEstudio;

  idPlanEstudios;
  planEstudiosService;

  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor (route: ActivatedRoute,
               public _catalogosService: CatalogosServices,
               private _router: Router,
               private _spinner: SpinnerService,
               private _archivoService: ArchivoService) {


  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("detalleplanestudios1");
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
            this._spinner.stop("detalleplanestudios1");
          },
          () => {
            console.info('OK');
            this._spinner.stop("detalleplanestudios1");
          }
        );
    }
  }

  descargarArchivo(id: number): void {

    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("detalleplanestudios2");
      this._archivoService
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
            this._spinner.stop("detalleplanestudios2");
          },
          () => {
            console.info('OK');
            this._spinner.stop("detalleplanestudios2");
          }
        );
    }

  }


  ngOnInit() {
  }

}
