import {Component, OnInit, Injector, IterableDiffers, KeyValueDiffers, ViewChild} from '@angular/core';
import {Promocion} from "../../services/entidades/promocion.model";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import * as moment from "moment";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {PromocionLgacService} from "../../services/entidades/promocion-lgac.service";
import {PromocionPeriodoEscolarService} from "../../services/entidades/promocion-periodo-escolar.service";
import {PromocionLgac} from "../../services/entidades/promocion-lgac.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {PromocionServices} from "../../services/entidades/promocion.service";
import {PromocionPeriodoEscolar} from "../../services/entidades/promocion-periodo-escolar.model";


@Component({
  selector: 'app-promociones-list',
  templateUrl: './promociones-list.component.html',
  styleUrls: ['./promociones-list.component.css']
})
export class PromocionesListComponent implements OnInit {
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                VARIABLES                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////
//******************************modals*****************************************//
  @ViewChild('modalDetalles')
  modalDetalles: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';

  //dialog: ModalDialogInstance;
  context: ModalPromocionDetallesData;
  entidadPromociones: Promocion;
  registrosPeriodos: Array <PromocionPeriodoEscolar> = [];
  registrosLgac: Array <PromocionLgac> = [];
  mostrarLgac: boolean = false;

  private erroresConsultas: Array<ErrorCatalogo> = [];
/*  columnas: Array<any> = [
    { titulo: 'Línea generadora y/o aplicación del conocimiento', nombre: 'lgac' }
  ];*/

  columnasT2: Array<any> = [
    {titulo: 'No. Semestre'},
    {titulo: 'Período escolar'},
    {titulo: 'Período inicio/fin'}
  ];
  // ************************** SERVICES**************************************//
  catalogoService;
  // ************************** TABLAS**************************************//
  registroSeleccionado:Promocion;
  registros:Array<Promocion> = [];
  columnas:Array<any> = [
    {titulo: 'Abreviatura*', nombre: 'abreviatura'},
    {titulo: 'Programa docente*', nombre: 'idProgramaDocente.descripcion'}, // pendiente nombre
    {titulo: 'Período escolar inicio', nombre: 'planEstudiosInicio'}, // pendiente nombre
    {titulo: 'Período escolar término', nombre: 'planEstudiosFin'}, // pendiente nombre
    {titulo: 'Última actualización', nombre: 'ultimaActualizacion'}, // pendiente nombre
    {titulo: 'Estatus', nombre: 'idEstatus.valor'} // pendiente nombre
  ];

  columnasLgac: Array<any> = [
        { titulo: 'Línea generadora y/o aplicación del conocimiento', nombre: 'lgac' }
  ];

  paginaActual:number = 1;
  paginacion:PaginacionInfo;
  limite:number = 10;
  maxSizePags:number = 5;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  promocion : Promocion;
  public configuracion:any = {
    paginacion: true,
    filtrado: {
      textoFiltro: '',
      columnas: 'abreviatura,idProgramaDocente.descripcion'
    } // definir bien que columa
  };

  // se declaran variables para btn exportar - dropdown
  public disabled: boolean = false;
  public status:{isopen: boolean} = {isopen: false};

