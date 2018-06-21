import { Component, OnInit } from '@angular/core';
import {Estudiante} from "../../services/entidades/estudiante.model";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {UsuarioRolService} from "../../services/usuario/usuario-rol.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {AuthService} from "../../auth/auth.service";
import {URLSearchParams} from "@angular/http";
import {ErrorCatalogo} from "../../services/core/error.model";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";

@Component({
  selector: 'app-lista-solicitantes',
  templateUrl: './lista-solicitantes.component.html',
  styleUrls: ['./lista-solicitantes.component.css']
})
export class ListaSolicitantesComponent implements OnInit {

  // variables para la tabla
  columnas: Array<any> = [
    { titulo: 'Nombre solicitante', nombre: 'nombre', sort: false },
    { titulo: 'Programa docente', nombre: 'idProgramaDocente', sort: false },
  ];
  // definir en que columna se va a hacer el filtro
  public configuracion: any = {
    paginacion: false,
    filtrado: { textoFiltro: '', columnas: 'idProgramaDocente.descripcion' }
  };
  registros: Array<Estudiante> = [];
  registroSeleccionado: Estudiante;
  programaDocente;
  // variables para service
  folioSolicitudService;
  estudianteService;
  idUsuarioActual;
  usuarioLogueado: UsuarioSesion;
  nombreLista = 'ListaSolicitudes';
  private habilitarEdiccion: boolean = true;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private _catalogosService: CatalogosServices, private router: Router,
              private usuarioRolService: UsuarioRolService,
              private _spinner: SpinnerService,
              private _authService: AuthService) {

    this.usuarioLogueado = this._authService.getUsuarioLogueado();
    if (AuthService.isLoggedIn()) {
      //AuthService.resetRoles();
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';
      this.idUsuarioActual = this.usuarioLogueado.id;
      urlSearch.set('criterios', criterio);
      this.usuarioRolService.getListaUsuarioRol(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          paginacionInfoJson.lista.forEach((item) => {
            //AuthService.setUsuarioRoles(new UsuarioRoles(item));
          });
        },
        error => {

        },
        () => {

        }
      );
    }
    this.prepareServices();
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.habilitarBotonEditar(this.registroSeleccionado.estatus.id);
    } else {
      this.registroSeleccionado = null;
    }
  }

  redireccionarSolicitud(donde: string): void {
    switch (donde) {
      case 'editar':
        this.router.navigate(['Registro', { id: this.registroSeleccionado.id }]);
        break;
      case 'detalle':
        this.router.navigate(['aspirante', 'detalles',
          { id: this.registroSeleccionado.id , vistaAnterior: this.nombreLista}]);
        break;
    }
  }

  habilitarBotonEditar(estatus): boolean {

    if (estatus === 1004 || estatus === 1009) {
      this.habilitarEdiccion = false;
    }

    return this.habilitarEdiccion;
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
    // //console.log(this.idUsuarioActual);
    let criterio = 'idUsuario~' + this.idUsuarioActual + ':IGUAL';
    urlSearch.set('criterios', criterio);
    this._spinner.start('cargarListaSolicitudes');
    this.estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let estudiante: Estudiante;
        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
          //console.log(estudiante);
          this.registros[0] = estudiante;
        });
        this.programaDocente = estudiante.usuario.programaDocente.descripcion;
      },
      error => {

        this._spinner.stop('cargarListaSolicitudes');
      },
      () => {
        this._spinner.stop('cargarListaSolicitudes');
      }
    );
  }

  private prepareServices(): void {
    this.folioSolicitudService = this._catalogosService.getFolioSolicitud();
    this.estudianteService = this._catalogosService.getEstudiante();
    this.onCambiosTabla();
  }

  ngOnInit() {
  }

}
