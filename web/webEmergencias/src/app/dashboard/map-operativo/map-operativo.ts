import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  PLATFORM_ID,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type * as LType from 'leaflet';
import { Unidad } from '../../models/Unidad';
import { Incidente } from '../../models/Incidente';

/**
 * Operational map rendered with Leaflet + OpenStreetMap tiles.
 *
 * Renders:
 *   - One marker per Unit with valid coordinates, coloured by `cuerpo`
 *     and outlined by `estado` (on-scene / in-case / offline).
 *   - One marker per incident with `status === "Ongoing"` and valid coordinates.
 *
 * Auto-fits the map bounds to contain all markers. Falls back to Madrid
 * centre when there's nothing to show yet.
 *
 * Leaflet is loaded via dynamic import so the component is safe under SSR /
 * prerender (the current angular.json has ssr=false, but we keep the guard
 * in case that changes later).
 */
@Component({
  selector: 'app-map-operativo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-operativo.html',
  styleUrl: './map-operativo.css',
  encapsulation: ViewEncapsulation.None
})
export class MapOperativo implements AfterViewInit, OnChanges, OnDestroy {
  @Input() unidades: Unidad[] = [];
  @Input() incidentes: Incidente[] = [];

  @ViewChild('mapContainer', { static: true })
  mapContainer!: ElementRef<HTMLDivElement>;

  private L: typeof LType | null = null;
  private map: LType.Map | null = null;
  private layerGroup: LType.LayerGroup | null = null;
  private readonly platformId = inject(PLATFORM_ID);

  // Madrid — the fallback centre when no markers exist yet
  private readonly DEFAULT_CENTER: [number, number] = [40.4168, -3.7038];
  private readonly DEFAULT_ZOOM = 12;

  async ngAfterViewInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    // Dynamic import keeps Leaflet out of SSR bundles
    const mod = await import('leaflet');
    this.L = mod;

    this.map = this.L.map(this.mapContainer.nativeElement, {
      center: this.DEFAULT_CENTER,
      zoom: this.DEFAULT_ZOOM,
      zoomControl: true,
      attributionControl: true
    });

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    this.layerGroup = this.L.layerGroup().addTo(this.map);
    this.renderMarkers();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    // Re-render when parent pushes new data
    if (this.L && this.map && this.layerGroup) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
    this.layerGroup = null;
    this.L = null;
  }

  private renderMarkers(): void {
    if (!this.L || !this.map || !this.layerGroup) return;

    this.layerGroup.clearLayers();
    const bounds = this.L.latLngBounds([]);

    // --- Units ---
    for (const unidad of this.unidades) {
      const lat = Number(unidad.latitude ?? 0);
      const lng = Number(unidad.longitude ?? 0);
      if (!this.isValidCoord(lat, lng)) continue;

      const cls = this.cuerpoClass(unidad.cuerpo);
      const estadoClass = this.estadoClass(unidad.estado);
      const label = this.cuerpoLabel(unidad.cuerpo);

      const icon = this.L.divIcon({
        className: 'unit-marker-wrap',
        html: `<div class="unit-pin unit-pin--${cls} ${estadoClass}">${label}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      const tooltip = `
        <strong>${this.escape(unidad.id)}</strong><br>
        ${this.escape(unidad.cuerpo)} · ${this.escape(unidad.tipoUnidad)}<br>
        Estado: ${this.estadoLabel(unidad.estado)}
      `;

      const marker = this.L
        .marker([lat, lng], { icon })
        .bindTooltip(tooltip, { direction: 'top', offset: [0, -12] });

      this.layerGroup.addLayer(marker);
      bounds.extend([lat, lng]);
    }

    // --- Incidents (Ongoing only) ---
    for (const inc of this.incidentes) {
      if (inc.status !== 'Ongoing') continue;

      const lat = Number(inc.latitude ?? 0);
      const lng = Number(inc.longitude ?? 0);
      if (!this.isValidCoord(lat, lng)) continue;

      const pending = !!inc.finishRequestedBy && inc.finishRequestedBy !== '';
      const extraClass = pending ? ' incident-pin--pending' : '';

      const icon = this.L.divIcon({
        className: 'incident-marker-wrap',
        html: `<div class="incident-pin${extraClass}">!</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      });

      const tooltip = `
        <strong>${this.escape(inc.nombreCompleto || inc.id)}</strong><br>
        ${this.escape(inc.descripcionEmergencia || '')}<br>
        Tel: ${this.escape(inc.telefono || '—')}
        ${pending ? '<br><em>Cierre solicitado</em>' : ''}
      `;

      const marker = this.L
        .marker([lat, lng], { icon })
        .bindTooltip(tooltip, { direction: 'top', offset: [0, -14] });

      this.layerGroup.addLayer(marker);
      bounds.extend([lat, lng]);
    }

    // Fit bounds if anything is on the map, otherwise stay on the default view
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }

  // ───────────────────────────────────────────── helpers ─────────────────────

  private isValidCoord(lat: number, lng: number): boolean {
    return (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      !(lat === 0 && lng === 0) &&
      Math.abs(lat) <= 90 &&
      Math.abs(lng) <= 180
    );
  }

  private cuerpoClass(cuerpo: string): string {
    switch (cuerpo) {
      case 'Policía Municipal': return 'policia';
      case 'SAMUR-PC':          return 'samur';
      case 'Bomberos':          return 'bomberos';
      default:                  return 'generic';
    }
  }

  private cuerpoLabel(cuerpo: string): string {
    switch (cuerpo) {
      case 'Policía Municipal': return 'POL';
      case 'SAMUR-PC':          return 'SAM';
      case 'Bomberos':          return 'BOM';
      default:                  return 'UND';
    }
  }

  private estadoClass(estado: string): string {
    switch (estado) {
      case 'OnScene':      return 'unit-pin--on-scene';
      case 'InActiveCase': return 'unit-pin--in-case';
      case 'offline':      return 'unit-pin--offline';
      default:             return '';
    }
  }

  private estadoLabel(estado: string): string {
    switch (estado) {
      case 'Online':       return 'En línea';
      case 'InActiveCase': return 'En caso';
      case 'OnScene':      return 'En la escena';
      case 'offline':      return 'Desconectada';
      default:             return estado;
    }
  }

  /** Minimal HTML-escape so unit/incident text can't break the tooltip. */
  private escape(s: string): string {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
