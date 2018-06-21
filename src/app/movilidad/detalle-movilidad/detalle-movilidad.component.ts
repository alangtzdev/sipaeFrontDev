import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {MovilidadCurricular} from "../../services/entidades/movilidad-curricular.model";
import {InformacionComplementariaMovilidad} from "../../services/entidades/informacion-complementaria-movilidad.model";
import {DocumentoMovilidadCurricular} from "../../services/entidades/documento-movilidad-curricular.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ConfigService} from "../../services/core/config.service";
import {URLSearchParams} from "@angular/http";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-detalle-movilidad',
  templateUrl: './detalle-movilidad.component.html',
  styleUrls: ['./detalle-movilidad.component.css']
})
export class DetalleMovilidadComponent implements OnInit {
  idMovilidad: number;
  entidadMovilidadCurricular: MovilidadCurricular;
  entidadInformacionComplementaria: InformacionComplementariaMovilidad;
  documentos: Array<DocumentoMovilidadCurricular> = [];
  documentoMovilidadService;
  informacionComplementariaService;
  movilidadCurricularService;
  archivoService;
  catalogosService;
  vistaAnteriorRegresar;
  private erroresConsulta: Array<Object> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private sub: any;

  constructor(private elementRef: ElementRef, route: ActivatedRoute,
              private injector: Injector, private _renderer: Renderer,
              private _router: Router, private _catalogosService: CatalogosServices,
              private _spinner: SpinnerService) {
    //this.vistaAnteriorRegresar = params.get('vistaAnterior');
    //this.idMovilidad = _router.parent.currentInstruction.component.params.id;
    this.sub = route.params.subscribe(params => {
      this.idMovilidad = +params['id']; // (+) converts string 'id' to a number
      this.vistaAnteriorRegresar = params['vistaAnterior'];

      // In a real app: dispatch action to load the details here.
    });
    console.log(this.vistaAnteriorRegresar);
    this.prepareServices();
  }

  ngOnInit() {
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('descargarArchivo');
      this.archivoService
        .generarTicket(jsonArchivo, this.erroresConsulta)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop('descargarArchivo');
          },
          () => {
            //console.info('OK');
            this._spinner.stop('descargarArchivo');
          }
        );
    }
  }

  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start('verArchivo');
      this.archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop('verArchivo');
          },
          () => {
            console.info('OK');
            this._spinner.stop('verArchivo');
          }
        );
    }
  }

  regresarListaHistorialMovilidad(): any {
    this._router.navigate(['movilidad-academica', this.vistaAnteriorRegresar]);
  }

  private prepareServices(): void {
    this.catalogosService = this._catalogosService;
    this.archivoService = this._catalogosService.getArchivos();
    this.movilidadCurricularService = this.catalogosService.getMovilidadCurricularService();
    this.documentoMovilidadService =
      this.catalogosService.getDocumentoMovilidadCurricularService();
    this.informacionComplementariaService =
      this.catalogosService.getInformacionComplementatiaService();
    this.obtenerMovilidad();
  }

  private obtenerMovilidad(): void {
    this._spinner.start('obtenerMovilidad');
    this.movilidadCurricularService.getMovilidad(
      this.idMovilidad,
      this.erroresConsulta
    ).subscribe(
      response => {
        this.entidadMovilidadCurricular = new MovilidadCurricular(response.json());
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idMovilidad.id~' +
          this.entidadMovilidadCurricular.id + ':IGUAL');
        this.documentoMovilidadService
          .getListaDocumentoMovilidadCurricularOpcional(
            this.erroresConsulta,
            urlParameter
          ).subscribe(
          response => {
            response.json().lista.forEach((documento) => {
              this.documentos.push( new DocumentoMovilidadCurricular(documento));
            });
          },
          error => {
            this._spinner.stop('obtenerMovilidad');
          },
          () => {
            this._spinner.stop('obtenerMovilidad');
            this.obtenerInformacionComplementaria();
          }
        );
      }
    );
  }

  private obtenerInformacionComplementaria(): void {
    this._spinner.start('informacionComplementaria');
    this.movilidadCurricularService.getMovilidad(
      this.idMovilidad,
      this.erroresConsulta
    ).subscribe(
      response => {
        this.entidadMovilidadCurricular = new MovilidadCurricular(response.json());
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idMovilidad.id~' +
          this.entidadMovilidadCurricular.id + ':IGUAL');
        this.informacionComplementariaService
          .getListaInformacionComplementariaMovilidadOpcional(
            this.erroresConsulta,
            urlParameter
          ).subscribe(
          response => {
            response.json().lista.forEach((informacion) => {
              this.entidadInformacionComplementaria =
                new InformacionComplementariaMovilidad(informacion);
            });
          },
          error => {
            this._spinner.stop('informacionComplementaria');
          },
          () => {
            this._spinner.stop('informacionComplementaria');
          }
        );
      }
    );
  }

}
