import {Component, OnInit, ElementRef, Injector, Renderer} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {PaginacionInfo} from "../../services/core/pagination-info";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {FormGroup, FormControl} from "@angular/forms";
import {ItemSelects} from "../../services/core/item-select.model";
import {Router} from "@angular/router";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {NacionalidadService} from "../../services/catalogos/nacionalidad.service";
import {ErrorCatalogo} from "../../services/core/error.model";

@Component({
  selector: 'app-solicitante',
  templateUrl: './solicitante.component.html',
  styleUrls: ['./solicitante.component.css']
})
export class SolicitanteComponent implements OnInit {
  criteriosCabezera: string = '';
  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  maxSizePags: number = 5;
  estudiante: Estudiante;
  registros: Array<Estudiante> = [];
  columnas: Array<any> = [
    { titulo: 'Folio COLSAN ', nombre: 'id'},
    { titulo: 'Nombre del solicitante*', nombre: 'idDatosPersonales'},
    { titulo: 'Programa Docente', nombre: 'idPromocion', sort: false},
    { titulo: 'Última actualización', nombre: 'ultimaActualizacion', sort: false},
    { titulo: 'Solicitud de admisión*', nombre: 'idEstatus'}
  ];
  registroSeleccionado: Estudiante;
  exportarExcelUrl = '';
  exportarPDFUrl = '';
  vistaARegresar = 'ListaSolicitantes';

