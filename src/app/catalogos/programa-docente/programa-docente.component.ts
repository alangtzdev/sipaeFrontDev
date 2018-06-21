import {Component, OnInit, Injector, ViewChild} from '@angular/core';
import * as moment from "moment";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {ProgramaDocente} from "../../services/entidades/programa-docente.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {FormGroup} from "@angular/forms";
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/components/modal";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ArchivoService} from "../../services/entidades/archivo.service";
import {ReacreditacionService} from "../../services/catalogos/reacreditacion.service";
import {ConfigService} from "../../services/core/config.service";
import {ProgramaDocenteServices} from "../../services/entidades/programa-docente.service";
import {ReacreditacionProgramaDocente} from "../../services/entidades/reacreditacion-programa-docente.model";
import {ReacreditacionProgramaDocenteService} from "../../services/entidades/reacreditacion-programa-docente.service";

@Component({
  selector: 'app-programa-docente',
  templateUrl: './programa-docente.component.html',
  styleUrls: ['./programa-docente.component.css']
})
export class ProgramaDocenteComponent implements OnInit {
  @ViewChild('modalDetalle')
  modalDetalle: ModalComponent;
  animation: boolean = true;
  keyboard: boolean = true;
  backdrop: string | boolean = true;
  css: boolean = true;
  output: string;
  private descripcionError : string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  registros: Array<ProgramaDocente> = [];
  registros2: Array<ReacreditacionProgramaDocente> = [];
  columnas: Array<any> = [
    { titulo: 'Abreviatura*', nombre: 'abreviatura'},
    { titulo: 'Descripción*', nombre: 'descripcion'},
    { titulo: 'Nivel', nombre: 'idNivelEstudios.descripcion'},
    { titulo: 'Nomenclatura', nombre: 'nomenclatura'},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion'},
    { titulo: 'Estatus', nombre: 'idEstatus'},

  ];

  columnas2: Array<any> = [
    { titulo: 'Fecha', nombre: 'fecha' },
    { titulo: 'Año de reacreditación', nombre: 'anios' },
    { titulo: 'Nivel de reacreditación', nombre: 'nivelReacreditacion' },
  ];
  registroSeleccionado: ProgramaDocente;
  formularioActualizarRegistro: FormGroup;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas:
      'abreviatura,descripcion' }
  };

  // variables para exportar
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  // se declaran variables para consultas de base de datos
  catProgramaDocenteService;
  private erroresGuardado: Array<Object> = [];

  entidadProgramaDocente: ProgramaDocente;


  private erroresConsultas: Array<ErrorCatalogo> = [];


  constructor(//private modal: Modal,
              private injector: Injector,
              public _catalogosService: CatalogosServices,
              private router: Router, private _spinner: SpinnerService,
              private reacreditacionService: ReacreditacionProgramaDocenteService,
//              dialog: ModalDialogInstance, modelContentData: ICustomModal,
              private _archivoService: ArchivoService,
              private programadocenteService :ProgramaDocenteServices
  ) {
    this.prepareServices();
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
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }
  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';
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
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    if (this.configuracion.filtrado.textoFiltro !== '') {
      this._spinner.start("programadocentecomponent1");
    }


    let resultados: {
      paginacionInfo: PaginacionInfo,
      lista: Array<ProgramaDocente>
    } = this.catProgramaDocenteService.getListaProgramaDocente(
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
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
          this.registros.push(new ProgramaDocente(item));
        });

        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        console.error(error);
        this._spinner.stop("programadocentecomponent1");
      },
      () => {
        console.log('paginacionInfo', this.paginacion);
        console.log('registros', this.registros);
        this._spinner.stop("programadocentecomponent1");
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

  cambiarVista(vista: string): void {
    if (this.registroSeleccionado && (vista === 'editar')) {
      this.router.navigate([
        '/programa-docente/editar',
        {id: this.registroSeleccionado.id}
      ]);
    }else {
      if (vista === 'crear') {
        this.router.navigate(['/programa-docente/agregar']);
      }else {
        // para ahorrar tiempo se utilizaron alertas de javascrit,
        // estas deben ser eliminadas y sustituidas por un modal
        alert('Niguna accion valida');
      }
    }
  }
  modalDetalleProgramaDocente(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterio = 'idProgramaDocente~' + this.registroSeleccionado.id + ':IGUAL';
    urlSearch.set('criterios', criterio);
    this.modalDetalle.open('lg');
    this.getListaAcreditaciones();
/*    this.registros2 = this.reacreditacionService
      .getListaReacreditacionProgramaDocente(
        this.erroresConsultas,
        urlSearch
      ).lista;*/
    this.programadocenteService
      .getEntidadProgramaDocente(
        this.registroSeleccionado.id,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadProgramaDocente
          = new ProgramaDocente(response.json());
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
      },
      () => {
        console.log(this.entidadProgramaDocente);
      }
    );
  }
  cerrarModal(){
    this.modalDetalle.close();
  }
