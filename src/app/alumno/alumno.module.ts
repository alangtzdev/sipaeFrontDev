import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {RecepcionDocumentoComponent} from './recepcion-documento/recepcion-documento.component';
import {ColegiaturaComponent} from './colegiatura/colegiatura.component';
import {AlumnoExpedienteComponent} from './alumno-expediente/expediente-alumno.component';
import {ReinscripcionAlumnoComponent} from './reinscripcion-alumno/reinscripcion-alumno.component';
import {ExpedienteComponent} from './expediente/expediente.component';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import {
  AlertModule, TabsModule, DatepickerModule, PaginationModule, DropdownModule,
  AccordionModule
} from "ng2-bootstrap";
import {MateriasGestionComponent} from "./materias/materias-gestion.component";
import {IdiomaAcreditadoComponent } from './idioma-acreditado/idioma-acreditado.component';
import { SolicitudAdmisionComponent } from './solicitud-admision/solicitud-admision.component';
import { HistorialAcademicoComponent } from './historial-academico/historial-academico.component';
import { HistorialAcademicoAprendizajeContinuoComponent } from './historial-academico-aprendizaje-continuo/historial-academico-aprendizaje-continuo.component';
import { HistorialAcademicoKardexComponent } from './historial-academico-kardex/historial-academico-kardex.component';
import { EvaluacionProfesoresComponent } from './evaluacion-profesores/evaluacion-profesores.component';
import {EvaluacionStepsComponent} from "./evaluacion-steps/evaluacion-steps.component";
import {EvaluacionParteUnoComponent} from './evaluacion-parte-uno/evaluacion-parte-uno.component';
import {EvaluacionParteDosComponent} from './evaluacion-parte-dos/evaluacion-parte-dos.component';
import {EvaluacionParteTresComponent} from './evaluacion-parte-tres/evaluacion-parte-tres.component';
import {EvaluacionParteCuatroComponent} from './evaluacion-parte-cuatro/evaluacion-parte-cuatro.component';
import {EvaluacionIdiomaStepsComponent} from "./evaluacion-idioma-steps/evaluacion-idioma-steps.component";
import {EvaluacionIdiomaParteUnoComponent} from "./evaluacion-idioma-parte-uno/evaluacion-idioma-parte-uno.component";
import {EvaluacionIdiomaParteDosComponent} from "./evaluacion-idioma-parte-dos/evaluacion-idioma-parte-dos.component";
import {EvaluacionIdiomaParteTresComponent} from "./evaluacion-idioma-parte-tres/evaluacion-idioma-parte-tres.component";
import {PagosComponent} from "./pagos/pagos.component";
import {WizardModule} from "../wizard/wizard.module";
import { DatosPersonalesComponent } from './solicitud-admision/datos-personales/datos-personales.component';
import { DependientesContactoComponent } from './solicitud-admision/dependientes-contacto/dependientes-contacto.component';
import { AntecedenteAcademicoComponent } from './solicitud-admision/antecedente-academico/antecedente-academico.component';
import { ExperienciaComponent } from './solicitud-admision/experiencia/experiencia.component';
import { InfoComplementariaComponent } from './solicitud-admision/info-complementaria/info-complementaria.component';
import { DocumentacionComponent } from './solicitud-admision/documentacion/documentacion.component';
import {ModalFotografiaComponent} from "./solicitud-admision/modal-fotografia/modal-fotografia.component";
import {NgUploaderModule} from "ngx-uploader";
import { ModalDetalleDireccionComponent } from './solicitud-admision/modal-detalle-direccion/modal-detalle-direccion.component';
import { ModalRegistroDireccionComponent } from './solicitud-admision/modal-registro-direccion/modal-registro-direccion.component';
import { ModalRegistroDependientesComponent } from './solicitud-admision/modal-registro-dependientes/modal-registro-dependientes.component';
import { ModalDetalleDependientesComponent } from './solicitud-admision/modal-detalle-dependientes/modal-detalle-dependientes.component';
import { ModalDetalleDatoAcademicoComponent } from './solicitud-admision/modal-detalle-dato-academico/modal-detalle-dato-academico.component';
import { ModalRegistroDatoAcademicoComponent } from './solicitud-admision/modal-registro-dato-academico/modal-registro-dato-academico.component';
import { ModalRegistroIdiomasComponent } from './solicitud-admision/modal-registro-idiomas/modal-registro-idiomas.component';
import { ModalRegistroPublicacionesComponent } from './solicitud-admision/modal-registro-publicaciones/modal-registro-publicaciones.component';
import { ModalDetallePublicacionesComponent } from './solicitud-admision/modal-detalle-publicaciones/modal-detalle-publicaciones.component';
import { ModalDetalleExperienciaComponent } from './solicitud-admision/modal-detalle-experiencia/modal-detalle-experiencia.component';
import { ModalRegistroExperienciaComponent } from './solicitud-admision/modal-registro-experiencia/modal-registro-experiencia.component';
import { ModalAgregarDocComponent } from './solicitud-admision/modal-agregar-doc/modal-agregar-doc.component';
import { ModalEnviarSolicitudComponent } from './solicitud-admision/modal-enviar-solicitud/modal-enviar-solicitud.component';
import { TramitesComponent } from './tramites/tramites.component';
import { SolicitudCartaNoAdeudoComponent } from './tramites/solicitud-carta-no-adeudo/solicitud-carta-no-adeudo.component';
import {Ng2AutoCompleteModule} from "ng2-auto-complete";
import { ServicioSocialComponent } from './servicio-social/servicio-social.component';
import { ModalServicioSocialComponent } from './servicio-social/modal-servicio-social/modal-servicio-social.component';
import { ServicioSocialInformacionComponent } from './servicio-social-informacion/servicio-social-informacion.component';
import { DocumentosAlumnoComponent } from './documentos-alumno/documentos-alumno.component';

