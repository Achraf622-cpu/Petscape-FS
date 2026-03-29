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
  templateUrl: './admin-appointments.component.html',
  styleUrl: './admin-appointments.component.css',
})
export class AdminAppointmentsComponent implements OnInit {
  private adminService = inject(AdminService);
  private apptService = inject(AppointmentService);
  private toast = inject(ToastService);

  loading = signal(true);
  page = signal<Page<AppointmentResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 15,
    first: true,
    last: true,
  });

  ngOnInit() {
    this.load(0);
  }

  load(p: number) {
    this.loading.set(true);
    this.adminService.getAppointments(p).subscribe({
      next: (d) => {
        this.page.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  updateStatus(id: number, status: string) {
    this.apptService.updateStatus(id, status).subscribe({
      next: () => {
        this.toast.success(`Status updated to ${status.toLowerCase()}`);
        this.load(this.page().number);
      },
      error: (e) => this.toast.error('Error', e.error?.message),
    });
  }
}
