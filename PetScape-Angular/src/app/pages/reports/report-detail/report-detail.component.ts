import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
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
              <div class="detail-img-wrap">
                @if (report()!.image) {
                  <img [src]="reportService.imageUrl(report()!.image)" [alt]="report()!.speciesName" class="detail-img" />
                } @else {
                  <div class="no-img"><i class="bi bi-camera"></i></div>
                }
              </div>
            </div>
            <div class="info-col">
              <div class="type-row">
                <span class="type-pill" [class]="!report()!.isFound ? 'type-lost' : 'type-found'">
                  <i [class]="!report()!.isFound ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill'"></i>
                  {{ !report()!.isFound ? 'LOST' : 'FOUND' }}
                </span>
                <span class="status-badge" [class]="'badge-' + report()!.status.toLowerCase()">{{ report()!.status }}</span>
              </div>
              <h1>{{ report()!.speciesName }} — {{ !report()!.isFound ? 'Missing' : 'Found' }} Animal</h1>
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
                <div class="info-item">
                  <i class="bi bi-telephone-fill"></i>
                  <div><strong>Contact</strong><p>{{ report()!.contactName }} · {{ report()!.contactEmail }} · {{ report()!.contactPhone }}</p></div>
                </div>
              </div>
              @if (canMarkAsFound()) {
                <div class="mark-found-box">
                  <p>You reported this animal as lost. Has your pet been found?</p>
                  <button class="btn-primary" (click)="markAsFound()" [disabled]="markingResolved()">
                    @if (markingResolved()) { <span class="spinner-border spinner-border-sm me-2"></span> }
                    <i class="bi bi-check-circle-fill"></i> I found my pet — mark as resolved
                  </button>
                </div>
              }
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
    .detail-img-wrap { position:relative; border-radius:1rem; overflow:hidden; aspect-ratio:4/3; background:#1f2937; }
    .detail-img { display:block; width:100%; height:100%; object-fit:cover; object-position:center; }
    .no-img { position:absolute; inset:0; background:rgba(31,41,55,0.5); display:flex; align-items:center; justify-content:center; font-size:5rem; color:#374151; }
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
    .mark-found-box { background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:0.75rem; padding:1.25rem; margin-bottom:1.5rem; }
    .mark-found-box p { color:#9ca3af; font-size:0.9rem; margin:0 0 0.75rem; }
    .mark-found-box .btn-primary { display:inline-flex; align-items:center; gap:0.5rem; }
    @media(max-width:768px) { .detail-grid { grid-template-columns:1fr; } }
  `]
})
export class ReportDetailComponent implements OnInit {
  readonly reportService = inject(ReportService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(true);
  report = signal<AnimalReportResponse | null>(null);
  markingResolved = signal(false);

  canMarkAsFound(): boolean {
    const r = this.report();
    const user = this.auth.currentUser();
    if (!r || !user || r.isFound || r.status !== 'PENDING') return false;
    return r.userId === user.id;
  }

  markAsFound() {
    const r = this.report();
    if (!r || !this.canMarkAsFound()) return;
    this.markingResolved.set(true);
    this.reportService.changeStatus(r.id, 'RESOLVED').subscribe({
      next: updated => {
        this.report.set(updated);
        this.markingResolved.set(false);
        this.toast.success('Report resolved', 'This lost report is now marked as resolved.');
      },
      error: () => this.markingResolved.set(false)
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reportService.getById(id).subscribe({
      next: r => { this.report.set(r); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
