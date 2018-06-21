import {Component, OnInit, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Reinscripcion} from '../../services/entidades/reinscripcion.model';
import {PromocionPeriodoEscolar} from '../../services/entidades/promocion-periodo-escolar.model';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Promocion} from '../../services/entidades/promocion.model';
import {ReinscripcionEstudiante} from '../../services/entidades/reinscripcion-estudiante.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {ItemSelects} from '../../services/core/item-select.model';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {PeriodoEscolar} from '../../services/entidades/periodo-escolar.model';
import {PlanEstudiosMateria} from '../../services/entidades/plan-estudios-materia.model';
import {SpinnerService} from'../../services/spinner/spinner/spinner.service';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import * as moment from 'moment';
import {URLSearchParams} from '@angular/http';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {EstudianteMateriaImpartida} from '../../services/entidades/estudiante-materia-impartida.model';
import {Validacion} from '../../utils/Validacion';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {PeriodoEscolarServices} from '../../services/entidades/periodo-escolar.service';

export class Funcional {
  reinscripcion: number;
  estudiante: number;
  constructor(a: number, b: number) {
    this.reinscripcion = a;
    this.estudiante = b;
  }
}

@Component({
  selector: 'app-reinscripcion-alumno',
  templateUrl: './reinscripcion-alumno.component.html',
  styleUrls: ['./reinscripcion-alumno.component.css']
})
export class ReinscripcionAlumnoComponent {

  @ViewChild('modalHistorico')
  modalHistorico: ModalComponent;
  @ViewChild('modalAdeudo')
  modalAdeudo: ModalComponent;
  @ViewChild('modalConfirmacion')
  modalTraspasoConfirmacion: ModalComponent;
  @ViewChild('modalAudeudoAlumno')
  modalAdeudoAlumno: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  size: string = 'lg';
  output: string;
  private descripcionError: string = '';

  adeudosEstudiante: boolean = false;
  estadoEvaluacion: boolean = false;
  editarCrearReinscripcionEstudiante: boolean = false;
  entidadEstudianteGrupo: Estudiante;
  entidadReinscripcion: Reinscripcion;
  agregarNumeroEstudiantes: number = 0;
  totalEstudiantes: number = 0;
  mostrarBoton: boolean = false;
  mostrarCampos: boolean = false;
  periodoElegido: PromocionPeriodoEscolar;
  periodoNuevo: number = null;
  periodoActual: number = 0;
  idPeriodo: number = 0;
  periodoReinscripcion: Array<PromocionPeriodoEscolar> = [];
  idPromocionPeriodo = 0;
  contadorRegistro: number = 0 ;
  validacionActiva: boolean = false;
  validarGrupoSeleccionado: boolean= false;
  idRegistro: number;
  paginacion: PaginacionInfo;
  maxSizePags: number = 5;
  // limite: number = 10;
  paginaActual: number = 1;
  contadorEstudiantes: number = 0;
  programaDocente: number = 0;
  promocion: number = 0;
  periodos: number = 0;
  estudiante: Estudiante;
  estudianteGuardado: Estudiante;
  arregloEstudiante: Array<Estudiante> = [];
  catalogoServices;
  guardarId: Array<ReinscripcionEstudiante> = [];
  erroresConsultas: Array<ErrorCatalogo> = [];
  opcionSelectPeriodoEscolar: Array<PromocionPeriodoEscolar> = [];
  opcionSelectProgramaDocente: Array<ItemSelects> = [];
  idRegistros: Array<Funcional> = [];
  // opcionSelectPromocion: Array<PromocionService> = [];
  opcionSelectPromocion: Array<Promocion> = [];
  registros: Array<Estudiante> = [];
  registrosId: Array<number> = [];
  arregloEstudiantesPasados: Array<boolean> = [];
  formulario: FormGroup;
  formularioCheck: FormGroup;
  registroSeleccionado: Estudiante;
  fechaReinscripcionEstudiante: string;
  criteriosCabezera: string = '';
  criteriosCabezeraGestion: string = '';
  fechaRegistroDP: Date = new Date();
  estudiantesService;
  entidadEstudiante: Estudiante;
  erroresGuardado: Array<ErrorCatalogo> = [];
  profesor: {[key: number]: string; } = {};
  evaluacionProfesor: {[key: number]: string; } = {};
  dt: Date = new Date();
  contadorEstudiantesActualizar: number = 0;
  pasoSemestre: boolean = true;
  idBoletaGenerada: number = null;

  // services
  reinscripcionService;
  reinscripcionEstudianteService;
  estudianteService;
  promocionPeriodoEscolarService;
  pagoEstudianteService;
  botetaService;
  evaluacionDocenteAlumnoService;
  materiaImpartidaService;
  estudianteMateriaImpartidaService;
  promocionService;
  profesorMateriaImpartidaservice;
  planEstudiosMateriaService;
  registrosMostrar: Array<PlanEstudiosMateria> = [];

  promocionElegida: Promocion;
  numerosemestreelegido: number;
  periodoReinscripcionElegido: PeriodoEscolar;
  gestionAcademicaFinalizada: boolean = true;
  mensaheGestionAcademica: string = '';

