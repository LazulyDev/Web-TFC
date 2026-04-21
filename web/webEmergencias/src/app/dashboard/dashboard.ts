import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Unidad } from '../models/Unidad';
import { NuevaUnidadService } from '../services/nueva-unidad-service';
import { MandarAvisosService } from '../services/mandar-avisos-service';
import { RecibirAvisosService } from '../services/recibir.avisos.service';

declare var google : any

interface Incidente {
  id: string;
  identificador: number;
  nombreCompleto: string;
  telefono: string;
  tipoSangre?: string;
  description: string;
  estatus: 'normal' | 'moderado' | 'urgente' | 'prioritario';
  latitude?: number;
  longitude?: number;
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

  // propiedades para el modal para la ventana emergente para asignar avisos
  incidenteSeleccionadoModal: Incidente | null = null;
  unidadSeleccionadaModal: Unidad | null = null;

  // propiedades para el Mapa
  mapa: any
  apiCargada = false

  // listas de las unidades que se van a mostrar en el mapa
  // Diccionarios para tener localizados los marcadores por su ID
  marcadoresUnidades: { [id: string]: any } = {};
  marcadoresIncidentes: { [id: string]: any } = {};   

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
      description: 'Caída en vía pública con posible traumatismo.',
      estatus: 'normal'
    },
    {
      id: 'INC-002',
      identificador: 2,
      nombreCompleto: 'María López',
      telefono: '654 88 11 22',
      description: 'Incendio en vivienda con humo en escalera.',
      estatus: 'prioritario'
    },
    {
      id: 'INC-003',
      identificador: 3,
      nombreCompleto: 'Carlos Pérez',
      telefono: '622 45 67 90',
      description: 'Accidente de tráfico con heridos conscientes.',
      estatus: 'urgente'
    }
  ];

  get totalUnidades(): number {
    return this.unidades.length;
  }

  ngOnInit(): void {
    this.cargarUnidadesDesdeFirebase();
    this.recibirEmergencias();

    setTimeout(() => {
    this.renderizarMapa();
  }, 1000);
  }

  cargarUnidadesDesdeFirebase(): void {
    this.unidadService.verUnidades().subscribe({
      next: (unidades: Unidad[]) => {
        this.unidades = unidades;
        this.aplicarFiltros();
        this.actualizarMarcadores()
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
      this.actualizarMarcadores()
      return coincideCuerpo && coincideEstado;
    });
  }

  limpiarFiltros(): void {
    this.filtroCuerpo = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
    this.inicializarMapa();
    this.actualizarMarcadores()
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

  prepararAvisos():void{ // esta función es necesaria para preparar los datos que se van a mandar
    if(this.incidenteSeleccionadoModal && this.unidadSeleccionadaModal){
      const unidadId        = this.unidadSeleccionadaModal.id
      const contenido       = this.incidenteSeleccionadoModal.description
      const coordenadas     = `${this.incidenteSeleccionadoModal.latitude}, ${this.incidenteSeleccionadoModal.longitude}`
      const incidenciaID    = this.incidenteSeleccionadoModal.id

      console.log(`UnidadID: ${unidadId} contenido: ${contenido}`)
      this.mandarAvisos(unidadId, contenido, coordenadas, incidenciaID)

      // reset de la selección para que no se manden duplicados o se guarden unidades que no deberían
      this.unidadSeleccionadaModal = null
      this.incidenteSeleccionadoModal = null
    }
  }

  //FUNCIÓN ENCARGADA DE MANDAR LOS AVISOS A MESSAGING
  mandarAvisos(unidadId: string, contenido: string, coordenadas: string, incidenciaID: string) {
    this.mandarAvisosService.enviarAviso(unidadId, contenido, coordenadas, incidenciaID).subscribe(
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
          description: item.description ?? item.descripcion ?? '',
          estatus: item.estatus ?? 'normal',
          latitude: item.lat ?? item.latitude ?? item.latitud,
          longitude: item.lng ?? item.longitude ?? item.longitud
        }));
        console.log('avisos recibidos', this.incidentesActivos.length);
        this.actualizarMarcadores()
      },
      error: (error) => {
        console.error('error cargando incidentes desde firebase', error);
      }
    });
  }

  // INICIALIZACIÓN DEL MAPA PARA VISUALIZAR LAS UNIDADES
  inicializarMapa(){
    setTimeout(() => {
      this.apiCargada = true
      this.renderizarMapa()
    },);
  }

  // RENDERIZACIÓN DEL MAPA
  renderizarMapa() {
  // Cuando llames a esta función, el mapa se dibujará en el div #map
  this.apiCargada = true; 
  
  const mapOptions = {
    center: { lat: 40.4167, lng: -3.7033 },
    zoom: 12,
    mapId: 'DEMO_MAP_ID' // Opcional, para estilos avanzados
  };

  this.mapa = new google.maps.Map(document.getElementById('map'), mapOptions);
  }

  // PONE LOS PINES POR CADA UNA DE LAS UNIDADES
  actualizarMarcadores() {
  // 1. Verificación de seguridad
  if (!this.mapa) {
    console.warn("Mapa no listo. Reintentando en breve...");
    return;
  }

  console.log("Intentando pintar unidades:", this.unidadesFiltradas.length);

  // --- 2. PROCESAR UNIDADES ---
  this.unidadesFiltradas.forEach(unidad => {
    // Forzamos a Number por si Firebase los trae como string
    // He dejado 'latiude' porque has dicho que en tu modelo está así
    const lat = Number(unidad.latitude); 
    const lng = Number(unidad.longitude);

    if (!isNaN(lat) && !isNaN(lng) && lat !== 0) {
      const pos = { lat, lng };

      if (this.marcadoresUnidades[unidad.id]) {
        this.marcadoresUnidades[unidad.id].setPosition(pos);
        console.log(`Unidad: ${unidad.id} colocada correctamente en ${unidad.latitude}, ${unidad.longitude}`)
      } else {
        console.log(`Creando marcador para unidad: ${unidad.id} en`, pos);
        this.marcadoresUnidades[unidad.id] = new google.maps.Marker({
          position: pos,
          map: this.mapa,
          title: unidad.id,
          icon: this.getIconoCuerpo(unidad.cuerpo)
        });
      }
    } else {
      console.error(`Coordenadas inválidas para ${unidad.id}:`, unidad.latitude, unidad.longitude);
    }
  });

  // --- 3. LIMPIEZA DE FILTROS ---
  Object.keys(this.marcadoresUnidades).forEach(id => {
    if (!this.unidadesFiltradas.find(u => u.id === id)) {
      this.marcadoresUnidades[id].setMap(null);
      delete this.marcadoresUnidades[id];
    }
  });

  // --- 4. PROCESAR INCIDENTES ---
  this.incidentesActivos.forEach(incidente => {
    const lat = Number(incidente.latitude);
    const lng = Number(incidente.longitude);

    console.log(`incidente: ${incidente.id} coordenadas: ${incidente.latitude}, ${incidente.longitude}`)

    if (!isNaN(lat) && !isNaN(lng)) {
      const pos = { lat, lng };
      if (!this.marcadoresIncidentes[incidente.id]) {
        this.marcadoresIncidentes[incidente.id] = new google.maps.Marker({
          position: pos,
          map: this.mapa,
          title: incidente.description,
          icon: this.getIconoCuerpo('incidente')
        });
      }
    }
  });
}

  // PONE UN ÍCONO DEPENDIENDO DEL CUERPO DE EMERGENCIAS
  getIconoCuerpo(tipo: string) {
  let url = 'assets/iconos/default.png';
  
  // Asignamos la ruta según el cuerpo
  switch (tipo) {
    case 'SAMUR-PC':            url = '/img/iconosMaps/samur.png'; break;
    case 'Bomberos':            url = '/img/iconosMaps/bomberos.webp'; break;
    case 'Policía Municipal':   url = '/img/iconosMaps/pmm.png'; break;
    case 'incidente':           url = '/img/iconosMaps/sos.png'; break;
  }

  return {
    url: url,
    scaledSize: new google.maps.Size(40, 40),     // Tamaño en píxeles (ajusta a tu gusto)
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(20, 20)         // El centro del icono coincide con la coordenada
  };
}

}

