import { Component, OnInit, signal, inject } from '@angular/core';
import { AppointmentService } from '../../../core/services/appointment.service';
import { ToastService } from '../../../core/services/toast.service';
import { AppointmentResponse, Page } from '../../../models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './my-appointments.component.html',
  styleUrl: './my-appointments.component.css',
})
export class MyAppointmentsComponent implements OnInit {
  private service = inject(AppointmentService);
  private toast = inject(ToastService);

  loading = signal(true);
  page = signal<Page<AppointmentResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
  });
  cancelling = signal<number | null>(null);

  ngOnInit() {
    this.service.getMyAppointments().subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  cancel(id: number) {
    this.cancelling.set(id);
    this.service.cancel(id).subscribe({
      next: () => {
        this.cancelling.set(null);
        this.toast.success('Appointment cancelled');
        this.ngOnInit();
      },
      error: (e) => {
        this.cancelling.set(null);
        this.toast.error('Error', e.error?.message);
      },
    });
  }
}
