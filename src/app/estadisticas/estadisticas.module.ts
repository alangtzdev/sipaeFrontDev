import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AlertModule, PaginationModule, DatepickerModule, DropdownModule, TabsModule} from "ng2-bootstrap";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {NgUploaderModule} from "ngx-uploader";
import {Principal911Component} from "./principal911/principal911.component";
import {EficienciaTerminalComponent} from "./eficiencia-terminal/eficiencia-terminal.component";
import {IndiceTitulacionComponent} from "./indice-titulacion/indice-titulacion.component";
import {EstudianteExtranjeroComponent} from "./estudiante-extranjero/estudiante-extranjero.component";
import {ConsentradoSemestreComponent} from "./consentrado-semestre/consentrado-semestre.component";
import {EstadisticasOptativasComponent} from "./estadisticas-optativas/estadisticas-optativas.component";
import {IndicadoresInstitucionalesComponent} from "./indicadores-institucionales/indicadores-institucionales.component";
import {RegistroAspirantesComponent} from "./registro-aspirantes/registro-aspirantes.component";
import {EstadisticasComponent} from "./estadisticas/estadisticas.component";

@NgModule({
  imports: [
    CommonModule, AlertModule, Ng2Bs3ModalModule, PaginationModule, DatepickerModule,
    ReactiveFormsModule, FormsModule, NgUploaderModule, DropdownModule, TabsModule
  ],

  declarations: [
    Principal911Component,
    EficienciaTerminalComponent,
    IndiceTitulacionComponent,
    EstudianteExtranjeroComponent,
    ConsentradoSemestreComponent,
    EstadisticasOptativasComponent,
    IndicadoresInstitucionalesComponent,
    RegistroAspirantesComponent,
    EstadisticasComponent
  ]

})
export class EstadisticasModule {}
