import {Component, Injector, OnInit, ViewChild} from '@angular/core';
import {ModalComponent, ModalInstance} from "ng2-bs3-modal/ng2-bs3-modal";
import {ExperienciaComponent} from "../experiencia/experiencia.component";
import {ExperienciaProfesional} from "../../../services/entidades/experiencia-profesional.model";
import {ErrorCatalogo} from "../../../services/core/error.model";

@Component({
  selector: 'app-modal-detalle-experiencia',
  templateUrl: './modal-detalle-experiencia.component.html',
  styleUrls: ['./modal-detalle-experiencia.component.css']
})
export class ModalDetalleExperienciaComponent implements OnInit {

  @ViewChild("modalDetalleExp")
  dialog: ModalComponent;
  context: ExperienciaComponent;
  entidadDetalleExperiencia: ExperienciaProfesional;
  idTipoExperiencia;
  mostrarCampo: boolean;
  private erroresConsultas: Array<ErrorCatalogo> = [];

  constructor(private inj:Injector) {

    this.context = this.inj.get(ExperienciaComponent);


  }

  cerrarModal(): void {
    this.dialog.close();
  }

  mostrarCamposTipoExperiencia(): boolean{
    //console.log('ejecutado');
    //console.log(this.idTipoExperiencia);

    if (this.idTipoExperiencia == 1){
      this.mostrarCampo = true;
      return true;
    } else {
      this.mostrarCampo = false;
      return false;
    }

  }
  ngOnInit() { }
  onInit() {
    if(this.context.idListaExperiencia){
      this.context.registroExperienciaProfesionalService
        .getEntidadExperienciaProfesional(
          this.context.idListaExperiencia,
          this.erroresConsultas
        ).subscribe(
        response => {
          this.entidadDetalleExperiencia
            = new ExperienciaProfesional(response.json());
          this.idTipoExperiencia = this.entidadDetalleExperiencia.tipoExperiencia.id;
        },
        error => {
          console.error(error);
          console.error(this.erroresConsultas);

        },
        () => {
          //console.log(this.entidadDetalleExperiencia);

        }
      );
    }
  }

}