/*  modalDetalleProgramaDocente(): void {
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('lg', true, 27);
    if (this.registroSeleccionado) {
      let idProgramaDocente = this.registroSeleccionado.id;
      let modalProgramaDocenteDetalleData = new ModalProgramaDocenteDetalleData(
        this,
        idProgramaDocente
      );
      let bindings = Injector.resolve([
        provide(ICustomModal, { useValue: modalProgramaDocenteDetalleData }),
        provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
        provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) })
      ]);

      dialog = this.modal.open(
        <any>ModalProgramaDocenteDetalle,
        bindings,
        modalConfig
      );
    }
  }*/

  cambiarEstatusProgramaDocente(modo): void {
    ////console.log(modo);
    let idProgramadocente: number;
    let estatus;
    idProgramadocente = this.registroSeleccionado.id;
    if (modo === 'desactivar') {
      estatus = {'idEstatus': 1008};
    } else {
      estatus = {'idEstatus': 1007};
    }

    if (this.registroSeleccionado) {
      this._spinner.start("programadocentecomponent2");
      let jsonCambiarEstatus = JSON.stringify(estatus, null , 2);

      this.catProgramaDocenteService.putProgramaDocente(
        idProgramadocente,
        jsonCambiarEstatus,
        this.erroresGuardado
      ).subscribe(
        () => {}, //console.log('Success'),
        console.error,
        () => {
          this._spinner.stop("programadocentecomponent2");
          this.onCambiosTabla();
        }
      );
    }
  }

  mostarBotones(): boolean {
    if (this.registroSeleccionado) {
      return true;
    }else {
      return false;
    }

  }
  /*
   * Pendiente:se puede optimizar la validacion desde
   * la vista con [hidden]="registro?.estatus?.valor === Activado"
   * */
  ocultarOpcionActivar(): boolean {
    if (this.registroSeleccionado &&
      this.registroSeleccionado.estatus.id === 1008) {
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

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    //console.log('evento', evento);
    //console.log('Page changed to: ' + evento.page);
    //console.log('Number items per page: ' + evento.itemsPerPage);
    //console.log('paginaActual', this.paginaActual);
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

  private prepareServices(): void {
    this.catProgramaDocenteService
      = this._catalogosService.getCatalogoProgramaDocente();

/*    this.reacreditacionService =
      this.context.componenteLista._catalogosService.getReacreditacionProgramaDocente();*/

  }






  verArchivo(id: number): void {
    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("programadocentemodal1");
      this._archivoService
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
            window.open(url, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("programadocentemodal1");
          },
          () => {
            console.info('OK');
            this._spinner.stop("programadocentemodal1");
          }
        );
    }
  }

  descargarArchivo(id: number): void {

    if (id) {
      let jsonArchivo = '{"idArchivo": ' + id + '}';
      this._spinner.start("programadocentemodal2");
      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivodescargar/' +
              id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("programadocentemodal2");
          },
          () => {
            console.info('OK');
            this._spinner.stop("programadocentemodal2");
          }
        );
    }

  }

  getListaAcreditaciones(): void {  //Tabla
    let urlSearch: URLSearchParams = new URLSearchParams();

    let criterios = '';
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
      });
      urlSearch.set('criterios', criterios);
    }

    let ordenamiento = '';
    this.columnas2.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });
    urlSearch.set('ordenamiento', ordenamiento);
    urlSearch.set('limit', this.limite.toString());
    urlSearch.set('pagina', this.paginaActual.toString());
    if (this.configuracion.filtrado.textoFiltro !== '') {
      this._spinner.start("reacfedicacion1");
    }

    this.reacreditacionService.getListaReacreditacion (
      this.erroresConsultas,
      urlSearch,
      this.configuracion.paginacion
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registros2 = [];
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
          this.registros2.push(new ReacreditacionProgramaDocente(item));
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
        this._spinner.stop("reacfedicacion1");
      },
      () => {
        this._spinner.stop("reacfedicacion1");
      }
    );
  }

}

