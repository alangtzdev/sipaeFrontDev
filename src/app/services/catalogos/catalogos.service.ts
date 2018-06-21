import { PassWordResetService } from './../entidades/passwordReset.service';
import {EstatusCatalogoService} from './estatus-catalogo.service';
import {PreguntaEvaluacionDocenteService} from './pregunta-evaluacion-docente.service';
import {RespuestaEvaluacionDocenteService} from './respuesta-evaluacion-docente.service';
import {SniService} from './sni.service';
import {SectorService} from './sector.service';
import {SubtemaInduccionService} from './subtema-induccion.service';
import {TipoClasificacionProfesorService} from './tipo-clasificacion-profesor.service';
import {TemaInduccionService} from './tema-induccion.service';
import {TipoCalificacionService} from './tipo-calificacion.service';
import {TipoConstanciaService} from './tipo-constancia.service';
import {PromocionServices} from '../entidades/promocion.service';
import {ProgramaDocenteServices} from '../entidades/programa-docente.service';
import {EstudianteService} from '../entidades/estudiante.service';
import {
    EstudianteDocumentoEntregadoService
} from '../entidades/estudiante-documento-entregado.service';
import {
    EstudianteMovilidadExternaService
} from '../entidades/estudiante-movilidad-externa.service';
import {CatalogoService} from './catalogo.service';
import {SexoService} from './sexo.service';
import {EstadoCivilService} from './estado-civil.service';
import {TipoPagoService} from './tipo-pago.service';
import {PaisesService} from './pais.service';
import {MunicipioService} from './municipio.service';
import {EntidadFederativaService} from './entidad-federativa.service';
import {TipoDireccionService} from './tipo-direccion.service';
import {MedioDifusionServices} from './medios-difusion.service';
import {InteresadoServices} from '../entidades/interesado.service';
import {
    ClasificacionPreguntasFrecuentesService
} from './clasificacion-preguntas-frecuentes.service';
import {NivelEstudioService} from '../entidades/nivel-estudio.service';
import {ParentescoService} from './parentesco.service';
import {DireccionService} from '../entidades/direccion.service';
import {PreguntaFrecuenteService}
    from '../entidades/pregunta-frecuente.service';
import {EvaluadorService} from '../entidades/evaluador.service';
import {DatoPersonalService} from '../entidades/dato-personal.service';
import {AlcanceConvenioService} from './alcance-convenio.service';
import {ClasificacionBecaService} from './clasificacion-beca.service';
import {FormaPagoService} from './forma-pago.service';
import {DiscapacidadService} from './discapacidad.service';
import {GradoAcademicoService} from './grado-academico.service';
import {NacionalidadService} from './nacionalidad.service';
import {TipoDocumentoService} from './tipo-documento.service';
import {ProrrogaEstudianteService} from '../entidades/prorroga-estudiante.service';
import {SalaService} from '../entidades/sala.service';
import {ApoyoEconomicoService} from '../entidades/apoyo-economico.service';
import {PagoEstudianteService
} from '../entidades/pago-estudiante.service';
import {TipoConvenioService} from './tipo-convenio.service';
import {TipoExperienciaService} from './tipo-experiencia.service';
import {TipoListaAsistenciaService} from './tipo-lista-asistencia.service';
import {TipoMateriaService} from './tipo-materia.service';
import {TipoNoAdeudoService} from './tipo-no-adeudo.service';
import {TipoProfesorService} from './tipo-profesor.service';
import {TipoSolicitudService} from './tipo-solicitud.service';
import {TipoTesisService} from './tipo-tesis.service';
import {TipoTiempoService} from './tipo-tiempo.service';
import {TipoTrabajoService} from './tipo-trabajo.service';
import {LgacService} from '../entidades/lgac.service';
import {DecisionEvaluacionService} from './decision-evaluacion.service';
import {DependienteEconomicoService} from '../entidades/dependiente-economico.service';
import {ContactoEmergenciaService} from '../entidades/contacto-emergencia.service';
import {IdiomaEstudianteService} from '../entidades/idioma-estudiante.service';
import {PlanEstudioService} from '../entidades/plan-estudio.service';
import {
    InformacionComplementariaService
} from '../entidades/informacion-complementaria.service';
import {DatoAcademicoService} from '../entidades/dato-academico.service';
import {RegistroTituloService} from '../entidades/registro-titulo.service';
import {InteresadoMovilidadExternaService}
    from '../entidades/interesado-movilidad-externa.service';
