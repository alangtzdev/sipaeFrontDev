import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {LiberarAdeudosFinanzasComponent} from "./liberar-adeudos-finanzas/liberar-adeudos-finanzas.component";
import {LiberarAdeudosBibliotecaComponent} from "./liberar-adeudos-biblioteca/liberar-adeudos-biblioteca.component";
import {LiberarAdeudosRmsComponent} from "./liberar-adeudos-rms/liberar-adeudos-rms.component";
import {LiberarAdeudosUticComponent} from "./liberar-adeudos-utic/liberar-adeudos-utic.component";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {
  AlertModule, DatepickerModule, PaginationModule, DropdownModule, TabsModule,
  TimepickerModule
} from "ng2-bootstrap";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {NgUploaderModule} from "ngx-uploader";

@NgModule({
  imports: [
    CommonModule, Ng2Bs3ModalModule, AlertModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, NgUploaderModule,
    DropdownModule, TabsModule,
    TimepickerModule
  ],

  declarations: [LiberarAdeudosFinanzasComponent,
    LiberarAdeudosBibliotecaComponent,
    LiberarAdeudosRmsComponent,
    LiberarAdeudosUticComponent
  ]

})
export class LiberarAdeudosModule { }
