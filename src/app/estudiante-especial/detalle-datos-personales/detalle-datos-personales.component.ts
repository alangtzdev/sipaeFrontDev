import {Component, OnInit, Input, ElementRef, Injector, Renderer, ViewChild} from '@angular/core';
import {EstudianteMovilidadExterna} from "../../services/entidades/estudiante-movilidad-externa.model";
import {Direccion} from "../../services/entidades/direccion.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Http, URLSearchParams} from "@angular/http";
import {Router, ActivatedRoute} from "@angular/router";
import {DireccionMovilidadExternaService} from "../../services/entidades/direccion-movilidad-externa.service";
import {AuthService} from "../../auth/auth.service";
import * as moment from "moment";
import {ConfigService} from "../../services/core/config.service";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {DireccionMovilidadExterna} from "../../services/entidades/direccion-movilidad-externa.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";

@Component({
  selector: 'app-detalle-datos-personales',
  templateUrl: './detalle-datos-personales.component.html',
  styleUrls: ['./detalle-datos-personales.component.css']
})
export class DetalleDatosPersonalesComponent implements OnInit {

  @Input() entidadEstudianteMovilidad : EstudianteMovilidadExterna;
  registroSeleccionado: Direccion;
  columnas: Array<any> = [
    { titulo: 'Tipo de dirección', nombre: 'idDireccion' },
    { titulo: 'Calle y número', nombre: 'direccion'},
    { titulo: 'Colonia', nombre: 'colonia' },
  ];
  imagenPerfil: string = 'images/usuario.png';
  public status: Object = {
    isFirstOpen: true,
    isFirstDisabled: false
  };
  private sub: any;

  private registros: Array<Direccion> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private idEstudiante: number;

  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //variables detalle direccion
  entidadDireccion: Direccion;
  idPais: number;

  constructor( private _catalogosServices: CatalogosServices,
               private elementRef: ElementRef,
               private injector: Injector, private _renderer: Renderer,
               private http: Http, private _router: Router,
               route: ActivatedRoute,
               private direccionMovilidadExternaService: DireccionMovilidadExternaService,
               private authService: AuthService) {
    //this.idEstudiante = Number(params.get('id'));
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    //this.prepareServices();
    this.onCambiosTabla();
    this.imagenPerfil = ConfigService.getUrlBaseAPI() + '/api/v1/imagenperfil/';
  }

  ngOnInit() {
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  onCambiosTabla(): void {
    if(this.idEstudiante) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
      urlParameter.set('criterios', criterioIdEstudiante);
      let resultados: {
        paginacionInfo: PaginacionInfo,
        lista: Array<DireccionMovilidadExterna>
      } = this.direccionMovilidadExternaService
        .getListaDireccionMovilidadExterna(
          this.erroresConsultas,
          urlParameter
        );
      this.registros = resultados.lista;
    }

  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

 /* private prepareServices(): void {
    this.direccionMovilidadExternaService =
      this._catalogosServices.getDireccionMovilidadExterna();
  }*/

  /*modalDetalleDireccion(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);

    if (this.registroSeleccionado) {
      let idDireccion = this.registroSeleccionado.id;
      //console.log(idDireccion);
      let modalDetallesData = new ModalDetalleDireccionData(
        this,
        idDireccion
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetallesData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleDireccion,
        bindings,
        modalConfig
      );
    }
  }*/

  modalDetalleDireccion(){
    this.entidadDireccion = null;
    this.getDireccionSeleccionada();
    this.modalDetalle.open('lg');
  }

  getDireccionSeleccionada(){
    this.direccionMovilidadExternaService
      .getEntidadDireccionMovilidadExterna(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadDireccion
          = new Direccion(response.json());
        //console.log(this.entidadDireccion);
        this.idPais = this.entidadDireccion.pais.id;
      },
      error => {
        /*if (assertionsEnabled()) {
          console.error(error);
          console.error(this.erroresConsultas);
        }*/
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log(this.entidadDireccion);
        }*/
      }
    );
  }

  mostrarDireccionPais(): boolean {
    if (this.idPais === 82) {
      return true;
    }

    return false;
  }

  cerrarModal() {
    this.modalDetalle.close();
    this.entidadDireccion = null;
  }

}
