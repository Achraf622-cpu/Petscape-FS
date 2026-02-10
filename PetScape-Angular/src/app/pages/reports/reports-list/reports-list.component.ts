import {
  Component, OnInit, OnDestroy, AfterViewInit,
  signal, inject, ViewChild, ElementRef
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, SlicePipe } from '@angular/common';
import * as L from 'leaflet';
import { ReportService } from '../../../core/services/report.service';
import { SpeciesService } from '../../../core/services/species.service';
import { AnimalReportResponse, SpeciesResponse } from '../../../models/models';
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
  template: `
    <div class="page-enter">
      <!-- Header -->
      <div class="reports-header">
        <div>
          <h2 class="page-title"><i class="bi bi-search-heart-fill"></i> Lost & Found Reports</h2>
          <p class="sub">Help reunite animals with their families</p>
        </div>
        <a routerLink="/reports/create" class="btn-primary">
          <i class="bi bi-plus-lg"></i> Submit Report
        </a>
      </div>

      <!-- Filters + View Toggle -->
      <div class="filters-bar glass-card">
        <div class="filter-group">
          <select class="form-select form-select-sm" [(ngModel)]="filter.type" (change)="applyFilters()">
            <option value="">All Types</option>
            <option value="lost">Lost</option>
            <option value="found">Found</option>
          </select>
          <select class="form-select form-select-sm" [(ngModel)]="filter.speciesId" (change)="applyFilters()">
            <option value="">All Species</option>
            @for (s of species(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
          </select>
          <input class="form-control form-control-sm" type="text" placeholder="Search location..."
                 [(ngModel)]="filter.location" (input)="applyFilters()" />
        </div>
        <div class="view-toggle">
          <button class="toggle-btn" [class.active]="view() === 'list'" (click)="view.set('list')">
            <i class="bi bi-grid-3x3-gap"></i> Cards
          </button>
          <button class="toggle-btn" [class.active]="view() === 'map'" (click)="switchToMap()">
            <i class="bi bi-map-fill"></i> Map
          </button>
        </div>
      </div>

      <!-- ── MAP VIEW ── -->
      @if (view() === 'map') {
        <div class="map-container glass-card">
          <div class="map-header">
            <span class="map-badge"><i class="bi bi-geo-alt-fill"></i> {{ reports().length }} reports on map</span>
            <span class="map-hint">Click a pin to see report details</span>
          </div>
          <div #mapEl id="reports-map"></div>
        </div>
      }

      <!-- ── CARD VIEW ── -->
      @if (view() === 'list') {
        @if (loading()) {
          <div class="cards-grid">
            @for (i of [1,2,3,4,5,6]; track i) { <div class="skeleton" style="height:220px;border-radius:0.75rem;"></div> }
          </div>
        } @else if (reports().length === 0) {
          <div class="empty-state">
            <div class="empty-icon"><i class="bi bi-search-heart"></i></div>
            <h3>No reports found</h3>
            <p>Be the first to help — submit a lost or found animal report</p>
            <a routerLink="/reports/create" class="btn-primary">Submit Report</a>
          </div>
        } @else {
          <div class="cards-grid">
            @for (r of reports(); track r.id) {
              <a class="report-card" [routerLink]="['/reports', r.id]">
                <div class="card-img-wrap">
                  @if (r.image) {
                    <img [src]="uploadsUrl + '/reports/' + r.image" [alt]="r.speciesName" />
                  } @else {
                    <div class="no-img"><i class="bi bi-image"></i></div>
                  }
                  <span class="type-badge" [class.lost]="!r.isFound" [class.found]="r.isFound">
                    @if (r.isFound) { <i class="bi bi-check-circle-fill"></i> Found } @else { <i class="bi bi-search"></i> Lost }
                  </span>
                  @if (r.latitude && r.longitude) {
                    <span class="has-location-badge"><i class="bi bi-geo-alt-fill"></i> Map pin</span>
                  }
                </div>
                <div class="card-body">
                  <div class="card-species">{{ r.speciesName }}</div>
                  <h4 class="card-name">{{ r.name || 'Unknown' }}</h4>
                  <p class="card-desc">{{ r.description | slice:0:80 }}{{ (r.description || '').length > 80 ? '...' : '' }}</p>
                  <div class="card-footer-meta">
                    <span><i class="bi bi-geo-alt"></i> {{ r.location }}</span>
                    <span>{{ r.createdAt | date:'MMM d' }}</span>
                  </div>
                </div>
              </a>
            }
          </div>

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <div class="pagination-wrap">
              <button class="btn-outline" [disabled]="page() === 0" (click)="changePage(page() - 1)">
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="page-indicator">Page {{ page() + 1 }} / {{ totalPages() }}</span>
              <button class="btn-outline" [disabled]="page() === totalPages() - 1" (click)="changePage(page() + 1)">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .reports-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem; }
    .page-title { font-size:1.4rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; margin:0; }
    .page-title i { color:#f87171; }
    .sub { color:#6b7280; font-size:0.85rem; margin:0.25rem 0 0; }
    .filters-bar { padding:1rem 1.25rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; margin-bottom:1.25rem; flex-wrap:wrap; }
    .filter-group { display:flex; gap:0.75rem; flex-wrap:wrap; flex:1; }
    .view-toggle { display:flex; border:1px solid rgba(255,255,255,0.08); border-radius:0.5rem; overflow:hidden; }
    .toggle-btn { background:transparent; border:none; color:#6b7280; padding:0.5rem 1rem; cursor:pointer; font-size:0.8rem; font-weight:600; display:flex; align-items:center; gap:0.4rem; transition:all 0.2s; }
    .toggle-btn.active { background:rgba(14,165,233,0.15); color:#38bdf8; }

    /* Map */
    .map-container { padding:1rem; margin-bottom:1.25rem; }
    .map-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem; }
    .map-badge { background:rgba(248,113,113,0.15); color:#f87171; border:1px solid rgba(248,113,113,0.3); padding:0.25rem 0.75rem; border-radius:999px; font-size:0.78rem; font-weight:600; display:flex; align-items:center; gap:0.4rem; }
    .map-hint { color:#6b7280; font-size:0.75rem; }
    #reports-map { width:100%; height:450px; border-radius:0.6rem; overflow:hidden; }

    /* Cards */
    .cards-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1rem; }
    .report-card { display:block; background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.06); border-radius:0.75rem; overflow:hidden; transition:transform 0.2s,box-shadow 0.2s; text-decoration:none; }
    .report-card:hover { transform:translateY(-4px); box-shadow:0 8px 30px rgba(0,0,0,0.4); }
    .card-img-wrap { position:relative; height:170px; overflow:hidden; background:#1f2937; }
    .card-img-wrap img { width:100%; height:100%; object-fit:cover; }
    .no-img { height:100%; display:flex; align-items:center; justify-content:center; color:#4b5563; font-size:2rem; }
    .type-badge { position:absolute; top:0.6rem; left:0.6rem; padding:0.2rem 0.6rem; border-radius:999px; font-size:0.7rem; font-weight:700; backdrop-filter:blur(6px); }
    .type-badge.lost { background:rgba(239,68,68,0.8); color:white; }
    .type-badge.found { background:rgba(34,197,94,0.8); color:white; }
    .has-location-badge { position:absolute; top:0.6rem; right:0.6rem; background:rgba(14,165,233,0.8); color:white; padding:0.2rem 0.5rem; border-radius:999px; font-size:0.68rem; font-weight:600; display:flex; align-items:center; gap:0.2rem; backdrop-filter:blur(6px); }
    .card-body { padding:1rem; }
    .card-species { color:#14b8a6; font-size:0.72rem; font-weight:600; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:0.25rem; }
    .card-name { color:#f9fafb; font-size:1rem; font-weight:700; margin:0 0 0.4rem; }
    .card-desc { color:#6b7280; font-size:0.8rem; margin:0 0 0.75rem; }
    .card-footer-meta { display:flex; justify-content:space-between; color:#4b5563; font-size:0.75rem; }
    .card-footer-meta i { margin-right:0.25rem; }

    /* Empty state */
    .empty-state { text-align:center; padding:4rem 1rem; }
    .empty-icon { font-size:3rem; color:#4b5563; margin-bottom:1rem; }
    .empty-state h3 { color:#d1d5db; font-weight:700; }
    .empty-state p { color:#6b7280; margin-bottom:1.5rem; }

    /* Pagination */
    .pagination-wrap { display:flex; justify-content:center; align-items:center; gap:1rem; margin-top:1.5rem; }
    .page-indicator { color:#9ca3af; font-size:0.85rem; }
    button:disabled { opacity:0.4; cursor:not-allowed; }
    @media(max-width:600px) { .reports-header{flex-direction:column;align-items:flex-start;gap:0.75rem;} }
  `]
})
export class ReportsListComponent implements OnInit, OnDestroy, AfterViewInit {
  private reportService = inject(ReportService);
  private speciesService = inject(SpeciesService);

