import {Component, ElementRef, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Documento} from "../../../services/entidades/documento.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {ConvocatoriaTiposDocumentoService} from "../../../services/entidades/convocatoria-tipos-documentot.service";
import {Estudiante} from "../../../services/entidades/estudiante.model";
import {URLSearchParams} from "@angular/http";
import {ModalAgregarDocComponent} from "../modal-agregar-doc/modal-agregar-doc.component";

@Component({
  selector: 'app-documentacion',
  templateUrl: './documentacion.component.html',
  styleUrls: ['./documentacion.component.css']
})
export class DocumentacionComponent implements OnInit {


  router: Router;
  documentacionService;
  archivoService;
  habilitarBotonEnviar: boolean = true;
  idConvocatoria: number;
  columnas: Array<any> = [
    { titulo: 'Tipo de documento', nombre: 'idTipoDocumento', sort: false },
    { titulo: 'Archivo', nombre: 'idArchivo', sort: false },
    { titulo: 'Fecha de actualización', nombre: 'fechaActualizacion', sort: false},
    { titulo: 'Estatus', nombre: 'valido', sort: false}
  ];
  private exportarFormato = '';
  private alertas: Array<Object> = [];
  private noDocConvocatoria: number = 0;
  private registroSeleccionado: Documento;
  private registroDocuemntos: Array<Documento> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresEliminado: Array<ErrorCatalogo> = [];
  private _estudianteService;

    @ViewChild("modalAgregaDoc")
    modalAgregaDoc: ModalAgregarDocComponent;
   idEstudiante: number;
   estudiante: Estudiante;
   cantidadDocCon;

  constructor(route: ActivatedRoute, private elementRef: ElementRef,
              public _catalogosServices: CatalogosServices,
              private injector: Injector, private _renderer: Renderer, _router: Router,
              private _spinner: SpinnerService,
              private _convocatoriaDocumentos: ConvocatoriaTiposDocumentoService) {
    let params;
    route.params.subscribe(parms => {
      params = parms;
      // In a real app: dispatch action to load the details here.
    });
    this.idEstudiante = params.id;
    this.router = _router;
    this.prepareService();
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this.obtenerDocumentos();
  }


  eliminarDocumento(): void {
    if (this.registroSeleccionado) {
      let idDocumento = this.registroSeleccionado.id;
      let idArchivo = this.registroSeleccionado.archivo.id;
      this._spinner.start("eliminarDocumento");
      this.documentacionService.deleteDocumento(
        idDocumento,
        this.erroresEliminado
      ).subscribe(
        response => {
          this.archivoService.deleteArchivo(
            idArchivo,
            this.erroresEliminado
          ).subscribe(
            response => {},
            error => {
              //console.log(error);
              this._spinner.stop("eliminarDocumento");
            },
            () => {
              this._spinner.stop("eliminarDocumento");
              this.registroSeleccionado = null;
              this.onCambiosTabla();
              this.addErrorsMesaje
              ('Se eliminó correctamente el documento.', 'danger');
            }
          );
        }
      );
    }
  }

  obtenerDocumentos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this._spinner.start("obtenerDocumentos");
    this.documentacionService
      .getListaDocumentosOpcional(
        this.erroresConsultas,
        urlParameter
      ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registroDocuemntos = [];
        paginacionInfoJson.lista.forEach((item) => {
          this.registroDocuemntos.push(new Documento(item));
        });
      },
      error => {
        console.error(error);
        this._spinner.stop("obtenerDocumentos");
      },
      () => {
        this._spinner.stop("obtenerDocumentos");
      }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  getAspirante(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  getEntidadEstudianteConvocatori(): void {
    //this._spinner.start();
    this._estudianteService.getEntidadEstudiante(
      this.idEstudiante
    ).subscribe(
      response => {
        this.idConvocatoria =
          new Estudiante(response.json()).convocatoria.id;
        //console.log(response.json());

        this.obtenerCantidadDocumentosConvocatoria();
      },
      error => {
      },
      () => {
      }
    );
  }

  obtenerCantidadDocumentosConvocatoria(): void {
    let idConvocatoria = this.idConvocatoria;
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante;

    if(this.estudiante.datosPersonales.paisOrigen.valor == 'MÉXICO')
    {
      //Clasificacion igual a Nacional y Ambos
      criterioIdEstudiante = 'idClasificacion~1236:IGUAL;OR,idClasificacion~1238:IGUAL;ORGROUPAND';
    }
    else
    {
      //Clasificacion igual a Extranjero y Ambos
      criterioIdEstudiante = 'idClasificacion~1237:IGUAL;OR,idClasificacion~1238:IGUAL;ORGROUPAND';
    }

    criterioIdEstudiante += ',idConvocatoria~' + idConvocatoria + ':IGUAL';

    urlParameter.set('criterios', criterioIdEstudiante);
    this.cantidadDocCon =
      this._convocatoriaDocumentos.getSelectConvocatoriaCriterios(
        this.erroresConsultas,
        urlParameter
      );
  }

  aceptaDatos(valido: boolean, numeroDoc: number): void {
    if (numeroDoc > this.noDocConvocatoria) {
      this.habilitarBotonEnviar = valido;
    }
  }

  habilitarBoton(): boolean {
    return this.habilitarBotonEnviar;
  }


  finishMethod(): boolean {
    return true;
  }

  previusMethod(): boolean {
    return true;
  }

  estadoEvaluacionDocumentacion(valor: boolean): string {
    var cls;

    if (valor === true) {
      cls = 'Validado';
    }else if (valor === false) {
      cls = 'Incumple';
    }else {
      cls = 'Por validar';
    }

    return cls;
  }

  ocultarBotonEliminar(): boolean {
    if (this.registroSeleccionado && !this.registroSeleccionado.valido) {
      return true;
    }else {
      return false;
    }
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
  }

  descargarSolicitud(): void {
    this._spinner.start("descargarSolicitud");
    this._estudianteService.getFormatoPdf(
      this.idEstudiante,
      this.erroresConsultas,
      'SolicitudAdmision'
    ).subscribe(
      response => {
        this.exportarFormato = response.json();
        //console.log(this.exportarFormato);
      },
      error => {
        console.error(error);
        this._spinner.stop("descargarSolicitud");
      },
      () => {
        window.open(this.exportarFormato);
        this._spinner.stop("descargarSolicitud");
      }
    );
  }

  public getIdTipoDocumentos() {
    return this.registroDocuemntos;
  }

  private prepareService(): void {
    this._estudianteService = this._catalogosServices.getEstudiante();
    this.documentacionService = this._catalogosServices.getDocumentos();
    this.archivoService = this._catalogosServices.getArchivos();
    this.getEntidadEstudianteConvocatori();
  }

  ngOnInit() {
  }

  modalAgregarDocumento(): void {
    this.modalAgregaDoc.prepareServices();
    this.modalAgregaDoc.dialog.open("lg");
  }

}

/*
modalAgregarDocumento(): void {
  let dialog: Promise<ModalDialogInstance>;
let modalConfig = new ModalConfig('lg', true, 27);

let bindings = Injector.resolve([
  provide(ICustomModal, { useValue: new ModalAgregarDocumentoData(
    this,
    this.idEstudiante,
    this.idConvocatoria
  )
  }),
  provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
  provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
  provide(Renderer, { useValue: this._renderer })
]);

dialog = this.modal.open(
  <any>ModalAgregarDocumento,
  bindings,
  modalConfig
);
}
*/
