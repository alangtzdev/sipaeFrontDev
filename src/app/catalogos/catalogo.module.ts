import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {BecasApoyosComponent} from "./becas-apoyos/becas-apoyos.component";
import {ConveniosComponent} from "./convenios/convenios.component";
import {ConvocatoriaComponent} from "./convocatoria/convocatoria.component";
import {CalificacioneComponent} from "./calificaciones/calificaciones.component";
import {DocumentosComponent} from "./documentos/documentos.component";
import {IdiomasComponent} from "./idiomas/idiomas.component";
import {InduccionesComponent} from "./inducciones/inducciones.component";
import {InstitcionComponent} from "./institcion/institcion.component";
import {LgacComponent} from "./lgac/lgac.component";
import {MateriasComponent} from "./materias/materias.component";
import {NabComponent} from "./nab/nab.component";
import {NivelEstudiosComponent} from "./nivel-estudios/nivel-estudios.component";
import {PeriodoEscolarComponent} from "./periodo-escolar/periodo-escolar.component";
import {PlanEstudiosComponent} from "./plan-estudios/plan-estudios.component";
import {PreguntasFecuentesComponent} from "./preguntas-fecuentes/preguntas-fecuentes.component";
import {ProfesoresComponent} from "./profesores/profesores.component";
import {ProgramaDocenteComponent} from "./programa-docente/programa-docente.component";
import {PromocionesListComponent} from "./promociones-list/promociones-list.component";
import {SalasComponent} from "./salas/salas.component";
import {AlertModule, DatepickerModule, PaginationModule, DropdownModule, TabsModule} from "ng2-bootstrap";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {ProgramaDocenteCrudComponent} from "./programa-docente-crud/programa-docente-crud.component";
import {ReactiveFormsModule} from "@angular/forms";
import { EditarInformacionInstitucionComponent } from './editar-informacion-institucion/editar-informacion-institucion.component';
import { FormsModule } from '@angular/forms';
import {PromocionesCrearComponent} from "./promociones-crear/promociones-crear.component";
import { NgUploaderModule } from 'ngx-uploader';
import {ProfesorDetallesComponent} from "./profesor-detalles/profesor-detalles.component";
import {ProfesorEditarComponent} from "./profesor-editar/profesor-editar.component";
import {ProfesorDetalleClasificacionComponent} from "./profesor-detalle-clasificacion/profesor-detalle-clasificacion.component";
import {ProfesorDetalleDatosComplementariosComponent} from "./profesor-detalle-datos-complementarios/profesor-detalle-datos-complementarios.component";
import {ProfesorDetalleDatosGeneralesComponent} from "./profesor-detalle-datos-generales/profesor-detalle-datos-generales.component";
import {ProfesorDetalleExpecienciaComponent} from "./profesor-detalle-expeciencia/profesor-detalle-expeciencia.component";
import {PlanEstudiosCrearComponent} from "./plan-estudios-crear/plan-estudios-crear.component";
import {PlanEstudiosDetallesComponent} from "./plan-estudios-detalles/plan-estudios-detalles.component";
import {PlanEstudiosEditarComponent} from "./plan-estudios-editar/plan-estudios-editar.component";
import {PlanEstudiosDetalleMateriasComponent} from "./plan-estudios-detalle-materias/plan-estudios-detalle-materias.component";
import {PlanEstudiosDetalleIdiomasComponent} from "./plan-estudios-detalle-idiomas/plan-estudios-detalle-idiomas.component";
import {PlanEstudiosDetalleDocumentacionComponent} from "./plan-estudios-detalle-documentacion/plan-estudios-detalle-documentacion.component";
import {PlanEstudiosDetalleDatosGeneralesComponent} from "./plan-estudios-detalle-datos-generales/plan-estudios-detalle-datos-generales.component";
import {ProfesorStepsClasificacionComponent} from "./profesor-steps-clasificacion/profesor-steps-clasificacion.component";
import {ProfesorStepsDatosGeneralesComponent} from "./profesor-steps-datos-generales/profesor-steps-datos-generales.component";
import {ProfesorStepsDatosAcademicosComponent} from "./profesor-steps-datos-academicos/profesor-steps-datos-academicos.component";
import {ProfesorStepsDatosComplementariosComponent} from "./profesor-steps-datos-complementarios/profesor-steps-datos-complementarios.component";
import {PlanEstudiosStepsMateriasComponent} from "./plan-estudios-steps-materias/plan-estudios-steps-materias.component";
import {PlanEstudiosStepsIdiomasComponent} from "./plan-estudios-steps-idiomas/plan-estudios-steps-idiomas.component";
import {PlanEstudiosStepsDocumentacionComponent} from "./plan-estudios-steps-documentacion/plan-estudios-steps-documentacion.component";
import {PlanEstudiosStepsDatosGeneralesComponent} from "./plan-estudios-steps-datos-generales/plan-estudios-steps-datos-generales.component";
import {WizardModule} from "../wizard/wizard.module";

@NgModule({
  imports: [
    CommonModule, AlertModule,
    Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, NgUploaderModule, DropdownModule, TabsModule, WizardModule
  ],

  declarations: [BecasApoyosComponent,
    ConveniosComponent,
    ConvocatoriaComponent,
    CalificacioneComponent,
    DocumentosComponent,
    IdiomasComponent,
    InduccionesComponent,
    InstitcionComponent,
    LgacComponent,
    MateriasComponent,
    NabComponent,
    NivelEstudiosComponent,
    PeriodoEscolarComponent,
    PlanEstudiosComponent,
    PreguntasFecuentesComponent,
    ProfesoresComponent,
    ProgramaDocenteComponent,
    PromocionesListComponent,
    SalasComponent,
    ProgramaDocenteCrudComponent,
    EditarInformacionInstitucionComponent,
    PromocionesCrearComponent,
    ProfesorDetallesComponent,
    ProfesorEditarComponent,
    ProfesorDetalleClasificacionComponent,
    ProfesorDetalleDatosComplementariosComponent,
    ProfesorDetalleDatosGeneralesComponent,
    ProfesorDetalleExpecienciaComponent,
    PlanEstudiosCrearComponent,
    PlanEstudiosEditarComponent,
    PlanEstudiosDetallesComponent,
    PlanEstudiosDetalleMateriasComponent,
    PlanEstudiosDetalleIdiomasComponent,
    PlanEstudiosDetalleDocumentacionComponent,
    PlanEstudiosDetalleDatosGeneralesComponent,
    ProfesorStepsClasificacionComponent,
    ProfesorStepsDatosGeneralesComponent,
    ProfesorStepsDatosAcademicosComponent,
    ProfesorStepsDatosComplementariosComponent,
    PlanEstudiosStepsMateriasComponent,
    PlanEstudiosStepsIdiomasComponent,
    PlanEstudiosStepsDocumentacionComponent,
    PlanEstudiosStepsDatosGeneralesComponent
  ]

})
export class CatalogoModule { }
