import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {TrabajoRecuperacionComponent} from './trabajo-recuperacion/trabajo-recuperacion.component';
import {ProgramaBaseComponent} from './programa-base/programa-base.component';
import {TabsModule, DropdownModule, DatepickerModule, AlertModule, PaginationModule } from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import {ReactiveFormsModule} from '@angular/forms';
import { NgUploaderModule } from 'ngx-uploader';
//import {TinyMCEComponent} from '../utils/tiny-mce.component';
import {SharedModule} from '../utils/shared.module';
import {ResolucionRecuperacionComponent} from './resolucion-recuperacion/resolucion-recuperacion.component';


@NgModule({
  imports: [
    CommonModule, Ng2Bs3ModalModule,
    TabsModule, ReactiveFormsModule,
    DropdownModule, DatepickerModule,
    AlertModule, NgUploaderModule,
    PaginationModule, SharedModule
  ],

  declarations: [TrabajoRecuperacionComponent,
    ProgramaBaseComponent,ResolucionRecuperacionComponent
  ]

})
export class CoordinacionModule { }
