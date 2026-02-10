import {
  Component, OnInit, OnDestroy, AfterViewInit,
  signal, inject, ViewChild, ElementRef
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';
import { ReportService } from '../../../core/services/report.service';
import { SpeciesService } from '../../../core/services/species.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { SpeciesResponse } from '../../../models/models';

/* Fix Leaflet default marker icon */
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

@Component({
  selector: 'app-create-report',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="page-enter">
      <div class="form-header">
        <a routerLink="/reports" class="back-link"><i class="bi bi-arrow-left"></i> Back to Reports</a>
        <h2><i class="bi bi-megaphone-fill"></i> Submit a Report</h2>
        <p>Help us find missing animals or report a found one</p>
      </div>

      <form class="report-form" (ngSubmit)="submit()">
        <div class="form-grid">

          <!-- Left column -->
          <div class="form-col">
            <div class="glass-card section-card">
              <h3 class="section-title"><i class="bi bi-tag-fill"></i> Report Type</h3>
              <div class="type-toggle">
                <button type="button" class="type-btn" [class.active-lost]="!form.isFound" (click)="form.isFound = false">
                  <i class="bi bi-search-heart"></i> Lost Animal
                </button>
                <button type="button" class="type-btn" [class.active-found]="form.isFound" (click)="form.isFound = true">
                  <i class="bi bi-hand-thumbs-up-fill"></i> Found Animal
                </button>
              </div>
            </div>

            <div class="glass-card section-card">
              <h3 class="section-title"><i class="bi bi-info-circle-fill"></i> Animal Info</h3>
              <div class="field-row">
                <div class="field">
                  <label>Species *</label>
                  <select class="form-select" [(ngModel)]="form.speciesId" name="speciesId" required>
                    <option value="">Select species</option>
                    @for (s of species(); track s.id) { <option [value]="s.id">{{ s.name }}</option> }
                  </select>
                </div>
                <div class="field">
                  <label>Name (if known)</label>
                  <input class="form-control" type="text" [(ngModel)]="form.name" name="name" placeholder="e.g. Max" />
                </div>
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Breed</label>
                  <input class="form-control" type="text" [(ngModel)]="form.breed" name="breed" />
                </div>
                <div class="field">
                  <label>Gender</label>
                  <select class="form-select" [(ngModel)]="form.gender" name="gender">
                    <option value="">Unknown</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label>Description *</label>
                <textarea class="form-control" rows="3" [(ngModel)]="form.description" name="description"
                          placeholder="Color, markings, collar, distinctive features..." required></textarea>
              </div>
              <div class="field">
                <label>Photo</label>
                <div class="file-drop" (click)="fileInput.click()" [class.has-file]="!!selectedFile">
                  <i class="bi bi-camera"></i>
                  {{ selectedFile ? selectedFile.name : 'Click to upload a photo' }}
                </div>
                <input #fileInput type="file" accept="image/*" style="display:none" (change)="onFileChange($event)" />
              </div>
            </div>
          </div>

          <!-- Right column -->
          <div class="form-col">
            <div class="glass-card section-card">
              <h3 class="section-title"><i class="bi bi-geo-alt-fill"></i> Location</h3>
              <div class="field">
                <label>Location Description *</label>
                <input class="form-control" type="text" [(ngModel)]="form.location" name="location"
                       placeholder="e.g. Near Central Park, New York" required />
              </div>

              <!-- Map Picker -->
              <div class="map-picker-label">
                <span><i class="bi bi-pin-map-fill"></i> Pin exact location on map</span>
                @if (form.latitude && form.longitude) {
                  <button type="button" class="clear-pin-btn" (click)="clearPin()">
                    <i class="bi bi-x-circle"></i> Clear pin
                  </button>
                }
              </div>
              <div class="map-picker-hint">
                @if (form.latitude && form.longitude) {
                  <span class="coord-display">📍 {{ form.latitude | number:'1.4-4' }}, {{ form.longitude | number:'1.4-4' }}</span>
                } @else {
                  <span>Click anywhere on the map to drop a pin</span>
                }
              </div>
              <div #mapEl id="create-report-map"></div>
            </div>

            <div class="glass-card section-card">
              <h3 class="section-title"><i class="bi bi-person-fill"></i> Contact Info</h3>
              <div class="field">
                <label>Your Name *</label>
                <input class="form-control" type="text" [(ngModel)]="form.contactName" name="contactName" required />
              </div>
              <div class="field-row">
                <div class="field">
                  <label>Email *</label>
                  <input class="form-control" type="email" [(ngModel)]="form.contactEmail" name="contactEmail" required />
                </div>
                <div class="field">
                  <label>Phone *</label>
                  <input class="form-control" type="text" [(ngModel)]="form.contactPhone" name="contactPhone" required />
                </div>
              </div>
            </div>

            <button type="submit" class="btn-primary submit-btn" [disabled]="loading()">
              @if (loading()) {
                <span class="spinner-border spinner-border-sm me-2"></span> Submitting...
              } @else {
                <i class="bi bi-send-fill"></i> Submit Report
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .form-header { margin-bottom:1.5rem; }
    .back-link { color:#9ca3af; font-size:0.8rem; text-decoration:none; display:inline-flex; align-items:center; gap:0.3rem; margin-bottom:0.5rem; }
    .back-link:hover { color:#14b8a6; }
    .form-header h2 { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; margin:0; }
    .form-header h2 i { color:#f87171; }
    .form-header p { color:#6b7280; margin:0.25rem 0 0; font-size:0.85rem; }
    .form-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.25rem; }
    .form-col { display:flex; flex-direction:column; gap:1rem; }
    .section-card { padding:1.25rem; }
    .section-title { font-size:0.9rem; font-weight:700; color:#d1d5db; display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem; }
    .section-title i { color:#f59e0b; }
    .field { display:flex; flex-direction:column; gap:0.35rem; margin-bottom:0.75rem; }
    .field label { color:#9ca3af; font-size:0.8rem; font-weight:500; }
    .field-row { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }

    .type-toggle { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; }
    .type-btn { border:2px solid rgba(255,255,255,0.08); background:rgba(31,41,55,0.5); color:#9ca3af; padding:0.9rem; border-radius:0.6rem; cursor:pointer; font-weight:600; font-size:0.9rem; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:0.5rem; }
    .type-btn.active-lost { border-color:#ef4444; background:rgba(239,68,68,0.12); color:#f87171; }
    .type-btn.active-found { border-color:#22c55e; background:rgba(34,197,94,0.12); color:#4ade80; }

    .file-drop { border:2px dashed rgba(255,255,255,0.12); border-radius:0.5rem; padding:1rem; text-align:center; cursor:pointer; color:#6b7280; font-size:0.85rem; transition:all 0.2s; background:rgba(31,41,55,0.3); }
    .file-drop:hover, .file-drop.has-file { border-color:#14b8a6; color:#14b8a6; }

    .map-picker-label { display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; font-weight:600; color:#9ca3af; margin-bottom:0.35rem; }
    .map-picker-label i { color:#38bdf8; }
    .clear-pin-btn { background:none; border:none; color:#f87171; font-size:0.75rem; cursor:pointer; display:flex; align-items:center; gap:0.2rem; }
    .map-picker-hint { font-size:0.75rem; color:#4b5563; margin-bottom:0.5rem; min-height:1.2rem; }
    .coord-display { color:#38bdf8; font-weight:600; }
    #create-report-map { width:100%; height:240px; border-radius:0.6rem; overflow:hidden; border:1px solid rgba(255,255,255,0.06); }

    .submit-btn { width:100%; justify-content:center; padding:0.85rem; font-size:1rem; }
    @media(max-width:768px) { .form-grid{grid-template-columns:1fr;} .field-row{grid-template-columns:1fr;} }
  `]
})
export class CreateReportComponent implements OnInit, OnDestroy, AfterViewInit {
  private reportService = inject(ReportService);
  private speciesService = inject(SpeciesService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  species = signal<SpeciesResponse[]>([]);
  loading = signal(false);
  selectedFile: File | null = null;

  form = {
    speciesId: '',
    name: '',
    breed: '',
    gender: '',
    description: '',
    location: '',
    contactName: this.auth.currentUser()?.firstname + ' ' + (this.auth.currentUser()?.lastname ?? ''),
    contactEmail: this.auth.currentUser()?.email ?? '',
    contactPhone: '',
    isFound: false,
    latitude: null as number | null,
    longitude: null as number | null,
  };

  @ViewChild('mapEl') mapElRef!: ElementRef;
  private map?: L.Map;
  private pinMarker?: L.Marker;

  ngOnInit() {
    this.speciesService.getAll().subscribe(s => this.species.set(s));
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy() { this.map?.remove(); }

  private initMap() {
    const mapEl = document.getElementById('create-report-map');
    if (!mapEl || this.map) return;

    this.map = L.map(mapEl, { center: [33.9716, -6.8498], zoom: 5 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.form.latitude = Math.round(e.latlng.lat * 1e6) / 1e6;
      this.form.longitude = Math.round(e.latlng.lng * 1e6) / 1e6;
      this.placePinMarker(e.latlng);
    });
  }

  private placePinMarker(latlng: L.LatLng) {
    if (this.pinMarker) this.pinMarker.remove();
    const color = this.form.isFound ? '#22c55e' : '#ef4444';
    const icon = L.divIcon({
      className: '',
      html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;font-size:12px;">${this.form.isFound ? '✅' : '🐾'}</div>`,
      iconSize: [28, 28], iconAnchor: [14, 14]
    });
    this.pinMarker = L.marker(latlng, { icon }).addTo(this.map!);
  }

  clearPin() {
    this.form.latitude = null;
    this.form.longitude = null;
    if (this.pinMarker) { this.pinMarker.remove(); this.pinMarker = undefined; }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit() {
    if (!this.form.speciesId || !this.form.description || !this.form.location ||
        !this.form.contactName || !this.form.contactEmail || !this.form.contactPhone) {
      this.toast.error('Missing fields', 'Please fill in all required fields.');
      return;
    }
    this.loading.set(true);
    const fd = new FormData();
    fd.append('speciesId', this.form.speciesId);
    if (this.form.name)    fd.append('name', this.form.name);
    if (this.form.breed)   fd.append('breed', this.form.breed);
    if (this.form.gender)  fd.append('gender', this.form.gender);
    fd.append('description', this.form.description);
    fd.append('location',    this.form.location);
    if (this.form.latitude != null)  fd.append('latitude',  String(this.form.latitude));
    if (this.form.longitude != null) fd.append('longitude', String(this.form.longitude));
    fd.append('contactName',  this.form.contactName);
    fd.append('contactEmail', this.form.contactEmail);
    fd.append('contactPhone', this.form.contactPhone);
    fd.append('isFound', String(this.form.isFound));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.reportService.create(fd).subscribe({
      next: () => {
        this.toast.success('Report submitted!', 'Your report has been published.');
        this.router.navigate(['/reports']);
      },
      error: e => {
        this.loading.set(false);
        this.toast.error('Submission failed', e.error?.message ?? 'Please try again.');
      }
    });
  }
}
