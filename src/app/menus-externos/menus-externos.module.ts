import {NgModule} from "@angular/core";
import {PaginationModule, DatepickerModule, AlertModule, AccordionModule, TabsModule} from "ng2-bootstrap";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {CommonModule} from "@angular/common";
import {InteresadoRegistroComponent} from "./interesado-registro/interesado-registro.component";
import {RegistroSolicitanteComponent} from "./registro-solicitante/registro-solicitante.component";
import {FaqSeleccionComponent} from "./faq-seleccion/faq-seleccion.component";
import {InteresadoRegistroMovilidadComponent} from "./interesado-registro-movilidad/interesado-registro-movilidad.component";
import {RegistroEstudianteMovilidadComponent} from "./registro-estudiante-movilidad/registro-estudiante-movilidad.component";
import {FaqMovilidadComponent} from "./faq-movilidad/faq-movilidad.component";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import {NgUploaderModule} from "ngx-uploader";
import {InteresadoRegistromovilidadDatosGeneralesComponent} from "./interesado-registromovilidad-datos-generales/interesado-registromovilidad-datos-generales.component";
import {InteresadoRegistromovilidadDatosEscolaresComponent} from "./interesado-registromovilidad-datos-escolares/interesado-registromovilidad-datos-escolares.component";
import {WizardModule} from "../wizard/wizard.module";


@NgModule({
  imports: [
    CommonModule, AlertModule,
    Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, BrowserModule,
    ReactiveFormsModule,NgUploaderModule,
    HttpModule, AccordionModule,
    TabsModule, WizardModule
  ],

  declarations: [InteresadoRegistroComponent,
    RegistroSolicitanteComponent,
    FaqSeleccionComponent,
    InteresadoRegistroMovilidadComponent,
    RegistroEstudianteMovilidadComponent,
    FaqMovilidadComponent,
    InteresadoRegistromovilidadDatosGeneralesComponent,
    InteresadoRegistromovilidadDatosEscolaresComponent
  ]

})
export class MenusExternosModule { }
