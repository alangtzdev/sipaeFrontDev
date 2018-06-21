import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {SolicitudesMovilidadComponent} from "./solicitudes-movilidad/solicitudes-movilidad.component";
import {SolicitudesComponent} from "./solicitudes/solicitudes.component";
import {MovilidadesVigentesComponent} from "./movilidades-vigentes/movilidades-vigentes.component";
import {SolicitudesInterprogramasComponent} from "./solicitudes-interprogramas/solicitudes-interprogramas.component";
import {SolicitudesInterprogramasCoordinacionComponent} from "./solicitudes-interprogramas-coordinacion/solicitudes-interprogramas-coordinacion.component";
import {SolicitudesInterprogramasProfesorComponent} from "./solicitudes-interprogramas-profesor/solicitudes-interprogramas-profesor.component";
import {SolicitudesProfesorComponent} from "./solicitudes-profesor/solicitudes-profesor.component";
import {Ng2Bs3ModalModule} from "ng2-bs3-modal/ng2-bs3-modal";
import {
  AlertModule, DatepickerModule, DropdownModule, PaginationModule, TabsModule,
  AccordionModule
} from "ng2-bootstrap/ng2-bootstrap";
import {ReactiveFormsModule} from "@angular/forms";
import { InformacionComplementariaMovilidadComponent } from './informacion-complementaria-movilidad/informacion-complementaria-movilidad.component';
import {NgUploaderModule} from "ngx-uploader/ngx-uploader";
import { DetalleMovilidadComponent } from './detalle-movilidad/detalle-movilidad.component';
import {AgregarMovilidadAlumnoComponent} from "./agregar-movilidad-alumno/agregar-movilidad-alumno.component";
import {DetalleMovilidadAlumnoComponent} from "./detalle-movilidad-alumno/detalle-movilidad-alumno.component";
import {MovilidadInterprogramasComponent} from "./movilidad-interprogramas/movilidad-interprogramas.component";

@NgModule({
  imports: [
    CommonModule, Ng2Bs3ModalModule, AlertModule, DatepickerModule,
    ReactiveFormsModule, DropdownModule, NgUploaderModule, PaginationModule, TabsModule, AccordionModule
  ],

  declarations: [SolicitudesMovilidadComponent,
    SolicitudesComponent,
    MovilidadesVigentesComponent,
    SolicitudesInterprogramasComponent,
    SolicitudesInterprogramasCoordinacionComponent,
    SolicitudesInterprogramasProfesorComponent,
    SolicitudesProfesorComponent,
    InformacionComplementariaMovilidadComponent,
    DetalleMovilidadComponent,
    AgregarMovilidadAlumnoComponent,
    DetalleMovilidadAlumnoComponent,
    MovilidadInterprogramasComponent
  ]

})
export class MovilidadModule { }
