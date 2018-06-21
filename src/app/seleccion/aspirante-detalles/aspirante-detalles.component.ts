import {Component, OnInit, ViewChild, ElementRef, Injector, Renderer} from '@angular/core';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {Usuarios} from '../../services/usuario/usuario.model';
import {Documento} from '../../services/entidades/documento.model';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';
import {Http, URLSearchParams} from '@angular/http';
import {Router, ActivatedRoute} from '@angular/router';
import {UsuarioServices} from '../../services/usuario/usuario.service';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {FormGroup, FormControl} from '@angular/forms';
import {AuthService} from '../../auth/auth.service';
import {UsuarioSesion} from '../../services/usuario/usuario-sesion';
import {AspiranteLgac} from '../../services/entidades/aspirante-lgac.model';

@Component({
  selector: 'app-aspirante-detalles',
  templateUrl: './aspirante-detalles.component.html',
  styleUrls: ['./aspirante-detalles.component.css']
})
export class AspiranteDetallesComponent implements OnInit {
//  @ViewChild(Documentacion) componentUltimo: Documentacion;
  idAspirante: number;
  esVistaSolicitante;
  // se declaran variables para consultas de base de datos
  aspiranteService;
  entidadAspirante: Estudiante;
  aspirante: Estudiante;
  documentoService;
  folioService;
  evaluacionAspiranteService;
  envioCorreoElectronicoService;
  vistaAnteriorRegresar = undefined;
  habilitarBoton: boolean;
  // Variable para guardar el nivel de estudios del solicitantes
  nivelEstudios;
  vistaLicenciatura: boolean = false;
  usuarioEntidad: Usuarios;
  fotoEstudiante;
  formulario: FormGroup;
  private sub: any;
  registrosAspiranteLgac: Array<AspiranteLgac> = [];
  aspiranteLgacService;


  private idUsuarioActual: number;
  private usuarioLogueado: UsuarioSesion;
  private registroDoc: Array<Documento> = [];
  private registroDocTrue: Array<Documento> = [];
  private erroresConsultas: Array<ErrorCatalogo> = [];
  private alertas: Array<Object> = [];


  constructor(route: ActivatedRoute,
              private _catalogosService: CatalogosServices,
              // private modal: Modal,
              private elementRef: ElementRef,
              private injector: Injector, private _renderer: Renderer,
              private http: Http, private _router: Router,
              private _usuarioService: UsuarioServices,
              private  authservice: AuthService,
              private _spinner: SpinnerService) {
    this.usuarioLogueado = authservice.getUsuarioLogueado();
    this.sub = route.params.subscribe(params => {
      this.idAspirante = +params['id']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.sub = route.params.subscribe(params => {
      this.vistaAnteriorRegresar = params['vistaAnterior']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.sub = route.params.subscribe(params => {
      this.esVistaSolicitante = +params['vistaSolicitante']; // (+) converts string 'id' to a number

      // In a real app: dispatch action to load the details here.
    });
    this.idUsuarioActual = this.usuarioLogueado.id;
    this.prepareServices();
    this._spinner.start('aspirantedetalles1');
    this.obtenerEntidadAspirante();
    this.obtenerEntidadUsuario();
    this.formulario = new FormGroup({
      idEstatus: new FormControl(''),
    });
    this.obtenerListaAspiranteLgac();
  }

  ngOnInit(): void {
    this.obtenerNumeroDocumetosPorValidar();
    this.obtenerNumeroDocumetos();
  }

  regresarListaSolicitantes(): any {
    if (this.vistaAnteriorRegresar == 'ListaSolicitudes') {
      this._router.navigate(['lista/solicitudes']);
    } else if (this.vistaAnteriorRegresar == 'ListaAspirantes') {
      this._router.navigate(['seleccion/aspirante']);
    }else {
      this._router.navigate(['alumno', 'expediente',
        {usuarioObjetivo: this.entidadAspirante.usuario.id}]);
    }

  }

  obtenerNumeroDocumetosPorValidar(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idAspirante + ':IGUAL' +
      ',valido~true:IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registroDocTrue = this.documentoService.getListaDocumento(
      this.erroresConsultas,
      urlParameter
    ).lista;
  }


  obtenerNumeroDocumetos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    let criterioIdEstudiante = 'idEstudiante~' + this.idAspirante + ':IGUAL';
    urlParameter.set('criterios', criterioIdEstudiante);
    this.registroDoc = this.documentoService
      .getListaDocumento(
        this.erroresConsultas,
        urlParameter
      ).lista;
  }

  obtenerEntidadAspirante(): void {
    this.aspiranteService.getEntidadEstudiante(
      this.idAspirante,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.entidadAspirante = new Estudiante(response.json());
        this.aspirante = this.entidadAspirante;
        this.nivelEstudios =
          this.entidadAspirante.promocion.programaDocente.nivelEstudios.descripcion;
        this.mostrarSeccionesLicenciatura();
        if (this.entidadAspirante.usuario.foto.id) {
          this.fotoEstudiante = this.entidadAspirante.usuario.foto.id;
        }
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
        this._spinner.stop('aspirantedetalles1');
      },
      () => {
        ////console.log(this.entidadAspirante);
        this._spinner.stop('aspirantedetalles1');
      }
    );
  }


  obtenerListaAspiranteLgac(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.idAspirante + ':IGUAL');

    // this._spinner.start('listaAspiranteLgac');
    this.registrosAspiranteLgac = [];

    this.aspiranteLgacService.getListaAspiranteLgacPag(
      this.erroresConsultas,
      urlParameter
    ).subscribe(
      response => {
        response.json().lista.forEach((item) => {
          this.registrosAspiranteLgac.push(new AspiranteLgac(item));
        });
      },
      error => {
        console.error(error);
        // this._spinner.stop('listaAspiranteLgac');
      },
      () => {
        // this._spinner.stop('listaAspiranteLgac');
      }
    );
  }

