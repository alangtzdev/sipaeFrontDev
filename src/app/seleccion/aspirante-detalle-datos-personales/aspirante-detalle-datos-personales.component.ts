import {Component, OnInit, Input, ViewChild, ElementRef, Injector, Renderer} from '@angular/core';
import {Direccion} from '../../services/entidades/direccion.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {Http, URLSearchParams} from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import {ConfigService} from '../../services/core/config.service';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Usuarios} from '../../services/usuario/usuario.model';
import {DependienteEconomico} from '../../services/entidades/dependiente-economico.model';
import {AuthService} from '../../auth/auth.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';

@Component({
  selector: 'datos-personales',
  templateUrl: './aspirante-detalle-datos-personales.component.html',
  styleUrls: ['./aspirante-detalle-datos-personales.component.css']
})
export class AspiranteDetalleDatosPersonalesComponent implements OnInit {
   @ViewChild('modalDetalleDireccion')
  modalDetalleDireccion: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = false;
  backdrop: string | boolean = 'static';
  css: boolean = true;
  output: string;
  limite: number = 10;
  columnas: Array<any> = [
    { titulo: 'Tipo de dirección', nombre: 'id' },
    { titulo: 'Calle y número', nombre: 'calleYNumero'},
    { titulo: 'País', nombre: 'idPais'}
  ];
  columnasDependientes: Array<any> = [
    { titulo: 'Nombre completo', nombre: 'nombreCompleto' },
    { titulo: 'Parentesco', nombre: 'parentesco'},
    { titulo: 'Fecha de nacimiento', nombre: 'fechaNacimiento' },
    { titulo: 'Sexo', nombre: 'sexo' },
  ];

  @Input()
  entidadAspirante: Estudiante;

  @Input()
  idEstudiante: number;

  @Input()
  entidadadUsuario: Usuarios;

  @Input()
  fotoAspirante;

  @Input()
  soloLicenciatura: boolean;

  id: number;
  direccionService;
  seleccionDireccion: Direccion;
  dependienteEconomicoService;
  imagenPerfil: string = "images/usuario.png";
  rutaImagen;
  rolActualEstudiante: boolean = false;
  public oneAtATime: boolean = true;
  public status: Object = {
    isFirstOpen: true,
    isFirstDisabled: false
  };

  private descripcionError: string = '';
  private registros: Array<String> = [];
  private registrosDependientes: Array<DependienteEconomico> = [];
  private erroresConsultas: Array<Object> = [];

  // inicia variables para modal detalle direccion //
  private entidadDireccion: Direccion;
  private idPais: number = undefined;
  private validarPaisMexico: boolean = false;

  // fin variables par amodal detalle direccion //

  constructor(// params: RouteParams, private modal: Modal,
              private elementRef: ElementRef,
              private authService: AuthService,
              private injector: Injector, private _renderer: Renderer,
              public _catalogosService: CatalogosServices) {
    this.prepareServices();
    this.imagenPerfil = ConfigService.getUrlBaseAPI() + '/api/v1/imagenperfil/';
    if (authService.hasRol('ASPIRANTE')) {
      ////console.log('Es aspirante');
      this.rolActualEstudiante = true;
    }else {
      ////console.log('------------coordiancion o docencia u otro');
      this.rolActualEstudiante = false;
    }
  }

  ngOnInit(): void {
    // console.log('aspirante en datos personal: ' + this.idEstudiante);
    this.id = this.idEstudiante;
    // console.log('id: ' + this.id);
    this.getListaDomicilios();
    this.getDepenedientes();
    // console.log('booleano licencitaura??: ' + this.soloLicenciatura);
  }

  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.getListaDomicilios();
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.seleccionDireccion === registro);
  }

  obtenerDomicilio(registro): void {
    if (this.seleccionDireccion !== registro) {
      this.seleccionDireccion = registro;
      // console.log('direccion: ' + this.seleccionDireccion.id);
    } else {
      this.seleccionDireccion = null;
    }
  }

  obtenerTituloContactoDependiente(nivelEstudios: number): string {
    if (nivelEstudios === 1) {
      return 'Contacto de Emergencias';
    } else {
      return 'Dependientes y contactos';
    }
  }

  getListaDomicilios(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.id + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registros = this.direccionService
      .getListaDireccion(
        this.erroresConsultas,
        urlParameter
      ).lista;
    // console.log('resgitrsodirec: ' + this.registros);
  }

  getDepenedientes(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.id + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registrosDependientes = this.dependienteEconomicoService
      .getListaDependienteEconomico(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  prepareServices(): void {
    this.direccionService = this._catalogosService.getDireccion();
    this.dependienteEconomicoService = this. _catalogosService.getDependienteEconomico();
  }

  mostrarBotones(): boolean {
    if (this.seleccionDireccion) {
      return true;
    }else {
      return false;
    }
  }
  /*********************************
   * INICIA MODAL DETALLE DIRECCION*
   * *******************************
  */

  private abrirModalDetalleDireccion(): void {
    this.modalDetalleDireccion.open('lg');
    this.entidadDireccion = this.seleccionDireccion;
    this.idPais = this.seleccionDireccion.pais.id;

  }

  private mostrarDireccionPais(): boolean {
    if (this.idPais === 82) {
      this.validarPaisMexico = true;
      return true;
    }else {
      this.validarPaisMexico = false;
      return false;
    }
  }

  private cerrarModalDetalleDireccion(): void {
    this.entidadDireccion = undefined;
    this.idPais = undefined;
    this.validarPaisMexico = false;
    this.modalDetalleDireccion.close();
  }
}
