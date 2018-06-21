import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CanDeactivateGuard} from './auth/can-deactivate-guard.service';
import {AuthGuard} from './auth/auth-guard.service';
import {PreloadSelectedModules} from './utils/selective-preload-strategy';
import {DashboardComponent} from './principal/dashboard/dashboard.component';
import {MateriaListComponent} from './materia/materia-list/materia-list.component';
import {SolicitanteComponent} from './seleccion/solicitantes/solicitante.component';
import {AspiranteComponent} from './seleccion/aspirantes/aspirante.component';
import {ComiteEvaluacionComponent} from './generales/comite-evaluacion/comite-evaluacion.component';
import {AspirantesAceptadosComponent} from './seleccion/aspirantes-aceptados/aspirantes-aceptados.component';
import {RecepcionDocumentoComponent} from './alumno/recepcion-documento/recepcion-documento.component';
import {CredencialComponent} from './generales/credenciales/credencial.component';
import {ColegiaturaComponent} from './alumno/colegiatura/colegiatura.component';
import {InduccionTicsComponent} from './induccion/induccion-tics/induccion-tics.component';
import {InduccionDocenciaComponent} from './induccion/induccion-docencia/induccion-docencia.component';
import {InduccionBibliotecaComponent} from './induccion/induccion-biblioteca/induccion-biblioteca.component';
import {CalificacionesComponent} from './calificacion/calificaciones/calificaciones.component';
import {ActasCalificacionComponent} from './calificacion/actas-calificacion/actas-calificacion.component';
import {RevisionActasCalificacionComponent} from './calificacion/revision-actas-calificacion/revision-actas-calificacion.component';
import {BoletasCalificacionComponent} from './calificacion/boletas-calificacion/boletas-calificacion.component';
import {SolicitudRecursoRevisionComponent} from './recursos/solicitud-recurso-revision/solicitud-recurso-revision.component';
import {EvaluacionRecursoRevisionComponent} from './recursos/evaluacion-recurso-revision/evaluacion-recurso-revision.component';
import {TrabajoRecuperacionRecursosComponent} from './recursos/trabajo-recuperacion-recursos/trabajo-recuperacion-recursos.component';
import {TrabajoRecuperacionComponent} from './coordinacion/trabajo-recuperacion/trabajo-recuperacion.component';
import {EvaluacionDocenteComponent} from './generales/evaluacion-docente/evaluacion-docente.component';
import {EvaluacionDocenteListComponent} from './docencia/evaluacion-docente-list/evaluacion-docente-list.component';
import {EstudiantesPendientesListComponent} from './docencia/estudiantes-pendientes-list/estudiantes-pendientes-list.component';
import {EstudianteEspecialInteresadosComponent} from './estudiante-especial/estudiante-especial-interesados/estudiante-especial-interesados.component';
import {EstudianteEspecialInteresadosCoordinacionComponent} from './estudiante-especial/estudiante-especial-interesados-coordinacion/estudiante-especial-interesados-coordinacion.component';
import {AceptadosRechazadosComponent} from './estudiante-especial/aceptados-rechazados/aceptados-rechazados.component';
import {AspirantesComponent} from './estudiante-especial/aspirantes/aspirantes.component';
import {SolicitudesMovilidadComponent} from './movilidad/solicitudes-movilidad/solicitudes-movilidad.component';
import {SolicitudesComponent} from './movilidad/solicitudes/solicitudes.component';
import {MovilidadesVigentesComponent} from './movilidad/movilidades-vigentes/movilidades-vigentes.component';
import {SolicitudesInterprogramasComponent} from './movilidad/solicitudes-interprogramas/solicitudes-interprogramas.component';
import {SolicitudesInterprogramasCoordinacionComponent} from './movilidad/solicitudes-interprogramas-coordinacion/solicitudes-interprogramas-coordinacion.component';
import {SolicitudesInterprogramasProfesorComponent} from './movilidad/solicitudes-interprogramas-profesor/solicitudes-interprogramas-profesor.component';
import {SolicitudesProfesorComponent} from './movilidad/solicitudes-profesor/solicitudes-profesor.component';
import {ApoyoEconomicoComponent} from './generales/apoyos-economicos/apoyo-economico.component';
import {AsignarTutorDirectorComponent} from './titulacion/asignar-tutor-director/asignar-tutor-director.component';
import {AsignarComiteComponent} from './titulacion/asignar-comite/asignar-comite.component';
import {DefensaTesisComponent} from './titulacion/defensa-tesis/defensa-tesis.component';
import {DictamenDefensaTesisComponent} from './titulacion/dictamen-defensa-tesis/dictamen-defensa-tesis.component';
import {EmisionTitulosComponent} from './docencia/emision-titulos/emision-titulos.component';
import {ListaUsuariosComponent} from './administrador/lista-usuarios/lista-usuarios.component';
import {BitacoraComponent} from './administrador/bitacora/bitacora.component';
import {BecasApoyosComponent} from './catalogos/becas-apoyos/becas-apoyos.component';
import {ConveniosComponent} from './catalogos/convenios/convenios.component';
import {ConvocatoriaComponent} from './catalogos/convocatoria/convocatoria.component';
import {CalificacioneComponent} from './catalogos/calificaciones/calificaciones.component';
import {DocumentosComponent} from './catalogos/documentos/documentos.component';
import {IdiomasComponent} from './catalogos/idiomas/idiomas.component';
import {InduccionesComponent} from './catalogos/inducciones/inducciones.component';
import {InstitcionComponent} from './catalogos/institcion/institcion.component';
import {LgacComponent} from './catalogos/lgac/lgac.component';
import {MateriasComponent} from './catalogos/materias/materias.component';
import {NabComponent} from './catalogos/nab/nab.component';
import {NivelEstudiosComponent} from './catalogos/nivel-estudios/nivel-estudios.component';
import {PeriodoEscolarComponent} from './catalogos/periodo-escolar/periodo-escolar.component';
import {PlanEstudiosComponent} from './catalogos/plan-estudios/plan-estudios.component';
import {PreguntasFecuentesComponent} from './catalogos/preguntas-fecuentes/preguntas-fecuentes.component';
import {ProfesoresComponent} from './catalogos/profesores/profesores.component';
import {ProgramaDocenteComponent} from './catalogos/programa-docente/programa-docente.component';
import {PromocionesListComponent} from './catalogos/promociones-list/promociones-list.component';
import {SalasComponent} from './catalogos/salas/salas.component';
import {AsistenciaListComponent} from './materia/asistencia-list/asistencia-list.component';
import {ProgramaBaseComponent} from './coordinacion/programa-base/programa-base.component';
import {OptativasComponent} from './materia/optativas/optativas.component';
import {ProgramaComponent} from './materia/programa/programa.component';
import {LiberarAdeudosDocenciaComponent} from './docencia/liberar-adeudos-docencia/liberar-adeudos-docencia.component';
import {LiberarAdeudosUticComponent} from './liberar-adeudos/liberar-adeudos-utic/liberar-adeudos-utic.component';
import {LiberarAdeudosFinanzasComponent} from './liberar-adeudos/liberar-adeudos-finanzas/liberar-adeudos-finanzas.component';
import {LiberarAdeudosBibliotecaComponent} from './liberar-adeudos/liberar-adeudos-biblioteca/liberar-adeudos-biblioteca.component';
import {CartaNoAdeudoListComponent} from './docencia/carta-no-adeudo-list/carta-no-adeudo-list.component';
import {LiberarAdeudosRmsComponent} from './liberar-adeudos/liberar-adeudos-rms/liberar-adeudos-rms.component';
import {ConstanciaEstudioComponent} from './tramites-constancias/constancia-estudio/constancia-estudio.component';
import {ConstanciaProfesorComponent} from './tramites-constancias/constancia-profesor/constancia-profesor.component';
import {CedulaComponent} from './tramites-constancias/cedula/cedula.component';
import {RegistroProfesoresComponent} from './tramites-constancias/registro-profesores/registro-profesores.component';
import {IdiomasGruposComponent} from './idiomas/idiomas-grupos/idiomas-grupos.component';
import {IdiomasEvaluacionComponent} from './idiomas/idiomas-evaluacion/idiomas-evaluacion.component';
import {IdiomasAcreditacionComponent} from './idiomas/idiomas-acreditacion/idiomas-acreditacion.component';
import {SolicitudServicioSocialComponent} from './servicio-social/solicitud-servicio-social/solicitud-servicio-social.component';
import {ReporteServicioSocialComponent} from './servicio-social/reporte-servicio-social/reporte-servicio-social.component';
import {InteresadosListComponent} from './interesados/interesados-list/interesados-list.component';
import {ExpedienteAlumnoComponent} from './docencia/expediente-alumno/expediente-alumno.component';
import {EstadisticasComponent} from './estadisticas/estadisticas/estadisticas.component';
import {FormacionContinuaComponent} from './generales/formacion-continua/formacion-continua.component';
import {AlumnoExpedienteComponent} from './alumno/alumno-expediente/expediente-alumno.component';
import {InteresadoRegistroComponent} from './menus-externos/interesado-registro/interesado-registro.component';
import {ReinscripcionAlumnoComponent} from './alumno/reinscripcion-alumno/reinscripcion-alumno.component';
import {TemariosParticularesComponent} from './materia/temarios-particulares/temarios-particulares.component';
import {HistorialMateriasComponent} from './materia/historial-materias/historial-materias.component';
import {ExpedienteComponent} from './alumno/expediente/expediente.component';
import {CrearFormacionContinuaComponent} from './generales/crear-formacion-continua/crear-formacion-continua.component';
import {EditarFormacionContinuaComponent} from './generales/editar-formacion-continua/editar-formacion-continua.component';
import {DetalleFormacionContinuaComponent} from './generales/detalle-formacion-continua/detalle-formacion-continua.component';
import {AspiranteDetallesComponent} from './seleccion/aspirante-detalles/aspirante-detalles.component';
import {ProgramaDocenteCrudComponent} from './catalogos/programa-docente-crud/programa-docente-crud.component';
import {EditarInformacionInstitucionComponent} from './catalogos/editar-informacion-institucion/editar-informacion-institucion.component';
import {ExpedirConstanciaComponent} from './tramites-constancias/expedir-constancia/expedir-constancia.component';
import {DetalleConstanciaComponent} from './tramites-constancias/detalle-constancia/detalle-constancia.component';
import {PromocionesCrearComponent} from './catalogos/promociones-crear/promociones-crear.component';
import {RegistroSolicitanteComponent} from './menus-externos/registro-solicitante/registro-solicitante.component';
import {FaqSeleccionComponent} from './menus-externos/faq-seleccion/faq-seleccion.component';
import {InteresadoRegistroMovilidadComponent} from './menus-externos/interesado-registro-movilidad/interesado-registro-movilidad.component';
import {RegistroEstudianteMovilidadComponent} from './menus-externos/registro-estudiante-movilidad/registro-estudiante-movilidad.component';
import {FaqMovilidadComponent} from './menus-externos/faq-movilidad/faq-movilidad.component';
import {ProfesorDetallesComponent} from './catalogos/profesor-detalles/profesor-detalles.component';
import {ProfesorEditarComponent} from './catalogos/profesor-editar/profesor-editar.component';
import {DetalleEstudianteEspecialComponent} from './estudiante-especial/detalle-estudiante-especial/detalle-estudiante-especial.component';
import {InformacionComplementariaMovilidadComponent} from './movilidad/informacion-complementaria-movilidad/informacion-complementaria-movilidad.component';
import {DetalleMovilidadComponent} from './movilidad/detalle-movilidad/detalle-movilidad.component';
import {PlanEstudiosCrearComponent} from './catalogos/plan-estudios-crear/plan-estudios-crear.component';
import {PlanEstudiosDetallesComponent} from './catalogos/plan-estudios-detalles/plan-estudios-detalles.component';
import {PlanEstudiosEditarComponent} from './catalogos/plan-estudios-editar/plan-estudios-editar.component';
import {MateriasGestionComponent} from './alumno/materias/materias-gestion.component';
import {IdiomaAcreditadoComponent} from './alumno/idioma-acreditado/idioma-acreditado.component';
import {SolicitudAdmisionComponent} from './alumno/solicitud-admision/solicitud-admision.component';
import {ResolucionRecursoRevisionComponent} from './recursos/resolucion-recurso-revision/resolucion-recurso-revision.component';
import {CalificacionRecursoRevisionComponent} from './recursos/calificacion-recurso-revision/calificacion-recurso-revision.component';
import {ListaSolicitantesComponent} from './generales/lista-solicitantes/lista-solicitantes.component';
import {ListaSolicitudesMovilidadExternaComponent} from  './estudiante-especial/lista-solicitudes-movilidad-externa/lista-solicitudes-movilidad-externa.component';
import {CursoEspecificoComponent} from './materia/curso-especifico/curso-especifico.component';
import {ResolucionRecuperacionComponent} from './coordinacion/resolucion-recuperacion/resolucion-recuperacion.component';
import {SolicitanteDetallesComponent} from './seleccion/solicitante-detalles/solicitante-detalles.component';
import {HistorialAcademicoComponent} from './alumno/historial-academico/historial-academico.component';
import {InduccionAcademicaComponent} from './induccion/induccion-academica/induccion-academica.component';
import {EvaluacionAspiranteComponent} from './seleccion/evaluacion-aspirante/evaluacion-aspirante.component';
import {EvaluacionExpedienteComponent} from './seleccion/evaluacion-expediente/evaluacion-expediente.component';
import {EvaluacionProfesoresComponent} from './alumno/evaluacion-profesores/evaluacion-profesores.component';
import {AgregarGrupoIdiomasComponent} from './idiomas/agregar-grupo-idiomas/agregar-grupo-idiomas.component';
import {DatosCursoComponent} from './idiomas/steps-datos-curso-idiomas/datos-curso.component';
import {AgregarMovilidadAlumnoComponent} from './movilidad/agregar-movilidad-alumno/agregar-movilidad-alumno.component';
import {DetalleMovilidadAlumnoComponent} from './movilidad/detalle-movilidad-alumno/detalle-movilidad-alumno.component';
import {EvaluacionStepsComponent} from './alumno/evaluacion-steps/evaluacion-steps.component';
import {EvaluacionIdiomaStepsComponent} from './alumno/evaluacion-idioma-steps/evaluacion-idioma-steps.component';
import {PagosComponent} from './alumno/pagos/pagos.component';
import {RegistroAdmisionComponent} from './estudiante-especial/registro-admision/registro-admision.component';
import {TramitesComponent} from './alumno/tramites/tramites.component';
import {SolicitudCartaNoAdeudoComponent} from './alumno/tramites/solicitud-carta-no-adeudo/solicitud-carta-no-adeudo.component';
import {MovilidadInterprogramasComponent} from './movilidad/movilidad-interprogramas/movilidad-interprogramas.component';
import {ServicioSocialComponent} from './alumno/servicio-social/servicio-social.component';
import {ServicioSocialInformacionComponent} from './alumno/servicio-social-informacion/servicio-social-informacion.component';
import {DocumentosAlumnoComponent} from './alumno/documentos-alumno/documentos-alumno.component';
import {GestionCursoBaseComponent} from './materia/gestion-curso-base/gestion-curso-base.component';
import {GestionOptativaComponent} from './materia/gestion-optativa/gestion-optativa.component';
import {RecuperarCuentaComponent} from './auth/recuperar-cuenta/recuperar-cuenta.component';
import {ActualizarPassComponent} from './auth/actualizar-pass/actualizar-pass.component';

