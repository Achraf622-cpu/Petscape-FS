import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { AnimalReportResponse } from '../../../models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    @if (loading()) {
      <div class="page-pad">
        <div class="skeleton" style="height:380px;border-radius:1rem;"></div>
      </div>
    } @else if (report()) {
      <div class="detail-page page-enter">
        <div class="container-custom">
          <a routerLink="/reports" class="back-link"><i class="bi bi-arrow-left"></i> Back to Reports</a>
          <div class="detail-grid">
            <div class="img-col">
              @if (report()!.image) {
                <img [src]="reportService.imageUrl(report()!.image)" [alt]="report()!.speciesName" class="detail-img" />
              } @else {
                <div class="no-img"><i class="bi bi-camera"></i></div>
              }
            </div>
            <div class="info-col">
              <div class="type-row">
                <span class="type-pill" [class]="report()!.type === 'LOST' ? 'type-lost' : 'type-found'">
                  <i [class]="report()!.type === 'LOST' ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill'"></i>
                  {{ report()!.type }}
                </span>
                <span class="status-badge" [class]="'badge-' + report()!.status.toLowerCase()">{{ report()!.status }}</span>
              </div>
              <h1>{{ report()!.speciesName }} — {{ report()!.type === 'LOST' ? 'Missing' : 'Found' }} Animal</h1>
              <div class="detail-info-list">
                <div class="info-item">
                  <i class="bi bi-geo-alt-fill"></i>
                  <div><strong>Location</strong><p>{{ report()!.location }}</p></div>
                </div>
                <div class="info-item">
                  <i class="bi bi-calendar3"></i>
                  <div><strong>Reported</strong><p>{{ report()!.createdAt | date:'MMMM d, y' }}</p></div>
                </div>
                <div class="info-item">
                  <i class="bi bi-person-fill"></i>
                  <div><strong>Reported by</strong><p>{{ report()!.userFullName }}</p></div>
                </div>
                @if (report()!.contactInfo) {
                  <div class="info-item">
                    <i class="bi bi-telephone-fill"></i>
                    <div><strong>Contact</strong><p>{{ report()!.contactInfo }}</p></div>
                  </div>
                }
              </div>
              <div class="description-box">
                <h3>Description</h3>
                <p>{{ report()!.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page-pad { padding:3rem; }
    .detail-page { padding:2rem 0; }
    .container-custom { max-width:1100px; margin:0 auto; padding:0 1.5rem; }
    .back-link { color:#14b8a6; text-decoration:none; font-size:0.9rem; display:flex; align-items:center; gap:0.4rem; margin-bottom:1.5rem; }
    .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:2.5rem; align-items:start; }
    .detail-img { width:100%; border-radius:1rem; object-fit:cover; max-height:400px; }
    .no-img { height:300px; background:rgba(31,41,55,0.5); border-radius:1rem; display:flex; align-items:center; justify-content:center; font-size:5rem; color:#374151; }
    .type-row { display:flex; gap:0.5rem; margin-bottom:1rem; }
    .type-pill { display:inline-flex; align-items:center; gap:0.3rem; border-radius:999px; padding:0.3rem 0.8rem; font-size:0.85rem; font-weight:700; }
    .type-lost  { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
    .type-found { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); }
    .info-col h1 { font-size:1.75rem; font-weight:800; color:#f9fafb; margin-bottom:1.25rem; }
    .detail-info-list { display:flex; flex-direction:column; gap:0.85rem; margin-bottom:1.5rem; }
    .info-item { display:flex; gap:0.75rem; align-items:flex-start; }
    .info-item i { font-size:1rem; color:#14b8a6; margin-top:2px; flex-shrink:0; }
    .info-item strong { color:#d1d5db; font-size:0.8rem; display:block; margin-bottom:0.15rem; }
    .info-item p { color:#9ca3af; font-size:0.875rem; margin:0; }
    .description-box { background:rgba(31,41,55,0.5); border:1px solid rgba(255,255,255,0.06); border-radius:0.75rem; padding:1.25rem; }
    .description-box h3 { color:#d1d5db; font-size:0.9rem; font-weight:600; margin-bottom:0.5rem; }
    .description-box p { color:#9ca3af; font-size:0.875rem; line-height:1.7; margin:0; }
    @media(max-width:768px) { .detail-grid { grid-template-columns:1fr; } }
  `]
})
export class ReportDetailComponent implements OnInit {
  readonly reportService = inject(ReportService);
  private route = inject(ActivatedRoute);

  loading = signal(true);
  report = signal<AnimalReportResponse | null>(null);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reportService.getById(id).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
