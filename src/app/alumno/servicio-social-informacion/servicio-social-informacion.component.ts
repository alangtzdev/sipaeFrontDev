import {Component, OnInit, NgZone, Injector, ViewChild} from '@angular/core';
import {ConfigService} from '../../services/core/config.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {SolicitudServicioSocial} from '../../services/entidades/solicitud-servicio-social.model';
import {ServicioSocial} from '../../services/entidades/servicio-social.model';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {ErrorCatalogo} from '../../services/core/error.model';
import {Router} from '@angular/router';
import * as moment from 'moment';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {AuthService} from '../../auth/auth.service';
import {Usuarios} from '../../services/usuario/usuario.model';
import {URLSearchParams} from '@angular/http';
import {ReporteBimestral} from '../../services/entidades/reporte-bimestral.model';
import {DocumentoServicioSocial} from '../../services/entidades/documento-servicio-social.model';
import {ModalComponent} from 'ng2-bs3-modal/ng2-bs3-modal';

@Component({
  selector: 'app-servicio-social-informacion',
  templateUrl: './servicio-social-informacion.component.html',
  styleUrls: ['./servicio-social-informacion.component.css']
})
export class ServicioSocialInformacionComponent implements OnInit {

  usuarioLogueado: UsuarioSesion;
  usuarioActual: Usuarios;
  estudianteActual: Estudiante;
  registros: Array<any> = [];
  registrosFinal: Array<any> = [];
  idArchivo: number;
  nombreArchivo: string = null;
  mostarBoton = false;
  solicitudServicio: SolicitudServicioSocial;
  servicioSocial: ServicioSocial;
  horasTotales = 0;

  horasRestantes = 0;
  mostrarUpload: boolean = true;

