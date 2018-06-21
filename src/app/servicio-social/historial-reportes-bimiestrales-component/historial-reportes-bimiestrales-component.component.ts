import { Component, OnInit, Input } from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {ReporteBimestral} from '../../services/entidades/reporte-bimestral.model';
import {ServicioSocial} from '../../services/entidades/servicio-social.model';
import {ServicioSocialService} from '../../services/entidades/servicio-social.service';
import {SolicitudServicioSocialService} from '../../services/entidades/solicitud-servicio-social.service';
import {ReporteBimestralService} from '../../services/entidades/reporte-bimestral.service';
import {ErrorCatalogo} from '../../services/core/error.model';
@Component({
  selector: 'app-historial-reportes-bimiestrales-component',
  templateUrl: './historial-reportes-bimiestrales-component.component.html',
  styleUrls: ['./historial-reportes-bimiestrales-component.component.css']
})
export class HistorialReportesBimiestralesComponentComponent implements OnInit {
  @Input() servicioSocial: ServicioSocial;
  horasTotales: number = 0;
  public listaDocumentos: Array<ReporteBimestral> = [];
  columnas: Array<any> = [
      { titulo: 'Núm. Reporte', nombre: 'id', sort: false},
      { titulo: 'Período', nombre: 'id'},
      { titulo: 'Observaciones', nombre: 'observaciones'},
      { titulo: 'Actividades', nombre: 'actividadesRealizadas'},
      { titulo: 'Horas', nombre: 'horas'},
  ];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private _servicioSocialService: ServicioSocialService,
    private _solicitudServicioSocialService: SolicitudServicioSocialService,
    private _ReporteBimestralService: ReporteBimestralService) { }

  ngOnInit() {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idServicioSocial~' + this.servicioSocial.id + ':IGUAL,' +
        'idEstatus.id~1209:IGUAL;AND');
    this._ReporteBimestralService.getListaReporteBimestral(
        this.erroresConsultas,
        urlParameter
    ).subscribe(
            response => {
                let historialReporte;
                this.horasTotales = 0;
                response.json().lista.forEach((elemento) => {
                    historialReporte = new ReporteBimestral(elemento);
                    if (historialReporte.horas)
                        this.horasTotales += historialReporte.horas;
                    this.listaDocumentos.push(historialReporte);
                });
                    ////console.log("listaDocumentos",this.listaDocumentos);
            }
    );
  }

  sortChanged(columna): void {
        this.columnas.forEach((column) => {
            if (columna !== column) {
                if (column.sort !== false) {
                    column.sort = '';
                } else {
                    column.sort = false;
                }
            }
        });

        if (columna.sort !== false) {
            if (columna.sort) {
                columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
            } else {
                columna.sort = 'desc';
            }
            this.onCambiosTabla();
        }
  }
  onCambiosTabla(): void {
        this.listaDocumentos = [];
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idServicioSocial~' + this.servicioSocial.id + ':IGUAL,' +
            'idEstatus.id~1209:IGUAL;AND');
        let ordenamiento = '';

        this.columnas.forEach((columna) => {
            if (columna.sort) {
                ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
                    columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
            }
        });
        urlParameter.set('ordenamiento', ordenamiento);
        //console.log(urlParameter);
        let response = this._ReporteBimestralService.getListaReporteBimestral(
            this.erroresConsultas,
            urlParameter
        ).subscribe(
                response => {
                    let historialReporte;
                    this.horasTotales = 0;
                    this.listaDocumentos = [];
                    response.json().lista.forEach((elemento) => {
                        historialReporte = new ReporteBimestral(elemento);
                        this.horasTotales += historialReporte.horas;
                        this.listaDocumentos.push(historialReporte);
                    });
                    ////console.log("listaDocumentos",this.listaDocumentos);
                }
        );
  }

}
