import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {IdiomasGruposComponent} from './idiomas-grupos/idiomas-grupos.component';
import {IdiomasEvaluacionComponent} from './idiomas-evaluacion/idiomas-evaluacion.component';
import {IdiomasAcreditacionComponent} from './idiomas-acreditacion/idiomas-acreditacion.component';
import {
  AlertModule, DatepickerModule, PaginationModule, DropdownModule, TabsModule,
  TimepickerModule
} from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {NgUploaderModule} from 'ngx-uploader';
import {AgregarGrupoIdiomasComponent} from './agregar-grupo-idiomas/agregar-grupo-idiomas.component';
import {DatosCursoComponent} from './steps-datos-curso-idiomas/datos-curso.component';
import {EstudiantesCursoComponent} from './steps-estudiantes-curso-idiomas/estudiantes-curso.component';
import {Ng2AutoCompleteModule} from 'ng2-auto-complete';
import {ChartsModule} from 'ng2-charts';
import { GraficaEvaluacionIdiomasComponent } from './grafica-evaluacion-idiomas/grafica-evaluacion-idiomas.component';
import { GraficaAceptacionIdiomasComponent } from './grafica-aceptacion-idiomas/grafica-aceptacion-idiomas.component';
import { ComentariosAdicionalesIdiomasComponent } from './comentarios-adicionales-idiomas/comentarios-adicionales-idiomas.component';
import {WizardModule} from "../wizard/wizard.module";

@NgModule({
  imports: [
    CommonModule, AlertModule,
    Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule, ChartsModule,
    PaginationModule, DropdownModule, TabsModule, WizardModule,
    NgUploaderModule, Ng2AutoCompleteModule, TimepickerModule
  ],

  declarations: [IdiomasGruposComponent,
    IdiomasEvaluacionComponent,
    AgregarGrupoIdiomasComponent,
    DatosCursoComponent,
    IdiomasAcreditacionComponent,
    EstudiantesCursoComponent,
    GraficaEvaluacionIdiomasComponent,
    GraficaAceptacionIdiomasComponent,
    ComentariosAdicionalesIdiomasComponent
  ]

})
export class IdiomasModule { }
