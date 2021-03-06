import { Component, OnInit, Input, Injector, NgZone, Inject, ViewChild } from '@angular/core';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {ConfigService} from '../../services/core/config.service';
import {DocumentoServicioSocial} from
  '../../services/entidades/documento-servicio-social.model';
import {ServicioSocial} from '../../services/entidades/servicio-social.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {URLSearchParams} from '@angular/http';
import {ItemSelects} from '../../services/core/item-select.model';
import {Validacion} from '../../utils/Validacion';
import { NgUploaderOptions } from 'ngx-uploader';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {
  SolicitudServicioSocialService
} from '../../services/entidades/solicitud-servicio-social.service';

@Component({
  selector: 'app-reporte-final-component',
  templateUrl: './reporte-final-component.component.html',
  styleUrls: ['./reporte-final-component.component.css']
})
export class ReporteFinalComponentComponent implements OnInit {
    @Input() servicioSocial: ServicioSocial;
    @Input() padre: any;
    @Input() abuelo: any;
    @Input() detalles: boolean;
    // router: Router;

    @ViewChild('modalConfirmacionTerminoSS')
    modalConfirmacionTerminoSS: ModalComponent;
    animation: boolean = true;
    keyboard: boolean = false;
    backdrop: string | boolean = 'static';
    css: boolean = true;
    size: string = 'lg';
    output: string;
    private descripcionError: string = '';

    idArchivo: number;
    nombreArchivo: string = '';
    idTipoDocumento: number;
    registrosFinal: Array<any>;
    mostrarUpload: boolean = true;
    registroSeleccionado: any;
    uploadFile: any;
    options: NgUploaderOptions;
    basicProgress: number = 0;
    basicResp: Object;
    dropProgress: number = 0;
    dropResp: any[] = [];
    _archivoService;
    _documentoServicioSocialService;
    tipoDocumentoService;
    tipoDocumentoCG: FormGroup;
    tiposUtilizados: Array<number> = [];
    private opcionesCatalogoTipoDocumento: Array<ItemSelects> = [];
    private erroresConsultas: Array<ErrorCatalogo> = [];
    private erroresGuardado: Array<ErrorCatalogo> = [];
    private erroresCarga: Array<any> = [];
    constructor(@Inject(NgZone) private zone: NgZone,
                private injector: Injector,
                private _spinner: SpinnerService,
                private _catalogosServices: CatalogosServices,
                private _solicitudServicioSocialService: SolicitudServicioSocialService ) {
        this.prepareServices();
        this.inicializarOpcionesNgZone();
        this.tipoDocumentoCG = new FormGroup({
            idTipoDoc: new FormControl(-1)
        });
        // this.inicializarServicioSocial();
        // upload
        this.zone = new NgZone({ enableLongStackTrace: false });
        // upload

        let urlSearch = new URLSearchParams();
        urlSearch.set('criterios', 'id~32:IGUAL;OR,id~33:IGUAL;OR,id~36:IGUAL;OR');
        this.opcionesCatalogoTipoDocumento =
            this.tipoDocumentoService.getSelectTipoDocumentoCriterio(this.erroresConsultas,
                urlSearch);
    }

    inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions ({
        url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
        filterExtensions: true,
        allowedExtensions: ['pdf'],
        withCredentials: false,
        authToken: localStorage.getItem('token')
    });
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

