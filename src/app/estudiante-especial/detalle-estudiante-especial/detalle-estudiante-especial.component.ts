import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {UsuarioRolService} from '../../services/usuario/usuario-rol.service';
import {EstudianteMovilidadExterna} from '../../services/entidades/estudiante-movilidad-externa.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {Http, URLSearchParams} from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import {AuthService} from '../../auth/auth.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {UsuarioRoles} from '../../services/usuario/usuario-rol.model';

@Component({
  selector: 'app-detalle-estudiante-especial',
  templateUrl: './detalle-estudiante-especial.component.html',
  styleUrls: ['./detalle-estudiante-especial.component.css']
})
export class DetalleEstudianteEspecialComponent implements OnInit {

  usuarioRolService;
  usuarioRol: UsuarioRoles;
  estudianteMovilidadService;
  estudianteMovilidad: EstudianteMovilidadExterna;

  private idEstudiante: number;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private sub: any;

  constructor(// params: RouteParams,
              route: ActivatedRoute,
              private _catalogosService: CatalogosServices,
              private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer,
              private http: Http, private _router: Router,
              private authService: AuthService) {
    // this.idEstudiante = Number(params.get('id'));
    this.sub = route.params.subscribe(params => {
      this.idEstudiante = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });

    this.prepareServices();
    this.obtenerEstudianteMovilidad();
    let usuarioLogueado: UsuarioSesion = authService.getUsuarioLogueado();
    this.recuperarPermisosUsuario(usuarioLogueado.id);
  }

  ngOnInit() {
  }

  obtenerEstudianteMovilidad(): void {
    this.estudianteMovilidadService
      .getEntidadEstudianteMovilidadExterna(
        this.idEstudiante,
        this.erroresConsultas
      ).subscribe(
      response =>
        this.estudianteMovilidad = new EstudianteMovilidadExterna(
          response.json()),
      error => {
        /*if (assertionsEnabled()) {
        }*/
        console.error(this.erroresConsultas);
        console.error(error);
      },
      () => {
        /*if (assertionsEnabled()) {
          //console.log(this.estudianteMovilidad);
        }*/
      }
    );
  }

  mostrarListaMovilidad(): void {

    // TODO Pendiente
    if (this.usuarioRol.id === 5) {
      this._router.navigate(['movilidad-academica', 'estudiante-especial-aceptados-rechazados']);
    } else {
      this._router.navigate(['movilidad-academica', 'estudiante-especial-aceptados-rechazados']);
    }
  }


  recuperarPermisosUsuario(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        // console.log(response.json());
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
        });
      }
    );
  }

  private prepareServices(): void {
    this.usuarioRolService =
      this._catalogosService.getUsuarioRolService();
    this.estudianteMovilidadService =
      this._catalogosService.getEstudianteMovilidadExterna();
  }

}
