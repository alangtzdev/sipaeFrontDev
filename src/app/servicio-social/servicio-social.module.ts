import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SolicitudServicioSocialComponent} from './solicitud-servicio-social/solicitud-servicio-social.component';
import {ReporteServicioSocialComponent} from './reporte-servicio-social/reporte-servicio-social.component';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import { TabsModule, DropdownModule, DatepickerModule, AlertModule, PaginationModule } from 'ng2-bootstrap';
import {ReactiveFormsModule} from '@angular/forms';
import { CargarDocumentosComponentComponent } from './cargar-documentos-component/cargar-documentos-component.component';
import { NgUploaderModule } from 'ngx-uploader';
import { ReporteFinalComponentComponent } from './reporte-final-component/reporte-final-component.component';
import { DetalleDatosGeneralesComponentComponent } from './detalle-datos-generales-component/detalle-datos-generales-component.component';
import { 
  DetalleSolicitudServicioComponentComponent
} from './detalle-solicitud-servicio-component/detalle-solicitud-servicio-component.component';
import { ReporteBimestralComponentComponent } from './reporte-bimestral-component/reporte-bimestral-component.component';
import { HistorialReportesBimiestralesComponentComponent } from './historial-reportes-bimiestrales-component/historial-reportes-bimiestrales-component.component';
@NgModule({
  imports: [
    CommonModule, Ng2Bs3ModalModule,
    TabsModule, ReactiveFormsModule,
    DropdownModule, DatepickerModule,
    AlertModule, NgUploaderModule,
    PaginationModule
  ],

  declarations: [SolicitudServicioSocialComponent,
    ReporteServicioSocialComponent,
    CargarDocumentosComponentComponent,
    ReporteFinalComponentComponent,
    DetalleDatosGeneralesComponentComponent,
    DetalleSolicitudServicioComponentComponent,
    ReporteBimestralComponentComponent,
    HistorialReportesBimiestralesComponentComponent,
  ]

})
export class ServicioSocialModule { }
