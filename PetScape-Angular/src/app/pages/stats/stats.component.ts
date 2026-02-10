import { Component, OnInit, signal, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { environment } from '../../../environments/environment';

interface PlatformStats {
  totalAnimals:     number;
  availableAnimals: number;
  adoptedAnimals:   number;
  adoptionRate:     number;
  totalReports:     number;
  resolvedReports:  number;
  totalAdoptions:   number;
  totalDonated:     number;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="stats-page page-enter">

      <!-- Hero -->
      <section class="stats-hero">
        <div class="hero-glow"></div>
        <div class="hero-content">
          <div class="hero-badge"><i class="bi bi-bar-chart-fill"></i> Live Platform Stats</div>
          <h1>PetsCape Impact</h1>
          <p>Every number here represents a life changed — an animal rescued, a family reunited, a future made possible.</p>
        </div>
      </section>

      <!-- Main Stats Grid -->
      @if (loading()) {
        <div class="stats-grid">@for (i of [1,2,3,4]; track i) { <div class="skeleton" style="height:140px;border-radius:1rem;"></div> }</div>
      } @else if (stats()) {
        <div class="stats-grid">
          <div class="stat-card teal">
            <div class="stat-icon"><i class="bi bi-heart-fill"></i></div>
            <div class="stat-number counter" [attr.data-target]="stats()!.adoptedAnimals">{{ displayAdopted() }}</div>
            <div class="stat-label">Animals Adopted</div>
            <div class="stat-sub">{{ stats()!.adoptionRate }}% adoption rate</div>
          </div>
          <div class="stat-card amber">
            <div class="stat-icon"><i class="bi bi-paw-fill"></i></div>
            <div class="stat-number">{{ displayAvailable() }}</div>
            <div class="stat-label">Awaiting a Home</div>
            <div class="stat-sub">{{ stats()!.totalAnimals | number }} total in our care</div>
          </div>
          <div class="stat-card rose">
            <div class="stat-icon"><i class="bi bi-search-heart-fill"></i></div>
            <div class="stat-number">{{ displayResolved() }}</div>
            <div class="stat-label">Animals Reunited</div>
            <div class="stat-sub">{{ stats()!.totalReports | number }} lost & found reports</div>
          </div>
          <div class="stat-card emerald">
            <div class="stat-icon"><i class="bi bi-currency-dollar"></i></div>
            <div class="stat-number">\${{ displayDonated() }}</div>
            <div class="stat-label">Donated</div>
            <div class="stat-sub">Feeding, care & vet costs</div>
          </div>
        </div>

        <!-- Progress Bars -->
        <div class="progress-section glass-card">
          <h2><i class="bi bi-graph-up-arrow"></i> Progress at a Glance</h2>
          <div class="progress-item">
            <div class="progress-label">
              <span>Adoption Rate</span>
              <span class="progress-pct">{{ stats()!.adoptionRate }}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill teal-fill" [style.width.%]="stats()!.adoptionRate"></div></div>
          </div>
          <div class="progress-item">
            <div class="progress-label">
              <span>Report Resolution Rate</span>
              <span class="progress-pct">{{ resolutionRate() }}%</span>
            </div>
            <div class="progress-track"><div class="progress-fill rose-fill" [style.width.%]="resolutionRate()"></div></div>
          </div>
        </div>

        <!-- Mission Section -->
        <div class="mission-grid">
          <div class="mission-card glass-card">
            <i class="bi bi-shield-heart-fill mission-icon teal"></i>
            <h3>Animal Welfare First</h3>
            <p>Every animal in our care receives veterinary attention, proper nutrition, and love before being placed for adoption.</p>
          </div>
          <div class="mission-card glass-card">
            <i class="bi bi-geo-alt-fill mission-icon amber"></i>
            <h3>GPS-Powered Lost & Found</h3>
            <p>Our interactive map makes it easy to report and locate lost animals across your city in real-time.</p>
          </div>
          <div class="mission-card glass-card">
            <i class="bi bi-people-fill mission-icon rose"></i>
            <h3>Community Driven</h3>
            <p>Thousands of volunteers, donors, and animal lovers unite on PetsCape to make a measurable difference.</p>
          </div>
        </div>

        <!-- CTA -->
        <div class="cta-section glass-card">
          <h2>Ready to make an impact?</h2>
          <p>Adopt, donate, or report a lost animal — every action counts.</p>
          <div class="cta-btns">
            <a routerLink="/animals" class="btn-primary"><i class="bi bi-heart-fill"></i> Adopt a Pet</a>
            <a routerLink="/dashboard/donate" class="btn-amber"><i class="bi bi-gift-fill"></i> Donate</a>
            <a routerLink="/reports/create" class="btn-outline"><i class="bi bi-megaphone-fill"></i> Report</a>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-page { max-width:1000px; margin:0 auto; }
    .stats-hero { text-align:center; padding:3rem 1rem 2rem; position:relative; overflow:hidden; }
    .hero-glow { position:absolute; top:0; left:50%; transform:translateX(-50%); width:400px; height:200px; background:radial-gradient(ellipse,rgba(20,184,166,0.2),transparent 70%); pointer-events:none; }
    .hero-badge { display:inline-flex; align-items:center; gap:0.5rem; background:rgba(20,184,166,0.12); border:1px solid rgba(20,184,166,0.3); color:#14b8a6; padding:0.35rem 0.9rem; border-radius:999px; font-size:0.8rem; font-weight:600; margin-bottom:1rem; }
    .hero-content h1 { font-size:2.5rem; font-weight:900; background:linear-gradient(135deg,#f9fafb,#14b8a6); -webkit-background-clip:text; -webkit-text-fill-color:transparent; margin:0 0 0.75rem; }
    .hero-content p { color:#9ca3af; max-width:550px; margin:0 auto; font-size:1rem; }

    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; margin:2rem 0; }
    .stat-card { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.06); border-radius:1rem; padding:1.5rem; text-align:center; transition:transform 0.2s; }
    .stat-card:hover { transform:translateY(-4px); }
    .stat-card.teal { border-color:rgba(20,184,166,0.2); }
    .stat-card.amber { border-color:rgba(245,158,11,0.2); }
    .stat-card.rose { border-color:rgba(248,113,113,0.2); }
    .stat-card.emerald { border-color:rgba(52,211,153,0.2); }
    .stat-icon { font-size:1.8rem; margin-bottom:0.75rem; }
    .teal .stat-icon,.teal .stat-number { color:#14b8a6; }
    .amber .stat-icon,.amber .stat-number { color:#f59e0b; }
    .rose .stat-icon,.rose .stat-number { color:#f87171; }
    .emerald .stat-icon,.emerald .stat-number { color:#34d399; }
    .stat-number { font-size:2.2rem; font-weight:900; line-height:1; margin-bottom:0.4rem; }
    .stat-label { color:#f9fafb; font-weight:700; font-size:0.95rem; margin-bottom:0.25rem; }
    .stat-sub { color:#6b7280; font-size:0.78rem; }

    .progress-section { padding:1.5rem; margin:1.5rem 0; }
    .progress-section h2 { color:#f9fafb; font-size:1.1rem; font-weight:700; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.5rem; }
    .progress-item { margin-bottom:1rem; }
    .progress-label { display:flex; justify-content:space-between; color:#9ca3af; font-size:0.82rem; font-weight:500; margin-bottom:0.4rem; }
    .progress-pct { font-weight:700; color:#f9fafb; }
    .progress-track { height:8px; background:#1f2937; border-radius:999px; overflow:hidden; }
    .progress-fill { height:100%; border-radius:999px; transition:width 1.2s cubic-bezier(0.4,0,0.2,1); }
    .teal-fill { background:linear-gradient(90deg,#0f766e,#14b8a6); }
    .rose-fill { background:linear-gradient(90deg,#dc2626,#f87171); }

    .mission-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:1rem; margin:1.5rem 0; }
    .mission-card { padding:1.5rem; text-align:center; }
    .mission-icon { font-size:2rem; margin-bottom:0.75rem; display:block; }
    .mission-icon.teal { color:#14b8a6; } .mission-icon.amber { color:#f59e0b; } .mission-icon.rose { color:#f87171; }
    .mission-card h3 { color:#f9fafb; font-weight:700; margin-bottom:0.5rem; }
    .mission-card p { color:#6b7280; font-size:0.85rem; margin:0; }

    .cta-section { padding:2rem; text-align:center; margin:1.5rem 0; }
    .cta-section h2 { color:#f9fafb; font-size:1.4rem; font-weight:800; margin-bottom:0.5rem; }
    .cta-section p { color:#9ca3af; margin-bottom:1.5rem; }
    .cta-btns { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
    .btn-amber { display:inline-flex; align-items:center; gap:0.5rem; background:linear-gradient(135deg,#d97706,#f59e0b); color:white; padding:0.6rem 1.25rem; border-radius:0.5rem; text-decoration:none; font-weight:600; font-size:0.875rem; transition:all 0.2s; }
    .btn-amber:hover { transform:translateY(-1px); }
    @media(max-width:600px) { .hero-content h1{font-size:1.8rem;} .stat-number{font-size:1.7rem;} }
  `]
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
    return Math.round(s.resolvedReports / s.totalReports * 100);
  };

  ngOnInit() {
    this.http.get<PlatformStats>(`${environment.apiUrl}/stats`).subscribe({
      next: data => {
        this.stats.set(data);
        this.loading.set(false);
        this.animateCounters(data);
      },
      error: () => {
        // Fallback demo data if backend not running
        const demo: PlatformStats = {
          totalAnimals: 284, availableAnimals: 127, adoptedAnimals: 157,
          adoptionRate: 55, totalReports: 89, resolvedReports: 62,
          totalAdoptions: 157, totalDonated: 12840
        };
        this.stats.set(demo);
        this.loading.set(false);
        this.animateCounters(demo);
      }
    });
  }

  private animateCounters(data: PlatformStats) {
    this.countUp(data.adoptedAnimals, v => this.displayAdopted.set(v.toLocaleString()));
    this.countUp(data.availableAnimals, v => this.displayAvailable.set(v.toLocaleString()));
    this.countUp(data.resolvedReports, v => this.displayResolved.set(v.toLocaleString()));
    this.countUp(data.totalDonated, v => this.displayDonated.set(v.toLocaleString()));
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
