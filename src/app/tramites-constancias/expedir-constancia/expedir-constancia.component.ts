import {ErrorCatalogo} from "../../services/core/error.model";
import {SolicitudConstanciaService}
  from '../../services/entidades/solicitud-constancia.service';
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {PlantillaEditor} from '../../services/entidades/plantilla-editor.model';
//import {TinyMCEComponent} from '../../utils/tiny-mce.component';
import {ItemSelects} from "../../services/core/item-select.model";
import {error} from "util";
import {getResponseURL} from "@angular/http/src/http_utils.d";
import {Component, OnInit, ElementRef, Injector, Renderer, NgZone} from '@angular/core';
import {Router, ActivatedRoute} from "@angular/router";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {SolicitudConstancia} from "../../services/entidades/solicitud-constancia.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import * as moment from "moment";
import {URLSearchParams} from "@angular/http";
import {ConfigService} from "../../services/core/config.service";
import {TinyMCEComponent} from '../../utils/tiny-mce.component';
declare var tinymce: any;


@Component({
  selector: 'app-expedir-constancia',
  templateUrl: './expedir-constancia.component.html',
  styleUrls: ['./expedir-constancia.component.css']
})
export class ExpedirConstanciaComponent {

  entidadSolicitudConstancia: SolicitudConstancia;
  solicitudConstanciaService;
  plantillaEditorService;
  comiteTutorialService;
  archivoService;
  expedienteService;
  listaPlantillas: Array<PlantillaEditor> = [];
  formulario: FormGroup;
  idComiteTutorial: number;
  disableButton: boolean = true;
  contadorVistaPrevia: number = 0;
  idPlantillaEditor;
  idExpediente;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private idSolicitudConstancia: number;
  private sub: any;

