import { Component, OnInit, Input } from '@angular/core';
import {ErrorCatalogo} from '../../services/core/error.model';
import {URLSearchParams} from '@angular/http';

import {ServicioSocial} from '../../services/entidades/servicio-social.model';
import {ReporteBimestral} from '../../services/entidades/reporte-bimestral.model';

import {DocumentoServicioSocial} from
  '../../services/entidades/documento-servicio-social.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ConfigService} from '../../services/core/config.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {
    ServicioSocialService
} from '../../services/entidades/servicio-social.service';
import {
    ArchivoService
} from '../../services/entidades/archivo.service';
import {
    SolicitudServicioSocialService
} from '../../services/entidades/solicitud-servicio-social.service';
import {
    DocumentoServicioSocialService
} from '../../services/entidades/documento-servicio-social.service';
import {
    ReporteBimestralService
} from '../../services/entidades/reporte-bimestral.service';


@Component({
  selector: 'app-detalle-solicitud-servicio-component',
  templateUrl: './detalle-solicitud-servicio-component.component.html',
  styleUrls: ['./detalle-solicitud-servicio-component.component.css']
})
export class DetalleSolicitudServicioComponentComponent implements OnInit {

  @Input() servicioSocial: ServicioSocial;
    public listaDocumentos: Array<DocumentoServicioSocial> = [];
    registros: Array<any>;
    registroSeleccionado: any;
    horasTotales = 0;
    private erroresConsultas: Array<ErrorCatalogo> = [];
    constructor(public _catalogosServices: CatalogosServices,
        private _spinner: SpinnerService,
        private _servicioSocialService: ServicioSocialService,
        private _archivosService: ArchivoService,
        private _solicitudServicioSocialService: SolicitudServicioSocialService,
        private _documentoServicioSocialService: DocumentoServicioSocialService,
        private _reporteBimestralService: ReporteBimestralService) {
    }
    rowSeleccionado(registro): boolean {
        return (this.registroSeleccionado === registro);
    }
    ngOnInit(): void {
        if (this.servicioSocial) {
            this.onCambiosTabla();
        }
    }

    rowSeleccion(registro): void {
        if (this.registroSeleccionado !== registro) {
            this.registroSeleccionado = registro;
        } else {
            this.registroSeleccionado = null;
        }
    }
    descargarArchivo(): void {
        event.preventDefault();


        if (this.registroSeleccionado) {
            let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionado.archivo.id + '}';
            this._spinner.start('descargarArchivo');
            this._archivosService
                .generarTicket(jsonArchivo, this.erroresConsultas)
                .subscribe(
                data => {
                    let json = data.json();
                    let url =
                        ConfigService.getUrlBaseAPI() +
                        '/api/v1/archivovisualizacion/' +
                        this.registroSeleccionado.archivo.id +
                        '?ticket=' +
                        json.ticket;
                    window.open(url);
                },
                error => {
                    ////console.log('Error downloading the file.');
                    this._spinner.stop('descargarArchivo');
                },
                () => {
                    //console.info('OK');
                    this._spinner.stop('descargarArchivo');
                }
                );
        }

    }
    onCambiosTabla(): void {
        if (this.servicioSocial) {
            this.registros = [];
            let urlParameter: URLSearchParams = new URLSearchParams();
            let criterios = 'idServicio~' + this.servicioSocial.id + ':IGUAL';
            criterios += ',idTipoDocumento~' + 34 + ':IGUAL';
            urlParameter.set('criterios', criterios);
            let resp = this._documentoServicioSocialService
                .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
                .subscribe(
                response => {
                    let dss;
                    response.json().lista.forEach((item) => {
                        dss = new DocumentoServicioSocial(item);
                        this.registros.push(dss);
                    });
                    ////console.log("historial",this.servicioSocial);
                    let urlParameter: URLSearchParams = new URLSearchParams();
                    urlParameter.set('criterios', 'idServicioSocial~' +
                        this.servicioSocial.id + ':IGUAL');
                    this._reporteBimestralService.getListaReporteBimestral(
                        this.erroresConsultas,
                        urlParameter
                    ).subscribe(
                        response => {
                            let historialReporte;
                            response.json().lista.forEach((elemento) => {
                                historialReporte = new ReporteBimestral(elemento);
                                if (historialReporte.horas)
                                    this.horasTotales += historialReporte.horas;
                            });
                            ////console.log("listaDocumentos",this.listaDocumentos);
                        }
                    );
                },
                console.error,
                () => function () {
                    ///console.log("finalizado", this.registros);
                }
                );
        }
    }
}
