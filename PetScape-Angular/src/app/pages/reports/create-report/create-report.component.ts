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
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import * as L from 'leaflet';
import { ReportService } from '../../../core/services/report.service';
import { SpeciesService } from '../../../core/services/species.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Species } from '../../../models/models';

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
  templateUrl: './create-report.component.html',
  styleUrl: './create-report.component.css',
})
export class CreateReportComponent implements OnInit, OnDestroy, AfterViewInit {
  private reportService = inject(ReportService);
  private speciesService = inject(SpeciesService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  species = signal<Species[]>([]);
  loading = signal(false);
  selectedFile: File | null = null;

  form = {
    species: '',
    name: '',
    breed: '',
    gender: '',
    description: '',
    location: '',
    contactName:
      this.auth.currentUser()?.firstname + ' ' + (this.auth.currentUser()?.lastname ?? ''),
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
    this.speciesService.getAll().subscribe((s) => this.species.set(s));
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100);
  }

  ngOnDestroy() {
    this.map?.remove();
  }

  private initMap() {
    const mapEl = document.getElementById('create-report-map');
    if (!mapEl || this.map) return;

    this.map = L.map(mapEl, { center: [33.9716, -6.8498], zoom: 5 });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
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
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    this.pinMarker = L.marker(latlng, { icon }).addTo(this.map!);
  }

  clearPin() {
    this.form.latitude = null;
    this.form.longitude = null;
    if (this.pinMarker) {
      this.pinMarker.remove();
      this.pinMarker = undefined;
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.selectedFile = input.files?.[0] ?? null;
  }

  submit() {
    if (
      !this.form.species ||
      !this.form.description ||
      !this.form.location ||
      !this.form.contactName ||
      !this.form.contactEmail ||
      !this.form.contactPhone
    ) {
      this.toast.error('Missing fields', 'Please fill in all required fields.');
      return;
    }
    this.loading.set(true);
    const fd = new FormData();
    fd.append('species', this.form.species);
    if (this.form.name) fd.append('name', this.form.name);
    if (this.form.breed) fd.append('breed', this.form.breed);
    if (this.form.gender) fd.append('gender', this.form.gender);
    fd.append('description', this.form.description);
    fd.append('location', this.form.location);
    if (this.form.latitude != null) fd.append('latitude', String(this.form.latitude));
    if (this.form.longitude != null) fd.append('longitude', String(this.form.longitude));
    fd.append('contactName', this.form.contactName);
    fd.append('contactEmail', this.form.contactEmail);
    fd.append('contactPhone', this.form.contactPhone);
    fd.append('isFound', String(this.form.isFound));
    if (this.selectedFile) fd.append('image', this.selectedFile);

    this.reportService.create(fd).subscribe({
      next: () => {
        this.toast.success('Report submitted!', 'Your report has been published.');
        this.router.navigate(['/reports']);
      },
      error: (e) => {
        this.loading.set(false);
        this.toast.error('Submission failed', e.error?.message ?? 'Please try again.');
      },
    });
  }
}
