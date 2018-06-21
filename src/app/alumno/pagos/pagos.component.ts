import { Component, OnInit } from '@angular/core';
import {PagoEstudiante} from '../../services/entidades/pago-estudiante.model';
import {ProrrogaEstudiante} from '../../services/entidades/prorroga-estudiante.model';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Router, ActivatedRoute} from '@angular/router';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-pagos',
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.css']
})

// @CanActivate(() => Seguridad.isLoggedIn())

export class PagosComponent {
  paginaActual: number = 1;
  limite: number = 10;
  registros: Array<PagoEstudiante> = [];
  registroProrrogas: Array<ProrrogaEstudiante> = [];
  columnas: Array<any> = [
    { titulo: 'Periodo', nombre: 'id' },
    { titulo: 'Forma de pago', nombre: 'idForma'},
    { titulo: 'Monto pagado', nombre: 'monto'},
    { titulo: 'Fecha de pago', nombre: 'fecha', sort: 'desc' }
  ];

  columnasProrroga: Array<any> = [
    { titulo: 'Periodo', nombre: 'id' },
    { titulo: 'Cantidad liquidada', nombre: 'cantidadLiquidada'},
    { titulo: 'Cantidad pendiente', nombre: 'cantidadPendiente'},
    { titulo: 'Fecha inicio', nombre: 'fechaInicio'},
    { titulo: 'Fecha fin', nombre: 'fechaFin'}
  ];
  registroSeleccionado: PagoEstudiante;
  usuarioLogueado: UsuarioSesion;
  idUsuarioActual;
  idEstudiante: number;
  estudianteService;
  entidadEtudiante: Estudiante;

  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'comentarios' }
  };

  idUsuarioObjetivo: number;

  // se declaran variables para consultas de base de datos
  pagoEstudianteService;
  prorrogaEstudianteService;
  private erroresConsultas: Array<Object> = [];

  constructor(private _router: Router,
              route: ActivatedRoute,
              private _catalogosService: CatalogosServices,
              private _spinner: SpinnerService,
              private authservice: AuthService
  ) {
    this.prepareServices();
    this.usuarioLogueado = authservice.getUsuarioLogueado();
    route.params.subscribe(params => {
      this.idUsuarioObjetivo = +params['usuarioObjetivo'];
    });
    ///this.idUsuarioObjetivo = _router.parent.currentInstruction.component.params.usuarioObjetivo;

    let auxiliar: number;
    // console.log('Buscando...');
    if (this.idUsuarioObjetivo) {
      console.log(this.idUsuarioObjetivo + ' ::::::::::::::::::::');
      auxiliar = this.idUsuarioObjetivo;
    } else {
      this.usuarioLogueado = authservice.getUsuarioLogueado();
      auxiliar = this.usuarioLogueado.id;
    }

    if (AuthService.isLoggedIn()) {
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'idUsuario~' + auxiliar + ':IGUAL';
      urlSearch.set('criterios', criterio);
      this.idUsuarioActual = auxiliar;
      let urlParameter: URLSearchParams = new URLSearchParams();
      urlParameter.set('criterios', 'idUsuario~' + auxiliar + ':IGUAL');
      // this._spinner.start('const');
      this.estudianteService.getListaEstudianteOpcional(
          this.erroresConsultas,
          urlParameter
      ).subscribe(
          response => {
            response.json().lista.forEach((elemento) => {
              this.entidadEtudiante = new Estudiante(elemento);
              this.idEstudiante = this.entidadEtudiante.id;
            });
          }, error => { },
          () => {
            this.onCambiosTabla();
            this.onCambiosTablaProrrogas();
          }
      );
    }
  }
  sortChanged(columna): void {
    this.columnas.forEach((column) => {
      if (columna !== column) {
        column.sort = '';
      }
    });
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      // this._spinner.start();
      this.onCambiosTabla();
      // columna.sort = '';
    }
  }

  sortChangedProrrogas(columna): void {
    this.columnasProrroga.forEach((column) => {
      if (columna !== column) {
        column.sort = '';
      }
    });
    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      // this._spinner.start();
      this.onCambiosTablaProrrogas();
      // columna.sort = '';
    }
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this._spinner.start('tabla');
    let urlSearch: URLSearchParams = new URLSearchParams();

    // let criterioIdEstudiante = 'idEstudiante~' +  + ':IGUAL';
    // urlSearch.set('criterios', criterioIdEstudiante);

    let ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    let criterio = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlSearch.set('criterios', criterio);
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());

    this.pagoEstudianteService.getListaPagoEstudiantePaginador(
        this.erroresConsultas,
        urlSearch,
        this.configuracion.paginacion
    ).subscribe(
        response => {
          this.registros = [];
          response.json().lista.forEach((pago) => {
            this.registros.push(new PagoEstudiante(pago));
          });
        },
        error => {
          this._spinner.stop('tabla');
          console.error(error);
        },
        () => {
          this._spinner.stop('tabla');
        }
    );

  }

  onCambiosTablaProrrogas(): void {
    this._spinner.start('tablaPro');
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idPagoEstudiante.idEstudiante.id~' + this.idEstudiante + ':IGUAL';

    let ordenamiento = '';
    this.columnasProrroga.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
            columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('criterios', criterio);
    // this._spinner.start();
    this.prorrogaEstudianteService.
    getListaProrrogaEstudianteRegistrado(
        this.erroresConsultas,
        urlSearch
    ).subscribe(
        response => {
          this.registroProrrogas = [];
          response.json().lista.forEach((prorroga) => {
            this.registroProrrogas.push(new ProrrogaEstudiante(prorroga));
          });
        },
        error => {
          console.error(error);
          this._spinner.stop('tablaPro');
        },
        () => {
          this._spinner.stop('tablaPro');
        }
    );
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  private prepareServices(): void {
    this.estudianteService = this._catalogosService.getEstudiante();
    this.pagoEstudianteService = this._catalogosService.getPagoEstudiante();
    this.prorrogaEstudianteService = this._catalogosService.getProrrogaEstudiante();
  }
}
