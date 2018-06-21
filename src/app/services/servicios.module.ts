import {NgModule} from "@angular/core";
import {GlobalService} from "./core/global.service";
import {ConfigService} from "./core/config.service";
import {SpinnerService} from "./spinner/spinner/spinner.service";
import {PeriodoEscolarService} from "./servicios-especializados/periodo-escolar/periodo-escolar.service";
import {PromocionService} from "./servicios-especializados/promocion/promocion.service";
import {ProgramaDocenteService} from "./servicios-especializados/programa-docente/programa-docente.service";
import {PaisService} from "./servicios-especializados/pais/pais.service";
import {MedioDifusionService} from "./servicios-especializados/medio-difusion/medio-difusion.service";
import {InteresadoService} from "./servicios-especializados/interesado/interesado.service";
import {UsuarioLdapService} from "./usuario/usuario-ldap.service";
import {UsuarioServices} from "./usuario/usuario.service";
import {TutorService} from "./entidades/tutor.service";
import {TemarioParticularService} from "./entidades/temario-particular.service";
import {SolicitudServicioSocialService} from "./entidades/solicitud-servicio-social.service";
import {SolicitudServicioService} from "./entidades/solicitud-servicio.service";
import {SolicitudNoAdeudoService} from "./entidades/solicitud-no-adeudo.service";
import {SolicitudExamenTrabajoService} from "./entidades/solicitud-examen-trabajo.service";
import {SolicitudConstanciaService} from "./entidades/solicitud-constancia.service";
import {ServicioSocialService} from "./entidades/servicio-social.service";
import {SeracionService} from "./entidades/seracion.service";
import {SalaService} from "./entidades/sala.service";
import {RolService} from "./entidades/rol.service";
import {RespuestasEvaluacionDocenteService} from "./entidades/respuestas-evaluacion-docente.service";
import {ReporteadorService} from "./entidades/reporteador.service";
import {ReporteBimestralService} from "./entidades/reporte-bimestral.service";
import {ReinscripcionEstudianteService} from "./entidades/reinscripcion-estudiante.service";
import {ReinscripcionService} from "./entidades/reinscripcion.service";
import {RegistroTituloService} from "./entidades/registro-titulo.service";
import {RecursoRevisionService} from "./entidades/recurso-revision.service";
import {RecomendanteAcademicoService} from "./entidades/recomendante-academico.service";
import {ReacreditacionProgramaDocenteService} from "./entidades/reacreditacion-programa-docente.service";
import {PuestosService} from "./entidades/puestos.service";
import {PublicacionService} from "./entidades/publicacion.service";
import {ProrrogaEstudianteService} from "./entidades/prorroga-estudiante.service";
import {UsuarioRolService} from "./usuario/usuario-rol.service";
import {VotoAprobatorioService} from "./entidades/voto-aprobatorio.service";
import {PreguntaFrecuenteService} from "./entidades/pregunta-frecuente.service";
import {PracticaProfesionalService} from "./entidades/practica-profesional.service";
import {PlantillaEditorService} from "./entidades/plantilla-editor.service";
import {PlantillaConstanciaService} from "./entidades/plantilla-constancia.service";
import {PlanEstudiosMateriaService} from "./entidades/plan-estudios-materia.service";
import {PlanEstudioIdiomaService} from "./entidades/plan-estudio-idioma.service";
import {PlanEstudioService} from "./entidades/plan-estudio.service";
import {PeriodoEscolarServices} from "./entidades/periodo-escolar.service";
import {PagoEstudianteService} from "./entidades/pago-estudiante.service";
import {NucleoAcademicoBasicoService} from "./entidades/nucleo-academico-basico.service";
import {NivelEstudioService} from "./entidades/nivel-estudio.service";
import {MovilidadInvestigacionService} from "./entidades/movilidad-investigacion.service";
import {MovilidadInterprogramaService} from "./entidades/movilidad-interprograma.service";
import {MovilidadExternaMateriaService} from "./entidades/movilidad-externa-materia.service";
import {MovilidadEstanciaService} from "./entidades/movilidad-estancia.service";
import {MovilidadCurricularService} from "./entidades/movilidad-curricular.service";
import {ModalidadCalificacionService} from "./entidades/modalidad-calificacion.service";
import {MiembroJuradoService} from "./entidades/miembro-jurado.service";
import {MatriculaService} from "./entidades/matricula.service";
import {MateriaInteresadoMovilidadExternaService} from "./entidades/materia-interesado-movilidad-externa.service";
import {MateriaImpartidaTemarioParticularService} from "./entidades/materia-impartida-temario-particular.service";
import {MateriaImpartidaService} from "./entidades/materia-impartida.service";
import {MateriaService} from "./entidades/materia.service";
import {AsistenciaInduccionService} from "./entidades/lista-asistencia-induccion.service";
import {LgacService} from "./entidades/lgac.service";
import {ProfesorService} from "./entidades/profesor.service";
import {ProfesorMateriaService} from "./entidades/profesor-materia.service";
import {ProfesorRevisionTrabajoService} from "./entidades/profesor-revision-trabajo.service";
import {PromocionServices} from "./entidades/promocion.service";
import {ProgramaDocenteServices} from "./entidades/programa-docente.service";
import {PromocionDocumentoService} from "./entidades/promocion-documento.service";
import {PromocionLgacService} from "./entidades/promocion-lgac.service";
import {PromocionPeriodoEscolarService} from "./entidades/promocion-periodo-escolar.service";
import {InvestigadorAnfitrionService} from "./entidades/investigador-anfitrion.service";
import {InteresadoMovilidadExternaService} from "./entidades/interesado-movilidad-externa.service";
import {InteresadoServices} from "./entidades/interesado.service";
import {IntegranteNucleoAcademicoService} from "./entidades/integrante-nucleo-academico.service";
import {IntegranteLgacService} from "./entidades/integrante-lgac.service";
import {InstitucionService} from "./entidades/institucion.service";
import {InformacionComplementariaMovilidadService} from "./entidades/informacion-complementaria-movilidad.service";
import {InformacionComplementariaService} from "./entidades/informacion-complementaria.service";
import {InduccionService} from "./entidades/induccion.service";
import {IdiomaService} from "./entidades/idioma.service";
import {HorariosMateriaService} from "./entidades/horarios-materia.service";
import {GrupoIdiomaService} from "./entidades/grupo-idioma.service";
import {GrupoService} from "./entidades/grupo.service";
import {GestionInstitucionalService} from "./entidades/gestion-institucional.service";
import {GestionDocumentosInstitucionalService} from "./entidades/gestion-documentos-institucional.service";
import {FolioSolicitudService} from "./entidades/folio-solicitud.service";
import {FolioService} from "./entidades/folio.service";
import {FirmaValidacionService} from "./entidades/firma-validacion.service";
import {FirmaSimpleService} from "./entidades/firma-simple.service";
import {ExperienciaProfesionalService} from "./entidades/experiencia-profesional.service";
import {ExpedienteService} from "./entidades/expediente.service";
import {ExamenGradoService} from "./entidades/examen-grado.service";
import {EvaluadorService} from "./entidades/evaluador.service";
import {EvaluacionDocenteAlumnoService} from "./entidades/evaluacion-docente-alumno.service";
import {EvaluacionDocenteService} from "./entidades/evaluacion-docente.service";
import {EvaluacionCurricularService} from "./entidades/evaluacion-curricular.service";
import {EvaluacionAspiranteService} from "./entidades/evaluacion-aspirante.service";
import {EstudianteListaAsistenciaService} from "./entidades/estudiantes-lista-asistencia.service";
import {EstudiantesActividadService} from "./entidades/estudiantes-actividad.service";
import {JuradoProfesorService} from "./entidades/jurado_profesor.service";
import {EstudianteTutorService} from "./entidades/estudiante-tutor.service";
import {EstudianteMovilidadExternaService} from "./entidades/estudiante-movilidad-externa.service";
import {EstudianteMateriaImpartidaService} from "./entidades/estudiante-materia-impartida.service";
import {EstudianteGrupoIdiomaService} from "./entidades/estudiante-grupo-idioma.service";
import {EstudianteDocumentoEntregadoService} from "./entidades/estudiante-documento-entregado.service";
import {EstudianteCalificacionIdiomaService} from "./entidades/estudiante-calificacion-idioma.service";
import {EstudianteCalificacionService} from "./entidades/estudiante-calificacion.service";
import {EstudianteBajaService} from "./entidades/estudiante-baja.service";
import {EstudianteService} from "./entidades/estudiante.service";
import {EnvioCorreoElectronicoService} from "./entidades/envio-correo-electronico.service";
import {DummyService} from "./entidades/dummy.service";
import {DocumentoServicioSocialService} from "./entidades/documento-servicio-social.service";
import {DocumentoProbatorioAcreditacionService} from "./entidades/documento-probatorio-acreditacion.service";
import {DocumentoMovilidadInterprogramaService} from "./entidades/documento-movilidad-interprograma.service";
import {DocumentoMovilidadExternaService} from "./entidades/documento-movilidad-externa.service";
import {DocumentoMovilidadCurricularService} from "./entidades/documento-movilidad-curricular.service";
import {DocumentoFirmaSimpleCartaNoAdeudoService} from "./entidades/documento-firma-simple-carta-no-adeudo.service";
import {DocumentoFirmaSimpleService} from "./entidades/documento-firma-simple.service";
import {DocumentoService} from "./entidades/documento.service";
import {DireccionMovilidadExternaService} from "./entidades/direccion-movilidad-externa.service";
import {DireccionService} from "./entidades/direccion.service";
import {DependienteEconomicoService} from "./entidades/dependiente-economico.service";
import {DatoPersonalService} from "./entidades/dato-personal.service";
import {DatoInformacionColsanService} from "./entidades/dato-informacion-colsan.service";
import {DatoAcademicoMovilidadExternaService} from "./entidades/dato-academico-movilidad-externa.service";
import {DatoAcademicoService} from "./entidades/dato-academico.service";
import {ConvocatoriaTiposDocumentoService} from "./entidades/convocatoria-tipos-documentot.service";
import {ConvocatoriaService} from "./entidades/convocatoria.service";
import {ConvenioService} from "./entidades/convenio-service";
import {ContactoEmergenciaService} from "./entidades/contacto-emergencia.service";
import {ComiteTutorialService} from "./entidades/comite-tutorial.service";
import {ComiteEvaluadorService} from "./entidades/comite-evaluador.service";
import {ClaveDgpService} from "./entidades/clave-dgp.service";
import {CartaNoAdeudoService} from "./entidades/carta-no-adeudo.service";
import {CalificacionMovilidadCurricularService} from "./entidades/calificacion-movilidad-curricular.service";
import {BoletaService} from "./entidades/boleta.service";
import {BitacoraService} from "./entidades/bitacora.service";
import {BecaService} from "./entidades/beca.service";
import {ArchivoService} from "./entidades/archivo.service";
import {ApoyoEconomicoService} from "./entidades/apoyo-economico.service";
import {ActividadEvaluacionContinuaService} from "./entidades/actividad-evaluacion-continua.service";
import {ActividadContinuaProfesorService} from "./entidades/actividad-continua-profesor.service";
import {ActividadContinuaEstudianteService} from "./entidades/actividad-continua-estudiante.service";
import {ActaCalificacionService} from "./entidades/acta-calificacion.service";
import {AcreditacionIdiomaLicenciaturaService} from "./entidades/acreditacion-idioma-licenciatura.service";
import {AcreditacionIdiomaService} from "./entidades/acreditacion-idioma.service";
import {TipoTrabajoService} from "./catalogos/tipo-trabajo.service";
import {TipoTiempoService} from "./catalogos/tipo-tiempo.service";
import {TipoTesisService} from "./catalogos/tipo-tesis.service";
import {TipoSolicitudService} from "./catalogos/tipo-solicitud.service";
import {TipoProfesorService} from "./catalogos/tipo-profesor.service";
import {TipoPagoService} from "./catalogos/tipo-pago.service";
import {TipoNoAdeudoService} from "./catalogos/tipo-no-adeudo.service";
import {TipoMovilidadService} from "./catalogos/tipo-movilidad.service";
import {TipoMateriaService} from "./catalogos/tipo-materia.service";
import {TipoListaAsistenciaService} from "./catalogos/tipo-lista-asistencia.service";
import {TipoJuradoService} from "./catalogos/tipo-jurado.service";
import {TipoFolioService} from "./catalogos/tipo-folio.service";
import {TipoExperienciaService} from "./catalogos/tipo-experiencia.service";
import {TipoDocumentoService} from "./catalogos/tipo-documento.service";
import {TipoDireccionService} from "./catalogos/tipo-direccion.service";
import {TipoConvenioService} from "./catalogos/tipo-convenio.service";
import {TipoConstanciaService} from "./catalogos/tipo-constancia.service";
import {TipoClasificacionProfesorService} from "./catalogos/tipo-clasificacion-profesor.service";
import {TipoCalificacionService} from "./catalogos/tipo-calificacion.service";
import {TipoAsignacionTutorService} from "./catalogos/tipo-asignacion-tutor.service";
import {TemaInduccionService} from "./catalogos/tema-induccion.service";
import {SubtemaInduccionService} from "./catalogos/subtema-induccion.service";
import {SniService} from "./catalogos/sni.service";
import {SexoService} from "./catalogos/sexo.service";
import {SectorService} from "./catalogos/sector.service";
import {RespuestaEvaluacionDocenteService} from "./catalogos/respuesta-evaluacion-docente.service";
import {PuestoService} from "./catalogos/puesto.service";
import {PreguntaEvaluacionDocenteService} from "./catalogos/pregunta-evaluacion-docente.service";
import {ParentescoService} from "./catalogos/parentesco.service";
import {PaisesService} from "./catalogos/pais.service";
import {CursoNivelIdiomaService} from "./catalogos/nivel-idioma-curso.service";
import {NivelIdiomaService} from "./catalogos/nivel-idioma.service";
import {NacionalidadService} from "./catalogos/nacionalidad.service";
import {MunicipioService} from "./catalogos/municipio.service";
import {MedioDifusionServices} from "./catalogos/medios-difusion.service";
import {GradoAcademicoService} from "./catalogos/grado-academico.service";
import {FuenteApoyoService} from "./catalogos/fuente-apoyo.service";
import {FormaPagoService} from "./catalogos/forma-pago.service";
import {EstatusCatalogoService} from "./catalogos/estatus-catalogo.service";
import {EstadoCivilService} from "./catalogos/estado-civil.service";
import {EntidadFederativaService} from "./catalogos/entidad-federativa.service";
import {DiscapacidadService} from "./catalogos/discapacidad.service";
import {DictamenService} from "./catalogos/dictamen.service";
import {DecisionEvaluacionService} from "./catalogos/decision-evaluacion.service";
import {ClasificacionProfesorService} from "./catalogos/clasificacion-profesor.service";
import {ClasificacionPreguntasFrecuentesService} from "./catalogos/clasificacion-preguntas-frecuentes.service";
import {ClasificacionEspecificaProfesorService} from "./catalogos/clasificacion-especifica-profesor.service";
import {CatalogosServices} from "./catalogos/catalogos.service";
import {CatalogoService} from "./catalogos/catalogo.service";
import {AreaDocumentoService} from "./catalogos/area-documento.service";
import {AlcanceConvenioService} from "./catalogos/alcance-convenio.service";
import {GlobalServices} from "./entidades/global.service";
@NgModule({
  providers:[
    SpinnerService,
    ConfigService,
    GlobalService,
    PaisService,
    MedioDifusionService,
    ProgramaDocenteService,
    PromocionService,
    PeriodoEscolarService,
    InteresadoService,
    GlobalServices,
    AlcanceConvenioService,
    AreaDocumentoService,
    CatalogoService,
    CatalogosServices,
    ClasificacionEspecificaProfesorService,
    ClasificacionPreguntasFrecuentesService,
    ClasificacionProfesorService,
    DecisionEvaluacionService,
    DictamenService,
    DiscapacidadService,
    EntidadFederativaService,
    EstadoCivilService,
    EstatusCatalogoService,
    FormaPagoService,
    FuenteApoyoService,
    GradoAcademicoService,
    MedioDifusionServices,
    MunicipioService,
    NacionalidadService,
    NivelIdiomaService,
    CursoNivelIdiomaService,
    PaisesService,
    ParentescoService,
    PreguntaEvaluacionDocenteService,
    PuestoService,
    RespuestaEvaluacionDocenteService,
    SectorService,
    SexoService,
    SniService,
    SubtemaInduccionService,
    TemaInduccionService,
    TipoAsignacionTutorService,
    TipoCalificacionService,
    TipoClasificacionProfesorService,
    TipoConstanciaService,
    TipoConvenioService,
    TipoDireccionService,
    TipoDocumentoService,
    TipoExperienciaService,
    TipoFolioService,
    TipoJuradoService,
    TipoListaAsistenciaService,
    TipoMateriaService,
    TipoMovilidadService,
    TipoNoAdeudoService,
    TipoPagoService,
    TipoProfesorService,
    TipoSolicitudService,
    TipoTesisService,
    TipoTiempoService,
    TipoTrabajoService,
    AcreditacionIdiomaService,
    AcreditacionIdiomaLicenciaturaService,
    ActaCalificacionService,
    ActividadContinuaEstudianteService,
    ActividadContinuaProfesorService,
    ActividadEvaluacionContinuaService,
    ApoyoEconomicoService,
    ArchivoService,
    BecaService,
    BitacoraService,
    BoletaService,
    CalificacionMovilidadCurricularService,
    CartaNoAdeudoService,
    ClaveDgpService,
    ComiteEvaluadorService,
    ComiteTutorialService,
    ContactoEmergenciaService,
    ConvenioService,
    ConvocatoriaService,
    ConvocatoriaTiposDocumentoService,
    DatoAcademicoService,
    DatoAcademicoMovilidadExternaService,
    DatoInformacionColsanService,
    DatoPersonalService,
    DependienteEconomicoService,
    DireccionService,
    DireccionMovilidadExternaService,
    DocumentoService,
    DocumentoFirmaSimpleService,
    DocumentoFirmaSimpleCartaNoAdeudoService,
    DocumentoMovilidadCurricularService,
    DocumentoMovilidadExternaService,
    DocumentoMovilidadInterprogramaService,
    DocumentoProbatorioAcreditacionService,
    DocumentoServicioSocialService,
    DummyService,
    EnvioCorreoElectronicoService,
    EstudianteService,
    EstudianteBajaService,
    EstudianteCalificacionService,
    EstudianteCalificacionIdiomaService,
    EstudianteDocumentoEntregadoService,
    EstudianteGrupoIdiomaService,
    EstudianteMateriaImpartidaService,
    EstudianteMovilidadExternaService,
    EstudianteTutorService,
    EstudiantesActividadService,
    EstudianteListaAsistenciaService,
    EvaluacionAspiranteService,
    EvaluacionCurricularService,
    EvaluacionDocenteService,
    EvaluacionDocenteAlumnoService,
    EvaluadorService,
    ExamenGradoService,
    ExpedienteService,
    ExperienciaProfesionalService,
    FirmaSimpleService,
    FirmaValidacionService,
    FolioService,
    FolioSolicitudService,
    GestionDocumentosInstitucionalService,
    GestionInstitucionalService,
    GrupoService,
    GrupoIdiomaService,
    HorariosMateriaService,
    IdiomaService,
    InduccionService,
    InformacionComplementariaService,
    InformacionComplementariaMovilidadService,
    InstitucionService,
    IntegranteLgacService,
    IntegranteNucleoAcademicoService,
    InteresadoServices,
    InteresadoMovilidadExternaService,
    InvestigadorAnfitrionService,
    JuradoProfesorService,
    LgacService,
    AsistenciaInduccionService,
    MateriaService,
    MateriaImpartidaService,
    MateriaImpartidaTemarioParticularService,
    MateriaInteresadoMovilidadExternaService,
    MatriculaService,
    MiembroJuradoService,
    ModalidadCalificacionService,
    MovilidadCurricularService,
    MovilidadEstanciaService,
    MovilidadExternaMateriaService,
    MovilidadInterprogramaService,
    MovilidadInvestigacionService,
    NivelEstudioService,
    NucleoAcademicoBasicoService,
    PagoEstudianteService,
    PeriodoEscolarServices,
    PlanEstudioService,
    PlanEstudioIdiomaService,
    PlanEstudiosMateriaService,
    PlantillaConstanciaService,
    PlantillaEditorService,
    PracticaProfesionalService,
    PreguntaFrecuenteService,
    ProfesorService,
    ProfesorMateriaService,
    ProfesorRevisionTrabajoService,
    PromocionServices,
    ProgramaDocenteServices,
    PromocionDocumentoService,
    PromocionLgacService,
    PromocionPeriodoEscolarService,
    ProrrogaEstudianteService,
    PublicacionService,
    PuestosService,
    ReacreditacionProgramaDocenteService,
    RecomendanteAcademicoService,
    RecursoRevisionService,
    RegistroTituloService,
    ReinscripcionService,
    ReinscripcionEstudianteService,
    ReporteBimestralService,
    ReporteadorService,
    RespuestasEvaluacionDocenteService,
    RolService,
    SalaService,
    SeracionService,
    ServicioSocialService,
    SolicitudConstanciaService,
    SolicitudExamenTrabajoService,
    SolicitudNoAdeudoService,
    SolicitudServicioService,
    SolicitudServicioSocialService,
    TemarioParticularService,
    TutorService,
    UsuarioServices,
    UsuarioLdapService,
    UsuarioRolService,
    VotoAprobatorioService
  ]

})
export class ServiciosModule { }
