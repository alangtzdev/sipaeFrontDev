import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {AsignarTutorDirectorComponent} from './asignar-tutor-director/asignar-tutor-director.component';
import {AsignarComiteComponent} from './asignar-comite/asignar-comite.component';
import {DefensaTesisComponent} from './defensa-tesis/defensa-tesis.component';
import {DictamenDefensaTesisComponent} from './dictamen-defensa-tesis/dictamen-defensa-tesis.component';
import {AlertModule, DatepickerModule, PaginationModule, 
  DropdownModule, TabsModule, TimepickerModule} from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import { NgUploaderModule } from 'ngx-uploader';
import {ReactiveFormsModule} from '@angular/forms';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule, AlertModule,
    Ng2Bs3ModalModule, DatepickerModule,
    ReactiveFormsModule, FormsModule,
    PaginationModule, NgUploaderModule,
    DropdownModule, TabsModule,
    TimepickerModule
  ],

  declarations: [AsignarTutorDirectorComponent,
    AsignarComiteComponent,
    DefensaTesisComponent,
    DictamenDefensaTesisComponent
  ]

})
export class TitulacionModule { }
