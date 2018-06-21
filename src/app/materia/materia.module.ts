import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MateriaListComponent } from './materia-list/materia-list.component';
import {AsistenciaListComponent} from "./asistencia-list/asistencia-list.component";
import {OptativasComponent} from "./optativas/optativas.component";
import {ProgramaComponent} from "./programa/programa.component";
import {TemariosParticularesComponent} from "./temarios-particulares/temarios-particulares.component";
import {HistorialMateriasComponent} from "./historial-materias/historial-materias.component";
import {AlertModule, DatepickerModule, PaginationModule,
  DropdownModule, TabsModule, TimepickerModule} from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgUploaderModule } from 'ngx-uploader';
import {ReactiveFormsModule} from '@angular/forms';
import { FormsModule } from '@angular/forms';
import {SharedModule} from '../utils/shared.module';
import {Ng2AutoCompleteModule} from "ng2-auto-complete";
import { CursoEspecificoComponent } from './curso-especifico/curso-especifico.component';
import { GestionOptativaComponent } from './gestion-optativa/gestion-optativa.component';
import { GestionCursoBaseComponent } from './gestion-curso-base/gestion-curso-base.component';

@NgModule({
  imports: [
   CommonModule, AlertModule,
    Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, NgUploaderModule,
    DropdownModule, TabsModule,
    TimepickerModule, SharedModule, Ng2AutoCompleteModule
  ],
  declarations: [MateriaListComponent,
    AsistenciaListComponent,
    OptativasComponent,
    ProgramaComponent,
    TemariosParticularesComponent,
    HistorialMateriasComponent,
    CursoEspecificoComponent,
    GestionOptativaComponent,
    GestionCursoBaseComponent
  ]
})
export class MateriaModule { }
