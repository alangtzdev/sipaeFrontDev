import {Component, OnInit, NgZone, Injector, Renderer, Inject} from '@angular/core';
import {errorMessages} from "../../utils/error-mesaje";
import {FormGroup, FormControl, Validators} from "@angular/forms";
import {ConfigService} from "../../services/core/config.service";
import {ItemSelects} from "../../services/core/item-select.model";
import {ErrorCatalogo} from "../../services/core/error.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {Router} from "@angular/router";
import {Validacion} from "../../utils/Validacion";
import * as moment from "moment";
import {GrupoIdioma} from "../../services/entidades/grupo-idioma.model";
import {URLSearchParams} from "@angular/http";
import {NgUploaderOptions} from "ngx-uploader";

@Component({
  selector: 'app-datos-curso',
  templateUrl: './datos-curso.component.html',
  styleUrls: ['./datos-curso.component.css']
})
export class DatosCursoComponent implements OnInit {

   formularioDatosCurso: FormGroup;
   mensajeErrors: any = errorMessages;
   errorNext: string = '';
   editar: string = '';
   enableValidation: boolean = false;
   //public minDate: Date;
   finCurso: Date;
   inicioCurso: Date;
   contador: number = 0;

   //Dropzone
   options: NgUploaderOptions;
   basicProgress: number = 0;
   basicResp: Object;
   dropProgress: number = 0;
   dropResp: any[] = [];

   diasCurso = [
   {'name': 'Lunes', 'checked': false},
   {'name': 'Martes', 'checked': false},
   {'name': 'Miercoles', 'checked': false},
   {'name': 'Jueves', 'checked': false},
   {'name': 'Viernes', 'checked': false},
   {'name': 'Sabado', 'checked': false},
   ];

  lunes: boolean = false;
  martes: boolean = false;
  miercoles: boolean = false;
  jueves: boolean = false;
  viernes: boolean = false;
  sabado: boolean = false;

  //services
  idiomaService;
  nivelCursoService;
  periodoService;
  archivoService;

  //archivo
  idArchivoPrograma: number;
  private tipoArchivo: string;
  private nombreArchivoPrograma: string = '';

  //fecha
  private fechaMinima: Date;

  //selects
  private opcionesIdioma: Array<ItemSelects> = [];
  private opcionesNivel: Array<ItemSelects> = [];
  private opcionesPeriodo: Array<ItemSelects> = [];