    handleBasicUpload(data): void {
        this.basicResp = data;
        this.zone.run(() => {
            this.basicProgress = data.progress.percent;
            if (this.basicResp['response'] && this.basicResp['status'] === 201) {
                let responseJson = JSON.parse(this.basicResp['response']);
                if (responseJson.id) {
                    this.idArchivo = responseJson.id;
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
    descargarArchivo(): void {
        event.preventDefault();


        if (this.registroSeleccionado) {
            let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionado.archivo.id + '}';
            this._spinner.start('descargarArchivo');
            this._archivoService
                .generarTicket(jsonArchivo, this.erroresConsultas)
                .subscribe(
                data => {
                    let json = data.json();
                    let url =
                        ConfigService.getUrlBaseAPI() +
                        '/api/v1/archivovisualizacion/' +
                        this.registroSeleccionado.archivo.id +
                        '?ticket=' +
                        json.ticket;
                    window.open(url);
                },
                error => {
                    //// console.log('Error downloading the file.');
                    this._spinner.stop('descargarArchivo');
                },
                () => {
                    // console.info('OK');
                    this._spinner.stop('descargarArchivo');
                }
                );
        }

    }
    eliminarArchivo() {
        event.preventDefault();
        if (this.registroSeleccionado) {
            ////console.log('Eliminando...');
            ////console.log(this.registroSeleccionado.id);
            this._archivoService.deleteArchivo(
                this.registroSeleccionado.archivo.id,
                this.erroresConsultas
            ).subscribe(
                () => {}, // console.log('Success'),
                error => {console.error(error); },
                () => {
                    this.mostrarUpload = true;
                    this._documentoServicioSocialService.deleteDocumentoServicioSocial(
                        this.registroSeleccionado.id, this.erroresGuardado).subscribe(
                        response => {
                            // console.log(response);
                        },
                        console.error,
                        () => {
                            ////console.log("completado");
                            this.onCambiosTablaFinal();
                        }
                    );

                }
                );
        } else {
            // alert('Selecciona un registro');
            ////console.log('Selecciona un registro');
        }
    }
    onCambiosTablaFinal(): void {
        if (this.servicioSocial) {
            this.registrosFinal = [];
            this.tiposUtilizados = [];
            let urlParameter: URLSearchParams = new URLSearchParams();
            let criterios = 'idTipoDocumento.id~32:IGUAL;OR,idTipoDocumento.id~33:IGUAL;OR,' +
                'idTipoDocumento.id~36:IGUAL;ORGROUPAND,idServicio~' +
                this.servicioSocial.solicitudServicioSocial.id + ':IGUAL';
            urlParameter.set('criterios', criterios);
            this._documentoServicioSocialService
                .getListaDocumentoServicioSocial(this.erroresConsultas, urlParameter)
                .subscribe(
                response => {
                    let documento;

                    response.json().lista.forEach((elemento) => {
                        documento = new DocumentoServicioSocial(elemento);
                        this.registrosFinal.push(documento);
                        this.tiposUtilizados.push(documento.tipoDocumento.id);
                    });
                }
                );
        }
    }
    validarDocumentoFinal(): void {
        this.erroresCarga = [];
        if (!this.idArchivo) {
            this.addErrorsMesaje('Falta cargar archivo', 'danger');
        } else {
            if (!(this.idTipoDocumento > 0)) {
                this.addErrorsMesaje('Falta seleccionar tipo de documento', 'danger');
            } else {
                if (this.tiposUtilizados.filter(x => x == this.idTipoDocumento).length > 0) {
                    this.addErrorsMesaje('Ya existe un documento de este tipo', 'danger');
                } else {
                    this.agregarDocumento();
                }
            }
        }
    }

    addErrorsMesaje(mensajeError, tipo): void {
        this.erroresCarga.push({
            type: tipo,
            msg: mensajeError,
            closable: true
        });
    }

    cerrarAlerta(i: number): void {
        this.erroresCarga.splice(i, 1);
    }

    agregarDocumento(): void {
        if (this.idArchivo && this.idTipoDocumento) {
            let objFormulario = {
                idArchivo: this.idArchivo,
                idServicio: this.servicioSocial.solicitudServicioSocial.id,
                valido: true,
                otroTipoDocumento: 'otroTipoDocumento',
                idTipoDocumento: this.idTipoDocumento
            };

            let jsonFormulario = JSON.stringify(objFormulario, null, 2);
            this._documentoServicioSocialService.postDocumentoServicioSocial(jsonFormulario,
                this.erroresGuardado).subscribe(
                response => function () {
                    this.tiposUtilizados.push(this.idTipoDocumento);
                    this.idArchivo = null;
                    this.nombreArchivo = '';
                    (<FormControl>this.tipoDocumentoCG.controls['idTipoDoc']).patchValue(-1);
                },
                console.error,
                () => {
                    this.idArchivo = null;
                    this.nombreArchivo = '';
                    (<FormControl>this.tipoDocumentoCG.controls['idTipoDoc']).patchValue(-1);
                    this.onCambiosTablaFinal();
                }
            );
        }
    }

    cambiarTipoDocumento(valor: any): void {
        this.idTipoDocumento = valor;
        ////console.log("idTipoDocumento", this.idTipoDocumento);
    }
    ngOnInit(): void {
        if (this.servicioSocial) {
            this.onCambiosTablaFinal();
        }
    }
    canShow(): boolean {
        if (this.servicioSocial) {
            if (this.servicioSocial.solicitudServicioSocial.estatus.id === 1208) {
                return false;
            }
        }
        return true;
    }
    ///// Inicia funcionalidad de modal confimacion /////
    modalConfirmarTerminarServicio(): void {
      this.modalConfirmacionTerminoSS.open();
      /*
        let dialog: Promise<ModalDialogInstance>;
        let modalConfig = new ModalConfig('sm', true, 27);
        let bindings = Injector.resolve([
            provide(ICustomModal, {
                useValue: new ModalConfirmarTerminarServicioData(
                    this.servicioSocial,
                    this.padre,
                    this.abuelo
                )
            }),
            provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
            provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
            provide(Renderer, { useValue: this._renderer })
        ]);

        dialog = this.modal.open(
            <any>ModalConfirmarTerminarServicio,
            bindings,
            modalConfig
        );
        */
    }

    terminarServicio(): void {
      let objFormulario = {
            idEstatus:0
        };

        objFormulario.idEstatus = 1208;

        let jsonFormulario = JSON.stringify(objFormulario, null, 2);
        // console.log(this.context.idServicioSocial.solicitudServicioSocial.id);
        this._solicitudServicioSocialService.putSolicitudServicioSocial(
            this.servicioSocial.solicitudServicioSocial.id,
            jsonFormulario,
            this.erroresGuardado
        ).subscribe(
            response => {
                this.cerrarModalConfirmacionTerminoSS();
                this.padre.cerrarModalInformacionServicioSocial();
                this.abuelo.onCambiosTabla();
            },
            console.error,
            () => {
                this.cerrarModalConfirmacionTerminoSS();
                this.padre.cerrarModalInformacionServicioSocial();
                this.abuelo.onCambiosTabla();
            }
        );

    }

    cerrarModalConfirmacionTerminoSS(): void {
      this.modalConfirmacionTerminoSS.close();
    }
    ///// Termina funcionalidad de modal confimacion /////
    modalRechazarReporte(): void {
      /*
        let dialog: Promise<ModalDialogInstance>;
        let modalConfig = new ModalConfig('sm', true, 27);

        let bindings = Injector.resolve([
            provide(ICustomModal, {
                useValue: new ModalConfirmarRechazarReporteData(
                    this.servicioSocial,
                    this.padre,
                    this.abuelo
                )
            }),
            provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
            provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
            provide(Renderer, { useValue: this._renderer })
        ]);

        dialog = this.modal.open(
            <any>ModalConfirmarRechazarReporte,
            bindings,
            modalConfig
        );
        */
    }

    prepareServices(): void {
        this._archivoService = this._catalogosServices.getArchivos();
        this._documentoServicioSocialService =
            this._catalogosServices.getDocumentoServicioSocialService();
        this.tipoDocumentoService = this._catalogosServices.getTipoDocumento();
    }

}