  registroSeleccionado: any;
  uploadFile: any;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  ocupadoCargando: boolean = false;
  zone: NgZone;
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];
  formularioReporteBimestral: FormGroup;
  mensajeErrors: any = {
    'required': 'Este campo es requerido',
    'pattern': 'Formato incorrecto'
  };
  validacionActiva: boolean = false;
  rangoFechasValido: boolean = true;
  _reporteBimestralService;
  _estudianteService;
  _archivoService;
  _servicioSocialService;
  _solicitudServicioSocialService;
  _documentoServicioSocialService;
  _usuarioService;
  idSSDetalle;
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresAlerts: any;
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private inicializarFormulario(): void {



    //(<Control>this.formularioReporteBimestral.controls["idEstatus"])
    //    .updateValue(this.idServicioSocial);

  }

  constructor(_router: Router,
              //private modal: Modal,
              private injector: Injector, //private _renderer: Renderer,
              public _catalogosService: CatalogosServices,
              private _spinner: SpinnerService, auth: AuthService) {
    this.prepareServices();
    moment.locale('es');
    //upload
    this.zone = new NgZone({ enableLongStackTrace: false });
    //upload
    //this.router = _router;
    this.solicitudServicio = null;
    this.usuarioLogueado = auth.getUsuarioLogueado();
    this._usuarioService.getEntidadUsuario(this.usuarioLogueado.id,
        this.erroresGuardado).subscribe(
        response => {
          this.usuarioActual = new Usuarios(response.json());
          let urlParameter: URLSearchParams = new URLSearchParams();
          urlParameter.set('criterios', 'idUsuario~' + this.usuarioActual.id + ':IGUAL');
          this._estudianteService.getListaEstudianteOpcional(this.erroresGuardado,
              urlParameter).subscribe(
              response => {
                let respuesta = response.json();
                respuesta.lista.forEach((item) => {
                  this.estudianteActual = new Estudiante(item);
                });
                this.consultarSolicitudesServicioSocial();
              });
        }
    );
    //picker///
    (this.tomorrow = new Date()).setDate(this.tomorrow.getDate());
    (this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
    (this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
    this.events = [
      { date: this.tomorrow, status: 'full' },
      { date: this.afterTomorrow, status: 'partially' }
    ];
    //picker//
    this.formularioReporteBimestral = new FormGroup({
      fechaInicio: new FormControl('', Validators.required),
      fechaFin: new FormControl('', Validators.required)

    });


  }
  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }

  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.mostarBoton = true;
    } else {
      this.registroSeleccionado = null;
      this.mostarBoton = false;
    }
  }

  consultarSolicitudesServicioSocial(): void {
    if (this.estudianteActual) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idEstudiante~' + this.estudianteActual.id + ':IGUAL';
      urlParameter.set('criterios', criterios);
      urlParameter.set('ordenamiento', 'id:DESC');
      urlParameter.set('limite', '1');
      this._spinner.start('consultarSolicitudesServicioSocial');
      this._solicitudServicioSocialService.getListaSolicitudServicioSocial(
          this.erroresConsultas, urlParameter, false)
          .subscribe(
              response => {
                let resultados = response.json();
                this.solicitudServicio = null;
                resultados.lista.forEach((item) => {
                  let solicitud = new SolicitudServicioSocial(item);

                  if (solicitud.estatus.id == 1207 && !this.solicitudServicio) {
                    /**activas */
                    this.solicitudServicio = solicitud;
                  }
                  if (solicitud.estatus.id == 1209 && !this.solicitudServicio) {
                    /**validadas */
                    this.solicitudServicio = solicitud;
                  }
                  if (solicitud.estatus.id == 1210 && !this.solicitudServicio) {
                    /**rechazadas */
                    this.solicitudServicio = solicitud;
                  }
                  /**solo se consulta la última */
                });
                ////console.log('solicitud',this.solicitudServicio);

              },
              error => {
                this._spinner.stop('consultarSolicitudesServicioSocial');
                /*if (assertionsEnabled()) {
                  console.error(error);
                }*/
              },
              () => {
                this._spinner.stop('consultarSolicitudesServicioSocial');
                /*if (assertionsEnabled()) {
                  //console.log('solicitudServicio', this.solicitudServicio);
                }*/
                this.consultarServicioSocial();
              }
          );
    }
  }
  consultarServicioSocial(): void {
    if (this.solicitudServicio) {
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idSolicitudServicio~' + this.solicitudServicio.id + ':IGUAL';
      urlParameter.set('criterios', criterios);
      urlParameter.set('limite', '1');
      //this._spinner.start();
      this._servicioSocialService.getListaServicioSocial(this.erroresConsultas, urlParameter,
          false)
          .subscribe(
              response => {
                let resultados = response.json();
                this.servicioSocial = null;
                let servicio = null;
                resultados.lista.forEach((item) => {
                  servicio = new ServicioSocial(item);
                });
                this.servicioSocial = servicio;
                let urlParameter: URLSearchParams = new URLSearchParams();
                urlParameter.set('criterios', 'idServicioSocial~' + this.servicioSocial.id +
                    ':IGUAL');
                this._reporteBimestralService.getListaReporteBimestral(
                    this.erroresConsultas,
                    urlParameter
                ).subscribe(
                    response => {
                      let historialReporte;
                      response.json().lista.forEach((elemento) => {
                        historialReporte = new ReporteBimestral(elemento);
                        this.idSSDetalle = historialReporte.servicioSocial.id;
                        if (historialReporte.horas)
                          this.horasTotales += historialReporte.horas;
                      });
                      if (this.servicioSocial.getStrNumeroHoras()) {
                        this.horasTotales = this.horasTotales + parseInt(
                                this.servicioSocial.getStrNumeroHoras());
                      }
                      this.horasRestantes = 480 - this.horasTotales;
                    }
                );
              },
              error => {
                /*if (assertionsEnabled()) {
                  console.error(error);
                }*/
                //this._spinner.stop();
              },
              () => {
                /*if (assertionsEnabled()) {
                  //console.log('servicioSocial', this.servicioSocial);
                }*/
                //this._spinner.stop();
                this.onCambiosTabla();
                this.onCambiosTablaFinal();
              }
          );
    }
  }
  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        if (responseJson.id) {
          this.idArchivo = parseInt(responseJson.id, 10);
          this.nombreArchivo = responseJson.originalName;
        }
      }
    });
  }

  enableBasic(): boolean {
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
  }
  handleDropUpload(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;

      });
    }

    let total = 0, uploaded = 0;
    this.dropResp.forEach(resp => {
      total += resp.progress.total;
      uploaded += resp.progress.loaded;
    });

    this.dropProgress = Math.floor(uploaded / (total / 100));
  }
  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }
  ////// picker ///
  public dt: Date = new Date();
  public dtend: Date = new Date();
  public minDate: Date = void 0;
  public events: Array<any>;
  public tomorrow: Date;
  public afterTomorrow: Date;
  public formats: Array<string> = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY', 'shortDate'];
  public format: string = this.formats[0];
  public dateOptions: any = {
    formatYear: 'YY',
    startingDay: 1
  };
  private opened: boolean = false;
  public getDate(): string { return moment(this.dt).format('DD/MM/YYYY'); }
  public today(): void { this.dt = new Date(); }


  public getDateEnd(): string { return moment(this.dtend).format('DD/MM/YYYY') }
  public todayEnd(): void { this.dtend = new Date(); }


  // todo: implement custom class cases
  public getDayClass(date: any, mode: string): string {
    if (mode === 'day') {
      let dayToCheck = new Date(date).setHours(0, 0, 0, 0);

      for (let i = 0; i < this.events.length; i++) {
        let currentDay = new Date(this.events[i].date).setHours(0, 0, 0, 0);

        if (dayToCheck === currentDay) {
          return this.events[i].status;
        }
      }
    }

    return '';
  }
  descargarArchivo(): void {
    event.preventDefault();

    if (this.registroSeleccionado) {
      let jsonArchivo =
          '{"idArchivo": ' + this.registroSeleccionado.documento.archivo.id + '}';
      //this._spinner.start();
      this._archivoService
          .generarTicket(jsonArchivo, this.erroresConsultas)
          .subscribe(
              data => {
                let json = data.json();
                let url =
                    ConfigService.getUrlBaseAPI() +
                    '/api/v1/archivovisualizacion/' +
                    this.registroSeleccionado.documento.archivo.id +
                    '?ticket=' +
                    json.ticket;
                window.open(url);
              },
              error => {
                //console.log('Error downloading the file.');
                //this._spinner.stop('descargarArchivo');
              },
              () => {
                //console.info('OK');
                //this._spinner.stop('descargarArchivo');
              }
          );
    }
  }

  eliminarArchivo() {
    event.preventDefault();
    if (this.registroSeleccionado) {
      //console.log('Eliminando...');
      //console.log(this.registroSeleccionado.id);
      this._reporteBimestralService.deleteReporteBimestral(
          this.registroSeleccionado.id, this.erroresGuardado).subscribe(
          response => {
            //if (assertionsEnabled()) //console.log(response);
              this._documentoServicioSocialService.deleteDocumentoServicioSocial(
                  this.registroSeleccionado.documento.id, this.erroresGuardado).subscribe(
                  response => {
                    //if (assertionsEnabled()) //console.log(response);
                      this._archivoService.deleteArchivo(
                          this.registroSeleccionado.documento.archivo.id,
                          this.erroresConsultas).subscribe(
                          () => {}, //console.log('Success'),
                          error => {
                            /*if (assertionsEnabled()) {
                              console.error(error);
                            }*/
                            this.registroSeleccionado = null;
                          },
                          () => {
                            this.mostrarUpload = true;

                          }
                      );
                  },
                  error => {
                    /*if (assertionsEnabled()) {
                      console.error(error);
                    }*/
                    this.registroSeleccionado = null;
                  },
                  () => {
                    this.registroSeleccionado = null;
                    //console.log('completado');
                    this.onCambiosTabla();
                  }
              );
          },
          error => {
            //if (assertionsEnabled()){} //console.log(error);
          }
      );
    } else {
      this.erroresAlerts = 'Selecciona un registro';
      //console.log('Selecciona un registro');
    }
  }

  deshabilitarEliminar(): boolean {
    return (!this.registroSeleccionado || (this.registroSeleccionado.estatus &&
    this.registroSeleccionado.estatus.id != 1211));
  }

  public disabled(date: Date, mode: string): boolean { return (
  mode === 'day' && (date.getDay() === 0 || date.getDay() === 6)); }
  public open(): void { this.opened = !this.opened; }
  public clear(): void { this.dt = void 0; this.dtend = void 0; }
  public toggleMin(): void {
    this.dt = this.tomorrow;
    this.dtend = this.afterTomorrow;
  }


  ////// picker /////

  //DROPDOWN REQUERIDO PARA EL PICKER///

  public status: { isopen: boolean } = { isopen: false };
  public toggled(open: boolean): void {} //console.log('Dropdown is now: ', open); }
  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }
  verificarFechas(control: string, forzar = false): void {
    if (!this.status.isopen || forzar) {
      let valor;
      switch (control) {
        case 'fechaInicio': valor = moment(this.dt).format('DD/MM/YYYY'); break;
        case 'fechaFin': valor = moment(this.dtend).format('DD/MM/YYYY'); break;
      }
      this.rangoFechasValido = (this.dtend > this.dt) ? true : false;
      (<FormControl>this.formularioReporteBimestral.controls[control]).setValue(valor);
    }
  }
  //DROPDOWN REQUERIDO PARA EL PICKER///
  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioReporteBimestral.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioReporteBimestral.controls[campo]).valid &&
        this.validacionActiva) {
      return true;
    }
    return false;
  }
  errorMessage(control: FormControl, campo?: string): string {
    let resultado = '';
    if (control.errors !== undefined && control.errors !== null) {
      for (let errorType of Object.keys(control.errors)) {
        if (control.hasError(errorType)) {
          if (errorType === 'pattern') {
            if (campo === 'pais') {
              resultado += this.mensajeErrors[errorType + '_' + campo];
            } else {
              resultado += this.mensajeErrors[errorType];
            }
          } else {
            resultado += this.mensajeErrors[errorType];
          }

        }
      }
    }
    return resultado;
  }
  validarFormulario(): boolean {
    if (this.formularioReporteBimestral.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;

    return false;
  }
  validarSolicitud(): void {
    this.erroresAlerts = '';
    event.preventDefault();

    if (!(this.idArchivo > 0)) {
      this.erroresAlerts = 'Cargar archivo de reporte bimestral.';
    } else {

      let jsonFormulario = JSON.stringify(this.formularioReporteBimestral.value, null, 2);
      let objFormulario = JSON.parse(jsonFormulario);
      objFormulario.fechaInicio = moment(this.dt).format('DD/MM/YYYY') + ' ' +
          moment('00:00', 'hh:mm').format('hh:mma');
      objFormulario.fechaFin = moment(this.dtend).format('DD/MM/YYYY') + ' ' +
          moment('00:00', 'hh:mm').format('hh:mma');
      /*console.log('this.formularioReporteBimestral.controls["fechaInicio"].value',
      this.formularioReporteBimestral.controls['fechaInicio'].value);
      console.log('objFormulario.fechaInicio', objFormulario.fechaInicio);
      console.log('objFormulario.fechaFin', objFormulario.fechaFin);*/
      if (this.dt == this.dtend ||
          this.dt > this.dtend /*||
          this.formularioReporteBimestral.controls['fechaInicio'].value.length == 0 ||
          this.formularioReporteBimestral.controls['fechaFin'].value.length == 0*/) {
        this.erroresAlerts = 'La fecha fin no puede ser menor que la fecha de inicio.';
      } else if (!this.ocupadoCargando) {
        objFormulario.idArchivo = this.idArchivo;
        objFormulario.idServicio = this.servicioSocial.solicitudServicioSocial.id;
        objFormulario.valido = true;
        objFormulario.otroTipoDocumento = 'otroTipoDocumento';
        objFormulario.idTipoDocumento = 30;

        jsonFormulario = JSON.stringify(objFormulario, null, 2);
        //if (assertionsEnabled()) { }
        this.ocupadoCargando = true;
        this._documentoServicioSocialService.postDocumentoServicioSocial(jsonFormulario,
            this.erroresGuardado).subscribe(
            response => {
              let jsonReporte = '{"idDocumentoServicioSocial":' + response.json().id +
                  ',"idServicioSocial":' + this.servicioSocial.id +
                  ',"idEstatus":1211}';
              /*JSON.stringify(this.formularioReporteBimestral.value,
               null, 2);*/
              //let objReporte = JSON.parse(jsonReporte);
              /*objReporte.fechaInicio = new moment(this.dt).format('DD/MM/YYYY') + ' ' +
               new moment('00:00', 'hh:mm').format('hh:mma');
               objReporte.fechaFin = new moment(this.dtend).format('DD/MM/YYYY') + ' ' +
               new moment('00:00', 'hh:mm').format('hh:mma');*/
              /*objReporte.idDocumentoServicioSocial = response.json().id;
               objReporte.idServicioSocial = this.servicioSocial.id;
               objReporte.idEstatus = 1211;
               jsonReporte = JSON.stringify(objReporte, null, 2);*/
              //console.log('json: ' + jsonReporte);
              this._reporteBimestralService.postReporteBimestral(jsonReporte,
                  this.erroresGuardado).subscribe(
                  response => {
                    /*if (assertionsEnabled()) {
                      //console.log(response);
                    }*/
                  },
                  error => {
                    console.error(error);
                  },
                  () => {
                    /*if (assertionsEnabled()) {
                      //console.log('reporte creado');
                    }*/
                  }
              );
            },
            error => {
              console.error(error);
              this.idArchivo = null;
              this.nombreArchivo = null;
              /*(<FormControl>this.formularioReporteBimestral.controls['fechaInicio'])
                  .setValue(null);
              (<FormControl>this.formularioReporteBimestral.controls['fechaFin'])
                  .setValue(null);*/
              this.ocupadoCargando = false;
            },
            () => {
              /*if (assertionsEnabled()) {
                console.log('guardado documento');
              }*/
              this.idArchivo = null;
              this.nombreArchivo = null;
              /*(<FormControl>this.formularioReporteBimestral.controls['fechaInicio'])
                  .setValue(null);
              (<FormControl>this.formularioReporteBimestral.controls['fechaFin'])
                  .setValue(null);*/
              this.ocupadoCargando = false;
              this.onCambiosTabla();
            }
        );
      }

    }

  }

  onCambiosTabla(): void {
    if (this.servicioSocial) {
      this.registros = [];
      let urlParameter: URLSearchParams = new URLSearchParams();
      /*let criterios = 'idServicio~' + this.servicioSocial.solicitudServicioSocial.id +
       ':IGUAL,idTipoDocumento~' + 30 + ':IGUAL';*/
      urlParameter.set('criterios', 'idServicioSocial.id~' + this.servicioSocial.id +
          ':IGUAL');
      this._reporteBimestralService.getListaReporteBimestral(this.erroresConsultas,
          urlParameter).subscribe(
          response => {
            response.json().lista.forEach((item) => {
              this.registros.push(new ReporteBimestral(item));
            });
          }
      );
      /*this._documentoServicioSocialService
       .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
       .subscribe(
       response => {
       let dss;
       response.json().lista.forEach((item) => {
       dss = new DocumentoServicioSocial(item);
       this.registros.push(dss);
       });
       },
       console.error,
       () => function () {
       //console.log('finalizado');
       }
       );*/
    }
  }
  onCambiosTablaFinal(): void {
    if (this.servicioSocial) {
      this.registrosFinal = [];
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idServicio~' + this.servicioSocial.solicitudServicioSocial.id +
          ':IGUAL';
      criterios += ',idTipoDocumento~' + 32 + ':IGUAL';
      urlParameter.set('criterios', criterios);
      this._documentoServicioSocialService
          .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
          .subscribe(
              response => {
                let documento;

                response.json().lista.forEach((elemento) => {
                  documento = new DocumentoServicioSocial(elemento);
                  this.registrosFinal.push(documento);
                });
              }
          );

      criterios = 'idServicio~' + this.servicioSocial.solicitudServicioSocial.id + ':IGUAL';
      criterios += ',idTipoDocumento~' + 33 + ':IGUAL';
      urlParameter.set('criterios', criterios);
      this._documentoServicioSocialService
          .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
          .subscribe(
              response => {
                let documento;

                response.json().lista.forEach((elemento) => {
                  documento = new DocumentoServicioSocial(elemento);
                  this.registrosFinal.push(documento);
                });
              }
          );

      criterios = 'idServicio~' + this.servicioSocial.solicitudServicioSocial.id + ':IGUAL';
      criterios += ',idTipoDocumento~' + 36 + ':IGUAL';
      urlParameter.set('criterios', criterios);
      this._documentoServicioSocialService
          .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
          .subscribe(
              response => {
                let documento;

                response.json().lista.forEach((elemento) => {
                  documento = new DocumentoServicioSocial(elemento);
                  this.registrosFinal.push(documento);
                });
              }
          );
    }
  }
  modalDetalleSolicitudServicioSocial(): void {
      this.inicializarModal();
      this.modalDetalles.open('lg');
    /*if (this.servicioSocial) {
      //console.log(this.servicioSocial);
      let urlParameter: URLSearchParams = new URLSearchParams();
      let criterios = 'idSolicitudServicio~' + this.servicioSocial.solicitudServicioSocial.id + ':IGUAL';
      urlParameter.set('criterios', criterios);
      let esteServicio = null;
      this._servicioSocialService.getListaServicioSocial(this.erroresConsultas, urlParameter,
          false)
          .subscribe(
              response => {
                let resultados = response.json();

                resultados.lista.forEach((item) => {

                  esteServicio = new ServicioSocial(item);

                  let dialog: Promise<ModalDialogInstance>;
                  let modalConfig = new ModalConfig('lg', true, 27);

                  let bindings = Injector.resolve([
                    provide(ICustomModal, {
                      useValue: new ModalDetalleSolicitudServicioSocialData(
                          esteServicio,
                          this)
                    }),
                    provide(IterableDiffers, { useValue:
                        this.injector.get(IterableDiffers) }),
                    provide(KeyValueDiffers, { useValue:
                        this.injector.get(KeyValueDiffers) }),
                    provide(Renderer, { useValue: this._renderer })
                  ]);

                  dialog = this.modal.open(
                      <any>ModalDetalleSolicitudServicioSocial,
                      bindings,
                      modalConfig
                  );

                });
              },
              error => {
                if (assertionsEnabled()) {
                  console.error(error);
                }
              },
              () => {
                if (assertionsEnabled()) {
                }
              }
          );
    }*/
  }
  private prepareServices(): void {
    this._usuarioService = this._catalogosService.getUsuarioService();
    this._reporteBimestralService = this._catalogosService.getReporteBimestralService();
    this._estudianteService = this._catalogosService.getEstudiante();
    this._archivoService = this._catalogosService.getArchivos();
    this._servicioSocialService = this._catalogosService.getServicioSocialService();
    this._solicitudServicioSocialService =
        this._catalogosService.getSolicitudServicioSocialService();
    this._documentoServicioSocialService =
        this._catalogosService.getDocumentoServicioSocialService();
  }

  ngOnInit() {
  }

  //////////////////////////////// TAB REGISTROS FINALIZACION ///////////////////////////////
  //private erroresConsultas: Array<ErrorCatalogo> = [];
  registroSeleccionadoTerminacion: any;
  rowSeleccionadoTerminacion(registro): boolean {
    return (this.registroSeleccionadoTerminacion === registro);
  }

  rowSeleccionTerminacion(registro): void {
    if (this.registroSeleccionadoTerminacion !== registro) {
      this.registroSeleccionadoTerminacion = registro;
    } else {
      this.registroSeleccionadoTerminacion = null;
    }
  }
  descargarArchivoTerminacion(): void {
    event.preventDefault();


    if (this.registroSeleccionadoTerminacion) {
      let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionadoTerminacion.archivo.id + '}';
      this._spinner.start('descargarArchivoTerminacion');
      this._archivoService
          .generarTicket(jsonArchivo, this.erroresConsultas)
          .subscribe(
              data => {
                let json = data.json();
                let url =
                    ConfigService.getUrlBaseAPI() +
                    '/api/v1/archivovisualizacion/' +
                    this.registroSeleccionadoTerminacion.archivo.id +
                    '?ticket=' +
                    json.ticket;
                window.open(url);
              },
              error => {
                //console.log('Error downloading the file.');
                this._spinner.stop('descargarArchivoTerminacion');
              },
              () => {
                console.info('OK');
                this._spinner.stop('descargarArchivoTerminacion');
              }
          );
    }

  }

  ////////////////////////////// MODAL DETALLES ////////////////////////////////////////////
    @ViewChild('modalDetalles') modalDetalles: ModalComponent;
    public listaDocumentos: Array<DocumentoServicioSocial> = [];
    inicializarModal(){
        //console.log("this.servicioSocial",this.servicioSocial);
        let urlParameter: URLSearchParams = new URLSearchParams();
        urlParameter.set('criterios', 'idServicio~' + this.servicioSocial.solicitudServicioSocial.id + ':IGUAL');
        let response=this._documentoServicioSocialService.getListaDocumentoServicioSocial(
            this.erroresConsultas,
            urlParameter
        ).subscribe(
            response => {
                let estudiante;

                response.json().lista.forEach((elemento) => {
                    estudiante = new DocumentoServicioSocial(elemento);
                    this.listaDocumentos.push(estudiante);
                });
                //console.log("listaDocumentos",this.listaDocumentos);
            }
        );
    }
    registroSeleccionadoModal: any;
    rowSeleccionadoModal(registro): boolean {
        return (this.registroSeleccionadoModal === registro);
    }

    rowSeleccionModal(registro): void {
        if (this.registroSeleccionadoModal !== registro) {
            this.registroSeleccionadoModal = registro;
        } else {
            this.registroSeleccionadoModal = null;
        }
    }
    descargarArchivoModal(): void {
        event.preventDefault();


        if (this.registroSeleccionadoModal) {
            let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionadoModal.archivo.id + '}';
            this._spinner.start('descargarArchivoModal');
            this._archivoService
                .generarTicket(jsonArchivo, this.erroresConsultas)
                .subscribe(
                    data => {
                        let json = data.json();
                        let url =
                            ConfigService.getUrlBaseAPI() +
                            '/api/v1/archivovisualizacion/' +
                            this.registroSeleccionadoModal.archivo.id +
                            '?ticket=' +
                            json.ticket;
                        window.open(url);
                    },
                    error => {
                        //console.log('Error downloading the file.');
                        this._spinner.stop('descargarArchivoModal');
                    },
                    () => {
                        console.info('OK');
                        this._spinner.stop('descargarArchivoModal');
                    }
                );
        }

    }

    cerrarModal(): void {
        this.modalDetalles.close();
    }

}
