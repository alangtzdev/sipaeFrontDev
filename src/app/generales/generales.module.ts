import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {AlertModule, PaginationModule, TabsModule, DropdownModule, DatepickerModule} from "ng2-bootstrap";
import {ApoyoEconomicoComponent} from "./apoyos-economicos/apoyo-economico.component";
import {FormacionContinuaComponent} from "./formacion-continua/formacion-continua.component";
import {ComiteEvaluacionComponent} from "./comite-evaluacion/comite-evaluacion.component";
import {SolicitanteComponent} from "../seleccion/solicitantes/solicitante.component";
import {CredencialComponent} from "./credenciales/credencial.component";
import {EvaluacionDocenteComponent} from "./evaluacion-docente/evaluacion-docente.component";
import {CrearFormacionContinuaComponent} from "./crear-formacion-continua/crear-formacion-continua.component";
import {EditarFormacionContinuaComponent} from "./editar-formacion-continua/editar-formacion-continua.component";
import {DetalleFormacionContinuaComponent} from "./detalle-formacion-continua/detalle-formacion-continua.component";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {NgUploaderModule} from "ngx-uploader";
import { ListaSolicitantesComponent } from './lista-solicitantes/lista-solicitantes.component';
import {Ng2AutoCompleteModule} from "ng2-auto-complete";
import {SolicitanteDetallesComponent} from "../seleccion/solicitante-detalles/solicitante-detalles.component";
import {SharedModule} from '../utils/shared.module';

@NgModule({
  imports: [
    CommonModule, AlertModule, Ng2Bs3ModalModule, PaginationModule, DatepickerModule,
    ReactiveFormsModule, FormsModule, NgUploaderModule, DropdownModule, TabsModule,
    Ng2AutoCompleteModule, SharedModule
  ],

  declarations: [ApoyoEconomicoComponent,
    FormacionContinuaComponent,
    ComiteEvaluacionComponent,
    CredencialComponent,
    EvaluacionDocenteComponent,
    CrearFormacionContinuaComponent,
    EditarFormacionContinuaComponent,
    DetalleFormacionContinuaComponent,
    ListaSolicitantesComponent
  ]

})
export class GeneralesModule {}