  constructor(route: ActivatedRoute, private _catalogosServices: CatalogosServices,
              private spinner: SpinnerService, private router: Router) {
    this.prepareServices();
    //this.idSolicitudConstancia = Number(params.get('id'));
    this.sub = route.params.subscribe(params => {
      this.idSolicitudConstancia = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    //console.log(this.idSolicitudConstancia);
    this.solicitudConstanciaService
        .getEntidadSolicitudConstancia(
            this.idSolicitudConstancia,
            this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadSolicitudConstancia = new SolicitudConstancia(response.json());
          let urlParams: URLSearchParams = new URLSearchParams();
          urlParams.set('criterios', 'idEstudiante.id~' +
              this.entidadSolicitudConstancia.estudiante.id + ':IGUAL');
          this.comiteTutorialService.getListaComiteTutorial(this.erroresConsultas,
              urlParams).subscribe(response => {
            if (response.json().lista.length > 0) {
              this.idComiteTutorial = response.json().lista[0].id;
            }
            this.obtenerPlantillasConstancias();
          });
        },
        error => {

        },
        () => {
          this.listaExpediente();
        }
    );
    this.formulario = new FormGroup({});
  }

  obtenerPlantillasConstancias(): void {
    let urlParams: URLSearchParams = new URLSearchParams();
    let criterios = 'isHtml~false:IGUAL';
    if (!this.idComiteTutorial) {
      criterios += ',id~7:NOT;AND'; //plantilla TituloEnTramite
    }
    if (this.entidadSolicitudConstancia.estudiante.numPeriodoActual < 2) {
      criterios += ',id~3:NOT;AND'; //plantilla PromedioUltimoPeriodoGral
    }
    urlParams.set('criterios', criterios);
    this.plantillaEditorService.getListaPlantillaEditor(this.erroresConsultas, urlParams).
    subscribe(response => {
      response.json().lista.forEach(item => {
        this.listaPlantillas.push(new PlantillaEditor(item));
      });
      tinymce.activeEditor.getBody().setAttribute('contenteditable', false);
    });
  }

  crearConstancia(modo): void {
    //console.log(modo);
    if (this.contadorVistaPrevia >= 1) {
      this.listaExpediente();
    }
    if (modo == 'vistaPrevia') {
      this.contadorVistaPrevia++;
    }
    this.spinner.start('');
    this.formulario.addControl('idEstudiante', new FormControl(
        this.entidadSolicitudConstancia.estudiante.id
    ));
    this.formulario.addControl('idSolicitudConstancia', new FormControl(
        this.entidadSolicitudConstancia.id
    ));
    this.formulario.addControl('html', new FormControl(
        tinymce.activeEditor.getContent()
        )
    );
    this.formulario.get('idEstudiante').enable();
    this.formulario.get('idSolicitudConstancia').enable();
    this.formulario.get('html').enable();
    let json = JSON.stringify(this.formulario.value, null, 2);

    //console.log('Vista previa se realiza post ');
    this.plantillaEditorService.constanciaPlantillaEditor(json, this.erroresConsultas).
    subscribe(response => {
      //console.log(response.json());
      this.idPlantillaEditor = response.json().id;
      let idArchivo = response.json().id_archivo;
      if (modo == 'expedir') {
        //console.log('Expedir ----------');
        this.expedirContanciaFinaliazar();
      }
      this.verConstancia(idArchivo);
    });
  }

  obtenerHtml(idPlantilla): void {
    if (idPlantilla != 'Selecciona...') {
      this.spinner.start('obtener');
      let json = '';
      if (idPlantilla == 7) {
        json = '{"idPlantillaEditor": "' + idPlantilla + '",' +
            '"entidad": {"Estudiantes": "' +
            this.entidadSolicitudConstancia.estudiante.id +
            '","SolicitudConstancia": "' + this.entidadSolicitudConstancia.id +
            '","ComiteTutorial": "' + this.idComiteTutorial + '"}}';
      }else {
        json = '{"idPlantillaEditor": "' + idPlantilla + '",' +
            '"entidad": {"Estudiantes": "' + this.entidadSolicitudConstancia.estudiante.id +
            '","SolicitudConstancia": "' + this.entidadSolicitudConstancia.id + '"}}';
      }
      this.plantillaEditorService.plantillaEntidadesSustituidas(json,
          this.erroresConsultas).subscribe(response => {
        tinymce.activeEditor.setContent(response.json());
        tinymce.activeEditor.getBody().setAttribute('contenteditable', true);
        this.spinner.stop('obtener');
      });
      this.disableButton = false;
    }else {
      tinymce.activeEditor.setContent('');
      tinymce.activeEditor.getBody().setAttribute('contenteditable', false);
      this.disableButton = true;
      this.spinner.stop('obtener');
    }
  }

  verConstancia(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
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
                window.open(url);
              },
              error => {
                //console.log('Error downloading the file.');
                this.spinner.stop('');
              },
              () => {
                //console.info('OK');
                this.spinner.stop('');
              }
          );
    }
  }

  expedirContanciaFinaliazar(): void {
    //console.log('Expedir contancia finaalizar proceso');
    this.solicitudConstanciaService.putSolicitudConstancia(
        this.entidadSolicitudConstancia.id, '{"idEstatus": "1215"}', this.erroresConsultas).
    subscribe(
        () => {
          this.router.navigate(['tramite-constancia','solicitud-constancia-estudio']);
        }
    );
  }

  listaExpediente(): void {
    //console.log("Lista expediente");
    let urlParams: URLSearchParams = new URLSearchParams();
    urlParams.set('criterios', 'idEstudiante~' +
        this.entidadSolicitudConstancia.estudiante.id + ':IGUAL,idSolicitudConstancia~' +
        this.entidadSolicitudConstancia.id + ':IGUAL');
    this.expedienteService.getListaExpediente(
        this.erroresConsultas,
        urlParams,
        false
    ).subscribe(
        response => {
          if (response.json().lista.length > 0) {
            this.idExpediente = response.json().lista[0].id;
            this.borrarExpediente();
          }
        },
        error => {
          console.log(error);
        },
        () => {


        });
  }
  borrarExpediente(): void {
    //console.log("borrar expediente");
    this.expedienteService.deleteExpediente(
        this.idExpediente,
        this.erroresConsultas
    ).subscribe(
        response => {
          //console.log('success');
        },
        error => {
          console.error(error);
        },
        () => {
        }
    );
  }

  private prepareServices(): void {
    this.solicitudConstanciaService = this._catalogosServices.getSolicitudConstancia();
    this.plantillaEditorService = this._catalogosServices.getPlantillaEditorService();
    this.comiteTutorialService = this._catalogosServices.getComiteTutorialService();
    this.archivoService = this._catalogosServices.getArchivos();
    this.expedienteService = this._catalogosServices.getExpedienteService();
  }

}