  // se declaran variables para consultas de base de datos
  private erroresGuardado: Array<ErrorCatalogo> = [];

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CONSTRUCTOR                                                //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  constructor(//private modal:Modal,
              private _spinner:SpinnerService,
              private injector:Injector,
              private router:Router,
              private promocionPeriodosService : PromocionPeriodoEscolarService,
              private promocionLgacService : PromocionLgacService,
              public catalogosService:CatalogosServices,
              private promocionService : PromocionServices
  ) {
    this.prepareServices();

//    this.dialog = dialog;
//    this.context = <ModalPromocionDetallesData>modelContentData;

  if(sessionStorage.getItem('promociones')){
      let promocion='idPromocion';
      }

      if (sessionStorage.getItem('promocionesListCriterios')){
        this.onCambiosTabla();
  }
    }
  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                             SE EJECUTA AUTOMATICAMENTE                                    //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  ngOnInit():void {
    this.onCambiosTabla();
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                OBTENER LISTA TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  onCambiosTabla():void {
    this.registroSeleccionado = null;
    let urlSearch:URLSearchParams = new URLSearchParams();
    let criterios = '';
    let ordenamiento = '';

    if (!sessionStorage.getItem('promocionesListCriterios')) {
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros:Array<string> = this.configuracion.filtrado.columnas.split(',');
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

 sessionStorage.setItem('promocionesListCriterios', criterios);
    sessionStorage.setItem('promocionesListOrdenamiento', ordenamiento);
    sessionStorage.setItem('promocionesListLimite', this.limite.toString());
    sessionStorage.setItem('promocionesListPagina', this.paginaActual.toString());

}
this.limite = +sessionStorage.getItem('promocionesListLimite') ? +sessionStorage.getItem('promocionesListLimite') : this.limite;
this.paginaActual = +sessionStorage.getItem('promocionesListPagina') ? +sessionStorage.getItem('promocionesListPagina') : this.paginaActual;
  
    urlSearch.set('criterios', sessionStorage.getItem('promocionesListCriterios')
     ? sessionStorage.getItem('promocionesListCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('promocionesListOrdenamiento') 
    ? sessionStorage.getItem('promocionesListOrdenamiento') : ordenamiento);
  
 urlSearch.set('limit',this.limite.toString());
   urlSearch.set('pagina',this.paginaActual.toString());

    this._spinner.start('listaPromociones');
    this.promocionService.getListaPromocionesPag(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray:Array<number> = [];
        this.registros = [];
        for (var i = 0; i < paginacionInfoJson.paginas; i++) {
          paginasArray.push(i);
        }
        this.paginacion = new PaginacionInfo(
          paginacionInfoJson.registrosTotales,
          paginacionInfoJson.paginas,
          paginacionInfoJson.paginaActual,
          paginacionInfoJson.registrosPagina
        );
        paginacionInfoJson.lista.forEach((item) => {
          this.registros.push(new Promocion(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        console.error(error);
        this._spinner.stop('listaPromociones');
      },
      () => {
        this._spinner.stop('listaPromociones');
      }
    );
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                COMPORTAMIENTO TABLA                                        //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ************************** ordenamiento de registros**************************************//
  sortChanged(columna):void {
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

  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto):void {
    this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  limpiarFiltroBusqueda(): void {
    this.configuracion.filtrado.textoFiltro = '';
  }

  // ************************** para ponrle como una clase atributo seleccionar **************//
  rowSeleccionado(registro):boolean {
    return (this.registroSeleccionado === registro);
  }

  // ************************** Cuantos registros quieres que se muestren **************//
  setLimite(limite:string):void {
    this.limpiarVariablesSession();
    this.limite = Number(limite);
    this.onCambiosTabla();
  }

  // ************************** El usuario selecciona el registro **************//
  rowSeleccion(registro):void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CAMBIAR ESTATUS                                             //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  activarDesacticarRegistro(accion):void {
    if (this.registroSeleccionado) {
      let tipoEstatus: number = 0;
      if (accion === 'activar' && this.registroSeleccionado.estatus.valor !== 'ACTIVO') {
        tipoEstatus = 1011;
      } else if (this.registroSeleccionado.estatus.valor !== 'DESACTIVADO') {
        tipoEstatus = 1012;
      }
      if (tipoEstatus !== 0) {
        let estatus = {'idEstatus': tipoEstatus};
        let jsonFormulario = JSON.stringify(estatus, null, 2);
        this.promocionService.putPromocion(
          this.registroSeleccionado.id,
          jsonFormulario, this.erroresGuardado
        ).subscribe(
          () => {
          }, // console.log('Success'),
          console.error,
          () => {
            this.onCambiosTabla();
          }
        );
      }
    } else {
      // alert('Seleccione un registro.');
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                CAMBIAR VISTAS                                             //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  cambiarVista(vista:string):void {
    if (this.registroSeleccionado && (vista == 'editar' || vista == 'detalles')) {
      if (vista == 'detalles') {
        this.modalDetalles.open('lg');
        this.promocionService.getEntidadPromocion(
          this.registroSeleccionado.id,
          this.erroresConsultas
        ).subscribe(
          response => {
            this.entidadPromociones
              = new Promocion(response.json());
            //console.log(this.entidadPromociones);
            //console.log(':::' + this.entidadPromociones.programaDocente.nivelEstudios.descripcion );
            this.ocultarTablaLgacs(this.entidadPromociones.programaDocente.nivelEstudios.descripcion);
          },
          error => {
            console.error(error);
            console.error(this.erroresConsultas);
          },
          () => {
            if (this.entidadPromociones) {
              this.periodosEscolaresPromocion();
              this.lgacsPromocion();
            }
          }
        );
      } else {
        this.router.navigate(['promociones','editarpromocion', {id: this.registroSeleccionado.id}]);
      }
    } else {
      if (vista === 'crear') {
        this.router.navigate(['promociones','crearpromocion']);
      } else {
        // para ahorrar tiempo se utilizaron alertas de javascrit,
        // estas deben ser eliminadas y sustituidas por un modal
        // alert('Niguna accion valida');
      }
    }
  }

  cerrarModal(){
    this.registrosPeriodos = [];
    this.registrosLgac = [];
    this.modalDetalles.close();
  }

  obtenerFecha(fecha:string):string {
    let retorno = '';
    if (fecha) {

      retorno =  moment(fecha).format('DD/MM/YYYY');
    }

    return retorno;
  }

  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1012) {
      return true;
    } else {
      return false;
    }
  }

  ocultarOpcionDesactivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1011) {
      return true;
    } else {
      return false;
    }
  }

  mostrarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////

  //                       Metodos para desplegar menu de boton de exportar                    //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  public toggled(open: boolean): void {
    // console.log('Dropdown is now: ', open);
  }

  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Paginador                                                  //
///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.onCambiosTabla();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
        // console.log(this.exportarExcelUrl);
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
  limpiarVariablesSession() {
    sessionStorage.removeItem('promocionesListCriterios');
    sessionStorage.removeItem('promocionesListOrdenamiento');
    sessionStorage.removeItem('promocionesListLimite');
    sessionStorage.removeItem('promocionesListPagina');
  }


  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                INSTANCIAMIENTOS                                           //
  ///////////////////////////////////////////////////////////////////////////////////////////////
  private prepareServices(): void {
    this.catalogoService = this.catalogosService.getPromocion();
    this.promocionPeriodosService =
      this.catalogosService.getPromocionPeriodoEscolarService();
    this.promocionLgacService =
      this.catalogosService.getPromocionLgac();
  }

  ///////////////// codigo de Modal ///////////////////////////////

  ocultarTablaLgacs(descripcion: string): void {
    if(descripcion !== 'Licenciatura'){
      this.mostrarLgac = true;
    } else {
      this.mostrarLgac = false;
    }
  }
  ///////////////////////////////////////////////////////////////////////////////////////////////
//                                Metodo para formato de fecha                               //
///////////////////////////////////////////////////////////////////////////////////////////////


  //// Metodos para mostrar lista de lgacs y documentos

  periodosEscolaresPromocion(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    //console.log(this.context.idPromociones);
    let criterio = 'idPromocion~' + this.entidadPromociones.id + ':IGUAL';
    urlSearch.set('criterios', criterio);

    this._spinner.start("obtenerListaPeriodos");
      this.promocionPeriodosService.getListaPromocionPeriodoEscolarPaginacion(
        this.erroresConsultas,
        urlSearch
      ).subscribe(
        response => {
          response.json().lista.forEach((item) => {
            this.registrosPeriodos.push(new PromocionPeriodoEscolar(item));
          });
        },
        error => {
          this._spinner.stop("obtenerListaPeriodos");
        },
        () => {
          this._spinner.stop("obtenerListaPeriodos");
        }
      );
    //console.log(this.registrosPeriodos);
  }

  lgacsPromocion(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    //console.log(this.context.idPromociones);
    let criterio = 'idPromocion~' + this.entidadPromociones.id + ':IGUAL';
    urlSearch.set('criterios', criterio);
     this.registrosLgac = this.promocionLgacService.getListaPromocionLgac(
        this.erroresConsultas,
        urlSearch
      ).lista;
    //console.log(this.registrosLgac);
  }

}
export class ModalPromocionDetallesData {
  constructor(
    public componenteLista: PromocionesListComponent,
    public idPromociones: number
  ) { }
}
