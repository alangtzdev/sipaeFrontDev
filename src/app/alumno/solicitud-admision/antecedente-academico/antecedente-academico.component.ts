import {Component, ElementRef, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {IdiomaEstudiante} from "../../../services/entidades/idioma-estudiante.model";
import {DatoAcademico} from "../../../services/entidades/dato-academico.model";
import {RecomendanteAcademico} from "../../../services/entidades/recomendante-academico.model";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {ActivatedRoute, Router} from "@angular/router";
import {RecomendanteAcademicoService} from "../../../services/entidades/recomendante-academico.service";
import {EstudianteService} from "../../../services/entidades/estudiante.service";
import {Estudiante} from "../../../services/entidades/estudiante.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {ModalDetalleDatoAcademicoComponent} from "../modal-detalle-dato-academico/modal-detalle-dato-academico.component";
import {ModalRegistroDatoAcademicoComponent} from "../modal-registro-dato-academico/modal-registro-dato-academico.component";
import {ModalRegistroIdiomasComponent} from "../modal-registro-idiomas/modal-registro-idiomas.component";

@Component({
  selector: 'app-antecedente-academico',
  templateUrl: './antecedente-academico.component.html',
  styleUrls: ['./antecedente-academico.component.css']
})
export class AntecedenteAcademicoComponent implements OnInit {

   idIdioma: number;

  idDatoAcademico: number;
  @ViewChild("modalRegistroDato")
  modalRegistroDato:ModalRegistroDatoAcademicoComponent;
  @ViewChild("modalDetalleDato")
  modalDetalleDato:ModalDetalleDatoAcademicoComponent;
  @ViewChild("modalRegIdioma")
  modalRegIdioma:ModalRegistroIdiomasComponent;

  router: Router;
  // Idiomas
  registrosIdiomas: Array<IdiomaEstudiante> = [];
  registroIdiomaSeleccionado: IdiomaEstudiante;
  columnas: Array<any> = [
    { titulo: 'Idioma', nombre: 'idioma' },
    { titulo: 'Nivel', nombre: 'nivel'},
  ];
  // Datos academicos
  registrosAcademicos: Array<DatoAcademico> = [];
  registroAcademicoSeleccionado: DatoAcademico;
  columnasDos: Array<any> = [
    { titulo: 'Nivel académico', nombre: 'nivelAcademico' },
    { titulo: 'Universidad o Institución', nombre: 'universidad'},
  ];
  // Recomentantes academicos
  registrosRecomendantesAcademicos: Array<RecomendanteAcademico> = [];
  registroRecomendanteSeleccionado: RecomendanteAcademico;
  columnasRecomendantes: Array<any> = [
    { titulo: 'Nombre', nombre: 'nombre' },
    { titulo: 'Institución', nombre: 'institucion'},
    { titulo: 'Teléfono', nombre: 'telefono'},
  ];

  // Variable para mostrar/ocultar Recomendantes Academicos
  soloLicenciatura: boolean = false;
  nivelEstudiosEstudiante;

  // Variables para service
  idiomaEstudianteService;
  datoAcademicoService;
   idEstudiante: number;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(public catalogosServices: CatalogosServices,  private elementRef: ElementRef,
              private injector: Injector,route: ActivatedRoute,
              private _renderer: Renderer, _router: Router,
              public recomendateAcademicoService: RecomendanteAcademicoService,
              private _estudianteService: EstudianteService) {
    let params;
    route.params.subscribe(parms => {
       params = parms;
      // In a real app: dispatch action to load the details here.
    });

    this.idEstudiante = params.id;
    if (this.idEstudiante) {
      let estudiante: Estudiante;

      this._estudianteService.getEstudiante(
        this.idEstudiante,
        this.erroresConsultas
      ).subscribe(
        response =>
          estudiante = new Estudiante(
            response.json()),
        error => {

        },
        () => {

          this.nivelEstudiosEstudiante =
            estudiante.promocion.programaDocente.nivelEstudios.descripcion;
          this.evaluarNivelSolicitante(this.nivelEstudiosEstudiante);
        }
      );
    }
    this.router = _router;
    this.prepareServices();
  }


  eliminarIdioma () {
    if (this.registroIdiomaSeleccionado) {
      //console.log('Eliminando...');
      this.idiomaEstudianteService.deleteIdioma(
        this.registroIdiomaSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTablaIdioma();
        }
      );
    }else {
      //console.log('Selecciona un registro');
    }
  }

  eliminarDato () {
    if (this.registroAcademicoSeleccionado) {
      //console.log('Eliminando...');
      this.datoAcademicoService.deleteDatoAcademico(
        this.registroAcademicoSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTablaDatoAcademico();
        }
      );
    }else {
      //console.log('Selecciona un registro');
    }
  }

  eliminarRecomendante(): any {
    if (this.registroRecomendanteSeleccionado) {
      //console.log('Eliminando...');
      this.recomendateAcademicoService.deleteRecomendanteAcademico(
        this.registroRecomendanteSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this.onCambiosTablaRecomendanteAcademico();
        }
      );
    }else {
      //console.log('Selecciona un registro');
    }
  }


  ngOnInit(): void {
    this.onCambiosTablaIdioma();
    this.onCambiosTablaDatoAcademico();
    this.onCambiosTablaRecomendanteAcademico();
  }

  nextMethod(): boolean {
    return true;
  }

  previusMethod(): boolean {
    return true;
  }

  rowSeleccionado(registro): boolean {
    return (this.registroIdiomaSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroIdiomaSeleccionado !== registro) {
      this.registroIdiomaSeleccionado = registro;
    } else {
      this.registroIdiomaSeleccionado = null;
    }
  }

  rowSeleccionadoDos(registro): boolean {
    return (this.registroAcademicoSeleccionado === registro);
  }

  rowSeleccionDos(registro): void {
    if (this.registroAcademicoSeleccionado !== registro) {
      this.registroAcademicoSeleccionado = registro;
    } else {
      this.registroAcademicoSeleccionado = null;
    }
  }

  rowSeleccionadoRecomendante(registro): boolean {
    return (this.registroRecomendanteSeleccionado === registro);
  }

  rowSeleccionRecomendante(registro): void {
    if (this.registroRecomendanteSeleccionado !== registro) {
      this.registroRecomendanteSeleccionado = registro;
    } else {
      this.registroRecomendanteSeleccionado = null;
    }
  }

  onCambiosTablaIdioma(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registrosIdiomas = this.idiomaEstudianteService.getListaIdiomaEstudiante(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }

  onCambiosTablaDatoAcademico(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registrosAcademicos = this.datoAcademicoService
      .getListaDatoAcademico(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  onCambiosTablaRecomendanteAcademico(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registrosRecomendantesAcademicos = this.recomendateAcademicoService
      .getListaRecomendantesAcademicos(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  evaluarNivelSolicitante(nivelEstudios: string): void {
    // esta condicion es para ocultar a alumnos de maestría y/o doctorado
    // la parte de recomendantes
    ////console.log(this.nivelEstudiosEstudiante);
    if (nivelEstudios == 'Licenciatura') {
      this.soloLicenciatura = true;
    }else {
      this.soloLicenciatura = false;
    }
  }

  private prepareServices() {
    this.idiomaEstudianteService = this.catalogosServices.getIdiomaEstudiante();
    this.datoAcademicoService = this.catalogosServices.getDatoAcademico();
    this.onCambiosTablaIdioma();
    this.onCambiosTablaDatoAcademico();
  }



  modalDetalleDatoAcademico(): void {

    if (this.registroAcademicoSeleccionado) {
      this.idDatoAcademico = this.registroAcademicoSeleccionado.id;
    }
    this.modalDetalleDato.onInit();
    this.modalDetalleDato.dialog.open('lg')
  }

  modalRegistroDatosAcademicos(modo): void {
    if (modo === 'editar' && this.registroAcademicoSeleccionado) {
      this.idDatoAcademico = this.registroAcademicoSeleccionado.id;
    }else if (modo === 'agregar' ){
      this.idDatoAcademico = null;
    }
    this.modalRegistroDato.onInit();
    this.modalRegistroDato.dialog.open('lg')
  }

  modalRegistroIdiomas(modo): void {
    if (modo === 'editar' && this.registroIdiomaSeleccionado) {
      this.idIdioma = this.registroIdiomaSeleccionado.id;
    }else if (modo === 'agregar' ){
      this.idIdioma = null;
    }
    this.modalRegIdioma.liimpiarForumulario();
    this.modalRegIdioma.dialog.open('lg');

  }
/*

  modalRegistroRecomendantes(modo): void {
  }

*/

}


/*

modalDetalleDatoAcademico(): void {
  let dialog: Promise<ModalDialogInstance>;
let modalConfig = new ModalConfig('lg', true, 27);
if (this.registroAcademicoSeleccionado) {
  let idListaDatoAcademico = this.registroAcademicoSeleccionado.id;
  let modalDetallesData = new ModalDetalleDatoAcademicoData(
    this,
    idListaDatoAcademico
  );
  let bindings = Injector.resolve([
    provide(ICustomModal, { useValue: modalDetallesData }),
    provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
    provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
  ]);

  dialog = this.modal.open(
    <any>ModalDetalleDatoAcademico,
    bindings,
    modalConfig
  );
} else {
  //console.log('Seleccione un registro de Dato Académico');
}
}

modalDetalleIdiomas(): void {
  let dialog: Promise<ModalDialogInstance>;
let modalConfig = new ModalConfig('lg', true, 27);
if (this.registroIdiomaSeleccionado) {
  let idListaIdiomas = this.registroIdiomaSeleccionado.id;
  let modalDetallesData = new ModalDetalleIdiomasData(
    this,
    idListaIdiomas
  );
  let bindings = Injector.resolve([
    provide(ICustomModal, { useValue: modalDetallesData }),
    provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
    provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
  ]);

  dialog = this.modal.open(
    <any>ModalDetalleIdiomas,
    bindings,
    modalConfig
  );
} else {
  //console.log('Seleccione un registro de idiomas');
}
}

modalRegistroDatosAcademicos(modo): void {
  let idDatoAcademico: number;
if (modo === 'editar' && this.registroAcademicoSeleccionado) {
  idDatoAcademico = this.registroAcademicoSeleccionado.id;
}

let dialog: Promise<ModalDialogInstance>;
let modalConfig = new ModalConfig('lg', true, 27);

let bindings = Injector.resolve([
  provide(ICustomModal, { useValue: new ModalRegistroDatosAcademicosData(
    this.idEstudiante,
    this,
    idDatoAcademico)}),
  provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
  provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
  provide(Renderer, { useValue: this._renderer })
]);

dialog = this.modal.open(
  <any>ModalRegistroDatosAcademicos,
  bindings,
  modalConfig
);
}

modalRegistroIdiomas(modo): void {
  let idIdioma: number;
if (modo === 'editar' && this.registroIdiomaSeleccionado) {
  idIdioma = this.registroIdiomaSeleccionado.id;
}
let dialog: Promise<ModalDialogInstance>;
let modalConfig = new ModalConfig('lg', true, 27);

let bindings = Injector.resolve([
  provide(ICustomModal, { useValue: new ModalRegistroIdiomasData(
    this.idEstudiante,
    idIdioma,
    this)
  }),
  provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
  provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
  provide(Renderer, { useValue: this._renderer })
]);

dialog = this.modal.open(
  <any>ModalRegistroIdiomas,
  bindings,
  modalConfig
);
}

modalRegistroRecomendantes(modo): void {
  let idRecomendante: number;
if (modo === 'editar' && this.registroRecomendanteSeleccionado) {
  idRecomendante = this.registroRecomendanteSeleccionado.id;
}
let dialog: Promise<ModalDialogInstance>;
let modalConfig = new ModalConfig('lg', true, 27);

let bindings = Injector.resolve([
  provide(ICustomModal, { useValue: new ModalRegistroRecomendantesData(
    this.idEstudiante,
    this,
    idRecomendante)}),
  provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
  provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
  provide(Renderer, { useValue: this._renderer })
]);

dialog = this.modal.open(
  <any>ModalRegistroRecomendantes,
  bindings,
  modalConfig
);
}
*/
