import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {InteresadosListComponent} from "./interesados-list/interesados-list.component";
import {MedioDifusionService} from "../services/servicios-especializados/medio-difusion/medio-difusion.service";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {TabsModule, DropdownModule, PaginationModule, DatepickerModule, AlertModule} from "ng2-bootstrap";
import {NgUploaderModule} from "ngx-uploader";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
@NgModule({
  imports: [
    CommonModule, AlertModule,
    Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, NgUploaderModule, DropdownModule, TabsModule
  ],

  declarations: [
    InteresadosListComponent
  ]

})
export class InteresadosModule { }
