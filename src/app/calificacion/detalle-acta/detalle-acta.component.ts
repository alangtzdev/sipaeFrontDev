import { Component, OnInit, Input } from '@angular/core';
import {MateriaImpartida} from '../../services/entidades/materia-impartida.model';
import {CatalogosServices} from '../../services/catalogos/catalogos.service';

@Component({
  selector: 'app-detalle-acta',
  templateUrl: './detalle-acta.component.html',
  styleUrls: ['./detalle-acta.component.css']
})
export class DetalleActaComponent implements OnInit {

  @Input() materiaImpartidaId: number;
  @Input() profesor: string;

  errores: Array<any> = [];
  materiaImpartida: MateriaImpartida;
  materiaImpartidaService;

  constructor(public catalolosService: CatalogosServices) {
    this.prepareService();
  }

  ngOnInit() {
    this.obtenerMateriaImpartida();
  }

  private obtenerMateriaImpartida(): void {
    this.materiaImpartidaService.getEntidadMateriaImpartida(
      this.materiaImpartidaId,
      this.errores
    ).subscribe(
        response => {
              this.materiaImpartida = new MateriaImpartida(response.json());
        }
    );
  }

  private prepareService(): void {
    this.materiaImpartidaService = this.catalolosService.getMateriaImpartidaService();
  }

}
