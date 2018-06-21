import { Component, OnInit, Injector, ViewChild, NgZone, Inject  } from '@angular/core';
import {Router} from "@angular/router";
import {URLSearchParams} from "@angular/http";
import {
  DatoInformacionColsan
} from '../../services/entidades/dato-informacion-colsan.model';
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {FormGroup, Validators, FormControl} from "@angular/forms";
import {Validacion} from "../../utils/Validacion";
import {ConfigService} from '../../services/core/config.service';
import {ItemSelects} from "../../services/core/item-select.model";
import { NgUploaderOptions } from 'ngx-uploader';

export class Registro {
  idTipo: number;
  idArchivo: number;
  constructor(tipo: number, archivo: number) {
    this.idTipo = tipo;
    this.idArchivo = archivo;
  }
}

@Component({
  selector: 'app-editar-informacion-institucion',
  templateUrl: './editar-informacion-institucion.component.html',
  styleUrls: ['./editar-informacion-institucion.component.css']
})
export class EditarInformacionInstitucionComponent implements OnInit {

    formulario: FormGroup;
    validacionActiva: boolean = false;
    edicionFormulario: boolean = false;

    municipioService;
    estadoService;
    archivoService;

    idMunicipio: number;

    uploadFile: any;
    idArchivo: number;
    tipoArchivo: number;
    basicProgress: number = 0;
    basicResp: Object;
    dropProgress: number = 0;
    dropResp: any[] = [];
    listaDocumentos: Array<ItemSelects> = [];
    columnas: Array<any> = [
        { titulo: 'Documento', nombre: '', sort: false}
    ];
    registros: Array<Registro> = [];
    registrosTemporal: Array<number> = [];
    registroSeleccionado: Registro;
    options: NgUploaderOptions;
    private idDireccionDGP: number = 3;
    public datosDireccionCedula;
    private alertas: Array<Object> = [];
    private opcionesEstado: Array<ItemSelects> = [];
    private opcionesMunicipio: Array<ItemSelects> = [];
    private erroresConsultas: Array<Object> = [];
    private erroresGuardado: Array<Object> = [];

    constructor(@Inject(NgZone) private zone: NgZone,
                private injector: Injector,
                private router: Router,
                private _spinner: SpinnerService,
                private _catalogoService: CatalogosServices) {
        this.prepareServices();
        this.inicializarOpcionesNgZone();
        this.obtenerOpcionesEstados();
        this.inicializarFormulario();
        if (this.idDireccionDGP) {
            this.edicionFormulario = true;
            this.obtenerEntidadInformacionColsan(this.idDireccionDGP);
        }
        this.zone = new NgZone({ enableLongStackTrace: false});
    }

    ngOnInit() {
    }

    obtenerOpcionesEstados(): void {
       this.opcionesEstado = this.estadoService.getSelectEntidadFederativa(this.erroresConsultas,
            new URLSearchParams());
    }

    obtenerEntidadInformacionColsan(idDireccionDGP: number): void {
      this._spinner.start('obtenerInfoColsan');
      let datosDireccionCedula: DatoInformacionColsan;
      this.datosDireccionCedula.getDatoInformacionColsan(
          this.idDireccionDGP,
          this.erroresConsultas
      ).subscribe(
          response =>
              datosDireccionCedula = new DatoInformacionColsan(
                  response.json()),
          error => {
            this._spinner.stop('obtenerInfoColsan');
          },
          () => {
            this._spinner.stop('obtenerInfoColsan');
              if (this.formulario) {
                  this.idMunicipio = datosDireccionCedula.municipio.id;
                  this.cargarMunicipios(datosDireccionCedula.entidadFederativa.id, 1);
                  this.cargarInformacionColsan(datosDireccionCedula);
              }
          }
      );
    }

    inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
        // url: 'http://ng2-uploader.com:10050/upload'
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      filterExtensions: true,
      allowedExtensions: ['jpg'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

    validarDocumentos(): void {
        //console.log(this.registros.length);
        if (this.registros.length > 1) {
          this.getControl('auxiliar').patchValue('1');
        } else {
            this.getControl('auxiliar').patchValue('');
         }
    }

    addErrorsMesaje(mensajeError, tipo): void {
        this.alertas.push({
            type: tipo,
            msg: mensajeError,
            closable: true
        });
    }

    cerrarAlerta(i: number): void {
        this.alertas.splice(i, 1);
    }

    habilitarDropZone(id: number): void {
        let acceso = true;
        for (var i = 0; i < this.registros.length; i++) {
            if (id == this.registros[i].idTipo) {
                acceso = false;
                break;
            }
        }
        if (acceso) {
            this.tipoArchivo = id;
        } else {
            this.addErrorsMesaje('¡Ya existe un documento de este tipo!', 'danger');
            this.getControl('seteador').patchValue('');
        }
    }

    handleBasicUpload(data): void {
    this.basicResp = data;
    this.zone.run(() => {
        this.basicProgress = data.progress.percent;
        if (this.basicResp['response'] && this.basicResp['status'] === 201) {
            let responseJson = JSON.parse(this.basicResp['response']);
            this.idArchivo = responseJson.id;
            if (this.esImagen(responseJson.originalName)) {
                if (this.tipoArchivo == 98) {
                    this.getControl('idArchivoCredencialReversaMov').
                    patchValue(this.idArchivo);
                } else {
                    this.getControl('idArchivoCredencialFrontalMov').
                    patchValue(this.idArchivo);
                }
                this.agregarRegistro();
            } else {
                this.addErrorsMesaje('El archivo debe de ser en formato jpg', 'danger');
                this.archivoService.deleteArchivo(
                    responseJson.id,
                    this.erroresGuardado
                ).subscribe(
                    () => {
                        //console.log('Se borro el archiov');
                    }
                );
            }
        }
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

    agregarRegistro(): void {
        this.registrosTemporal.push(this.idArchivo); // por si da cancelar, se eliminan los archivos
        this.registros.push(new Registro(this.tipoArchivo, this.idArchivo));
        this.tipoArchivo = null;
        this.idArchivo = null;
        this.getControl('seteador').patchValue('');
        this.validarDocumentos();
    }

    eliminarRegistro(): void {
        if (this.registroSeleccionado) {
            this.archivoService.deleteArchivo(
             this.registroSeleccionado.idArchivo,
             this.erroresGuardado
            ).subscribe(
                response => {
                    let auxiliar: Array<any> = [];
                    for (var i = 0; i < this.registros.length; i++) {
                        if (this.registroSeleccionado.idTipo !== this.registros[i].idTipo) {
                            auxiliar.push(this.registros[i]);
                        }
                    }
                    this.registros = auxiliar;
                    this.registroSeleccionado = null;
                    this.validarDocumentos();
                }
            );
        } else {
            this.addErrorsMesaje('Seleccione un docuemento de la tabla ', 'danger');
        }
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

    cargarMunicipios(id: number, aux: number): void {
        let urlParameter: URLSearchParams = new URLSearchParams();
         urlParameter.set('criterios', 'idEntidadFederativa~' + id + ':IGUAL');
         this.municipioService.getSelectMunicipioControlable(
             this.erroresConsultas,
             urlParameter
         ).subscribe(
             response => {
                 let items = response.json().lista;
                 this.opcionesMunicipio = [];
                 if (items) {
                     items.forEach((item) => {
                         this.opcionesMunicipio.push(new ItemSelects(item.id, item.valor));
                     });
                 }
             },
             error => {
                 console.error(error);
             },
             () => {
                 if (aux == 1 && this.idMunicipio) {
                         this.getControl('idMunicipio').patchValue(this.idMunicipio);
                 }else {
                     this.getControl('idMunicipio').patchValue('');
                 }
             }
         );
    }

    enviarFormulario(): void {
        if (this.validarFormulario()) {
            event.preventDefault();
            let json =  JSON.stringify(this.formulario.value, null, 2);
            //console.log(json);
            this._spinner.start('guardarDatos');
            if (this.edicionFormulario) {
                this.datosDireccionCedula.putDatoInformacionColsan(
                    this.idDireccionDGP,
                    json,
                    this.erroresGuardado
                ).subscribe(
                    response => {},
                    error => {this._spinner.stop('guardarDatos'); },
                    () => {
                      this._spinner.stop('guardarDatos');
                      this.regresarDetalleInstitucion();
                    }

                );
            } else {
                this.datosDireccionCedula.postDatoInformacionColsan(
                    json,
                    this.erroresGuardado
                ).subscribe(
                    response => {
                        //console.log('Success');
                        var json = response.json();
                        //console.log('json', json.id);
                    },
                    error => {this._spinner.stop('guardarDatos'); },
                    () => {this._spinner.stop('guardarDatos'); }
                );
            }
        }/*else {
            //alert('Error');
        }*/
    }

    getControl(campo: string): FormControl {
        return (<FormControl>this.formulario.controls[campo]);
    }

    validarFormulario(): boolean {
        //console.log(this.formulario.value);
        if (this.formulario.valid) {
            this.validacionActiva = false;
            return true;
        }
        this.validacionActiva = true;
        return false;
    }

    getControlErrors(campo: string): boolean {
        if (!(<FormControl>this.formulario.controls[campo]).
                valid && this.validacionActiva) {
            return true;
        }
        return false;
    }

    regresarDetalleInstitucion(): void {
        this.router.navigate(['catalogo', 'institucion']);
    }

    cancelarEdicion(): void {
        if (this.registrosTemporal.length > 0) {
            for (var i = 0; i < this.registrosTemporal.length; i++) {
                this.archivoService.deleteArchivo(
                    this.registrosTemporal[i],
                    this.erroresGuardado
                ).subscribe(
                    () => {
                        //console.log('Eliminando temporal...');
                    }
                );
            }
        }
        this.regresarDetalleInstitucion();
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

    private esImagen(nombreArchiov: string): boolean {
        let nombreArchivoArray: string[];
        let tamanoArreglo: number;
        nombreArchivoArray = nombreArchiov.split('.');
        tamanoArreglo = nombreArchivoArray.length - 1;
        if (nombreArchivoArray[tamanoArreglo] && (
            nombreArchivoArray[tamanoArreglo].toLowerCase() === 'jpg') ) {
            return true;
        }
        return false;
    }

    private inicializarFormulario(): void {
      this.formulario = new FormGroup({
            claveInstitucion: new FormControl('', Validators.
            compose([Validators.required,
            Validacion.letrasNumerosAcentoPuntoComaValidator])),
            claveEscuela: new FormControl('', Validators.
            compose([Validators.required,
            Validacion.letrasNumerosAcentoPuntoComaValidator])),
            nombreInstitucion: new FormControl('', Validators.
            compose([Validators.required,
            Validacion.parrafos])),
            vialidadPrincipal: new FormControl('', Validators.
            compose([Validators.required,
            Validacion.letrasNumerosAcentoPuntoComaValidator])),
            numeroExterior: new FormControl('', Validators.
            compose([Validators.required, Validacion.numerosValidator])),
            numeroInterior: new FormControl('', Validacion.numerosValidator),
            vialidadDerecha: new FormControl('',
            Validacion.letrasNumerosAcentoPuntoComaValidator),
            vialidadIzquierda: new FormControl('',
            Validacion.letrasNumerosAcentoPuntoComaValidator),
            vialidadPosterior: new FormControl('',
            Validacion.letrasNumerosAcentoPuntoComaValidator),
            asentamientoHumano: new FormControl('',
            Validacion.letrasNumerosAcentoPuntoComaValidator),
            localidad: new FormControl('', Validators.
            compose([Validators.required,
            Validacion.letrasNumerosAcentoPuntoComaValidator])),
            idMunicipio: new FormControl('', Validators.required),
            idEntidadFederativa: new FormControl('', Validators.required),
            telefono: new FormControl('', Validators.
            compose([Validators.required, Validacion.telefonoValidator])),
            extencion: new FormControl('', Validacion.numerosValidator),
            fax: new FormControl('', Validacion.numerosValidator),
            extencionFax: new FormControl('', Validacion.numerosValidator),
            dependenciaNormativa: new FormControl('',
            Validacion.letrasNumerosAcentoPuntoComaValidator),
            nombreInstitucionPertenece: new FormControl('',
            Validacion.letrasNumerosAcentoPuntoComaValidator),
            nombreDirectorEscuela: new FormControl('',
            Validacion.letrasNumerosAcentoPuntoComaValidator),
            paginaWeb: new FormControl('', Validacion.parrafos),
            email: new FormControl('', Validacion.emailValidatorOptional),

            ultimaActualizacion: new FormControl(''),
            estatus: new FormControl(''),
            codigoPostal: new FormControl('', Validators.
            compose([Validators.required, Validacion.numerosValidator])),
            idArchivoCredencialFrontalMov: new FormControl('', Validators.required),
            idArchivoCredencialReversaMov: new FormControl('', Validators.required),
            seteador: new FormControl(''),
            auxiliar: new FormControl('', Validators.required),

        });
    }

    private cargarInformacionColsan(datoDireccionCedula: DatoInformacionColsan): void {
      this.getControl('claveInstitucion').patchValue(datoDireccionCedula.claveInstitucion);
      this.getControl('claveEscuela').patchValue(datoDireccionCedula.claveEscuela);
      this.getControl('nombreInstitucion').patchValue(datoDireccionCedula.nombreInstitucion);
      this.getControl('vialidadPrincipal').patchValue(datoDireccionCedula.vialidadPrincipal);
      this.getControl('numeroExterior').patchValue(datoDireccionCedula.numeroExterior);
      this.getControl('numeroInterior').patchValue(datoDireccionCedula.numeroInterior);
      this.getControl('vialidadDerecha').patchValue(datoDireccionCedula.vialidadDerecha);
      this.getControl('vialidadIzquierda').patchValue(datoDireccionCedula.vialidadIzquierda);
      this.getControl('vialidadPosterior').patchValue(datoDireccionCedula.vialidadPosterior);
      this.getControl('asentamientoHumano').patchValue(datoDireccionCedula.asentamientoHumano);
      this.getControl('localidad').patchValue(datoDireccionCedula.localidad);
      this.getControl('telefono').patchValue(datoDireccionCedula.telefono);
      this.getControl('extencion').patchValue(datoDireccionCedula.extencion);
      this.getControl('fax').patchValue(datoDireccionCedula.fax);
      this.getControl('dependenciaNormativa').patchValue(datoDireccionCedula.dependenciaNormativa);
      this.getControl('nombreInstitucionPertenece').patchValue(datoDireccionCedula.nombreInstitucionPertenece);
      this.getControl('nombreDirectorEscuela').patchValue(datoDireccionCedula.nombreDirectorEscuela);
      this.getControl('email').patchValue(datoDireccionCedula.email);
      this.getControl('paginaWeb').patchValue(datoDireccionCedula.paginaWeb);
      this.getControl('codigoPostal').patchValue(datoDireccionCedula.codigoPostal);
      this.getControl('idEntidadFederativa').patchValue(datoDireccionCedula.entidadFederativa.id);
      this.getControl('extencionFax').patchValue(datoDireccionCedula.extencionFax);
      if (datoDireccionCedula.archivoCredencialFrontalMov.id) {
          this.registros.push(new Registro(99,
              datoDireccionCedula.archivoCredencialFrontalMov.id
          ));
          this.getControl('idArchivoCredencialFrontalMov').
            patchValue(datoDireccionCedula.archivoCredencialFrontalMov.id);
      }
      if (datoDireccionCedula.archivoCredencialReversaMov.id) {
          this.registros.push(new Registro(98,
              datoDireccionCedula.archivoCredencialReversaMov.id
          ));
          this.getControl('idArchivoCredencialReversaMov').
            patchValue(datoDireccionCedula.archivoCredencialReversaMov.id);
      }
      this.validarDocumentos();
    }


    private prepareServices(): void {
        this.municipioService = this._catalogoService.getMunicipio();
        this.estadoService = this._catalogoService.getEntidadFederativa();
        this.archivoService = this._catalogoService.getArchivos();
        this.datosDireccionCedula = this._catalogoService.getDatoInformacionColsanService();
    }



}
