import { Component, OnInit, Injector, Input, ViewChild } from '@angular/core';
import {ServicioSocialService} from '../../services/entidades/servicio-social.service';
import {ArchivoService} from '../../services/entidades/archivo.service';
import {SolicitudServicioSocialService} from '../../services/entidades/solicitud-servicio-social.service';
import {DocumentoServicioSocialService} from '../../services/entidades/documento-servicio-social.service';
import {Validacion} from '../../utils/Validacion';
import {FormGroup, Validators, FormControl} from '@angular/forms';
import {URLSearchParams} from'@angular/http';
import * as moment from 'moment';
import {ReporteBimestral} from '../../services/entidades/reporte-bimestral.model';
import {DocumentoServicioSocial} from
  '../../services/entidades/documento-servicio-social.model';
import {ErrorCatalogo} from'../../services/core/error.model';
import {SpinnerService} from'../../services/spinner/spinner/spinner.service';
import {ConfigService} from '../../services/core/config.service';
import {ModalComponent} from 'ng2-bs3-modal/components/modal';
import {ReporteBimestralService} from '../../services/entidades/reporte-bimestral.service';

@Component({
  selector: 'app-reporte-bimestral-component',
  templateUrl: './reporte-bimestral-component.component.html',
  styleUrls: ['./reporte-bimestral-component.component.css']
})

export class ReporteBimestralComponentComponent implements OnInit {

    @Input() reporteServicioSocial: ReporteBimestral;
    @Input() padre: any;
    @Input() detalles: boolean;
    registroSeleccionado: any;

    @ViewChild('modalConfirmacionSolicitud')
    modalDetalleServicioSocial: ModalComponent;
    animation: boolean = true;
    keyboard: boolean = false;
    backdrop: string | boolean = 'static';
    css: boolean = true;
    size: string = 'lg';
    output: string;
    private descripcionError: string = '';

