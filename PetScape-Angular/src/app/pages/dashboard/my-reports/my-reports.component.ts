import { Component, OnInit, signal, inject } from '@angular/core';
import { ReportService } from '../../../core/services/report.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnimalReportResponse, Page } from '../../../models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-enter">
      <div class="page-title-row">
        <div>
          <h2><i class="bi bi-megaphone-fill"></i> My Reports</h2>
          <p>Your lost & found submissions</p>
        </div>
        <a routerLink="/reports" class="btn-primary btn-sm">
          <i class="bi bi-search"></i> Browse Reports
        </a>
      </div>

      @if (loading()) {
        <div class="cards-list">@for(i of [1,2,3]; track i){<div class="skeleton" style="height:80px;border-radius:0.75rem;"></div>}</div>
      } @else if (page().content.length === 0) {
        <div class="empty-state">
          <i class="bi bi-megaphone"></i>
          <h3>No reports yet</h3>
          <p>Have you seen a lost animal? Help by creating a report!</p>
        </div>
      } @else {
        <div class="cards-list">
          @for (r of page().content; track r.id) {
            <div class="report-row glass-card">
              <div class="report-type-icon" [class]="r.type === 'LOST' ? 'type-lost' : 'type-found'">
                <i [class]="r.type === 'LOST' ? 'bi bi-exclamation-triangle-fill' : 'bi bi-check-circle-fill'"></i>
              </div>
              <div class="report-info">
                <div class="report-top">
                  <span class="report-species">{{ r.speciesName }}</span>
                  <span class="status-badge" [class]="'badge-' + r.status.toLowerCase()">{{ r.status }}</span>
                </div>
                <p class="report-loc"><i class="bi bi-geo-alt"></i> {{ r.location }}</p>
              </div>
              <div class="report-actions">
                <a [routerLink]="['/reports', r.id]" class="btn-view">View</a>
                <button class="btn-sm-danger" (click)="delete(r.id)" [disabled]="deleting() === r.id">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:0.75rem; }
    h2 { font-size:1.4rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; }
    h2 i { color:#14b8a6; }
    p { color:#6b7280; font-size:0.875rem; }
    .btn-sm { padding:0.4rem 0.9rem !important; font-size:0.82rem !important; }
    .cards-list { display:flex; flex-direction:column; gap:0.65rem; }
    .report-row { padding:1rem 1.25rem; display:flex; align-items:center; gap:1rem; }
    .report-type-icon { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1rem; flex-shrink:0; }
    .type-lost  { background:rgba(239,68,68,0.15); color:#f87171; border:1px solid rgba(239,68,68,0.2); }
    .type-found { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.2); }
    .report-info { flex:1; }
    .report-top { display:flex; align-items:center; gap:0.5rem; margin-bottom:0.3rem; }
    .report-species { color:#f9fafb; font-weight:600; font-size:0.9rem; }
    .report-loc { color:#6b7280; font-size:0.8rem; display:flex; align-items:center; gap:0.3rem; margin:0; }
    .report-actions { display:flex; gap:0.5rem; align-items:center; flex-shrink:0; }
    .btn-view { background:rgba(20,184,166,0.1); border:1px solid rgba(20,184,166,0.25); color:#14b8a6; border-radius:0.4rem; padding:0.3rem 0.75rem; text-decoration:none; font-size:0.8rem; font-weight:600; }
    .btn-sm-danger { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:0.4rem; padding:0.3rem 0.6rem; cursor:pointer; font-size:0.85rem; }
    .btn-sm-danger:disabled { opacity:0.5; cursor:not-allowed; }
    .empty-state { text-align:center; padding:4rem 2rem; }
    .empty-state i { font-size:3rem; color:#374151; display:block; margin-bottom:1rem; }
    .empty-state h3 { color:#6b7280; font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; }
    .empty-state p { color:#4b5563; }
  `]
})
export class MyReportsComponent implements OnInit {
  private service = inject(ReportService);
  private toast = inject(ToastService);

  loading = signal(true);
  deleting = signal<number|null>(null);
  page = signal<Page<AnimalReportResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:10, first:true, last:true });

  ngOnInit() {
    this.service.getMyReports().subscribe({ next: p => { this.page.set(p); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  delete(id: number) {
    if (!confirm('Delete this report?')) return;
    this.deleting.set(id);
    this.service.delete(id).subscribe({
      next: () => { this.deleting.set(null); this.toast.success('Report deleted'); this.ngOnInit(); },
      error: e => { this.deleting.set(null); this.toast.error('Error', e.error?.message); }
    });
  }
}
