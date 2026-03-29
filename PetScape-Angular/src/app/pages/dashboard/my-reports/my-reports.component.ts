import { Component, OnInit, signal, inject } from '@angular/core';
import { ReportService } from '../../../core/services/report.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnimalReportResponse, Page } from '../../../models/models';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-reports',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-reports.component.html',
  styleUrl: './my-reports.component.css',
})
export class MyReportsComponent implements OnInit {
  private service = inject(ReportService);
  private toast = inject(ToastService);

  loading = signal(true);
  deleting = signal<number | null>(null);
  page = signal<Page<AnimalReportResponse>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: 0,
    size: 10,
    first: true,
    last: true,
  });

  ngOnInit() {
    this.service.getMyReports().subscribe({
      next: (p) => {
        this.page.set(p);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  delete(id: number) {
    if (!confirm('Delete this report?')) return;
    this.deleting.set(id);
    this.service.delete(id).subscribe({
      next: () => {
        this.deleting.set(null);
        this.toast.success('Report deleted');
        this.ngOnInit();
      },
      error: (e) => {
        this.deleting.set(null);
        this.toast.error('Error', e.error?.message);
      },
    });
  }
}