  estudianteService;
  botonValido: boolean = false;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idDatosPersonales.nombre,idDatosPersonales.primerApellido,idDatosPersonales.segundoApellido,' +
    'idPromocion.idProgramaDocente.descripcion,' +
    'idEstatus.valor'}
  };

  // para validacion del formulario
  formulario: FormGroup;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};
  validacionActiva: boolean = false;
  // datos "simulados" para los combo
  opcionesSelectProgramaDocente: Array<ItemSelects>;
  opcionesSelectPromocion: Array<ItemSelects>;
  opcionesSelectNacionalidad: Array<ItemSelects>;
  opcionSelectNacionalidad: Array<ItemSelects> = [];
  estatusCatalogoService;

  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(//private modal: Modal,
              private elementRef: ElementRef, params: Router ,
              private injector: Injector,
              private nacionalidadService: NacionalidadService,
              private _renderer: Renderer,
              private router: Router,
              private _catalogosService: CatalogosServices,
              private spinnerService: SpinnerService) {
    this.prepareServices();
    this.obtenerCatalogo();

    if (sessionStorage.getItem('solicitanteIdPromocion')) {
      let promocion = 'idPromocion';
    }

    if (sessionStorage.getItem('solicitanteCriterios')) {
      this.onCambiosTabla();
    } 

  }

  private prepareServices(): void {
    this.estatusCatalogoService = this._catalogosService;
    this.estudianteService =
      this._catalogosService.getEstudiante();
  }

  activarBotonBusqueda(numero: number): any {
    if (numero === 1) {
      this.botonValido = true;
    }else {
      this.botonValido = false;
    }
  }

  cambioProgramaDocenteFiltro(idProgramaDocente: number): void {
    //console.log('idProgramaDocente', idProgramaDocente);
    let urlParameter: URLSearchParams = new URLSearchParams();
//    urlParameter.set('ordenamiento','abreviatura:ASC, consecutivo:ASC');
    urlParameter.set('criterios', 'idProgramaDocente~' + idProgramaDocente + ':IGUAL');
    this.opcionesSelectPromocion = this.estatusCatalogoService.getPromocion().
    getSelectPromocion(this.erroresConsultas, urlParameter);
  }



  buscarCriteriosCabezera(
    idProgramaDocente: number,
    idPromocion: number,
    idNacionalidad: number
  ): void {
  this.limpiarVariablesSession(); 
    this.criteriosCabezera = '';

    if (idProgramaDocente) {
      this.criteriosCabezera = this.criteriosCabezera + 'idPromocion.idProgramaDocente~'
        + idProgramaDocente + ':IGUAL;AND';
    }

    if (idPromocion) {
      this.criteriosCabezera = this.criteriosCabezera + ',idPromocion~'
        + idPromocion + ':IGUAL;AND';
    }
    if (idNacionalidad) {
      this.criteriosCabezera = this.criteriosCabezera +
        ',idDatosPersonales.idNacionalidad.id~' + idNacionalidad + ':IGUAL;AND';
    }
    //console.log(this.criteriosCabezera);
    sessionStorage.setItem('solicitanteIdPromocion', idPromocion.toString());
    sessionStorage.setItem('solicitanteIdProgramaDocente', idProgramaDocente.toString());
    sessionStorage.setItem('solicitanteIdNacionalidad', idNacionalidad.toString());
   // console.log(sessionStorage); 
    this.onCambiosTabla();
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid) {
      return true;
    }
    return false;
  }

  errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          resultado += this.mensajeErrors[errorType];
        }
      }
    }
    return resultado;
  }

  // debug del formulario no usar para produccion
  get cgValue(): string {
    return JSON.stringify(this.formulario.value, null, 2);
  }

  ngOnInit(): void {
    this.onCambiosTabla();
  }

  onCambiosTabla(): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    //console.log('intentando hacer una busqueda' + this.criteriosCabezera);
    let criterios = 'idEstatus.id~1010:IGUAL;OR,idEstatus.id~1014:IGUAL;OR';
    let ordenamiento = '';
    urlSearch.set('criterios', criterios);
    if (!sessionStorage.getItem('solicitanteCriterios')) {
    if (this.criteriosCabezera !== '') {
      criterios = criterios + 'GROUPAND,' + this.criteriosCabezera;
      urlSearch.set('criterios', criterios);
      //console.log('criterios cabezera: ' + criterios);
    }
    //console.log(this.configuracion.filtrado);
    //console.log(this.configuracion.filtrado.textoFiltro);
    if (this.configuracion.filtrado && this.configuracion.filtrado.textoFiltro !== '') {
      let filtros: Array<string> = this.configuracion.filtrado.columnas.split(',');
      //console.log(filtros);
      let criteriosAux = criterios;
      criterios = '';
      filtros.forEach((filtro) => {
        criterios = criterios + ((criterios === '') ? '' : ',') + filtro + '~' +
          this.configuracion.filtrado.textoFiltro + ':LIKE;OR';
        //console.log('cirterios en el forEach: ' + criterios);
      });
      criteriosAux ? criterios = criterios + 'GROUPAND,' +
          criteriosAux : criterios = criterios;
      //console.log(criterios);
      urlSearch.set('criterios', criterios);
    }
    ordenamiento = '';
    this.columnas.forEach((columna) => {
      if (columna.sort) {
        ordenamiento = ordenamiento + ((ordenamiento === '') ? '' : ',') +
          columna.nombre + ((columna.sort === 'asc') ? ':ASC' : ':DESC');
      }
    });

    sessionStorage.setItem('solicitanteCriterios', criterios);
    sessionStorage.setItem('solicitanteOrdenamiento', ordenamiento);
    sessionStorage.setItem('solicitanteLimite', this.limite.toString());
    sessionStorage.setItem('solicitantePagina', this.paginaActual.toString());

    }


    urlSearch.set('criterios', sessionStorage.getItem('solicitanteCriterios')
     ? sessionStorage.getItem('solicitanteCriterios') : criterios);
    urlSearch.set('ordenamiento', sessionStorage.getItem('solicitanteOrdenamiento') ? sessionStorage.getItem('solicitanteOrdenamiento') : ordenamiento);
    urlSearch.set('limit', sessionStorage.getItem('solicitanteLimite') ? sessionStorage.getItem('solicitanteLimite') : this.limite.toString());
    urlSearch.set('pagina', sessionStorage.getItem('solicitantePagina') ? sessionStorage.getItem('solicitantePagina') : this.paginaActual.toString());
    //console.log(urlSearch);
    this.spinnerService.start("solicitante1");
    this.estudianteService.getListaEstudianteOpcional(
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
          this.estudiante = new Estudiante(item);
          //if(this.estudiante.estatus === ){
          this.registros.push(new Estudiante(item));
          //}
        });
        this.exportarExcelUrl = paginacionInfoJson.exportarEXCEL;
        this.exportarPDFUrl = paginacionInfoJson.exportarPDF;
      },
      error => {
/*        if (assertionsEnabled()) {
          console.error(error);
        }*/
        this.spinnerService.stop("solicitante1");
      },
      () => {
/*        if (assertionsEnabled()) {
          //console.log('paginacionInfo', this.paginacion);
          //console.log('registros', this.registros);
        }*/
        //this.criteriosCabezera = '';
        this.spinnerService.stop("solicitante1");
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

  filtroChanged(filtroTexto): void {
  this.limpiarVariablesSession();
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.onCambiosTabla();
  }

  sortChanged(columna): void {
  this.limpiarVariablesSession();
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
      this.onCambiosTabla();
      // columna.sort = '';
    }
  }

  modalDetalles(): void {
    if (this.registroSeleccionado) {
      //console.log('id aspirante: ' + this.registroSeleccionado.id);
      //console.log(this.vistaARegresar);
      this.router.navigate(['Detalles',  //.parent.navigate(['Detalles',
        {id: this.registroSeleccionado.id, vistaAnterior: this.vistaARegresar,
          vistaSolicitante: true}]);
    } else {
      alert('Seleccione un solicitante');
    }
  }

  cambiarPagina(evento: any): void {
  this.limpiarVariablesSession();
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

  exportar(tipo): void {
    switch (tipo) {
      case 'Excel':
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

  aspiranteDetalles(): void {
    if ( this.rowSeleccionado ) {
      //console.log('id aspirante: ' + this.registroSeleccionado.id);
      this.router.navigate(['solicitante','detalles', //.parent.navigate(['Detalles',
        {id: this.registroSeleccionado.id, vistaAnterior: this.vistaARegresar,
          vistaSolicitante: true}]);

    }
  }

  activarBotonDetalle(): boolean {
    if (this.registroSeleccionado) {
      return true;
    } else {
      return false;
    }
  }



  private obtenerCatalogo(): void {
  

    this.opcionesSelectProgramaDocente =
      this.estatusCatalogoService.getCatalogoProgramaDocente().
      getSelectProgramaDocente(this.erroresConsultas);
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'tipo~Persona:IGUAL');
    urlSearch.set('ordenamiento','valor:ASC');
    //this.opcionesSelectNacionalidad.  =
      //this.estatusCatalogoService.getNacionalidad().
    this.nacionalidadService.
      getListaSelectNacionalidad(this.erroresConsultas, urlSearch,false
      ).then(
        nacionalidades => {
          console.log(nacionalidades);
          //let items = response.json().lista;
          if (nacionalidades) {
            for (var i in nacionalidades) {
              //console.log(items[i]);
            }
            nacionalidades.forEach(
              (item) => {
                this.opcionSelectNacionalidad.push(new ItemSelects(item.id, item.valor));
              }
            )
          }
        }
      );
  }

  limpiarVariablesSession() {
    sessionStorage.removeItem('solicitanteCriterios');
    sessionStorage.removeItem('solicitanteOrdenamiento');
    sessionStorage.removeItem('solicitanteLimite');
    sessionStorage.removeItem('solicitantePagina');
  }

}
