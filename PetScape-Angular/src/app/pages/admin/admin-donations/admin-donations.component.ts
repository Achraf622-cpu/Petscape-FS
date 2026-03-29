import { Component, OnInit, signal, inject } from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-admin-donations',
  standalone: true,
  imports: [DatePipe, CurrencyPipe],
  templateUrl: './admin-donations.component.html',
  styleUrl: './admin-donations.component.css',
})
export class AdminDonationsComponent implements OnInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  data = signal<any>(null);

  ngOnInit() {
    this.load(0);
  }

  load(page: number) {
    this.loading.set(true);
    this.adminService.getDonations(page).subscribe({
      next: (d) => {
        this.data.set(d);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