import {ModalidadCalificacionService} from '../entidades/modalidad-calificacion.service';
import {BecaService} from '../entidades/beca.service';
import {FolioSolicitudService} from '../entidades/folio-solicitud.service';
import {EvaluacionAspiranteService} from '../entidades/evaluacion-aspirante.service';
import {
    ExperienciaProfesionalService
} from '../entidades/experiencia-profesional.service';
import {PublicacionService} from '../entidades/publicacion.service';
import {DocumentoService} from '../entidades/documento.service';
import {IdiomaService} from '../entidades/idioma.service';
import {PeriodoEscolarServices} from '../entidades/periodo-escolar.service';
import {MateriaService} from '../entidades/materia.service';
import {ArchivoService} from '../entidades/archivo.service';
import {SolicitudNoAdeudoService} from '../entidades/solicitud-no-adeudo.service';
import {InduccionService} from '../entidades/induccion.service';
import {ConvenioService} from '../entidades/convenio-service';
import {InstitucionService} from '../entidades/institucion.service';
import {ProfesorService} from '../entidades/profesor.service';
import {ConvocatoriaService} from '../entidades/convocatoria.service';
import {NucleoAcademicoBasicoService}
    from '../entidades/nucleo-academico-basico.service';
import {
    ReacreditacionProgramaDocenteService
} from '../entidades/reacreditacion-programa-docente.service';
import {NivelIdiomaService} from './nivel-idioma.service';
import {CartaNoAdeudoService} from '../entidades/carta-no-adeudo.service';
import {
    MovilidadInterprogramaService
} from '../entidades/movilidad-interprograma.service';
import {MovilidadExternaMateriaService
} from '../entidades/movilidad-externa-materia.service';
import {
    ConvocatoriaTiposDocumentoService
} from '../entidades/convocatoria-tipos-documentot.service';
import {MatriculaService} from '../entidades/matricula.service';
import {IntegranteLgacService} from '../entidades/integrante-lgac.service';
import {AspiranteLgacService} from '../entidades/aspirante-lgac.service';
import {DictamenService} from './dictamen.service';
import {
    DireccionMovilidadExternaService
} from '../entidades/direccion-movilidad-externa.service';
import {IntegranteNucleoAcademicoService
} from '../entidades/integrante-nucleo-academico.service';
import {DatoAcademicoMovilidadExternaService}
    from '../entidades/dato-academico-movilidad-externa.service';
import {PlanEstudioIdiomaService}
    from '../entidades/plan-estudio-idioma.service';
import {TutorService} from '../entidades/tutor.service';
import {ComiteEvaluadorService} from '../entidades/comite-evaluador.service';
import {PlanEstudiosMateriaService
} from '../entidades/plan-estudios-materia.service';
import {GrupoService} from '../entidades/grupo.service';
import {
    InvestigadorAnfitrionService
} from '../entidades/investigador-anfitrion.service';
import {ClasificacionProfesorService} from './clasificacion-profesor.service';
import {
    ClasificacionEspecificaProfesorService
} from './clasificacion-especifica-profesor.service';
import {PromocionDocumentoService}
    from '../entidades/promocion-documento.service';
import {PromocionLgacService} from '../entidades/promocion-lgac.service';
import {ExamenGradoService} from '../entidades/examen-grado.service';
import {
    DocumentoMovilidadExternaService
} from '../entidades/documento-movilidad-externa.service';
import {
    EstudianteCalificacionService
} from '../entidades/estudiante-calificacion.service';
import {
    EstudianteMateriaImpartidaService
} from '../entidades/estudiante-materia-impartida.service';
import { MiembroJuradoService } from '../entidades/miembro-jurado.service';
import { ComiteTutorialService } from '../entidades/comite-tutorial.service';
import {UsuarioServices} from '../usuario/usuario.service';
import {UsuarioRolService} from '../usuario/usuario-rol.service';
import {SolicitudConstanciaService} from '../entidades/solicitud-constancia.service';
import {MateriaImpartidaService} from '../entidades/materia-impartida.service';
import {ProfesorMateriaService} from '../entidades/profesor-materia.service';
import {MovilidadCurricularService} from '../entidades/movilidad-curricular.service';
import {PuestoService} from './puesto.service';
import {PuestosService} from '../entidades/puestos.service';
import {
    DatoInformacionColsanService
} from '../entidades/dato-informacion-colsan.service';
import {ClaveDgpService} from '../entidades/clave-dgp.service';
import {TipoMovilidadService} from './tipo-movilidad.service';
import {
    DocumentoMovilidadCurricularService
} from '../entidades/documento-movilidad-curricular.service';
import {
    ActividadContinuaProfesorService
} from '../entidades/actividad-continua-profesor.service';
import {
    ActividadContinuaEstudianteService
} from '../entidades/actividad-continua-estudiante.service';

