import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {CalificacionesComponent} from "./calificaciones/calificaciones.component";
import {ActasCalificacionComponent} from "./actas-calificacion/actas-calificacion.component";
import {RevisionActasCalificacionComponent} from "./revision-actas-calificacion/revision-actas-calificacion.component";
import {BoletasCalificacionComponent} from "./boletas-calificacion/boletas-calificacion.component";
import {AlertModule, DatepickerModule, PaginationModule,
  DropdownModule, TabsModule, TimepickerModule} from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgUploaderModule } from 'ngx-uploader';
import {ReactiveFormsModule} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ListaEstudiantesActaComponent } from './lista-estudiantes-acta/lista-estudiantes-acta.component';
import { DetalleActaComponent } from './detalle-acta/detalle-acta.component';

@NgModule({
  imports: [
     CommonModule, AlertModule,
    Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, NgUploaderModule,
    DropdownModule, TabsModule,
    TimepickerModule
  ],

  declarations: [CalificacionesComponent,
    ActasCalificacionComponent,
    RevisionActasCalificacionComponent,
    BoletasCalificacionComponent,
    ListaEstudiantesActaComponent,
    DetalleActaComponent,
  ]

})
export class CalificacionModule { }
