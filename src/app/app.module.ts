import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule, Http} from '@angular/http';
import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {LoginRoutingModule} from './auth/login/login-routing.module';
import {LoginComponent} from './auth/login/login.component';
import {RouterModule, Routes, Router} from '@angular/router';
import {DropdownModule, AccordionModule, AlertModule, DatepickerModule} from 'ng2-bootstrap';
import {BarraNavegacionComponent} from './principal/barra-navegacion/barra-navegacion.component';
import {PerfilComponent} from './principal/perfil/perfil.component';
import {Ng2Bs3ModalModule} from 'ng2-bs3-modal/ng2-bs3-modal';
import {SpinnerComponent} from './services/spinner/spinner/spinner.component';
import {DashboardComponent} from './principal/dashboard/dashboard.component';
import {ConfigService} from './services/core/config.service';
import {MenuComponent} from './principal/menu/menu.component';
import {MateriaModule} from './materia/materia.module';
import {AspiranteModule} from './seleccion/aspirante.module';
import {AlumnoModule} from './alumno/alumno.module';
import {InduccionModule} from './induccion/induccion.module';
import {CalificacionModule} from './calificacion/calificacion.module';
import {RecursosModule} from './recursos/recurso.module';
import {CoordinacionModule} from './coordinacion/coordinacion.module';
import {DocenciaModule} from './docencia/docencia.module';
import {EstudianteEspecialModule} from './estudiante-especial/estudiante-especial.module';
import {MovilidadModule} from './movilidad/movilidad.module';
import {TitulacionModule} from './titulacion/titulacion.module';
import {AdministradorModule} from './administrador/administrador.module';
import {CatalogoModule} from './catalogos/catalogo.module';
import {LiberarAdeudosModule} from './liberar-adeudos/liberar-adeudos.module';
import {TramitesConstanciasModule} from './tramites-constancias/tramites-constancias.module';
import {IdiomasModule} from './idiomas/idiomas.module';
import {ServicioSocialModule} from './servicio-social/servicio-social.module';
import {InteresadosModule} from './interesados/interesados.module';
import {ServiciosModule} from './services/servicios.module';
import {DatePipe} from '@angular/common';
import {PaginationModule } from 'ng2-bootstrap';
import {GeneralesModule} from './generales/generales.module';
import {MenusExternosModule} from './menus-externos/menus-externos.module';
import {EstadisticasModule} from './estadisticas/estadisticas.module';
import {SharedModule} from './utils/shared.module';
import {ChartsModule} from 'ng2-charts';
import {WizardModule} from './wizard/wizard.module';
import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { RecuperarCuentaComponent } from './auth/recuperar-cuenta/recuperar-cuenta.component';
import { ActualizarPassComponent } from './auth/actualizar-pass/actualizar-pass.component';

const routes: Routes = [

];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BarraNavegacionComponent,
    PerfilComponent,
    SpinnerComponent,
    DashboardComponent,
    MenuComponent,
    RecuperarCuentaComponent,
    ActualizarPassComponent],
  imports: [
    WizardModule,
    DatepickerModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    RouterModule.forRoot(routes, { useHash: true }),
    Ng2Bs3ModalModule,
    ServiciosModule,
    DropdownModule,
    AccordionModule,
    PaginationModule,
    AlertModule,
    LoginRoutingModule,
    AppRoutingModule,
    MateriaModule,
    AspiranteModule,
    AlumnoModule,
    InduccionModule,
    CalificacionModule,
    RecursosModule,
    CoordinacionModule,
    DocenciaModule,
    EstudianteEspecialModule,
    MovilidadModule,
    TitulacionModule,
    AdministradorModule,
    CatalogoModule,
    LiberarAdeudosModule,
    TramitesConstanciasModule,
    IdiomasModule,
    ServicioSocialModule,
    InteresadosModule,
    GeneralesModule,
    MenusExternosModule,
    EstadisticasModule,
    SharedModule,
    ChartsModule,
    NgIdleKeepaliveModule.forRoot()
  ],
  providers: [
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(
    public router: Router,
    public http: Http
  ) {
    ConfigService.setRouter(router);
    ConfigService.setAuthHttp(http);
  }
}