import {
    HorariosMateriaService
} from '../entidades/horarios-materia.service';
import{
    ReinscripcionService
} from '../entidades/reinscripcion.service';
import {
    ReinscripcionEstudianteService
} from '../entidades/reinscripcion-estudiante.service';
import {AreaDocumentoService} from './area-documento.service';
import {EnvioCorreoElectronicoService} from
  '../entidades/envio-correo-electronico.service';
import {ActividadEvaluacionContinuaService} from
  '../entidades/actividad-evaluacion-continua.service';
import {RecursoRevisionService} from '../entidades/recurso-revision.service';
import {SolicitudExamenTrabajoService}
    from '../entidades/solicitud-examen-trabajo.service';
import {ProfesorRevisionTrabajoService}
    from '../entidades/profesor-revision-trabajo.service';
import {GrupoIdiomaService} from '../entidades/grupo-idioma.service';
import {EstudianteGrupoIdiomaService} from
  '../entidades/estudiante-grupo-idioma.service';
import {PromocionPeriodoEscolarService} from
  '../entidades/promocion-periodo-escolar.service';
import {EvaluacionDocenteAlumnoService} from
  '../entidades/evaluacion-docente-alumno.service';
import {ReacreditacionService} from './reacreditacion.service';
import {BoletaService} from '../entidades/boleta.service';
import {InformacionComplementariaMovilidadService}
    from '../entidades/informacion-complementaria-movilidad.service';
import {FuenteApoyoService} from './fuente-apoyo.service';
import {TemarioParticularService} from '../entidades/temario-particular.service';
import {EstudianteListaAsistenciaService} from
  '../entidades/estudiantes-lista-asistencia.service';
import {AcreditacionIdiomaService} from '../entidades/acreditacion-idioma.service';
import {PlantillaEditorService} from '../entidades/plantilla-editor.service';
import {EstudianteBajaService} from '../entidades/estudiante-baja.service';
import {DocumentoProbatorioAcreditacionService} from
  '../entidades/documento-probatorio-acreditacion.service';
import {EstudianteTutorService} from '../entidades/estudiante-tutor.service';
import {VotoAprobatorioService} from '../entidades/voto-aprobatorio.service';
import {EvaluacionCurricularService} from '../entidades/evaluacion-curricular.service';
import {RolService} from '../entidades/rol.service';
import {UsuarioLdapService} from '../usuario/usuario-ldap.service';
import {EvaluacionDocenteService} from '../entidades/evaluacion-docente.service';
import {BitacoraService} from '../entidades/bitacora.service';
import {ExpedienteService} from '../entidades/expediente.service';
import {
    DocumentoMovilidadInterprogramaService
} from '../entidades/documento-movilidad-interprograma.service';
import {SolicitudServicioSocialService}
    from '../entidades/solicitud-servicio-social.service';
import {ServicioSocialService}
    from '../entidades/servicio-social.service';
import {DocumentoServicioSocialService}
    from '../entidades/documento-servicio-social.service';
import {ReporteBimestralService} from '../entidades/reporte-bimestral.service';
import {ReporteadorService} from '../entidades/reporteador.service';
import {CursoNivelIdiomaService} from './nivel-idioma-curso.service';
import {TipoFolioService} from './tipo-folio.service';
import {FolioService} from '../entidades/folio.service';
import {ActaCalificacionService} from '../entidades/acta-calificacion.service';
import {FirmaSimpleService} from '../entidades/firma-simple.service';
import {DocumentoFirmaSimpleService} from '../entidades/documento-firma-simple.service';
import {DocumentoFirmaSimpleCartaNoAdeudoService
} from '../entidades/documento-firma-simple-carta-no-adeudo.service';
import {MateriaImpartidaTemarioParticularService
} from '../entidades/materia-impartida-temario-particular.service';
import {FirmaValidacionService
} from "../entidades/firma-validacion.service";
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {EvaluacionDocenteIdiomasAlumnoService} from "../entidades/evaluacion-docente-idiomas-alumno.service";
import {EvaluacionDocenteIdiomasService} from "../entidades/evaluacion-docente-idiomas.service";
import {RespuestasEvaluacionDocenteIdiomasService} from '../entidades/respuestas-evaluacion-docente-idiomas.service';