  obtenerEntidadUsuario(): void {
    this._usuarioService.getEntidadUsuario(
      this.idUsuarioActual,
      this.erroresConsultas
    ).subscribe(
      response => {
        this.usuarioEntidad = new Usuarios(response.json());
      },
      error => {
        console.error(error);
        console.error(this.erroresConsultas);
        this._spinner.stop('aspirantedetalles1');
      },
      () => {
        ////console.log(this.usuarioEntidad);
        this._spinner.stop('aspirantedetalles1');
      }
    );
  }

  habilitarBotonValidarSolicitud(numeroDoc, idfolio, numeroDoctrue): boolean {
    if (this.esVistaSolicitante) {
      ////console.log('Parametors numeroDoc:' + numeroDoc + ' idFolio: ' +
      // idfolio + ' numeroDoctrue' + numeroDoctrue );
      if (idfolio !== 1010) {
        this.habilitarBoton = true;
        // return true;
      } else {
        if (numeroDoc.length === numeroDoctrue) {
          this.habilitarBoton = false;
          // return false;
        }else {
//          this.habilitarBoton = this.componentUltimo.documentosValidados();
          // return this.componentUltimo.documentosValidados();
        }
      }
      return true;
    } else {
      return false;
    }
  }

/*  modalValidarSolicitud(folio): void {
    //if (folio) {
    let idEstudiante = this.idAspirante;
    let idFolio = folio;
    let correo = this.entidadAspirante.usuario.email;
    let dialog: Promise<ModalDialogInstance>;
    let modalConfig = new ModalConfig('sm', true, 27);
    let modalFormularioData = new ModalMensajeConfirmacionData(
      this,
      idEstudiante,
      idFolio,
      this.aspirante,
      correo
    );

    let bindings = Injector.resolve([
      provide(ICustomModal, { useValue: modalFormularioData }),
      provide(IterableDiffers, { useValue: this.injector.get(IterableDiffers) }),
      provide(KeyValueDiffers, { useValue: this.injector.get(KeyValueDiffers) }),
      provide(Renderer, { useValue: this._renderer })
    ]);

    dialog = this.modal.open(
      <any>ModalMensajeConfirmacion,
      bindings,
      modalConfig
    );
    //}
  }*/

  cambiarEstatusEstudiante(): void {
    this.formulario.value.idEstatus = 1014;
    let jsonFormulario = JSON.stringify(this.formulario.value, null, 2);
    this.aspiranteService
      .putEstudiante(
        this.idAspirante,
        jsonFormulario,
        this.erroresConsultas
      ).subscribe(
      () => {}, // console.log('Success se cambio el estatus del estudiante'),
      console.error,
      () => {
        this.obtenerEntidadAspirante();
        this.addErrorsMesaje
        ('Validación exitosa!', 'success');
        // descomentar cuando este la implentacion de enviar correos
        this.enviarcorreoSolicitud(this.idAspirante);
      }
    );
  }

  enviarcorreoSolicitud(idEstudiante: number): void {
    let correo =  this.aspirante.datosPersonales.email;
    let formularioCorreo = new FormGroup({
      destinatario: new FormControl(correo),
      entidad: new FormControl({Estudiantes: idEstudiante}),
      idPlantillaCorreo: new FormControl(36),
      comentarios: new FormControl('Registro completado')
    });

    let jsonFormulario = JSON.stringify(formularioCorreo.value, null, 2);
    ////console.log(jsonFormulario);
    this.envioCorreoElectronicoService.postCorreoElectronico(
      jsonFormulario,
      this.erroresConsultas
    ).subscribe(
      response => {
        ////console.log(response);
      },
      error => {
        console.error(error);
      },
      () => {
        ////console.log("Correo Enviado");
      }
    );
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

  mostrarSeccionesLicenciatura(): void {
    if (this.nivelEstudios === 'Licenciatura') {
      this.vistaLicenciatura = true;
    }else {
      this.vistaLicenciatura = false;
    }

  }

  prepareServices(): void {
    this.aspiranteService = this._catalogosService.getEstudianteService();
    this.documentoService = this._catalogosService.getDocumentos();
    this.folioService = this._catalogosService.getFolioSolicitud();
    this.evaluacionAspiranteService =
      this._catalogosService.getEvaluacionAspirante();
    this.envioCorreoElectronicoService =
      this._catalogosService.getEnvioCorreoElectronicoService();
      this.aspiranteLgacService = this._catalogosService.getAspiranteLgacService();
  }


}
