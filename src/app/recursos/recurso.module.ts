import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SolicitudRecursoRevisionComponent} from "./solicitud-recurso-revision/solicitud-recurso-revision.component";
import {EvaluacionRecursoRevisionComponent} from "./evaluacion-recurso-revision/evaluacion-recurso-revision.component";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {AlertModule, DatepickerModule, DropdownModule, PaginationModule, TabsModule} from "ng2-bootstrap/ng2-bootstrap";
import {ReactiveFormsModule} from "@angular/forms";
import {NgUploaderModule} from "ngx-uploader/ngx-uploader";
import {ResolucionRecursoRevisionComponent} from './resolucion-recurso-revision/resolucion-recurso-revision.component';
import {CalificacionRecursoRevisionComponent} from './calificacion-recurso-revision/calificacion-recurso-revision.component';
import {TrabajoRecuperacionRecursosComponent} from './trabajo-recuperacion-recursos/trabajo-recuperacion-recursos.component';

@NgModule({
  imports: [
    CommonModule, Ng2Bs3ModalModule, AlertModule, DatepickerModule,
    ReactiveFormsModule, DropdownModule, NgUploaderModule, PaginationModule, TabsModule
  ],

  declarations: [SolicitudRecursoRevisionComponent, EvaluacionRecursoRevisionComponent,
    ResolucionRecursoRevisionComponent, CalificacionRecursoRevisionComponent, TrabajoRecuperacionRecursosComponent]

})
export class RecursosModule { }
