import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {InduccionTicsComponent} from "./induccion-tics/induccion-tics.component";
import {InduccionDocenciaComponent} from "./induccion-docencia/induccion-docencia.component";
import {InduccionBibliotecaComponent} from "./induccion-biblioteca/induccion-biblioteca.component";
import {AlertModule, DatepickerModule, PaginationModule, DropdownModule, TabsModule} from "ng2-bootstrap";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import { Ng2CompleterModule } from "ng2-completer";
import {NgUploaderModule} from "ngx-uploader";
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { InduccionAcademicaComponent } from './induccion-academica/induccion-academica.component';

@NgModule({
  imports: [
    CommonModule,AlertModule,Ng2Bs3ModalModule, DatepickerModule, BrowserModule,
    Ng2CompleterModule, FormsModule, ReactiveFormsModule, PaginationModule,
    NgUploaderModule, DropdownModule, TabsModule, Ng2AutoCompleteModule
  ],

  declarations: [InduccionTicsComponent, InduccionDocenciaComponent, InduccionBibliotecaComponent, InduccionAcademicaComponent]

})
export class InduccionModule { }
