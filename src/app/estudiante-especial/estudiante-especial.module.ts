import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {EstudianteEspecialInteresadosComponent} from "./estudiante-especial-interesados/estudiante-especial-interesados.component";
import {EstudianteEspecialInteresadosCoordinacionComponent} from "./estudiante-especial-interesados-coordinacion/estudiante-especial-interesados-coordinacion.component";
import {AceptadosRechazadosComponent} from "./aceptados-rechazados/aceptados-rechazados.component";
import {AspirantesComponent} from "./aspirantes/aspirantes.component";
import {
  AlertModule, TabsModule, DatepickerModule, PaginationModule, DropdownModule,
  AccordionModule
} from "ng2-bootstrap";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {NgUploaderModule} from "ngx-uploader/ngx-uploader";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import { DetalleEstudianteEspecialComponent } from './detalle-estudiante-especial/detalle-estudiante-especial.component';
import { DetalleDatosPersonalesComponent } from './detalle-datos-personales/detalle-datos-personales.component';
import { DetalleAntecedentesAcademicosComponent } from './detalle-antecedentes-academicos/detalle-antecedentes-academicos.component';
import { DetalleInvestigadorAnfitrionComponent } from './detalle-investigador-anfitrion/detalle-investigador-anfitrion.component';
import { DetalleDocumentosComponent } from './detalle-documentos/detalle-documentos.component';
import { ListaSolicitudesMovilidadExternaComponent } from './lista-solicitudes-movilidad-externa/lista-solicitudes-movilidad-externa.component';
import { RegistroAdmisionComponent } from './registro-admision/registro-admision.component';
import { RegistroAdmisionStepUnoComponent } from './registro-admision-step-uno/registro-admision-step-uno.component';
import {WizardModule} from '../wizard/wizard.module';
import { RegistroAdmisionStepDosComponent } from './registro-admision-step-dos/registro-admision-step-dos.component';
import { RegistroAdmisionStepTresComponent } from './registro-admision-step-tres/registro-admision-step-tres.component';
import { RegistroAdmisionStepCuatroComponent } from './registro-admision-step-cuatro/registro-admision-step-cuatro.component';

@NgModule({
  imports: [
    CommonModule,AlertModule, Ng2Bs3ModalModule, TabsModule, DatepickerModule,
    NgUploaderModule, ReactiveFormsModule, FormsModule, PaginationModule,
    DropdownModule, AccordionModule, WizardModule
  ],

  providers:[
    TabsModule
  ],

  declarations: [EstudianteEspecialInteresadosComponent,
    EstudianteEspecialInteresadosCoordinacionComponent,
    AceptadosRechazadosComponent,
    AspirantesComponent,
    DetalleEstudianteEspecialComponent,
    DetalleDatosPersonalesComponent,
    DetalleAntecedentesAcademicosComponent,
    DetalleInvestigadorAnfitrionComponent,
    DetalleDocumentosComponent,
    ListaSolicitudesMovilidadExternaComponent,
    RegistroAdmisionComponent,
    RegistroAdmisionStepUnoComponent,
    RegistroAdmisionStepDosComponent,
    RegistroAdmisionStepTresComponent,
    RegistroAdmisionStepCuatroComponent
  ]

})
export class EstudianteEspecialModule { }
