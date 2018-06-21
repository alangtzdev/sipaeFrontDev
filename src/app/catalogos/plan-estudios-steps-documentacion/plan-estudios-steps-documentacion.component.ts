import {Component, OnInit, NgZone} from '@angular/core';
import {ConfigService} from "../../services/core/config.service";
import {PlanEstudio} from "../../services/entidades/plan-estudio.model";
import {Archivos} from "../../services/entidades/archivo.model";
import {FormGroup, FormControl} from "@angular/forms";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router, ActivatedRoute} from "@angular/router";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import * as moment from "moment";

@Component({
  selector: 'app-plan-estudios-steps-documentacion',
  templateUrl: './plan-estudios-steps-documentacion.component.html',
  styleUrls: ['./plan-estudios-steps-documentacion.component.css']
})
export class PlanEstudiosStepsDocumentacionComponent implements OnInit {
  uploadFile: any;
  options: Object = {
    url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
    withCredentials: false,
    authToken: localStorage.getItem('token')
  };
  zone: NgZone;

  basicProgress: number = 0;
  basicProgressCertificado: number = 0;
  basicProgressDictamen: number = 0;
  basicProgressEstructura: number = 0;
  basicProgressEvaluacion: number = 0;
  basicProgressMapa: number = 0;

  basicResp: Object;
  dropProgress: number = 0;
  dropResp: any[] = [];

  formularioArchivos: FormGroup;
  edicionFormulario: boolean = false;
  entidadPlanEstudios: PlanEstudio;
  idPlanEstudios;
  catalogoEstatus;
  mensajeErrors: any = { 'required': 'Este campo es requerido'};
  validacionActiva: boolean = false;
  registros: Array<PlanEstudio> = [];
  registroSeleccionado: Archivos;
  idArchivoCertificado: number;
  idArchivoDictamen: number;
  idArchivoEstructura: number;
  idArchivoMapa: number;
  idArchivoEvaluacion: number;
  planEstudiosService;

  private tipoArchivo: string;
  private nombreArchivoCertificado: string = '';
  private nombreArchivoDictamen: string = '';
  private nombreArchivoEstructura: string = '';
  private nombreArchivoEvaluacion: string = '';
  private nombreArchivoMapa: string = '';

