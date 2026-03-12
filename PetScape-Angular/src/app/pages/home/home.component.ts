import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { AnimalService } from '../../core/services/animal.service';
import { ReportService } from '../../core/services/report.service';
import { AnimalResponse, AnimalReportResponse } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  template: `
    <!-- ── Hero Section ── -->
    <section class="hero">
      <div class="hero-bg">
        <div class="hero-orb orb1"></div>
        <div class="hero-orb orb2"></div>
        <div class="hero-orb orb3"></div>
      </div>
      <div class="hero-content">
        <div class="hero-badge">
          <i class="bi bi-heart-fill"></i> Over 200 happy adoptions
        </div>
        <h1>Find Your <span class="gradient-text">Perfect Companion</span></h1>
        <p>Connect with animals who need a loving home. Browse available pets, report lost animals, or support our mission through donation.</p>
        <div class="hero-actions">
          <a routerLink="/animals" class="btn-primary btn-lg">
            <i class="bi bi-search"></i> Browse Pets
          </a>
          <a routerLink="/reports" class="btn-outline btn-lg">
            <i class="bi bi-megaphone"></i> Lost & Found
          </a>
          <a routerLink="/dashboard/donate" class="btn-accent btn-lg">
            <i class="bi bi-gift"></i> Donate
          </a>
        </div>
      </div>
    </section>

    <!-- ── Stats Section ── -->
    <section class="stats-section">
      <div class="container-custom">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(20,184,166,0.15); color:#14b8a6;">
              <i class="bi bi-heart-fill"></i>
            </div>
            <div class="stat-number">{{ adoptedCount() }}+</div>
            <div class="stat-label">Pets Adopted</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(245,158,11,0.15); color:#f59e0b;">
              <i class="bi bi-search"></i>
            </div>
            <div class="stat-number">{{ reportCount() }}+</div>
            <div class="stat-label">Reports Resolved</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(139,92,246,0.15); color:#a78bfa;">
              <i class="bi bi-people-fill"></i>
            </div>
            <div class="stat-number">500+</div>
            <div class="stat-label">Happy Families</div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background:rgba(239,68,68,0.15); color:#f87171;">
              <i class="bi bi-gift-fill"></i>
            </div>
            <div class="stat-number">{{ availableCount() }}</div>
            <div class="stat-label">Pets Available</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Featured Animals ── -->
    <section class="section">
      <div class="container-custom">
        <div class="section-header">
          <h2>Animals <span class="gradient-text">Waiting for You</span></h2>
          <p>Each of these animals deserves a forever home</p>
        </div>

        @if (loading()) {
          <div class="animals-grid">
            @for (i of [1,2,3,4,5,6]; track i) {
              <div class="skeleton" style="height:300px; border-radius:0.75rem;"></div>
            }
          </div>
        } @else {
          <div class="animals-grid">
            @for (animal of featuredAnimals(); track animal.id) {
              <a [routerLink]="['/animals', animal.id]" class="animal-card">
                <div class="animal-img">
                  @if (animal.images && animal.images.length > 0) {
                    <img [src]="animalService.imageUrl(animal.images[0])" [alt]="animal.name" />
                  } @else {
                    <div class="no-img"><i class="bi bi-heart-fill"></i></div>
                  }
                  <span class="status-badge" [class]="'badge-' + animal.status.toLowerCase()">
                    {{ animal.status }}
                  </span>
                </div>
                <div class="animal-info">
                  <h3>{{ animal.name }}</h3>
                  <p class="animal-meta">
                    <i class="bi bi-tag"></i> {{ animal.speciesName }} ·
                    <i class="bi bi-gender-ambiguous"></i> {{ animal.gender }} ·
                    {{ animal.age }} yr{{ animal.age === 1 ? '' : 's' }}
                  </p>
                  <p class="animal-desc">{{ animal.description | slice:0:80 }}{{ (animal.description || '').length > 80 ? '...' : '' }}</p>
                  <div class="card-footer-action">Adopt me <i class="bi bi-arrow-right"></i></div>
                </div>
              </a>
            }
          </div>
        }

        <div class="text-center mt-8">
          <a routerLink="/animals" class="btn-primary">
            View All Available Pets <i class="bi bi-arrow-right"></i>
          </a>
        </div>
      </div>
    </section>

    <!-- ── How It Works ── -->
    <section class="section how-section">
      <div class="container-custom">
        <div class="section-header">
          <h2>How <span class="gradient-text">It Works</span></h2>
          <p>Three simple steps to find your perfect companion</p>
        </div>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">01</div>
            <div class="step-icon"><i class="bi bi-search"></i></div>
            <h3>Browse & Choose</h3>
            <p>Search through our verified animals and find the one that matches your lifestyle and preferences.</p>
          </div>
          <div class="step-card">
            <div class="step-number">02</div>
            <div class="step-icon"><i class="bi bi-calendar-check"></i></div>
            <h3>Request & Meet</h3>
            <p>Submit an adoption request and book an appointment to meet your future companion.</p>
          </div>
          <div class="step-card">
            <div class="step-number">03</div>
            <div class="step-icon"><i class="bi bi-house-heart"></i></div>
            <h3>Bring Home</h3>
            <p>Once approved, welcome your new family member and start your journey together!</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Lost & Found Preview ── -->
    <section class="section">
      <div class="container-custom">
        <div class="section-header">
          <h2>Recent <span class="gradient-text">Reports</span></h2>
          <p>Help reunite pets with their families</p>
        </div>
        @if (!reportsLoading() && recentReports().length > 0) {
          <div class="reports-grid">
            @for (report of recentReports(); track report.id) {
              <a [routerLink]="['/reports', report.id]" class="report-card">
                <div class="report-type" [class]="report.type === 'LOST' ? 'type-lost' : 'type-found'">
                  <i [class]="report.type === 'LOST' ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill'"></i>
                  {{ report.type }}
                </div>
                <p><strong>{{ report.speciesName }}</strong> — {{ report.location }}</p>
                <p class="text-muted-custom text-sm">{{ report.description | slice:0:80 }}...</p>
              </a>
            }
          </div>
        }
        <div class="text-center mt-6">
          <a routerLink="/reports" class="btn-outline">
            <i class="bi bi-megaphone"></i> View All Reports
          </a>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* Hero */
    .hero { position:relative; min-height:85vh; display:flex; align-items:center; justify-content:center; text-align:center; overflow:hidden; padding:4rem 1.5rem; }
    .hero-bg { position:absolute; inset:0; pointer-events:none; }
    .hero-orb { position:absolute; border-radius:50%; filter:blur(80px); opacity:0.15; }
    .orb1 { width:500px; height:500px; background:#0f766e; top:-100px; left:-150px; }
    .orb2 { width:400px; height:400px; background:#f59e0b; bottom:-80px; right:-100px; }
    .orb3 { width:300px; height:300px; background:#7c3aed; top:50%; left:50%; transform:translate(-50%,-50%); }
    .hero-content { position:relative; z-index:1; max-width:700px; animation:fadeIn 0.6s ease; }
    .hero-badge { display:inline-flex; align-items:center; gap:0.4rem; background:rgba(15,118,110,0.15); border:1px solid rgba(15,118,110,0.3); color:#14b8a6; padding:0.4rem 1rem; border-radius:999px; font-size:0.85rem; font-weight:600; margin-bottom:1.5rem; }
    .hero h1 { font-size:clamp(2.2rem,5vw,3.8rem); font-weight:900; line-height:1.1; margin-bottom:1.25rem; color:#f9fafb; }
    .gradient-text { background:linear-gradient(135deg,#14b8a6,#f59e0b); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
    .hero p { font-size:1.1rem; color:#9ca3af; max-width:560px; margin:0 auto 2rem; line-height:1.7; }
    .hero-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; }
    .btn-lg { padding:0.8rem 2rem !important; font-size:1rem !important; }
    /* Stats */
    .stats-section { padding:3rem 1.5rem; }
    .container-custom { max-width:1280px; margin:0 auto; }
    .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1.5rem; }
    .stat-card { background:rgba(31,41,55,0.6); border:1px solid rgba(255,255,255,0.06); border-radius:1rem; padding:1.75rem; text-align:center; transition:transform 0.2s; }
    .stat-card:hover { transform:translateY(-4px); }
    .stat-icon { width:52px; height:52px; border-radius:1rem; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin:0 auto 1rem; }
    .stat-number { font-size:2.2rem; font-weight:900; color:#f9fafb; line-height:1; }
    .stat-label { font-size:0.875rem; color:#6b7280; margin-top:0.4rem; }
    /* Section */
    .section { padding:4rem 1.5rem; }
    .section-header { text-align:center; margin-bottom:3rem; }
    .section-header h2 { font-size:clamp(1.8rem,3vw,2.5rem); font-weight:800; margin-bottom:0.5rem; }
    .section-header p { color:#6b7280; font-size:1rem; }
    /* Animal Cards */
    .animals-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:1.5rem; }
    .animal-card { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.06); border-radius:1rem; overflow:hidden; text-decoration:none; transition:all 0.25s; display:block; }
    .animal-card:hover { transform:translateY(-6px); box-shadow:0 12px 40px rgba(0,0,0,0.5); border-color:rgba(20,184,166,0.3); }
    .animal-img { position:relative; height:200px; overflow:hidden; }
    .animal-img img { width:100%; height:100%; object-fit:cover; transition:transform 0.4s; }
    .animal-card:hover .animal-img img { transform:scale(1.05); }
    .no-img { height:100%; background:rgba(15,118,110,0.1); display:flex; align-items:center; justify-content:center; font-size:3rem; color:rgba(15,118,110,0.4); }
    .animal-img .status-badge { position:absolute; top:0.75rem; right:0.75rem; }
    .animal-info { padding:1.25rem; }
    .animal-info h3 { font-size:1.1rem; font-weight:700; color:#f9fafb; margin-bottom:0.4rem; }
    .animal-meta { font-size:0.8rem; color:#6b7280; margin-bottom:0.5rem; }
    .animal-meta i { font-size:0.75rem; }
    .animal-desc { font-size:0.85rem; color:#9ca3af; line-height:1.55; margin-bottom:1rem; }
    .card-footer-action { color:#14b8a6; font-size:0.875rem; font-weight:600; display:flex; align-items:center; gap:0.4rem; }
    /* Steps */
    .how-section { background:rgba(15,118,110,0.03); }
    .steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2rem; }
    .step-card { background:rgba(31,41,55,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:1rem; padding:2rem; text-align:center; position:relative; }
    .step-number { position:absolute; top:1.25rem; right:1.25rem; font-size:2.5rem; font-weight:900; color:rgba(20,184,166,0.1); }
    .step-icon { font-size:2rem; color:#14b8a6; margin-bottom:1rem; }
    .step-card h3 { font-size:1.1rem; font-weight:700; color:#f9fafb; margin-bottom:0.5rem; }
    .step-card p { color:#6b7280; font-size:0.875rem; line-height:1.6; }
    /* Reports */
    .reports-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(240px,1fr)); gap:1.25rem; }
    .report-card { background:rgba(31,41,55,0.6); border:1px solid rgba(255,255,255,0.06); border-radius:0.75rem; padding:1.25rem; text-decoration:none; display:block; transition:all 0.2s; }
    .report-card:hover { border-color:rgba(20,184,166,0.3); transform:translateY(-2px); }
    .report-card p { color:#9ca3af; font-size:0.875rem; margin:0.4rem 0; }
    .report-type { display:inline-flex; align-items:center; gap:0.4rem; font-size:0.75rem; font-weight:700; padding:0.25rem 0.65rem; border-radius:999px; margin-bottom:0.5rem; }
    .type-lost { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
    .type-found { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); }
    .text-center { text-align:center; }
    .mt-8 { margin-top:2rem; }
    .mt-6 { margin-top:1.5rem; }
    .text-sm { font-size:0.8rem; }
    @media(max-width:900px) { .stats-grid { grid-template-columns:repeat(2,1fr); } .steps-grid { grid-template-columns:1fr; } }
    @media(max-width:480px) { .stats-grid { grid-template-columns:1fr 1fr; } }
  `]
})
export class HomeComponent implements OnInit {
  readonly animalService = inject(AnimalService);
  private reportService = inject(ReportService);

  loading = signal(true);
  reportsLoading = signal(true);
  featuredAnimals = signal<AnimalResponse[]>([]);
  recentReports = signal<AnimalReportResponse[]>([]);
  adoptedCount = signal(0);
  availableCount = signal(0);
  reportCount = signal(0);

  ngOnInit() {
    this.animalService.getAll({ status: 'AVAILABLE', size: 6 }).subscribe({
      next: p => {
        this.featuredAnimals.set(p.content);
        this.availableCount.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    this.reportService.getAll({ size: 4 }).subscribe({
      next: p => {
        this.recentReports.set(p.content);
        this.reportCount.set(p.totalElements);
        this.reportsLoading.set(false);
      },
      error: () => this.reportsLoading.set(false)
    });
  }
}