const appRoutes: Routes = [
  {
    path: 'registroInteresado',
    component: InteresadoRegistroComponent
  },
  {
    path: 'registroSolicitante',
    component: RegistroSolicitanteComponent
  },
  {
    path: 'PreguntasFrecuentes/:id',
    component: FaqSeleccionComponent
  },
  {
    path: 'registroInteresadoMovilidad',
    component: InteresadoRegistroMovilidadComponent
  },
  {
    path: 'estudianteMovilidad',
    component: RegistroEstudianteMovilidadComponent
  },
  {
    path: 'pregruntaFrecuentesMovilidad',
    component: FaqMovilidadComponent
  },
  {
    path: 'forgotPassword',
    component: RecuperarCuentaComponent
  },
  {
    path: 'resetPassword/:hash',
    component: ActualizarPassComponent
  },
  {
    path: 'movilidad',
    children: [
      {path: 'agregar-solicitud', component: AgregarMovilidadAlumnoComponent},
      {path: 'solicitud-admision', component: AgregarMovilidadAlumnoComponent},
      {path: 'detalle-alumno', component: DetalleMovilidadAlumnoComponent},
      {path: 'registro-estudantes', component: RegistroEstudianteMovilidadComponent},
      {path: 'faq', component: FaqMovilidadComponent},
      {path: 'registro-admision', component: RegistroAdmisionComponent},
      {path: 'movilidad-interprogramas', component: MovilidadInterprogramasComponent}
    ]
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'expediente-alumno-personalizado',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: AlumnoExpedienteComponent}
    ]
  },
  {
    path: 'formacion-continua',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: FormacionContinuaComponent},
      {path: 'crearactividad', component: CrearFormacionContinuaComponent},
      {path: 'editaractividad', component: EditarFormacionContinuaComponent},
      {path: 'detalleactividad', component: DetalleFormacionContinuaComponent}
    ]
  },
  {
    path: 'estadisticas',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: EstadisticasComponent}
    ]
  },
  {
    path: 'expediente-alumno',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: ExpedienteAlumnoComponent}
    ]
  },
  {
    path: 'lista-interesados',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: InteresadosListComponent}
    ]
  },
  {
    path: 'servicio-social',
    canActivate: [AuthGuard],
    children: [
      {path: 'solicitud', component: SolicitudServicioSocialComponent},
      {path: 'reporte', component: ReporteServicioSocialComponent}
    ]
  },
  {
    path: 'idiomas',
    canActivate: [AuthGuard],
    children: [
      {path: 'grupos-idiomas', component: IdiomasGruposComponent},
      {path: 'evaluacion-idiomas', component: IdiomasEvaluacionComponent},
      {path: 'acreditacion-idiomas', component: IdiomasAcreditacionComponent},
      {path: 'agregar-grupo-idiomas', component: AgregarGrupoIdiomasComponent},
      {path: 'datos-curso', component: DatosCursoComponent}
    ]
  },
  {
    path: 'tramite-constancia',
    canActivate: [AuthGuard],
    children: [
      {path: 'liberar-adeudos-area-docencia', component: LiberarAdeudosDocenciaComponent},
      {path: 'liberar-adeudos-area-utic', component: LiberarAdeudosUticComponent},
      {path: 'liberar-adeudos-area-finanzas', component: LiberarAdeudosFinanzasComponent},
      {path: 'liberar-adeudos-area-biblioteca', component: LiberarAdeudosBibliotecaComponent},
      {path: 'liberar-adeudos-area-rms', component: LiberarAdeudosRmsComponent},
      {path: 'lista-carta-no-adeudo', component: CartaNoAdeudoListComponent},
      {path: 'solicitud-constancia-estudio', component: ConstanciaEstudioComponent},
      {path: 'solicitud-constancia-profesor', component: ConstanciaProfesorComponent},
      {path: 'tramite-cedula', component: CedulaComponent},
      {path: 'registro-profesores', component: RegistroProfesoresComponent},
      {path: 'expedir-constancia', component: ExpedirConstanciaComponent },
      {path: 'detalle-constancia', component: DetalleConstanciaComponent }
    ]
  },
  {
    path: 'materias',
    canActivate: [AuthGuard],
    children: [
      {path: 'lista-asistencia', component: AsistenciaListComponent},
      {path: 'programa-base', component: ProgramaBaseComponent},
      {path: 'optativa', component: OptativasComponent},
      {path: 'programa-materia', component: ProgramaComponent},
      {path: 'temarios-particulares', component: TemariosParticularesComponent },
      {path: 'historial-materias', component: HistorialMateriasComponent },
      {path: 'curso-especifico', component: CursoEspecificoComponent },
      {path: 'curso-base', component: GestionCursoBaseComponent },
      {path: 'curso-optativo-esp', component: GestionOptativaComponent}
    ]
  },
  {
    path: 'catalogo',
    canActivate: [AuthGuard],
    children: [
      {path: 'becas-apoyos', component: BecasApoyosComponent},
      {path: 'convenios', component: ConveniosComponent},
      {path: 'convocatoria', component: ConvocatoriaComponent},
      {path: 'calificaciones', component: CalificacioneComponent},
      {path: 'documentos', component: DocumentosComponent},
      {path: 'idiomas', component: IdiomasComponent},
      {path: 'inducciones', component: InduccionesComponent},
      {path: 'institucion', component: InstitcionComponent},
      {path: 'lgac', component: LgacComponent},
      {path: 'materias', component: MateriasComponent},
      {path: 'nab', component: NabComponent},
      {path: 'nivel-estudios', component: NivelEstudiosComponent},
      {path: 'periodo-escolar', component: PeriodoEscolarComponent},
      {path: 'plan-estudios', component: PlanEstudiosComponent},
      {path: 'preguntas-frecuentes', component: PreguntasFecuentesComponent},
      {path: 'profesores', component: ProfesoresComponent},
      {path: 'programa-docente', component: ProgramaDocenteComponent},
      {path: 'promociones-lista', component: PromocionesListComponent},
      {path: 'salas', component: SalasComponent}
    ]
  },
  {
    path: 'plan-estudios',
    canActivate: [AuthGuard],
    children: [
      {path: 'crear', component: PlanEstudiosCrearComponent },
      {path: 'detalles', component: PlanEstudiosDetallesComponent },
      {path: 'editar', component: PlanEstudiosEditarComponent }
    ]
  },
  {
    path: 'promociones',
    canActivate: [AuthGuard],
    children: [
      {path: 'crearpromocion', component: PromocionesCrearComponent },
      {path: 'editarpromocion', component: PromocionesCrearComponent }
    ]
  },
  {
    path: 'profesores',
    canActivate: [AuthGuard],
    children: [
      {path: 'detalles', component: ProfesorDetallesComponent },
      {path: 'editar', component: ProfesorEditarComponent }
    ]
  },
  {
    path: 'programa-docente',
    canActivate: [AuthGuard],
    children: [
      {path: 'agregar', component: ProgramaDocenteCrudComponent},
      {path: 'editar', component: ProgramaDocenteCrudComponent}
    ]
  },
  {
    path: 'institucion',
    canActivate: [AuthGuard],
    children: [
      {path: 'editar', component: EditarInformacionInstitucionComponent}
    ]
  },
  {
    path: 'administrador',
    canActivate: [AuthGuard],
    children: [
      {path: 'lista-usuarios', component: ListaUsuariosComponent},
      {path: 'bitacora', component: BitacoraComponent}
    ]
  },
  {
    path: 'titulacion',
    canActivate: [AuthGuard],
    children: [
      {path: 'asinar-tutor-director', component: AsignarTutorDirectorComponent},
      {path: 'asignar-comite', component: AsignarComiteComponent},
      {path: 'defensa-tesis', component: DefensaTesisComponent},
      {path: 'dictamen-defensa-tesis', component: DictamenDefensaTesisComponent},
      {path: 'emision-titulos', component: EmisionTitulosComponent}
    ]
  },
  {
    path: 'apoyo-economico',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: ApoyoEconomicoComponent}
    ]
  },
  {
    path: 'movilidad-academica',
    canActivate: [AuthGuard],
    children: [
      {path: 'estudiante-especial-interesado', component: EstudianteEspecialInteresadosComponent},
      {path: 'estudiante-especial-interesado-coordinacion', component: EstudianteEspecialInteresadosCoordinacionComponent},
      {path: 'estudiante-especial-aceptados-rechazados', component: AceptadosRechazadosComponent},
      {path: 'estudiante-especial-aspirante', component: AspirantesComponent},
      {path: 'solicitudes-movilidad', component: SolicitudesMovilidadComponent},
      {path: 'solicitudes-coordinacion', component: SolicitudesComponent},
      {path: 'movilidades-vigentes', component: MovilidadesVigentesComponent},
      {path: 'solicitudes-interporgramas', component: SolicitudesInterprogramasComponent},
      {path: 'solicitudes-interporgramas-coordinacion', component: SolicitudesInterprogramasCoordinacionComponent},
      {path: 'solicitudes-interporgramas-profesor', component: SolicitudesInterprogramasProfesorComponent},
      {path: 'solicitudes-profesor', component: SolicitudesProfesorComponent},
      {path: 'detalle', component: DetalleEstudianteEspecialComponent },
      {path: 'informacion-complementaria', component: InformacionComplementariaMovilidadComponent },
      {path: 'detale-movilidad', component: DetalleMovilidadComponent }
    ]
  },
  {
    path: 'reinscripcion',
    canActivate: [AuthGuard],
    children: [
      {path: 'materia', component: MateriaListComponent},
      {path: 'reinscripcion-alumno', component: ReinscripcionAlumnoComponent}
    ]
  },
  {
    path: 'evaluacion-profesores',
    canActivate: [AuthGuard],
    children: [
      {path: 'evaluacion-docente', component: EvaluacionDocenteComponent},
      {path: 'lista-evaluacion-docente', component: EvaluacionDocenteListComponent},
      {path: 'lista-estudiantes-pendientes', component: EstudiantesPendientesListComponent}
    ]
  },
  {
    path: 'alumno',
    canActivate: [AuthGuard],
    children: [
      {path: 'expediente', component: ExpedienteComponent },
      {path: 'idioma-acreditado', component: IdiomaAcreditadoComponent },
      {path: 'materias', component: MateriasGestionComponent },
      {path: 'historial-academico', component: HistorialAcademicoComponent },
      {path: 'induccion-academica', component: InduccionAcademicaComponent },
      {path: 'evaluacion-docente', component: EvaluacionProfesoresComponent },
      {path: 'evaluacion-steps', component: EvaluacionStepsComponent },
      {path: 'evaluacion-idioma-steps', component: EvaluacionIdiomaStepsComponent },
      {path: 'pagos', component: PagosComponent },
      {path: 'tramites', component: TramitesComponent},
      {path: 'cedula', component: CedulaComponent},
      {path: 'solicitud-servicio-social', component: ServicioSocialComponent},
      {path: 'solicitud-carta-no-adeudo', component: SolicitudCartaNoAdeudoComponent},
      {path: 'informacion-servicio-social', component: ServicioSocialInformacionComponent},
      {path: 'documentos-estudiante', component: DocumentosAlumnoComponent}
    ]
  },
  {
    path: 'formacion-academica',
    canActivate: [AuthGuard],
    children: [
      {path: 'calificaciones', component: CalificacionesComponent},
      {path: 'revision-actas-calificacion', component: RevisionActasCalificacionComponent},
      {path: 'actas-calificacion', component: ActasCalificacionComponent},
      {path: 'boletas-calificacion', component: BoletasCalificacionComponent},
      {path: 'solicitud-recurso-revision', component: SolicitudRecursoRevisionComponent},
      {path: 'evaluacion-recurso-revision', component: EvaluacionRecursoRevisionComponent},
      {path: 'lista-trabajos-recuperacion-recursos', component: TrabajoRecuperacionRecursosComponent},
      {path: 'lista-trabajos-recuperacion-coordinacion', component: TrabajoRecuperacionComponent},
      {path: 'resolucion-recurso-revision', component: ResolucionRecursoRevisionComponent},
      {path: 'evaluacion-recursos-resolucion', component: CalificacionRecursoRevisionComponent},
      {path: 'resolucion-recuperacion', component: ResolucionRecuperacionComponent}

    ]
  },

  {
    path: 'Registro',
    component: SolicitudAdmisionComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'induccion',
    canActivate: [AuthGuard],
    children: [
      {path: 'tics', component: InduccionTicsComponent},
      {path: 'docencia', component: InduccionDocenciaComponent},
      {path: 'biblioteca', component: InduccionBibliotecaComponent}
    ]
  },
  {
    path: 'inscripciones',
    canActivate: [AuthGuard],
    children: [
      {path: 'recepcion-documento', component: RecepcionDocumentoComponent},
      {path: 'credencial', component: CredencialComponent},
      {path: 'colegiatura', component: ColegiaturaComponent}
    ]
  },
  {
    path: 'seleccion',
    canActivate: [AuthGuard],
    children: [
      {path: 'solicitante', component: SolicitanteComponent },
      {path: 'aspirante', component: AspiranteComponent },
      {path: 'evaluacion-aspirante', component: EvaluacionAspiranteComponent },
      {path: 'aspirante-aceptado', component: AspirantesAceptadosComponent },
      {path: 'comite-evaluacion', component: ComiteEvaluacionComponent }
    ]
  },
  {
    path: 'aspirante',
    canActivate: [AuthGuard],
    children: [
      {path: 'detalles', component: AspiranteDetallesComponent },
    ]
  },
  {
    path: 'evaluacion-aspirante',
    canActivate: [AuthGuard],
    children: [
      {path: 'expediente', component: EvaluacionExpedienteComponent },
    ]
  },
  {
    path: 'solicitante',
    canActivate: [AuthGuard],
    children: [
      {path: 'detalles', component: SolicitanteDetallesComponent },
    ]
  },
  {
    path: 'lista/solicitudes',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: ListaSolicitantesComponent}
    ]
  },
  {
    path: 'lista-solicitudes',
    canActivate: [AuthGuard],
    children: [
      {path: '', component: ListaSolicitudesMovilidadExternaComponent}
    ]
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { preloadingStrategy: PreloadSelectedModules }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
    CanDeactivateGuard,
    PreloadSelectedModules
  ]
})
export class AppRoutingModule {}