@Injectable()
export class CatalogosServices {
    constructor(private http: Http) {
    }
    getEstatusCatalogo(): EstatusCatalogoService {
        return EstatusCatalogoService.getInstance(this.http);
    }

    getCatalogo(): CatalogoService {
        return CatalogoService.getInstance(this.http);
    }
    getPreguntaEvaluacionDocente(): PreguntaEvaluacionDocenteService {
        return PreguntaEvaluacionDocenteService.getInstance(this.http);
    }
    getRespuestaEvaluacionDocente(): RespuestaEvaluacionDocenteService {
        return RespuestaEvaluacionDocenteService.getInstance(this.http);
    }
    getSexo(): SexoService {
        return SexoService.getInstance(this.http);
    }
    getSector(): SectorService {
        return SectorService.getInstance(this.http);
    }
    getSni(): SniService {
        return SniService.getInstance(this.http);
    }
    getSubtemaInduccion(): SubtemaInduccionService {
        return SubtemaInduccionService.getInstance(this.http);
    }
    getTipoClasificacionProfesor(): TipoClasificacionProfesorService {
        return TipoClasificacionProfesorService.getInstance(this.http);
    }
    getTipoConstancia(): TipoConstanciaService {
        return TipoConstanciaService.getInstance(this.http);
    }
    getTemaInduccion(): TemaInduccionService {
        return TemaInduccionService.getInstance(this.http);
    }
    getTipoCalificacion(): TipoCalificacionService {
        return TipoCalificacionService.getInstance(this.http);
    }
    getEstadoCivil(): EstadoCivilService {
        return EstadoCivilService.getInstance(this.http);
    }
    getCatalogoProgramaDocente(): ProgramaDocenteServices {
        return ProgramaDocenteServices.getInstance(this.http);
    }

    getCatTipoPago(): TipoPagoService {
        return TipoPagoService.getInstance(this.http);
    }

    getPais(): PaisesService {
        return PaisesService.getInstance(this.http);
    }

    getMunicipio(): MunicipioService {
        return MunicipioService.getInstance(this.http);
    }

    getEntidadFederativa(): EntidadFederativaService {
        return EntidadFederativaService.getInstance(this.http);
    }

    getTipoDireccion(): TipoDireccionService {
        return TipoDireccionService.getInstance(this.http);
    }

    getClasificacionPreguntasFrecuentes(): ClasificacionPreguntasFrecuentesService {
        return ClasificacionPreguntasFrecuentesService.getInstance(this.http);
    }

    getCatalogoNivelEstudios(): NivelEstudioService {
        return NivelEstudioService.getInstance(this.http);
    }

    getPromocion(): PromocionServices {
        return PromocionServices.getInstance(this.http);
    }

    getMedioDifusion(): MedioDifusionServices {
        return MedioDifusionServices.getInstance(this.http);
    }

    getParentesco(): ParentescoService {
        return ParentescoService.getInstance(this.http);
    }

    getDireccion(): DireccionService {
        return DireccionService.getInstance(this.http);
    }
    getPreguntasFrecuentes(): PreguntaFrecuenteService {
        return PreguntaFrecuenteService.getInstance(this.http);

    }

    getEstudianteService(): EstudianteService {
        return EstudianteService.getInstance(this.http);
    }

    getEvaluacionAspirante(): EvaluacionAspiranteService {
        return EvaluacionAspiranteService.getInstance(this.http);
    }

    getEvaluador(): EvaluadorService {
        return EvaluadorService.getInstance(this.http);
    }

    getDatoPersonal(): DatoPersonalService {
        return DatoPersonalService.getInstance(this.http);
    }

    getEstudiante(): EstudianteService {
        return EstudianteService.getInstance(this.http);
    }

    getEstudianteMovilidadExterna(): EstudianteMovilidadExternaService {
        return EstudianteMovilidadExternaService.getInstance(this.http);
    }
    getApoyoEconomico(): ApoyoEconomicoService {
        return ApoyoEconomicoService.getInstance(this.http);
    }

    getPromociones(): PromocionServices {
        return PromocionServices.getInstance(this.http);
    }

    getAlcanceConvenio(): AlcanceConvenioService {
        return AlcanceConvenioService.getInstance(this.http);

    }

    getClasificacionBeca(): ClasificacionBecaService {
        return ClasificacionBecaService.getInstance(this.http);

    }

    getFormaPago(): FormaPagoService {
        return FormaPagoService.getInstance(this.http);

    }

    getDiscapacidad(): DiscapacidadService {
        return DiscapacidadService.getInstance(this.http);

    }