  columnas: Array<any> = [
    { titulo: '*Nombre del estudiante', nombre: 'idDatosPersonales' },
    { titulo: 'Estatus', nombre: 'idEstatus' },
    { titulo: '*Matrícula', nombre: 'matricula' },
    { titulo: 'Período actual', nombre: 'periodoActual'},
    { titulo: 'Pagos'},
    { titulo: 'Estatus semestre'},
    { titulo: ''}
  ];

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
    'idDatosPersonales.nombre'
    + ',idDatosPersonales.primerApellido'
    + ',idDatosPersonales.segundoApellido'
    + ',idMatricula.matriculaCompleta'}
  };

  mensajeErrors: any = {
    'required': 'Este campo es requerido',
    'correo': 'Escriba un correo valido'
  };

  //////////// variablaes Modla Historico ///////////////////
  registrosHistoricos: Array<Reinscripcion> = [];
  paginacionHistorico: PaginacionInfo;
  maxSizePagsHistorico: number = 5;
  limiteHistorico: number = 10;
  paginaActualHistorico: number = 1;
  grupo: ReinscripcionEstudiante;
  public configuracionHistorico: any = {
        paginacion: true,
        filtrado: { textoFiltro: '', columnas:
        'id,idPromocion.abreviatura,idPeriodoActual.anio,estudiantesProcesados' }
  };

  columnasHistorico: Array<any> = [
        { titulo: 'No', nombre: 'id' },
        { titulo: 'Periodo escolar', nombre: 'idPeriodoActual' },
        { titulo: 'Promoción', nombre: 'idPromocion' },
        { titulo: 'Estudiantes procesados', nombre: 'estudiantesProcesados'},
        { titulo: 'Total de estudiantes', nombre: 'totalEstudiantes'}
  ];
  /////////7/ Fin de variables modal historico /////////////

  ////////// Inicio de variables modal traspaso ///////////
  periodoAcutalModalTrapaso: PeriodoEscolar;
  periodoNuevoModalTraspaso: PeriodoEscolar;
  private pasoSemestreModalTraspaso: boolean = true;
  private periodoEscolarService: PeriodoEscolarServices;
  ///////// Fin de variables modal traspaso

  constructor(// private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector,
              private _renderer: Renderer,
              private _spinner: SpinnerService,
              private _catalogosService: CatalogosServices) {
    this.fechaReinscripcionEstudiante = moment(new Date()).format('DD/MM/Y');
    this.prepareServices();
    // this.getPeriodosEscolares();
    this.getProgramasDocentes();
    // this.getPromociones();
    this.formulario = new FormGroup({
      idPeriodoActual: new FormControl(''),
      idPeriodoNuevo: new FormControl('', Validators.compose([
        Validators.required])),
      idProgramaDocente: new FormControl(''),
      idPromocion: new FormControl(''),
      totalEstudiantes: new FormControl(''),
      estudiantesProcesados: new FormControl(''),
      fechaReinscripcion: new FormControl(moment(new Date()).format('DD/MM/Y hh:mma')),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y hh:mma')),
    });

    this.formularioCheck =  new FormGroup({
      seteador: new FormControl(''),
      seteadorPeriodo: new FormControl('')});
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getPeriodosEscolares(idPromocion: number): void {
    this._spinner.start('reinscripcionalumno1');
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    this.opcionSelectPeriodoEscolar = [];
    (<FormControl>this.formularioCheck.controls['seteadorPeriodo']).patchValue('');
//      .updateValue('');
    this.mostrarBoton = false;
    this.mostrarCampos = false;
    this.registros = [];

    // // console.log('este es el id de promocion' + idPromocion);
    this.idPromocionPeriodo = idPromocion;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios',
      'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~' + idPromocion +
      ':IGUAL;AND');
    this.promocionPeriodoEscolarService.getListaPromocionPeriodoEscolarPaginacion(
      this.erroresConsultas, urlParameter).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.opcionSelectPeriodoEscolar.push(new PromocionPeriodoEscolar(item));
        // // console.log(this.opcionSelectPeriodoEscolar);
      });
      this._spinner.stop('reinscripcionalumno1');
    });

    // // console.log('CUANDO SE LLENA::',  // // console.log('CUANDO ENTRA:::' + this.opcionSelectPeriodoEscolar));

  }
  getProgramasDocentes(): void {
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
     let urlParameter: URLSearchParams = new URLSearchParams();
     urlParameter.set('ordenamiento', 'descripcion:ASC');
    let resultados: {lista: Array<ItemSelects>
    } = this.catalogoServices.getCatalogoProgramaDocente().getListaProgramaDocenteModal(
      this.erroresConsultas, urlParameter);
    this.opcionSelectProgramaDocente = resultados.lista;
  }

  /*getPromociones(): void {
   //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
   let resultados: {lista: Array<ItemSelects>
   } = this.catalogoServices.getPromocion().getListaPromocion(
   this.erroresConsultas);
   this.opcionSelectPromocion = resultados.lista;
   }*/

  getDateRegistro(){ //: number {
    let fecharegistro : string;
    let fechaConFormatoDate = moment(this.fechaRegistroDP).format('DD/MM/YYYY');
    (<FormControl>this.formulario.controls['fechaReinscripcion']).patchValue(fechaConFormatoDate + ' 10:10am');
//      .updateValue(fechaConFormatoDate + ' 10:10am');
    // return moment(this.fechaRegistroDP).format(fecharegistro);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid && this.validacionActiva) {
      return true;
    }
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    (<FormControl>this.formularioCheck.controls['seteador']).patchValue('');
//      .updateValue('');
    (<FormControl>this.formularioCheck.controls['seteadorPeriodo']).patchValue('');
  //    .updateValue('');
    // // console.log('no se carga el spinner');
    // // console.log('seleccionaste programa');
    this.mostrarBoton = false;
    this.mostrarCampos = false;
    this.opcionSelectPeriodoEscolar = [];
    this.opcionSelectPromocion = [];
    this.periodoReinscripcion = [];
    this.registros = [];
    this.profesor = {};
    this._spinner.start('reinscripcionalumno2');
    // // console.log('Estee es el id' + idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL;AND,idEstatus~1235:NOT');
    this.catalogoServices.getPromocion()
      .getSelectPromocionID(this.erroresConsultas, urlParameter).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.opcionSelectPromocion.push(new Promocion(item));
        // // console.log('veamos el conflicto');
      });
      this._spinner.stop('reinscripcionalumno2');
    });
  }

  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idPeriodo: number
  ): void {
    if (idProgramaDocente) {
      // this._spinner.start('reinscripcionalumno3');
      this.criteriosCabezera =
        'idPromocion~'
        + idPromocion
        + ':IGUAL;AND,'
        + 'idPeriodoActual~'
        + idPeriodo
        + ':IGUAL;AND,'
        + 'idEstatus~'
        + 1006
        + ':IGUAL';
      /*            if (idPromocion) {
       this.criteriosCabezera = this.criteriosCabezera + ',idPromocion~'
       + idPromocion + ':IGUAL';
       }*/
    }
    // // console.log(idPromocion);
    (<FormControl>this.formulario.
      controls['idPeriodoNuevo']).patchValue(''); // .updateValue('');
    this.programaDocente = idProgramaDocente;
    this.promocion = idPromocion;
    this.periodos = idPeriodo;
    this.validarGrupoSeleccionado = false;
    this.contadorRegistro = 0;
    this.obtenerTotalEstudiantes();
    this.mostrarTabla();
    this.buscarNumeroPeriodo();
    this.verificarGestionMateriaFinalizada();
  }

  mostrarTabla(): void {
    this.registros = [];
    this.validarGrupoSeleccionado = false;
    // console.log('aqui se debe de detener el spinner reinscripcionalumno5');
    this._spinner.stop('reinscripcionalumno5');
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    if (this.criteriosCabezera !== '') {
      criterios = this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
    }
    this._spinner.start('reinscripcionalumno3');
    urlSearch.set('ordenamiento', 'idDatosPersonales.primerApellido:ASC,' +
      'idMatricula.matriculaCompleta:ASC');
      // console.log('urlSearch', urlSearch);
    this.estudiantesService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        this.registros = [];
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        paginacionInfoJson.lista.forEach((item) => {
          this.estudiante = new Estudiante(item);
          // if(this.estudiante.estatus === ){
          this.registros.push(new Estudiante(item));
          // }

          /*TODO 23/02/2016
            *se agrega variable 'criteriosListaPagoEstudiante' para reparar issue #HD-550
            * Separando asi los criterios, concatenando opcionalmente el periodo 'futuro', siguiente
            * 'opcionalmente' - dependiendo de que 'this.periodoReinscripcion[0]' tenga un valor
              */
            let criteriosListaPagoEstudiante = 'idEstudiante.idPromocion.id~'
                + this.promocion
                + ':IGUAL;AND,'
                + 'idEstudiante.idPromocion.idProgramaDocente.id~'
                + this.programaDocente + ':IGUAL;AND,'
                + 'idEstudiante.idPeriodoActual.id~'
                + this.periodos + ':IGUAL;AND,'
                + 'idEstudiante.id~'
                + this.estudiante.id
                + ':IGUAL;AND,'
                + 'idEstudiante.idEstatus.id~'
                + 1006
                + ':IGUAL;AND';
            if (this.periodoReinscripcion[0] !== undefined ) {
                criteriosListaPagoEstudiante += ',idPeriodo~' +
                    + this.periodoReinscripcion[0].idPeriodoEscolar.id
                    + ':IGUAL;AND';
            } else {
                 criteriosListaPagoEstudiante += ',idPeriodo~' +
                    + this.periodos
                    + ':IGUAL;AND';
            }
            // // console.log(criteriosListaPagoEstudiante);


            let urlBusca = new URLSearchParams();
            urlBusca.set('criterios', criteriosListaPagoEstudiante);
            console.log('grande', urlBusca);
            this.pagoEstudianteService.getListaPagoEstudiantePaginador(
                this.erroresConsultas,
                urlBusca).subscribe(response => {
                if (response.json().lista.length > 0) {
                     // console.log('lista mayor a 0');
                    let profMateria = response.json().lista[0].id_estatus.valor;
                    console.log('profMateria', profMateria);
                    this.profesor[item.id] = profMateria;
                    if (profMateria !== 'Pagado' && profMateria !== 'Exento' &&
                       profMateria !== 'Prórroga') {
                      this.adeudosEstudiante = true;
                    }
                    // // console.log('nila mas minima idea' +  item.id);
                } else {
                    /*TODO 06/03/2017 Se agrega condicional en caso de que la lista este vacia*/
                    let requierePago = this.estudiante.promocion.programaDocente.requierePago;
                    if (!this.estudiante.promocion.programaDocente.requierePago) {
                        this.profesor[item.id] = 'Exento';
                        //this.adeudosEstudiante = true;
                        console.log('profMateria pD no requier pago', this.profesor[item.id]);
                    }
                }
            });

          this.verificarMateriasAcreditadas(
            this.estudiante.id,
            this.estudiante.periodoActual.id);
        });
      },
      error => {
        this._spinner.stop('reinscripcionalumno3');
   /*     if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
        this._spinner.stop('reinscripcionalumno3');
        // this.contadorEstudiantes = this.registros.length;
        if (this.registros.length > 0) {
          this.mostrarCampos = true;
        }else {
          this.mostrarCampos = false;
        }
      }
    );
  }

  rowSeleccionado(registro): boolean {
    // // console.log(registro);
    return (this.registroSeleccionado === registro);
  }
  rowSeleccion(registro): void {
    this.registroSeleccionado = registro;
    // // console.log('este es el id que selecciono' + this.registroSeleccionado.id);
  }
  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
  /*  if (assertionsEnabled()) {
      //// console.log('evento', evento);
      //// console.log('Page changed to: ' + evento.page);
      //// console.log('Number items per page: ' + evento.itemsPerPage);
      //// console.log('paginaActual', this.paginaActual);
    }*/
    this.mostrarTabla();
  }
  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }
  validarGrupo(grupoSeleccion): void {
    // console.log('GRUPO SELECCIONADO:: ' + grupoSeleccion);
    this.validarGrupoSeleccionado = false;
    // // console.log('Estos son los registros' + grupoSeleccion);
    if (grupoSeleccion === true) {
      if ((this.adeudosEstudiante === true) || !this.pasoSemestre) {
        // console.log('no deben el semestre::: this.adeuodosEstidante: ', this.adeudosEstudiante);
        // console.log('no pasaron::::: this.pasoSemestre: ', this.pasoSemestre);
        this.abrirModalAdeudo();
      } else {
        // console.log('pasaron el semestre y no tienen adeudo');
        this.validarGrupoSeleccionado = grupoSeleccion;
      }
    }
    /*if (this.validarFormulario()) {
     if (grupoSeleccion) {

     }else {
     //// console.log('funciona');
     }
     }*/
    this.registros.forEach((estudiante) => {
      // // console.log(estudiante.estatus.valor);
    });
  }
  enviarFormulario(): void {
    (<FormControl>this.formulario.controls['totalEstudiantes']).patchValue(this.totalEstudiantes);
//      .updateValue(this.totalEstudiantes);
    (<FormControl>this.formulario.controls['idProgramaDocente']).patchValue(this.programaDocente);
 //     .updateValue(this.programaDocente);
    (<FormControl>this.formulario.controls['idPromocion']).patchValue(this.promocion);
   //   .updateValue(this.promocion);
    (<FormControl>this.formulario.controls['idPeriodoActual']).patchValue(this.periodos);
     // .updateValue(this.periodos);
    (<FormControl>this.formulario.controls['idPeriodoNuevo']).patchValue(this.idPeriodo);
      // .updateValue(this.idPeriodo);
    // // console.log('llego a enviar formulario');
    // codigo para enviar el formulario
    if (this.validarGrupoSeleccionado) {
      if (this.validarFormulario()) {
        (<FormControl>this.formulario.controls['estudiantesProcesados']).patchValue(this.contadorEstudiantes);
//          .updateValue(this.contadorEstudiantes);
        let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
        // // console.log(jsonFormulario);
        this.reinscripcionService.postReinscripcion(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          response => {
            // // console.log(response.json());
            this.idRegistro = response.json().id;
            this.enviarReinscripcionEstudiante();
          },
          error => {
            this._spinner.stop('reinscripcionalumno5');
            // console.log('error en postReinscripcion', error);
          }
        );
      }
    }else {
      if (this.validarFormulario()) {
        (<FormControl>this.formulario.controls['estudiantesProcesados']).patchValue(this.contadorRegistro);
//          .updateValue(this.contadorRegistro);
        let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
        // // console.log(jsonFormulario);
        if (this.validarGrupoSeleccionado === false) {
          if (this.contadorRegistro > 0) {
            this.reinscripcionService.postReinscripcion(
              jsonFormulario,
              this.erroresGuardado
            ).subscribe(
              response => {
                // // console.log(response.json());
                this.idRegistro = response.json().id;
                this.enviarReinscripcionEstudiante();
              });
          }
        }
      }
    }
  }
  enviarReinscripcionEstudianteTabla(valor): void {
    if (valor) {
      this.contadorRegistro += 1;
      // // console.log('id' + this.registroSeleccionado.id  + ' suma ' + this.contadorRegistro);
      this.registrosId.push(this.registroSeleccionado.id);
    }else {
      this.contadorRegistro -= 1;
      // // console.log('id' + this.registroSeleccionado.id + ' resta ' + this.contadorRegistro);
      this.registrosId.splice(
        this.registrosId.indexOf(this.registroSeleccionado.id), 1);
    }
    // // console.log('posicion' + this.registrosId.indexOf(this.registroSeleccionado.id));
  }
  enviarEdicionReinscripcion(): void {
    let sumaEstudiantes: number = 0;
    sumaEstudiantes =
      (this.entidadReinscripcion.estudiantesProcesados * 1) + this.agregarNumeroEstudiantes;
    // // console.log('vamos bien creo' + this.entidadReinscripcion.id);
    // // console.log('veamos que trae' + this.entidadReinscripcion.estudiantesProcesados);
    // // console.log('esta es la cantidad actual' + this.agregarNumeroEstudiantes);
    // // console.log('esta es la cantidad Nueva' + sumaEstudiantes);
    let jsonFormulario = '{"estudiantesProcesados": ' + sumaEstudiantes + '}';
    // console.log('json En metodo enviarEdicionReinscripcion', jsonFormulario);
    this.reinscripcionService.putReinscripcion(
      this.entidadReinscripcion.id,
      jsonFormulario,
      this.erroresGuardado
     ).subscribe(
      response => {},
      errors => {
        this._spinner.stop('reinscripcionalumno5');
        // console.log('error en putReinscripcion', errors);
      },
      () => {
        this.idRegistro = this.entidadReinscripcion.id;
        this.enviarReinscripcionEstudiante();
    });
  }
  enviarReinscripcionEstudiante(): void {
    if (this.validarGrupoSeleccionado) {
      let id: number;
      this.registros.forEach((estudiante) => {
        // // console.log('estudiante');
        // // console.log(estudiante);
        let nuevo: Funcional = new Funcional (
          this.idRegistro,
          estudiante.id
        );
        // // console.log(nuevo);
        this.idRegistros.push(nuevo);
      });
      // // console.log(this.idRegistros);
      // this.modalConfirmarTraspaso();
      this.guardar();
    }else {
      let id: number;
      this.registrosId.forEach((valor) => {
        // // console.log('estudiante');
        // // console.log(valor);
        let nuevo: Funcional = new Funcional (
          this.idRegistro,
          valor
        );
        // // console.log(nuevo);
        this.idRegistros.push(nuevo);
      });
      // // console.log(this.idRegistros);
      // this.modalConfirmarTraspaso();
      this.guardar();
    }
  }
  guardar(): void {
    let contadorRegistros: number = 0;
    event.preventDefault();
    let jsonFormulario = JSON.stringify(this.idRegistros, null, 2);
    // // console.log('llego a guardar ');
    // // console.log('Contenido del json');
    // // console.log(jsonFormulario);
    // // console.log('length::::::============>>>>>>>>>' + this.idRegistros.length);
    this.idRegistros.forEach((algo) => {
      // // console.log(algo.reinscripcion);
      // // console.log(algo.estudiante);
      let json = '{"idReinscripcion": "' + algo.reinscripcion +
        '", "idEstudiante": "' + algo.estudiante + '"}';
      // // console.log('JSON:======;::::::::::::::' + json);
      this.reinscripcionEstudianteService.postReinscripcionEstudiante(
        json,
        this.erroresGuardado
      ).subscribe(
        response => {
          contadorRegistros++;
          if (contadorRegistros === this.idRegistros.length) {
            // // console.log('revisando contenido');
            // // console.log(response.json());
            this.actualizarEstudiante();
          }
        },
        errors => {
          this._spinner.stop('reinscripcionalumno5');
          // console.log('error en postReinscripcionEstudiante', errors);
        }
      );
    });
  }
  actualizarEstudiante(): void {
    this.contadorEstudiantesActualizar = 0;
    if (this.validarGrupoSeleccionado) {
      this.registros.forEach((estudiante) => {
        this.estudiantesService.getEntidadEstudiante(
          estudiante.id,
          this.erroresConsultas
        ).subscribe(
          response => {
            this.entidadEstudiante = new Estudiante(response.json());
            this.entidadEstudiante.numPeriodoActual += 1;
            let json = '{"numPeriodoActual": "' + this.entidadEstudiante.numPeriodoActual +
              '", "idPeriodoActual": "' + this.idPeriodo + '"}';
            // // console.log('Revisando Modificacion');
            // // console.log(json);
            this.estudiantesService.putEstudiante(
              estudiante.id,
              json,
              this.erroresGuardado
            ).subscribe(
              () =>{
                //   //// console.log('Se actualizo el registro');
                //  this.otrosRegistros(response.json().id);
                // // console.log('IDDDDDD:::::' + response.json().id);
                this.generarCargaAcademica(response.json().id);
              }
            );
          }
        );
      });
    }else {
      this.registrosId.forEach((algo) => {
        // console.log('alog', algo);
        this.estudiantesService.getEntidadEstudiante(
          algo,
          this.erroresConsultas
        ).subscribe(response => {
          this.entidadEstudiante = new Estudiante(response.json());
          this.entidadEstudiante.numPeriodoActual += 1;
          let json = '{"numPeriodoActual": "' + this.entidadEstudiante.numPeriodoActual +
            '", "idPeriodoActual": "' + this.idPeriodo + '"}';
            // console.log('json actualizar estudiante', json);
          this.estudiantesService.putEstudiante(
            algo,
            json,
            this.erroresGuardado).subscribe(
              response => {},
              error => {
                this._spinner.stop('reinscripcionalumno5');
                // console.log('error en putEstudiante', error);
              },
              () => {
              //this.otrosRegistros(response.json().id);
              // console.log('algo va para genrar carga academica');
              this.generarCargaAcademica(algo);
            }
          );
          },
          error => {
              this._spinner.stop('reinscripcionalumno5');
            // console.log('error en getEntidadEstudiante', error);
          },
          () => {}
        );

      });
    }
  }

  generarCargaAcademica(idEstudiante: number): void {
    // console.log('entro generarCargaAcademica');
    let jsonEstudiante = '{"idEstudiante": "' + idEstudiante + '"}';
    // console.log('idEstudiante:::::::::::::' + jsonEstudiante);
    this.estudiantesService.postGenerarCargaAcademica(
      jsonEstudiante,
      this.erroresConsultas
    ).subscribe(
      response => {
        // // console.log('respuesta JSON:::::::::', response.json());
        this.contadorEstudiantesActualizar ++;
      },
      error =>  {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('reinscripcionalumno5');
        // console.log('error en postGenerarCargaAcademica', error);
        console.error(error);
      },
      () => {
        // console.log('this.contadorEstudiantesActualizar', this.contadorEstudiantesActualizar);
        // console.log('this.registros.length', this.registros.length);
        if (this.validarGrupoSeleccionado) {
          if (this.contadorEstudiantesActualizar === this.registros.length){
            this.detenerSpinner();
          }
        } else {
          this.detenerSpinner();
        }
        
/*        if (assertionsEnabled()) {
          
        }*/
      }
    );
  }

  detenerSpinner(): void {
    console.log('entro a detener spinner');
    this.validarGrupoSeleccionado = false;
    this.idRegistros = [];
    this.registrosId = [];
    this.agregarNumeroEstudiantes = 0;
    this.contadorRegistro = 0;
    this.mostrarTabla();

  }

  otrosRegistros(idEstudiante: number): void {
    this.estudiantesService.getEntidadEstudiante(
      idEstudiante,
      this.erroresConsultas
    ).subscribe(
      response => {
        let estudiante = new Estudiante(response.json());
        if (this.entidadEstudiante) {
          this.insertarBoleta(estudiante);
          this.insertarEvaluacionDocente(estudiante);
        }
      }
    );


  }

  insertarBoleta(estudiante: Estudiante): any {
    let formularioBoletas = new FormGroup({
      expedida: new FormControl(false),
      idPeriodoEscolar: new FormControl(estudiante.periodoActual.id),
      idEstudiante: new FormControl(estudiante.id)
    });

    this.botetaService.postBoleta(
      JSON.stringify(formularioBoletas.value, null, 2),
      this.erroresGuardado
    ).subscribe(
      response => {
        if (response.json().id) {
          this.recuperarMateriasImpartidas(estudiante, response.json().id);
        }
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //// console.log('Boleta Creada');
        }*/
      });
  }

  insertarEvaluacionDocente(estudiante): any {
    let formularioEvaluacionDocente = new FormGroup({
      idPeriodoEscolar: new FormControl(estudiante.periodoActual.id),
      idEstudiante: new FormControl(estudiante.id),
      observaciones: new FormControl('observaciones'),
      evaluacionesFinalizadas: new FormControl(false),
      estudianteAbsuelto: new FormControl(false),
    });

    this.evaluacionDocenteAlumnoService.postEvaluacionDocenteAlumno(
      JSON.stringify(formularioEvaluacionDocente.value, null, 2),
      this.erroresGuardado
    ).subscribe(
      response => {
        // // console.log(response);
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
      },
      () => {
/*        if (assertionsEnabled()) {
          //// console.log('Evaluacion Docente agregada');
        }*/
      });
  }

  recuperarMateriasImpartidas(estudiante: Estudiante, idBoleta: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'numeroPeriodo~' +
      estudiante.numPeriodoActual + ':IGUAL,' +
      'idPromocion.id~' + estudiante.promocion.id + ':IGUAL,'
      + 'idPeriodoEscolar~' + estudiante.periodoActual.id + ':IGUAL;AND');
    this.materiaImpartidaService.getListaMateriaImpartida(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let listaMaterias: Array<MateriaImpartida> = [];
        if (response.json().lista.length > 0) {
          let i = 0;
          response.json().lista.forEach((item) => {
            listaMaterias.push(new MateriaImpartida(item));
            if (listaMaterias[i].materia.tipoMateria.id === 4) {
              this.guardarEstudianteMateriaImpartida
              (listaMaterias[i], estudiante, idBoleta, i, response.json().lista.length);
            }
            if (listaMaterias[i].materia.tipoMateria.id === 1) {
              this.guardarEstudianteMateriaImpartida
              (listaMaterias[i], estudiante, idBoleta, i, response.json().lista.length);
            }
            if (listaMaterias[i].materia.tipoMateria.id != 1 && listaMaterias[i].materia.tipoMateria.id != 4) {
              if (listaMaterias.length === i + 1 ) {
                this.contadorEstudiantesActualizar++;
              }
              this.comparar();
            }
            i++;
          });

        }else {
          this.contadorEstudiantesActualizar++;
          this.comparar();
        }
      }
    );
  }

  verificarMateriasAcreditadas(idEstudiante: number, idPeriodoActual: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    let urlParameters;
    let calificaciones: Array<Number> = [];
    let pasoMaterias: boolean = true;
    criterios = 'idEstudiante~' + idEstudiante + ':IGUAL;AND,' +
      'idMateriaImpartida.idPeriodoEscolar.id~' +
      idPeriodoActual + ':IGUAL;AND,idEstudiante.idEstatus~1006:IGUAL;AND';

    urlSearch.set('criterios', criterios);
    this._spinner.start('reinscripcionalumno4');
    this.estudianteMateriaImpartidaService.
    getListaEstudianteMateriaImpartida(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          if (item.calificacion_ordinaria) {
            if (item.calificacion_ordinaria < 70) {
              if (item.calificacion_revision) {
                if (item.calificacion_revision < 70) {
                  this.pasoSemestre = false;
                  pasoMaterias = false;
                }
              } else {
                this.pasoSemestre = false;
                pasoMaterias = false;
              }
            }
          } else {
            this.pasoSemestre = false;
            pasoMaterias = false;
          }
        });

        if (response.json().lista.length === 0) {
          pasoMaterias = false;
        }
      },
      error => {
        this._spinner.stop('reinscripcionalumno4');
      },
      () => {
        this._spinner.stop('reinscripcionalumno4');
        // console.log('::::::::::pasoSemestre?:::::::::', this.pasoSemestre);
        this.arregloEstudiantesPasados[idEstudiante] = pasoMaterias;
        // console.log('arregloEstudiantesPasados', this.arregloEstudiantesPasados);

      }
    );
  }

  guardarEstudianteMateriaImpartida
  (materiaImpartida: MateriaImpartida, estudiante: Estudiante, idBoleta: number, i: number, materiasList: number): void {
    let jsonFormularioMateriaImpartida =
      '{"idEstudiante": "' + estudiante.id +
      '", "idMateriaImpartida": "' + materiaImpartida.id +
      '", "idBoleta":' + idBoleta + '}';
    this.estudianteMateriaImpartidaService.postEstudianteMateriaImpartida(
      jsonFormularioMateriaImpartida,
      this.erroresGuardado
    ).subscribe(
      response => {
        let estudentMat = new EstudianteMateriaImpartida(response.json());
        this.estudiante = null;
      },
      error => {
        console.error(error);
      },
      () => {
        if (materiasList === i + 1) {
          this.contadorEstudiantesActualizar++;
          this.comparar();
        }
      }
    );
  }


  getFechaPublicacion(): string {
    if (this.dt) {
      let fechaConFormato = moment(this.dt).format('DD/MM/YYYY');
      (<FormControl>this.formulario.controls['fechaReinscripcion']).patchValue(fechaConFormato + ' 10:00am');
        // .updateValue(fechaConFormato + ' 10:00am');
      return fechaConFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }
  almacenarPeriodoActual(periodo: number): void {
    // // console.log('PERIODO::::' + periodo);
    this.periodoActual = periodo;
    this.getPeriodoEscolarNuevo();
    this.mostrarBoton = true;
    this.registros = [];
    // this.mostrarBoton = false;
    this.mostrarCampos = false;
  }
  almacenarPeriodoNuevo(periodo): void {
    this.periodoNuevo = periodo;
  }
  getPeriodoEscolarNuevo(): void {
    this.periodoReinscripcion = [];
    this.idPeriodo = (this.periodoActual * 1) + 1;
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios',
      'idPeriodoEscolar.idEstatus.id~1007:IGUAL;AND,idPromocion.id~'
      + this.idPromocionPeriodo +
      ':IGUAL;AND,idPeriodoEscolar.id~' + this.idPeriodo + ':IGUAL;AND');
    this.promocionPeriodoEscolarService.getListaPromocionPeriodoEscolarPaginacion(
      this.erroresConsultas, urlParameter).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.periodoReinscripcion.push(new PromocionPeriodoEscolar(item));
        this.periodoReinscripcionElegido = new PeriodoEscolar (item.id_periodo_escolar);
      });
    });
  }
  editarCrearReinscripcion(): void {
    this._spinner.start('reinscripcionalumno5');
    let limiteEstudiantes: number = 0;
    let limiteEstudianteNuevos: number = 0;
    let urlParameter: URLSearchParams = new URLSearchParams();
    if (this.validarGrupoSeleccionado) {
      this.registros.forEach((entidadEstudianteGrupo) => {
        urlParameter.set('criterios',
          'idPeriodoActual~'
          + entidadEstudianteGrupo.periodoActual.id + ':IGUAL;AND,'
          + 'idPromocion~'
          + entidadEstudianteGrupo.promocion.id + ':IGUAL;AND');
        this.reinscripcionService.getListaReinscripcionModal(
          this.erroresConsultas,
          urlParameter).subscribe(response => {
          if (response.json().lista.length > 0) {
            response.json().lista.forEach((reinscripcionEncontrada) => {
              this.entidadReinscripcion = new Reinscripcion(reinscripcionEncontrada);
            });
            limiteEstudiantes++;
            if (limiteEstudiantes === this.registros.length) {
              this.agregarNumeroEstudiantes = limiteEstudiantes;
              this.editarCrearReinscripcionEstudiante = true;
              this.elegirMetodoGuardar();
            }
            // // console.log('encontro la calamidad');
          } else {
            limiteEstudianteNuevos++;
            if (limiteEstudianteNuevos === this.registros.length) {
              this.editarCrearReinscripcionEstudiante = false;
              // // console.log('no encontro ninguna calamidad, Se crea nueva Reinscripcion');
              this.elegirMetodoGuardar();
            }
          }
        });
      },
      errors => {
        this._spinner.stop('reinscripcionalumno5');
        // console.log('error en getListaReiscripcionModal', errors);
      });
    } else { // // console.log('entro en el segundo Opcion');
    // console.log('registosId en metodo editarCrearReinscripcionEstudiante()', this.registrosId);
      this.registrosId.forEach((algo) => {
        this.estudiantesService.getEntidadEstudiante(
          algo,
          this.erroresConsultas
        ).subscribe(
          response => {
            this.entidadEstudiante = new Estudiante(response.json());
            // // console.log('Este es el estudiante elegido');
            // // console.log(response.json());
            urlParameter.set('criterios',
              'idPeriodoActual~' + this.entidadEstudiante.periodoActual.id + ':IGUAL;AND,'
              + 'idPromocion~' + this.entidadEstudiante.promocion.id + ':IGUAL;AND');
          }, errors => {
            this._spinner.stop('reinscripcionalumno5');
            // console.log('error en getEntidadEstudiante', errors);
          },
          () => {
            // // console.log('estos son los criterios');
            // // console.log(urlParameter);
            this.reinscripcionService.getListaReinscripcionModal(
              this.erroresConsultas,
              urlParameter).subscribe(response => {
              if (response.json().lista.length > 0) {
                // // console.log('encontro la calamidad');
                response.json().lista.forEach((reinscripcionEncontrada) => {
                  this.entidadReinscripcion = new Reinscripcion(reinscripcionEncontrada);
                  // // console.log(this.entidadReinscripcion.id);
                });
                limiteEstudiantes++;
                if (limiteEstudiantes === this.registrosId.length) {
                  // // console.log('vamos a ver que pasa');
                  this.agregarNumeroEstudiantes = limiteEstudiantes;
                  this.editarCrearReinscripcionEstudiante = true;
                  this.elegirMetodoGuardar();
                }
                // // console.log('contador' + limiteEstudiantes + 'longitud' + this.registrosId.length);
              } else {
                limiteEstudianteNuevos++;
                if (limiteEstudianteNuevos === this.registrosId.length) {
                  // // console.log('no encontro ninguna calamidad, Se crea nueva Reinscripcion');
                  this.editarCrearReinscripcionEstudiante = false;
                  this.elegirMetodoGuardar();
                }
              }
            },
            errors => {
              this._spinner.stop('reinscripcionalumno5');
              // console.log('error en getListaReiscripcionModal2', errors);
            });
          });
      });
    }
  }
  elegirMetodoGuardar(): void {
    if (this.editarCrearReinscripcionEstudiante === true) {
      // // console.log('se va a editar la reinscripcion');
      this.enviarEdicionReinscripcion();
    } else {
      // // console.log('se va a crear la reinscripcionW');
      this.enviarFormulario();
    }
    // this._spinner.stop('reinscripcionalumno5');
  }

  comparar() {
    if (this.registros.length === this.contadorEstudiantesActualizar) {
      this.detenerSpinner();
    }
    if (this.registrosId.length === this.contadorEstudiantesActualizar) {
      this.detenerSpinner();
    }
  }

  /*buscarPromocionGestionAcademica(): void {
   let urlSearch: URLSearchParams = new URLSearchParams();
   let criterios = '';
   this.promocionService.getEntidadPromocion(
   this.promocion,
   this.erroresConsultas
   ).subscribe(
   response => {
   this.promocionElegida = new Promocion(response.json());
   this.buscarCriteriosCabezeraGestionMaterias();
   },
   error => {
   // // console.log('error');
   },
   () => {
   }
   );
  }*/
  verificarGestionMateriaFinalizada(): void {
        this.gestionAcademicaFinalizada = true;
        this.mensaheGestionAcademica = '';
        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterios = '';
        this.promocionService.getEntidadPromocion(
            this.promocion,
            this.erroresConsultas
        ).subscribe(
            response => {
                this.promocionElegida = new Promocion(response.json());
                response.json().periodos.forEach((item) => {
                    // // console.log(item.id_periodo_escolar.id);
                    if (item.id_periodo_escolar.id == this.periodos) {
                        this.numerosemestreelegido = item.num_semestre;

                    }
                });

            },
            error => { },
            () => {
                this.crearCriteriosBusquedaMateriaPlanEstudios();
                this.buscarMateriasPlanEstudioPorPromocionPeriodo();
            }
        );
  }

  crearCriteriosBusquedaMateriaPlanEstudios(): void {
        this.numerosemestreelegido += 1;

        this.criteriosCabezeraGestion =
            'idMateria.idTipo.id~4:IGUAL;OR,idMateria.idTipo.id~3:IGUAL' +
                ';ORGROUPAND,idPlanEstudios.id~' +
            this.promocionElegida.idPlanEstudios.id + ':IGUAL;AND,numeroPeriodo~'
            + this.numerosemestreelegido + ':IGUAL;AND';
  }

  buscarMateriasPlanEstudioPorPromocionPeriodo(): void {
        this.registrosMostrar = [];

        let urlSearch: URLSearchParams = new URLSearchParams();
        let criterios = '';

        if (this.criteriosCabezeraGestion !== '') {
            criterios = criterios + this.criteriosCabezeraGestion;
            urlSearch.set('criterios', criterios);
            // console.log(criterios);
            // this._spinner.start();
            this.planEstudiosMateriaService.getListaMateriasPlanSize(
                this.erroresConsultas,
                urlSearch,
                false
            ).subscribe(
                response => {
                    response.json().lista.forEach((item) => {
                        // console.log(item);
                        this.registrosMostrar.push(new PlanEstudiosMateria(item));
                    });
                    // console.log('registrosMostrar', this.registrosMostrar);

                },
                error => { // console.log('hay un error y no se porque'); 
                },
                () => {
                    if (this.registrosMostrar.length > 0) {
                        this.registrosMostrar.forEach((registro) => {
                            this.buscarProfesoresEnMateriaImpartida(registro);
                        });
                        // this._spinner.stop();
                    }
                }
            );
        }
  }

  buscarProfesoresEnMateriaImpartida(planEstudioMateria: PlanEstudiosMateria): void {
        // console.log(planEstudioMateria);
        let urlParameter: URLSearchParams = new URLSearchParams();

        urlParameter.set('criterios', 'idMateria~' +
            planEstudioMateria.materia.id + ':IGUAL,idPeriodoEscolar~'
            + this.periodoReinscripcionElegido.id +
            ':IGUAL,idPromocion~' + this.promocionElegida.id
            + ':IGUAL,idEstatus~1222:IGUAL;AND');

        this.materiaImpartidaService.getListaMateriaImpartida(
            this.erroresConsultas,
            urlParameter,
            false
        ).subscribe(
            response => {
                let materiaImpartida;
                let profesorMAteriaImpartida;
                if (response.json().lista.length > 0) {

                    response.json().lista.forEach((item) => {
                        materiaImpartida = new MateriaImpartida(item);
                        if (materiaImpartida.materia.tipoMateria.id !== 3) {
                            // console.log('Materiaverificada', materiaImpartida);
                            if (!(materiaImpartida.profesores.length > 0)) {
                                if (this.gestionAcademicaFinalizada) {
                                    // console.log(this.gestionAcademicaFinalizada);
                                    this.gestionAcademicaFinalizada = false;
                                }
                            }
                        }
                        // console.log('-----', this.gestionAcademicaFinalizada);

                    });
                    //this._spinner.stop();

                }else {
                    this.gestionAcademicaFinalizada = false;
                    //this._spinner.stop();
                }
            },
            error => {
                console.error(error);
            },
            () => {}
        );
  }

  buscarNumeroPeriodo(): void {
    this.gestionAcademicaFinalizada = true;
    this.mensaheGestionAcademica = '';
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    this.promocionService.getEntidadPromocion(
      this.promocion,
      this.erroresConsultas
    ).subscribe(
      response => {
        // // console.log(response.json());
        this.promocionElegida = new Promocion(response.json());
        // // console.log(this.periodos);
        response.json().periodos.forEach((item) => {
          // console.log(item.id_periodo_escolar.id);
          if (item.id_periodo_escolar.id == this.periodos) {
            this.numerosemestreelegido = item.num_semestre;

          }
        });

        // // console.log(this.promocionElegida);
        // // console.log(this.numerosemestreelegido);
 //       this.buscarCriteriosCabezeraGestionMaterias();
      },
      error => {
        // // console.log('error');
      },
      () => {
      }
    );
  }

  buscarCriteriosCabezeraGestionMaterias(index: number): void {
    this.numerosemestreelegido +=1;
    // tipo 4 Base
    // 2 Optativa
    // Curso optativo
    // 3 - Tutorial
    // 1 - LGAC

    this.criteriosCabezera =
      'idMateria.idTipo.id~4:IGUAL;OR,idMateria.idTipo.id~3:IGUAL;ORGROUPAND,idPlanEstudios.id~' +
      this.promocionElegida.idPlanEstudios.id + ':IGUAL;AND,numeroPeriodo~'
      + this.numerosemestreelegido + ':IGUAL;AND';
    this.onCambiosTablaGestionMateria();

  }
  onCambiosTablaGestionMateria(): void {
    this.registrosMostrar = [];

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    if (this.criteriosCabezera !== '') {
      criterios = criterios + this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
      // console.log(criterios);
      this._spinner.start('reinscripcionalumno6');
      this.planEstudiosMateriaService.getListaMateriasPlanSize(
        this.erroresConsultas,
        urlSearch,
        false
      ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            // console.log(item);
            this.registrosMostrar.push(new PlanEstudiosMateria(item));
          });
          // console.log(this.registrosMostrar);

        },
        error => {
          // // console.log('error');
        },
        () => {
          if (this.registrosMostrar.length > 0) {
            // // console.log('Con registros');
            this.registrosMostrar.forEach((registro) => {
              this._spinner.stop('reinscripcionalumno6');
              this.buscarMateriaImpartida(registro);
            });
          }else {
            // // console.log('-----------------------    ');
            this._spinner.stop('reinscripcionalumno6');
          }
        }
      );
    }
  }
  buscarMateriaImpartida(planEstudioMateria: PlanEstudiosMateria): void {
    // // console.log(planEstudioMateria);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idMateria~' +
      planEstudioMateria.materia.id + ':IGUAL,idPeriodoEscolar~'
      + this.periodoReinscripcionElegido.id +
      ':IGUAL,idPromocion~' + this.promocionElegida.id
      + ':IGUAL,idEstatus~1222:IGUAL;AND');
    this.materiaImpartidaService.getListaMateriaImpartida(
      this.erroresConsultas,
      urlParameter,
      false
    ).subscribe(
      response => {
        let materiaImpartida;
        let profesorMAteriaImpartida;
        if (response.json().lista.length > 0) {
          response.json().lista.forEach((item) => {
            materiaImpartida = new MateriaImpartida(item);
            if (materiaImpartida.profesores.length > 0) {
              if (this.gestionAcademicaFinalizada) {
                // // console.log(this.gestionAcademicaFinalizada);
                this.gestionAcademicaFinalizada = false;
              }
            }
            // // console.log(item);
            // console.log('-----', this.gestionAcademicaFinalizada);

          });
          this._spinner.stop('reinscripcionalumno6');
        }else {
          this.gestionAcademicaFinalizada = false;
          this._spinner.stop('reinscripcionalumno6');
        }
      },
      error => {
        console.error(error);
      },
      () => {
        if (!this.gestionAcademicaFinalizada && this.registros) {
          this.mensaheGestionAcademica =
          'La gestión academica para el siguiente semestre aun no esta completa, aun no se pueden realizar reinscripciones.';
        }
      }
    );
  }


  private cambiarEstatusPago(estatusPago): string {
    // console.log('esetatusPago', estatusPago);
    if (estatusPago) {
      return estatusPago;
    } else {
      return '---';
    }
  }

  private mostrarEstatusSemestre(idEstudiante): string {
    let estatus = '---';
    if (this.arregloEstudiantesPasados[idEstudiante]) {
      estatus = 'Acreditado';
    } else {
      estatus = 'N/A';
    }
    return estatus;
  }

  private ocultarBotonReinscripcion(): boolean {
    if ((this.validarGrupoSeleccionado || this.contadorRegistro > 0)
     && this.gestionAcademicaFinalizada
    ) {
      return true;
    }
    return false;
  }
  private deshabilitarCampos(adeudo, idEstudiante): boolean {
    // // console.log('veamos adeudos' + adeudo);
    return this.registroTieneAdeudo(adeudo) || !this.registroPasoSemestre(idEstudiante);
  }

  private registroTieneAdeudo(adeudo): boolean {
    if (this.validarGrupoSeleccionado
      || adeudo !== 'Exento' && adeudo !== 'Pagado' && adeudo !== 'Prórroga') {
          // console.log('se debe deshabilitar');
      return true;
    }
    return false;
  }

  private registroPasoSemestre(idEstudiante): boolean {
    return this.arregloEstudiantesPasados[idEstudiante];
  }

  private marcarCampos(): boolean {
    if (this.validarGrupoSeleccionado) {
      return true;
    }
    return false;
  }
  private deshabilitarCampoGrupal(): boolean {
    if (this.contadorRegistro !== 0) {
      return true;
    }
    return false;
  }
  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType); // ValidacionService.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }
  private obtenerTotalEstudiantes(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criteriosTotal = '';
    this.totalEstudiantes = 0;
    if (this.criteriosCabezera !== '') {
      criteriosTotal = this.criteriosCabezera;
      urlSearch.set('criterios', criteriosTotal);
    }
    this.estudiantesService.getListaEstudiantesProgramaPromocion(
      this.erroresConsultas,
      urlSearch
    ).subscribe(response => {
      response.json().lista.forEach((item) => {
        this.totalEstudiantes++;
      });
      // // console.log('este es el total de estudiantes' + this.totalEstudiantes);
    });

  }

  //  Funcionalidad del modal moda lHistorico
  private abriModalHistorico(): void {
    this.modalHistorico.open('lg');
    this.onCambiosTablaHistoricos();
  }

  private cerrarModalHistorico(): void {
    this.modalHistorico.close();
  }

  private onCambiosTablaHistoricos(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    if (this.configuracionHistorico.filtrado && this.configuracionHistorico.filtrado.textoFiltro !== '') {
        let filtros: Array<string> = this.configuracionHistorico.filtrado.columnas.split(',');
        filtros.forEach((filtro) => {
            criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
                this.configuracionHistorico.filtrado.textoFiltro + ':LIKE;OR';
        });
        urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    this.columnasHistorico.forEach((columna) => {
        if (columna.sort) {
            ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
                columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
        }
    });
    this._spinner.start('cargarLista');
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limiteHistorico.toString());
    urlSearch.set('pagina', this.paginaActualHistorico.toString());
    this.reinscripcionService.getListaReinscripcionModal(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registrosHistoricos = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
            paginasArray.push(i);
        }

        this.paginacionHistorico = new PaginacionInfo(
            paginacionInfoJson.registrosTotales,
            paginacionInfoJson.paginas,
            paginacionInfoJson.paginaActual,
            paginacionInfoJson.registrosPagina
        );

        paginacionInfoJson.lista.forEach((item) => {
          this.registrosHistoricos.push(new Reinscripcion(item));
          this.registrosHistoricos.forEach((itemInterno) => {});
        });

      },
      error => {this._spinner.stop('cargarLista'); },
      () => {
        // console.log('registrosReinscirpciones', this.registrosHistoricos);
        this._spinner.stop('cargarLista');
      }
    );
  }

  setLimiteHistorico(limite: string): void {
    this.limiteHistorico = Number(limite);
    this.onCambiosTablaHistoricos();
  }

  sortChangedHistorico(columna): void {
    this.columnasHistorico.forEach((column) => {
      if (columna !== column) {
        column.sort = '';
      }
    });
    if (columna.sort !== false) {
      if (columna.sort) {
          columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
          columna.sort = 'desc';
      }
      this.onCambiosTablaHistoricos();
    }
  }

  filtroChangedHistorico(filtroTexto): void {
      this.configuracion.filtrado.textoFiltro = filtroTexto;
      this.onCambiosTablaHistoricos();
  }

  cambiarPaginaHistorico(evento: any): void {
    this.paginaActualHistorico = evento.page;
    this.onCambiosTablaHistoricos();
  }

  isSetPaginacionHistorico(): boolean {
    let result = false;
    if (this.paginacionHistorico) {
      result = true;
    }
    return result;
  }
  // Fin de la funcionalidad del  modal Historico

  ///////// Inicio modal mensaje Adeudo /////////
  private abrirModalAdeudo(): void {
    this.modalAdeudo.open();
  }

  private cerrarModalAdeudo(): void {
    this.modalAdeudo.close();
  }
  ///////// Fin modal mensaje Adeudo ///////////

  //////// Inicio modal confirmacion reinscripcion///////

  private modalConfirmarTraspaso(): void {
    //// console.log('entre a modal confirmacion');
    if (this.validarFormulario()) {
      //// console.log('es valido el formulario');
      this.abrirModalTraspaso();
    }
  }

  private abrirModalTraspaso() {
    if (this.hayRegistroSeleccionado()) {
        //// console.log('hay registro seleccioado');
        // // console.log('hay registros seleccionados');
        if (!this.estudianteSeleccionadoPasoSemestre()) {
                this.pasoSemestre = false;
                this.abrirModalAdeudo();
        } else {
          this.modalTraspasoConfirmacion.open();
        }
    }

    /*if (this.estudianteSeleccionadoPasoSemestre()) {
      // console.log('estudiantes pasaron el semestre');
    } else {
      this.modalAdeudoAlumno.open();
    }*/

    // console.log('obtener periodos');
    this.obtenerPeriodoActual();
    this.obtenerPeriodoNuevo();
  }

  private estudianteSeleccionadoPasoSemestre(): boolean {
    return this.arregloEstudiantesPasados[
              this.registroSeleccionado.id];
  }

  private hayRegistroSeleccionado(): boolean {
    let hayRegistroSeleccionado: boolean = false;
    if (this.registroSeleccionado &&
        this.registroSeleccionado.id) {
            hayRegistroSeleccionado = true;
    }

    return hayRegistroSeleccionado;
  }

  private obtenerPeriodoActual(): void {

    this._spinner.start('obtenerPeriodoActual');
    this.periodoEscolarService.getEntidadPeriodoEscolar(
    this.periodoActual,
    this.erroresConsultas
    ).subscribe(
        response => {
            this.periodoAcutalModalTrapaso = new PeriodoEscolar(response.json());
        },
        error => {
            this._spinner.stop('obtenerPeriodoActual');
        },
        () => {
            this._spinner.stop('obtenerPeriodoActual');
        }
    );
  }

  private obtenerPeriodoNuevo(): void {
    this.periodoEscolarService.getEntidadPeriodoEscolar(
    this.idPeriodo,
    this.erroresConsultas
    ).subscribe(
      response => {
        this.periodoNuevoModalTraspaso = new PeriodoEscolar(response.json());
      }
    );
  }

  private gurdarRegistros(): void {
      this.editarCrearReinscripcion();
      this.cerrarModalConfirmacionTraspaso();
  }

  private cerrarModalConfirmacionTraspaso(): void {
    this.pasoSemestre = true;
    this.modalTraspasoConfirmacion.close();
  }

  private cerrarModalAdeudoAlumno(): void {
    this.modalAdeudoAlumno.close();
  }

  /////// Fin modal confirmacion reinscripcion /////////

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService;
    this.estudiantesService =
      this.catalogoServices.getEstudiante();
    this.reinscripcionService =
      this.catalogoServices.getReinscripcionService();
    this.reinscripcionEstudianteService =
      this.catalogoServices.getReinscripcionEstudianteService();
    this.promocionPeriodoEscolarService =
      this.catalogoServices.getPromocionPeriodoEscolarService();
    this.pagoEstudianteService =
      this.catalogoServices.getPagoEstudiante();
    this.evaluacionDocenteAlumnoService =
      this.catalogoServices.getEvaluacionDocenteAlumnoService();
    this.botetaService = this.catalogoServices.getBoletaService();
    this.evaluacionDocenteAlumnoService =
      this.catalogoServices.getEvaluacionDocenteAlumnoService();
    this.materiaImpartidaService =
      this.catalogoServices.getMateriaImpartidaService();
    this.estudianteMateriaImpartidaService =
      this.catalogoServices.getEstudianteMateriaImpartidaService();
    this.promocionService = this.catalogoServices.getPromocion();
    this.planEstudiosMateriaService = this.catalogoServices.getPlanEstudiosMateria();
    this.periodoEscolarService = this.catalogoServices.getPeriodoEscolar();
  }
}
