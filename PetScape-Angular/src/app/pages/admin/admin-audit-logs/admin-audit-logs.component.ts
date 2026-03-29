import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { DatePipe, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-admin-audit-logs',
  standalone: true,
  imports: [DatePipe, SlicePipe],
  templateUrl: './admin-audit-logs.component.html',
  styleUrl: './admin-audit-logs.component.css',
})
export class AdminAuditLogsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  logs = signal<any[]>([]);
  currentPage = signal(0);
  totalPages = signal(0);

  ngOnInit() {
    this.load(0);
  }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getAuditLogs({ page: p }).subscribe({
      next: (d) => {
        this.logs.set(d.content);
        this.currentPage.set(d.number);
        this.totalPages.set(d.totalPages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  getActionClass(action: string): string {
    if (!action) return 'action-default';
    const a = action.toUpperCase();
    if (a.includes('CREATE') || a.includes('REGISTER') || a.includes('INSERT'))
      return 'action-create';
    if (a.includes('UPDATE') || a.includes('EDIT') || a.includes('STATUS')) return 'action-update';
    if (a.includes('DELETE') || a.includes('REMOVE') || a.includes('CANCEL'))
      return 'action-delete';
    return 'action-default';
  }
}