    getGradoAcademico(): GradoAcademicoService {
        return GradoAcademicoService.getInstance(this.http);
    }

    getPagoEstudiante(): PagoEstudianteService {
        return PagoEstudianteService.getInstance(this.http);
    }

    getTipoDocumento(): TipoDocumentoService {
        return TipoDocumentoService.getInstance(this.http);
    }

    getProrrogaEstudiante(): ProrrogaEstudianteService {
        return ProrrogaEstudianteService.getInstance(this.http);
    }

    getTipoConvenio(): TipoConvenioService {
        return TipoConvenioService.getInstance(this.http);
    }

    getTipoExperiencia(): TipoExperienciaService {
        return TipoExperienciaService.getInstance(this.http);
    }

    getExperienciaPrforesional(): ExperienciaProfesionalService {
        return ExperienciaProfesionalService.getInstance(this.http);
    }

    getTipoListaAsistencia(): TipoListaAsistenciaService {
        return TipoListaAsistenciaService.getInstance(this.http);
    }

    getTipoMateria(): TipoMateriaService {
        return TipoMateriaService.getInstance(this.http);
    }

    getTipoNoAdeudo(): TipoNoAdeudoService {
        return TipoNoAdeudoService.getInstance(this.http);
    }

    getTipoPago(): TipoPagoService {
        return TipoPagoService.getInstance(this.http);
    }

    getTipoProfesor(): TipoProfesorService {
        return TipoProfesorService.getInstance(this.http);
    }

    getTipoSolicitud(): TipoSolicitudService {
        return TipoSolicitudService.getInstance(this.http);
    }

    getTipoTesis(): TipoTesisService {
        return TipoTesisService.getInstance(this.http);
    }

    getTipoTiempo(): TipoTiempoService {
        return TipoTiempoService.getInstance(this.http);
    }

    getTipoTrabajo(): TipoTrabajoService {
        return TipoTrabajoService.getInstance(this.http);
    }

    getDecisionEvaluacion(): DecisionEvaluacionService {
        return DecisionEvaluacionService.getInstance(this.http);
    }

    getDependienteEconomico(): DependienteEconomicoService {
        return DependienteEconomicoService.getInstance(this.http);
    }

    getContactoEmergencia(): ContactoEmergenciaService {
        return ContactoEmergenciaService.getInstance(this.http);
    }

    getIdiomaEstudiante(): IdiomaEstudianteService {
        return IdiomaEstudianteService.getInstance(this.http);
    }

    getSalas(): SalaService {
        return SalaService.getInstance(this.http);
    }

    getInteresados(): InteresadoServices {
        return InteresadoServices.getInstance(this.http);
    }
    getPlanEstudios(): PlanEstudioService {
        return PlanEstudioService.getInstance(this.http);
    }
    getlgac(): LgacService {
        return LgacService.getInstance(this.http);
    }

    getInformacionComplementaria(): InformacionComplementariaService {
        return InformacionComplementariaService.getInstance(this.http);
    }

    getDatoAcademico(): DatoAcademicoService {
        return DatoAcademicoService.getInstance(this.http);
    }

    getInteresadoMovilidadExterna(): InteresadoMovilidadExternaService {
        return InteresadoMovilidadExternaService.getInstance(this.http);
    }

    getModalidadCalificacionService(): ModalidadCalificacionService {
        return ModalidadCalificacionService.getInstance(this.http);
    }

    getCatalogoBecas(): BecaService {
        return BecaService.getInstance(this.http);
    }

    getRegistroTitulo(): RegistroTituloService {
        return RegistroTituloService.getInstance(this.http);
    }

    getFolioSolicitud(): FolioSolicitudService {
        return FolioSolicitudService.getInstance(this.http);
    }

    getPublicaciones(): PublicacionService {
        return PublicacionService.getInstance(this.http);
    }

    getDocumentos(): DocumentoService {
        return DocumentoService.getInstance(this.http);
    }

    getIdioma(): IdiomaService {
        return IdiomaService.getInstance(this.http);
    }

    getPeriodoEscolar(): PeriodoEscolarServices {
        return PeriodoEscolarServices.getInstance(this.http);
    }

    getMateria(): MateriaService {
        return MateriaService.getInstance(this.http);
    }

    getArchivos(): ArchivoService {
        return ArchivoService.getInstance(this.http);
    }

    getSolicitudNoAdeudo(): SolicitudNoAdeudoService {
        return SolicitudNoAdeudoService.getInstance(this.http);
    }

