import {Component, OnInit, Injector} from '@angular/core';
import * as moment from 'moment';
import {PaginacionInfo} from '../../services/core/pagination-info';
import {Profesor} from '../../services/entidades/profesor.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {Router} from '@angular/router';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {URLSearchParams} from '@angular/http';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-profesores',
  templateUrl: './profesores.component.html',
  styleUrls: ['./profesores.component.css']
})
export class ProfesoresComponent implements OnInit {

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<Profesor> = [];
  columnas: Array<any> = [
    { titulo: 'Nombre completo*', nombre: 'primerApellido'},
    { titulo: 'Tipo', nombre: 'idTipo'},
    { titulo: 'Clasificación', nombre: 'idClasificacion'},
    { titulo: 'Clasificación específica', nombre: 'idClasificacionEspecifica'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'}
  ];
  registroSeleccionado: Profesor;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
      'nombre,primerApellido,segundoApellido'}
  };

  exportarExcelUrl = '';
  exportarPDFUrl = '';

  // se declaran variables para consultas de base de datos
  catProfesoresService;
  private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];

  constructor(private injector: Injector,
              public _catalogosService: CatalogosServices,
              private router: Router,
              private _spinner: SpinnerService,
              private authService: AuthService
  ) {
    this.prepareServices();
   if(sessionStorage.getItem('profesores')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('profesoresCriterios')){
        this.onCambiosTabla();
  }
    }
  ngOnInit(): void {
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
    this.columnas.forEach((column) => {
      if (columna !== column) {
        if (column.sort !== false) {
          column.sort = '';
        } else {
          column.sort = false;
        }
      }
    });

    if (columna.sort !== false) {
      if (columna.sort) {
        columna.sort = (columna.sort === 'desc') ? 'asc' : 'desc';
      } else {
        columna.sort = 'desc';
      }
      this.onCambiosTabla();
    }
  }

  filtroChanged(filtroTexto): void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    this._spinner.start('catalogoprofesores1');
    this.registroSeleccionado = null;
    let urlSearch: URLSearchParams = new URLSearchParams();
   
    let criterios = '';
    let ordenamiento = '';

    if (!sessionStorage.getItem('profesoresCriterios')) {

    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
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
  sessionStorage.setItem('profesoresCriterios', criterios);
    sessionStorage.setItem('profesoresOrdenamiento', ordenamiento);
    sessionStorage.setItem('profesoresLimite', this.limite.toString());
    sessionStorage.setItem('profesoresPagina', this.paginaActual.toString());

}
this.limite = +sessionStorage.getItem('profesoresLimite') ? +sessionStorage.getItem('profesoresLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('profesoresPagina') ? +sessionStorage.getItem('profesoresPagina') : this.paginaActual;
  
    urlSearch.set('criterios', sessionStorage.getItem('profesoresCriterios')
     ? sessionStorage.getItem('profesoresCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('profesoresOrdenamiento') 
    ? sessionStorage.getItem('profesoresOrdenamiento') : ordenamiento);
  
 urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());

    /*if (this.configuracion.filtrado.textoFiltro === ''){
     }*/
    console.log(urlSearch.get('criterios'));

    this.catProfesoresService.getListaProfesor(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        console.log(response);
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros = [];
        for (let i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          for (let i in item) {
            // //console.log(i);
            // //console.log(item[i]);
          }
          this.registros.push(new Profesor(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this._spinner.stop('catalogoprofesores1');
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        this._spinner.stop('catalogoprofesores1');
      }
    );

  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  setLimite(limite: string): void {
    this.limpiarVariablesSession();
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

  cambiarVista(vista: string): void {
    if (this.registroSeleccionado && (vista === 'editar')) {
      this.router.navigate([
        'profesores', 'editar',
        {id: this.registroSeleccionado.id}
      ]);
    }else if (this.registroSeleccionado && (vista === 'detalle')) {
      this.router.navigate([
        'profesores', 'detalles',
        {id: this.registroSeleccionado.id}
      ]);
    }else {
      if (vista === 'crear') {
        this.router.navigate(['RegistroProfesor']);
      }else {
        // para ahorrar tiempo se utilizaron alertas de javascrit,
        // estas deben ser eliminadas y sustituidas por un modal
        // alert('Niguna accion valida');
      }
    }
  }
/*  modalDetalleProfesor(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idProfesor = this.registroSeleccionado.id;
      let modalDetalleProfesorData = new ModalDetalleProfesorData(
        this,
        idProfesor
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalDetalleProfesorData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalDetalleProfesor,
        bindings,
        modalConfig
      );
    }
  }*/

  private prepareServices(): void {
    this.catProfesoresService = this._catalogosService.getProfesor();
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id !== 1007) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1007) {
      return true;
    } else {
      return false;
    }
  }

  cambiarEstatusProfesor(modo): void {
    ////console.log(modo);
    let idProfesor: number;
    let estatus;

    if (modo === 'desactivar') {
      estatus = {'idEstatus': '1008'};
    }else {
      estatus = {'idEstatus': '1007'};
    }

    if (this.registroSeleccionado) {
      this._spinner.start('catalogoprofesores2');
      idProfesor = this.registroSeleccionado.id;
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);
      ////console.log(jsonCambiarEstatus);

      this.catProfesoresService.putProfesor(
        idProfesor,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {},
        console.error,
        () => {
          this._spinner.stop('catalogoprofesores2');
          this.onCambiosTabla();
        }
      );
    }

  }

///////////////////////////////////////////////////////////////////////////////////////////////
//                                Paginador                                                  //
///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
/*    if (assertionsEnabled()) {
      //console.log('evento', evento);
      //console.log('Page changed to: ' + evento.page);
      //console.log('Number items per page: ' + evento.itemsPerPage);
      //console.log('paginaActual', this.paginaActual);
    }*/
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  obtenerFecha(fecha: string): string {
    let retorno = '';
    if (fecha) {
      retorno = moment(fecha).format('DD/MM/YYYY');
    }
    return retorno;
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        ////console.log(this.exportarExcelUrl);
        if (this.exportarExcelUrl) {
          window.open(this.exportarExcelUrl);
        } else {
          alert('no existe url para exportar a Excel');
        }
        break;
      case 'PDF':
        if (this.exportarPDFUrl) {
          window.open(this.exportarPDFUrl);
        } else {
          alert('no existe url para exportar a PDF');
        }
        break;
      default:
        alert('no se soporta la exportación a ' + tipo);
        break;
    }
  }

  hasRol(rol: string): boolean {
    return this.authService.hasRol(rol);
  }
limpiarVariablesSession() {
    sessionStorage.removeItem('profesoresCriterios');
    sessionStorage.removeItem('profesoresOrdenamiento');
    sessionStorage.removeItem('profesoresLimite');
    sessionStorage.removeItem('profesoresPagina');
  }

}
