import {Component, ElementRef, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {Estudiante} from "../../../services/entidades/estudiante.model";
import {PaginacionInfo} from "../../../services/core/pagination-info";
import {SolicitudNoAdeudo} from "../../../services/entidades/solicitud-no-adeudo.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {UsuarioSesion} from "../../../services/usuario/usuario-sesion";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {ActivatedRoute, Router} from "@angular/router";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {Http} from "@angular/http";
import {AuthService} from "../../../auth/auth.service";
import {URLSearchParams} from '@angular/http';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import * as moment from 'moment';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {Validacion} from "../../../utils/Validacion";
import {UsuarioRoles} from "../../../services/usuario/usuario-rol.model";

@Component({
  selector: 'app-solicitud-carta-no-adeudo',
  templateUrl: './solicitud-carta-no-adeudo.component.html',
  styleUrls: ['./solicitud-carta-no-adeudo.component.css']
})
export class SolicitudCartaNoAdeudoComponent implements OnInit {

  solicitudNoAdedudoService;
  cartaNoAdeudoService;
  estudianteServive;
  correoService;
  catalogosServices;
  docencia: boolean;

  idEstudiante: number;
  idUsuarioObjetivo: number;

  entidadEstudiante: Estudiante;

  columnas: Array<any> = [
    { titulo: 'Motivo', nombre: 'nombre' },
    { titulo: 'Fecha', nombre: 'tituloTesis'},
    { titulo: 'Biblioteca', nombre: 'estatusBiblioteca'},
    { titulo: 'UTIC', nombre: 'estatusUTIC'},
    { titulo: 'Finanzas', nombre: 'estatusFinanzas'},
    { titulo: 'RMyS', nombre: 'estatusRMyS'},
    { titulo: 'Docencia', nombre: 'estatusDocencia'},
  ];

  paginacion: PaginacionInfo;
  paginaActual: number = 1;
  limite: number = 10;
  public configuracion: any = {
    paginacion: true,
    filtrado: { textoFiltro: '', columnas: 'idEstatus.valor' } // definir bien que columa
  };

  private registroSolicitudesNoAdeudo: Array<SolicitudNoAdeudo> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private usuarioLogueado: UsuarioSesion;
  usuarioRolService;
  @ViewChild('modalConfirmacion')
  dialog: ModalComponent;


  constructor( private elementRef: ElementRef,route: ActivatedRoute,
              private injector: Injector, private _renderer: Renderer,
              private http: Http, private _catalogoService: CatalogosServices,
              private spinner: SpinnerService, private router: Router,
               auth: AuthService) {

    this.spinner.start("constructor");
    this.usuarioLogueado = auth.getUsuarioLogueado();
    this.prepareService();

    let params;
    route.params.subscribe(parms => {
      this.idUsuarioObjetivo = parms['usuarioObjetivo'];
    });
    this.recuperarUsuarioActual();
    this.constructorDialog();
  }

  recuperarUsuarioActual(): void {
    //this.estudianteServive = this.catalogosServices.getEstudianteService();
    ////console.log('usuario actual: ' + this.usuarioLogueado.id);
    let urlParameter: URLSearchParams = new URLSearchParams();

    if (this.idUsuarioObjetivo)
      urlParameter.set('criterios', 'idUsuario~' + this.idUsuarioObjetivo + ':IGUAL');
    else
      urlParameter.set('criterios', 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL');

    //console.log(urlParameter);
    this.estudianteServive.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let estudiante;
        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
          this.entidadEstudiante = new Estudiante(elemento);
          //console.log(estudiante);
        });
        this.idEstudiante = estudiante.id;
        (<FormControl>this.formulario.controls['idEstudiante']).setValue(this.idEstudiante);
        this.spinner.stop("constructor");
        console.log(this.idEstudiante);
        this.obtenerListaDatosEstudiante();
      }
    );

  }

  modalConfirmacionEstudiante(): void {
    let idEstudiante = this.idEstudiante;
    this.dialog.open('sm');
    //console.log('IdEstudiante' + idEstudiante);


  }

  obtenerListaDatosEstudiante(): void {
    this.spinner.start("obtenerListaDatosEstudiante");
    //console.log('IdEstudiante obtenerDato: ' + this.idEstudiante);

    let urlSearch: URLSearchParams = new URLSearchParams();
    let criterios = '';

    criterios = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlSearch.set('criterios', criterios);

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

    this.solicitudNoAdedudoService.getListaSolicitudNoAdeudo(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        let paginacionInfoJson = response.json();
        let paginasArray: Array<number> = [];
        this.registroSolicitudesNoAdeudo = [];
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
          this.registroSolicitudesNoAdeudo.push(new SolicitudNoAdeudo(item));
        });
      },
      error => {
        this.spinner.stop("obtenerListaDatosEstudiante");
      },
      () => {
        this.spinner.stop("obtenerListaDatosEstudiante");
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
      this.obtenerListaDatosEstudiante();
    }
  }

  // ************************** Campo de busqueda *******************************************//
  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
    this.obtenerListaDatosEstudiante();
  }
  // ************************** Cuantos registros quieres que se muestren **************//
  setLimite(limite: string): void {
    this.limite = Number(limite);
    this.obtenerListaDatosEstudiante();
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////
  //                                Paginador                                                  //
  ///////////////////////////////////////////////////////////////////////////////////////////////

  cambiarPagina(evento: any): void {
    this.paginaActual = evento.page;
    this.obtenerListaDatosEstudiante();
  }

  isSetPaginacion(): boolean {
    let result: boolean = false;
    if (this.paginacion) {
      result = true;
    }
    return result;
  }

  prepareService(): void {
    //this.solicitudNoAdedudoService = new SolicitudNoAdeudoService(this.http);
    //this.estudianteServive = new EstudianteService(this.http);
    //this.cartaNoAdeudoService = new CartaNoAdeudoService(this.http);
    this.usuarioRolService = this._catalogoService.getUsuarioRolService();
    this.solicitudNoAdedudoService = this._catalogoService.getSolicitudNoAdeudo();
    this.estudianteServive = this._catalogoService.getEstudiante();
    this.cartaNoAdeudoService = this._catalogoService.getCartaNoAdeudo();
    this.correoService = this._catalogoService.getEnvioCorreoElectronicoService();
  }
  ngOnInit() {
  }


  /////////////////    MODAL     ////////////////////////


  formulario: FormGroup;
  formularioCarta: FormGroup;
  date: Date = new Date();

  usuarioRol;
  validacionActiva: boolean = false;

  private erroresGuardado: Array<ErrorCatalogo> = [];

  constructorDialog(){
    this.recuperarPermisosUsuarioPorId(this.usuarioLogueado.id);

    this.formulario = new FormGroup({
      fecha: new FormControl(moment(this.date).format('DD/MM/YYYY hh:mm a')),
      idEstudiante: new FormControl(this.idEstudiante),
      idEstatus: new FormControl(1),
      docencia: new FormControl(false),
      utic: new FormControl(false),
      finanzas: new FormControl(false),
      rms: new FormControl(false),
      biblioteca: new FormControl(false),
      motivo: new FormControl('', Validators.required)
    });

    this.formularioCarta = new FormGroup({
      idSolicitud: new FormControl(),
      idEstatus: new FormControl(5),
      idTipo: new FormControl()
    });
  }

  cerrarModal(): void {
    this.dialog.close();
  }

  recuperarPermisosUsuarioPorId(id: number): void {
    let urlSearch: URLSearchParams = new URLSearchParams();
    urlSearch.set('criterios', 'idUsuario.id~' + id + ':IGUAL');
    this.usuarioRolService.getListaUsuarioRol(
      this.erroresConsultas,
      urlSearch
    ).subscribe(
      response => {
        response.json().lista.forEach((elemento) => {
          this.usuarioRol = new UsuarioRoles (elemento);
          if (this.usuarioRol.rol.id === 1) {
            this.docencia = true;
          }
          //console.log('ROLES' +this.usuarioRol.rol.descripcion)
        });
      }
    );
  }

  continuarProceso(): void {

    if (this.validarFormulario()) {

      this.setearMotivoFormularios();

      this.spinner.start("continuarProceso");
      let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
      //console.log('solictud form: ' + jsonFormulario);

      this.solicitudNoAdedudoService
        .postSolicitudNoAdeudo(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
        response => {
          let idSolicitud = response.json().id;
          this.formularioCarta.value.idSolicitud = idSolicitud;

          //console.log ('JSON SOL CART NO ADEUDO' +this.formularioCarta)
          if (idSolicitud) {
            this.enviarCorreo(idSolicitud, 'docencia@colsan.edu.mx');
            this.enviarCorreo(idSolicitud, 'biblioteca_colsan@outlook.es');
            this.enviarCorreo(idSolicitud, 'utic_colsan@outlook.com');
            this.enviarCorreo(idSolicitud, 'finanzas_colsan@outlook.com');
            this.enviarCorreo(idSolicitud, 'rms_colsan@outlook.com');

          }
        },
        error => {
          this.spinner.stop("continuarProceso");
        },
        () => {
          let jsonFormularioCarta = JSON.stringify(this.formularioCarta.value, null, 2);
          //console.log('JSON FORM' +jsonFormularioCarta);
          this.cartaNoAdeudoService
            .postCartaNoAdeudo(
              jsonFormularioCarta,
              this.erroresGuardado
            ).subscribe(
            response => {
              //console.log(response);
            },
            error => {
              console.log(error);
              this.spinner.stop("continuarProceso");
            },
            () => {
              this.cerrarModal();
              this.obtenerListaDatosEstudiante();
              this.spinner.stop("continuarProceso");
            }
          );
        }
      );
    }
  }

  validarFormulario(): boolean {
    if (this.formulario.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formulario.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formulario.controls[campo]).valid &&
      this.validacionActiva) {
      return true;
    }
    return false;
  }

  private errorMessage(control: FormControl): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          return Validacion.getValidatorMensajeError(errorType);
        }
      }
    }
    return null;
  }

  private setearMotivoFormularios(): void {
    if (this.formulario.value.motivo === '1') {
      this.setearMotivoCorreoFormulario(2);
      this.setearMotivoSolicitudFormulario('Titulacion');
    } else {
      this.setearMotivoCorreoFormulario(1);
      this.setearMotivoSolicitudFormulario('Baja');
    }
  }

  private setearMotivoSolicitudFormulario(motivo : string): void {
    this.formulario.value.motivo = motivo;
  }

  private setearMotivoCorreoFormulario(tipo: number): void {
    this.formularioCarta.value.idTipo = tipo;
  }

  private enviarCorreo(idSolicitud, correo): void {

    let formularioCorreo = new FormGroup({
      destinatario: new FormControl(correo),
      idPlantillaCorreo: new FormControl(33),
      entidad: new FormControl({SolicitudesNoAdeudo : idSolicitud}),
      asunto: new FormControl('Solicitud carta no adeudo')
    });

    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    //console.log('jsonForumalioCrorreo', jsonFormulario);

    this.correoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresGuardado
    ).subscribe(
      response => {},
      error => {
        //console.log(error);
      },
      () => {
      }
    );
  }
}
