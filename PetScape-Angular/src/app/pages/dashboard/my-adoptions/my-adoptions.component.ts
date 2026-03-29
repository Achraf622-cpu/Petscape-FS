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
  templateUrl: './my-adoptions.component.html',
  styleUrl: './my-adoptions.component.css',
})
export class MyAdoptionsComponent implements OnInit {
  private service = inject(AdoptionRequestService);
  private toast = inject(ToastService);

  loading = signal(true);
  page = signal<Page<AdoptionRequestResponse>>({
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
    this.load(0);
  }

  load(p: number) {
    this.loading.set(true);
    this.service.getMyRequests(p).subscribe({
      next: (data) => {
        this.page.set(data);
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
        this.toast.success('Request cancelled');
        this.load(0);
      },
      error: (e) => {
        this.cancelling.set(null);
        this.toast.error('Error', e.error?.message);
      },
    });
  }
}
