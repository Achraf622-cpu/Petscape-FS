import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [DatePipe, SlicePipe],
  template: `
    <div class="page-enter">
      <h2 class="admin-page-title"><i class="bi bi-journal-text"></i> Audit Logs</h2>
      @if (loading()) {
        <div class="skeleton" style="height:400px;border-radius:0.75rem;"></div>
      } @else {
        <div class="table-wrap glass-card">
          <table class="table table-hover mb-0">
            <thead>
              <tr><th>Time</th><th>User</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Details</th></tr>
            </thead>
            <tbody>
              @for (log of logs(); track log.id) {
                <tr>
                  <td class="text-muted-custom text-sm">{{ log.createdAt | date:'MMM d, HH:mm' }}</td>
                  <td>{{ log.userEmail ?? '—' }}</td>
                  <td><span class="action-badge" [class]="getActionClass(log.action)">{{ log.action }}</span></td>
                  <td class="text-muted-custom">{{ log.entityType }}</td>
                  <td class="text-muted-custom">{{ log.entityId }}</td>
                  <td class="text-muted-custom text-sm">{{ log.details | slice:0:60 }}{{ log.details?.length > 60 ? '...' : '' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (totalPages() > 1) {
          <div class="pag-wrap">
            <button class="page-btn" [disabled]="currentPage() === 0" (click)="load(currentPage()-1)"><i class="bi bi-chevron-left"></i></button>
            <span class="page-info">{{ currentPage()+1 }} / {{ totalPages() }}</span>
            <button class="page-btn" [disabled]="currentPage() === totalPages()-1" (click)="load(currentPage()+1)"><i class="bi bi-chevron-right"></i></button>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .admin-page-title { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.6rem; margin-bottom:1.5rem; } .admin-page-title i { color:#a78bfa; }
    .table-wrap { overflow-x:auto; }
    .text-muted-custom { color:#6b7280; }
    .text-sm { font-size:0.78rem; }
    .action-badge { border-radius:999px; padding:0.15rem 0.6rem; font-size:0.72rem; font-weight:700; }
    .action-create { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); }
    .action-update { background:rgba(59,130,246,0.15); color:#60a5fa; border:1px solid rgba(59,130,246,0.3); }
    .action-delete { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
    .action-default{ background:rgba(255,255,255,0.05); color:#9ca3af; border:1px solid rgba(255,255,255,0.08); }
    .pag-wrap { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1.25rem; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-info { color:#6b7280; font-size:0.875rem; }
  `]
})
export class AdminAuditLogsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  logs = signal<any[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);

  ngOnInit() { this.load(0); }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getAuditLogs({ page: p }).subscribe({
      next: d => {
        this.logs.set(d.content);
        this.currentPage.set(d.number);
        this.totalPages.set(d.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  getActionClass(action: string): string {
    if (!action) return 'action-default';
    const a = action.toUpperCase();
    if (a.includes('CREATE') || a.includes('REGISTER') || a.includes('INSERT')) return 'action-create';
    if (a.includes('UPDATE') || a.includes('EDIT') || a.includes('STATUS')) return 'action-update';
    if (a.includes('DELETE') || a.includes('REMOVE') || a.includes('CANCEL')) return 'action-delete';
    return 'action-default';
  }
}
