import {
  Component,
  OnInit,
  signal,
  inject,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

interface PlatformStats {
  totalAnimals: number;
  availableAnimals: number;
  adoptedAnimals: number;
  adoptionRate: number;
  totalReports: number;
  resolvedReports: number;
  totalAdoptions: number;
  totalDonated: number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  templateUrl: './stats.component.html',
  styleUrl: './stats.component.css',
})
export class StatsComponent implements OnInit {
  private http = inject(HttpClient);

  loading = signal(true);
  stats = signal<PlatformStats | null>(null);

  // Animated display values (count-up effect via signal)
  displayAdopted = signal('0');
  displayAvailable = signal('0');
  displayResolved = signal('0');
  displayDonated = signal('0');

  resolutionRate = () => {
    const s = this.stats();
    if (!s || s.totalReports === 0) return 0;
    return Math.round((s.resolvedReports / s.totalReports) * 100);
  };

  ngOnInit() {
    this.http.get<PlatformStats>(`${environment.apiUrl}/stats`).subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
        this.animateCounters(data);
      },
      error: () => {
        this.stats.set({
          totalAnimals: 0,
          availableAnimals: 0,
          adoptedAnimals: 0,
          adoptionRate: 0,
          totalReports: 0,
          resolvedReports: 0,
          totalAdoptions: 0,
          totalDonated: 0,
        });
        this.loading.set(false);
      },
    });
  }

  private animateCounters(data: PlatformStats) {
    this.countUp(data.adoptedAnimals, (v) => this.displayAdopted.set(v.toLocaleString()));
    this.countUp(data.availableAnimals, (v) => this.displayAvailable.set(v.toLocaleString()));
    this.countUp(data.resolvedReports, (v) => this.displayResolved.set(v.toLocaleString()));
    this.countUp(data.totalDonated, (v) => this.displayDonated.set(v.toLocaleString()));
  }

  private countUp(target: number, setter: (v: number) => void, duration = 1600) {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease-in-out
      setter(Math.round(ease * target));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
}
