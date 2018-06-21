import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TinyMCEComponent} from './tiny-mce.component';
import { FormsModule } from '@angular/forms';
import { DetalleGraficaEvaluacionComponent } from '../docencia/detalle-grafica-evaluacion/detalle-grafica-evaluacion.component';
import { DetalleCometariosAdicionalesComponent } from '../docencia/detalle-cometarios-adicionales/detalle-cometarios-adicionales.component';
import { DetalleGraficaAceptacionComponent } from '../docencia/detalle-grafica-aceptacion/detalle-grafica-aceptacion.component';
import {ChartsModule} from 'ng2-charts';
import {PaginationModule} from 'ng2-bootstrap';
@NgModule({
  imports: [CommonModule, FormsModule, ChartsModule, PaginationModule],
  exports: [
    CommonModule, TinyMCEComponent,
    FormsModule, ChartsModule,
    DetalleGraficaEvaluacionComponent, DetalleCometariosAdicionalesComponent,
    DetalleGraficaAceptacionComponent, PaginationModule
  ],
  declarations: [
    TinyMCEComponent, DetalleGraficaEvaluacionComponent,
    DetalleCometariosAdicionalesComponent, DetalleGraficaAceptacionComponent
  ]
})
export class SharedModule { }
