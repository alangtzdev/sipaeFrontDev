import { Component, OnInit } from '@angular/core';
import {CatalogosServices} from "../../services/catalogos/catalogos.service";
import {Router} from "@angular/router";
import {AuthService} from "../../auth/auth.service";
import {UsuarioSesion} from "../../services/usuario/usuario-sesion";

@Component({
  selector: 'app-estadisticas',
  templateUrl: './estadisticas.component.html',
  styleUrls: ['./estadisticas.component.css']
})
export class EstadisticasComponent implements OnInit {

  usuarioLogueado: UsuarioSesion;
  mostrarFiltros911: boolean = false;
  mostrarFiltrosEficiencia: boolean = false;
  mostrarFiltrosIndiceTitulacion: boolean = false;
  mostrarFiltrosIndicadores: boolean = false;
  mostrarFiltrosEstudianteExtranjeros: boolean = false;
  mostrarFiltrosConcentrado: boolean = false;
  mostrarFiltrosRegistroAspirantes: boolean = false;
  mostrarFiltrosRegistroOptativas: boolean = false;
  constructor(private _catalogosService: CatalogosServices,
              private authService : AuthService,
              private router: Router) {
    this.prepareServices();
    this.usuarioLogueado = authService.getUsuarioLogueado();
    console.log(this.usuarioLogueado);

  }
  cambiarFiltros(tipoReporte: string): void {
    //console.log(tipoReporte);
    this.limpiarVariablesEstado();
    switch (tipoReporte) {
      case '911':
        this.mostrarFiltros911 = true;
        break;
      case 'eficiencia':
        this.mostrarFiltrosEficiencia = true;
        break;
      case 'indiceTitulacion':
        this.mostrarFiltrosIndiceTitulacion = true;
        break;
      case 'indicadores':
        this.mostrarFiltrosIndicadores = true;
        break;
      case 'estudiantesExtranjeros':
        this.mostrarFiltrosEstudianteExtranjeros = true;
        break;
      case 'concentrado':
        this.mostrarFiltrosConcentrado = true;
        break;
      case 'registroAspirantes':
        this.mostrarFiltrosRegistroAspirantes = true;
        break;
      case 'registroOptativas':
        this.mostrarFiltrosRegistroOptativas = true;
        break;
    }
  }

  limpiarVariablesEstado(): void {
    this.mostrarFiltros911 = false;
    this.mostrarFiltrosEficiencia = false;
    this.mostrarFiltrosIndiceTitulacion = false;
    this.mostrarFiltrosIndicadores = false;
    this.mostrarFiltrosEstudianteExtranjeros = false;
    this.mostrarFiltrosConcentrado = false;
    this.mostrarFiltrosRegistroAspirantes = false;
    this.mostrarFiltrosRegistroOptativas = false;
  }

  private prepareServices(): void {

  }


  ngOnInit() {
  }

}
