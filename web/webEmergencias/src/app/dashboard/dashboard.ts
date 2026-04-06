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

  // VERIFICA EL CUERPO AL QUE PERTENECE LA UNIDAD Y LE ASIGNA UN COLOR
  obtenerColorcuerpo(cuerpo: string) {
    const normalized = cuerpo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    switch (normalized) {
      case "policia municipal": 
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

  // TODO: esto tiene que eliminarse. se ha usado para hacer la prueba.
  registrarUnidadesDePrueba() {
    const unidades: Unidad[] = [
      { id: "P-761", cuerpo: "Policía Municipal", tipoUnidad: "Patrulla", estado: "disponible", cuentaUsuario: "agente@policia.com" },
      { id: "BO-71", cuerpo: "Bomberos", tipoUnidad: "Bomba Móvil", estado: "desactivado", cuentaUsuario: "roberto@bombero.com" },
      { id: "UPR-8027", cuerpo: "SAMUR-PC", tipoUnidad: "UPR", estado: "disponible", cuentaUsuario: "roberto@sanitario.com" }, 
      { id: "A-8532", cuerpo: "SAMUR-PC", tipoUnidad: "USVB", estado: "no disponible", cuentaUsuario: "ejemplo@sanitario.emergencias.com"}
    ];

    unidades.forEach(u => {
      this.UnidadService.nuevaUnidad(u)
    });
  }
}
