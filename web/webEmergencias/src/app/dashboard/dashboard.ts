import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { NuevaUnidadService } from '../services/nueva-unidad-service';
import { Unidad } from '../models/Unidad';
@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private nuevaUnidadService = inject(NuevaUnidadService);

  // TODO: eliminar esto
  unidadPrueba: Unidad = {
    id: "A-8570",
    cuerpo: "SAMUR-PC",
    tipoUnidad: "USVB",
    estado: "desactivado",
    cuentaUsuario: "roberto@sanitario.com"
  };

  ngOnInit() {
    this.probarRegistro();
  }

  // TODO: eliminar esto
  probarRegistro() {
    console.log("iniciando prueba de registro")
    try {
      this.nuevaUnidadService.nuevaUnidad(this.unidadPrueba)
      console.log("unidad añadida con éxito, verificar Firebase")
    } catch (error) {
      console.log(`error al mandar la unidad: ${error}`)
    }
  }
}
