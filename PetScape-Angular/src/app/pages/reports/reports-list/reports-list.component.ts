import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  signal,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import * as L from 'leaflet';
import { ReportService } from '../../../core/services/report.service';
import { SpeciesService } from '../../../core/services/species.service';
import { AnimalReportResponse, Species } from '../../../models/models';
import { environment } from '../../../../environments/environment';

/* ── Fix Leaflet default marker icon (webpack asset issue) ── */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-reports-list',
  standalone: true,
  imports: [RouterLink, FormsModule, DatePipe, SlicePipe],
  templateUrl: './reports-list.component.html',
  styleUrl: './reports-list.component.css',
})
export class ReportsListComponent implements OnInit, OnDestroy, AfterViewInit {
  // Public so template & popup HTML can use the helper
  readonly reportService = inject(ReportService);
  private speciesService = inject(SpeciesService);

  reports = signal<AnimalReportResponse[]>([]);
  species = signal<Species[]>([]);
  loading = signal(true);
  view = signal<'list' | 'map'>('list');
  page = signal(0);
  totalPages = signal(1);
  uploadsUrl = environment.uploadsUrl;

  filter = { type: '', species: '', location: '', status: 'PENDING' as string };

  @ViewChild('mapEl') mapElRef!: ElementRef;
  private map?: L.Map;
  private markers?: L.LayerGroup;

  ngOnInit() {
    this.speciesService.getAll().subscribe((s) => this.species.set(s));
    this.loadReports();
  }

  ngAfterViewInit() {}

  ngOnDestroy() {
    this.map?.remove();
  }

  loadReports(p = 0) {
    this.loading.set(true);
    const type = this.filter.type || undefined;
    const species = this.filter.species || undefined;
    const loc = this.filter.location || undefined;
    const status = this.filter.status || undefined;
    this.reportService
      .getAll({ type, species, location: loc, status, page: p, size: 12 })
      .subscribe({
        next: (res) => {
          this.reports.set(res.content);
          this.totalPages.set(res.totalPages);
          this.page.set(p);
          this.loading.set(false);
          if (this.view() === 'map') this.refreshMapMarkers();
        },
        error: () => this.loading.set(false),
      });
  }

  applyFilters() {
    this.loadReports(0);
  }

  changePage(p: number) {
    this.loadReports(p);
  }

  switchToMap() {
    this.view.set('map');
    const type = this.filter.type || undefined;
    const species = this.filter.species || undefined;
    const loc = this.filter.location || undefined;
    const status = this.filter.status || undefined;
    this.reportService
      .getAll({ type, species, location: loc, status, page: 0, size: 200 })
      .subscribe((res) => {
        this.reports.set(res.content);
        setTimeout(() => this.initMap(), 50);
      });
  }

  private initMap() {
    if (this.map) {
      this.refreshMapMarkers();
      return;
    }
    const mapEl = document.getElementById('reports-map');
    if (!mapEl) return;

    this.map = L.map(mapEl, { center: [33.9716, -6.8498], zoom: 6 }); // Default: Morocco center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);

    this.markers = L.layerGroup().addTo(this.map);
    this.refreshMapMarkers();
  }

  private refreshMapMarkers() {
    if (!this.map || !this.markers) return;
    this.markers.clearLayers();

    const geoReports = this.reports().filter((r) => r.latitude && r.longitude);
    geoReports.forEach((r) => {
      const color = r.isFound ? '#22c55e' : '#ef4444';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;">
                 ${r.isFound ? 'F' : 'L'}
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const popup = `
        <div style="min-width:180px;font-family:Inter,sans-serif">
          ${r.image ? `<img src="${this.reportService.imageUrl(r.image)}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />` : ''}
          <div style="font-size:11px;color:${color};font-weight:700;margin-bottom:2px">${r.isFound ? 'FOUND' : 'LOST'} · ${r.species}</div>
          <div style="font-weight:700;margin-bottom:4px;color:#111">${r.name || 'Unknown'}</div>
          <div style="font-size:11px;color:#666;margin-bottom:8px">${r.location}</div>
          <a href="/reports/${r.id}" style="background:#0f766e;color:white;padding:4px 10px;border-radius:4px;font-size:11px;text-decoration:none;font-weight:600">View Details →</a>
        </div>`;

      L.marker([r.latitude!, r.longitude!], { icon }).bindPopup(popup).addTo(this.markers!);
    });

    if (geoReports.length > 0) {
      const bounds = L.featureGroup(
        geoReports.map((r) => L.marker([r.latitude!, r.longitude!])),
      ).getBounds();
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }
}
