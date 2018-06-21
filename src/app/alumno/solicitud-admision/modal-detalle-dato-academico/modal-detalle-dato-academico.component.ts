import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {AntecedenteAcademicoComponent} from "../antecedente-academico/antecedente-academico.component";
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {DatoAcademico} from "../../../services/entidades/dato-academico.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";

@Component({
  selector: 'app-modal-detalle-dato-academico',
  templateUrl: './modal-detalle-dato-academico.component.html',
  styleUrls: ['./modal-detalle-dato-academico.component.css']
})
export class ModalDetalleDatoAcademicoComponent implements OnInit {

  @ViewChild("modalDetalleDato")
  dialog: ModalComponent;
  parentComponent: AntecedenteAcademicoComponent;
  entidadDatoAcademico: DatoAcademico;
  camposParaBachillerato: boolean = false;
  ocultarEstado: boolean = true;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private inj:Injector,
              private _spinnerService: SpinnerService) {
    this.parentComponent = this.inj.get(AntecedenteAcademicoComponent);


  }

  cerrarModal(): void {
    this.dialog.close();
  }
  ngOnInit() { }
  onInit() {
    if(this.parentComponent.idDatoAcademico){
      this._spinnerService.start("constructor");
      this.parentComponent.datoAcademicoService.getEntidadDatoAcademico(
        this.parentComponent.idDatoAcademico,
        this.erroresConsultas
      ).subscribe(
        response => {
          this.entidadDatoAcademico
            = new DatoAcademico(response.json());

          if (this.entidadDatoAcademico.pais.id === 82) {
            this.ocultarEstado = true;
          } else {
            this.ocultarEstado = false;
          }

          if (this.entidadDatoAcademico.gradoAcademico.id === 6) {
            this.camposParaBachillerato = true;
          } else {
            this.camposParaBachillerato = false;
          }
          //console.log(this.camposParaBachillerato);
        },
        error => {
        },
        () => {
          //console.log(this.entidadDatoAcademico);
          this._spinnerService.stop("constructor");

        }
      );
    }
  }

}
