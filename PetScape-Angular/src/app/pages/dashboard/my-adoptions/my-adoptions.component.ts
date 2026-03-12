import { Component, OnInit, signal, inject } from '@angular/core';
import { AdoptionRequestService } from '../../../core/services/adoption-request.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdoptionRequestResponse, Page } from '../../../models/models';
import { RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-my-adoptions',
  standalone: true,
  imports: [RouterLink, DatePipe, SlicePipe],
  template: `
    <div class="page-enter">
      <div class="page-title">
        <h2><i class="bi bi-heart-fill"></i> My Adoption Requests</h2>
        <p>Track the status of your pet adoption requests</p>
      </div>

      @if (loading()) {
        <div class="cards-list">
          @for (i of [1,2,3]; track i) {
            <div class="skeleton" style="height:100px;border-radius:0.75rem;"></div>
          }
        </div>
      } @else if (page().content?.length === 0) {
        <div class="empty-state">
          <i class="bi bi-heart"></i>
          <h3>No adoption requests yet</h3>
          <p>Browse our animals and submit your first adoption request!</p>
          <a routerLink="/animals" class="btn-primary">Browse Pets</a>
        </div>
      } @else {
        <div class="cards-list">
          @for (req of page().content; track req.id) {
            <div class="req-card glass-card">
              <div class="req-info">
                <h4>{{ req.animalName }}</h4>
                <p class="text-muted-custom">{{ req.message | slice:0:100 }}{{ (req.message || '').length > 100 ? '...' : '' }}</p>
                <p class="req-date text-muted-custom">{{ req.createdAt | date:'MMM d, y' }}</p>
              </div>
              <div class="req-actions">
                <span class="status-badge" [class]="'badge-' + req.status.toLowerCase()">{{ req.status }}</span>
                @if (req.status === 'PENDING') {
                  <button class="btn-sm-danger" (click)="cancel(req.id)" [disabled]="cancelling() === req.id">
                    @if (cancelling() === req.id) {
                      <span class="spinner-border spinner-border-sm"></span>
                    } @else {
                      <i class="bi bi-x-circle"></i> Cancel
                    }
                  </button>
                }
              </div>
            </div>
          }
        </div>
        @if (page().totalPages > 1) {
          <div class="pag-wrap">
            <button class="page-btn" [disabled]="page().first" (click)="load(page().number - 1)"><i class="bi bi-chevron-left"></i></button>
            <span class="page-info">Page {{ page().number + 1 }} of {{ page().totalPages }}</span>
            <button class="page-btn" [disabled]="page().last" (click)="load(page().number + 1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page-title { margin-bottom:1.5rem; }
    .page-title h2 { font-size:1.4rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; }
    .page-title h2 i { color:#14b8a6; }
    .page-title p { color:#6b7280; font-size:0.875rem; }
    .cards-list { display:flex; flex-direction:column; gap:0.75rem; }
    .req-card { padding:1.25rem; display:flex; justify-content:space-between; align-items:center; gap:1rem; }
    .req-info h4 { font-size:1rem; font-weight:700; color:#f9fafb; margin-bottom:0.3rem; }
    .req-info p { font-size:0.8rem; margin-bottom:0.15rem; }
    .req-date { font-size:0.75rem !important; }
    .req-actions { display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem; flex-shrink:0; }
    .btn-sm-danger { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:0.4rem; padding:0.3rem 0.65rem; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; gap:0.35rem; transition:all 0.2s; }
    .btn-sm-danger:hover:not(:disabled) { background:rgba(239,68,68,0.2); }
    .btn-sm-danger:disabled { opacity:0.6; cursor:not-allowed; }
    .empty-state { text-align:center; padding:4rem 2rem; }
    .empty-state i { font-size:3rem; color:#374151; display:block; margin-bottom:1rem; }
    .empty-state h3 { color:#6b7280; font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; }
    .empty-state p { color:#4b5563; margin-bottom:1.5rem; }
    .pag-wrap { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1.5rem; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-info { color:#6b7280; font-size:0.875rem; }
  `]
})
export class MyAdoptionsComponent implements OnInit {
  private service = inject(AdoptionRequestService);
  private toast = inject(ToastService);

  loading = signal(true);
  page = signal<Page<AdoptionRequestResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:10, first:true, last:true });
  cancelling = signal<number | null>(null);

  ngOnInit() { this.load(0); }

  load(p: number) {
    this.loading.set(true);
    this.service.getMyRequests(p).subscribe({
      next: data => { this.page.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  cancel(id: number) {
    this.cancelling.set(id);
    this.service.cancel(id).subscribe({
      next: () => { this.cancelling.set(null); this.toast.success('Request cancelled'); this.load(0); },
      error: (e) => { this.cancelling.set(null); this.toast.error('Error', e.error?.message); }
    });
  }
}
