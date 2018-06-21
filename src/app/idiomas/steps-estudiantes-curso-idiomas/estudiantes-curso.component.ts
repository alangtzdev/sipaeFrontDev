import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {FormGroup, FormControl} from "@angular/forms";
import {Estudiante} from "../../services/entidades/estudiante.model";
import {ItemSelects} from "../../services/core/item-select.model";
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {SpinnerService} from "../../services/spinner/spinner/spinner.service";
import {URLSearchParams} from "@angular/http";
import {ErrorCatalogo} from "../../services/core/error.model";
import {ModalComponent} from "ng2-bs3-modal/components/modal";

@Component({
  selector: 'app-estudiantes-curso',
  templateUrl: './estudiantes-curso.component.html',
  styleUrls: ['./estudiantes-curso.component.css']
})
export class EstudiantesCursoComponent implements OnInit {
  //select
  public elementRef;

  // Services
  estudianteService;
  estudianteGrupoIdiomaService;

  formularioAgregarEstudiantes: FormGroup;
  mensajeErrors: any = { 'required': 'Este campo es requerido' };
  enableValidation: boolean = false;
  errorNext: string = '';

  // lista de estudiantes
  registros: Array<Estudiante> = [];
  registrosEliminados: Array<Estudiante> = [];
  registroSeleccionado: Estudiante;
  estudiantesAnteriores: Array<Estudiante> = [];

  protected searchStr2: string;
  protected opcions = [];

  public configuracion: any = {
    paginacion: false,
    filtrado: { textoFiltro: ''}
  };

  columnas: Array<any> = [
    { titulo: 'Martrícula', nombre: 'matricula', sort: false },
    { titulo: 'Alumno', nombre: 'nivel', sort: false },
    { titulo: 'Programa Docente', nombre: 'profesor', sort: false },
  ];

  // Autocomplete
  private isComplete: boolean = false;
  private estudianteSelAutocomplete: Estudiante;
  // mesajes de error
  private erroresConsultas: Array<ErrorCatalogo> = [];
  // selects
  private opcionesEstudiante: Array<ItemSelects> = [];
  private alertas: Array<Object> = [];

  constructor(private _catalogosServices: CatalogosServices,
  private _elementRef: ElementRef, private _spinner: SpinnerService) {
    console.log('construEstud');
    this.prepareServices();
    this.listaAlumnos();
    this.elementRef = _elementRef;
    this.formularioAgregarEstudiantes = new FormGroup({
      agregarAsistentes: new FormControl('')
    });

  }

  ngOnInit() {
    this.editarEstudiantes();
  }

  ngAfterContentInit() {
    console.log('entro after');
    let estudiantes = eval(sessionStorage.getItem('estudiantes'));
    if (estudiantes) {
      this._spinner.start('ngAfter');
      for(let idEstudiante = 0; idEstudiante < estudiantes.length; idEstudiante++) {
        this.estudianteService.getEstudiante(
            estudiantes[idEstudiante],
            this.erroresConsultas
        ).subscribe(
            response => {
              this.registros.push(new Estudiante(response.json()));
            },
            error => {
              this._spinner.stop('ngAfter');
            },
            () => {
              this._spinner.stop('ngAfter');
              console.log('init',this.registros);
            }
        );
      }
    }
  }

  finishMethod(): boolean {
    return true;
  }

  previusMethod(): boolean {
    return true;
  }

