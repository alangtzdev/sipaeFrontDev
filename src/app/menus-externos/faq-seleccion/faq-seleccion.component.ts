import { Component, OnInit } from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";
import {PreguntaFrecuenteService} from "../../services/entidades/pregunta-frecuente.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {FormGroup, FormControl} from "@angular/forms";

@Component({
  selector: 'app-faq-seleccion',
  templateUrl: './faq-seleccion.component.html',
  styleUrls: ['./faq-seleccion.component.css']
})
export class FaqSeleccionComponent implements OnInit {
  catalogoServices;
  programaDocenteService;
  idProgramaDocente: number;
  registros: Array<PreguntaFrecuenteService> = [];
  generales: Array<PreguntaFrecuenteService> = [];
  programas: Array<ProgramaDocente> = [];
  formulario: FormGroup;
  rgb: string;
  programa_descripcion: string;
  private erroresConsultas: Array<Object> = [];
  private sub: any;

  constructor(
    private _catalogosService: CatalogosServices,
    private router: Router,
    route: ActivatedRoute,
    public spinner: SpinnerService/*,
    params: RouteParams*/
  ) {
//    this.idProgramaDocente = parseInt(params.get('id'));
    this.sub = route.params.subscribe(params => {
      this.idProgramaDocente = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.prepareServices();
    this.getProgramas();
    this.getPreguntasFrecuentes();
    this.formulario = new FormGroup({
      opcion: new FormControl('')
    });
  }

  getProgramaDocente(idPrograma: number): void {
    this.programaDocenteService.getEntidadProgramaDocente(
      idPrograma, this.erroresConsultas).subscribe(response => {
      this.rgb = response.json().color_rgb;
      this.programa_descripcion= response.json().descripcion;
    });
  }

  getPreguntasFrecuentes(): void {
    //    SE OBTIENE CATALOGO DE PROGRAMA DOCENTE
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus~1007:IGUAL;AND,idClasificacion~1:IGUAL;AND');
    this.catalogoServices.getListaPreguntaFrecuente(this.erroresConsultas, urlParameter).
    subscribe(response => {
      this.generales = response.json().lista;
      this.getPreguntas(this.idProgramaDocente);
    });
  }

  getPreguntas(idOpcion): void {
    if (idOpcion) {
      this.spinner.start("faqseleccion");
      (<FormControl>this.formulario.controls['opcion']).setValue(idOpcion);
      let urlParameter: URLSearchParams = new URLSearchParams();
      if (idOpcion == -1) {
        urlParameter.set('criterios', 'idEstatus~1007:IGUAL;AND,idClasificacion~3:IGUAL');
        this.rgb = 'cfd5d7';
        this.programa_descripcion ='';
      } else {
        urlParameter.set('criterios', 'idEstatus~1007:IGUAL;AND,idClasificacion~2:IGUAL' +
          ';AND,idProgramaDocente.id~' + idOpcion + ':IGUAL;AND');
        this.getProgramaDocente(idOpcion);
      }
      this.catalogoServices.getListaPreguntaFrecuente(this.erroresConsultas, urlParameter).
      subscribe(response => {
        this.registros = response.json().lista;
        this.spinner.stop("faqseleccion");
      });
    }
  }

  getProgramas(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    this.programaDocenteService.getListaProgramaDocente(this.erroresConsultas, urlSearch).
    subscribe(response => {
      this.programas = response.json().lista;
    });
  }

  abrir(): void {
    this.router.navigate([ '/seleccion-colsan/registro-solicitante']);
  }

  private prepareServices(): void {
    this.catalogoServices = this._catalogosService.getPreguntasFrecuentes();
    this.programaDocenteService = this._catalogosService.getCatalogoProgramaDocente();
  }

  ngOnInit() {
  }

}
