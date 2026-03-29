import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { AnimalService } from '../../core/services/animal.service';
import { ReportService } from '../../core/services/report.service';
import { AnimalResponse, AnimalReportResponse } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, SlicePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  readonly animalService = inject(AnimalService);
  readonly reportService = inject(ReportService);

  loading = signal(true);
  reportsLoading = signal(true);
  featuredAnimals = signal<AnimalResponse[]>([]);
  recentReports = signal<AnimalReportResponse[]>([]);
  adoptedCount = signal(0);
  availableCount = signal(0);
  reportCount = signal(0);

  ngOnInit() {
    this.animalService.getAll({ status: 'AVAILABLE', size: 6 }).subscribe({
      next: (p) => {
        this.featuredAnimals.set(p.content);
        this.availableCount.set(p.totalElements);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    this.reportService.getAll({ size: 4, status: 'PENDING' }).subscribe({
      next: (p) => {
        this.recentReports.set(p.content);
        this.reportCount.set(p.totalElements);
        this.reportsLoading.set(false);
      },
      error: () => this.reportsLoading.set(false),
    });
  }
}
