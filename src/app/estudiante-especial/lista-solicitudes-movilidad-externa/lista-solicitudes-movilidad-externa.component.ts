import { Component, OnInit } from '@angular/core';
import {PaginacionInfo} from "../../services/core/pagination-info";
import {EstudianteMovilidadExterna} from "../../services/entidades/estudiante-movilidad-externa.model";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {UsuarioRolService} from "../../services/usuario/usuario-rol.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {AuthService} from "../../auth/auth.service";
import {URLSearchParams} from "@angular/http";
import {UsuarioRoles} from "../../services/usuario/usuario-rol.model";
import * as moment from "moment";

@Component({
  selector: 'app-lista-solicitudes-movilidad-externa',
  templateUrl: './lista-solicitudes-movilidad-externa.component.html',
  styleUrls: ['./lista-solicitudes-movilidad-externa.component.css']
})
export class ListaSolicitudesMovilidadExternaComponent implements OnInit {

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                VARIABLES                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  paginacion: PaginacionInfo;
  // ************************** SERVICES**************************************//
  catalogoService;
  estudianteEspecialService;
  // ************************** TABLAS**************************************//
  registroSeleccionado: EstudianteMovilidadExterna;
  registros: Array<EstudianteMovilidadExterna> = [];
  columnas: Array<any> = [
    { titulo: 'Programa docente', nombre: 'id', sort: 'asc' },
    { titulo: 'Investigador anfitrión', nombre: 'valor', sort: false }, // pendiente nombre
    { titulo: 'Última actualización', nombre: 'idCatalogo', sort: false }, // pendiente nombre
  ];
  paginaActual: number = 1;
  limite: number = 10;
  idUsuarioActual;
  usuarioLogueado: UsuarioSesion;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'id' } // definir bien que columa
  };

  // se declaran variables para consultas de base de datos
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private errores: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<Object> = [];
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CONSTRUCTOR                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  constructor(public catalogosService: CatalogosServices,
              private router: Router,
              private usuarioRolService: UsuarioRolService,
              private _spinner: SpinnerService,
              private _authService: AuthService) {
    this.usuarioLogueado = this._authService.getUsuarioLogueado();
    if (AuthService.isLoggedIn()) {
      this._spinner.start('usuarioLogueadoSpinner');
      //Seguridad.resetRoles();
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';
      this.idUsuarioActual = this.usuarioLogueado.id;
      ////console.log(this.idUsuarioActual);
      urlSearch.set('criterios', criterio);
      this.usuarioRolService.getListaUsuarioRol(
        this.errores,
        urlSearch
      ).subscribe(
        response => {
          let paginacionInfoJson = response.json();
          paginacionInfoJson.lista.forEach((item) => {
            //AuthService.setUsuarioRoles(new UsuarioRoles(item));
          });
        },
        error => {
          this._spinner.stop('usuarioLogueadoSpinner');
        },
        () => {
          this._spinner.stop('usuarioLogueadoSpinner');
        }
      );
    }
    this.prepareServices();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                             SE EJECUTA AUTOMATICAMENTE                                    //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit(): void {
    this.onCambiosTabla();
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                OBTENER LISTA TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  onCambiosTabla(): void {

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE';
      });
      urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    let criterio = 'idUsuario~' + this.idUsuarioActual + ':IGUAL';
    urlSearch.set('criterios', criterio);

    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    /*
     let resultados: {
     paginacionInfo: PaginacionInfo,
     lista: Array <EstudianteMovilidadExterna>
     } = this.catalogoService.getEstudianteMovilidadExterna()
     .getListaEstudianteMovilidadExterna(
     this.erroresConsultas,
     urlSearch,
     this.configuracion.paginacion
     );

     this.registros = resultados.lista;
     //console.log('Regiistros: ' + this.registros.length);
     */
    this.estudianteEspecialService.getListaEstudianteMovilidadExterna(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        this.registros = [];
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new EstudianteMovilidadExterna(item));
        });
      },
      error => {

      },
      () => {

      }
    );
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                COMPORTAMIENTO TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** ordenamiento de registros**************************************//
  sortChanged(columna): void {
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }
  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  // ************************** para ponrle como una clase atributo seleccionar **************//
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  // ************************** El usuario selecciona el registro **************//
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                INSTANCIAMIENTOS                                           //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  abrir(): void {
    /*TODO PENDIENTE*/
    if (this.registroSeleccionado) {
      this.router.navigate([ 'movilidad','registro-admision', {id: this.registroSeleccionado.id}]);
    }
  }
  detalle(): void {
    if (this.registroSeleccionado) {
      this.router.navigate([ 'movilidad-academica', 'detalle' ,
        {id: this.registroSeleccionado.id}]);
    }
  }
  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {

      retorno = moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }
  ocultarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
  }
  private prepareServices(): void {
    this.estudianteEspecialService = this.catalogosService.getEstudianteMovilidadExterna();
  }

}