    getInduccion(): InduccionService {
        return InduccionService.getInstance(this.http);
    }

    getConvenio(): ConvenioService {
        return ConvenioService.getInstance(this.http);
    }

    getProfesor(): ProfesorService {
        return ProfesorService.getInstance(this.http);
    }
    getInstitucion(): InstitucionService {
        return InstitucionService.getInstance(this.http);
    }

    getConvocatoria(): ConvocatoriaService {
        return ConvocatoriaService.getInstance(this.http);
    }

    getNucleoAcadBasico(): NucleoAcademicoBasicoService {
        return NucleoAcademicoBasicoService.getInstance(this.http);
    }

    getReacreditacionProgramaDocente(): ReacreditacionProgramaDocenteService {
        return ReacreditacionProgramaDocenteService.getInstance(this.http);
    }

    getNivelIdioma(): NivelIdiomaService {
        return NivelIdiomaService.getInstance(this.http);
    }

    getCartaNoAdeudo(): CartaNoAdeudoService {
        return CartaNoAdeudoService.getInstance(this.http);
    }

    getMovilidadInterprograma(): MovilidadInterprogramaService {
        return MovilidadInterprogramaService.getInstance(this.http);
    }

    getMateriasMovilidad(): MovilidadExternaMateriaService {
        return MovilidadExternaMateriaService.getInstance(this.http);
    }

    getDocumentoConvocatoria(): ConvocatoriaTiposDocumentoService {
        return ConvocatoriaTiposDocumentoService.getInstance(this.http);
    }
    getEstudianteDocumentoEntregadoService(): EstudianteDocumentoEntregadoService {
        return EstudianteDocumentoEntregadoService.getInstance(this.http);
    }

    getMatriculas(): MatriculaService {
        return MatriculaService.getInstance(this.http);
    }

    getIntegrantesLgacService(): IntegranteLgacService {
        return IntegranteLgacService.getInstance(this.http);
    }

    getAspiranteLgacService(): AspiranteLgacService {
        return AspiranteLgacService.getInstance(this.http);
    }

    getCatDictamen(): DictamenService {
        return DictamenService.getInstance(this.http);
    }

    getDireccionMovilidadExterna(): DireccionMovilidadExternaService {
        return DireccionMovilidadExternaService.getInstance(this.http);
    }

    getIntegrantesNAB(): IntegranteNucleoAcademicoService {
        return IntegranteNucleoAcademicoService.getInstance(this.http);
    }

    getDatoAcademicoMovilidadExterna (): DatoAcademicoMovilidadExternaService {
        return DatoAcademicoMovilidadExternaService.getInstance(this.http);
    }

    getPlanEstudioIdiomaService (): PlanEstudioIdiomaService {
        return PlanEstudioIdiomaService.getInstance(this.http);
    }

    getTutor(): TutorService {
        return TutorService.getInstance(this.http);
    }

    getComiteEvaluadorService(): ComiteEvaluadorService {
        return ComiteEvaluadorService.getInstance(this.http);
    }

    getPlanEstudiosMateria(): PlanEstudiosMateriaService {
        return PlanEstudiosMateriaService.getInstance(this.http);
    }

    getGrupoService(): GrupoService {
        return GrupoService.getInstance(this.http);
    }

    getInvestigadorAnfitrionService (): InvestigadorAnfitrionService {
        return InvestigadorAnfitrionService.getInstance(this.http);
    }

    getClasificacionEspecificaProfesor(): ClasificacionEspecificaProfesorService {
        return ClasificacionEspecificaProfesorService.getInstance(this.http);
    }
    getPromocionDocumento(): PromocionDocumentoService {
        return PromocionDocumentoService.getInstance(this.http);
    }

    getPromocionLgac(): PromocionLgacService {
        return PromocionLgacService.getInstance(this.http);
    }

    getExamenGrado(): ExamenGradoService {
        return ExamenGradoService.getInstance(this.http);
    }

    getClasificacionProfesor(): ClasificacionProfesorService {
        return ClasificacionProfesorService.getInstance(this.http);
    }

    getDocumentoMovilidadExterna(): DocumentoMovilidadExternaService {
        return DocumentoMovilidadExternaService.getInstance(this.http);
    }

    getEstudianteCalificacionService(): EstudianteCalificacionService {
        return EstudianteCalificacionService.getInstance(this.http);
    }

    getEstudianteMateriaImpartidaService(): EstudianteMateriaImpartidaService {
        return EstudianteMateriaImpartidaService.getInstance(this.http);
    }

