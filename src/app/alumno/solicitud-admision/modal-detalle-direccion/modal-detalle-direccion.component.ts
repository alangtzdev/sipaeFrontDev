import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {DatosPersonalesComponent} from "../datos-personales/datos-personales.component";
import {Direccion} from "../../../services/entidades/direccion.model";
import {ErrorCatalogo} from "../../../services/core/error.model";
import {SpinnerService} from "../../../services/spinner/spinner/spinner.service";

@Component({
  selector: 'app-modal-detalle-direccion',
  templateUrl: './modal-detalle-direccion.component.html',
  styleUrls: ['./modal-detalle-direccion.component.css']
})
export class ModalDetalleDireccionComponent implements OnInit {


  @ViewChild("modalDetDir")
  dialog:ModalComponent;
  parentComponent: DatosPersonalesComponent;

  entidadDireccion: Direccion;
  idPais;
  validarPaisMexico: boolean = true;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private inj:Injector,
              private _spinner: SpinnerService) {
    this.parentComponent = this.inj.get(DatosPersonalesComponent);
  }

  cerrarModal(): void {
    this.dialog.close();
  }

  mostrarDireccionPais(): boolean {
    if (this.idPais === 82) {
      this.validarPaisMexico = true;
      return true;
    }else {
      this.validarPaisMexico = false;
      return false;
    }
  }
  ngOnInit() {
  }

  onInitDir(){
    this.parentComponent.direccionService
      .getEntidadDireccion(
        this.parentComponent.idDireccion,
        this.erroresConsultas
      ).subscribe(
      response => {
        this.entidadDireccion
          = new Direccion(response.json());
        //console.log(this.entidadDireccion);
        this.idPais = this.entidadDireccion.pais.id;
      },
      error => {
      },
      () => {
      }
    );
  }
}
