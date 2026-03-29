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
  templateUrl: './admin-adoptions.component.html',
  styleUrl: './admin-adoptions.component.css',
})
export class AdminAdoptionsComponent implements OnInit {
  private adminService = inject(AdminService);
  private adoptService = inject(AdoptionRequestService);
  private toast = inject(ToastService);

  loading = signal(true);
  processing = signal<number | null>(null);
  page = signal<Page<AdoptionRequestResponse>>({
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
    this.adminService.getAdoptions(p).subscribe({
      next: (data) => {
        this.page.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  changeStatus(id: number, status: string) {
    this.processing.set(id);
    this.adoptService.updateStatus(id, status).subscribe({
      next: () => {
        this.processing.set(null);
        this.toast.success(`Adoption ${status.toLowerCase()}`);
        this.load(this.page().number);
      },
      error: (e) => {
        this.processing.set(null);
        this.toast.error('Error', e.error?.message);
      },
    });
  }
}