  private erroresConsultas: Array<ErrorCatalogo> = [];
  private erroresGuardado: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];
  private sub: any;

  constructor(public _catalogosServices: CatalogosServices,
              route: ActivatedRoute,
              private _router: Router,
              private _spinner: SpinnerService) {
    //console.log(params.id);
    this.sub = route.params.subscribe(params => {
      this.idPlanEstudios = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.zone = new NgZone({ enableLongStackTrace: false });

    this.prepareServices();

    this.formularioArchivos = new FormGroup({
      idArchivoCertificado: new FormControl(''),
      idArchivoDictamen: new FormControl(''),
      idArchivoEstructura: new FormControl(''),
      idArchivoEvaluacion: new FormControl(''),
      idArchivoMapa: new FormControl(''),
      ultimaActualizacion: new FormControl(moment(new Date()).format('DD/MM/Y h:mma'))
    });

    if (this.idPlanEstudios) {
      //console.log('ENTRA::');
      this.edicionFormulario = true;
      let planEstudios: PlanEstudio;
      this.entidadPlanEstudios = this.planEstudiosService
        .getEntidadPlanEstudio(
          this.idPlanEstudios,
          this.erroresConsultas
        ).subscribe(
          response => planEstudios = new PlanEstudio(response.json()),
          error => {
            console.error(error);
//              console.error(errores);
          },
          () => {
            //console.log(planEstudios);
            if (this.formularioArchivos) {

              let intCertificado = 'idArchivoCertificado';
              let intDictamen = 'idArchivoDictamen';
              let intEstructura = 'idArchivoEstructura';
              let intEvaluacion = 'idArchivoEvaluacion';
              let intMapa = 'idArchivoMapa';


              //console.log(planEstudios);

              (<FormControl>this.formularioArchivos.controls[intCertificado])
                .setValue(planEstudios.archivoCertificado.id);
              (<FormControl>this.formularioArchivos.controls[intDictamen])
                .setValue(planEstudios.archivoDictamen.id);
              (<FormControl>this.formularioArchivos.controls[intEstructura])
                .setValue(planEstudios.archivoEstructura.id);
              (<FormControl>this.formularioArchivos.controls[intEvaluacion])
                .setValue(planEstudios.archivoEvaluacion.id);
              (<FormControl>this.formularioArchivos.controls[intMapa])
                .setValue(planEstudios.archivoMapa.id);
              this.nombreArchivoCertificado = planEstudios.archivoCertificado.nombre;
              this.nombreArchivoDictamen = planEstudios.archivoDictamen.nombre;
              this.nombreArchivoEstructura = planEstudios.archivoEstructura.nombre;
              this.nombreArchivoEvaluacion = planEstudios.archivoEvaluacion.nombre;
              this.nombreArchivoMapa = planEstudios.archivoMapa.nombre;

            }
          }
        );
    }
  }

  nextMethod(): boolean {

    let idPlanEstudiosGuardado;
    let jsonFormulario = JSON.stringify(this.formularioArchivos.value, null, 2);
    //console.log(jsonFormulario);
    if (this.validarFormulario()) {
      this._spinner.start("documentacion1");
      if (this.idPlanEstudios) {
        this.planEstudiosService
          .putPlanEstudio(
            this.idPlanEstudios,
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          () => {}, //console.log('Success'),
          console.error,
          () => {
            this._spinner.stop("documentacion1");
          }
        );

        return true;
      } else {
        this.planEstudiosService
          .postPlanEstudio(
            jsonFormulario,
            this.erroresGuardado
          ).subscribe(
          response => {
            this.idArchivoCertificado = response.json();
          },
          console.error,
          () => {
            //console.log('Registro finalizado :)');
            console.warn('idFormularioGuardado', this.idArchivoCertificado);
            this._spinner.stop("documentacion1");
          }
        );

        return true;
      }
    } else {
      //alert('error en el formulario');

    }
  }

  previusMethod(): boolean {
    console.warn('idFormularioGuardado');
    return true;
  }
  obtenerEntidad(planEstudiosID: PlanEstudio): void {
    //console.log( planEstudiosID.id);
    this.idPlanEstudios = planEstudiosID;
    // //console.log(this.idPlanEstudios.ar.nombre + ' <=> entidad');
  }

  validarFormulario(): boolean {
    if (this.formularioArchivos.valid) {
      this.validacionActiva = false;
      return true;
    }
    this.validacionActiva = true;
    return false;
  }

  getControl(campo: string): FormControl {
    return (<FormControl>this.formularioArchivos.controls[campo]);
  }

  getControlErrors(campo: string): boolean {
    if (!(<FormControl>this.formularioArchivos.controls[campo]).valid && this.validacionActiva) {
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

  tipoArchivow(archivo): void {
    this.tipoArchivo = archivo;
    //console.log('tipo archivo' + this.tipoArchivo);
  }


  private esPdf(nombreArchiov: string): boolean {
    let nombreArchivoArray: string[];
    nombreArchivoArray = nombreArchiov.split('.');
    if (nombreArchivoArray[nombreArchivoArray.length - 1] &&
        (nombreArchivoArray[nombreArchivoArray.length - 1].toLowerCase() === 'pdf')) {
      return true;
    } else {
      return false;
    }
  }

  handleBasicUpload(data, tipo): void {
    this.basicResp = data;
    this.zone.run(() => {
      switch(tipo) {
        case 'certificado':
          this.basicProgressCertificado = data.progress.percent; break;
        case 'dictamen':
          this.basicProgressDictamen = data.progress.percent; break;
        case 'estructura':
          this.basicProgressEstructura = data.progress.percent; break;
        case 'evaluacion':
          this.basicProgressEvaluacion = data.progress.percent; break;
        case 'mapa':
          this.basicProgressMapa = data.progress.percent; break;
        default:
          this.basicProgress = data.progress.percent;
      }

      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        if (this.esPdf(responseJson.originalName)) {

          let idArchivo = responseJson.id;

          let jsonArchivo = '{"Programa a desarrollar": ' + responseJson.id + '}';
          //console.log(jsonArchivo);
          //console.log(tipo);
          if (tipo === 'certificado') {
            this.idArchivoCertificado = responseJson.id;
            this.nombreArchivoCertificado = responseJson.originalName;
            this.formularioArchivos.value.idArchivoCertificado = idArchivo;
            (<FormControl>this.formularioArchivos.controls['idArchivoCertificado']).
            setValue(idArchivo);
          }else if (tipo === 'dictamen') {
            this.idArchivoDictamen = responseJson.id;
            this.formularioArchivos.value.idArchivoDictamen = idArchivo;
            this.nombreArchivoDictamen = responseJson.originalName;
            (<FormControl>this.formularioArchivos.controls['idArchivoDictamen']).
            setValue(idArchivo);
          }else if (tipo === 'estructura') {
            this.idArchivoEstructura = responseJson.id;
            this.formularioArchivos.value.idArchivoEstructura = idArchivo;
            this.nombreArchivoEstructura = responseJson.originalName;
            (<FormControl>this.formularioArchivos.controls['idArchivoEstructura']).
            setValue(idArchivo);
          }else if (tipo === 'evaluacion') {
            this.idArchivoEvaluacion = responseJson.id;
            this.formularioArchivos.value.idArchivoEvaluacion = idArchivo;
            this.nombreArchivoEvaluacion = responseJson.originalName;
            (<FormControl>this.formularioArchivos.controls['idArchivoEvaluacion']).
            setValue(idArchivo);
          }else if (tipo === 'mapa') {
            this.idArchivoMapa = responseJson.id;
            this.formularioArchivos.value.idArchivoMapa = idArchivo;
            this.nombreArchivoMapa = responseJson.originalName;
            (<FormControl>this.formularioArchivos.controls['idArchivoMapa']).
            setValue(idArchivo);
          }
        }else{
          this.addErrorsMesaje('El archivo debe de ser en pdf', 'danger');
        }
      }
    });

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
    this.alertas.length = 0;
  }

  enableBasic(tipo): boolean {
    if(tipo === 'certificado')
    {
      return (this.basicProgressCertificado >= 1 && this.basicProgressCertificado <= 99);
    }
    else if (tipo === 'dictamen'){
      return (this.basicProgressDictamen >= 1 && this.basicProgressDictamen <= 99);
    }
    else if (tipo === 'estructura')
    {
      return (this.basicProgressEstructura >= 1 && this.basicProgressEstructura <= 99);
    }
    else if(tipo === 'evaluacion') {
      return (this.basicProgressEvaluacion >= 1 && this.basicProgressEvaluacion <= 99);
    }
    else if(tipo === 'mapa')
    {
      return (this.basicProgressMapa >= 1 && this.basicProgressMapa <= 99);
    }

  }


  handleDropUpload(data): void {
    let index = this.dropResp.findIndex(x => x.id === data.id);
    if (index === -1) {
      this.dropResp.push(data);
    } else {
      this.zone.run(() => {
        this.dropResp[index] = data;
        //console.log(this.dropResp);
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

  verArchivo(id: number): void {
    if (id) {
      window.open(ConfigService.getUrlBaseAPI()
        + '/api/v1/archivovisualizacion/'
        + id, '_blank', 'toolbar=no, scrollbars=yes, resizable=yes');
    }
  }

  descargarArchivo(id: number): void {

    if (id) {
      location.href = ConfigService.getUrlBaseAPI() + '/api/v1/archivovisualizacion/' + id;
    }

  }

  private prepareServices() {
    this.planEstudiosService = this._catalogosServices.getPlanEstudios();
  }


  ngOnInit() {
  }

}