@NgModule({
  imports: [
    WizardModule, CommonModule,AlertModule, Ng2Bs3ModalModule, TabsModule,
    DatepickerModule, ReactiveFormsModule, FormsModule, PaginationModule,
    DropdownModule, AccordionModule,NgUploaderModule,Ng2AutoCompleteModule
],

  declarations: [RecepcionDocumentoComponent,
    ColegiaturaComponent,
    AlumnoExpedienteComponent,
    ReinscripcionAlumnoComponent,
    ExpedienteComponent,
    MateriasGestionComponent,
    IdiomaAcreditadoComponent,
    SolicitudAdmisionComponent,
    HistorialAcademicoComponent,
    HistorialAcademicoAprendizajeContinuoComponent,
    HistorialAcademicoKardexComponent,
    EvaluacionProfesoresComponent,
    EvaluacionStepsComponent,
    EvaluacionParteUnoComponent,
    EvaluacionParteDosComponent,
    EvaluacionParteTresComponent,
    EvaluacionParteCuatroComponent,
    EvaluacionIdiomaStepsComponent,
    EvaluacionIdiomaParteUnoComponent,
    EvaluacionIdiomaParteDosComponent,
    EvaluacionIdiomaParteTresComponent,
    PagosComponent,
    DatosPersonalesComponent,
    DependientesContactoComponent,
    AntecedenteAcademicoComponent,
    ExperienciaComponent,
    InfoComplementariaComponent,
    DocumentacionComponent,
    ModalFotografiaComponent,
    ModalDetalleDireccionComponent,
    ModalRegistroDireccionComponent,
    ModalRegistroDependientesComponent,
    ModalDetalleDependientesComponent,
    ModalDetalleDatoAcademicoComponent,
    ModalRegistroDatoAcademicoComponent,
    ModalRegistroIdiomasComponent,
    ModalRegistroPublicacionesComponent,
    ModalDetallePublicacionesComponent,
    ModalDetalleExperienciaComponent,
    ModalRegistroExperienciaComponent,
    ModalAgregarDocComponent,
    ModalEnviarSolicitudComponent,
    TramitesComponent,
    SolicitudCartaNoAdeudoComponent,
    ServicioSocialComponent,
    ModalServicioSocialComponent,
    ServicioSocialInformacionComponent,
    DocumentosAlumnoComponent
  ]

})
export class AlumnoModule { }
