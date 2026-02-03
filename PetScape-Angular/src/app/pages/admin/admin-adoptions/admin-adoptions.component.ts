import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { AdoptionRequestService } from '../../../core/services/adoption-request.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdoptionRequestResponse, Page } from '../../../models/models';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-admin-adoptions',
  standalone: true,
  imports: [SlicePipe],
  template: `
    <div class="page-enter">
      <h2 class="admin-page-title"><i class="bi bi-people-fill"></i> Adoption Requests</h2>
      @if (loading()) {
        <div class="skeleton-list">@for(i of [1,2,3,4,5]; track i){<div class="skeleton" style="height:70px;border-radius:0.75rem;"></div>}</div>
      } @else {
        <div class="table-wrap glass-card">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th><th>Applicant</th><th>Animal</th><th>Message</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (req of page().content; track req.id) {
                <tr>
                  <td class="text-muted-custom">#{{ req.id }}</td>
                  <td>{{ req.userFullName }}</td>
                  <td><strong>{{ req.animalName }}</strong></td>
                  <td class="text-muted-custom">{{ req.message | slice:0:50 }}...</td>
                  <td><span class="status-badge" [class]="'badge-' + req.status.toLowerCase()">{{ req.status }}</span></td>
                  <td>
                    @if (req.status === 'PENDING') {
                      <button class="btn-action approve" (click)="changeStatus(req.id, 'APPROVED')" [disabled]="processing() === req.id">
                        <i class="bi bi-check-lg"></i> Approve
                      </button>
                      <button class="btn-action reject" (click)="changeStatus(req.id, 'REJECTED')" [disabled]="processing() === req.id">
                        <i class="bi bi-x-lg"></i> Reject
                      </button>
                    } @else {
                      <span class="text-muted-custom text-sm">—</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (page().totalPages > 1) {
          <div class="pag-wrap">
            <button class="page-btn" [disabled]="page().first" (click)="load(page().number-1)"><i class="bi bi-chevron-left"></i></button>
            <span class="page-info">{{ page().number+1 }} / {{ page().totalPages }}</span>
            <button class="page-btn" [disabled]="page().last" (click)="load(page().number+1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .admin-page-title { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.6rem; margin-bottom:1.5rem; }
    .admin-page-title i { color:#a78bfa; }
    .table-wrap { overflow-x:auto; }
    .text-sm { font-size:0.8rem; }
    .btn-action { border:none; border-radius:0.4rem; padding:0.3rem 0.65rem; cursor:pointer; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:0.3rem; margin-right:0.35rem; transition:all 0.2s; }
    .approve { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); }
    .approve:hover { background:rgba(16,185,129,0.25); }
    .reject { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
    .reject:hover { background:rgba(239,68,68,0.22); }
    .btn-action:disabled { opacity:0.5; cursor:not-allowed; }
    .skeleton-list { display:flex; flex-direction:column; gap:0.5rem; }
    .pag-wrap { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1.25rem; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-info { color:#6b7280; font-size:0.875rem; }
  `]
})
export class AdminAdoptionsComponent implements OnInit {
  private adminService = inject(AdminService);
  private adoptService = inject(AdoptionRequestService);
  private toast = inject(ToastService);

  loading = signal(true);
  processing = signal<number | null>(null);
  page = signal<Page<AdoptionRequestResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:15, first:true, last:true });

  ngOnInit() { this.load(0); }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getAdoptions(p).subscribe({
      next: data => { this.page.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  changeStatus(id: number, status: string) {
    this.processing.set(id);
    this.adoptService.updateStatus(id, status).subscribe({
      next: () => { this.processing.set(null); this.toast.success(`Adoption ${status.toLowerCase()}`); this.load(this.page().number); },
      error: (e) => { this.processing.set(null); this.toast.error('Error', e.error?.message); }
    });
  }
}
