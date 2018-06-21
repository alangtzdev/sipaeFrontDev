import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ListaUsuariosComponent} from './lista-usuarios/lista-usuarios.component';
import {BitacoraComponent} from './bitacora/bitacora.component';
import {AlertModule, DatepickerModule, PaginationModule, DropdownModule} from 'ng2-bootstrap';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import {ReactiveFormsModule} from '@angular/forms';
import { NgUploaderModule } from 'ngx-uploader';

@NgModule({
  imports: [
    CommonModule, AlertModule,
    Ng2Bs3ModalModule, ReactiveFormsModule,
    DatepickerModule, DropdownModule,
    PaginationModule, NgUploaderModule
  ],

  declarations: [ListaUsuariosComponent, BitacoraComponent]

})
export class AdministradorModule { }