  reports = signal<AnimalReportResponse[]>([]);
  species = signal<SpeciesResponse[]>([]);
  loading = signal(true);
  view = signal<'list' | 'map'>('list');
  page = signal(0);
  totalPages = signal(1);
  uploadsUrl = environment.uploadsUrl;

  filter = { type: '', speciesId: '', location: '' };

  @ViewChild('mapEl') mapElRef!: ElementRef;
  private map?: L.Map;
  private markers?: L.LayerGroup;

  ngOnInit() {
    this.speciesService.getAll().subscribe(s => this.species.set(s));
    this.loadReports();
  }

  ngAfterViewInit() { }

  ngOnDestroy() { this.map?.remove(); }

  loadReports(p = 0) {
    this.loading.set(true);
    const type = this.filter.type || undefined;
    const speciesId = this.filter.speciesId ? +this.filter.speciesId : undefined;
    const loc = this.filter.location || undefined;
    this.reportService.getAll({ type, speciesId, location: loc, page: p, size: 12 }).subscribe({
      next: res => {
        this.reports.set(res.content);
        this.totalPages.set(res.totalPages);
        this.page.set(p);
        this.loading.set(false);
        if (this.view() === 'map') this.refreshMapMarkers();
      },
      error: () => this.loading.set(false)
    });
  }

