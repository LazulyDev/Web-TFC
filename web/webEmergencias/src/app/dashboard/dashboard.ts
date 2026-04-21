import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GoogleMap, MapMarker, MapInfoWindow } from '@angular/google-maps';
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
  estatus: string;
  fecha: string;
  workers: string[];
  asignado: boolean;
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, GoogleMap, MapMarker, MapInfoWindow],
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
  filtroIncidentes = 'urgencia';
  incidentesFiltrados: Incidente[] = [];

  // mapa
  center: google.maps.LatLngLiteral = { lat: 40.4168, lng: -3.7038 };
  zoom = 12;

  mapOptions: google.maps.MapOptions = {
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    zoomControl: true,
    clickableIcons: false
  };

  marcadoresIncidentes: google.maps.LatLngLiteral[] = [];
  marcadoresUnidades: {
    position: google.maps.LatLngLiteral;
    title: string;
    options: google.maps.MarkerOptions;
  }[] = [];

    @ViewChild(MapInfoWindow) infoWindow!: MapInfoWindow;

    marcadorSeleccionado: {
    position: google.maps.LatLngLiteral;
    tipo: 'unidad' | 'incidente';
    titulo: string;
    subtitulo: string;
  } | null = null;

  modalAbierto = false;
  incidenteSeleccionado: Incidente | null = null;
  unidadesSeleccionadasIds: string[] = [];

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
        this.actualizarMarcadoresMapa();
      },
      error: (error) => {
        console.error('error cargando unidades desde firebase', error);
      }
    });
  }

  aplicarFiltros(): void {
    this.unidadesFiltradas = this.unidades.filter((unidad) => {
      // oculta unidades no operativas
      const estadoNormalizado = (unidad.estado || '').trim().toLowerCase();
      const esVisible =
        estadoNormalizado === 'disponible' ||
        estadoNormalizado === 'busy' ||
        estadoNormalizado === 'online';

      if (!esVisible) {
        return false;
      }

      const coincideCuerpo =
        !this.filtroCuerpo || unidad.cuerpo === this.filtroCuerpo;

      const coincideEstado =
        !this.filtroEstado || unidad.estado === this.filtroEstado;

      return coincideCuerpo && coincideEstado;
    });

    // si la unidad seleccionada deja de estar visible, la deselecciona
    if (
      this.unidadSeleccionada &&
      !this.unidadesFiltradas.some((u) => u.id === this.unidadSeleccionada?.id)
    ) {
      this.unidadSeleccionada = null;
    }
    this.actualizarMarcadoresMapa();
  }

  limpiarFiltros(): void {
    this.filtroCuerpo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

    aplicarOrdenIncidentes(): void {
    const incidentesVisibles = this.incidentesActivos.filter((incidente) => {
      const estadoNormalizado = (incidente.estatus || '').trim().toLowerCase();

      // oculta incidentes terminados o resueltos
      return estadoNormalizado !== 'terminado' && estadoNormalizado !== 'finalizado' && estadoNormalizado !== 'resuelto';
    });

    

    this.incidentesFiltrados = [...incidentesVisibles].sort((a, b) => {
      if (this.filtroIncidentes === 'reciente') {
        return this.obtenerTimestamp(b.fecha) - this.obtenerTimestamp(a.fecha);
      }

      const diferenciaUrgencia = this.obtenerPesoUrgencia(b.estatus) - this.obtenerPesoUrgencia(a.estatus);

      if (diferenciaUrgencia !== 0) {
        return diferenciaUrgencia;
      }

      return this.obtenerTimestamp(b.fecha) - this.obtenerTimestamp(a.fecha);
    });
  }
  actualizarMarcadoresMapa(): void {
    this.marcadoresIncidentes = this.incidentesFiltrados
      .filter((incidente: any) =>
        typeof incidente.latitude === 'number' &&
        typeof incidente.longitude === 'number'
      )
      .map((incidente: any) => ({
        lat: incidente.latitude,
        lng: incidente.longitude
      }));

    this.marcadoresUnidades = this.unidadesFiltradas
      .filter((unidad) =>
        typeof unidad.latitude === 'number' &&
        typeof unidad.longitude === 'number'
      )
      .map((unidad) => ({
        position: {
          lat: unidad.latitude as number,
          lng: unidad.longitude as number
        },
        title: `${unidad.id} - ${unidad.cuerpo}`,
        options: {
          title: `${unidad.id} - ${unidad.cuerpo}`,
          icon: {
            url: this.obtenerIconoUnidad(unidad.cuerpo)
          }
        }
      }));

    this.centrarMapaSiHayDatos();
  }

  centrarMapaSiHayDatos(): void {
    const primerIncidente = this.marcadoresIncidentes[0];
    const primeraUnidad = this.marcadoresUnidades[0]?.position;

    if (primerIncidente) {
      this.center = primerIncidente;
      return;
    }

    if (primeraUnidad) {
      this.center = primeraUnidad;
    }
  }

  centrarEnUnidad(unidad: Unidad): void {
    if (typeof unidad.latitude !== 'number' || typeof unidad.longitude !== 'number') {
      return;
    }

    this.center = {
      lat: unidad.latitude,
      lng: unidad.longitude
    };

    this.zoom = 15;

    this.marcadorSeleccionado = {
      position: {
        lat: unidad.latitude,
        lng: unidad.longitude
      },
      tipo: 'unidad',
      titulo: unidad.id,
      subtitulo: `${unidad.cuerpo} - ${unidad.estado}`
    };

    this.abrirInfoDesdeLista();
  }

  centrarEnIncidente(incidente: Incidente): void {
    if (typeof incidente.latitude !== 'number' || typeof incidente.longitude !== 'number') {
      return;
    }

    this.center = {
      lat: incidente.latitude,
      lng: incidente.longitude
    };

    this.zoom = 16;

    this.marcadorSeleccionado = {
      position: {
        lat: incidente.latitude,
        lng: incidente.longitude
      },
      tipo: 'incidente',
      titulo: incidente.nombreCompleto,
      subtitulo: incidente.descripcionEmergencia || 'sin descripcion'
    };

    this.abrirInfoDesdeLista();
  }

  cerrarInfoWindow(): void {
    this.marcadorSeleccionado = null;
  }

    abrirInfoDesdeLista(): void {
    setTimeout(() => {
      if (this.infoWindow && this.marcadorSeleccionado) {
        this.infoWindow.open();
      }
    });
  }

  obtenerIconoUnidad(cuerpo: string): string {
    const cuerpoNormalizado = (cuerpo || '').trim().toLowerCase();

    switch (cuerpoNormalizado) {
      case 'policía municipal':
      case 'policia municipal':
      case 'police':
        return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';

      case 'samur-pc':
      case 'samur':
        return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';

      case 'bomberos':
        return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';

      default:
        return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
    }
  }

  obtenerIconoIncidente(estatus: string): google.maps.Icon {
    let color = 'red-dot';

    switch ((estatus || '').trim().toLowerCase()) {
      case 'normal':
        color = 'blue-dot';
        break;
      case 'moderado':
        color = 'yellow-dot';
        break;
      case 'urgente':
        color = 'orange-dot';
        break;
      case 'prioritario':
        color = 'red-dot';
        break;
    }

    return {
      url: `http://maps.google.com/mapfiles/ms/icons/${color}.png`
    };
  }

  obtenerPesoUrgencia(estatus: string): number {
    switch ((estatus || '').trim().toLowerCase()) {
      case 'prioritario':
        return 4;
      case 'urgente':
        return 3;
      case 'moderado':
        return 2;
      case 'normal':
        return 1;
      default:
        return 0;
    }
  }

obtenerTimestamp(fecha: string): number {
  if (!fecha) return 0;

  try {
    const [parteFecha, parteHora] = fecha.split('/');

    if (!parteFecha || !parteHora) return 0;

    const [dia, mes, anio] = parteFecha.split('-').map(n => parseInt(n, 10));
    const [hora, minuto] = parteHora.split('.').map(n => parseInt(n, 10));

    if ([dia, mes, anio].some(isNaN)) return 0;

    return new Date(
      anio,
      (mes || 1) - 1,
      dia || 1,
      hora || 0,
      minuto || 0
    ).getTime();

  } catch {
    return 0;
  }
}

  seleccionarUnidad(unidad: Unidad): void {
    this.unidadSeleccionada = unidad;
    this.centrarEnUnidad(unidad);
  }

  abrirInfoUnidad(marker: MapMarker, unidad: Unidad): void {
    if (typeof unidad.latitude !== 'number' || typeof unidad.longitude !== 'number') {
      return;
    }

    this.marcadorSeleccionado = {
      position: {
        lat: unidad.latitude,
        lng: unidad.longitude
      },
      tipo: 'unidad',
      titulo: unidad.id,
      subtitulo: `${unidad.cuerpo} - ${unidad.estado}`
    };

    this.infoWindow.open(marker);
  }

  abrirInfoIncidente(marker: MapMarker, incidente: Incidente): void {
    if (typeof incidente.latitude !== 'number' || typeof incidente.longitude !== 'number') {
      return;
    }

    this.marcadorSeleccionado = {
      position: {
        lat: incidente.latitude,
        lng: incidente.longitude
      },
      tipo: 'incidente',
      titulo: incidente.nombreCompleto,
      subtitulo: incidente.descripcionEmergencia || 'sin descripcion'
    };

    this.infoWindow.open(marker);
  }

    abrirModalIncidente(incidente: Incidente): void {
    this.incidenteSeleccionado = incidente;
    this.unidadesSeleccionadasIds = [...(incidente.workers || [])];
    this.modalAbierto = true;
  }

  cerrarModalIncidente(): void {
    this.modalAbierto = false;
    this.incidenteSeleccionado = null;
    this.unidadesSeleccionadasIds = [];
  }

  unidadEsSeleccionable(unidad: Unidad): boolean {
    const estado = (unidad.estado || '').trim().toLowerCase();
    return estado === 'disponible' || estado === 'online';
  }

  unidadEstaBloqueada(unidad: Unidad): boolean {
    const estado = (unidad.estado || '').trim().toLowerCase();
    return estado === 'busy';
  }

  toggleUnidadSeleccionada(unidad: Unidad): void {
    if (!this.unidadEsSeleccionable(unidad)) {
      return;
    }

    const claveUnidad = unidad.UID || unidad.id;
    const yaSeleccionada = this.unidadesSeleccionadasIds.includes(claveUnidad);

    if (yaSeleccionada) {
      this.unidadesSeleccionadasIds = this.unidadesSeleccionadasIds.filter(
        (id) => id !== claveUnidad
      );
    } else {
      this.unidadesSeleccionadasIds = [...this.unidadesSeleccionadasIds, claveUnidad];
    }
  }

  unidadMarcada(unidad: Unidad): boolean {
    const claveUnidad = unidad.UID || unidad.id;
    return this.unidadesSeleccionadasIds.includes(claveUnidad);
  }

  get unidadesOperativasModal(): Unidad[] {
    return this.unidades.filter((unidad) => {
      const estado = (unidad.estado || '').trim().toLowerCase();
      return estado === 'disponible' || estado === 'online' || estado === 'busy';
    });
  }

  guardarAsignacionLocal(): void {
    if (!this.incidenteSeleccionado) {
      return;
    }

    this.incidentesActivos = this.incidentesActivos.map((incidente) => {
      if (incidente.id !== this.incidenteSeleccionado?.id) {
        return incidente;
      }

      return {
        ...incidente,
        workers: [...this.unidadesSeleccionadasIds],
        asignado: this.unidadesSeleccionadasIds.length > 0
      };
    });

    this.aplicarOrdenIncidentes();
    this.cerrarModalIncidente();
  }

  finalizarIncidenciaLocal(): void {
    if (!this.incidenteSeleccionado) {
      return;
    }

    this.incidentesActivos = this.incidentesActivos.map((incidente) => {
      if (incidente.id !== this.incidenteSeleccionado?.id) {
        return incidente;
      }

      return {
        ...incidente,
        estatus: 'terminado'
      };
    });

    this.aplicarOrdenIncidentes();
    this.cerrarModalIncidente();
  }

  obtenerTextoEstadoUnidadModal(unidad: Unidad): string {
    const estado = (unidad.estado || '').trim().toLowerCase();

    switch (estado) {
      case 'disponible':
        return 'disponible';
      case 'online':
        return 'online';
      case 'busy':
        return 'ocupada';
      default:
        return unidad.estado || 'sin estado';
    }
  }

  verIncidente(incidente: Incidente): void {
    this.centrarEnIncidente(incidente);
    this.abrirModalIncidente(incidente);
  }

  contarPorEstado(estado: string): number {
    return this.unidades.filter((unidad) => {
      const estadoUnidad = (unidad.estado || '').trim().toLowerCase();
      return estadoUnidad === estado.trim().toLowerCase();
    }).length;
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
    switch ((estado || '').trim().toLowerCase()) {
      case 'disponible':
        return 'text-bg-success';
      case 'busy':
        return 'text-bg-warning';
        case 'online':
          return 'text-bg-primary';
      default:
          return 'text-bg-secondary';
    }
  }


  obtenerBadgeIncidente(estatus: string): string {
    switch ((estatus || '').trim().toLowerCase()) {
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


  // MANEJA EL ENVÍO DE EMERGENCIAS EN EL MODAL PARA ASIGNAR AVISOS
  asignarAvisos(): void {
    // 1. Validaciones previas
    if (!this.incidenteSeleccionado || this.unidadesSeleccionadasIds.length === 0) return;
    
    const inc = this.incidenteSeleccionado;
    
    // 2. IMPORTANTE: Creamos una copia local de los IDs para que no se pierdan 
    // al cerrar el modal o limpiar variables
    const copiaIdsUnidades = [...this.unidadesSeleccionadasIds];
    const coordenadas = `${inc.latitude}, ${inc.longitude}`;
    const mensaje = inc.descripcionEmergencia || 'Aviso de emergencia, llamar a central';
    const idIncidencia = inc.id;

    console.log(`Preparando envío para: ${copiaIdsUnidades}`);

    // 3. Primero mandamos los avisos (usando la copia)
    this.mandarAvisos(
      copiaIdsUnidades,
      mensaje,
      coordenadas,
      idIncidencia
    );

    // 4. Después actualizamos la UI (esto cerrará el modal y limpiará los arrays originales)
    this.guardarAsignacionLocal();
    console.log("Proceso de asignación finalizado");
  }

  // MANDA LOS AVISOS AL SERVICIO ENCARGADO DE MANDARLOS A FCM (mandar-avisos-service.ts)
  mandarAvisos(unidadId: string[], contenido: string, coordenadas: string, incidenciaID: string) {
    this.mandarAvisosService.enviarMultiplesAvisos(unidadId, contenido, coordenadas, incidenciaID).subscribe(
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
        this.incidentesActivos = datos.map((item, index) => {
          const workers = Array.isArray(item.workers) ? item.workers : [];
          const estatusNormalizado = (item.status || item.estatus || 'normal').trim().toLowerCase();

          return {
            id: item.id ?? item.identificador?.toString() ?? `sin-id-${index}`,
            identificador: item.identificador ?? index + 1,
            nombreCompleto: item.nombreCompleto ?? item.nombre ?? 'sin nombre',
            telefono: item.numeroTelefono ?? item.telefono ?? '',
            tipoSangre: item.codigoSanguineo ?? item.tipoSangre ?? '',
            descripcionEmergencia: item.description ?? item.descripcionEmergencia ?? item.descripcion ?? '',
            estatus: estatusNormalizado || 'normal',
            fecha: item.date ?? '',
            workers,
            asignado: workers.length > 0,
            latitude: item.latitude,
            longitude: item.longitude
          };
        });

        this.aplicarOrdenIncidentes();
        this.actualizarMarcadoresMapa();
        console.log('avisos recibidos', this.incidentesActivos.length);
      },
      error: (error) => {
        console.error('error cargando incidentes desde firebase', error);
      }
    });
  }
}

