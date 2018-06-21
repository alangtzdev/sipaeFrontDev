import {Component, ElementRef, Inject, Injector, NgZone, OnInit, Renderer, ViewChild} from '@angular/core';
import {URLSearchParams} from "@angular/http";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {ServicioSocialComponent} from "../servicio-social.component";
import {ConfigService} from "../../../services/core/config.service";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";
import {CatalogosServices} from "../../../services/catalogos/catalogos.service";
import {ItemSelects} from "../../../services/core/item-select.model";
import * as moment from "moment";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Validacion} from "../../../utils/Validacion";
import {ServicioSocial} from "../../../services/entidades/servicio-social.model";

@Component({
  selector: 'app-modal-servicio-social',
  templateUrl: './modal-servicio-social.component.html',
  styleUrls: ['./modal-servicio-social.component.css']
})
export class ModalServicioSocialComponent implements OnInit {

  @ViewChild("modalServSocial")
  dialog: ModalComponent;
  context: ServicioSocialComponent;

  peticionEnCurso: boolean = false;

  mostrarUpload: boolean = true;
  _archivosService;
  _solicitudServicioSocialService;
  _servicioSocialService;
  _documentoServicioSocialService;
  _enviarCorreo;
  registros: Array<any> = [];
  public registrosGuardados = 0;
  registroSeleccionado: any;
  uploadFile: any;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  basicProgress: number = 0;
  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];

  columnas: Array<any> = [
    { titulo: 'Documento', nombre: 'nombre' }
  ];

  tabActiva: number = 1;

  formularioSolicitudServicioSocial: FormGroup;
  mensajeErrors: any = {
    'required': 'Este campo es requerido',
    'invalidEmailAddress': 'Correo electrónico inválido',
    'invalidPassword': 'Contraseña inválida, debe contener al menos 6 caracteres' +
    ' un número y una letra en mayúscula',
    'invalidNumero': 'Sólo admite números',
    'invalidLetras': 'Sólo admite letras',
    'invalidLetrasNumeros': 'Sólo admite letras y números',
    'invalidLetrasWithoutSpace': 'Sólo admite letras sin espacio',
    'invalidLetrasNumerosWithoutSpace': 'Sólo admite letras y números sin espacio',
    'invalidCurp': 'CURP Inválida',
    'invalidNumeroTelefonico': 'Formato incorrecto(000-000-0000) ó (000-000-0)',
    'invalidCaracter': 'Caracteres no validos',
    'invalidLetrasNumerosAcentoPuntoComa':
      'Sólo admite letras, números, ".", ",", ":", "-" y espacio',
    'invalidLetrasNumerosAcentoPuntoComaGato':
      'Sólo admite letras, números, ".", ",", ":", "-", "#" y espacio',
    'invalidNumerosFloat': 'El formato es: 100.00',
    'invalidAnio': 'El formato es: YYYY',
    'invalidHora': 'El formato de 24 hr HH:MM am|pm',
    'pattern': 'Formato incorrecto',
    'pattern_horario': 'El formato es: "HH:MM" (24Hrs)',
    'invalidHours': 'El número de horas debe estar entre 1 y 80',
  };
  validacionActiva: boolean = false;
  rangoFechasValido: boolean = true;
  ocupado_sss: boolean = false;
  ocupado_ss: boolean = false;
  ocupado_dss: boolean = false;
  ocupado_ca: boolean = false;
  ocupado_cd: boolean = false;
  public stringInstitucion: string = 'institucion';

  public intIdPais: string = 'idPais';
  public intIdSector: string = 'idSector';
  public intIdEntidadFederativa: string = 'idEntidadFederativa';
  public intIdMunicipio: string = 'idMunicipio';
  public intIdEstudiante: string = 'idEstudiante';
  public idEstudiante: number;
  public idEstatus: number;
  public idServicioSocial: any;
  mostrarBtnEliminar: boolean = false;

  ocultarDireccion: boolean;

  private opcionesCatalogoPais: Array<ItemSelects> = [];
  private opcionesCatalogoSector: Array<ItemSelects> = [];
  private opcionesCatalogoTipoDocumento: Array<ItemSelects> = [];
  private opcionesCatalogoEntidadFederativa: Array<ItemSelects> = [];
  private opcionesCatalogoMunicipio: Array<ItemSelects> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<ErrorCatalogo> = [];

  constructor(private inj:Injector,
              @Inject(NgZone) private zone: NgZone,  private elementRef: ElementRef,
               private _renderer: Renderer, public _catalogosService: CatalogosServices,
              private _spinner: SpinnerService) {
    moment.locale('es');
    this.context = this.inj.get(ServicioSocialComponent);

    this.prepareServices();

    this.peticionEnCurso = false;
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.idEstudiante = this.context.idEstudiante;

    //console.log("this.idEstudiante", this.idEstudiante);

    this.idServicioSocial = {
      proyecto: '',
      actividades: '',
      fechaFin: '',
      fechaInicio: '',
      resoluciones: '',
      observaciones: '',
      idSolicitudServicio: ''

    };


    this.idEstatus = 1205; //estatus pendiente

    this.inicializarFormulario();

    //picker///
    (this.tomorrow = new Date()).setDate(this.tomorrow.getDate());
    (this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
    (this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
    this.events = [
      { date: this.tomorrow, status: 'full' },
      { date: this.afterTomorrow, status: 'partially' }
    ];
    //picker//

  }

  private inicializarFormulario(): void {

    this.formularioSolicitudServicioSocial = new FormGroup({
      idEstudiante: new FormControl('', Validators.required),
      institucion: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaValidator])),
      idPais: new FormControl('', Validators.required),
      idEntidadFederativa: new FormControl('', Validators.required),
      idMunicipio: new FormControl('', Validators.required),
      telefono: new FormControl('', Validators.compose([Validators.required,
        Validacion.telefonoValidator])),
      codigoPostal: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaValidator])),
      calleNumero: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaGatoValidator])),
      idSector: new FormControl('', Validators.required),
      colonia: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaValidator])),
      responsable: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaValidator])),
      cargo: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaValidator])),
      beca: new FormControl('', Validators.required),
      numeroHoras: new FormControl('', Validators.compose([Validators.required,
        Validacion.numerosValidator, Validacion.hoursValidator])),
      horario: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaValidator])),
      idEstatus: new FormControl(this.idEstatus),
      dias: new FormControl('', Validators.compose([Validators.required,
        Validacion.letrasNumerosAcentoPuntoComaValidator])),
      fechaInicio: new FormControl('', Validators.required),
      fechaFin: new FormControl('', Validators.required),
      fechaSolicitud: new FormControl(''),

    });

    (<FormControl>this.formularioSolicitudServicioSocial.controls[this.intIdEstudiante])
      .setValue(this.idEstudiante);
  }

  handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        ////console.log("responseJson", responseJson);
        if (responseJson.id) {
          this.registros.push({
            idArchivo: responseJson.id,
            nombreArchivo: responseJson.originalName
          });
          this.mostrarUpload = true;
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
  public getDate(): string { return  moment(this.dt).format('DD/MM/YYYY'); }
  public today(): void { this.dt = new Date(); }


  public getDateEnd(): string { return  moment(this.dtend).format('DD/MM/YYYY'); }
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

  public disabled(date: Date, mode: string): boolean { return (mode === 'day' &&
  (date.getDay() === 0 || date.getDay() === 6)); }
  public open(): void { this.opened = !this.opened; }
  public clear(): void { this.dt = void 0; this.dtend = void 0; }
  public toggleMin(): void {
    this.dt = this.tomorrow;
    this.dtend = this.dt;
  }

  ////// picker /////

  //DROPDOWN REQUERIDO PARA EL PICKER///

  public status: { isopen: boolean } = { isopen: false };
  public toggled(open: boolean): void { /*//console.log('Dropdown is now: ', open);*/ }
  public toggleDropdown($event: MouseEvent): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.status.isopen = !this.status.isopen;
  }
  //DROPDOWN REQUERIDO PARA EL PICKER///

  verificarFechas(control: string, forzar = false): void {
    if (!this.status.isopen || forzar) {
      let valor;
      switch (control) {
        case 'fechaInicio': valor =  moment(this.dt).format('DD/MM/YYYY'); break;
        case 'fechaFin': valor =  moment(this.dtend).format('DD/MM/YYYY'); break;
      }
      this.rangoFechasValido = (this.dtend > this.dt) ? true : false;
      (<FormControl>this.formularioSolicitudServicioSocial.controls[control]).setValue(valor);
    }
  }

  canShow(): boolean {
    return true;
  }
  ocultarDireccionMexico(): boolean {
    if (this.ocultarDireccion) {
      return false;
    }else {
      return true;
    }
  }
  eliminarArchivo() {
    if (this.registroSeleccionado) {
      this._archivosService.deleteArchivo(
        this.registroSeleccionado.idArchivo,
        this.erroresConsultas
      )
        .subscribe(
          response => {
          },
          error => {
            this.registroSeleccionado = null;
          },
          () => {
            this.mostrarUpload = true;
            for (var index = 0; index < this.registros.length; index++) {
              let element = this.registros[index];
              if (element.idArchivo === this.registroSeleccionado.idArchivo) {
                this.registros.splice(index, 1);
                this.registroSeleccionado = null;
              }
            }
          }
        );
    }
  }

  cerrarModal(): void {
    if (this.context.obtenerListaDatosEstudiante) {
      this.context.obtenerListaDatosEstudiante();
    }
    this.dialog.close();
  }
  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioSolicitudServicioSocial.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (campo == 'fechaFin' && this.rangoFechasValido == false &&
      this.validacionActiva == true) {
      return true;
    }
    if (!(<FormControl>this.formularioSolicitudServicioSocial.controls[campo]).valid &&
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
            if (errorType !== 'invalidHours' ||
              (errorType === 'invalidHours' && resultado !== 'Sólo admite números'))
              resultado += this.mensajeErrors[errorType];
          }

        }
      }
    }
    return resultado;
  }

  validarFormulario(): boolean {

    this.rangoFechasValido = (this.dtend > this.dt) ? true : false;

    if (this.formularioSolicitudServicioSocial.valid) {
      //this.validacionActiva = false;

      return true;
    }
    this.validacionActiva = true;

    return false;
  }
  peticionesPendientes(): boolean {
    let res = false;
      //console.log('ocupado:', this.ocupado_sss, this.ocupado_ss, this.ocupado_dss,this.ocupado_ca, this.ocupado_cd);
    if (this.ocupado_sss || this.ocupado_ss || this.ocupado_dss || this.ocupado_ca ||
      this.ocupado_cd) {
      res = true;
    }
    return res
  }
  validarSolicitud(): void {

    //console.log('validarSolicitud', this.formularioSolicitudServicioSocial.valid,
    //this.rangoFechasValido, this.peticionesPendientes() == false);
    //event.preventDefault();


    //console.log('idPais' + this.getControl('idPais').value);
    if (this.ocultarDireccion) {
      (<FormControl>this.formularioSolicitudServicioSocial.controls['idEntidadFederativa'])
        .setValue(1);
      (<FormControl>this.formularioSolicitudServicioSocial.controls['idMunicipio'])
        .setValue(1);
      (<FormControl>this.formularioSolicitudServicioSocial.controls['colonia'])
        .setValue('algo');
      (<FormControl>this.formularioSolicitudServicioSocial.controls['codigoPostal'])
        .setValue(76555);
      //console.log('el numero de hora sdebe ser mayor');
    }

    if (this.registros.length === 0) {
      (<FormControl>this.formularioSolicitudServicioSocial.controls['numeroHoras'])
        .setValue(10);
    }
    this.idEstudiante = +(<FormControl>this.formularioSolicitudServicioSocial.
        controls['idEstudiante']).value;
    if (this.validarFormulario()) {
      if (this.formularioSolicitudServicioSocial.valid && this.rangoFechasValido &&
        this.peticionesPendientes() == false) {
        if (this.ocultarDireccion) {
          (<FormControl>this.formularioSolicitudServicioSocial.
            controls['idEntidadFederativa'])
            .setValue(null);
          (<FormControl>this.formularioSolicitudServicioSocial.controls['idMunicipio'])
            .setValue(null);
          (<FormControl>this.formularioSolicitudServicioSocial.controls['colonia'])
            .setValue(null);
          (<FormControl>this.formularioSolicitudServicioSocial.controls['codigoPostal'])
            .setValue(null);
        }

        if (this.registros.length === 0) {
          (<FormControl>this.formularioSolicitudServicioSocial.controls['numeroHoras'])
            .setValue(null);
        }

        this.peticionEnCurso = true;
        let jsonFormulario = JSON.stringify(this.formularioSolicitudServicioSocial.value,
          null, 2);
        let objFormulario = JSON.parse(jsonFormulario);

        //   //console.log('FORMULARIO:::::', jsonFormulario);

        objFormulario.fechaSolicitud = moment(new Date()).format('DD/MM/YYYY hh:mma');
        objFormulario.fechaInicio = moment(this.dt).format('DD/MM/YYYY') + ' ' +
          moment('00:00', 'hh:mm').format('hh:mma');
        objFormulario.fechaFin = moment(this.dtend).format('DD/MM/YYYY') + ' ' +
          moment('00:00', 'hh:mm').format('hh:mma');
        objFormulario.idEstudiante = this.idEstudiante;

        let fechaInicioSS = objFormulario.fechaInicio;
        let fechaFinSS = objFormulario.fechaFin;

        if (objFormulario.beca.checked == true) {
          objFormulario.beca = true;
        } else {
          objFormulario.beca = false;
        }

        jsonFormulario = JSON.stringify(objFormulario, null, 2);
        //console.log("jsonFormulario", jsonFormulario);
          //console.log('postSolicitudServicioSocial');
        this.ocupado_sss = true;
        this._spinner.start("validarSolicitud");
        this._solicitudServicioSocialService.postSolicitudServicioSocial(
          jsonFormulario,
          this.erroresGuardado
        ).subscribe(
          response => {
          var json = response.json();
            if (json.id) {
              //enviar un nuevo objeto servicio social
              //para ServicioSocialService
              this.idServicioSocial.idSolicitudServicio = json.id;
              this.idServicioSocial.fechaFin = fechaFinSS;
              this.idServicioSocial.fechaInicio = fechaInicioSS;
              let servicioSocialStr = JSON.stringify(this.idServicioSocial, null, 2);
              this.ocupado_ss = true;
              this._servicioSocialService.postServicioSocial(
                servicioSocialStr,
                this.erroresGuardado
              ).subscribe(
                response => {
                    //console.log('response postServicioSocial'); }
                    var jsonResponse = response.json();
                    if (jsonResponse.id) {
                      for (var index = 0; index < this.registros.length;
                           index++) {
                        var element = this.registros[index];
                        element.idServicio = this.idServicioSocial.
                          idSolicitudServicio;
                        element.valido = true;
                        element.otroTipoDocumento = 'otroTipoDocumento';
                        delete element.nombreArchivo;
                        element.idTipoDocumento = 34;
                        var jsonStr = JSON.stringify(element, null, 2);
                        this.ocupado_dss = true;
                        this._documentoServicioSocialService.postDocumentoServicioSocial(jsonStr,
                          this.erroresGuardado).subscribe(
                          response => function () {
                          },
                          error => {
                              //console.log('error postDocumentoServicioSocial');
                              console.error(error);

                          },
                          () => {
                            this.registrosGuardados += 1;
                            if (this.registrosGuardados ==
                              this.registros.length) {
                              this.ocupado_dss = false;
                              this.peticionEnCurso = false;
                              this.cerrarModal();
                            }
                          }
                        );
                      }
                      this.ocupado_ss = true;
                      this._servicioSocialService.getEntidadServicioSocial(
                        jsonResponse.id,
                        this.erroresConsultas
                      ).subscribe(
                        response => {
                          let entidadServicioSocial = new ServicioSocial(
                            response.json());

                          let formularioCorreoAlumno:FormGroup;
                          formularioCorreoAlumno = new FormGroup({
                            destinatario: new FormControl(entidadServicioSocial.
                              solicitudServicioSocial
                              .estudiante.usuario.email),
                            entidad: new FormControl({
                              SolicitudServicio: entidadServicioSocial.solicitudServicioSocial.id
                            }),
                            idPlantillaCorreo: new FormControl('27')
                          });
                          let jsonFormulario2 = JSON.stringify(
                            formularioCorreoAlumno.value, null, 2);
                          this.ocupado_ca = true;
                          this._enviarCorreo
                            .postCorreoElectronico(
                              jsonFormulario2,
                              this.erroresGuardado
                            ).subscribe(
                            response => {

                            },
                            error => {
                                console.error(error);
                              this.ocupado_ca = false;
                            },
                            () => {
                              this.ocupado_ca = false;
                            }
                          );

                          let formularioCorreoDocente:FormGroup;
                          formularioCorreoDocente = new FormGroup({
                            destinatario: new FormControl(
                              'docencia@colsan.edu.mx'),
                            asunto: new FormControl(
                              'Nueva solicitud de servicio social'),
                            entidad: new FormControl({
                              SolicitudServicio: entidadServicioSocial.solicitudServicioSocial.id
                            }),
                            idPlantillaCorreo: new FormControl('28')
                          });
                          let jsonFormulario = JSON.stringify(
                            formularioCorreoDocente.value, null, 2);
                          this.ocupado_cd = true;
                          this._enviarCorreo
                            .postCorreoElectronico(
                              jsonFormulario,
                              this.erroresGuardado
                            ).subscribe(
                            response => {

                            },
                            error => {
                                console.error(error);
                              this.ocupado_cd = false;
                            },
                            () => {
                              this.ocupado_cd = false;
                            }
                          );
                          this.ocupado_ss = false;
                        }
                      );
                    }

                },
                error => {

                  console.error(error);
                },
                () => {
                  if (this.registros.length == 0) {//no hay documentos que guardar
                    this.ocupado_ss = false;
                    this.peticionEnCurso = false;
                    this.cerrarModal();
                  }
                  this._spinner.stop("validarSolicitud");

                }
              );

            }
          },
          error => {
            this.ocupado_sss = false;
            console.error(error);
          },
          () => {
            this.ocupado_sss = false;
          }
        );
      } else {
        this.peticionEnCurso = false;
      }
    } else {
      this.peticionEnCurso = false;
      if (this.getControlErrors('idEstudiante') ||
        this.getControlErrors('institucion') ||
        this.getControlErrors('idPais') ||
        this.getControlErrors('idEntidadFederativa') ||
        this.getControlErrors('idMunicipio') ||
        this.getControlErrors('telefono') ||
        this.getControlErrors('codigoPostal') ||
        this.getControlErrors('calleNumero') ||
        this.getControlErrors('idSector') ||
        this.getControlErrors('colonia') ||
        this.getControlErrors('responsable') ||
        this.getControlErrors('cargo') ||
        this.getControlErrors('beca')) {
        this.tabActiva = 1;

      }
    }
  }

  rowSeleccionado(registro): boolean {
    return (this.registroSeleccionado === registro);
  }
  rowSeleccion(registro): void {
    if (this.registroSeleccionado !== registro) {
      this.registroSeleccionado = registro;
      this.mostrarBtnEliminar = true;
    } else {
      this.registroSeleccionado = null;
      this.mostrarBtnEliminar = false;
    }
  }
  onCambiosTabla(): void {

  }

  private prepareServices(): void {
    this._solicitudServicioSocialService =
      this._catalogosService.getSolicitudServicioSocialService();
    this._servicioSocialService = this._catalogosService.getServicioSocialService();
    this._documentoServicioSocialService =
      this._catalogosService.getDocumentoServicioSocialService();
    this._enviarCorreo = this._catalogosService.getEnvioCorreoElectronicoService();
    this.opcionesCatalogoPais =
      this._catalogosService.getPais().getSelectPais(this.erroresConsultas);
    this.opcionesCatalogoSector =
      this._catalogosService.getSector().getSelectSector(this.erroresConsultas);
    this._archivosService = this._catalogosService.getArchivos();
    this.onCambiosTabla();

  }
  private cargarEntidadesFederativas(id: number): void {
    if (id == 82) {
      this.ocultarDireccion = false;
    }else {
      this.ocultarDireccion = true;
    }
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idPais~' + id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesCatalogoEntidadFederativa =
      this._catalogosService.getEntidadFederativa().getSelectEntidadFederativa(
        this.erroresConsultas, urlParameter);
  }
  private cargarMunicipios(id: number): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterio = 'idEntidadFederativa~' + id + ':IGUAL';
    urlParameter.set('criterios', criterio);
    this.opcionesCatalogoMunicipio =
      this._catalogosService.getMunicipio().getSelectMunicipio(this.erroresConsultas,
        urlParameter);
  }

  ngOnInit() {
  }

}
