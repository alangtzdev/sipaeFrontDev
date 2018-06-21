import {Component, ElementRef, Injector, OnInit, Renderer, ViewChild} from '@angular/core';
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";
import {ErrorCatalogo} from "../../services/core/error.model";
import {SolicitudServicioSocial} from "../../services/entidades/solicitud-servicio-social.model";
import {ServicioSocial} from "../../services/entidades/servicio-social.model";
import {UsuarioRolService} from "../../services/usuario/usuario-rol.service";
import {EstudianteService} from "../../services/entidades/estudiante.service";
import {SolicitudServicioSocialService} from "../../services/entidades/solicitud-servicio-social.service";
import {ServicioSocialService} from "../../services/entidades/servicio-social.service";
import {AuthService} from "../../auth/auth.service";
import {URLSearchParams} from "@angular/http";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {ModalServicioSocialComponent} from "./modal-servicio-social/modal-servicio-social.component";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {ConfigService} from "../../services/core/config.service";
import {DocumentoServicioSocial} from "../../services/entidades/documento-servicio-social.model";
import {DocumentoServicioSocialService} from "../../services/entidades/documento-servicio-social.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {ArchivoService} from "../../services/entidades/archivo.service";

@Component({
  selector: 'app-servicio-social',
  templateUrl: './servicio-social.component.html',
  styleUrls: ['./servicio-social.component.css']
})
export class ServicioSocialComponent implements OnInit {

  private usuarioLogueado: UsuarioSesion;
  idEstudiante: number;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  registroSeleccionado: SolicitudServicioSocial;
  ultimaSolicitud: SolicitudServicioSocial = null;
  ultimoServicio: ServicioSocial = null;

  @ViewChild("modalServSocial")
  modalServSocial: ModalServicioSocialComponent;

