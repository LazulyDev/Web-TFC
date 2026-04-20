import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unidad } from '../models/Unidad';
import { Incidente } from '../models/Incidente';
import { NuevaUnidadService } from '../services/nueva-unidad-service';
import { MandarAvisosService } from '../services/mandar-avisos-service';
import { RecibirAvisosService } from '../services/recibir.avisos.service';
import { CerrarCasoService } from '../services/cerrar-caso-service';
import { MapOperativo } from './map-operativo/map-operativo';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MapOperativo],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private unidadService = inject(NuevaUnidadService);
  private mandarAvisosService = inject(MandarAvisosService);
  private recibirAvisosService = inject(RecibirAvisosService);
  private cerrarCasoService = inject(CerrarCasoService);

  unidades: Unidad[] = [];
  unidadesFiltradas: Unidad[] = [];
  unidadSeleccionada: Unidad | null = null;

  filtroCuerpo = '';
  filtroEstado = '';

  incidentesActivos: Incidente[] = [];

  get totalUnidades(): number {
    return this.unidades.length;
  }

  ngOnInit(): void {
    this.cargarUnidadesDesdeFirebase();
    this.recibirEmergencias();
  }

  cargarUnidadesDesdeFirebase(): void {
    this.unidadService.verUnidades().subscribe({
      next: (unidades: Unidad[]) => {
        this.unidades = unidades;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('error cargando unidades desde firebase', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.unidadesFiltradas = this.unidades.filter((unidad) => {
      const coincideCuerpo =
        !this.filtroCuerpo || unidad.cuerpo === this.filtroCuerpo;

      const coincideEstado =
        !this.filtroEstado || unidad.estado === this.filtroEstado;

      return coincideCuerpo && coincideEstado;
    });
  }

  limpiarFiltros(): void {
    this.filtroCuerpo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  seleccionarUnidad(unidad: Unidad): void {
    this.unidadSeleccionada = unidad;
  }

  verIncidente(incidente: Incidente): void {
    console.log('incidente seleccionado', incidente);
  }

  /**
   * Count units by estado. Canonical vocabulary:
   *   "Online" | "InActiveCase" | "OnScene" | "offline"
   */
  contarPorEstado(estado: string): number {
    return this.unidades.filter((unidad) => unidad.estado === estado).length;
  }

  obtenerClaseCuerpo(cuerpo: string): string {
    switch (cuerpo) {
      case 'Policía Municipal':
        return 'policia';
      case 'SAMUR-PC':
        return 'samur';
      case 'Bomberos':
        return 'bomberos';
      default:
        return 'policia';
    }
  }

  /** Bootstrap badge class for Unit.estado */
  obtenerBadgeEstado(estado: string): string {
    switch (estado) {
      case 'Online':       return 'text-bg-success';   // libre, asignable
      case 'InActiveCase': return 'text-bg-warning';   // en camino a un caso
      case 'OnScene':      return 'text-bg-primary';   // llegó a la escena
      case 'offline':      return 'text-bg-secondary'; // app cerrada
      default:             return 'text-bg-light';
    }
  }

  /** Human-readable label for Unit.estado (for badges / filters) */
  etiquetaEstado(estado: string): string {
    switch (estado) {
      case 'Online':       return 'En línea';
      case 'InActiveCase': return 'En caso';
      case 'OnScene':      return 'En la escena';
      case 'offline':      return 'Desconectada';
      default:             return estado;
    }
  }

  /** Bootstrap badge class for Case.status */
  obtenerBadgeIncidente(status: string): string {
    switch (status) {
      case 'Ongoing':  return 'text-bg-danger';
      case 'Finished': return 'text-bg-secondary';
      default:         return 'text-bg-secondary';
    }
  }

  etiquetaStatus(status: string): string {
    switch (status) {
      case 'Ongoing':  return 'En curso';
      case 'Finished': return 'Finalizada';
      default:         return status;
    }
  }

  /**
   * Envía un aviso de emergencia a una unidad específica.
   */
  mandarAvisos(unidadId: string, contenido: string, coordenadas: string) {
    this.mandarAvisosService.enviarAviso(unidadId, contenido, coordenadas).subscribe(
      (respuesta: any) => {
        console.log('Mensaje enviado con éxito:', respuesta);
      },
      (error: any) => {
        console.error(`ERROR AL MANDAR EL MENSAJE: ${error.message}`, error);
      }
    );
  }

  /**
   * Real-time subscription to the Emergencias Firestore collection.
   * Maps the App's canonical field names onto the Incidente view model.
   */
  recibirEmergencias(): void {
    this.recibirAvisosService.verAvisos().subscribe({
      next: (datos: any[]) => {
        this.incidentesActivos = datos.map((item) => ({
          id:                    item.id ?? 'sin-id',
          identificador:         item.identificador ?? 0,
          nombreCompleto:        item.nombreCompleto ?? 'Sin nombre',
          telefono:              item.numeroTelefono ?? '',
          tipoSangre:            item.codigoSanguineo,
          descripcionEmergencia: item.description ?? '',

          status:                (item.status as 'Ongoing' | 'Finished') ?? 'Ongoing',
          finishRequestedBy:     item.finishRequestedBy ?? '',
          finishRequestedAt:     item.finishRequestedAt ?? null,

          victim:                item.victim,
          workers:               Array.isArray(item.workers) ? item.workers : [],
          latitude:              item.latitude,
          longitude:             item.longitude
        } as Incidente));
        console.log('avisos recibidos', this.incidentesActivos.length);
      },
      error: (error) => {
        console.error('error cargando incidentes desde firebase', error);
      }
    });
  }

  /** True when a Unit has requested closure for this incident. */
  tieneCierrePendiente(incidente: Incidente): boolean {
    return !!incidente.finishRequestedBy && incidente.finishRequestedBy !== '';
  }

  /**
   * Confirm case closure from the Dashboard. This is the ONLY place that
   * actually finishes a case — the App can only *request* a closure.
   */
  confirmarCierre(incidente: Incidente): void {
    const ok = confirm(
      `Confirmar cierre de la emergencia ${incidente.id}? ` +
      `Todas las unidades asignadas volverán a estado "Online".`
    );
    if (!ok) return;

    this.cerrarCasoService.cerrarCaso(
      incidente.id,
      incidente.workers ?? [],
      incidente.victim ?? ''
    ).then(() => {
      console.log('Caso', incidente.id, 'cerrado correctamente');
    }).catch((error: any) => {
      console.error('Error al cerrar caso', incidente.id, error);
    });
  }
}
