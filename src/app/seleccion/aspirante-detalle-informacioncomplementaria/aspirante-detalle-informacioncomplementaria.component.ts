import {Component, OnInit, Input} from '@angular/core';
import {URLSearchParams} from '@angular/http';
import {AspiranteLgac} from '../../services/entidades/aspirante-lgac.model';
import {Estudiante} from '../../services/entidades/estudiante.model';
import {SpinnerService} from '../../services/spinner/spinner/spinner.service';
import {ErrorCatalogo} from '../../services/core/error.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';



@Component({
  selector: 'informacion-complementaria',
  templateUrl: './aspirante-detalle-informacioncomplementaria.component.html',
  styleUrls: ['./aspirante-detalle-informacioncomplementaria.component.css']
})

export class AspiranteDetalleInformacioncomplementariaComponent implements OnInit {
  erroresConsultas: Array<ErrorCatalogo> = [];
  aspiranteLgacService;
  // registrosAspiranteLgac: Array<AspiranteLgac> = [];

  @Input()
  entidadAspirante: Estudiante;

  @Input()
  registrosAspiranteLgac;
  constructor(
   private _spinner: SpinnerService,
    private _catalogosService: CatalogosServices

   ) { console.log(this.entidadAspirante); }

  ngOnInit(): void {
  }
  obtenerListaAspiranteLgac(): void {
    let urlParameter: URLSearchParams = new URLSearchParams();
    urlParameter.set('criterios', 'idEstudiante~' + this.entidadAspirante.id + ':IGUAL');

    this._spinner.start('listaAspiranteLgac');
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
        this._spinner.stop('listaAspiranteLgac');
      },
      () => {
        this._spinner.stop('listaAspiranteLgac');
      }
    );
  }
  private prepareServices(): void {
    this.aspiranteLgacService = this._catalogosService.getAspiranteLgacService();
  }
}
