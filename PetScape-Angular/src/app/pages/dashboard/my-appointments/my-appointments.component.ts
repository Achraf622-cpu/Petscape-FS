import { Component, OnInit, signal, inject } from '@angular/core';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppointmentResponse, Page } from '../../../models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="page-enter">
      <div class="page-title">
        <h2><i class="bi bi-calendar-fill"></i> My Appointments</h2>
        <p>View and manage your scheduled visits</p>
      </div>
      @if (loading()) {
        <div class="cards-list">
          @for (i of [1,2,3]; track i) { <div class="skeleton" style="height:90px;border-radius:0.75rem;"></div> }
        </div>
      } @else if (page().content?.length === 0) {
        <div class="empty-state">
          <i class="bi bi-calendar-x"></i>
          <h3>No appointments yet</h3>
          <p>Book a visit to meet a pet before adopting!</p>
        </div>
      } @else {
        <div class="cards-list">
          @for (appt of page().content; track appt.id) {
            <div class="appt-card glass-card">
              <div class="appt-date-block">
                <div class="appt-month">{{ appt.dateTime | date:'MMM' }}</div>
                <div class="appt-day">{{ appt.dateTime | date:'d' }}</div>
              </div>
              <div class="appt-info">
                <h4>Visit with <strong>{{ appt.animalName }}</strong></h4>
                <p><i class="bi bi-clock"></i> {{ appt.dateTime | date:'shortTime' }}</p>
                @if (appt.notes) { <p class="text-muted-custom">{{ appt.notes }}</p> }
              </div>
              <div class="appt-actions">
                <span class="status-badge" [class]="'badge-' + appt.status.toLowerCase()">{{ appt.status }}</span>
                @if (appt.status === 'PENDING' || appt.status === 'CONFIRMED') {
                  <button class="btn-sm-danger" (click)="cancel(appt.id)" [disabled]="cancelling() === appt.id">
                    <i class="bi bi-x-circle"></i> Cancel
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-title { margin-bottom:1.5rem; } .page-title h2 { font-size:1.4rem; font-weight:800; color:#f9fafb; display:flex; align-items:center; gap:0.5rem; } .page-title h2 i { color:#14b8a6; } .page-title p { color:#6b7280; font-size:0.875rem; }
    .cards-list { display:flex; flex-direction:column; gap:0.75rem; }
    .appt-card { padding:1.25rem; display:flex; align-items:center; gap:1.25rem; }
    .appt-date-block { background:rgba(15,118,110,0.15); border:1px solid rgba(15,118,110,0.2); border-radius:0.75rem; padding:0.6rem 0.9rem; text-align:center; flex-shrink:0; min-width:60px; }
    .appt-month { color:#14b8a6; font-size:0.7rem; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; }
    .appt-day { color:#f9fafb; font-size:1.75rem; font-weight:900; line-height:1; }
    .appt-info { flex:1; }
    .appt-info h4 { font-size:0.95rem; color:#f9fafb; margin-bottom:0.3rem; }
    .appt-info p { font-size:0.8rem; color:#6b7280; margin:0.15rem 0; }
    .appt-actions { display:flex; flex-direction:column; align-items:flex-end; gap:0.5rem; flex-shrink:0; }
    .btn-sm-danger { background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); color:#f87171; border-radius:0.4rem; padding:0.3rem 0.65rem; cursor:pointer; font-size:0.8rem; display:flex; align-items:center; gap:0.35rem; }
    .btn-sm-danger:disabled { opacity:0.6; cursor:not-allowed; }
    .empty-state { text-align:center; padding:4rem 2rem; }
    .empty-state i { font-size:3rem; color:#374151; display:block; margin-bottom:1rem; }
    .empty-state h3 { color:#6b7280; font-size:1.2rem; font-weight:700; margin-bottom:0.5rem; }
    .empty-state p { color:#4b5563; }
  `]
})
export class MyAppointmentsComponent implements OnInit {
  private service = inject(AppointmentService);
  private toast = inject(ToastService);

  loading = signal(true);
  page = signal<Page<AppointmentResponse>>({ content:[], totalElements:0, totalPages:0, number:0, size:10, first:true, last:true });
  cancelling = signal<number | null>(null);

  ngOnInit() { this.service.getMyAppointments().subscribe({ next: p => { this.page.set(p); this.loading.set(false); }, error: () => this.loading.set(false) }); }

  cancel(id: number) {
    this.cancelling.set(id);
    this.service.cancel(id).subscribe({
      next: () => { this.cancelling.set(null); this.toast.success('Appointment cancelled'); this.ngOnInit(); },
      error: (e) => { this.cancelling.set(null); this.toast.error('Error', e.error?.message); }
    });
  }
}