    getMiebroJuradoService(): MiembroJuradoService {
        return MiembroJuradoService.getInstance(this.http);
    }

    getComiteTutorialService(): ComiteTutorialService {
        return ComiteTutorialService.getInstance(this.http);
    }

    getUsuarioService(): UsuarioServices {
        return UsuarioServices.getInstance(this.http);
    }

    getUsuarioRolService(): UsuarioRolService {
        return UsuarioRolService.getInstance(this.http);
    }

    getMateriaImpartidaService(): MateriaImpartidaService {
        return MateriaImpartidaService.getInstance(this.http);
    }

    getSolicitudConstancia(): SolicitudConstanciaService {
        return SolicitudConstanciaService.getInstance(this.http);
    }
    getProfesorMateriaService(): ProfesorMateriaService {
        return ProfesorMateriaService.getInstance(this.http);
    }

    getMovilidadCurricularService(): MovilidadCurricularService {
        return MovilidadCurricularService.getInstance(this.http);
    }
    getPuestoService(): PuestoService {
        return PuestoService.getInstance(this.http);
    }
    getPuestosService(): PuestosService {
        return PuestosService.getInstance(this.http);
    }
    getDatoInformacionColsanService(): DatoInformacionColsanService {
        return DatoInformacionColsanService.getInstance(this.http);
    }
    getClaveDgpService(): ClaveDgpService {
        return ClaveDgpService.getInstance(this.http);
    }
    getReinscripcionService(): ReinscripcionService {
        return ReinscripcionService.getInstance(this.http);
    }
    getReinscripcionEstudianteService(): ReinscripcionEstudianteService {
        return ReinscripcionEstudianteService.getInstance(this.http);
    }

    getTipoMovilidadService(): TipoMovilidadService {
        return TipoMovilidadService.getInstance(this.http);
    }

    getDocumentoMovilidadCurricularService(): DocumentoMovilidadCurricularService {
        return DocumentoMovilidadCurricularService.getInstance(this.http);
    }
    getActividadContinuaProfesorService(): ActividadContinuaProfesorService {
        return ActividadContinuaProfesorService.getInstance(this.http);
    }
    getActividadContinuaEstudianteService(): ActividadContinuaEstudianteService {
        return ActividadContinuaEstudianteService.getInstance(this.http);
    }

    getHorariosMateriaService(): HorariosMateriaService {
        return HorariosMateriaService.getInstance(this.http);
    }
    getAreaDocumentoService(): AreaDocumentoService {
        return AreaDocumentoService.getInstance(this.http);
    }
    getEnvioCorreoElectronicoService(): EnvioCorreoElectronicoService {
        return EnvioCorreoElectronicoService.getInstance(this.http);
    }

    getActividadEvaluacionContinuaService(): ActividadEvaluacionContinuaService {
        return ActividadEvaluacionContinuaService.getInstance(this.http);
    }

    getRecursoRevisionService(): RecursoRevisionService {
        return RecursoRevisionService.getInstance(this.http);
    }
    getSolicitudExamenTrabajoService(): SolicitudExamenTrabajoService {
        return SolicitudExamenTrabajoService.getInstance(this.http);
    }

    getProfesorRevisionTrabajoService(): ProfesorRevisionTrabajoService {
        return ProfesorRevisionTrabajoService.getInstance(this.http);
    }

    getGrupoIdiomaService(): GrupoIdiomaService {
        return GrupoIdiomaService.getInstance(this.http);
    }

    getEstudianteGrupoIdiomaService(): EstudianteGrupoIdiomaService {
        return EstudianteGrupoIdiomaService.getInstance(this.http);
    }
    getPromocionPeriodoEscolarService(): PromocionPeriodoEscolarService {
        return PromocionPeriodoEscolarService.getInstance(this.http);
    }
    getEvaluacionDocenteAlumnoService(): EvaluacionDocenteAlumnoService {
        return EvaluacionDocenteAlumnoService.getInstance(this.http);
    }

    getNivelReacreditacion(): ReacreditacionService {
        return ReacreditacionService.getInstance(this.http);
    }

    getBoletaService(): BoletaService {
        return BoletaService.getInstance(this.http);
    }
    getInformacionComplementatiaService(): InformacionComplementariaMovilidadService {
        return InformacionComplementariaMovilidadService.getInstance(this.http);
    }

    getFuenteApoyoService(): FuenteApoyoService {
        return FuenteApoyoService.getInstance(this.http);
    }

    getTemarioParticularService(): TemarioParticularService {
        return TemarioParticularService.getInstance(this.http);
    }