  filtroChanged(filtroTexto): void {
    this.configuracion.filtrado.textoFiltro = filtroTexto;
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

  editarEstudiantes() {
    if (sessionStorage.getItem("idGrupoIdioma") && !sessionStorage.getItem("estudiantes")){
      let urlSearch: URLSearchParams = new URLSearchParams();
      let criterios =
          'idGrupoIdioma~' + Number (sessionStorage.getItem("idGrupoIdioma")) + ':IGUAL';

      urlSearch.set('criterios', criterios);
      this.estudianteGrupoIdiomaService.getListaEstudiantesGrupoIdioma(
          this.erroresConsultas,
          urlSearch
      ).subscribe(
          response =>{
            let grupoIdiomaJson = response.json();

            this.registros = [];

            grupoIdiomaJson.lista.forEach((item) => {
              this.registros.push(new Estudiante(item.id_estudiante));
            });

            sessionStorage.setItem('estudiantes',
                JSON.stringify(this.registros.map(function(o) {return o.id})));
            sessionStorage.setItem('estudiantesRegistrados',
                JSON.stringify(this.registros.map(function(o) {return o.id})));
          }
      );
    }
  }

  private autocompleteOnSelect(e) {
    console.log('-A-');
    this._spinner.start('autoComplete');
    this._catalogosServices.getEstudiante().getEstudiante(
        e.id,
        this.erroresConsultas
    ).subscribe(
        response => {
          console.log('-B-');
          this.estudianteSelAutocomplete = new Estudiante(response.json());
        },
        error => {
          this._spinner.stop('autoComplete');
        },
        () => {
          console.log('-C-');
          this._spinner.stop('autoComplete');
        }
    );
    this._spinner.stop('autoComplete');
  }

  private agregarEstudiante() : void {
    console.log('1');
    if (this.estudianteSelAutocomplete) {
      console.log('2');
      if (!this.hayAlumnosAgredadosLista(this.estudianteSelAutocomplete)) {
        console.log('3');
        this.registros.push(this.estudianteSelAutocomplete);
        sessionStorage.setItem('estudiantes',
            JSON.stringify(this.registros.map(function (o) {
              return o.id
            })));
        //this.addMensajeAlert('Se agrego');
        this.opcionesEstudiante = [];
        console.log('init2',this.registros);
        this.estudianteSelAutocomplete = null;
      } else {
        this.estudianteSelAutocomplete = null;
        this.addMensajeAlert('Estudiante ya agregado');
      }
    }
  }

  private hayAlumnosAgredadosLista(estudianteAutocomplete: Estudiante): boolean {
    var estaRepetido: boolean = false;
    this.registros.forEach((estudiante) => {
      if (estudianteAutocomplete.id === estudiante.id) {
        estaRepetido = true;
      }
    });
    return estaRepetido;
  }
  noEstudiantes(mensaje): void {
    this.addMensajeAlert(mensaje);
  }

  private addMensajeAlert(mensaje: String) {
    this.alertas.push({
      type: 'danger',
      msg: mensaje,
      closable: true
    });
  }

  private cerrarAlerta(i: number): void {
    this.alertas.splice(i, 1);
    this.alertas.length = 0;
  }

  listaAlumnos(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    this.estudianteService.
    getListaEstudianteOpcional(this.erroresConsultas, urlParameter).subscribe(
        response => {
          let items = response.json().lista;
          if (items) {
            this.opcions = [];
            items.forEach((item) => {
              let it = new Estudiante(item);
              this.opcions.push({"id": item.id, "name": (it.matricula.matriculaCompleta ?
                  it.matricula.matriculaCompleta : '') + ' ' +
              it.getNombreCompleto()});
            });
          }
        },
        error => {
          this.isComplete = false;
        },
        () => {
          this.isComplete = false;
        }
    );
  }

  private removerEstudiante() : void {
    var index = this.registros.indexOf(this.registroSeleccionado);
    this.registros.splice(index, 1);
    this.registrosEliminados.push(this.registroSeleccionado);
    sessionStorage.setItem('estudiantesEliminados',
        JSON.stringify(this.registrosEliminados.map(function(o) {return o.id})));
    this.registroSeleccionado = null;
  }

  private prepareServices () {
    this.estudianteService = this._catalogosServices.getEstudiante();
    this.estudianteGrupoIdiomaService =
        this._catalogosServices.getEstudianteGrupoIdiomaService();
  }
}
