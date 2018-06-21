import {Component, OnInit, Renderer, Injector, ElementRef} from '@angular/core';
import {DocumentoMovilidadCurricular} from "../../services/entidades/documento-movilidad-curricular.model";
import {URLSearchParams} from "@angular/http";
import {MovilidadCurricular} from "../../services/entidades/movilidad-curricular.model";
import {ConfigService} from "../../services/core/config.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-detalle-movilidad-alumno',
  templateUrl: './detalle-movilidad-alumno.component.html',
  styleUrls: ['./detalle-movilidad-alumno.component.css']
})
export class DetalleMovilidadAlumnoComponent implements OnInit {
  idMovilidad: number;
  movilidad: MovilidadCurricular;
  documentos: Array<DocumentoMovilidadCurricular> = [];
  documentoMovilidadService;
  movilidadCurricularService;
  archivoService;
  catalogosService;
  private erroresConsulta: Array<Object> = [];
  private sub: any;

  constructor(private elementRef: ElementRef,
              private injector: Injector,
              route: ActivatedRoute,
              private _renderer: Renderer,
              private _router: Router,
              private _catalogosService: CatalogosServices,
              private _spinner: SpinnerService) {
    this.sub = route.params.subscribe(params => {
      this.idMovilidad = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    this.prepareServices();
  }

  descargarArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("detallesmovilidad1");
      this.archivoService
        .generarTicket(jsonArchivo, this.erroresConsulta)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivodescargar/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("detallesmovilidad1");
          },
          () => {
            console.info('OK');
            this._spinner.stop("detallesmovilidad1");
          }
        );
    }
  }

  private prepareServices(): void {
    //console.log('Movilidad No. ' + this.idMovilidad);
    this.catalogosService = this._catalogosService;
    this.archivoService = this._catalogosService.getArchivos();
    this.movilidadCurricularService = this.catalogosService.getMovilidadCurricularService();
    this.documentoMovilidadService =
      this.catalogosService.getDocumentoMovilidadCurricularService();
    this.getData();
  }

  private getData(): void {
    this.movilidadCurricularService.getMovilidad(
      this.idMovilidad,
      this.erroresConsulta
    ).subscribe(
      response => {
        this.movilidad = new MovilidadCurricular(response.json());
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idMovilidad.id~' + this.movilidad.id + ':IGUAL');
        //console.log(this.movilidad);
        this.documentoMovilidadService
          .getListaDocumentoMovilidadCurricularOpcional(
            this.erroresConsulta,
            urlParameter
          ).subscribe(
          response => {
            //console.log(response.json());
            response.json().lista.forEach((documento) => {
              //console.log(documento);
              this.documentos.push( new DocumentoMovilidadCurricular(documento));
            });
          }
        );
      }
    );
  }


  ngOnInit() {
  }

}