  registros: Array<SolicitudServicioSocial> = [];
  constructor(private elementRef: ElementRef, private auth: AuthService,
              private injector: Injector, private _renderer: Renderer,
              public _servicioSocialService: ServicioSocialService,
              private _archivoService: ArchivoService,
              public _solicitudServicioSocialService: SolicitudServicioSocialService,
              public _estudianteService: EstudianteService, private _spinner: SpinnerService,
              public _documentoServicioSocialService: DocumentoServicioSocialService,
              public _usuarioRolService: UsuarioRolService) {

    this.usuarioLogueado = auth.getUsuarioLogueado();
    if (AuthService.isLoggedIn()) {

      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterio = 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL';
      urlSearch.set('criterios', criterio);
      this.recuperarUsuarioActual();
    }
  }
  hayIdEstudiante(): boolean {
    return this.idEstudiante > 0;
  }
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
    } else {
      this.registroSeleccionado = null;
    }
  }

  hayUltimaSolicitud(): boolean {
    return this.ultimaSolicitud !== null && this.ultimoServicio !== null;
  }

  recuperarUsuarioActual(): void {


    //console.log('usuario actual: ' + this.usuarioLogueado.id);
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idUsuario~' + this.usuarioLogueado.id + ':IGUAL');
    this._estudianteService.getListaEstudianteOpcional(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        let estudiante;

        response.json().lista.forEach((elemento) => {
          estudiante = new Estudiante(elemento);
        });
        this.idEstudiante = estudiante.id;
        //console.log("idEstudiante", this.idEstudiante);
        this.obtenerListaDatosEstudiante();
        //console.log("recuperado");
      }
    );


  }
  obtenerListaDatosEstudiante(): void {
    ////console.log("obtenerListaDatosEstudiante");

    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idEstudiante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    urlParameter.set('ordenamiento', "id:DESC");

    this._solicitudServicioSocialService.getListaSolicitudServicioSocial(this.erroresConsultas, urlParameter, false)
      .subscribe(
        response => {
          let resultados = response.json();
          this.registros = [];
          this.ultimaSolicitud=null;
          resultados.lista.forEach((item) => {

            if (!this.ultimaSolicitud) {
              this.ultimaSolicitud = new SolicitudServicioSocial(item);
              this.obtenerUltimoServicio(this.ultimaSolicitud.id);
            } else {
              let ss = new SolicitudServicioSocial(item);
              if (ss.getStrEstatusSolicitud() !== "Activa") {
                this.registros.push(new SolicitudServicioSocial(item));
              }
            }

          });
        },
        error => {
            console.error(error);
        },
        () => {
        }
      );

  }
  obtenerUltimoServicio(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterios = 'idSolicitudServicio~' + id + ':IGUAL';
    urlParameter.set('criterios', criterios);
    this.ultimoServicio = null;
    this._servicioSocialService.getListaServicioSocial(this.erroresConsultas, urlParameter, false)
      .subscribe(
        response => {
          let resultados = response.json();

          resultados.lista.forEach((item) => {

            this.ultimoServicio = new ServicioSocial(item);

          });
        },
        error => {
            console.error(error);
        },
        () => {
        }
      );
  }

  esteServicio = null;

  modalDetalleSolicitudServicio(): void{
    if (this.registroSeleccionado) {

      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idSolicitudServicio~' + this.registroSeleccionado.id + ':IGUAL';
      urlParameter.set('criterios', criterios);
      this._servicioSocialService.getListaServicioSocial(this.erroresConsultas, urlParameter, false)
        .subscribe(
          response => {
            let resultados = response.json();

            resultados.lista.forEach((item) => {

              this.esteServicio = new ServicioSocial(item);
/*
              let dialog: Promise<ModalDialogInstance>;
              let modalConfig = new ModalConfig('lg', true, 27);

              let bindings = Injector.resolve([
                provide(ICustomModal, {
                  useValue: new ModalDetalleSolicitudServicioSocialData(
                    esteServicio,
                    this)
                }),
                provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
                provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
                provide(Renderer, { useValue: this._renderer })
              ]);

              dialog = this.modal.open(
                <any>ModalDetalleSolicitudServicioSocial,
                bindings,
                modalConfig
              );
*/
            });
          },
          error => {
          },
          () => {
          }
        );

        this.modalServSocialDetalle.open('lg');
    }
  }
  modalAgregarSolicitudServicioSocial(): void {
      this.modalServSocial.formularioSolicitudServicioSocial.controls['idEstudiante'].
      setValue(this.idEstudiante);
    this.modalServSocial.dialog.open('lg');

  }
  ngOnInit() {
  }










  @ViewChild("modalServSocialDetalle")
  modalServSocialDetalle: ModalComponent;
  servicioSocialElegido: ServicioSocial;
  registrosEvidencia: Array<any>;
  registroSeleccionadoDetalle: any;
  public listaDocumentos: any;
  private erroresConsultasDetall: Array<ErrorCatalogo> = [];
  isActiveDetalleSS :boolean = false;

  rowSeleccionadoDetalle(registro): boolean {
    return (this.registroSeleccionadoDetalle === registro);
  }

  rowSeleccionDetalle(registro): void {
    if (this.registroSeleccionadoDetalle !== registro) {
      this.registroSeleccionadoDetalle = registro;
    } else {
      this.registroSeleccionadoDetalle = null;
    }
  }
  descargarArchivoDetalle(): void {
    event.preventDefault();


    if (this.registroSeleccionadoDetalle) {
      let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionadoDetalle.archivo.id + '}';
      this._spinner.start("descargarArchivoDetalle");
      this._archivoService
        .generarTicket(jsonArchivo, this.erroresConsultas)
        .subscribe(
          data => {
            let json = data.json();
            let url =
              ConfigService.getUrlBaseAPI() +
              '/api/v1/archivovisualizacion/' +
              this.registroSeleccionadoDetalle.archivo.id +
              '?ticket=' +
              json.ticket;
            window.open(url);
          },
          error => {
            //console.log('Error downloading the file.');
            this._spinner.stop("descargarArchivoDetalle");
          },
          () => {
            console.info('OK');
            this._spinner.stop("descargarArchivoDetalle");
          }
        );
    }

  }
  onCambiosTablaDetalle(): void {
    if (this.servicioSocialElegido) {
      this.registrosEvidencia = [];
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idServicio~' + this.servicioSocialElegido.solicitudServicioSocial.id + ':IGUAL';
      criterios += ',idTipoDocumento~' + 27 + ':IGUAL';
      urlParameter.set('criterios', criterios);
      let resp = this._documentoServicioSocialService
        .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
        .subscribe(
          response => {
            let dss;
            response.json().lista.forEach((item) => {
              dss = new DocumentoServicioSocial(item);
              this.registrosEvidencia.push(dss);
            });
          },
          console.error,
          () => function () {
            //console.log("finalizado");
          }
        );
    }
  }

  initDetalleModal() {
    this.registrosEvidencia=[];
    this.inicializarServicioSocialDetalle();
  }
  inicializarServicioSocialDetalle(): void {
    this.servicioSocialElegido = this.esteServicio;
    //console.log("servicioSocialElegido", this.servicioSocialElegido);
    this.onCambiosTablaDetalle();
  }
  cerrarModalDetalle(): void {
    this.modalServSocialDetalle.close();
    this.isActiveDetalleSS = false;

  }
  /*
   ngOnInit(){
   let urlParameter: URLSearchParams = new URLSearchParams();
   urlParameter.set('criterios', 'idServicio~' + this.servicioSocial.solicitudServicioSocial.id + ':IGUAL');
   let response=this._documentoServicioSocialService.getListaDocumentoServicioSocial(
   this.erroresConsultas,
   urlParameter
   );
   this.listaDocumentos = response.lista;
   //console.log("listaDocumentos",this.listaDocumentos);
   }
   */
  inicializarObjetoDetalleSS(): void {
    if (this.servicioSocialElegido) {
      // this.element = this.context.servicioSocial;
      if (this.servicioSocialElegido.solicitudServicioSocial.estatus.valor === 'Activa' ||
        this.servicioSocialElegido.solicitudServicioSocial.estatus.id == 1208) {
        this.isActiveDetalleSS = true;
      }
    }
  }

}