  //mesajes de error
  //private erroresConsultas: Array<Object> = [];
  private erroresGuardado: Array<Object> = [];
  private alertas: Array<Object> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];

  private idGrupoIdioma: number;
  private edicion: boolean = false;


  constructor(@Inject(NgZone) private zone: NgZone,
              private _catalogosServices: CatalogosServices,
              private _spinner: SpinnerService,
              private injector: Injector, private _renderer: Renderer, public _router: Router) {
    console.log('construDatos');
    this.prepareServices();
    this.inicializarOpcionesNgZone();
    this.finCurso = new Date;
    this.inicioCurso = new Date;
    this.zone = new NgZone({ enableLongStackTrace: false});
    this.formularioDatosCurso = new FormGroup({
      idioma: new FormControl('', Validators.required),
      institucionAcreditadora: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      periodo: new FormControl('', Validators.required),
      profesor: new FormControl('', Validators.
      compose([Validators.required, Validacion.parrafos])),
      nivel: new FormControl('', Validators.required),
      horario: new FormControl('', Validators.required),
      inicioCurso: new FormControl('', Validators.required),
      finCurso: new FormControl('', Validators.required),
      dia: new FormControl('', Validators.required),
      archivoPrograma: new FormControl('', Validators.required),
      nombreArchivo: new FormControl('')
    });
    moment.locale('es');
    this.zone = new NgZone({ enableLongStackTrace: false });
    //this._spinner.start();
  }

  ngOnInit() {
    this.editarGrupoIdioma();
  }

  inicializarOpcionesNgZone(): void {
    this.options = new NgUploaderOptions({
      url: ConfigService.getUrlBaseAPI() + '/api/v1/archivo',
      //filterExtensions: true,
      //allowedExtensions: ['jpg','JPG','jpeg','JPEG','PNG','png'],
      withCredentials: false,
      authToken: localStorage.getItem('token')
    });
  }

  ngAfterContentInit() {
    for (let key in this.formularioDatosCurso.controls) {
      this.formularioDatosCurso.controls[key].
      setValue(sessionStorage.getItem(key) ? sessionStorage.getItem(key) : '');
    }

    this.diasCurso.forEach((dia) => {
      if (sessionStorage.getItem(dia.name) && sessionStorage.getItem(dia.name) == "true"){
        dia.checked  = true;
      } else {
        sessionStorage.removeItem(dia.name);
      }
    });

    if (sessionStorage.getItem('inicioCurso') && sessionStorage.getItem('finCurso')) {
      this.contador = 2;
    }
    //console.log('Editar: '+sessionStorage.getItem('editar'));
    this.editar = sessionStorage.getItem('editar');

    //this._spinner.stop();
  }

  prevMethod(): void {
    this.diasCurso = [
      {'name': 'Lunes', 'checked': false},
      {'name': 'Martes', 'checked': false},
      {'name': 'Miercoles', 'checked': false},
      {'name': 'Jueves', 'checked': false},
      {'name': 'Viernes', 'checked': false},
      {'name': 'Sabado', 'checked': false},
    ];
    //console.log('1');
    this.diasCurso.forEach((dia) => {
      if (sessionStorage.getItem(dia.name) && sessionStorage.getItem(dia.name) == "true"){
        dia.checked  = true;
        //console.log('true');
      } else {
        dia.checked  = false;
        //console.log('false');
      }
    });
  }

  nextMethod(): boolean {
    console.log('entre a nextMetod');
    (<FormControl>this.formularioDatosCurso.controls['dia']).setValue(null);
    this.diasCurso.forEach((dia) => {
      if (sessionStorage.getItem(dia.name) && sessionStorage.getItem(dia.name) == "true"){
        (<FormControl>this.formularioDatosCurso.controls['dia'])
            .setValue('dias');
      }
    });

    //console.log(this.formularioDatosCurso.value);
    //console.log(this.formularioDatosCurso.valid);
    //console.log(this.getControl('archivoPrograma').value);
    //console.log('nombre del archiov', this.getControl('nombreArchivo').value);
    //console.log('estatus', this.getControl('nombreArchivo').status);
    //console.log('valido?', this.formularioDatosCurso.valid);
    //console.log('formulario', this.formularioDatosCurso);
    if (this.formularioDatosCurso.valid ) { // && this.validarDias()
      this.enableValidation = true;
      for (let key in this.formularioDatosCurso.controls)
        sessionStorage.setItem(key, this.formularioDatosCurso.controls[key].value);
      return true;
    }else {
      //console.log('ERRRRRRRRRROOOOOOOOOOOOOOOOOOERRRRRRRRRRRRRRRRRRR');
      this.enableValidation = true;
      this.errorNext = 'Error en los campos favor de verificar';
      return false;
    }
  }

  /*validarDias(): boolean {
   //console.log(this.getControl('dia').value)
   //console.log(this.getControl('dia').valid + '---')
   this.diasCurso.forEach((dia) => {
   if (sessionStorage.getItem(dia.name) == true && this.validacionActiva) {
   return true;
   }
   }
   return false;
   }*/

  elegirFechaInicio(): any {
     this.contador = 0;
  }
  elegirFechaFin(): any {
    this.contador = 1;
  }

  getFechaInicioCurso(): string {
    //console.log(this.inicioCurso);
    if (this.inicioCurso) {
      let fechaInicioFormato = moment(this.inicioCurso).format('DD/MM/YYYY');
      (<FormControl>this.formularioDatosCurso.controls['inicioCurso'])
          .setValue(fechaInicioFormato);
      return fechaInicioFormato;
    } else {
      return moment(new Date()).format('DD/MM/YYYY');
    }
  }

  getFechaFinCurso(): string {
     if (this.finCurso) {
     if ( this.contador === 0 ) {
     this.fechaMinima = this.inicioCurso;
     this.finCurso = this.fechaMinima;
     let fechaConFormato = moment(this.finCurso).format('DD/MM/YYYY');
     (<FormControl>this.formularioDatosCurso.controls['finCurso'])
     .setValue(fechaConFormato);
     return fechaConFormato;
     } else {
     let fechaConFormato = moment(this.finCurso).format('DD/MM/YYYY');
     (<FormControl>this.formularioDatosCurso.controls['finCurso'])
     .setValue(fechaConFormato);
     return fechaConFormato;
     }
     } else {
     return moment(new Date()).format('DD/MM/YYYY');
     }
  }

  esPdf(name: string): boolean {
     let nombreArchivoArray: string[];
     nombreArchivoArray = name.split('.');
     if (nombreArchivoArray[1] && nombreArchivoArray[1] === 'pdf') {
     return true;
     } else {
     return false;
     }
  }

  cerrarAlerta(i: number): void {
     this.alertas.splice(i, 1);
     this.alertas.length = 0;
  }

  addErrorsMesaje(mensajeError, tipo): void {
    this.alertas.push({
      type: tipo,
      msg: mensajeError,
      closable: true
    });
  }

  //Dropzone
  handleBasicUpload(data, tipo): void {
    this.basicResp = data;
    this.zone.run(() => {
      this.basicProgress = data.progress.percent;
      if (this.basicResp['response'] && this.basicResp['status'] === 201) {
        let responseJson = JSON.parse(this.basicResp['response']);
        if (this.esPdf(responseJson.originalName)) {
          if (responseJson.originalName.length <= 50) {
            let idArchivo = responseJson.id;
            let jsonArchivo = '{"Carta": ' + responseJson.id + '}';
            this.idArchivoPrograma = responseJson.id;
            this.nombreArchivoPrograma = responseJson.originalName;
            this.formularioDatosCurso.value.archivoPrograma = idArchivo;
            (<FormControl>this.formularioDatosCurso.controls['archivoPrograma']).
            setValue(idArchivo);
            (<FormControl>this.formularioDatosCurso.controls['nombreArchivo'])
                .setValue(responseJson.originalName);
          } else {
            this.addErrorsMesaje('El nombre del archivo es muy grande', 'danger');
            this.archivoService.deleteArchivo(responseJson.id, this.erroresGuardado)
                .subscribe(
                    () => {
                      //console.log('Se borro el archio');
                      (<FormControl>this.formularioDatosCurso.
                          controls['archivoPrograma']).setValue('');
                      (<FormControl>this.formularioDatosCurso.controls['nombreArchivo'])
                          .setValue('');
                    }
                );
          }
        } else {
          this.addErrorsMesaje('El archivo debe de ser pdf', 'danger');
          this.archivoService.deleteArchivo(responseJson.id, this.erroresGuardado)
              .subscribe(
                  () => {
                    //console.log('Se borro el archio');
                  }
              );
        }

      }
    });
  }

  enableBasic(): boolean {

    /*
    return (this.basicProgress >= 1 && this.basicProgress <= 99);
    */
    return false;
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

  onClick(dia) {
    //console.log('dia elegido ', dia);
    //console.log('dia dia.checked:::' + !dia.checked);
    sessionStorage.setItem(dia.name, ''+(!dia.checked));
  }

  enableDrop(): boolean {
    return (this.dropProgress >= 1 && this.dropProgress <= 99);
  }

  // debug del formulario no usar para produccion
  private get cgValue(): string {
    return JSON.stringify(this.formularioDatosCurso.value, null, 2);
  }
  entidadAct;

  editarGrupoIdioma(): void {
    this.idGrupoIdioma = Number(sessionStorage.getItem("idGrupoIdioma"));
    if (this.idGrupoIdioma && !sessionStorage.getItem("idioma")) {
      let entidad: GrupoIdioma;
      this.edicion = true;

      this._catalogosServices.getGrupoIdiomaService().getEntidadGrupoIdioma(
          this.idGrupoIdioma,
          this.erroresConsultas
      ).subscribe(
          response =>
              entidad = new GrupoIdioma(response.json()),
          error => {

          },
          () => {
            (<FormControl>this.formularioDatosCurso.controls['horario'])
                .setValue(entidad.horario);
            (<FormControl>this.formularioDatosCurso.controls['inicioCurso'])
                .setValue(entidad.getFechaInicioCurso());
            this.inicioCurso = new Date(entidad.fechaInicio);
            (<FormControl>this.formularioDatosCurso.controls['finCurso'])
                .setValue(entidad.getFechaFinCurso());
            this.finCurso = new Date(entidad.fechaFin);
            this.contador = 1;
            (<FormControl>this.formularioDatosCurso.controls['institucionAcreditadora'])
                .setValue(entidad.institucion);
            (<FormControl>this.formularioDatosCurso.controls['periodo'])
                .setValue(entidad.periodo.id);
            (<FormControl>this.formularioDatosCurso.controls['idioma'])
                .setValue(entidad.idioma.id);
            (<FormControl>this.formularioDatosCurso.controls['nivel'])
                .setValue(entidad.nivel.id);
            (<FormControl>this.formularioDatosCurso.controls['profesor'])
                .setValue(entidad.profesor);
            (<FormControl>this.formularioDatosCurso.controls['nombreArchivo'])
                .setValue(entidad.archivoPrograma.nombre);
            (<FormControl>this.formularioDatosCurso.controls['archivoPrograma']).
            setValue(entidad.archivoPrograma.id);
            this.entidadAct = entidad;

            let diasEntidad: Array<string> = entidad.diasSemana.split(', ');
            this.diasCurso.forEach((dia) =>{
              if (diasEntidad.indexOf(dia.name.substr(0,2)) != -1) {
                dia.checked  = true;
                sessionStorage.setItem(dia.name, 'true');
              } else {
                dia.checked  = false;
                sessionStorage.setItem(dia.name, 'false');
              }
            });
          }
      );
    }
  }

  private prepareServices () {
    this.idiomaService = this._catalogosServices.getIdioma();
    this.opcionesIdioma = this.idiomaService.getSelectIdioma(this.erroresConsultas);

    this.nivelCursoService = this._catalogosServices.getNivelCursoIdioma();
    this.opcionesNivel =
        this.nivelCursoService.getSelectNivelCursoIdioma(this.erroresConsultas);

    this.archivoService = this._catalogosServices.getArchivos();

    this.periodoService = this._catalogosServices.getPeriodoEscolar();

    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstatus.id~1007:IGUAL');
    urlParameter.set('ordenamiento', 'anio:ASC');
    this.opcionesPeriodo = this.periodoService.getSelectPeriodoEscolarPeriodoCriterios(
        this.erroresConsultas,
        urlParameter
    );
  }

  private getControl(campo: string): FormControl {
    return (<FormControl>this.formularioDatosCurso.controls[campo]);
  }

  private getControlErrors(campo: string): boolean {
    return (
    !(<FormControl>this.formularioDatosCurso.controls[campo]).valid &&
    this.enableValidation);
  }

  private errorMessage(control: FormControl): string {
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

}
