import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unidad } from '../models/Unidad';
import { Incidente } from '../models/Incidente';
import { NuevaUnidadService } from '../services/nueva-unidad-service';
import { MandarAvisosService } from '../services/mandar-avisos-service';
import { RecibirAvisosService } from '../services/recibir.avisos.service';
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
  private mandarAvisosService = inject(MandarAvisosService)
  private recibirAvisosService = inject(RecibirAvisosService)

  incidenteSeleccionadoModal: Incidente | null = null;
  unidadSeleccionadaModal: Unidad | null = null;

  unidades: Unidad[] = [];
  unidadesFiltradas: Unidad[] = [];
  unidadSeleccionada: Unidad | null = null;

  filtroCuerpo = '';
  filtroEstado = '';

  // Incidentes activos — se rellenan desde Firestore en recibirEmergencias().
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

  contarPorEstado(estado: string): number {
    return this.unidades.filter((unidad) => unidad.estado === estado).length;
  }

  /** Cuántas unidades están ocupadas (en caso o en la escena). */
  contarOcupadas(): number {
    return this.unidades.filter(
      (u) => u.estado === 'InActiveCase' || u.estado === 'OnScene'
    ).length;
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

  /**
   * Badge colour para el estado canónico de la unidad
   * (Online | InActiveCase | OnScene | offline).
   */
  obtenerBadgeEstado(estado: string): string {
    switch (estado) {
      case 'Online':       return 'text-bg-success';
      case 'InActiveCase': return 'text-bg-warning';
      case 'OnScene':      return 'text-bg-primary';
      case 'offline':      return 'text-bg-secondary';
      default:             return 'text-bg-light';
    }
  }

  /** Etiqueta legible para el estado canónico. */
  obtenerLabelEstado(estado: string): string {
    switch (estado) {
      case 'Online':       return 'En línea';
      case 'InActiveCase': return 'En caso';
      case 'OnScene':      return 'En la escena';
      case 'offline':      return 'Desconectada';
      default:             return estado;
    }
  }

  /** Badge colour para el estado del caso (status) en Firestore. */
  obtenerBadgeIncidente(status: string): string {
    switch (status) {
      case 'Ongoing':  return 'text-bg-danger';
      case 'Finished': return 'text-bg-secondary';
      default:         return 'text-bg-light';
    }
  }

  /**
   * Envía un aviso de emergencia a una unidad específica.
   * Requiere:
   *   - `avisoID`: ID del documento Firestore `Emergencias/{caseId}` — la app
   *     Android lo necesita para traer el Case completo tras "ACEPTAR".
   *   - `coordenadas`: string "lat,lng" del incidente.
   */
  prepararAvisos(): void {
    if (!this.incidenteSeleccionadoModal || !this.unidadSeleccionadaModal) {
      return;
    }

    const unidadId = this.unidadSeleccionadaModal.id;
    const avisoID  = this.incidenteSeleccionadoModal.id;
    const contenido = this.incidenteSeleccionadoModal.description || 'Nueva emergencia';

    const lat = this.incidenteSeleccionadoModal.latitude;
    const lng = this.incidenteSeleccionadoModal.longitude;
    const coordenadas = (lat != null && lng != null) ? `${lat},${lng}` : '';

    console.log(`Enviando aviso → unidad=${unidadId} caso=${avisoID}`);
    this.mandarAvisos(unidadId, avisoID, contenido, coordenadas);

    // reset de la selección
    this.unidadSeleccionadaModal = null;
    this.incidenteSeleccionadoModal = null;
  }

  // FUNCIÓN ENCARGADA DE MANDAR LOS AVISOS A MESSAGING
  mandarAvisos(unidadId: string, avisoID: string, contenido: string, coordenadas: string) {
    this.mandarAvisosService.enviarAviso(unidadId, avisoID, contenido, coordenadas).subscribe({
      next: (respuesta: any) => {
        console.log('Mensaje enviado con éxito:', respuesta);
      },
      error: (error: any) => {
        console.error(`ERROR AL MANDAR EL MENSAJE: ${error.message}`, error);
      }
    });
  }

  // RECIBE ACTUALIZACIONES DE FIREBASE FIRESTORE PARA LISTAR LAS EMERGENCIAS
  recibirEmergencias(): void {
    this.recibirAvisosService.verAvisos().subscribe({
      next: (datos: any[]) => {
        // Mapeamos 1:1 a la forma del modelo (ver Case.kt + Incidente.ts).
        // Importante: conservamos latitude/longitude/status/finishRequestedBy
        // porque `<app-map-operativo>` los necesita.
        this.incidentesActivos = datos.map((item) => ({
          id: item.id ?? 'sin-id',
          nombreCompleto: item.nombreCompleto ?? '',
          numeroTelefono: item.numeroTelefono ?? '',
          codigoSanguineo: item.codigoSanguineo ?? '',
          description: item.description ?? '',
          type: item.type ?? '',
          date: item.date ?? '',
          location: item.location ?? '',
          status: item.status ?? 'Ongoing',
          finishRequestedBy: item.finishRequestedBy ?? '',
          finishRequestedAt: item.finishRequestedAt ?? null,
          victim: item.victim ?? '',
          workers: item.workers ?? [],
          latitude: typeof item.latitude === 'number' ? item.latitude : Number(item.latitude) || 0,
          longitude: typeof item.longitude === 'number' ? item.longitude : Number(item.longitude) || 0,
        } as Incidente));
        console.log('avisos recibidos', this.incidentesActivos.length);
      },
      error: (error) => {
        console.error('error cargando incidentes desde firebase', error);
      }
    });
  }
}
