import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {AspiranteComponent} from "./aspirantes/aspirante.component";
import {AspirantesAceptadosComponent} from "./aspirantes-aceptados/aspirantes-aceptados.component";
import {
  AlertModule, TabsModule, DropdownModule, DatepickerModule, PaginationModule,
  AccordionModule
} from "ng2-bootstrap";
import {AspiranteDetallesComponent} from "./aspirante-detalles/aspirante-detalles.component";
import {NgUploaderModule} from "ngx-uploader";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {AspiranteDetalleInformacioncomplementariaComponent} from "./aspirante-detalle-informacioncomplementaria/aspirante-detalle-informacioncomplementaria.component";
import {AspiranteDetalleExperienciaComponent} from "./aspirante-detalle-experiencia/aspirante-detalle-experiencia.component";
import {AspiranteDetalleDocumentacionComponent} from "./aspirante-detalle-documentacion/aspirante-detalle-documentacion.component";
import {AspiranteDetalleDatosPersonalesComponent} from "./aspirante-detalle-datos-personales/aspirante-detalle-datos-personales.component";
import {AspiranteDetalleAntecedenteAcademicosComponent} from "./aspirante-detalle-antecedente-academicos/aspirante-detalle-antecedente-academicos.component";
import {SolicitanteDetallesComponent} from "./solicitante-detalles/solicitante-detalles.component";
import {SolicitanteComponent} from "./solicitantes/solicitante.component";
import {EvaluacionAspiranteComponent} from "./evaluacion-aspirante/evaluacion-aspirante.component";
import {EvaluacionExpedienteComponent} from "./evaluacion-expediente/evaluacion-expediente.component";



@NgModule({
  imports: [
    CommonModule, AlertModule, Ng2Bs3ModalModule, PaginationModule, DatepickerModule,
    ReactiveFormsModule, FormsModule, NgUploaderModule, DropdownModule, TabsModule, AccordionModule
  ],

  declarations: [AspiranteComponent,
    AspiranteDetallesComponent,
    AspiranteDetalleAntecedenteAcademicosComponent,
    AspiranteDetalleDatosPersonalesComponent,
    AspiranteDetalleDocumentacionComponent,
    AspiranteDetalleExperienciaComponent,
    AspiranteDetalleInformacioncomplementariaComponent,
    AspirantesAceptadosComponent,
    SolicitanteComponent,
    SolicitanteDetallesComponent,
    EvaluacionAspiranteComponent,
    EvaluacionExpedienteComponent

  ]

})
export class AspiranteModule { }
