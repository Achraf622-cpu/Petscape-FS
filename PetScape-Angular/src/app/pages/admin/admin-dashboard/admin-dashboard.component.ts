import {
  Component,
  OnInit,
  signal,
  inject,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { AdminService } from '../../../core/services/admin.service';
import { DatePipe } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {
  private adminService = inject(AdminService);

  loading = signal(true);
  stats = signal<Record<string, any>>({});

  @ViewChild('adoptionsChart') adoptionsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('speciesChart') speciesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('donationsChart') donationsChartRef!: ElementRef<HTMLCanvasElement>;

  private chartsReady = false;

  ngOnInit() {
    this.adminService.getDashboard().subscribe({
      next: (d) => {
        this.stats.set(d);
        this.loading.set(false);

        setTimeout(() => this.buildCharts(), 100);
      },
      error: () => {
        this.loading.set(false);
        this.stats.set(this.mockStats());
        setTimeout(() => this.buildCharts(), 100);
      },
    });
  }

  ngAfterViewInit() {
    this.chartsReady = true;
  }

  private buildCharts() {
    const s = this.stats();
    if (!s || !this.chartsReady) return;

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const adoptionsByMonth = s['adoptionsByMonth'] ?? Array(12).fill(0);
    const speciesData = s['animalsBySpecies'] ?? {
      Dogs: 12,
      Cats: 20,
      Birds: 5,
      Rabbits: 3,
      Reptiles: 2,
    };
    const donationsByMonth = s['donationsByMonth'] ?? Array(12).fill(0);

    if (this.adoptionsChartRef) {
      new Chart(this.adoptionsChartRef.nativeElement, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Adoptions',
              data: adoptionsByMonth,
              borderColor: '#14b8a6',
              backgroundColor: 'rgba(20,184,166,0.1)',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#14b8a6',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: this.lineBarOptions('#14b8a6'),
      });
    }

    // Doughnut — Species breakdown
    if (this.speciesChartRef) {
      const labels = Object.keys(speciesData);
      const values = Object.values(speciesData) as number[];
      const colors = ['#14b8a6', '#f59e0b', '#a78bfa', '#f87171', '#34d399', '#60a5fa'];
      new Chart(this.speciesChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: colors.slice(0, labels.length),
              borderWidth: 2,
              borderColor: '#1f2937',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: { color: '#9ca3af', font: { size: 11 }, padding: 12 },
            },
          },
        },
      });
    }

    // Bar chart — Donations
    if (this.donationsChartRef) {
      new Chart(this.donationsChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [
            {
              label: 'Donations ($)',
              data: donationsByMonth,
              backgroundColor: 'rgba(245,158,11,0.6)',
              borderColor: '#f59e0b',
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: this.lineBarOptions('#f59e0b'),
      });
    }
  }

  private lineBarOptions(color: string) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#9ca3af', font: { size: 11 } } },
        tooltip: {
          backgroundColor: '#1f2937',
          titleColor: '#f9fafb',
          bodyColor: '#9ca3af',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#6b7280', font: { size: 11 } },
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { color: '#6b7280', font: { size: 11 } },
          beginAtZero: true,
        },
      },
    };
  }

  /** Fallback mock data so charts still render without backend */
  private mockStats() {
    return {
      totalAnimals: 47,
      availableAnimals: 23,
      ongoingAdoptions: 12,
      totalAdoptions: 58,
      todayAppointments: 4,
      totalAppointments: 134,
      activeReports: 8,
      totalReports: 31,
      adoptionsByMonth: [3, 5, 4, 7, 6, 8, 10, 9, 7, 12, 8, 11],
      donationsByMonth: [250, 180, 320, 410, 290, 500, 380, 460, 340, 520, 410, 600],
      animalsBySpecies: { Dogs: 18, Cats: 15, Birds: 6, Rabbits: 4, Reptiles: 2, Other: 2 },
      todayAppointmentsList: [],
    };
  }
}