    formularioReporteBimestral: FormGroup;
    validacionActiva: boolean = false;
    rangoFechasValido: boolean = true;
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
        'invalidNumerosFloat': 'El formato es: 100.00',
        'invalidAnio': 'El formato es: YYYY',
        'invalidHora': 'El formato de 24 hr HH:MM am|pm',
        'pattern': 'Formato incorrecto',
        'pattern_horario': 'El formato es: "HH:MM" (24Hrs)'
    };
    ocupado_ss: boolean = false;

    // variables modalConfimraicon //
    private jsonFormularioReporte: any;
    // fin variables modal confirmacion //

    public listaDocumentos: Array<DocumentoServicioSocial> = [];
    private erroresConsultas: Array<ErrorCatalogo> = [];
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

    public disabled(date: Date, mode: string): boolean { return (mode === 'day' &&
        (date.getDay() === 0 || date.getDay() === 6)); }
    public open(): void { this.opened = !this.opened; }
    public clear(): void { this.dt = void 0; this.dtend = void 0; }
    public toggleMin(): void {
        this.dt = new Date(this.minDate.valueOf());
        this.dtend = new Date(this.minDate.valueOf());
    }


    ////// picker /////
    // DROPDOWN REQUERIDO PARA EL PICKER///

    public status: { isopen: boolean } = { isopen: false };
    public toggled(open: boolean): void { /*console.log('Dropdown is now: ', open); */}
    public toggleDropdown($event: MouseEvent): void {
        $event.preventDefault();
        $event.stopPropagation();
        this.status.isopen = !this.status.isopen;
    }

    // DROPDOWN REQUERIDO PARA EL PICKER///
    verificarFechas(control: string, forzar = false): void {
        if (!this.status.isopen || forzar) {
            let valor;
            switch (control) {
                case 'fechaInicio': valor = moment(this.dt).format('DD/MM/YYYY'); break;
                case 'fechaFin': valor = moment(this.dtend).format('DD/MM/YYYY'); break;
            }
            this.rangoFechasValido = (this.dtend > this.dt) ? true : false;
            (<FormControl>this.formularioReporteBimestral.controls[control]).patchValue(valor);
        }
    }

    constructor(private _servicioSocialService: ServicioSocialService,
        private _archivoService: ArchivoService,
        private _solicitudServicioSocialService: SolicitudServicioSocialService,
        private injector: Injector,
        private _documentoServicioSocialService: DocumentoServicioSocialService,
        private _reporteBimestralService: ReporteBimestralService,
        private _spinner: SpinnerService) {

        this.inicializarFormulario();
        // picker///
        (this.tomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
        (this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 2);
        (this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
        this.events = [
            { date: this.tomorrow, status: 'full' },
            { date: this.afterTomorrow, status: 'partially' }
        ];
        // picker //
    }
    ngOnInit() {
        //// console.log("padre", this.padre);
        // console.log('historial', this.reporteServicioSocial.servicioSocial);
        let urlParameter: URLSearchParams = new URLSearchParams();
        let criterios = 'idServicio~' +
            this.reporteServicioSocial.servicioSocial.solicitudServicioSocial.id + ':IGUAL';
        criterios += ',' + 'idTipoDocumento~' + 30 + ':IGUAL';
        urlParameter.set('criterios', criterios);
        this.listaDocumentos.push(this.reporteServicioSocial.documento);
    }
    private inicializarFormulario(): void {

        this.formularioReporteBimestral = new FormGroup({
            horas: new FormControl('', Validators.
                compose([Validators.required, Validacion.numerosValidator])),
            observaciones: new FormControl('', Validators.
                compose([Validators.required])),
            actividadesRealizadas: new FormControl('', Validators.
                compose([Validators.required, Validacion.parrafos])),
            fechaInicio: new FormControl('', Validators.required),
            fechaFin: new FormControl('', Validators.required),
        });
    }
    getControl(campo: string): FormControl {
        return (<FormControl>this.formularioReporteBimestral.controls[campo]);
    }

    getControlErrors(campo: string): boolean {
        if (campo == 'fechaFin' && this.rangoFechasValido == false &&
            this.validacionActiva == true) {
            return true;
        }
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
        this.rangoFechasValido = (this.dtend > this.dt) ? true : false;
        if (this.formularioReporteBimestral.valid) {
            // this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
    }

    validarSolicitudServicioSocial(): void {
        // console.log('this.validarFormulario()', this.reporteServicioSocial.servicioSocial);
        if (this.validarFormulario() && this.rangoFechasValido &&
            this.peticionesPendientes() === false) {
                let jsonFormulario = JSON.stringify(this.formularioReporteBimestral.value, null, 2);

                let objFormulario = JSON.parse(jsonFormulario);

                objFormulario.fechaInicio = moment(this.dt).format('DD/MM/YYYY') + ' ' +
                    moment('00:00', 'hh:mm').format('hh:mma');
                objFormulario.fechaFin = moment(this.dtend).format('DD/MM/YYYY') + ' ' +
                    moment('00:00', 'hh:mm').format('hh:mma');
                objFormulario.idServicioSocial = this.reporteServicioSocial.servicioSocial.id;
                objFormulario.idEstatus = 1209;

                this.jsonFormularioReporte = JSON.stringify(objFormulario, null, 2);
                this.abrirModalConfirmacionServicioSocial();

        }

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
    descargarArchivo(): void {
        event.preventDefault();


        if (this.registroSeleccionado) {
            let jsonArchivo = '{"idArchivo": ' + this.registroSeleccionado.archivo.id + '}';
            this._spinner.start('descargar');
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
                    ////console.log('Error downloading the file.');
                    this._spinner.stop('descargar');
                },
                () => {
                    // console.info('OK');
                    this._spinner.stop('descargar');
                }
                );
        }

    }
    //// Modal de confirmacion //////
    abrirModalConfirmacionServicioSocial(): void {
        this.modalDetalleServicioSocial.open();
    }

    cerrarModalConfirmacionServicioSocial(): void {
        this.modalDetalleServicioSocial.close();
    }

    peticionesPendientes(): boolean {
        let res = false;
        if (this.ocupado_ss) {
            res = true;
        }
        return res;
    }

    enviarReporte(): void {
        console.log('enviarReporte');
        if (this.peticionesPendientes() === false) {
            this.ocupado_ss = true;
            this._reporteBimestralService.putReporteBimestral(
                this.reporteServicioSocial.id,
                this.jsonFormularioReporte,
                this.erroresConsultas
            ).subscribe(
                response => {
                    //console.log("se manda");
                    //this.context.abuelo.cerrarModal();
                    this.cerrarModalConfirmacionServicioSocial();
                },
                console.error,
                () => {
                    this.padre.cerrarModaDetalleReporteSS();
                    this.cerrarModalConfirmacionServicioSocial();
                }
            );
        }
    }

    //// fin del modal de confirmacion //////

}
