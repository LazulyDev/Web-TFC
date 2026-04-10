import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unidad } from '../models/Unidad';
import { NuevaUnidadService } from '../services/nueva-unidad-service';
import { MandarAvisosService } from '../services/mandar-avisos-service';
import { RecibirAvisosService } from '../services/recibir.avisos.service';

interface Incidente {
  id: string;
  identificador: number;
  nombreCompleto: string;
  telefono: string;
  tipoSangre?: string;
  descripcionEmergencia: string;
  estatus: 'normal' | 'moderado' | 'urgente' | 'prioritario';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  private unidadService = inject(NuevaUnidadService);
  private mandarAvisosService = inject(MandarAvisosService)
  private recibirAvisosService = inject(RecibirAvisosService)

  unidades: Unidad[] = [];
  unidadesFiltradas: Unidad[] = [];
  unidadSeleccionada: Unidad | null = null;

  filtroCuerpo = '';
  filtroEstado = '';

  incidentesActivos: Incidente[] = [
    {
      id: 'INC-001',
      identificador: 1,
      nombreCompleto: 'Fulanito Detal',
      telefono: '123 12 12 12',
      tipoSangre: '0+',
      descripcionEmergencia: 'Caída en vía pública con posible traumatismo.',
      estatus: 'normal'
    },
    {
      id: 'INC-002',
      identificador: 2,
      nombreCompleto: 'María López',
      telefono: '654 88 11 22',
      descripcionEmergencia: 'Incendio en vivienda con humo en escalera.',
      estatus: 'prioritario'
    },
    {
      id: 'INC-003',
      identificador: 3,
      nombreCompleto: 'Carlos Pérez',
      telefono: '622 45 67 90',
      descripcionEmergencia: 'Accidente de tráfico con heridos conscientes.',
      estatus: 'urgente'
    }
  ];

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

  obtenerBadgeEstado(estado: string): string {
    switch (estado) {
      case 'activada':
        return 'text-bg-success';
      case 'desactivada':
        return 'text-bg-secondary';
      case 'no disponible':
        return 'text-bg-warning';
      default:
        return 'text-bg-light';
    }
  }


  obtenerBadgeIncidente(estatus: string): string {
    switch (estatus) {
      case 'normal':
        return 'text-bg-primary';
      case 'moderado':
        return 'text-bg-warning';
      case 'urgente':
        return 'text-bg-orange-custom';
      case 'prioritario':
        return 'text-bg-danger';
      default:
        return 'text-bg-secondary';
    }
  }

  /**
   * Envía un aviso de emergencia a una unidad específica
   * @param unidadId:       ID de la unidad (ej: BO-71)
   * @param contenido:      Cuerpo/descripción del aviso
   * @param coordenadas:    Coordenadas como string (ej: "40.4168,-3.7038") SERÁN AÑADIDAS EN UN FUTURO
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

  // RECIBE ACTUALIZACIONES DE FIREBASE FIRESTORE PARA LISTAR LAS EMERGENCIAS
  recibirEmergencias(): void {
    this.recibirAvisosService.verAvisos().subscribe({
      next: (datos: any[]) => {
        this.incidentesActivos = datos.map((item) => ({
          id: item.id ?? item.identificador?.toString() ?? 'sin-id',
          identificador: item.identificador ?? 0,
          nombreCompleto: item.nombreCompleto ?? item.nombre ?? 'Sin nombre',
          telefono: item.telefono ?? '',
          tipoSangre: item.tipoSangre,
          descripcionEmergencia: item.descripcionEmergencia ?? item.descripcion ?? '',
          estatus: item.estatus ?? 'normal'
        }));
        console.log('avisos recibidos', this.incidentesActivos.length);
      },
      error: (error) => {
        console.error('error cargando incidentes desde firebase', error);
      }
    });
  }
}

