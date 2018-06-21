import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {EvaluacionDocenteListComponent} from "./evaluacion-docente-list/evaluacion-docente-list.component";
import {EstudiantesPendientesListComponent} from "./estudiantes-pendientes-list/estudiantes-pendientes-list.component";
import {EmisionTitulosComponent} from "./emision-titulos/emision-titulos.component";
import {LiberarAdeudosDocenciaComponent} from "./liberar-adeudos-docencia/liberar-adeudos-docencia.component";
import {CartaNoAdeudoListComponent} from "./carta-no-adeudo-list/carta-no-adeudo-list.component";
import {ExpedienteAlumnoComponent} from "./expediente-alumno/expediente-alumno.component";
import {AlertModule, DatepickerModule, PaginationModule,
  DropdownModule, TabsModule, TimepickerModule} from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import { NgUploaderModule } from 'ngx-uploader';
import {ReactiveFormsModule} from '@angular/forms';
import { FormsModule } from '@angular/forms';
// import { DetalleCometariosAdicionalesComponent } from './detalle-cometarios-adicionales/detalle-cometarios-adicionales.component';
// import { DetalleGraficaAceptacionComponent } from './detalle-grafica-aceptacion/detalle-grafica-aceptacion.component';
// import { DetalleGraficaEvaluacionComponent } from './detalle-grafica-evaluacion/detalle-grafica-evaluacion.component';
import {ChartsModule} from 'ng2-charts';
import {SharedModule} from '../utils/shared.module';

@NgModule({
  imports: [
    CommonModule, AlertModule, Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, NgUploaderModule,
    DropdownModule, TabsModule,
    TimepickerModule, ChartsModule, SharedModule
  ],

  declarations: [EvaluacionDocenteListComponent,
    EstudiantesPendientesListComponent,
    EmisionTitulosComponent,
    LiberarAdeudosDocenciaComponent,
    CartaNoAdeudoListComponent,
    ExpedienteAlumnoComponent,
    // DetalleCometariosAdicionalesComponent,
    // DetalleGraficaAceptacionComponent,
    // DetalleGraficaEvaluacionComponent
  ]

})
export class DocenciaModule { }
