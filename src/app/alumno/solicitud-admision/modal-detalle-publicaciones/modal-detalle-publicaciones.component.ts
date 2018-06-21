import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent} from "ng2-bs3-modal/ng2-bs3-modal";
import {ExperienciaComponent} from "../experiencia/experiencia.component";
import {Publicacion} from "../../../services/entidades/publicacion.model";
import {ErrorCatalogo} from "../../../services/core/error.model";

@Component({
  selector: 'app-modal-detalle-publicaciones',
  templateUrl: './modal-detalle-publicaciones.component.html',
  styleUrls: ['./modal-detalle-publicaciones.component.css']
})
export class ModalDetallePublicacionesComponent implements OnInit {


  @ViewChild("modalDetallePub")
  dialog: ModalComponent;
  context: ExperienciaComponent;
  entidadPublicacion: Publicacion;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private inj:Injector) {
    this.context = this.inj.get(ExperienciaComponent);


  }

  cerrarModal(): void {
    this.dialog.close();
  }
  ngOnInit() { }
  onInit() {
    if(this.context.idPublicacion) {
      this.context.registroPublicacionService.getEntidadPublicacion(
        this.context.idPublicacion,
        this.erroresConsultas
      ).subscribe(
        response => {
          this.entidadPublicacion
            = new Publicacion(response.json());
        },
        error => {
          console.error(error);
          console.error(this.erroresConsultas);

        },
        () => {

        }
      );
    }
  }

}
