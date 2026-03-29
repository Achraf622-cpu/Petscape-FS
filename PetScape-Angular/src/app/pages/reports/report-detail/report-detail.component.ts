import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReportService } from '../../../core/services/report.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { AnimalReportResponse } from '../../../models/models';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.css',
})
export class ReportDetailComponent implements OnInit {
  readonly reportService = inject(ReportService);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private toast = inject(ToastService);

  loading = signal(true);
  report = signal<AnimalReportResponse | null>(null);
  markingResolved = signal(false);

  canMarkAsFound(): boolean {
    const r = this.report();
    const user = this.auth.currentUser();
    if (!r || !user || r.isFound || r.status !== 'PENDING') return false;
    return r.userId === user.id;
  }

  markAsFound() {
    const r = this.report();
    if (!r || !this.canMarkAsFound()) return;
    this.markingResolved.set(true);
    this.reportService.changeStatus(r.id, 'RESOLVED').subscribe({
      next: (updated) => {
        this.report.set(updated);
        this.markingResolved.set(false);
        this.toast.success('Report resolved', 'This lost report is now marked as resolved.');
      },
      error: () => this.markingResolved.set(false),
    });
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.reportService.getById(id).subscribe({
      next: (r) => {
        this.report.set(r);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
