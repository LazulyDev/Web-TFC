import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { NuevaUnidadService } from '../services/nueva-unidad-service';
import { Unidad } from '../models/Unidad';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private UnidadService = inject(NuevaUnidadService);
  unidades$: Observable<Unidad[]> = this.UnidadService.verUnidades()

  obtenerColorcuerpo(cuerpo: string) {
    const normalized = cuerpo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    switch (normalized) {
      case "policia municipal":  // Now matches "policía municipal" after normalization
        return "policia";
      case "bomberos":
        return "bomberos";
      case "samur-pc":
        return "sanitarios";
      default:
        return "gray-800";
    }
  }


  ngOnInit() {
    this.registrarUnidadesDePrueba();
  }

  registrarUnidadesDePrueba() {
    const unidades: Unidad[] = [
      { id: "P-761", cuerpo: "Policía Municipal", tipoUnidad: "Patrulla", estado: "disponible", cuentaUsuario: "agente@policia.com" },
      { id: "BO-71", cuerpo: "Bomberos", tipoUnidad: "Bomba Móvil", estado: "desactivado", cuentaUsuario: "roberto@bombero.com" },
      { id: "UPR-8027", cuerpo: "SAMUR-PC", tipoUnidad: "USVB", estado: "disponible", cuentaUsuario: "roberto@sanitario.com" }
    ];

    unidades.forEach(u => {
      this.UnidadService.nuevaUnidad(u)
    });
  }
}