    getEstudianteListaAsistenciaService(): EstudianteListaAsistenciaService {
        return EstudianteListaAsistenciaService.getInstance(this.http);
    }

    getAcreditacionIdiomaService(): AcreditacionIdiomaService {
        return AcreditacionIdiomaService.getInstance(this.http);
    }

    getPlantillaEditorService(): PlantillaEditorService {
        return PlantillaEditorService.getInstance(this.http);
    }

    getEstudianteBajaService(): EstudianteBajaService {
        return EstudianteBajaService.getInstance(this.http);
    }

    getDocumentoProbatorioAcreditacionService(): DocumentoProbatorioAcreditacionService {
        return DocumentoProbatorioAcreditacionService.getInstance(this.http);
    }

    getEstudianteTutorService(): EstudianteTutorService {
        return EstudianteTutorService.getInstance(this.http);
    }

    getVotoAprobatorioService(): VotoAprobatorioService {
        return VotoAprobatorioService.getInstance(this.http);
    }

    getEvaluacionCurricular(): EvaluacionCurricularService {
        return EvaluacionCurricularService.getInstance(this.http);
    }

    getRolService(): RolService {
        return RolService.getInstance(this.http);
    }

    getUsuarioLdapService(): UsuarioLdapService {
        return UsuarioLdapService.getInstance(this.http);
    }

    getEvaluacionDocenteService(): EvaluacionDocenteService {
        return EvaluacionDocenteService.getInstance(this.http);
    }

    getBitacoraService(): BitacoraService {
        return BitacoraService.getInstance(this.http);
    }


    getExpedienteService(): ExpedienteService {
        return ExpedienteService.getInstance(this.http);
    }

    getDocumentoMovilidadInterprogramaService(): DocumentoMovilidadInterprogramaService {
        return DocumentoMovilidadInterprogramaService.getInstance(this.http);
    }

    getSolicitudServicioSocialService(): SolicitudServicioSocialService {
        return SolicitudServicioSocialService.getInstance(this.http);
    }

    getServicioSocialService(): ServicioSocialService {
        return ServicioSocialService.getInstance(this.http);
    }

    getDocumentoServicioSocialService(): DocumentoServicioSocialService {
        return DocumentoServicioSocialService.getInstance(this.http);
    }
    getReporteBimestralService(): ReporteBimestralService {
        return ReporteBimestralService.getInstance(this.http);
    }

    getReporteador(): ReporteadorService {
        return ReporteadorService.getInstance(this.http);
    }

    getNivelCursoIdioma(): CursoNivelIdiomaService {
        return CursoNivelIdiomaService.getInstance(this.http);
    }

    getTipoFolioService(): TipoFolioService {
        return TipoFolioService.getInstance(this.http);
    }

    getFolioService(): FolioService {
        return FolioService.getInstance(this.http);
    }

    getActaCalificacionService(): ActaCalificacionService {
        return ActaCalificacionService.getInstance(this.http);
    }

    getFirmaSimpleService(): FirmaSimpleService {
        return FirmaSimpleService.getInstance(this.http);
    }

    getDocumentoFirmaSimpleService(): DocumentoFirmaSimpleService {
        return DocumentoFirmaSimpleService.getInstance(this.http);
    }

    getDocumentoFirmaSimpleCartaNoAdeudosService(): DocumentoFirmaSimpleCartaNoAdeudoService {
        return DocumentoFirmaSimpleCartaNoAdeudoService.getInstance(this.http);
    }

    getMateriaImpartidaTemarioParticularService(): MateriaImpartidaTemarioParticularService {
        return MateriaImpartidaTemarioParticularService.getInstance(this.http);
    }

    getFirmaValidacionService(): FirmaValidacionService {
        return FirmaValidacionService.getInstance(this.http);
    }

  getEvaluacionDocenteIdiomasAlumnoService(): EvaluacionDocenteIdiomasAlumnoService {
    return EvaluacionDocenteIdiomasAlumnoService.getInstance(this.http);
  }

  getEvaluacionDocenteIdiomasService(): EvaluacionDocenteIdiomasService {
    return EvaluacionDocenteIdiomasService.getInstance(this.http);
  }

  getRespuestasEvaluacionDocenteIdiomasService(): RespuestasEvaluacionDocenteIdiomasService {
      return RespuestasEvaluacionDocenteIdiomasService.getInstance(this.http);
  }

  getResetPassWordService(): PassWordResetService {
      return PassWordResetService.getInstance(this.http);
  }
}
