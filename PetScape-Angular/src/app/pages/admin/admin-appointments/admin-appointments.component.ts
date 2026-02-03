import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ToastService } from '../../../core/services/toast.service';
import { Page, AppointmentResponse } from '../../../models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-enter">
      <h2 class="admin-page-title"><i class="bi bi-calendar-fill"></i> Appointments</h2>
      @if (loading()) {
        <div class="skeleton" style="height:400px;border-radius:0.75rem;"></div>
      } @else {
        <div class="table-wrap glass-card">
          <table class="table table-hover mb-0">
            <thead>
              <tr><th>#</th><th>User</th><th>Animal</th><th>Date</th><th>Slot</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (a of page().content; track a.id) {
                <tr>
                  <td class="text-muted-custom">{{ a.id }}</td>
                  <td>{{ a.userFullName }}</td>
                  <td><strong>{{ a.animalName }}</strong></td>
                  <td>{{ a.date | date:'MMM d, y' }}</td>
                  <td>{{ a.timeSlot }}</td>
                  <td><span class="status-badge" [class]="'badge-' + a.status.toLowerCase()">{{ a.status }}</span></td>
                  <td>
                    @if (a.status === 'PENDING') {
                      <button class="btn-action confirm" (click)="updateStatus(a.id, 'CONFIRMED')">
                        <i class="bi bi-check-lg"></i> Confirm
                      </button>
                    }
                    @if (a.status !== 'CANCELLED' && a.status !== 'COMPLETED') {
                      <button class="btn-action cancel" (click)="updateStatus(a.id, 'CANCELLED')">
                        <i class="bi bi-x-lg"></i>
                      </button>
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
    .admin-page-title { font-size:1.5rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.6rem; margin-bottom:1.5rem; } .admin-page-title i { color:#a78bfa; }
    .table-wrap { overflow-x:auto; }
    .btn-action { border:none; border-radius:0.4rem; padding:0.3rem 0.65rem; cursor:pointer; font-size:0.78rem; font-weight:600; display:inline-flex; align-items:center; gap:0.3rem; margin-right:0.3rem; }
    .confirm { background:rgba(16,185,129,0.15); color:#34d399; border:1px solid rgba(16,185,129,0.3); }
    .cancel  { background:rgba(239,68,68,0.12); color:#f87171; border:1px solid rgba(239,68,68,0.3); }
    .pag-wrap { display:flex; align-items:center; gap:0.75rem; justify-content:center; margin-top:1.25rem; }
    .page-btn { background:rgba(31,41,55,0.7); border:1px solid rgba(255,255,255,0.07); color:#9ca3af; border-radius:0.5rem; width:36px; height:36px; display:flex; align-items:center; justify-content:center; cursor:pointer; }
    .page-btn:disabled { opacity:0.35; cursor:not-allowed; }
    .page-info { color:#6b7280; font-size:0.875rem; }
    .text-muted-custom { color:#6b7280; }
  `]
})
export class AdminAppointmentsComponent implements OnInit {
  private adminService = inject(AdminService);
  private apptService = inject(AppointmentService);
  private toast = inject(ToastService);

  loading = signal(true);
  page = signal<Page<AppointmentResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:15, first:true, last:true });

  ngOnInit() { this.load(0); }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getAppointments(p).subscribe({ next: d => { this.page.set(d); this.loading.set(false); }, error: () => this.loading.set(false) });
  }

  updateStatus(id: number, status: string) {
    this.apptService.updateStatus(id, status).subscribe({
      next: () => { this.toast.success(`Status updated to ${status.toLowerCase()}`); this.load(this.page().number); },
      error: e => this.toast.error('Error', e.error?.message)
    });
  }
}
