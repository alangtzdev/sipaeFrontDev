import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ConstanciaEstudioComponent} from "./constancia-estudio/constancia-estudio.component";
import {ConstanciaProfesorComponent} from "./constancia-profesor/constancia-profesor.component";
import {CedulaComponent} from "./cedula/cedula.component";
import {RegistroProfesoresComponent} from "./registro-profesores/registro-profesores.component";
import {AlertModule, PaginationModule, DropdownModule, DatepickerModule} from "ng2-bootstrap";
import {ExpedirConstanciaComponent} from "./expedir-constancia/expedir-constancia.component";
import {DetalleConstanciaComponent} from "./detalle-constancia/detalle-constancia.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {NgUploaderModule} from "ngx-uploader";
import {TinyMCEComponent} from "../utils/tiny-mce.component";
import {SharedModule} from "../utils/shared.module";

@NgModule({
  imports: [
    CommonModule,Ng2Bs3ModalModule, AlertModule, ReactiveFormsModule,
    FormsModule, PaginationModule, NgUploaderModule, DropdownModule, DatepickerModule, SharedModule
  ],

  declarations: [ConstanciaEstudioComponent,
    ConstanciaProfesorComponent,
    CedulaComponent,
    RegistroProfesoresComponent,
    ExpedirConstanciaComponent,
    DetalleConstanciaComponent
  ]

})
export class TramitesConstanciasModule { }
