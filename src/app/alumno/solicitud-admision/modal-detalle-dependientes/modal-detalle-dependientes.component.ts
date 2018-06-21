import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {DependientesContactoComponent} from "../dependientes-contacto/dependientes-contacto.component";
import {DependienteEconomico} from "../../../services/entidades/dependiente-economico.model";
import {ErrorCatalogo} from "../../../services/core/error.model";

@Component({
  selector: 'app-modal-detalle-dependientes',
  templateUrl: './modal-detalle-dependientes.component.html',
  styleUrls: ['./modal-detalle-dependientes.component.css']
})
export class ModalDetalleDependientesComponent implements OnInit {

  @ViewChild("modalDetDependiente")
  dialog: ModalComponent;
  parentComponent: DependientesContactoComponent;
  entidadDependiente: DependienteEconomico;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private inj:Injector) {
    this.parentComponent = this.inj.get(DependientesContactoComponent);

  }

  cerrarModal(): void {
    this.dialog.close();
  }
  ngOnInit() {}
  onInit() {
    if(this.parentComponent.idDependiente) {
      this.parentComponent.dependienteEconomicoService
        .getEntidadDependienteEconomico(
          this.parentComponent.idDependiente,
          this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadDependiente
            = new DependienteEconomico(response.json());
          //console.log(this.entidadDependiente);
        },
        error => {
        },
        () => {
        }
      );
    }
  }

}