  applyFilters() { this.loadReports(0); }

  changePage(p: number) { this.loadReports(p); }

  switchToMap() {
    this.view.set('map');
    // Load all reports for the map (no pagination)
    this.reportService.getAll({ page: 0, size: 200 }).subscribe(res => {
      this.reports.set(res.content);
      setTimeout(() => this.initMap(), 50);
    });
  }

  private initMap() {
    if (this.map) { this.refreshMapMarkers(); return; }
    const mapEl = document.getElementById('reports-map');
    if (!mapEl) return;

    this.map = L.map(mapEl, { center: [33.9716, -6.8498], zoom: 6 }); // Default: Morocco center
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>',
      maxZoom: 19
    }).addTo(this.map);

    this.markers = L.layerGroup().addTo(this.map);
    this.refreshMapMarkers();
  }

  private refreshMapMarkers() {
    if (!this.map || !this.markers) return;
    this.markers.clearLayers();

    const geoReports = this.reports().filter(r => r.latitude && r.longitude);
    geoReports.forEach(r => {
      const color = r.isFound ? '#22c55e' : '#ef4444';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;font-weight:bold;">
                 ${r.isFound ? 'F' : 'L'}
               </div>`,
        iconSize: [28, 28], iconAnchor: [14, 14]
      });

      const popup = `
        <div style="min-width:180px;font-family:Inter,sans-serif">
          ${r.image ? `<img src="${this.uploadsUrl}/reports/${r.image}" style="width:100%;height:100px;object-fit:cover;border-radius:6px;margin-bottom:8px;" />` : ''}
          <div style="font-size:11px;color:${color};font-weight:700;margin-bottom:2px">${r.isFound ? 'FOUND' : 'LOST'} · ${r.speciesName}</div>
          <div style="font-weight:700;margin-bottom:4px;color:#111">${r.name || 'Unknown'}</div>
          <div style="font-size:11px;color:#666;margin-bottom:8px">${r.location}</div>
          <a href="/reports/${r.id}" style="background:#0f766e;color:white;padding:4px 10px;border-radius:4px;font-size:11px;text-decoration:none;font-weight:600">View Details →</a>
        </div>`;

      L.marker([r.latitude!, r.longitude!], { icon })
        .bindPopup(popup)
        .addTo(this.markers!);
    });

    if (geoReports.length > 0) {
      const bounds = L.featureGroup(geoReports.map(r => L.marker([r.latitude!, r.longitude!]))).getBounds();
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }
  }
}
