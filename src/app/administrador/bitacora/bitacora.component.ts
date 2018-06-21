import { Component, OnInit } from '@angular/core';
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import * as moment from "moment";
import {URLSearchParams} from "@angular/http";

@Component({
  selector: 'app-bitacora',
  templateUrl: './bitacora.component.html',
  styleUrls: ['./bitacora.component.css']
})
export class BitacoraComponent {

  dti: Date = new Date();
  dtf: Date = new Date();
  hoy: Date = new Date();
  fechaInicio: string = '';
  fechaFin: string = '';
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  bitacoraService;
  errores: Array<any> = [];
  disableExportar = false;
  private alertas: Array<Object> = [];

  constructor(public catalogosService: CatalogosServices, private spinner: SpinnerService) {
    this.prepareServices();
  }


  getFechaInicio(): string {
    if (this.dti) {
      let fechaConFormato = moment(this.dti).format('DD/MM/YYYY');
      this.fechaInicio = fechaConFormato;
      if (this.dtf && this.dti > this.dtf) {
        this.disableExportar = true;
        if (this.alertas.length > 0) {
          this.alertas.pop();
        }
        this.addErrorsMesaje('Fecha inicio debe ser menor o igual a fecha final', 'danger');
      }else {
        this.disableExportar = false;
        if (this.alertas.length > 0) {
          this.alertas.pop();
        }
      }
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaFin(): string {
    if (this.dtf) {
      let fechaConFormato = moment(this.dtf).format('DD/MM/YYYY');
      this.fechaFin = moment(this.dtf).add(1, 'day').format('DD/MM/YYYY');
      if (this.dti && this.dti > this.dtf) {
        this.disableExportar = true;
        if (this.alertas.length > 0) {
          this.alertas.pop();
        }
        this.addErrorsMesaje('Fecha inicio debe ser menor o igual a fecha final', 'danger');
      }else {
        this.disableExportar = false;
        if (this.alertas.length > 0) {
          this.alertas.pop();
        }
      }
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  exportar(tipo): void {
    this.spinner.start("bitacora1");
    let urlParams = new URLSearchParams();
    urlParams.set('criterios', 'fechaCreacion~' + this.fechaInicio +
      ':MAYORIGUAL,fechaCreacion~' + this.fechaFin + ':MENORIGUAL;AND');
    this.bitacoraService.getBitacora(this.errores, urlParams).subscribe(response => {
      this.exportarExcelUrl = response.json().exportarEXCEL;
      this.exportarPDFUrl = response.json().exportarPDF;
      switch (tipo) {
        case 'Excel':
          if (this.exportarExcelUrl) {
            window.open(this.exportarExcelUrl);
          } else {
            alert('no existe url para exportar a Excel');
          }
          break;
        case 'PDF':
          if (this.exportarPDFUrl) {
            window.open(this.exportarPDFUrl);
          } else {
            alert('no existe url para exportar a PDF');
          }
          break;
        default:
          alert('no se soporta la exportación a ' + tipo);
          break;
      }
      this.spinner.stop("bitacora1");
    });
  }

  private prepareServices() {
    this.bitacoraService = this.catalogosService.getBitacoraService();
  }

/*  constructor() { }

  ngOnInit() {
  }

  getFechaInicio(): boolean {
    return true;
  }
  getFechaFin(): boolean {
    return true;
  }*/

}
